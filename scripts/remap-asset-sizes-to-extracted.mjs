import fs from 'fs'
function usage() {
  console.error(
    'usage: node remap-asset-sizes-to-extracted.mjs <full.json> <extracted.json> <asset-sizes.json> <out.json>',
  )
  process.exit(2)
}
const [fullPath, extractedPath, assetsPath, outPath] = process.argv.slice(2)
if (!fullPath || !extractedPath || !assetsPath || !outPath) usage()
if (
  !fs.existsSync(fullPath) ||
  !fs.existsSync(extractedPath) ||
  !fs.existsSync(assetsPath)
) {
  console.error('file not found')
  process.exit(3)
}
const full = JSON.parse(fs.readFileSync(fullPath, 'utf8'))
const extracted = JSON.parse(fs.readFileSync(extractedPath, 'utf8'))
const assets = JSON.parse(fs.readFileSync(assetsPath, 'utf8'))
// Prefer authoritative mapping from full.nodeMetas[moduleUid].moduleParts
// We'll aggregate sizes across all moduleParts for a uid when possible.
const uidToAsset = {}
if (full.nodeMetas && typeof full.nodeMetas === 'object') {
  for (const [metaUid, meta] of Object.entries(full.nodeMetas)) {
    if (meta && meta.moduleParts && typeof meta.moduleParts === 'object') {
      const parts = Object.keys(meta.moduleParts)
      if (parts.length) {
        // aggregate sizes from all parts that exist in assets
        let agg = { raw: 0, gzip: 0, brotli: 0 }
        let found = false
        for (const p of parts) {
          // normalize to asset key used in assets JSON
          const key = ('dist/spa/' + p)
            .replace(/\\\\/g, '/')
            .replace(/^dist\/spa\//, 'dist/spa/')
          const info = assets[key]
          if (info) {
            agg.raw += info.raw || info.rawLength || 0
            agg.gzip += info.gzip || info.gzipLength || 0
            agg.brotli += info.brotli || info.brotliLength || 0
            found = true
          }
        }
        if (found) {
          uidToAsset[metaUid] = { parts, sizes: agg }
        } else {
          // fallback: still keep parts list so caller can try direct lookup later
          uidToAsset[metaUid] = { parts }
        }
      }
    }
  }
} else {
  // fallback: traverse tree looking for asset parent names
  function walk(node, currentAsset) {
    if (!node) return
    if (
      node.name &&
      (node.name.startsWith('assets/') ||
        node.name.startsWith('assets\\') ||
        node.name.match(/^assets\//))
    ) {
      currentAsset = node.name.replace(/^\\/, '')
    }
    if (node.uid) {
      if (currentAsset) uidToAsset[node.uid] = { parts: [currentAsset] }
    }
    if (node.children && Array.isArray(node.children)) {
      for (const c of node.children) walk(c, currentAsset)
    }
  }
  if (full.tree) walk(full.tree)
  else if (full.children) for (const c of full.children) walk(c)
}
// merge into extracted
const nodes = extracted.nodes || []
let mapped = 0
for (const n of nodes) {
  const mapping = uidToAsset[n.uid]
  if (!mapping) continue
  // If aggregated sizes were precomputed, use them directly
  if (mapping.sizes) {
    const s = mapping.sizes
    n.gzipLength = s.gzip || n.gzipLength || 0
    n.brotliLength = s.brotli || n.brotliLength || 0
    n.renderedLength = s.raw || n.renderedLength || 0
    mapped++
    continue
  }
  // Otherwise try to resolve parts list and sum available asset sizes
  const parts = Array.isArray(mapping.parts)
    ? mapping.parts
    : typeof mapping === 'string'
      ? [mapping]
      : []
  if (!parts.length) continue
  let agg = { raw: 0, gzip: 0, brotli: 0 }
  let found = false
  for (const p of parts) {
    const key = ('dist/spa/' + p)
      .replace(/\\\\/g, '/')
      .replace(/^dist\/spa\//, 'dist/spa/')
    const info = assets[key]
    if (info) {
      agg.raw += info.raw || info.rawLength || 0
      agg.gzip += info.gzip || info.gzipLength || 0
      agg.brotli += info.brotli || info.brotliLength || 0
      found = true
    }
  }
  if (found) {
    n.gzipLength = agg.gzip || n.gzipLength || 0
    n.brotliLength = agg.brotli || n.brotliLength || 0
    n.renderedLength = agg.raw || n.renderedLength || 0
    mapped++
  }
}
fs.writeFileSync(outPath, JSON.stringify(extracted, null, 2))
console.log('Wrote', outPath, 'mapped:', mapped)
