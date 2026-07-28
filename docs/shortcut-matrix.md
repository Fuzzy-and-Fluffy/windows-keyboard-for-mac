# Shortcut matrix

“Physical” means the label printed on the selected Windows keyboard. The MacBook built-in keyboard keeps normal macOS behavior.

## Core modifier translation

| Physical Windows input | macOS receives | Apple symbol |
|---|---|---|
| Ctrl | Command | `⌘` |
| Windows key | Control | `⌃` |
| Alt | Option | `⌥` |
| Shift | Shift | `⇧` |

### Reading shortcuts shown by a Mac app

| If the Mac app shows | Press on the Windows keyboard |
|---|---|
| `⌘ Command` | `Ctrl` |
| `⌃ Control` | `Windows` key |
| `⌥ Option` | `Alt` |
| `⇧ Shift` | `Shift` |

Examples:

- `⌘C` → physical `Ctrl+C`
- `⌥⇧F` → physical `Alt+Shift+F`
- `⌃K` → physical `Win+K`, unless that combination is reserved below

Explicit Windows Keyboard for Mac rules take priority over the general modifier
translation. If a third-party app shortcut overlaps a listed rule, choose a
different shortcut in that app.

## Automatic Ctrl shortcuts

Because physical Ctrl becomes Command before complex rules are evaluated, these work without one rule per letter:

| Physical shortcut | Effective macOS shortcut | Behavior |
|---|---|---|
| Ctrl+C / V / X | Command+C / V / X | Copy / Paste / Cut |
| Ctrl+A / F / P | Command+A / F / P | Select All / Find / Print |
| Ctrl+S / O / N | Command+S / O / N | Save / Open / New |
| Ctrl+Z | Command+Z | Undo |
| Ctrl+W / T / R / L | Command equivalents | Common document/browser behavior |
| Ctrl+Plus / Minus / 0 | Command equivalents | Zoom |
| Ctrl+Shift+3 | Command+Shift+3 | Full-screen screenshot |
| Ctrl+Shift+4 | Command+Shift+4 | Selected-area screenshot |
| Ctrl+Shift+5 | Command+Shift+5 | Screenshot and recording controls |
| Ctrl+Space | Command+Space | Normal translated shortcut; not reserved for a particular app |

The final screenshot action still follows the macOS Screenshot shortcut settings. If those shortcuts were customized, the customized macOS action runs.

## Explicit compatibility rules

| Physical shortcut | macOS action |
|---|---|
| Ctrl+Y | Redo (`Command+Shift+Z`) |
| Ctrl+Tab / Ctrl+Shift+Tab | Next / previous tab |
| Ctrl+F4 | Close active document or tab |
| Ctrl+Arrow | Move by word or paragraph |
| Ctrl+Shift+Arrow | Select by word or paragraph |
| Ctrl+Backspace / Delete | Delete previous / next word |
| Home / End | Start / end of line |
| Ctrl+Home / End | Start / end of document |
| Alt+Tab / Alt+Shift+Tab | Switch apps forward / backward |
| Alt+F4 | Quit active app |
| Alt+Left / Right | Navigate back / forward |
| Ctrl+Shift+Esc | Force Quit window |
| Ctrl+Alt+Delete | Lock screen |
| Print Screen | Full-screen screenshot |
| Alt+Print Screen | Window screenshot |

## Windows-key shortcuts

| Physical shortcut | macOS action |
|---|---|
| Win+Space | Switch input source |
| Tap Windows key | Spotlight |
| Win+R / Win+S | Spotlight |
| Win+E | Finder |
| Win+I | System Settings |
| Win+L | Lock screen |
| Win+Tab | Mission Control |
| Win+D | Show Desktop |
| Win+M | Minimize the active app’s windows |
| Win+. | Emoji & Symbols |
| Win+Left / Right | Tile window left / right |
| Win+Up | Fill desktop |
| Win+Down | Return to previous window size |
| Win+Shift+S | Selected-area screenshot |

Window tiling uses Apple’s native macOS 15+ shortcuts and needs no Rectangle or other window manager.

`Win+Space` is bound at installation time to the Input Sources shortcut enabled
on that particular Mac. Spotlight actions open the system Spotlight app
directly and therefore do not depend on that Mac's Spotlight shortcut.

## Finder

| Physical shortcut | Finder behavior |
|---|---|
| Ctrl+X, then Ctrl+V | Move selected files |
| Ctrl+C / Ctrl+V | Copy / paste |
| Enter | Open selected item |
| F2 | Rename selected item |
| Delete | Move to Trash |
| Shift+Delete | Request immediate deletion |
| Backspace | Navigate back |

## Terminals

Supported terminal bundle IDs include Terminal, iTerm2, WezTerm, Warp, Alacritty, Kitty, Hyper, and Ghostty.

| Physical shortcut | Terminal behavior |
|---|---|
| Ctrl+A…Z | Raw Control sequence |
| Ctrl+Shift+C / V | Copy / paste |
| Ctrl+Shift+N / T / W | New window / new tab / close |

This preserves `Ctrl+C` interrupt behavior instead of turning it into Copy.

## Remote desktop and virtual machines

For listed Microsoft Windows App/Remote Desktop, Jump Desktop, Citrix, Parallels, VMware Fusion, and VirtualBox VM bundle IDs, Windows Keyboard for Mac reverses its local modifier swap before the client receives the keys:

| Physical key | Remote receives through the macOS client |
|---|---|
| Ctrl | Control |
| Windows key | Command (normally translated by the client to Windows/Super) |
| Alt | Option/Alt |

Local Windows-key, Alt, editing, screenshot, and security overrides are excluded in these apps.
