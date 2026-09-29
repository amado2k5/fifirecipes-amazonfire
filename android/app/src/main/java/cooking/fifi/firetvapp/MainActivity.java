package cooking.fifi.firetvapp;

import android.app.Activity;
import android.graphics.Color;
import android.os.Bundle;
import android.view.Gravity;
import android.view.KeyEvent;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.TextView;

/**
 * Full-screen WebView wrapper around the hosted build at
 * https://firetvapp.fifi.cooking/. The web app handles D-pad/Enter itself;
 * this shell translates remote keys that never reach JS (BACK, media
 * play/pause, MENU), pauses media with the activity lifecycle, and shows a
 * native retry screen when the hosted shell itself cannot load (a dead
 * browser error page would fail Amazon's visual-defect review).
 */
public class MainActivity extends Activity {

    private static final String APP_URL = "https://firetvapp.fifi.cooking/";

    private WebView web;
    private View errorView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        web = new WebView(this);
        WebSettings ws = web.getSettings();
        ws.setJavaScriptEnabled(true);
        ws.setDomStorageEnabled(true);               // language persistence (localStorage)
        ws.setMediaPlaybackRequiresUserGesture(false); // autoplay the YouTube embed
        ws.setUseWideViewPort(true);
        ws.setLoadWithOverviewMode(true);
        web.setWebViewClient(new ShellClient());
        web.setWebChromeClient(new WebChromeClient());
        web.addJavascriptInterface(new Bridge(), "FifiBridge");

        errorView = buildErrorView();
        errorView.setVisibility(View.GONE);

        FrameLayout root = new FrameLayout(this);
        root.addView(web, new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        root.addView(errorView, new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        setContentView(root);

        if (savedInstanceState != null) {
            web.restoreState(savedInstanceState);
        } else {
            web.loadUrl(APP_URL);
        }
    }

    /** Warm, branded fallback shown when the hosted shell can't be reached. */
    private View buildErrorView() {
        LinearLayout box = new LinearLayout(this);
        box.setOrientation(LinearLayout.VERTICAL);
        box.setGravity(Gravity.CENTER);
        box.setBackgroundColor(Color.rgb(0xfd, 0xf4, 0xe3));

        TextView title = new TextView(this);
        title.setText("FiFi Recipes");
        title.setTextSize(42);
        title.setTextColor(Color.rgb(0x43, 0x31, 0x1f));
        title.setGravity(Gravity.CENTER);
        box.addView(title);

        TextView body = new TextView(this);
        body.setText("We couldn't reach the kitchen.\nCheck the internet connection, then press Retry.");
        body.setTextSize(26);
        body.setTextColor(Color.rgb(0x7d, 0x6a, 0x52));
        body.setGravity(Gravity.CENTER);
        body.setPadding(0, 24, 0, 48);
        box.addView(body);

        Button retry = new Button(this);
        retry.setText("Retry");
        retry.setTextSize(24);
        retry.setOnClickListener(v -> {
            errorView.setVisibility(View.GONE);
            web.setVisibility(View.VISIBLE);
            web.loadUrl(APP_URL);
        });
        box.addView(retry);
        return box;
    }

    private void showError() {
        runOnUiThread(() -> {
            web.setVisibility(View.GONE);
            errorView.setVisibility(View.VISIBLE);
            errorView.requestFocus();
        });
    }

    /** Errors on the main frame swap in the native retry view; subresource
     *  failures are left to the web app's own in-page error screens. */
    class ShellClient extends WebViewClient {
        @Override
        public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
            if (request.isForMainFrame()) showError();
        }
    }

    /** The web app calls FifiBridge.exitApp() when Back is pressed at its root screen. */
    class Bridge {
        @JavascriptInterface
        public void exitApp() {
            runOnUiThread(MainActivity.this::finish);
        }
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        // KEYCODE_BACK never reaches page JS on a raw WebView — translate to Escape.
        if (keyCode == KeyEvent.KEYCODE_BACK) {
            injectKey("Escape", 27);
            return true;
        }
        // Some Fire OS builds swallow media keys instead of forwarding them.
        if (keyCode == KeyEvent.KEYCODE_MEDIA_PLAY_PAUSE
                || keyCode == KeyEvent.KEYCODE_MEDIA_PLAY
                || keyCode == KeyEvent.KEYCODE_MEDIA_PAUSE) {
            injectKey("MediaPlayPause", 85);
            return true;
        }
        // Fire TV remote MENU key — the app maps it to the Settings tab.
        if (keyCode == KeyEvent.KEYCODE_MENU) {
            web.evaluateJavascript(
                "window.dispatchEvent(new CustomEvent('fifi:menu'))", null);
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }

    private void injectKey(String key, int code) {
        web.evaluateJavascript(
            "window.dispatchEvent(new KeyboardEvent('keydown',"
                + "{key:'" + key + "',keyCode:" + code + ",which:" + code + ",bubbles:true}))",
            null);
    }

    /** Amazon criterion 2.19/3.13: media must pause on exit/standby. Pause both
     *  the WebView's renderers and any playing YouTube iframe explicitly. */
    private void pauseMedia() {
        web.evaluateJavascript(
            "try{var f=document.querySelector('iframe');"
                + "if(f)f.contentWindow.postMessage("
                + "'{\"event\":\"command\",\"func\":\"pauseVideo\",\"args\":\"\"}','*')}catch(e){}",
            null);
    }

    @Override
    protected void onPause() {
        pauseMedia();
        web.onPause();
        super.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        web.onResume();
    }

    @Override
    public void onTrimMemory(int level) {
        super.onTrimMemory(level);
        // Let the OS reclaim WebView caches under pressure (1 GB sticks).
        if (web != null && level >= TRIM_MEMORY_RUNNING_LOW) web.freeMemory();
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        web.saveState(outState);
    }

    @Override
    protected void onDestroy() {
        if (web != null) {
            web.removeJavascriptInterface("FifiBridge");
            web.destroy();
        }
        super.onDestroy();
    }
}
