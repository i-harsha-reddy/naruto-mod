// Shikamaru as a native sprite, on the shared 'vest' template
// (templates/vest.ts): the vest in his greens over a charcoal shirt, his head
// (the ponytail tuft, the gold earrings), his bored eyes, the forehead
// protector tied round his far arm (an overlay per pose), the lazy scratch at
// the side of his head for a cheer, the fingertips steepled for thinking, and
// his moves (anims/shikamaru.ts).

import { pal } from '../grid.ts'
import { register } from '../registry.ts'
import { VEST } from '../templates/vest.ts'
import type { HandEyes, HeadGrid, NinjaSprite, Overlay } from '../types.ts'
import { CHEER, NECK_BIND, POSSESSION, QUICK, SEWING, SHIKAMARU_POSES } from '../anims/shikamaru.ts'

// ------------------------------------------------------------------ head

// The mod's 20 x 19 head with a 1 px outline traced round it and touched up:
// the tuft re-cut into three clean spikes over its tie, the outline closed
// under the jaw.
//   a b c  hair: shadow (and the brows), mid, light
//   d e    skin, its shadow
//   f      the mouth
//   g      the earrings
//   o      outline
const HEAD: HeadGrid = {
  palette: pal(`
    a:#40362c b:#564a3e c:#7a6c5a d:#f0c69e e:#d8a47c f:#9a5a48 g:#f0c040
    o:#0e1019
  `),
  eyes: [
    [7, 12],
    [12, 12],
  ],
  neck: [10, 17],
  rows: [
    '.......o..o..o.......',
    '......ocoocoobo......',
    '.....occcccbbbo......',
    '.......occbbbo.......',
    '......oooaaaooo......',
    '....oocccbbbbbaoo....',
    '...occbbbbbbbbbaao...',
    '..ocbbbbbbbbbbbbbao..',
    '..ocbbbbbbbbbbbbbao..',
    '..ocbbbeeeeeeebbbao..',
    '..ocbddddddddddebao..',
    '..ocbddaadddaadebao..',
    '...odddddddddddeeo...',
    '...ogddddddddddego...',
    '....oddddddddddeo....',
    '.....oddddfdddeo.....',
    '......odddddeeo......',
    '.......ooddeoo.......',
    '.........ooo.........',
  ],
}

// The head turned three-quarters toward the post, for the blows (a cel's
// head: 'turn'): the face slid three pixels left, its profile at the edge
// (the far ear gone behind it, the far eye at the cheek's edge), the near ear
// and its earring showing on the right, the ponytail tuft swung two pixels
// back and the back of the head grown into the gap.
const HEAD_TURN: HeadGrid = {
  palette: HEAD.palette,
  eyes: [
    [4, 12],
    [9, 12],
  ],
  neck: [10, 17],
  rows: [
    '.........o..o..o.....',
    '........ocoocoobo....',
    '.......occcccbbbo....',
    '.........occbbbo.....',
    '........oooaaaooo....',
    '.....oocccbbbbbbaoo..',
    '....occbbbbbbbbbbbao.',
    '...ocbbbbbbbbbbbbbbao',
    '..ocbbbbbbbbbbbbbbbao',
    '.ocbeeeeeeebbbbbbbbao',
    '.oddddddddddebboobbao',
    'oddaadddaaddeboeeobao',
    'odddddddddddeboedobao',
    'odddddddddddeboeeoao.',
    '.oddddddddddebogoao..',
    '..oddddfdddeeeooo....',
    '...oddddddeeeo.......',
    '....ooddddeeo........',
    '......oooooo.........',
  ],
}

// ------------------------------------------------------------------ eyes

// Both eyes in one grid, its column 1 on the left eye ([7, 12]); the lids are
// drawn long and flat across them: his look is the bored one. Some states
// reach down to the mouth (row 3 of a grid at the eyes' row).
//   l lid, p pupil, w white, s e skin and its shadow, m mouth, n its shadow,
//   a the brows (the head's hair shadow)
const EYES: HandEyes = {
  palette: pal(`l:#3a2a22 p:#1e1612 w:#f4f1ee s:#f0c69e e:#d8a47c m:#9a5a48 n:#6a3a2e a:#40362c`),
  states: {
    open: { at: [-1, 0], rows: ['lll...lll', '.wp...pw.'] },
    // looking at the post
    left: { at: [-1, 0], rows: ['lll...lll', '.pw...pw.'] },
    half: { at: [-1, 0], rows: ['.ee...ee.', 'llp...pll'] },
    shut: { at: [-1, 1], rows: ['lll...lll'] },
    // his cheer: bored and calm, half-lidded, the mouth a flat line
    calm: { at: [-1, 0], rows: ['.ee...ee.', 'llp...pll', '.........', '...mmm...'] },
    // narrowed on the post, the brows drawn in
    focus: { at: [-1, -1], rows: ['...l.l...', 'lll...lll', '.pl...pl.'] },
    // his happy is a lazy one: still half-lidded, a smirk hitched up at one corner
    happy: { at: [-1, 0], rows: ['.ee...ee.', 'llp...pll', '.....m...', '...mm....'] },
    // the smirk with the eyes level on the post: the plan worked
    smug: { at: [-1, 0], rows: ['.ee...ee.', 'lpl...lpl', '.....m...', '...mm....'] },
    sad: { at: [-1, -1], rows: ['ll.....ll', '.........', '.lp...pl.', '.........', '...mmm...'] },
    // startled: the brows jumped up a row, the eyes round, the mouth an O
    wide: { at: [-1, -2], rows: ['.aa...aa.', '.ss...ss.', '.ww...ww.', '.wp...pw.', '.........', '....n....'] },
  },
}

// ------------------------------------------------------------------ body

// The vest's letters in his colours: the olive vest, the charcoal shirt and
// trousers, no red crest (the shoulder is the sleeve's), the forehead
// protector's plate (g h) on his arm. No book: the prop's letters are his
// book's colours only for the template's sake (he never holds it).
const BODY = pal(`
  o:#0e1019
  s:#f0c69e k:#d8a47c
  v:#9fae6e w:#717f45 x:#4a5530
  n:#50505c m:#383840 l:#26262c
  p:#484852 q:#36363e r:#24242a
  t:#26262e u:#54545f
  g:#e4e8f0 h:#8e94a8
  c:#50505c b:#d6d0c0
  a:#f48a24 e:#a84e12 d:#f6ecd0
  y:#7a6c5a z:#40362c
`)

// ------------------------------------------------------------------ the forehead protector

// Tied round his far arm: a 2 x 2 plate (g lit corner, h shade) on the upper
// arm, bulging a pixel past its outline, placed by hand for each pose: (x, y)
// the plate's top-left in the pose grid; `top` a row above it (closing the
// outline), `bottom` a row below.
const plate = (x: number, y: number, o: { top?: string; bottom?: string; wide?: boolean } = {}): Overlay => {
  const { top = '', bottom = '', wide = true } = o
  const rows: string[] = []
  if (top) rows.push(top)
  rows.push(wide ? 'gho' : 'gh', wide ? 'hho' : 'hh')
  if (bottom) rows.push(bottom)
  return { at: [x, y - (top ? 1 : 0)], rows }
}

const OVERLAYS: Readonly<Record<string, readonly Overlay[]>> = {
  idle0: [plate(20, 6)],
  idle1: [plate(20, 5)],
  sign1: [plate(21, 6, { top: '.o.' })],
  sign2: [plate(20, 6, { top: '.o.' })],
  // the Rat leant toward the post and away (anims/shikamaru.ts's mimic)
  sign2L: [plate(19, 6, { top: '.o.' })],
  sign2R: [plate(21, 6, { top: '.o.' })],
  // crouched in the seal (the Possession's catch): the Rat's, two rows lower
  kneel: [plate(20, 8, { top: '.o.' })],
  sign3: [plate(20, 6)],
  charge: [plate(20, 7)],
  windup: [plate(22, 8, { top: '.o.' })],
  dash: [{ at: [22, 6], rows: ['g', 'h'] }],
  strike: [plate(22, 6, { top: '.o.' })],
  follow: [plate(23, 7)],
  crouch: [{ at: [21, 7], rows: ['oo', 'gh', 'hh'] }],
  jump: [plate(19, 7, { top: 'oo.' })],
  slump: [plate(22, 7, { top: '.o.' })],
  sleep: [plate(21, 7, { top: '..o' })],
  thumbs: [plate(20, 6)],
  scratch: [plate(20, 17)],
  poke: [plate(20, 6, { bottom: '.o.' })],
  // thinking: forearms in from both elbows, the hands closed into his ring in
  // front of the chest (fingertips together over a dark hole, thumbs under it)
  think: [
    {
      at: [0, 6],
      rows: [
        '...........OOOO...........',
        '..........OSSKKO..........',
        '.....nm...OSOOKO....l.....',
        '....oNNNNNOKKKKOMMMMMo....',
        '.....OOOOOOOOOOOOOOOO.....',
      ],
    },
  ],
  kick: [plate(22, 5, { top: 'oo.' })],
  raise: [plate(20, 17)],
  slam: [{ at: [6, 9], rows: ['.gh', 'hh.'] }],
  spread: [{ at: [20, 6], rows: ['gh.', '.hh'] }],
  punch: [plate(22, 6, { top: 'oo.' })],
  gather: [plate(20, 6, { top: 'oo.', bottom: '.o.' })],
  crossed: [plate(20, 5)],
  wave: [plate(22, 14, { wide: false })],
  alert: [{ at: [22, 6], rows: ['gh'] }],
}

// the plate on every pose's Wind (the pose stirring in a moving hold): the
// same, a pixel up where the Wind heaves the shoulders
const up = (list: readonly Overlay[]): Overlay[] => list.map(o => ({ ...o, at: [o.at?.[0] ?? 0, (o.at?.[1] ?? 0) - 1] as const }))
const PLATES: Readonly<Record<string, readonly Overlay[]>> = {
  ...OVERLAYS,
  scratchWind: OVERLAYS['scratch']!,
  sign1Wind: up(OVERLAYS['sign1']!),
  sign2Wind: up(OVERLAYS['sign2']!),
  sign3Wind: up(OVERLAYS['sign3']!),
  crossedWind: up(OVERLAYS['crossed']!),
  gatherWind: up(OVERLAYS['gather']!),
  chargeWind: up(OVERLAYS['charge']!),
  spreadWind: up(OVERLAYS['spread']!),
  alertWind: up(OVERLAYS['alert']!),
  punchWind: up(OVERLAYS['punch']!),
  raiseWind: OVERLAYS['raise']!,
  strikeWind: OVERLAYS['strike']!,
  slamWind: OVERLAYS['slam']!,
}

export const SHIKAMARU: NinjaSprite = {
  id: 'shikamaru',
  template: VEST,
  body: BODY,
  head: HEAD,
  eyes: EYES,
  heads: { turn: HEAD_TURN },
  // his cheer is the lazy scratch at the side of his head, bored and calm
  // (cheer2: rubbing it a pixel lower); thinking, the fingertips steepled
  // with the eyes shut (the vest's think holds Kakashi's book)
  poses: {
    ...SHIKAMARU_POSES,
    cheer: { base: 'scratch', eyes: 'calm' },
    cheer2: { base: 'scratchWind', eyes: 'calm' },
    think: { base: 'idle0', eyes: 'shut' },
  },
  poseEyes: { scratch: 'calm' },
  overlays: PLATES,
  moves: [POSSESSION, NECK_BIND, SEWING],
  quick: QUICK,
  cheer: CHEER,
}

register(SHIKAMARU)
