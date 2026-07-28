ObjC.import("Foundation");

var app = Application.currentApplication();
app.includeStandardAdditions = true;

var PROFILE_NAME = "Windows Keyboard for Mac";
var PLACEHOLDER_DESCRIPTION = "__WINDOWS_KEYBOARD_FOR_MAC_TARGETS__";
var INPUT_SOURCE_DESCRIPTION =
  "Win+Space switches the macOS input source using the shortcut discovered during installation.";
var MINIMUM_KARABINER_MAJOR = 16;
var DEFAULT_CLI =
  "/Library/Application Support/org.pqrs/Karabiner-Elements/bin/karabiner_cli";

function unwrap(value) {
  return ObjC.unwrap(value);
}

function homeDirectory() {
  return unwrap($.NSHomeDirectory());
}

function fileExists(filePath) {
  return $.NSFileManager.defaultManager.fileExistsAtPath(filePath);
}

function parentDirectory(filePath) {
  return unwrap($(filePath).stringByDeletingLastPathComponent);
}

function ensureDirectory(directoryPath) {
  var error = Ref();
  var ok =
    $.NSFileManager.defaultManager.createDirectoryAtPathWithIntermediateDirectoriesAttributesError(
      directoryPath,
      true,
      $(),
      error
    );
  if (!ok) {
    throw new Error("Cannot create directory: " + directoryPath);
  }
}

function readText(filePath) {
  var data = $.NSData.dataWithContentsOfFile(filePath);
  if (!data) throw new Error("Cannot read file: " + filePath);
  return unwrap(
    $.NSString.alloc.initWithDataEncoding(data, $.NSUTF8StringEncoding)
  );
}

function writeTextAtomic(filePath, text) {
  ensureDirectory(parentDirectory(filePath));
  var error = Ref();
  var ok = $(text).writeToFileAtomicallyEncodingError(
    filePath,
    true,
    $.NSUTF8StringEncoding,
    error
  );
  if (!ok) throw new Error("Cannot write file: " + filePath);
}

function copyFile(sourcePath, destinationPath) {
  ensureDirectory(parentDirectory(destinationPath));
  var error = Ref();
  var ok = $.NSFileManager.defaultManager.copyItemAtPathToPathError(
    sourcePath,
    destinationPath,
    error
  );
  if (!ok) {
    throw new Error(
      "Cannot copy " + sourcePath + " to backup " + destinationPath
    );
  }
}

function removeFile(filePath) {
  if (!fileExists(filePath)) return;
  var error = Ref();
  var ok = $.NSFileManager.defaultManager.removeItemAtPathError(filePath, error);
  if (!ok) throw new Error("Cannot remove file: " + filePath);
}

function timestamp() {
  var formatter = $.NSDateFormatter.alloc.init;
  formatter.dateFormat = "yyyyMMdd-HHmmss";
  return (
    unwrap(formatter.stringFromDate($.NSDate.date)) +
    "-" +
    unwrap($.NSUUID.UUID.UUIDString).slice(0, 8)
  );
}

function runTask(executable, args, allowFailure) {
  var task = $.NSTask.alloc.init;
  var stdoutPipe = $.NSPipe.pipe;
  var stderrPipe = $.NSPipe.pipe;
  task.launchPath = executable;
  task.arguments = args;
  task.standardOutput = stdoutPipe;
  task.standardError = stderrPipe;

  try {
    task.launch;
    task.waitUntilExit;
  } catch (error) {
    throw new Error("Cannot run " + executable + ": " + error.message);
  }

  var stdoutData = stdoutPipe.fileHandleForReading.readDataToEndOfFile;
  var stderrData = stderrPipe.fileHandleForReading.readDataToEndOfFile;
  var stdout = unwrap(
    $.NSString.alloc.initWithDataEncoding(stdoutData, $.NSUTF8StringEncoding)
  );
  var stderr = unwrap(
    $.NSString.alloc.initWithDataEncoding(stderrData, $.NSUTF8StringEncoding)
  );
  var status = task.terminationStatus;

  if (status !== 0 && !allowFailure) {
    throw new Error(
      executable +
        " exited with " +
        status +
        (stderr ? ": " + stderr.trim() : "")
    );
  }

  return {
    status: status,
    stdout: stdout || "",
    stderr: stderr || ""
  };
}

function stripJsonComments(text) {
  var result = "";
  var inString = false;
  var escaped = false;
  var lineComment = false;
  var blockComment = false;

  for (var index = 0; index < text.length; index += 1) {
    var character = text[index];
    var next = index + 1 < text.length ? text[index + 1] : "";

    if (lineComment) {
      if (character === "\n") {
        lineComment = false;
        result += character;
      }
      continue;
    }

    if (blockComment) {
      if (character === "*" && next === "/") {
        blockComment = false;
        index += 1;
      } else if (character === "\n") {
        result += character;
      }
      continue;
    }

    if (inString) {
      result += character;
      if (escaped) {
        escaped = false;
      } else if (character === "\\") {
        escaped = true;
      } else if (character === '"') {
        inString = false;
      }
      continue;
    }

    if (character === '"') {
      inString = true;
      result += character;
    } else if (character === "/" && next === "/") {
      lineComment = true;
      index += 1;
    } else if (character === "/" && next === "*") {
      blockComment = true;
      index += 1;
    } else {
      result += character;
    }
  }

  return result;
}

function readJson(filePath) {
  try {
    return JSON.parse(stripJsonComments(readText(filePath)));
  } catch (error) {
    throw new Error("Invalid JSON in " + filePath + ": " + error.message);
  }
}

function writeJson(filePath, value) {
  writeTextAtomic(filePath, JSON.stringify(value, null, 2) + "\n");
}

function macVirtualKeyToKarabiner(keyCode) {
  var keys = {
    0: "a",
    1: "s",
    2: "d",
    3: "f",
    4: "h",
    5: "g",
    6: "z",
    7: "x",
    8: "c",
    9: "v",
    11: "b",
    12: "q",
    13: "w",
    14: "e",
    15: "r",
    16: "y",
    17: "t",
    18: "1",
    19: "2",
    20: "3",
    21: "4",
    22: "6",
    23: "5",
    24: "equal_sign",
    25: "9",
    26: "7",
    27: "hyphen",
    28: "8",
    29: "0",
    30: "close_bracket",
    31: "o",
    32: "u",
    33: "open_bracket",
    34: "i",
    35: "p",
    36: "return_or_enter",
    37: "l",
    38: "j",
    39: "quote",
    40: "k",
    41: "semicolon",
    42: "backslash",
    43: "comma",
    44: "slash",
    45: "n",
    46: "m",
    47: "period",
    48: "tab",
    49: "spacebar",
    50: "grave_accent_and_tilde",
    51: "delete_or_backspace",
    53: "escape",
    64: "f17",
    79: "f18",
    80: "f19",
    90: "f20",
    96: "f5",
    97: "f6",
    98: "f7",
    99: "f3",
    100: "f8",
    101: "f9",
    103: "f11",
    105: "f13",
    106: "f16",
    107: "f14",
    109: "f10",
    111: "f12",
    113: "f15",
    114: "help",
    115: "home",
    116: "page_up",
    117: "delete_forward",
    118: "f4",
    119: "end",
    120: "f2",
    121: "page_down",
    122: "f1",
    123: "left_arrow",
    124: "right_arrow",
    125: "down_arrow",
    126: "up_arrow"
  };
  return keys[keyCode] || null;
}

function macModifierFlagsToKarabiner(flags) {
  var modifiers = [];
  if ((flags & 1048576) !== 0) modifiers.push("left_command");
  if ((flags & 262144) !== 0) modifiers.push("left_control");
  if ((flags & 524288) !== 0) modifiers.push("left_option");
  if ((flags & 131072) !== 0) modifiers.push("left_shift");
  return modifiers;
}

function readInputSourceShortcut() {
  var plistPath =
    homeDirectory() +
    "/Library/Preferences/com.apple.symbolichotkeys.plist";
  var ids = ["60", "61"];

  for (var index = 0; index < ids.length; index += 1) {
    var id = ids[index];
    var result = runTask(
      "/usr/bin/plutil",
      [
        "-extract",
        "AppleSymbolicHotKeys." + id,
        "json",
        "-o",
        "-",
        plistPath
      ],
      true
    );
    if (result.status !== 0 || result.stdout.trim() === "") continue;

    var symbolicHotkey;
    try {
      symbolicHotkey = JSON.parse(result.stdout);
    } catch (error) {
      continue;
    }
    var parameters =
      symbolicHotkey &&
      symbolicHotkey.value &&
      symbolicHotkey.value.parameters;
    if (
      symbolicHotkey.enabled !== true ||
      !Array.isArray(parameters) ||
      parameters.length < 3
    ) {
      continue;
    }

    var keyCode = macVirtualKeyToKarabiner(Number(parameters[1]));
    if (!keyCode) {
      throw new Error(
        "The macOS input-source shortcut uses unsupported virtual key code " +
          parameters[1] +
          ". Assign it to Space, a letter, arrow, or function key and try again."
      );
    }
    return {
      symbolic_hotkey_id: Number(id),
      key_code: keyCode,
      modifiers: macModifierFlagsToKarabiner(Number(parameters[2]))
    };
  }

  throw new Error(
    "No enabled macOS input-source shortcut was found. Enable Keyboard > Keyboard Shortcuts > Input Sources > Select the previous input source, then try again."
  );
}

function shortcutEvent(shortcut) {
  var event = { key_code: shortcut.key_code };
  if (shortcut.modifiers.length) event.modifiers = shortcut.modifiers;
  return event;
}

function inputSourceShortcutForOptions(options) {
  if (!options.testInputSourceShortcut) {
    return readInputSourceShortcut();
  }
  var shortcut = readJson(options.testInputSourceShortcut);
  if (
    (shortcut.symbolic_hotkey_id !== 60 &&
      shortcut.symbolic_hotkey_id !== 61) ||
    typeof shortcut.key_code !== "string" ||
    !Array.isArray(shortcut.modifiers)
  ) {
    throw new Error("Invalid test input-source shortcut fixture.");
  }
  return shortcut;
}

function configureInputSourceShortcut(profile, shortcut) {
  var matches = 0;
  profile.complex_modifications.rules.forEach(function (currentRule) {
    currentRule.manipulators.forEach(function (currentManipulator) {
      if (currentManipulator.description !== INPUT_SOURCE_DESCRIPTION) return;
      currentManipulator.to = [shortcutEvent(shortcut)];
      matches += 1;
    });
  });
  if (matches !== 1) {
    throw new Error(
      "Template safety check failed: expected one input-source rule, found " +
        matches +
        "."
    );
  }
}

function parseOptions(argv) {
  var options = {
    action: argv.length ? argv[0] : "install",
    cli: DEFAULT_CLI,
    config: homeDirectory() + "/.config/karabiner/karabiner.json",
    template: null,
    devices: [],
    nonInteractive: false,
    dryRun: false,
    skipSystemChecks: false,
    testInputSourceShortcut: null
  };

  for (var index = 1; index < argv.length; index += 1) {
    var argument = argv[index];
    if (argument === "--cli") {
      options.cli = argv[++index];
    } else if (argument === "--config") {
      options.config = argv[++index];
    } else if (argument === "--template") {
      options.template = argv[++index];
    } else if (argument === "--device") {
      options.devices.push(argv[++index]);
    } else if (argument === "--non-interactive") {
      options.nonInteractive = true;
    } else if (argument === "--dry-run") {
      options.dryRun = true;
    } else if (argument === "--skip-system-checks") {
      options.skipSystemChecks = true;
    } else if (argument === "--test-input-source-shortcut") {
      options.testInputSourceShortcut = argv[++index];
    } else {
      throw new Error("Unknown option: " + argument);
    }
  }
  if (options.testInputSourceShortcut && !options.skipSystemChecks) {
    throw new Error(
      "--test-input-source-shortcut requires --skip-system-checks."
    );
  }
  return options;
}

function parseDeviceSelector(selector) {
  var parts = selector.split(":");
  if (parts.length !== 2) {
    throw new Error("Device must be written as vendor_id:product_id");
  }
  var vendorId = Number(parts[0]);
  var productId = Number(parts[1]);
  if (!isFinite(vendorId) || !isFinite(productId)) {
    throw new Error("Invalid device selector: " + selector);
  }
  return {
    vendor_id: vendorId,
    product_id: productId,
    is_keyboard: true
  };
}

function deviceKey(identifier) {
  return identifier.vendor_id + ":" + identifier.product_id;
}

function mergeTargetIdentifiers(existing, added) {
  var seen = {};
  var merged = [];
  existing.concat(added).forEach(function (identifier) {
    if (
      !identifier ||
      typeof identifier.vendor_id !== "number" ||
      typeof identifier.product_id !== "number"
    ) {
      return;
    }
    var normalized = {
      vendor_id: identifier.vendor_id,
      product_id: identifier.product_id,
      is_keyboard: true
    };
    var key = deviceKey(normalized);
    if (seen[key]) return;
    seen[key] = true;
    merged.push(normalized);
  });
  return merged;
}

function profileTargetIdentifiers(profile) {
  if (!profile || !Array.isArray(profile.devices)) return [];
  return profile.devices.map(function (device) {
    return device.identifiers;
  });
}

function listCandidateKeyboards(cliPath) {
  var result = runTask(cliPath, ["--list-connected-devices"], false);
  var devices;
  try {
    devices = JSON.parse(result.stdout);
  } catch (error) {
    throw new Error("Karabiner returned invalid device data: " + error.message);
  }

  var seen = {};
  var candidates = [];
  devices.forEach(function (device) {
    var identifier = device.device_identifiers || {};
    if (
      identifier.is_keyboard !== true ||
      identifier.is_virtual_device === true ||
      device.is_apple === true ||
      typeof identifier.vendor_id !== "number" ||
      typeof identifier.product_id !== "number"
    ) {
      return;
    }
    var key = deviceKey(identifier);
    if (seen[key]) return;
    seen[key] = true;
    candidates.push({
      identifier: {
        vendor_id: identifier.vendor_id,
        product_id: identifier.product_id,
        is_keyboard: true
      },
      label:
        (device.manufacturer || "Unknown") +
        " — " +
        (device.product || "Keyboard") +
        " [" +
        key +
        "]"
    });
  });
  return candidates;
}

function chooseTargets(options, candidates) {
  if (options.devices.length) {
    var requested = options.devices.map(parseDeviceSelector);
    requested.forEach(function (identifier) {
      var found = candidates.some(function (candidate) {
        return deviceKey(candidate.identifier) === deviceKey(identifier);
      });
      if (!found) {
        throw new Error(
          "Requested keyboard is not connected: " + deviceKey(identifier)
        );
      }
    });
    return requested;
  }

  if (candidates.length === 0) {
    throw new Error(
      "No non-Apple physical keyboard was found. Connect a Windows keyboard and try again."
    );
  }
  if (candidates.length === 1) return [candidates[0].identifier];
  if (options.nonInteractive) {
    throw new Error(
      "More than one keyboard is connected; pass --device vendor_id:product_id."
    );
  }

  var labels = candidates.map(function (candidate) {
    return candidate.label;
  });
  var selection = app.chooseFromList(labels, {
    withTitle: "Windows Keyboard for Mac",
    withPrompt: "Select the Windows keyboard(s) to convert:",
    multipleSelectionsAllowed: true,
    emptySelectionAllowed: false,
    defaultItems: [labels[0]]
  });
  if (!selection) throw new Error("Installation cancelled.");

  return candidates
    .filter(function (candidate) {
      return selection.indexOf(candidate.label) !== -1;
    })
    .map(function (candidate) {
      return candidate.identifier;
    });
}

function verifyNoSystemLayerConflicts(targets, skipChecks) {
  if (skipChecks) return;

  targets.forEach(function (identifier) {
    var key =
      "com.apple.keyboard.modifiermapping." +
      identifier.vendor_id +
      "-" +
      identifier.product_id +
      "-0";
    var result = runTask(
      "/usr/bin/defaults",
      ["-currentHost", "read", "-g", key],
      true
    );
    if (result.status === 0 && result.stdout.trim() !== "") {
      throw new Error(
        "macOS still has a Modifier Keys mapping for " +
          deviceKey(identifier) +
          ". Reset that keyboard to the macOS defaults first; Windows Keyboard for Mac must be the only modifier layer."
      );
    }
  });

  var hidutil = runTask(
    "/usr/bin/hidutil",
    ["property", "--get", "UserKeyMapping"],
    true
  );
  var value = hidutil.stdout.trim();
  if (
    hidutil.status === 0 &&
    value !== "" &&
    value !== "(null)" &&
    value !== "null" &&
    value !== "[]"
  ) {
    throw new Error(
      "hidutil UserKeyMapping is active. Remove it before installing Windows Keyboard for Mac so there is only one translation layer."
    );
  }
}

function simpleModifier(fromKey, toKey) {
  return {
    from: { key_code: fromKey },
    to: [{ key_code: toKey }]
  };
}

function deviceConfiguration(identifier) {
  return {
    identifiers: {
      vendor_id: identifier.vendor_id,
      product_id: identifier.product_id,
      is_keyboard: true
    },
    simple_modifications: [
      simpleModifier("left_control", "left_command"),
      simpleModifier("right_control", "right_command"),
      simpleModifier("left_command", "left_control"),
      simpleModifier("right_command", "right_control")
    ]
  };
}

function fillDeviceConditions(profile, targets) {
  var replacement = targets.map(function (identifier) {
    return {
      vendor_id: identifier.vendor_id,
      product_id: identifier.product_id,
      is_keyboard: true,
      description: "Windows Keyboard for Mac target " + deviceKey(identifier)
    };
  });
  var replacements = 0;

  profile.complex_modifications.rules.forEach(function (currentRule) {
    currentRule.manipulators.forEach(function (currentManipulator) {
      var hasTargetCondition = false;
      (currentManipulator.conditions || []).forEach(function (condition) {
        if (condition.type !== "device_if") return;
        var isPlaceholder = (condition.identifiers || []).some(function (
          identifier
        ) {
          return identifier.description === PLACEHOLDER_DESCRIPTION;
        });
        if (isPlaceholder) {
          condition.identifiers = replacement;
          replacements += 1;
          hasTargetCondition = true;
        } else if ((condition.identifiers || []).length) {
          hasTargetCondition = true;
        }
      });
      if (!hasTargetCondition) {
        throw new Error(
          "Template safety check failed: every manipulator must be device-scoped."
        );
      }
    });
  });

  if (replacements === 0) {
    throw new Error("Template has no target placeholders.");
  }
  return replacements;
}

function buildProfile(templatePath, targets, inputSourceShortcut) {
  if (!templatePath) throw new Error("--template is required for installation.");
  var profile = readJson(templatePath);
  if (profile.name !== PROFILE_NAME) {
    throw new Error("Unexpected template profile name: " + profile.name);
  }
  fillDeviceConditions(profile, targets);
  configureInputSourceShortcut(profile, inputSourceShortcut);
  profile.devices = targets.map(deviceConfiguration);
  profile.selected = true;
  delete profile.windows_keyboard_for_mac;
  return profile;
}

function loadConfig(configPath) {
  if (!fileExists(configPath)) return { profiles: [] };
  var config = readJson(configPath);
  if (!Array.isArray(config.profiles)) {
    throw new Error("Karabiner config does not contain a profiles array.");
  }
  return config;
}

function backupConfig(configPath, reason) {
  if (!fileExists(configPath)) return null;
  var backupDirectory =
    parentDirectory(configPath) +
    "/windows-keyboard-for-mac-backups/" +
    timestamp() +
    "-" +
    reason;
  var backupPath = backupDirectory + "/karabiner.json";
  copyFile(configPath, backupPath);
  return backupPath;
}

function currentProfileName(config) {
  var selected = config.profiles.filter(function (profile) {
    return profile.selected === true;
  });
  return selected.length ? selected[0].name : null;
}

function validateInstalledProfile(profile, targets, inputSourceShortcut) {
  if (!profile || profile.name !== PROFILE_NAME) {
    throw new Error("Installed profile is missing.");
  }
  if (!Array.isArray(profile.devices) || profile.devices.length !== targets.length) {
    throw new Error("Installed profile does not contain every selected keyboard.");
  }
  profile.devices.forEach(function (device) {
    if (
      !Array.isArray(device.simple_modifications) ||
      device.simple_modifications.length !== 4
    ) {
      throw new Error("Modifier swap is incomplete for a target keyboard.");
    }
  });

  profile.complex_modifications.rules.forEach(function (currentRule) {
    currentRule.manipulators.forEach(function (currentManipulator) {
      var deviceConditions = (currentManipulator.conditions || []).filter(
        function (condition) {
          return condition.type === "device_if";
        }
      );
      if (
        deviceConditions.length !== 1 ||
        deviceConditions[0].identifiers.length !== targets.length
      ) {
        throw new Error("A complex rule is not isolated to the target keyboard.");
      }
    });
  });

  if (inputSourceShortcut) {
    var inputRules = [];
    profile.complex_modifications.rules.forEach(function (currentRule) {
      currentRule.manipulators.forEach(function (currentManipulator) {
        if (currentManipulator.description === INPUT_SOURCE_DESCRIPTION) {
          inputRules.push(currentManipulator);
        }
      });
    });
    if (
      inputRules.length !== 1 ||
      JSON.stringify(inputRules[0].to) !==
        JSON.stringify([shortcutEvent(inputSourceShortcut)])
    ) {
      throw new Error(
        "Installed Win+Space rule does not match the current macOS input-source shortcut."
      );
    }
  }
}

function install(options) {
  if (!fileExists(options.cli)) {
    throw new Error(
      "Karabiner-Elements is not installed. Install it from https://karabiner-elements.pqrs.org/ and approve the required macOS permissions first."
    );
  }

  var version = runTask(options.cli, ["--version"], false).stdout.trim();
  var majorVersion = Number(version.split(".")[0]);
  if (!isFinite(majorVersion) || majorVersion < MINIMUM_KARABINER_MAJOR) {
    throw new Error(
      "Karabiner-Elements " +
        MINIMUM_KARABINER_MAJOR +
        " or newer is required; found " +
        version
    );
  }
  var macosVersion = runTask(
    "/usr/bin/sw_vers",
    ["-productVersion"],
    false
  ).stdout.trim();
  var macosMajor = Number(macosVersion.split(".")[0]);
  if (!isFinite(macosMajor) || macosMajor < 15) {
    throw new Error("macOS 15 or newer is required; found " + macosVersion);
  }

  var candidates = listCandidateKeyboards(options.cli);
  var addedTargets = chooseTargets(options, candidates);
  var config = loadConfig(options.config);
  var existingBridge = config.profiles.filter(function (candidate) {
    return candidate.name === PROFILE_NAME;
  })[0];
  var targets = mergeTargetIdentifiers(
    profileTargetIdentifiers(existingBridge),
    addedTargets
  );
  verifyNoSystemLayerConflicts(targets, options.skipSystemChecks);
  var inputSourceShortcut = inputSourceShortcutForOptions(options);
  var profile = buildProfile(options.template, targets, inputSourceShortcut);
  validateInstalledProfile(profile, targets, inputSourceShortcut);

  var previousProfile = currentProfileName(config);
  var statePath = parentDirectory(options.config) + "/windows-keyboard-for-mac-state.json";
  if (previousProfile === PROFILE_NAME && fileExists(statePath)) {
    var previousState = readJson(statePath);
    previousProfile = previousState.previous_profile || previousProfile;
  }
  var nextProfiles = config.profiles.filter(function (existingProfile) {
    return existingProfile.name !== PROFILE_NAME;
  });
  if (!nextProfiles.length) {
    nextProfiles.push({
      name: "Default profile",
      selected: false,
      virtual_hid_keyboard: { keyboard_type_v2: "ansi" }
    });
    if (!previousProfile || previousProfile === PROFILE_NAME) {
      previousProfile = "Default profile";
    }
  }
  nextProfiles.forEach(function (existingProfile) {
    existingProfile.selected = false;
  });
  nextProfiles.push(profile);
  config.profiles = nextProfiles;

  var summary = {
    action: options.dryRun ? "dry-run" : "install",
    karabiner_version: version,
    macos_version: macosVersion,
    profile: PROFILE_NAME,
    previous_profile: previousProfile,
    added_keyboards: addedTargets.map(deviceKey),
    target_keyboards: targets.map(deviceKey),
    input_source_shortcut: inputSourceShortcut,
    rules: profile.complex_modifications.rules.length,
    manipulators: profile.complex_modifications.rules.reduce(function (
      count,
      currentRule
    ) {
      return count + currentRule.manipulators.length;
    },
    0)
  };

  if (options.dryRun) return summary;

  var configExisted = fileExists(options.config);
  var backupPath = backupConfig(options.config, "before-install");
  writeJson(options.config, config);

  var liveProfile;
  try {
    runTask(options.cli, ["--select-profile", PROFILE_NAME], false);
    liveProfile = runTask(
      options.cli,
      ["--show-current-profile-name"],
      false
    ).stdout.trim();
    var readback = loadConfig(options.config);
    var installed = readback.profiles.filter(function (candidate) {
      return candidate.name === PROFILE_NAME && candidate.selected === true;
    })[0];
    validateInstalledProfile(installed, targets, inputSourceShortcut);
    if (liveProfile !== PROFILE_NAME) {
      throw new Error(
        "Karabiner did not activate the new profile; live profile is " + liveProfile
      );
    }
  } catch (error) {
    if (backupPath) {
      writeTextAtomic(options.config, readText(backupPath));
    } else if (!configExisted) {
      removeFile(options.config);
    }
    if (previousProfile && previousProfile !== PROFILE_NAME) {
      runTask(options.cli, ["--select-profile", previousProfile], true);
    }
    throw new Error(
      error.message + " The pre-install configuration was restored automatically."
    );
  }

  writeJson(statePath, {
    schema_version: 1,
    installed_at: new Date().toISOString(),
    previous_profile: previousProfile,
    backup_path: backupPath,
    target_keyboards: targets.map(deviceKey)
  });

  summary.backup_path = backupPath;
  summary.live_profile = liveProfile;
  summary.verified = true;
  return summary;
}

function uninstall(options) {
  if (!fileExists(options.cli)) {
    throw new Error("Karabiner-Elements CLI was not found.");
  }
  var config = loadConfig(options.config);
  var installed = config.profiles.some(function (profile) {
    return profile.name === PROFILE_NAME;
  });
  if (!installed) {
    return {
      action: "uninstall",
      profile: PROFILE_NAME,
      changed: false,
      message: "Windows Keyboard for Mac is not installed."
    };
  }

  var statePath = parentDirectory(options.config) + "/windows-keyboard-for-mac-state.json";
  var state = fileExists(statePath) ? readJson(statePath) : {};
  var backupPath = backupConfig(options.config, "before-uninstall");
  var beforeUninstallText = readText(options.config);
  config.profiles = config.profiles.filter(function (profile) {
    return profile.name !== PROFILE_NAME;
  });
  if (!config.profiles.length) {
    throw new Error(
      "Cannot remove the only profile. Restore the pre-install backup instead."
    );
  }

  var selectedName = null;
  config.profiles.forEach(function (profile) {
    profile.selected = false;
  });
  var preferred = config.profiles.filter(function (profile) {
    return profile.name === state.previous_profile;
  })[0];
  var selected = preferred || config.profiles[0];
  selected.selected = true;
  selectedName = selected.name;

  if (options.dryRun) {
    return {
      action: "dry-run-uninstall",
      profile: PROFILE_NAME,
      restore_profile: selectedName
    };
  }

  writeJson(options.config, config);
  var liveProfile;
  try {
    runTask(options.cli, ["--select-profile", selectedName], false);
    liveProfile = runTask(
      options.cli,
      ["--show-current-profile-name"],
      false
    ).stdout.trim();
    if (liveProfile !== selectedName) {
      throw new Error("Karabiner did not restore profile " + selectedName);
    }
  } catch (error) {
    writeTextAtomic(options.config, beforeUninstallText);
    runTask(options.cli, ["--select-profile", PROFILE_NAME], true);
    throw new Error(
      error.message + " The pre-uninstall configuration was restored automatically."
    );
  }
  return {
    action: "uninstall",
    profile: PROFILE_NAME,
    changed: true,
    restore_profile: selectedName,
    backup_path: backupPath,
    live_profile: liveProfile,
    verified: true
  };
}

function doctor(options) {
  var report = {
    action: "doctor",
    cli_found: fileExists(options.cli),
    config_found: fileExists(options.config),
    profile: PROFILE_NAME,
    issues: []
  };
  if (!report.cli_found) {
    report.issues.push("Karabiner-Elements CLI is missing.");
    return report;
  }

  report.karabiner_version = runTask(
    options.cli,
    ["--version"],
    false
  ).stdout.trim();
  var karabinerMajorVersion = Number(
    report.karabiner_version.split(".")[0]
  );
  if (
    !isFinite(karabinerMajorVersion) ||
    karabinerMajorVersion < MINIMUM_KARABINER_MAJOR
  ) {
    report.issues.push(
      "Karabiner-Elements " +
        MINIMUM_KARABINER_MAJOR +
        " or newer is required; found " +
        report.karabiner_version +
        "."
    );
  }
  report.live_profile = runTask(
    options.cli,
    ["--show-current-profile-name"],
    false
  ).stdout.trim();
  var candidates = listCandidateKeyboards(options.cli);
  report.candidate_keyboards = candidates.map(function (candidate) {
    return candidate.label;
  });

  if (report.config_found) {
    var config = loadConfig(options.config);
    var bridge = config.profiles.filter(function (profile) {
      return profile.name === PROFILE_NAME;
    })[0];
    report.profile_installed = !!bridge;
    if (bridge) {
      report.profile_selected = bridge.selected === true;
      report.target_keyboards = (bridge.devices || []).map(function (device) {
        return deviceKey(device.identifiers);
      });
      report.macos_modifier_mapping_keys = [];
      (bridge.devices || []).forEach(function (device) {
        var identifier = device.identifiers;
        var key =
          "com.apple.keyboard.modifiermapping." +
          identifier.vendor_id +
          "-" +
          identifier.product_id +
          "-0";
        var mapping = runTask(
          "/usr/bin/defaults",
          ["-currentHost", "read", "-g", key],
          true
        );
        if (mapping.status === 0 && mapping.stdout.trim() !== "") {
          report.macos_modifier_mapping_keys.push(key);
          report.issues.push("macOS Modifier Keys mapping is active: " + key);
        }
      });
      try {
        var inputSourceShortcut = inputSourceShortcutForOptions(options);
        report.input_source_shortcut = inputSourceShortcut;
        validateInstalledProfile(
          bridge,
          (bridge.devices || []).map(function (device) {
            return device.identifiers;
          }),
          inputSourceShortcut
        );
        report.profile_structure_valid = true;
      } catch (error) {
        report.profile_structure_valid = false;
        report.issues.push(error.message);
      }
    }
  }

  var hidutil = runTask(
    "/usr/bin/hidutil",
    ["property", "--get", "UserKeyMapping"],
    true
  ).stdout.trim();
  report.hidutil_user_key_mapping = hidutil || "(empty)";
  if (
    hidutil !== "" &&
    hidutil !== "(null)" &&
    hidutil !== "null" &&
    hidutil !== "[]"
  ) {
    report.issues.push("hidutil UserKeyMapping is active.");
  }
  report.healthy = report.issues.length === 0;
  return report;
}

function present(result, options) {
  var text = JSON.stringify(result, null, 2);
  if (!options.nonInteractive && !options.dryRun) {
    app.displayDialog(text, {
      withTitle: "Windows Keyboard for Mac",
      buttons: ["OK"],
      defaultButton: "OK"
    });
  }
  return text;
}

function run(argv) {
  var options = parseOptions(argv);
  try {
    var result;
    if (options.action === "install") {
      result = install(options);
    } else if (options.action === "uninstall") {
      result = uninstall(options);
    } else if (options.action === "doctor") {
      result = doctor(options);
    } else {
      throw new Error("Action must be install, uninstall, or doctor.");
    }
    return present(result, options);
  } catch (error) {
    if (!options.nonInteractive) {
      app.displayDialog(error.message, {
        withTitle: "Windows Keyboard for Mac — Cannot Continue",
        buttons: ["OK"],
        defaultButton: "OK",
        withIcon: "stop"
      });
    }
    throw error;
  }
}
