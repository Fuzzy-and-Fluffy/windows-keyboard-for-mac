# Troubleshooting

## Community import

Karabiner's **Complex Modifications** importer expects a JSON object with
top-level `title` and `rules` fields. The repository's
`dist/windows-keyboard-for-mac-profile.json` is a complete profile template for
`install.command`, with rules under `complex_modifications.rules`. It also
contains placeholder device identifiers that the installer replaces after
keyboard selection. Importing that file directly does not install either
edition correctly.

For the community edition:

1. Open Karabiner-Elements → **Complex Modifications** → **Add predefined rule**
   → **Import more rules from the internet**.
2. Search for **Windows Keyboard for Mac (community edition)**.
3. Import it and enable **Windows Keyboard for Mac: complete Windows-style
   shortcuts (all keyboards)**.

Alternatively, paste this complete URL into your browser's address bar:

```text
karabiner://karabiner/assets/complex_modifications/import?url=https://raw.githubusercontent.com/pqrs-org/KE-complex_modifications/main/public/json/windows_keyboard_for_mac.json
```

The [upstream community JSON](https://github.com/pqrs-org/KE-complex_modifications/blob/main/public/json/windows_keyboard_for_mac.json)
is the importable file. The community edition applies to **all keyboards**,
including built-in keyboards, and does not require a Control/Command Simple
Modifications swap. Enable it once and avoid stacking it with the device-scoped
edition or another modifier remapper.

For selected external keyboards, use the named ZIP asset from
[GitHub Releases](https://github.com/Fuzzy-and-Fluffy/windows-keyboard-for-mac/releases/latest)
and follow the [device-scoped quick start](./quick-start.md).

## Spotlight

A tap of either Windows key, `Win+R`, and `Win+S` intentionally open the same
Spotlight search interface. They correspond to the familiar Windows Start,
Run, and Search entry points; they do not select different search modes. A tap
must be released within 250 ms without pressing another key. These shortcuts
are excluded in supported remote desktop and VM applications.

The device-scoped edition uses the native
`apple_vendor_keyboard_key_code: "spotlight"` event from v0.4.2 onward.
Earlier versions launched `com.apple.Spotlight`, which could leave the search
UI hidden on macOS Tahoe. On macOS 26.2, a physical Windows keyboard
reproduced all three failures with Karabiner-Elements 16.1.0. The operator
confirmed that all three opened Spotlight after the mapping update; the
post-test environment reported Karabiner-Elements 16.3.0. The native event does
not require enabling or changing the Mac's Spotlight keyboard shortcut.

For the device-scoped edition, install the
[v0.4.2 preview](https://github.com/Fuzzy-and-Fluffy/windows-keyboard-for-mac/releases/tag/v0.4.2)
ZIP using the existing installer. For the community edition, see
[issue #7](https://github.com/Fuzzy-and-Fluffy/windows-keyboard-for-mac/issues/7)
for the community update and import link. Installing the device-scoped ZIP
does not update a previously imported community rule.

If the updated rules still do not open Spotlight, check that the rule is
enabled and that another remapper or Control/Command swap is not intercepting
the key. Include the macOS and Karabiner versions, edition, keyboard model,
and separate Finder results for a quick Windows-key tap, `Win+R`, `Win+S`, and
`Win+E` in a report. A successful `open -b com.apple.Spotlight` exit code alone
does not confirm that its search UI became visible.

Use Karabiner-EventViewer to inspect just the Windows-key press if requested.
Share the key name and down/up events rather than a full event log or live
`karabiner.json`.

## VS Code integrated terminal

The terminal application rules cover standalone terminals such as Terminal
and iTerm2. VS Code's editor and integrated terminal share an application
identifier. Adding all of VS Code to the terminal list would also change
editing shortcuts in the editor.

An optional workaround is to use VS Code's `terminalFocus` context. The example
below handles the Command events that this project's shortcut layer produces
from physical Ctrl. It uses VS Code's documented
[`sendSequence` command](https://code.visualstudio.com/docs/terminal/basics#_how-can-i-configure-cmd-to-map-to-ctrlc-like-macos-built-in-terminal)
and [conditional keybindings](https://code.visualstudio.com/docs/configure/keybindings#_when-clause-contexts).
The bindings were verified in VS Code 1.137.0 on macOS 26.2 with software
Command events: terminal interruption, copy/paste, raw Ctrl+V, and editor
copy/paste passed. These tests exercise VS Code after modifier translation;
physical-keyboard verification for the reported setup is still needed.

In VS Code, open **Preferences: Open Keyboard Shortcuts (JSON)** from the
Command Palette. Back up your existing entries, then append these four objects
inside the existing array, adding a comma between entries as needed. If the
file is empty, use the complete array below. Keep any existing settings.

The same configuration is included as
[`extras/vscode-terminal-keybindings.json`](../extras/vscode-terminal-keybindings.json)
in the repository and release ZIP. Use it with either the community or
device-scoped edition. It is a VS Code user keybindings file, not a Karabiner
Complex Modifications import.

```json
[
  {
    "key": "cmd+c",
    "command": "workbench.action.terminal.sendSequence",
    "when": "terminalFocus",
    "args": { "text": "\u0003" }
  },
  {
    "key": "cmd+shift+c",
    "command": "workbench.action.terminal.copySelection",
    "when": "terminalFocus"
  },
  {
    "key": "cmd+shift+v",
    "command": "workbench.action.terminal.paste",
    "when": "terminalFocus"
  },
  {
    "key": "cmd+v",
    "command": "workbench.action.terminal.sendSequence",
    "when": "terminalFocus",
    "args": { "text": "\u0016" }
  }
]
```

With the shortcut layer enabled, the intended results are:

| Physical shortcut | With terminal focus |
|---|---|
| Ctrl+C | Send ETX (`0x03`), normally Interrupt |
| Ctrl+Shift+C | Copy the terminal selection |
| Ctrl+Shift+V | Paste into the terminal |
| Ctrl+V | Send the shell's raw Ctrl+V (`0x16`), often quoted insert |

The Ctrl+V entry is optional: omit it if you want to retain ordinary paste on
Ctrl+V as well. The editor retains its existing bindings because `terminalFocus`
is false there. These VS Code settings apply to every keyboard that delivers
Command events to that app, including an Apple keyboard's Command key; they
cannot inherit the installer's device scoping.

To verify, run `sleep 30` in a disposable integrated terminal and press physical
Ctrl+C. The prompt should return immediately. Copy a harmless selected string
with Ctrl+Shift+C, then paste it at an empty prompt with Ctrl+Shift+V without
pressing Enter. Finally, check ordinary copy/paste in an unsaved editor tab.
Check Ctrl+V separately if you included its raw-control binding.

Remove only the added objects to undo this workaround. It is not installed
automatically and does not implement every raw Ctrl sequence from the
standalone-terminal rules. If it does not work, report your VS Code version,
edition of this project, and which key combination fails; existing VS Code
keybindings or other remappers may take precedence.
