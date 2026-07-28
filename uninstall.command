#!/bin/zsh
set -euo pipefail

SCRIPT_DIR=${0:A:h}

exec /usr/bin/osascript -l JavaScript \
  "$SCRIPT_DIR/installer/windows-keyboard-for-mac.js" \
  uninstall \
  "$@"
