// Previews of the hand-drawn pixel heads (hooks/sprite/ninja/<id>.ts's head):
//   node scripts/pixelheads.mjs --sheet [ids]     every head, zoomed (env OUT names the file in .preview/)
//   node scripts/pixelheads.mjs --context [ids]   each head on its body, zoomed and near real size
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { writePng } from './png.mjs'

// the mod's root, as a path for the files written and a URL for the modules
// loaded (a path with a space or a drive letter is no URL path)
const base = new URL('..', import.meta.url)
const root = fileURLToPath(base)
const load = (path) => import(new URL(path, base).href)
const { NINJA } = await load('hooks/roster.ts')
const { NATIVE } = await load('hooks/sprite/index.ts')
const HEADS = Object.fromEntries(Object.entries(NATIVE).map(([id, n]) => [id, n.head]))

const args = process.argv.slice(2)
const sheet = args.includes('--sheet')
const ids = (args.find(a => !a.startsWith('--')) ?? NINJA.map(n => n.id).join(',')).split(',')
mkdirSync(root + '.preview', { recursive: true })

// every head is drawn on the same grid
const W = Math.max(...Object.values(HEADS).flatMap(h => h.rows.map(r => r.length)))
const H = Math.max(...Object.values(HEADS).map(h => h.rows.length))

if (sheet) {
  const Z = 12
  const heads = ids.map(id => HEADS[id]).filter(Boolean)
  const TW = W * Z + 16
  const img = new Int32Array(TW * heads.length * (H * Z + 16)).fill(0x1e1f22)
  const IW = TW * heads.length
  heads.forEach((h, i) =>
    h.rows.forEach((row, y) =>
      [...row].forEach((ch, x) => {
        const c = h.palette[ch] ?? h.palette[ch.toLowerCase()]
        if (ch === '.' || c == null) return
        for (let yy = 0; yy < Z; yy++) for (let xx = 0; xx < Z; xx++) img[(8 + y * Z + yy) * IW + i * TW + 8 + x * Z + xx] = c
      }),
    ),
  )
  const out = process.env.OUT ?? 'heads.png'
  writePng(root + '.preview/' + out, IW, H * Z + 16, img, 1)
  console.log('.preview/' + out)
}

// --context: each ninja as the terminal draws it (the renderer's own sprite):
// zoomed (top) and about as small as a terminal shows it (bottom)
if (args.includes('--context')) {
  const { sprite, SPRITE } = await load('hooks/art/pixel.ts')
  const { byId } = await load('hooks/roster.ts')
  const pose = process.env.POSE ?? 'idle'
  const SW = SPRITE.columns
  const SH = SPRITE.rows * 2
  const Z = 8
  const TW = SW * Z + 24
  const IW = TW * ids.length
  const IH = SH * Z + 16 + SH * 3 + 24
  const img = new Int32Array(IW * IH).fill(0x1e1f22)
  ids.forEach((id, i) => {
    const st = { id, face: { blink: 0, gaze: [0, 0], mood: process.env.MOOD ?? 'calm', active: process.env.ACTIVE === '1' }, pose, aura: 0, effect: null, badge: null, tick: 0, clones: 0, bob: 0, move: null }
    const g = sprite(st, byId(id).glow, SW, SH)
    for (let y = 0; y < SH; y++)
      for (let x = 0; x < SW; x++) {
        const c = g[y * SW + x]
        if (c < 0) continue
        for (let yy = 0; yy < Z; yy++) for (let xx = 0; xx < Z; xx++) img[(8 + y * Z + yy) * IW + i * TW + 12 + x * Z + xx] = c
        for (let yy = 0; yy < 3; yy++) for (let xx = 0; xx < 3; xx++) img[(SH * Z + 24 + y * 3 + yy) * IW + i * TW + 12 + x * 3 + xx] = c
      }
  })
  const out = process.env.OUT ?? 'heads-context.png'
  writePng(root + '.preview/' + out, IW, IH, img, 1)
  console.log('.preview/' + out)
}
