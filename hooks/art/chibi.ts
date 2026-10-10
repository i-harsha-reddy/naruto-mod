// The chibi's state: what the companion (companion.ts) hands the renderer
// (pixel.ts) each frame. The ninja are drawn by the native sprite engine
// (sprite/), which reads the pose, the face and the move playing from here.

import type { Face } from './portrait.ts'

// what Claude is at, as the badge shows it
export type Badge = 'think' | 'read' | 'search' | 'edit' | 'shell' | 'web' | 'agent' | 'plan' | 'other' | 'alert' | 'sleep' | 'error' | 'done'

export type SceneState = {
  id: string
  face: Face
  // the chakra ring, 0 quiet to 1 blazing
  aura: number
  badge: Badge | null
  // a frame counter for animated badges (the thinking dots)
  tick: number
}

export type Pose =
  | 'idle' | 'crossed' | 'think' | 'signs' | 'charge' | 'thumbs' | 'scratch' | 'alert' | 'sleep'
  // the moves': the second hand sign, chakra gathered in the left hand, a palm
  // thrust and a punch at the arena, a kick, a hand raised high, a palm slapped
  // to the ground, arms flung wide, a run
  | 'signs2' | 'gather' | 'strike' | 'punch' | 'kick' | 'raise' | 'slam' | 'spread' | 'dash'
  // fingertips poked together under the chin (Hinata's shy cheer); knees
  // tucked up in the air (a leap)
  | 'poke' | 'tuck'
  // a failure: shoulders dropped, arms hanging, the head down; the third hand
  // sign, two fingers of each hand crossed (the clone seal)
  | 'slump' | 'signs3'

// The avatar's state (the face, the glow, the badge) and the body's.
export type ChibiState = SceneState & {
  pose: Pose
  // a breath: the body rises by a hair
  bob: number
  // the move being played (its place in the ninja's set) and how far in, in seconds
  move: { index: number; t: number } | null
  // THE POST THROUGH A WORKING TURN (each left out when false or none). It
  // goes up with the turn's first jutsu and stays until the turn ends, so the
  // corner is not a stream of puffs:
  //   postUp     the training post was standing before the move began (or,
  //              at rest, stands): a move's poof in is skipped, the post
  //              standing from its first frame (a post it brings in scarred
  //              or hauled still arrives in its puff)
  //   postStays  in a move: the post stays when it is done, its poof out
  //              skipped (a post it left damaged or hauled is renewed in one
  //              puff: the cloud over it, then standing in the last puffs)
  //   postOut    the post leaving as the turn ends, over whatever shows: 0
  //              the cloud over it, 1 two wisps where it stood
  postUp?: boolean
  postStays?: boolean
  postOut?: number
  // a sleeper woken, the step of it (left out otherwise): 0 the start, what
  // they slept in still on (a nightcap), jolted; 1 it lifting off in a puff;
  // 2 the cloud parting where it was; 3 its last puffs, in the groggy moment after
  wake?: number
  // nodding off, the step of it (left out otherwise), the wake run backwards:
  // 0 a yawn, the head dipped two pixels; 1 sitting down; 2 the sleep pose,
  // a puff bringing what they sleep in on (a nightcap); 3 its last puffs
  doze?: number
}
