// Sakura as a native sprite (Shippuden): the 'top' template (templates/top.ts)
// as her red top with the white circle, the pink apron skirt over dark shorts,
// her black gloves and elbow pads; her hand-drawn head (the pink bob under
// the red headband), her green eyes drawn over both eyes and the mouth at
// once, the skirt's back panel flung out behind her in the lunges and the
// run, and her moves (anims/sakura.ts).

import { pal } from '../grid.ts'
import { register } from '../registry.ts'
import { TOP } from '../templates/top.ts'
import type { HandEyes, HeadGrid, NinjaSprite, Overlay } from '../types.ts'
import { CHEER, IMPACT, KATSUYU, QUICK, SHANNARO } from '../anims/sakura.ts'

// ------------------------------------------------------------------ head

// The mod's hand-drawn 20 x 19 head with a 1 px
// dark outline traced round it, one column wider on the right, and the art's
// empty top row dropped: her bob is short, so it sits a row higher on the
// body than Kakashi's and shows one more row of it (seated, like every head,
// with its top 23 rows over the feet: the neck pixel is the outline under the
// chin). Touch-ups: the outline closed under the hair tips, the leaf engraved
// on the headband's plate, and the headband's knot tied off at her left
// temple, its two red tails flying out past the bob (her silhouette's
// break; the grid three columns wider on the left for it, the eyes and the
// neck moved with it).
//   a b c  hair: light, mid, shadow
//   d e    skin, its shadow
//   f g    the headband's red cloth, its shadow
//   h i    the headband's plate, its engraving
//   o      outline
const PALETTE = pal(`
  a:#ffc4dc b:#f6a2bf c:#d06a94 d:#fad8bc e:#e8b49a
  f:#e0404e g:#a02838 h:#eef0f6 i:#aab2c6 o:#0e1019
`)

const HEAD: HeadGrid = {
  palette: PALETTE,
  // each eye's top-left pixel (the eye grids span both eyes and the mouth)
  eyes: [
    [10, 11],
    [15, 11],
  ],
  neck: [13, 17],
  rows: [
    '.........ooooooooo......',
    '.......ooaaaaabbbboo....',
    '..o...oaaabbbbbbbbbco...',
    '.ofo.oaabbbbbbbbbbbbco..',
    '.oggfgfffffhhihhffffgo..',
    '..ofgogggggiiiiigggggco.',
    '.ofooabbbbeeeeeeebbbbco.',
    '.oo.oabbbedddddddebbbco.',
    '...oaabbedddddddddebbcco',
    '...oabbcddddddddddecbbco',
    '...oabbcddddddddddecbbco',
    '...oabbcddddddddddecbbco',
    '...oabbcddddddddddecbbco',
    '...oabbcdbdddddddbecbbco',
    '...oabbbcddddcdddecbbbco',
    '...oabbbbcdddddeecbbbbco',
    '....obobccccddeccccbobo.',
    '.....ooooooooooooooooo..',
  ],
}

// The head turned three-quarters toward the arena, for the blows (strike,
// punch, the run, the kick, the slam): a real turned head, not the front one
// slid over. The face at the front edge (the nose's tip breaking the far
// cheek), the jaw running back up from the chin into the bob; the headband
// wrapping round the head from its plate over the brow down to the knot at
// the back, its tail hanging out past the hair; the bob swept back over a
// round crown in strands of shade, its tips flicking at the nape. The eyes
// three pixels left.
const TURN: HeadGrid = {
  palette: PALETTE,
  eyes: [
    [4, 11],
    [9, 11],
  ],
  neck: [10, 17],
  rows: [
    '......oooooooo........',
    '....ooaaaaaabbboo.....',
    '...oaaaabbbbbbbbbo....',
    '..oaabbbbbbbbbbbbbco..',
    '..offhhihhffffbbbbbco.',
    '.oaggiiiiiggggfffbbbfo',
    '.oabeeeeeeebbbgggfffgo',
    '.oaedddddddebbbbcbggfo',
    'oaeddddddddebcbbbcbbgo',
    'oacddddddddecbcbbbcbbo',
    'oacddddddddecbbcbbbcbo',
    '.ocddddddddecbbcbbbbco',
    'odddddddddecbbbbcbbbo.',
    '.ocbdddddddecbbbbcbbo.',
    '.obcdddcddecbbbbbcbbco',
    '..obcddddecbbbbbbccbbo',
    '..obocddecooobbbobobo.',
    '...oooooooo..ooooooo..',
  ],
}

// ------------------------------------------------------------------ eyes

// Hand-drawn faces, each over both eyes (columns 0-1 and 5-6 of the grid
// stamped at the left eye) and, where the face changes it, the mouth (column
// 3, three rows down).
//   l lash and lid, p pupil, g iris, h its light, w white, s e skin and its
//   shadow, m mouth, d its inside, t tongue, b blush
const EYES: HandEyes = {
  palette: pal(`
    l:#3a1a2a p:#123026 g:#2fb87a h:#9fe8c2 w:#ffffff s:#fad8bc e:#e8b49a
    m:#b84a64 d:#5a1426 t:#e8707e b:#f6a2bf
  `),
  states: {
    // wide awake: the lash line over a two-row iris, the pupils toward the nose
    open: { at: [0, -1], rows: ['ll...ll', 'gp...pg', 'hg...gh'] },
    // a glance at the arena (left)
    left: { at: [0, -1], rows: ['ll...ll', 'pg...pg', 'gh...gh'] },
    // a blink's half frame, drowsy: the lash down a row
    half: { at: [0, -1], rows: ['ss...ss', 'll...ll', 'gp...pg'] },
    // shut (a blink, sleep, a landing): a soft U, the lash tails up
    shut: { at: [-1, -1], rows: ['.ss...ss.', 'lss...ssl', '.ll...ll.'] },
    // focus: the brows slanting down to the nose, the lids lowered
    focus: { at: [-1, -2], rows: ['.l.....l.', '..l...l..', '.ll...ll.', '.gp...pg.'] },
    // happy: ^^ arcs and an open smile
    happy: { at: [-1, -1], rows: ['.ll...ll.', 'l..l.l..l', '.ss...ss.', '.........', '...mdm...', '....t....'] },
    // sad (the slump): the brows up at the nose, the lids down, a small frown
    sad: { at: [-1, -2], rows: ['..l...l..', '.l.....l.', '.ll...ll.', '.pg...gp.', '.........', '....m....', '...m.m...'] },
    // surprised (alert): wide whites, pinprick pupils, an o mouth
    wide: { at: [0, -1], rows: ['ll...ll', 'ww...ww', 'wp...pw', '.......', '...d...', '...d...'] },
    // pleased with herself: the lids lowered, a crooked little smile
    smug: { at: [-1, -1], rows: ['.ss...ss.', '.ll...ll.', '.gp...pg.', '.....m...', '...mm....'] },
    // the battle cry ("Shannaro!"): the focus brows and lids, the mouth open wide
    shout: { at: [-1, -2], rows: ['.l.....l.', '..l...l..', '.ll...ll.', '.gp...pg.', '.........', '...ddd...', '...dtd...'] },
  },
}

// ------------------------------------------------------------------ body

// The top's letters in her colours: the red top and its white circle, bare
// arms, dark gloves, pink elbow pads to match the pink apron skirt and its
// waistband, dark shorts and boots; the scroll she reads (cream, red
// rollers).
const BODY = pal(`
  o:#0e1019
  s:#6a6280 k:#3a3548
  v:#e8545a w:#c8343c x:#8c2030
  n:#f4c8a4 m:#e0a882 l:#b87c60
  f:#ffc0d8 i:#f08cb4 j:#c0587e
  b:#d0608a
  p:#5a536c q:#3e3a4c r:#26232e
  t:#26232e u:#5a536c
  g:#ffc0d8 h:#d0709a
  c:#f4f2f6
  a:#f4ecd8 e:#c0443c d:#a08478
  y:#ffc4dc z:#d06a94
`)

// ------------------------------------------------------------------ the skirt

// The apron skirt's back panel kicks out behind her in the lunges and the
// run, so the skirt carries the motion the way Tsunade's haori does
// (bottom-aligned on the pose: '.' keeps the template's pixel).
const OVERLAYS: Readonly<Record<string, readonly Overlay[]>> = {
  // the Shannaro punch: the back panel flung up behind the planted back leg
  punch: [{ rows: ['......................oo..', '.....................jjjo.'] }],
  // the lunge: the back panel flicked out behind the hip
  strike: [{ at: [21, 9], rows: ['..o', 'jjo'] }],
  dash: [{ rows: ['....................oo....', '....................jjo...'] }],
  // the seals at the collar: her fingers bare out of the gloves' tops
  sign1: [{ at: [11, 7], rows: ['nmnm'] }],
  sign2: [{ at: [11, 7], rows: ['nmnm'] }],
  // the hand at the jaw: the finger along the cheek and the curled ones bare
  think: [{ at: [8, 4], rows: ['NM', 'NNM'] }],
  // the folded arms: the near fist's bare fingers curled over the far upper arm
  crossed: [{ at: [16, 8], rows: ['n'] }],
}

// A moving hold's other drawing (templates/top.ts's <pose>Wind: the hem
// trailing): the bob's tips on the far side swung out behind her too, over
// the hair's edge (UPPERCASE, measured from the head)
const HAIR: Overlay = { on: 'head', at: [22, 15], rows: ['.ZO', 'YZO', 'OO.'] }
const WINDS = ['gather', 'windup', 'slam', 'sign1', 'sign2', 'sign3', 'crossed', 'strike', 'follow', 'pump', 'hip', 'charge']
const STIRRED: Readonly<Record<string, readonly Overlay[]>> = Object.fromEntries(WINDS.map(p => [`${p}Wind`, [...(OVERLAYS[p] ?? []), HAIR]]))

export const SAKURA: NinjaSprite = {
  id: 'sakura',
  template: TOP,
  body: BODY,
  head: HEAD,
  eyes: EYES,
  overlays: { ...OVERLAYS, ...STIRRED },
  heads: { turn: TURN },
  // her cheer is her own: the fist pumped beside her face ("Cha!"), stirring as she holds it
  poses: { thumbs: 'pump', thumbsWind: 'pumpWind' },
  moves: [IMPACT, SHANNARO, KATSUYU],
  quick: QUICK,
  cheer: CHEER,
}

register(SAKURA)
