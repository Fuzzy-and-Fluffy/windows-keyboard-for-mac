# GitHub release checklist

## One-time repository setup

1. Create a public GitHub repository with the MIT license already included in
   this project.
2. Push the source repository, not the contents of a live Karabiner
   configuration directory.
3. Enable GitHub Actions and require the `build-test-audit` check on the
   default branch.
4. Enable GitHub secret scanning and push protection when those repository
   features are available.
5. Add a short description and topics such as `macos`, `karabiner`,
   `windows-keyboard`, and `keyboard-shortcuts`.
6. Use a project pseudonym and a GitHub `noreply` address for commit metadata.
   Do not sign preview releases with an individual Developer ID identity.

## Every release

1. Update the version in `package.json`.
2. Update the shortcut matrix and user-facing notes when behavior changes.
3. Run:

   ```zsh
   npm run build
   npm test
   npm run audit
   npm run package
   ```

4. Inspect the generated ZIP:

   ```zsh
   unzip -l release/Windows-Keyboard-for-Mac-vX.Y.Z.zip
   ```

5. Confirm the package contains no live `karabiner.json`, rollback state,
   logs, macOS metadata, user paths, email addresses, or app-specific
   configuration.
6. Create a Git tag and GitHub Release for `vX.Y.Z`.
7. Attach both the ZIP and its `.sha256` file.
8. Install the release ZIP on a separate macOS user account or test Mac,
   approve Karabiner permissions manually, and complete the physical shortcut
   smoke tests.
9. Use `docs/releases/vX.Y.Z.md` as the release description and clearly label
   unsigned previews.

## Current distribution limitation

The `.command` bundle is not code-signed or notarized. GitHub users may see a
Gatekeeper warning and must explicitly choose to open it. A signed and
notarized Swift app or installer package is the next step for a polished
one-click experience.
