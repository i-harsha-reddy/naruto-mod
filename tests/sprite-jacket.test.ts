// The jacket group drawn natively: Naruto, Hinata and Sasuke on the 'jacket'
// template (hooks/sprite/templates/jacket.ts), their heads, eyes, dojutsu,
// props and cel moves (hooks/sprite/ninja/, hooks/sprite/anims/).

import { describe, expect, test } from 'claude-code/testing'
import type { ChibiState, Pose } from '../hooks/art/chibi.ts'
import { SPRITE, pixelCells, sprite } from '../hooks/art/pixel.ts'
import { frameTime, hitsOf, poseAt, sinceOf, totalOf } from '../hooks/art/move.ts'
import { ARRIVAL_INDEX, CHEER_INDEX, DISPEL_INDEX, FIZZLE_INDEX, QUICK_INDEX, movesOf, playOf } from '../hooks/art/moves.ts'
import type { Mood } from '../hooks/art/portrait.ts'
import { byId } from '../hooks/roster.ts'
import { LEAP_CLIP } from '../hooks/sprite/anims/kit.ts'
import { faceOfEyes, poseOf } from '../hooks/sprite/cels.ts'
import { compose, layoutOf } from '../hooks/sprite/compose.ts'
import { dressOf } from '../hooks/sprite/dress.ts'
import { FX, FX_PALETTES } from '../hooks/sprite/fx/index.ts'
import { compile, missing } from '../hooks/sprite/grid.ts'
import { NATIVE, STAGE_H, STAGE_W, frameOf, register } from '../hooks/sprite/index.ts'
import { HINATA } from '../hooks/sprite/ninja/hinata.ts'
import { NARUTO } from '../hooks/sprite/ninja/naruto.ts'
import { SASUKE } from '../hooks/sprite/ninja/sasuke.ts'
import { POST } from '../hooks/sprite/post.ts'
import { HOME, POST_X, STRIKE } from '../hooks/sprite/stage.ts'
import { JACKET } from '../hooks/sprite/templates/jacket.ts'
import type { CelMove, Frame, NinjaSprite } from '../hooks/sprite/types.ts'
import { JUTSU } from './jutsu.ts'

// ---------------------------------------------------------------- helpers

const CAST: readonly NinjaSprite[] = [NARUTO, HINATA, SASUKE]
const OLD = JUTSU
// a leaping head may cut its hair's tips by LEAP_CLIP pixels (kit.ts), never on the ground
const POSES: readonly Pose[] = ['idle', 'crossed', 'think', 'signs', 'signs2', 'signs3', 'charge', 'gather', 'strike', 'punch', 'kick', 'dash', 'slam', 'raise', 'alert', 'thumbs', 'scratch', 'spread', 'poke', 'sleep', 'slump', 'tuck']
const MOODS: readonly Mood[] = ['calm', 'focus', 'happy', 'worried', 'surprised', 'sleep', 'smug']
const MOVE_INDEXES = [0, 1, 2, QUICK_INDEX, CHEER_INDEX, ARRIVAL_INDEX, FIZZLE_INDEX, DISPEL_INDEX]
const BADGES = ['think', 'read', 'search', 'edit', 'shell', 'alert', 'done', 'error', 'sleep'] as const
// the beats that launch a blow (move.ts's shout falls back on them)
const LAUNCH = /^(release|dash|throw|launch|leap|dive|fly|flash|step|slam|poof|scatter|stare|swing)\d*$/

// (another test file may have swapped a ninja of ours out of the registry
// and deleted it, in the same run: put ours back)
const ensure = (): void => {
  for (const n of CAST) if (NATIVE[n.id] !== n) register(n)
}

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

// the state of a ninja at a frame of a move, as the companion makes it
const moveState = (id: string, index: number, t: number): ChibiState => {
  const m = playOf(id, index)!
  const f = poseAt(m, frameTime(t))
  return { id, face: { blink: 0, gaze: [f.gaze[0], f.gaze[1]], mood: f.mood, active: m.dojutsu !== false }, pose: f.pose, aura: Math.round(f.aura * 4) / 4, badge: null, tick: 0, bob: 0, move: { index, t: frameTime(t) } }
}

const play = (id: string) => (i: number) => playOf(id, i) as CelMove | undefined
const native = (st: ChibiState) => frameOf(NATIVE[st.id]!, st, play(st.id))

const GLYPHS = new Set([0x20, 0x2580, 0x2584, 0x2588])
const DEFAULT = 0x01000000
const badCell = (words: Uint32Array): number => {
  for (let o = 0; o < words.length; o += 3) {
    if (!GLYPHS.has(words[o]!)) return o / 3
    for (const c of [words[o + 1]!, words[o + 2]!]) if (c !== DEFAULT && c > 0xffffff) return o / 3
  }
  return -1
}

const eyeColours = (n: NinjaSprite): Set<number> => new Set(Object.values(n.eyes!.palette).filter((c): c is number => c !== null))
// the left eye's 2 x 2 on a head drawn at (hx, hy)
const leftEye = (px: Int32Array, n: NinjaSprite, hx: number, hy: number, at: readonly [number, number] = n.head.eyes[0]): number[] => {
  const [ex, ey] = at
  return [0, 1].flatMap(dy => [0, 1].map(dx => px[(hy + ey + dy) * STAGE_W + hx + ex + dx]!))
}
const has = (px: ArrayLike<number>, colour: number): boolean => Array.prototype.includes.call(px, colour)

// ---------------------------------------------------------------- the art's data

describe('the jacket template', () => {
  test('every companion pose has its own drawing, under its name or the map', () => {
    expect(Object.keys(JACKET.map).sort()).toEqual([...POSES].sort())
    for (const pose of POSES) {
      const drawn = JACKET.poses[pose] ? pose : JACKET.map[pose]
      expect({ pose, drawn: JACKET.poses[drawn] !== undefined }).toEqual({ pose, drawn: true })
    }
    // the prototype's 31, the blur of a thrown arm (whip), the top of a
    // backflip (flip), a clone's perch on the post's stump, the hand to the
    // hair (flick), the breath in before a fire jutsu (inhale), the breaths
    // of the folded arms, the thinking hand and the three seals (crossedIn,
    // thinkIn, sign1In...), and twelve stirring drawings for the holds
    expect(Object.keys(JACKET.poses).length).toBe(53)
    for (const name of Object.keys(JACKET.poses).filter(p => p.endsWith('Wind'))) {
      // a stirring drawing keeps its pose's hands, head and feet where they are
      const base = JACKET.poses[name.slice(0, -4)]!
      const wind = JACKET.poses[name]!
      expect({ name, same: [wind.hand, wind.head, wind.rows.length, wind.rows.at(-1)] }).toEqual({ name, same: [base.hand, base.head, base.rows.length, base.rows.at(-1)] })
    }
  })

  test("every pose stands on its feet at its root, in the template's letters, every one in each ninja's colours", () => {
    for (const [name, p] of Object.entries(JACKET.poses)) {
      const g = compile(p.rows)
      expect({ name, feet: /[^.]/.test(p.rows[p.rows.length - 1]!) }).toEqual({ name, feet: true })
      expect({ name, root: JACKET.root < g.w }).toEqual({ name, root: true })
      for (const row of p.rows) for (const ch of row) if (ch !== '.') expect({ name, ch, ok: JACKET.letters.includes(ch.toLowerCase()) }).toEqual({ name, ch, ok: true })
      for (const n of CAST) expect({ id: n.id, name, missing: missing(p.rows, n.body) }).toEqual({ id: n.id, name, missing: [] })
      if (p.hand) expect({ name, hand: p.hand[0] >= 0 && p.hand[0] < g.w && p.hand[1] >= 0 && p.hand[1] < g.h }).toEqual({ name, hand: true })
      if (p.breath) expect({ name, breath: JACKET.poses[p.breath] !== undefined }).toEqual({ name, breath: true })
      expect({ name, as: p.as !== undefined && POSES.includes(p.as) }).toEqual({ name, as: true })
    }
    for (const n of CAST) for (const ch of JACKET.letters) expect({ id: n.id, ch, mapped: ch in n.body }).toEqual({ id: n.id, ch, mapped: true })
  })

  test("the heads, eyes, dojutsu and props use only their palettes' letters, the eyes and neck on the head", () => {
    for (const n of CAST) {
      for (const head of [n.head, n.dojutsu?.head, ...Object.values(n.heads ?? {})].filter(h => h !== undefined)) {
        expect({ id: n.id, missing: missing(head.rows, head.palette) }).toEqual({ id: n.id, missing: [] })
        // (Sasuke's 'roll', his head turned a quarter, lies 21 tall; Hinata's
        // long hair falls two or three rows past her jaw)
        const tall = n.id === 'hinata' ? [21, 22] : [head === n.heads?.roll ? 21 : 19]
        expect({ id: n.id, rows: tall.includes(head.rows.length) }).toEqual({ id: n.id, rows: true })
        for (const [x, y] of [...head.eyes, head.neck]) expect({ id: n.id, at: [x, y], on: head.rows[y]?.[x] !== undefined && head.rows[y]![x] !== '.' }).toEqual({ id: n.id, at: [x, y], on: true })
      }
      const E = n.eyes!
      for (const [state, e] of Object.entries(E.states)) expect({ id: n.id, state, missing: missing(e.rows, E.palette) }).toEqual({ id: n.id, state, missing: [] })
      for (const e of [n.dojutsu?.eyes, ...Object.values(n.dojutsu?.states ?? {})]) if (e) expect({ id: n.id, missing: missing(e.rows, E.palette) }).toEqual({ id: n.id, missing: [] })
      for (const p of n.props ?? []) expect({ id: n.id, missing: missing(p.rows, p.palette ?? n.body) }).toEqual({ id: n.id, missing: [] })
      // the faces their poseEyes ask for are drawn
      for (const [pose, state] of Object.entries(n.poseEyes ?? {})) expect({ id: n.id, pose, drawn: state in E.states }).toEqual({ id: n.id, pose, drawn: true })
    }
    // each ninja's dojutsu, as the prototype drew it: Sage Mode's pigment and
    // toad eyes, the Byakugan's veins (her eyes stay her own), the Sharingan in both eyes
    expect(NARUTO.dojutsu?.head).toBeDefined()
    expect(NARUTO.dojutsu?.eyes).toBeDefined()
    expect(HINATA.dojutsu?.head).toBeDefined()
    expect(HINATA.dojutsu?.eyes).toBeUndefined()
    expect(SASUKE.dojutsu?.eyes?.rows[0]).toBe('xk...kx')
  })
})

// ---------------------------------------------------------------- the moves

describe('their moves', () => {
  test('are native: the jutsu, quick strike, cheer, arrival, fizzle and dispel all cel moves', () => {
    ensure()
    for (const n of CAST) {
      expect(NATIVE[n.id]).toBe(n)
      expect(movesOf(n.id)).toBe(n.moves)
      expect(playOf(n.id, QUICK_INDEX)!).toBe(n.quick)
      expect(playOf(n.id, CHEER_INDEX)!).toBe(n.cheer)
      for (const index of MOVE_INDEXES) {
        const m = playOf(n.id, index) as CelMove
        expect({ id: n.id, index, cels: 'frames' in m }).toEqual({ id: n.id, index, cels: true })
        expect({ id: n.id, index, frames: m.frames.length }).toEqual({ id: n.id, index, frames: Math.round(totalOf(m) * 10) })
      }
    }
  })

  test('keep the names, shouts, triggers, dojutsu and beat shouts of the moves they replace', () => {
    ensure()
    for (const n of CAST) {
      const old = OLD[n.id]!
      movesOf(n.id).forEach((m, i) => {
        const was = old[i]!
        expect({ id: n.id, i, name: m.name, shout: m.shout, on: m.on, dojutsu: m.dojutsu }).toEqual({ id: n.id, i, name: was.name, shout: was.shout, on: was.on, dojutsu: was.dojutsu })
        for (const b of was.beats) if (b.shout) expect({ id: n.id, move: m.name, beat: b.name, shout: m.beats.find(x => x.name === b.name)?.shout }).toEqual({ id: n.id, move: m.name, beat: b.name, shout: b.shout })
      })
    }
    // the quick strikes, as moves.ts's QUICK table names them
    const quick: Record<string, [string, string, boolean]> = {
      naruto: ['Uzumaki Barrage', 'Uzumaki Barrage', false],
      // (her quick strike named for its shout, apart from her Gentle Fist jutsu)
      hinata: ['Byakugan Palm', 'Byakugan', true],
      sasuke: ['Lion Combo', 'Lion Combo', false],
    }
    for (const n of CAST) {
      const q = n.quick
      expect({ id: n.id, name: q.name, shout: q.shout, dojutsu: q.dojutsu, on: q.on, quick: q.quick }).toEqual({ id: n.id, name: quick[n.id]![0], shout: quick[n.id]![1], dojutsu: quick[n.id]![2], on: ['edit'], quick: true })
    }
  })

  test('keep the contract: their lengths, a launch before the first blow, the blow held (hit-stop), a recovery after it', () => {
    ensure()
    for (const n of CAST)
      // (a jutsu about five seconds: 4 s at the least, its tail after the blow trimmed short)
      for (const [m, lo, hi] of [...n.moves.map(m => [m, 4.0, 6.5] as const), [n.quick, 1.5, 2.0] as const]) {
        const total = totalOf(m)
        expect({ id: n.id, move: m.name, long: total >= lo - 1e-9 && total <= hi + 1e-9 }).toEqual({ id: n.id, move: m.name, long: true })
        const hit = hitsOf(m)[0]?.at
        expect({ id: n.id, move: m.name, blow: hit !== undefined }).toEqual({ id: n.id, move: m.name, blow: true })
        // a launch (the dash, the release...) or the shout before the first blow lands
        const first = m.beats.findIndex(b => /^(impact|finish|hit\d*)$/.test(b.name))
        const launched = m.beats.slice(0, first).some(b => LAUNCH.test(b.name) || b.shout === true)
        expect({ id: n.id, move: m.name, launched }).toEqual({ id: n.id, move: m.name, launched: true })
        // the first blow's first drawing held two frames (one cel of two, or
        // two of it: its first frame alone carrying the jolt or the flash)
        const at = m.frames.findIndex(f => /^(impact|finish|hit\d*)$/.test(f.tag))
        const [b0, b1] = [m.frames[at]!, m.frames[at + 1]]
        const held = b1 !== undefined && /^(impact|finish|hit\d*)$/.test(b1.tag) && b1.k?.pose === b0.k?.pose && b1.k?.x === b0.k?.x && (b1.k?.lift ?? 0) === (b0.k?.lift ?? 0) && JSON.stringify(b1.clones?.map(c => [c.pose, c.x, c.lift ?? 0])) === JSON.stringify(b0.clones?.map(c => [c.pose, c.x, c.lift ?? 0]))
        expect({ id: n.id, move: m.name, stop: held }).toEqual({ id: n.id, move: m.name, stop: true })
        // a jutsu cut short stops at a recovery after its blow
        const recover = -sinceOf(m, 0, 'recover')
        expect({ id: n.id, move: m.name, recover: recover > hit! }).toEqual({ id: n.id, move: m.name, recover: true })
      }
  })

  test('every frame of every move draws, the head on the canvas (rising past the top only in the air) and the eyes on the head', () => {
    ensure()
    for (const n of CAST) {
      const colours = eyeColours(n)
      for (const index of MOVE_INDEXES) {
        const m = playOf(n.id, index) as CelMove
        for (let i = 0; i < m.frames.length; i++) {
          const st = moveState(n.id, index, i / 10)
          const words = pixelCells(st, byId(n.id).glow, SPRITE.columns, SPRITE.rows)
          expect({ id: n.id, index, i, bad: badCell(words) }).toEqual({ id: n.id, index, i, bad: -1 })
          const cel = m.frames[i]!
          const h = native(st).head
          if (!cel.k) {
            expect(h).toBeNull()
            continue
          }
          const air = (cel.k.lift ?? 0) > 0
          const onCanvas = h!.top >= (air ? -LEAP_CLIP : 0) && h!.x >= 0 && h!.x + 21 <= STAGE_W && h!.y + 19 <= STAGE_H
          expect({ id: n.id, index, i, onCanvas }).toEqual({ id: n.id, index, i, onCanvas: true })
          // the back of a head (Sasuke's backflip) has no face to draw
          if (cel.k.eyes === 'none') continue
          // the left eye drawn on the head, in the eyes' own colours (under
          // what is drawn in front of them: effects, a clone)
          const eyes = cel.k.eyes ?? n.poseEyes?.[cel.k.pose] ?? poseOf(dressOf(n), cel.k.pose).eyes ?? 'open'
          const bare = compose(n, { ...cel, fx: cel.fx?.filter(e => e.back), clones: [] }, cel.t, { ...faceOfEyes(eyes, cel.k.awake === true), eyes }, { move: true })
          // (at the drawn head's own eyes: a turned head's sit nearer the post)
          const eye = leftEye(bare.px, n, bare.head!.x, bare.head!.y, layoutOf(n, cel.k).head.eyes[0])
          expect({ id: n.id, index, i, eyes: eye.some(c => colours.has(c)) }).toEqual({ id: n.id, index, i, eyes: true })
        }
      }
    }
  })

  test('name only poses, effects, frames, palettes and posts that exist', () => {
    ensure()
    for (const n of CAST) {
      const t = dressOf(n)
      for (const index of MOVE_INDEXES) {
        const m = playOf(n.id, index) as CelMove
        for (const f of m.frames) {
          for (const k of [...(f.k ? [f.k] : []), ...(f.clones ?? [])]) expect({ id: n.id, pose: k.pose, ok: (() => (poseOf(t, k.pose), true))() }).toEqual({ id: n.id, pose: k.pose, ok: true })
          if (f.post) expect({ id: n.id, post: f.post, ok: POST[f.post] !== undefined }).toEqual({ id: n.id, post: f.post, ok: true })
          for (const e of f.fx ?? []) {
            const fam = FX[e.fx]
            expect({ id: n.id, fx: e.fx, known: fam !== undefined }).toEqual({ id: n.id, fx: e.fx, known: true })
            if (typeof e.f === 'number') expect({ id: n.id, fx: e.fx, f: e.f, ok: e.f >= 0 && e.f < fam!.frames.length }).toEqual({ id: n.id, fx: e.fx, f: e.f, ok: true })
            if (e.pal) expect({ id: n.id, pal: e.pal, ok: FX_PALETTES[e.pal] !== undefined }).toEqual({ id: n.id, pal: e.pal, ok: true })
          }
        }
      }
    }
  })

  test('every frame of a jutsu and a quick strike shows something of its own, never the ninja just standing', () => {
    ensure()
    for (const n of CAST) {
      const glow = byId(n.id).glow
      const rest = new Set<string>()
      for (const pose of ['idle', 'crossed', byId(n.id).cheer.pose] as Pose[])
        for (const mood of MOODS)
          for (const bob of [0, 1])
            for (const gaze of [-0.8, -0.4, 0, 0.4])
              for (const blink of [0, 0.62, 1]) for (const active of [false, true]) rest.add(Array.from(sprite(still(n.id, pose, mood, { bob, face: { blink, gaze: [gaze, 0], mood, active } }), glow, 48, 24)).join())
      for (const index of [0, 1, 2, QUICK_INDEX]) {
        const m = playOf(n.id, index)!
        for (let t = 0; t < totalOf(m) - 1e-9; t += 0.1) expect({ id: n.id, index, t: frameTime(t), rest: rest.has(Array.from(sprite(moveState(n.id, index, t), glow, 48, 24)).join()) }).toEqual({ id: n.id, index, t: frameTime(t), rest: false })
      }
    }
  })

  test("the cheer is the roster's: its pose and face by the time the hello looks, then the breath out (rule 5)", () => {
    ensure()
    for (const n of CAST) {
      const { pose, mood } = byId(n.id).cheer
      const m = playOf(n.id, CHEER_INDEX)!
      expect({ id: n.id, at: poseAt(m, 0.6) }).toMatchObject({ id: n.id, at: { pose, mood } })
      // it ends on idle1 with the head a pixel down, then idle0, and shows
      // idle0 nowhere else
      const f = (m as CelMove).frames
      expect({ id: n.id, end: [f.at(-2)!.k?.pose, f.at(-2)!.k?.hdy, f.at(-1)!.k?.pose] }).toEqual({ id: n.id, end: ['idle1', 1, 'idle0'] })
      expect({ id: n.id, idle0: f.slice(0, -1).filter(x => x.k?.pose === 'idle0').length }).toEqual({ id: n.id, idle0: 0 })
    }
    // each its own: a leap into the thumbs-up, a bow into the shy poke, no hop at all
    const air = (id: string) => (playOf(id, CHEER_INDEX) as CelMove).frames.some(f => (f.k?.lift ?? 0) > 0)
    expect([air('naruto'), air('hinata'), air('sasuke')]).toEqual([true, false, false])
  })
})

// ---------------------------------------------------------------- at rest

describe('at rest', () => {
  test('every companion pose, mood, blink, breath and dojutsu draws, the head whole and the eyes on it', () => {
    ensure()
    for (const n of CAST) {
      const glow = byId(n.id).glow
      const colours = eyeColours(n)
      for (const pose of POSES)
        for (const mood of MOODS)
          for (const blink of [0, 0.5, 1])
            for (const bob of [0, 1])
              for (const active of [false, true]) {
                const st = still(n.id, pose, mood, { bob, face: { blink, gaze: [blink ? -0.8 : 0, 0], mood, active } })
                expect({ id: n.id, pose, mood, blink, bob, bad: badCell(pixelCells(st, glow, SPRITE.columns, SPRITE.rows)) }).toEqual({ id: n.id, pose, mood, blink, bob, bad: -1 })
                const h = native(st).head!
                expect({ id: n.id, pose, bob, whole: h.top >= 0 && h.y + 18 <= STAGE_H && h.x >= 0 && h.x + 21 <= STAGE_W }).toEqual({ id: n.id, pose, bob, whole: true })
                const px = sprite(st, glow, 48, 24)
                expect({ id: n.id, pose, mood, blink, eyes: leftEye(px as unknown as Int32Array, n, h.x, h.y).some(c => colours.has(c)) }).toEqual({ id: n.id, pose, mood, blink, eyes: true })
              }
    }
  })

  test('every badge sits by the head in every pose', () => {
    ensure()
    for (const n of CAST)
      for (const pose of POSES)
        for (const badge of BADGES) {
          const st = still(n.id, pose, badge === 'sleep' ? 'sleep' : 'calm', { badge })
          expect({ id: n.id, pose, badge, bad: badCell(pixelCells(st, byId(n.id).glow, SPRITE.columns, SPRITE.rows)) }).toEqual({ id: n.id, pose, badge, bad: -1 })
          const peek = pixelCells(st, byId(n.id).glow, 22, 8, undefined, 'peek')
          expect({ id: n.id, pose, badge, peek: badCell(peek) }).toEqual({ id: n.id, pose, badge, peek: -1 })
        }
  })

  test('the face follows the companion: every mood, the blink, a glance', () => {
    ensure()
    for (const n of CAST) {
      const look = (st: ChibiState): string => {
        const f = native(st)
        const h = f.head!
        const out: number[] = []
        for (let y = h.y + 10; y < h.y + 17; y++) for (let x = h.x + 4; x < h.x + 17; x++) out.push(f.px[y * STAGE_W + x]!)
        return out.join()
      }
      const looks = new Set<string>()
      for (const mood of ['calm', 'focus', 'happy', 'worried', 'surprised', 'sleep'] as Mood[]) looks.add(look(still(n.id, 'idle', mood)))
      looks.add(look(still(n.id, 'idle', 'calm', { face: { blink: 0.62, gaze: [0, 0], mood: 'calm', active: false } })))
      looks.add(look(still(n.id, 'idle', 'calm', { face: { blink: 0, gaze: [-0.8, 0], mood: 'calm', active: false } })))
      expect({ id: n.id, looks: looks.size }).toEqual({ id: n.id, looks: 8 })
    }
  })

  test("their own faces: Naruto's grin in his thumbs-up, Hinata shy in her poke, Sasuke's smirk", () => {
    ensure()
    const at = (id: string, pose: Pose, mood: Mood) => Array.from(native(still(id, pose, mood)).px)
    // his teeth, her small mouth, the corner of his
    expect(has(at('naruto', 'thumbs', 'happy'), 0xfff8f0)).toBe(true)
    expect(has(at('naruto', 'idle', 'happy'), 0xfff8f0)).toBe(false)
    expect(has(at('hinata', 'poke', 'happy'), 0xa85a62)).toBe(true)
    expect(has(at('hinata', 'idle', 'happy'), 0xa85a62)).toBe(false)
    expect(has(at('sasuke', 'crossed', 'calm'), 0x8a5248)).toBe(true)
    expect(has(at('sasuke', 'idle', 'smug'), 0x8a5248)).toBe(true)
    expect(has(at('sasuke', 'idle', 'calm'), 0x8a5248)).toBe(false)
  })

  test('the dojutsu when it wakes: the Byakugan veins, the Sharingan in both eyes; Naruto sleeps in his nightcap', () => {
    ensure()
    const awake = (id: string, active: boolean) => Array.from(native(still(id, 'think', 'focus', { face: { blink: 0, gaze: [0, 0.3], mood: 'focus', active } })).px)
    expect(has(awake('hinata', true), 0xb98ac8)).toBe(true)
    expect(has(awake('hinata', false), 0xb98ac8)).toBe(false)
    const red = (px: number[]) => px.filter(c => c === 0xe0222c).length
    expect(red(awake('sasuke', true))).toBeGreaterThanOrEqual(2)
    expect(red(awake('sasuke', false))).toBe(0)
    // Sage Mode in a move: the pigment on the head and the toad's gold eyes
    const sage = NARUTO.moves[2]!.frames.find(f => f.k?.awake)!
    const px = Array.from(compose(NARUTO, sage, sage.t, faceOfEyes(sage.k!.eyes ?? 'open', true), { move: true }).px)
    expect(has(px, 0xe0602a) && has(px, 0xffb428)).toBe(true)
    // the cap, over the head, only asleep
    expect(has(Array.from(native(still('naruto', 'sleep', 'sleep')).px), 0xb4e0f8)).toBe(true)
    expect(has(Array.from(native(still('naruto', 'idle', 'calm')).px), 0xb4e0f8)).toBe(false)
  })
})

// ---------------------------------------------------------------- props and clones

describe('the jutsu draw what they say', () => {
  test("Sasuke's Kusanagi is drawn in the Chidori Katana and nowhere else", () => {
    ensure()
    const BLADE = 0xa9b3c8
    const shows = (index: number) => {
      const m = playOf('sasuke', index)! as CelMove
      return m.frames.filter((_, i) => has(sprite(moveState('sasuke', index, i / 10), byId('sasuke').glow, 48, 24), BLADE)).length
    }
    expect(shows(2)).toBeGreaterThan(15)
    for (const index of [0, 1, QUICK_INDEX, CHEER_INDEX]) expect({ index, blade: shows(index) }).toEqual({ index, blade: 0 })
    for (const pose of POSES) expect({ pose, blade: has(sprite(still('sasuke', pose), byId('sasuke').glow, 48, 24), BLADE) }).toEqual({ pose, blade: false })
  })

  test('the Shadow Clones rush the post one after another, each a blow of its own, the star on the wood, the smoke behind them', () => {
    ensure()
    const m = NARUTO.moves[1]!
    const withClones = m.frames.filter(f => (f.clones?.length ?? 0) > 0)
    expect(withClones.length).toBeGreaterThan(15)
    // three blows, the post rocked on each
    const hits = m.frames.filter(f => /^hit\d*$/.test(f.tag))
    const tags = [...new Set(hits.map(f => f.tag))]
    expect(tags.length).toBe(3)
    expect(hits.every(f => f.post === 'lean')).toBe(true)
    // each its own: a flying kick (in the air), a slide feet first (sunk to
    // the ground), a punch dropped on it
    const blows = tags.map(tag => hits.find(f => f.tag === tag)!.clones![0]!)
    expect(blows.map(c => c.pose)).toEqual(['kick', 'kick', 'punch'])
    expect({ high: (blows[0]!.lift ?? 0) >= 3, low: (blows[1]!.dy ?? 0) >= 2 }).toEqual({ high: true, low: true })
    // the star's heart on the post's own columns where the foot or fist meets
    // it (never out on the clone's face)
    for (const f of hits) for (const e of f.fx ?? []) if (e.fx === 'impact') expect({ t: f.t, onPost: Array.isArray(e.at) && e.at[0] + (e.d?.[0] ?? 0) <= POST_X + 3 }).toEqual({ t: f.t, onPost: true })
    // the clones pop in and out of puffs behind them, never a puff over a face
    for (const f of m.frames) for (const c of f.clones ?? []) expect({ t: f.t, puff: c.puff }).toEqual({ t: f.t, puff: undefined })
    for (const f of m.frames.slice(m.frames.indexOf(hits[0]!))) for (const e of f.fx ?? []) if (e.fx === 'smoke' && f.tag !== 'recover') expect({ t: f.t, back: e.back === true }).toEqual({ t: f.t, back: true })
    // the post never sinks (that gag did not read)
    expect(Math.max(...m.frames.map(f => f.pdy ?? 0))).toBe(0)
    // none left by the recovery
    expect(m.frames.filter(f => f.tag === 'recover' && (f.clones?.length ?? 0) > 0)).toEqual([])
  })
})

// ---------------------------------------------------------------- round 6

// the ninja's own drawing on a frame of a move: the drawing a hold resolves
// its pose to (its stirring or its breath), where it lands, the head and face
const drawing = (n: NinjaSprite, f: Frame): string => {
  if (!f.k) return 'none'
  const L = layoutOf(n, f.k)
  return JSON.stringify([L.pose.rows, L.left, L.top, L.hx, L.hy, L.head.rows, f.k.eyes ?? '', f.k.awake === true])
}
// how much of two moves is the same pose at the same place, frame for frame
// (the best of their alignments a few frames either way)
const alike = (a: readonly Frame[], b: readonly Frame[]): number => {
  const sig = (f: Frame): string => (f.k ? `${f.k.pose}|${f.k.x}|${f.k.lift ?? 0}` : '-')
  let best = 0
  for (let s = -6; s <= 6; s++) {
    let m = 0
    for (let t = 0; t < a.length; t++) if (t + s >= 0 && t + s < b.length && sig(a[t]!) === sig(b[t + s]!)) m++
    best = Math.max(best, m)
  }
  return best / Math.max(a.length, b.length)
}
const BLOWS = new Set(['strike', 'punch', 'kick', 'dash', 'smear', 'whip', 'kStrike', 'kPunch', 'kSmear', 'kDash'])

describe('round 6: motion that never stands still', () => {
  test('no drawing is held longer than 0.8 s: the holds stir (their `<pose>Wind` drawings) or breathe', () => {
    ensure()
    for (const n of CAST)
      for (const index of [0, 1, 2, QUICK_INDEX, CHEER_INDEX]) {
        const m = playOf(n.id, index) as CelMove
        let run = 1
        let longest = 1
        for (let i = 1; i < m.frames.length; i++) {
          run = drawing(n, m.frames[i]!) === drawing(n, m.frames[i - 1]!) ? run + 1 : 1
          longest = Math.max(longest, run)
        }
        expect({ id: n.id, index, longest: longest <= 8 }).toEqual({ id: n.id, index, longest: true })
      }
  })

  test('the blows are struck with the head turned three-quarters to the post', () => {
    ensure()
    for (const n of CAST) {
      expect(Object.keys(n.heads ?? {})).toContain('turn')
      for (const m of [...n.moves, n.quick])
        for (const f of m.frames) {
          if (!f.k || !BLOWS.has(f.k.pose) || f.tag === 'palms' || f.k.eyes === 'happy') continue
          expect({ id: n.id, move: m.name, t: f.t, pose: f.k.pose, turned: (f.k.head ?? '').startsWith('turn') }).toEqual({ id: n.id, move: m.name, t: f.t, pose: f.k.pose, turned: true })
        }
    }
  })

  test('every jutsu and quick strike ends on the breath out (idle1, the head a pixel down), then two frames standing', () => {
    ensure()
    for (const n of CAST)
      for (const m of [...n.moves, n.quick]) {
        const [a, b, c] = m.frames.slice(-3)
        expect({ id: n.id, move: m.name, end: [a!.k?.pose, a!.k?.hdy, b!.k?.pose, c!.k?.pose] }).toEqual({ id: n.id, move: m.name, end: ['idle1', 1, 'idle0', 'idle0'] })
        // and no move washes the whole stage for a flash
        expect({ id: n.id, move: m.name, tinted: m.frames.some(f => f.tint !== undefined) }).toEqual({ id: n.id, move: m.name, tinted: false })
      }
  })
})

describe("round 6: Naruto", () => {
  test("the Shadow Clones keep to the arena: no clone's face ever under his head, their hair never off the stage's top but a leap's", () => {
    ensure()
    // a head's box on the stage: its drawn columns and rows
    const box = (n: NinjaSprite, k: Parameters<typeof layoutOf>[1], flip = false) => {
      const L = layoutOf(n, k)
      const w = Math.max(...L.head.rows.map(r => r.length))
      const x0 = flip ? 2 * k.x - (L.hx + w - 1) : L.hx
      return { x0, x1: x0 + w - 1, top: L.hy + L.head.rows.findIndex(r => /[^.]/.test(r)) }
    }
    for (const index of [1, QUICK_INDEX]) {
      const m = playOf('naruto', index) as CelMove
      for (const f of m.frames) {
        const clones = f.clones ?? []
        expect({ index, t: f.t, clones: clones.length <= 2 }).toEqual({ index, t: f.t, clones: true })
        for (const cl of clones) {
          const b = box(NARUTO, cl, cl.flip === true)
          const air = (cl.lift ?? 0) > 0
          expect({ index, t: f.t, x: cl.x, top: b.top >= (air ? -LEAP_CLIP : 0), left: b.x0 >= (air ? -2 : 0) }).toEqual({ index, t: f.t, x: cl.x, top: true, left: true })
          if (!f.k || cl.ghost !== undefined) continue
          // behind him in depth, and its face never under his head: both its
          // eyes (the eye grid a pixel past each point) left of his head's
          // drawn edge on their row
          if (cl.x <= f.k.x) expect({ index, t: f.t, behind: (cl.z ?? 0) < 0 }).toEqual({ index, t: f.t, behind: true })
          const C = layoutOf(NARUTO, cl)
          const L = layoutOf(NARUTO, f.k)
          for (const [ex, ey] of C.head.eyes) {
            const row = L.head.rows[C.hy + ey - L.hy]
            const edge = row === undefined || row.search(/[^.]/) < 0 ? Infinity : L.hx + row.search(/[^.]/)
            expect({ index, t: f.t, x: cl.x, clear: C.hx + ex + 1 < edge }).toEqual({ index, t: f.t, x: cl.x, clear: true })
          }
        }
      }
    }
    // "Go!": he points them in at about 1.5 s, no seal held as a statue
    const m = NARUTO.moves[1]!
    const go = m.frames.findIndex(f => f.k?.pose === 'point')
    expect(go / 10).toBeGreaterThanOrEqual(1)
    expect(go / 10).toBeLessThanOrEqual(1.6)
    expect(m.frames.filter(f => f.k?.pose === 'sign3').length).toBeLessThanOrEqual(12)
    expect(m.shout).toBe('Shadow Clone Jutsu')
  })

  test('the Rasenshuriken: cocked behind him two frames, the arm a blur, the strike and its follow-through, the flare pulsing in two-frame beats', () => {
    ensure()
    const cels = NARUTO.moves[2]!.cels
    const i = cels.findIndex(c => c.k?.pose === 'whip')
    expect(i).toBeGreaterThan(1)
    // (two cels: the Sage Mode flare fading through them)
    expect(cels.slice(i - 2, i).map(c => [c.n, c.k?.pose, c.k?.x])).toEqual([
      [1, 'windup', HOME + 2],
      [1, 'windup', HOME + 2],
    ])
    expect([cels[i]!.n, cels[i + 1]!.k?.pose, cels[i + 2]!.k?.pose]).toEqual([1, 'strike', 'follow'])
    const flares = NARUTO.moves[2]!.frames.filter(f => f.tag === 'charge' && f.k?.pose === 'raise').map(f => f.fx?.find(e => e.fx === 'sageAura')?.f)
    expect(new Set(flares).size).toBe(2)
  })

  test('his whiskers are two thin dark lines on each cheek, not a smudge', () => {
    const rows = NARUTO.head.rows
    expect([...rows[14]!].filter(ch => ch === 'w').length).toBe(4)
    expect([...rows[16]!].filter(ch => ch === 'w').length).toBe(4)
    expect(rows[15]!.includes('w')).toBe(false)
    expect(rows.join('').split('f').length - 1).toBe(1)
  })
})

describe('round 6: Hinata', () => {
  test('Twin Lion Fists: two lions from the second\'s birth through the blows, and never a frame without one from the first to the release', () => {
    ensure()
    const m = HINATA.moves[0]!
    const lions = (f: Frame): number => (f.fx ?? []).filter(e => e.fx === 'twinLion' || e.fx === 'twinLionLow' || e.fx === 'twinLionForm').length
    const born = m.frames.findIndex(f => lions(f) >= 2)
    const first = m.frames.findIndex(f => lions(f) >= 1)
    const last = m.frames.findLastIndex(f => lions(f) >= 1)
    expect(born).toBeGreaterThan(first)
    for (let i = first; i <= last; i++) expect({ i, lit: lions(m.frames[i]!) >= 1 }).toEqual({ i, lit: true })
    for (let i = born; i <= last; i++) if (/^(charge|dash|hit)$/.test(m.frames[i]!.tag)) expect({ i, twin: lions(m.frames[i]!) }).toEqual({ i, twin: 2 })
  })

  test('the Sixty-Four Palms Protection is hers: a wall of palm arcs, never Neji\'s Rotation', () => {
    ensure()
    const used = new Set(HINATA.moves[2]!.frames.flatMap(f => (f.fx ?? []).map(e => e.fx)))
    expect(used.has('palmFan')).toBe(true)
    expect(used.has('rotation')).toBe(false)
  })

  test('her quick strike is her own: not Kakashi\'s, nor her Gentle Fist\'s, frame for frame', () => {
    ensure()
    expect(alike(HINATA.quick.frames, NATIVE.kakashi!.quick.frames)).toBeLessThan(0.5)
    expect(alike(HINATA.quick.frames, HINATA.moves[1]!.frames)).toBeLessThan(0.5)
    // the Gentle Fist glides in low, afterimages behind; the quick strike
    // springs over in the air instead and drops on the post palm first
    expect(HINATA.moves[1]!.frames.some(f => f.clones?.some(c => c.ghost === 'chakra'))).toBe(true)
    expect(HINATA.quick.frames.some(f => f.clones?.some(c => c.ghost === 'chakra'))).toBe(false)
    const blow = HINATA.quick.frames.findIndex(f => f.tag === 'impact')
    expect(HINATA.quick.frames.slice(0, blow).some(f => (f.k?.lift ?? 0) >= 5)).toBe(true)
  })
})

describe('round 6: Sasuke', () => {
  test('his Chidori is his own: the thousand birds, his low stance, speed lines where he stood, the backflip home; not the Raikiri frame for frame', () => {
    ensure()
    const m = SASUKE.moves[0]!
    const used = new Set(m.frames.flatMap(f => (f.fx ?? []).map(e => e.fx)))
    expect(used.has('chidoriBirds')).toBe(true)
    expect(used.has('chidori')).toBe(false)
    // the crackle grows: a spark, a knot, the first chirps, the birds, then a second flock over the first
    const first = (name: string): number => m.frames.findIndex(f => f.fx?.some(e => e.fx === name))
    expect(first('chidoriBuild')).toBeLessThan(first('chidoriChirp'))
    expect(first('chidoriChirp')).toBeLessThan(first('chidoriBirds'))
    expect(m.frames.some(f => f.tag === 'charge' && (f.fx ?? []).filter(e => e.fx === 'chidoriBirds').length === 2)).toBe(true)
    // his body answers it: the arm kicked back, a flare of light round him, the static in his hair
    expect(m.frames.some(f => f.tag === 'charge' && f.flash === 'rim')).toBe(true)
    expect(m.frames.some(f => f.tag === 'charge' && f.fx?.some(e => e.at === 'head'))).toBe(true)
    // no one drawing held at one place over 7 frames through the charge
    const go = m.frames.findIndex(f => f.tag === 'dash')
    let run = 1
    for (let i = 1; i < go; i++) {
      const [a, b] = [m.frames[i - 1]!.k, m.frames[i]!.k]
      run = a && b && a.pose === b.pose && Math.abs(a.x - b.x) <= 1 ? run + 1 : 1
      expect({ i, run: run <= 7 }).toEqual({ i, run: true })
    }
    // no full afterimage of him (it read as a pane of glass): speed lines
    expect(m.frames.some(f => f.clones?.some(c => c.ghost !== undefined))).toBe(false)
    expect(used.has('streak')).toBe(true)
    // the backflip: tucked, up in one arc to 6 px and more and down, the head upright
    const air = m.frames.filter(f => f.tag === 'back' && (f.k?.lift ?? 0) > 0).map(f => f.k!.lift!)
    const top = air.indexOf(Math.max(...air))
    expect(Math.max(...air)).toBeGreaterThanOrEqual(6)
    for (let i = 1; i < air.length; i++) expect({ i, arc: i <= top ? air[i]! > air[i - 1]! : air[i]! < air[i - 1]! }).toEqual({ i, arc: true })
    expect(m.frames.some(f => f.k?.pose === 'flip' || f.k?.head === 'roll')).toBe(false)
    expect(alike(m.frames, NATIVE.kakashi!.moves[0]!.frames)).toBeLessThan(0.5)
  })

  test('the Great Fireball: the breath in (the head back three frames), snapped forward, the head jolted by the fire, the fire only ever going forward, a 20 x 18 ball over the post, the wood lit orange', () => {
    ensure()
    const peak = FX.greatFireball!.frames.map(f => compile('rows' in f ? f.rows : f)).find(g => g.w === 26 && g.h === 22)
    expect(peak).toBeDefined()
    const m = SASUKE.moves[1]!
    expect(m.frames.filter(f => f.tag === 'inhale' && f.k?.pose === 'inhale').length).toBe(3)
    expect(JACKET.poses.inhale!.head).toEqual([2, 0])
    // acting through the fire: leaning into it at the lips, then braced
    // against its push (sunk on the back foot) and the arms thrown wide, the
    // head knocked back; the body's weight thrown in a step and shoved back
    const release = m.frames.filter(f => f.tag === 'release')
    expect(release.every(f => f.k!.x >= HOME - 2 && f.k!.x <= HOME + 2)).toBe(true)
    expect(new Set(release.map(f => f.k?.x)).size).toBeGreaterThan(1)
    expect(new Set(release.map(f => f.k?.hdx ?? 0)).size).toBeGreaterThanOrEqual(2)
    for (const pose of ['think', 'windup', 'spread']) expect({ pose, acted: release.some(f => f.k?.pose === pose) }).toEqual({ pose, acted: true })
    // and no long tail: from the blow to the end, under 1.8 s
    expect(m.frames.length - m.frames.findIndex(f => f.tag === 'impact')).toBeLessThan(18)
    // the fire's leading (left) edge never moves back toward him, from the
    // spark at the lips to the ball breaking over the post
    const FIRE = new Set(['greatFireballForm', 'fireStream', 'greatFireball'])
    const lead = (f: Frame): number | null => {
      let best: number | null = null
      for (const e of f.fx ?? []) {
        if (!FIRE.has(e.fx) || typeof e.at === 'string' || typeof e.f !== 'number') continue
        const fam = FX[e.fx]!
        const fr = fam.frames[e.f]!
        const [rows, anchor] = 'rows' in fr ? [fr.rows, fr.anchor] : [fr, fam.anchor]
        const col = Math.min(...rows.map(r => r.search(/[^.]/)).filter(c => c >= 0))
        const x = e.at[0] + (e.d?.[0] ?? 0) - anchor[0] + col
        best = best === null ? x : Math.min(best, x)
      }
      return best
    }
    const leads = m.frames.slice(m.frames.findIndex(f => f.tag === 'release'), m.frames.findIndex(f => f.tag === 'impact') + 1).map(lead).filter((x): x is number => x !== null)
    expect(leads.length).toBeGreaterThan(5)
    for (let i = 1; i < leads.length; i++) expect({ i, forward: leads[i]! <= leads[i - 1]! }).toEqual({ i, forward: true })
    const used = m.frames.flatMap(f => (f.fx ?? []).map(e => `${e.fx}:${e.f}`))
    expect(used).toContain('greatFireball:4')
    expect(used).toContain('heatFlash:0')
  })

  test('his cheer is his own: a hand to the hair, the Chidori\'s sparks off his fingers, the head turned away on a smirk, the arms folded only at the end', () => {
    ensure()
    const f = SASUKE.cheer.frames
    expect(f.slice(0, 2).map(x => x.k?.pose)).toEqual(['flick', 'flick'])
    // a gesture: sparks crackling off the hand
    const sparks = f.filter(x => (x.fx ?? []).some(e => e.at === 'hand' && /^(chidoriBuild|sparks)$/.test(e.fx)))
    expect(sparks.length).toBeGreaterThanOrEqual(3)
    expect(f.some(x => x.k?.head === 'away' && x.k.eyes === 'smug')).toBe(true)
    // the folded arms a third of it at most
    expect(f.filter(x => x.k?.pose === 'crossed').length).toBeLessThanOrEqual(Math.floor(f.length / 3))
    // both fists inside the body's width
    const rows = JACKET.poses.crossed!.rows
    const fists = rows.flatMap((r, y) => [...r].flatMap((ch, x) => (/[SK]/i.test(ch) ? [[x, y] as const] : [])))
    expect(fists.every(([x]) => x > 4 && x < 21)).toBe(true)
  })
})

// ---------------------------------------------------------------- round 7

describe('round 7: drawings that read', () => {
  test('the folded arms: two forearms that cross, the near one climbing in a 1 px diagonal step outlined dark, the far one under it, the jacket above and the hem below', () => {
    for (const name of ['crossed', 'crossedIn', 'crossedWind']) {
      const rows = JACKET.poses[name]!.rows
      // the near forearm (the cuff's light, c): one run a row, each row's run
      // starting right of the one under it (it climbs toward the far side)
      const near = rows.flatMap((r, y) => {
        const i = r.slice(0, 22).search(/c/)
        return i >= 0 ? [{ y, x0: i, x1: r.slice(0, 22).lastIndexOf('c') }] : []
      })
      expect({ name, steps: near.length }).toEqual({ name, steps: 3 })
      for (let i = 1; i < near.length; i++) expect({ name, climbs: near[i]!.x0 < near[i - 1]!.x0 && near[i]!.y === near[i - 1]!.y + 1 }).toEqual({ name, climbs: true })
      // each step outlined dark where it rises: an outline beside each run's
      // leading end, so a light sleeve never reads as one flat bar
      for (const s of near.slice(1)) expect({ name, y: s.y, edged: rows[s.y]![s.x1 + 1] === 'b' || rows[s.y]![s.x1 + 1] === 'o' || rows[s.y - 1]![s.x1] === 'o' }).toEqual({ name, y: s.y, edged: true })
      // the far forearm in the cuff's shade (b) along the bottom row of the arms
      const low = near[near.length - 1]!.y
      expect({ name, far: (rows[low]!.match(/b/g) ?? []).length >= 5 }).toEqual({ name, far: true })
      // the jacket's body above the near forearm, the hem band below both
      expect({ name, jacket: /[vwx]/.test(rows[near[0]!.y]!) }).toEqual({ name, jacket: true })
      expect({ name, hem: /i{6}/.test(rows[low + 1]!) }).toEqual({ name, hem: true })
      const bars = near.map(s => s.y)
      // inside the torso's outline on each side
      for (const y of bars) {
        const r = rows[y]!
        expect({ name, y, inside: r.indexOf('o') < r.search(/[cbsk]/i) && r.lastIndexOf('o') > Math.max(r.lastIndexOf('c'), r.lastIndexOf('b'), r.lastIndexOf('k')) }).toEqual({ name, y, inside: true })
      }
      // a 2 x 2 fist of skin
      const skin = (x: number, y: number) => /[sk]/i.test(rows[y]?.[x] ?? '.')
      const fist = rows.some((r, y) => [...r].some((_, x) => skin(x, y) && skin(x + 1, y) && skin(x, y + 1) && skin(x + 1, y + 1)))
      expect({ name, fist }).toEqual({ name, fist: true })
    }
  })

  test('the rabbit seal: the hands down at the collar, under the head (never a beard over the mouth)', () => {
    for (const name of ['sign2', 'sign2In', 'sign2Wind']) {
      const rows = JACKET.poses[name]!.rows
      expect({ name, over: rows.some(r => /[A-Z]/.test(r)) }).toEqual({ name, over: false })
      // the fingertips no higher than the row under the collar
      const collar = rows.findIndex(r => /f/.test(r))
      const tips = rows.findIndex(r => /[sk]/.test(r.slice(8, 18)))
      expect({ name, low: tips >= collar + 1 }).toEqual({ name, low: true })
    }
  })

  test('the turned heads: the face three pixels toward the post and the hair swung back, so the outline changes', () => {
    for (const n of CAST) {
      const turn = n.heads!.turn!
      // (measured from the neck each is seated by)
      expect({ id: n.id, eyes: turn.eyes[0][0] - turn.neck[0] - (n.head.eyes[0][0] - n.head.neck[0]) }).toEqual({ id: n.id, eyes: -3 })
      // the head proper, down to the eyes (her long hair falls past it)
      const width = (rows: readonly string[]) => {
        const drawn = rows.slice(0, 14).filter(r => /[^.]/.test(r))
        return Math.max(...drawn.map(r => r.replace(/\.+$/, '').length)) - Math.min(...drawn.map(r => r.search(/[^.]/)))
      }
      expect({ id: n.id, wider: width(turn.rows) >= width(n.head.rows) + 1 }).toEqual({ id: n.id, wider: true })
      expect(turn.neck[1]).toBe(n.head.neck[1])
    }
    // Hinata's turned head is a profile, not a box of hair: her face at its
    // front edge (skin in its first two columns), and her hair falling down
    // her back past the chin, behind a gap at the jaw
    const T = HINATA.heads!.turn!.rows
    expect(T.some(r => /^[.o]?e/.test(r))).toBe(true)
    expect(T.slice(17).some(r => /a/.test(r))).toBe(true)
    expect(T.slice(16, 18).every(r => /o\.+o/.test(r))).toBe(true)
  })

  test("Hinata's palm fan: five solid crescents, each outlined, fanned out one strike a frame", () => {
    const frames = FX.palmFan!.frames.map(f => ('rows' in f ? f.rows : f) as readonly string[])
    // the solid pixels (all but the outline) in separate pieces
    const pieces = (rows: readonly string[]): number => {
      const seen = new Set<string>()
      let n = 0
      rows.forEach((r, y) =>
        [...r].forEach((ch, x) => {
          if (ch === '.' || ch === 'n' || seen.has(`${x},${y}`)) return
          n++
          const stack = [[x, y]]
          while (stack.length) {
            const [px, py] = stack.pop()!
            const key = `${px},${py}`
            const c = rows[py!]?.[px!]
            if (seen.has(key) || c === undefined || c === '.' || c === 'n') continue
            seen.add(key)
            stack.push([px! + 1, py!], [px! - 1, py!], [px!, py! + 1], [px!, py! - 1])
          }
        }),
      )
      return n
    }
    expect(frames.slice(0, 5).map(pieces)).toEqual([1, 2, 3, 4, 5])
    for (const f of frames.slice(5)) expect(pieces(f)).toBe(5)
    // each piece outlined: no solid pixel touches the clear air
    for (const f of frames)
      f.forEach((r, y) =>
        [...r].forEach((ch, x) => {
          if (ch === '.' || ch === 'n') return
          for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) expect({ x, y, edge: (f[y + dy]?.[x + dx] ?? 'n') !== '.' }).toEqual({ x, y, edge: true })
        }),
      )
  })
})

describe('round 7: motion', () => {
  test('no move shows the rest stance but its last two frames', () => {
    ensure()
    for (const n of CAST)
      for (const m of [...n.moves, n.quick]) {
        const f = m.frames
        expect({ id: n.id, move: m.name, idle0: f.slice(0, -2).filter(x => x.k?.pose === 'idle0').length }).toEqual({ id: n.id, move: m.name, idle0: 0 })
      }
  })

  test('no whole-body shudder: the body steps back and forth no faster than every three frames', () => {
    ensure()
    for (const n of CAST)
      for (const m of [...n.moves, n.quick, n.cheer]) {
        const at = m.frames.map(f => (f.k ? `${f.k.x}|${f.k.dy ?? 0}|${f.k.lift ?? 0}` : '-'))
        // a flip there and straight back within two frames, on the ground
        for (let i = 1; i + 1 < at.length; i++)
          if (at[i] !== at[i - 1] && at[i + 1] === at[i - 1] && !(m.frames[i]!.k?.lift ?? 0)) expect({ id: n.id, move: m.name, i, shudder: true }).toEqual({ id: n.id, move: m.name, i, shudder: false })
      }
  })

  test("Hinata's Twin Lion Fists: through the charge her arms keep their length, the lions carry the reach", () => {
    ensure()
    const m = HINATA.moves[0]!
    const home = m.frames.filter(f => f.tag === 'charge')
    expect(home.length).toBeGreaterThan(8)
    expect(home.filter(f => f.k?.pose === 'strike')).toEqual([])
    expect(home.filter(f => f.k?.pose === 'punch').length).toBeLessThanOrEqual(3)
    // her own key through it: the coil, drawn back low onto the back foot
    expect(home.some(f => f.k?.pose === 'windup')).toBe(true)
    // and her quick strike opens on her own seal, not the rest stance
    expect(HINATA.quick.frames[0]!.k?.pose).not.toBe('idle0')
  })
})

// ---------------------------------------------------------------- round 8

// a move's frame t drawn as the companion draws it, its effects in or not
const drawn = (n: NinjaSprite, f: Frame, t: number, fx = true): Int32Array => {
  const eyes = f.k ? (f.k.eyes ?? n.poseEyes?.[f.k.pose] ?? poseOf(dressOf(n), f.k.pose).eyes ?? 'open') : 'open'
  return compose(n, fx ? f : { ...f, fx: [] }, t, { ...faceOfEyes(eyes, f.k?.awake === true), eyes }, { move: true }).px
}
// the pixels an effect's frame draws
const area = (e: { fx: string; f: number | 'cycle' }): number => {
  const fam = FX[e.fx]!
  const fr = fam.frames[typeof e.f === 'number' ? e.f : 0]!
  return ('rows' in fr ? fr.rows : fr).join('').replace(/\./g, '').length
}

describe('round 8', () => {
  test("Twin Lion Fists: two solid lion heads, three tones and an outline each, the second a step dimmer and stacked over the first, never over her face", () => {
    ensure()
    for (const name of ['twinLion', 'twinLionLow', 'twinLionForm']) for (const fr of FX[name]!.frames) expect({ name, ok: /^[nbcd.]*$/.test(('rows' in fr ? fr.rows : fr).join('')) }).toEqual({ name, ok: true })
    const lum = (c: number): number => (c >> 16) + ((c >> 8) & 255) + (c & 255)
    expect(Object.keys(FX_PALETTES.lions!).sort()).toEqual(['b', 'c', 'd', 'n'])
    expect(Object.keys(FX_PALETTES.lionsDim!).sort()).toEqual(['b', 'c', 'd', 'n'])
    expect(lum(FX_PALETTES.lionsDim!.c!)).toBeLessThan(lum(FX_PALETTES.lions!.c!))
    // a lion, not a fish: the mane a ring darker than the face, round it
    // above (over the brow) and below (a ruff under the jaw); an ear; the
    // jaw open in a wedge on a fang above and one below
    expect(lum(FX_PALETTES.lions!.b!)).toBeLessThan(lum(FX_PALETTES.lions!.c!) - 150)
    for (const name of ['twinLion', 'twinLionLow']) {
      const rows = FX[name]!.frames[0] as readonly string[]
      const face = rows.flatMap((r, y) => (/c/.test(r) ? [y] : []))
      expect({ name, brow: rows.slice(0, face[0]!).some(r => /b/.test(r)), ruff: rows.slice(face[face.length - 1]! + 1).filter(r => /[bd]/.test(r)).length >= 1 }).toEqual({ name, brow: true, ruff: true })
      // the jaw: a gap in it (the open mouth) with pale fangs above and below
      const gap = rows.findIndex(r => /c\.+c/.test(r.slice(0, 8)))
      expect({ name, open: gap > 0 }).toEqual({ name, open: true })
    }
    // the low lion two pixels smaller than the high one
    const size = (name: string) => [(FX[name]!.frames[0] as readonly string[])[0]!.length, (FX[name]!.frames[0] as readonly string[]).length]
    expect(size('twinLionLow')).toEqual([size('twinLion')[0]! - 2, size('twinLion')[1]! - 2])
    // the outline far darker than her hair, so the two never run together
    expect(lum(FX_PALETTES.lions!.n!)).toBeLessThan(lum(HINATA.head.palette.b!) - 60)
    const m = HINATA.moves[0]!
    const LION = new Set(['twinLion', 'twinLionLow', 'twinLionForm'])
    let two = 0
    m.frames.forEach((f, t) => {
      const lions = (f.fx ?? []).filter(e => LION.has(e.fx))
      if (lions.length === 2 && /^(charge|dash|hit)$/.test(f.tag)) {
        two++
        const dim = lions.find(e => e.pal === 'lionsDim')
        const bright = lions.find(e => e.pal !== 'lionsDim')
        expect({ t, dim: dim !== undefined, bright: bright !== undefined }).toEqual({ t, dim: true, bright: true })
        expect({ t, stacked: (dim!.d?.[1] ?? 0) <= (bright!.d?.[1] ?? 0) - 5 }).toEqual({ t, stacked: true })
      }
      // her face: every skin pixel of her head drawn without the lions is
      // still hers with them (the rest of the move's effects in both)
      if (!f.k) return
      const L = layoutOf(HINATA, f.k)
      const bare = drawn(HINATA, { ...f, fx: (f.fx ?? []).filter(e => !LION.has(e.fx)) }, t)
      const lit = drawn(HINATA, f, t)
      let covered = 0
      for (let y = Math.max(0, L.hy); y < Math.min(STAGE_H, L.hy + L.head.rows.length); y++)
        for (let x = Math.max(0, L.hx); x < Math.min(STAGE_W, L.hx + L.head.rows[0]!.length); x++) {
          const i = y * STAGE_W + x
          if ((L.head.rows[y - L.hy]?.[x - L.hx] ?? '.') !== '.' && bare[i] === 0xf9dfcc && lit[i] !== 0xf9dfcc) covered++
        }
      expect({ t, covered }).toEqual({ t, covered: 0 })
    })
    expect(two).toBeGreaterThan(10)
  })

  test('the Shadow Clones: one at a time, the post seen between them, every head on the stage', () => {
    ensure()
    const m = NARUTO.moves[1]!
    expect(m.frames.every(f => (f.clones ?? []).length <= 1)).toBe(true)
    const hits = m.frames.map((f, i) => (/^hit/.test(f.tag) && !/^hit/.test(m.frames[i - 1]?.tag ?? '') ? i : -1)).filter(i => i >= 0)
    expect(hits.length).toBe(3)
    // between the first blow and the last, frames with no clone on the stage
    const gaps = m.frames.slice(hits[0]!, hits[hits.length - 1]!).filter(f => !(f.clones ?? []).length).length
    expect(gaps).toBeGreaterThanOrEqual(4)
    // in the air no clone lifted more than 6 (its hair cut at most LEAP_CLIP: the arena test)
    for (const f of m.frames) for (const cl of f.clones ?? []) expect({ t: f.t, low: (cl.lift ?? 0) <= 6 }).toEqual({ t: f.t, low: true })
    // the crouched clone in the smoke sits lower than his head
    const crouched = m.frames.find(f => f.clones?.some(c => c.pose === 'crouch'))!
    expect((crouched.clones!.find(c => c.pose === 'crouch')!.dy ?? 0) >= 2).toBe(true)
  })

  test('the Rasengan: the ball grows in the palm, a squash as it churns, no hold over 0.8 s, two strides of smear, a two-frame hit-stop, a burst that knocks the post back under a three-frame jolt, a grin', () => {
    ensure()
    const m = NARUTO.moves[0]!
    expect(m.frames.length).toBeGreaterThanOrEqual(45)
    expect(m.frames.length).toBeLessThanOrEqual(65)
    // the charge grows: knot, bead, ball, then the overcharged churn, in that order
    const grown = m.frames.flatMap(f => (f.fx ?? []).filter(e => e.fx === 'rasenCharge').map(e => e.f as number))
    expect(grown.slice(0, 6)).toEqual([0, 1, 2, 3, 4, 5])
    // the squash: both palms round it, sunk into his knees
    expect(m.frames.some(f => f.tag === 'charge' && f.k?.pose === 'gather' && (f.k.dy ?? 0) >= 1)).toBe(true)
    // no one drawing held at one place over 7 frames before the blow
    const blow = m.frames.findIndex(f => f.tag === 'impact')
    let run = 1
    for (let i = 1; i < blow; i++) {
      const [a, b] = [m.frames[i - 1]!.k, m.frames[i]!.k]
      run = a && b && a.pose === b.pose && Math.abs(a.x - b.x) <= 1 ? run + 1 : 1
      expect({ i, run: run <= 7 }).toEqual({ i, run: true })
    }
    // two strides across the ground, then the blow frozen two frames
    const dash = m.frames.filter(f => f.tag === 'dash')
    expect(dash.length).toBe(2)
    expect(dash[0]!.k!.x).toBeGreaterThan(dash[1]!.k!.x)
    const [h0, h1] = [m.frames[blow]!, m.frames[blow + 1]!]
    expect([h1.k?.pose, h1.k?.x]).toEqual([h0.k?.pose, h0.k?.x])
    expect(h0.flash).toBe('post')
    // the burst: torn wind over the post, the post knocked back 3 px and tilted, the stage jolted three frames by turns
    const burst = m.frames.findIndex(f => f.fx?.some(e => e.fx === 'rasenBurst'))
    expect(burst).toBeGreaterThan(blow)
    expect(m.frames[burst]!.post).toBe('scorchLean')
    expect(Math.min(...m.frames.map(f => f.pdx ?? 0))).toBeLessThanOrEqual(-3)
    const shaken = m.frames.map((f, i) => (f.shake ? i : -1)).filter(i => i >= 0)
    expect(shaken).toEqual([burst, burst + 1, burst + 2])
    expect(m.frames.some(f => f.k?.pose === 'follow' && f.k.eyes === 'grin' && f.k.head === undefined)).toBe(true)
  })

  test("the Great Fireball's climax is the move's biggest effect frame, 18 px tall and more", () => {
    ensure()
    const m = SASUKE.moves[1]!
    const size = (f: Frame): number => (f.fx ?? []).reduce((t, e) => t + area(e), 0)
    const biggest = m.frames.reduce((b, f, i) => (size(f) > size(m.frames[b]!) ? i : b), 0)
    expect(m.frames[biggest]!.tag).toBe('impact')
    const ball = m.frames[biggest]!.fx!.find(e => e.fx === 'greatFireball')!
    const fr = FX.greatFireball!.frames[ball.f as number]!
    expect(('rows' in fr ? fr.rows : fr).length).toBeGreaterThanOrEqual(18)
  })

  test("Sasuke leaves the post three ways: the Chidori's tucked backflip, the Katana's Body Flicker, the Lion Combo's skip; the Kusanagi's charge stirs", () => {
    ensure()
    // no sideways rolled head anywhere (it read as a glitch)
    for (const m of [...SASUKE.moves, SASUKE.quick]) expect({ move: m.name, rolled: m.frames.some(f => f.k?.pose === 'flip' || f.k?.head === 'roll') }).toEqual({ move: m.name, rolled: false })
    // the Katana: gone in a puff (no ninja drawn), back home in another
    const katana = SASUKE.moves[2]!.frames.filter(f => f.tag === 'back')
    expect(katana.some(f => !f.k && (f.fx ?? []).some(e => e.fx === 'smoke'))).toBe(true)
    expect(SASUKE.moves[2]!.frames.some(f => f.clones?.some(c => c.ghost !== undefined))).toBe(false)
    // the Lion Combo: a low skip, 3 px at most
    expect(Math.max(...SASUKE.quick.frames.filter(f => f.tag === 'back').map(f => f.k?.lift ?? 0))).toBeLessThanOrEqual(3)
    expect(dressOf(SASUKE).poses.kChargeWind).toBeDefined()
    expect(SASUKE.moves[2]!.frames.some(f => f.k?.pose === 'kCharge' && f.k.held !== undefined)).toBe(true)
  })

  test("Hinata's shy poke sits at the chest: the hands a row under the collar, no outline between the fingertips", () => {
    const rows = JACKET.poses.poke!.rows
    // nothing of the hands in the rows the chin covers
    for (const y of [5, 6, 7]) expect({ y, hands: /[sSkK]/.test(rows[y]!) }).toEqual({ y, hands: false })
    expect(rows.some(r => /[sS]{2}/.test(r))).toBe(true)
    expect(rows.join('').includes('OO')).toBe(false)
  })
})

