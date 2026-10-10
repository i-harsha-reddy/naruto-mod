// Renders the terminal's pixel-art ninja the way a terminal shows it: half-block
// cells, two pixels a cell.
//   node scripts/pixels.mjs <ids> [poses] [cols]x[rows]          still poses (default: the sprite's size)
//   node scripts/pixels.mjs <id> move:<index> [cols]x[rows]       a move, 0.2 s a frame: 0-2 the
//     jutsu, 3 the quick strike, -1 the arrival, -2 the fizzle, -3 the cheer, -4 the dispel
// env: OUT (file name in .preview/), CW (pixels a cell drawn wide, default 10), STEP
// (seconds between frames, default 0.2; 0.1 shows every frame)
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { writePng } from './png.mjs'

// the mod's root, as a path for the files written and a URL for the modules
// loaded (a path with a space or a drive letter is no URL path)
const base = new URL('..', import.meta.url)
const root = fileURLToPath(base)
const load = (path) => import(new URL(path, base).href)
const { SPRITE, pixelCells } = await load('hooks/art/pixel.ts')
const { playOf } = await load('hooks/art/moves.ts')
const { totalOf, poseAt, frameTime } = await load('hooks/art/move.ts')
const roster = await load('hooks/roster.ts')
mkdirSync(root + '.preview', { recursive: true })

const ids = (process.argv[2] || 'kakashi').split(',')
const what = process.argv[3] || 'idle'
const [COLS, ROWS] = (process.argv[4] || `${SPRITE.columns}x${SPRITE.rows}`).split('x').map(Number)
const CW = Number(process.env.CW ?? 10)
const STEP = Number(process.env.STEP ?? 0.2)
const CH = CW * 2
const mood = { thumbs: 'happy', scratch: 'worried', alert: 'surprised', sleep: 'sleep', signs: 'focus', gather: 'focus' }

const frames = []
for (const id of ids) {
  if (what.startsWith('move:')) {
    const index = Number(what.slice(5))
    const m = playOf(id, index)
    if (!m) throw new Error(`${id} has no move ${index}`)
    for (let t = 0; t < totalOf(m); t += STEP) {
      const f = poseAt(m, frameTime(t))
      frames.push({ id, st: { id, face: { blink: 0, gaze: f.gaze, mood: f.mood, active: m.dojutsu !== false }, pose: f.pose, aura: f.aura, effect: null, badge: null, tick: 0, clones: 0, bob: 0, move: { index, t: frameTime(t) } } })
    }
  } else
    for (const pose of what.split(','))
      frames.push({ id, st: { id, face: { blink: 0, gaze: [0, 0], mood: mood[pose] ?? 'calm', active: pose === 'gather' }, pose, aura: 0, effect: null, badge: null, tick: 0, clones: 0, bob: 0, move: null } })
}
const PER = Math.min(frames.length, Number(process.env.PER ?? 10))
const TW = COLS * CW + 12
const TH = ROWS * CH + 12
const W = PER * TW
const H = Math.ceil(frames.length / PER) * TH
const img = new Int32Array(W * H).fill(0x1e1f22)
let slowest = 0
frames.forEach(({ id, st }, i) => {
  const t0 = performance.now()
  const words = pixelCells(st, roster.byId(id).glow, COLS, ROWS)
  slowest = Math.max(slowest, performance.now() - t0)
  const ox = (i % PER) * TW + 6
  const oy = Math.floor(i / PER) * TH + 6
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++) {
      const o = (r * COLS + c) * 3
      const [code, fg, bg] = [words[o], words[o + 1], words[o + 2]]
      if (code === 0x20) continue
      for (let y = 0; y < CH; y++)
        for (let x = 0; x < CW; x++) {
          const upper = y < CH / 2
          const col = code === 0x2588 ? fg : code === 0x2580 ? (upper ? fg : bg) : upper ? bg : fg
          if (col !== 0x01000000) img[(oy + r * CH + y) * W + ox + c * CW + x] = col
        }
    }
})
const out = process.env.OUT ?? 'pixels.png'
writePng(root + '.preview/' + out, W, H, img, 1)
console.log(`.preview/${out}  ${frames.length} frames, slowest ${slowest.toFixed(1)} ms`)
