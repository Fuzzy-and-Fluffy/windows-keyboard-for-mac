# Windows Keyboard for Mac Agent Guidance

- Read `README.md`, `docs/design.md`, and `docs/shortcut-matrix.md` before
  changing mapping behavior.
- Keep Karabiner-Elements as the only modifier-translation layer. Treat macOS
  Modifier Keys and `hidutil UserKeyMapping` conflicts as a fail-closed
  condition.
- Enroll only user-confirmed physical Windows keyboards. Keep the device
  registry additive and never replace it with a blanket `is_keyboard: true`
  rule that could affect Apple, built-in, virtual, or Mac-mode keyboards.
- Preserve physical `Win+Space` as the host Mac's input-source action. Keep
  the public profile free of app-specific shortcuts; physical `Ctrl+Space`
  follows the core `Ctrl` to `Command` translation. Discover per-Mac system
  shortcuts instead of copying one Mac's key codes; open Spotlight with its
  native `apple_vendor_keyboard_key_code` event.
- Keep install, add-keyboard, and uninstall transactional: validate, back up,
  write atomically, activate, read back live state, and restore on failure.
- For implementation changes, run `npm run build` and `npm test`. Before
  claiming a local install is healthy, run
  `./doctor.command --non-interactive`. Keep physical shortcut smoke tests,
  signing/notarization, and Apple permission approval as separate outcome
  gates.

## Release signing (owner rule, 2026-10-06)

Sign every release of this project with the company identity only, selected by SHA-1 from the keychain, never by name: `Apple Distribution: EZZY BOOKS PTY LTD` for iPhone (App Store / TestFlight) builds and `Developer ID Application: EZZY BOOKS PTY LTD` for Mac builds distributed outside the App Store. Personal-name identities are retired and must never sign anything. Do not export with automatic/cloud signing (`-allowProvisioningUpdates` with `signingStyle` automatic): it can pick the retired personal certificate from the shared team. Before uploading or installing, run `~/.claude/scripts/assert-signing-identity.sh verify-ios <ipa>` (iPhone) or `verify <app>` (Mac); a non-zero exit stops the release. iPhone uploads stop until the company Apple Distribution certificate exists.
