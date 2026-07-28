# Changelog

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
