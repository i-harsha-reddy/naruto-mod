// Renders every ninja's jutsu frame by frame at the real ten frames a second,
// as the terminal's pixel art, into sprite sheets and a page that plays them
// on a loop.
//   node scripts/animate.mjs [ids] → .preview/anim/index.html
// env: Z (screen pixels to a sprite pixel, default 8)
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { writePng } from './png.mjs'

// the mod's root, as a path for the files written and a URL for the modules
// loaded (a path with a space or a drive letter is no URL path)
const base = new URL('..', import.meta.url)
const root = fileURLToPath(base)
const load = (path) => import(new URL(path, base).href)
const { SPRITE, sprite } = await load('hooks/art/pixel.ts')
const { movesOf } = await load('hooks/art/moves.ts')
const { totalOf, poseAt, frameTime, FRAME } = await load('hooks/art/move.ts')
const { NINJA, byId } = await load('hooks/roster.ts')
const out = root + '.preview/anim/'
mkdirSync(out, { recursive: true })

const ids = (process.argv[2] ? process.argv[2].split(',') : NINJA.map(n => n.id)).filter(id => movesOf(id).length > 0)
const Z = Number(process.env.Z ?? 8)
const SW = SPRITE.columns
const SH = SPRITE.rows * 2
const TW = SW * Z
const TH = SH * Z
const PER_ROW = 8
const BG = 0x1e1e24

const pages = []
for (const id of ids) {
  const n = byId(id)
  const moves = []
  movesOf(id).forEach((m, index) => {
    const count = Math.round(totalOf(m) / FRAME)
    const W = PER_ROW * TW
    const H = Math.ceil(count / PER_ROW) * TH
    const img = new Int32Array(W * H).fill(BG)
    for (let f = 0; f < count; f++) {
      const t = frameTime(f * FRAME + 1e-6)
      const p = poseAt(m, t)
      const st = { id, face: { blink: 0, gaze: p.gaze, mood: p.mood, active: m.dojutsu !== false }, pose: p.pose, aura: p.aura, effect: null, badge: null, tick: 0, clones: 0, bob: 0, move: { index, t } }
      const px = sprite(st, n.glow, SW, SH)
      const ox = (f % PER_ROW) * TW
      const oy = Math.floor(f / PER_ROW) * TH
      for (let y = 0; y < SH; y++)
        for (let x = 0; x < SW; x++) {
          const c = px[y * SW + x]
          if (c < 0) continue
          for (let yy = 0; yy < Z; yy++) img.fill(c, (oy + y * Z + yy) * W + ox + x * Z, (oy + y * Z + yy) * W + ox + (x + 1) * Z)
        }
    }
    const file = `${id}-${index}.png`
    writePng(out + file, W, H, img, 1)
    moves.push({ name: m.name, shout: m.shout, on: m.on ?? [], file, count })
    console.log(`${id} ${m.name}: ${count} frames`)
  })
  pages.push({ name: n.name, moves })
}

const html = `<!doctype html><html><head><meta charset="utf-8"><title>Jutsu preview</title><style>
body{background:#141418;color:#e8e6f0;font:14px/1.4 -apple-system,system-ui,sans-serif;margin:24px}
h2{font-size:16px;margin:28px 0 8px;color:#fff}
.row{display:flex;flex-wrap:wrap;gap:18px}
.move{background:#1e1e24;border-radius:10px;padding:10px 12px}
.sheet{width:${TW}px;height:${TH}px;background-repeat:no-repeat;image-rendering:pixelated}
.name{margin-top:6px;font-weight:600}.name small{font-weight:400;color:#9a98a8;margin-left:8px}
.legend{color:#9a98a8}
</style></head><body>
<div class="legend">The terminal's pixel art (${SW}×${SH} pixels, ${SW}×${SPRITE.rows} half-block cells), ten frames a second as in Claude Code.</div>
${pages.map(p => `<h2>${p.name}</h2><div class="row">${p.moves.map(m => `<div class="move"><div class="sheet" data-count="${m.count}" style="background-image:url('${m.file}')"></div><div class="name">${m.shout}!<small>${m.name} · ${m.on.length ? 'on ' + m.on.join(', ') : 'in rotation'}</small></div></div>`).join('')}</div>`).join('')}
<script>
const sheets=[...document.querySelectorAll('.sheet')];let f=0;
setInterval(()=>{f++;for(const s of sheets){const n=+s.dataset.count;const i=f%(n+6);const k=Math.min(i,n-1);s.style.backgroundPosition=\`-\${(k%${PER_ROW})*${TW}}px -\${Math.floor(k/${PER_ROW})*${TH}}px\`}},${FRAME * 1000});
</script></body></html>`
writeFileSync(out + 'index.html', html)
console.log('.preview/anim/index.html')
