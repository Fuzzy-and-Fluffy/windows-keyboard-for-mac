# Signing policy

## Current release status

The GitHub preview is distributed as an unsigned `.command` bundle. Users must
Control-click `install.command` and choose **Open**. They should never be asked
to disable Gatekeeper.

## Public identity

The project does not use an individual Developer ID certificate because its
verified legal identity would become part of the public signature.

Apple does not permit an individual membership to substitute an alias,
nickname, or fictional company name for the verified legal identity. A public
brand name can be used for Developer ID signing only when an eligible legal
entity is enrolled as an organization. Apple verifies that organization using
its legal entity name and D-U-N-S Number; trade names and fictional businesses
are not accepted.

Until an organization signing identity is available:

- GitHub source and release notes use the Windows Keyboard for Mac project name;
- Git commits use a project pseudonym and a GitHub `noreply` address;
- release archives remain unsigned and include a SHA-256 checksum;
- no personal Developer ID certificate is used.

## Future signed application

The planned signed distribution is a native `Windows Keyboard for Mac.app` that:

1. detects the official Karabiner-Elements installation;
2. guides the user through required Apple permissions;
3. manages install, diagnostics, keyboard enrollment, and uninstall;
4. uses Hardened Runtime and a secure timestamp;
5. is notarized with `notarytool`;
6. has the accepted notarization ticket stapled and validated before release.

Karabiner-Elements will retain its original upstream signature. Windows Keyboard for Mac
will not rebuild or re-sign that dependency.
