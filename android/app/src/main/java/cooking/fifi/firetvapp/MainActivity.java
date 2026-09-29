package cooking.fifi.firetvapp;

import android.app.Activity;
import android.os.Bundle;
import android.view.KeyEvent;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

/**
 * Full-screen WebView wrapper around the hosted build at
 * https://firetvapp.fifi.cooking/. The web app handles D-pad/Enter itself;
 * this shell only translates remote keys that never reach JS (BACK, media
 * play/pause) and lets the app exit when Back is pressed at its root.
 */
public class MainActivity extends Activity {

    private WebView web;

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
        web.setWebViewClient(new WebViewClient());
        web.setWebChromeClient(new WebChromeClient());
        web.addJavascriptInterface(new Bridge(), "FifiBridge");
        web.loadUrl("https://firetvapp.fifi.cooking/");
        setContentView(web);
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
        return super.onKeyDown(keyCode, event);
    }

    private void injectKey(String key, int code) {
        web.evaluateJavascript(
            "window.dispatchEvent(new KeyboardEvent('keydown',"
                + "{key:'" + key + "',keyCode:" + code + ",which:" + code + ",bubbles:true}))",
            null);
    }

    @Override
    protected void onDestroy() {
        if (web != null) web.destroy();
        super.onDestroy();
    }
}
