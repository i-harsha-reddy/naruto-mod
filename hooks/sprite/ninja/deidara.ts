// Deidara as a native sprite: everything that is his own over the shared
// 'cloak' template (templates/cloak.ts): the blond head with the long bang
// over one eye, his clay and its pouch, his cheer, and his moves
// (anims/deidara.ts).

import { wear } from '../dress.ts'
import { pal } from '../grid.ts'
import { register } from '../registry.ts'
import { CLOAK, CLOAK_COLOURS } from '../templates/cloak.ts'
import type { HandEyes, HeadGrid, NinjaSprite, Overlay } from '../types.ts'
import { deidaraMoves } from '../anims/deidara.ts'

// ------------------------------------------------------------------ head

// The mod's 20 x 19 head with a 1 px outline traced round it: the topknot,
// the long blond hair falling to the shoulders, the bang hiding the right eye
// (only the left is drawn), the Stone plate worn to one side. Touched up: the
// plate slashed through. Eyes are drawn by EYES.
//   a b c  hair: lit, mid, shadow
//   d e    skin, its shadow
//   f      the headband's cloth
//   g k h  its plate: lit, the slash, shaded
//   i      the mouth
//   o      outline
export const HEAD: HeadGrid = {
  palette: pal(`
    a:#fff4b0 b:#f4cc48 c:#c08a1c d:#f8d8ba e:#e4b494 f:#2a3150
    g:#c8ccd8 h:#868ba0 i:#c08070 k:#3a4058 o:#0e1019
  `),
  eyes: [
    [7, 12],
    [12, 12],
  ],
  neck: [10, 17],
  rows: [
    '........oooooo.......',
    '.......oaabbbbo......',
    '........oabcooo......',
    '........oabco........',
    '.....ooocffcoooo.....',
    '...ooaaabbbbbbbcoo...',
    '..oaaaaabbbbbbbbbco..',
    '.oaabbbbbbbbbbbbbbco.',
    '.oaffkkhgfcbbbbbbbco.',
    '.oaffghkhgcbbbbbbbco.',
    '.oaffhhhkkcbbbbbbbco.',
    '.oacceeeeeecabbbbbco.',
    '.oaccddddddcabbbbbco.',
    '.oaccddddddcabbbbbco.',
    '.oaccdddddddcabbbbco.',
    '.oacccddddiddcbbbbco.',
    '.oaccccddddddecbbbco.',
    '.oaccccccddecccbbbco.',
    '..ooooooooooooooooo..',
  ],
}

// The head turned three-quarters to the post, for his blows and throws (a
// cel's head: 'turn'): the face and the plate a pixel toward the arena, the
// near side of the hair thinned, the long bang and the hair behind it swung
// back a pixel wider.
export const TURN: HeadGrid = {
  palette: HEAD.palette,
  eyes: [
    [4, 12],
    [9, 12],
  ],
  neck: [10, 17],
  rows: [
    '.........oooooo........',
    '........oaabbbbo.......',
    '.........oabcooo.......',
    '.........oabco.........',
    '......ooocffcoooo......',
    '....ooaaabbbbbbbcoo....',
    '...oaaaabbbbbbbbbbcoo..',
    '..oaabbbbbbbbbbbbbbbco.',
    '.offkggfcbbbbbbbbbbbco.',
    '.ofggkgfcbbbbbbbbbbbco.',
    '.offhhkfcbbbbbbbbbbbco.',
    '.oeeeeeecabbbbbbbbbbco.',
    '.oddddddcabbbbbbbbbbco.',
    '.oddddddcabbbbbbbbbbco.',
    '.odddddddcabbbbbbbbbco.',
    '.odddddiddcbbbbbbbbbco.',
    '.ocdddddddecbbbbbbbbco.',
    '.occcdddddecccbbbbbbco.',
    '..oooooooooooooooooooo.',
  ],
}

// ------------------------------------------------------------------ eyes

// One big blue eye (the bang hides the other: his eye grids are that one
// eye alone): a white over the blue, the dark pupil toward the nose.
//   l lid, p pupil, w white, b blue, s skin (a lid lifted off it)
export const EYES: HandEyes = {
  palette: pal(`l:#5a3a20 p:#1c2440 w:#f8f6f0 b:#3a8ce6 s:#f8d8ba`),
  states: {
    open: { at: [0, 0], rows: ['wp', 'bp'] },
    left: { at: [0, 0], rows: ['pw', 'pb'] },
    half: { at: [0, 0], rows: ['ll', 'bp'] },
    shut: { at: [0, 0], rows: ['ss', 'll'] },
    focus: { at: [-1, -1], rows: ['l..', '.ll', '.bp'] },
    happy: { at: [-1, 0], rows: ['.ll.', 'l..l'] },
    sad: { at: [-1, -1], rows: ['..l', '.wp', '.bp'] },
    // startled: the brow up a row, white all round the blue
    wide: { at: [0, -1], rows: ['ll', 'ww', 'wb'] },
    // pleased with his art: the lid lowered
    smug: { at: [0, 0], rows: ['ll', 'bp'] },
  },
}

// ------------------------------------------------------------------ body

// a e d: white clay (main, shadow, light); g h: the clay pouch (tan, its
// shadow); y z his hair for smears
export const BODY = pal(
  CLOAK_COLOURS +
    `
  s:#f8d8ba k:#e4b494
  y:#f4cc48 z:#c08a1c
  a:#ece6d6 e:#b4aa94 d:#ffffff
  g:#a08a5a h:#6e5a36
`,
)

// His clay pouch, worn at the right hip over the cloak (tan, the flap lit):
// wherever the hip shows it is in the same place, and a sleeve or forearm
// held across covers it (the signs, gather, crossed) rather than it popping.
const P = (x: number, y: number, wide = true): Overlay => ({ at: [x, y], rows: wide ? ['ogg', 'ohho'] : ['ogg', 'ohh'] })
const LOCK: Overlay = { on: 'head', at: [18, 14], rows: ['.oo', 'oyzo', 'ozo.', '.o..'] }
const OVERLAYS: Readonly<Record<string, readonly Overlay[]>> = {
  idle0: [P(17, 10)],
  idle1: [P(17, 9), { at: [18, 11], rows: ['oo'] }],
  think: [P(17, 10), { at: [8, 5], rows: ['OOOO', 'ODAO'] }],
  thumbs: [P(17, 10)],
  sign3: [P(17, 10)],
  spread: [P(17, 10)],
  poke: [P(19, 10, false)],
  alert: [P(20, 12, false)],
  scratch: [P(17, 21)],
  raise: [P(18, 21)],
  cheer: [P(20, 21, false)],
  cheer2: [P(20, 21, false)],
  wave: [P(20, 21, false)],
  // chewing clay: a white lump cupped in the hands
  gather: [{ at: [10, 8], rows: ['.OOO.', 'ODAEO'] }],
  // and the mouths in his palms biting down on it: the lump squashed flat
  // and wide, the palms' lips parted under it (the chew's other beat: the
  // hands work, the body stays still)
  chew: [{ at: [9, 8], rows: ['.OOOOO.', 'OEADAEO', '.SoKoK.'] }],
  // a lock of the long hair blown out past its ends while a hold stirs (the
  // template's `<pose>Wind` drawings: they wear their pose's pouch too)
  ...Object.fromEntries(['crossedWind', 'sign2Wind', 'spreadWind', 'thinkWind', 'strikeWind', 'raiseWind', 'sealWind', 'punchWind', 'chargeWind'].map(p => [p, [LOCK]])),
  // (the cupped hands stirring keep their clay)
  gatherWind: [{ at: [10, 8], rows: ['.OOO.', 'ODAEO'] }, LOCK],
}

// his own: the chew's other beat (the gather's drawing, the clay bitten flat)
const OWN = { chew: { base: 'gather' } }

export const DEIDARA: NinjaSprite = {
  id: 'deidara',
  template: CLOAK,
  body: BODY,
  poses: OWN,
  overlays: OVERLAYS,
  head: HEAD,
  heads: { turn: TURN },
  eyes: EYES,
  ...deidaraMoves(wear(CLOAK, OWN)),
}

register(DEIDARA)
