// The 'robe' outfit group drawn natively: Gaara, Neji and Orochimaru (the
// template templates/robe.ts, their sprites ninja/<id>.ts, their moves
// anims/<id>.ts).

import { describe, expect, test } from 'claude-code/testing'
import type { ChibiState, Pose } from '../hooks/art/chibi.ts'
import { frameTime, hitsOf, poseAt, shoutAt, shoutSpan, totalOf } from '../hooks/art/move.ts'
import type { Move } from '../hooks/art/move.ts'
import { ARRIVAL_INDEX, CHEER_INDEX, DISPEL_INDEX, FIZZLE_INDEX, QUICK_INDEX, movesOf, playOf } from '../hooks/art/moves.ts'
import { SPRITE, pixelCells, sprite } from '../hooks/art/pixel.ts'
import type { Mood } from '../hooks/art/portrait.ts'
import { Companion } from '../hooks/companion.ts'
import { byId } from '../hooks/roster.ts'
import { FALLBACK, poseOf } from '../hooks/sprite/cels.ts'
import { dressOf } from '../hooks/sprite/dress.ts'
import { FX, FX_PALETTES } from '../hooks/sprite/fx/index.ts'
import { compile, missing } from '../hooks/sprite/grid.ts'
import { NATIVE, PEEK_LEFT, STAGE_H, STAGE_W, frameOf } from '../hooks/sprite/index.ts'
import { GAARA, GAARA_ROBE } from '../hooks/sprite/ninja/gaara.ts'
import { NEJI } from '../hooks/sprite/ninja/neji.ts'
import { OROCHIMARU, OROCHIMARU_ROBE } from '../hooks/sprite/ninja/orochimaru.ts'
import { POST } from '../hooks/sprite/post.ts'
import { ROBE } from '../hooks/sprite/templates/robe.ts'
import type { CelMove, HeadGrid, NinjaSprite } from '../hooks/sprite/types.ts'
import { LEAP_CLIP } from '../hooks/sprite/anims/kit.ts'
import { HOME } from '../hooks/sprite/stage.ts'
import { JUTSU as NAMED } from './jutsu.ts'

// ---------------------------------------------------------------- helpers

const CAST: readonly NinjaSprite[] = [GAARA, NEJI, OROCHIMARU]
const POSES: readonly Pose[] = ['idle', 'crossed', 'think', 'signs', 'signs2', 'signs3', 'charge', 'gather', 'strike', 'punch', 'kick', 'dash', 'slam', 'raise', 'alert', 'thumbs', 'scratch', 'spread', 'poke', 'sleep', 'slump', 'tuck']
const MOODS: readonly Mood[] = ['calm', 'focus', 'happy', 'worried', 'surprised', 'sleep', 'smug']
const JUTSU = [0, 1, 2]
const OWN = [...JUTSU, QUICK_INDEX, CHEER_INDEX]
const SHARED = [ARRIVAL_INDEX, FIZZLE_INDEX, DISPEL_INDEX]

const still = (id: string, pose: Pose, mood: Mood = 'calm', o: Partial<ChibiState> = {}): ChibiState => ({
  id,
  face: { blink: 0, gaze: [0, 0], mood, active: false },
  pose,
  aura: 0,
  badge: null,
  tick: 0,
  bob: 0,
  move: null,
  ...o,
})

const glowOf = (id: string): number => byId(id).glow
const moveOf = (id: string, index: number): CelMove => playOf(id, index) as CelMove

// the state at a frame of a move, as the companion makes it
const moveState = (id: string, index: number, i: number): ChibiState => {
  const m = moveOf(id, index)
  const t = frameTime(i / 10)
  const f = poseAt(m, t)
  return { id, face: { blink: 0, gaze: [f.gaze[0], f.gaze[1]], mood: f.mood, active: m.dojutsu !== false }, pose: f.pose, aura: Math.round(f.aura * 4) / 4, badge: null, tick: 0, bob: 0, move: { index, t } }
}

// a native frame through the engine; `bare` leaves out the effects in front
// (which may cover the face on purpose: a cloud of smoke)
const native = (st: ChibiState, bare = false) => {
  const n = NATIVE[st.id]!
  const play = (i: number): CelMove | undefined => {
    const m = playOf(st.id, i) as CelMove | undefined
    if (!m || !bare) return m
    return { ...m, frames: m.frames.map(f => ({ ...f, fx: f.fx?.filter(e => e.back), tint: undefined })) }
  }
  return frameOf(n, st, play)
}

const GLYPHS = new Set([0x20, 0x2580, 0x2584, 0x2588])
const DEFAULT = 0x01000000
const badCell = (words: Uint32Array): number => {
  for (let o = 0; o < words.length; o += 3) {
    if (!GLYPHS.has(words[o]!)) return o / 3
    for (const c of [words[o + 1]!, words[o + 2]!]) if (c !== DEFAULT && c > 0xffffff) return o / 3
  }
  return -1
}

// the colours only the eyes are drawn in: not the skin they sit on, nor any
// colour of the head itself (Gaara's rings, Neji's brows)
const eyeColours = (n: NinjaSprite): Set<number> => {
  const head = new Set(Object.values(n.head.palette))
  const skin = new Set([n.eyes!.palette['s'], n.eyes!.palette['e']])
  return new Set(Object.values(n.eyes!.palette).filter((c): c is number => typeof c === 'number' && !skin.has(c) && !head.has(c)))
}

// the head drawn whole: on the canvas left, right and top, its chin's outline
// allowed to sink into the floor (sat down, crouched)
const headWhole = (n: NinjaSprite, h: { x: number; y: number; top: number }): boolean => {
  const w = Math.max(...n.head.rows.map(r => r.length))
  return h.top >= 0 && h.x >= 0 && h.x + w <= STAGE_W && h.y + n.head.rows.length - 1 <= STAGE_H
}
// each eye drawn round its place on the head drawn (`one`: either will do;
// `head`: a variant head the cel asks for, its eyes where it draws them: the
// turned heads' a few pixels nearer the post)
const eyesOn = (n: NinjaSprite, px: Int32Array, h: { x: number; y: number }, one = false, head: HeadGrid = n.head): boolean => {
  const colours = eyeColours(n)
  const seen = head.eyes.map(([ex, ey]) => {
    for (let y = h.y + ey - 2; y <= h.y + ey + 2; y++) for (let x = h.x + ex - 1; x <= h.x + ex + 2; x++) if (colours.has(px[y * STAGE_W + x]!)) return true
    return false
  })
  return one ? seen.some(Boolean) : seen.every(Boolean)
}
// the poses the companion holds at rest (the rest are drawn for moves; in a
// lunge's at rest the arm thrown across may hide an eye's lowest row)
const AT_REST = new Set<Pose>(['idle', 'crossed', 'think', 'signs', 'signs2', 'signs3', 'charge', 'gather', 'scratch', 'alert', 'thumbs', 'sleep', 'slump', 'raise', 'spread', 'poke'])
const has = (px: Int32Array, colour: number): boolean => px.includes(colour)

// the beats a move marks for the shout, and the calls of their own
const marked = (m: { beats: readonly { name: string; shout?: unknown }[] }): string[] => m.beats.filter(b => b.shout === true).map(b => b.name)
const calls = (m: { beats: readonly { name: string; shout?: unknown }[] }): [string, string][] => m.beats.flatMap(b => (typeof b.shout === 'string' ? [[b.name, b.shout] as [string, string]] : []))

// ---------------------------------------------------------------- registered

describe('Gaara, Neji and Orochimaru, drawn natively', () => {
  test('are native, in their copies of the robe, their jutsu, quick strike, cheer, arrival, fizzle and dispel all cel moves', () => {
    expect(NATIVE['gaara']).toBe(GAARA)
    expect(NATIVE['neji']).toBe(NEJI)
    expect(NATIVE['orochimaru']).toBe(OROCHIMARU)
    expect(GAARA.template).toBe(GAARA_ROBE)
    expect(NEJI.template).toBe(ROBE)
    expect(OROCHIMARU.template).toBe(OROCHIMARU_ROBE)
    for (const n of CAST) {
      expect(dressOf(n)).toBe(n.template)
      expect(playOf(n.id, QUICK_INDEX)!).toBe(n.quick)
      expect(playOf(n.id, CHEER_INDEX)!).toBe(n.cheer)
      for (const index of [...OWN, ...SHARED]) {
        const m = moveOf(n.id, index)
        expect({ id: n.id, index, cels: 'frames' in m }).toEqual({ id: n.id, index, cels: true })
        expect({ id: n.id, index, frames: m.frames.length }).toEqual({ id: n.id, index, frames: Math.round(totalOf(m) * 10) })
        m.frames.forEach((f, i) => expect(f.t).toBe(i))
      }
    }
  })
})

// ---------------------------------------------------------------- the moves' contract

describe("their moves keep the old ones' names, shouts and triggers", () => {
  test('each jutsu keeps its name, shout, trigger, dojutsu, the beat that shouts and the calls of its own', () => {
    for (const n of CAST) {
      const old = NAMED[n.id]!
      const now = movesOf(n.id)
      expect(now.length).toBe(3)
      now.forEach((m, i) => {
        const was = old[i]!
        expect({ id: n.id, i, name: m.name, shout: m.shout, on: m.on, dojutsu: m.dojutsu }).toEqual({ id: n.id, i, name: was.name, shout: was.shout, on: was.on, dojutsu: was.dojutsu })
        expect({ id: n.id, i, marked: marked(m), calls: calls(m) }).toEqual({ id: n.id, i, marked: marked(was), calls: calls(was) })
      })
    }
    // spelled out
    expect(movesOf('gaara').map(m => [m.name, m.shout, m.on])).toEqual([
      ['Sand Coffin', 'Sand Coffin', ['shell']],
      ['Sand Shield', 'Sand Shield', undefined],
      ['Sand Shuriken', 'Sand Shuriken', ['edit']],
    ])
    expect(movesOf('neji').map(m => [m.name, m.shout, m.on])).toEqual([
      ['Eight Trigrams Palm Rotation', 'Palm Rotation', ['shell']],
      ['Eight Trigrams Sixty-Four Palms', 'Eight Trigrams', ['edit']],
      ['Eight Trigrams Vacuum Palm', 'Vacuum Palm', undefined],
    ])
    expect(movesOf('orochimaru').map(m => [m.name, m.shout, m.on])).toEqual([
      ['Striking Shadow Snakes', 'Shadow Snakes', ['shell']],
      ['Summoning Jutsu: Manda', 'Summon: Manda', ['agent']],
      ['Kusanagi', 'Kusanagi', ['edit']],
    ])
    expect(calls(movesOf('gaara')[0]!)).toEqual([
      ['crush', 'Sand Burial'],
      ['impact', 'Sand Burial'],
    ])
    expect(calls(movesOf('neji')[1]!)).toEqual([
      ['hit', 'Two Palms'],
      ['hit2', 'Four Palms'],
      ['hit3', 'Eight Palms'],
      ['hit4', 'Sixteen Palms'],
      ['hit5', 'Thirty-Two Palms'],
      ['hit6', 'Sixty-Four Palms'],
      ['finish', 'Sixty-Four Palms'],
    ])
    // the Byakugan wakes for Neji's jutsu; nobody else's eyes do
    expect(movesOf('neji').map(m => m.dojutsu)).toEqual([undefined, undefined, undefined])
  })

  test("the quick strikes are the QUICK table's: Sand Spear, the Gentle Fist, the Snake Hands", () => {
    expect(GAARA.quick).toMatchObject({ name: 'Sand Spear', shout: 'Sand Spear', on: ['edit'], quick: true, dojutsu: false })
    expect(NEJI.quick).toMatchObject({ name: 'Gentle Fist', shout: 'Gentle Fist', on: ['edit'], quick: true, dojutsu: false })
    expect(OROCHIMARU.quick).toMatchObject({ name: 'Hidden Shadow Snake Hands', shout: 'Snake Hands', on: ['edit'], quick: true, dojutsu: false })
    // Gaara keeps his arms folded for it, the sand doing the work, but for
    // the cast (stoic: no sink, no overshoot, never a flinch): the near hand
    // out of the fold, low, the weight onto the back foot (two frames), then
    // thrust out at the post with a small step, the spear leaving that hand
    // (three frames a column nearer the post), held out as it lands; then
    // the arms fold again, until it is over (every move ends unfolding: the
    // ease, idle1, then idle0)
    const frames = GAARA.quick.frames
    const poses = frames.map(f => f.k!.pose)
    const end = poses.indexOf('ease')
    expect(new Set(poses.slice(0, end))).toEqual(new Set(['crossed', 'gather', 'strike']))
    const out = frames.filter(f => f.k!.pose !== 'crossed' && frames.indexOf(f) < end)
    expect(out.every(f => f.k!.head === 'turn')).toBe(true)
    const thrust = frames.filter(f => f.tag === 'release')
    expect(thrust.map(f => [f.k!.pose, f.k!.x])).toEqual([
      ['strike', HOME - 1],
      ['strike', HOME - 1],
      ['strike', HOME - 1],
    ])
    expect(thrust.every(f => f.fx?.some(e => e.fx === 'sandSpear'))).toBe(true)
    expect(poses.slice(end)).toEqual(['ease', 'idle1', 'idle0', 'idle0'])
  })

  test('a jutsu runs 4.5 to 6.5 s, a quick strike 1.5 to 2 s; each lands a blow, is shouted round it, and stops at a recovery', () => {
    for (const n of CAST) {
      for (const index of JUTSU) {
        const total = totalOf(moveOf(n.id, index))
        expect({ id: n.id, index, ok: total >= 4.5 && total <= 6.5 }).toEqual({ id: n.id, index, ok: true })
      }
      const quick = totalOf(n.quick)
      expect({ id: n.id, quick: quick >= 1.5 && quick <= 2 }).toEqual({ id: n.id, quick: true })
      for (const m of [...n.moves, n.quick]) {
        const hits = hitsOf(m)
        expect({ id: n.id, m: m.name, hits: hits.length > 0 }).toEqual({ id: n.id, m: m.name, hits: true })
        const [from, to] = shoutSpan(m)
        const mark = m.beats.findIndex(b => b.shout === true)
        const start = m.beats.slice(0, Math.max(0, mark)).reduce((t, b) => t + b.dur, 0)
        const ok = mark >= 0 ? Math.abs(from - start) < 1e-6 : from <= hits[0]!.at && hits[0]!.at < to
        expect({ id: n.id, m: m.name, shout: ok }).toEqual({ id: n.id, m: m.name, shout: true })
        expect({ id: n.id, m: m.name, recover: m.beats.some(b => b.name === 'recover') }).toEqual({ id: n.id, m: m.name, recover: true })
      }
    }
  })

  test("the spinner calls each beat's own: 'Sand Burial' as the fist closes, the count of the palms, 'Sixty-Four Palms' held at the finish", () => {
    const coffin = movesOf('gaara')[0]!
    const crush = coffin.beats.findIndex(b => b.name === 'crush')
    const at = (m: Move, i: number): number => m.beats.slice(0, i).reduce((t, b) => t + b.dur, 0)
    expect(shoutAt(coffin, frameTime(at(coffin, crush)))).toBe('Sand Burial')
    expect(shoutAt(coffin, frameTime(at(coffin, crush - 1)))).toBe('Sand Coffin')
    const palms = NEJI.moves[1]!
    const said: string[] = []
    for (let i = 0; i < palms.frames.length; i++) {
      const s = shoutAt(palms, frameTime(i / 10))
      if (s && said[said.length - 1] !== s) said.push(s)
    }
    expect(said).toEqual(['Eight Trigrams', 'Two Palms', 'Four Palms', 'Eight Palms', 'Sixteen Palms', 'Thirty-Two Palms', 'Sixty-Four Palms'])
    const finish = palms.beats.find(b => b.name === 'finish')!
    expect(finish.dur).toBeGreaterThanOrEqual(0.7)
  })

  test("Neji's Sixty-Four Palms builds, and breaks once mid-barrage: a short Rotation dome between the eight and the sixteen, the palm frames kept lean", () => {
    const palms = NEJI.moves[1]!
    const f = palms.frames
    expect(f.length / 10).toBeGreaterThanOrEqual(4.5)
    expect(f.length / 10).toBeLessThanOrEqual(6.5)
    // the dome: the Rotation's whirl, inside the count, after eight and before sixteen
    const spun = f.map((fr, i) => (fr.k && /^whirl/.test(fr.k.pose) && fr.fx?.some(e => e.fx === 'rotation') ? i : -1)).filter(i => i >= 0)
    expect(spun.length).toBeGreaterThanOrEqual(3)
    expect(spun.length).toBeLessThanOrEqual(6)
    expect(spun.every(i => f[i]!.tag === 'hit3')).toBe(true)
    expect(f[spun[spun.length - 1]! + 1]!.tag).toBe('hit4')
    // the palm loops kept lean: the count's palms and blurs 16 frames at most
    const loops = f.filter(fr => /^hit[1-5]?$/.test(fr.tag) && /^palm/.test(fr.k?.pose ?? ''))
    expect(loops.length).toBeLessThanOrEqual(16)
  })

  test('the blows land where the art says', () => {
    const pose = (m: CelMove): string => m.frames[Math.round(hitsOf(m)[0]!.at * 10)]!.k?.pose ?? '(turned)'
    // the fist driven down on the coffin, the other hand on its wrist; the
    // open palm guiding the wall as the first kunai lands; the arm thrown;
    // the hand the spear left, still out
    expect(pose(GAARA.moves[0]!)).toBe('charge')
    expect(pose(GAARA.moves[1]!)).toBe('palm')
    expect(pose(GAARA.moves[2]!)).toBe('strike')
    expect(pose(GAARA.quick)).toBe('strike')
    // the dome ground into the post flat out (the robe's whirl: the hem
    // flared, a blur, no longer a head turning); the palms and the vacuum's
    // thrust, the open palm at a palm's length (the robe's 'palm')
    expect(['whirl', 'whirlB']).toContain(pose(NEJI.moves[0]!))
    expect(pose(NEJI.moves[1]!)).toBe('palm')
    expect(pose(NEJI.moves[2]!)).toBe('palm')
    expect(pose(NEJI.quick)).toBe('palm')
    // the snakes bite as the fist clenches; Manda looms; the Kusanagi runs
    // into the post; the great snake out of the ground bites as the fist clenches
    expect(pose(OROCHIMARU.moves[0]!)).toBe('punch')
    expect(pose(OROCHIMARU.moves[2]!)).toBe('kusaThrust')
    expect(pose(OROCHIMARU.quick)).toBe('punch')
  })

  test('every frame of every jutsu and quick strike shows something of its own, never the ninja just standing', () => {
    for (const n of CAST) {
      const rest = new Set<string>()
      for (const pose of ['idle', 'crossed'] as Pose[])
        for (const mood of MOODS)
          for (const bob of [0, 1])
            for (const gaze of [-0.8, -0.4, 0, 0.4])
              for (const blink of [0, 0.62, 1]) rest.add(Array.from(sprite(still(n.id, pose, mood, { bob, face: { blink, gaze: [gaze, 0], mood, active: false } }), glowOf(n.id), 48, 24)).join())
      for (const index of [...JUTSU, QUICK_INDEX]) {
        const m = moveOf(n.id, index)
        for (let i = 0; i < m.frames.length; i++) expect({ id: n.id, index, i, rest: rest.has(Array.from(sprite(moveState(n.id, index, i), glowOf(n.id), 48, 24)).join()) }).toEqual({ id: n.id, index, i, rest: false })
      }
    }
  })

  test("the cheer shows the roster's cheer pose with its face mid-cheer (0.6 s), then ends at rest (rule 5): idle1 with the head dipped, then idle0", () => {
    for (const n of CAST) {
      const { pose, mood } = byId(n.id).cheer
      const m = moveOf(n.id, CHEER_INDEX)
      expect(totalOf(m)).toBeGreaterThanOrEqual(1.5)
      expect({ id: n.id, at: poseAt(m, 0.65) }).toMatchObject({ id: n.id, at: { pose, mood } })
      // the ending: the ease, idle1 a frame with the head dipped, idle0 to the last frame
      const ks = m.frames.map(f => f.k!)
      const i = ks.findIndex(k => k.pose === 'idle1')
      expect({ id: n.id, before: ks[i - 1]!.pose, dip: ks[i]!.hdy }).toEqual({ id: n.id, before: 'ease', dip: 1 })
      expect({ id: n.id, rest: ks.slice(i + 1).every(k => k.pose === 'idle0') && ks.length - i - 1 >= 1 && ks.length - i - 1 <= 2 }).toEqual({ id: n.id, rest: true })
      // idle0 nowhere before the ending
      expect({ id: n.id, early: ks.slice(0, i).some(k => k.pose === 'idle0') }).toEqual({ id: n.id, early: false })
    }
    // each its own, and never mostly folded arms: Gaara's Third Eye of sand
    // opening, looking at you and winking; Neji's palm snapped out with a pop
    // of chakra; Orochimaru's sleeve snake and his long tongue together
    expect(GAARA.cheer.frames.filter(f => f.fx?.some(e => e.fx === 'sandEye')).length).toBeGreaterThanOrEqual(8)
    expect(NEJI.cheer.frames.filter(f => f.k?.pose === 'palm' && f.fx?.some(e => e.fx === 'palmFlash')).length).toBeGreaterThanOrEqual(3)
    expect(OROCHIMARU.cheer.frames.filter(f => f.fx?.some(e => e.fx === 'lick')).length).toBeGreaterThanOrEqual(3)
    expect(OROCHIMARU.cheer.frames.some(f => f.fx?.some(e => e.fx === 'sleeveSnake') && f.fx?.some(e => e.fx === 'lick'))).toBe(true)
    for (const n of CAST) {
      const crossed = (n.id === 'gaara' ? GAARA : n.id === 'neji' ? NEJI : OROCHIMARU).cheer.frames.filter(f => f.k?.pose === 'crossed').length
      expect({ id: n.id, crossed: crossed <= 5 }).toEqual({ id: n.id, crossed: true })
    }
    expect(GAARA.cheer.frames[GAARA.cheer.frames.length - 1]!.k!.eyes).toBe('smile')
  })
})

// ---------------------------------------------------------------- every frame

describe('every frame draws', () => {
  test('every frame of every move: the cells are glyphs and colours, the head on the canvas, the eyes on the head', () => {
    for (const n of CAST) {
      const glow = glowOf(n.id)
      for (const index of [...OWN, ...SHARED]) {
        const m = moveOf(n.id, index)
        for (let i = 0; i < m.frames.length; i++) {
          const st = moveState(n.id, index, i)
          for (const [cols, rows] of [[SPRITE.columns, SPRITE.rows], [22, 12], [48, 9]] as const) expect({ id: n.id, index, i, cols, bad: badCell(pixelCells(st, glow, cols, rows)) }).toEqual({ id: n.id, index, i, cols, bad: -1 })
          const cel = m.frames[i]!
          const f = native(st, true)
          // (no figure of his own: under the arrival's cloud, or Neji turned away mid-spin, a copy of him)
          if (!cel.k) {
            expect(f.head).toBeNull()
            expect({ id: n.id, index, i, someone: index === ARRIVAL_INDEX || (cel.clones?.length ?? 0) > 0 }).toEqual({ id: n.id, index, i, someone: true })
            continue
          }
          const h = f.head!
          // (in the air the hair's top may be cut by the stage's top, LEAP_CLIP pixels at most)
          const whole = headWhole(n, index === ARRIVAL_INDEX ? { ...h, top: h.top + 1 } : (cel.k.lift ?? 0) > 0 ? { ...h, top: h.top + LEAP_CLIP } : h)
          expect({ id: n.id, index, i, whole }).toEqual({ id: n.id, index, i, whole: true })
          // (no eyes to see on the back of Neji's head, mid-spin)
          // (in profile, one eye: either will do)
          const drawn = cel.k.head ? n.heads![cel.k.head]! : n.head
          if (cel.k.eyes !== 'away') expect({ id: n.id, index, i, eyes: eyesOn(n, f.px, h, cel.k.eyes === 'side', drawn) }).toEqual({ id: n.id, index, i, eyes: true })
        }
      }
    }
  })

  test('the cels name poses, eyes, effects, frames, palettes and posts that exist', () => {
    for (const n of CAST) {
      const t = dressOf(n)
      for (const index of [...OWN, ...SHARED])
        for (const f of moveOf(n.id, index).frames) {
          for (const k of [...(f.k ? [f.k] : []), ...(f.clones ?? [])]) {
            expect(() => poseOf(t, k.pose)).not.toThrow()
            // (a state they have not drawn falls back: wide to open, smug to half)
            if (k.eyes) expect({ id: n.id, eyes: k.eyes, drawn: k.eyes in n.eyes!.states || (FALLBACK[k.eyes] ?? '') in n.eyes!.states }).toEqual({ id: n.id, eyes: k.eyes, drawn: true })
          }
          if (f.post) expect(POST[f.post]).toBeDefined()
          for (const e of f.fx ?? []) {
            const fam = FX[e.fx]
            expect({ fx: e.fx, known: fam !== undefined }).toEqual({ fx: e.fx, known: true })
            if (typeof e.f === 'number') expect({ fx: e.fx, f: e.f, ok: e.f >= 0 && e.f < fam!.frames.length }).toEqual({ fx: e.fx, f: e.f, ok: true })
            if (e.pal) {
              expect({ pal: e.pal, known: FX_PALETTES[e.pal] !== undefined }).toEqual({ pal: e.pal, known: true })
              for (const fr of fam!.frames) expect({ fx: e.fx, pal: e.pal, missing: missing('rows' in fr ? fr.rows : fr, FX_PALETTES[e.pal]!) }).toEqual({ fx: e.fx, pal: e.pal, missing: [] })
            }
          }
        }
    }
  })
})

// ---------------------------------------------------------------- the art

describe('the robe and what they wear', () => {
  test('the robe has a drawing for every companion pose, each on its feet at its root, in its letters', () => {
    expect(Object.keys(ROBE.map).sort()).toEqual([...POSES].sort())
    for (const pose of POSES) expect({ pose, drawn: ROBE.poses[ROBE.map[pose]] !== undefined }).toEqual({ pose, drawn: true })
    for (const [name, p] of Object.entries(ROBE.poses)) {
      const g = compile(p.rows)
      expect({ name, feet: /[^.]/.test(p.rows[p.rows.length - 1]!) }).toEqual({ name, feet: true })
      expect({ name, root: ROBE.root < g.w }).toEqual({ name, root: true })
      for (const row of p.rows) for (const ch of row) if (ch !== '.') expect({ name, ch, ok: ROBE.letters.includes(ch.toLowerCase()) }).toEqual({ name, ch, ok: true })
      for (const [k, at] of Object.entries({ hand: p.hand, back: p.points?.['back'], waist: p.points?.['waist'] }))
        if (at) expect({ name, k, inside: at[0] >= 0 && at[0] < g.w && at[1] >= 0 && at[1] < g.h }).toEqual({ name, k, inside: true })
      expect({ name, points: p.points?.['back'] !== undefined && p.points?.['waist'] !== undefined }).toEqual({ name, points: true })
      if (p.breath) expect(ROBE.poses[p.breath]).toBeDefined()
    }
  })

  test('folded arms are two rows inside the torso (never a plank), a hand at each end, the robe showing above and below', () => {
    // the shoulders' width; the arms no wider than it and a pixel a side
    const SHOULDERS = 16
    const span = (row: string): number => {
      const xs = [...row].flatMap((ch, x) => (ch === '.' ? [] : [x]))
      return xs.length ? xs[xs.length - 1]! - xs[0]! + 1 : 0
    }
    const sleeve = /[nml]/i
    const skin = /[sk]/i
    const cloth = /[vwxghpqr]/i
    const grids: [string, readonly string[]][] = [
      ...['crossed', 'crossedBreath', 'crossedWind'].map(n => [n, ROBE.poses[n]!.rows] as [string, readonly string[]]),
      ['gaara sleep', GAARA_ROBE.poses['sleep']!.rows],
    ]
    for (const [name, all] of grids) {
      // (the feet's row aside; sat, the knees spread wider from the far
      // forearm's row down: a pixel or two past the head a side, never more)
      const sat = name === 'gaara sleep'
      const rows = all.slice(0, -1)
      const arms = rows.flatMap((r, y) => (sleeve.test(r[ROBE.root]!) ? [y] : []))
      for (const row of sat ? rows.slice(0, arms[1]) : rows) expect({ name, row, wide: span(row) <= SHOULDERS + 2 }).toEqual({ name, row, wide: true })
      if (sat) for (const row of all.slice(arms[1])) expect({ name, row, base: span(row) <= 21 + 4 }).toEqual({ name, row, base: true })
      expect({ name, arms: arms.length, together: arms[1]! - arms[0]! }).toEqual({ name, arms: 2, together: 1 })
      // the near fist on the far arm, the far hand's fingers under the near one
      const hands = arms.flatMap(y => [...rows[y]!].flatMap((ch, x) => (skin.test(ch) ? [x] : [])))
      expect({ name, near: hands.some(x => x < ROBE.root - 3), far: hands.some(x => x > ROBE.root + 3) }).toEqual({ name, near: true, far: true })
      // the robe above them, the sash and the skirt below
      const [top, bottom] = [arms[0]!, arms[1]!]
      expect({ name, above: cloth.test(rows[top - 1]![ROBE.root]!), below: [1, 2].every(d => cloth.test(all[bottom + d]![ROBE.root]!)) }).toEqual({ name, above: true, below: true })
    }
  })

  test("the rabbit seal's hands sit below a row of clothing, never on the chin: a 4 x 3 block, the fingers split", () => {
    for (const name of ['sign2', 'sign2Breath', 'sign2Wind']) {
      const p = ROBE.poses[name]!
      const feet = p.rows.length - 1
      // the chin's outline: the head seated by its neck, a row above its bottom
      // (a breath sinks it a pixel)
      const chin = feet - ROBE.neck + 1 + (name === 'sign2Breath' ? 1 : 0)
      const at = p.rows.flatMap((r, y) => [...r].flatMap((ch, x) => (/[sk]/i.test(ch) ? [[x, y] as const] : [])))
      const ys = [...new Set(at.map(([, y]) => y))]
      const xs = [...new Set(at.map(([x]) => x))]
      expect({ name, gap: Math.min(...ys) - chin - 1 >= 1 }).toEqual({ name, gap: true })
      expect({ name, wide: xs.length, tall: ys.length }).toEqual({ name, wide: 4, tall: name === 'sign2Breath' ? 2 : 3 })
      // the fingertips: two fingers each, split by their shade
      const tips = p.rows[Math.min(...ys)]!.slice(Math.min(...xs), Math.max(...xs) + 1)
      expect({ name, tips }).toEqual({ name, tips: 'sksk' })
    }
  })

  test('an arm thrown out is a forearm long (the sleeve 5 px at most), never a rod reaching for the post', () => {
    for (const name of ['strike', 'strikeBreath', 'strikeWind', 'follow']) {
      const p = ROBE.poses[name]!
      const run = Math.max(...p.rows.map(r => Math.max(0, ...(r.match(/[nN]+/g) ?? []).map(m => m.length))))
      expect({ name, sleeve: run <= 5, reach: ROBE.root - p.hand![0] <= 10 }).toEqual({ name, sleeve: true, reach: true })
    }
    // the Gentle Fist's palms are the one long reach: a straight arm (the
    // sleeve 8 px at most, the palm past it) holding the open palm clear of
    // the head, so a palm on the post keeps his face off it (round 9)
    for (const name of ['palm', 'palmLow', 'palmSmear', 'palmSmearB', 'palmDrive']) {
      const p = ROBE.poses[name]!
      const run = Math.max(...p.rows.map(r => Math.max(0, ...(r.match(/[nN]+/g) ?? []).map(m => m.length))))
      const headLeft = ROBE.root - 10 + (p.head?.[0] ?? 0)
      expect({ name, sleeve: run <= 8, clear: p.hand![0] + 1 < headLeft }).toEqual({ name, sleeve: true, clear: true })
    }
  })

  test('every grid each of them is drawn from is in their colours: body, head, eyes, dojutsu, props', () => {
    for (const n of CAST) {
      for (const ch of n.template.letters) expect({ id: n.id, ch, mapped: ch in n.body }).toEqual({ id: n.id, ch, mapped: true })
      for (const [name, p] of Object.entries(n.template.poses)) expect({ id: n.id, name, missing: missing(p.rows, n.body) }).toEqual({ id: n.id, name, missing: [] })
      expect(missing(n.head.rows, n.head.palette)).toEqual([])
      expect(n.head.rows.length).toBe(19)
      for (const [x, y] of [...n.head.eyes, n.head.neck]) expect(n.head.rows[y]?.[x] !== undefined && n.head.rows[y]![x] !== '.').toBe(true)
      for (const [state, e] of Object.entries(n.eyes!.states)) expect({ id: n.id, state, missing: missing(e.rows, n.eyes!.palette) }).toEqual({ id: n.id, state, missing: [] })
      if (n.dojutsu?.eyes) expect(missing(n.dojutsu.eyes.rows, n.eyes!.palette)).toEqual([])
      for (const p of n.props ?? []) expect(missing(p.rows, p.palette ?? n.body)).toEqual([])
      // the eye states the faces map to, each drawn
      for (const state of ['open', 'left', 'half', 'shut', 'focus', 'happy', 'sad', 'wide']) expect({ id: n.id, state, drawn: state in n.eyes!.states }).toEqual({ id: n.id, state, drawn: true })
    }
  })

  test("what they wear rides every pose: Gaara's gourd and strap, Orochimaru's hair and knot", () => {
    const GOURD = GAARA.body['a'] as number
    const STRAP = GAARA.body['i'] as number
    const HAIR = OROCHIMARU.body['z'] as number
    for (const pose of ['idle', 'crossed', 'signs', 'strike', 'gather', 'alert'] as Pose[]) {
      const g = native(still('gaara', pose)).px
      expect({ pose, gourd: has(g, GOURD) }).toEqual({ pose, gourd: true })
      const o = native(still('orochimaru', pose)).px
      expect({ pose, hair: has(o, HAIR) }).toEqual({ pose, hair: true })
    }
    expect(has(native(still('gaara', 'idle')).px, STRAP)).toBe(true)
    // his hair left to the head when he slumps or sits (it would hang to the floor)
    expect(OROCHIMARU_ROBE.poses['slump']!.rows.join('')).not.toContain('z')
  })
})

// ---------------------------------------------------------------- at rest

describe('at rest', () => {
  test('every companion pose, mood, blink, breath and dojutsu draws, the head whole and the eyes on it', () => {
    for (const n of CAST)
      for (const pose of POSES)
        for (const mood of MOODS)
          for (const blink of [0, 0.62, 1])
            for (const bob of [0, 1])
              for (const active of [false, true]) {
                const st = still(n.id, pose, mood, { bob, face: { blink, gaze: [blink ? -0.8 : 0, 0], mood, active } })
                expect({ id: n.id, pose, mood, blink, bob, bad: badCell(pixelCells(st, glowOf(n.id), SPRITE.columns, SPRITE.rows)) }).toEqual({ id: n.id, pose, mood, blink, bob, bad: -1 })
                const f = native(st)
                const h = f.head!
                expect({ id: n.id, pose, bob, whole: headWhole(n, h) }).toEqual({ id: n.id, pose, bob, whole: true })
                expect({ id: n.id, pose, mood, blink, bob, eyes: eyesOn(n, f.px, h, !AT_REST.has(pose)) }).toEqual({ id: n.id, pose, mood, blink, bob, eyes: true })
              }
  })

  test('the face follows the companion: every mood, the blink and a glance each look different', () => {
    for (const n of CAST) {
      const eyes = (st: ChibiState): string => {
        const f = native(st)
        const h = f.head!
        const out: number[] = []
        for (let y = h.y + 9; y < h.y + 17; y++) for (let x = h.x + 4; x < h.x + 17; x++) out.push(f.px[y * STAGE_W + x]!)
        return out.join()
      }
      const looks = new Set<string>()
      for (const mood of ['calm', 'focus', 'happy', 'worried', 'surprised', 'sleep', 'smug'] as Mood[]) looks.add(eyes(still(n.id, 'idle', mood)))
      looks.add(eyes(still(n.id, 'idle', 'calm', { face: { blink: 0.62, gaze: [0, 0], mood: 'calm', active: false } })))
      looks.add(eyes(still(n.id, 'idle', 'calm', { face: { blink: 0, gaze: [-0.8, 0], mood: 'calm', active: false } })))
      // (Gaara has no smug look of his own: it is his half-lidded one)
      expect({ id: n.id, looks: looks.size }).toEqual({ id: n.id, looks: n.eyes!.states['smug'] ? 9 : 8 })
    }
  })

  test('the Byakugan: the veins at his temples when it wakes, and never otherwise', () => {
    const VEIN = NEJI.eyes!.palette['r'] as number
    for (const pose of ['idle', 'think', 'crossed'] as Pose[]) {
      expect(has(native(still('neji', pose, 'focus', { face: { blink: 0, gaze: [0, 0], mood: 'focus', active: true } })).px, VEIN)).toBe(true)
      expect(has(native(still('neji', pose, 'focus')).px, VEIN)).toBe(false)
    }
    // awake from the seals on in his jutsu; not in the quick strike (its dojutsu is off)
    for (const m of NEJI.moves) expect(m.frames.filter(f => f.k?.awake).length).toBeGreaterThan(m.frames.length / 2)
    expect(NEJI.quick.frames.some(f => f.k?.awake)).toBe(false)
  })

  test('Gaara never sleeps: his sleep is sat down, arms folded, eyes open, and so is the companion\'s nap for him', () => {
    const IRIS = GAARA.eyes!.palette['i'] as number
    const sat = native(still('gaara', 'sleep', 'calm'))
    expect(has(sat.px, IRIS)).toBe(true)
    expect(GAARA_ROBE.poses['sleep']!.eyes).toBe('open')
    // the head stays up: higher than everyone else's slumped sleep
    expect(sat.head!.y).toBeLessThan(native(still('neji', 'sleep', 'sleep')).head!.y)
    // left alone past the nap's time, the companion keeps his eyes open: no z, no shut eyes
    const c = new Companion(byId('gaara'))
    for (let i = 0; i < 7 * 60 * 10; i++) c.update(0.1)
    const st = c.state()
    expect(st.badge).not.toBe('sleep')
    expect(st.face.mood).not.toBe('sleep')
    expect(has(native(st).px, IRIS)).toBe(true)
  })

  test("Orochimaru's Kusanagi is drawn only in his Kusanagi, out of his mouth, over his face", () => {
    const STEEL = OROCHIMARU.props![0]!.palette!['s'] as number
    for (const pose of POSES) expect({ pose, sword: has(native(still('orochimaru', pose)).px, STEEL) }).toEqual({ pose, sword: false })
    const kusanagi = OROCHIMARU.moves[2]!
    const drawn = kusanagi.frames.filter((_, i) => has(native(moveState('orochimaru', 2, i)).px, STEEL)).length
    expect(drawn).toBeGreaterThan(15)
    for (const index of [0, 1, QUICK_INDEX]) expect(moveOf('orochimaru', index).frames.some((_, i) => has(native(moveState('orochimaru', index, i)).px, STEEL))).toBe(false)
  })

  test('the peek shows each head whole, the arena left out', () => {
    for (const n of CAST) {
      const st = still(n.id, 'idle')
      const h = native(st).head!
      expect(h.left).toBeGreaterThanOrEqual(PEEK_LEFT)
      expect(h.x + 21).toBeLessThanOrEqual(PEEK_LEFT + 22)
      expect(badCell(pixelCells(st, glowOf(n.id), 22, 12, undefined, 'peek'))).toBe(-1)
    }
  })
})
