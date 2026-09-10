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

The published rules intend a tap of either Windows key, `Win+R`, and `Win+S`
to open Spotlight. A tap must be released within 250 ms without pressing
another key. These shortcuts are excluded in supported remote desktop and VM
applications.

All four paths use Karabiner's
[`software_function.open_application`](https://karabiner-elements.pqrs.org/docs/json/complex-modifications-manipulator-definition/to/software_function/open_application/)
with `com.apple.Spotlight`. Reports of no visible Spotlight on macOS Tahoe are
being investigated in [issue #7](https://github.com/Fuzzy-and-Fluffy/windows-keyboard-for-mac/issues/7);
a Tahoe-specific fix has not been confirmed.

To help distinguish a tap-timing problem, another remapping rule, and an
application-opening problem, include these results in your report:

- Exact macOS and Karabiner-Elements versions, keyboard model and Windows/Mac
  mode, and whether you use the community rule or the ZIP installer.
- In Finder, test a quick Windows-key tap, `Win+R`, `Win+S`, and `Win+E`
  separately. Note whether Spotlight or Finder visibly opens.
- Run `open -b com.apple.Spotlight` in Terminal. Report whether the search UI
  appears, and any error message. A successful exit code alone does not show
  that Spotlight became visible.
- Note any existing Control/Command swaps in Karabiner Simple Modifications,
  macOS Modifier Keys, or another remapping app.

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
