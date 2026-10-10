// A move as cels, and as the mod's Move. A move is drawn as a list of cels,
// each held a whole number of 10 fps frames (pose-to-pose, snaps not
// tweens). The companion (companion.ts) and move.ts know a move by its beats:
// here they are derived from the cels' tags, consecutive cels with one tag
// making one beat, its steps the cels' poses (as the companion names them),
// moods and glances. So the companion's timing works unchanged:
//   'impact' (or 'finish', 'hit', 'hit2'...)  a blow lands: the post's hit,
//              when a failing command lets the jutsu play on (move.ts hitsOf)
//   'recover'  where a jutsu cut short by a failure stops (the fizzle follows)
//   the shout  from the beat a cel marks `shout`, else the launch ('dash',
//              'slam', 'throw'...) in the second and a half before the first
//              blow, for a second to a second and a half (move.ts shoutSpan)
// Hit-stop is drawn, not computed: a blow's first frame is held two frames.

import type { Pose } from '../art/chibi.ts'
import { FRAME } from '../art/move.ts'
import type { Beat, Move, Step } from '../art/move.ts'
import type { Mood } from '../art/portrait.ts'
import type { Cel, CelMove, EyeState, Frame, NinjaCel, PoseGrid, Template } from './types.ts'

const r6 = (x: number): number => Math.round(x * 1e6) / 1e6

// a pose of the template by name: drawn under it, else the nearest drawn (the map)
export const poseOf = (t: Template, name: string): PoseGrid => {
  const p = t.poses[name] ?? t.poses[t.map[name as Pose]]
  if (!p) throw new Error(`template ${t.name} has no pose ${name}`)
  return p
}

// what the companion calls a drawn pose
const labelOf = (t: Template, name: string): Pose => {
  if (t.poses[name]?.as) return t.poses[name]!.as!
  return name in t.map ? (name as Pose) : 'idle'
}

// A face as the companion keeps it (portrait.ts's Face), without the type's
// import; `eyes` names a hand-drawn state outright (a cel's 'grin')
export type FaceLike = { blink: number; gaze: readonly [number, number] | number[]; mood: Mood; active: boolean; eyes?: string }

// An eye state as a face: the mood (and blink and glance) a cel's eyes stand
// for, which its beat reports to the companion
export const faceOfEyes = (e: string, active = false): FaceLike => {
  switch (e) {
    case 'left':
      return { blink: 0, gaze: [-1, 0], mood: 'calm', active }
    case 'half':
      return { blink: 0.5, gaze: [0, 0], mood: 'calm', active }
    case 'shut':
      return { blink: 1, gaze: [0, 0], mood: 'calm', active }
    case 'focus':
      return { blink: 0, gaze: [-0.8, 0.05], mood: 'focus', active }
    case 'happy':
      return { blink: 0, gaze: [0, 0.05], mood: 'happy', active }
    case 'sad':
      return { blink: 0, gaze: [-0.3, 0.3], mood: 'worried', active }
    case 'wide':
      return { blink: 0, gaze: [0, 0], mood: 'surprised', active }
    case 'smug':
      return { blink: 0, gaze: [0, 0], mood: 'smug', active }
    default:
      return { blink: 0, gaze: [0, 0], mood: 'calm', active }
  }
}

// A face as an eye state: what hand-drawn eyes show for the companion's face
export const eyesOfFace = (f: FaceLike): EyeState => {
  const [gx, gy] = [Number(f.gaze[0]) || 0, Number(f.gaze[1]) || 0]
  if (f.blink >= 0.7 || f.mood === 'sleep') return 'shut'
  if (f.blink > 0.3) return 'half'
  if (f.mood === 'happy') return 'happy'
  if (f.mood === 'surprised') return 'wide'
  if (f.mood === 'worried') return 'sad'
  // (where no smug eyes are drawn, the lids lowered: see eyesFor)
  if (f.mood === 'smug') return 'smug'
  // reading, or looking down at an edit: the lids lowered
  if (gy >= 0.3) return 'half'
  if (f.mood === 'focus') return 'focus'
  return gx < -0.35 ? 'left' : 'open'
}

// a state the faces map to, where a hand-drawn set lacks it
export const FALLBACK: Readonly<Record<string, string>> = { wide: 'open', smug: 'half' }

// the eye state a cel's ninja shows: its own, else its pose's, else open
export const eyesOfCel = (t: Template, k: NinjaCel): string => k.eyes ?? poseOf(t, k.pose).eyes ?? 'open'

// effects that are a glow round the body (the beat's chakra level)
const GLOWS = new Set(['aura', 'auraLow'])

// The eyes a move's beats read their moods from: a hand-drawn set's moods
// for its own states ('grin': 'happy'); the faces' eight need none.
export type MoveEyes = { moods?: Readonly<Record<string, Mood>> }

// one step of a beat: a cel as the companion sees it
const stepOf = (t: Template, cel: Cel, eyes?: MoveEyes): Step => {
  const dur = r6(cel.n * FRAME)
  if (!cel.k) return { pose: 'signs', dur, mood: 'calm' }
  const state = eyesOfCel(t, cel.k)
  const f = faceOfEyes(state)
  return { pose: labelOf(t, cel.k.pose), dur, mood: eyes?.moods?.[state] ?? f.mood, gaze: [f.gaze[0]!, f.gaze[1]!] }
}

// The beats of a cel list: a beat for each run of cels with one tag.
export const beatsOf = (t: Template, cels: readonly Cel[], eyes?: MoveEyes): Beat[] => {
  const beats: Beat[] = []
  let run: Cel[] = []
  const flush = (): void => {
    if (run.length === 0) return
    const steps = run.map(c => stepOf(t, c, eyes))
    const glow = run.some(c => c.fx?.some(e => GLOWS.has(e.fx))) ? 1 : 0
    const beat: Beat = {
      name: run[0]!.tag,
      pose: steps[0]!.pose,
      dur: r6(steps.reduce((s, x) => s + x.dur, 0)),
      steps,
      mood: steps[0]!.mood ?? 'calm',
      gaze: steps[0]!.gaze ?? [0, 0],
      ...(glow ? { aura: glow } : {}),
      ...(run.some(c => c.shout) ? { shout: run.find(c => typeof c.shout === 'string')?.shout ?? true } : {}),
    }
    beats.push(beat)
    run = []
  }
  for (const cel of cels) {
    if (!Number.isInteger(cel.n) || cel.n < 1) throw new Error(`a cel of ${cel.tag} held ${cel.n} frames`)
    if (run.length > 0 && run[0]!.tag !== cel.tag) flush()
    run.push(cel)
  }
  flush()
  return beats
}

// a cel list a frame at a time: each frame its cel and its index in the move
export const framesOf = (cels: readonly Cel[]): Frame[] => {
  const out: Frame[] = []
  for (const cel of cels) for (let i = 0; i < cel.n; i++) out.push({ ...cel, t: out.length })
  return out
}

// What a cel move is besides its cels: the Move's own fields.
export type MoveInfo = Pick<Move, 'name' | 'shout'> & Partial<Pick<Move, 'on' | 'dojutsu' | 'quick'>>

// A cel move: the mod's Move, its beats from the cels, carrying them.
// `eyes`: the ninja's hand-drawn eyes, whose moods name their own states'.
export const celMove = (t: Template, info: MoveInfo, cels: readonly Cel[], eyes?: MoveEyes): CelMove => ({
  ...info,
  beats: beatsOf(t, cels, eyes),
  cels,
  frames: framesOf(cels),
})

// the frame of a move at t seconds (the first before it, the last after it)
export const frameAt = (m: CelMove, t: number): Frame => {
  const i = Math.floor(t / FRAME + 1e-6)
  return m.frames[Number.isFinite(i) ? Math.max(0, Math.min(m.frames.length - 1, i)) : 0]!
}
