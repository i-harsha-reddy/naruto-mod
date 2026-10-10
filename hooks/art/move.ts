// A ninja's moves: each a short piece of choreography, beats of poses held
// for a while. The sprite engine writes them as cels (sprite/cels.ts derives
// the beats); the companion times them from the beats: their length, the
// blows, the shout.

import type { Mood } from './portrait.ts'
import type { Pose } from './chibi.ts'

type Point = readonly [number, number]

// moves are drawn ten times a second: every beat and step lasts whole frames
export const FRAME = 0.1

// times are sums of tenths, so they are compared with a little slack
const EPS = 1e-6
const r6 = (x: number): number => Math.round(x * 1e6) / 1e6

// a pose the body holds for a while within a beat (a cel, as cels.ts sees it)
export type Step = {
  pose: Pose
  // seconds, whole frames
  dur: number
  mood?: Mood
  gaze?: Point
}

export type Beat = {
  // the cels' tag: 'signs', 'charge', 'release', 'impact', 'hit', 'recover'...
  name: string
  pose: Pose
  // seconds, whole frames
  dur: number
  // what the body does through the beat, step by step: poses in turn. They
  // add up to `dur`; `pose` is then the first step's
  steps?: readonly Step[]
  // the chakra glow behind the body: a level, or [start, end]
  aura?: number | readonly [number, number]
  mood?: Mood
  // where the eyes look ([-1, 0] is the arena)
  gaze?: Point
  // true: the spinner starts shouting the jutsu's name as this beat begins
  // (left out, it starts at the release or dash before the first blow). A
  // string: the spinner shouts that through this beat instead ("Two Palms"),
  // whatever the climax (see shoutAt)
  shout?: boolean | string
}

export type Move = {
  // the jutsu's full name: "Fire Style: Great Fireball Jutsu"
  name: string
  // what the spinner shouts at the climax (see climax()): a short name, 24
  // characters at most, "Great Fireball"
  shout: string
  // whether the eyes power up (Sharingan, Byakugan, Rinnegan, Sage Mode)
  // while it plays; left out, they do
  dojutsu?: boolean
  // a quick strike (NinjaSprite's quick): a second and a half or so, played
  // for an edit, never in the jutsu rotation
  quick?: boolean
  beats: readonly Beat[]
  // what calls it: 'shell' marks the signature jutsu (a shell command, a
  // switch), 'agent' the one a subagent calls; every jutsu also plays in the
  // rotation while Claude works and when the ninja trains. An edit always
  // plays the quick strike, whose own tag is 'edit'; on a full
  // jutsu, 'edit' is only a note of what it was made for.
  on?: readonly ('shell' | 'edit' | 'agent')[]
}

// ------------------------------------------------------------------ timing

export const totalOf = (m: Move): number => r6(m.beats.reduce((s, b) => s + b.dur, 0))

export type BeatAt = {
  beat: Beat
  index: number
  // how far through the beat (time), from its start
  u: number
  start: number
  aura: number
  // what the body is doing: the beat's step now (the beat itself if it has none)
  step: Step
}

const clamp01 = (u: number): number => Math.max(0, Math.min(1, u))

// what the body does through a beat
const stepsOf = (b: Beat): readonly Step[] => (b.steps && b.steps.length > 0 ? b.steps : [b])

export const beatAt = (m: Move, t: number): BeatAt => {
  let start = 0
  const n = m.beats.length
  for (let i = 0; i < n; i++) {
    const b = m.beats[i]!
    const end = r6(start + b.dur)
    if (t < end - EPS || i === n - 1) {
      const u = clamp01((t - start) / b.dur)
      const aura = typeof b.aura === 'number' ? b.aura : b.aura ? b.aura[0] + (b.aura[1] - b.aura[0]) * u : 0
      // the body through the beat's steps
      const steps = stepsOf(b)
      let s0 = start
      for (let j = 0; j < steps.length; j++) {
        const s = steps[j]!
        const e = r6(s0 + s.dur)
        if (t < e - EPS || j === steps.length - 1) return { beat: b, index: i, u, start, aura, step: s }
        s0 = e
      }
    }
    start = end
  }
  throw new Error('a move with no beats')
}

// when each beat begins
const startsOf = (m: Move): number[] => {
  const out: number[] = []
  let start = 0
  for (const b of m.beats) {
    out.push(start)
    start = r6(start + b.dur)
  }
  return out
}

export const sinceOf = (m: Move, t: number, name: string): number => {
  const i = m.beats.findIndex(b => b.name === name)
  return i < 0 ? -Infinity : t - startsOf(m)[i]!
}

const isHit = (name: string): number => (name === 'impact' || name === 'finish' ? 1 : /^hit\d*$/.test(name) ? 0.6 : 0)

// the moments blows land, and how hard: a beat called 'impact' or 'finish'
// lands in full, each 'hit', 'hit2'... of a flurry a little lighter
export const hitsOf = (m: Move): { at: number; power: number }[] => {
  const starts = startsOf(m)
  const out: { at: number; power: number }[] = []
  m.beats.forEach((b, i) => {
    const power = isHit(b.name)
    if (power > 0) out.push({ at: starts[i]!, power })
  })
  return out
}

// The span of the move the spinner shouts the jutsu's name in, [from, to)
// seconds: from the beat marked `shout` (or else the release, dash, throw or
// leap that sets the first blow going, or the beat just before it) to the end
// of the first blow, a second to a second and a half.
const LAUNCH = /^(release|dash|throw|launch|leap|dive|fly|flash|step|slam|poof|scatter|stare|swing)\d*$/
export const shoutSpan = (m: Move): [number, number] => {
  const starts = startsOf(m)
  const first = m.beats.findIndex(b => isHit(b.name) > 0)
  const marked = m.beats.findIndex(b => b.shout === true)
  let i = marked
  if (i < 0 && first >= 0) {
    // the earliest launch in the second and a half before the blow
    for (let j = first - 1; j >= 0 && starts[first]! - starts[j]! <= 1.5 + EPS; j--) if (LAUNCH.test(m.beats[j]!.name)) i = j
    if (i < 0) i = Math.max(0, first - 1)
  }
  if (i < 0) i = Math.floor(m.beats.length / 2)
  const from = starts[i]!
  const blow = first >= i ? first : m.beats.findIndex((b, j) => j >= i && isHit(b.name) > 0)
  const end = blow >= 0 ? r6(starts[blow]! + m.beats[blow]!.dur) : from + 1.2
  return [from, r6(Math.min(from + 1.5, Math.max(from + 1, end)))]
}

// whether the jutsu's name is being shouted at t
export const climax = (m: Move, t: number): boolean => {
  const [from, to] = shoutSpan(m)
  return t >= from - EPS && t < to - EPS
}

// What the spinner shouts at t (it adds the "!"): the beat's own shout if it
// has one ("Sixteen Palms"), else the jutsu's short name through its climax,
// else nothing
export const shoutAt = (m: Move, t: number): string | null => {
  const own = beatAt(m, t).beat.shout
  if (typeof own === 'string' && own.length > 0) return own
  return m.shout && climax(m, t) ? m.shout : null
}

// ------------------------------------------------------------------ frames

export const frameTime = (t: number): number => Math.round(Math.floor(t / FRAME + EPS) * FRAME * 10) / 10

// what the body does at time t of a move: its pose, face and glow
export const poseAt = (m: Move, t: number): { pose: Pose; mood: Mood; gaze: Point; aura: number } => {
  const at = beatAt(m, t)
  const s = at.step
  return { pose: s.pose, mood: s.mood ?? at.beat.mood ?? 'focus', gaze: s.gaze ?? at.beat.gaze ?? [-0.8, 0.05], aura: Math.round(at.aura * 4) / 4 }
}
