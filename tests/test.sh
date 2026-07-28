#!/bin/zsh
set -euo pipefail

ROOT_DIR=${0:A:h:h}
TEMP_DIR=$(mktemp -d /tmp/windows-keyboard-for-mac-tests.XXXXXX)
trap 'rm -rf "$TEMP_DIR"' EXIT

cd "$ROOT_DIR"

node src/generate-profile.mjs >/dev/null

jq -e '
  .name == "Windows Keyboard for Mac" and
  (.complex_modifications.rules | length) >= 8 and
  ([.complex_modifications.rules[].manipulators[] |
    ([.conditions[] | select(.type == "device_if")] | length) == 1
  ] | all) and
  ([.complex_modifications.rules[].manipulators[].conditions[] |
    select(.type == "device_if") |
    .identifiers[] |
    select(.description == "__WINDOWS_KEYBOARD_FOR_MAC_TARGETS__")
  ] | length) > 0
' dist/windows-keyboard-for-mac-profile.json >/dev/null

jq -e '
  ([.complex_modifications.rules[].manipulators[] |
    select(
      .from.key_code == "spacebar" and
      .from.modifiers.mandatory == ["command"] and
      .to == [{"key_code": "spacebar", "modifiers": ["left_control"]}]
    )
  ] | length) == 0 and
  ([.complex_modifications.rules[].manipulators[] |
    select(
      .from.key_code == "spacebar" and
      .from.modifiers.mandatory == ["control"] and
      .to == [{"key_code": "spacebar", "modifiers": ["left_command"]}]
    )
  ] | length) == 1 and
  ([.complex_modifications.rules[].manipulators[] |
    select(
      .from.key_code == "left_control" and
      .to_if_alone == [{
        "software_function": {
          "open_application": {"bundle_identifier": "com.apple.Spotlight"}
        }
      }]
    )
  ] | length) == 1 and
  ([.complex_modifications.rules[].manipulators[] |
    select(
      (.description == "Win+R opens Spotlight." or
       .description == "Win+S opens Spotlight.") and
      .to == [{
        "software_function": {
          "open_application": {"bundle_identifier": "com.apple.Spotlight"}
        }
      }]
    )
  ] | length) == 2
' dist/windows-keyboard-for-mac-profile.json >/dev/null

jq '{title: "Windows Keyboard for Mac", rules: .complex_modifications.rules}' \
  dist/windows-keyboard-for-mac-profile.json > "$TEMP_DIR/complex-modifications.json"

chmod +x tests/fixtures/fake-karabiner-cli
export WINDOWS_KEYBOARD_FOR_MAC_FAKE_STATE="$TEMP_DIR/fake-cli-state"

cp tests/fixtures/original-karabiner.jsonc "$TEMP_DIR/karabiner.json"

./install.command \
  --non-interactive \
  --skip-system-checks \
  --test-input-source-shortcut "$ROOT_DIR/tests/fixtures/input-source-shortcut.json" \
  --config "$TEMP_DIR/karabiner.json" \
  --cli "$ROOT_DIR/tests/fixtures/fake-karabiner-cli" \
  --device 1000:2000 > "$TEMP_DIR/install-result.json"

jq -e '
  .action == "install" and
  .verified == true and
  .live_profile == "Windows Keyboard for Mac" and
  .input_source_shortcut.key_code != null and
  (.input_source_shortcut.symbolic_hotkey_id == 60 or
   .input_source_shortcut.symbolic_hotkey_id == 61)
' "$TEMP_DIR/install-result.json" >/dev/null

jq -e '
  ([.profiles[] | select(.name == "Windows Keyboard for Mac" and .selected == true)] | length) == 1 and
  ([.profiles[] | select(.name == "Original" and .selected == false)] | length) == 1 and
  ([.profiles[] | select(.name == "Windows Keyboard for Mac") | .devices[] |
    select(.identifiers.vendor_id == 1000 and .identifiers.product_id == 2000) |
    .simple_modifications[]
  ] | length) == 4 and
  ([.profiles[] | select(.name == "Windows Keyboard for Mac") |
    .complex_modifications.rules[].manipulators[].conditions[] |
    select(.type == "device_if") |
    .identifiers[] |
    select(.vendor_id == 1000 and .product_id == 2000)
  ] | length) > 0 and
  ([.. | strings | select(. == "__WINDOWS_KEYBOARD_FOR_MAC_TARGETS__")] | length) == 0
' "$TEMP_DIR/karabiner.json" >/dev/null

BACKUP_PATH=$(jq -r '.backup_path' "$TEMP_DIR/install-result.json")
[[ -f "$BACKUP_PATH" ]]
rg -q '"Original"' "$BACKUP_PATH"

./add-keyboard.command \
  --non-interactive \
  --skip-system-checks \
  --test-input-source-shortcut "$ROOT_DIR/tests/fixtures/input-source-shortcut.json" \
  --config "$TEMP_DIR/karabiner.json" \
  --cli "$ROOT_DIR/tests/fixtures/fake-karabiner-cli" \
  --device 3000:4000 > "$TEMP_DIR/add-keyboard-result.json"

jq -e '
  .action == "install" and
  .verified == true and
  .added_keyboards == ["3000:4000"] and
  (.target_keyboards | sort) == (["1000:2000", "3000:4000"] | sort)
' "$TEMP_DIR/add-keyboard-result.json" >/dev/null

jq -e '
  ([.profiles[] | select(.name == "Windows Keyboard for Mac") | .devices[]] | length) == 2 and
  ([.profiles[] | select(.name == "Windows Keyboard for Mac") |
    .complex_modifications.rules[].manipulators[].conditions[] |
    select(.type == "device_if" and (.identifiers | length) == 2)
  ] | length) > 0
' "$TEMP_DIR/karabiner.json" >/dev/null

./doctor.command \
  --non-interactive \
  --config "$TEMP_DIR/karabiner.json" \
  --cli "$ROOT_DIR/tests/fixtures/fake-karabiner-cli" \
  --skip-system-checks \
  --test-input-source-shortcut "$ROOT_DIR/tests/fixtures/input-source-shortcut.json" \
  > "$TEMP_DIR/doctor-result.json"

jq -e '
  .healthy == true and
  .profile_installed == true and
  .profile_selected == true and
  .profile_structure_valid == true
' "$TEMP_DIR/doctor-result.json" >/dev/null

./uninstall.command \
  --non-interactive \
  --config "$TEMP_DIR/karabiner.json" \
  --cli "$ROOT_DIR/tests/fixtures/fake-karabiner-cli" > "$TEMP_DIR/uninstall-result.json"

jq -e '
  .action == "uninstall" and
  .verified == true and
  .restore_profile == "Original" and
  .live_profile == "Original"
' "$TEMP_DIR/uninstall-result.json" >/dev/null

jq -e '
  ([.profiles[] | select(.name == "Windows Keyboard for Mac")] | length) == 0 and
  ([.profiles[] | select(.name == "Original" and .selected == true)] | length) == 1
' "$TEMP_DIR/karabiner.json" >/dev/null

export WINDOWS_KEYBOARD_FOR_MAC_FAKE_FAIL_SELECT=1
if ./install.command \
  --non-interactive \
  --skip-system-checks \
  --test-input-source-shortcut "$ROOT_DIR/tests/fixtures/input-source-shortcut.json" \
  --config "$TEMP_DIR/karabiner.json" \
  --cli "$ROOT_DIR/tests/fixtures/fake-karabiner-cli" \
  --device 1000:2000 > "$TEMP_DIR/failed-install-output.txt" 2>&1; then
  print -u2 -r -- "Expected the simulated live activation failure."
  exit 1
fi
unset WINDOWS_KEYBOARD_FOR_MAC_FAKE_FAIL_SELECT

jq -e '
  ([.profiles[] | select(.name == "Windows Keyboard for Mac")] | length) == 0 and
  ([.profiles[] | select(.name == "Original" and .selected == true)] | length) == 1
' "$TEMP_DIR/karabiner.json" >/dev/null
rg -q 'restored automatically' "$TEMP_DIR/failed-install-output.txt"

print -r -- "Windows Keyboard for Mac tests passed."
