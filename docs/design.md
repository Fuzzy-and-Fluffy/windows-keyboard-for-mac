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
