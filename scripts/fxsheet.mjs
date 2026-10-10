// The effect library at a glance: every effect family registered in
// hooks/sprite/fx/index.ts, frame by frame, zoomed 8x on a checker (an orange
// tick on the top and left edges marks each frame's anchor), and each frame
// again on the 48 x 24 stage with the post and Kakashi, placed where it was
// drawn to go, composed by the engine itself (compose.ts): at 3x (about the
// size a terminal shows it) and at 1x.
//   node scripts/fxsheet.mjs                    every family → .preview/fx-all.png
//   node scripts/fxsheet.mjs fire,quake,lionFist  the families of those files, or those families
// env: OUT (file name in .preview/), W (sheet width, default 2400), BG (the
// terminal's background behind the stage, default 0x141418)
import { mkdirSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { writePng } from './png.mjs'

// the mod's root, as a path for the files written and a URL for the modules
// loaded (a path with a space or a drive letter is no URL path)
const base = new URL('..', import.meta.url)
const root = fileURLToPath(base)
const load = path => import(new URL(path, base).href)
const { FX, AT } = await load('hooks/sprite/fx/index.ts')
const { compose } = await load('hooks/sprite/compose.ts')
const { faceOfEyes } = await load('hooks/sprite/cels.ts')
const { KAKASHI } = await load('hooks/sprite/ninja/kakashi.ts')
const { GROUND, HOME, POST_X, STAGE_H, STAGE_W, STRIKE } = await load('hooks/sprite/stage.ts')
const { compile } = await load('hooks/sprite/grid.ts')
const { FX_PALETTES } = await load('hooks/sprite/fx/palettes.ts')
mkdirSync(root + '.preview', { recursive: true })

// each family's file, for the sections (the summoned animals are summons.ts's)
const fileOf = new Map()
for (const f of readdirSync(root + 'hooks/sprite/fx').filter(f => f.endsWith('.ts') && !['index.ts', 'palettes.ts'].includes(f))) {
  const mod = await load('hooks/sprite/fx/' + f)
  for (const v of Object.values(mod)) {
    if (v && typeof v === 'object' && 'frames' in v) fileOf.set(v, f.slice(0, -3))
    else if (v && typeof v === 'object') for (const s of Object.values(v)) if (s && typeof s === 'object' && 'frames' in s) fileOf.set(s, f.slice(0, -3))
  }
}

// ------------------------------------------------------------------ where each is shown
// The cel each family is shown in: where (a cel anchor or a stage point), the
// nudge, behind or in front, the post's frame (null: none), the ninja's pose
// and column, and anything drawn with it (fx uses, frame i of the family).
const K = (pose, o = {}) => ({ pose, x: HOME, ...o })
const wipe4 = { fx: 'tsukuyomiWipe', f: 4, at: AT.stage, back: true }
const line4 = { fx: 'shadowLine', f: 4, at: [HOME, GROUND], back: true }
const SHOW = {
  chidori: { at: 'hand', k: K('charge', { awake: true }) },
  chidoriBuild: { at: 'hand', k: K('charge', { awake: true }) },
  streak: { at: 'hand', d: [1, 0], k: K('smear', { x: 31 }) },
  sparks: { at: 'hand', k: K('follow', { x: STRIKE - 1 }) },
  aura: { at: 'feet', back: true, k: K('charge') },
  auraLow: { at: 'feet', back: true, k: K('windup') },
  impact: { at: 'post', k: K('strike', { x: STRIKE }) },
  smoke: { at: 'post', d: [0, 6] },
  sigh: { at: 'feet', d: [-5, -6], k: K('sign2') },
  wisp: { at: 'head', d: [10, 17] },
  dust: { at: [HOME + 2, GROUND] },
  earth: { at: [POST_X + 8, GROUND] },
  kunai: { at: 'hand', k: K('windup') },
  zzz: { at: 'head', d: [1, 3], k: K('sleep') },
  gloom: { at: 'head', d: [3, 2], k: K('slump') },
  vortex: { at: [POST_X + 1, GROUND - 5], k: K('strike', { awake: true }) },
  sealRing: { at: 'hand', back: true, k: K('slam') },
  sealLine: { at: 'hand', d: [-1, 0], back: true, k: K('slam') },
  // fire
  fireball: { at: [17, 16], k: K('strike') },
  greatFireballForm: { at: [22, 11], k: K('charge') },
  greatFireball: { at: [16, 13], k: K('charge') },
  fireStream: { at: [24, 12], k: K('strike') },
  phoenix: { at: [16, 14], k: K('strike') },
  burnPost: { at: AT.postFoot, post: 'scorch' },
  scorch: { at: AT.postFoot, post: 'scarred' },
  embers: { at: AT.postFoot, post: 'scarred' },
  // water
  waterBullet: { at: [18, 17], k: K('strike') },
  splash: { at: 'post', d: [1, 0], post: 'lean' },
  waterStream: { at: 'hand', k: K('strike') },
  waterPrisonForm: { at: AT.postBase },
  waterPrison: { at: AT.postBase },
  foam: { at: AT.postBase },
  sharkWake: { at: [16, 15] },
  // wind
  rasengan: { at: 'hand', k: K('charge') },
  giantRasengan: { at: [20, 14], k: K('charge') },
  rasenganHit: { at: 'post', k: K('strike', { x: STRIKE }), post: 'lean' },
  rasenshuriken: { at: 'hand', d: [0, 2], k: K('raise') },
  rasenshurikenDome: { at: [POST_X + 2, GROUND - 6] },
  windBlade: { at: [17, 16], k: K('strike') },
  // sand
  sandCoffin: { at: AT.postFoot, k: K('strike') },
  sandWall: { at: [24, GROUND] },
  sandSpear: { at: 'hand', d: [-1, 0], k: K('strike') },
  sandShuriken: { at: [17, 15], k: K('strike') },
  grains: { at: AT.postTop },
  // earth
  quake: { at: [POST_X + 3, GROUND], post: null, k: K('follow', { x: STRIKE - 1 }) },
  rubble: { at: [POST_X + 3, GROUND], post: null, k: K('follow', { x: STRIKE - 1 }) },
  shockRing: { at: [POST_X + 3, GROUND - 4], back: true, post: null, k: K('follow', { x: STRIKE - 1 }) },
  dustWave: { at: [POST_X + 3, GROUND], post: null, k: K('follow', { x: STRIKE - 1 }) },
  // gentle fist
  palmFlash: { at: 'post', k: K('strike', { x: STRIKE }) },
  lionFist: { at: 'hand', k: K('charge') },
  rotation: { at: 'feet', k: K('sign2') },
  vacuum: { at: 'hand', k: K('strike') },
  // shadow
  shadowLine: { at: 'feet', back: true, k: K('sign1') },
  shadowHands: { at: AT.postBase, k: K('sign1'), with: () => [line4] },
  shadowStitch: { at: AT.postBase, k: K('sign3'), with: () => [line4] },
  // clay
  clayBird: { at: [20, 9], k: K('charge') },
  claySpider: { at: [19, GROUND], k: K('charge') },
  katsu: { at: AT.postBase, k: K('sign3') },
  // uchiha
  kamui: { at: AT.postMid, k: K('charge', { awake: true }) },
  amaterasu: { at: AT.postBase, k: K('idle0', { awake: true }) },
  tsukuyomiWipe: { at: AT.stage, back: true, k: K('idle0', { awake: true }) },
  redMoon: { at: [17, 4], back: true, post: null, k: K('idle0', { awake: true }), with: () => [wipe4, { fx: 'boundPost', f: 0, at: AT.postBase }] },
  boundPost: { at: AT.postBase, post: null, k: K('idle0', { awake: true }), with: () => [wipe4, { fx: 'redMoon', f: 0, at: [17, 4], back: true }] },
  feathers: { at: AT.postMid, k: K('idle0', { awake: true }) },
  // pain
  shinra: { at: AT.stage, back: true, k: K('charge') },
  bansho: { at: 'post', k: K('strike') },
  chibaku: { at: [10, 6], k: K('charge') },
  chakraRod: { at: 'post', k: K('strike', { x: STRIKE }) },
  // the rest
  ftgFlash: { at: AT.postMid, with: () => [{ fx: 'ftgKunai', f: 0, at: [13, 20] }] },
  ftgKunai: { at: [13, 20] },
  woodSpikes: { at: AT.postBase, k: K('sign2') },
  snake: { at: 'post', k: K('strike') },
  sageAura: { at: 'feet', back: true, k: K('charge') },
  leafWhirl: { at: AT.postMid },
  dragonAura: { at: 'feet', back: true, k: K('charge') },
  gateSteam: { at: 'feet', k: K('charge') },
}
// the summoned animals stand in the arena, behind
const showOf = name => SHOW[name] ?? (fileOf.get(FX[name]) === 'summons' ? { at: [POST_X + 8, GROUND], back: true } : { at: 'post' })
const atText = s => (typeof s.at === 'string' ? `'${s.at}'` : (Object.entries(AT).find(([, v]) => v === s.at)?.[0] ?? `[${s.at}]`)) + (s.d ? ` d[${s.d}]` : '') + (s.back ? ' back' : '')

const stageOf = (name, i) => {
  const s = showOf(name)
  const k = s.k === undefined ? K('idle0') : s.k
  const cel = { n: 1, tag: 'fx', ...(k ? { k } : {}), post: s.post === undefined ? 'stand' : s.post, fx: [...(s.with?.(i) ?? []), { fx: name, f: i, at: s.at, ...(s.d ? { d: s.d } : {}), ...(s.back ? { back: true } : {}) }] }
  return compose(KAKASHI, cel, i, faceOfEyes(k?.eyes ?? 'open', k?.awake === true), { move: true }).px
}

// ------------------------------------------------------------------ a little 3 x 5 font
const GLYPH = {
  A: '010101111101101', B: '110101110101110', C: '011100100100011', D: '110101101101110', E: '111100110100111', F: '111100110100100',
  G: '011100101101011', H: '101101111101101', I: '111010010010111', J: '001001001101010', K: '101101110101101', L: '100100100100111',
  M: '101111111101101', N: '110101101101101', O: '010101101101010', P: '110101110100100', Q: '010101101110011', R: '110101110101101',
  S: '011100010001110', T: '111010010010010', U: '101101101101111', V: '101101101101010', W: '101101111111101', X: '101101010101101',
  Y: '101101010010010', Z: '111001010100111', 0: '111101101101111', 1: '010110010010111', 2: '110001010100111', 3: '110001010001110',
  4: '101101111001001', 5: '111100110001110', 6: '011100111101111', 7: '111001010010010', 8: '111101111101111', 9: '111101111001110',
  ':': '000010000010000', ',': '000000000010100', '.': '000000000000010', '-': '000000111000000', '(': '010100100100010', ')': '010001001001010',
  '/': '001001010100100', '[': '110100100100110', ']': '011001001001011', "'": '010010000000000', '=': '000111000111000', x: '000101010101000',
}

// ------------------------------------------------------------------ the sheet
const BG = Number(process.env.BG ?? 0x141418)
const SHEET = 0x0d0d11
const CHK = [0x1c1c22, 0x18181e]
const LABEL = 0xc8c8d4
const DIM = 0x70707c
const ACCENT = 0xf0a040
const Z = 8
const Z3 = 3
const GAP = 10

const want = (process.argv[2] ?? '').split(',').filter(Boolean)
const names = Object.keys(FX).filter(n => !want.length || want.includes(n) || want.includes(fileOf.get(FX[n])))
if (!names.length) throw new Error(`no effect family or file named ${want}`)

const framesOf = fam => fam.frames.map(fr => ('rows' in fr ? fr : { rows: fr, anchor: fam.anchor }))
// a block per family: its label, frames at 8x, then the stage at 3x and 1x
const blockOf = name => {
  const fam = FX[name]
  const frames = framesOf(fam)
  const sizes = frames.map(f => compile(f.rows))
  const w8 = sizes.reduce((a, s) => a + Math.max(s.w * Z, 40) + GAP, 0)
  const h8 = Math.max(...sizes.map(s => s.h)) * Z
  const w3 = frames.length * (STAGE_W * Z3 + GAP)
  const w1 = frames.length * (STAGE_W + 4)
  const w = Math.max(w8, w3 + w1 + GAP, 360)
  const h = 14 + h8 + 26 + STAGE_H * Z3 + 16
  return { name, fam, frames, sizes, w, h, h8 }
}
const text = (img, W, s, x, y, c, k = 2) => {
  for (const ch of s) {
    const g = GLYPH[ch] ?? GLYPH[ch.toUpperCase()]
    if (g) for (let r = 0; r < 5; r++) for (let q = 0; q < 3; q++) if (g[r * 3 + q] === '1') rect(img, W, x + q * k, y + r * k, k, k, c)
    x += 4 * k
  }
  return x
}
const rect = (img, W, x, y, w, h, c) => {
  for (let Y = y; Y < y + h; Y++) if (Y >= 0) img.fill(c, Y * W + Math.max(0, x), Y * W + Math.min(W, x + w))
}

// lay the blocks out in rows, a section header where the file changes
const items = []
let file = null
for (const n of names) {
  const f = fileOf.get(FX[n]) ?? '?'
  if (f !== file) items.push({ head: `${f}.ts` }), (file = f)
  items.push(blockOf(n))
}
// (a sheet of a few families is no wider than they need)
const SW = Number(process.env.W ?? Math.min(2400, items.reduce((a, it) => a + (it.w ? it.w + GAP * 3 : 0), GAP)))
let x = GAP
let y = GAP
let rowH = 0
const placed = []
for (const it of items) {
  if (it.head) {
    if (x > GAP) (y += rowH + GAP * 2), (x = GAP), (rowH = 0)
    placed.push({ ...it, x, y })
    y += 22
    continue
  }
  if (x + it.w > SW && x > GAP) (y += rowH + GAP * 2), (x = GAP), (rowH = 0)
  placed.push({ ...it, x, y })
  x += it.w + GAP * 3
  rowH = Math.max(rowH, it.h)
}
const SH = y + rowH + GAP * 2
const img = new Int32Array(SW * SH).fill(SHEET)
for (const it of placed) {
  if (it.head) {
    text(img, SW, it.head.toUpperCase(), it.x, it.y, ACCENT, 3)
    continue
  }
  const { name, fam, frames, sizes } = it
  const pname = typeof fam.palette === 'string' ? fam.palette : 'own'
  const pal = typeof fam.palette === 'string' ? FX_PALETTES[fam.palette] : fam.palette
  let lx = text(img, SW, name, it.x, it.y, LABEL, 2)
  // a family whose frames differ in size, or carry their own anchors, says so
  const ws = [...new Set(sizes.map(g => `${g.w}x${g.h}`))]
  const own = fam.frames.some(fr => 'rows' in fr)
  lx = text(img, SW, `  ${ws.length > 1 ? `${ws[0]}-${ws[ws.length - 1]}` : ws[0]}  ${own ? 'anchors per frame' : `[${fam.anchor}]`}  ${pname}  at ${atText(showOf(name))}`, lx, it.y, DIM, 2)
  // the frames at 8x on a checker, the anchor ticked
  let fx = it.x
  const fy = it.y + 14
  frames.forEach((f, i) => {
    const g = sizes[i]
    for (let yy = 0; yy < g.h; yy++)
      for (let xx = 0; xx < g.w; xx++) {
        const code = g.codes[yy * g.w + xx]
        const ch = code ? String.fromCharCode(code) : '.'
        const c = ch === '.' ? null : (pal[ch] ?? pal[ch.toLowerCase()])
        rect(img, SW, fx + xx * Z, fy + yy * Z, Z, Z, c === null || c === undefined ? CHK[(xx + yy) % 2] : c)
      }
    rect(img, SW, fx + f.anchor[0] * Z + 2, fy - 4, Z - 4, 3, ACCENT)
    rect(img, SW, fx - 4, fy + f.anchor[1] * Z + 2, 3, Z - 4, ACCENT)
    text(img, SW, String(i), fx, fy + g.h * Z + 3, DIM, 2)
    fx += Math.max(g.w * Z, 40) + GAP
  })
  // the stage, composed: 3x, then 1x
  const sy = fy + it.h8 + 24
  frames.forEach((_, i) => {
    const px = stageOf(name, i)
    const ox = it.x + i * (STAGE_W * Z3 + GAP)
    const ox1 = it.x + frames.length * (STAGE_W * Z3 + GAP) + GAP + i * (STAGE_W + 4)
    for (let yy = 0; yy < STAGE_H; yy++)
      for (let xx = 0; xx < STAGE_W; xx++) {
        const c = px[yy * STAGE_W + xx]
        rect(img, SW, ox + xx * Z3, sy + yy * Z3, Z3, Z3, c < 0 ? BG : c)
        img[(sy + yy) * SW + ox1 + xx] = c < 0 ? BG : c
      }
  })
}
const out = process.env.OUT ?? (want.length ? `fx-${want.join('-').slice(0, 60)}.png` : 'fx-all.png')
writePng(root + '.preview/' + out, SW, SH, img, 1)
console.log(`.preview/${out}  ${names.length} families, ${SW}x${SH}`)
