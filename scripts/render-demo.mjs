import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const run = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = path.join(root, "docs", "assets");
const gifPath = path.join(outputDirectory, "windows-keyboard-for-mac-demo.gif");
const videoPath = path.join(outputDirectory, "windows-keyboard-for-mac-demo.mp4");
const width = 1200;
const height = 675;

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function text(x, y, value, size, options = {}) {
  const {
    fill = "#f8fafc",
    weight = 500,
    anchor = "start",
    letterSpacing = 0,
    opacity = 1
  } = options;
  return `<text x="${x}" y="${y}" fill="${fill}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="${size}" font-weight="${weight}" text-anchor="${anchor}" letter-spacing="${letterSpacing}" opacity="${opacity}">${escapeXml(value)}</text>`;
}

function keycap(x, y, label, options = {}) {
  const { width: keyWidth = 96, accent = false, small = false } = options;
  const keyHeight = small ? 48 : 66;
  const fill = accent ? "url(#keyAccent)" : "url(#keyNeutral)";
  const stroke = accent ? "#60a5fa" : "#475569";
  return `
    <g filter="url(#shadow)">
      <rect x="${x}" y="${y}" width="${keyWidth}" height="${keyHeight}" rx="${small ? 12 : 15}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>
      <path d="M ${x + 10} ${y + keyHeight - 9} H ${x + keyWidth - 10}" stroke="${accent ? "#1d4ed8" : "#1e293b"}" stroke-width="3" stroke-linecap="round" opacity="0.75"/>
      ${text(x + keyWidth / 2, y + keyHeight / 2 + (small ? 7 : 8), label, small ? 18 : 23, { weight: 700, anchor: "middle" })}
    </g>`;
}

function appCard(x, y, cardWidth, title, result, color = "#3b82f6") {
  return `
    <g>
      <rect x="${x}" y="${y}" width="${cardWidth}" height="104" rx="20" fill="#101b31" stroke="#263854" stroke-width="2"/>
      <rect x="${x}" y="${y}" width="7" height="104" rx="4" fill="${color}"/>
      ${text(x + 30, y + 38, title, 19, { fill: "#cbd5e1", weight: 650 })}
      ${text(x + 30, y + 74, result, 25, { weight: 750 })}
    </g>`;
}

function arrow(x, y, length = 90) {
  return `<g stroke="#60a5fa" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M ${x} ${y} H ${x + length}"/><path d="M ${x + length - 13} ${y - 11} L ${x + length} ${y} L ${x + length - 13} ${y + 11}"/></g>`;
}

function progress(sceneIndex, sceneCount) {
  return Array.from({ length: sceneCount }, (_, index) => {
    const active = index === sceneIndex;
    return `<rect x="${527 + index * 27}" y="626" width="${active ? 20 : 8}" height="8" rx="4" fill="${active ? "#60a5fa" : "#334155"}"/>`;
  }).join("");
}

function frame(sceneIndex, sceneCount, content) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="background" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#07101f"/>
      <stop offset="0.58" stop-color="#0b1730"/>
      <stop offset="1" stop-color="#111b31"/>
    </linearGradient>
    <linearGradient id="keyAccent" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#2563eb"/>
      <stop offset="1" stop-color="#1e40af"/>
    </linearGradient>
    <linearGradient id="keyNeutral" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#26354d"/>
      <stop offset="1" stop-color="#162238"/>
    </linearGradient>
    <filter id="shadow" x="-30%" y="-30%" width="160%" height="170%">
      <feDropShadow dx="0" dy="8" stdDeviation="8" flood-color="#020617" flood-opacity="0.55"/>
    </filter>
    <radialGradient id="glow">
      <stop offset="0" stop-color="#2563eb" stop-opacity="0.22"/>
      <stop offset="1" stop-color="#2563eb" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="675" fill="url(#background)"/>
  <circle cx="1030" cy="110" r="300" fill="url(#glow)"/>
  <circle cx="150" cy="640" r="260" fill="url(#glow)" opacity="0.55"/>
  <rect x="31" y="26" width="1138" height="603" rx="30" fill="none" stroke="#20304a" stroke-width="2"/>
  ${text(64, 72, "WINDOWS KEYBOARD FOR MAC", 20, { fill: "#93c5fd", weight: 800, letterSpacing: 2.2 })}
  ${text(1136, 72, "SHORTCUT WALKTHROUGH", 15, { fill: "#64748b", weight: 700, anchor: "end", letterSpacing: 1.4 })}
  ${content}
  ${text(64, 606, "Physical keys shown · Selected Windows keyboards only", 15, { fill: "#64748b", weight: 550 })}
  ${progress(sceneIndex, sceneCount)}
</svg>`;
}

function scenes() {
  const sceneOne = `
    ${text(64, 164, "Windows muscle memory.", 51, { weight: 800 })}
    ${text(64, 222, "On your Mac.", 51, { fill: "#60a5fa", weight: 800 })}
    ${text(66, 274, "Familiar shortcuts on the keyboards you choose—", 23, { fill: "#cbd5e1", weight: 500 })}
    ${text(66, 307, "without changing the built-in Apple keyboard.", 23, { fill: "#cbd5e1", weight: 500 })}
    ${keycap(66, 365, "Ctrl", { accent: true })}
    ${keycap(178, 365, "Win")}
    ${keycap(290, 365, "Alt", { accent: true })}
    ${keycap(402, 365, "F4")}
    ${arrow(526, 398, 100)}
    <g filter="url(#shadow)">
      <rect x="662" y="339" width="438" height="156" rx="25" fill="#101b31" stroke="#2f4770" stroke-width="2"/>
      ${text(696, 386, "Familiar behavior", 20, { fill: "#93c5fd", weight: 700 })}
      ${text(696, 429, "Device-scoped · reversible", 27, { weight: 750 })}
      ${text(696, 465, "Free · open source · no telemetry", 18, { fill: "#94a3b8", weight: 550 })}
    </g>`;

  const sceneTwo = `
    ${text(64, 145, "The everyday shortcuts stay familiar", 38, { weight: 800 })}
    ${keycap(78, 205, "Ctrl", { accent: true })}${keycap(188, 205, "C")}${arrow(307, 238, 95)}
    ${text(438, 231, "Copy", 25, { weight: 750 })}${text(438, 261, "macOS Command+C", 17, { fill: "#94a3b8" })}
    ${keycap(78, 310, "Ctrl", { accent: true })}${keycap(188, 310, "V")}${arrow(307, 343, 95)}
    ${text(438, 336, "Paste", 25, { weight: 750 })}${text(438, 366, "macOS Command+V", 17, { fill: "#94a3b8" })}
    ${keycap(78, 415, "Win", { accent: true })}${keycap(188, 415, "Space", { width: 118 })}${arrow(325, 448, 77)}
    ${text(438, 441, "Switch input source", 25, { weight: 750 })}${text(438, 471, "Uses this Mac's input-source shortcut", 17, { fill: "#94a3b8" })}
    <g>
      <rect x="720" y="202" width="390" height="282" rx="26" fill="#101b31" stroke="#263854" stroke-width="2"/>
      ${text(754, 250, "DEVICE ISOLATION", 16, { fill: "#60a5fa", weight: 800, letterSpacing: 1.8 })}
      ${text(754, 306, "External Windows keyboard", 22, { weight: 700 })}
      <rect x="754" y="330" width="322" height="52" rx="15" fill="#102d57" stroke="#2563eb" stroke-width="2"/>
      ${text(915, 363, "Windows mode: ON", 18, { weight: 750, anchor: "middle" })}
      ${text(754, 426, "Built-in Apple keyboard", 22, { weight: 700 })}
      ${text(754, 459, "Unchanged", 18, { fill: "#94a3b8", weight: 600 })}
    </g>`;

  const sceneThree = `
    ${text(64, 145, "Alt+F4 closes the window—not the whole app", 38, { weight: 800 })}
    ${keycap(66, 202, "Alt", { accent: true, width: 112 })}
    ${text(196, 245, "+", 30, { fill: "#64748b", weight: 700 })}
    ${keycap(232, 202, "F4", { accent: true, width: 112 })}
    ${arrow(377, 235, 90)}
    ${text(500, 229, "Windows-style top-level window close", 24, { fill: "#bfdbfe", weight: 700 })}
    ${appCard(66, 326, 328, "Chrome · Edge · Safari · Firefox", "Close browser window", "#3b82f6")}
    ${appCard(416, 326, 328, "Finder", "Close front Finder window", "#8b5cf6")}
    ${appCard(766, 326, 328, "Other macOS apps", "Close active window", "#14b8a6")}
    ${text(66, 473, "Ctrl+F4 remains separate", 21, { fill: "#f8fafc", weight: 700 })}
    ${text(66, 506, "It closes the active document or tab, matching the Windows distinction.", 19, { fill: "#94a3b8", weight: 500 })}`;

  const sceneFour = `
    ${text(64, 145, "Finder behaves more like Windows Explorer", 38, { weight: 800 })}
    ${appCard(64, 196, 510, "F2", "Rename the selected item", "#3b82f6")}
    ${appCard(64, 318, 510, "Backspace", "Navigate back", "#8b5cf6")}
    ${appCard(64, 440, 510, "Delete", "Move the selected item to Trash", "#14b8a6")}
    <g filter="url(#shadow)">
      <rect x="636" y="196" width="474" height="348" rx="26" fill="#eef2f7"/>
      <rect x="636" y="196" width="474" height="54" rx="26" fill="#dbe4ef"/>
      <circle cx="670" cy="223" r="7" fill="#fb7185"/><circle cx="693" cy="223" r="7" fill="#fbbf24"/><circle cx="716" cy="223" r="7" fill="#4ade80"/>
      ${text(873, 229, "Finder", 17, { fill: "#334155", weight: 700, anchor: "middle" })}
      <rect x="670" y="282" width="90" height="72" rx="12" fill="#60a5fa" opacity="0.95"/>
      <path d="M 670 302 H 760 V 354 H 670 Z" fill="#3b82f6"/>
      ${text(715, 384, "Project", 16, { fill: "#334155", weight: 650, anchor: "middle" })}
      <rect x="800" y="282" width="90" height="72" rx="12" fill="#93c5fd"/>
      <path d="M 800 302 H 890 V 354 H 800 Z" fill="#60a5fa"/>
      ${text(845, 384, "Archive", 16, { fill: "#334155", weight: 650, anchor: "middle" })}
      <rect x="930" y="282" width="90" height="72" rx="12" fill="#bfdbfe"/>
      <path d="M 930 302 H 1020 V 354 H 930 Z" fill="#93c5fd"/>
      ${text(975, 384, "Notes", 16, { fill: "#334155", weight: 650, anchor: "middle" })}
      <rect x="674" y="434" width="398" height="66" rx="14" fill="#ffffff" stroke="#60a5fa" stroke-width="3"/>
      ${text(700, 476, "Project", 21, { fill: "#0f172a", weight: 650 })}
      <path d="M 769 451 V 483" stroke="#2563eb" stroke-width="2"/>
    </g>
    ${text(636, 574, "Text fields keep normal editing behavior.", 18, { fill: "#94a3b8", weight: 550 })}`;

  const functionKeys = Array.from({ length: 12 }, (_, index) =>
    keycap(64 + index * 86, 190, `F${index + 1}`, { width: 68, small: true, accent: index === 1 || index === 4 })
  ).join("");
  const sceneFive = `
    ${text(64, 145, "Real function keys. Real terminal control.", 38, { weight: 800 })}
    ${functionKeys}
    ${text(64, 286, "F1–F12 stay standard when macOS media-key mode is enabled.", 20, { fill: "#cbd5e1", weight: 550 })}
    <g filter="url(#shadow)">
      <rect x="64" y="334" width="660" height="208" rx="22" fill="#050b14" stroke="#263854" stroke-width="2"/>
      <circle cx="94" cy="363" r="6" fill="#fb7185"/><circle cx="115" cy="363" r="6" fill="#fbbf24"/><circle cx="136" cy="363" r="6" fill="#4ade80"/>
      ${text(96, 414, "$ sleep 30", 22, { fill: "#d1fae5", weight: 600 })}
      ${text(96, 455, "Ctrl+C", 22, { fill: "#93c5fd", weight: 750 })}
      ${text(211, 455, "→", 22, { fill: "#64748b", weight: 700 })}
      ${text(250, 455, "^C  interrupt", 22, { fill: "#f8fafc", weight: 650 })}
      ${text(96, 500, "Ctrl+Shift+C", 22, { fill: "#93c5fd", weight: 750 })}
      ${text(267, 500, "→", 22, { fill: "#64748b", weight: 700 })}
      ${text(306, 500, "Copy", 22, { fill: "#f8fafc", weight: 650 })}
    </g>
    <g>
      <rect x="766" y="334" width="344" height="208" rx="22" fill="#101b31" stroke="#263854" stroke-width="2"/>
      ${text(800, 382, "PRIORITY RULES", 16, { fill: "#60a5fa", weight: 800, letterSpacing: 1.6 })}
      ${text(800, 430, "Finder F2", 22, { weight: 700 })}${text(1028, 430, "Rename", 18, { fill: "#94a3b8", anchor: "end" })}
      ${text(800, 472, "Browser F5", 22, { weight: 700 })}${text(1028, 472, "Reload", 18, { fill: "#94a3b8", anchor: "end" })}
      ${text(800, 514, "Alt+F4", 22, { weight: 700 })}${text(1028, 514, "Close window", 18, { fill: "#94a3b8", anchor: "end" })}
    </g>`;

  const sceneSix = `
    ${text(64, 145, "Built to be reversible", 40, { weight: 800 })}
    ${appCard(64, 196, 500, "BACKUP", "Preserve the existing configuration", "#3b82f6")}
    ${appCard(64, 318, 500, "DOCTOR", "Verify the live profile and conflicts", "#8b5cf6")}
    ${appCard(586, 196, 524, "UNINSTALL", "Restore the previous Karabiner profile", "#14b8a6")}
    ${appCard(586, 318, 524, "PRIVACY", "No telemetry · no account · MIT licensed", "#f59e0b")}
    ${text(600, 497, "github.com/Fuzzy-and-Fluffy/", 23, { fill: "#93c5fd", weight: 650, anchor: "middle" })}
    ${text(600, 532, "windows-keyboard-for-mac", 31, { weight: 800, anchor: "middle" })}
    ${text(600, 570, "macOS 15+  ·  Karabiner-Elements 16+", 18, { fill: "#94a3b8", weight: 600, anchor: "middle" })}`;

  const content = [sceneOne, sceneTwo, sceneThree, sceneFour, sceneFive, sceneSix];
  return content.map((scene, index) => frame(index, content.length, scene));
}

async function locateFfmpeg() {
  const { stdout } = await run("/usr/bin/which", ["ffmpeg"]);
  const executable = stdout.trim();
  if (!executable) throw new Error("ffmpeg is required to render the demo.");
  return executable;
}

async function main() {
  const ffmpeg = await locateFfmpeg();
  const temporaryDirectory = await fs.mkdtemp(
    path.join(os.tmpdir(), "windows-keyboard-for-mac-demo-")
  );
  const sceneSvgs = scenes();
  const sequence = [0, 0, 1, 2, 3, 4, 5, 5];

  try {
    await fs.mkdir(outputDirectory, { recursive: true });
    for (let index = 0; index < sequence.length; index += 1) {
      const frameName = `frame-${String(index).padStart(2, "0")}`;
      const svgPath = path.join(temporaryDirectory, `${frameName}.svg`);
      const pngPath = path.join(temporaryDirectory, `${frameName}.png`);
      await fs.writeFile(svgPath, sceneSvgs[sequence[index]], "utf8");
      await run("/usr/bin/sips", [
        "-s",
        "format",
        "png",
        svgPath,
        "--out",
        pngPath
      ]);
    }

    const inputPattern = path.join(temporaryDirectory, "frame-%02d.png");
    await run(ffmpeg, [
      "-y",
      "-hide_banner",
      "-loglevel",
      "error",
      "-framerate",
      "1/2",
      "-i",
      inputPattern,
      "-filter_complex",
      "[0:v]fps=10,scale=1200:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128:stats_mode=diff[p];[s1][p]paletteuse=dither=bayer:bayer_scale=3",
      "-loop",
      "0",
      gifPath
    ]);
    await run(ffmpeg, [
      "-y",
      "-hide_banner",
      "-loglevel",
      "error",
      "-framerate",
      "1/2",
      "-i",
      inputPattern,
      "-vf",
      "fps=30,pad=ceil(iw/2)*2:ceil(ih/2)*2:color=#07101f,format=yuv420p",
      "-c:v",
      "libx264",
      "-crf",
      "22",
      "-preset",
      "medium",
      "-movflags",
      "+faststart",
      videoPath
    ]);
  } finally {
    await fs.rm(temporaryDirectory, { recursive: true, force: true });
  }

  console.log(gifPath);
  console.log(videoPath);
}

await main();
