# FiFi Recipes — Fire TV App

A 10-foot, remote-first TV web app for the FiFi Cooking recipe archive
(2,380 recipes). Built with Vite + React + TypeScript + Tailwind CSS, with
D-pad spatial navigation powered by
`@noriginmedia/norigin-spatial-navigation`.

All data comes from the static JSON API at `https://fifi.cooking/data/`
(contract: `docs/tv-api.md` in the `fifirecipes` repo). The app fetches
`tv/manifest.json` on boot, pins `manifest.version`, and appends
`?v=<version>` to every subsequent request. Network is required — a
full-screen localized error with a Retry button is shown on failure.

## Development

```bash
npm install
npm run dev      # http://localhost:3000 — open at 1920×1080
```

Laptop arrow keys are the remote D-pad:

| Key                | Action                                  |
| ------------------ | --------------------------------------- |
| Arrow keys         | Move focus (D-pad)                      |
| Enter              | Select                                  |
| Backspace / Escape | Back                                    |
| Space, key 179, Android `MEDIA_PLAY_PAUSE` | Play/pause in video player |

Android TV keycodes (`KEYCODE_DPAD_*` 19–22, `KEYCODE_ENTER` 66,
`KEYCODE_BACK` 4, `KEYCODE_MEDIA_PLAY_PAUSE` 85) are mapped in
`src/remote.ts`, so the same keys work when packaged for Fire OS.

## Layout & UX

- Fixed 1920×1080 stage, letterboxed + scaled to the window.
- 5% overscan-safe margins (`tv-safe`), ≥28px body text, tomato-orange
  focus ring (scale + warm lift) on every interactive element.
- Light "fresh market" theme matching fifi.cooking: warm cream canvas,
  leaf-green/tomato/sun produce accents, the site font stack (Plus Jakarta
  Sans, Tajawal, Vazirmatn, Noto Nastaliq Urdu) and the brand emblem
  (`public/logo.png`) throughout.
- Full RTL mirroring for `ar`, `he`, `ur`, `fa`, `ps` (driven by the
  manifest's per-language `dir` field; `ku` is LTR).
- Screens: Splash → Language picker (first run, persisted) → Home (split
  hero + feed rails) → Chapters grid → Chapter browse grid → Search
  (D-pad keyboard) → Recipe detail (notebook card, numbered steps) →
  Kids (rainbow header, group filters) → Kids "Get ready" (tickable
  ingredients, safety row) → Kids steps (one big card, progress dots,
  grown-up/timer badges) → celebration → Settings.
- Kids mode mirrors the website's Cooking with Kids: polka-dot canvas,
  Baloo 2/Baloo Bhaijaan 2/Heebo faces, crayon art library, pop/wiggle
  motion, `prefers-reduced-motion` respected.
- Memory budget for 1GB Fire TV Sticks: rails render a ~25-card window,
  chapter grids render full content only within ±45 cards of focus, images
  use `loading="lazy"` + `decoding="async"` and never exceed screen size.
- Videos play in a full-screen YouTube IFrame overlay
  (`youtube.com/embed/<id>?autoplay=1&enablejsapi=1`) with remote
  play/pause; the "Open in YouTube" button is hidden inside the APK
  wrapper where `window.open` is a dead end.

## Build

```bash
npm run build    # self-contained dist/ (relative asset paths, base './')
npm run package  # dist.zip — for Web App Tester sideloading (see below)
```

Bundle budget: initial JS ≈ 125KB gzipped, CSS ≈ 6KB gzipped.

## Packaging targets

### 1. Fire OS — Android WebView wrapper (APK)

> Note: Amazon **discontinued new web-app (zip) submissions on Oct 31,
> 2024** — new submissions must be Android packages. `dist.zip` is still
> produced for Web App Tester sideloading, but the store wants the APK.

The `android/` directory contains a minimal native wrapper: a full-screen
WebView that loads `https://firetvapp.fifi.cooking/` (hosted mode — store
updates ship instantly via the Pages deploy). DPAD/Enter reach JS natively;
BACK and media play/pause are injected as synthetic key events; MENU
dispatches a `fifi:menu` event the app maps to Settings. At the app root
the web app calls `FifiBridge.exitApp()` to finish the Activity.

Lifecycle/compliance details in `MainActivity.java`: `onPause()` pauses
WebView renderers and any playing YouTube iframe (Amazon test criterion
2.19/3.13 — media must stop on exit/standby), `onResume()` resumes,
`onTrimMemory()` frees WebView caches on low-RAM sticks, WebView state is
saved/restored across process death, and a main-frame load failure swaps
in a native branded retry view so a dead browser error page never shows
(a visual-defect rejection risk).

Build it:

```bash
# prerequisites (one time):
#   brew install openjdk@17 gradle --cask android-commandlinetools
#   sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"
cd android
ANDROID_HOME=/opt/homebrew/share/android-commandlinetools \
  ./gradlew assembleRelease
# signed APK → app/build/outputs/apk/release/app-release.apk
```

Signing: `android/keystore.properties` + `fifi-release.keystore` are
gitignored — Amazon re-signs every upload with its own per-account
certificate, so the local key is throwaway. Recreate with `keytool` if lost.

### 2. Vega OS

1. Wrap the same build in a Vega WebView app (`.vpkg`) using the
   **Vega Developer Tools / `kepler` CLI**.
2. Register the device under your developer account and install over USB.

### 3. Hosted mode (live now)

`dist/` deploys to GitHub Pages on every merge to `main` and serves
`https://firetvapp.fifi.cooking/` — the same URL the APK loads.

## Testing on a Fire TV without publishing

- **Hosted**: install **Amazon Web App Tester** on the TV → Hosted Apps →
  enter `https://firetvapp.fifi.cooking/`.
- **Packaged zip**: `adb push dist.zip /sdcard/amazonwebapps/` → Web App
  Tester → Packaged Apps → Sync List → Test.
- **Real APK**: enable ADB debugging on the TV, then
  `adb connect <tv-ip>:5555 && adb install fifi-recipes.apk`.
- **DevTools**: press Menu (≡) inside Web App Tester → Enable DevTools →
  `chrome://inspect` on your Mac.
- **Live App Testing** in the developer console distributes the APK to
  invited testers before public release.
