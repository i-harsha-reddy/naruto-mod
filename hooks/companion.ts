// What the ninja is doing, moment to moment. It breathes, blinks and glances
// about. While Claude works it weaves hand signs in short phrases, now and
// then crossing its arms to wait (or ponders what Claude reads), and the work
// itself calls its jutsu: the signature one for a command, clones or a summons
// for a subagent, a quick strike for an edit. The first three jutsu of a turn
// come at least twelve seconds apart, then ever more slowly, so a long task is
// not a light show; a call that comes sooner waits its turn, the latest
// winning. A command, an edit or a subagent that fails makes its own jutsu
// fizzle and the ninja slump (a read that finds nothing is no failure).
// When idle it trains now and then; it cheers in its own way when an answer
// lands, shows a red "!" for as long as Claude needs you, and nods off when
// left alone (all but Gaara, who never sleeps).

import type { Badge, ChibiState, Pose } from './art/chibi.ts'
import { FRAME, frameTime, hitsOf, poseAt, shoutAt, shoutSpan, sinceOf, totalOf } from './art/move.ts'
import type { Move } from './art/move.ts'
import { ARRIVAL_INDEX, CHEER_INDEX, DISPEL_INDEX, FIZZLE_INDEX, QUICK_INDEX, movesOf, playOf } from './art/moves.ts'
import type { Mood } from './art/portrait.ts'
import type { Ninja } from './roster.ts'
import { HandSigns, grid } from './signs.ts'
import type { Signs } from './signs.ts'
import { SLUMP } from './sprite/anims/shared.ts'

// what a tool call is at, for the pose and the badge
type ToolKind = 'read' | 'search' | 'edit' | 'shell' | 'web' | 'agent' | 'plan' | 'other'

const toolKind = (tool: string): ToolKind => {
  if (/^(Read|NotebookRead|LS|ReadMcpResourceTool|ListMcpResourcesTool)$/.test(tool)) return 'read'
  if (/^(Grep|Glob|ToolSearch|LSP)$/.test(tool)) return 'search'
  if (/^(Edit|Write|MultiEdit|NotebookEdit)$/.test(tool)) return 'edit'
  if (/^(Bash|PowerShell|BashOutput|KillShell|Monitor)$/.test(tool)) return 'shell'
  if (/^(WebFetch|WebSearch)$/.test(tool)) return 'web'
  if (/^(Agent|Task|Workflow)$/.test(tool)) return 'agent'
  if (/^(TodoWrite|TaskCreate|TaskUpdate|EnterPlanMode|ExitPlanMode)$/.test(tool)) return 'plan'
  return 'other'
}

// the tools that wait on you: a question, a plan to approve
const ASKS = /^(AskUserQuestion|ExitPlanMode)$/
// the tools that only look in on a command already running: no jutsu of their own
const PEEKS = /^(BashOutput|KillShell|Monitor|TaskOutput|TaskStop)$/
// whether a call of Claude's that fails is a failure to frown at: a command,
// an edit, a subagent (a read or a search that finds nothing is Claude
// looking, and a look in on a command is not the command)
const fails = (call: Call): boolean => (call.kind === 'shell' || call.kind === 'edit' || call.kind === 'agent') && !PEEKS.test(call.tool)

// a tiny deterministic random source, so a reload does not jump
class Rng {
  s: number
  constructor(seed: number) {
    this.s = seed >>> 0 || 1
  }
  next(): number {
    this.s ^= this.s << 13
    this.s ^= this.s >>> 17
    this.s ^= this.s << 5
    return (this.s >>> 0) / 4294967296
  }
}

// A tool call's arguments as a number, so a permission dialog finds the very
// call it asks about: the same keys in any order give the same number.
const stable = (v: unknown): string => {
  if (v === null || typeof v !== 'object') return JSON.stringify(v) ?? 'undefined'
  if (Array.isArray(v)) return `[${v.map(stable).join(',')}]`
  const o = v as Record<string, unknown>
  return `{${Object.keys(o)
    .sort()
    .map(k => `${JSON.stringify(k)}:${stable(o[k])}`)
    .join(',')}}`
}
const fingerprint = (input: unknown): number => {
  if (input === undefined) return 0
  const s = stable(input)
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 0x01000193)
  return h >>> 0 || 1
}

// The eye a design hides, the viewer's right for all of them (Obito's mask,
// Deidara's bang, Kakashi's headband): a glance that way would look at nothing.
const ONE_EYED = new Set(['obito', 'deidara', 'kakashi'])
const hidesRight = (id: string): boolean => ONE_EYED.has(id)

// timings, in seconds: the quiet before the ninja dozes off
const SLEEP_AFTER = 300
// The drowsy moments before it does: the lids half shut, a slow breath, and
// two slow nods (the eyes shut and the head drops two pixels, `bob` 2, then
// it catches itself), the second longer. Each [until, blink, bob], from the
// window's start.
const DROWSY = 6
const NODDING: readonly (readonly [number, number, number])[] = [
  [1, 0.5, 0],
  [1.8, 1, 2],
  [2.3, 0.5, 0],
  [3.5, 0.5, 1],
  [3.9, 0.5, 0],
  [5.1, 1, 2],
  [5.5, 0.5, 0],
  [DROWSY, 1, 2],
]
// Nodding off (ChibiState's `doze`), the wake run backwards, from the moment
// sleep comes: a yawn, the head dipped two pixels; sitting down; a puff
// that brings the nightcap on (the sleep pose, its cap in a cloud); the
// cloud's last puffs. Each step until, from sleep's start; the z only once
// the puff comes.
const DOZE_STEPS = [0.4, 0.7, 0.9, 1.1] as const
const DOZE_Z = 2
// The fewest seconds between two jutsu while Claude works, start to start: the
// first three of a turn every twelve seconds, then slower as the turn goes on
// (twenty, thirty, then forty-five), so a long task tires the ninja out
export const JUTSU_EVERY = 12
const GAPS: readonly (readonly [number, number])[] = [
  [3, JUTSU_EVERY],
  [6, 20],
  [10, 30],
]
const TIRED = 45
// A command plays the quick strike as it starts, and its jutsu only once it
// has run SHELL_JUTSU seconds: a quick one (a status, a listing) passes with a
// flick of the wrist, and the full jutsu is kept for work that takes a while
export const SHELL_JUTSU = 4
// a call running longer than LONG shows a jutsu again every REPEAT, the next in turn
const LONG = 10
export const REPEAT = 45
// a command this soon after the signature jutsu calls the next in turn instead
const SIGNATURE_REST = 30
// the jutsu just played is not played again straight away, unless it was this long ago
const RECENT = 60
// an edit's quick strike, at most this often, and never when a waiting jutsu
// is due within STRIKE_CLEAR (the strike, then the breath while its smoke clears)
export const QUICK_EVERY = 8
const STRIKE_CLEAR = 3
// an idle ninja first trains this long after you were last about (plus up to
// a little), then every TRAIN_NEXT plus up to TRAIN_SPREAD, and never this
// soon after an answer
const TRAIN_FIRST = 120
const TRAIN_JITTER = 20
const TRAIN_NEXT = 180
const TRAIN_SPREAD = 60
const AFTER_ANSWER = 90
// The cheer held with reduced motion (else moves.ts plays it), and the soft
// cue a minute after an answer nobody has replied to: the cheer's pose held
// as long, no leap, no badge of its own
export const CHEER = 2
const CUE_AFTER = 60
// the start at a call for you, the start of a sleeper woken and the groggy
// moment after it, the slump at a failure, the breath out after a move before
// the hands go back to work, and the longer one before a jutsu that waited
// for it (the post's smoke clears), or the signature after a hello's cheer
const STARTLE = 0.9
const WAKE = 0.4
const GROGGY = 0.3
// a sleeper's waking (ChibiState's `wake`): the start with the nightcap still
// on, it lifting off in a puff, the puff, its wisps in the groggy moment
const WAKE_STEPS = [0.2, 0.3, WAKE, WAKE + 0.1] as const
const FROWN = 2.6
const SETTLE = 0.2
const CHAIN = 1
// the breath between a hello's cheer and its signature jutsu (a breath out at once)
const INTRO_CHAIN = 0.5
// a blink: half shut, shut, half shut, a frame each
const BLINK = [0.62, 1, 0.62] as const
// the body holds the signs (signs.ts) or the pondering at least this long
// before it swaps one for the other
const HOLD_POSE = 1.5
// the breath at rest, and asleep: a pixel down and up, every 1.3 s and 2 s
// (on the frame grid, as every clock of the body is, so no picture shows for
// less than a frame)
const BREATH = 1 / 1.3
const SLEEP_BREATH = 0.5
// the thinking dots: one more every 0.3 s
const DOTS = 0.3
// the most a jutsu moves on in one update: a slow tick slows it, never skips its impact
const MOVE_STEP = 0.25
// how often the picture may change at most, and at least, in milliseconds
const FAST = 100
const SLOW = 1000
const FLOOR_MS = 20

// a passing look, from when it shows until it ends (a sleeper woken: the
// start, then a groggy moment)
type Flash = { kind: 'cheer' | 'frown' | 'startle' | 'wake'; mood: Mood; pose: Pose; badge: Badge | null; from: number; until: number }
// a tool call in flight: the main agent's (`main`) set the pose and badge and
// call jutsu; any may be the one a permission dialog waits on
type Call = { tool: string; kind: ToolKind; main: boolean; agent: string | undefined; input: number; start: number; called?: boolean }
// the move playing: a jutsu of the ninja's set (its place in it), a quick
// strike, a new ninja's arrival, the cheer, a jutsu's fizzle, or its dispel at
// a call for you; when its first blow lands, how long it plays (a failure may
// cut it short: `cut`, the fizzle follows), and the call that wanted it (`by`:
// only that call's failure makes it fizzle)
type Playing = {
  m: Move
  index: number
  start: number
  total: number
  kind: 'jutsu' | 'quick' | 'arrival' | 'cheer' | 'fizzle' | 'dispel'
  hit: number
  cut?: true
  by?: string | null
  // the post was standing when it began (a working turn's: its poof in is skipped)
  postUp?: boolean
}
// what the picture shows, in order of precedence
type View = 'move' | 'sleep' | 'alert' | 'flash' | 'settle' | 'signs' | 'think' | 'idle'

export class Companion {
  ninja: Ninja
  // true while a model turn runs
  working = false
  // `/ninja quiet`: no jutsu while Claude works, no training and no soft cue (the spinner
  // and the footer are left alone too), and the hands hold one sign. Turned
  // on, a jutsu waiting its turn and a new ninja's signature are let go; the
  // move in hand plays out.
  get quiet(): boolean {
    return this.hushed
  }
  set quiet(on: boolean) {
    if (on) this.letGo()
    this.hushed = on
  }
  // The person prefers reduced motion: no jutsu and no shouts, only poses and
  // badges, and eyes that look straight out. Turned on, the move in hand ends too.
  get reduced(): boolean {
    return this.still
  }
  set reduced(on: boolean) {
    if (on) {
      this.letGo()
      this.move = null
      this.gaze = [0, 0]
    }
    this.still = on
  }
  // `/ninja off`: out of sight, so no jutsu the work calls for, no training
  // and no soft cue, as in quiet mode (the move in hand plays out)
  get hidden(): boolean {
    return this.away
  }
  set hidden(on: boolean) {
    if (on) {
      this.letGo()
      this.cueAt = 0
    }
    this.away = on
  }
  private hushed = false
  private still = false
  private away = false
  // seconds since the start, as update() moves them on
  private t = 0
  // true while the model thinks out loud
  private thinking = false
  private rng = new Rng(7)
  private calls = new Map<string, Call>()
  // the kind of the main agent's last call, shown for a moment after it starts
  private lastTool: { kind: ToolKind; until: number } | null = null
  // the red "!": until when, and the call it waits on (it holds until that
  // call runs or ends, you type, or the turn ends)
  private alertUntil = 0
  private askedBy: string | null = null
  // when an answer nobody has replied to gets its soft cue (0: none due)
  private cueAt = 0
  private lastActivity = 0
  private answeredAt = -Infinity
  // the ✓ of an answer, until the next prompt or sleep
  private done = false
  // the main agent's latest call failed: the turn ends without a cheer
  private failed = false
  private flash: Flash | null = null
  private blinkAt = 2
  private gaze: [number, number] = [0, 0]
  private gazeAt = 1.5
  private move: Playing | null = null
  // when the cheer is due, once the move in hand is done (0: none)
  private cheerDue = 0
  // when the last jutsu and quick strike began, the last signature, the one
  // waiting for its turn (and the call that wants it), the last played, the
  // rotation, and the jutsu this turn has had
  private jutsuAt = -Infinity
  private quickAt = -Infinity
  private signatureAt = -Infinity
  private queued: { index: number; by: string | null } | null = null
  private lastIndex = -1
  private rotation = 0
  private inTurn = 0
  // when an idle ninja next trains, and when a new ninja's signature is due (0: none)
  private trainAt = TRAIN_FIRST
  private introAt = 0
  // the breath out after a move: from its end, until when; and when the last
  // move at the post ended (its smoke clears a second later)
  private settleFrom = 0
  private settleUntil = 0
  private postEnd = -Infinity
  // the post up through a working turn: it goes up with the turn's first
  // jutsu and stays (no puff in or out between jutsu) until the turn ends,
  // when it leaves in one last poof (from postOutAt, two frames); a dispel or
  // a fizzle takes it off in their own smoke
  private postUp = false
  private postOutAt = -Infinity
  // the body's working pose (the signs or the pondering) and since when
  private held: { view: 'signs' | 'think'; from: number } | null = null
  // the working loop's hand signs
  private signs = new HandSigns()

  constructor(ninja: Ninja) {
    this.ninja = ninja
  }

  // forgets the jutsu waiting for its turn and a new ninja's signature to come
  private letGo(): void {
    this.queued = null
    this.introAt = 0
  }

  private activity(): void {
    this.lastActivity = this.t
    this.trainAt = Math.max(this.trainAt, this.t + TRAIN_FIRST + this.rng.next() * TRAIN_JITTER)
  }

  private flashOf(kind: Flash['kind'], mood: Mood, pose: Pose, badge: Badge | null, seconds: number, from = this.t): void {
    this.flash = { kind, mood, pose, badge, from, until: from + seconds }
  }

  // The ninja's own cheer from `from` (now, or a moment ago when a move just
  // ended): the cheer move as moves.ts plays it, or with reduced motion the
  // pose held. When the
  // frame before already shows the cheer pose (`before`), the crouch and hop
  // into it are skipped for its hold, so the body never dips out of the pose
  // and back.
  private cheer(from = this.t, before?: Pose): void {
    const m = this.reduced ? undefined : playOf(this.ninja.id, CHEER_INDEX)
    if (!m) {
      this.flashOf('cheer', this.ninja.cheer.mood, this.ninja.cheer.pose, null, CHEER, from)
      return
    }
    const total = totalOf(m)
    // (from where its last hold of the pose begins: back past the settle to rest
    // it ends on, then to the frame before that hold)
    let skip = 0
    if (before === this.ninja.cheer.pose) {
      const back = (f: number): number => Math.round((f - FRAME) * 10) / 10
      let f = frameTime(total - FRAME / 2)
      while (f >= 0 && poseAt(m, f).pose !== before) f = back(f)
      while (f >= 0 && poseAt(m, f).pose === before) f = back(f)
      if (f >= 0) skip = Math.round((f + FRAME) * 10) / 10
    }
    if (skip > total - 0.5) skip = 0
    this.move = { m, index: CHEER_INDEX, start: from - skip, total, kind: 'cheer', hit: Infinity }
  }

  // how long the cheer lasts
  private cheerLength(): number {
    const m = this.reduced ? undefined : playOf(this.ninja.id, CHEER_INDEX)
    return m ? totalOf(m) : CHEER
  }

  // the flash showing now (not one still to come)
  private showing(): Flash | null {
    const f = this.flash
    return f && f.from <= this.t && this.t < f.until ? f : null
  }

  // how long nobody has been about: nothing running, nothing waiting on you
  private idleFor(): number {
    return this.working || this.alertUntil > this.t ? 0 : this.t - this.lastActivity
  }

  private dozing(): boolean {
    return this.idleFor() > SLEEP_AFTER
  }

  // the drowsy window before the nap (never for a ninja who does not sleep)
  private drowsyFor(): number {
    return this.ninja.insomniac ? -1 : this.idleFor() - (SLEEP_AFTER - DROWSY)
  }

  // nothing playing or showing, nobody called, awake, breathed out, and the hello said
  private free(): boolean {
    return !this.move && this.alertUntil <= this.t && this.introAt === 0 && !this.showing() && !this.dozing() && this.t >= this.settleUntil
  }

  // the post's smoke from the last move has cleared, for a jutsu to begin
  private cleared(): boolean {
    return this.t >= this.postEnd + CHAIN - 1e-9
  }

  private gap(): number {
    for (const [under, gap] of GAPS) if (this.inTurn < under) return gap
    return TIRED
  }

  // a move as the renderer finds it (playOf: a jutsu of the set, the quick
  // strike, the arrival), from now
  private play(index: number, kind: Playing['kind'], by: string | null = null): Move | null {
    const m = playOf(this.ninja.id, index)
    if (!m) return null
    const atPost = kind === 'jutsu' || kind === 'quick'
    this.move = { m, index, start: this.t, total: totalOf(m), kind, hit: hitsOf(m)[0]?.at ?? shoutSpan(m)[0], by, ...(atPost && this.postUp ? { postUp: true } : {}) }
    // a jutsu in a working turn puts the post up for the rest of it
    if (atPost && this.working) {
      this.postUp = true
      this.postOutAt = -Infinity
    }
    return m
  }

  // The turn is over (or the ninja changes): the post leaves, in the poof
  // out of the jutsu in hand, else in a poof of its own now
  private postLeaves(): void {
    if (!this.postUp) return
    this.postUp = false
    const mv = this.move
    if (!mv || (mv.kind !== 'jutsu' && mv.kind !== 'quick')) this.postOutAt = this.t
  }

  // whether `index` is the jutsu just played, a minute ago at most
  private recent(index: number): boolean {
    return index === this.lastIndex && this.t - this.jutsuAt < RECENT
  }

  // a jutsu of the ninja's set, never the one just played; `counted` toward
  // the turn's tiredness, wanted `by` a call
  private start(index: number, counted = true, by: string | null = null): boolean {
    const set = movesOf(this.ninja.id)
    if (this.reduced || set.length === 0) return false
    if (this.recent(index) && set.length > 1) index = this.nextInTurn()
    if (index < 0 || index >= set.length || !this.play(index, 'jutsu', by)) return false
    this.jutsuAt = this.t
    this.lastIndex = index
    if (index === this.signature()) this.signatureAt = this.t
    if (counted && this.working) this.inTurn++
    return true
  }

  // the next move in turn, not the one just played nor any of `avoid` (if
  // that leaves one)
  private nextInTurn(...avoid: number[]): number {
    const n = movesOf(this.ninja.id).length
    if (n <= 1) return 0
    for (const skip of [[this.lastIndex, ...avoid], [this.lastIndex]])
      for (let k = 0; k < n; k++) {
        const i = (this.rotation + k) % n
        if (!skip.includes(i)) {
          this.rotation += k + 1
          return i
        }
      }
    return 0
  }

  // the jutsu a kind of work calls for: a command the signature (or, so soon
  // after it, the next in turn), a subagent the one made for it (else the next
  // in turn); an edit has its quick strike, and the rest call none
  private pick(kind: ToolKind): number | null {
    const set = movesOf(this.ninja.id)
    if (set.length === 0) return null
    if (kind === 'shell') {
      const sig = this.signature()
      return this.t - this.signatureAt < SIGNATURE_REST ? this.nextInTurn(sig) : sig
    }
    if (kind === 'agent') {
      const made = set.findIndex(m => m.on?.includes('agent'))
      return made >= 0 && !this.recent(made) ? made : this.nextInTurn()
    }
    return null
  }

  // the signature jutsu, the one a command calls
  private signature(): number {
    return Math.max(0, movesOf(this.ninja.id).findIndex(m => m.on?.includes('shell')))
  }

  // a jutsu the work calls for (`by` a call): now if its turn has come, else
  // the next to play; none in quiet mode or out of sight
  private want(index: number | null, by: string | null = null): void {
    if (index === null || this.reduced || this.quiet || this.hidden) return
    if (this.free() && this.t - this.jutsuAt >= this.gap() && this.cleared()) this.start(index, true, by)
    else {
      this.queued = { index, by }
      // a breath out under way waits for the post's smoke to clear
      if (this.t < this.settleUntil) this.settleUntil = Math.max(this.settleUntil, this.postEnd + CHAIN)
    }
  }

  // an edit's quick strike (`by` its call), if the ninja is free, the post's
  // smoke has cleared and it has not struck lately; it never waits, and does
  // not tire the ninja
  private strike(by: string): void {
    if (this.reduced || this.quiet || this.hidden || !this.free() || !this.cleared() || this.t - this.quickAt < QUICK_EVERY) return
    // a jutsu waiting its turn, due before the strike and its smoke are done, goes first
    if (this.queued !== null && this.jutsuAt + this.gap() - this.t < STRIKE_CLEAR) return
    if (this.play(QUICK_INDEX, 'quick', by)) this.quickAt = this.t
  }

  setNinja(n: Ninja): void {
    this.move = null
    this.postLeaves()
    this.ninja = n
    this.queued = null
    this.cheerDue = 0
    this.lastIndex = -1
    this.signatureAt = -Infinity
    this.settleUntil = 0
    this.postEnd = -Infinity
    if (this.flash?.kind !== 'startle') this.flash = null
    this.activity()
    if (this.reduced) {
      this.cheer()
      this.introAt = 0
      return
    }
    // a puff of smoke and a landing, the cheer, a breath, then the signature
    // jutsu to show what they can do (not in quiet mode)
    const arrival = this.play(ARRIVAL_INDEX, 'arrival')
    if (!arrival) this.cheer()
    this.introAt = this.quiet ? 0 : this.t + (arrival ? totalOf(arrival) : 0) + this.cheerLength() + INTRO_CHAIN
  }

  // `/ninja jutsu`: one of the set (the next in turn if none is named) now,
  // whatever else was due; the move, or null if there is no such one
  perform(index?: number): Move | null {
    const i = index ?? this.nextInTurn()
    const m = movesOf(this.ninja.id)[i]
    if (!m) return null
    this.activity()
    if (this.reduced) return m
    this.introAt = 0
    if (this.flash?.kind !== 'startle') this.flash = null
    this.play(i, 'jutsu')
    this.jutsuAt = this.t
    this.lastIndex = i
    if (i === this.signature()) this.signatureAt = this.t
    return m
  }

  // what the spinner shouts now: the beat's own words, or the jutsu's short
  // name at its climax (the spinner adds the "!"); never for an arrival, a
  // cheer or a fizzle
  shout(): string | null {
    const mv = this.move
    if (!mv || this.reduced || (mv.kind !== 'jutsu' && mv.kind !== 'quick')) return null
    const s = shoutAt(mv.m, frameTime(this.t - mv.start))
    return s ? s.replace(/!+$/, '') || null : null
  }

  // whether Claude needs you now: the red "!" is up
  calling(): boolean {
    return this.alertUntil > this.t
  }

  // what the desktop says the picture shows
  caption(): string {
    if (this.move && (this.move.kind === 'jutsu' || this.move.kind === 'quick')) return `${this.ninja.name}, ${this.move.m.name}`
    if (this.calling()) return `${this.ninja.name}, Claude needs you`
    return this.ninja.name
  }

  setWorking(on: boolean): void {
    if (on) this.activity()
    else {
      this.thinking = false
      this.postLeaves()
    }
    this.working = on
  }

  setThinking(on: boolean): void {
    this.thinking = on
  }

  // You typed: whatever was waiting on you has its answer, and a sleeper wakes
  // with a start (one who never sleeps just looks up). A new turn (`turn`, not
  // a slash command) clears the ✓ and the ninja's tiredness.
  prompt(turn = true): void {
    const asleep = this.dozing()
    this.activity()
    this.endAlert()
    this.cueAt = 0
    if (turn) {
      this.done = false
      this.failed = false
      this.inTurn = 0
      this.cheerDue = 0
      if (this.flash?.kind === 'cheer' && this.flash.from > this.t) this.flash = null
    }
    if (asleep && !this.ninja.insomniac) {
      // the start, then a groggy moment, the lids half shut
      this.flashOf('wake', 'surprised', 'alert', null, WAKE + GROGGY)
      this.blinkAt = Math.max(this.blinkAt, grid(this.t + 1))
    }
  }

  // A call starts; `agentId` is the subagent's that makes it, absent for
  // Claude's own; `input` its arguments, for a permission dialog to find it by.
  toolStart(id: string, tool: string, agentId?: string, input?: unknown): void {
    const kind = toolKind(tool)
    const main = agentId === undefined
    this.calls.set(id, { tool, kind, main, agent: agentId, input: fingerprint(input), start: this.t })
    if (!main) return
    this.activity()
    // Claude moves on from whatever failed before
    this.failed = false
    this.lastTool = { kind, until: this.t + 1 }
    if (ASKS.test(tool)) this.alert(id)
    else if (PEEKS.test(tool)) return
    else if (kind === 'edit' || kind === 'shell') this.strike(id)
    else this.want(this.pick(kind), id)
  }

  toolEnd(id: string, failed: boolean): void {
    const call = this.calls.get(id)
    this.calls.delete(id)
    if (id === this.askedBy) this.endAlert()
    if (!call?.main) return
    this.failed = failed && fails(call)
    if (!this.failed) return
    // the jutsu it called is never played
    if (this.queued?.by === id) this.queued = null
    // the jutsu it called, in hand, fizzles (the charge breaks apart in the
    // hand, the post smokes out): at once before its blow lands; after, where
    // its recovery would begin, and then from the fizzle's slump (its blow
    // landed: the seals and the charge breaking are never played over it, as
    // a second jutsu failing). Another call's plays out, and the slump follows it.
    const mv = this.move
    let from = this.t
    if (mv && (mv.kind === 'jutsu' || mv.kind === 'quick') && mv.by === id) {
      const into = this.t - mv.start
      const recover = -sinceOf(mv.m, 0, 'recover')
      if (into >= mv.hit && recover > into) {
        mv.total = Math.min(mv.total, recover)
        mv.cut = true
        from = mv.start + mv.total + this.fizzleLength(true)
      } else from = this.fizzle(this.t, into >= mv.hit)
    } else if (mv) from = mv.start + mv.total + (mv.cut ? this.fizzleLength(true) : 0)
    // then the slump and the sweat drop
    this.cheerDue = 0
    this.flashOf('frown', 'worried', 'slump', 'error', FROWN, from)
  }

  // The fizzle of a jutsu cut short from `at`, as moves.ts plays it (with
  // reduced motion the jutsu just ends); `late`, after its blow landed, from
  // the fizzle's slump on; when it is over
  private fizzle(at: number, late = false): number {
    const m = this.reduced ? undefined : playOf(this.ninja.id, FIZZLE_INDEX)
    const skip = m ? this.slumpOf(m, late) : 0
    this.postEnd = at
    // (its smoke takes the post off)
    this.postUp = false
    this.move = m ? { m, index: FIZZLE_INDEX, start: at - skip, total: totalOf(m), kind: 'fizzle', hit: Infinity } : null
    return at + (m ? totalOf(m) - skip : 0)
  }

  // where a late fizzle starts: its slump beat (all of it, if it has none)
  private slumpOf(m: Move, late: boolean): number {
    const at = late ? -sinceOf(m, 0, SLUMP) : 0
    return Number.isFinite(at) && at > 0 && at < totalOf(m) ? at : 0
  }

  private fizzleLength(late = false): number {
    const m = this.reduced ? undefined : playOf(this.ninja.id, FIZZLE_INDEX)
    return m ? totalOf(m) - this.slumpOf(m, late) : 0
  }

  // a call is running (its progress row is drawn): if a dialog asked about
  // it, you have answered
  running(id: string): void {
    if (id !== this.askedBy) return
    this.endAlert()
    // its wait at the dialog was not time running: its jutsu (and a long
    // call's next) counts from now
    const call = this.calls.get(id)
    if (call) call.start = this.t
  }

  // A permission dialog opened for a call of `tool`, made with `input` by the
  // subagent `agentId` (absent for Claude's own): it waits on that very call
  // (the latest such, if several are alike), else the latest of the tool's.
  permission(tool: string, input?: unknown, agentId?: string): void {
    const want = input === undefined ? null : fingerprint(input)
    let asker: string | undefined
    let best = -1
    for (const [id, call] of this.calls) {
      if (call.tool !== tool) continue
      const score = (call.agent === agentId ? 1 : 0) + (want !== null && call.input === want ? 2 : 0)
      if (score >= best) {
        best = score
        asker = id
      }
    }
    this.alert(asker)
  }

  // Claude needs you: the jutsu stops (the post smokes out under the start)
  // and the "!" holds until you answer (the call asked about ends, you type,
  // the turn ends); with no call to wait on, for `seconds` at most
  private alert(askedBy?: string, seconds = 600): void {
    // a hello cut short still owes its signature
    if (this.move?.kind === 'arrival' && !this.quiet) this.introAt = this.t
    const mv = this.move
    if (mv && (mv.kind === 'jutsu' || mv.kind === 'quick')) this.dispel()
    else if (mv?.kind !== 'dispel') this.move = null
    this.cheerDue = 0
    this.alertUntil = askedBy ? Infinity : this.t + seconds
    this.askedBy = askedBy ?? null
    this.flashOf('startle', 'surprised', 'alert', 'alert', STARTLE)
    this.blinkAt = Math.max(this.blinkAt, grid(this.t + 1))
    this.activity()
  }

  // A jutsu cut off by a call for you: the post smokes out under the start,
  // as moves.ts's dispel plays it (with reduced motion it just ends), and its
  // smoke clears a second after
  private dispel(): void {
    const m = this.reduced ? undefined : playOf(this.ninja.id, DISPEL_INDEX)
    // (its smoke takes the post off)
    this.postUp = false
    this.move = m ? { m, index: DISPEL_INDEX, start: this.t, total: totalOf(m), kind: 'dispel', hit: Infinity } : null
    this.postEnd = this.t + (m ? totalOf(m) : 0)
  }

  private endAlert(): void {
    this.alertUntil = 0
    this.askedBy = null
    if (this.flash?.kind === 'startle') this.flash = null
  }

  // Claude's turn ended (an answer, or not); subagents left running keep their
  // calls. An answer gets the ✓, and a cheer unless its last command failed.
  turnEnd(answered: boolean): void {
    for (const [id, call] of this.calls) if (call.main) this.calls.delete(id)
    this.thinking = false
    this.queued = null
    this.postLeaves()
    // the turn is over, so nothing it asked still waits
    this.endAlert()
    this.activity()
    if (answered) {
      this.answeredAt = this.t
      this.done = true
    }
    if (answered && !this.failed) {
      // a cheer once the move in hand is done (none over one under way, nor
      // over a hello, which cheers anyway), and a softer one if nobody replies
      if (this.move?.kind !== 'cheer' && this.move?.kind !== 'arrival') {
        if (this.move) this.cheerDue = this.move.start + this.move.total
        else this.cheer(this.t, this.state().pose)
      }
      // (none in quiet mode, nor out of sight)
      this.cueAt = this.quiet || this.hidden ? 0 : grid(this.t + CUE_AFTER)
    } else this.cueAt = 0
    this.failed = false
  }

  // the main agent's long call running that may call a jutsu (not the one
  // waiting on you), if there is one
  // the main agent's command that has run SHELL_JUTSU and not yet called its jutsu
  private slowShell(): string | null {
    for (const [id, call] of this.calls)
      if (call.main && call.kind === 'shell' && !call.called && id !== this.askedBy && this.t - call.start >= SHELL_JUTSU && !PEEKS.test(call.tool)) return id
    return null
  }

  private longCall(): string | null {
    for (const [id, call] of this.calls)
      if (call.main && id !== this.askedBy && this.t - call.start >= LONG && (call.kind === 'shell' || call.kind === 'agent') && !PEEKS.test(call.tool)) return id
    return null
  }

  // the main agent's latest call in flight, or the last one for a moment after it starts
  private kind(): ToolKind | null {
    let running: ToolKind | null = null
    for (const call of this.calls.values()) if (call.main) running = call.kind
    return running ?? (this.lastTool && this.lastTool.until > this.t ? this.lastTool.kind : null)
  }

  // what the work calls for now: the pondering (reads, searches, thinking out
  // loud), the hand signs, or nothing
  private work(): 'think' | 'signs' | 'idle' {
    const kind = this.kind()
    if (kind === 'read' || kind === 'search' || (!kind && this.working && this.thinking)) return 'think'
    if (kind || this.working) return 'signs'
    return this.thinking ? 'think' : 'idle'
  }

  private view(): View {
    const t = this.t
    if (this.move) return 'move'
    if (this.dozing()) return 'sleep'
    if (this.alertUntil > t) return 'alert'
    if (this.showing()) return 'flash'
    if (t < this.settleUntil) return 'settle'
    const work = this.work()
    // the body keeps its working pose a while before it swaps
    const h = this.held
    if (h && work !== 'idle' && work !== h.view && t - h.from < HOLD_POSE - 1e-9) return h.view
    return work
  }

  update(dt: number): void {
    // a long step (a slow tick) moves a jutsu on by a few frames at most
    if (this.move && dt > MOVE_STEP) this.move.start += dt - MOVE_STEP
    this.t += dt
    const t = this.t
    if (t - this.blinkAt >= BLINK.length * FRAME) this.blinkAt = grid(t + 2.2 + this.rng.next() * 3.4)
    if (t > this.gazeAt) {
      // glance somewhere, mostly back to you, never to an eye that is hidden
      const r = this.rng.next()
      this.gaze = r < 0.45 ? [0, 0] : r < 0.65 ? [-0.8, 0.1] : r < 0.85 ? [0.8, 0.1] : [0, 0.5]
      if ((this.gaze[0] > 0 && hidesRight(this.ninja.id)) || this.reduced) this.gaze = [0, 0]
      this.gazeAt = grid(t + 1.4 + this.rng.next() * 3)
    }
    if (this.flash && this.flash.until <= t) this.flash = null
    if (this.move && t - this.move.start >= this.move.total) {
      const ended = this.move
      const end = ended.start + ended.total
      this.move = null
      if (ended.kind === 'jutsu' || ended.kind === 'quick') this.postEnd = end
      if (ended.cut) {
        // a jutsu cut short by a failure after its blow: the fizzle's slump
        this.fizzle(end, true)
      } else if (ended.kind === 'arrival') {
        // the landing leads into the cheer, unless a failure came meanwhile
        if (!this.flash) this.cheer(end, poseAt(ended.m, frameTime(Math.max(0, ended.total - FRAME / 2))).pose)
      } else if (ended.kind === 'jutsu' || ended.kind === 'quick') {
        // unless the cheer or a slump follows, a breath out before the hands go
        // back to work: a longer one if a jutsu waits, so the post's smoke clears
        // (the cheer itself ends at rest, and a fizzle hands over to the slump)
        if (this.cheerDue > 0) this.cheerDue = Math.min(this.cheerDue, end)
        else if (!this.flash) {
          this.settleFrom = end
          this.settleUntil = end + (this.queued ? CHAIN : SETTLE)
        }
      } else if (ended.kind === 'cheer' && this.introAt > 0 && !this.flash) {
        // a hello's cheer done: a breath out at once, then the signature
        this.settleFrom = end
        this.settleUntil = end + SETTLE
      }
      // the cheer owed once this move was done, from its very end
      if (this.cheerDue > 0 && t >= this.cheerDue) {
        const at = this.cheerDue
        this.cheerDue = 0
        if (this.alertUntil <= t && !this.dozing()) this.cheer(at, ended.kind === 'cheer' ? undefined : poseAt(ended.m, frameTime(Math.max(0, ended.total - FRAME / 2))).pose)
      }
    }
    if (this.cheerDue > 0 && !this.move && t >= this.cheerDue) {
      // (a cheer owed with nothing left to wait on)
      this.cheerDue = 0
      if (this.alertUntil <= t && !this.dozing()) this.cheer()
    }
    if (this.dozing()) this.done = false
    if (this.cueAt > 0 && t >= this.cueAt) {
      // an answer has waited a minute: a soft cue, the cheer's pose held a
      // moment with no leap, no badge of its own
      this.cueAt = 0
      if (!this.move && !this.showing() && !this.working && this.alertUntil <= t && !this.dozing() && !this.quiet && !this.hidden)
        this.flashOf('cheer', this.ninja.cheer.mood, this.ninja.cheer.pose, null, CHEER)
    }
    if (this.introAt > 0) {
      // the new ninja's signature jutsu, after the hello; forgotten if it nods off first
      if (this.dozing() || this.reduced) this.introAt = 0
      else if (t >= this.introAt && !this.move && this.alertUntil <= t && !this.showing()) {
        this.introAt = 0
        this.start(this.signature(), false)
      }
    } else if (this.working) {
      // a command still running after SHELL_JUTSU calls its jutsu, once
      const slow = this.slowShell()
      if (slow !== null) {
        this.calls.get(slow)!.called = true
        this.want(this.pick('shell'), slow)
      }
      // the jutsu the work called for, once its turn comes and the post's smoke
      // has cleared; and now and then another through a long call
      if (this.queued !== null) {
        if (this.free() && t - this.jutsuAt >= this.gap() && this.cleared()) {
          const { index, by } = this.queued
          this.queued = null
          this.start(index, true, by)
        }
      } else if (this.free() && t - this.jutsuAt >= Math.max(REPEAT, this.gap())) {
        const long = this.longCall()
        if (long !== null) this.want(this.nextInTurn(), long)
      }
    } else if (t >= this.trainAt && this.free() && !this.quiet && !this.hidden && t - this.answeredAt >= AFTER_ANSWER) {
      // and now and then while you are away from the keyboard, a little training
      this.trainAt = t + TRAIN_NEXT + this.rng.next() * TRAIN_SPREAD
      this.start(this.nextInTurn(), false)
    }
    const view = this.view()
    // the working pose shown, and since when
    if (view === 'signs' || view === 'think') {
      if (this.held?.view !== view) this.held = { view, from: t }
    } else this.held = null
    // the working loop's phrases, from when it began to show
    this.signs.advance(t, view === 'signs', () => Math.floor(this.rng.next() * 4294967296))
  }

  // The working loop at `t` (signs.ts); in quiet mode the hands hold one
  // sign, just breathing, and with reduced motion one sign, still.
  private signsAt(t: number): Signs {
    if (this.reduced) return { pose: 'signs', bob: 0 }
    if (this.quiet) return { pose: 'signs', bob: null }
    return this.signs.at(t)
  }

  // How long until the picture may change, in milliseconds: a move's next
  // frame; else the next blink frame, glance, breath, sign or badge frame, or
  // whatever is due (a jutsu's turn, a cue, a nap), a second at most. The
  // wake lands a millisecond past the change, so the seconds summed step by
  // step are past it too and the change is drawn, never a wait later.
  tickMs(): number {
    const t = this.t
    const clamp = (ms: number): number => Math.min(SLOW, Math.max(FLOOR_MS, ms))
    if (this.move) {
      // on the move's own frames
      const into = t - this.move.start
      const next = (Math.floor(into / FRAME + 1e-6) + 1) * FRAME
      return Math.min(FAST, clamp(Math.ceil((next - into) * 1000) + 1))
    }
    const view = this.view()
    // the working loop's phrases begin at the update that first shows it
    if (view === 'signs' && !this.signs.on && !this.reduced) return FAST
    // asleep, the z drifts and the breath turns on the second; else a second
    // from now at most, unless something changes sooner
    let next = view === 'sleep' ? Math.floor(t) + 1 : t + SLOW / 1000
    const soon = (at: number): void => {
      if (at > t - 1e-9 && at < next) next = at
    }
    // nodding off: each step of the doze as it comes
    if (view === 'sleep' && !this.ninja.insomniac && !this.reduced) for (const at of DOZE_STEPS) soon(this.lastActivity + SLEEP_AFTER + at + 1e-3)
    if (view !== 'sleep') {
      const f = this.flash
      if (f) {
        soon(f.from)
        soon(f.until)
        if (f.kind === 'wake') for (const at of WAKE_STEPS) soon(f.from + at)
      }
      // the post's last poof as the turn ends, a frame each
      soon(this.postOutAt + FRAME)
      soon(this.postOutAt + 2 * FRAME)
      if (this.cheerDue > 0) soon(this.cheerDue)
      if (this.introAt > 0) soon(this.introAt)
      soon(this.settleUntil)
      soon(this.settleFrom + SETTLE)
      if (this.lastTool) soon(this.lastTool.until)
      if (this.cueAt > 0) soon(this.cueAt)
      if (this.alertUntil > t) soon(this.alertUntil)
      if (this.held) soon(this.held.from + HOLD_POSE)
      if (this.working) {
        if (this.queued) {
          soon(this.jutsuAt + this.gap())
          soon(this.postEnd + CHAIN)
        }
        soon(this.jutsuAt + Math.max(REPEAT, this.gap()))
        for (const call of this.calls.values())
          if (call.main) {
            soon(call.start + LONG)
            if (call.kind === 'shell' && !call.called) soon(call.start + SHELL_JUTSU)
          }
      } else {
        soon(this.trainAt)
        const drowse = this.lastActivity + SLEEP_AFTER - DROWSY
        if (!this.ninja.insomniac) {
          soon(drowse)
          for (const [until] of NODDING) soon(drowse + until)
        }
        soon(this.lastActivity + SLEEP_AFTER + 1e-3)
      }
      if (!this.reduced) {
        soon(this.blinkAt)
        for (let k = 1; k <= BLINK.length; k++) soon(this.blinkAt + k * FRAME)
        // (the "!" looks straight out, the hand signs breathe in their own time,
        // and only a ninja at rest crosses their arms now and then)
        if (view !== 'alert') soon(this.gazeAt + 1e-3)
        if (view !== 'signs' || this.quiet || this.signs.waiting) soon((Math.floor(t * BREATH) + 1) / BREATH)
        if (view === 'idle') soon((Math.floor(t / 11) + 1) * 11)
        if (this.thinking || view === 'think') soon((Math.floor(t / DOTS + 1e-6) + 1) * DOTS)
        if (view === 'signs' && this.signs.on && !this.quiet) this.signs.edges(soon)
      }
    }
    return clamp(Math.ceil((next - t) * 1000) + 1)
  }

  // the moment as the scene draws it
  state(): ChibiState {
    const t = this.t
    const kind = this.kind()
    const sensing = kind === 'read' || kind === 'search'
    const view = this.view()
    let mood: Mood = 'calm'
    let pose: Pose = Math.floor(t / 11) % 3 === 2 ? 'crossed' : 'idle'
    let badge: Badge | null = this.done ? 'done' : null
    let gaze: [number, number] = this.gaze
    let aura = 0
    let active = sensing && this.ninja.dojutsu === true && !this.ninja.readsCovered
    let move: ChibiState['move'] = null
    // null: the breath, and the blinks
    let bob: number | null = null
    let blink: number | null = null
    let wake: number | undefined
    let doze: number | undefined
    if (view === 'move' && this.move) {
      // the move sets the body, the face and the glow; only the "!" shows over
      // it (and the ✓ over the cheer)
      const mv = this.move
      const mt = frameTime(t - mv.start)
      const f = poseAt(mv.m, mt)
      pose = f.pose
      mood = f.mood
      gaze = [f.gaze[0], f.gaze[1]]
      aura = f.aura
      active = mv.m.dojutsu !== false
      move = { index: mv.index, t: mt }
      badge = this.calling() ? 'alert' : mv.kind === 'cheer' && this.done ? 'done' : null
      if (mv.kind === 'cheer') {
        // the ninja's own face for it, eyes as they are
        if (f.mood === 'focus') mood = this.ninja.cheer.mood
        active = mv.m.dojutsu === true
      }
      bob = 0
      blink = 0
    } else if (view === 'sleep') {
      gaze = [0, 0]
      if (this.ninja.insomniac) {
        // Gaara never sleeps: he sits, arms folded, calm, eyes open, a slow breath
        pose = 'sleep'
        mood = 'calm'
        badge = null
        blink = 0
      } else {
        mood = 'sleep'
        badge = 'sleep'
        pose = 'sleep'
        blink = 1
        // nodding off: the yawn, the sit, the puff that brings the cap on
        const into = this.idleFor() - SLEEP_AFTER
        const step = this.reduced ? -1 : DOZE_STEPS.findIndex(at => into < at - 1e-9)
        if (step >= 0) {
          doze = step
          if (step < DOZE_Z) badge = null
        }
      }
      bob = this.reduced || doze !== undefined ? 0 : Math.floor(t * SLEEP_BREATH) % 2
    } else if (view === 'alert') {
      // the start, then a calm wait with the "!" up
      const startle = this.showing()?.kind === 'startle'
      mood = startle ? 'surprised' : 'calm'
      pose = startle ? 'alert' : 'idle'
      badge = 'alert'
      gaze = [0, 0]
      if (startle) bob = 0
    } else if (view === 'flash' && this.flash) {
      const flash = this.flash
      mood = flash.mood
      pose = flash.pose
      badge = flash.badge ?? badge
      if (flash.kind === 'wake' && t - flash.from >= WAKE - 1e-9) {
        // woken, a groggy moment before the work: at rest, the lids half shut
        mood = 'calm'
        pose = 'idle'
        blink = 0.5
      }
      if (flash.kind === 'wake' && !this.reduced) {
        const into = t - flash.from + 1e-9
        const step = WAKE_STEPS.findIndex(at => into < at)
        if (step >= 0) wake = step
      }
      if (flash.kind === 'wake' || this.reduced) bob = 0
    } else if (view === 'settle') {
      // a breath out after a move, then breathing while the post's smoke clears
      pose = 'idle'
      mood = this.working ? 'focus' : 'calm'
      if (t - this.settleFrom < SETTLE) bob = 1
    } else if (view === 'signs' || view === 'think') {
      // the badge says what Claude is at now, whatever the body still holds
      const work = this.work()
      badge = work === 'think' ? (sensing ? kind : 'think') : kind
      if (view === 'signs') {
        mood = 'focus'
        const s = this.signsAt(t)
        pose = s.pose
        bob = s.bob
        if (s.gaze) gaze = s.gaze
        if (s.aura !== undefined) aura = s.aura
        if (kind === 'edit' && pose !== 'crossed') gaze = [0.2, 0.7]
      } else {
        pose = 'think'
        if (sensing) {
          // pondering what Claude reads
          mood = 'focus'
          gaze = [this.gaze[0] * 0.6, 0.3]
        } else {
          // a look up while it thinks out loud
          gaze = [-0.6, -0.8]
        }
      }
    } else if (this.drowsyFor() > 0) {
      // drowsy: the lids heavy, a slow breath, two slow nods
      const d = this.drowsyFor()
      const [, lids, sink] = NODDING.find(([until]) => d < until) ?? NODDING[NODDING.length - 1]!
      blink = lids
      bob = this.reduced ? 0 : sink
      gaze = [0, 0.3]
    }
    // a blink: half shut, shut, half shut, a frame each
    const since = t - this.blinkAt
    blink ??= this.reduced || since < 0 || since >= BLINK.length * FRAME ? 0 : BLINK[Math.min(BLINK.length - 1, Math.floor(since / FRAME + 1e-9))]!
    // the breath, a pixel down and up while standing still
    bob ??= this.reduced ? 0 : Math.floor(t * BREATH) % 2
    // the post through the turn: in a move, standing before it (its poof in
    // skipped) and staying after (its poof out skipped); at rest, standing;
    // its last poof as the turn ends, over whatever shows
    const mv = view === 'move' ? this.move : null
    const atPost = mv !== null && (mv.kind === 'jutsu' || mv.kind === 'quick')
    const postUp = mv ? mv.postUp === true : this.postUp
    const postStays = atPost && this.postUp
    const out = t - this.postOutAt
    const postOut = out >= -1e-9 && out < 2 * FRAME - 1e-9 ? Math.floor(out / FRAME + 1e-6) : undefined
    return {
      ...(postUp ? { postUp } : {}),
      ...(postStays ? { postStays } : {}),
      ...(postOut !== undefined ? { postOut } : {}),
      ...(wake !== undefined ? { wake } : {}),
      ...(doze !== undefined ? { doze } : {}),
      id: this.ninja.id,
      face: { blink, gaze, mood, active },
      aura: Math.round(aura * 4) / 4,
      badge,
      // the thinking dots every 0.3 s; the sleeper's z drifting up a pixel a
      // second, as often as a sleeping ninja's clock ticks
      tick: this.reduced ? 0 : badge === 'think' ? Math.floor(t / DOTS + 1e-6) % 3 : badge === 'sleep' ? Math.floor(t) % 3 : 0,
      pose,
      bob,
      move,
    }
  }
}

// a stable text key for a state, so equal frames are drawn once
export const keyOf = (s: ChibiState): string =>
  `${s.id}|${s.pose}|${s.bob}|${s.face.blink}|${s.face.gaze[0]},${s.face.gaze[1]}|${s.face.mood}|${s.face.active ? 1 : 0}|${s.aura}|${s.badge ?? '-'}|${s.tick}|${s.move ? `${s.move.index}@${s.move.t}` : '-'}|${s.postUp ? 'P' : ''}${s.postStays ? 'S' : ''}${s.postOut ?? ''}|${s.wake ?? ''}|${s.doze ?? ''}`
