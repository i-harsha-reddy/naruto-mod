import { describe, expect, test } from 'claude-code/testing'
import type { ChibiState, Pose } from '../hooks/art/chibi.ts'
import { SPRITE, pixelCells, sprite } from '../hooks/art/pixel.ts'
import { climax, frameTime, hitsOf, poseAt, shoutAt, shoutSpan, sinceOf, totalOf } from '../hooks/art/move.ts'
import { ARRIVAL_INDEX, CHEER_INDEX, DISPEL_INDEX, FIZZLE_INDEX, QUICK_INDEX, movesOf, playOf } from '../hooks/art/moves.ts'
import type { Mood } from '../hooks/art/portrait.ts'
import { Companion, keyOf } from '../hooks/companion.ts'
import { NINJA, byId } from '../hooks/roster.ts'
import { eyesOfFace, faceOfEyes, poseOf } from '../hooks/sprite/cels.ts'
import { FX, FX_PALETTES } from '../hooks/sprite/fx/index.ts'
import { compile, missing, pal } from '../hooks/sprite/grid.ts'
import { compose } from '../hooks/sprite/compose.ts'
import { dressOf, wear } from '../hooks/sprite/dress.ts'
import { CAST_ROOT, K, LEAP_CLIP, cast, hold, hopHome, leap, postIn, postOut, runIn } from '../hooks/sprite/anims/kit.ts'
import { GROUND, HOME, POST_X, STRIKE } from '../hooks/sprite/stage.ts'
import { NATIVE, PEEK_LEFT, STAGE_H, STAGE_W, frameOf, peekLeftOf, register, sharedOf } from '../hooks/sprite/index.ts'
import { celMove } from '../hooks/sprite/cels.ts'
import { KAKASHI } from '../hooks/sprite/ninja/kakashi.ts'
import { POST, POST_PALETTE } from '../hooks/sprite/post.ts'
import { VEST } from '../hooks/sprite/templates/vest.ts'
import type { Cel, CelMove, EyeState, Frame, FxFamily, FxUse, HeadGrid, NinjaSprite, Template } from '../hooks/sprite/types.ts'

// the test runner's console, for the frame-time log
declare const console: { log: (...args: unknown[]) => void }

// ---------------------------------------------------------------- helpers

const POSES: readonly Pose[] = ['idle', 'crossed', 'think', 'signs', 'signs2', 'signs3', 'charge', 'gather', 'strike', 'punch', 'kick', 'dash', 'slam', 'raise', 'alert', 'thumbs', 'scratch', 'spread', 'poke', 'sleep', 'slump', 'tuck']
const MOODS: readonly Mood[] = ['calm', 'focus', 'happy', 'worried', 'surprised', 'sleep', 'smug']
const MOVE_INDEXES = [0, 1, 2, QUICK_INDEX, CHEER_INDEX, ARRIVAL_INDEX, FIZZLE_INDEX, DISPEL_INDEX]
const glow = byId('kakashi').glow

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
// a native frame and where its head is
const native = (st: ChibiState) => frameOf(NATIVE[st.id]!, st, play(st.id), { flicker: 0x4696ff })
const same2px = (a: Int32Array, b: Int32Array): boolean => a.length === b.length && a.every((v, i) => v === b[i])

const GLYPHS = new Set([0x20, 0x2580, 0x2584, 0x2588])
const DEFAULT = 0x01000000
const badCell = (words: Uint32Array): number => {
  for (let o = 0; o < words.length; o += 3) {
    if (!GLYPHS.has(words[o]!)) return o / 3
    for (const c of [words[o + 1]!, words[o + 2]!]) if (c !== DEFAULT && c > 0xffffff) return o / 3
  }
  return -1
}

const same = (a: Int32Array, b: Int32Array): boolean => a.length === b.length && a.every((v, i) => v === b[i])
const EYE_COLOURS = new Set(Object.values(KAKASHI.eyes!.palette).filter((c): c is number => c !== null))

// ---------------------------------------------------------------- Kakashi, native

describe('Kakashi, drawn natively', () => {
  test('is native, his jutsu, quick strike, cheer, arrival, fizzle and dispel all cel moves', () => {
    expect(NATIVE['kakashi']).toBe(KAKASHI)
    expect(movesOf('kakashi').map(m => m.name)).toEqual(['Raikiri', 'Summoning Jutsu: Ninken', 'Kamui'])
    expect(movesOf('kakashi').map(m => m.on)).toEqual([['shell'], ['agent'], undefined])
    expect(playOf('kakashi', QUICK_INDEX)).toBe(KAKASHI.quick)
    expect(playOf('kakashi', CHEER_INDEX)).toBe(KAKASHI.cheer)
    for (const index of MOVE_INDEXES) {
      const m = playOf('kakashi', index) as CelMove
      expect({ index, cels: 'frames' in m }).toEqual({ index, cels: true })
      // a frame each tenth of a second, the beats as long as the cels
      expect({ index, frames: m.frames.length }).toEqual({ index, frames: Math.round(totalOf(m) * 10) })
      m.frames.forEach((f, i) => expect(f.t).toBe(i))
    }
    // the shared moves' lengths, as the companion times them: the arrival, a
    // fizzle (long enough to read: the sputter, the start, the puff, the slump), a dispel
    expect(totalOf(playOf('kakashi', ARRIVAL_INDEX)!)).toBe(0.9)
    expect(totalOf(playOf('kakashi', FIZZLE_INDEX)!)).toBe(0.9)
    expect(totalOf(playOf('kakashi', DISPEL_INDEX)!)).toBe(0.3)
    // every ninja of the roster has a sprite (the renderer draws no one else)
    for (const n of NINJA) expect({ id: n.id, native: n.id in NATIVE }).toEqual({ id: n.id, native: true })
  })

  test('every frame of every move draws, the head on the canvas and the eyes on the head', () => {
    for (const index of MOVE_INDEXES) {
      const m = playOf('kakashi', index) as CelMove
      for (let i = 0; i < m.frames.length; i++) {
        const t = i / 10
        const st = moveState('kakashi', index, t)
        const words = pixelCells(st, glow, SPRITE.columns, SPRITE.rows)
        expect({ index, t, bad: badCell(words) }).toEqual({ index, t, bad: -1 })
        const f = native(st)
        // (the arrival's first frame is a cloud with no one under it)
        if (!m.frames[i]!.k) {
          expect(f.head).toBeNull()
          continue
        }
        const h = f.head!
        // the whole head on the stage, but the hair's top in a leap (LEAP_CLIP
        // pixels at most), and only in the air
        const air = (m.frames[i]!.k!.lift ?? 0) > 0
        const onCanvas = h.top >= (air ? -LEAP_CLIP : 0) && h.x >= 0 && h.x + 21 <= STAGE_W && h.y + 19 <= STAGE_H
        expect({ index, t, top: h.top, onCanvas }).toEqual({ index, t, top: h.top, onCanvas: true })
        // the left eye's 2 x 2 drawn on the head, in the eyes' own colours
        // (under the effects in front, which may cover the face: a cloud)
        const cel = m.frames[i]!
        const bare = compose(KAKASHI, { ...cel, fx: cel.fx?.filter(e => e.back) }, cel.t, faceOfEyes(cel.k!.eyes ?? poseOf(dressOf(KAKASHI), cel.k!.pose).eyes ?? 'open', cel.k!.awake === true), { move: true }).px
        const [ex, ey] = [h.x + 7, h.y + 12]
        const eye = [bare[ey * STAGE_W + ex]!, bare[ey * STAGE_W + ex + 1]!, bare[(ey + 1) * STAGE_W + ex]!, bare[(ey + 1) * STAGE_W + ex + 1]!]
        expect({ index, t, eyes: eye.some(c => EYE_COLOURS.has(c)) }).toEqual({ index, t, eyes: true })
      }
    }
  })

  test('every companion pose, mood, blink and breath draws at rest, the head whole and the eyes on it', () => {
    for (const pose of POSES)
      for (const mood of MOODS)
        for (const blink of [0, 0.5, 1])
          for (const bob of [0, 1])
            for (const active of [false, true]) {
              const st = still('kakashi', pose, mood, { bob, face: { blink, gaze: [blink ? -0.8 : 0, 0], mood, active } })
              const words = pixelCells(st, glow, SPRITE.columns, SPRITE.rows)
              expect({ pose, mood, blink, bob, bad: badCell(words) }).toEqual({ pose, mood, blink, bob, bad: -1 })
              const h = native(st).head!
              // (asleep, the breath sinks the chin's outline into the floor)
              expect({ pose, bob, top: h.top >= 0 && h.y + 18 <= STAGE_H && h.x >= 0 && h.x + 21 <= STAGE_W }).toEqual({ pose, bob, top: true })
              const f = sprite(st, glow, 48, 24)
              const eye = [0, 1].flatMap(dy => [0, 1].map(dx => f[(h.y + 12 + dy) * STAGE_W + h.x + 7 + dx]!))
              expect({ pose, mood, blink, eyes: eye.some(c => EYE_COLOURS.has(c)) }).toEqual({ pose, mood, blink, eyes: true })
            }
  })

  test('his frames are the prototype art: the cel lists name poses, effects, frames and posts that exist', () => {
    for (const index of MOVE_INDEXES) {
      const m = playOf('kakashi', index) as CelMove
      for (const f of m.frames) {
        if (f.k) expect(() => poseOf(dressOf(KAKASHI), f.k!.pose)).not.toThrow()
        if (f.post) expect(POST[f.post]).toBeDefined()
        for (const e of f.fx ?? []) {
          const fam = FX[e.fx]
          expect({ fx: e.fx, known: fam !== undefined }).toEqual({ fx: e.fx, known: true })
          if (typeof e.f === 'number') expect({ fx: e.fx, f: e.f, ok: e.f >= 0 && e.f < fam!.frames.length }).toEqual({ fx: e.fx, f: e.f, ok: true })
          if (e.pal) expect(FX_PALETTES[e.pal]).toBeDefined()
        }
      }
    }
  })
})

// ---------------------------------------------------------------- the art's data

describe('native art', () => {
  test('every companion pose has a drawing: its own, or the nearest drawn (the map)', () => {
    for (const pose of POSES) {
      const drawn = VEST.poses[pose] ? pose : VEST.map[pose]
      expect({ pose, drawn: VEST.poses[drawn] !== undefined }).toEqual({ pose, drawn: true })
    }
    // the map names every companion pose, and nothing else
    expect(Object.keys(VEST.map).sort()).toEqual([...POSES].sort())
    // the vest is drawn in every one of them now: the map names each pose's own
    // drawing (idle0 for idle, sign1-3 for the signs), no stand-ins left
    for (const pose of POSES) expect({ pose, own: VEST.map[pose] === pose || ['idle', 'signs', 'signs2', 'signs3'].includes(pose) }).toEqual({ pose, own: true })
    // and a ninja's own drawing for a pose wins: Kakashi's head-scratch is his cheer's
    expect(KAKASHI.poses?.scratch).toBe('cheer')
  })

  test("every pose of the vest stands on its feet at its root, in the template's letters, every one in Kakashi's colours", () => {
    for (const [name, p] of Object.entries(VEST.poses)) {
      const g = compile(p.rows)
      // the last row is the feet's, the root column between them
      expect({ name, feet: /[^.]/.test(p.rows[p.rows.length - 1]!) }).toEqual({ name, feet: true })
      expect({ name, root: VEST.root < g.w }).toEqual({ name, root: true })
      for (const row of p.rows) for (const ch of row) if (ch !== '.') expect({ name, ch, ok: VEST.letters.includes(ch.toLowerCase()) }).toEqual({ name, ch, ok: true })
      expect({ name, missing: missing(p.rows, KAKASHI.body) }).toEqual({ name, missing: [] })
      if (p.hand) expect({ name, hand: p.hand[0] >= 0 && p.hand[0] < g.w && p.hand[1] >= 0 && p.hand[1] < g.h }).toEqual({ name, hand: true })
      if (p.breath) expect({ name, breath: VEST.poses[p.breath] !== undefined }).toEqual({ name, breath: true })
    }
    for (const ch of VEST.letters) expect({ ch, mapped: ch in KAKASHI.body }).toEqual({ ch, mapped: true })
  })

  test('every effect frame, the post, the heads and the eyes use only their palettes\' letters', () => {
    for (const [name, fam] of Object.entries(FX)) {
      const palette = typeof fam.palette === 'string' ? FX_PALETTES[fam.palette]! : fam.palette
      expect({ name, palette: palette !== undefined }).toEqual({ name, palette: true })
      fam.frames.forEach((fr, i) => {
        const rows = 'rows' in fr ? fr.rows : fr
        expect({ name, i, missing: missing(rows, palette) }).toEqual({ name, i, missing: [] })
      })
    }
    for (const [name, rows] of Object.entries(POST)) expect({ name, missing: missing(rows, POST_PALETTE) }).toEqual({ name, missing: [] })
    for (const head of [KAKASHI.head, KAKASHI.dojutsu!.head!]) {
      expect(missing(head.rows, head.palette)).toEqual([])
      expect(head.rows.length).toBe(19)
      // the eyes and the neck on the head
      for (const [x, y] of [...head.eyes, head.neck]) expect(head.rows[y]?.[x] !== undefined && head.rows[y]![x] !== '.').toBe(true)
    }
    for (const e of [...Object.values(KAKASHI.eyes!.states), KAKASHI.dojutsu!.eyes!, ...Object.values(KAKASHI.dojutsu!.states ?? {})]) if (e) expect(missing(e.rows, KAKASHI.eyes!.palette)).toEqual([])
  })

  test('an eye state is a face and back, so a cel can ask for any of them with eyes hand-drawn or not', () => {
    for (const e of ['open', 'left', 'half', 'shut', 'focus', 'happy', 'sad', 'wide'] as EyeState[]) expect(eyesOfFace(faceOfEyes(e))).toBe(e)
  })
})

// ---------------------------------------------------------------- the beats

describe('cel moves as the companion sees them', () => {
  test("the beats come from the cels' tags: the blow lands, the name is shouted at the climax, a failure stops at the recovery", () => {
    const raikiri = movesOf('kakashi')[0]!
    expect(raikiri.beats.map(b => b.name)).toEqual(['signs', 'charge', 'dash', 'impact', 'back', 'recover'])
    const hit = hitsOf(raikiri)[0]!.at
    // the blow lands on the strike, the shout from the dash through it
    expect(poseAt(raikiri, hit).pose).toBe('strike')
    expect(climax(raikiri, frameTime(hit - 0.1))).toBe(true)
    expect(shoutAt(raikiri, frameTime(hit))).toBe('Raikiri')
    expect(shoutAt(raikiri, 0)).toBeNull()
    expect(shoutSpan(raikiri)[0]).toBe(frameTime(hit - 0.2))
    // where a jutsu cut short by a failure stops: home, after the hop
    const recover = -sinceOf(raikiri, 0, 'recover')
    expect(recover).toBeGreaterThan(hit)
    expect(poseAt(raikiri, recover).pose).toBe('idle')
    // the summons shouts as the palm hits the ground, Kamui as it wrings the post
    const [, ninken, kamui] = movesOf('kakashi')
    expect(poseAt(ninken!, shoutSpan(ninken!)[0]).pose).toBe('slam')
    expect(kamui!.beats.find(b => b.shout === true)?.name).toBe('pull')
    // the cheer is in his own cheer pose by the time the hello's test looks
    expect(poseAt(playOf('kakashi', CHEER_INDEX)!, 0.6)).toMatchObject({ pose: 'scratch', mood: 'happy' })
  })

  test('every frame of the signature jutsu and the quick strike shows something of its own, never the ninja just standing', () => {
    const rest = new Set<string>()
    for (const pose of ['idle', 'crossed'] as Pose[])
      for (const mood of MOODS)
        for (const bob of [0, 1])
          for (const gaze of [-0.8, -0.4, 0, 0.4])
            for (const blink of [0, 0.62, 1]) rest.add(Array.from(sprite(still('kakashi', pose, mood, { bob, face: { blink, gaze: [gaze, 0], mood, active: false } }), glow, 48, 24)).join())
    for (const index of [0, QUICK_INDEX]) {
      const m = playOf('kakashi', index)!
      for (let t = 0; t < totalOf(m); t += 0.1) expect({ index, t: frameTime(t), rest: rest.has(Array.from(sprite(moveState('kakashi', index, t), glow, 48, 24)).join()) }).toEqual({ index, t: frameTime(t), rest: false })
    }
  })
})

// ---------------------------------------------------------------- at rest

describe('a native ninja at rest', () => {
  test('breathes in its two breathing frames (the stance, the head-scratch), the head sinking a pixel with every breath; a drowsy nod drops it two', () => {
    for (const pose of ['idle', 'scratch'] as Pose[]) {
      const a = native(still('kakashi', pose, 'calm', { bob: 0 }))
      const b = native(still('kakashi', pose, 'calm', { bob: 1 }))
      expect({ pose, breathes: !same(a.px, b.px), sinks: b.head!.y - a.head!.y }).toEqual({ pose, breathes: true, sinks: 1 })
    }
    for (const pose of ['idle', 'think', 'signs', 'sleep'] as Pose[]) {
      const a = native(still('kakashi', pose, 'calm', { bob: 0 })).head!
      const b = native(still('kakashi', pose, 'calm', { bob: 1 })).head!
      expect({ pose, sinks: b.y - a.y }).toEqual({ pose, sinks: 1 })
    }
    // the nod (the companion's drowsy bob 2): the head two pixels down
    const a = native(still('kakashi', 'idle', 'calm', { bob: 0 })).head!
    const nod = native(still('kakashi', 'idle', 'calm', { bob: 2, face: { blink: 1, gaze: [0, 0.3], mood: 'calm', active: false } })).head!
    expect(nod.y - a.y).toBe(2)
  })

  test('the face follows the companion: every mood, the blink, a glance, and the Sharingan when it wakes', () => {
    const eyes = (st: ChibiState): string => {
      const f = native(st)
      const h = f.head!
      const out: number[] = []
      for (let y = h.y + 10; y < h.y + 15; y++) for (let x = h.x + 5; x < h.x + 16; x++) out.push(f.px[y * STAGE_W + x]!)
      return out.join()
    }
    const looks = new Set<string>()
    for (const mood of ['calm', 'focus', 'happy', 'worried', 'surprised', 'sleep'] as Mood[]) looks.add(eyes(still('kakashi', 'idle', mood)))
    looks.add(eyes(still('kakashi', 'idle', 'calm', { face: { blink: 0.62, gaze: [0, 0], mood: 'calm', active: false } })))
    looks.add(eyes(still('kakashi', 'idle', 'calm', { face: { blink: 0, gaze: [-0.8, 0], mood: 'calm', active: false } })))
    expect(looks.size).toBe(8)
    // the dojutsu: the headband up, the red eye
    const awake = native(still('kakashi', 'think', 'focus', { face: { blink: 0, gaze: [0, 0], mood: 'focus', active: true } }))
    expect(Array.from(awake.px).includes(0xe0222c)).toBe(true)
    expect(Array.from(native(still('kakashi', 'think', 'focus')).px).includes(0xe0222c)).toBe(false)
  })

  test("a flicker of chakra between jutsu burns in the outline, as the companion's working loop asks", () => {
    const calm = still('kakashi', 'signs', 'focus')
    for (const aura of [0.5, 0.75]) expect(same(native(calm).px, native({ ...calm, aura }).px)).toBe(false)
  })

  test('the badge sits by the head wherever the pose puts it', () => {
    const BUBBLE = 0xe8e6f0
    const bubbleTop = (pose: Pose): number => {
      const px = sprite(still('kakashi', pose, 'calm', { badge: 'think' }), glow, 48, 24)
      for (let i = 0; i < px.length; i++) if (px[i] === BUBBLE) return Math.floor(i / 48)
      return -1
    }
    const headTop = (pose: Pose): number => native(still('kakashi', pose)).head!.top
    expect(bubbleTop('idle')).toBeGreaterThanOrEqual(0)
    // the crouch's head is lower, and the bubble with it
    expect(headTop('slam') - headTop('idle')).toBeGreaterThan(0)
    expect(bubbleTop('slam') - bubbleTop('idle')).toBe(headTop('slam') - headTop('idle'))
  })

  test('in a jutsu the peek follows the head, so a dash to the post never leaves an empty band', () => {
    for (const id of ['kakashi', 'naruto', 'lee', 'hinata', 'guy'])
      for (const index of [0, 1, 2, QUICK_INDEX]) {
        const m = playOf(id, index)!
        for (let t = 0; t < totalOf(m); t += 0.1) {
          const st = moveState(id, index, t)
          const h = frameOf(NATIVE[id]!, st, i => playOf(id, i)).head
          if (!h) continue
          // the peek's first column on the stage, as pixelCells picks it
          const words = pixelCells(st, byId(id).glow, 22, 8, undefined, 'peek')
          // the head's outline is on screen: some cell in the window's top rows is drawn
          let drawn = 0
          for (let o = 0; o < 22 * 4 * 3; o += 3) if (words[o] !== 0x20) drawn++
          expect({ id, index, t: frameTime(t), drawn: drawn >= 20 }).toEqual({ id, index, t: frameTime(t), drawn: true })
        }
      }
  })

  test('in a jutsu the peek leads the action: toward the blow and the effects where they land, the face kept, easing back without a jump', () => {
    // a test ninja whose one move: at home, a run to the post, an impact on it, home again
    const hit: FxUse = { fx: 'impact', f: 0, at: 'post' }
    const move = celMove(dressOf(KAKASHI), { name: 'Peek', shout: 'Peek' }, [
      { n: 4, tag: 'ready', k: { pose: 'idle0', x: HOME }, post: 'stand' },
      { n: 1, tag: 'dash', k: { pose: 'dash', x: 30 }, post: 'stand' },
      { n: 4, tag: 'impact', k: { pose: 'strike', x: STRIKE }, post: 'lean', fx: [hit] },
      { n: 6, tag: 'recover', k: { pose: 'strike', x: STRIKE }, post: 'stand' },
      { n: 4, tag: 'recover', k: { pose: 'idle0', x: HOME }, post: 'stand' },
    ])
    const n: NinjaSprite = { ...KAKASHI, id: 'test-peek', moves: [move, move, move] }
    NATIVE['test-peek'] = n
    try {
      // where the peek's window sits on the stage, `rows` tall: its first column (from the
      // head's) and its first row, found by matching its cells against the whole stage
      const windowAt = (f: number, rows = 12): [number, number] => {
        const st: ChibiState = { ...still('test-peek', 'idle'), move: { index: 0, t: f * 0.1 + 0.001 } }
        const hx = frameOf(n, st, () => move).head?.x ?? 0
        const words = pixelCells(st, glow, 22, rows, undefined, 'peek')
        const whole = sprite(st, glow, 48, 24)
        const px = (o: number, low: boolean): number => {
          const g = words[o]
          if (g === 0x20) return -1
          if (g === 0x2588) return words[o + 1]!
          if (g === 0x2584) return low ? words[o + 1]! : words[o + 2] === DEFAULT ? -1 : words[o + 2]!
          return low ? (words[o + 2] === DEFAULT ? -1 : words[o + 2]!) : words[o + 1]!
        }
        for (let y0 = 0; y0 <= 24 - rows * 2; y0++)
          for (let x0 = 0; x0 <= 26; x0++) {
            let ok = true
            for (let r = 0; r < rows && ok; r++)
              for (let c = 0; c < 22 && ok; c++) for (const low of [false, true]) ok &&= px((r * 22 + c) * 3, low) === whole[(y0 + r * 2 + (low ? 1 : 0)) * 48 + x0 + c]
            if (ok) return [x0 - hx, y0]
          }
        return [NaN, NaN]
      }
      const firstCol = (f: number): number => windowAt(f)[0]
      const rel = move.frames.map((_, f) => firstCol(f))
      // following, a column to spare left of the head; on the impact it leads toward the
      // post, as far as keeps the face (8 columns left of the head), never further
      expect(rel.slice(0, 3)).toEqual([-1, -1, -1])
      for (const f of [5, 6, 7, 8]) expect({ f, lead: rel[f]! }).toEqual({ f, lead: -8 })
      // a frame early, halfway (the dash, already following the head)
      expect(rel[4]!).toBeLessThan(-1)
      // easing back over two or three frames, each step smaller, then following the head again
      const back = rel.slice(8, 13)
      expect(back[0]).toBe(-8)
      for (let i = 1; i < back.length; i++) expect(back[i]!).toBeGreaterThanOrEqual(back[i - 1]!)
      expect(back[1]! - back[0]!).toBeGreaterThan(back[2]! - back[1]!)
      expect(rel[12]).toBe(-1)
      // in a band of eight rows it tilts down to the impact, the eyes (row 12) kept three rows from its top
      const [, restTop] = windowAt(1, 8)
      const [, hitTop] = windowAt(6, 8)
      expect(hitTop).toBeGreaterThan(restTop)
      expect(12 - hitTop).toBeGreaterThanOrEqual(3)
    } finally {
      delete NATIVE['test-peek']
    }
  })

  test("the peek shows the native head whole, the arena left out", () => {
    const st = still('kakashi', 'idle')
    const h = native(st).head!
    expect(h.left).toBeGreaterThanOrEqual(PEEK_LEFT)
    expect(h.x + 21).toBeLessThanOrEqual(PEEK_LEFT + 22)
    const words = pixelCells(st, glow, 22, 12, undefined, 'peek')
    expect(badCell(words)).toBe(-1)
    // its first column has the head's outline in it
    let first = false
    for (let r = 0; r < 12; r++) first ||= words[r * 22 * 3] !== 0x20
    expect(first).toBe(true)
  })
})

// ---------------------------------------------------------------- equal keys, and time

describe('native frames', () => {
  test('equal keys draw equal frames', () => {
    const c = new Companion(byId('kakashi'))
    const seen = new Map<string, ChibiState[]>()
    const keep = (): void => {
      const st = c.state()
      const list = seen.get(keyOf(st)) ?? []
      if (list.length < 2) list.push(st)
      seen.set(keyOf(st), list)
    }
    const go = (s: number): void => {
      for (let i = 0; i < s * 10; i++) {
        c.update(0.1)
        keep()
      }
    }
    go(5)
    c.setWorking(true)
    c.toolStart('1', 'Bash')
    // (a command's jutsu comes once it has run a few seconds)
    go(10)
    c.toolStart('2', 'Agent')
    c.toolStart('3', 'Edit')
    go(14)
    c.toolEnd('2', false)
    c.toolEnd('3', false)
    c.toolEnd('1', true)
    go(3)
    c.turnEnd(true)
    c.setWorking(false)
    go(5)
    let compared = 0
    for (const [key, [a, b]] of seen) {
      if (!a || !b) continue
      compared++
      expect({ key, same: Array.from(pixelCells(a, glow, 48, 12)).join() === Array.from(pixelCells(b, glow, 48, 12)).join() }).toEqual({ key, same: true })
    }
    expect(compared).toBeGreaterThan(20)
  })

  test('frame times (logged): a native frame is a few hundredths of a millisecond', () => {
    const states: ChibiState[] = []
    for (const index of MOVE_INDEXES) {
      const m = playOf('kakashi', index)!
      for (let t = 0; t < totalOf(m); t += 0.1) states.push(moveState('kakashi', index, t))
    }
    for (const pose of POSES) states.push(still('kakashi', pose))
    for (const st of states) native(st)
    const t0 = performance.now()
    for (let r = 0; r < 5; r++) for (const st of states) native(st)
    const compose = (performance.now() - t0) / (5 * states.length)
    const t1 = performance.now()
    for (let r = 0; r < 5; r++) for (const st of states) pixelCells(st, glow, 48, 12)
    const cells = (performance.now() - t1) / (5 * states.length)
    console.log(`native Kakashi over ${states.length} frames: compose ${(compose * 1000).toFixed(1)} µs, to cells ${(cells * 1000).toFixed(1)} µs a frame`)
    expect(cells).toBeLessThan(2)
  })
})

// ---------------------------------------------------------------- the engine, for the ninja to come

describe('engine features', () => {
  const W = STAGE_W
  const face = faceOfEyes('open')
  // a stage frame of a cel for a ninja, its pixels
  const draw = (n: NinjaSprite, cel: Partial<Cel>, o: { chakra?: number; active?: boolean } = {}) => compose(n, { n: 1, tag: 't', ...cel }, 0, { ...face, active: o.active === true }, { chakra: o.chakra })
  // the stage's pixels but the ground row (where shadows are)
  const body = (px: Int32Array): number[] => Array.from(px.subarray(0, (STAGE_H - 1) * W))

  test("Kakashi's frames are unchanged by every feature below: the same fingerprint, every move and rest pose", () => {
    const POSES2: Pose[] = ['idle', 'crossed', 'think', 'signs', 'signs2', 'signs3', 'charge', 'gather', 'strike', 'punch', 'kick', 'dash', 'slam', 'raise', 'alert', 'thumbs', 'scratch', 'spread', 'poke', 'sleep', 'slump', 'tuck']
    let h = 0x811c9dc5
    const add = (px: Int32Array): void => {
      for (let i = 0; i < px.length; i++) h = Math.imul(h ^ (px[i]! & 0xffffff), 16777619)
    }
    for (const index of [0, 1, 2, 3, -1, -2, -3, -4]) {
      const m = playOf('kakashi', index)!
      for (let i = 0; i < Math.round(totalOf(m) * 10); i++) {
        const t = frameTime(i / 10)
        const f = poseAt(m, t)
        add(sprite({ id: 'kakashi', face: { blink: 0, gaze: [f.gaze[0], f.gaze[1]], mood: f.mood, active: m.dojutsu !== false }, pose: f.pose, aura: 0, badge: null, tick: 0, bob: 0, move: { index, t } }, glow, 48, 24))
      }
    }
    for (const pose of POSES2) for (const mood of MOODS) for (const bob of [0, 1]) for (const active of [false, true]) add(sprite(still('kakashi', pose, mood, { bob, face: { blink: 0, gaze: [0, 0], mood, active } }), glow, 48, 24))
    // (round 10, deliberately: the post's hit flash a white rim, never a slab;
    // A Thousand Years of Death's beats made plain, clear of the post)
    expect((h >>> 0).toString(16)).toBe('45b99e88')
  })

  test('clones: full-size copies, behind the ninja or in front when ahead of them, facing right when flipped, one-tone traced afterimages, a puff', () => {
    const main = draw(KAKASHI, { k: { pose: 'idle0', x: 35 } }).px
    const ahead = draw(KAKASHI, { clones: [{ pose: 'idle0', x: 29 }] }).px
    const both = draw(KAKASHI, { k: { pose: 'idle0', x: 35 }, clones: [{ pose: 'idle0', x: 29 }] }).px
    // the clone ahead (toward the post) is drawn over the ninja where they overlap
    const overlap = body(ahead).flatMap((c, i) => (c !== -1 && main[i] !== -1 ? [i] : []))
    expect(overlap.length).toBeGreaterThan(20)
    for (const i of overlap) expect(both[i]).toBe(ahead[i])
    // one behind is covered by the ninja
    const back = draw(KAKASHI, { clones: [{ pose: 'idle0', x: 40 }] }).px
    const both2 = draw(KAKASHI, { k: { pose: 'idle0', x: 35 }, clones: [{ pose: 'idle0', x: 40 }] }).px
    const under = body(main).flatMap((c, i) => (c !== -1 && back[i] !== -1 ? [i] : []))
    expect(under.length).toBeGreaterThan(20)
    for (const i of under) expect(both2[i]).toBe(main[i])
    // `front` says otherwise
    const forced = draw(KAKASHI, { k: { pose: 'idle0', x: 35 }, clones: [{ pose: 'idle0', x: 40, front: true }] }).px
    expect(under.some(i => forced[i] !== main[i])).toBe(true)
    // flipped: the mirror image about its root column
    const plain = draw(KAKASHI, { clones: [{ pose: 'strike', x: 24 }] }).px
    const flipped = draw(KAKASHI, { clones: [{ pose: 'strike', x: 24, flip: true }] }).px
    for (let y = 0; y < STAGE_H - 1; y++)
      for (let x = 0; x < W; x++) {
        const X = 2 * 24 - x
        if (X >= 0 && X < W && plain[y * W + x] !== -1) expect(flipped[y * W + X]).toBe(plain[y * W + x])
      }
    // a ghost: one tone (its own, or the ninja's chakra) and a deeper tint of it, no shadow
    const ghost = draw(KAKASHI, { clones: [{ pose: 'dash', x: 30, ghost: 0xffd040 }] }).px
    const tones = (px: Int32Array) => new Set(Array.from(px).filter(c => c !== -1))
    expect(tones(ghost).size).toBe(2)
    expect(tones(ghost).has(0xffd040)).toBe(true)
    const chakra = draw(KAKASHI, { clones: [{ pose: 'dash', x: 30, ghost: 'chakra' }] }, { chakra: 0x62b8ff }).px
    expect(tones(chakra).size).toBe(2)
    expect(tones(chakra).has(0x62b8ff)).toBe(true)
    // traced, never a cut-out: its whole outline in the tone, and within it
    // little but a tint line and the figure's own lines, the stage showing
    // through (a 50% checker read as a screen-door block at real size)
    const solid = draw(KAKASHI, { clones: [{ pose: 'dash', x: 30, noShadow: true }] }).px
    const drawnAt = (px: Int32Array, i: number) => i >= 0 && i < px.length && px[i] !== -1
    let inside = 0
    let shown = 0
    for (let i = 0; i < solid.length; i++) {
      expect({ i, stray: drawnAt(ghost, i) && !drawnAt(solid, i) }).toEqual({ i, stray: false })
      if (!drawnAt(solid, i)) continue
      const x = i % W
      const edge = x === 0 || x === W - 1 || !drawnAt(solid, i - 1) || !drawnAt(solid, i + 1) || !drawnAt(solid, i - W) || !drawnAt(solid, i + W)
      if (edge) expect({ i, edge: ghost[i] }).toEqual({ i, edge: 0xffd040 })
      else {
        inside++
        if (drawnAt(ghost, i)) shown++
      }
    }
    expect(shown / inside).toBeGreaterThan(0.15)
    expect(shown / inside).toBeLessThan(0.45)
    // a puff of smoke over it
    const puff = draw(KAKASHI, { clones: [{ pose: 'idle0', x: 20, puff: 1 }] }).px
    expect(Array.from(puff).includes(0xffffff)).toBe(true)
    // with the same face: the clone's eyes are drawn
    const clone = draw(KAKASHI, { clones: [{ pose: 'idle0', x: 20, eyes: 'happy' }] }).px
    expect(Array.from(clone).some(c => EYE_COLOURS.has(c))).toBe(true)
  })

  test('a stage-sized effect at [0, 0] fills the stage behind or in front, and a tint washes or remaps all but the effects in front', () => {
    const fx = FX as Record<string, FxFamily>
    fx['testSky'] = { palette: pal('r:#801020 m:#ffffff'), anchor: [0, 0], frames: [Array.from({ length: 24 }, (_, y) => (y === 3 ? 'm'.repeat(48) : 'r'.repeat(48)))] }
    try {
      const sky = draw(KAKASHI, { k: { pose: 'idle0', x: 35 }, fx: [{ fx: 'testSky', f: 0, at: [0, 0], back: true }] }).px
      const alone = draw(KAKASHI, { k: { pose: 'idle0', x: 35 } }).px
      // behind: every pixel the ninja leaves clear is the sky; the ninja over it
      for (let i = 0; i < sky.length; i++) expect(sky[i]).toBe(alone[i] !== -1 && alone[i] !== 0x09090c ? alone[i] : i >= 3 * W && i < 4 * W ? 0xffffff : 0x801020)
      // in front: the whole stage
      const over = draw(KAKASHI, { k: { pose: 'idle0', x: 35 }, fx: [{ fx: 'testSky', f: 0, at: [0, 0] }] }).px
      expect(new Set(Array.from(over))).toEqual(new Set([0x801020, 0xffffff]))
      // a wash all the way to a colour: every drawn pixel that colour
      const washed = draw(KAKASHI, { k: { pose: 'idle0', x: 35 }, post: 'stand', tint: { colour: 0xc00000, amount: 1 } }).px
      expect(new Set(Array.from(washed).filter(c => c !== -1))).toEqual(new Set([0xc00000]))
      // remapped by brightness between two: dark pixels toward the one, light toward the other
      const ramp = draw(KAKASHI, { k: { pose: 'idle0', x: 35 }, tint: { dark: 0x000000, light: 0xff0000 } }).px
      for (const c of Array.from(ramp)) if (c !== -1) expect(c & 0x00ffff).toBe(0)
      // the effects in front are not tinted
      const front = draw(KAKASHI, { k: { pose: 'idle0', x: 35 }, tint: { colour: 0xc00000, amount: 1 }, fx: [{ fx: 'impact', f: 0, at: 'post' }] }).px
      expect(Array.from(front).includes(0xffffff)).toBe(true)
    } finally {
      delete fx['testSky']
    }
  })

  test('a shake moves the whole stage by whole pixels, dx or [dx, dy], the post and its shadow too (a camera); postStill keeps the post still', () => {
    const cel: Cel = { n: 1, tag: 'x', k: { pose: 'idle0', x: 35 }, post: 'stand', fx: [{ fx: 'dust', f: 0, at: [30, 23] }, { fx: 'impact', f: 0, at: 'post' }] }
    const still2 = draw(KAKASHI, cel)
    for (const shake of [2, [-1, 1]] as const) {
      const shook = draw(KAKASHI, { ...cel, shake })
      const [dx, dy] = typeof shake === 'number' ? [shake, 0] : shake
      // everything moved together: the ninja, the post, its shadow, the effects
      expect(shook.head!.x - still2.head!.x).toBe(dx)
      expect(shook.head!.y - still2.head!.y).toBe(dy)
      for (let y = 0; y < STAGE_H; y++)
        for (let x = 0; x < W; x++) {
          const X = x + dx
          const Y = y + dy
          if (X >= 0 && X < W && Y >= 0 && Y < STAGE_H) expect({ x, y, px: shook.px[Y * W + X] }).toEqual({ x, y, px: still2.px[y * W + x] })
        }
      // postStill: the post (its columns, above the ground) where it stood, the rest moved
      const held = draw(KAKASHI, { ...cel, fx: [], shake, postStill: true })
      const plain = draw(KAKASHI, { ...cel, fx: [] })
      for (let y = 13; y < 23; y++) for (let x = 7; x <= 13; x++) expect(held.px[y * W + x]).toBe(plain.px[y * W + x])
      for (let y = 0; y < 20; y++) for (let x = 24; x < 44; x++) expect(held.px[(y + dy) * W + x + dx]).toBe(plain.px[y * W + x])
    }
  })

  test("a ninja's own poses, rules and overlays are baked into their copy of the template; one who changes nothing draws from the template itself", () => {
    expect(dressOf({ ...KAKASHI, poses: undefined })).toBe(VEST)
    const n: NinjaSprite = {
      ...KAKASHI,
      id: 'test',
      poses: { cheer: { base: 'thumbs', eyes: 'happy' }, scratch: 'cheer', own: { rows: ['.o.', 'ooo'], as: 'idle' } },
      rules: [rows => rows.map(r => r.replace(/t/g, 'u'))],
      overlays: {
        idle0: [
          { rows: ['zz'], at: [0, 0] },
          { rows: ['cc'], at: [5, 4], under: true },
          { rows: ['_'], at: [7, 4] },
        ],
        idle1: [{ rows: ['zz'], at: [0, -2] }],
        crossed: [{ rows: ['yy'], on: 'head', at: [0, 0] }],
      },
    }
    const t = dressOf(n)
    expect(t).not.toBe(VEST)
    const idle0 = t.poses['idle0']!
    expect(idle0.rows[0]!.slice(0, 2)).toBe('zz')
    // `under` paints only where clear; '_' clears
    expect(VEST.poses['idle0']!.rows[4]!.slice(5, 8)).toBe('.oo')
    expect(idle0.rows[4]!.slice(5, 8)).toBe('co.')
    // the rule ran: no sandal shadow left anywhere
    expect(t.poses['strike']!.rows.join('').includes('t')).toBe(false)
    // an overlay above the grid grows it upward, the feet still on its last row
    expect(t.poses['idle1']!.rows.length).toBe(VEST.poses['idle1']!.rows.length + 2)
    expect(t.poses['idle1']!.rows[0]).toBe('zz' + '.'.repeat(24))
    // on the head: from the head's top-left, standing (column 13 - 10, row 12 - 6 - 17 = -11, so the grid grows)
    expect(t.poses['crossed']!.rows[0]!.slice(3, 5)).toBe('yy')
    // a pose re-pointed with its own eyes, a name for another drawing, a drawing of their own
    expect(t.poses['cheer']!.rows).toEqual(VEST.poses['thumbs']!.rows.map(r => r.replace(/t/g, 'u')))
    expect(t.poses['cheer']!.eyes).toBe('happy')
    expect(poseOf(t, 'scratch')).toBe(t.poses['scratch']!)
    expect(poseOf(t, 'own').rows).toEqual(['.o.', 'ooo'])
    // and it draws
    expect(draw(n, { k: { pose: 'idle0', x: 35 } }).px.length).toBe(W * STAGE_H)
  })

  test('props ride with the head, the grid, the feet or a named point; behind the body or with it; only over some letters; per pose, or hidden', () => {
    const REDDISH = 0xc02020
    const plainPx = draw(KAKASHI, { k: { pose: 'idle0', x: 35 } }).px
    const gourd: NinjaSprite = { ...KAKASHI, id: 'test', props: [{ rows: ['rrrrrr', 'rrrrrr'], palette: pal(`r:#c02020`), on: 'head', at: [-3, 15], behind: true }] }
    const behind = draw(gourd, { k: { pose: 'idle0', x: 35 } }).px
    // behind: never over the body or head, only where they leave clear
    for (let i = 0; i < behind.length; i++) if (behind[i] === REDDISH) expect(plainPx[i] === -1 || plainPx[i] === 0x09090c).toBe(true)
    expect(Array.from(behind).includes(REDDISH)).toBe(true)
    // with the body: lowercase under the head, UPPERCASE over it
    const cap: NinjaSprite = { ...KAKASHI, id: 'test', props: [{ rows: ['RRRR'], palette: pal(`r:#c02020`), on: 'head', at: [8, 2] }] }
    const capped = draw(cap, { k: { pose: 'idle0', x: 35 } })
    for (let x = 8; x < 12; x++) expect(capped.px[(capped.head!.y + 2) * W + capped.head!.x + x]).toBe(REDDISH)
    // a named point the pose (or the template) gives, and per-pose changes or none
    const points = { ...VEST, points: { back: [13, 6] as const } }
    const slung: NinjaSprite = { ...KAKASHI, id: 'test', template: points, props: [{ rows: ['RR'], palette: pal(`r:#c02020`), on: 'back', at: [0, 0], skip: ['sleep'], poses: { strike: null, crossed: { at: [-4, 0] } } }] }
    const at = (pose: string): number => Array.from(draw(slung, { k: { pose, x: 35 } }).px).indexOf(REDDISH)
    expect(at('idle0')).toBe((23 - 12 + 6) * W + 35)
    expect(at('crossed')).toBe((23 - 12 + 6) * W + 31)
    expect(at('strike')).toBe(-1)
    expect(at('sleep')).toBe(-1)
    // only over some of the body's letters: a strap across the vest, never over the sleeves
    const strap: NinjaSprite = { ...KAKASHI, id: 'test', props: [{ rows: ['rrrrrrrrrrrrrrrrrrrr'], palette: pal(`r:#c02020`), on: 'grid', at: [3, 7], onto: 'vw' }] }
    const strapped = draw(strap, { k: { pose: 'idle0', x: 35 } }).px
    const vest = new Set([KAKASHI.body['v'], KAKASHI.body['w']])
    for (let x = 0; x < W; x++) {
      const i = (23 - 12 + 7) * W + x
      expect(strapped[i] === REDDISH).toBe(vest.has(plainPx[i]!))
    }
  })

  test("a dojutsu changes any ninja's head and eyes while awake", () => {
    const OTHER: HeadGrid = { ...KAKASHI.head, rows: KAKASHI.head.rows.map((r, y) => (y === 5 ? r.replace(/b/g, 'c') : r)) }
    // both-eye grids (the group artists' kind), a dojutsu over both
    const sage: NinjaSprite = {
      ...KAKASHI,
      id: 'test',
      eyes: { palette: pal(`l:#202020 p:#101010 w:#ffffff y:#ffb428 n:#2a1606`), states: { open: { at: [0, 0], rows: ['wp...pw', 'ww...ww'] }, grin: { at: [0, 0], rows: ['ll...ll', 'll...ll'] } } },
      dojutsu: { head: OTHER, eyes: { at: [-5, 0], rows: ['yy...yy', 'yn...ny'] } },
      poseEyes: { thumbs: 'grin' },
    }
    const calm = draw(sage, { k: { pose: 'idle0', x: 35 } })
    const awake = draw(sage, { k: { pose: 'idle0', x: 35, awake: true } }, { active: true })
    const eyeRow = (d: typeof calm): number[] => Array.from(d.px.subarray((d.head!.y + 12) * W + d.head!.x + 7, (d.head!.y + 12) * W + d.head!.x + 14))
    expect(eyeRow(calm)).toContain(0xffffff)
    expect(eyeRow(awake)).toContain(0xffb428)
    expect(eyeRow(awake)).not.toContain(0xffffff)
    // its head swapped in
    expect(Array.from(awake.px.subarray((awake.head!.y + 5) * W, (awake.head!.y + 6) * W))).not.toEqual(Array.from(calm.px.subarray((calm.head!.y + 5) * W, (calm.head!.y + 6) * W)))
    // a state of its own, by a cel's eyes or the ninja's poseEyes
    const grin = compose(sage, { n: 1, tag: 't', k: { pose: 'idle0', x: 35 } }, 0, { ...faceOfEyes('open'), eyes: 'grin' })
    expect(eyeRow(grin)).toContain(0x202020)
    NATIVE['test'] = sage
    try {
      const cue = frameOf(sage, still('test', 'thumbs', 'happy'), () => undefined)
      expect(eyeRow(cue)).toContain(0x202020)
      // a face's state the set lacks falls back: wide to open
      const wide = frameOf(sage, still('test', 'idle', 'surprised'), () => undefined)
      expect(eyeRow(wide)).toContain(0xffffff)
    } finally {
      delete NATIVE['test']
    }
  })

  test('the registry: a ninja file registers itself, a line in index.ts lists it, and two sprites under one id are refused', () => {
    expect(NATIVE['kakashi']).toBe(KAKASHI)
    expect(register(KAKASHI)).toBe(KAKASHI)
    expect(() => register({ ...KAKASHI })).toThrow()
    const n: NinjaSprite = { ...KAKASHI, id: 'test-register' }
    try {
      register(n)
      expect(NATIVE['test-register']).toBe(n)
    } finally {
      delete NATIVE['test-register']
    }
  })
})

// ---------------------------------------------------------------- the engine, round two

describe('engine follow-ups', () => {
  const W = STAGE_W
  const face = faceOfEyes('open')
  const draw = (n: NinjaSprite, cel: Partial<Cel>) => compose(n, { n: 1, tag: 't', ...cel }, 0, face, {})
  const body = (px: Int32Array): number[] => Array.from(px.subarray(0, (STAGE_H - 1) * W))

  test("the shared arrival never cuts a head drawn to the stage's top row: the body pops up a pixel, the head stays", () => {
    for (const n of Object.values(NATIVE)) {
      const m = sharedOf(n).arrival
      m.frames.forEach((f, i) => {
        if (!f.k) return
        const h = native(moveState(n.id, ARRIVAL_INDEX, i / 10)).head!
        // (Kakashi keeps his first arrival, the head rising with him: only his hair's outline tips)
        expect({ id: n.id, i, top: h.top >= (n.id === 'kakashi' ? -1 : 0) }).toEqual({ id: n.id, i, top: true })
      })
    }
  })

  test("a clone's z orders it: over the clones further left, or behind the ninja whatever its place", () => {
    const left = draw(KAKASHI, { clones: [{ pose: 'idle0', x: 22 }] }).px
    const right = draw(KAKASHI, { clones: [{ pose: 'idle0', x: 28 }] }).px
    const overlap = body(left).flatMap((c, i) => (c !== -1 && right[i] !== -1 ? [i] : []))
    expect(overlap.length).toBeGreaterThan(20)
    // by default the one further left is over
    const plain = draw(KAKASHI, { clones: [{ pose: 'idle0', x: 22 }, { pose: 'idle0', x: 28 }] }).px
    for (const i of overlap) expect(plain[i]).toBe(left[i])
    // a higher z over a lower
    const raised = draw(KAKASHI, { clones: [{ pose: 'idle0', x: 22 }, { pose: 'idle0', x: 28, z: 2 }] }).px
    for (const i of overlap) expect(raised[i]).toBe(right[i])
    // below 0 behind the ninja, even ahead of them
    const main = draw(KAKASHI, { k: { pose: 'idle0', x: 35 } }).px
    const ahead = draw(KAKASHI, { clones: [{ pose: 'idle0', x: 30 }] }).px
    const tucked = draw(KAKASHI, { k: { pose: 'idle0', x: 35 }, clones: [{ pose: 'idle0', x: 30, z: -1 }] }).px
    const under = body(main).flatMap((c, i) => (c !== -1 && ahead[i] !== -1 ? [i] : []))
    for (const i of under) expect(tucked[i]).toBe(main[i])
  })

  test('a hand-drawn state of their own reports its mood to the companion, given the eyes', () => {
    const cels: Cel[] = [{ n: 2, tag: 'cheer', k: { pose: 'thumbs', x: 35, eyes: 'grin' } }]
    expect(celMove(VEST, { name: 'Cheer', shout: '' }, cels).beats[0]!.mood).toBe('calm')
    const m = celMove(VEST, { name: 'Cheer', shout: '' }, cels, { moods: { grin: 'happy' } })
    expect(m.beats[0]!.mood).toBe('happy')
    expect(poseAt(m, 0.1).mood).toBe('happy')
    // the faces' own states need none
    expect(celMove(VEST, { name: 'Cheer', shout: '' }, [{ n: 1, tag: 'x', k: { pose: 'idle0', x: 35, eyes: 'smug' } }]).beats[0]!.mood).toBe('smug')
  })

  test("a prop can ride in the hand, wherever each pose's hand is", () => {
    const sword: NinjaSprite = { ...KAKASHI, id: 'test', props: [{ rows: ['R'], palette: pal(`r:#c02020`), on: 'hand', at: [-1, 0] }] }
    for (const pose of ['strike', 'charge', 'dash']) {
      const d = draw(sword, { k: { pose, x: 30 } })
      const L = dressOf(sword).poses[pose]!
      const top = 23 - (L.rows.length - 1)
      expect({ pose, at: Array.from(d.px).indexOf(0xc02020) }).toEqual({ pose, at: (top + L.hand![1]) * W + 30 - 13 + L.hand![0] - 1 })
    }
    // a pose with no hand drawn: no prop
    expect(Array.from(draw(sword, { k: { pose: 'idle0', x: 30 } }).px).includes(0xc02020)).toBe(false)
  })

  test('a ninja may stand at their own home: at rest, in the shared moves, the peek and the badge all follow', () => {
    const n: NinjaSprite = { ...KAKASHI, id: 'test-home', home: 33, arrival: undefined }
    NATIVE['test-home'] = n
    try {
      const st = still('test-home', 'idle', 'calm', { badge: 'think' })
      const at33 = native(st)
      const at35 = native({ ...st, id: 'kakashi' })
      expect(at33.head!.x).toBe(at35.head!.x - 2)
      expect(peekLeftOf(n)).toBe(23)
      expect(peekLeftOf(KAKASHI)).toBe(PEEK_LEFT)
      for (const m of [sharedOf(n).arrival, sharedOf(n).dispel]) for (const f of m.frames) if (f.k) expect(f.k.x).toBe(33)
      // (the fizzle's recoil throws them back a column from it)
      expect(sharedOf(n).fizzle.frames.map(f => f.k!.x)).toEqual([33, 33, 34, 34, 33, 33, 33, 33, 33])
      // the badge's bubble beside the head, two columns further left
      const bubble = (px: Int32Array): number => Array.from(px).findIndex(c => c === 0xe8e6f0) % W
      expect(bubble(sprite(st, glow, 48, 24))).toBe(bubble(sprite({ ...st, id: 'kakashi' }, glow, 48, 24)) - 2)
      // the peek from column 23: the head whole, the same picture as Kakashi's at home
      expect(Array.from(pixelCells({ ...st, badge: null }, glow, 22, 12, undefined, 'peek')).join()).toBe(Array.from(pixelCells({ ...st, badge: null, id: 'kakashi' }, glow, 22, 12, undefined, 'peek')).join())
    } finally {
      delete NATIVE['test-home']
    }
  })

  test('a cel can shout a string of its own through its beat', () => {
    const m = celMove(VEST, { name: 'Meteor', shout: 'Meteor' }, [
      { n: 5, tag: 'signs', k: { pose: 'sign1', x: 35 } },
      { n: 3, tag: 'second', k: { pose: 'raise', x: 35 }, shout: 'Second meteor' },
      { n: 2, tag: 'impact', k: { pose: 'strike', x: 35 }, shout: true },
    ])
    expect(m.beats.map(b => b.shout)).toEqual([undefined, 'Second meteor', true])
    expect(shoutAt(m, 0.6)).toBe('Second meteor')
  })

  test("the post can be cut through with a sword: the slash, the split, the top felled beside the stump", () => {
    for (const f of ['cut', 'split', 'felled'] as const) {
      const rows = POST[f]
      expect(rows.length).toBe(POST.stand.length)
      expect(/[^.]/.test(rows[rows.length - 1]!)).toBe(true)
      const d = draw(KAKASHI, { post: f })
      expect(Array.from(d.px).filter(c => c !== -1).length).toBeGreaterThan(30)
    }
    expect(Array.from(draw(KAKASHI, { post: 'cut' }).px).includes(0xffffff)).toBe(true)
  })

  test('a cel can pick one of the ninja\'s variant heads by name; an unknown name is an error', () => {
    const SEAL: HeadGrid = { ...KAKASHI.head, rows: KAKASHI.head.rows.map((r, y) => (y === 6 ? r.replace(/b/g, 'c') : r)) }
    const n: NinjaSprite = { ...KAKASHI, id: 'test', heads: { seal: SEAL } }
    const plain = draw(n, { k: { pose: 'idle0', x: 35 } })
    const sealed = draw(n, { k: { pose: 'idle0', x: 35, head: 'seal' } })
    expect(same(plain.px, sealed.px)).toBe(false)
    // the named head wins over the dojutsu's, and the eyes stay on it
    const both = draw(n, { k: { pose: 'idle0', x: 35, head: 'seal', awake: true } })
    expect(same(both.px, sealed.px)).toBe(true)
    expect(both.head!.eyes).toBe(sealed.head!.eyes)
    expect(() => draw(n, { k: { pose: 'idle0', x: 35, head: 'nope' } })).toThrow()
  })
})

// ---------------------------------------------------------------- motion (round six)

describe('motion', () => {
  const W = STAGE_W
  const run = (c: Companion, seconds: number): void => {
    for (let t = 0; t < seconds - 1e-9; t += 0.05) c.update(0.05)
  }
  const face = faceOfEyes('open')
  const draw = (n: NinjaSprite, cel: Partial<Cel>) => compose(n, { n: 1, tag: 't', ...cel }, 0, face, {})
  const lifted = (n: NinjaSprite, c: Cel) => compose(n, c, 0, face, {})

  test("a moving hold stirs on the pose's Wind drawing every two frames and breathes under it, else breathes every other two (its breath drawing, the head a pixel down); a long hold carries accents", () => {
    // a template with a Wind drawing for the first seal: the shoulders' outline parted
    const sign1 = VEST.poses['sign1']!
    const WINDY: Template = { ...VEST, poses: { ...VEST.poses, sign1Wind: { ...sign1, rows: sign1.rows.map((r, y) => (y === 4 ? r.replace('oooo', 'o..o') : r)) } } }
    const windy: NinjaSprite = { ...KAKASHI, id: 'test-wind', template: WINDY }
    const frames = (n: NinjaSprite, pose: string, len = 8) => hold(len, 't', K(pose)).map(c => lifted(n, c))
    // and one with no Wind drawn at all
    const CALM: Template = { ...VEST, poses: Object.fromEntries(Object.entries(VEST.poses).filter(([name]) => !name.endsWith('Wind'))) }
    const calm: NinjaSprite = { ...KAKASHI, id: 'test-calm', template: CALM }
    // with a Wind: the drawing flips every two frames, the head sinks on frames 2-5 of 8
    const w = frames(windy, 'sign1')
    expect(w.map((f, i) => same(f.px, w[i % 2 === 0 ? i : i - 1]!.px))).toEqual(Array(8).fill(true))
    expect(w.map(f => f.head!.y - w[0]!.head!.y)).toEqual([0, 0, 1, 1, 1, 1, 0, 0])
    expect([same(w[0]!.px, w[2]!.px), same(w[0]!.px, w[4]!.px), same(w[2]!.px, w[6]!.px), same(w[0]!.px, w[6]!.px)]).toEqual([false, false, false, false])
    expect(same(w[2]!.px, draw(windy, { k: K('sign1Wind', { hdy: 1 }) }).px)).toBe(true)
    expect(same(w[6]!.px, draw(windy, { k: K('sign1Wind') }).px)).toBe(true)
    // a hold of four frames breathes too
    expect(frames(windy, 'sign1', 4).map(f => f.head!.y - w[0]!.head!.y)).toEqual([0, 0, 1, 1])
    // the Wind takes the pose's overlays (it wears what the pose wears)
    const dressed = dressOf({ ...windy, overlays: { sign1: [{ rows: ['zz'], at: [0, 0] }] } })
    expect(dressed.poses['sign1Wind']!.rows[0]!.slice(0, 2)).toBe('zz')
    // no Wind drawn: two frames the pose, two breathing, the head a pixel down
    const b = frames(calm, 'sign1')
    expect(b.map(f => f.head!.y - b[0]!.head!.y)).toEqual([0, 0, 1, 1, 0, 0, 1, 1])
    // a pose with a breath drawing breathes in it, as at rest (one drop: the sink, never the drawing's too)
    const idle = frames(calm, 'idle0')
    expect(same(idle[2]!.px, draw(calm, { k: K('idle1', { hdy: 1 }) }).px)).toBe(true)
    expect(idle[2]!.head!.y - idle[0]!.head!.y).toBe(1)
    // the beats report the pose held throughout, and the phase starts it in
    expect(celMove(VEST, { name: 'Hold', shout: '' }, hold(6, 'charge', K('sign1'))).beats.map(x => (x.steps ?? []).every(st => st.pose === 'signs'))).toEqual([true])
    expect(hold(3, 't', K('sign1'), { phase: 2 }).map(c => c.k!.held)).toEqual([2, 3, 4])
    expect(hold(2, 't', K('sign1'), i => ({ post: i === 0 ? 'stand' : null })).map(c => c.post)).toEqual(['stand', null])
    // accents: a hold of 10 or more dips the head a pixel more on frames 3, 11, 19 (two below rest
    // on the breath, with a Wind or without), the second of each pair half shutting the lids
    // unless the cel sets its eyes
    const long = hold(24, 't', K('sign1'))
    expect(long.map((c, i) => (c.k!.hdy ? i : -1)).filter(i => i >= 0)).toEqual([3, 11, 19])
    expect(long.map((c, i) => (c.k!.eyes ? `${i}${c.k!.eyes}` : '')).filter(Boolean)).toEqual(['11half'])
    const lb = long.map(c => lifted(calm, c).head!.y - lifted(calm, long[0]!).head!.y)
    expect(lb.slice(0, 8)).toEqual([0, 0, 1, 2, 0, 0, 1, 1])
    const lw = long.map(c => lifted(windy, c).head!.y - lifted(windy, long[0]!).head!.y)
    expect(lw.slice(0, 8)).toEqual([0, 0, 1, 2, 1, 1, 0, 0])
    expect(hold(24, 't', K('sign1', { eyes: 'focus' })).every(c => c.k!.eyes === 'focus')).toBe(true)
    expect(hold(9, 't', K('sign1')).some(c => c.k!.hdy)).toBe(false)
    expect(hold(24, 't', K('sign1'), { accent: false }).some(c => c.k!.hdy || c.k!.eyes)).toBe(false)
    expect(hold(24, 't', K('sign1'), () => ({}), { accent: false }).some(c => c.k!.hdy)).toBe(false)
    expect(hold(24, 't', K('sign1'), { accent: false, post: 'stand' }).every(c => !('accent' in c) && c.post === 'stand')).toBe(true)
  })

  test('every native ninja leaps clear of standing height, the hair cut by the stage 3 px at most, only in the air, and lands in a two-frame squash', () => {
    for (const n of Object.values(NATIVE)) {
      const rest = draw(n, { k: K('idle0', { x: n.home ?? HOME }) }).head!.top
      for (const [what, cels] of [['hop', hopHome('back', STRIKE, 'stand')], ['leap', leap('hop', { x: n.home ?? HOME, eyes: 'happy' })]] as const) {
        const tops = cels.map(c => ({ air: (c.k!.lift ?? 0) > 0, top: lifted(n, c).head!.top }))
        expect({ id: n.id, what, above: Math.min(...tops.map(t => t.top)) < rest }).toEqual({ id: n.id, what, above: true })
        for (const t of tops) expect({ id: n.id, what, ok: t.top >= (t.air ? -LEAP_CLIP : 0) }).toEqual({ id: n.id, what, ok: true })
        const last = cels.slice(-2).map(c => [c.k!.pose, c.k!.lift ?? 0])
        expect({ id: n.id, what, last }).toEqual({ id: n.id, what, last: [['crouch', 0], ['crouch', 0]] })
      }
    }
    // the hop's lifts (3, 6, 6, 3), the jump at its apex, home at the end; the leap hangs at 5
    const hop = hopHome('back', STRIKE, 'scarred', { awake: true })
    expect(hop.map(c => c.k!.lift ?? 0)).toEqual([0, 3, 6, 6, 3, 0, 0])
    expect(hop.map(c => c.k!.pose)).toEqual(['crouch', 'tuck', 'jump', 'jump', 'tuck', 'crouch', 'crouch'])
    expect(hop.every(c => c.post === 'scarred' && c.k!.awake === true)).toBe(true)
    expect([hop[0]!.k!.x, hop[hop.length - 1]!.k!.x]).toEqual([STRIKE, HOME])
    expect(leap('hop').map(c => c.k!.lift ?? 0)).toEqual([0, 3, 5, 5, 3, 0, 0])
    // the clip cuts the lift short rather than the hair: a figure on the ground is never moved
    const high = draw(KAKASHI, { k: K('jump', { lift: 9, clip: 3 }) }).head!
    expect(high.top).toBe(-3)
    expect(draw(KAKASHI, { k: K('jump', { clip: 0 }) }).head!.top).toBe(draw(KAKASHI, { k: K('jump') }).head!.top)
  })

  test('a hop or a leap takes its own air poses in order (a backflip, a cannonball, a spin), stretched over its frames, and its own arc', () => {
    const air = (cels: Cel[]) => cels.filter(c => (c.k!.lift ?? 0) > 0).map(c => c.k!.pose)
    // the default: tuck, jump, jump, tuck
    expect(air(hopHome('back', STRIKE, 'stand'))).toEqual(['tuck', 'jump', 'jump', 'tuck'])
    expect(air(hopHome('back', STRIKE, 'stand', {}, 2, 'tuck'))).toEqual(['tuck', 'tuck', 'tuck', 'tuck'])
    // a list, stretched over the four frames in the air
    expect(air(hopHome('back', STRIKE, 'stand', {}, 2, ['tuck', 'flip', 'tuck']))).toEqual(['tuck', 'flip', 'flip', 'tuck'])
    expect(air(hopHome('back', STRIKE, 'stand', {}, 2, ['tuck']))).toEqual(['tuck', 'tuck', 'tuck', 'tuck'])
    expect(air(hopHome('back', STRIKE, 'stand', {}, 2, ['a', 'b', 'c', 'd']))).toEqual(['a', 'b', 'c', 'd'])
    // its own arc: a frame a lift, the crouch before and the squash after kept
    const float = hopHome('back', STRIKE, 'stand', {}, 2, { air: ['tuck', 'jump'], lifts: [2, 4, 5, 5, 3] })
    expect(float.map(c => c.k!.lift ?? 0)).toEqual([0, 2, 4, 5, 5, 3, 0, 0])
    expect(air(float)).toEqual(['tuck', 'tuck', 'jump', 'jump', 'jump'])
    expect(float[float.length - 1]!.k!.x).toBe(HOME)
    // the leap too
    expect(air(leap('hop', { x: HOME }, { air: ['jump', 'spread', 'jump'] }))).toEqual(['jump', 'spread', 'spread', 'jump'])
    expect(air(leap('hop', { x: HOME }))).toEqual(['jump', 'jump', 'jump', 'jump'])
  })

  test('a cast moves the caster\'s weight: sunk and drawn back, a step in past its mark, the recoil, home; each beat dressed its own way', () => {
    const root = (cels: Cel[]) => cels.map(c => [c.tag, c.k!.pose, c.k!.x - HOME, c.k!.dy ?? 0])
    expect(root(cast())).toEqual([
      ['charge', 'gather', 1, 1], ['charge', 'gather', 1, 1], ['charge', 'gather', 1, 1],
      ['release', 'strike', -2, 0], ['release', 'strike', -1, 0], ['release', 'strike', -1, 0],
      ['impact', 'strike', 1, 0], ['impact', 'strike', 1, 0],
      ['settle', 'strike', 0, 0], ['settle', 'strike', 0, 0],
    ])
    expect(cast().every(c => c.n === 1 && c.post === 'stand')).toBe(true)
    // the settle's head lags a pixel on its first frame
    expect(cast().slice(-2).map(c => c.k!.hdy ?? 0)).toEqual([1, 0])
    // never a shudder: each body position held two frames or more, but the overshoot
    const runs = cast().map(c => `${c.k!.x},${c.k!.dy ?? 0}`).join(' ').replace(/(\S+)( \1)*/g, m => String(m.split(' ').length)).split(' ').map(Number)
    expect(runs).toEqual([3, 1, 2, 2, 2])
    // dressed per beat: poses (a pose a frame, the last held), looks, options, effects, holds, nudges; a beat left out
    const fx1 = { fx: 'impact', f: 0, at: 'post' } as const
    const own = cast({
      at: STRIKE,
      k: { awake: true, eyes: 'focus' },
      post: 'lean',
      gather: false,
      release: { n: 2, pose: ['windup', 'strike'], o: { shout: true }, k: i => (i === 1 ? { eyes: 'wide' } : {}) },
      impact: { n: 3, tag: 'finish', o: i => ({ post: 'scorch', ...(i === 0 ? { shake: [1, 0] as const } : {}) }), fx: [fx1], hold: true },
      settle: { n: 1, pose: 'crouch', d: () => [0, 1] },
    })
    expect(own.map(c => [c.tag, c.k!.pose, c.k!.x - STRIKE, c.k!.dy ?? 0, c.k!.eyes, c.k!.awake, c.post])).toEqual([
      ['release', 'windup', -2, 0, 'focus', true, 'lean'],
      ['release', 'strike', -1, 0, 'wide', true, 'lean'],
      ['finish', 'strike', 1, 0, 'focus', true, 'scorch'],
      ['finish', 'strike', 1, 0, 'focus', true, 'scorch'],
      ['finish', 'strike', 1, 0, 'focus', true, 'scorch'],
      ['settle', 'crouch', 0, 1, 'focus', true, 'lean'],
    ])
    expect(own[0]!.shout).toBe(true)
    expect(own.slice(2, 5).map(c => [c.k!.held, c.shake ?? null, c.fx])).toEqual([[0, [1, 0], [fx1]], [1, null, [fx1]], [2, null, [fx1]]])
    expect(CAST_ROOT.release(0)).toEqual([-2, 0])
  })

  test('a cast has a weight of its own: light, heavy or stoic; and its recoil on the impact, on the release (a ranged jutsu) or nowhere', () => {
    const root = (cels: Cel[]) => cels.map(c => `${c.tag[0]}${c.k!.x - HOME}${c.k!.dy ? `v${c.k!.dy}` : ''}${c.k!.lift ? `^${c.k!.lift}` : ''}${c.k!.hdx ? `h${c.k!.hdx}` : ''}${c.k!.hdy ? `n${c.k!.hdy}` : ''}`).join(' ')
    // the default is as ever
    expect(root(cast({ recoil: 'impact' }))).toBe(root(cast()))
    // light: a quick gather (the dip on the spring), 2 px past the mark, a hop home
    expect(root(cast({ weight: 'light' }))).toBe('c1 c1v1 r-3 r-1 r-1 i1 i1 s0^2 s0n1 s0')
    expect(cast({ weight: 'light' })[7]!.k!.clip).toBe(LEAP_CLIP)
    // heavy: sunk deep four frames, the lean held, thrown back sliding in dust, stepping home
    expect(root(cast({ weight: 'heavy' }))).toBe('c1v1 c2v1 c2v1n1 c2v1n1 r-2 r-2h-1 r-2h-1 i2 i3 i3 s2n1 s1 s0')
    expect(cast({ weight: 'heavy' }).map(c => (c.fx ?? []).filter(e => e.fx === 'dust').length)).toEqual([0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0])
    // stoic: no sink, a tiny step, a nod for the recoil
    expect(root(cast({ weight: 'stoic' }))).toBe('c0 c1 c1 r-1 r-1 r-1 i-1n1 i-1 s0 s0')
    // the recoil on the release (the kick of the shot), planted through the impact; or none
    expect(root(cast({ recoil: 'release' }))).toBe('c1v1 c1v1 c1v1 r-2 r1 r1 i1 i1 s0n1 s0')
    expect(root(cast({ weight: 'heavy', recoil: 'release' }))).toBe('c1v1 c2v1 c2v1n1 c2v1n1 r-2 r2 r3 i3 i3 i3 s2n1 s1 s0')
    expect(root(cast({ recoil: false }))).toBe('c1v1 c1v1 c1v1 r-2 r-1 r-1 i-1 i-1 s0n1 s0')
    // a beat's own length, look and nudge still win over the weight's
    const own = cast({ weight: 'heavy', gather: { n: 2, k: { eyes: 'focus' } }, settle: { n: 1, d: () => [0, 1] } })
    expect(own.filter(c => c.tag === 'charge').map(c => c.k!.eyes)).toEqual(['focus', 'focus'])
    expect(own[own.length - 1]!.k!.dy).toBe(1)
  })

  test('a hop home has a style of its own: a skip, a heavy landing, or the Body Flicker (no hop, as long as the hop)', () => {
    const lifts = (cels: Cel[]) => cels.map(c => c.k?.lift ?? 0)
    expect(lifts(hopHome('back', STRIKE, 'stand'))).toEqual([0, 3, 6, 6, 3, 0, 0])
    // skip: light and low, one frame's squash
    expect(lifts(hopHome('back', STRIKE, 'stand', {}, 2, 'jump', { style: 'skip' }))).toEqual([0, 2, 3, 2, 0])
    // heavy: higher, landing a pixel deeper with a jolt of the stage, grit both sides
    const heavy = hopHome('back', STRIKE, 'stand', {}, 2, 'jump', { style: 'heavy' })
    expect(lifts(heavy)).toEqual([0, 3, 6, 7, 4, 0, 0])
    expect(heavy.slice(5).map(c => [c.k!.dy ?? 0, c.shake ?? null, (c.fx ?? []).filter(e => e.fx === 'dust').length])).toEqual([[1, [0, 1], 3], [0, null, 3]])
    expect(heavy[heavy.length - 1]!.k!.x).toBe(HOME)
    // the Body Flicker: crouched, gone in a puff, back in one at home; the hop's length
    const flick = hopHome('back', STRIKE, 'lean', { awake: true }, 2, 'jump', { style: 'flicker' })
    expect(flick.length).toBe(hopHome('back', STRIKE, 'lean').length)
    expect(flick.map(c => c.k?.x ?? null)).toEqual([STRIKE, null, null, HOME, HOME, HOME, HOME])
    expect(flick.every(c => (c.k?.lift ?? 0) === 0 && c.post === 'lean')).toBe(true)
    expect(flick.slice(0, 6).every(c => (c.fx ?? []).some(e => e.fx === 'smoke'))).toBe(true)
    expect(flick[0]!.k!.awake).toBe(true)
  })

  test('the run-in rocks back for three frames, covers the ground in one smear (two heavy steps), and lands the blow held two frames', () => {
    const at = (cels: Cel[]) => cels.flatMap(c => Array(c.n).fill([c.k!.pose, c.k!.x]))
    expect(at(runIn('dash', { strike: {} }))).toEqual([['windup', 36], ['windup', 36], ['windup', 36], ['smear', 30], ['strike', STRIKE], ['strike', STRIKE]])
    expect(at(runIn('dash', { style: 'heavy', strike: {} }))).toEqual([['windup', 36], ['windup', 36], ['windup', 36], ['dash', 32], ['dash', 29], ['strike', STRIKE], ['strike', STRIKE]])
    // the blow's beat is an impact; the wind-up may be a beat of its own
    const run = runIn('dash', { ready: 'charge', strike: { post: 'lean' } })
    expect(run.map(c => c.tag)).toEqual(['charge', 'charge', 'charge', 'dash', 'impact'])
    expect(run[run.length - 1]!.post).toBe('lean')
    // the styles: afterimages behind the glide, one left at home by the ghost, the post jumping at heavy steps
    expect(runIn('dash', { style: 'glide' })[3]!.clones!.length).toBe(2)
    expect(runIn('dash', { style: 'ghost', strike: {} }).slice(3).map(c => c.clones?.[0]?.x)).toEqual([36, 36])
    expect(runIn('dash', { style: 'heavy' }).slice(3).map(c => c.pdy)).toEqual([-1, -1])
    // a distance of its own
    expect(at(runIn('dash', { from: 40, to: 20 })).map(([, x]) => x)).toEqual([41, 41, 41, 29])
  })

  test("the post's poof is two frames in and two out: the move opens on its first pose, its length kept, the last frame two small wisps", () => {
    const into = postIn('signs', [K('idle0'), K('sign1', { hdy: 1 }), K('sign1'), K('sign1'), K('sign1')])
    expect(into.map(c => [c.k!.pose, c.k!.hdy ?? 0])).toEqual([['sign1', 1], ['sign1', 0], ['sign1', 0], ['sign1', 0], ['sign1', 0]])
    expect(into.map(c => c.post ?? null)).toEqual([null, 'stand', 'stand', 'stand', 'stand'])
    expect(into.map(c => (c.fx ?? []).filter(e => e.fx === 'smoke').length)).toEqual([1, 1, 0, 0, 0])
    // a move that opens on something of its own keeps it
    expect(postIn('t', [K('idle0', { eyes: 'smug' }), K('sign1')]).map(c => c.k!.pose)).toEqual(['idle0', 'sign1'])
    const out = postOut('recover', [K('idle0', { eyes: 'happy' }), K('idle0'), K('idle0'), K('idle0'), K('idle0')], 'scarred')
    expect(out.map(c => c.post ?? null)).toEqual(['scarred', 'scarred', 'scarred', 'scarred', null])
    expect(out.map(c => (c.fx ?? []).filter(e => e.fx === 'smoke').length)).toEqual([0, 0, 0, 1, 1])
    // the wisps: a few pixels of smoke, nothing on the ground
    const wisps = draw(KAKASHI, { fx: out[4]!.fx })
    const lit = Array.from(wisps.px).flatMap((c, i) => (c !== -1 ? [i] : []))
    expect(lit.length).toBeGreaterThan(2)
    expect(lit.length).toBeLessThan(10)
    expect(lit.every(i => Math.floor(i / W) < GROUND - 6)).toBe(true)
    // every native ninja's signature opens on a pose of its own, never the plain stance
    for (const n of Object.values(NATIVE)) {
      const k = n.moves[0]!.frames[0]!.k
      expect({ id: n.id, plain: k !== undefined && k.pose === 'idle0' && Object.keys(k).length === 2 }).toEqual({ id: n.id, plain: false })
    }
  })

  test("a blow's flash: a white rim round the post, or round the ninja (as drawn, its edge lit, never a slab of white); the rest of the stage untouched", () => {
    const base = draw(KAKASHI, { k: K('idle0'), post: 'stand' }).px
    const post = draw(KAKASHI, { k: K('idle0'), post: 'stand', flash: 'post' }).px
    const ninja = draw(KAKASHI, { k: K('idle0') }).px
    const fig = draw(KAKASHI, { k: K('idle0', { noShadow: true }) }).px
    const postOnly = draw(KAKASHI, { post: 'stand' }).px
    // the post as drawn (its inside untouched, its edge lit), a white pixel round it
    // above the ground; the ninja drawn over it as ever, the floor shadows as they are
    const SHADOW = 0x09090c
    const at0 = (px: Int32Array, x: number, y: number) => (x < 0 || x >= STAGE_W || y < 0 || y >= STAGE_H ? -1 : px[y * STAGE_W + x]!)
    const wood = (x: number, y: number): boolean => { const c = at0(postOnly, x, y); return c !== -1 && c !== SHADOW }
    let lit = 0
    for (let i = 0; i < base.length; i++) {
      const x = i % STAGE_W
      const y = Math.floor(i / STAGE_W)
      if (ninja[i] !== -1) continue
      const around = [wood(x - 1, y), wood(x + 1, y), wood(x, y - 1), wood(x, y + 1)]
      if (wood(x, y)) {
        const edge = !wood(x - 1, y) || !wood(x + 1, y) || !wood(x, y - 1) || !wood(x, y + 1)
        if (!edge || y >= GROUND) expect({ i, px: post[i] }).toEqual({ i, px: base[i] })
        else if (post[i] !== base[i]) lit++
        expect({ i, white: post[i] === 0xffffff }).toEqual({ i, white: false })
      } else expect({ i, px: post[i] }).toEqual({ i, px: around.some(Boolean) && y < GROUND ? 0xffffff : base[i] })
    }
    expect(lit).toBeGreaterThan(5)
    // 'rim', and 'silhouette' drawn the same: a white pixel round the figure above the ground,
    // the body as drawn within, only its outermost pixels lit; nothing else touched
    const at = (px: Int32Array, x: number, y: number) => (x < 0 || x >= STAGE_W || y < 0 || y >= STAGE_H ? -1 : px[y * STAGE_W + x]!)
    for (const flash of ['rim', 'silhouette'] as const) {
      const lit = draw(KAKASHI, { k: K('idle0'), post: 'stand', flash }).px
      let changed = 0
      for (let i = 0; i < base.length; i++) {
        const x = i % STAGE_W
        const y = Math.floor(i / STAGE_W)
        const near = [at(fig, x - 1, y), at(fig, x + 1, y), at(fig, x, y - 1), at(fig, x, y + 1)].some(c => c !== -1)
        if (fig[i] !== -1) {
          const edge = [at(fig, x - 1, y), at(fig, x + 1, y), at(fig, x, y - 1), at(fig, x, y + 1)].some(c => c === -1)
          if (!edge || y === GROUND) expect({ flash, i, px: lit[i] }).toEqual({ flash, i, px: base[i] })
          else if (lit[i] !== base[i]) changed++
          expect({ flash, i, white: lit[i] === 0xffffff }).toEqual({ flash, i, white: base[i] === 0xffffff })
        } else expect({ flash, i, px: lit[i] }).toEqual({ flash, i, px: near && y < GROUND ? 0xffffff : base[i] })
      }
      expect(changed).toBeGreaterThan(20)
    }
  })

  test('the shared fizzle reads: the charge breaking apart in their chakra, a recoil, the puff, the slump with the sweat drop; the post smoked out as it slumps; about a second', () => {
    for (const n of Object.values(NATIVE)) {
      const m = sharedOf(n).fizzle
      expect({ id: n.id, t: totalOf(m) }).toEqual({ id: n.id, t: 0.9 })
      // two beats: the fizzle, then the slump a late failure starts from
      expect({ id: n.id, beats: m.beats.map(b => b.name), slump: -sinceOf(m, 0, 'slump') }).toEqual({ id: n.id, beats: ['fizzle', 'slump'], slump: 0.4 })
      // the charge breaks apart over two frames, then sparks, all in the chakra, where the hand held it
      const uses = (f: number, name: string) => (m.frames[f]!.fx ?? []).filter(e => e.fx === name)
      expect({ id: n.id, breaks: [0, 1].map(f => uses(f, 'breakup').map(e => [e.f, e.pal])) }).toEqual({ id: n.id, breaks: [[[0, 'chakra']], [[1, 'chakra']]] })
      expect({ id: n.id, sparks: [1, 2, 3].every(f => uses(f, 'sparks').every(e => e.pal === 'chakra') && uses(f, 'sparks').length === 1) }).toEqual({ id: n.id, sparks: true })
      const hand = dressOf(n).poses['charge'] ?? poseOf(dressOf(n), 'charge')
      expect({ id: n.id, at: uses(0, 'breakup')[0]!.at }).toEqual({ id: n.id, at: [(n.home ?? HOME) - dressOf(n).root + hand.hand![0], GROUND - (hand.rows.length - 1) + hand.hand![1]] })
      // the recoil: a start, eyes wide, the head up out of the strain
      const heads = m.frames.map(f => native(moveState(n.id, FIZZLE_INDEX, f.t / 10)).head!)
      expect({ id: n.id, recoil: m.frames[2]!.k!.pose, eyes: m.frames[2]!.k!.eyes, up: heads[2]!.y < heads[1]!.y }).toEqual({ id: n.id, recoil: 'alert', eyes: 'wide', up: true })
      // held two frames, thrown back a column, then straight into the slump (never the charge again)
      const home = n.home ?? HOME
      expect({ id: n.id, poses: m.frames.map(f => f.k!.pose), x: m.frames.map(f => f.k!.x - home) }).toEqual({ id: n.id, poses: ['charge', 'charge', 'alert', 'alert', 'slump', 'slump', 'slump', 'slump', 'slump'], x: [0, 0, 1, 1, 0, 0, 0, 0, 0] })
      expect({ id: n.id, top: Math.min(...heads.map(h => h.top)) >= 0 }).toEqual({ id: n.id, top: true })
      // the post stands through the start, and goes up in smoke as the slump begins
      expect({ id: n.id, post: m.frames.map(f => f.post ?? null) }).toEqual({ id: n.id, post: ['stand', 'stand', 'stand', 'stand', null, null, null, null, null] })
      expect({ id: n.id, smoke: uses(4, 'smoke').length }).toEqual({ id: n.id, smoke: 1 })
      // the slump, the sweat drop sliding down by the head to rest where the badge's sits
      expect({ id: n.id, slump: m.frames.slice(4).every(f => f.k!.pose === 'slump'), sweat: m.frames.slice(4).map(f => uses(f.t, 'sweat')[0]?.f) }).toEqual({ id: n.id, slump: true, sweat: [0, 1, 2, 2, 2] })
    }
    // the breaking charge in the ninja's own chakra: their glow turns its colours
    const n = NATIVE['naruto']!
    const m = sharedOf(n).fizzle
    const lit = (chakra: number) => compose(n, m.frames[0]!, 0, faceOfEyes('focus'), { chakra, move: true }).px
    const red = lit(0xff2020)
    const blue = lit(0x2060ff)
    const changed = Array.from(red).filter((c, i) => c !== blue[i])
    expect(changed.length).toBeGreaterThan(15)
    expect(changed.every(c => ((c >> 16) & 255) >= (c & 255))).toBe(true)
  })

  test('through a working turn the post stays up: no poof in or out, a damaged post renewed in one puff, one done away with brought back; at rest it stands; it leaves in one last poof', () => {
    const k = NATIVE['kakashi']!
    // a frame of a move as drawn with its cels changed, against the same frame with the turn's flags
    const drawn = (index: number, f: number, flags: Partial<ChibiState>, edit?: (c: Frame) => Frame) => {
      const m = playOf('kakashi', index) as CelMove
      const st = { ...moveState('kakashi', index, f / 10 + 0.001), ...flags }
      return frameOf(k, st, i => (i === index && edit ? { ...m, frames: m.frames.map(edit) } : playOf('kakashi', i))).px
    }
    const same2 = (a: Int32Array, b: Int32Array) => a.every((v, i) => v === b[i])
    const postSmoke = (e: FxUse) => e.fx === 'smoke' && e.at === 'post'
    const raikiri = playOf('kakashi', 0) as CelMove
    const n = raikiri.frames.length
    // its poof in (frames 0, 1): the post standing, no smoke
    expect(raikiri.frames.slice(0, 2).map(f => f.poof)).toEqual(['in', 'in'])
    for (const f of [0, 1]) expect(same2(drawn(0, f, { postUp: true }), drawn(0, f, {}, c => (c.t === f ? { ...c, post: 'stand', fx: (c.fx ?? []).filter(e => !postSmoke(e)) } : c)))).toBe(true)
    // its poof out over a scarred post: the cloud as drawn, then the post standing again in the
    // cloud's last puffs, and standing after
    const out = raikiri.frames.findIndex(f => f.poof === 'out')
    expect([raikiri.frames[out]!.post, raikiri.frames[out + 1]!.poof, raikiri.frames[out + 1]!.post ?? null]).toEqual(['scarred', 'out', null])
    expect(same2(drawn(0, out, { postStays: true }), drawn(0, out, {}))).toBe(true)
    expect(same2(drawn(0, out + 1, { postStays: true }), drawn(0, out + 1, {}, c => (c.t === out + 1 ? { ...c, post: 'stand', fx: [...(c.fx ?? []).filter(e => !postSmoke(e)), { fx: 'smoke', f: 3, at: 'post', d: [0, 6] }] } : c)))).toBe(true)
    for (let f = out + 2; f < n; f++) expect(same2(drawn(0, f, { postStays: true }), drawn(0, f, {}, c => (c.t === f ? { ...c, post: 'stand' } : c)))).toBe(true)
    // without the turn's flags, every frame as drawn
    for (let f = 0; f < n; f++) expect(same2(drawn(0, f, {}), drawn(0, f, {}, c => c))).toBe(true)
    // Kamui wrings the post away and never poofs it out: as drawn, and a new post poofs in over its last two frames
    const kamui = playOf('kakashi', 2) as CelMove
    const kn = kamui.frames.length
    expect(kamui.frames.some(f => f.poof === 'out')).toBe(false)
    expect(same2(drawn(2, kn - 3, { postStays: true }), drawn(2, kn - 3, {}))).toBe(true)
    expect(same2(drawn(2, kn - 2, { postStays: true }), drawn(2, kn - 2, {}, c => (c.t === kn - 2 ? { ...c, post: null, fx: [...(c.fx ?? []), { fx: 'smoke', f: 1, at: 'post', d: [0, 6] }] } : c)))).toBe(true)
    expect(same2(drawn(2, kn - 1, { postStays: true }), drawn(2, kn - 1, {}, c => (c.t === kn - 1 ? { ...c, post: 'stand', fx: [...(c.fx ?? []), { fx: 'smoke', f: 3, at: 'post', d: [0, 6] }] } : c)))).toBe(true)
    // a poof in that brings the post in scarred plays its puff (it was standing plain before)
    const scarredIn: CelMove = { ...raikiri, frames: raikiri.frames.map(f => (f.t === 1 ? { ...f, post: 'scarred' } : f)) }
    const st0 = { ...moveState('kakashi', 0, 0.001), postUp: true }
    expect(same2(frameOf(k, st0, () => scarredIn).px, frameOf(k, moveState('kakashi', 0, 0.001), () => scarredIn).px)).toBe(true)
    // at rest the post stands; leaving, the cloud over it, then the wisps
    const rest = (o: Partial<ChibiState>) => native(still('kakashi', 'idle', 'calm', o)).px
    const postAt = POST_X + 1 + (GROUND - 3) * W
    expect([rest({})[postAt], rest({ postUp: true })[postAt]].map(c => c !== -1)).toEqual([false, true])
    expect(same2(rest({ postOut: 0 }), rest({ postUp: true }))).toBe(false)
    expect(same2(rest({ postOut: 1 }), rest({}))).toBe(false)
    expect(rest({ postOut: 1 })[postAt]).toBe(-1)
  })

  test('woken, Naruto keeps his nightcap on through the start, then it lifts off in a puff; one who sleeps in nothing wakes as ever', () => {
    const cap = 0xb4e0f8
    const wake = (id: string, step: number | undefined, pose: Pose) => native(still(id, pose, 'surprised', step === undefined ? {} : { wake: step })).px
    const has = (px: Int32Array) => px.includes(cap)
    expect([has(wake('naruto', undefined, 'sleep')), has(wake('naruto', undefined, 'alert'))]).toEqual([true, false])
    expect([0, 1, 2, 3].map(s => has(wake('naruto', s, s < 3 ? 'alert' : 'idle')))).toEqual([true, true, false, false])
    // jolted a pixel up on the start, flung up and over the arena as it goes
    const top = (px: Int32Array) => Math.floor(px.indexOf(cap) / W)
    const left = (px: Int32Array) => Math.min(...Array.from(px.keys()).filter(i => px[i] === cap).map(i => i % W))
    const asleep = native(still('naruto', 'sleep', 'sleep')).px
    expect(top(wake('naruto', 1, 'alert'))).toBeLessThanOrEqual(top(wake('naruto', 0, 'alert')))
    expect(left(wake('naruto', 1, 'alert'))).toBeLessThan(left(wake('naruto', 0, 'alert')))
    expect(has(asleep)).toBe(true)
    // the puff where it was
    expect(same2px(wake('naruto', 2, 'alert'), wake('naruto', undefined, 'alert'))).toBe(false)
    // Kakashi sleeps in nothing: the wake changes nothing
    for (const s of [0, 1, 2, 3]) expect(same2px(wake('kakashi', s, 'alert'), wake('kakashi', undefined, 'alert'))).toBe(true)
  })

  test('nodding off is the wake run backwards: a yawn (the head dipped two), a sit, the sleep pose with a puff bringing the nightcap on, its wisps', () => {
    const cap = 0xb4e0f8
    const doze = (id: string, step: number | undefined) => native(still(id, 'sleep', 'sleep', step === undefined ? {} : { doze: step }))
    const idle = native(still('naruto', 'idle', 'sleep'))
    const asleep = doze('naruto', undefined)
    // the yawn: standing, the head two pixels below the stance, a sigh by the mouth; no cap yet
    const yawn = doze('naruto', 0)
    expect(yawn.head!.y - idle.head!.y).toBe(2)
    expect(yawn.px.includes(cap)).toBe(false)
    // the sit: lower than standing, no cap
    const sit = doze('naruto', 1)
    expect(sit.head!.y).toBeGreaterThan(idle.head!.y)
    expect(sit.px.includes(cap)).toBe(false)
    // the puff: the sleep pose, the cap in a cloud; then its wisps; then asleep as ever
    expect(same2px(doze('naruto', 2).px, asleep.px)).toBe(false)
    expect(doze('naruto', 2).head).toEqual(asleep.head)
    expect(same2px(doze('naruto', 3).px, asleep.px)).toBe(false)
    expect(asleep.px.includes(cap)).toBe(true)
    // one who sleeps in nothing: the yawn and the sit, then just the sleep pose
    expect(same2px(doze('kakashi', 0).px, doze('kakashi', undefined).px)).toBe(false)
    for (const s of [2, 3]) expect(same2px(doze('kakashi', s).px, doze('kakashi', undefined).px)).toBe(true)
  })

  test('at rest, a pose\'s own eyes win over a look down (a book), never over a blink', () => {
    const n: NinjaSprite = { ...KAKASHI, id: 'test-eyes', poseEyes: { idle: 'happy' } }
    const eyes = (st: ChibiState): string => {
      const f = frameOf(n, st, () => undefined)
      const h = f.head!
      return Array.from(f.px.subarray((h.y + 10) * W, (h.y + 15) * W)).join()
    }
    const ahead = eyes(still('test-eyes', 'idle'))
    expect(eyes(still('test-eyes', 'idle', 'calm', { face: { blink: 0, gaze: [0, 0.5], mood: 'calm', active: false } }))).toBe(ahead)
    expect(eyes(still('test-eyes', 'idle', 'calm', { face: { blink: 0.5, gaze: [0, 0.5], mood: 'calm', active: false } }))).not.toBe(ahead)
  })

  test('Kakashi reads with his headband down (the Sharingan only wakes for his jutsu); the rest of the dojutsu ninja look up with theirs', () => {
    for (const [id, awake] of [['kakashi', false], ['sasuke', true], ['hinata', true]] as const) {
      const c = new Companion(byId(id))
      c.setWorking(true)
      c.toolStart('1', 'Read')
      run(c, 2)
      expect({ id, pose: c.state().pose, active: c.state().face.active }).toEqual({ id, pose: 'think', active: awake })
    }
    const c = new Companion(byId('kakashi'))
    c.perform(0)
    expect(c.state().face.active).toBe(true)
  })

  test("an effect taller than the stage (a looming summons) is drawn cropped by the stage's edges, never refused", () => {
    const fxs = FX as Record<string, FxFamily>
    fxs['testTall'] = { palette: pal('r:#c02020'), anchor: [5, 39], frames: [Array.from({ length: 40 }, () => 'r'.repeat(12))] }
    try {
      const px = draw(KAKASHI, { fx: [{ fx: 'testTall', f: 0, at: [2, GROUND] }] }).px
      // from the stage's top row to the ground, and off its left edge
      expect(px[0 * W + 0]).toBe(0xc02020)
      expect(px[GROUND * W + 8]).toBe(0xc02020)
      expect(px[GROUND * W + 9]).toBe(-1)
    } finally {
      delete fxs['testTall']
    }
  })

  test('wear(): a template with a ninja\'s own poses put in, for their moves to be written against', () => {
    expect(wear(VEST, undefined)).toBe(VEST)
    const t = wear(VEST, { cheer: { base: 'thumbs', eyes: 'happy' }, scratch: 'cheer' })
    expect(t.poses['cheer']!.rows).toBe(VEST.poses['thumbs']!.rows)
    expect(t.poses['cheer']!.eyes).toBe('happy')
    expect(t.poses['scratch']).toBe(VEST.poses['cheer'])
    // the template itself untouched
    expect(t).not.toBe(VEST)
    expect(VEST.poses['cheer']!.rows).not.toBe(VEST.poses['thumbs']!.rows)
  })
})
