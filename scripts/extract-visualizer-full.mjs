import fs from "fs";
const inPath = process.argv[2];
if (!inPath) {
  console.error("usage: node extract-visualizer-full.mjs <path>");
  process.exit(2);
}
if (!fs.existsSync(inPath)) {
  console.error("not found", inPath);
  process.exit(3);
}
const s = fs.readFileSync(inPath, "utf8");
const envMarker = '"env":{"rollup"';
const envIndex = s.indexOf(envMarker);
if (envIndex === -1) {
  console.error("env marker not found");
  process.exit(4);
}
let assignIndex = -1;
const keys = ["var data =", "window.__ROLLUP_VISUALIZER_DATA__ =", "data ="];
for (const k of keys) {
  const li = s.lastIndexOf(k, envIndex);
  if (li !== -1 && li > assignIndex) assignIndex = li;
}
if (assignIndex === -1) {
  console.error("data assignment not found before env marker");
  process.exit(5);
}
let idx =
  assignIndex + (s.slice(assignIndex, assignIndex + 50).indexOf("=") + 1);
idx = s.indexOf("{", idx);
if (idx === -1) {
  console.error("object start not found");
  process.exit(6);
}
let i = idx;
let depth = 0;
let inSingle = false;
let inDouble = false;
let inTemplate = false;
let escaped = false;
for (; i < s.length; i++) {
  const ch = s[i];
  if (escaped) {
    escaped = false;
    continue;
  }
  if (ch === "\\") {
    escaped = true;
    continue;
  }
  if (inSingle) {
    if (ch === "'") inSingle = false;
    continue;
  }
  if (inDouble) {
    if (ch === '"') inDouble = false;
    continue;
  }
  if (inTemplate) {
    if (ch === "`") inTemplate = false;
    continue;
  }
  if (ch === "'") {
    inSingle = true;
    continue;
  }
  if (ch === '"') {
    inDouble = true;
    continue;
  }
  if (ch === "`") {
    inTemplate = true;
    continue;
  }
  if (ch === "{") {
    depth++;
  } else if (ch === "}") {
    depth--;
    if (depth === 0) {
      i++;
      break;
    }
  }
}
const objStr = s.slice(idx, i).trim();
let data;
try {
  data = JSON.parse(objStr);
} catch (e) {
  try {
    data = (0, eval)("(" + objStr + ")");
  } catch (e2) {
    console.error("parse failed", e.message, e2 && e2.message);
    process.exit(7);
  }
}
const outFile = inPath.replace(/\.html$/, "") + ".full.json";
fs.writeFileSync(outFile, JSON.stringify(data, null, 2));
console.log("Wrote", outFile);
