// Pain as a native sprite: everything that is his own over the shared
// 'cloak' template (templates/cloak.ts): the spiky orange head, the
// piercings, the Rinnegan, a chakra rod, his cheer (arms spread), and his
// moves (anims/pain.ts).

import { pal } from '../grid.ts'
import { register } from '../registry.ts'
import { CLOAK, CLOAK_COLOURS } from '../templates/cloak.ts'
import type { HandEyes, HeadGrid, NinjaSprite } from '../types.ts'
import { painMoves } from '../anims/pain.ts'

// ------------------------------------------------------------------ head

// The mod's 20 x 19 head with a 1 px outline traced round it: the spiked
// orange hair, the studs down the bridge of the nose and under the lip.
// Touched up: the Rain plate slashed through. Eyes are drawn by EYES.
//   a b c  hair: lit, mid, shadow
//   d e    skin, its shadow
//   f      the headband's cloth
//   g k h  its plate: lit, the slash, shaded
//   i l    the studs, lit and shaded; j the mouth
//   o      outline
export const HEAD: HeadGrid = {
  palette: pal(`
    a:#ffa64e b:#e8742a c:#a8441a d:#f2d2b4 e:#d6a486 f:#2c3352
    g:#d2d6e2 h:#868ba0 i:#f4f6fc j:#b07060 k:#3a4058 l:#9aa0b4 o:#0e1019
  `),
  eyes: [
    [7, 12],
    [12, 12],
  ],
  neck: [10, 17],
  rows: [
    '........o...o........',
    '....o..oao.obo..o....',
    '...oaooaboooaboobo...',
    '..ooababbccabbcbcoo..',
    '.oababbabbbcbabbcbco.',
    '..oaabbabbbcbbabcco..',
    '.oaabbabbbbcabbbcbco.',
    '..oabbbbbbbbbbbbcco..',
    '.ocfffgkkghghggfffco.',
    '.ocfffgghkkkhggfffco.',
    '.ocfffhhhhhhkkhfffco.',
    '..ooceeeeeeeeeeecoo..',
    '....odddddiddddeo....',
    '....odddddlddddeo....',
    '....odddddiddddeo....',
    '.....oddddjdddeo.....',
    '......oddidieeo......',
    '.......ooddeoo.......',
    '.........ooo.........',
  ],
}

// The head turned three-quarters to the post, for his blows (a cel's head:
// 'turn'): the face, its studs and the plate a pixel toward the arena, the
// spikes swept back a pixel and the back of the head showing behind the jaw.
export const TURN: HeadGrid = {
  palette: HEAD.palette,
  eyes: [
    [4, 12],
    [9, 12],
  ],
  neck: [10, 17],
  rows: [
    '..........o...o........',
    '......o..oao.obo..o....',
    '.....oaooaboooaboobo...',
    '....ooababbccabbcbcoo..',
    '...oababbabbbcbabbcbco.',
    '....oaabbabbbcbbabcccco',
    '..oaabbabbbbcabbbcbbco.',
    '..oabbbbbbbbbbbbbbbco..',
    '.ofgkkghghgggfffffco...',
    '.ofgghkkkhggffffffco...',
    '.ofhhhhhhkkhffffffco...',
    '.ooeeeeeeeeeeecbbco....',
    '.oddddiddddddecbco.....',
    '.oddddlddddddecbco.....',
    '.oddddiddddddeco.......',
    '..odddjddddeeco........',
    '...oddidieeeo..........',
    '....ooddeeoo...........',
    '......ooo..............',
  ],
}

// ------------------------------------------------------------------ eyes

// The Rinnegan, always: pale lilac rippled by a dark ring (a diagonal in
// 2 x 2), both eyes drawn in one grid (the left at its column 0, the right
// five along).
//   l lid, r the pale lilac, k the ring, s skin (a lid lifted off it)
export const EYES: HandEyes = {
  palette: pal(`l:#2a1c36 r:#c4b0f4 k:#4a3488 s:#f2d2b4`),
  states: {
    open: { at: [0, 0], rows: ['rk...kr', 'kr...rk'] },
    left: { at: [0, 0], rows: ['kr...kr', 'rk...rk'] },
    half: { at: [0, 0], rows: ['ll...ll', 'kr...rk'] },
    shut: { at: [0, 0], rows: ['ss...ss', 'll...ll'] },
    focus: { at: [-1, -1], rows: ['l.......l', '.lk...kl.', '.kr...rk.'] },
    happy: { at: [0, 0], rows: ['.l...l.', 'l.l.l.l'] },
    sad: { at: [-1, -1], rows: ['..l...l..', '.rk...kr.', '.kr...rk.'] },
    // startled: the brows up a row over the ringed eyes
    wide: { at: [0, -1], rows: ['ll...ll', 'rk...kr', 'kr...rk'] },
    smug: { at: [0, 0], rows: ['rk...ll', 'kr...rk'] },
  },
}

// ------------------------------------------------------------------ body

// a e d: a chakra rod (black, its shadow, the lilac glint)
export const BODY = pal(
  CLOAK_COLOURS +
    `
  s:#f2d2b4 k:#d6a486
  y:#ffa64e z:#e8742a
  a:#2a2638 e:#16141e d:#c4b0f4
`,
)

// A spike of the hair bent back while a hold stirs (the template's
// `<pose>Wind` drawings), under the head (only what shows past it is seen)
const SPIKE = { on: 'head' as const, at: [18, 1] as const, rows: ['.oo', 'oyzo', '.oo.'] }
const OVERLAYS = Object.fromEntries(['crossedWind', 'sign2Wind', 'spreadWind', 'thinkWind', 'strikeWind', 'raiseWind', 'sealWind', 'gatherWind', 'punchWind', 'chargeWind'].map(p => [p, [SPIKE]]))

export const PAIN: NinjaSprite = {
  id: 'pain',
  template: CLOAK,
  body: BODY,
  overlays: OVERLAYS,
  head: HEAD,
  heads: { turn: TURN },
  eyes: EYES,
  ...painMoves(CLOAK),
}

register(PAIN)
