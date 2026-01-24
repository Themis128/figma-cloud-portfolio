import fs from 'fs'
const path = 'dist/stats.html'
if (!fs.existsSync(path)) {
  console.error('dist/stats.html not found')
  process.exit(1)
}
const s = fs.readFileSync(path, 'utf8')
const m = s.match(/data\.nodeMetas\s*=\s*(\{[\s\S]*?\})\s*;/m)
if (!m) {
  console.error('nodeMetas not found')
  process.exit(2)
}
const metas = JSON.parse(m[1])
const arr = Object.entries(metas).map(([uid, v]) => ({
  uid,
  id: v.id || v.moduleId || '',
  rendered: v.renderedLength || 0,
  gzip: v.gzipLength || 0,
  brotli: v.brotliLength || 0,
}))
arr.sort((a, b) => b.rendered - a.rendered)
console.log('\nTop 30 modules in current dist/stats.html (rendered bytes):')
console.table(arr.slice(0, 30))
const find = (pat) =>
  arr.filter((x) => x.id.includes(pat) || x.uid.includes(pat))
console.log('\nMatches for "framer":')
console.table(find('framer'))
console.log('\nMatches for "lucide":')
console.table(find('lucide'))
fs.writeFileSync(
  'dist/stats-current-top.json',
  JSON.stringify(arr.slice(0, 200), null, 2),
)
console.log('\nWrote dist/stats-current-top.json')
