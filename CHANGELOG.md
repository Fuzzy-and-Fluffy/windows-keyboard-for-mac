# Changelog

## 0.4.0 — 2026-08-02

- Made Home and End focus-aware: text controls retain Windows-style line and
  document navigation, while non-text views receive native Home/End events.
- Prevented Home/End from flashing or invoking application menu commands when
  no text editor has focus.
- Added a clear choice between the all-keyboards community catalog edition and
  the device-scoped GitHub edition.
- Documented the configuration's acceptance into the official
  Karabiner-Elements community rules catalog.

## 0.3.1 — 2026-07-31

- Slowed the visual walkthrough from 16 seconds to 49 seconds, keeping each
  scene visible for 7–9 seconds.
- Added an interactive demo with previous, next, play/pause, slide-picker, and
  keyboard controls.
- Paused automatic rotation when a visitor starts interacting with the demo
  and disabled autoplay when reduced motion is preferred.
- Added descriptive alternative text and screen-reader announcements for
  manual slide changes.

## 0.3.0 — 2026-07-31

- Changed `Alt+F4` from quitting the active macOS app to closing the active
  top-level window, matching Windows more closely.
- Added app-specific close-window handling: browsers close the current window,
  Finder closes its front window regardless of tab count, and ordinary apps
  receive `Command+W`.
- Kept `Ctrl+F4` as the separate close-document or close-tab shortcut.
- Added device-scoped F1–F12 normalization so selected Windows keyboards emit
  standard function keys when macOS media-key mode is enabled.
- Kept the public profile free of app-specific `Ctrl+Space` preferences.
- Added a visual shortcut walkthrough and a clearer first-run README.

## 0.2.1 — 2026-07-28

- Prevented Finder file actions from hijacking filename, search-field, and
  other text editing.
- Backspace now deletes the previous character while renaming and navigates
  back only when Finder has a focused non-text control.
- Enter, Delete, Shift+Delete, Ctrl+X, Ctrl+V, and F2 use the same text-field
  safety boundary.
- Raised the minimum Karabiner-Elements version to 16 so the installer can rely
  on focused UI element detection.

## 0.2.0 — 2026-07-27

- Prepared the project for a generic public GitHub distribution.
- Removed the app-specific `Ctrl+Space` exception so it follows the normal
  physical `Ctrl` to macOS `Command` translation.
- Added a reverse modifier-key guide showing that Windows `Alt` is the
  equivalent of Mac `Option`.
- Replaced locally observed keyboard identifiers with synthetic test data.
- Added public-content auditing, privacy documentation, GitHub Actions CI, and
  SHA-256 release checksums.
- Kept device enrollment explicit and additive so Apple, built-in, virtual,
  and unconfirmed keyboards remain untouched.
