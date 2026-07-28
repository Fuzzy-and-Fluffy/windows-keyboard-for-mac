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
  shortcuts instead of copying one Mac's key codes; open Spotlight by
  application action.
- Keep install, add-keyboard, and uninstall transactional: validate, back up,
  write atomically, activate, read back live state, and restore on failure.
- For implementation changes, run `npm run build` and `npm test`. Before
  claiming a local install is healthy, run
  `./doctor.command --non-interactive`. Keep physical shortcut smoke tests,
  signing/notarization, and Apple permission approval as separate outcome
  gates.
