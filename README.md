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
npm run package  # dist.zip — ready for Appstore submission
```

Bundle budget: initial JS ≈ 125KB gzipped, CSS ≈ 6KB gzipped.

## Packaging targets

### 1. Fire OS — packaged HTML5 app

1. `npm run build && npm run package` → `dist.zip`.
2. Submit `dist.zip` in the Amazon Appstore console as a **packaged web
   app**; launch path is `/index.html`.
3. On-device test: install the **Amazon Web App Tester** on a Fire TV,
   feed it the zip (sideload via `adb`) or install the Appstore build.

### 2. Vega OS

1. Wrap the same `dist/` build in a Vega WebView app (`.vpkg`) using the
   **Vega Developer Tools / `kepler` CLI**.
2. Register the device under your developer account and install over USB.

### 3. Hosted mode (optional)

1. Deploy `dist/` to this repo's `gh-pages` branch.
2. Submit the GitHub Pages URL as a **Hosted Web App** — enables instant
   UI updates without Appstore review. `base: './'` keeps every asset
   path relative, so the same build works packaged or hosted.
