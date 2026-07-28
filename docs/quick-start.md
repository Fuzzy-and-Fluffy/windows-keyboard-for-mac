# Quick start

Windows Keyboard for Mac is currently an unsigned GitHub preview for technical users and
early testers. It requires the official Karabiner-Elements installation.

## 1. Install Karabiner-Elements

Download Karabiner-Elements from its
[official installation page](https://karabiner-elements.pqrs.org/docs/getting-started/installation/).
Open its installer and complete the prompts shown by Karabiner-Elements.

macOS requires the user to approve its background services, Accessibility
access, and Driver Extension. Windows Keyboard for Mac cannot grant those permissions on
the user's behalf.

## 2. Download the Windows Keyboard for Mac release

From the
[GitHub Releases page](https://github.com/Fuzzy-and-Fluffy/windows-keyboard-for-mac/releases),
download both:

- `Windows-Keyboard-for-Mac-vX.Y.Z.zip`
- `Windows-Keyboard-for-Mac-vX.Y.Z.zip.sha256`

Use the named release assets, not GitHub's automatically generated
“Source code” archives.

Place both files in the same folder and verify the download:

```zsh
shasum -a 256 -c Windows-Keyboard-for-Mac-vX.Y.Z.zip.sha256
```

The result must end in `OK`.

## 3. Install the keyboard profile

1. Extract the Windows Keyboard for Mac ZIP.
2. In Finder, Control-click `install.command`.
3. Choose **Open**.
4. If more than one eligible external keyboard is connected, select only the
   physical Windows keyboard or keyboards to convert.
5. Wait for the installer to confirm the live `Windows Keyboard for Mac` profile.

Do not run the script with `sudo`, and do not disable Gatekeeper.

## 4. Test the physical keyboard

Check at least:

- `Ctrl+C` and `Ctrl+V`
- `Ctrl+Z`
- `Alt+Tab`
- `Win+Space`
- `Ctrl+Shift+4`

Mac shortcut symbols translate as follows:

| Mac shortcut key | Physical Windows key |
|---|---|
| `⌘ Command` | `Ctrl` |
| `⌃ Control` | `Windows` key |
| `⌥ Option` | `Alt` |
| `⇧ Shift` | `Shift` |

## Diagnose, add a keyboard, or uninstall

- Run `doctor.command` to inspect the current installation.
- Run `add-keyboard.command` to enroll another confirmed Windows keyboard.
- Run `uninstall.command` to remove only the Windows Keyboard for Mac profile and return
  to the previously active Karabiner profile.

The MacBook built-in keyboard, Apple keyboards, virtual keyboards, and
unconfirmed external keyboards remain unchanged.
