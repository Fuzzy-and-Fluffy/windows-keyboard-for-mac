import assert from "node:assert/strict";
import fs from "node:fs";

const profile = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const manipulators = profile.complex_modifications.rules.flatMap((rule) => rule.manipulators);
const remoteBundles = [
  "^com\\.microsoft\\.rdc\\.macos$",
  "^com\\.microsoft\\.windowsapp$",
  "^com\\.jumpdesktop\\.JumpDesktop$",
  "^com\\.citrix\\.XenAppViewer$",
  "^com\\.parallels\\.desktop\\.console$",
  "^com\\.vmware\\.fusion$",
  "^org\\.virtualbox\\.app\\.VirtualBoxVM$"
];
const expectedConditions = [
  {
    type: "device_if",
    identifiers: [{ vendor_id: 0, product_id: 0, is_keyboard: true,
      description: "__WINDOWS_KEYBOARD_FOR_MAC_TARGETS__" }]
  },
  { type: "frontmost_application_unless", bundle_identifiers: remoteBundles }
];
const spotlight = [{ apple_vendor_keyboard_key_code: "spotlight", repeat: false }];

for (const key of ["left_control", "right_control", "r", "s"]) {
  const tap = key.endsWith("_control");
  const mandatory = tap ? [] : ["control"];
  // Remote-only modifier passthrough cannot shadow a local Spotlight action.
  const matches = manipulators.filter((m) =>
    m.from.key_code === key &&
    JSON.stringify(m.from.modifiers?.mandatory ?? []) === JSON.stringify(mandatory) &&
    !m.conditions?.some((c) => c.type === "frontmost_application_if" &&
      JSON.stringify(c.bundle_identifiers) === JSON.stringify(remoteBundles))
  );
  assert.equal(matches.length, 1, `${key}: require one unshadowed local trigger`);
  const [m] = matches;
  assert.equal(m.type, "basic", key);
  assert.deepEqual(m.from.modifiers.optional, ["caps_lock"], key);
  assert.deepEqual(m.conditions, expectedConditions, `${key}: device and remote isolation`);
  if (tap) {
    assert.deepEqual(m.to, [{ key_code: key, lazy: true }], key);
    assert.deepEqual(m.to_if_alone, spotlight, key);
    assert.equal(m.parameters["basic.to_if_alone_timeout_milliseconds"], 250, key);
  } else {
    assert.deepEqual(m.to, spotlight, key);
  }
}
assert.ok(!JSON.stringify(profile).includes("com.apple.Spotlight"), "No Spotlight launch action");
console.log("Spotlight native-key regression checks passed.");
