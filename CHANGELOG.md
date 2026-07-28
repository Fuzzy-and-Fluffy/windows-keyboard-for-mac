# Changelog

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
