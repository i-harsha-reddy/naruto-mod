// The haori group drawn natively: Jiraiya and Madara on the 'haori' template
// (hooks/sprite/templates/haori.ts), their heads, faces, dojutsu, props and
// cel moves (hooks/sprite/ninja/, hooks/sprite/anims/).

import { describe, expect, test } from 'claude-code/testing'
import type { ChibiState, Pose } from '../hooks/art/chibi.ts'
import { SPRITE, pixelCells, sprite } from '../hooks/art/pixel.ts'
import { frameTime, hitsOf, poseAt, shoutAt, sinceOf, totalOf } from '../hooks/art/move.ts'
import { ARRIVAL_INDEX, CHEER_INDEX, DISPEL_INDEX, FIZZLE_INDEX, QUICK_INDEX, movesOf, playOf } from '../hooks/art/moves.ts'
import type { Mood } from '../hooks/art/portrait.ts'
import { byId } from '../hooks/roster.ts'
import { faceOfEyes, poseOf } from '../hooks/sprite/cels.ts'
import { compose } from '../hooks/sprite/compose.ts'
import { dressOf } from '../hooks/sprite/dress.ts'
import { FX, FX_PALETTES } from '../hooks/sprite/fx/index.ts'
import { compile, missing } from '../hooks/sprite/grid.ts'
import { NATIVE, STAGE_H, STAGE_W, frameOf, register } from '../hooks/sprite/index.ts'
import { JIRAIYA } from '../hooks/sprite/ninja/jiraiya.ts'
import { MADARA } from '../hooks/sprite/ninja/madara.ts'
import { POST } from '../hooks/sprite/post.ts'
import { HAORI } from '../hooks/sprite/templates/haori.ts'
import type { CelMove, NinjaSprite } from '../hooks/sprite/types.ts'
import { LEAP_CLIP } from '../hooks/sprite/anims/kit.ts'
import { JUTSU } from './jutsu.ts'

// ---------------------------------------------------------------- helpers

const CAST: readonly NinjaSprite[] = [JIRAIYA, MADARA]
const OLD = JUTSU
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
const leftEye = (px: ArrayLike<number>, n: NinjaSprite, hx: number, hy: number): number[] => {
  const [ex, ey] = n.head.eyes[0]
  return [0, 1].flatMap(dy => [0, 1].map(dx => px[(hy + ey + dy) * STAGE_W + hx + ex + dx]!))
}
const has = (px: ArrayLike<number>, colour: number): boolean => Array.prototype.includes.call(px, colour)
// how many frames of a move show a colour
const showing = (id: string, index: number, colour: number): number => {
  const m = playOf(id, index) as CelMove
  return m.frames.filter((_, i) => has(sprite(moveState(id, index, i / 10), byId(id).glow, 48, 24), colour)).length
}

// colours of their own: Madara's Sharingan red and the Rinnegan's pale ring,
// Jiraiya's toad yellow and pigment, the gunbai's cream, the Susanoo sword's
// edge, the hair ball's white (the mane's), a needle's point
const RED = 0xd8141e
const RINNEGAN = 0xc4b4e4
const TOAD_EYE = 0xf2c63a
const PIGMENT = 0xe0602c
const GUNBAI = 0xf2e8cc
const GUNBAI_RED = 0xd02e36
const GUNBAI_LINE = 0x7a5a3a
const SWORD = 0xe2eeff

// ---------------------------------------------------------------- the art's data

describe('the haori template', () => {
  test('every companion pose has its own drawing, under its name or the map', () => {
    expect(Object.keys(HAORI.map).sort()).toEqual([...POSES].sort())
    for (const pose of POSES) {
      const drawn = HAORI.poses[pose] ? pose : HAORI.map[pose]
      expect({ pose, drawn: HAORI.poses[drawn] !== undefined }).toEqual({ pose, drawn: true })
    }
    // the prototype's 31, the kabuki, and the holds' poses stirring and breathing in
    expect(Object.keys(HAORI.poses).length).toBeGreaterThanOrEqual(32)
    for (const name of ['crossed', 'think', 'spread', 'raise', 'gather', 'charge', 'slam', 'sign2', 'kabuki']) {
      const pose = HAORI.poses[name]!
      const wind = HAORI.poses[`${name}Wind`]
      expect({ name, wind: wind !== undefined }).toEqual({ name, wind: true })
      // on the pose's own feet row, a few pixels stirring, never a new drawing
      expect({ name, rows: wind!.rows.length }).toEqual({ name, rows: pose.rows.length })
      expect({ name, feet: wind!.rows.at(-1)!.replace(/\.+$/, '') }).toEqual({ name, feet: pose.rows.at(-1)!.replace(/\.+$/, '') })
      const changed = wind!.rows.reduce((n, r, y) => n + [...r].filter((ch, x) => ch !== (pose.rows[y]![x] ?? '.')).length, 0)
      expect({ name, stirs: changed > 0 && changed <= 16 }).toEqual({ name, stirs: true })
    }
    // the rest poses' breath in: the shoulders a pixel up
    for (const name of ['crossed', 'think', 'sign1', 'sign2', 'sign3', 'gather', 'kabuki']) expect({ name, breath: HAORI.poses[name]!.breath }).toEqual({ name, breath: `${name}In` })
  })

  test("every pose stands on its feet at its root, in the template's letters, every one in each ninja's colours", () => {
    for (const [name, p] of Object.entries(HAORI.poses)) {
      const g = compile(p.rows)
      expect({ name, feet: /[^.]/.test(p.rows[p.rows.length - 1]!) }).toEqual({ name, feet: true })
      expect({ name, root: HAORI.root < g.w }).toEqual({ name, root: true })
      for (const row of p.rows) for (const ch of row) if (ch !== '.') expect({ name, ch, ok: HAORI.letters.includes(ch.toLowerCase()) }).toEqual({ name, ch, ok: true })
      for (const n of CAST) expect({ id: n.id, name, missing: missing(p.rows, n.body) }).toEqual({ id: n.id, name, missing: [] })
      if (p.hand) expect({ name, hand: p.hand[0] >= 0 && p.hand[0] < g.w && p.hand[1] >= 0 && p.hand[1] < g.h }).toEqual({ name, hand: true })
      const back = p.points?.['back'] ?? HAORI.points!['back']!
      expect({ name, back: back[0] >= 0 && back[0] < g.w && back[1] >= 0 && back[1] < g.h }).toEqual({ name, back: true })
      if (p.breath) expect({ name, breath: HAORI.poses[p.breath] !== undefined }).toEqual({ name, breath: true })
      expect({ name, as: p.as !== undefined && POSES.includes(p.as) }).toEqual({ name, as: true })
    }
    for (const n of CAST) for (const ch of HAORI.letters) expect({ id: n.id, ch, mapped: ch in n.body }).toEqual({ id: n.id, ch, mapped: true })
  })

  test("the heads, faces, dojutsu and props use only their palettes' letters, the eyes and neck on the head", () => {
    for (const n of CAST) {
      for (const head of [n.head, n.dojutsu?.head, ...Object.values(n.heads ?? {})].filter(h => h !== undefined)) {
        expect({ id: n.id, missing: missing(head.rows, head.palette) }).toEqual({ id: n.id, missing: [] })
        expect({ id: n.id, tall: head.rows.length >= 19 && head.rows.length <= 21 }).toEqual({ id: n.id, tall: true })
        for (const [x, y] of [...head.eyes, head.neck]) expect({ id: n.id, at: [x, y], on: head.rows[y]?.[x] !== undefined && head.rows[y]![x] !== '.' }).toEqual({ id: n.id, at: [x, y], on: true })
      }
      const E = n.eyes!
      for (const [state, e] of Object.entries(E.states)) expect({ id: n.id, state, missing: missing(e.rows, E.palette) }).toEqual({ id: n.id, state, missing: [] })
      for (const e of [n.dojutsu?.eyes, ...Object.values(n.dojutsu?.states ?? {})]) if (e) expect({ id: n.id, missing: missing(e.rows, E.palette) }).toEqual({ id: n.id, missing: [] })
      for (const p of n.props ?? []) {
        expect({ id: n.id, missing: missing(p.rows, p.palette ?? n.body) }).toEqual({ id: n.id, missing: [] })
        for (const [pose, q] of Object.entries(p.poses ?? {})) if (q?.rows) expect({ id: n.id, pose, missing: missing(q.rows, p.palette ?? n.body) }).toEqual({ id: n.id, pose, missing: [] })
      }
      // the faces their poseEyes ask for are drawn
      for (const [pose, state] of Object.entries(n.poseEyes ?? {})) expect({ id: n.id, pose, drawn: state in E.states }).toEqual({ id: n.id, pose, drawn: true })
      // and the eye states the faces map to, all eight and smug
      for (const state of ['open', 'left', 'half', 'shut', 'focus', 'happy', 'sad', 'wide', 'smug']) expect({ id: n.id, state, drawn: state in E.states }).toEqual({ id: n.id, state, drawn: true })
    }
    // the artist's extra faces: his wink, the Rinnegan
    expect(JIRAIYA.eyes!.states['wink']).toBeDefined()
    expect(MADARA.eyes!.states['rinnegan']).toBeDefined()
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
      })
    }
    // the quick strikes, as moves.ts's QUICK table names them
    const quick: Record<string, [string, string, boolean]> = {
      jiraiya: ['Frog Kumite', 'Frog Kumite', false],
      madara: ['Uchiha Return', 'Uchiha Return', false],
    }
    for (const n of CAST) {
      const q = n.quick
      expect({ id: n.id, name: q.name, shout: q.shout, dojutsu: q.dojutsu, on: q.on, quick: q.quick }).toEqual({ id: n.id, name: quick[n.id]![0], shout: quick[n.id]![1], dojutsu: quick[n.id]![2], on: ['edit'], quick: true })
    }
  })

  test('the spinner shouts what the old moves shouted: the summons at the slap, "Second meteor!" at the second', () => {
    ensure()
    const [, gamabunta] = movesOf('jiraiya')
    const slam = -sinceOf(gamabunta!, 0, 'slam')
    expect(shoutAt(gamabunta!, frameTime(slam))).toBe('Summon: Gamabunta')
    const tengai = movesOf('madara')[2]!
    const second = -sinceOf(tengai, 0, 'second')
    expect(shoutAt(tengai, frameTime(second + 0.3))).toBe('Second meteor')
    // and the jutsu's own name at its first blow
    expect(shoutAt(tengai, frameTime(hitsOf(tengai)[0]!.at))).toBe('Tengai Shinsei')
    // the second meteor lands too: two blows
    expect(hitsOf(tengai).length).toBe(2)
  })

  test('keep the contract: their lengths, a launch before the first blow, the blow held (hit-stop), a recovery after it', () => {
    ensure()
    for (const n of CAST)
      for (const [m, lo, hi] of [...n.moves.map(m => [m, 4.5, 6.5] as const), [n.quick, 1.5, 2.0] as const]) {
        const total = totalOf(m)
        expect({ id: n.id, move: m.name, total, long: total >= lo - 1e-9 && total <= hi + 1e-9 }).toEqual({ id: n.id, move: m.name, total, long: true })
        const hit = hitsOf(m)[0]?.at
        expect({ id: n.id, move: m.name, blow: hit !== undefined }).toEqual({ id: n.id, move: m.name, blow: true })
        const first = m.beats.findIndex(b => /^(impact|finish|hit\d*)$/.test(b.name))
        const launched = m.beats.slice(0, first).some(b => LAUNCH.test(b.name) || b.shout === true)
        expect({ id: n.id, move: m.name, launched }).toEqual({ id: n.id, move: m.name, launched: true })
        // the blow's first drawing (its pose, where it stands) held two frames at least, however the cels split them
        const at = m.frames.findIndex(f => /^(impact|finish|hit\d*)$/.test(f.tag))
        const [f0, f1] = [m.frames[at]!, m.frames[at + 1]]
        const held = f1 !== undefined && f0.k?.pose === f1.k?.pose && f0.k?.x === f1.k?.x && (f0.k?.lift ?? 0) === (f1.k?.lift ?? 0)
        expect({ id: n.id, move: m.name, stop: held }).toEqual({ id: n.id, move: m.name, stop: true })
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
          // (stood up on something, Jiraiya on the toad's crown: the stage's
          // top may cut his head as high as he stands)
          const up = Math.max(0, -(cel.k.dy ?? 0))
          // (a shake may jolt the whole frame a pixel)
          const jolt = typeof cel.shake === 'number' ? Math.abs(cel.shake) : cel.shake ? Math.max(Math.abs(cel.shake[0]), Math.abs(cel.shake[1])) : 0
          const onCanvas = h!.top >= (air ? -LEAP_CLIP : 0) - up - jolt && h!.x >= 0 && h!.x + 21 <= STAGE_W && h!.y + 19 <= STAGE_H + jolt
          expect({ id: n.id, index, i, onCanvas }).toEqual({ id: n.id, index, i, onCanvas: true })
          // the left eye drawn on the head, in the eyes' own colours (under
          // what is drawn in front of them: effects)
          const eyes = cel.k.eyes ?? n.poseEyes?.[cel.k.pose] ?? poseOf(dressOf(n), cel.k.pose).eyes ?? 'open'
          const bare = compose(n, { ...cel, fx: cel.fx?.filter(e => e.back), clones: [] }, cel.t, { ...faceOfEyes(eyes, cel.k.awake === true), eyes }, { move: true })
          const eye = leftEye(bare.px, n, bare.head!.x, bare.head!.y)
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

  test("the cheer is the roster's: its pose and face by the time the hello looks, then the breath and the stance", () => {
    ensure()
    const idle0 = HAORI.poses['idle0']!.rows
    const idle1 = HAORI.poses['idle1']!.rows
    for (const n of CAST) {
      const { pose, mood } = byId(n.id).cheer
      const m = playOf(n.id, CHEER_INDEX) as CelMove
      expect({ id: n.id, at: poseAt(m, 0.6) }).toMatchObject({ id: n.id, at: { pose, mood } })
      // rule 5's ending: idle1 with the head dipped a frame, then standing one or two
      const fr = m.frames
      let i = fr.length - 1
      while (i >= 0 && poseOf(dressOf(n), fr[i]!.k!.pose).rows === idle0) i--
      expect({ id: n.id, standing: fr.length - 1 - i, breath: poseOf(dressOf(n), fr[i]!.k!.pose).rows === idle1 && fr[i]!.k!.hdy === 1 }).toMatchObject({ id: n.id, breath: true })
      expect(fr.length - 1 - i >= 1 && fr.length - 1 - i <= 2).toBe(true)
      // a tail of seven frames or fewer after the action (the cheer's pose reached by 0.6 s)
      expect({ id: n.id, short: fr.length <= 16 }).toEqual({ id: n.id, short: true })
    }
    // Jiraiya winks in it, Madara smirks
    expect(JIRAIYA.poseEyes?.['thumbs']).toBe('wink')
    expect(MADARA.poseEyes?.['crossed']).toBe('smug')
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
                expect({ id: n.id, pose, mood, blink, eyes: leftEye(px, n, h.x, h.y).some(c => colours.has(c)) }).toEqual({ id: n.id, pose, mood, blink, eyes: true })
              }
    }
  })

  test('every badge sits by the head in every pose, on the stage and in the peek', () => {
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
      for (const mood of ['calm', 'focus', 'happy', 'worried', 'surprised', 'sleep', 'smug'] as Mood[]) looks.add(look(still(n.id, 'idle', mood)))
      looks.add(look(still(n.id, 'idle', 'calm', { face: { blink: 0.62, gaze: [0, 0], mood: 'calm', active: false } })))
      looks.add(look(still(n.id, 'idle', 'calm', { face: { blink: 0, gaze: [-0.8, 0], mood: 'calm', active: false } })))
      expect({ id: n.id, looks: looks.size }).toEqual({ id: n.id, looks: 9 })
    }
  })

  test("Madara's Sharingan never sleeps; the Rinnegan wakes as he reads, and in Tengai Shinsei", () => {
    ensure()
    const at = (pose: Pose, mood: Mood, active: boolean) => Array.from(native(still('madara', pose, mood, { face: { blink: 0, gaze: [0, 0], mood, active } })).px)
    for (const mood of ['calm', 'focus', 'smug'] as Mood[]) expect({ mood, red: has(at('idle', mood, false), RED) }).toEqual({ mood, red: true })
    expect(has(at('think', 'focus', true), RINNEGAN)).toBe(true)
    expect(has(at('think', 'focus', false), RINNEGAN)).toBe(false)
    expect(showing('madara', 2, RINNEGAN)).toBeGreaterThan(30)
    for (const index of [0, 1, QUICK_INDEX, CHEER_INDEX]) expect({ index, rinnegan: showing('madara', index, RINNEGAN) }).toEqual({ index, rinnegan: 0 })
  })

  test("Jiraiya's Sage Mode (the pigment, the toad's eyes) comes up for the Giant Rasengan and nowhere else", () => {
    ensure()
    expect(showing('jiraiya', 0, PIGMENT)).toBeGreaterThan(20)
    expect(showing('jiraiya', 0, TOAD_EYE)).toBeGreaterThan(20)
    for (const index of [1, 2, QUICK_INDEX, CHEER_INDEX]) expect({ index, sage: showing('jiraiya', index, PIGMENT) }).toEqual({ index, sage: 0 })
    for (const pose of POSES) expect({ pose, sage: has(sprite(still('jiraiya', pose), byId('jiraiya').glow, 48, 24), PIGMENT) }).toEqual({ pose, sage: false })
  })
})

// ---------------------------------------------------------------- props

describe('what they carry', () => {
  test("the gunbai rides on Madara's back at rest, and is in his hand only for Uchiha Return", () => {
    ensure()
    for (const pose of ['idle', 'crossed', 'think', 'signs', 'strike', 'dash'] as Pose[]) expect({ pose, fan: has(sprite(still('madara', pose), byId('madara').glow, 48, 24), GUNBAI) }).toEqual({ pose, fan: true })
    // in hand: held up at his head, swept round flat (the back's is gone then)
    const fan = MADARA.props!.find(p => p.only?.includes('fanUp'))!
    expect(fan).toBeDefined()
    const quick = MADARA.quick
    expect(quick.frames.some(f => f.k?.pose === 'fanUp')).toBe(true)
    expect(quick.frames.some(f => f.k?.pose === 'fanSwing')).toBe(true)
    for (const index of [0, 1, 2]) expect({ index, inHand: (playOf('madara', index) as CelMove).frames.some(f => f.k?.pose.startsWith('fan')) }).toEqual({ index, inHand: false })
  })

  test("the Susanoo's sword is drawn in the Susanoo and nowhere else", () => {
    ensure()
    expect(showing('madara', 1, SWORD)).toBeGreaterThan(15)
    for (const index of [0, 2, QUICK_INDEX, CHEER_INDEX]) expect({ index, sword: showing('madara', index, SWORD) }).toEqual({ index, sword: 0 })
    for (const pose of POSES) expect({ pose, sword: has(sprite(still('madara', pose), byId('madara').glow, 48, 24), SWORD) }).toEqual({ pose, sword: false })
  })

  test("the Needle Jizō's hair ball and needles show in the Needle Jizō only; the ball rolls at the post; the mane rides with him", () => {
    ensure()
    const jizo = JIRAIYA.moves[2]!
    const ball = jizo.frames.filter(f => f.k?.pose.startsWith('jizo') && !f.k.pose.startsWith('jizoAfter'))
    expect(ball.length).toBeGreaterThan(20)
    for (const index of [0, 1]) expect({ index, jizo: (playOf('jiraiya', index) as CelMove).frames.some(f => f.k?.pose.startsWith('jizo')) }).toEqual({ index, jizo: false })
    // a real roll: the ball turning (its own drawings) and travelling 4+ columns at the post
    const rolling = jizo.frames.filter(f => /^jizoRoll/.test(f.k?.pose ?? ''))
    expect(new Set(rolling.map(f => f.k!.pose)).size).toBe(2)
    expect(Math.max(...rolling.map(f => f.k!.x)) - Math.min(...rolling.map(f => f.k!.x))).toBeGreaterThanOrEqual(4)
    // the needles: dark-outlined spikes, in flight and then stuck in the post (effects on the post)
    const needles = FX['jizoNeedles']!
    for (const fr of needles.frames) {
      const rows = ('rows' in fr ? fr.rows : fr) as readonly string[]
      expect(rows.some(r => /oc/.test(r))).toBe(true)
    }
    expect(jizo.frames.filter(f => f.fx?.some(e => e.fx === 'jizoNeedles')).length).toBeGreaterThan(10)
    // the mane's dark strands behind him
    const STRAND = 0x7c8298
    for (const pose of ['idle', 'think'] as Pose[]) expect({ pose, mane: has(sprite(still('jiraiya', pose), byId('jiraiya').glow, 48, 24), STRAND) }).toEqual({ pose, mane: true })
  })

  test('Gamabunta comes down on the post and leaves it driven into the ground; the meteors leave none', () => {
    ensure()
    const gama = JIRAIYA.moves[1]!
    expect(gama.frames.some(f => f.fx?.some(e => e.fx === 'toad'))).toBe(true)
    expect(Math.max(...gama.frames.map(f => f.pdy ?? 0))).toBeGreaterThanOrEqual(4)
    const tengai = MADARA.moves[2]!
    const hit = tengai.frames.findIndex(f => f.tag === 'impact')
    expect(tengai.frames.slice(hit).every(f => !f.post)).toBe(true)
    expect(tengai.frames.filter(f => f.fx?.some(e => e.fx === 'meteor' || e.fx === 'meteorRoll' || e.fx === 'meteorCrack')).length).toBeGreaterThan(10)
    // landed, the first rock keeps cracking: its crack frames only ever go on, never back
    const cracks = tengai.frames.flatMap(f => f.fx?.filter(e => e.fx === 'meteorCrack').map(e => e.f as number) ?? [])
    expect(cracks.length).toBeGreaterThanOrEqual(5)
    expect(cracks.every((f, i) => i === 0 || f >= cracks[i - 1]!)).toBe(true)
    // and each meteor comes in faster and faster: every frame's fall longer than the last
    for (const name of ['meteorRoll', 'meteorBig']) {
      const path = tengai.frames.flatMap(f => f.fx?.filter(e => e.fx === name && !e.sink && Array.isArray(e.at)).map(e => e.at as readonly number[]) ?? [])
      const run = path.filter((p, i) => i === 0 || p[0] !== path[i - 1]![0] || p[1] !== path[i - 1]![1])
      const steps = run.slice(1).map((p, i) => Math.hypot(p[0]! - run[i]![0]!, p[1]! - run[i]![1]!))
      expect({ name, accelerating: steps.length >= 2 && steps.every((d, i) => i === 0 || d >= steps[i - 1]!) }).toEqual({ name, accelerating: true })
    }
  })
})

// ---------------------------------------------------------------- round 6: motion and staging

describe('round 6: never a dead drawing, the head turned in the blows, the giants giant', () => {
  const drawn = (n: NinjaSprite, pose: string): readonly string[] => poseOf(dressOf(n), pose).rows

  test('no drawing is held still longer than 0.8 s in any of their moves', () => {
    ensure()
    for (const n of CAST)
      for (const index of [0, 1, 2, QUICK_INDEX, CHEER_INDEX]) {
        const m = playOf(n.id, index) as CelMove
        let run = 1
        let prev = ''
        let longest = 0
        m.frames.forEach((_, i) => {
          const key = Array.from(sprite(moveState(n.id, index, i / 10), byId(n.id).glow, 48, 24)).join()
          run = key === prev ? run + 1 : 1
          prev = key
          longest = Math.max(longest, run)
        })
        expect({ id: n.id, index, still: longest <= 8 }).toEqual({ id: n.id, index, still: true })
      }
  })

  test('the blows, runs, kicks and slams turn the head three-quarters to the post', () => {
    ensure()
    const ACTION = ['strike', 'punch', 'dash', 'smear', 'kick', 'slam', 'follow']
    for (const n of CAST)
      for (const index of [0, 1, 2, QUICK_INDEX]) {
        const m = playOf(n.id, index) as CelMove
        for (const f of m.frames) {
          if (!f.k) continue
          const rows = drawn(n, f.k.pose)
          if (!ACTION.some(a => HAORI.poses[a]!.rows === rows)) continue
          expect({ id: n.id, index, t: f.t, pose: f.k.pose, turned: f.k.head === 'turn' || f.k.head === 'sageTurn' }).toEqual({ id: n.id, index, t: f.t, pose: f.k.pose, turned: true })
        }
      }
  })

  test('every move ends on the breath (idle1, the head dipped) and then standing as the post goes', () => {
    ensure()
    const idle0 = HAORI.poses['idle0']!.rows
    const idle1 = HAORI.poses['idle1']!.rows
    for (const n of CAST)
      for (const index of [0, 1, 2, QUICK_INDEX]) {
        const fr = (playOf(n.id, index) as CelMove).frames
        let i = fr.length - 1
        while (i >= 0 && fr[i]!.k && drawn(n, fr[i]!.k!.pose) === idle0) i--
        const before = fr[i]?.k
        expect({ id: n.id, index, standing: fr.length - 1 - i >= 2, breath: before !== undefined && drawn(n, before.pose) === idle1 && before.hdy === 1 }).toEqual({ id: n.id, index, standing: true, breath: true })
      }
  })

  test('no move washes the whole stage in a tint', () => {
    ensure()
    for (const n of CAST) for (const index of MOVE_INDEXES.slice(0, 5)) expect({ id: n.id, index, tint: (playOf(n.id, index) as CelMove).frames.some(f => f.tint) }).toEqual({ id: n.id, index, tint: false })
  })

  test('the cheers are their own: a real leap into the Toad Sage kabuki; the gunbai swung up onto his shoulder, the Sharingan flaring, tapped', () => {
    ensure()
    const kabuki = HAORI.poses['kabuki']!.rows
    const jc = JIRAIYA.cheer.frames
    // up five in the air, then stamped down into the kabuki and held there
    expect(Math.max(...jc.map(f => f.k?.lift ?? 0))).toBe(5)
    expect(jc.filter(f => f.k && drawn(JIRAIYA, f.k.pose) === kabuki).length).toBeGreaterThanOrEqual(4)
    expect(jc.some(f => f.k && drawn(JIRAIYA, f.k.pose) === kabuki && f.shake)).toBe(true)
    // his thumbs-up at rest is the kabuki too, so the cheer's pose never pops
    expect(drawn(JIRAIYA, 'thumbs')).toBe(kabuki)
    const mc = MADARA.cheer.frames.map(f => f.k!.pose)
    // a reach back, then swung up and down onto the shoulder with a step in and a thump
    expect(mc[0]).toBe('windup')
    expect(mc[1]).toBe('fanUp')
    expect(mc).toContain('fanRest')
    expect(mc).toContain('fanTap')
    const xs = MADARA.cheer.frames.map(f => f.k!.x)
    expect(Math.max(...xs) - Math.min(...xs)).toBeGreaterThanOrEqual(2)
    expect(MADARA.cheer.frames.some(f => f.k!.pose === 'fanRest' && f.shake)).toBe(true)
    // the Sharingan flares: a red glint at his eye
    expect(MADARA.cheer.frames.filter(f => f.fx?.some(e => e.fx === 'twinkle')).length).toBeGreaterThanOrEqual(2)
    // in his hand, by the handle: drawn in each, off his back
    for (const pose of ['fanUp', 'fanRest', 'fanTap']) {
      const px = Array.from(native(still('madara', 'idle', 'smug', { move: { index: CHEER_INDEX, t: frameTime(MADARA.cheer.frames.findIndex(f => f.k!.pose === pose) / 10) } })).px)
      expect({ pose, fan: px.filter(c => c === GUNBAI).length > 6 }).toEqual({ pose, fan: true })
    }
  })

  test('Madara stands at his own home, the gunbai on his back on the stage', () => {
    expect(MADARA.home).toBe(33)
    const st = still('madara', 'idle')
    const f = native(st)
    expect(f.head!.x).toBe(23)
    // the fan's cream face and its segment lines both show beside his hair, inside the stage
    const px = Array.from(f.px)
    expect(px.includes(GUNBAI) && px.includes(GUNBAI_LINE)).toBe(true)
    expect(px.includes(GUNBAI_RED)).toBe(false)
  })

  test('Gamabunta is a giant: a bust taller than the stage, shown whole at the climax (eyes, scar, pipe), and Jiraiya lands in his kabuki', () => {
    ensure()
    const toad = FX['toad']!.frames[0]! as readonly string[]
    expect(toad.length).toBeGreaterThanOrEqual(28)
    expect(Math.max(...toad.map(r => r.length))).toBeGreaterThanOrEqual(28)
    const gama = JIRAIYA.moves[1]!
    // the climax: his face whole across the stage (every column on it, risen all the way), never
    // the close crown whose halved eyes read as two yellow shapes
    expect(gama.frames.some(f => f.fx?.some(e => e.fx === 'toadTop'))).toBe(false)
    const face = FX['toadFace']!
    const width = Math.max(...(face.frames[0] as readonly string[]).map(r => r.length))
    const whole = gama.frames.filter(f => f.fx?.some(e => e.fx === 'toadFace' && !e.sink && Array.isArray(e.at) && (e.at as readonly number[])[0]! - face.anchor[0] >= 0 && (e.at as readonly number[])[0]! - face.anchor[0] + width <= 48))
    expect(whole.length).toBeGreaterThanOrEqual(6)
    // alive: he blinks and draws on his pipe
    const looks = new Set(gama.frames.flatMap(f => f.fx?.filter(e => e.fx === 'toadFace').map(e => e.f) ?? []))
    expect(looks.has(1) && looks.has(2)).toBe(true)
    // and the sage, home again out of the smoke, stamps down into his kabuki (the ground jumping)
    const kabuki = HAORI.poses['kabuki']!.rows
    expect(gama.frames.some(f => f.k && drawn(JIRAIYA, f.k.pose) === kabuki && f.shake)).toBe(true)
    // the slap's shout still comes from the slam
    expect(gama.beats.find(b => b.name === 'slam')?.shout).toBe(true)
  })

  test("Madara's Susanoo is built round him, blue; the meteors are bigger than he is, the second bigger still", () => {
    ensure()
    const sus = MADARA.moves[1]!
    // the ribcage at his feet, behind him (the skull) and in front (the ribs), growing in frame by frame
    const cage = sus.frames.flatMap(f => (f.fx ?? []).filter(e => e.fx === 'susanooCage' || e.fx === 'susanooRibs'))
    expect(cage.length).toBeGreaterThan(20)
    for (const e of cage) expect({ fx: e.fx, at: e.at, back: !!e.back }).toEqual({ fx: e.fx, at: [33, 23], back: e.fx === 'susanooCage' })
    // the near ribs grow up out of the ground (0-2), the far halves and the skull rise behind him to the whole (3)
    const grown = [...new Set(sus.frames.map(f => f.fx?.find(e => e.fx === 'susanooRibs')?.f).filter(f => f !== undefined))]
    expect(grown.slice(0, 3)).toEqual([0, 1, 2])
    const caged = sus.frames.map(f => f.fx?.find(e => e.fx === 'susanooCage')?.f).filter(f => f !== undefined)
    expect(caged.includes(3) && caged.indexOf(4) < caged.indexOf(3) && caged.indexOf(5) < caged.indexOf(3)).toBe(true)
    // the near ribs curve round him, a rib each side of his root, meeting at the sternum under him
    const onStage = (name: string, f: number): string[] => {
      const fr = FX[name]!.frames[f]!
      const [ax, ay] = 'anchor' in fr ? fr.anchor : FX[name]!.anchor
      const rows: readonly string[] = 'rows' in fr ? fr.rows : fr
      return Array.from({ length: 24 }, (_, y) => Array.from({ length: 48 }, (_, x) => rows[y - 23 + ay]?.[x - 33 + ax] ?? '.').join(''))
    }
    const near = onStage('susanooRibs', 2)
    for (const y of [10, 15, 19]) expect({ y, left: /[^.]/.test(near[y]!.slice(0, 22)) }).toEqual({ y, left: true })
    for (const y of [19, 20]) expect({ y, right: /[^.]/.test(near[y]!.slice(44)) }).toEqual({ y, right: true })
    expect(near[23]![33]).not.toBe('.')
    // never over his face: nothing in front of him between his temples above his chin
    const crouched = native({ ...still('madara', 'idle'), move: null })
    for (let y = 11; y <= 20; y++) for (let x = 25; x <= 41; x++) expect({ x, y, clear: near[y]![x] === '.' }).toEqual({ x, y, clear: true })
    void crouched
    // the skull behind him, centred over his head at his root, whole from its crown (the
    // stage's top row is its outline, never a band cut off at the brow): a dome over the
    // brow; two slanted, angry sockets (high at the temples, low at the nose), a light in
    // each; the nasal notch between them and lower
    const back = onStage('susanooCage', 3)
    expect(back[0]!.includes('o') && !back[0]!.includes('d')).toBe(true)
    expect(back[1]!.includes('d')).toBe(false)
    const socket = (y: number, side: -1 | 1): number[] => [...back[y]!].map((ch, x) => ((ch === 'd' || ch === 'e') && Math.sign(x - 33) === side && Math.abs(x - 33) >= 3 ? x : -1)).filter(x => x >= 0)
    for (const side of [-1, 1] as const) {
      const top = socket(2, side), mid = socket(3, side), low = socket(4, side)
      expect({ side, rows: top.length > 0 && mid.length > 0 && low.length > 0 }).toEqual({ side, rows: true })
      const mean = (xs: number[]): number => xs.reduce((a, b) => a + b, 0) / xs.length
      // slanted: its top toward the temple, its bottom toward the nose
      expect({ side, angry: side * (mean(top) - 33) > side * (mean(low) - 33) }).toEqual({ side, angry: true })
      expect({ side, glint: [...back[3]!].some((ch, x) => ch === 'e' && Math.sign(x - 33) === side) }).toEqual({ side, glint: true })
    }
    const l = socket(3, -1), r = socket(3, 1)
    expect(Math.abs((Math.min(...l) + Math.max(...r)) / 2 - 33)).toBeLessThanOrEqual(0.5)
    expect(back[2]![33]).not.toBe('d')
    expect(back[4]![33]).toBe('d')
    const rows = (name: string): readonly string[] => FX[name]!.frames[0]! as readonly string[]
    const size = (r: readonly string[]): number => Math.min(r.length, Math.max(...r.map(x => x.length)))
    expect(size(rows('meteor'))).toBeGreaterThanOrEqual(24)
    expect(size(rows('meteorBig'))).toBeGreaterThan(size(rows('meteor')))
    const tengai = MADARA.moves[2]!
    expect(tengai.frames.some(f => f.fx?.some(e => e.fx === 'meteorBig'))).toBe(true)
    // the meteors land with a jolt, never a buzz: no shake over three frames running (the -1, -1, +1 jolt), never more than a pixel down
    const shakes = tengai.frames.map(f => (f.shake === undefined ? null : Array.isArray(f.shake) ? f.shake : [f.shake, 0]))
    expect(shakes.filter(v => v !== null).length).toBeGreaterThanOrEqual(2)
    let run = 0
    for (const v of shakes) {
      run = v ? run + 1 : 0
      expect(run).toBeLessThanOrEqual(3)
      if (v) expect((v as readonly number[])[1]!).toBeLessThanOrEqual(1)
    }
    // the landed rock is never a dead dome: it turns as it grinds into its crater, smoke rising off it
    const turning = new Set(tengai.frames.flatMap(f => (f.fx ?? []).filter(e => (e.fx === 'meteorRoll' || e.fx === 'meteorBig') && e.sink).map(e => `${e.fx}${e.f}`)))
    expect(turning.size).toBeGreaterThanOrEqual(5)
    expect(FX['meteorRoll']!.frames.length).toBe(4)
  })
})

// ---------------------------------------------------------------- round 7: the jutsu land

describe('round 7: the biggest fire, the ribcage round him, nothing gone in a frame', () => {
  const drawn = (n: NinjaSprite, pose: string): readonly string[] => poseOf(dressOf(n), pose).rows
  const span = (name: string, f: number): { w: number; h: number } => {
    const fr = FX[name]!.frames[f]!
    const rows: readonly string[] = 'rows' in fr ? fr.rows : fr
    const cols = rows.flatMap(r => [...r].map((ch, x) => (ch === '.' ? -1 : x))).filter(x => x >= 0)
    const lines = rows.map((r, y) => (/[^.]/.test(r) ? y : -1)).filter(y => y >= 0)
    return { w: Math.max(...cols) - Math.min(...cols) + 1, h: Math.max(...lines) - Math.min(...lines) + 1 }
  }

  test("Madara's Great Fire Annihilation is a wall of flame the stage's height, rolled out over four frames, burning on, dying over three", () => {
    ensure()
    const fire = MADARA.moves[0]!
    const uses = (name: string): number => fire.frames.filter(f => f.fx?.some(e => e.fx === name)).length
    // rolled out over four frames, from his lips past the post
    const wall = fire.frames.filter(f => f.fx?.some(e => e.fx === 'fireWall')).map(f => f.fx!.find(e => e.fx === 'fireWall')!.f)
    expect([...new Set(wall)]).toEqual([0, 1, 2, 3])
    expect(span('fireWall', 0).w).toBeLessThan(span('fireWall', 3).w)
    // the stage's height (and more: cropped at the top) and across the arena: the biggest fire there is
    for (const f of [3]) expect(span('fireWall', f).h).toBeGreaterThanOrEqual(24)
    for (const f of [0, 1, 2]) expect(span('fireField', f).h).toBeGreaterThanOrEqual(24)
    expect(span('fireField', 0).w).toBeGreaterThanOrEqual(28)
    for (const name of ['greatFireball', 'fireStream', 'phoenix']) for (let f = 0; f < FX[name]!.frames.length; f++) expect(span(name, f).w * span(name, f).h).toBeLessThan(span('fireField', 0).w * span('fireField', 0).h)
    // it burns on behind him (drawn back: he is braced in front of it), and dies over three frames
    expect(uses('fireField')).toBeGreaterThanOrEqual(10)
    expect(fire.frames.every(f => (f.fx ?? []).every(e => !e.fx.startsWith('fire') || e.fx === 'fireJet' || e.fx === 'fireStream' || e.back))).toBe(true)
    expect([...new Set(fire.frames.flatMap(f => (f.fx ?? []).filter(e => e.fx === 'fireDie').map(e => e.f)))].length).toBeGreaterThanOrEqual(3)
    // braced in his own split, the mane blown back, stepped into the breath (stoic: no
    // overshoot); in the middle of it a step in and a palm thrust at the wall (his own key),
    // kicked back a column by a surge, then hunched over it pushing the last of it on
    const braced = fire.frames.filter(f => f.k?.pose === 'breathe')
    expect(braced.length).toBeGreaterThanOrEqual(8)
    const at = (i: number): number => fire.frames[i]!.k?.x ?? 0
    const release = fire.frames.findIndex(f => f.tag === 'release')
    expect(at(release)).toBeLessThan(at(release - 1) - 1)
    const thrust = fire.frames.filter(f => f.tag === 'impact' && f.k?.pose === 'strike')
    expect(thrust.length).toBeGreaterThanOrEqual(4)
    expect(thrust.every(f => f.k!.x < braced[braced.length - 1]!.k!.x)).toBe(true)
    const lean = fire.frames.filter(f => f.tag === 'impact' && f.k?.pose === 'charge')
    expect(lean.length).toBeGreaterThanOrEqual(4)
    // a heavy shake as it lands
    expect(fire.frames.some(f => Array.isArray(f.shake) && Math.abs((f.shake as readonly number[])[0]!) >= 2)).toBe(true)
  })

  test("Tengai Shinsei's second meteor sinks into its crater three pixels a frame, under the dust, never gone in one", () => {
    ensure()
    const tengai = MADARA.moves[2]!
    const sinks = tengai.frames.map(f => f.fx?.find(e => e.fx === 'meteorBig' && (e.sink ?? 0) > 0)?.sink).filter((s): s is number => s !== undefined)
    // after it lands, deeper and deeper, three at a time, till little is left above the ground
    const tail = sinks.slice(sinks.findIndex(s => s >= 12))
    expect(tail.length).toBeGreaterThanOrEqual(5)
    tail.forEach((s, i) => i > 0 && expect(s - tail[i - 1]!).toBeLessThanOrEqual(3))
    expect(tail.at(-1)!).toBeGreaterThanOrEqual(24)
    // the dust over it as it goes
    const last = tengai.frames.findLastIndex(f => f.fx?.some(e => e.fx === 'meteorBig'))
    expect(tengai.frames[last]!.fx!.some(e => e.fx === 'smoke')).toBe(true)
  })

  test("Jiraiya's Giant Rasengan stays the ball's size ground into the post, then bursts wider, two rings", () => {
    ensure()
    const ras = JIRAIYA.moves[0]!
    expect(span('rasenGrind', 0).w).toBeGreaterThanOrEqual(span('giantRasengan', 0).w)
    const ground = ras.frames.filter(f => f.tag === 'impact' && f.fx?.some(e => e.fx === 'rasenGrind'))
    expect(ground.length).toBeGreaterThanOrEqual(4)
    const bursts = ras.frames.filter(f => f.fx?.some(e => e.fx === 'rasenBurst'))
    const lastBurst = bursts.at(-1)!.fx!.find(e => e.fx === 'rasenBurst')!.f as number
    expect(span('rasenBurst', lastBurst).w).toBeGreaterThanOrEqual(16)
    expect(bursts.some(f => f.fx!.filter(e => e.fx === 'shockRing').length >= 2)).toBe(true)
  })

  test('they stand on a shadow, past the hem either side, as every other ninja does', () => {
    ensure()
    for (const n of CAST) {
      const px = native(still(n.id, 'idle')).px
      const x = n.home ?? 35
      for (const dx of [-12, -11, 10, 11]) expect({ id: n.id, dx, shadow: px[23 * STAGE_W + x + dx] }).toEqual({ id: n.id, dx, shadow: 0x09090c })
    }
  })

  test('the turned heads turn: the face three pixels toward the post, the outline swung back', () => {
    for (const n of CAST) {
      const turn = n.heads!['turn']!
      expect({ id: n.id, face: n.head.eyes[0][0] - turn.eyes[0][0] }).toEqual({ id: n.id, face: 3 })
      const width = (rows: readonly string[]): number => Math.max(...rows.map(r => r.replace(/\.+$/, '').length))
      // the hair swung back: more of it behind the face than when he faces us
      const behind = (h: typeof turn): number => width(h.rows) - h.eyes[0][0]
      expect({ id: n.id, back: behind(turn) - behind(n.head) >= 2 }).toEqual({ id: n.id, back: true })
      // and the turned face keeps its far eye and a cheek line against the hair (never a blank mass)
      const [, [fx, fy]] = turn.eyes
      expect({ id: n.id, skin: /[de]/.test(turn.rows[fy]!.slice(fx, fx + 3)) }).toEqual({ id: n.id, skin: true })
    }
  })

  test('folded arms: two rows tall inside the coat, upper arms down the sides, the near forearm stepping up to a fist, the outfit showing above and below', () => {
    const rows = HAORI.poses['crossed']!.rows
    const ARM = /[nml]/
    const span = (r: string): [number, number] => [r.search(/[nmlsk]/), r.length - 1 - [...r].reverse().join('').search(/[nmlsk]/)]
    // the forearms: rows 8 and 9, the coat's edge (its dark side) showing outside them either side
    const coat = rows[10]!
    const [cl, cr] = [coat.indexOf('o'), coat.lastIndexOf('o')]
    for (const y of [8, 9]) {
      const [l, r] = span(rows[y]!)
      expect({ y, inside: l > cl && r < cr && rows[y]![l - 1] === 'x' && rows[y]![r + 1] === 'x' }).toEqual({ y, inside: true })
      // the sleeves no wider than the torso plus two
      expect({ y, wide: r - l + 1 <= cr - cl - 1 + 2 }).toEqual({ y, wide: true })
    }
    // the near forearm low from its elbow, then a step up to a two-pixel fist on the far upper arm
    const lowNear = rows[9]!.search(/n{4}/), highNear = rows[8]!.search(/n{4}/)
    expect(highNear).toBeGreaterThan(lowNear)
    expect(rows[8]!.includes('skl')).toBe(true)
    // no black between the two rows of arms
    const [l8, r8] = span(rows[8]!)
    expect(rows[9]!.slice(l8 + 3, r8 - 1).includes('o')).toBe(false)
    // the upper arms down the sides, the coat between them above the forearms
    expect(ARM.test(rows[7]![6]!) && ARM.test(rows[7]![19]!)).toBe(true)
    expect(/[vw]/.test(rows[7]!.slice(9, 13))).toBe(true)
    // two rows of the outfit below them
    for (const y of [10, 11]) expect({ y, coat: /[vwx]{4}/.test(rows[y]!) && !ARM.test(rows[y]!) }).toEqual({ y, coat: true })
  })

  test('the rabbit seal sits at mid-chest, a 4 x 3 block with its fingers split, the coat showing between it and the chin', () => {
    const rows = HAORI.poses['sign2']!.rows
    const hands = rows.map((r, y) => [...r].map((ch, x) => (/[sk]/.test(ch) && x > 6 && x < 18 ? [x, y] : null)).filter(Boolean)).flat() as [number, number][]
    const xs = hands.map(([x]) => x), ys = hands.map(([, y]) => y)
    expect(Math.max(...xs) - Math.min(...xs) + 1).toBe(4)
    expect(Math.max(...ys) - Math.min(...ys) + 1).toBe(3)
    expect(Math.min(...ys)).toBe(8)
    // the split: a dark pixel between the fingertips on the top row
    expect(rows[8]!.slice(Math.min(...xs), Math.max(...xs) + 1)).toMatch(/[sk]o[sk]/)
    // drawn under the head (lowercase), and on the stage a row of the coat between the chin and the seal
    expect(/[SK]/.test(rows.join(''))).toBe(false)
    for (const n of CAST) {
      ensure()
      const f = native(still(n.id, 'signs2'))
      const head = f.head!
      const chin = head.y + Math.max(...n.head.rows.map((r, y) => (/d/.test(r) ? y : -1)))
      const hand = n.body['s']!
      const top = Array.from({ length: 24 }, (_, y) => y).find(y => y > chin && Array.from({ length: 48 }, (_, x) => f.px[y * 48 + x]!).some(c => c === hand))!
      expect({ id: n.id, gap: top - chin >= 2 }).toEqual({ id: n.id, gap: true })
    }
  })

  test("Madara's gunbai is a war fan, not a ping-pong paddle: held up, a round face about 11 x 12 with segment lines; on his back seen three-quarters, a narrow oval with one line, whole on the stage", () => {
    // in his hand (held up, the cheer): the round face, its segment lines fanning up from the handle
    const held = MADARA.props!.find(p => p.only?.includes('fanUp'))!
    const face = held.rows.filter(r => /[WE]/.test(r))
    expect(Math.max(...face.map(r => r.replace(/^\.+|\.+$/g, '').length))).toBeGreaterThanOrEqual(11)
    expect(face.filter(r => /[WE]G[WE]/.test(r)).length).toBeGreaterThanOrEqual(5)
    expect(held.rows.filter(r => /^\.*O[HG]O\.*$/.test(r)).length).toBeGreaterThanOrEqual(8)
    // on his back: a narrow oval (6 wide at most) with a single segment line, the handle below it
    const back = MADARA.props!.find(p => p.palette && p.behind && p.rows.some(r => r.includes('w')) && p.rows.some(r => r.includes('h')))!
    const oval = back.rows.filter(r => /[we]/.test(r))
    expect(Math.max(...oval.map(r => r.replace(/^\.+|\.+$/g, '').length))).toBeLessThanOrEqual(6)
    expect(oval.every(r => (r.match(/g/g) ?? []).length <= 1)).toBe(true)
    expect(oval.filter(r => r.includes('g')).length).toBeGreaterThanOrEqual(5)
    expect(back.rows.filter(r => /^\.*o[hg]o\.*$/.test(r)).length).toBeGreaterThanOrEqual(6)
    // and drawn whole on the stage at rest, in a lunge and braced in the fire's split: never
    // the edge of a circle cut off by the stage's side
    const CREAM = 0xf2e8cc
    for (const [index, t] of [[0, 1.6], [3, 0.4]] as const) {
      const px = Array.from(native(still('madara', 'idle', 'calm', { move: { index, t } })).px)
      expect({ index, fan: px.filter(c => c === CREAM).length >= 10 }).toEqual({ index, fan: true })
    }
  })

  test("Jiraiya is no helmet and no curtain: his hair swept up and back, one bang to his chin on the post's side, the horned plate on his brow, the mane down his back on the far side, a solid Jizō", () => {
    const h = JIRAIYA.head
    const chin = h.rows.findIndex((r, y) => y > 12 && !/[de]/.test(r))
    // the post's side: a bang that stops at the chin (nothing of his hair below it at the left);
    // the far side: the hair falling on past the jaw
    const left = (r: string): string => r.slice(0, 5)
    expect(h.rows.slice(chin + 1).every(r => !/[abcn]/.test(left(r)))).toBe(true)
    expect(h.rows.slice(chin).some(r => /[abcn]/.test(r.slice(17)))).toBe(true)
    // the spikes swept back: each tip on its spike's far edge (the outline above a tip at its right)
    const tips = h.rows[1]!
    expect([...tips].filter(ch => ch === 'a').length).toBeGreaterThanOrEqual(2)
    // the protector: a light plate in a dark frame with the kanji, two horns above it
    expect(h.rows.some(r => /f[gh]{3,}f[gh]f[gh]{3,}f/.test(r))).toBe(true)
    const plate = h.rows.findIndex(r => /f{9,}/.test(r))
    expect(h.rows.slice(plate - 3, plate).filter(r => /o[gh]o|ohh?o/.test(r)).length).toBeGreaterThanOrEqual(2)
    // the mane: one mass behind him on the far side, down to his waist; none on the post's side
    const mane = JIRAIYA.props!.find(p => p.on === 'head' && p.behind)!
    expect(mane.rows.length).toBeGreaterThanOrEqual(10)
    expect(mane.at[0]).toBeGreaterThanOrEqual(15)
    // the Jizō a solid dome: no checkered speckle in it
    const jizo = JIRAIYA.props!.find(p => p.only?.includes('jizoBall'))!
    for (const rows of [jizo.rows, ...Object.values(jizo.poses ?? {}).map(q => q!.rows!)]) {
      const speckle = rows.filter((r, y) => y > 0 && y < rows.length - 1 && /c[ab]c[ab]c/.test(r)).length
      expect(speckle).toBe(0)
    }
  })

  test("Jiraiya's jutsu open on their own seals, and the Giant Rasengan's ball stays clear of his face, biggest at the blow", () => {
    ensure()
    const open = (i: number): string => JIRAIYA.moves[i]!.frames.slice(0, 7).map(f => f.k?.pose).join(',')
    expect(open(0)).not.toBe(open(2))
    expect(open(0)).not.toBe(open(1))
    expect(open(1)).not.toBe(open(2))
    const size = (name: string, f: number): number => {
      const fr = FX[name]!.frames[f]!
      const rows: readonly string[] = 'rows' in fr ? fr.rows : fr
      return Math.max(...rows.map(r => r.replace(/^\.+|\.+$/g, '').length))
    }
    expect(size('rasenGrind', 0)).toBeGreaterThan(size('giantRasengan', 0))
  })

  test("Gamabunta's crown close up: round eyes with oval pupils, not layers of stripes", () => {
    const fr = FX['toadTop']!.frames[0]!
    const rows: readonly string[] = 'rows' in fr ? fr.rows : fr
    // the pupil an oval (its rows not all one width), the eye's shade a crescent in its lower curve, not a band
    const pupil = rows.map(r => (r.slice(0, 14).match(/e/g) ?? []).length).filter(w => w > 0)
    expect(pupil.length).toBeGreaterThanOrEqual(3)
    expect(new Set(pupil).size).toBeGreaterThan(1)
    const shade = rows.map(r => r.slice(0, 14).indexOf('l')).filter(x => x >= 0)
    expect(new Set(shade).size).toBeGreaterThan(1)
  })

  test("Jiraiya's cheer leaps five and lands in the kabuki; his strike's toad stance comes first", () => {
    ensure()
    expect(Math.max(...JIRAIYA.cheer.frames.map(f => f.k?.lift ?? 0))).toBe(5)
    expect(JIRAIYA.quick.frames.slice(0, 3).every(f => drawn(JIRAIYA, f.k!.pose) === HAORI.poses['slam']!.rows)).toBe(true)
  })
})
