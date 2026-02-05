import fsPromises from "fs/promises";
import path from "path";
import { brotliCompressSync, gzipSync } from "zlib";

const dir = process.argv[2] || "dist/spa/assets";
const out = process.argv[3] || "dist/asset-compressed-sizes.json";

async function walk(dirPath) {
  const entries = await fsPromises.readdir(dirPath, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const p = path.join(dirPath, e.name);
    if (e.isDirectory()) files.push(...(await walk(p)));
    else files.push(p);
  }
  return files;
}

async function gzipSize(file) {
  const buf = await fsPromises.readFile(file);
  const gz = gzipSync(buf);
  return gz.length;
}

async function brotliSize(file) {
  const buf = await fsPromises.readFile(file);
  const br = brotliCompressSync(buf);
  return br.length;
}

async function main() {
  const files = await walk(dir);
  const sizes = {};
  for (const f of files) {
    const rel = path.relative(process.cwd(), f).replace(/\\/g, "/");
    try {
      const gz = await gzipSize(f);
      const br = await brotliSize(f);
      const st = await fsPromises.stat(f);
      sizes[rel] = { raw: st.size, gzip: gz, brotli: br };
      console.log(rel, "->", sizes[rel]);
    } catch (err) {
      console.error("skip", rel, err && err.message);
    }
  }
  await fsPromises.writeFile(out, JSON.stringify(sizes, null, 2));
  console.log("Wrote", out);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
