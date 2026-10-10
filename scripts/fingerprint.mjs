// Prints tests/fingerprint.ts's FINGERPRINTS table for the art as it is now,
// to paste over the old one after a deliberate change to a ninja's art:
//   node scripts/fingerprint.mjs [ids]
const base = new URL('..', import.meta.url)
const load = path => import(new URL(path, base).href)
const { NINJA } = await load('hooks/roster.ts')
const { PARTS, fingerprintOf } = await load('tests/fingerprint.ts')
const ids = process.argv[2] ? process.argv[2].split(',') : NINJA.map(n => n.id)
for (const id of ids) console.log(`  ${id}: { ${PARTS.map(([part, index]) => `${part}: '${fingerprintOf(id, index)}'`).join(', ')} },`)
