# Contributing

Contributions are welcome, especially reproducible fixes for standard Windows
keyboards on current macOS and Karabiner-Elements releases.

Before submitting a change:

1. Keep Karabiner-Elements as the only modifier-translation layer.
2. Scope every mapping to explicitly enrolled physical keyboards. Do not use a
   blanket `is_keyboard: true` condition.
3. Do not commit a live `karabiner.json`, keyboard logs, transcripts, local
   paths, email addresses, or app-specific personal configuration.
4. Preserve physical `Win+Space` for the Mac's discovered input-source action
   and keep the public profile free of app-specific shortcut exceptions.
5. Run:

   ```zsh
   npm run build
   npm test
   npm run audit
   ```

When changing shortcut behavior, update `docs/shortcut-matrix.md` and include
the physical-keyboard smoke-test result in the pull request.
