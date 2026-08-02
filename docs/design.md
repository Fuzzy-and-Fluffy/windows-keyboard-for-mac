# Design notes

## Single owner for modifier translation

Windows Keyboard for Mac requires macOS System Settings > Keyboard > Keyboard Shortcuts > Modifier Keys to remain at the defaults. It also rejects an active `hidutil UserKeyMapping`.

Only Karabiner owns the modifier translation. This prevents the old failure mode in which:

1. macOS swaps Control and Command;
2. Karabiner assumes the original hardware events;
3. the same shortcut is translated twice or differently by application;
4. the physical Windows key unexpectedly becomes the screenshot modifier.

## Event pipeline

Karabiner documents this order:

1. hardware event;
2. Simple Modifications;
3. Complex Modifications;
4. Function Keys modifications;
5. macOS Modifier Keys;
6. application.

Windows Keyboard for Mac uses that order deliberately:

1. a device-level Simple Modification changes physical Ctrl to Command and physical Windows to Control;
2. common Command-based macOS shortcuts therefore work automatically;
3. device-scoped Complex Modifications repair semantic differences;
4. the macOS Modifier Keys stage is kept at identity.

## Device isolation

The installer gets connected devices from `karabiner_cli --list-connected-devices`. It ignores Apple and virtual keyboards, then stores the selected `vendor_id`, `product_id`, and `is_keyboard` tuple in:

- the profile’s per-device Simple Modifications; and
- every Complex Modification’s `device_if` condition.

The product and vendor pair intentionally matches another keyboard of the same model. `location_id` is not used because it changes when a USB receiver moves to another port.

The registry is additive: installing for a newly connected keyboard merges its identifier with all previously enrolled keyboards and regenerates every `device_if` condition. Disconnected registered keyboards remain enrolled.

This per-device opt-in is intentional. Matching every device with only
`is_keyboard: true` would also convert a MacBook built-in keyboard, Apple
keyboard, virtual keyboard, or a dual-mode keyboard currently set to Mac mode.

## Portable system actions

Device portability is not enough if a profile assumes one Mac's customized
system shortcuts. During every install or keyboard enrollment, the installer:

1. reads the enabled macOS Input Sources symbolic shortcut (ID 60 or 61);
2. converts its virtual key and modifier flags into a Karabiner output event;
3. injects that event behind physical `Win+Space`; and
4. verifies the injected event during live configuration readback.

Tap-Windows, `Win+R`, and `Win+S` use Karabiner's
`software_function.open_application` with `com.apple.Spotlight`, so they do not
depend on a Spotlight keyboard shortcut.

The distributable profile intentionally contains no application-specific
shortcut exceptions. Physical `Ctrl+Space` therefore follows the core
modifier translation and reaches macOS as `Command+Space`. Users choose their
own third-party app shortcuts after installation and should avoid combinations
reserved by the shortcut matrix.

## Standard function keys on selected Windows keyboards

macOS can treat the F-key row as brightness, media, and other special keys.
When that mode is enabled, Windows Keyboard for Mac emits `Fn+F1` through
`Fn+F12` from the selected Windows keyboard so applications receive standard
function keys. The normalization rule is deliberately last: semantic rules
such as `Alt+F4`, `Ctrl+F4`, Finder `F2`, and browser `F5` are evaluated first.

The built-in keyboard and unregistered keyboards are not affected. If a
keyboard's own firmware or Fn-lock sends consumer events instead of F-key
events, the user must first switch that keyboard to its standard F-key mode;
consumer usages are model-specific and are not guessed globally.

## Windows close-window semantics

Windows `Alt+F4` closes the active top-level window, while `Ctrl+F4` closes the
active document or tab. A single macOS shortcut cannot preserve that distinction
in every app: supported browsers use `Command+W` for the active tab and
`Command+Shift+W` for the current window, while ordinary macOS apps use
`Command+W` for the front window. Finder is state-dependent: with multiple tabs
it exposes `Command+W` for Close Tab and `Command+Shift+W` for Close Window, but
with one tab its Close Window command is `Command+W`.

The browser and tabbed-window compatibility rule therefore handles `Alt+F4`
first for supported browsers and emits `Command+Shift+W`. Finder uses a local
AppleScript application action that closes its front window directly, so the
result does not depend on the number of tabs. The general Alt rule explicitly
excludes browsers and Finder and emits `Command+W`. None of these paths emits
`Command+Q`, because closing a Windows window does not mean quitting every
window owned by the macOS app.

The first Finder `Alt+F4` may cause macOS to request Automation permission for
Karabiner-Elements to control Finder. The user must approve that permission;
the installer cannot grant it.

## Finder text-editing boundary

Finder item actions are enabled only when Karabiner-Elements can identify a
focused non-text accessibility role. In filename, search, and other Finder text
fields, the rules fail closed and the normal editing keys pass through.

This keeps Windows-style item actions such as Enter, Delete, Shift+Delete, and
Backspace from overriding text editing. The focused-role condition requires
Karabiner-Elements 16 or newer and its macOS Accessibility permission.

## Focus-aware Home and End

Windows gives Home and End two related meanings: they move to the start or end
of a line while editing text, and they navigate to the top or bottom of page
content when no text control has focus. A global `Home → Command+Left` mapping
only implements the first meaning and can accidentally trigger an app menu
item when focus leaves the editor.

The Home, End, Shift+Home/End, and Ctrl+Home/End translations therefore run
only when Karabiner reports a focused Accessibility role beginning with
`AXText`. Outside a text control, the physical Home or End event passes through
unchanged so browsers, web views, terminals, and other apps can apply their
native page-level behavior. If the focused role is missing, the rules fail
closed and also pass the original event through.

## Transaction model

Install:

1. validate Karabiner/macOS versions and connected devices;
2. reject conflicting system-level mappings;
3. validate the generated profile in memory;
4. back up `karabiner.json`;
5. atomically write the new dedicated profile;
6. select it with `karabiner_cli`;
7. read the live profile and configuration back;
8. write install state only after successful verification.

If steps 6 or 7 fail, the previous file and profile are restored automatically.

Uninstall follows the corresponding backup, remove, select, readback, and automatic-restore sequence.

## Why an import URL is insufficient

A `karabiner://` Complex Modifications import is useful for static rules, but it cannot complete this workflow:

- select a physical keyboard;
- create per-device Simple Modifications;
- inject device identifiers into every rule;
- detect macOS Modifier Keys and `hidutil` conflicts;
- preserve the previous active profile;
- verify the live result;
- provide transactional rollback.

That is why the MVP uses a small built-in JXA installer around Karabiner’s official CLI. A signed Swift app is the intended production replacement for the JXA user interface.
