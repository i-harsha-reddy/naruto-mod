import { describe, expect, test } from 'claude-code/testing'
import type { ChibiState, Pose } from '../hooks/art/chibi.ts'
import { SPRITE, pixelCells, sprite } from '../hooks/art/pixel.ts'
import { climax, frameTime, hitsOf, poseAt, shoutSpan, totalOf } from '../hooks/art/move.ts'
import { CHEER_INDEX, QUICK_INDEX, ARRIVAL_INDEX, FIZZLE_INDEX, DISPEL_INDEX, movesOf, playOf } from '../hooks/art/moves.ts'
import type { Mood } from '../hooks/art/portrait.ts'
import { byId } from '../hooks/roster.ts'
import { poseOf } from '../hooks/sprite/cels.ts'
import { compose, layoutOf } from '../hooks/sprite/compose.ts'
import { dressOf } from '../hooks/sprite/dress.ts'
import { FX, FX_PALETTES } from '../hooks/sprite/fx/index.ts'
import { compile, missing } from '../hooks/sprite/grid.ts'
import { NATIVE, PEEK_LEFT, STAGE_H, STAGE_W, frameOf } from '../hooks/sprite/index.ts'
import { DEIDARA } from '../hooks/sprite/ninja/deidara.ts'
import { ITACHI } from '../hooks/sprite/ninja/itachi.ts'
import { KISAME } from '../hooks/sprite/ninja/kisame.ts'
import { OBITO } from '../hooks/sprite/ninja/obito.ts'
import { PAIN } from '../hooks/sprite/ninja/pain.ts'
import { POST } from '../hooks/sprite/post.ts'
import { CLOAK } from '../hooks/sprite/templates/cloak.ts'
import type { CelMove, NinjaSprite } from '../hooks/sprite/types.ts'
import { JUTSU } from './jutsu.ts'
import { LEAP_CLIP } from '../hooks/sprite/anims/kit.ts'

// The Akatsuki cloak: Itachi, Kisame, Deidara, Pain and Obito, drawn natively
// on the 'cloak' template (templates/cloak.ts), their moves hand-keyed cels.

// ---------------------------------------------------------------- helpers

const CAST: Readonly<Record<string, NinjaSprite>> = { itachi: ITACHI, kisame: KISAME, deidara: DEIDARA, pain: PAIN, obito: OBITO }
const IDS = Object.keys(CAST)
const OLD = JUTSU

const POSES: readonly Pose[] = ['idle', 'crossed', 'think', 'signs', 'signs2', 'signs3', 'charge', 'gather', 'strike', 'punch', 'kick', 'dash', 'slam', 'raise', 'alert', 'thumbs', 'scratch', 'spread', 'poke', 'sleep', 'slump', 'tuck']
const MOODS: readonly Mood[] = ['calm', 'focus', 'happy', 'worried', 'surprised', 'sleep', 'smug']
const INDEXES = [0, 1, 2, QUICK_INDEX, CHEER_INDEX, ARRIVAL_INDEX, FIZZLE_INDEX, DISPEL_INDEX]

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
const native = (st: ChibiState) => frameOf(NATIVE[st.id]!, st, play(st.id), {})

const GLYPHS = new Set([0x20, 0x2580, 0x2584, 0x2588])
const DEFAULT = 0x01000000
const badCell = (words: Uint32Array): number => {
  for (let o = 0; o < words.length; o += 3) {
    if (!GLYPHS.has(words[o]!)) return o / 3
    for (const c of [words[o + 1]!, words[o + 2]!]) if (c !== DEFAULT && c > 0xffffff) return o / 3
  }
  return -1
}

// a ninja's eye colours (their hand-drawn eyes' palette)
const eyeColours = (n: NinjaSprite): Set<number> => new Set(Object.values(n.eyes!.palette).filter((c): c is number => c !== null))
// the 2 x 2 of the viewer's left eye where the head landed (on the head drawn:
// a variant head, the turned one, seats its eyes where it draws them)
const leftEye = (px: Int32Array, n: NinjaSprite, h: { x: number; y: number }, head?: string): number[] => {
  const [ex, ey] = (head ? n.heads?.[head] : undefined)?.eyes[0] ?? n.head.eyes[0]
  return [0, 1].flatMap(dy => [0, 1].map(dx => px[(h.y + ey + dy) * STAGE_W + h.x + ex + dx]!))
}
// the beats that name a shout outright
const shouted = (m: { beats: readonly { name: string; shout?: unknown }[] }): string[] => m.beats.filter(b => b.shout === true).map(b => b.name)

// the launches the companion shouts from (move.ts shoutSpan's)
const LAUNCH = /^(release|dash|throw|launch|leap|dive|fly|flash|step|slam|poof|scatter|stare|swing)\d*$/

// ---------------------------------------------------------------- registered

describe('the Akatsuki cloak, native', () => {
  test('each of the five is drawn natively, every move a cel move, a frame each tenth of a second', () => {
    for (const id of IDS) {
      expect({ id, native: NATIVE[id] === CAST[id] }).toEqual({ id, native: true })
      expect(playOf(id, QUICK_INDEX)!).toBe(CAST[id]!.quick)
      expect(playOf(id, CHEER_INDEX)!).toBe(CAST[id]!.cheer)
      for (const index of INDEXES) {
        const m = playOf(id, index) as CelMove
        expect({ id, index, cels: 'frames' in m }).toEqual({ id, index, cels: true })
        expect({ id, index, frames: m.frames.length }).toEqual({ id, index, frames: Math.round(totalOf(m) * 10) })
      }
    }
  })

  test('the moves keep their names, shouts, triggers, dojutsu and beat shouts', () => {
    for (const id of IDS) {
      const now = movesOf(id)
      const old = OLD[id]!
      expect({ id, names: now.map(m => m.name) }).toEqual({ id, names: old.map(m => m.name) })
      expect({ id, shouts: now.map(m => m.shout) }).toEqual({ id, shouts: old.map(m => m.shout) })
      expect({ id, on: now.map(m => m.on) }).toEqual({ id, on: old.map(m => m.on) })
      expect({ id, dojutsu: now.map(m => m.dojutsu) }).toEqual({ id, dojutsu: old.map(m => m.dojutsu) })
      expect({ id, beatShouts: now.map(shouted) }).toEqual({ id, beatShouts: old.map(shouted) })
    }
    // the quick strikes as moves.ts's QUICK table names them
    // (the shout at the throw, flick or leap, as moves.ts's quick strikes had it)
    const quick = (id: string) => {
      const q = playOf(id, QUICK_INDEX)!
      return { name: q.name, shout: q.shout, on: q.on, quick: q.quick, dojutsu: q.dojutsu, beatShouts: shouted(q) }
    }
    expect(quick('itachi')).toEqual({ name: 'Fire Style: Phoenix Flower Jutsu', shout: 'Phoenix Flower', on: ['edit'], quick: true, dojutsu: false, beatShouts: ['throw'] })
    expect(quick('kisame')).toEqual({ name: 'Water Style: Five Feeding Sharks', shout: 'Five Feeding Sharks', on: ['edit'], quick: true, dojutsu: false, beatShouts: ['flick'] })
    expect(quick('deidara')).toEqual({ name: 'Clay Bird', shout: 'Clay Bird', on: ['edit'], quick: true, dojutsu: false, beatShouts: ['flick'] })
    expect(quick('pain')).toEqual({ name: 'Chakra Rod', shout: 'Chakra Rod', on: ['edit'], quick: true, dojutsu: false, beatShouts: ['throw'] })
    expect(quick('obito')).toEqual({ name: 'Tobi Is a Good Boy', shout: 'Tobi is a good boy', on: ['edit'], quick: true, dojutsu: false, beatShouts: ['leap'] })
  })

  // (round 9 cut the dead time off the openings and tails: a jutsu runs 4 s or more)
  test('jutsu run 4 to 6.5 s and quick strikes 1.5 to 2 s, each with a blow, a recovery, and a launch or shout before the blow', () => {
    for (const id of IDS)
      for (const [index, m] of [...movesOf(id).map((m, i) => [i, m] as const), [QUICK_INDEX, playOf(id, QUICK_INDEX)!] as const]) {
        const total = totalOf(m)
        const [lo, hi] = index === QUICK_INDEX ? [1.5, 2.0] : [4.0, 6.5]
        expect({ id, move: m.name, total, ok: total >= lo - 1e-6 && total <= hi + 1e-6 }).toEqual({ id, move: m.name, total, ok: true })
        const names = m.beats.map(b => b.name)
        const first = names.findIndex(b => b === 'impact' || /^hit\d*$/.test(b))
        expect({ id, move: m.name, blow: first >= 0, recover: names.lastIndexOf('recover') > first }).toEqual({ id, move: m.name, blow: true, recover: true })
        const launched = names.slice(0, first).some(b => LAUNCH.test(b)) || m.beats.some(b => b.shout === true)
        expect({ id, move: m.name, launched }).toEqual({ id, move: m.name, launched: true })
        // the shout comes at the climax, and the climax comes
        let any = false
        for (let t = 0; t < total; t += 0.1) any ||= climax(m, frameTime(t))
        expect({ id, move: m.name, climax: any, short: m.shout.length > 0 && m.shout.length <= 24 }).toEqual({ id, move: m.name, climax: true, short: true })
        expect(shoutSpan(m)[0]).toBeLessThan(hitsOf(m)[0]!.at + 1e-6)
        // hit-stop: the blow's first drawing (its pose, where it stands) is held
        // two frames at least, however the cels split them
        const frames = (m as CelMove).frames
        const at = frames.findIndex(f => f.tag === names[first])
        const same = (a: (typeof frames)[number], b: (typeof frames)[number] | undefined): boolean => b !== undefined && a.k?.pose === b.k?.pose && a.k?.x === b.k?.x && (a.k?.lift ?? 0) === (b.k?.lift ?? 0)
        expect({ id, move: m.name, held: same(frames[at]!, frames[at + 1]) }).toEqual({ id, move: m.name, held: true })
      }
  })
})

// ---------------------------------------------------------------- every frame

describe('every frame of every move', () => {
  test('draws, with the head on the canvas and the eyes on the head', () => {
    for (const id of IDS) {
      const n = CAST[id]!
      const t = dressOf(n)
      const colours = eyeColours(n)
      for (const index of INDEXES) {
        const m = playOf(id, index) as CelMove
        for (let i = 0; i < m.frames.length; i++) {
          const st = moveState(id, index, i / 10)
          const words = pixelCells(st, byId(id).glow, SPRITE.columns, SPRITE.rows)
          expect({ id, index, i, bad: badCell(words) }).toEqual({ id, index, i, bad: -1 })
          const f = native(st)
          const cel = m.frames[i]!
          if (!cel.k) {
            expect(f.head).toBeNull()
            continue
          }
          const h = f.head!
          // the whole head on the stage, but in the air the hair's top may be
          // cut by the stage's top (LEAP_CLIP pixels at most), and a shake
          // may jolt the whole frame a pixel
          const air = (cel.k.lift ?? 0) > 0
          const jolt = typeof cel.shake === 'number' ? Math.abs(cel.shake) : cel.shake ? Math.max(Math.abs(cel.shake[0]), Math.abs(cel.shake[1])) : 0
          const onCanvas = h.top >= (air ? -LEAP_CLIP : 0) - jolt && h.x >= 0 && h.x + 21 <= STAGE_W && h.y + 19 <= STAGE_H + jolt
          expect({ id, index, i, onCanvas }).toEqual({ id, index, i, onCanvas: true })
          // the left eye drawn on the head in the eyes' own colours (under the
          // effects in front, which may cover the face: a cloud, a vortex;
          // and under a flash's white silhouette)
          const eyes = cel.k.eyes ?? n.poseEyes?.[cel.k.pose] ?? poseOf(t, cel.k.pose).eyes ?? 'open'
          const { flash: _flash, ...unflashed } = cel
          const bare = compose(n, { ...unflashed, fx: cel.fx?.filter(e => e.back), clones: [] }, cel.t, { blink: 0, gaze: [0, 0], mood: 'calm', active: cel.k.awake === true, eyes }, { move: true }).px
          expect({ id, index, i, eyes: leftEye(bare, n, h, cel.k.head).some(c => colours.has(c)) }).toEqual({ id, index, i, eyes: true })
        }
      }
    }
  })

  test('names only poses, effects, effect frames, palettes and posts that exist', () => {
    for (const id of IDS) {
      const t = dressOf(CAST[id]!)
      for (const index of INDEXES) {
        const m = playOf(id, index) as CelMove
        for (const f of m.frames) {
          for (const k of [...(f.k ? [f.k] : []), ...(f.clones ?? [])]) expect(() => poseOf(t, k.pose)).not.toThrow()
          if (f.post) expect(POST[f.post]).toBeDefined()
          for (const e of f.fx ?? []) {
            const fam = FX[e.fx]
            expect({ id, fx: e.fx, known: fam !== undefined }).toEqual({ id, fx: e.fx, known: true })
            if (typeof e.f === 'number') expect({ id, fx: e.fx, f: e.f, ok: e.f >= 0 && e.f < fam!.frames.length }).toEqual({ id, fx: e.fx, f: e.f, ok: true })
            if (e.pal) {
              const p = FX_PALETTES[e.pal]
              expect({ fx: e.fx, pal: e.pal, known: p !== undefined }).toEqual({ fx: e.fx, pal: e.pal, known: true })
              // the swapped palette names every letter the family draws with
              for (const fr of fam!.frames) expect({ fx: e.fx, pal: e.pal, missing: missing('rows' in fr ? fr.rows : fr, p!) }).toEqual({ fx: e.fx, pal: e.pal, missing: [] })
            }
          }
        }
      }
    }
  })

  test("every frame of a jutsu and a quick strike shows something of its own, never the ninja just standing", () => {
    for (const id of IDS) {
      const glow = byId(id).glow
      const rest = new Set<string>()
      for (const pose of ['idle', 'crossed'] as Pose[])
        for (const mood of MOODS)
          for (const bob of [0, 1])
            for (const gaze of [-0.8, -0.4, 0, 0.4])
              for (const blink of [0, 0.62, 1])
                for (const active of [false, true]) rest.add(Array.from(sprite(still(id, pose, mood, { bob, face: { blink, gaze: [gaze, 0], mood, active } }), glow, 48, 24)).join())
      for (const index of [0, 1, 2, QUICK_INDEX]) {
        const m = playOf(id, index)!
        for (let t = 0; t < totalOf(m) - 1e-6; t += 0.1) expect({ id, index, t: frameTime(t), rest: rest.has(Array.from(sprite(moveState(id, index, t), glow, 48, 24)).join()) }).toEqual({ id, index, t: frameTime(t), rest: false })
      }
    }
  })
})

// ---------------------------------------------------------------- at rest

describe('the cloak at rest', () => {
  test('every companion pose, mood, blink, breath and dojutsu draws, the head whole and the eyes on it', () => {
    for (const id of IDS) {
      const n = CAST[id]!
      const colours = eyeColours(n)
      for (const pose of POSES)
        for (const mood of MOODS)
          for (const blink of [0, 0.5, 1])
            for (const bob of [0, 1])
              for (const active of [false, true]) {
                const st = still(id, pose, mood, { bob, face: { blink, gaze: [blink ? -0.8 : 0, 0], mood, active } })
                expect({ id, pose, mood, blink, bob, bad: badCell(pixelCells(st, byId(id).glow, SPRITE.columns, SPRITE.rows)) }).toEqual({ id, pose, mood, blink, bob, bad: -1 })
                const h = native(st).head!
                // (asleep, the breath sinks the chin's outline into the floor)
                expect({ id, pose, bob, whole: h.top >= 0 && h.y + 18 <= STAGE_H && h.x >= 0 && h.x + 21 <= STAGE_W }).toEqual({ id, pose, bob, whole: true })
                const px = sprite(st, byId(id).glow, 48, 24)
                expect({ id, pose, mood, blink, active, eyes: leftEye(px, n, h).some(c => colours.has(c)) }).toEqual({ id, pose, mood, blink, active, eyes: true })
              }
    }
  })

  test('the face follows the companion: moods, a blink, a glance; the Mangekyō wakes for Itachi and Obito', () => {
    const face = (st: ChibiState): string => {
      const f = native(st)
      const h = f.head!
      const out: number[] = []
      for (let y = h.y + 10; y < h.y + 17; y++) for (let x = h.x + 5; x < h.x + 16; x++) out.push(f.px[y * STAGE_W + x]!)
      return out.join()
    }
    for (const id of IDS) {
      const looks = new Set<string>()
      for (const mood of ['calm', 'focus', 'happy', 'sleep'] as Mood[]) looks.add(face(still(id, 'idle', mood)))
      looks.add(face(still(id, 'idle', 'calm', { face: { blink: 0.62, gaze: [0, 0], mood: 'calm', active: false } })))
      // (Obito's one eye hole shows a glance and a blink alike)
      expect({ id, looks: looks.size >= (id === 'obito' ? 3 : 4) }).toEqual({ id, looks: true })
    }
    for (const id of ['itachi', 'obito']) {
      const calm = face(still(id, 'think', 'calm'))
      const awake = face(still(id, 'think', 'calm', { face: { blink: 0, gaze: [0, 0], mood: 'calm', active: true } }))
      expect({ id, wakes: calm !== awake }).toEqual({ id, wakes: true })
    }
  })

  test("the cheer is the roster's: in its pose with its face by the time the hello looks, then settles (the breath let out, standing)", () => {
    for (const id of IDS) {
      const { pose, mood } = byId(id).cheer
      const m = playOf(id, CHEER_INDEX)!
      expect({ id, at: poseAt(m, 0.65) }).toMatchObject({ id, at: { pose, mood } })
      // rule 5: idle1 with the head a pixel down, then idle0 for a frame or two
      const f = (m as CelMove).frames
      const tail = f.slice(-3).map(x => `${x.k?.pose}${x.k?.hdy ? `h${x.k.hdy}` : ''}`)
      const ok = (tail[1] === 'idle1h1' && tail[2] === 'idle0') || (tail[0] === 'idle1h1' && tail[1] === 'idle0' && tail[2] === 'idle0')
      expect({ id, tail, ok }).toEqual({ id, tail, ok: true })
      // a short tail: about 1.6 s in all
      expect({ id, short: f.length <= 17 }).toEqual({ id, short: true })
      // and at rest the companion's cheer pose is the same drawing
      const rest = native(still(id, pose, mood))
      expect(rest.head).not.toBeNull()
    }
  })

  test('breathes: the stance in its two frames, elsewhere the head sinking a pixel', () => {
    for (const id of IDS) {
      const a = native(still(id, 'idle', 'calm', { bob: 0 }))
      const b = native(still(id, 'idle', 'calm', { bob: 1 }))
      expect({ id, breathes: Array.from(a.px).join() !== Array.from(b.px).join() }).toEqual({ id, breathes: true })
      for (const pose of ['think', 'crossed', 'signs'] as Pose[]) expect({ id, pose, sinks: native(still(id, pose, 'calm', { bob: 1 })).head!.y - native(still(id, pose)).head!.y }).toEqual({ id, pose, sinks: 1 })
    }
  })

  test('the peek shows the head whole', () => {
    for (const id of IDS) {
      const st = still(id, 'idle')
      const h = native(st).head!
      expect({ id, left: h.left >= PEEK_LEFT, right: h.x + 21 <= PEEK_LEFT + 22 }).toEqual({ id, left: true, right: true })
      expect(badCell(pixelCells(st, byId(id).glow, 22, 12, undefined, 'peek'))).toBe(-1)
    }
  })
})

// ---------------------------------------------------------------- the art's data

describe('the cloak art', () => {
  test("every companion pose is drawn, and every pose stands on its feet at its root in the template's letters", () => {
    for (const pose of POSES) expect({ pose, drawn: CLOAK.poses[CLOAK.map[pose]] !== undefined }).toEqual({ pose, drawn: true })
    expect(Object.keys(CLOAK.map).sort()).toEqual([...POSES].sort())
    // (31 drawings, the one-handed seal, and the stirring and breath of each
    // pose a hold rests in: crossed, sign2, think, strike, spread, raise,
    // seal, wave, and the gather, punch and charge Kisame and Pain hold)
    expect(Object.keys(CLOAK.poses).length).toBe(50)
    for (const pose of ['crossed', 'sign2', 'think', 'strike', 'spread', 'raise', 'seal', 'wave', 'gather', 'punch', 'charge']) expect({ pose, wind: CLOAK.poses[`${pose}Wind`] !== undefined }).toEqual({ pose, wind: true })
    for (const [name, p] of Object.entries(CLOAK.poses)) {
      const g = compile(p.rows)
      expect({ name, feet: /[^.]/.test(p.rows[p.rows.length - 1]!), root: CLOAK.root < g.w, as: p.as !== undefined }).toEqual({ name, feet: true, root: true, as: true })
      for (const row of p.rows) for (const ch of row) if (ch !== '.') expect({ name, ch, ok: CLOAK.letters.includes(ch.toLowerCase()) }).toEqual({ name, ch, ok: true })
      if (p.hand) expect({ name, hand: p.hand[0] >= 0 && p.hand[0] < g.w && p.hand[1] >= 0 && p.hand[1] < g.h }).toEqual({ name, hand: true })
      if (p.breath) expect(CLOAK.poses[p.breath]).toBeDefined()
    }
    // the three hands the cloak's sleeves moved (the strike's arm a row lower,
    // under the chin, its head carried up off it)
    expect([CLOAK.poses.strike!.hand, CLOAK.poses.follow!.hand, CLOAK.poses.punch!.hand]).toEqual([
      [0, 10],
      [0, 10],
      [1, 8],
    ])
  })

  test("each ninja's colours name every letter of their cloak, their own poses, props, heads and eyes", () => {
    for (const id of IDS) {
      const n = CAST[id]!
      for (const [name, p] of Object.entries(dressOf(n).poses)) expect({ id, name, missing: missing(p.rows, n.body) }).toEqual({ id, name, missing: [] })
      for (const p of n.props ?? []) expect({ id, missing: missing(p.rows, n.body) }).toEqual({ id, missing: [] })
      const heads = [n.head, ...(n.dojutsu?.head ? [n.dojutsu.head] : []), ...Object.values(n.heads ?? {})]
      for (const h of heads) {
        expect({ id, missing: missing(h.rows, h.palette), rows: h.rows.length }).toEqual({ id, missing: [], rows: 19 })
        for (const [x, y] of [...h.eyes, h.neck]) expect({ id, at: [x, y], on: h.rows[y]?.[x] !== undefined && h.rows[y]![x] !== '.' }).toEqual({ id, at: [x, y], on: true })
      }
      const grids = [...Object.values(n.eyes!.states), ...(n.dojutsu?.eyes ? [n.dojutsu.eyes] : []), ...Object.values(n.dojutsu?.states ?? {}).filter(e => e !== null)]
      for (const e of grids) expect({ id, missing: missing(e!.rows, n.eyes!.palette) }).toEqual({ id, missing: [] })
      // the eight faces drawn, and the smug look
      for (const s of ['open', 'left', 'half', 'shut', 'focus', 'happy', 'sad', 'wide', 'smug']) expect({ id, s, drawn: n.eyes!.states[s] !== undefined }).toEqual({ id, s, drawn: true })
    }
  })

  test("Samehada rides on Kisame's back, but not while it is in his hands", () => {
    const pixels = (pose: string): Int32Array => compose(KISAME, { n: 1, tag: 'x', k: { pose, x: 35 } }, 0, { blink: 0, gaze: [0, 0], mood: 'calm', active: false }).px
    const blade = 0xe2dcc8
    const right = (px: Int32Array): boolean => Array.from(px).some((c, i) => c === blade && i % STAGE_W > 40)
    expect(right(pixels('idle0'))).toBe(true)
    expect(right(pixels('heft'))).toBe(false)
    expect(right(pixels('chop'))).toBe(false)
  })
})

// ---------------------------------------------------------------- round 7's fixes, kept

describe('the cloak reads', () => {
  test('the rabbit seal is held at the collar, under the chin (never over the mouth, a beard)', () => {
    for (const name of ['sign2', 'sign2In', 'sign2Wind']) {
      const rows = CLOAK.poses[name]!.rows
      // no hand drawn over the head
      expect({ name, over: rows.some(r => /[SK]/.test(r)) }).toEqual({ name, over: false })
      // the hands' top at the collar: not above the row the chin sits on
      const top = rows.findIndex(r => /[sk]/.test(r))
      expect({ name, low: top >= rows.length - 1 - CLOAK.neck + 2 - (name === 'sign2In' ? 1 : 0) }).toEqual({ name, low: true })
    }
  })

  test('the folded arms (round 8): two rows of arm inside the body, the collar over them and a cloud under them, a fist at each end', () => {
    const idle = CLOAK.poses.idle0!.rows
    const span = (row: string): [number, number] => [row.search(/[^.]/), row.length - 1 - [...row].reverse().join('').search(/[^.]/)]
    // the body's widest at the arms' rows, standing
    const [il, ir] = [8, 9, 10].map(y => span(idle[y]!)).reduce(([l, r], [a, b]) => [Math.min(l, a), Math.max(r, b)])
    for (const name of ['crossed', 'crossedIn']) {
      const rows = CLOAK.poses[name]!.rows
      // the arms: the rows with the hands in them, exactly two, one under the other
      const arms = rows.map((r, y) => (/[sk]/i.test(r) ? y : -1)).filter(y => y >= 0)
      expect({ name, arms: arms.length, together: arms[1]! - arms[0]! }).toEqual({ name, arms: 2, together: 1 })
      for (const y of arms) {
        const [l, r] = span(rows[y]!)
        expect({ name, y, inside: l >= il && r <= ir }).toEqual({ name, y, inside: true })
      }
      // a row of the cloak over them (the collar's red V) and the cloud under them
      expect({ name, collar: /n/i.test(rows[arms[0]! - 1]!) && !/[sk]/i.test(rows[arms[0]! - 1]!), cloud: /bc+b/.test(rows[arms[1]! + 1]!) }).toEqual({ name, collar: true, cloud: true })
      // a fist of skin 2 x 2 at the near forearm's end, the far hand at the other end
      const skin = rows.flatMap((r, y) => [...r].map((ch, x) => (/[sk]/i.test(ch) ? [x, y] : null)).filter((p): p is number[] => p !== null))
      const xs = skin.map(p => p[0]!)
      expect({ name, fist: skin.filter(p => p[0]! >= Math.max(...xs) - 1).length >= 4, apart: Math.max(...xs) - Math.min(...xs) >= 10 }).toEqual({ name, fist: true, apart: true })
    }
  })

  test('the turned heads turn: the face three pixels toward the post, the hair swung back', () => {
    for (const id of IDS) {
      const n = CAST[id]!
      const turn = n.heads?.turn
      expect({ id, turn: turn !== undefined }).toEqual({ id, turn: true })
      expect({ id, shift: n.head.eyes[0][0] - turn!.eyes[0][0] }).toEqual({ id, shift: 3 })
      const right = (h: typeof turn) => Math.max(...h!.rows.map(r => r.length - 1 - [...r].reverse().join('').search(/[^.]/)))
      expect({ id, back: right(turn) - right(n.head) >= 2 }).toEqual({ id, back: true })
    }
  })

  test('a clone of Itachi never stands over his face', () => {
    const m = playOf('itachi', 1) as CelMove
    const face = (k: { x: number; pose: string; head?: string; hdx?: number; hdy?: number; lift?: number }): [number, number] => {
      const L = layoutOf(ITACHI, k as never)
      return [L.hx + 3, L.hx + 18]
    }
    for (const f of m.frames)
      for (const cl of f.clones ?? []) {
        const [a0, a1] = face(f.k!)
        const [b0, b1] = face(cl)
        expect({ t: f.t, clear: b1 < a0 || b0 > a1 }).toEqual({ t: f.t, clear: true })
      }
  })

  test("each climax is the move's own: Pain's gravity is his, C1 alone has the Katsu, the Nine-Tails fires a Tailed Beast Ball", () => {
    const fxOf = (id: string, i: number) => new Set((playOf(id, i) as CelMove).frames.flatMap(f => (f.fx ?? []).map(e => e.fx)))
    for (const i of [0, 1, 2, QUICK_INDEX, CHEER_INDEX]) expect({ i, aura: [...fxOf('pain', i)].some(n => n === 'aura' || n === 'auraLow') }).toEqual({ i, aura: false })
    expect(fxOf('pain', 0).has('gravityWell')).toBe(true)
    expect(fxOf('deidara', 0).has('katsu')).toBe(true)
    expect(fxOf('deidara', 2).has('katsu')).toBe(false)
    expect(fxOf('deidara', 2).has('airBurst')).toBe(true)
    expect(fxOf('deidara', QUICK_INDEX).has('katsu')).toBe(false)
    expect(fxOf('deidara', QUICK_INDEX).has('clayPop')).toBe(true)
    expect(fxOf('obito', 1).has('bijuudama')).toBe(true)
    expect(fxOf('obito', 1).has('shockRing')).toBe(false)
    // and no white post in the fox's jaws
    expect((playOf('obito', 1) as CelMove).frames.some(f => f.flash === 'post' && (f.fx ?? []).some(e => e.fx === 'kurama'))).toBe(false)
  })

  test("Chibaku Tensei's moon is a moon: 24 px across or more", () => {
    const moon = FX.chibaku!.frames[3]!
    const rows = 'rows' in moon ? moon.rows : moon
    const w = Math.max(...rows.map(r => (r.match(/[^.]/g) ? r.length - r.search(/[^.]/) - [...r].reverse().join('').search(/[^.]/) : 0)))
    expect(w).toBeGreaterThanOrEqual(24)
  })

  test('every jutsu and quick strike ends as rule 5 has it: idle1 a pixel down, then standing', () => {
    for (const id of IDS)
      for (const i of [0, 1, 2, QUICK_INDEX]) {
        const f = (playOf(id, i) as CelMove).frames
        const tail = f.slice(-3).map(x => `${x.k?.pose}${x.k?.hdy ? `h${x.k.hdy}` : ''}`)
        const ok = (tail[1] === 'idle1h1' && tail[2] === 'idle0') || (tail[0] === 'idle1h1' && tail[1] === 'idle0' && tail[2] === 'idle0')
        expect({ id, i, tail, ok }).toEqual({ id, i, tail, ok: true })
      }
  })
})

