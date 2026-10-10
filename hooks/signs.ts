// The working loop: while Claude works and no jutsu plays, the ninja's hands
// weave signs in phrases, two to five quick changes (each sign 0.2 s, the last
// 0.3), then a hold of 1.4 to 2.2 s with a breath out; every three to five
// phrases a wait instead, arms crossed with a glance at the post, or a flicker
// of chakra. It is one clock: what it shows at a moment (at), and every moment
// it changes (edges), side by side, so a new beat cannot be drawn late. Its
// phrases begin on the frame grid, as the body's other clocks do, so no
// picture between them shows for less than a frame.

import type { Pose } from './art/chibi.ts'
import { FRAME } from './art/move.ts'

const SIGNS: readonly Pose[] = ['signs', 'signs2', 'signs3']
const SIGN = 0.2
const LAST_SIGN = 0.3
const CHANGES = [2, 5] as const
const HOLD = [1.4, 2.2] as const
const WAIT_EVERY = [3, 5] as const
const CROSS = [2.4, 3.2] as const
const FLICKER = [0.5, 0.75, 0.5, 0.75, 0.5, 0, 0, 0, 0, 0, 0, 0] as const
const TOWARD_POST: [number, number] = [-0.9, 0.1]

// a moment on the frame grid: the tenth of a second it is, or the next
export const grid = (x: number): number => Math.ceil(x * 10 - 1e-6) / 10

// a well-stirred hash of two numbers, 0 to 1
const mix = (a: number, b: number): number => {
  let x = Math.imul(a ^ 0x5bd1e995, 0x2c1b3c6d) ^ Math.imul(b + 0x6b43a9b5, 0x297a2d39)
  x = Math.imul(x ^ (x >>> 15), 0x2c1b3c6d)
  x = Math.imul(x ^ (x >>> 12), 0x297a2d39)
  return ((x ^ (x >>> 15)) >>> 0) / 4294967296
}

// how long a phrase's quick signs take
const quickOf = (n: number): number => (n === 0 ? 0 : (n - 1) * SIGN + LAST_SIGN)
// a length from `range` in tenths, by `r` (0 to 1)
const tenths = (range: readonly [number, number], r: number): number => range[0] + Math.floor(r * ((range[1] - range[0]) * 10 + 1)) / 10

// a phrase: its quick signs and hold, or a wait
type Phrase = { k: number; from: number; kind: 'signs' | 'cross' | 'flicker'; poses: readonly Pose[]; hold: number; len: number }

// what the loop shows: the pose, the breath (null: the body's own), and the
// glance and the glow when it sets them
export type Signs = { pose: Pose; bob: number | null; gaze?: [number, number]; aura?: number }

export class HandSigns {
  // whether the loop showed at the last update (its phrases run from then)
  on = false
  // its seed, its phrase, and the phrases until the next wait
  private seed = 1
  private untilWait: number = WAIT_EVERY[0]
  private phrase: Phrase = { k: 0, from: 0, kind: 'signs', poses: [], hold: HOLD[0], len: HOLD[0] }

  // Moves the loop on to `t`: begun afresh (seeded by `seed`) when it starts
  // to show, on the frame grid (its first sign shows at once, a moment
  // longer), its phrases in turn while it does.
  advance(t: number, shows: boolean, seed: () => number): void {
    if (shows && !this.on) {
      this.seed = seed()
      this.untilWait = WAIT_EVERY[0] + Math.floor(mix(this.seed, 7) * (WAIT_EVERY[1] - WAIT_EVERY[0] + 1))
      this.phrase = this.phraseOf(0, grid(t))
    }
    this.on = shows
    while (shows && t - this.phrase.from >= this.phrase.len - 1e-9) this.phrase = this.phraseOf(this.phrase.k + 1, this.phrase.from + this.phrase.len)
  }

  // whether the phrase is a wait with the arms crossed (the body breathes)
  get waiting(): boolean {
    return this.phrase.kind === 'cross'
  }

  // The loop at `t`: the phrase's quick signs, then the hold, a breath out in
  // its middle; or a wait, arms crossed with a glance at the post, or a
  // flicker of chakra.
  at(t: number): Signs {
    // (the frame before the loop's first update: its phrase is still to come)
    if (!this.on) return { pose: 'signs', bob: 0 }
    const p = this.phrase
    // (a phrase begun on the grid a moment from now, or a hair's breadth by
    // the sums, shows as it begins)
    const s = Math.max(0, t - p.from)
    if (p.kind === 'cross') return { pose: 'crossed', bob: null, gaze: s >= 0.3 && s < p.len - 0.6 ? TOWARD_POST : [0, 0] }
    if (p.kind === 'flicker') return { pose: 'signs', bob: 0, aura: FLICKER[Math.floor(s / FRAME + 1e-9)] ?? 0 }
    let at = 0
    for (let i = 0; i < p.poses.length; i++) {
      at += i === p.poses.length - 1 ? LAST_SIGN : SIGN
      if (s < at - 1e-9) return { pose: p.poses[i]!, bob: 0 }
    }
    const held = s - at
    return { pose: 'signs', bob: held >= 0.3 && held < p.hold - 0.3 ? 1 : 0 }
  }

  // every moment at() changes in this phrase, and its end
  edges(soon: (at: number) => void): void {
    const p = this.phrase
    soon(p.from + p.len)
    if (p.kind === 'signs') {
      let at = p.from
      for (let i = 0; i < p.poses.length; i++) soon((at += i === p.poses.length - 1 ? LAST_SIGN : SIGN))
      soon(at + 0.3)
      soon(at + p.hold - 0.3)
    } else if (p.kind === 'cross') {
      soon(p.from + 0.3)
      soon(p.from + p.len - 0.6)
    } else for (let k = 1; k <= FLICKER.length; k++) soon(p.from + k * FRAME)
  }

  // phrase `k` from `from`: a wait every few phrases, else two to five quick
  // signs (each unlike the last) and a hold
  private phraseOf(k: number, from: number): Phrase {
    const r = (salt: number): number => mix(this.seed, k * 16 + salt)
    if (k > 0 && this.untilWait <= 0) {
      this.untilWait = WAIT_EVERY[0] + Math.floor(r(1) * (WAIT_EVERY[1] - WAIT_EVERY[0] + 1))
      if (r(2) < 0.35) return { k, from, kind: 'flicker', poses: [], hold: 0, len: FLICKER.length * FRAME }
      return { k, from, kind: 'cross', poses: [], hold: 0, len: tenths(CROSS, r(3)) }
    }
    this.untilWait--
    const changes = CHANGES[0] + Math.floor(r(4) * (CHANGES[1] - CHANGES[0] + 1))
    const poses: Pose[] = []
    let prev: Pose = 'signs'
    for (let i = 0; i < changes - 1; i++) {
      const last = i === changes - 2
      const options = SIGNS.filter(p => p !== prev && !(last && p === 'signs'))
      prev = options[Math.floor(r(8 + i) * options.length)] ?? prev
      poses.push(prev)
    }
    const hold = tenths(HOLD, r(5))
    return { k, from, kind: 'signs', poses, hold, len: quickOf(poses.length) + hold }
  }
}
