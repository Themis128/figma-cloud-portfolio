import fs from "fs";
const aPath = process.argv[2] || "dist/stats-before.extracted.json";
const bPath = process.argv[3] || "dist/stats.extracted.json";
const outPath = process.argv[4] || "dist/stats-delta.json";
const a = JSON.parse(fs.readFileSync(aPath, "utf8"));
const b = JSON.parse(fs.readFileSync(bPath, "utf8"));
const mapA = new Map(a.nodes.map((x) => [x.id || x.uid, x]));
const mapB = new Map(b.nodes.map((x) => [x.id || x.uid, x]));
const keys = new Set([...mapA.keys(), ...mapB.keys()]);
const diffs = [];
// choose best available metric per-node: prefer gzipLength, then brotliLength, then renderedLength
function pickSize(meta) {
  if (!meta) return 0;
  if (meta.gzipLength && meta.gzipLength > 0) return meta.gzipLength;
  if (meta.brotliLength && meta.brotliLength > 0) return meta.brotliLength;
  return meta.renderedLength || 0;
}
for (const k of keys) {
  const A = mapA.get(k) || {};
  const B = mapB.get(k) || {};
  const before = pickSize(A);
  const after = pickSize(B);
  diffs.push({ id: k, before, after, delta: before - after });
}
diffs.sort((x, y) => Math.abs(y.delta) - Math.abs(x.delta));
const top = diffs.slice(0, 40);
console.log("id\tbefore\tafter\tdelta");
for (const d of top)
  console.log(`${d.id}\t${d.before}\t${d.after}\t${d.delta}`);
fs.writeFileSync(outPath, JSON.stringify({ top }, null, 2));
console.log("Wrote", outPath);
