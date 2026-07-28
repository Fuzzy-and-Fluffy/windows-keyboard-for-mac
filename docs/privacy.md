# Privacy

Windows Keyboard for Mac is a local keyboard-configuration tool.

## What the release contains

The public release contains:

- a generic Karabiner profile template with no enrolled devices;
- local install, diagnostics, add-keyboard, and uninstall scripts;
- documentation and the MIT license.

It does not contain user names, email addresses, local home-directory paths,
transcripts, app-specific shortcut choices, or a copy of anyone's live
`karabiner.json`.

## What is stored locally

When a user explicitly selects a physical Windows keyboard, the installer
stores its USB/Bluetooth vendor and product identifiers in the dedicated
`Windows Keyboard for Mac` Karabiner profile. These identify a keyboard model, not a
person. The installer also keeps local backup and rollback state under the
user's Karabiner configuration directory.

## Network and analytics

The scripts do not send telemetry, analytics, keyboard events, or
configuration data over the network. Karabiner-Elements is a separate project
with its own release and privacy practices.

## Before publishing

Run:

```zsh
npm run build
npm test
npm run audit
npm run package
```

Only publish the generated ZIP and matching SHA-256 file. Never publish a live
Karabiner configuration, the local rollback state, logs, recordings, or backup
directories.
