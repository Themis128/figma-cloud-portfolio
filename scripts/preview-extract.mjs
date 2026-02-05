import fs from "fs";
const s = fs.readFileSync("dist/stats.html", "utf8");
// try to locate the large data object by finding the env marker and then the nearest data= before it
const envMarker = '"env":{"rollup"';
const envIndex = s.indexOf(envMarker);
if (envIndex === -1) {
  console.error("env marker not found");
  process.exit(1);
}
// look backwards for an assignment like 'data =' or 'var data =' before envIndex
let assignIndex = -1;
const keys = ["var data =", "window.__ROLLUP_VISUALIZER_DATA__ =", "data ="];
for (const k of keys) {
  const li = s.lastIndexOf(k, envIndex);
  if (li !== -1 && li > assignIndex) assignIndex = li;
}
if (assignIndex === -1) {
  console.error("data assignment not found before env marker");
  process.exit(2);
}
let idx =
  assignIndex + (s.slice(assignIndex, assignIndex + 50).indexOf("=") + 1);
// find first '{' after the assignment
idx = s.indexOf("{", idx);
if (idx === -1) {
  console.error("object start not found");
  process.exit(3);
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
const objStr = s.slice(idx, i);
console.log("--- preview (800 chars) ---");
console.log(objStr.slice(0, 800).replace(/[\n\r]+/g, " "));
console.log("--- end preview ---");
