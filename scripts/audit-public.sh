#!/bin/zsh
set -euo pipefail

ROOT_DIR=${0:A:h:h}
cd "$ROOT_DIR"

scan_targets=(
  .github
  docs
  installer
  scripts
  src
  tests
  AGENTS.md
  CHANGELOG.md
  CONTRIBUTING.md
  LICENSE
  README.md
  SECURITY.md
  add-keyboard.command
  doctor.command
  install.command
  package.json
  uninstall.command
)

home_path_pattern='/'"Users/"'[^/[:space:]]+/'
windows_home_pattern='[A-Za-z]:\\'"Users"'\\[^\\[:space:]]+\\'
email_pattern='[[:alnum:]._%+-]+@[[:alnum:].-]+\.[[:alpha:]]{2,}'
private_key_pattern='BEGIN [A-Z0-9 ]*PRIVATE '"KEY"
token_pattern='(ghp|github_pat|sk)-[[:alnum:]_-]{16,}'

if rg -n -I --hidden \
  "$home_path_pattern|$windows_home_pattern|$email_pattern|$private_key_pattern|$token_pattern" \
  "${scan_targets[@]}"; then
  print -u2 -r -- "Public audit failed: a local path, email address, private key, or token-like value was found."
  exit 1
fi

if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  candidate_files=$(git ls-files --cached --others --exclude-standard)
else
  candidate_files=$(rg --files --hidden "${scan_targets[@]}")
fi

if print -r -- "$candidate_files" |
  rg '(^|/)(\.DS_Store|karabiner\.json|windows-keyboard-for-mac-state\.json)$'; then
  print -u2 -r -- "Public audit failed: a local state file is present in the repository inputs."
  exit 1
fi

jq -e '
  ([.. | strings | select(contains("__WINDOWS_KEYBOARD_FOR_MAC_TARGETS__"))] | length) > 0 and
  ([.complex_modifications.rules[].manipulators[] |
    select(
      .from.key_code == "spacebar" and
      .from.modifiers.mandatory == ["command"] and
      .to == [{"key_code": "spacebar", "modifiers": ["left_control"]}]
    )
  ] | length) == 0
' dist/windows-keyboard-for-mac-profile.json >/dev/null

print -r -- "Public distribution audit passed."
