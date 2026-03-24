#!/usr/bin/env node
/**
 * Pre-compress PNG/JPG images to WebP and AVIF for production builds.
 * Skips files that already have optimized variants.
 * Run: node scripts/optimize-images.mjs
 */
import { readdirSync, existsSync } from "fs";
import { join, parse } from "path";
import sharp from "sharp";

const DIRS = ["public", "public/projects"];
const EXTENSIONS = [".png", ".jpg", ".jpeg"];
const WEBP_QUALITY = 80;
const AVIF_QUALITY = 65;

let converted = 0;
let skipped = 0;

for (const dir of DIRS) {
  if (!existsSync(dir)) continue;

  const files = readdirSync(dir).filter((f) =>
    EXTENSIONS.includes(parse(f).ext.toLowerCase()),
  );

  for (const file of files) {
    const { name } = parse(file);
    const src = join(dir, file);
    const webpPath = join(dir, `${name}.webp`);
    const avifPath = join(dir, `${name}.avif`);

    // WebP
    if (!existsSync(webpPath)) {
      await sharp(src).webp({ quality: WEBP_QUALITY }).toFile(webpPath);
      console.log(`  ✓ ${webpPath}`);
      converted++;
    } else {
      skipped++;
    }

    // AVIF
    if (!existsSync(avifPath)) {
      await sharp(src).avif({ quality: AVIF_QUALITY }).toFile(avifPath);
      console.log(`  ✓ ${avifPath}`);
      converted++;
    } else {
      skipped++;
    }
  }
}

console.log(
  `\nDone: ${converted} images converted, ${skipped} already exist.`,
);
