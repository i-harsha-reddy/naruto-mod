// The vest group drawn natively: Shikamaru, Might Guy and Minato on the
// shared 'vest' template (their overlays, rules and own poses baked into
// their copies of it), Rock Lee on the 'jumpsuit' template
// (hooks/sprite/templates/jumpsuit.ts); their heads, hand-drawn eyes (their
// own states: Shikamaru's calm, Guy's and Lee's sparkle, Minato's wink) and
// cel moves (hooks/sprite/ninja/, hooks/sprite/anims/).

import { describe, expect, test } from 'claude-code/testing'
import type { ChibiState, Pose } from '../hooks/art/chibi.ts'
import { SPRITE, pixelCells, sprite } from '../hooks/art/pixel.ts'
import { climax, frameTime, hitsOf, poseAt, shoutAt, sinceOf, totalOf } from '../hooks/art/move.ts'
import { ARRIVAL_INDEX, CHEER_INDEX, DISPEL_INDEX, FIZZLE_INDEX, QUICK_INDEX, movesOf, playOf } from '../hooks/art/moves.ts'
import type { Mood } from '../hooks/art/portrait.ts'
import { byId } from '../hooks/roster.ts'
import { LEAP_CLIP } from '../hooks/sprite/anims/kit.ts'
import { faceOfEyes, poseOf } from '../hooks/sprite/cels.ts'
import { compose } from '../hooks/sprite/compose.ts'
import { dressOf } from '../hooks/sprite/dress.ts'
import { FX, FX_PALETTES } from '../hooks/sprite/fx/index.ts'
import { compile, missing, tableOf } from '../hooks/sprite/grid.ts'
import { NATIVE, STAGE_H, STAGE_W, frameOf, register } from '../hooks/sprite/index.ts'
import { GUY } from '../hooks/sprite/ninja/guy.ts'
import { LEE } from '../hooks/sprite/ninja/lee.ts'
import { MINATO } from '../hooks/sprite/ninja/minato.ts'
import { SHIKAMARU } from '../hooks/sprite/ninja/shikamaru.ts'
import { POST } from '../hooks/sprite/post.ts'
import { JUMPSUIT } from '../hooks/sprite/templates/jumpsuit.ts'
import { VEST } from '../hooks/sprite/templates/vest.ts'
import type { CelMove, HeadGrid, NinjaSprite } from '../hooks/sprite/types.ts'
import { JUTSU } from './jutsu.ts'

// ---------------------------------------------------------------- helpers

const CAST: readonly NinjaSprite[] = [SHIKAMARU, GUY, MINATO, LEE]
const OLD = JUTSU
// a leaping head may cut its hair's top by LEAP_CLIP (anims/kit.ts's leaps)
const HEAD_RISE = LEAP_CLIP
const POSES: readonly Pose[] = ['idle', 'crossed', 'think', 'signs', 'signs2', 'signs3', 'charge', 'gather', 'strike', 'punch', 'kick', 'dash', 'slam', 'raise', 'alert', 'thumbs', 'scratch', 'spread', 'poke', 'sleep', 'slump', 'tuck']
const MOODS: readonly Mood[] = ['calm', 'focus', 'happy', 'worried', 'surprised', 'sleep', 'smug']
const MOVE_INDEXES = [0, 1, 2, QUICK_INDEX, CHEER_INDEX, ARRIVAL_INDEX, FIZZLE_INDEX, DISPEL_INDEX]
const BADGES = ['think', 'read', 'search', 'edit', 'shell', 'alert', 'done', 'error', 'sleep'] as const
// the beats that launch a blow (move.ts's shout falls back on them)
const LAUNCH = /^(release|dash|throw|launch|leap|dive|fly|flash|step|slam|poof|scatter|stare|swing)\d*$/
const BLOW = /^(impact|finish|hit\d*)$/

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
// the left eye's 2 x 2 on a head drawn at (hx, hy), and the head's own pixels there
const leftEye = (px: ArrayLike<number>, head: HeadGrid, hx: number, hy: number): number[] => {
  const [ex, ey] = head.eyes[0]
  return [0, 1].flatMap(dy => [0, 1].map(dx => px[(hy + ey + dy) * STAGE_W + hx + ex + dx]!))
}
const bareEye = (head: HeadGrid): number[] => {
  const [ex, ey] = head.eyes[0]
  const t = tableOf(head.palette)
  return [0, 1].flatMap(dy => [0, 1].map(dx => t[head.rows[ey + dy]!.charCodeAt(ex + dx) & 127]!))
}
// the eyes drawn: some pixel of the 2 x 2 is an eye colour the head did not have there
const drawn = (eye: number[], bare: number[], colours: Set<number>): boolean => eye.some((c, i) => c !== bare[i] && colours.has(c))
const count = (px: ArrayLike<number>, colour: number): number => Array.prototype.filter.call(px, (c: number) => c === colour).length

// ---------------------------------------------------------------- the art's data

describe('the jumpsuit template', () => {
  test('every companion pose has its own drawing, under its name or the map', () => {
    expect(Object.keys(JUMPSUIT.map).sort()).toEqual([...POSES].sort())
    for (const pose of POSES) {
      const at = JUMPSUIT.poses[pose] ? pose : JUMPSUIT.map[pose]
      expect({ pose, drawn: JUMPSUIT.poses[at] !== undefined }).toEqual({ pose, drawn: true })
    }
    // the vest's 31, pose for pose (the same head offsets and hand anchors
    // where the vest has them), and the suit's own: the flying and rising
    // kicks, the rise out of a landing (a move's last frame before its
    // ending) and the thumbs-up's stir
    for (const name of Object.keys(VEST.poses)) expect({ name, drawn: JUMPSUIT.poses[name] !== undefined }).toEqual({ name, drawn: true })
    expect(Object.keys(JUMPSUIT.poses).sort()).toEqual([...Object.keys(VEST.poses), 'flykick', 'upkick', 'rise', 'thumbsWind'].sort())
    for (const [name, p] of Object.entries(VEST.poses)) expect({ name, head: JUMPSUIT.poses[name]!.head ?? [0, 0], as: JUMPSUIT.poses[name]!.as }).toEqual({ name, head: p.head ?? [0, 0], as: p.as })
  })

  test("every pose stands on its feet at its root, in the template's letters, every one in Lee's colours", () => {
    for (const [name, p] of Object.entries(JUMPSUIT.poses)) {
      const g = compile(p.rows)
      expect({ name, feet: /[^.]/.test(p.rows[p.rows.length - 1]!) }).toEqual({ name, feet: true })
      expect({ name, root: JUMPSUIT.root < g.w }).toEqual({ name, root: true })
      for (const row of p.rows) for (const ch of row) if (ch !== '.') expect({ name, ch, ok: JUMPSUIT.letters.includes(ch.toLowerCase()) }).toEqual({ name, ch, ok: true })
      expect({ name, missing: missing(p.rows, LEE.body) }).toEqual({ name, missing: [] })
      if (p.hand) expect({ name, hand: p.hand[0] >= 0 && p.hand[0] < g.w && p.hand[1] >= 0 && p.hand[1] < g.h }).toEqual({ name, hand: true })
      if (p.breath) expect({ name, breath: JUMPSUIT.poses[p.breath] !== undefined }).toEqual({ name, breath: true })
      expect({ name, as: p.as !== undefined && POSES.includes(p.as) }).toEqual({ name, as: true })
    }
    for (const ch of JUMPSUIT.letters) expect({ ch, mapped: ch in LEE.body }).toEqual({ ch, mapped: true })
  })
})

describe('the vest group, dressed', () => {
  test("each ninja's copy of their template: every pose in their colours, their overlays and own poses baked in, the template itself untouched", () => {
    const before = JSON.stringify(VEST.poses)
    for (const n of CAST) {
      const t = dressOf(n)
      for (const [name, p] of Object.entries(t.poses)) {
        expect({ id: n.id, name, missing: missing(p.rows, n.body) }).toEqual({ id: n.id, name, missing: [] })
        expect({ id: n.id, name, feet: /[^.]/.test(p.rows[p.rows.length - 1]!) }).toEqual({ id: n.id, name, feet: true })
      }
      for (const ch of n.template.letters) expect({ id: n.id, ch, mapped: ch in n.body }).toEqual({ id: n.id, ch, mapped: true })
      // an overlay for every pose it names
      for (const name of Object.keys(n.overlays ?? {})) expect({ id: n.id, name, posed: t.poses[name] !== undefined }).toEqual({ id: n.id, name, posed: true })
    }
    // Kakashi's vest is the vest: nobody's overlays leak into it
    expect(JSON.stringify(VEST.poses)).toBe(before)
    expect(dressOf(SHIKAMARU).poses['idle0']!.rows).not.toEqual(VEST.poses['idle0']!.rows)
    // Shikamaru's forehead protector on his arm, Minato's haori, Guy's warmers on both shins
    expect(dressOf(SHIKAMARU).poses['idle0']!.rows.join('')).toContain('gho')
    expect(dressOf(MINATO).poses['idle0']!.rows.join('')).toMatch(/ffjffjo/)
    expect(dressOf(GUY).poses['idle0']!.rows[11]).toMatch(/obbjoob/)
  })

  test("the heads and eyes use only their palettes' letters, the eyes and neck on the head, every face drawn", () => {
    for (const n of CAST) {
      const head = n.head
      expect({ id: n.id, missing: missing(head.rows, head.palette) }).toEqual({ id: n.id, missing: [] })
      expect(head.rows.length).toBe(19)
      for (const [x, y] of [...head.eyes, head.neck]) expect({ id: n.id, at: [x, y], on: head.rows[y]?.[x] !== undefined && head.rows[y]![x] !== '.' }).toEqual({ id: n.id, at: [x, y], on: true })
      const E = n.eyes!
      // both eyes in one grid (not mirrored)
      expect(E.mirror).toBeUndefined()
      for (const [state, e] of Object.entries(E.states)) expect({ id: n.id, state, missing: missing(e.rows, E.palette) }).toEqual({ id: n.id, state, missing: [] })
      // every face the companion asks for is drawn (none falls back)
      for (const state of ['open', 'left', 'half', 'shut', 'focus', 'happy', 'sad', 'wide', 'smug']) expect({ id: n.id, state, drawn: state in E.states }).toEqual({ id: n.id, state, drawn: true })
      for (const [pose, state] of Object.entries(n.poseEyes ?? {})) expect({ id: n.id, pose, drawn: state in E.states }).toEqual({ id: n.id, pose, drawn: true })
    }
    // their own states
    expect('calm' in SHIKAMARU.eyes!.states).toBe(true)
    expect('sparkle' in GUY.eyes!.states).toBe(true)
    expect('sparkle' in LEE.eyes!.states).toBe(true)
    expect('wink' in MINATO.eyes!.states).toBe(true)
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
        m.frames.forEach((f, i) => expect(f.t).toBe(i))
      }
    }
  })

  test('keep the names, shouts, triggers, dojutsu and beat shouts of the moves they replace', () => {
    ensure()
    for (const n of CAST) {
      const old = OLD[n.id]!
      expect(movesOf(n.id).length).toBe(old.length)
      movesOf(n.id).forEach((m, i) => {
        const was = old[i]!
        expect({ id: n.id, i, name: m.name, shout: m.shout, on: m.on, dojutsu: m.dojutsu }).toEqual({ id: n.id, i, name: was.name, shout: was.shout, on: was.on, dojutsu: was.dojutsu })
        for (const b of was.beats) if (b.shout) expect({ id: n.id, move: m.name, beat: b.name, shout: m.beats.find(x => x.name === b.name)?.shout }).toEqual({ id: n.id, move: m.name, beat: b.name, shout: b.shout })
        // and no beat shouts of their own
        for (const b of m.beats) if (b.shout) expect({ id: n.id, move: m.name, beat: b.name, old: was.beats.some(x => x.name === b.name && x.shout) }).toEqual({ id: n.id, move: m.name, beat: b.name, old: true })
      })
    }
    // the triggers as the roster's companion uses them: the signature on a shell command
    expect(movesOf('shikamaru').map(m => m.name)).toEqual(['Shadow Possession Jutsu', 'Shadow Neck Bind Jutsu', 'Shadow-Sewing Technique'])
    expect(movesOf('guy').map(m => m.on)).toEqual([['edit'], ['shell'], undefined])
    expect(movesOf('minato').map(m => m.on)).toEqual([['shell'], undefined, ['edit']])
    expect(movesOf('lee').map(m => m.on)).toEqual([['shell'], undefined, ['edit']])
    // the quick strikes, as moves.ts's QUICK table names them, with its beat shouts
    // (a throw's release, Minato's flash)
    const quick: Record<string, [string, string, string | null]> = {
      shikamaru: ['Flying Swallow', 'Flying Swallow', 'throw'],
      guy: ['Leaf Great Whirlwind', 'Leaf Great Whirlwind', null],
      minato: ['Yellow Flash', 'Yellow Flash', 'flash'],
      lee: ['Leaf Rising Wind', 'Leaf Rising Wind', null],
    }
    for (const n of CAST) {
      const q = n.quick
      const [name, shout, beat] = quick[n.id]!
      expect({ id: n.id, name: q.name, shout: q.shout, dojutsu: q.dojutsu, on: q.on, quick: q.quick }).toEqual({ id: n.id, name, shout, dojutsu: false, on: ['edit'], quick: true })
      expect({ id: n.id, shouts: q.beats.filter(b => b.shout).map(b => b.name) }).toEqual({ id: n.id, shouts: beat ? [beat] : [] })
    }
  })

  test('keep the contract: their lengths, a launch before the first blow, the blow held (hit-stop), a recovery after it', () => {
    ensure()
    for (const n of CAST)
      for (const [m, lo, hi] of [...n.moves.map(m => [m, 4.5, 6.5] as const), [n.quick, 1.5, 2.0] as const]) {
        const total = totalOf(m)
        expect({ id: n.id, move: m.name, total, long: total >= lo - 1e-9 && total <= hi + 1e-9 }).toEqual({ id: n.id, move: m.name, total, long: true })
        // an 'impact' beat, and the first blow of all
        expect({ id: n.id, move: m.name, impact: m.beats.some(b => b.name === 'impact') }).toEqual({ id: n.id, move: m.name, impact: true })
        const hit = hitsOf(m)[0]?.at
        expect({ id: n.id, move: m.name, blow: hit !== undefined }).toEqual({ id: n.id, move: m.name, blow: true })
        // a launch (the dash, the release...) or the shout before the first blow lands
        const first = m.beats.findIndex(b => BLOW.test(b.name))
        const launched = m.beats.slice(0, first).some(b => LAUNCH.test(b.name) || b.shout === true)
        expect({ id: n.id, move: m.name, launched }).toEqual({ id: n.id, move: m.name, launched: true })
        // the first blow's first drawing held two frames
        const blow = m.cels.find(c => BLOW.test(c.tag))!
        expect({ id: n.id, move: m.name, stop: blow.n >= 2 }).toEqual({ id: n.id, move: m.name, stop: true })
        // a jutsu cut short stops at a recovery after its blow, and it ends there
        const recover = -sinceOf(m, 0, 'recover')
        expect({ id: n.id, move: m.name, recover: recover > hit! }).toEqual({ id: n.id, move: m.name, recover: true })
        expect({ id: n.id, move: m.name, last: m.beats[m.beats.length - 1]!.name }).toEqual({ id: n.id, move: m.name, last: 'recover' })
        // the name is shouted at the climax, and only there
        expect({ id: n.id, move: m.name, shouted: m.frames.some(f => shoutAt(m, f.t / 10) === m.shout) }).toEqual({ id: n.id, move: m.name, shouted: true })
        expect({ id: n.id, move: m.name, quietStart: climax(m, 0) }).toEqual({ id: n.id, move: m.name, quietStart: false })
      }
  })

  test('every frame of every move draws, the head on the canvas (rising past the top only in the air) and the eyes on the head', () => {
    ensure()
    for (const n of CAST) {
      const colours = eyeColours(n)
      const bare = bareEye(n.head)
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
          const onCanvas = h!.top >= (air ? -HEAD_RISE : 0) && h!.x >= 0 && h!.x + 21 <= STAGE_W && h!.y + 19 <= STAGE_H
          expect({ id: n.id, index, i, top: h!.top, x: h!.x, onCanvas }).toEqual({ id: n.id, index, i, top: h!.top, x: h!.x, onCanvas: true })
          // the eyes drawn on the head (the head drawn: a blow's head turned to
          // the post has its own eyes' place), in the eyes' own colours (under
          // what is drawn in front of them: effects, a clone, a flash)
          const eyes = cel.k.eyes ?? n.poseEyes?.[cel.k.pose] ?? poseOf(dressOf(n), cel.k.pose).eyes ?? 'open'
          const head = cel.k.head !== undefined ? n.heads![cel.k.head]! : n.head
          const shown = compose(n, { ...cel, fx: cel.fx?.filter(e => e.back), clones: [], tint: undefined, flash: undefined }, cel.t, { ...faceOfEyes(eyes), eyes }, { move: true })
          expect({ id: n.id, index, i, eyes: drawn(leftEye(shown.px, head, shown.head!.x, shown.head!.y), head === n.head ? bare : bareEye(head), colours) }).toEqual({ id: n.id, index, i, eyes: true })
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
          for (const k of [...(f.k ? [f.k] : []), ...(f.clones ?? [])]) {
            expect({ id: n.id, pose: k.pose, ok: (() => (poseOf(t, k.pose), true))() }).toEqual({ id: n.id, pose: k.pose, ok: true })
            if (k.eyes) expect({ id: n.id, eyes: k.eyes, drawn: k.eyes in n.eyes!.states }).toEqual({ id: n.id, eyes: k.eyes, drawn: true })
          }
          if (f.post) expect({ id: n.id, post: f.post, ok: POST[f.post] !== undefined }).toEqual({ id: n.id, post: f.post, ok: true })
          for (const e of f.fx ?? []) {
            const fam = FX[e.fx]
            expect({ id: n.id, fx: e.fx, known: fam !== undefined }).toEqual({ id: n.id, fx: e.fx, known: true })
            if (typeof e.f === 'number') expect({ id: n.id, fx: e.fx, f: e.f, ok: e.f >= 0 && e.f < fam!.frames.length }).toEqual({ id: n.id, fx: e.fx, f: e.f, ok: true })
            if (e.pal) {
              const p = FX_PALETTES[e.pal]
              expect({ id: n.id, pal: e.pal, ok: p !== undefined }).toEqual({ id: n.id, pal: e.pal, ok: true })
              // every letter the effect draws has a colour in the palette swapped in
              for (const fr of fam!.frames) expect({ id: n.id, fx: e.fx, pal: e.pal, missing: missing('rows' in fr ? fr.rows : fr, p!) }).toEqual({ id: n.id, fx: e.fx, pal: e.pal, missing: [] })
            }
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

  test("the cheer is the roster's: its pose and face by the time the hello looks, then the rule-5 ending (idle1 dipped, idle0)", () => {
    ensure()
    // the rule-5 ending: idle1 with the head dipped for a frame, then idle0 for one or two
    const ends = (m: CelMove): boolean => {
      const f = m.frames
      const last = f[f.length - 1]!.k
      let i = f.length - 1
      while (i > 0 && f[i]!.k?.pose === 'idle0') i--
      const rest = f.length - 1 - i
      return last?.pose === 'idle0' && rest >= 1 && rest <= 2 && f[i]!.k?.pose === 'idle1' && f[i]!.k?.hdy === 1
    }
    for (const n of CAST) {
      const { pose, mood } = byId(n.id).cheer
      const m = playOf(n.id, CHEER_INDEX)! as CelMove
      expect({ id: n.id, at: poseAt(m, 0.6) }).toMatchObject({ id: n.id, at: { pose, mood } })
      expect({ id: n.id, end: ends(m) }).toEqual({ id: n.id, end: true })
    }
  })
})

// ---------------------------------------------------------------- at rest

describe('at rest', () => {
  test('every companion pose, mood, blink and breath draws, the head whole and the eyes on it', () => {
    ensure()
    for (const n of CAST) {
      const glow = byId(n.id).glow
      const colours = eyeColours(n)
      const bare = bareEye(n.head)
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
                expect({ id: n.id, pose, mood, blink, eyes: drawn(leftEye(px, n.head, h.x, h.y), bare, colours) }).toEqual({ id: n.id, pose, mood, blink, eyes: true })
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

  test("their own faces: Shikamaru calm in his scratch, Guy's grin only when happy, the ting, Minato's wink", () => {
    ensure()
    const at = (id: string, pose: Pose, mood: Mood) => native(still(id, pose, mood)).px
    // Shikamaru: the flat calm mouth (three pixels) in his cheer's scratch, a dot otherwise
    const MOUTH = 0x9a5a48
    expect(count(at('shikamaru', 'scratch', 'calm'), MOUTH)).toBeGreaterThanOrEqual(3)
    expect(count(at('shikamaru', 'idle', 'calm'), MOUTH)).toBe(1)
    // Guy's teeth in his happy faces only
    const TEETH = 0xe8e0cc
    expect(count(at('guy', 'thumbs', 'happy'), TEETH)).toBeGreaterThan(4)
    expect(count(at('guy', 'idle', 'calm'), TEETH)).toBe(0)
    expect(count(at('guy', 'idle', 'focus'), TEETH)).toBe(0)
    // the ting (its pale gold glint) in the cheer's second beat, for Guy and Lee
    const GLINT = 0xfff2a8
    for (const id of ['guy', 'lee']) {
      const cheer = NATIVE[id]!.cheer
      const ting = cheer.frames.filter(f => count(compose(NATIVE[id]!, f, f.t, { ...faceOfEyes(f.k!.eyes ?? 'open'), eyes: f.k!.eyes ?? 'open' }, { move: true }).px, GLINT) > 0)
      expect({ id, ting: ting.length > 0 }).toEqual({ id, ting: true })
      expect({ id, rest: count(at(id, 'thumbs', 'happy'), GLINT) }).toEqual({ id, rest: 0 })
    }
    // Minato's wink: one eye open (its iris), the other an arc
    const wink = MINATO.cheer.frames.find(f => f.k?.eyes === 'wink')!
    const px = compose(MINATO, wink, wink.t, { ...faceOfEyes('wink'), eyes: 'wink' }, { move: true })
    expect(count(px.px, 0x3a86e6)).toBe(1)
    expect(count(compose(MINATO, wink, wink.t, { ...faceOfEyes('happy'), eyes: 'happy' }, { move: true }).px, 0x3a86e6)).toBe(0)
  })
})

// ---------------------------------------------------------------- the jutsu draw what they say

describe('the jutsu draw what they say', () => {
  test("Shikamaru's shadow reaches the post's foot as he shouts, and goes home before the post does", () => {
    ensure()
    const m = SHIKAMARU.moves[0]!
    const line = (f: (typeof m.frames)[number]) => f.fx?.find(e => e.fx === 'shadowLine')?.f
    const bind = m.frames.find(f => f.shout)!
    expect(line(bind)).toBe(3)
    expect(m.frames.some(f => f.tag === 'impact' && line(f) === 4)).toBe(true)
    expect(m.frames.filter(f => f.tag === 'recover' && line(f) !== undefined)).toEqual([])
  })

  test("Minato is never seen travelling: where he left, his outline breaking up over three frames, and a streak of light", () => {
    ensure()
    // the Yellow Flash's afterimages (fx/flash.ts): yf<Pose>, not the streak or the slash
    const afterimage = (name: string): boolean => name.startsWith('yf') && name !== 'yfStreak' && name !== 'yfSlash'
    for (const m of [MINATO.moves[0]!, MINATO.moves[2]!, MINATO.quick]) {
      // no ghost clones (no filled yellow silhouette), no ftgFlash blobs
      expect(m.frames.filter(f => (f.clones ?? []).some(c => c.ghost !== undefined))).toEqual([])
      expect(m.frames.some(f => f.fx?.some(e => e.fx === 'ftgFlash'))).toBe(false)
      // an outline where he left, and the streak toward where he went
      const uses = m.frames.flatMap(f => (f.fx ?? []).filter(e => afterimage(e.fx)).map(e => ({ t: f.t, e })))
      expect({ move: m.name, outlines: uses.length > 0 }).toEqual({ move: m.name, outlines: true })
      expect({ move: m.name, streak: m.frames.some(f => f.fx?.some(e => e.fx === 'yfStreak')) }).toEqual({ move: m.name, streak: true })
      // each outline breaks up over consecutive frames, whole, broken, motes: never gone in one
      for (const u of uses.filter(u => u.e.f === 0 && !uses.some(v => v.t === u.t - 1 && v.e.fx === u.e.fx))) {
        const seen: number[] = []
        for (let t = u.t; t < m.frames.length; t++) {
          const e = m.frames[t]!.fx?.find(e => e.fx === u.e.fx && JSON.stringify(e.at) === JSON.stringify(u.e.at))
          if (!e) break
          seen.push(e.f as number)
        }
        const ordered = seen.every((f, i) => i === 0 || f === seen[i - 1] || f === seen[i - 1]! + 1)
        expect({ move: m.name, t: u.t, fx: u.e.fx, breaks: ordered && seen[seen.length - 1] === 2 }).toEqual({ move: m.name, t: u.t, fx: u.e.fx, breaks: true })
      }
    }
    // each jutsu lands its own way: the cut, the crater, three flashes' light at once
    const has = (m: CelMove, name: string): boolean => m.frames.some(f => f.fx?.some(e => e.fx === name))
    expect(has(MINATO.moves[0]!, 'yfSlash') && MINATO.moves[0]!.frames.some(f => f.post === 'cut')).toBe(true)
    expect(has(MINATO.moves[1]!, 'quake')).toBe(true)
    expect(MINATO.moves[2]!.frames.some(f => (f.fx ?? []).filter(e => e.fx === 'yfStreak').length >= 3)).toBe(true)
  })

  test('the taijutsu leave the ground: flying kicks clear of the floor, and the post sent flying or driven down', () => {
    ensure()
    for (const n of [GUY, LEE]) {
      const air = [...n.moves, n.quick].map(m => Math.max(...m.frames.map(f => f.k?.lift ?? 0)))
      for (const lift of air) expect({ id: n.id, lift: lift >= 3 }).toEqual({ id: n.id, lift: true })
    }
    const lotus = LEE.moves[1]!
    expect(Math.min(...lotus.frames.map(f => f.pdy ?? 0))).toBeLessThanOrEqual(-10)
    expect(Math.max(...lotus.frames.map(f => f.pdy ?? 0))).toBeGreaterThanOrEqual(5)
    // Night Guy's red dragon round him from the Gate to the blow, flying with him through the kick
    const night = GUY.moves[2]!
    expect(night.frames.filter(f => f.fx?.some(e => e.fx === 'dragonAura' || e.fx === 'dragonFly')).length).toBeGreaterThan(15)
    expect(night.frames.filter(f => f.k?.pose.startsWith('flykick')).every(f => f.fx?.some(e => e.fx === 'dragonFly'))).toBe(true)
  })

  test("the flying kicks are straight-leg side kicks in the air: the body showing, the arc up then down into the blow, the shadow kept, a squash on landing", () => {
    ensure()
    // the drawing: the sole (its hand point) shot out level from the hip, 7+
    // px ahead of the root, and the body (Guy's vest, Lee's suit and belt)
    // showing between the leg and the head thrown back behind it
    for (const [n, names, body] of [[GUY, ['flykick', 'flykickN'], 'vwx'], [LEE, ['flykick'], 'nmlcfi']] as const) {
      const t = dressOf(n)
      for (const name of names) {
        const p = poseOf(t, name)
        const [hx, hy] = p.hand!
        expect({ id: n.id, name, reach: t.root - hx >= 7, level: hy >= 3 && hy <= p.rows.length - 4 }).toEqual({ id: n.id, name, reach: true, level: true })
        const face = t.root + p.head![0] - n.heads!.turn!.neck[0] + 1
        const shown = p.rows.reduce((k, r) => k + [...r.slice(0, face)].filter(ch => body.includes(ch)).length, 0)
        expect({ id: n.id, name, body: shown >= 8 }).toEqual({ id: n.id, name, body: true })
      }
      // always off the ground (Guy's grid ends on the tucked sole, so his lift is his clearance)
      for (const m of n.moves) {
        const kicks = m.frames.filter(f => f.k?.pose.startsWith('flykick'))
        for (const f of kicks) expect({ move: m.name, t: f.t, up: (f.k!.lift ?? 0) >= 2 }).toEqual({ move: m.name, t: f.t, up: true })
      }
    }
    // Guy's: the leg a straight line from the hip to the sole (9 px of leg, sole first), seven rows of torso showing
    const leg = poseOf(dressOf(GUY), 'flykick')
    const [, legRow] = leg.hand!
    expect(leg.rows[legRow]!.slice(leg.hand![0], dressOf(GUY).root).replace(/[^tubjpq]/g, '').length).toBeGreaterThanOrEqual(6)
    for (const m of [GUY.moves[0]!, GUY.moves[2]!]) {
      const first = m.frames.findIndex(f => f.tag === 'impact')
      // the flight: from the take-off to the blow, every frame off the ground,
      // the leg shot out at the top of the arc (the highest frame) and coming
      // down into the blow, never three at one lift
      const take = m.frames.findIndex(f => f.k?.pose.startsWith('chamber'))
      const flight = m.frames.slice(take, first + 1).map(f => f.k!.lift ?? 0)
      const top = m.frames[first - 1]!.k!.lift ?? 0
      expect({ move: m.name, flight: flight.every(l => l >= 2), top: top === Math.max(...flight), down: (m.frames[first]!.k!.lift ?? 0) < top }).toEqual({ move: m.name, flight: true, top: true, down: true })
      expect({ move: m.name, shadow: m.frames.some(f => f.k?.pose.startsWith('flykick') && f.k.noShadow) }).toEqual({ move: m.name, shadow: false })
      // and down again into a squash, on the ground
      const land = m.frames.findIndex((f, i) => i > first && f.k?.pose.startsWith('crouch') && !f.k.lift && (m.frames[i - 1]!.k?.lift ?? 0) > 0)
      expect({ move: m.name, squash: land > first }).toEqual({ move: m.name, squash: true })
    }
    // the head never cut by the stage's top by more than 2 px in the kick
    // (up 4 it just clears it), and Night Guy's crest never
    const headTop = (lift: number): number => 4 - lift
    for (const f of GUY.moves[0]!.frames.filter(f => f.k?.pose === 'flykick')) expect({ t: f.t, top: headTop(f.k!.lift ?? 0) >= -2 }).toEqual({ t: f.t, top: true })
    for (const f of GUY.moves[2]!.frames.filter(f => f.k?.pose === 'flykickN')) expect({ t: f.t, top: headTop(f.k!.lift ?? 0) >= 0 }).toEqual({ t: f.t, top: true })
  })

  test('Night Guy flushes red, the hair thrown up, from the Gate to the blow, and the Gate shuts before home', () => {
    ensure()
    const m = GUY.moves[2]!
    const t = dressOf(GUY)
    const open = m.frames.findIndex(f => f.tag === 'open')
    const hit = m.frames.findIndex(f => f.tag === 'impact')
    const nightly = (f: (typeof m.frames)[number]): boolean => f.k?.head === 'night' || f.k?.head === 'nightTurn'
    for (const f of m.frames.slice(open, hit + 1)) expect({ t: f.t, night: nightly(f) }).toEqual({ t: f.t, night: true })
    for (const f of m.frames.slice(-10)) expect({ t: f.t, night: nightly(f) }).toEqual({ t: f.t, night: false })
    // the flushed body: no skin left its own colour in the poses he is flushed in
    for (const f of m.frames.filter(nightly)) expect({ pose: f.k!.pose, skin: /[skSK]/.test(poseOf(t, f.k!.pose).rows.join('')) }).toEqual({ pose: f.k!.pose, skin: false })
    // the hair stands up: the night head's top row is points, the head at rest's a dome
    expect(GUY.heads!.night!.rows[0]!.replace(/\./g, '').length).toBeLessThan(GUY.head.rows[0]!.replace(/\./g, '').length)
  })

  test("Lee's Gates: the chakra ring blown out behind him from his middle, and the last punch plain taijutsu, never a green ball", () => {
    ensure()
    const m = LEE.moves[2]!
    const rings = m.frames.filter(f => f.tag === 'open').flatMap(f => (f.fx ?? []).filter(e => e.fx === 'shockRing'))
    expect(rings.length).toBeGreaterThan(0)
    for (const e of rings) expect({ back: e.back, d: e.d }).toEqual({ back: true, d: [0, -3] })
    for (const f of m.frames.filter(f => /^(impact|finish|hit\d*)$/.test(f.tag))) for (const e of f.fx ?? []) expect({ t: f.t, fx: e.fx, pal: e.pal === 'leafChakra' }).toEqual({ t: f.t, fx: e.fx, pal: false })
  })

  test("Morning Peacock is a peacock: its fist-comets build a frame a punch to the fan, the move's biggest frame, broken up over frames", () => {
    ensure()
    const m = GUY.moves[1]!
    const fan = (f: (typeof m.frames)[number]): number | undefined => f.fx?.find(e => e.fx === 'peacock')?.f as number | undefined
    const used = m.frames.map(fan).filter((f): f is number => f !== undefined)
    // the flurry plays the comets in order, building: the first three on
    // two-frame beats, then a frame a punch, before the fan
    expect(used.slice(0, 12)).toEqual([0, 0, 1, 1, 2, 2, 3, 4, 5, 6, 7, 8])
    // and he closes in as it builds: a pace in for the fast punches, another for the lunge
    const xs = m.frames.filter(f => fan(f) !== undefined && fan(f)! <= 9).map(f => f.k!.x)
    expect(xs[0]! - xs[xs.length - 1]!).toBeGreaterThanOrEqual(2)
    // the fan (9, 10) is the climax: on the blow, and the family's biggest drawing
    const climax = m.frames.find(f => fan(f) === 9)!
    expect(climax.tag).toBe('impact')
    const size = (i: number): number => {
      const fr = FX['peacock']!.frames[i]!
      return ('rows' in fr ? fr.rows : fr).join('').replace(/\./g, '').length
    }
    for (let i = 0; i < 9; i++) expect({ i, smaller: size(i) < size(9) }).toEqual({ i, smaller: true })
    // and it breaks up into embers over three frames, never gone in one
    expect(used.filter((f, i) => f > 10 && f !== used[i - 1])).toEqual([11, 12, 13])
    // the fists build too: a new drawing every punch (mid, low, high, then the
    // smear of fists), never one rocking against its twin, onto his own lunge
    const jabs = m.frames.filter(f => fan(f) !== undefined && fan(f)! <= 8).map(f => f.k!.pose)
    for (const pose of ['punch', 'jabLow', 'jabHigh', 'flurryA', 'flurryB']) expect({ pose, used: jabs.includes(pose) }).toEqual({ pose, used: true })
    expect(climax.k!.pose).toBe('lunge')
  })

  test("Guy and Lee are no twins: Guy's head heavier, wider, eared; Lee's bowl flared at its rim; turned heads in profile; never an upside-down head", () => {
    ensure()
    const width = (rows: readonly string[], y: number): number => {
      const r = rows[y]!
      const a = r.search(/[^.]/)
      return a < 0 ? 0 : r.replace(/\.+$/, '').length - a
    }
    // Guy's head two pixels wider than Lee's, its jaw (rows 13-16) broader
    expect(GUY.head.rows[0]!.length).toBeGreaterThan(LEE.head.rows[0]!.length)
    expect(width(GUY.head.rows, 14)).toBeGreaterThan(width(LEE.head.rows, 14) + 2)
    // Lee's bowl flares a pixel out over the ears: its rim (rows 11-12) wider than the dome above it
    expect(width(LEE.head.rows, 11)).toBeGreaterThan(width(LEE.head.rows, 8))
    expect(width(LEE.heads!.turn!.rows, 12)).toBeGreaterThanOrEqual(width(LEE.heads!.turn!.rows, 8))
    // the turned heads have a profile: the brow ridge or the nose standing out at the front edge (column 0)
    for (const n of [GUY, LEE]) expect({ id: n.id, profile: n.heads!.turn!.rows.some(r => r[0] !== '.') }).toEqual({ id: n.id, profile: true })
    // and no move turns a head upside down: Primary Lotus spins in the tuck
    for (const n of [GUY, LEE]) for (const m of [...n.moves, n.quick]) expect({ move: m.name, flipped: m.frames.some(f => /flip/i.test(f.k?.head ?? '')) }).toEqual({ move: m.name, flipped: false })
  })

  test('not every hop the same: Guy goes home as a cannonball, Lee in a backflip through every quarter turn', () => {
    ensure()
    // every one of Guy's moves has the cannonball in the air; none the template's tuck
    for (const m of [...GUY.moves, GUY.quick]) expect({ move: m.name, ball: m.frames.some(f => f.k?.pose === 'cannon') }).toEqual({ move: m.name, ball: true })
    // Lee's tuck roll home: rocked back, over the top, over onto his feet, in
    // order, his head never turned (no rotated heads: the legs go round it)
    for (const m of [LEE.moves[0]!, LEE.moves[2]!]) {
      const roll = m.frames.filter(f => f.k?.pose.startsWith('roll')).map(f => f.k!.pose)
      expect({ move: m.name, roll }).toEqual({ move: m.name, roll: ['rollA', 'rollB', 'rollC'] })
      const xs = m.frames.filter(f => f.k?.pose.startsWith('roll')).map(f => f.k!.x)
      expect({ move: m.name, homeward: xs.every((x, i) => i === 0 || x > xs[i - 1]!) }).toEqual({ move: m.name, homeward: true })
    }
    for (const m of [...LEE.moves, LEE.quick]) expect({ move: m.name, turned: m.frames.some(f => /^flip[RL]$/.test(f.k?.head ?? '')) }).toEqual({ move: m.name, turned: false })
    // the Gates open in a rim of light round the body, never a white silhouette
    for (const m of [GUY.moves[1]!, GUY.moves[2]!, LEE.moves[2]!]) expect({ move: m.name, rim: m.frames.some(f => f.flash === 'rim'), white: m.frames.some(f => f.flash === 'silhouette') }).toEqual({ move: m.name, rim: true, white: false })
    // the quick strikes' own beats: Guy's whirlwind spin (his back to the post a
    // frame), Lee's landing in a flurry of leaves
    expect(GUY.quick.frames.some(f => !f.k && f.clones?.some(c => c.flip))).toBe(true)
    expect(LEE.quick.frames.filter(f => f.fx?.some(e => e.fx === 'leafFall')).length).toBeGreaterThanOrEqual(3)
  })
})

// ---------------------------------------------------------------- round 8 (the vest team: Kakashi, Shikamaru, Minato)

describe('round 8: the vest team', () => {
  const HOME = 35
  const lit = (rows: readonly string[]): number => {
    // pixels with no drawn 4-neighbour: a lone speck
    let lone = 0
    rows.forEach((r, y) => {
      for (let x = 0; x < r.length; x++) {
        if (r[x] === '.') continue
        const near = [rows[y - 1]?.[x], rows[y + 1]?.[x], r[x - 1], r[x + 1]].some(c => c !== undefined && c !== '.')
        if (!near) lone++
      }
    })
    return lone
  }
  const parts = (rows: readonly string[]): number => {
    const seen = new Set<string>()
    let n = 0
    rows.forEach((r, y) => {
      for (let x = 0; x < r.length; x++) {
        if (r[x] === '.' || seen.has(`${x},${y}`)) continue
        n++
        const todo = [[x, y]]
        while (todo.length) {
          const [a, b] = todo.pop()!
          if (seen.has(`${a},${b}`) || (rows[b!]?.[a!] ?? '.') === '.') continue
          seen.add(`${a},${b}`)
          todo.push([a! + 1, b!], [a! - 1, b!], [a!, b! + 1], [a!, b! - 1])
        }
      }
    })
    return n
  }
  const rowsOf = (fr: (typeof FX)[string]['frames'][number]): readonly string[] => ('rows' in fr ? fr.rows : fr)

  test("folded arms tuck up under the chin inside the torso: the vest's green above them at the sides and two rows of it below, pouches and all", () => {
    const rows = VEST.poses['crossed']!.rows
    // the near forearm's band (drawn over the head: a nodding chin goes behind
    // the arms), stepping up to a fist on the far upper arm
    expect(rows[7]).toBe('....ONNNNNNNNNNNNNKKLO....')
    expect(rows[6]!.slice(17, 21)).toBe('nssl')
    // the upper arms run down the sides, shoulder to elbow, inside the torso's columns
    for (const y of [5, 6, 7]) expect({ y, near: /[nmNM]/.test(rows[y]![5]!), far: /[lL]/.test(rows[y]![20]!), out: rows[y]!.slice(0, 4) + rows[y]!.slice(22) }).toEqual({ y, near: true, far: true, out: '........' })
    // the vest above them, and two full rows of it below them
    const vest = (r: string): number => r.replace(/[^vwxVWX]/g, '').length
    expect(vest(rows[5]!)).toBeGreaterThanOrEqual(8)
    expect(vest(rows[8]!)).toBeGreaterThanOrEqual(10)
    expect(vest(rows[9]!)).toBeGreaterThanOrEqual(10)
    // and on Kakashi, the default ninja, his green vest shows with his arms folded
    const green = (pose: Pose): number => {
      const px = native(still('kakashi', pose)).px
      return [0xa6b86a, 0x76893f, 0x4b5a29].reduce((n, c) => n + count(px, c), 0)
    }
    expect(green('crossed')).toBeGreaterThanOrEqual(20)
  })

  test("Shikamaru's shadow is solid: three tones at most, no lone speck; the bind two tendrils up the post, the sewing three spikes", () => {
    for (const name of ['shadowLine', 'shadowBind', 'shadowWisp', 'shadowHands', 'shadowStitch']) {
      const fam = FX[name]!
      const pal = typeof fam.palette === 'string' ? FX_PALETTES[fam.palette]! : fam.palette
      expect({ name, tones: Object.values(pal).filter(c => c !== null).length <= 3 }).toEqual({ name, tones: true })
      fam.frames.forEach((fr, f) => expect({ name, f, lone: lit(rowsOf(fr)) }).toEqual({ name, f, lone: 0 }))
    }
    // the bind's tendrils climb from the pool to the crown (12 rows of the post)
    const bind = rowsOf(FX['shadowBind']!.frames[2]!)
    expect(bind.filter(r => r.replace(/\./g, '').length > 0).length).toBeGreaterThanOrEqual(10)
    // three spikes, each its own shape
    expect(parts(rowsOf(FX['shadowStitch']!.frames[2]!))).toBe(3)
  })

  test("Shadow Possession: the seal held 12 frames at most; the mimic a step in with the arm out, the post lurching after him a frame later, the tendrils on its lower half while it copies him", () => {
    ensure()
    const m = SHIKAMARU.moves[0]!
    const f = m.frames
    // the longest run of the Rat seal (and its stir and leans)
    let run = 0
    let most = 0
    for (const fr of f) {
      run = /^sign2/.test(fr.k?.pose ?? '') ? run + 1 : 0
      most = Math.max(most, run)
    }
    expect(most).toBeLessThanOrEqual(12)
    // the step in: three frames two columns in, arm out; the post still on the
    // first, two or more pixels after him on the next
    const t = f.findIndex(fr => fr.tag === 'hold' && fr.k?.pose === 'strike')
    expect(f.slice(t, t + 3).every(fr => fr.k?.pose === 'strike' && fr.k.x === HOME - 2)).toBe(true)
    expect(f[t]!.pdx ?? 0).toBe(0)
    expect(f[t + 1]!.pdx ?? 0).toBeGreaterThanOrEqual(2)
    // the post hops after his raised hand
    expect(f.some(fr => fr.tag === 'hold' && (fr.pdy ?? 0) <= -2)).toBe(true)
    // while it moves, the tendrils are on its lower half (frames 1 and 4)
    for (const fr of f.filter(fr => fr.tag === 'hold' && (fr.pdx || fr.pdy))) {
      const b = fr.fx?.find(e => e.fx === 'shadowBind')
      expect({ t: fr.t, low: b !== undefined && (b.f === 1 || b.f === 4) }).toEqual({ t: fr.t, low: true })
    }
  })

  test('Minato: Three-Pronged Kunai opens on a fan of three thrown at once; the cheer catches the kunai in a reverse grip four columns over, never the thumbs-up', () => {
    ensure()
    const volley = MINATO.moves[2]!.frames
    const blades = (fr: (typeof volley)[number], at?: string): number => (fr.fx ?? []).filter(e => (e.fx === 'kunai' || e.fx === 'ftgKunai') && (at === undefined || e.at === at)).length
    // held fanned in the hand, then all three stuck in the post at the first blow
    expect(volley.slice(0, 4).every(fr => blades(fr, 'hand') === 3)).toBe(true)
    const hit = volley.find(fr => BLOW.test(fr.tag))!
    expect(blades(hit)).toBe(3)
    // its own opening: not the Flying Thunder God's, nor the quick strike's
    const open = (m: CelMove): string => m.frames.slice(0, 4).map(fr => fr.k?.pose).join()
    expect(open(MINATO.moves[2]!)).not.toBe(open(MINATO.moves[0]!))
    expect(open(MINATO.moves[2]!)).not.toBe(open(MINATO.quick))
    // the cheer: the grip, four columns toward the post, then home
    const cheer = MINATO.cheer.frames
    expect(cheer.filter(fr => fr.k?.pose === 'grip' && fr.k.x === HOME - 4).length).toBeGreaterThanOrEqual(3)
    expect(cheer.some(fr => fr.k?.pose === 'thumbs' || fr.k?.pose === 'cheer' || fr.k?.pose === 'cheer2')).toBe(false)
    // and his companion thumbs-up (the soft cue, the roster) is the grip too
    expect(poseOf(dressOf(MINATO), 'thumbs').rows).toEqual(poseOf(dressOf(MINATO), 'grip').rows)
  })

  test("Kakashi: Kamui hauls against the pull in three key poses at three places, the warp growing on the post", () => {
    const kakashi = NATIVE['kakashi']!
    const kamui = kakashi.moves[2]!.frames.filter(fr => fr.tag === 'warp' || fr.tag === 'pull')
    // leant in on the aim, the strain (the hand clamped to the eye, twisted back off the aim), dragged a step forward
    expect(kamui.some(fr => fr.k?.pose.startsWith('strike') && fr.k.x < HOME)).toBe(true)
    expect(kamui.some(fr => fr.k?.pose === 'strain' && fr.k.x > HOME && (fr.k.dy ?? 0) > 0)).toBe(true)
    expect(kamui.some(fr => fr.k?.pose === 'follow' && fr.k.x <= HOME - 2)).toBe(true)
    // the warp grows: 13 across on the aim, then 15, then 17
    const widths = kamui.flatMap(fr => (fr.fx ?? []).filter(e => e.fx === 'kamuiWarp').map(e => compile(rowsOf(FX['kamuiWarp']!.frames[e.f as number]!)).w))
    expect(Math.min(...widths)).toBe(13)
    expect(Math.max(...widths)).toBe(17)
    expect(widths.every((w, i) => i === 0 || w >= widths[i - 1]!)).toBe(true)
  })

})

describe('round 9: the vest team', () => {
  const HOME = 35
  const rowsOf = (fr: (typeof FX)[string]['frames'][number]): readonly string[] => ('rows' in fr ? fr.rows : fr)
  const shakeOf = (s: unknown): readonly [number, number] => (typeof s === 'number' ? [s, 0] : ((s as readonly [number, number] | undefined) ?? [0, 0]))
  const frames = (id: string, index: number) => (playOf(id, index) as CelMove).frames

  test("Raikiri lands: the burst through the post its biggest frame, the camera jolted left twice and back, the post kicked, his weight pushed on through it", () => {
    const f = frames('kakashi', 0)
    const hit = f.findIndex(fr => fr.tag === 'impact')
    expect(f[hit]!.k?.pose).toBe('strike')
    expect([0, 1, 2].map(i => shakeOf(f[hit + i]!.shake))).toEqual([[-1, 0], [-1, 0], [1, 0]])
    // the post kicked back two columns, the body a pixel past the blow
    expect(Math.min(...f.slice(hit, hit + 4).map(fr => fr.pdx ?? 0))).toBe(-2)
    expect(f[hit + 2]!.k!.x).toBe(f[hit]!.k!.x - 1)
    // the burst: bigger than any flare of the charge
    const size = (name: string, i: number): number => rowsOf(FX[name]!.frames[i]!).join('').replace(/\./g, '').length
    const burst = f[hit]!.fx!.find(e => e.fx === 'raikiriBurst')!
    const flares = f.slice(0, hit).flatMap(fr => (fr.fx ?? []).filter(e => e.fx === 'raikiriFlare' || e.fx === 'chidori').map(e => size(e.fx, e.f === 'cycle' ? 0 : (e.f as number))))
    expect(size('raikiriBurst', burst.f as number)).toBeGreaterThan(Math.max(...flares))
    // the charge in three keys of its own: the thrust, drawn back low, lifted beside the head
    const keys = new Set(f.filter(fr => fr.tag === 'charge').map(fr => fr.k?.pose.replace(/Wind$/, '')))
    for (const k of ['charge', 'charge2', 'raise']) expect(keys.has(k)).toBe(true)
  })

  test("Kakashi's quick strike is A Thousand Years of Death: the Tiger held low at the post's back, the poke, the post off the top of the stage with a twinkle, and down again", () => {
    const q = NATIVE['kakashi']!.quick
    expect({ name: q.name, shout: q.shout, quick: q.quick, on: q.on }).toEqual({ name: 'A Thousand Years of Death', shout: 'Thousand Years of Death', quick: true, on: ['edit'] })
    const f = q.frames
    const tiger = f.filter(fr => fr.k?.pose === 'tiger')
    expect(tiger.length).toBeGreaterThanOrEqual(3)
    const poke = f.findIndex(fr => fr.tag === 'impact')
    expect(f[poke]!.k?.pose).toBe('jab')
    expect(f.findIndex(fr => fr.k?.pose === 'tiger')).toBeLessThan(poke)
    // the post's flight: up past the stage's top (11 rows tall, so 24 up is gone), a twinkle, and home on its foot
    const ups = f.map(fr => fr.pdy ?? 0)
    expect(Math.min(...ups)).toBeLessThanOrEqual(-24)
    expect(f.some(fr => fr.fx?.some(e => e.fx === 'twinkle'))).toBe(true)
    const land = f.findIndex((fr, i) => i > poke && fr.post && (fr.pdy ?? 0) === 0 && ups.slice(poke, i).some(u => u <= -24))
    expect(land).toBeGreaterThan(poke)
    // a 1 px jolt on the poke and on the landing, never more
    for (const fr of f) for (const v of shakeOf(fr.shake)) expect(Math.abs(v)).toBeLessThanOrEqual(1)
    expect(f.filter(fr => fr.shake).length).toBeGreaterThanOrEqual(2)
    // every beat clear: 1.8-2 s; while the post flies he is crouched or standing clear of its column
    // (his root 3 px and more right of the poke's, the head 5 px clear), and he flickers home in a puff
    expect(f.length).toBeGreaterThanOrEqual(18)
    expect(f.length).toBeLessThanOrEqual(20)
    const jabX = f[poke]!.k!.x
    for (const fr of f) if (fr.k && (fr.pdy ?? 0) < -2) expect({ pose: fr.k.pose, clear: fr.k.x >= jabX + 3 }).toEqual({ pose: fr.k.pose, clear: true })
    const gone = f.findIndex((fr, i) => i > land && !fr.k)
    expect(gone).toBeGreaterThan(land)
    expect(f[gone + 1]!.k?.x ?? 35).toBe(35)
  })

  test("Shikamaru's Neck Bind is fingers round the post's neck, its crown free; the shadow's top edge lit; the spike runs unbroken from the pool to its tip", () => {
    const hands = FX['shadowHands']!
    for (const f of [3, 4]) {
      const rows = rowsOf(hands.frames[f]!)
      // the crown (the post's top 2 rows, stage rows 13-14: the frame's rows 3-4) left clear
      expect(rows.slice(0, 5).join('').replace(/\./g, '')).toBe('')
      // two fingers across the post's face (its columns 4-9), the wood showing between them
      const across = rows.map(r => r.slice(4, 10)).filter(r => /[dr]/.test(r))
      expect(across.some(r => r === '......')).toBe(false)
      expect(rows.slice(5, 11).some(r => r.slice(5, 10) === '.....')).toBe(true)
    }
    // the rim a full step lighter than the body, so the top edge reads on a dark stage
    const pal = hands.palette as Readonly<Record<string, number>>
    const lum = (c: number): number => 0.299 * ((c >> 16) & 255) + 0.587 * ((c >> 8) & 255) + 0.114 * (c & 255)
    expect(lum(pal['r']!) - lum(pal['d']!)).toBeGreaterThan(60)
    // the middle spike: a column of shadow from the pool up through the post to the needle, no gap
    for (const f of [2, 3]) {
      const rows = rowsOf(FX['shadowStitch']!.frames[f]!)
      const mid = rows.map(r => /[dr]/.test(r.slice(7, 11)))
      expect(mid.every(Boolean)).toBe(true)
    }
  })

  test('Shikamaru: the catch is his own key (a crouch in the seal), the squeeze builds through drawings of its own, the seal under half the Possession', () => {
    const p = frames('shikamaru', 0)
    expect(p.some(fr => fr.tag === 'impact' && fr.k?.pose === 'kneel')).toBe(true)
    const seals = p.filter(fr => /^sign/.test(fr.k?.pose ?? '')).length
    expect(seals / p.length).toBeLessThan(0.5)
    const squeeze = frames('shikamaru', 1).filter(fr => fr.tag === 'crush').map(fr => fr.k!.pose.replace(/Wind$/, ''))
    expect(new Set(squeeze).size).toBeGreaterThanOrEqual(3)
    // the finish held with a jolt, after the build
    const neck = frames('shikamaru', 1)
    const last = neck.map((fr, i) => (fr.tag === 'impact' && fr.shake ? i : -1)).filter(i => i >= 0)
    expect(last.length).toBeGreaterThanOrEqual(2)
    expect(neck.slice(last[last.length - 1]!).some(fr => fr.tag === 'crush')).toBe(false)
  })

  test("Minato: the Yellow Flash opens on a reverse-grip dash, not the Flying Thunder God's throw; his outlines are outlines, no lines inside", () => {
    const q = MINATO.quick.frames
    expect(q[0]!.k?.pose).toBe('grip')
    expect(q.some(fr => fr.k?.pose === 'dash' && fr.fx?.some(e => e.fx === 'kunaiRev'))).toBe(true)
    expect(q.some(fr => fr.fx?.some(e => e.fx === 'ftgKunai'))).toBe(false)
    // every afterimage's whole frame is one unbroken line (8-connected): the
    // outer edge alone, no loop or dash drawn inside it
    const lines = (rows: readonly string[]): number => {
      const seen = new Set<string>()
      let n = 0
      rows.forEach((r, y) => {
        for (let x = 0; x < r.length; x++) {
          if (r[x] === '.' || seen.has(`${x},${y}`)) continue
          n++
          const todo = [[x, y]]
          while (todo.length) {
            const [a, b] = todo.pop()!
            if (seen.has(`${a},${b}`) || (rows[b!]?.[a!] ?? '.') === '.') continue
            seen.add(`${a},${b}`)
            for (const dx of [-1, 0, 1]) for (const dy of [-1, 0, 1]) todo.push([a! + dx, b! + dy])
          }
        }
      })
      return n
    }
    for (const name of Object.keys(FX).filter(n => /^yf[A-Z]/.test(n) && n !== 'yfStreak' && n !== 'yfSlash')) expect({ name, lines: lines(rowsOf(FX[name]!.frames[0]!)) }).toEqual({ name, lines: 1 })
  })

  test("Minato is no Naruto: long bangs either side of his face past the jaw; the turned head a profile, an ear behind the bang", () => {
    const head = MINATO.head.rows
    const hair = /[abc]/
    // the bangs: hair beside the face down to the rows under the chin, both sides
    for (const y of [15, 16, 17]) expect({ y, left: hair.test(head[y]!.slice(0, 6)), right: hair.test(head[y]!.slice(15)) }).toEqual({ y, left: true, right: true })
    const turn = MINATO.heads!['turn']!.rows
    // a profile: the nose a pixel proud of the brow and the chin
    const front = (r: string): number => r.search(/[^.]/)
    expect(front(turn[13]!)).toBeLessThan(front(turn[12]!))
    expect(front(turn[13]!)).toBeLessThan(front(turn[14]!))
    // the ear: skin behind the hair of the bang, outlined on its far side
    expect(turn.slice(11, 15).some(r => /b[de]{1,2}o/.test(r.slice(10, 16)) || /bdd?o|bde?o/.test(r))).toBe(true)
  })
})

