// Obito as a native sprite: everything that is his own over the shared
// 'cloak' template (templates/cloak.ts): the spiky dark hair over the orange
// spiral mask, the one eye hole and the Sharingan in it, Tobi's wave for a
// cheer, and his moves (anims/obito.ts).

import { wear } from '../dress.ts'
import { pal } from '../grid.ts'
import { register } from '../registry.ts'
import { CLOAK, CLOAK_COLOURS } from '../templates/cloak.ts'
import type { Dojutsu, HandEyes, HeadGrid, NinjaSprite } from '../types.ts'
import { obitoMoves } from '../anims/obito.ts'

// ------------------------------------------------------------------ head

// The mod's 20 x 19 head with a 1 px outline traced round it, the mask
// redrawn: rings wound round the single eye hole (on the viewer's left), lit
// along the top left, shaded down the right; the hair framing it. The eye
// hole is the 2 x 2 at `eyes[0]`; the other `eyes` spot is solid mask.
//   a b c  hair: mid, shadow, lit
//   d e f h  the mask: lit, mid, the rings' shadow, the deep rim
//   g      the hole
//   o      outline
export const HEAD: HeadGrid = {
  palette: pal(`
    a:#4a4c66 b:#3a3c56 c:#60668a d:#ffb060 e:#f08024 f:#9a4010
    g:#1a0c08 h:#c85a14 o:#0e1019
  `),
  eyes: [
    [7, 12],
    [12, 12],
  ],
  neck: [10, 17],
  rows: [
    '.....o....o....o.....',
    '....oco..oco..oco....',
    '....ocaoocaaoocao....',
    '..ooocaacaaaacaaooo..',
    '.ocaaaaaaaaaaaaaaabo.',
    '.ocaaaaaaaaaaaaaaabo.',
    '.ocaaaaaaaaaaaaaaabo.',
    '..ocaaaaaaaaaaaaabo..',
    '..ocaddddddddfefabo..',
    '..ocafffffffdfefabo..',
    '..ocaddddddfefefabo..',
    '...obdffffdfefefbo...',
    '...obefggfefefhfbo...',
    '...obefggfefefhfbo...',
    '...obeffffefefhfbo...',
    '....oeeeeeefhfhfo....',
    '.....offffffhfho.....',
    '......oohhhhhoo......',
    '........ooooo........',
  ],
}

// The head turned three-quarters to the post, for his blows (a cel's head:
// 'turn'): the mask and its eye hole a pixel toward the arena, its rings
// running round the near side, the spikes of hair swept back a pixel.
export const TURN: HeadGrid = {
  palette: HEAD.palette,
  eyes: [
    [4, 12],
    [9, 12],
  ],
  neck: [10, 17],
  rows: [
    '......o....o....o......',
    '.....oco..oco..oco.....',
    '.....ocaoocaaoocaoo....',
    '...ooocaacaaaacaaaoo...',
    '.ocaaaaaaaaaaaaaaaaabo.',
    '.ocaaaaaaaaaaaaaaaaabo.',
    '.ocaaaaaaaaaaaaaaaaabo.',
    '..ocaaaaaaaaaaaaaaabo..',
    '.oddddddddfefaaaaaabo..',
    '.offfffffdfefaaaaaabo..',
    '.oddddddfefefaaaaaabo..',
    '.odffffdfefefaaaaabo...',
    '.oefggfefefhfaaaaabo...',
    '.oefggfefefhfaaaaabo...',
    '.oeffffefefhfaaaabo....',
    '.oeeeeeefhfhfaaabo.....',
    '..offffffhfhabbo.......',
    '...oohhhhhoooo.........',
    '.....ooooo.............',
  ],
}

// ------------------------------------------------------------------ eyes

// Only the hole's eye shows (his eye grids are that one eye alone): dark,
// the Sharingan's red glint low in it. Shut is the hole as the mask has it
// (nothing drawn), so a blink is the glint going out.
//   k the dark, r the red, g the bright red of the Mangekyō, w a glint
export const EYES: HandEyes = {
  palette: pal(`k:#1a0c08 r:#d8141e g:#ff4a3a w:#f4f1ee`),
  states: {
    open: { at: [0, 0], rows: ['kk', 'kr'] },
    left: { at: [0, 0], rows: ['kk', 'rk'] },
    half: { at: [0, 0], rows: ['kk', 'kk'] },
    shut: { at: [0, 0], rows: ['..', '..'] },
    // the glare: the red burning across the bottom of the hole
    focus: { at: [0, 0], rows: ['kk', 'gg'] },
    // Tobi, cheerful: a white glint in the hole
    happy: { at: [0, 0], rows: ['wk', 'kk'] },
    sad: { at: [0, 0], rows: ['kk', 'kk'] },
    // startled: the eye wide, white round the red
    wide: { at: [0, 0], rows: ['wr', 'rw'] },
    smug: { at: [0, 0], rows: ['kk', 'kr'] },
    // the Mangekyō's glare (the dojutsu draws it over the hole)
    mk: { at: [0, 0], rows: ['kk', 'gg'] },
  },
  moods: { mk: 'focus' },
}

// The dojutsu awake. Reading (the face's `active`): the Sharingan in the
// hole, its red ringing the dark pupil. In his jutsu (a cel's eyes 'mk'): the
// Mangekyō, the bright red pinwheel. Stamped at the right eye's spot,
// reaching back over the hole; a blink or a smile at rest is the hole's own.
const DOJUTSU: Dojutsu = {
  eyes: { at: [-5, 0], rows: ['rk', 'kr'] },
  states: { half: { at: [-5, 0], rows: ['kk', 'rk'] }, shut: null, happy: null, mk: { at: [-5, 0], rows: ['gk', 'kg'] } },
}

// ------------------------------------------------------------------ body

export const BODY = pal(
  CLOAK_COLOURS +
    `
  s:#f2d0b2 k:#d6ae90
  y:#60668a z:#4a4c66
  a:#888888 e:#555555 d:#bbbbbb
`,
)

const OWN = { raise: 'wave', raiseWind: 'waveWind' }

// A spike of the hair bent back while a hold stirs (the template's
// `<pose>Wind` drawings), under the head (only what shows past it is seen)
const SPIKE = { on: 'head' as const, at: [17, 1] as const, rows: ['.oo', 'ozzo', '.oo.'] }
const OVERLAYS = Object.fromEntries(['crossedWind', 'sign2Wind', 'spreadWind', 'thinkWind', 'strikeWind', 'sealWind', 'gatherWind', 'punchWind', 'chargeWind'].map(p => [p, [SPIKE]]))

export const OBITO: NinjaSprite = {
  id: 'obito',
  template: CLOAK,
  body: BODY,
  // Tobi's wave is his raise (the roster's cheer), waving as it is held
  poses: OWN,
  overlays: OVERLAYS,
  head: HEAD,
  heads: { turn: TURN },
  eyes: EYES,
  dojutsu: DOJUTSU,
  ...obitoMoves(wear(CLOAK, OWN)),
}

register(OBITO)
