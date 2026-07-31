#!/bin/zsh
set -euo pipefail

ROOT_DIR=${0:A:h:h}
VERSION=$(jq -r '.version' "$ROOT_DIR/package.json")
RELEASE_DIR="$ROOT_DIR/release"
ARCHIVE_PATH="$RELEASE_DIR/Windows-Keyboard-for-Mac-v${VERSION}.zip"
CHECKSUM_PATH="$ARCHIVE_PATH.sha256"
STAGING_DIR=$(mktemp -d /tmp/windows-keyboard-for-mac-package.XXXXXX)
trap 'rm -rf "$STAGING_DIR"' EXIT

node "$ROOT_DIR/src/generate-profile.mjs" >/dev/null
"$ROOT_DIR/scripts/audit-public.sh"

BUNDLE_DIR="$STAGING_DIR/Windows Keyboard for Mac"
mkdir -p \
  "$BUNDLE_DIR/installer" \
  "$BUNDLE_DIR/dist" \
  "$BUNDLE_DIR/docs/assets" \
  "$RELEASE_DIR"

cp \
  "$ROOT_DIR/install.command" \
  "$ROOT_DIR/add-keyboard.command" \
  "$ROOT_DIR/uninstall.command" \
  "$ROOT_DIR/doctor.command" \
  "$ROOT_DIR/CHANGELOG.md" \
  "$ROOT_DIR/README.md" \
  "$ROOT_DIR/LICENSE" \
  "$BUNDLE_DIR/"
cp "$ROOT_DIR/installer/windows-keyboard-for-mac.js" "$BUNDLE_DIR/installer/"
cp "$ROOT_DIR/dist/windows-keyboard-for-mac-profile.json" "$BUNDLE_DIR/dist/"
cp \
  "$ROOT_DIR/docs/shortcut-matrix.md" \
  "$ROOT_DIR/docs/design.md" \
  "$ROOT_DIR/docs/privacy.md" \
  "$ROOT_DIR/docs/quick-start.md" \
  "$BUNDLE_DIR/docs/"
cp \
  "$ROOT_DIR/docs/assets/windows-keyboard-for-mac-demo.gif" \
  "$BUNDLE_DIR/docs/assets/"

chmod +x \
  "$BUNDLE_DIR/install.command" \
  "$BUNDLE_DIR/add-keyboard.command" \
  "$BUNDLE_DIR/uninstall.command" \
  "$BUNDLE_DIR/doctor.command"

/bin/rm -f "$ARCHIVE_PATH" "$CHECKSUM_PATH"
(
  cd "$STAGING_DIR"
  /usr/bin/zip -qry -X "$ARCHIVE_PATH" "Windows Keyboard for Mac"
)

if /usr/bin/unzip -Z1 "$ARCHIVE_PATH" |
  /usr/bin/grep -E '(^|/)(\.DS_Store|__MACOSX|karabiner\.json|windows-keyboard-for-mac-state\.json)(/|$)'; then
  print -u2 -r -- "Release archive contains a local or macOS metadata file."
  exit 1
fi

(
  cd "$RELEASE_DIR"
  /usr/bin/shasum -a 256 "${ARCHIVE_PATH:t}" > "${CHECKSUM_PATH:t}"
)

print -r -- "$ARCHIVE_PATH"
print -r -- "$CHECKSUM_PATH"
