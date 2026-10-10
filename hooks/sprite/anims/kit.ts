// The choreographer's shorthand for writing moves as cels (types.ts's Cel),
// hand-keyed at 10 fps, and the shared motion every ninja's moves are made of.
//
//   c(n, tag, k, o)        a cel held n frames, in beat `tag`, the ninja k
//   K(pose, o)             the ninja in a pose, at home unless o.x says
//   awake(o)               o with the dojutsu awake: K('charge', awake({ x: 30 }))
//   fx(name, f, at, o)     an effect: frame f (or 'cycle'), anchored at `at`
//   dustAt(f, x)           grit kicked up off the ground at column x
//   smokeAt(f)             the post's poof, frame f, on the ground at the post
//   postIn(tag, ks)        the post poofing in over the first two of ks's frames
//   postOut(tag, ks)       and poofing out over the last two: the cloud, two wisps
//   hold(n, tag, k, o)     a MOVING hold: n frames of one pose that stir or breathe
//   runIn(tag, o)          the run at the post: rock back, the smear, (the blow)
//   hopHome(tag, x, post)  the hop home after a blow: up 3, 6, 6, 3 px, landing squash
//                          (its air poses your own: a backflip, a cannonball, a spin;
//                          { style: 'skip' | 'heavy' | 'flicker' } its own landing)
//   leap(tag, k, o)        a leap in place (the cheer's): up 3, 5, 5, 3 px, squash
//   homeFrom(x, more)      a run of small hops home (taijutsu)
//   cast({ gather, release, impact, settle, k, at, weight, recoil })
//                          a caster planted while the effect works, with weight:
//                          sink and draw back, step in (overshoot), recoil, home;
//                          weight 'light' | 'heavy' | 'stoic', recoil 'impact' |
//                          'release' (ranged jutsu) | false
//   hop(x, lift)           the ninja tucked in the air
//   calls(m, own)          beats of a move that shout lines of their own
//
// ------------------------------------------------------------------------
// HOW TO WRITE A MOVE
//
// A cel is c(frames, beat, K(pose, {...}), { post, fx, ... }):
//   - K's pose is a template pose ('sign1', 'strike') or a companion pose
//     ('slam', 'crossed') that the template's map draws with the nearest pose
//     until one is drawn for it; x is the root column (HOME 35 at rest,
//     STRIKE 26 at the post), lift/dy move it up/down, hdx/hdy nudge the head
//     (a seal snapping in dips it a pixel), eyes set the face, and awake
//     (or K(pose, awake({...}))) wakes the dojutsu: its head and eye.
//   - post is the post's frame for the cel (null or left out: no post);
//     postIn/postOut poof it in and out (two frames of smoke each).
//   - fx are effects (fx/index.ts), anchored on 'hand', 'feet', 'head', 'post'
//     or a stage pixel, 'cycle' to flicker through a family's frames.
//   - the beat (tag) names what the companion sees: 'impact' where a blow
//     lands, 'recover' where a jutsu cut short stops, a launch ('dash',
//     'slam') before the first blow for the shout. A blow's first frame is
//     held two frames (hit-stop).
//   - flash: 'post' (the post white) or 'rim' (a white rim round the ninja,
//     their body kept, its edge lit toward their chakra; 'silhouette' is
//     drawn the same) for a blow's or a gate's one-frame flash; never tint
//     the whole stage for a flash (the ninja turns to a ghost with it, which
//     reads as a glitch).
//   - THE POST THROUGH A TURN. In a working turn the post goes up with the
//     first jutsu and stays: the engine skips a move's poof in and poof out
//     (the cels postIn/postOut tag `poof`) and draws the post standing. Tag
//     a hand-rolled poof `poof: 'in'`/'out' too. A poof in that brings the
//     post other than plain standing (scarred, hauled) still plays; a post
//     left damaged or hauled at the poof out is renewed in one puff; a move
//     that does away with the post without a poof out (Kamui) gets a new
//     post poofed in over its last two frames.
//   - fx(..., { pal: 'chakra' }) draws any effect in the ninja's own chakra
//     colour (their glow), its light and dark kept: the fizzle's sparks.
// Every frame of a jutsu should differ from the ninja at rest (a post, a
// puff, an effect), so a frame of it is never mistaken for standing still.
//
// MOTION. Snaps, not tweens, but never a dead drawing:
//   - NO STILL HOLDS. A body held one drawing for 6 frames or more while only
//     an effect plays reads as stiff. Write it as hold(n, tag, K(pose), o):
//     the same cel options on every frame (or o as (i) => options), and the
//     body keeps alive. Where the ninja has a drawing named `<pose>Wind`
//     (sign2Wind, crossedWind, chargeWind: the hair, a sleeve, a cloak's hem
//     stirring, on the pose's own root and feet row; in the template, or as a
//     ninja's own pose) the pose and it alternate every two frames, and the
//     breath plays under it: frames 2-5 of every 8 the head sinks a pixel
//     (the pose's `breath` drawing on its non-Wind frames of those), so a
//     hold of four frames breathes once too. Without
//     a Wind the pose breathes every other two frames (2 plain, 2 breath:
//     its `breath` drawing, the one the companion's rest breath uses, if it
//     has one, and the head a pixel down), so the plain drawing never shows
//     more than two frames running. A hold written today starts stirring
//     the moment its Wind is drawn. Short holds (2-5 frames) are fine as
//     c(n, ...), but a c() of the same pose before a hold adds to its first
//     still frames: keep such a c() to 2 frames.
//   - ACCENTS. A hold of 10 frames or more (ACCENT_MIN) also carries a
//     larger beat every 8 frames (hold frames 3, 11, 19...: on the breath):
//     the head dipped one pixel more for a frame (two below rest), and on
//     every other accent (11, 27...) the lids half shut for it, a blink-like
//     beat, unless the cel sets its own eyes (then the dip alone). hold(n, tag, k, { accent: false }) leaves
//     them out (a hold whose head must stay put: a stare, a held aim);
//     with o as a function, pass it as the fifth argument:
//     hold(n, tag, k, i => ({...}), { accent: false }). Your own key poses
//     (a lean, a clench, a shoulder heave) are still the real cure for a
//     long hold: the accents only keep it from reading as a statue.
//   - LEAPS CLEAR THE HEAD. A leap's apex lifts the head above standing
//     height, the hair's top cut by the stage at most 3 px (`clip`, airborne
//     frames only); a landing squashes for two frames. Use hopHome() and
//     leap(); never hand-roll lifts of 2-4 px.
//   - RUN-INS ACCELERATE. Rock back, then cover the ground in one smear frame
//     and land the blow (runIn()): never ease into contact (35, 31, 28, 26).
//   - CASTERS MOVE THEIR WEIGHT. A ninja who stands planted while the
//     effect does the work (a fireball, a summoning, a palm thrust from
//     home) still moves the body, not only the head: at least 2 px of root
//     travel (x, dy or lift) within 6 frames of the first blow. Write the
//     release round cast(): gather (sunk a pixel, drawn back a column),
//     release (a step in, a frame's overshoot past it), impact (the recoil
//     back), settle (home). The body is never one pose family at one root
//     for more than 8 frames, however much the head and the hem stir
//     (motion.mjs's limb-hold): break a long hold with a real second key
//     pose and a root change.
//   - THE CAMERA SHAKES. A cel's `shake` moves the whole stage, the post
//     too (a camera's shake, so the target jolts with the blow); `postStill`
//     keeps the post still. A jolt is 1-2 frames at the impact, at most 3
//     alternating frames, and never more than 1 px down with the ninja on
//     the ground.
//   - THE POST'S POOF IS A BOOKEND, not an act: two frames in, two out (the
//     post stands through the rest of postIn's and postOut's frames). A
//     move's first frame is its first pose (postIn drops a plain idle0 at
//     its head), so a jutsu started from the hand signs never flashes the
//     rest stance.
//
// THE HELPERS, in detail.
//
// hold(n, tag, k, o = {}, h = {})
//   n frames of k (any NinjaCel: pose, x, eyes, awake...), one cel a
//   frame, each marked with its place in the hold (NinjaCel's `held`), so the
//   compositor draws the stirring or the breath. o: the cel options of every
//   frame ({ post, fx, clones, shake... }), or (i) => options for frame i;
//   o.phase starts it that many frames in (2: on the Wind drawing; 2 without
//   a Wind: on the breath); o.accent false: no accents (see MOTION). h: the
//   hold's own options ({ phase, accent }) when o is a function.
//     ...hold(8, 'charge', K('charge', awake()), { post: 'stand', fx: charging() })
//     ...hold(12, 'aim', K('strike', { eyes: 'focus' }), i => ({ fx: [...] }), { accent: false })
//
// runIn(tag, o)
//   The run at the post from home: the wind-up rocked back a pixel for
//   three frames, then the ground covered in one smear frame (two steps
//   for 'heavy'), and, with o.strike, the blow held two frames (hit-stop).
//   o.look: the ninja's look on every frame (awake()); o.from /
//   o.to: the columns (HOME, STRIKE); o.windup: the wind-up pose ('windup');
//   o.ready: the wind-up's beat (else `tag`); o.post: the post throughout
//   ('stand'); o.fx(i, part): effects for frame i of the part ('windup',
//   'travel', 'strike'). o.style:
//     'dash'   (default) the smear at 30, dust where the feet leave
//     'glide'  low: the head ducked a pixel through the wind-up and the
//              glide, two afterimages in their chakra close behind
//     'heavy'  two heavy steps (32, 29) instead of the smear, dust at each
//              footfall and the post jumping a pixel with it
//     'ghost'  gone so fast an afterimage of the wind-up stays at home, in
//              their chakra, through the smear and the blow
//   o.strike: { pose = 'strike', n = 2, tag = 'impact', ...cel options }: the
//   blow at `to` (else write it yourself: its effects are the move's own).
//     ...runIn('dash', { look: awake(), ready: 'charge', fx: () => [fx('chidori', 'cycle', 'hand')] }),
//     c(2, 'impact', K('strike', awake({ x: STRIKE })), { post: 'lean', fx: [...] }),
//
// hopHome(tag, from, post, o = {}, settle = 2, apex = 'jump', { style })
//   Home from column `from` after a blow: the crouch to spring, four frames
//   in the air (tuck up 3, `apex` up 6 twice, tuck up 3; where the apex
//   drawing would cut more than 3 px of hair the lift stops short, 5 for the
//   jump), landing in a crouch that squashes for `settle` frames,
//   dust where the feet leave and land; the post held at `post` throughout,
//   `o` on every frame (the dojutsu awake). In the air the eyes are 'focus'
//   unless o.eyes says. apex 'tuck' for a cannonball.
//   NOT EVERY HOP THE SAME: apex may be the air poses in order, stretched
//   over the four frames (airPose: the first on take-off, the last coming
//   down), or { air, lifts } for an arc of its own (a frame a lift):
//     hopHome('back', STRIKE, 'lean', {}, 2, ['tuck', 'flip', 'tuck'])        a backflip
//     hopHome('back', STRIKE, 'lean', {}, 2, ['tuck'])                        a cannonball
//     hopHome('back', STRIKE, 'lean', {}, 2, { air: ['jump', 'spin', 'spinB', 'tuck'] })
//     hopHome('back', STRIKE, 'lean', {}, 2, { air: ['tuck', 'jump'], lifts: [2, 4, 5, 5, 3] })   floatier
//   The poses are yours to draw (a 'flip' upside down, a 'spin' facing out,
//   in your template or as the ninja's own: NinjaSprite.poses); each needs
//   its feet row and root like any pose, and the hair cut at most 3 px.
//   leap() takes the same list as o.air.
//   AND NOT EVERY LANDING. The seventh argument, { style }, picks how it goes
//   (21 moves end on the same 3-6-6-3 hop: give each ninja their own):
//     (none)     the hop: up 3, 6, 6, 3, a squash of `settle` frames
//     'skip'     light and low: up 2, 3, 2, one frame's squash (a genin's
//                bounce, a playful exit)
//     'heavy'    a big one landing hard: up 3, 6, 7, 4, the first squash
//                frame a pixel deeper with the stage jolted a pixel down,
//                grit thrown out both sides, 2 squash frames at least
//     'flicker'  the Body Flicker: no hop. Crouched where the blow left
//                them, gone in a puff, back in a puff at home, crouched,
//                the last wisps (as long as the hop: 5 + settle frames)
//     hopHome('back', STRIKE, 'lean', {}, 2, 'jump', { style: 'heavy' })
//     hopHome('back', STRIKE, 'lean', awake(), 2, 'jump', { style: 'flicker' })
//   apex's air poses and { air, lifts } still apply to 'skip' and 'heavy'
//   (lifts given win over the style's).
//
// leap(tag, k, o = {})
//   A leap at k's column (the cheer's hop): the crouch, up 3, 5 and hanging
//   there two frames, 3, landing in a two-frame squash, dust off and on the
//   ground. k: the ninja's look (its pose is the one in the air, 'jump'
//   unless given). o: { to (land elsewhere), lift (the apex, 5), hang (2),
//   squash (2), crouch (false: no crouch before, as when it follows one),
//   post, more(i): effects for frame i, air: the poses in the air in order,
//   stretched over its frames, as hopHome's (['jump', 'spread', 'jump']) }.
//
// cast({ gather, release, impact, settle, k, at, post, weight, recoil })
//   A caster's weight round a release from where they stand (`at`, HOME
//   unless given; STRIKE after a run-in): four beats, each a run of cels
//   whose root the helper moves, a column (x) and a sink (dy) from `at`:
//     gather   3 frames, 'charge', pose 'gather'   sunk a pixel, drawn back:  x+1, dy 1
//     release  3 frames, 'release', pose 'strike'  a step in, the first frame
//                                                  overshooting it:        x-2, then x-1
//     impact   2 frames, 'impact', release's pose  the recoil (hit-stop):  x+1
//     settle   2 frames, 'settle', impact's pose   home, the head a pixel
//                                                  behind on the first:    x
//   Each beat is yours to dress: { n, tag, pose, k, o, fx, hold, d }
//     n      its frames (gather 2-6, release 2-4: the overshoot is frame 0)
//     tag    its beat name ('impact' is the companion's hit; keep it)
//     pose   its pose, or a pose a frame (the last held): ['sign2', 'gather']
//     k      the ninja's look on it, over cast's k ({ eyes: 'shout', hdy: 1 }),
//            or (i) => look for frame i; a k.x or k.dy there overrides the root
//     o      the cel options of every frame ({ post, fx, clones, shake,
//            flash, shout }), or (i) => options for frame i
//     fx     its effects: a list, or (i) => effects for frame i (added to o's)
//     hold   true (or HoldOptions' phase): its frames a moving hold, the
//            pose stirring or breathing under its Wind (see MOTION)
//     d      (i) => [dx, dy] added to the beat's root on frame i (a deeper
//            sink, a second step)
//   false leaves a beat out (a cast after a charge of your own: gather: false).
//   k: the look on every frame (awake(), eyes); post: the post on every
//   frame ('stand'; a beat's o.post wins). The beats keep each body
//   position 1 frame (the overshoot) or 2 or more, so it never shudders.
//   WEIGHT HAS CHARACTER. The rock above is the default; every move of a
//   ninja on it shares one tic. o.weight gives the cast a body of its own
//   (each beat's frames are the weight's unless the beat's n says):
//     weight    gather            release               impact               settle
//     (none)    3: x+1 dy1        3: x-2, x-1           2: x+1 (recoil)      2: home, head lags
//     'light'   2: x+1, x+1 dy1   3: x-3 (2 px past),   2: x+1               3: a hop (lift 2),
//               (the dip springs)    x-1                                       land (head lags), home
//     'heavy'   4: x+1 dy1, then  3: x-2, held as a     3: x+2, x+3 sliding  3: home a column a
//               x+2 dy1, the head    lean (hdx -1)          in dust (recoil)     frame (+2, +1, 0)
//               sunk a pixel more
//     'stoic'   3: x0, x+1        3: x-1, no overshoot  2: x-1, the head     2: home
//               (no sink)                                  nods (hdy 1): no recoil
//   o.recoil says where the recoil comes:
//     'impact'  (default) on the blow landing
//     'release' on the release, after its overshoot frame: the kick of the
//               shot; then planted through the impact. USE IT FOR RANGED
//               JUTSU (a fireball, a thrown kunai, a water shark landing 15
//               px off): a caster who flinches when a projectile lands far
//               away reads as wrong
//     false     nowhere: the release's step held through the impact
//   Pick one per move, not per ninja, and give each jutsu one silhouette
//   key pose of its own (a lean, a throw, a shoulder) on top: the weight is
//   the root, the pose is the character.
//     ...cast({ weight: 'heavy', recoil: 'release', k: awake(), release: { pose: 'blow' } })
//   CAST_WEIGHT has each weight's roots (CastProfile), for a beat keyed by hand.
//     ...cast({
//       k: awake(),
//       gather: { pose: 'charge', fx: i => [fx('fireball', i, 'hand')] },
//       release: { pose: 'blow', o: { shout: true }, fx: i => [fx('fireJet', i, 'hand')] },
//       impact: { n: 3, o: i => ({ post: 'scorch', flash: i === 0 ? 'post' : undefined, shake: i === 0 ? [1, 0] : undefined }) },
//       settle: { pose: ['blow', 'gather'] },
//     }),
//     c(1, 'end', K('idle1', { hdy: 1 }), { post: 'stand' }), c(1, 'end', K('idle0'), { post: 'stand' }),
//   CAST_ROOT names each beat's root, for a cast keyed by hand.
//
// postIn(tag, ks, more) / postOut(tag, ks, frame, more)
//   The post poofs in over the first two of ks's frames (a cloud, then the
//   post standing in its last puffs) while the ninja does a frame each of
//   ks; a plain idle0 at ks's head is dropped for the next pose (so the move
//   opens on its first seal) and the last repeated to keep the length.
//   postOut keeps the post standing in `frame` (the blow's aftermath on show)
//   through ks's frames but the last two: on those, the cloud over it, then
//   two small wisps where it stood. Either keeps ks's length (the move's
//   timing unchanged). `more(i)` adds effects to frame i.

import { GROUND, HOME, STRIKE } from '../stage.ts'
import type { Anchor, Cel, CelMove, CloneCel, FxUse, NinjaCel, PostFrame, XY } from '../types.ts'

export const K = (pose: string, o: Partial<NinjaCel> = {}): NinjaCel => ({ pose, x: HOME, ...o })
export const c = (n: number, tag: string, k: NinjaCel | undefined, o: CelOptions = {}): Cel => ({ n, tag, ...(k ? { k } : {}), ...o })
export const fx = (name: string, f: FxUse['f'], at: Anchor, o: Partial<FxUse> = {}): FxUse => ({ fx: name, f, at, ...o })
// the ninja's look with their dojutsu awake (the Sharingan, Byakugan, Rinnegan, Sage Mode, Tsunade's seal)
export const awake = (o: Partial<NinjaCel> = {}): Partial<NinjaCel> => ({ awake: true, ...o })

// what a cel carries besides its length, beat and ninja
export type CelOptions = Partial<Omit<Cel, 'n' | 'tag' | 'k'>>

// the poof the post comes and goes in, on the ground at the post
export const smokeAt = (f: number): FxUse => fx('smoke', f, 'post', { d: [0, 6] })
export const dustAt = (f: number, x: number): FxUse => fx('dust', f, [x, GROUND])
// the last of the post's poof: two small wisps drifting up where it stood
// (the poof's last frame, its top two rows alone)
export const wispsAt = (): FxUse => fx('smoke', 4, 'post', { d: [0, -8], sink: 11 })

// ------------------------------------------------------------------ the post's poof

// a ninja just standing at a move's head (the companion's rest, not a pose of the move's)
const plain = (k: NinjaCel): boolean => (k.pose === 'idle0' || k.pose === 'idle') && Object.keys(k).every(key => key === 'pose' || key === 'x')

// The post arriving in a two-frame poof (a cloud, then the post standing in
// its last puffs) while the ninja does a frame each of `ks`; a plain idle0
// first is dropped for the move's first pose; `more` adds effects to frame i.
export const postIn = (tag: string, ks: readonly NinjaCel[], more: (i: number) => readonly FxUse[] = () => []): Cel[] => {
  let lead = 0
  while (lead < ks.length - 1 && plain(ks[lead]!)) lead++
  const list = lead > 0 && !plain(ks[lead]!) ? [...ks.slice(lead), ...Array.from({ length: lead }, () => ks[ks.length - 1]!)] : ks
  return list.map((k, i) => c(1, tag, k, { post: i >= 1 ? 'stand' : null, fx: [...(i === 0 ? [smokeAt(1)] : i === 1 ? [smokeAt(3)] : []), ...more(i)], ...(i < 2 ? { poof: 'in' as const } : {}) }))
}

// and leaving, from `frame`: standing through ks's frames but the last two,
// the cloud over it on the second last, two small wisps on the last
export const postOut = (tag: string, ks: readonly NinjaCel[], frame: PostFrame = 'stand', more: (i: number) => readonly FxUse[] = () => []): Cel[] => {
  const cloud = Math.max(0, ks.length - 2)
  return ks.map((k, i) =>
    i < cloud ? c(1, tag, k, { post: frame, fx: [...more(i)] }) : c(1, tag, k, { post: i === cloud ? frame : null, fx: [i === cloud ? smokeAt(1) : wispsAt(), ...more(i)], poof: 'out' }),
  )
}

// ------------------------------------------------------------------ holds

// What a hold's own options are, besides the cel options: `phase` starts it
// that many frames in; `accent: false` leaves a long hold without its accents.
export type HoldOptions = { phase?: number; accent?: boolean }

// the hold's frames (counted from its phase) that carry an accent: every
// eight, on a frame where the head is sunk with the breath (with a Wind or
// without), so the dip lands on the sunk head: 3, 11, 19...
export const ACCENT_EVERY = 8
export const ACCENT_AT = 3
// a hold this long or longer carries accents
export const ACCENT_MIN = 10

// n frames of one pose that stir or breathe (see the top): a cel a frame,
// each marked with its place in the hold; `o` the cel options of every
// frame, or of frame i; o.phase starts the hold that many frames in. A hold
// of ACCENT_MIN frames or more carries an accent every ACCENT_EVERY frames:
// the head dipped a pixel more for one frame (two below rest, on the
// breath), and on every other accent the lids half shut (a blink-like beat;
// 'half', so the eyes still show), unless the cel sets its own eyes. o.accent
// false (or h.accent, with o as a function) leaves them out.
export const hold = (n: number, tag: string, k: NinjaCel, o: (CelOptions & HoldOptions) | ((i: number) => CelOptions) = {}, h: HoldOptions = {}): Cel[] => {
  const own = typeof o === 'function' ? h : { ...h, ...o }
  const phase = own.phase ?? 0
  const accents = own.accent !== false && n >= ACCENT_MIN
  const opts = (i: number): CelOptions => {
    if (typeof o === 'function') return o(i)
    const { phase: _, accent: __, ...rest } = o
    return rest
  }
  return Array.from({ length: Math.max(0, n) }, (_, i) => {
    const j = phase + i
    const beat = accents && j % ACCENT_EVERY === ACCENT_AT ? Math.floor(j / ACCENT_EVERY) : -1
    if (beat < 0) return c(1, tag, { ...k, held: j }, opts(i))
    const blink = beat % 2 === 1 && k.eyes === undefined ? { eyes: 'half' } : {}
    return c(1, tag, { ...k, held: j, hdy: (k.hdy ?? 0) + 1, ...blink }, opts(i))
  })
}

// ------------------------------------------------------------------ leaps

// the hair a leap may cut on the stage's top, at most
export const LEAP_CLIP = 3

type Arc = {
  from: number
  to: number
  // the lifts of the frames in the air, and the poses: `apex` where the lift is highest
  // (or `poses`, the air poses in order, stretched over the frames in the air)
  lifts: readonly number[]
  air: string
  apex: string
  poses?: readonly string[]
  // the crouch before (frames), and the squash after
  crouch: number
  squash: number
  look: Partial<NinjaCel>
  airEyes?: string
  post?: PostFrame | null
  more: (i: number) => readonly FxUse[]
}

// a leap from one column to another: the crouch, the frames in the air, the landing squash
const arc = (tag: string, a: Arc): Cel[] => {
  const top = Math.max(...a.lifts)
  const n = a.lifts.length
  const at = (i: number): number => a.from + Math.round(((a.to - a.from) * (i + 1)) / (n + 1))
  const post = a.post === undefined ? {} : { post: a.post }
  const out: Cel[] = []
  let f = 0
  const cel = (k: NinjaCel, fxs: FxUse[]): void => {
    out.push(c(1, tag, k, { ...post, fx: [...fxs, ...a.more(f)] }))
    f++
  }
  for (let i = 0; i < a.crouch; i++) cel(K('crouch', { x: a.from, eyes: 'focus', ...a.look }), [])
  a.lifts.forEach((lift, i) => {
    const eyes = a.look.eyes ?? a.airEyes
    const pose = a.poses?.length ? airPose(a.poses, i, n) : lift === top ? a.apex : a.air
    cel(K(pose, { ...a.look, x: at(i), lift, clip: LEAP_CLIP, ...(eyes ? { eyes } : {}) }), i < 2 ? [dustAt(i, a.from)] : [])
  })
  for (let i = 0; i < a.squash; i++) cel(K('crouch', { ...a.look, x: a.to }), i < 3 ? [dustAt(i, a.to)] : [])
  return out
}

// the air pose of frame i of n in the air, from a list of them stretched
// over the frames (the first on the take-off, the last on the way down:
// ['tuck', 'flip', 'tuck'] over four is tuck, flip, flip, tuck)
export const airPose = (poses: readonly string[], i: number, n: number): string =>
  poses.length >= n || n <= 1 ? poses[Math.min(i, poses.length - 1)]! : poses[Math.min(poses.length - 1, Math.round((i * (poses.length - 1)) / (n - 1)))]!

// A hop's shape in the air: its poses in order (stretched over its frames),
// and its lifts, a frame each (else the hop's 3, 6, 6, 3)
export type HopAir = { air: readonly string[]; lifts?: readonly number[] }

// How a hop home goes (see the top): the hop (default); 'skip' a light low
// hop; 'heavy' a big one landing hard; 'flicker' the Body Flicker, no hop.
export type HopStyle = 'skip' | 'heavy' | 'flicker'
export type HopOptions = { style?: HopStyle }

// the Body Flicker's cloud over a ninja standing at column x (as the arrival's)
const flickerCloud = (f: number, x: number): FxUse[] => [fx('smoke', f, [x - 4, GROUND]), fx('smoke', f, [x + 5, GROUND]), fx('smoke', f, [x, GROUND - 10])]

// The hop home from column `from` after a blow (see the top). `apex`: the
// pose at the top (the jump), or the air poses in order (['tuck', 'flip',
// 'tuck']: a backflip), or { air, lifts } for its own arc. h.style: 'skip',
// 'heavy' or 'flicker' (see the top).
export const hopHome = (tag: string, from: number, post: PostFrame | null, o: Partial<NinjaCel> = {}, settle = 2, apex: string | readonly string[] | HopAir = 'jump', h: HopOptions = {}): Cel[] => {
  const shape: HopAir | null = typeof apex === 'string' ? null : 'air' in apex ? (apex as HopAir) : { air: apex as readonly string[] }
  const to = o.x ?? HOME
  const look = withoutX(o)
  if (h.style === 'flicker') return flicker(tag, from, to, post, look, settle)
  const heavy = h.style === 'heavy'
  const skip = h.style === 'skip'
  const lifts = shape?.lifts?.length ? shape.lifts : skip ? [2, 3, 2] : heavy ? [3, 6, 7, 4] : [3, 6, 6, 3]
  const cels = arc(tag, {
    from,
    to,
    lifts,
    air: 'tuck',
    apex: typeof apex === 'string' ? apex : 'jump',
    ...(shape ? { poses: shape.air } : {}),
    crouch: 1,
    squash: skip ? 1 : heavy ? Math.max(2, settle) : settle,
    look,
    airEyes: 'focus',
    post,
    more: () => [],
  })
  if (!heavy) return cels
  // landing hard: the first squash frame a pixel deeper, the stage jolted a
  // pixel down with it, grit thrown out both sides over the squash
  const land = 1 + lifts.length
  return cels.map((cel, i) => {
    if (i < land || i > land + 1) return cel
    const k = i === land ? { ...cel.k!, dy: (cel.k!.dy ?? 0) + 1 } : cel.k!
    const grit = [dustAt(i - land, to - 3), dustAt(i - land, to + 3)]
    return { ...cel, k, fx: [...(cel.fx ?? []), ...grit], ...(i === land ? { shake: [0, 1] as XY } : {}) }
  })
}

// The Body Flicker home: crouched where the blow left them, gone in a puff,
// the cloud thinning there as one blooms at home, back in it crouched, the
// last wisps. As long as the hop (a frame to spring, four, then `settle`).
const flicker = (tag: string, from: number, to: number, post: PostFrame | null, look: Partial<NinjaCel>, settle: number): Cel[] => {
  const p = post === undefined ? {} : { post }
  const crouch = (x: number): NinjaCel => K('crouch', { eyes: 'focus', ...look, x })
  const out: Cel[] = [
    c(1, tag, crouch(from), { ...p, fx: flickerCloud(0, from) }),
    c(1, tag, undefined, { ...p, fx: flickerCloud(1, from) }),
    c(1, tag, undefined, { ...p, fx: [...flickerCloud(2, from), ...flickerCloud(0, to)] }),
    c(1, tag, crouch(to), { ...p, fx: [...flickerCloud(3, from), ...flickerCloud(1, to)] }),
    c(1, tag, crouch(to), { ...p, fx: flickerCloud(2, to) }),
  ]
  for (let i = 0; i < settle; i++) out.push(c(1, tag, K('crouch', { ...look, x: to }), { ...p, fx: i === 0 ? flickerCloud(3, to) : [] }))
  return out
}

// air: the poses in the air in order, stretched over its frames (else k's
// pose, or the jump, throughout): ['tuck', 'spin', 'jump'], a cannonball
// ['tuck'], a star jump ['jump', 'spread', 'jump']
export type LeapOptions = { to?: number; lift?: number; hang?: number; squash?: number; crouch?: boolean; post?: PostFrame | null; more?: (i: number) => readonly FxUse[]; air?: readonly string[] }

// A leap at k's column, its pose in the air ('jump' unless k says) (see the top).
export const leap = (tag: string, k: Partial<NinjaCel> = {}, o: LeapOptions = {}): Cel[] => {
  const from = k.x ?? HOME
  const top = o.lift ?? 5
  const rise = Math.min(3, top)
  const pose = k.pose ?? 'jump'
  const { pose: _, ...look } = withoutX(k) as Partial<NinjaCel>
  return arc(tag, {
    from,
    to: o.to ?? from,
    lifts: [rise, ...Array.from({ length: Math.max(1, o.hang ?? 2) }, () => top), rise],
    air: pose,
    apex: pose,
    ...(o.air?.length ? { poses: o.air } : {}),
    crouch: o.crouch === false ? 0 : 1,
    squash: o.squash ?? 2,
    look,
    ...(o.post !== undefined ? { post: o.post } : {}),
    more: o.more ?? (() => []),
  })
}

const withoutX = (o: Partial<NinjaCel>): Partial<NinjaCel> => {
  const { x: _, ...rest } = o
  return rest
}

// the ninja tucked in the air at column x, `lift` pixels up
export const hop = (x: number, lift: number, o: Partial<NinjaCel> = {}): NinjaCel => K('tuck', { x, lift, ...o })

// Home from column x in small hops (the 'back' beat of a taijutsu blow): a
// crouch, three hops, the landing; `more` adds effects to frame i.
export const homeFrom = (x: number, more: (i: number) => readonly FxUse[] = () => []): Cel[] => {
  const mid = Math.round((x + HOME) / 2)
  return [
    c(1, 'back', K('crouch', { x }), { post: 'stand', fx: [...more(0)] }),
    c(1, 'back', hop(mid - 2, 3), { post: 'stand', fx: [dustAt(0, x), ...more(1)] }),
    c(1, 'back', hop(mid + 2, 4), { post: 'stand', fx: [dustAt(1, x), ...more(2)] }),
    c(1, 'back', hop(HOME - 1, 2), { post: 'stand', fx: [...more(3)] }),
    c(1, 'back', K('crouch'), { post: 'stand', fx: [dustAt(0, HOME), ...more(4)] }),
  ]
}

// ------------------------------------------------------------------ the run-in

export type RunStyle = 'dash' | 'glide' | 'heavy' | 'ghost'
export type RunPart = 'windup' | 'travel' | 'strike'
export type RunInOptions = {
  from?: number
  to?: number
  style?: RunStyle
  look?: Partial<NinjaCel>
  windup?: string
  ready?: string
  post?: PostFrame | null
  fx?: (i: number, part: RunPart) => readonly FxUse[]
  strike?: CelOptions & { pose?: string; n?: number; tag?: string }
}

// The run at the post (see the top): the wind-up rocked back, the ground
// covered in a smear (or two heavy steps), and with o.strike the blow.
export const runIn = (tag: string, o: RunInOptions = {}): Cel[] => {
  const from = o.from ?? HOME
  const to = o.to ?? STRIKE
  const style = o.style ?? 'dash'
  const look = withoutX(o.look ?? {})
  const post = o.post === undefined ? { post: 'stand' as const } : { post: o.post }
  const more = o.fx ?? (() => [])
  const low = style === 'glide' ? { hdy: 1 } : {}
  const span = from - to
  const x = (u: number): number => to + Math.round(span * u)
  const out: Cel[] = []
  // the wind-up: rocked back a pixel, three frames
  for (let i = 0; i < 3; i++) out.push(c(1, o.ready ?? tag, K(o.windup ?? 'windup', { ...look, ...low, x: from + 1 }), { ...post, fx: [...more(i, 'windup')] }))
  // the ground covered
  const ghost = (at: number, pose: string, extra: Partial<CloneCel> = {}): CloneCel => ({ ...look, ...extra, pose, x: at, ghost: 'chakra', noShadow: true })
  const left = (): CloneCel => ghost(from + 1, o.windup ?? 'windup')
  if (style === 'heavy') {
    out.push(c(1, tag, K('dash', { ...look, x: x(0.67) }), { ...post, pdy: -1, fx: [dustAt(0, from + 2), ...more(0, 'travel')] }))
    out.push(c(1, tag, K('dash', { ...look, x: x(0.33) }), { ...post, pdy: -1, fx: [dustAt(0, x(0.67)), dustAt(1, from + 2), ...more(1, 'travel')] }))
  } else if (style === 'glide') {
    const at = x(0.45)
    out.push(c(1, tag, K('dash', { ...look, ...low, x: at }), { ...post, clones: [ghost(at + 3, 'dash', low), ghost(at + 6, 'dash', low)], fx: [dustAt(0, from + 2), ...more(0, 'travel')] }))
  } else if (style === 'ghost') {
    // gone from the wind-up so fast its afterimage stays there, through the blow
    out.push(c(1, tag, K('smear', { ...look, x: x(0.45) }), { ...post, clones: [left()], fx: [...more(0, 'travel')] }))
  } else out.push(c(1, tag, K('smear', { ...look, x: x(0.45) }), { ...post, fx: [dustAt(0, from + 2), ...more(0, 'travel')] }))
  // the blow, held (hit-stop)
  if (o.strike) {
    const { pose = 'strike', n = 2, tag: hit = 'impact', fx: own = [], ...rest } = o.strike
    out.push(c(n, hit, K(pose, { ...look, x: to }), { ...post, ...rest, ...(style === 'ghost' ? { clones: [...(rest.clones ?? []), left()] } : {}), fx: [...own, ...more(0, 'strike'), ...(style === 'heavy' ? [] : [dustAt(1, from + 2)])] }))
  }
  return out
}

// ------------------------------------------------------------------ the cast

// One beat of a cast (see the top): its length, beat name, pose (or a pose a
// frame), the ninja's look, the cel options, effects, a moving hold, a nudge.
export type CastBeat = {
  n?: number
  tag?: string
  pose?: string | readonly string[]
  k?: Partial<NinjaCel> | ((i: number) => Partial<NinjaCel>)
  o?: CelOptions | ((i: number) => CelOptions)
  fx?: readonly FxUse[] | ((i: number) => readonly FxUse[])
  hold?: boolean | HoldOptions
  d?: (i: number) => XY
}
export type CastPart = 'gather' | 'release' | 'impact' | 'settle'
// How a caster carries their weight (see the top): the default, or
//   light  a quick 2-frame gather, a 2 px overshoot, a hop on the settle
//   heavy  a deep sink held 4 frames, a 1 px overshoot held as a lean, a big
//          recoil sliding back in dust, stepping home over 3 frames
//   stoic  almost no sink, a tiny step, no recoil: a nod of the head instead
export type CastWeight = 'light' | 'heavy' | 'stoic'
// Where the recoil comes: on the blow landing ('impact', the default), on the
// release (a ranged jutsu: the kick of the shot, then planted while it flies
// and lands far off), or nowhere (the step held through the impact).
export type CastRecoil = 'impact' | 'release' | false
export type CastOptions = {
  gather?: CastBeat | false
  release?: CastBeat | false
  impact?: CastBeat | false
  settle?: CastBeat | false
  k?: Partial<NinjaCel>
  at?: number
  post?: PostFrame | null
  weight?: CastWeight
  recoil?: CastRecoil
}

// Each beat's root on frame i, a column and a sink from the cast's column:
// the gather sunk and drawn back, the release stepping in past its mark on
// its first frame, the impact's recoil, the settle home. (The default
// weight's; CAST_WEIGHT has every weight's, with the head's part in it.)
export const CAST_ROOT: Readonly<Record<CastPart, (i: number) => XY>> = {
  gather: () => [1, 1],
  release: i => [i === 0 ? -2 : -1, 0],
  impact: () => [1, 0],
  settle: () => [0, 0],
}
const CAST_BEAT: Readonly<Record<CastPart, { n: number; tag: string }>> = {
  gather: { n: 3, tag: 'charge' },
  release: { n: 3, tag: 'release' },
  impact: { n: 2, tag: 'impact' },
  settle: { n: 2, tag: 'settle' },
}

// A cast frame's root, from the cast's column: x, the sink (dy), a lift (a
// hop), the head's nudge (hdx, hdy: a lean, a lag, a nod) and dust at the
// feet (a slide).
export type CastRoot = { x: number; dy?: number; lift?: number; hdx?: number; hdy?: number; dust?: boolean }
// A weight: each beat's frames, and its roots: the gather's, the release's
// (its step, the overshoot on frame 0), the recoil's (frame i of it), the
// step held where there is no recoil, and the settle's (frame i of n, home
// from column `from`).
export type CastProfile = {
  n: Readonly<Record<CastPart, number>>
  gather: (i: number) => CastRoot
  release: (i: number) => CastRoot
  recoil: (i: number) => CastRoot
  held: CastRoot
  settle: (i: number, n: number, from: number) => CastRoot
}
export const CAST_WEIGHT: Readonly<Record<CastWeight | 'default', CastProfile>> = {
  default: {
    n: { gather: 3, release: 3, impact: 2, settle: 2 },
    gather: () => ({ x: 1, dy: 1 }),
    release: i => ({ x: i === 0 ? -2 : -1 }),
    recoil: () => ({ x: 1 }),
    held: { x: -1 },
    // home at once, the head a pixel behind on the first frame
    settle: i => ({ x: 0, ...(i === 0 ? { hdy: 1 } : {}) }),
  },
  light: {
    n: { gather: 2, release: 3, impact: 2, settle: 3 },
    // drawn back, then the dip on the spring
    gather: i => (i === 0 ? { x: 1 } : { x: 1, dy: 1 }),
    // 2 px past the mark
    release: i => ({ x: i === 0 ? -3 : -1 }),
    recoil: () => ({ x: 1 }),
    held: { x: -1 },
    // a hop home: up 2, down with the head a pixel behind, home
    settle: i => (i === 0 ? { x: 0, lift: 2 } : i === 1 ? { x: 0, hdy: 1 } : { x: 0 }),
  },
  heavy: {
    n: { gather: 4, release: 3, impact: 3, settle: 3 },
    // sunk and drawn back, then deeper: the weight on the back foot, the head down with it
    gather: i => (i === 0 ? { x: 1, dy: 1 } : { x: 2, dy: 1, ...(i >= 2 ? { hdy: 1 } : {}) }),
    // a pixel past the mark, held as a lean (the head forward)
    release: i => (i === 0 ? { x: -2 } : { x: -2, hdx: -1 }),
    // thrown back 2, sliding a third, dust off the feet
    recoil: i => (i === 0 ? { x: 2, dust: true } : i === 1 ? { x: 3, dust: true } : { x: 3 }),
    held: { x: -2, hdx: -1 },
    // stepping home a column a frame, the head a pixel behind on the first
    settle: (i, n, from) => ({ x: Math.round((from * (n - 1 - i)) / Math.max(1, n)), ...(i === 0 ? { hdy: 1 } : {}) }),
  },
  stoic: {
    n: { gather: 3, release: 3, impact: 2, settle: 2 },
    // the weight onto the back foot, no sink
    gather: i => ({ x: i === 0 ? 0 : 1 }),
    // a tiny step, no overshoot
    release: () => ({ x: -1 }),
    // no recoil: the step held, the head nodding with the blow
    recoil: i => ({ x: -1, ...(i === 0 ? { hdy: 1 } : {}) }),
    held: { x: -1 },
    settle: () => ({ x: 0 }),
  },
}

// A caster planted while the effect works, with their weight in it (see the top).
export const cast = (o: CastOptions = {}): Cel[] => {
  const at = o.at ?? HOME
  const look = withoutX(o.k ?? {})
  const P = CAST_WEIGHT[o.weight ?? 'default']
  const recoil = o.recoil === undefined ? 'impact' : o.recoil
  const n0 = { gather: 0, release: 0, impact: 0, settle: 0 }
  const out: Cel[] = []
  // each beat's pose falls back on the one before's last (the release's 'strike')
  let last = 'gather'
  // the root's column of the frame before (the settle steps home from it)
  let was = 0
  const rootOf = (part: CastPart, i: number, n: number): CastRoot => {
    if (part === 'gather') return P.gather(i)
    if (part === 'release') return recoil === 'release' && i >= 1 ? P.recoil(i - 1) : P.release(i)
    if (part === 'impact') return recoil === 'impact' ? P.recoil(i) : recoil === 'release' ? P.recoil(Math.max(0, n0.release - 1 + i)) : P.held
    return P.settle(i, n, was)
  }
  for (const part of ['gather', 'release', 'impact', 'settle'] as const) {
    const b = o[part]
    if (b === false) continue
    const beat: CastBeat = b ?? {}
    const n = Math.max(0, beat.n ?? (o.weight ? P.n[part] : CAST_BEAT[part].n))
    n0[part] = n
    const poses = beat.pose === undefined ? [part === 'release' ? 'strike' : part === 'gather' ? 'gather' : last] : typeof beat.pose === 'string' ? [beat.pose] : beat.pose.length ? beat.pose : [last]
    const hold = beat.hold === undefined || beat.hold === false ? null : beat.hold === true ? {} : beat.hold
    const from = was
    for (let i = 0; i < n; i++) {
      was = from
      const r = rootOf(part, i, n)
      const [ex, ey] = beat.d?.(i) ?? [0, 0]
      const own = typeof beat.k === 'function' ? beat.k(i) : (beat.k ?? {})
      const dy = (r.dy ?? 0) + ey
      const head = { ...(r.hdx ? { hdx: (look.hdx ?? 0) + r.hdx } : {}), ...(r.hdy ? { hdy: (look.hdy ?? 0) + r.hdy } : {}) }
      const air = r.lift ? { lift: r.lift, clip: LEAP_CLIP } : {}
      const pose = poses[Math.min(i, poses.length - 1)]!
      const k = K(pose, { ...look, ...head, ...air, x: at + r.x + ex, ...(dy ? { dy } : {}), ...own, ...(hold ? { held: (hold.phase ?? 0) + i } : {}) })
      const opts = typeof beat.o === 'function' ? beat.o(i) : (beat.o ?? {})
      const more = typeof beat.fx === 'function' ? beat.fx(i) : (beat.fx ?? [])
      const grit = r.dust ? [dustAt(Math.min(1, i), k.x)] : []
      const post = 'post' in opts ? {} : { post: o.post === undefined ? ('stand' as const) : o.post }
      out.push(c(1, beat.tag ?? CAST_BEAT[part].tag, k, { ...post, ...opts, fx: [...(opts.fx ?? []), ...more, ...grit] }))
      was = r.x
    }
    if (n > 0) last = poses[Math.min(n - 1, poses.length - 1)]!
  }
  return out
}

// ------------------------------------------------------------------ shouts

// A move whose beats named in `own` shout lines of their own through them
// (the spinner's "Sand Burial!", "Second meteor!"), every beat of that name.
export const calls = (m: CelMove, own: Readonly<Record<string, string>>): CelMove => ({ ...m, beats: m.beats.map(b => (own[b.name] ? { ...b, shout: own[b.name] } : b)) })
