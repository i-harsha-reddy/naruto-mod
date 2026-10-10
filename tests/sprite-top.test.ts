// The 'top' outfit group drawn natively: Sakura and Tsunade (the template
// templates/top.ts, their sprites ninja/sakura.ts and ninja/tsunade.ts, their
// moves anims/sakura.ts and anims/tsunade.ts).

import { describe, expect, test } from 'claude-code/testing'
import type { ChibiState, Pose } from '../hooks/art/chibi.ts'
import { frameTime, hitsOf, poseAt, shoutSpan, totalOf } from '../hooks/art/move.ts'
import { ARRIVAL_INDEX, CHEER_INDEX, DISPEL_INDEX, FIZZLE_INDEX, QUICK_INDEX, movesOf, playOf } from '../hooks/art/moves.ts'
import { SPRITE, pixelCells, sprite } from '../hooks/art/pixel.ts'
import type { Mood } from '../hooks/art/portrait.ts'
import { byId } from '../hooks/roster.ts'
import { faceOfEyes, poseOf } from '../hooks/sprite/cels.ts'
import { compose } from '../hooks/sprite/compose.ts'
import { dressOf } from '../hooks/sprite/dress.ts'
import { FX, FX_PALETTES } from '../hooks/sprite/fx/index.ts'
import { compile, missing } from '../hooks/sprite/grid.ts'
import { NATIVE, STAGE_H, STAGE_W, frameOf } from '../hooks/sprite/index.ts'
import { SAKURA } from '../hooks/sprite/ninja/sakura.ts'
import { TSUNADE } from '../hooks/sprite/ninja/tsunade.ts'
import { POST } from '../hooks/sprite/post.ts'
import { TOP } from '../hooks/sprite/templates/top.ts'
import { LEAP_CLIP } from '../hooks/sprite/anims/kit.ts'
import { HOME as HOME_X } from '../hooks/sprite/stage.ts'
import type { CelMove, HeadGrid, NinjaSprite } from '../hooks/sprite/types.ts'
import { JUTSU as NAMED } from './jutsu.ts'

// ---------------------------------------------------------------- helpers

const CAST: readonly NinjaSprite[] = [SAKURA, TSUNADE]
const POSES: readonly Pose[] = ['idle', 'crossed', 'think', 'signs', 'signs2', 'signs3', 'charge', 'gather', 'strike', 'punch', 'kick', 'dash', 'slam', 'raise', 'alert', 'thumbs', 'scratch', 'spread', 'poke', 'sleep', 'slump', 'tuck']
const MOODS: readonly Mood[] = ['calm', 'focus', 'happy', 'worried', 'surprised', 'sleep', 'smug']
const JUTSU = [0, 1, 2]
// their own moves, and the ones every native ninja shares
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
// and the tint (which may cover or wash the face)
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

// the colours a ninja's eyes are drawn in, but the skin they sit on
const eyeColours = (n: NinjaSprite): Set<number> => {
  const skin = new Set([n.eyes!.palette['s'], n.eyes!.palette['e']])
  return new Set(Object.values(n.eyes!.palette).filter((c): c is number => typeof c === 'number' && !skin.has(c)))
}

// the head a cel draws: one of the ninja's own (a turned head), the
// dojutsu's while it is awake, else their head
const headOf = (n: NinjaSprite, k?: { head?: string; awake?: boolean }): HeadGrid => (k?.head ? n.heads![k.head]! : k?.awake && n.dojutsu?.head ? n.dojutsu.head : n.head)
// where the head is drawn whole: on the canvas left, right and top (in the
// air, a leap's apex, the hair's top may be cut LEAP_CLIP pixels), its last
// row (the chin's outline, Tsunade's pigtail tips) allowed to sink into the
// floor; the eyes drawn round each eye's place on it
const headWhole = (n: NinjaSprite, h: { x: number; y: number; top: number }, awake = false, airborne = false, drawn?: HeadGrid): boolean => {
  const head = drawn ?? (awake && n.dojutsu?.head ? n.dojutsu.head : n.head)
  // (its width to its last drawn column: a turned head's hair swung back)
  const w = Math.max(...head.rows.map(r => r.replace(/\.+$/, '').length))
  return h.top >= (airborne ? -LEAP_CLIP : 0) && h.x >= 0 && h.x + w <= STAGE_W && h.y + head.rows.length - 1 <= STAGE_H
}
const eyesOn = (n: NinjaSprite, px: Int32Array, h: { x: number; y: number }, drawn: HeadGrid = n.head): boolean => {
  const colours = eyeColours(n)
  return drawn.eyes.every(([ex, ey]) => {
    for (let y = h.y + ey - 2; y <= h.y + ey + 1; y++) for (let x = h.x + ex - 1; x <= h.x + ex + 2; x++) if (colours.has(px[y * STAGE_W + x]!)) return true
    return false
  })
}

// ---------------------------------------------------------------- registered

describe('Sakura and Tsunade, drawn natively', () => {
  test('are native, on the top template, their jutsu, quick strike, cheer, arrival, fizzle and dispel all cel moves', () => {
    expect(NATIVE['sakura']).toBe(SAKURA)
    expect(NATIVE['tsunade']).toBe(TSUNADE)
    for (const n of CAST) {
      expect(n.template).toBe(TOP)
      expect(playOf(n.id, QUICK_INDEX)!).toBe(n.quick)
      expect(playOf(n.id, CHEER_INDEX)!).toBe(n.cheer)
      for (const index of [...OWN, ...SHARED]) {
        const m = moveOf(n.id, index)
        expect({ id: n.id, index, cels: 'frames' in m }).toEqual({ id: n.id, index, cels: true })
        // a frame each tenth of a second, the beats as long as the cels
        expect({ id: n.id, index, frames: m.frames.length }).toEqual({ id: n.id, index, frames: Math.round(totalOf(m) * 10) })
        m.frames.forEach((f, i) => expect(f.t).toBe(i))
      }
    }
  })
})

// ---------------------------------------------------------------- the moves' contract

describe('their moves keep the old ones\' names, shouts and triggers', () => {
  const shouted = (m: { beats: readonly { name: string; shout?: unknown }[] }): string[] => m.beats.filter(b => b.shout === true).map(b => b.name)

  test('each jutsu keeps its name, shout, trigger, dojutsu and the beats that shout', () => {
    for (const n of CAST) {
      const old = NAMED[n.id]!
      const now = movesOf(n.id)
      expect(now.length).toBe(3)
      now.forEach((m, i) => {
        const was = old[i]!
        expect({ id: n.id, i, name: m.name, shout: m.shout, on: m.on, dojutsu: m.dojutsu }).toEqual({ id: n.id, i, name: was.name, shout: was.shout, on: was.on, dojutsu: was.dojutsu })
        expect({ id: n.id, i, shouted: shouted(m) }).toEqual({ id: n.id, i, shouted: shouted(was) })
      })
    }
    // spelled out
    expect(movesOf('sakura').map(m => [m.name, m.shout, m.on])).toEqual([
      ['Cherry Blossom Impact', 'Cherry Blossom Impact', ['shell']],
      ['Chakra Enhanced Strength', 'Shannaro', ['edit']],
      ['Summoning Jutsu: Katsuyu', 'Summon: Katsuyu', ['agent']],
    ])
    expect(movesOf('tsunade').map(m => [m.name, m.shout, m.on])).toEqual([
      ['Heavenly Foot of Pain', 'Heavenly Foot', ['shell']],
      ['Strength of a Hundred Seal', 'Strength of a Hundred', ['edit']],
      ['Summoning Jutsu: Katsuyu', 'Summon: Katsuyu', ['agent']],
    ])
    expect(shouted(movesOf('sakura')[1]!)).toEqual(['windup'])
    expect(shouted(movesOf('sakura')[2]!)).toEqual(['slam'])
    expect(shouted(movesOf('tsunade')[2]!)).toEqual(['slam'])
  })

  test("the quick strikes are the QUICK table's: Sakura's 'Cha', Tsunade's Finger Flick (shouted as it flicks)", () => {
    expect(SAKURA.quick).toMatchObject({ name: 'Cha', shout: 'Cha', on: ['edit'], quick: true, dojutsu: false })
    expect(TSUNADE.quick).toMatchObject({ name: 'Finger Flick', shout: 'Finger Flick', on: ['edit'], quick: true, dojutsu: false })
    expect(shouted(TSUNADE.quick)).toEqual(['flick'])
  })

  test('a jutsu runs 4.5 to 6.5 s, a quick strike 1.5 to 2 s; each lands a blow and is shouted round it', () => {
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
        // the shout: from the beat marked for it (Shannaro's windup before
        // the haymaker, a summons' palm to the ground, the flick), else from
        // the launch, running through the first blow
        const [from, to] = shoutSpan(m)
        const marked = m.beats.findIndex(b => b.shout === true)
        const start = m.beats.slice(0, Math.max(0, marked)).reduce((t, b) => t + b.dur, 0)
        const ok = marked >= 0 ? Math.abs(from - start) < 1e-6 : from <= hits[0]!.at && hits[0]!.at < to
        expect({ id: n.id, m: m.name, shout: ok }).toEqual({ id: n.id, m: m.name, shout: true })
        // a failure stops at a recovery
        expect({ id: n.id, m: m.name, recover: m.beats.some(b => b.name === 'recover') }).toEqual({ id: n.id, m: m.name, recover: true })
      }
    }
  })

  test('the blows land where the art says: the fist in the ground, the heel, the punches, the flick', () => {
    const at = (m: CelMove): string => poseAt(m, hitsOf(m)[0]!.at).pose
    expect(at(SAKURA.moves[0]!)).toBe('slam')
    expect(at(SAKURA.moves[1]!)).toBe('punch')
    // Cha is the uppercut (the jump's raised fist), not Chakra Enhanced Strength's punch
    expect(at(SAKURA.quick)).toBe('raise')
    expect(at(TSUNADE.moves[0]!)).toBe('kick')
    expect(at(TSUNADE.moves[1]!)).toBe('punch')
    expect(at(TSUNADE.quick)).toBe('strike')
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

  test("the cheer shows the roster's cheer pose with its face by 0.6 s, each her own drawing of it (Sakura's fist pump, Tsunade's hand on the hip with a wink), and ends breathing out to rest", () => {
    for (const n of CAST) {
      const { pose, mood } = byId(n.id).cheer
      const m = moveOf(n.id, CHEER_INDEX)
      // the cheer's own pose, with its face, round 0.6 s in
      const near = [0.5, 0.6, 0.7].map(t => poseAt(m, frameTime(t)))
      expect({ id: n.id, shown: near.some(f => f.pose === pose && f.mood === mood) }).toEqual({ id: n.id, shown: true })
      // rule 5: eased down, the breath out (idle1, the head down a pixel), then standing
      const last = m.frames.slice(-3).map(f => [f.k?.pose, f.k?.hdy ?? 0])
      expect({ id: n.id, last }).toEqual({ id: n.id, last: [['ease', 0], ['idle1', 1], ['idle0', 0]] })
      // a short tail: the action done in 0.8 s, then 7 frames or fewer before the ending
      expect({ id: n.id, short: m.frames.length <= 16 }).toEqual({ id: n.id, short: true })
    }
    expect(dressOf(SAKURA).poses['thumbs']!.rows).toEqual(dressOf(SAKURA).poses['pump']!.rows)
    expect(dressOf(TSUNADE).poses['thumbs']!.rows).toEqual(dressOf(TSUNADE).poses['hip']!.rows)
    expect(TSUNADE.poseEyes?.['thumbs']).toBe('wink')
    // and the two are not timing copies of each other
    const poses = (n: NinjaSprite): string => moveOf(n.id, CHEER_INDEX).frames.map(f => f.k?.pose).join()
    expect(poses(SAKURA)).not.toEqual(poses(TSUNADE))
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
          if (!cel.k) {
            expect(f.head).toBeNull()
            continue
          }
          const h = f.head!
          // (the shared arrival pops up out of its cloud a pixel high, the hair's top outline in the cloud)
          const drawn = headOf(n, cel.k)
          const whole = headWhole(n, index === ARRIVAL_INDEX ? { ...h, top: h.top + 1 } : h, cel.k.awake === true, (cel.k.lift ?? 0) > 0 && cel.k.clip !== undefined, drawn)
          expect({ id: n.id, index, i, whole }).toEqual({ id: n.id, index, i, whole: true })
          expect({ id: n.id, index, i, eyes: eyesOn(n, f.px, h, drawn) }).toEqual({ id: n.id, index, i, eyes: true })
        }
      }
    }
  })

  test('the cels name poses, effects, frames, palettes and posts that exist', () => {
    for (const n of CAST) {
      const t = dressOf(n)
      for (const index of [...OWN, ...SHARED])
        for (const f of moveOf(n.id, index).frames) {
          if (f.k) expect(() => poseOf(t, f.k!.pose)).not.toThrow()
          if (f.k?.eyes) expect({ id: n.id, eyes: f.k.eyes, drawn: f.k.eyes in n.eyes!.states }).toEqual({ id: n.id, eyes: f.k.eyes, drawn: true })
          if (f.post) expect(POST[f.post]).toBeDefined()
          for (const e of f.fx ?? []) {
            const fam = FX[e.fx]
            expect({ fx: e.fx, known: fam !== undefined }).toEqual({ fx: e.fx, known: true })
            if (typeof e.f === 'number') expect({ fx: e.fx, f: e.f, ok: e.f >= 0 && e.f < fam!.frames.length }).toEqual({ fx: e.fx, f: e.f, ok: true })
            if (e.pal) expect({ pal: e.pal, known: FX_PALETTES[e.pal] !== undefined }).toEqual({ pal: e.pal, known: true })
          }
        }
    }
  })
})

// ---------------------------------------------------------------- at rest

describe('at rest', () => {
  test('every companion pose, mood, blink, breath and dojutsu draws, the head whole and the eyes on it', () => {
    for (const n of CAST)
      for (const pose of POSES)
        for (const mood of MOODS)
          for (const blink of [0, 0.5, 1])
            for (const bob of [0, 1])
              for (const active of [false, true]) {
                const st = still(n.id, pose, mood, { bob, face: { blink, gaze: [blink ? -0.8 : 0, 0], mood, active } })
                expect({ id: n.id, pose, mood, blink, bad: badCell(pixelCells(st, glowOf(n.id), SPRITE.columns, SPRITE.rows)) }).toEqual({ id: n.id, pose, mood, blink, bad: -1 })
                const f = native(st)
                const h = f.head!
                expect({ id: n.id, pose, bob, active, whole: headWhole(n, h, active) }).toEqual({ id: n.id, pose, bob, active, whole: true })
                expect({ id: n.id, pose, mood, blink, eyes: eyesOn(n, f.px, h) }).toEqual({ id: n.id, pose, mood, blink, eyes: true })
              }
  })

  test('the face follows the companion: each mood, the blink, a glance, every one its own', () => {
    for (const n of CAST) {
      const face = (st: ChibiState): string => {
        const f = native(st)
        const h = f.head!
        const out: number[] = []
        for (let y = h.y + 8; y < h.y + 17; y++) for (let x = h.x + 4; x < h.x + 17; x++) out.push(f.px[y * STAGE_W + x]!)
        return out.join()
      }
      const looks = new Set<string>()
      for (const mood of ['calm', 'focus', 'happy', 'worried', 'surprised', 'sleep', 'smug'] as Mood[]) looks.add(face(still(n.id, 'idle', mood)))
      looks.add(face(still(n.id, 'idle', 'calm', { face: { blink: 0.5, gaze: [0, 0], mood: 'calm', active: false } })))
      looks.add(face(still(n.id, 'idle', 'calm', { face: { blink: 0, gaze: [-0.8, 0], mood: 'calm', active: false } })))
      expect({ id: n.id, looks: looks.size }).toEqual({ id: n.id, looks: 9 })
    }
  })

  test('breathes in its breathing frame (the stance, the head sunk a pixel with it), elsewhere sinking its head a pixel', () => {
    for (const n of CAST) {
      const a = native(still(n.id, 'idle', 'calm', { bob: 0 }))
      const b = native(still(n.id, 'idle', 'calm', { bob: 1 }))
      // the body breathes too, not just the head: the arms and the hem move
      const body = (px: Int32Array, h: { y: number }): number[] => Array.from(px.subarray((h.y + 19) * STAGE_W))
      const moved = body(a.px, a.head!).filter((c, i) => c !== body(b.px, a.head!)[i]).length
      expect({ id: n.id, breathes: Array.from(a.px).join() !== Array.from(b.px).join(), head: b.head!.y - a.head!.y, body: moved >= 8 }).toEqual({ id: n.id, breathes: true, head: 1, body: true })
      for (const pose of ['think', 'signs', 'thumbs'] as Pose[]) {
        const x = native(still(n.id, pose, 'calm', { bob: 0 })).head!
        const y = native(still(n.id, pose, 'calm', { bob: 1 })).head!
        expect({ id: n.id, pose, sinks: y.y - x.y }).toEqual({ id: n.id, pose, sinks: 1 })
      }
    }
  })
})

// ---------------------------------------------------------------- the art

describe('the top template and its wearers', () => {
  test('every companion pose has its own drawing; every pose stands on its feet at its root, in the template\'s letters', () => {
    expect(Object.keys(TOP.map).sort()).toEqual([...POSES].sort())
    for (const pose of POSES) expect({ pose, drawn: TOP.poses[TOP.map[pose]] !== undefined }).toEqual({ pose, drawn: true })
    for (const [name, p] of Object.entries(TOP.poses)) {
      const g = compile(p.rows)
      expect({ name, feet: /[^.]/.test(p.rows[p.rows.length - 1]!) }).toEqual({ name, feet: true })
      expect({ name, root: TOP.root < g.w }).toEqual({ name, root: true })
      for (const row of p.rows) for (const ch of row) if (ch !== '.') expect({ name, ch, ok: TOP.letters.includes(ch.toLowerCase()) }).toEqual({ name, ch, ok: true })
      if (p.hand) expect({ name, hand: p.hand[0] >= 0 && p.hand[0] < g.w && p.hand[1] >= 0 && p.hand[1] < g.h }).toEqual({ name, hand: true })
      if (p.breath) expect({ name, breath: TOP.poses[p.breath] !== undefined }).toEqual({ name, breath: true })
      expect({ name, as: p.as !== undefined && p.as in TOP.map }).toEqual({ name, as: true })
    }
  })

  test("each wearer's colours name every letter of their dressed template, head, eyes and seal", () => {
    for (const n of CAST) {
      for (const ch of TOP.letters) expect({ id: n.id, ch, mapped: ch in n.body }).toEqual({ id: n.id, ch, mapped: true })
      // their overlays baked in (the skirt's panel, the haori) stay in the template's letters
      for (const [name, p] of Object.entries(dressOf(n).poses)) {
        expect({ id: n.id, name, missing: missing(p.rows, n.body) }).toEqual({ id: n.id, name, missing: [] })
        for (const row of p.rows) for (const ch of row) if (ch !== '.') expect({ id: n.id, name, ch, ok: TOP.letters.includes(ch.toLowerCase()) }).toEqual({ id: n.id, name, ch, ok: true })
      }
      for (const head of [n.head, ...(n.dojutsu?.head ? [n.dojutsu.head] : [])]) {
        expect({ id: n.id, missing: missing(head.rows, head.palette) }).toEqual({ id: n.id, missing: [] })
        // the eyes and the neck on the head
        for (const [x, y] of [...head.eyes, head.neck]) expect({ id: n.id, x, y, on: head.rows[y]?.[x] !== undefined && head.rows[y]![x] !== '.' }).toEqual({ id: n.id, x, y, on: true })
      }
      for (const [state, e] of Object.entries(n.eyes!.states)) expect({ id: n.id, state, missing: missing(e.rows, n.eyes!.palette) }).toEqual({ id: n.id, state, missing: [] })
      // every face a pose or a mood asks for is drawn
      for (const state of ['open', 'left', 'half', 'shut', 'focus', 'happy', 'sad', 'wide', 'smug', 'shout']) expect({ id: n.id, state, drawn: state in n.eyes!.states }).toEqual({ id: n.id, state, drawn: true })
      for (const p of Object.values(TOP.poses)) if (p.eyes) expect({ id: n.id, eyes: p.eyes, drawn: p.eyes in n.eyes!.states }).toEqual({ id: n.id, eyes: p.eyes, drawn: true })
    }
  })

  test("Tsunade's Strength of a Hundred seal is her dojutsu head: on in the jutsu, spread in stages, never at rest", () => {
    const MARK = TSUNADE.head.palette['k']!
    const marked = (px: Int32Array): boolean => Array.from(px).includes(MARK)
    // the seal's head differs from hers only in the marks
    expect(TSUNADE.dojutsu!.head!.rows).not.toEqual(TSUNADE.head.rows)
    expect(TSUNADE.head.rows.join('').includes('k')).toBe(false)
    // at rest the companion never wakes it: she has no dojutsu in the roster
    expect(byId('tsunade').dojutsu === true).toBe(false)
    expect(marked(native(still('tsunade', 'idle')).px)).toBe(false)
    // the jutsu wakes it after its seals, and draws it back before it ends
    const hundred = TSUNADE.moves[1]!
    const on = hundred.frames.map(f => f.k?.awake === true)
    expect(on[0]).toBe(false)
    expect(on.includes(true)).toBe(true)
    expect(on[on.length - 1]).toBe(false)
    expect(hundred.frames.some(f => f.k?.eyes === 'seal1')).toBe(true)
    expect(hundred.frames.some(f => f.k?.eyes === 'seal2')).toBe(true)
    const at = on.indexOf(true)
    expect(marked(native(moveState('tsunade', 1, at)).px)).toBe(true)
  })
})

// ---------------------------------------------------------------- round 6: motion, blows, the Katsuyus

describe('round 6: alive holds, real leaps, blows that read, their own Katsuyus', () => {
  const OWN_MOVES = (n: NinjaSprite): CelMove[] => [...n.moves, n.quick]
  const DRAWN_BLOWS = new Set(['strike', 'punch', 'follow', 'kick', 'slam', 'smear', 'dash', 'stomp', 'flick'])

  test('no drawing is held longer than 0.8 s: the body stirs (its Wind) or breathes through every hold', () => {
    for (const n of CAST)
      for (const index of [...JUTSU, QUICK_INDEX, CHEER_INDEX]) {
        const m = moveOf(n.id, index)
        let run = 1
        let prev = ''
        for (let i = 0; i < m.frames.length; i++) {
          const f = native(moveState(n.id, index, i), true)
          const key = Array.from(f.px).join()
          run = key === prev ? run + 1 : 1
          prev = key
          expect({ id: n.id, index, i, held: run <= 8 }).toEqual({ id: n.id, index, i, held: true })
        }
      }
  })

  test('the blows are drawn with the head turned three-quarters to the post', () => {
    for (const n of CAST)
      for (const m of OWN_MOVES(n))
        for (const f of m.frames)
          if (f.k && DRAWN_BLOWS.has(f.k.pose) && f.tag !== 'back') expect({ id: n.id, m: m.name, t: f.t, pose: f.k.pose, head: f.k.head?.startsWith('turn') }).toEqual({ id: n.id, m: m.name, t: f.t, pose: f.k.pose, head: true })
    // a turned head is its own drawing, the eyes slid toward the post
    for (const n of CAST) {
      expect(n.heads!['turn']!.rows).not.toEqual(n.head.rows)
      expect(n.heads!['turn']!.eyes[0][0]).toBeLessThan(n.head.eyes[0][0])
    }
  })

  test('no blow washes the whole stage: a flash is the post or the silhouette, and each move ends breathing out, idle1 then idle0 twice', () => {
    for (const n of CAST)
      for (const m of [...OWN_MOVES(n), n.cheer]) {
        expect({ id: n.id, m: m.name, tints: m.frames.filter(f => f.tint).length }).toEqual({ id: n.id, m: m.name, tints: 0 })
        if (m === n.cheer) continue
        // (a heal lands as a glow settling over the post, never a white hit flash)
        const heals = m.frames.some(f => f.fx?.some(e => e.fx === 'healGlow'))
        expect({ id: n.id, m: m.name, flash: heals || m.frames.some(f => f.flash === 'post' || f.flash === 'silhouette') }).toEqual({ id: n.id, m: m.name, flash: true })
        const last = m.frames.slice(-3).map(f => [f.k?.pose, f.k?.hdy ?? 0])
        expect({ id: n.id, m: m.name, last }).toEqual({ id: n.id, m: m.name, last: [['idle1', 1], ['idle0', 0], ['idle0', 0]] })
      }
  })

  test('the impact star is tinted by what struck, never the plain white-and-blue one', () => {
    for (const n of CAST)
      for (const m of OWN_MOVES(n))
        for (const f of m.frames)
          for (const e of f.fx ?? []) if (e.fx === 'impact') expect({ id: n.id, m: m.name, pal: e.pal !== undefined && e.pal !== 'volt' && e.pal !== 'hit' }).toEqual({ id: n.id, m: m.name, pal: true })
  })

  // the bounding box of a figure's body pixels (its colours, but its head's) and of its head
  const figure = (n: NinjaSprite, pose: string, lift: number, x = 30) => {
    const head = compose(n, { n: 1, tag: 't', k: { pose, x, lift, clip: LEAP_CLIP } }, 0, faceOfEyes('focus'), { move: true })
    const bare = compose({ ...n, head: { ...n.head, rows: n.head.rows.map(r => '.'.repeat(r.length)) } }, { n: 1, tag: 't', k: { pose, x, lift, clip: LEAP_CLIP } }, 0, faceOfEyes('focus'), { move: true })
    const box = (px: Int32Array) => {
      let [l, t] = [STAGE_W, STAGE_H]
      for (let i = 0; i < px.length; i++) if (px[i] !== -1 && px[i] !== 0x09090c) { l = Math.min(l, i % STAGE_W); t = Math.min(t, Math.floor(i / STAGE_W)) }
      return { l, t }
    }
    return { body: box(bare.px), h: head.head! }
  }

  test("a leap's and a kick's limbs reach four pixels and more past the head; Tsunade's heel at the stage's top beside her head, the torso in view", () => {
    for (const n of CAST) {
      // (the head's edge at its sides, rows 8 on: the hair, not a headband's knot above it)
      const side = (x: number): number => x + Math.min(...n.head.rows.slice(8).map(r => r.search(/[^.]/)).filter(i => i >= 0))
      for (const [pose, lift] of [['leap', 4], ['kick', 0]] as const) {
        const { body, h } = figure(n, pose, lift)
        expect({ id: n.id, pose, reach: side(h.x) - body.l >= 4 }).toEqual({ id: n.id, pose, reach: true })
      }
      // the heel flung up level with the top of the head, not over it (that hid the body)...
      const { body, h } = figure(n, 'heel', 3, 24)
      expect({ id: n.id, heel: Math.abs(h.top - body.t) <= 1 }).toEqual({ id: n.id, heel: true })
      // ...the torso laid back under the head's left, three rows of the top and more in view
      const px = compose(n, { n: 1, tag: 't', k: { pose: 'heel', x: 24, lift: 3, clip: LEAP_CLIP } }, 0, faceOfEyes('focus'), { move: true }).px
      const top = new Set(['v', 'w', 'x'].map(l => n.body[l]))
      const rows = new Set<number>()
      for (let i = 0; i < px.length; i++) if (top.has(px[i]!)) rows.add(Math.floor(i / STAGE_W))
      expect({ id: n.id, torso: rows.size >= 3 }).toEqual({ id: n.id, torso: true })
    }
    // and the Heavenly Foot leaves the ground: the leap, then the heel, airborne
    const lifts = TSUNADE.moves[0]!.frames.filter(f => f.tag === 'leap' || f.tag === 'kick').map(f => f.k?.lift ?? 0)
    expect(Math.max(...lifts)).toBeGreaterThanOrEqual(3)
    expect(TSUNADE.moves[0]!.frames.filter(f => f.k?.pose === 'heel').every(f => (f.k!.lift ?? 0) > 0)).toBe(true)
    expect(TSUNADE.moves[0]!.frames.some(f => f.fx?.some(e => e.fx === 'heelArc'))).toBe(true)
  })

  test("Chakra Enhanced Strength splits the floor in a line, the Cherry Blossom Impact breaks the whole arena and blows out a pink dome", () => {
    const uses = (m: CelMove, name: string): boolean => m.frames.some(f => f.fx?.some(e => e.fx === name))
    const [impact, strength] = SAKURA.moves
    expect([uses(impact!, 'blossomQuake'), uses(impact!, 'blossomDome'), uses(impact!, 'fissure')]).toEqual([true, true, false])
    expect([uses(strength!, 'blossomQuake'), uses(strength!, 'blossomDome'), uses(strength!, 'fissure')]).toEqual([false, false, true])
    // the crater is the arena wide (40 px and more), its slabs reared ten rows; the dome in Sakura's pink
    const rows = (name: string, f: number): readonly string[] => {
      const g = FX[name]!.frames[f]!
      return 'rows' in g ? g.rows : g
    }
    const slabs = rows('blossomQuake', 2)
    expect(Math.max(...slabs.map(r => r.replace(/\.+$/, '').length - r.search(/[^.]/)))).toBeGreaterThanOrEqual(40)
    expect(slabs.length - slabs.findIndex(r => /[^.]/.test(r))).toBeGreaterThanOrEqual(11)
    expect(impact!.frames.some(f => f.fx?.some(e => e.fx === 'blossomDome' && e.pal === 'blossom'))).toBe(true)
    // and the post is launched high: ten rows and more
    expect(Math.min(...impact!.frames.map(f => f.pdy ?? 0))).toBeLessThanOrEqual(-10)
  })

  test("the two Katsuyus are their own: Sakura's little healer on her shoulder and the green over the post, Tsunade's giant and her acid", () => {
    const uses = (m: CelMove, name: string, pal?: string): boolean => m.frames.some(f => f.fx?.some(e => e.fx === name && (pal === undefined || e.pal === pal)))
    const [sk, ts] = [SAKURA.moves[2]!, TSUNADE.moves[2]!]
    expect([uses(sk, 'katsuyuMini'), uses(sk, 'katsuyu'), uses(sk, 'katsuyuBits'), uses(sk, 'katsuyuGiant'), uses(sk, 'healGlow'), uses(sk, 'acidJet')]).toEqual([true, true, true, false, true, false])
    expect([uses(ts, 'katsuyuMini'), uses(ts, 'katsuyu'), uses(ts, 'katsuyuGiant'), uses(ts, 'acidJet'), uses(ts, 'acidPool')]).toEqual([false, false, true, true, true])
    // the post Sakura heals comes in battered and goes out whole
    expect(sk.frames.find(f => f.post)!.post).toBe('scarred')
    expect(sk.frames.filter(f => f.post).at(-1)!.post).toBe('stand')
    // the giant is drawn bigger than the stage is tall, to be cut by its edges
    for (const name of ['slug', 'katsuyuGiant']) {
      const slug = FX[name]!.frames[0]!
      const rows = 'rows' in slug ? slug.rows : slug
      expect({ name, tall: rows.length >= 28 + 2 && rows.length <= 34 + 2 }).toEqual({ name, tall: true })
    }
  })
})

// ---------------------------------------------------------------- round 7: hands that read, Katsuyus that read, moves that land

describe('round 7: the seals at the collar, real arms, turned heads, the Katsuyus, endings that settle', () => {
  const rowsOf = (pose: string): readonly string[] => TOP.poses[pose]!.rows
  const top = (rows: readonly string[], letters: string): number => rows.findIndex(r => [...r].some(ch => letters.includes(ch)))

  test('the seals are made at the collar, under the chin (lowercase, never over the face), the bare fingers showing out of gloves', () => {
    for (const pose of ['sign1', 'sign1Wind', 'sign2', 'sign2Wind']) {
      const rows = rowsOf(pose)
      // no letter of it is drawn over the head (the hands over the mouth read as a beard)
      expect({ pose, over: rows.some(r => /[A-Z]/.test(r)) }).toEqual({ pose, over: false })
      // the hands start on the first row under the chin
      const chin = rows.length - 1 - TOP.neck + 1
      expect({ pose, hands: top(rows, 'sk') }).toEqual({ pose, hands: chin })
    }
    // Sakura's gloved hands show her fingers (her skin) on the hands' top row
    for (const pose of ['sign1', 'sign2', 'sign2Wind']) {
      const rows = dressOf(SAKURA).poses[pose]!.rows
      const chin = rows.length - 1 - TOP.neck + 1
      expect({ pose, fingers: rows[chin]!.slice(11, 15) }).toEqual({ pose, fingers: 'nmnm' })
    }
  })

  test("the arms are real arms: the Ox's elbows flung wide and low (not a flat bar), the hand at the jaw for thinking, the folded arms staggered with a fist and a shade line", () => {
    // the Ox: the elbow pads below the hands, out past the body
    const ox = rowsOf('sign1')
    expect(top(ox, 'gh')).toBeGreaterThan(top(ox, 'sk'))
    expect(Math.min(...ox.map(r => r.search(/[gh]/)).filter(x => x >= 0))).toBeLessThanOrEqual(3)
    // thinking: a hand up at the jaw over the head (UPPERCASE), its forearm down to the elbow
    const think = rowsOf('think')
    expect(think.slice(0, 7).some(r => /[SK]/.test(r))).toBe(true)
    expect(think.join('').includes('ADD')).toBe(false)
    // folded: two forearms crossing, the near one lit, the far one in its mid tone, parted by a
    // diagonal step of sleeve shade (never black), a fist at the near one's far end and the far
    // hand peeking out at the other (round 8's recipe below: two rows, inside the torso)
    const crossed = rowsOf('crossed')
    expect(crossed.some(r => /n{4,}/.test(r)) && crossed.some(r => /m{4,}/.test(r))).toBe(true)
    const arms = crossed.map((r, y) => (/[nml]{3,}/.test(r.slice(9, 17)) ? y : -1)).filter(y => y >= 0)
    const [a, b] = [crossed[arms[0]!]!, crossed[arms[1]!]!]
    const step = a.indexOf('ll')
    expect(step >= 0 && b.indexOf('ll') === step + 1).toBe(true)
    expect(/o/.test(a.slice(9, 17)) || /o/.test(b.slice(9, 17))).toBe(false)
    expect(/sk/.test(a) && /k/.test(a.slice(0, step))).toBe(true)
  })

  test('a turned head turns: the face three pixels toward the post, the hair swung back so the outline changes', () => {
    for (const n of CAST) {
      const turn = n.heads!['turn']!
      // (measured from each head's neck: a head may be drawn wider at the left, a knot)
      expect({ id: n.id, shift: n.head.eyes[0][0] - n.head.neck[0] - (turn.eyes[0][0] - turn.neck[0]) }).toEqual({ id: n.id, shift: 3 })
      const width = (h: HeadGrid): number => Math.max(...h.rows.map(r => r.replace(/\.+$/, '').length))
      const right = (h: HeadGrid): number => width(h) - h.neck[0]
      expect({ id: n.id, wider: right(turn) > right(n.head) }).toEqual({ id: n.id, wider: true })
    }
    // and the seal on the turned head slides with the face
    expect(TSUNADE.heads!['turnSeal']!.rows).not.toEqual(TSUNADE.heads!['turn']!.rows)
  })

  test('every jutsu, quick strike and cheer settles: the arms eased back to the sides a frame from rest, then idle1 and idle0', () => {
    for (const n of CAST)
      for (const m of [...n.moves, n.quick, n.cheer]) {
        const poses = m.frames.map(f => f.k?.pose)
        const breath = poses.lastIndexOf('idle1')
        expect({ id: n.id, m: m.name, before: poses[breath - 1] }).toEqual({ id: n.id, m: m.name, before: 'ease' })
      }
    // and the ease is a frame from rest (only the arms and the hem moved)
    const ease = TOP.poses['ease']!.rows.join('')
    const idle = TOP.poses['idle0']!.rows.join('')
    let d = 0
    for (let i = 0; i < idle.length; i++) if (ease[i] !== idle[i]) d++
    expect(d).toBeLessThanOrEqual(30)
  })

  test("Sakura's Katsuyu rises big beside the post, divides into little slugs, and one rides her shoulder clear of her face", () => {
    const uses = (m: CelMove, name: string) => m.frames.flatMap(f => (f.fx ?? []).filter(e => e.fx === name))
    const sk = SAKURA.moves[2]!
    // the bust: twenty pixels tall and more, her eyes on stalks, then dividing (bud, heap, thinned)
    const bust = FX['katsuyu']!
    const f0 = bust.frames[0]!
    const rows = 'rows' in f0 ? f0.rows : f0
    expect(rows.length - 2).toBeGreaterThanOrEqual(20)
    expect(bust.frames.length).toBeGreaterThanOrEqual(5)
    expect(new Set(uses(sk, 'katsuyu').map(e => e.f))).toEqual(new Set([0, 1, 2, 3, 4]))
    expect(uses(sk, 'katsuyuBits').length).toBeGreaterThanOrEqual(4)
    // the little one: about 10 x 6 inside her outline, flying in, landing, sitting
    const mini = FX['katsuyuMini']!
    const m0 = mini.frames[0]!
    const mrows = 'rows' in m0 ? m0.rows : m0
    expect([Math.max(...mrows.map(r => r.length)) - 2, mrows.length - 2]).toEqual([10, 6])
    expect(new Set(uses(sk, 'katsuyuMini').map(e => e.f))).toEqual(new Set([0, 1, 2, 3]))
    // never over Sakura's face (her face's left edge seven columns into her head: the bob, and
    // the three columns the headband's knot takes at the left)
    const face = HOME_X - SAKURA.head.neck[0] + 7
    for (const e of uses(sk, 'katsuyuMini')) {
      const [x] = e.at as readonly [number, number]
      const w = Math.max(...mrows.map(r => r.length))
      expect({ at: e.at, clear: x - mini.anchor[0] + w - 1 < face }).toEqual({ at: e.at, clear: true })
    }
  })

  test("Tsunade's giant has a face (stalk eyes, a mouth that gapes with acid) and sinks away as she splits, never gone in one frame", () => {
    const giant = FX['katsuyuGiant']!
    expect(giant.frames.length).toBe(2)
    const rows = (f: number): readonly string[] => {
      const g = giant.frames[f]!
      return 'rows' in g ? g.rows : g
    }
    expect(rows(0).slice(0, 3).some(r => r.includes('d'))).toBe(true)
    expect(rows(0).some(r => r.includes('g'))).toBe(true)
    expect(rows(1).some(r => r.includes('i'))).toBe(true)
    const ts = TSUNADE.moves[2]!
    const sinks = ts.frames.filter(f => f.tag === 'split').flatMap(f => (f.fx ?? []).filter(e => e.fx === 'katsuyuGiant').map(e => e.sink ?? 0))
    expect(sinks.length).toBeGreaterThanOrEqual(3)
    expect(sinks).toEqual([...sinks].sort((a, b) => a - b))
  })

  test('the broken floor crumbles away over three frames: the crack of Chakra Enhanced Strength, the craters of the Impact and the Heavenly Foot', () => {
    const frames = (m: CelMove, name: string) => m.frames.flatMap(f => (f.fx ?? []).filter(e => e.fx === name).map(e => e.f))
    expect(frames(SAKURA.moves[1]!, 'fissure').slice(-3)).toEqual([5, 6, 7])
    expect(frames(SAKURA.moves[0]!, 'blossomQuake').slice(-3)).toEqual([4, 5, 6])
    expect(frames(TSUNADE.moves[0]!, 'blossomQuake').slice(-3)).toEqual([4, 5, 6])
  })

  test("the Strength of a Hundred's seal spreads in six frames, the head dipping as each stage snaps in; the Heavenly Foot's head never drops more than 3 px in a frame at the heel", () => {
    const hundred = TSUNADE.moves[1]!
    const seal = hundred.frames.filter(f => f.k?.pose.startsWith('sign2'))
    expect(seal.length).toBe(6)
    expect(seal.filter(f => f.k!.hdy === 1).length).toBeGreaterThanOrEqual(4)
    // the head's top through the leap, the heel and the drop
    const foot = TSUNADE.moves[0]!
    const tops = foot.frames.map((_, i) => native(moveState('tsunade', 0, i), true).head!.top)
    const air = foot.frames.map((f, i) => (f.tag === 'leap' || f.tag === 'kick' ? i : -1)).filter(i => i > 0)
    for (const i of air) expect({ i, drop: tops[i]! - tops[i - 1]! <= 3 }).toEqual({ i, drop: true })
  })
})

// ---------------------------------------------------------------- round 8: weight, arcs, folded arms that read, one Katsuyu

describe('round 8: folded arms that read, arcs not hovers, one Katsuyu, a heal that heals', () => {
  const rowsOf = (pose: string): readonly string[] => TOP.poses[pose]!.rows
  const fxRows = (name: string, f = 0): readonly string[] => {
    const g = FX[name]!.frames[f]!
    return 'rows' in g ? g.rows : g
  }

  test('the folded arms are two rows of arms inside the torso, the top showing above, the skirt and legs below, a fist on the far upper arm', () => {
    for (const pose of ['crossed', 'crossedWind']) {
      const rows = rowsOf(pose)
      // the forearms: the rows whose middle (the torso's columns 9-16) is arm, not top
      const arms = rows.map((r, y) => (/[nml]{3,}/.test(r.slice(9, 17)) ? y : -1)).filter(y => y >= 0)
      expect({ pose, arms: arms.length }).toEqual({ pose, arms: 2 })
      // inside the idle's outline (columns 5-20), never a plank wider than the body
      for (const y of [arms[0]! - 1, ...arms]) {
        const r = rows[y]!
        expect({ pose, r, inside: r.search(/[^.]/) >= 5 && r.replace(/\.+$/, '').length <= 21 }).toEqual({ pose, r, inside: true })
      }
      // a row of the top above them, the skirt and the legs below
      expect({ pose, above: /[vwx]{4,}/.test(rows[arms[0]! - 1]!.slice(9, 17)) }).toEqual({ pose, above: true })
      expect({ pose, skirt: /[fij]{6,}/.test(rows[arms[1]! + 1]!) }).toEqual({ pose, skirt: true })
      expect({ pose, legs: /[pqr]/.test(rows[arms[1]! + 2]!) }).toEqual({ pose, legs: true })
      // the near forearm steps up to a fist (the hand's letters) on the top row, at the far side
      const fist = rows[arms[0]!]!.search(/sk/)
      expect({ pose, fist: fist >= 14 && fist <= 17 }).toEqual({ pose, fist: true })
    }
    // Tsunade's blue sash shows under her folded arms; Sakura's skirt does
    const ts = dressOf(TSUNADE).poses['crossed']!.rows
    expect(ts.some(r => /b{8,}/.test(r))).toBe(true)
  })

  test("the Heavenly Foot arcs: up every frame, the heel at lift 3 (the head clear of the body), sinking under it (3, 2, 1), the drop on the ground, the stomp", () => {
    const m = TSUNADE.moves[0]!
    const air = m.frames.filter(f => f.tag === 'leap' || f.tag === 'kick' || f.tag === 'dive').map(f => f.k!).filter(k => (k.lift ?? 0) > 0)
    const lifts = air.map(k => k.lift!)
    for (let i = 1; i < lifts.length; i++) expect({ i, lifts, changes: lifts[i] !== lifts[i - 1] }).toEqual({ i, lifts, changes: true })
    expect(air.filter(k => k.pose === 'heel').map(k => k.lift)).toEqual([3, 2, 1])
    expect(m.frames.filter(f => f.k?.pose === 'drop').map(f => f.k!.lift ?? 0)).toEqual([0])
    const blow = m.frames.find(f => f.tag === 'impact')!
    expect([blow.k!.pose, blow.k!.lift ?? 0]).toEqual(['stomp', 0])
    // at the top the head is at standing height or above (never below it)
    const apex = m.frames.findIndex(f => f.tag === 'kick')
    const standing = native(still('tsunade', 'idle')).head!.top
    expect(native(moveState('tsunade', 0, apex), true).head!.top).toBeLessThanOrEqual(standing)
  })

  test("no airborne hover: Sakura's cheer hops 3, 5, 3, and no move holds one lift three frames running", () => {
    const hop = moveOf('sakura', CHEER_INDEX).frames.map(f => f.k?.lift ?? 0).filter(l => l > 0)
    expect(hop).toEqual([3, 5, 3])
    for (const n of CAST)
      for (const index of OWN) {
        const lifts = moveOf(n.id, index).frames.map(f => f.k?.lift ?? 0)
        for (let i = 2; i < lifts.length; i++) if (lifts[i]! > 0) expect({ id: n.id, index, i, hover: lifts[i] === lifts[i - 1] && lifts[i] === lifts[i - 2] }).toEqual({ id: n.id, index, i, hover: false })
      }
  })

  test('the two Katsuyus are one creature: a dome (no neck), eyes on stalks, a mouth, a shaded belly, the blue stripes down her back', () => {
    for (const name of ['katsuyu', 'katsuyuGiant']) {
      const rows = fxRows(name)
      expect({ name, eyes: rows.slice(0, 3).some(r => r.includes('d')) }).toEqual({ name, eyes: true })
      expect({ name, mouth: rows.some(r => r.includes('g')) }).toEqual({ name, mouth: true })
      expect({ name, stripes: rows.some(r => /c..c/.test(r)) }).toEqual({ name, stripes: true })
      // the body's front edge, from under the face to the foot, never cuts in
      // more than two columns (a dome, not a head on a neck)
      const body = rows.map(r => r.search(/[abch]/)).map((x, y) => [x, y] as const).filter(([x, y]) => x >= 0 && y >= 8)
      const front = Math.min(...body.map(([x]) => x))
      expect({ name, neck: Math.max(...body.map(([x]) => x)) - front <= 2 }).toEqual({ name, neck: true })
      // the belly shaded down the front, the deep shade under it
      const lower = rows.slice(Math.floor(rows.length / 2))
      expect({ name, belly: lower.filter(r => /^\.?o?h?b{2,}/.test(r.replace(/^o/, ''))).length >= 3 || lower.filter(r => /h/.test(r.slice(0, 4))).length >= 3 }).toEqual({ name, belly: true })
    }
  })

  test("Sakura's heal settles over the post as a glow with sparkles, never a shot at it, and no aura crescent round her as she gathers it", () => {
    const sk = SAKURA.moves[2]!
    const names = new Set(sk.frames.flatMap(f => (f.fx ?? []).map(e => e.fx)))
    expect([names.has('healGlow'), names.has('healSparkle'), names.has('healOrb'), names.has('waterBullet'), names.has('splash')]).toEqual([true, true, true, false, false])
    expect(sk.frames.filter(f => f.tag === 'heal').some(f => f.fx?.some(e => e.fx.startsWith('aura')))).toBe(false)
    // the post stands whole again inside the glow
    const wrapped = sk.frames.find(f => f.fx?.some(e => e.fx === 'healGlow' && e.f === 2))!
    expect(wrapped.post).toBe('stand')
  })

  test("Katsuyu's acid is a solid stream in three tones, never spray", () => {
    const ts = TSUNADE.moves[2]!
    const names = new Set(ts.frames.flatMap(f => (f.fx ?? []).map(e => e.fx)))
    expect([names.has('acidJet'), names.has('acidPool'), names.has('waterStream'), names.has('splash'), names.has('foam')]).toEqual([true, true, false, false, false])
    for (const name of ['acidJet', 'acidPool', 'healGlow', 'healSparkle', 'healOrb'])
      for (const f of FX[name]!.frames) {
        const rows = 'rows' in f ? f.rows : f
        const tones = new Set(rows.join('').replace(/\./g, ''))
        expect({ name, tones: tones.size <= 3 }).toEqual({ name, tones: true })
      }
  })

  test("Cha is its own move: the uppercut after a low glide, none of Chakra Enhanced Strength's run and punch", () => {
    const q = SAKURA.quick
    const before = q.frames.filter(f => f.tag !== 'back' && f.tag !== 'recover').map(f => f.k?.pose)
    expect(before.includes('punch') || before.includes('windup') || before.includes('smear')).toBe(false)
    expect(q.frames.find(f => f.tag === 'impact')!.k!.pose).toBe('jump')
  })

  test('the body moves: the flick steps in and rocks back, the cheer leans into its flick, a charge stirs under its Wind', () => {
    const xs = (m: CelMove): Set<number> => new Set(m.frames.filter(f => f.k).map(f => f.k!.x))
    expect(xs(TSUNADE.quick).size).toBeGreaterThanOrEqual(3)
    expect(xs(TSUNADE.cheer).size).toBeGreaterThanOrEqual(2)
    expect(TOP.poses['chargeWind']).toBeDefined()
    for (const n of CAST) expect({ id: n.id, wind: dressOf(n).poses['chargeWind']!.rows.join() !== dressOf(n).poses['charge']!.rows.join() }).toEqual({ id: n.id, wind: true })
    // the follow-through's arm stays chibi: the fist within nine columns of the body
    for (const pose of ['follow', 'followWind']) expect({ pose, reach: Math.min(...rowsOf(pose).map(r => r.search(/[^.]/)).filter(x => x >= 0)) }).toEqual({ pose, reach: 3 })
  })
})
