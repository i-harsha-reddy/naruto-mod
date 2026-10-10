// Kakashi's Icha Icha reading pose (hooks/sprite/ninja/kakashi.ts): the
// companion's 'think' (Claude reading, searching or thinking it over) drawn as
// him slouched over his open orange book, held up at his chin on the arena
// side, his one eye lidded and down on the page, the far hand in his pocket;
// the breath lifts the book a pixel and stands a page up off it.

import { describe, expect, test } from 'claude-code/testing'
import type { ChibiState, Pose } from '../hooks/art/chibi.ts'
import type { Mood } from '../hooks/art/portrait.ts'
import { STAGE_H, STAGE_W, frameOf } from '../hooks/sprite/index.ts'
import { KAKASHI } from '../hooks/sprite/ninja/kakashi.ts'

const ORANGE = 0xf48a24
const PAGE = 0xf6ecd0
const TITLE = 0x5a1a0e
const LID = 0x4a3438
const PUPIL = 0x1c1820
const SKIN = [0xf6d8bc, 0xd8b498]
const SHARINGAN = 0xe0222c

type Look = { bob?: number; blink?: number; gaze?: [number, number]; mood?: Mood; active?: boolean }
// him at rest in a pose (no move, so no move to play)
const rest = (pose: Pose, o: Look = {}) => {
  const st: ChibiState = {
    id: 'kakashi',
    face: { blink: o.blink ?? 0, gaze: o.gaze ?? [0, 0], mood: o.mood ?? 'calm', active: o.active === true },
    pose,
    aura: 0,
    badge: null,
    tick: 0,
    bob: o.bob ?? 0,
    move: null,
  }
  return frameOf(KAKASHI, st, () => undefined)
}
// the faces the companion gives the pose: thinking it over (a look up and
// away), and reading or searching (eyes down, the Sharingan awake)
const THINKING: Look = { gaze: [-0.6, -0.8] }
const READING: Look = { mood: 'focus', gaze: [0, 0.3], active: true }

const pixels = (px: Int32Array, colour: number): [number, number][] => {
  const out: [number, number][] = []
  for (let i = 0; i < px.length; i++) if (px[i] === colour) out.push([i % STAGE_W, Math.floor(i / STAGE_W)])
  return out
}
const box = (px: Int32Array, colour: number) => {
  const p = pixels(px, colour)
  const xs = p.map(([x]) => x)
  const ys = p.map(([, y]) => y)
  return { n: p.length, x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) }
}
const at = (px: Int32Array, x: number, y: number): number => px[y * STAGE_W + x]!

const OTHERS: readonly Pose[] = ['idle', 'crossed', 'signs', 'signs2', 'signs3', 'charge', 'gather', 'strike', 'punch', 'kick', 'dash', 'slam', 'raise', 'alert', 'thumbs', 'scratch', 'spread', 'poke', 'sleep', 'slump', 'tuck']

describe("Kakashi's reading pose", () => {
  test('the book: orange, titled, its pages showing, held up at his chin in front of him on the arena side, and only while he reads', () => {
    for (const look of [THINKING, READING]) {
      const f = rest('think', look)
      const h = f.head!
      const cover = box(f.px, ORANGE)
      // a book, not a brick: a real cover, about 6 x 4 inside its outline
      // (its orange, besides the highlight, the title and the spine)
      expect(cover.n).toBeGreaterThanOrEqual(12)
      expect(cover.x1 - cover.x0 + 1).toBeGreaterThanOrEqual(4)
      expect(cover.x1 - cover.x0 + 1).toBeLessThanOrEqual(7)
      expect(cover.y1 - cover.y0 + 1).toBeGreaterThanOrEqual(3)
      // its title, and the cream page block along the top and the far edge
      expect(pixels(f.px, TITLE).length).toBe(2)
      expect(pixels(f.px, PAGE).length).toBeGreaterThanOrEqual(6)
      // below his eye, no lower than his chin, and toward the arena (left of the eye)
      expect(cover.y0).toBeGreaterThan(h.eyes + 1)
      expect(cover.y1).toBeLessThanOrEqual(h.neck + 1)
      expect(cover.x1).toBeLessThan(h.x + KAKASHI.head.eyes[0][0])
    }
    // put away in every other pose
    for (const pose of OTHERS) for (const bob of [0, 1]) expect({ pose, bob, book: pixels(rest(pose, { bob }).px, ORANGE).length }).toEqual({ pose, bob, book: 0 })
  })

  test('the breath lifts the book a pixel and stands a page up off it, as his head nods a pixel into it', () => {
    const a = rest('think', THINKING)
    const b = rest('think', { ...THINKING, bob: 1 })
    const [ca, cb] = [box(a.px, ORANGE), box(b.px, ORANGE)]
    expect([cb.x0, cb.x1, cb.y0, cb.y1]).toEqual([ca.x0, ca.x1, ca.y0 - 1, ca.y1 - 1])
    expect(b.head!.y - a.head!.y).toBe(1)
    // the page: one cream pixel more, standing above the lifted book's top edge
    const [pa, pb] = [box(a.px, PAGE), box(b.px, PAGE)]
    expect(pb.n).toBe(pa.n + 1)
    expect(pb.y0).toBe(pa.y0 - 2)
  })

  test('his eye is lidded and down on the page; he still blinks; the headband stays down until the Sharingan wakes', () => {
    const f = rest('think', THINKING)
    const [ex, ey] = [f.head!.x + KAKASHI.head.eyes[0][0], f.head!.y + KAKASHI.head.eyes[0][1]]
    // the lid level across the top, the pupil sunk to the outer (arena) corner beside bare skin
    expect([at(f.px, ex, ey), at(f.px, ex + 1, ey), at(f.px, ex, ey + 1), at(f.px, ex + 1, ey + 1)]).toEqual([LID, LID, PUPIL, SKIN[0]!])
    // a blink shuts it
    const shut = rest('think', { ...THINKING, blink: 1 })
    const eye = [0, 1].flatMap(dy => [0, 1].map(dx => at(shut.px, ex + dx, ey + dy)))
    expect(eye.includes(PUPIL)).toBe(false)
    // the headband over the other eye, until the companion wakes the Sharingan (Claude reading a file)
    expect(pixels(f.px, SHARINGAN).length).toBe(0)
    expect(pixels(rest('think', READING).px, SHARINGAN).length).toBeGreaterThan(0)
  })

  test('his far hand is in his pocket: no hand shows on his far side below his chin', () => {
    const farHand = (px: Int32Array, from: number): number => {
      let n = 0
      for (let y = from; y < STAGE_H; y++) for (let x = KAKASHI.home ?? 35; x < STAGE_W; x++) if (SKIN.includes(at(px, x, y))) n++
      return n
    }
    const idle = rest('idle')
    expect(farHand(idle.px, idle.head!.neck + 1)).toBeGreaterThan(0)
    for (const bob of [0, 1]) {
      const f = rest('think', { ...THINKING, bob })
      expect(farHand(f.px, f.head!.neck + 1)).toBe(0)
    }
  })
})
