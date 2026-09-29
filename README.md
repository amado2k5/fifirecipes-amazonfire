# FiFi Recipes — Fire TV App

A 10-foot, remote-first TV web app for the FiFi Cooking recipe archive
(1,073 recipes). Built with Vite + React + TypeScript + Tailwind CSS, with
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
- 5% overscan-safe margins (`tv-safe`), ≥28px body text, high-contrast
  focus ring (scale + glow).
- Full RTL mirroring for `ar`, `he`, `ur`, `fa`, `ps` (driven by the
  manifest's per-language `dir` field; `ku` is LTR).
- Screens: Splash → Language picker (first run, persisted) → Home (hero +
  feed rails) → Chapters grid → Chapter browse grid → Search (D-pad
  keyboard) → Recipe detail → Kids → Kids detail → Settings.
- Memory budget for 1GB Fire TV Sticks: rails render a ~25-card window,
  chapter grids render full content only within ±45 cards of focus, images
  use `loading="lazy"` + `decoding="async"` and never exceed screen size.
- Videos play in a full-screen YouTube IFrame overlay
  (`youtube.com/embed/<id>?autoplay=1`) with an "Open in YouTube" fallback.

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
BACK and media play/pause are injected as synthetic key events; at the app
root the web app calls `FifiBridge.exitApp()` to finish the Activity.

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
