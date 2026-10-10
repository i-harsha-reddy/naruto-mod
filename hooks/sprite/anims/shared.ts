// The moves every native ninja shares, drawn in their own template's poses
// (a ninja may bring their own instead: NinjaSprite's arrival, fizzle,
// dispel). The companion times them by their beats:
//   arrival  switched in: a cloud of smoke, parting on them a pixel up in a
//            seal (the body; the head stays where it stands, so a head drawn
//            to the stage's top row is never cut), a landing crouch, then
//            standing as the wisps drift off (0.9 s)
//   fizzle   a jutsu that comes to nothing (beat 'fizzle', then 'slump'):
//            the charge in the hand breaking apart over two frames, in the
//            ninja's own chakra (pal 'chakra'), the chunks flung off in
//            sparks; the recoil (the start, thrown back a column, the head
//            up, eyes wide) held two frames, a sorry puff out of the hand as
//            it deflates; then straight into the slump,
//            the gloom lines over it and the sweat drop sliding down by the
//            head to where the failure's badge takes it over, the post gone
//            up in smoke meanwhile (0.9 s). A failure after the jutsu's
//            first blow has landed plays it from the slump (the companion
//            starts it there: the seals are never replayed as a second jutsu)
//   dispel   cut off by a call for you: up in a start, the post gone in smoke (0.3 s)
// The post stands through the fizzle's start (a jutsu cut before its blow
// leaves it standing) and goes up in smoke as the slump begins, so the late
// fizzle, from the slump, takes it off too: the cloud covers where it stood,
// whatever the jutsu left of it. In a dispel the cloud covers it from the
// first frame. Each is drawn at the ninja's `home` column (NinjaSprite.home).

import { celMove, poseOf } from '../cels.ts'
import { GROUND, HOME } from '../stage.ts'
import type { CelMove, Template, XY } from '../types.ts'
import { K as KH, c, dustAt, fx, smokeAt, wispsAt } from './kit.ts'
import type { NinjaCel } from '../types.ts'

// `home`: the ninja's column at rest; `rise`: the head rises with the body in
// the seal (the first arrival, which Kakashi keeps: his hair's outline tips
// are the only pixels it cuts); `hand`: where the hand of their charge pose is
// on the stage, at home (else found in the template given)
export type SharedOptions = { home?: number; rise?: boolean; hand?: XY }

// the cloud a ninja arrives in: two puffs on the ground and one at head height
const cloud = (f: number, home: number) => [fx('smoke', f, [home - 4, GROUND]), fx('smoke', f, [home + 5, GROUND]), fx('smoke', f, [home, GROUND - 10])]
// the wisps off the shoulders, at the head's neck
const wisp = (f: number) => fx('wisp', f, 'head', { d: [10, 17] })

export const arrivalOf = (t: Template, o: SharedOptions = {}): CelMove => {
  const home = o.home ?? HOME
  const K = (pose: string, k: Partial<NinjaCel> = {}): NinjaCel => KH(pose, { x: home, ...k })
  const up = o.rise ? { lift: 1 } : { lift: 1, hdy: 1 }
  return celMove(t, { name: 'Arrival', shout: '', dojutsu: false }, [
    c(1, 'poof', undefined, { fx: cloud(1, home) }),
    c(1, 'poof', K('sign1', { ...up, eyes: 'focus' }), { fx: cloud(2, home) }),
    c(1, 'poof', K('sign1', { ...up, eyes: 'focus' }), { fx: cloud(3, home) }),
    c(1, 'land', K('crouch', { eyes: 'shut' }), { fx: [...cloud(4, home), dustAt(0, home)] }),
    c(1, 'stand', K('idle1', { hdy: 1 }), { fx: [dustAt(1, home), wisp(0)] }),
    c(1, 'stand', K('idle0'), { fx: [dustAt(2, home), wisp(0)] }),
    c(2, 'stand', K('idle0', { eyes: 'left' }), { fx: [wisp(1)] }),
    c(1, 'stand', K('idle0', { eyes: 'left' }), { fx: [wisp(2)] }),
  ])
}

// where the hand of the charge pose is on the stage, the ninja at `home`
export const chargeHandOf = (t: Template, home: number): XY => {
  const p = poseOf(t, 'charge')
  const [hx, hy] = p.hand ?? [1, 8]
  return [home - t.root + hx, GROUND - (p.rows.length - 1) + hy]
}

// the effects at the hand where the charge was (a stage pixel: they stay
// where the chakra broke, whatever the body does)
const breakAt = (f: number, at: XY) => fx('breakup', f, at, { pal: 'chakra' })
const sparkAt = (f: number, at: XY, d: XY = [0, 0]) => fx('sparks', f, at, { pal: 'chakra', d })
// the sorry puff out of the hand
const puffAt = (f: number, at: XY) => fx('sigh', f, at, { d: [-3, -1] })
const gloom = (f: number) => fx('gloom', f, 'head', { d: [3, 2] })
// the sweat drop sliding down by the head, to where the badge's sits
const sweat = (f: number) => fx('sweat', f, 'brow')

// the beat the late fizzle starts at
export const SLUMP = 'slump'

export const fizzleOf = (t: Template, o: SharedOptions = {}): CelMove => {
  const home = o.home ?? HOME
  const K = (pose: string, k: Partial<NinjaCel> = {}): NinjaCel => KH(pose, { x: home, ...k })
  const at = o.hand ?? chargeHandOf(t, home)
  return celMove(t, { name: 'Fizzle', shout: '', dojutsu: false }, [
    // the charge breaking apart in the hand, the chunks flung off in sparks
    c(1, 'fizzle', K('charge', { eyes: 'focus', hdy: 1 }), { post: 'stand', fx: [breakAt(0, at)] }),
    c(1, 'fizzle', K('charge', { eyes: 'wide', hdy: 1 }), { post: 'stand', fx: [breakAt(1, at), sparkAt(0, at, [-2, -1])] }),
    // the recoil: a start, thrown back a column, the head up, eyes wide, held
    // two frames (the last sparks spitting, then a sorry puff out of the
    // hand), and straight into the slump: never back to the charge between
    c(1, 'fizzle', K('alert', { x: home + 1, eyes: 'wide' }), { post: 'stand', fx: [sparkAt(1, at, [-3, -2])] }),
    c(1, 'fizzle', K('alert', { x: home + 1, eyes: 'wide', hdy: 1 }), { post: 'stand', fx: [puffAt(0, at), sparkAt(2, at, [-4, -1])] }),
    // the slump, the gloom and the sweat drop; the post goes up in smoke
    c(1, SLUMP, K('slump', { eyes: 'sad' }), { fx: [smokeAt(1), puffAt(1, at), gloom(0), sweat(0)] }),
    c(1, SLUMP, K('slump', { eyes: 'sad' }), { fx: [smokeAt(2), puffAt(2, at), gloom(0), sweat(1)] }),
    c(1, SLUMP, K('slump', { eyes: 'sad', hdy: 1 }), { fx: [smokeAt(3), gloom(1), sweat(2)] }),
    c(1, SLUMP, K('slump', { eyes: 'sad', hdy: 1 }), { fx: [wispsAt(), gloom(1), sweat(2)] }),
    c(1, SLUMP, K('slump', { eyes: 'sad' }), { fx: [gloom(1), sweat(2)] }),
  ])
}

export const dispelOf = (t: Template, o: SharedOptions = {}): CelMove => {
  const K = (pose: string, k: Partial<NinjaCel> = {}): NinjaCel => KH(pose, { x: o.home ?? HOME, ...k })
  return celMove(t, { name: 'Dispel', shout: '', dojutsu: false }, [
    c(1, 'dispel', K('alert', { eyes: 'wide' }), { fx: [smokeAt(1)] }),
    c(1, 'dispel', K('alert', { eyes: 'wide' }), { fx: [smokeAt(3)] }),
    c(1, 'dispel', K('alert', { eyes: 'wide' }), { fx: [wispsAt()] }),
  ])
}
