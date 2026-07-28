import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = path.join(root, "dist", "windows-keyboard-for-mac-profile.json");

const PROFILE_NAME = "Windows Keyboard for Mac";
const PLACEHOLDER_DESCRIPTION = "__WINDOWS_KEYBOARD_FOR_MAC_TARGETS__";

const terminalBundles = [
  "^com\\.apple\\.Terminal$",
  "^com\\.googlecode\\.iterm2$",
  "^com\\.github\\.wez\\.wezterm$",
  "^dev\\.warp\\.Warp-Stable$",
  "^io\\.alacritty$",
  "^net\\.kovidgoyal\\.kitty$",
  "^co\\.zeit\\.hyper$",
  "^com\\.mitchellh\\.ghostty$"
];

const browserBundles = [
  "^com\\.apple\\.Safari$",
  "^com\\.brave\\.Browser$",
  "^com\\.google\\.Chrome",
  "^com\\.microsoft\\.edgemac$",
  "^com\\.operasoftware\\.Opera",
  "^org\\.mozilla\\.firefox"
];

const remoteBundles = [
  "^com\\.microsoft\\.rdc\\.macos$",
  "^com\\.microsoft\\.windowsapp$",
  "^com\\.jumpdesktop\\.JumpDesktop$",
  "^com\\.citrix\\.XenAppViewer$",
  "^com\\.parallels\\.desktop\\.console$",
  "^com\\.vmware\\.fusion$",
  "^org\\.virtualbox\\.app\\.VirtualBoxVM$"
];

function targetPlaceholder() {
  return {
    vendor_id: 0,
    product_id: 0,
    is_keyboard: true,
    description: PLACEHOLDER_DESCRIPTION
  };
}

function deviceIf() {
  return {
    type: "device_if",
    identifiers: [targetPlaceholder()]
  };
}

function appIf(bundleIdentifiers) {
  return {
    type: "frontmost_application_if",
    bundle_identifiers: bundleIdentifiers
  };
}

function appUnless(bundleIdentifiers) {
  return {
    type: "frontmost_application_unless",
    bundle_identifiers: bundleIdentifiers
  };
}

function variableIf(name, value) {
  return { type: "variable_if", name, value };
}

function variableUnless(name, value) {
  return { type: "variable_unless", name, value };
}

function expressionUnless(expression) {
  return { type: "expression_unless", expression };
}

function from(keyCode, mandatory = [], optional = ["caps_lock"]) {
  const result = { key_code: keyCode };
  if (mandatory.length || optional.length) {
    result.modifiers = {};
    if (mandatory.length) result.modifiers.mandatory = mandatory;
    if (optional.length) result.modifiers.optional = optional;
  }
  return result;
}

function toKey(keyCode, modifiers = [], extra = {}) {
  const result = { key_code: keyCode, ...extra };
  if (modifiers.length) result.modifiers = modifiers;
  return result;
}

function toOpenApplication(bundleIdentifier) {
  return {
    software_function: {
      open_application: {
        bundle_identifier: bundleIdentifier
      }
    }
  };
}

function setVariable(name, value) {
  return {
    set_variable: {
      name,
      value
    }
  };
}

function manipulator({
  key,
  mandatory = [],
  optional = ["caps_lock"],
  to = [],
  conditions = [],
  description,
  toIfAlone,
  toAfterKeyUp,
  parameters
}) {
  const result = {
    type: "basic",
    from: from(key, mandatory, optional),
    to,
    conditions: [deviceIf(), ...conditions]
  };
  if (description) result.description = description;
  if (toIfAlone) result.to_if_alone = toIfAlone;
  if (toAfterKeyUp) result.to_after_key_up = toAfterKeyUp;
  if (parameters) result.parameters = parameters;
  return result;
}

function rule(description, manipulators) {
  return { description, manipulators };
}

const remoteIf = appIf(remoteBundles);
const remoteUnless = appUnless(remoteBundles);
const terminalIf = appIf(terminalBundles);
const browserIf = appIf(browserBundles);
const finderIf = appIf(["^com\\.apple\\.finder$"]);
const finderItemIf = [
  finderIf,
  variableUnless("accessibility.focused_ui_element.role_string", 0),
  variableUnless("accessibility.focused_ui_element.role_string", ""),
  expressionUnless(
    "accessibility.focused_ui_element.role_string like 'AXText*'"
  )
];

const rules = [];

rules.push(
  rule("[Windows Keyboard for Mac 01] Remote desktops: send physical Ctrl/Win/Alt natively", [
    manipulator({
      key: "left_command",
      to: [toKey("left_control")],
      conditions: [remoteIf],
      description: "Physical Ctrl was changed to Command by the device layer; restore it."
    }),
    manipulator({
      key: "right_command",
      to: [toKey("right_control")],
      conditions: [remoteIf]
    }),
    manipulator({
      key: "left_control",
      to: [toKey("left_command")],
      conditions: [remoteIf],
      description: "Physical Windows key was changed to Control; restore Command for the remote client."
    }),
    manipulator({
      key: "right_control",
      to: [toKey("right_command")],
      conditions: [remoteIf]
    })
  ])
);

const terminalSpecific = [
  ["c", ["command", "shift"], "c", ["left_command"], "Ctrl+Shift+C copies"],
  ["v", ["command", "shift"], "v", ["left_command"], "Ctrl+Shift+V pastes"],
  ["n", ["command", "shift"], "n", ["left_command"], "Ctrl+Shift+N opens a new terminal window"],
  ["t", ["command", "shift"], "t", ["left_command"], "Ctrl+Shift+T opens a new terminal tab"],
  ["w", ["command", "shift"], "w", ["left_command"], "Ctrl+Shift+W closes the terminal tab/window"]
].map(([key, mandatory, outKey, outModifiers, description]) =>
  manipulator({
    key,
    mandatory,
    to: [toKey(outKey, outModifiers)],
    conditions: [terminalIf],
    description
  })
);

const terminalRawKeys = [
  ..."abcdefghijklmnopqrstuvwxyz",
  "open_bracket",
  "close_bracket",
  "backslash",
  "slash"
];

const terminalRawShifted = terminalRawKeys.map((key) =>
  manipulator({
    key,
    mandatory: ["command", "shift"],
    to: [toKey(key, ["left_control", "left_shift"])],
    conditions: [terminalIf],
    description: `Terminal raw Ctrl+Shift+${key}`
  })
);

const terminalRaw = terminalRawKeys.map((key) =>
  manipulator({
    key,
    mandatory: ["command"],
    to: [toKey(key, ["left_control"])],
    conditions: [terminalIf],
    description: `Terminal raw Ctrl+${key}`
  })
);

rules.push(
  rule(
    "[Windows Keyboard for Mac 02] Terminal: Windows Terminal/Linux control behavior",
    [...terminalSpecific, ...terminalRawShifted, ...terminalRaw]
  )
);

rules.push(
  rule("[Windows Keyboard for Mac 03] Finder: Windows Explorer behavior", [
    manipulator({
      key: "x",
      mandatory: ["command"],
      to: [
        toKey("c", ["left_command"]),
        setVariable("windows_keyboard_for_mac_finder_cut", 1)
      ],
      conditions: finderItemIf,
      description: "Ctrl+X marks selected Finder items for moving."
    }),
    manipulator({
      key: "v",
      mandatory: ["command"],
      to: [
        toKey("v", ["left_command", "left_option"]),
        setVariable("windows_keyboard_for_mac_finder_cut", 0)
      ],
      conditions: [
        ...finderItemIf,
        variableIf("windows_keyboard_for_mac_finder_cut", 1)
      ],
      description: "Ctrl+V moves items after Ctrl+X."
    }),
    manipulator({
      key: "v",
      mandatory: ["command"],
      to: [toKey("v", ["left_command"])],
      conditions: [
        ...finderItemIf,
        variableUnless("windows_keyboard_for_mac_finder_cut", 1)
      ],
      description: "Ctrl+V remains a normal paste when no cut is pending."
    }),
    manipulator({
      key: "f2",
      to: [toKey("return_or_enter")],
      conditions: finderItemIf,
      description: "F2 renames the selected item."
    }),
    manipulator({
      key: "return_or_enter",
      to: [toKey("down_arrow", ["left_command"])],
      conditions: finderItemIf,
      description: "Enter opens the selected item only when Finder is not editing text."
    }),
    manipulator({
      key: "delete_forward",
      mandatory: ["shift"],
      to: [toKey("delete_or_backspace", ["left_command", "left_option"])],
      conditions: finderItemIf,
      description: "Shift+Delete requests immediate deletion."
    }),
    manipulator({
      key: "delete_forward",
      to: [toKey("delete_or_backspace", ["left_command"])],
      conditions: finderItemIf,
      description: "Delete moves the selected item to Trash."
    }),
    manipulator({
      key: "delete_or_backspace",
      to: [toKey("open_bracket", ["left_command"])],
      conditions: finderItemIf,
      description: "Backspace navigates back only when Finder is not editing text."
    })
  ])
);

rules.push(
  rule("[Windows Keyboard for Mac 04] Text navigation and deletion", [
    manipulator({
      key: "home",
      mandatory: ["command", "shift"],
      to: [toKey("up_arrow", ["left_command", "left_shift"])],
      conditions: [remoteUnless],
      description: "Ctrl+Shift+Home selects to the start of the document."
    }),
    manipulator({
      key: "home",
      mandatory: ["command"],
      to: [toKey("up_arrow", ["left_command"])],
      conditions: [remoteUnless],
      description: "Ctrl+Home moves to the start of the document."
    }),
    manipulator({
      key: "home",
      mandatory: ["shift"],
      to: [toKey("left_arrow", ["left_command", "left_shift"])],
      conditions: [remoteUnless],
      description: "Shift+Home selects to the start of the line."
    }),
    manipulator({
      key: "home",
      to: [toKey("left_arrow", ["left_command"])],
      conditions: [remoteUnless],
      description: "Home moves to the start of the line."
    }),
    manipulator({
      key: "end",
      mandatory: ["command", "shift"],
      to: [toKey("down_arrow", ["left_command", "left_shift"])],
      conditions: [remoteUnless],
      description: "Ctrl+Shift+End selects to the end of the document."
    }),
    manipulator({
      key: "end",
      mandatory: ["command"],
      to: [toKey("down_arrow", ["left_command"])],
      conditions: [remoteUnless],
      description: "Ctrl+End moves to the end of the document."
    }),
    manipulator({
      key: "end",
      mandatory: ["shift"],
      to: [toKey("right_arrow", ["left_command", "left_shift"])],
      conditions: [remoteUnless],
      description: "Shift+End selects to the end of the line."
    }),
    manipulator({
      key: "end",
      to: [toKey("right_arrow", ["left_command"])],
      conditions: [remoteUnless],
      description: "End moves to the end of the line."
    }),
    ...["left_arrow", "right_arrow", "up_arrow", "down_arrow"].flatMap((key) => [
      manipulator({
        key,
        mandatory: ["command", "shift"],
        to: [toKey(key, ["left_option", "left_shift"])],
        conditions: [remoteUnless],
        description: `Ctrl+Shift+${key} selects by word or paragraph.`
      }),
      manipulator({
        key,
        mandatory: ["command"],
        to: [toKey(key, ["left_option"])],
        conditions: [remoteUnless],
        description: `Ctrl+${key} moves by word or paragraph.`
      })
    ]),
    manipulator({
      key: "delete_or_backspace",
      mandatory: ["command"],
      to: [toKey("delete_or_backspace", ["left_option"])],
      conditions: [remoteUnless],
      description: "Ctrl+Backspace deletes the previous word."
    }),
    manipulator({
      key: "delete_forward",
      mandatory: ["command"],
      to: [toKey("delete_forward", ["left_option"])],
      conditions: [remoteUnless],
      description: "Ctrl+Delete deletes the next word."
    })
  ])
);

rules.push(
  rule("[Windows Keyboard for Mac 05] Editing and tab exceptions", [
    manipulator({
      key: "y",
      mandatory: ["command"],
      to: [toKey("z", ["left_command", "left_shift"])],
      conditions: [remoteUnless],
      description: "Ctrl+Y performs Redo."
    }),
    manipulator({
      key: "tab",
      mandatory: ["command", "shift"],
      to: [toKey("tab", ["left_control", "left_shift"])],
      conditions: [remoteUnless],
      description: "Ctrl+Shift+Tab selects the previous tab."
    }),
    manipulator({
      key: "tab",
      mandatory: ["command"],
      to: [toKey("tab", ["left_control"])],
      conditions: [remoteUnless],
      description: "Ctrl+Tab selects the next tab."
    }),
    manipulator({
      key: "f4",
      mandatory: ["command"],
      to: [toKey("w", ["left_command"])],
      conditions: [remoteUnless],
      description: "Ctrl+F4 closes the active document or tab."
    }),
    manipulator({
      key: "insert",
      mandatory: ["command"],
      to: [toKey("c", ["left_command"])],
      conditions: [remoteUnless],
      description: "Ctrl+Insert copies."
    }),
    manipulator({
      key: "insert",
      mandatory: ["shift"],
      to: [toKey("v", ["left_command"])],
      conditions: [remoteUnless],
      description: "Shift+Insert pastes."
    })
  ])
);

rules.push(
  rule("[Windows Keyboard for Mac 06] Browser compatibility", [
    manipulator({
      key: "f5",
      to: [toKey("r", ["left_command"])],
      conditions: [browserIf],
      description: "F5 reloads the page."
    }),
    manipulator({
      key: "f5",
      mandatory: ["shift"],
      to: [toKey("r", ["left_command", "left_shift"])],
      conditions: [browserIf],
      description: "Shift+F5 reloads without cache where supported."
    })
  ])
);

rules.push(
  rule("[Windows Keyboard for Mac 07] Alt shortcuts", [
    manipulator({
      key: "tab",
      mandatory: ["option", "shift"],
      to: [toKey("tab", ["left_command", "left_shift"])],
      conditions: [remoteUnless],
      description: "Alt+Shift+Tab switches backward through apps."
    }),
    manipulator({
      key: "tab",
      mandatory: ["option"],
      to: [toKey("tab", ["left_command"])],
      conditions: [remoteUnless],
      description: "Alt+Tab switches apps."
    }),
    manipulator({
      key: "f4",
      mandatory: ["option"],
      to: [toKey("q", ["left_command"])],
      conditions: [remoteUnless],
      description: "Alt+F4 quits the active app."
    }),
    manipulator({
      key: "left_arrow",
      mandatory: ["option"],
      to: [toKey("open_bracket", ["left_command"])],
      conditions: [remoteUnless],
      description: "Alt+Left navigates back."
    }),
    manipulator({
      key: "right_arrow",
      mandatory: ["option"],
      to: [toKey("close_bracket", ["left_command"])],
      conditions: [remoteUnless],
      description: "Alt+Right navigates forward."
    })
  ])
);

rules.push(
  rule("[Windows Keyboard for Mac 08] Windows key: Start, search, system and window actions", [
    manipulator({
      key: "spacebar",
      mandatory: ["control"],
      to: [toKey("spacebar", ["left_command"])],
      conditions: [remoteUnless],
      description: "Win+Space switches the macOS input source using the shortcut discovered during installation."
    }),
    manipulator({
      key: "left_control",
      to: [toKey("left_control", [], { lazy: true })],
      toIfAlone: [toOpenApplication("com.apple.Spotlight")],
      parameters: {
        "basic.to_if_alone_timeout_milliseconds": 250
      },
      conditions: [remoteUnless],
      description: "Tap the left Windows key to open Spotlight."
    }),
    manipulator({
      key: "right_control",
      to: [toKey("right_control", [], { lazy: true })],
      toIfAlone: [toOpenApplication("com.apple.Spotlight")],
      parameters: {
        "basic.to_if_alone_timeout_milliseconds": 250
      },
      conditions: [remoteUnless],
      description: "Tap the right Windows key to open Spotlight."
    }),
    manipulator({
      key: "e",
      mandatory: ["control"],
      to: [toOpenApplication("com.apple.finder")],
      conditions: [remoteUnless],
      description: "Win+E opens Finder."
    }),
    manipulator({
      key: "i",
      mandatory: ["control"],
      to: [toOpenApplication("com.apple.systempreferences")],
      conditions: [remoteUnless],
      description: "Win+I opens System Settings."
    }),
    ...["r", "s"].map((key) =>
      manipulator({
        key,
        mandatory: ["control"],
        to: [toOpenApplication("com.apple.Spotlight")],
        conditions: [remoteUnless],
        description: `Win+${key.toUpperCase()} opens Spotlight.`
      })
    ),
    manipulator({
      key: "l",
      mandatory: ["control"],
      to: [toKey("q", ["left_control", "left_command"])],
      conditions: [remoteUnless],
      description: "Win+L locks the Mac."
    }),
    manipulator({
      key: "tab",
      mandatory: ["control"],
      to: [toKey("mission_control")],
      conditions: [remoteUnless],
      description: "Win+Tab opens Mission Control."
    }),
    manipulator({
      key: "d",
      mandatory: ["control"],
      to: [toKey("f11", ["fn"])],
      conditions: [remoteUnless],
      description: "Win+D shows the desktop."
    }),
    manipulator({
      key: "m",
      mandatory: ["control"],
      to: [toKey("m", ["left_command", "left_option"])],
      conditions: [remoteUnless],
      description: "Win+M minimizes the active app's windows."
    }),
    manipulator({
      key: "period",
      mandatory: ["control"],
      to: [toKey("spacebar", ["left_control", "left_command"])],
      conditions: [remoteUnless],
      description: "Win+. opens Emoji & Symbols."
    }),
    manipulator({
      key: "left_arrow",
      mandatory: ["control"],
      to: [toKey("left_arrow", ["fn", "left_control"])],
      conditions: [remoteUnless],
      description: "Win+Left tiles the window left (macOS 15+)."
    }),
    manipulator({
      key: "right_arrow",
      mandatory: ["control"],
      to: [toKey("right_arrow", ["fn", "left_control"])],
      conditions: [remoteUnless],
      description: "Win+Right tiles the window right (macOS 15+)."
    }),
    manipulator({
      key: "up_arrow",
      mandatory: ["control"],
      to: [toKey("f", ["fn", "left_control"])],
      conditions: [remoteUnless],
      description: "Win+Up fills the desktop (macOS 15+)."
    }),
    manipulator({
      key: "down_arrow",
      mandatory: ["control"],
      to: [toKey("r", ["fn", "left_control"])],
      conditions: [remoteUnless],
      description: "Win+Down returns the window to its previous size (macOS 15+)."
    }),
    manipulator({
      key: "s",
      mandatory: ["control", "shift"],
      to: [toKey("4", ["left_command", "left_shift"])],
      conditions: [remoteUnless],
      description: "Win+Shift+S captures a selected area."
    })
  ])
);

rules.push(
  rule("[Windows Keyboard for Mac 09] Screenshots and security", [
    manipulator({
      key: "print_screen",
      mandatory: ["option"],
      to: [
        toKey("4", ["left_command", "left_shift"]),
        toKey("spacebar")
      ],
      conditions: [remoteUnless],
      description: "Alt+Print Screen captures a window."
    }),
    manipulator({
      key: "print_screen",
      to: [toKey("3", ["left_command", "left_shift"])],
      conditions: [remoteUnless],
      description: "Print Screen captures the full screen."
    }),
    manipulator({
      key: "escape",
      mandatory: ["command", "shift"],
      to: [toKey("escape", ["left_command", "left_option"])],
      conditions: [remoteUnless],
      description: "Ctrl+Shift+Esc opens Force Quit, the closest macOS equivalent to Task Manager."
    }),
    manipulator({
      key: "delete_forward",
      mandatory: ["command", "option"],
      to: [toKey("q", ["left_control", "left_command"])],
      conditions: [remoteUnless],
      description: "Ctrl+Alt+Delete locks the Mac."
    })
  ])
);

const profile = {
  name: PROFILE_NAME,
  selected: false,
  virtual_hid_keyboard: {
    keyboard_type_v2: "ansi"
  },
  devices: [],
  complex_modifications: {
    parameters: {
      "basic.to_if_alone_timeout_milliseconds": 250
    },
    rules
  },
  windows_keyboard_for_mac: {
    schema_version: 1,
    generated_by: "src/generate-profile.mjs",
    target_placeholder_description: PLACEHOLDER_DESCRIPTION,
    minimum_macos_major: 15,
    minimum_karabiner_major: 16
  }
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(profile, null, 2)}\n`);

const manipulatorCount = rules.reduce(
  (count, currentRule) => count + currentRule.manipulators.length,
  0
);

console.log(
  `Generated ${path.relative(root, outputPath)}: ${rules.length} rules, ${manipulatorCount} manipulators`
);
