// Itachi as a native sprite: everything that is his own over the shared
// 'cloak' template (templates/cloak.ts): his head, his Sharingan and its
// Mangekyō, his palette, his one-handed seal for a cheer, and his moves
// (anims/itachi.ts).

import { wear } from '../dress.ts'
import { pal } from '../grid.ts'
import { register } from '../registry.ts'
import { CLOAK, CLOAK_COLOURS } from '../templates/cloak.ts'
import type { Dojutsu, HandEyes, HeadGrid, NinjaSprite, Prop } from '../types.ts'
import { itachiMoves } from '../anims/itachi.ts'

// ------------------------------------------------------------------ head

// The mod's hand-drawn 20 x 19 head with a 1 px outline traced round it (one
// column wider on the right): near-black hair with a cool blue-grey sheen,
// parted in the middle (the part a dark line from the crown to the plate,
// the sheen sweeping out either side of it), the bangs framing the face in
// two dark locks from under the plate to the jaw, their tips hanging past it;
// the hair cut in at the nape where the low ponytail is tied (PONYTAIL, below);
// the Leaf plate slashed through (the rogue's mark: a dark slash across the
// symbol); the tear-trough lines a dark diagonal under each eye, from its
// inner corner down and out. The eyes are drawn by EYES.
//   a b c  hair: shadow, mid, sheen
//   d e    skin, its shadow under the bangs
//   f      the headband's cloth (and the slash, cut through to it)
//   g h j  its plate: lit, shaded, the symbol
//   i      the tear troughs; n the nose
//   o      outline
export const HEAD: HeadGrid = {
  palette: pal(`
    a:#1c1e29 b:#2c3042 c:#5a6782 d:#f4dac4 e:#dcb8a4
    f:#2a2f4e g:#d4d8e2 h:#8a90a4 i:#6a3434 j:#5a6078 n:#b0705e o:#0e1019
  `),
  eyes: [
    [7, 12],
    [12, 12],
  ],
  neck: [10, 17],
  rows: [
    '.......ooooooo.......',
    '.....oobbbabbboo.....',
    '....obbccbabcbbao....',
    '...obccbbbabbbcbao...',
    '..obcbbbbbabbbbcbao..',
    '.obcbbbbbbabbbbbcbao.',
    '.obcbbbbbbabbbbbbbao.',
    '.obcbfgffgjggggfbaao.',
    '.obcbfggjfffjggfbaao.',
    '.obcbfhhhhjhffhfbaao.',
    '.oabbbaeeeeeeeabbaao.',
    '.oabbbdddddddddbbaao.',
    '.oabbbddddddddebbo...',
    '.oabbbddddddddebbo...',
    '.oabbbddidddiddbbbao.',
    '.oabbbdiddnddiebbaao.',
    '..oabbadddddeeabbao..',
    '..obbooooddeoooobbo..',
    '...oo....ooo....oo...',
  ],
}

// The head turned three-quarters to the post, for his blows (a cel's head:
// 'turn'): the face, the plate and the eyes two pixels toward the arena, the
// near cheek gone narrow, the hair swung back into a broad mass behind.
export const TURN: HeadGrid = {
  palette: HEAD.palette,
  eyes: [
    [4, 12],
    [9, 12],
  ],
  neck: [10, 17],
  rows: [
    '........ooooooo........',
    '......oobbbbbbaoo......',
    '....oobbccbbbbbbaoo....',
    '...obccbbbbbbbbbbbaoo..',
    '..obcbbbabbbbbbbbabaao.',
    '.obcbbbbabbbbbbbabbaao.',
    '.obbbbbbabbbbbbabbbaao.',
    '.ofgffgjggggfabbbbbaao.',
    '.ofggjfffjggfabbbbbaao.',
    '.ofhhhhjhffhfabbbbbaao.',
    '.obaeeeeeeeeeabbbabaao.',
    '.obdddddddddeabbbabaao.',
    '.obddddddddddabbabbaao.',
    '.oddddddddddeabbabbaao.',
    '.odddidddiddeabbabbaao.',
    '.obdiddnddiebabbbbbaao.',
    '..obdddddeebbbbbbbbao..',
    '..ooooddeoooooobbbbao..',
    '...o..ooo......oooo....',
  ],
}

// ------------------------------------------------------------------ eyes

// His eyes, both drawn in one grid (the left eye at its column 0, the right
// five along), stamped at the viewer's left eye: the Sharingan's red always
// showing under the heavy lids, the pupils both toward the nose, or both
// toward the post. Awake (reading), the lids lift off the bright Sharingan;
// in his jutsu, the Mangekyō (the dojutsu below, its 'mk' states).
//   l lid, r the Sharingan's red, k its dark heart, g the bright red, b
//   blood, s skin (a lid lifted off it)
export const EYES: HandEyes = {
  palette: pal(`l:#2a1c26 r:#e0222c g:#ff4a3a k:#2a0608 b:#b0101c s:#f4dac4`),
  states: {
    // calm and heavy-lidded, the red iris under the lid, the pupils toward the nose
    open: { at: [0, 0], rows: ['ll...ll', 'rk...kr'] },
    // both toward the post
    left: { at: [0, 0], rows: ['ll...ll', 'kr...kr'] },
    half: { at: [0, 0], rows: ['ss...ss', 'lr...rl'] },
    shut: { at: [0, 0], rows: ['ss...ss', 'll...ll'] },
    // the lids pulled down hard, a brow pixel over each outer corner
    focus: { at: [-1, -1], rows: ['l.......l', '.ll...ll.', '.rk...kr.'] },
    // the faint eye-smile: an arch over each eye
    happy: { at: [0, 0], rows: ['.l...l.', 'l.l.l.l'] },
    sad: { at: [-1, -1], rows: ['..l...l..', '.ll...ll.', '.rk...kr.'] },
    // startled: the lids gone up, the whole red iris round the pupil
    wide: { at: [0, 0], rows: ['rr...rr', 'rk...kr'] },
    // a cool look down the nose: the far lid lowered
    smug: { at: [0, 0], rows: ['ll...ll', 'rk...ll'] },
    // the Mangekyō's glare (the dojutsu draws the eyes; the brows here)
    mk: { at: [-1, -1], rows: ['l.......l', '.ll...ll.', '.rk...kr.'] },
    // Amaterasu's price: a tear of blood running down from his left eye (the
    // viewer's), a pixel more each (the Mangekyō is drawn over the eyes)
    bleed1: { at: [0, 0], rows: ['ll...ll', 'rk...kr', 'b......'] },
    bleed2: { at: [0, 0], rows: ['ll...ll', 'rk...kr', 'b......', 'b......'] },
    bleed3: { at: [0, 0], rows: ['ll...ll', 'rk...kr', 'b......', 'b......', '.b.....'] },
  },
  moods: { mk: 'focus', bleed1: 'focus', bleed2: 'focus', bleed3: 'focus' },
}

// The dojutsu awake. Reading (the face's `active`): the Sharingan, the lids
// lifted off the bright red, a dark tomoe-heart each. In his jutsu (a cel's
// eyes 'mk', and the bleeding): the Mangekyō, the black pinwheel on red over
// both eyes. Half shut, the lids over it; a blink or the eye-smile at rest
// close it.
const MANGEKYO = { at: [-5, 0] as const, rows: ['gk...kg', 'kr...rk'] }
const DOJUTSU: Dojutsu = {
  eyes: { at: [-5, 0], rows: ['gr...rg', 'rk...kr'] },
  states: {
    half: { at: [-5, 0], rows: ['ll...ll', 'gr...rg'] },
    shut: null,
    happy: null,
    mk: MANGEKYO,
    bleed1: MANGEKYO,
    bleed2: MANGEKYO,
    bleed3: MANGEKYO,
  },
}

// ------------------------------------------------------------------ body

// the cloak's colours, his skin, his hair for the smears, a kunai's steel
export const BODY = pal(
  CLOAK_COLOURS +
    `
  s:#f4dac4 k:#dcb8a4
  y:#5a6782 z:#2c3042
  a:#c9ced8 e:#8b92aa d:#f4f6fa
`,
)

// His raise (the roster's cheer) is the template's one-handed seal, with its
// stirring and its breath; his moves name it 'seal'.
const OWN = { raise: 'seal', raiseWind: 'sealWind', raiseIn: 'sealIn' }

// A lock of the long hair blown out past its ends while a hold stirs (the
// template's `<pose>Wind` drawings), a pixel or two off the hair's right
// side, under the head (only what shows past it is seen)
const LOCK = { on: 'head' as const, at: [19, 14] as const, rows: ['.o', 'zzo', 'ozo', '.o.'] }
const OVERLAYS = Object.fromEntries(['crossedWind', 'sign2Wind', 'spreadWind', 'thinkWind', 'strikeWind', 'sealWind', 'gatherWind', 'punchWind', 'chargeWind'].map(p => [p, [LOCK]]))

// His low ponytail: tied at the nape and hanging behind his right shoulder,
// it shows past the back of his head as a tail flicked out over the cloak's
// shoulder (a break in the round of the head; placed from the head, so it
// rides with every nod, and hides behind the head and body where they cover it)
const PONYTAIL: Prop = { rows: ['.oo.', 'ozzo', 'oyzo', '.zzo', '..zo'], on: 'head', at: [19, 13], behind: true }

export const ITACHI: NinjaSprite = {
  id: 'itachi',
  template: CLOAK,
  body: BODY,
  poses: OWN,
  overlays: OVERLAYS,
  props: [PONYTAIL],
  head: HEAD,
  heads: { turn: TURN },
  eyes: EYES,
  dojutsu: DOJUTSU,
  ...itachiMoves(wear(CLOAK, OWN)),
}

register(ITACHI)
