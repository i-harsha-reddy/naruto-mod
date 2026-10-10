// The 'robe' outfit template: a chibi in a knee-to-shin robe or long coat,
// open at the front below a sash, with wide sleeves, trousers and sandals
// (Gaara's coat, Neji's robe, Orochimaru's kimono; with other palettes any
// robed ninja). Drawn once, in SEMANTIC letters; each ninja who wears it maps
// them to colours in their own file (ninja/<id>.ts's `body`):
//   o          outline
//   s k        skin, skin shadow (hands)
//   v w x      robe (chest and skirt): lit, mid, shadow
//   n m l      sleeves: lit, mid, shadow (wide: the cuff flares or hangs a pixel)
//   g h        sash: lit, shadow (laid in a twist, so a rope reads as a rope)
//   p q r      trousers (seen in the robe's open front and below the hem)
//   b          shin wrap
//   t u        sandals: shadow, lit
//   y z        hair, light and shadow (for smears and afterimages)
// and free for what a ninja wears over it (dress() below bakes it in):
//   i j        a mark's colours (Gaara: his strap's light and shade)
//   a e d c f  a prop's colours (Gaara: the gourd's sand, shade, light,
//              cork and band)
// UPPERCASE: the same colour drawn OVER the head. Light from the top left.
// The sleeves' outer pixels are UPPERCASE in standing poses: long hair
// (Neji's locks, Orochimaru's) falls behind the arms instead of hiding them;
// heads with a chin (Gaara's) never reach there, so nothing changes.
//
// Drawn in the prototype in 31 poses and since
// grown: every companion pose has its own drawing, plus the breath (idle1),
// the dash's smear, the follow-through, the landing crouch, the hop, the
// fist-pump cheer and its pump (cheer2) and the wave; the Rotation's turn
// seen side on and from behind (side, back); and for each pose a jutsu holds
// (crossed, sign2, spread, raise, think, strike, gather) its moving hold's
// flutter frame, `<pose>Wind` (kit.ts's hold(): the hanging sleeves and the
// hem trailed a pixel or two away from the arena), and its breath,
// `<pose>Breath` (the head sinks a pixel on a breath, and the body with it).
// Each pose: rows (29 wide, wider for the
// smear; root column 16, last row on the feet), as (the companion pose it
// stands for), breath, head [dx, dy], eyes (its default eye state), hand (the
// held hand, for effects) and two points for what is worn:
//   back   the nape, where the shoulders meet the neck (a gourd slung on the
//          back, long hair hanging behind)
//   waist  the sash's front (a knot, a belt)
// See templates/vest.ts for how to add a pose.

import type { Pose } from '../../art/chibi.ts'
import type { Grid, PoseGrid, Template, XY } from '../types.ts'

const POSES: Record<string, PoseGrid> = {
  // IDLE: the robe hangs straight, the cuffs flared a pixel, hands just out
  // of the sleeves; the front opens below the sash on the trousers
  idle0: {
    as: 'idle',
    breath: 'idle1',
    points: { back: [16, 4], waist: [16, 8] },
    rows: [
      '.............................',
      '.............................',
      '.............................',
      '.............................',
      '........oooooooooooooooo.....',
      '.......ONNNvvvwwwwwwwwXLO....',
      '.......ONMOvvwwwwwwwwxOLO....',
      '......ONNMOvwwwwwwwwxxOLLO...',
      '.......oskogghgghgghhhoko....',
      '.......oskovvwwwowwwxxoko....',
      '........oovvwwwoqowwxxxo.....',
      '..........oobbbooqqrooo......',
      '..........ouuttoouutto.......',
    ],
  },
  // inhale: shoulders and hands up a pixel, the chest a pixel taller
  idle1: {
    as: 'idle',
    points: { back: [16, 3], waist: [16, 8] },
    rows: [
      '.............................',
      '.............................',
      '.............................',
      '........oooooooooooooooo.....',
      '.......ONNNvvvwwwwwwwwXLO....',
      '.......ONMOvvwwwwwwwwxOLO....',
      '......ONNMOvwwwwwwwwxxOLLO...',
      '.......oskovwwwwwwwwxxoko....',
      '.......oskogghgghgghhhoko....',
      '........ooovvwwwowwwxxoo.....',
      '.........ovvwwwoqowwxxxo.....',
      '..........oobbbooqqrooo......',
      '..........ouuttoouutto.......',
    ],
  },
  // EASE: settling to rest at a move's end, the arms swinging back in to the
  // sides (the hands a pixel out from the robe, the far sleeve still swung
  // out), the hem swaying: a frame from rest, so a move's end never pops to it
  ease: {
    as: 'idle',
    points: { back: [16, 4], waist: [16, 8] },
    rows: [
      '.............................',
      '.............................',
      '.............................',
      '.............................',
      '........oooooooooooooooo.....',
      '.......ONNNvvvwwwwwwwwXLO....',
      '......ONNMOvvwwwwwwwwxOLLO...',
      '......ONMMOvwwwwwwwwxxOLLLO..',
      '......oskoogghgghgghhhoooko..',
      '......oskoovvwwwowwwxxooko...',
      '.......oo.oovwwwoqowwxxxo....',
      '..........oobbbooqqrooo......',
      '..........ouuttoouutto.......',
    ],
  },
  // OX: elbows thrown wide, the flat hand under the upright one at the belly,
  // the wide sleeves hanging under the forearms
  sign1: {
    as: 'signs',
    eyes: 'focus',
    points: { back: [16, 4], waist: [16, 9] },
    rows: [
      '.............................',
      '.............................',
      '.............................',
      '.............................',
      '........oooooooooooooooo.....',
      '.......ONNNvvvwwwwwwwwXLO....',
      '......ONNMOvvwwwOOOOwxOLLO...',
      '......ONMMOvwwwOSKOwwxOLLO...',
      '.....ONMMOOOOOOSKKOOOOOOMLO..',
      '.....OONNNNNNOSSSKKOMMMMMOO..',
      '......OONMMMLOOOOOOOMLLLOO...',
      '.......OOOOObbbooqqrOOOOO....',
      '..........ouuttoouutto.......',
    ],
  },
  // RABBIT: the joined hands held up before the middle, a 4 x 3 block of
  // them (two fingertips each, split, over the palms pressed together, the
  // wrists coming out of the sleeves), the sash's row clear between them and
  // the chin, so they never read as a beard; the elbows out at the sides, the
  // forearms and their wide sleeves running in to the wrists, hemmed below
  sign2: {
    as: 'signs2',
    breath: 'sign2Breath',
    eyes: 'focus',
    hand: [15, 9],
    points: { back: [16, 4], waist: [16, 8] },
    rows: [
      '.............................',
      '.............................',
      '.............................',
      '.............................',
      '........oooooooooooooooo.....',
      '.......ONNNvvvwwwwwwwwXLO....',
      '.......ONMOvvwwwwwwwwxOLO....',
      '......ONNMOvwwwwwwwwxxOLLO...',
      '......ONMMOgghgghgghhhOMLO...',
      '......ONMMOOOOskskOOOOMLLO...',
      '......ONNNNNMOsskkOMMMLLLO...',
      '.......OOOOOOOkkkkOOOOOOO....',
      '..........ouuttoouutto.......',
    ],
  },
  // the breath: the head sinks a pixel, and the body with it, the knees
  // taking it (the wrists drawn up into the sleeves)
  sign2Breath: {
    as: 'signs2',
    eyes: 'focus',
    hand: [15, 10],
    points: { back: [16, 5], waist: [16, 9] },
    rows: [
      '.............................',
      '.............................',
      '.............................',
      '.............................',
      '.............................',
      '........oooooooooooooooo.....',
      '.......ONNNvvvwwwwwwwwXLO....',
      '.......ONMOvvwwwwwwwwxOLO....',
      '......ONNMOvwwwwwwwwxxOLLO...',
      '......ONMMOgghgghgghhhOMLO...',
      '......ONMMOOOOskskOOOOMLLO...',
      '......ONNNNNMOsskkOMMMLLLO...',
      '..........ouuttoouutto.......',
    ],
  },

  // RABBIT, in the wind of the jutsu: the far elbow's sleeve and the hem
  // trailed a pixel away from the arena (hold()'s flutter frame)
  sign2Wind: {
    as: 'signs2',
    eyes: 'focus',
    hand: [15, 9],
    points: { back: [16, 4], waist: [16, 8] },
    rows: [
      '.............................',
      '.............................',
      '.............................',
      '.............................',
      '........oooooooooooooooo.....',
      '.......ONNNvvvwwwwwwwwXLO....',
      '.......ONMOvvwwwwwwwwxOLO....',
      '......ONNMOvwwwwwwwwxxOLLO...',
      '......ONMMOgghgghgghhhOMLLO..',
      '......ONMMOOOOskskOOOOMLLLO..',
      '.......ONNNNMOsskkOMMMLLLLO..',
      '........OOOOOOkkkkOOOOOOOO...',
      '..........ouuttoouutto.......',
    ],
  },
  // MONKEY: the near elbow cocked up and out, its sleeve hanging off it, the
  // hands meeting point-forward
  sign3: {
    as: 'signs3',
    eyes: 'focus',
    points: { back: [16, 4], waist: [16, 9] },
    rows: [
      '.............................',
      '.............................',
      '.............................',
      '.....OOO.....................',
      '....ONNNO.oooooooooooooo.....',
      '....ONMMNOOvvwwwwwwwwXLO.....',
      '....OMLMMNNOOOOOwwwwxOLO.....',
      '.....OLLOMMNNNOOOwwxxOLLO....',
      '......OO.OOMMMOSSSKOwxOLLO...',
      '..........OOOOSSKKOMMMMMLO...',
      '.........ovvwwwoqowwxLLLO....',
      '..........oobbbooqqroooo.....',
      '..........ouuttoouutto.......',
    ],
  },
  // CHARGE: knees bent, the coat's panels parted over them, the chakra hand
  // thrust forward and down, the other hand clamped on its wrist
  charge: {
    as: 'charge',
    head: [-1, 2],
    eyes: 'focus',
    hand: [4, 8],
    points: { back: [16, 5], waist: [19, 9] },
    rows: [
      '.............................',
      '.............................',
      '.............................',
      '.............................',
      '.............................',
      '........oooooooooooooooo.....',
      '.......ONNNvvvwwwwwwwwXLO....',
      '.....OONNMOvwwwwwwwwxxOLO....',
      '...OONNNMOOOOOOOwwwwxxOLO....',
      '...SKNMMMOSKMMMMMOgghhoko....',
      '...KKLLLOovvwwwwwwoqowxxo....',
      '...OOOOOobbbooooqqqroooo.....',
      '......ouuuto....ouuutto......',
    ],
  },
  // WINDUP: sunk low and rocked back on the back foot, the chakra hand drawn
  // in low at the front, the far fist cocked at the ribs; the coat swings
  // forward off the back leg
  windup: {
    as: 'gather',
    head: [2, 3],
    eyes: 'focus',
    hand: [7, 11],
    points: { back: [16, 8], waist: [15, 11] },
    rows: [
      '.............................',
      '.............................',
      '.............................',
      '.............................',
      '.............................',
      '.............................',
      '.............................',
      '...........ooooooooooooooo...',
      '.........ONNNvvvwwwwwwwwXLO..',
      '........ONMMOvwwwwwwwwxxOLO..',
      '.......ONMMOOvwwwwwOOOOOOLO..',
      '......ONMMLOgghghhOSKKOOOO...',
      '.....OSKLLOovvwwwwOOOOxxo....',
      '.....OSKKOovvwwwwwooqqqro....',
      '......OOOOuuuttooo..ouuutto..',
    ],
  },
  // DASH smear: the run frame smeared back along its path, streaks of hair,
  // coat and trousers trailing, the front edge crisp
  smear: {
    as: 'dash',
    head: [-4, 3],
    eyes: 'focus',
    hand: [5, 20],
    points: { back: [17, 16], waist: [17, 20] },
    rows: [
      '........................................',
      '........................................',
      '........................................',
      '........................................',
      '........................................',
      '........................................',
      '....................yyyyyz...yz.........',
      '........................................',
      '......................yyyyyyyyzz...yz...',
      '........................................',
      '.......................yyyyyz..z........',
      '.......................yyyyyyyyyzz...z..',
      '........................................',
      '......................zzzzz...z.........',
      '........................................',
      '........................................',
      '............oooooooooooooo..............',
      '..........onnvvvwwwwwwwwxxlxxwwww..ww...',
      '.........onmmvwwwwwwwwxxolmmll..m.......',
      '.......oonmmovwwwwwwwxxolwwwwxxww..w..x.',
      '.....oskmmmoogghgghghhoxxwwxx..xx..x....',
      '....oskkooo.ovvwwwwwwxxxxwwxxx..x.......',
      '.....oo....obbbbo..ooqqrrqq...r..r......',
      '..........ouuuttto...oouttt..tt.........',
    ],
  },
  // DASH: the run's contact frame, a long low split, the coat's back and
  // tail flung out behind (all that shows past a big head), the chakra
  // carried forward and low
  dash: {
    as: 'dash',
    head: [-4, 3],
    eyes: 'focus',
    hand: [5, 9],
    points: { back: [16, 5], waist: [18, 9] },
    rows: [
      '.............................',
      '.............................',
      '.............................',
      '.............................',
      '.............................',
      '............ooooooooooooo....',
      '..........onnvvvwwwwwwwwxoo..',
      '.........onmmvwwwwwwwwwwwxxo.',
      '.......oonmmovwwwwwwwwwwxxxo.',
      '.....oskmmmooggghgghgghhwxxoo',
      '....oskkooo.ovvwwwwwwwwwxxxxo',
      '.....ooo...obbbboooovwwwxxxo.',
      '..........ouuuttto..oqqrooo..',
      '...........oooooo...oouutto..',
    ],
  },
  // STRIKE: the arm driven straight out at the post just under the chin, a
  // forearm long (the sleeve 5 px, the fist past it: an arm, never a rod; the
  // effect carries the reach), clear of the head so it reads whole, the wide
  // cuff hanging under the wrist; the coat billowing out behind, the front
  // knee bent, the back leg long
  strike: {
    as: 'strike',
    breath: 'strikeBreath',
    head: [-2, 0],
    eyes: 'focus',
    hand: [6, 8],
    points: { back: [16, 4], waist: [20, 8] },
    rows: [
      '.............................',
      '.............................',
      '.............................',
      '.............................',
      '............ooooooooooooo....',
      '..........oonnvvvwwwwwwxxo...',
      '..........ONNmvvwwwwwwwxxxo..',
      '......OOOOONMmvwwwwwwwwwxxxo.',
      '.....OSSnnnnnmogghgghhhhwxxxo',
      '.....OKKmmmmmovvwwwoqqowwxxxo',
      '......OOlll.obbbboo..oqqrrxo.',
      '........oooouuuttto...ouutto.',
    ],
  },
  // the breath: the head sinks a pixel, and the body with it, the knees taking it
  strikeBreath: {
    as: 'strike',
    head: [-2, 0],
    eyes: 'focus',
    hand: [6, 9],
    points: { back: [16, 5], waist: [20, 9] },
    rows: [
      '.............................',
      '.............................',
      '.............................',
      '.............................',
      '.............................',
      '............ooooooooooooo....',
      '..........oonnvvvwwwwwwxxo...',
      '..........ONNmvvwwwwwwwxxxo..',
      '......OOOOONMmvwwwwwwwwwxxxo.',
      '.....OSSnnnnnmogghgghhhhwxxxo',
      '.....OKKmmmmmovvwwwoqqowwxxxo',
      '......OOoooouuuttto...ouutto.',
    ],
  },

  // STRIKE, in the wind of the jutsu: the hanging sleeves and the hem
  // trailed a pixel or two away from the arena (hold()'s flutter frame)
  strikeWind: {
    as: 'strike',
    head: [-2, 0],
    eyes: 'focus',
    hand: [6, 8],
    points: { back: [16, 4], waist: [20, 8] },
    rows: [
      '..............................',
      '..............................',
      '..............................',
      '..............................',
      '............ooooooooooooo.....',
      '..........oonnvvvwwwwwwxxoo...',
      '..........ONNmvvwwwwwwwxxxxo..',
      '......OOOOONMmvwwwwwwwwwxxxxo.',
      '.....OSSnnnnnmogghgghhhhwxxxxo',
      '.....OKKmmmmmovvwwwoqqowwxxxxo',
      '......OOOlll.obbbboo.oqqrrxoo.',
      '.........ooouuuttto...ouutto..',
    ],
  },
  // PALM: the Gentle Fist's thrust at a palm's length: the near arm out at
  // the shoulder, straight, the open palm (fingers up) four pixels clear of
  // the head, so a palm on the post's face keeps his face off it; the head
  // held upright over the lunge (the Hyuga stance, the back straight), the
  // wide cuff hanging under the wrist (Neji's palms, the Vacuum Palm)
  palm: {
    as: 'strike',
    head: [0, 0],
    eyes: 'focus',
    hand: [3, 7],
    points: { back: [16, 4], waist: [20, 8] },
    rows: [
      '.............................',
      '.............................',
      '.............................',
      '.............................',
      '...OO.......ooooooooooooo....',
      '..OSKO....oonnvvvwwwwwwxxo...',
      '..OSKOOOOONNmvvwwwwwwwxxxo...',
      '..OSKnnnnnnnmvwwwwwwwwwxxxo..',
      '..OKKmmmmmmmmogghgghhhhwxxxo.',
      '...OOlllloooovvwwwoqqowwxxxo.',
      '.....oooo...obbbboo..oqqrrxo.',
      '...........ouuuttto...ouutto.',
    ],
  },
  // PALM, low: the same thrust driven in under the last, the arm angled down
  // from the shoulder to the palm at the hip's height (the palms' other beat)
  palmLow: {
    as: 'strike',
    head: [0, 1],
    eyes: 'focus',
    hand: [3, 9],
    points: { back: [16, 4], waist: [20, 8] },
    rows: [
      '.............................',
      '.............................',
      '.............................',
      '.............................',
      '............ooooooooooooo....',
      '..........oonnvvvwwwwwwxxo...',
      '..........ONNmvvwwwwwwwwxxxo.',
      '...OO....ONNMmvwwwwwwwwwxxxo.',
      '..OSKOOOONMMMogghgghhhhwxxxo.',
      '..OSKnnnnnnnLvvwwwoqqowwxxxo.',
      '..OKKmmmmmmobbbboo..oqqrrxo..',
      '...OOOOOOOouuuttto...ouutto..',
    ],
  },
  // PALMS A BLUR (the Sixty-Four Palms past sixteen): the arm smeared into a
  // wedge from the shoulder, its leading edge a stack of palms (skin and its
  // shade by turns, two pixels each), so a frame reads as many blows at once
  palmSmear: {
    as: 'strike',
    head: [0, 0],
    eyes: 'focus',
    hand: [3, 7],
    points: { back: [16, 4], waist: [20, 8] },
    rows: [
      '.............................',
      '.............................',
      '.............................',
      '.............................',
      '..OOOO......ooooooooooooo....',
      '.OSSKKOOO.oonnvvvwwwwwwxxo...',
      '.OKKSSnnnOONNmvvwwwwwwwxxxo..',
      '.OSSKKmmmnnnnmvwwwwwwwwwxxxo.',
      '.OKKSSnnnmmmmmogghgghhhhwxxxo',
      '.OSSKKmmmllooovvwwwoqqowwxxxo',
      '..OOOOllloo.obbbboo..oqqrrxo.',
      '......ooo..ouuuttto...ouutto.',
    ],
  },
  // and its other frame, the wedge swung a pixel lower and the stack shifted
  palmSmearB: {
    as: 'strike',
    head: [0, 0],
    eyes: 'focus',
    hand: [3, 8],
    points: { back: [16, 4], waist: [20, 8] },
    rows: [
      '.............................',
      '.............................',
      '.............................',
      '.............................',
      '............ooooooooooooo....',
      '..OOOO....oonnvvvwwwwwwxxo...',
      '.OSSKKOOOOONNmvvwwwwwwwxxxo..',
      '.OKKSSnnnnnnnmvwwwwwwwwwxxxo.',
      '.OSSKKmmmmmmmmogghgghhhhwxxxo',
      '.OKKSSnnnmmooovvwwwoqqowwxxxo',
      '.OSSKKmmmll.obbbboo..oqqrrxo.',
      '..OOOOooo..ouuuttto...ouutto.',
    ],
  },
  // THE LAST PALM driven home: the deepest lunge, sunk a pixel, the feet a
  // stride wider, the arm straight from the shoulder and a pixel longer
  palmDrive: {
    as: 'strike',
    head: [0, 1],
    eyes: 'focus',
    hand: [2, 8],
    points: { back: [16, 5], waist: [20, 9] },
    rows: [
      '..............................',
      '..............................',
      '..............................',
      '..............................',
      '..............................',
      '..OO.........ooooooooooooo....',
      '.OSKO.....ooonnvvvwwwwwwxxo...',
      '.OSKOOOOOOONNmvvwwwwwwwwxxxo..',
      '.OSKnnnnnnnnmvwwwwwwwwwwxxxxo.',
      '.OKKmmmmmmmmmogghgghhhhhwwxxxo',
      '..OOlllloooooovvwwwwooqqqrrxxo',
      '.........ouuuuttto.....oouutto',
    ],
  },
  // FOLLOW-THROUGH: carried past the hit, the coat swinging forward over the
  // front leg, the back foot kicked up behind
  follow: {
    as: 'punch',
    head: [-3, 3],
    eyes: 'focus',
    hand: [7, 9],
    points: { back: [16, 6], waist: [19, 10] },
    rows: [
      '.............................',
      '.............................',
      '.............................',
      '.............................',
      '.............................',
      '.............................',
      '..............oooooooooooooo.',
      '.........ooooonvvvwwwwwwwxxoo',
      '.......oONNNNNmvwwwwwwwwwwxxo',
      '......OSKMMMMMmovwwwwwwwwxxxo',
      '......OKKOLLLOogghgghgghhwxxo',
      '.......OOovvvwwwwwwwwwxxxxxo.',
      '.......ovvvwwwwoooowwxxxooto.',
      '........oouuuttto..oooooouo..',
    ],
  },
  // CROUCH: the landing squash, knees wide under the pooled coat, the arms
  // out for balance with the sleeves hanging
  crouch: {
    as: 'slam',
    head: [0, 3],
    eyes: 'shut',
    points: { back: [16, 7], waist: [16, 10] },
    rows: [
      '.............................',
      '.............................',
      '.............................',
      '.............................',
      '.............................',
      '.............................',
      '.............................',
      '..........oooooooooooooo.....',
      '.....OOOOONNvvvwwwwwwwXLOOO..',
      '....ONNNMMOvvwwwwwwwwxOMMLLO.',
      '....OSKMLLOgghgghgghhhOLLSKO.',
      '.....OOOOOvvwwwwowwwwxxOOOO..',
      '.......oovvwwwwoqoowwxxxoo...',
      '......ouuttttooooooouuuttto..',
    ],
  },
  // TUCK: a cannonball in the air, knees hugged up under the chin inside the
  // coat, hands on the shins, the soles showing
  tuck: {
    as: 'tuck',
    head: [0, 4],
    eyes: 'shut',
    points: { back: [16, 3], waist: [16, 6] },
    rows: [
      '.............................',
      '.............................',
      '.........oooooooooooooo......',
      '......OOONNvvvwwwwwwwXLO.....',
      '.....OvvvONvwwwwwwwwxOLOO....',
      '....OvvwwwOSKwwwwwwxOwwwxO...',
      '...OvvwwxxOKKOgghhhOwwwwxxO..',
      '...OvwwxxxxOooqqqqoxxxxxxxxO.',
      '....ooouuttoooooooooouuttooo.',
      '......oooooo.........oooo....',
    ],
  },
  // JUMP: the happy hop, heels kicked up behind, a fist pumped beside the
  // face, the hem flipped up by the hop
  jump: {
    as: 'raise',
    head: [0, 2],
    eyes: 'happy',
    points: { back: [16, 6], waist: [15, 10] },
    rows: [
      '.............................',
      '....OO.......................',
      '...OSKO......................',
      '...OKKO......................',
      '...ONMO......................',
      '....ONMO.....................',
      '.....ONMOooooooooooooo.......',
      '......OONNvvvwwwwwwwXLO......',
      '........ONMOvwwwwwwxOLO......',
      '........OMMOvwwwwwwxOKO......',
      '........OOOgghgghghhOOO......',
      '.......ovvvwwwwoqowwxxxo.....',
      '......ovvwwwooobbbooqqrtto...',
      '.......ooooooouuto.oooqqtto..',
      '..............ooo.....oooo...',
    ],
  },
  // CHEER: a fist pumped high on the far side, the near hand on the hip
  // (a robe wearer with a cheer of their own names it in their spec)
  cheer: {
    as: 'raise',
    breath: 'cheer2',
    eyes: 'happy',
    hand: [26, 3],
    points: { back: [16, 15], waist: [16, 19] },
    rows: [
      '.............................',
      '.............................',
      '.........................OO..',
      '........................OSSO.',
      '........................OSKKO',
      '........................OKKO.',
      '.........................OSO.',
      '.........................OSO.',
      '........................OSKO.',
      '........................ONMO.',
      '........................ONMLO',
      '........................OMMLO',
      '.......................OMMLLO',
      '.......................OMMLO.',
      '......................OMMLO..',
      '........ooooooooooooooOMLO...',
      '.......ONNNvvvwwwwwwwwxLO....',
      '.......ONMOvvwwwwwwwwxOO.....',
      '......ONNMOvwwwwwwwwxxo......',
      '......OSKOogghgghgghhho......',
      '.......OOOovvwwwowwwxxo......',
      '.........ovvwwwoqowwxxxo.....',
      '..........oobbbooqqrooo......',
      '..........ouuttoouutto.......',
    ],
  },
  // the pump: the fist brought down a pixel
  cheer2: {
    as: 'raise',
    eyes: 'happy',
    hand: [25, 5],
    points: { back: [16, 15], waist: [16, 19] },
    rows: [
      '.............................',
      '.............................',
      '.............................',
      '.............................',
      '........................OOO..',
      '.......................OSSKO.',
      '.......................OSKKO.',
      '........................OKO..',
      '........................OSO..',
      '.......................OSKO..',
      '.......................ONMO..',
      '.......................ONMLO.',
      '.......................OMMLO.',
      '......................OMMLLO.',
      '......................OMMLO..',
      '........ooooooooooooooOMLO...',
      '.......ONNNvvvwwwwwwwwxLO....',
      '.......ONMOvvwwwwwwwwxOO.....',
      '......ONNMOvwwwwwwwwxxo......',
      '......OSKOogghgghgghhho......',
      '.......OOOovvwwwowwwxxo......',
      '.........ovvwwwoqowwxxxo.....',
      '..........oobbbooqqrooo......',
      '..........ouuttoouutto.......',
    ],
  },
  // SLUMP: the whole frame sags forward, head hung out in front, the back
  // rounded behind it, arms and sleeves dangling to the knees
  slump: {
    as: 'slump',
    head: [-3, 2],
    eyes: 'sad',
    points: { back: [16, 6], waist: [17, 10] },
    rows: [
      '.............................',
      '.............................',
      '.............................',
      '.............................',
      '.............................',
      '................oooooooo.....',
      '.............oooonvvwwxxoo...',
      '..........oooonnmvwwwwwxxlo..',
      '.......OONNMMMOvwwwwwwwxxlo..',
      '......ONNMMOOvwwwwwwwwxxolo..',
      '......ONMLLOgghgghgghhhooko..',
      '......OSKLOvvwwwwowwwxxooo...',
      '......OSKKOvvwwwoqowwxxo.....',
      '.......OOOOOouuttoouutto.....',
    ],
  },
  // SLEEP: sat cross-legged, nodded off, the head drooped onto the chest: the
  // shoulders and the robe either side of the chin down to the sash, the wide
  // sleeves bent at the elbows (their outer pixels UPPERCASE, as standing, so
  // long hair falls behind them) and the forearms in along the thighs to the
  // hands folded in the lap, the skirt spread over the knees (a pixel or two
  // past the head on each side) and open at the front on the crossed shins,
  // the sandals' toes peeking where they cross; one rounded base on the floor
  sleep: {
    as: 'sleep',
    head: [0, 2],
    eyes: 'shut',
    points: { back: [16, 6], waist: [16, 9] },
    rows: [
      '.............................',
      '.............................',
      '.............................',
      '.............................',
      '.............................',
      '........ooooooooooooooooo....',
      '.......ONNOvvwwwwwwwwxOMLO...',
      '.......ONMOvvwwwwwwwxxOMLO...',
      '.......ONMOvwwwwwwwwxxOMLO...',
      '.....oooNMMOgghgghgghOMMLooo.',
      '....ovvwonnmmsssksskmmllowxxo',
      '....ovwwwwwwouutouutowwwwxxxo',
      '.....ooooooooooooooooooooooo.',
    ],
  },
  // THINK: the near hand up at the jaw (outlined, so it parts from the face),
  // the elbow tucked, the other arm hanging
  think: {
    as: 'think',
    breath: 'thinkBreath',
    eyes: 'half',
    hand: [13, 5],
    points: { back: [16, 4], waist: [16, 8] },
    rows: [
      '.............................',
      '.............................',
      '.............................',
      '.............................',
      '........oooOOOOoooooooo......',
      '.......ONNNOSSKOwwwwwwXLO....',
      '.......ONMOOSKKOwwwwwxOLO....',
      '......ONNMMONMOwwwwwxxOLLO...',
      '......ONMMMMMOgghgghhhhoko...',
      '.......OOOOOOvwwwowwwxxoko...',
      '........oovvwwwoqowwxxxoo....',
      '..........oobbbooqqrooo......',
      '..........ouuttoouutto.......',
    ],
  },
  // the breath: the head sinks a pixel, and the body with it, the knees taking it
  thinkBreath: {
    as: 'think',
    eyes: 'half',
    hand: [13, 6],
    points: { back: [16, 5], waist: [16, 9] },
    rows: [
      '.............................',
      '.............................',
      '.............................',
      '.............................',
      '.............................',
      '........oooOOOOoooooooo......',
      '.......ONNNOSSKOwwwwwwXLO....',
      '.......ONMOOSKKOwwwwwxOLO....',
      '......ONNMMONMOwwwwwxxOLLO...',
      '......ONMMMMMOgghgghhhhoko...',
      '.......OOOOOOvwwwowwwxxoko...',
      '........oovvwwwoqowwxxxoo....',
      '..........ouuttoouutto.......',
    ],
  },

  // THINK, in the wind of the jutsu: the hanging sleeves and the hem
  // trailed a pixel or two away from the arena (hold()'s flutter frame)
  thinkWind: {
    as: 'think',
    eyes: 'half',
    hand: [13, 5],
    points: { back: [16, 4], waist: [16, 8] },
    rows: [
      '.............................',
      '.............................',
      '.............................',
      '.............................',
      '........oooOOOOoooooooo......',
      '.......ONNNOSSKOwwwwwwXLO....',
      '.......ONMOOSKKOwwwwwxOLLO...',
      '......ONNMMONMOwwwwwxxOLLLO..',
      '......ONMMMMMOgghgghhhhokko..',
      '.......OOOOOOvwwwowwwxxokko..',
      '........oovvwwwoqowwxxxxoo...',
      '..........oobbbooqqroooo.....',
      '..........ouuttoouutto.......',
    ],
  },
  // CROSSED: folded arms, two rows tall, inside the torso (never wider than
  // the shoulders plus a pixel a side, so it never reads as a plank): the
  // upper arms run down the sides to the elbows; the near forearm (lit) runs
  // in along the lower row from its elbow and steps diagonally up into the
  // upper row to a small skin fist gripping the far upper arm; the far
  // forearm (in shadow) runs back the other way under it, from its elbow
  // along the lower row and up into the upper row to its fingers tucked
  // under the near arm. The two cross in the middle in an X, the near one in
  // front; light against shadow parts them, never black. A row of the robe
  // shows above them, the sash and the skirt below. The arms' outer pixels
  // and the hands are UPPERCASE, so long hair falls behind them.
  crossed: {
    as: 'crossed',
    breath: 'crossedBreath',
    hand: [21, 7],
    points: { back: [16, 4], waist: [16, 9] },
    rows: [
      '.............................',
      '.............................',
      '.............................',
      '.............................',
      '........oooooooooooooooo.....',
      '.......ONNOvvvwwwwwwwOMLO....',
      '.......ONMOvvwwwwwwxOSSLO....',
      '.......ONMSKllllllnnnSKLO....',
      '.......OMnnnnnnnnnnllllLO....',
      '........oogghgghgghhhhoo.....',
      '........oovvwwwoqowwxxxo.....',
      '..........oobbbooqqrooo......',
      '..........ouuttoouutto.......',
    ],
  },
  // the breath: the head sinks a pixel, and the body with it, the knees taking it
  crossedBreath: {
    as: 'crossed',
    hand: [21, 8],
    points: { back: [16, 5], waist: [16, 10] },
    rows: [
      '.............................',
      '.............................',
      '.............................',
      '.............................',
      '.............................',
      '........oooooooooooooooo.....',
      '.......ONNOvvvwwwwwwwOMLO....',
      '.......ONMOvvwwwwwwxOSSLO....',
      '.......ONMSKllllllnnnSKLO....',
      '.......OMnnnnnnnnnnllllLO....',
      '........oogghgghgghhhhoo.....',
      '........oovvwwwoqowwxxxo.....',
      '..........ouuttoouutto.......',
    ],
  },

  // CROSSED, in the wind of the jutsu: the far elbow's sleeve and the hem
  // trailed a pixel away from the arena, the near elbow tucked in a pixel
  // (hold()'s flutter frame)
  crossedWind: {
    as: 'crossed',
    hand: [21, 7],
    points: { back: [16, 4], waist: [16, 9] },
    rows: [
      '.............................',
      '.............................',
      '.............................',
      '.............................',
      '........oooooooooooooooo.....',
      '.......ONNOvvvwwwwwwwOMLO....',
      '.......ONMOvvwwwwwwxOSSLO....',
      '.......ONMSKllllllnnnSKLO....',
      '........OnnnnnnnnnnllllLLO...',
      '........oogghgghgghhhhoLO....',
      '........oovvwwwoqowwxxxxo....',
      '..........oobbbooqqroooo.....',
      '..........ouuttoouutto.......',
    ],
  },
  // ALERT: startled, both open hands thrown up beside the head, the sleeves
  // slid back down the forearms
  alert: {
    as: 'alert',
    eyes: 'open',
    hand: [5, 8],
    points: { back: [16, 15], waist: [16, 19] },
    rows: [
      '.............................',
      '.............................',
      '.............................',
      '.............................',
      '.............................',
      '.............................',
      '....O.O..................O.O.',
      '...OSOSO................OSOSO',
      '...OSSKO................OSKKO',
      '....OSKO................OKKO.',
      '....ONNO................OMLO.',
      '...ONNMO................OMLLO',
      '...ONMMLO..............OMMLLO',
      '....ONMMLO............OMMLLO.',
      '.....ONMLO............OMLLO..',
      '......ONLOoooooooooooooLLO...',
      '.......ONNvvvwwwwwwwwwxLO....',
      '........OOvvwwwwwwwwwxOO.....',
      '..........Ovwwwwwwwwxxo......',
      '..........ogghgghgghhho......',
      '..........ovvwwwowwwxxo......',
      '.........ovvwwwoqowwxxxo.....',
      '..........obbboooooqqroo.....',
      '.........ouuutto.ouuutto.....',
    ],
  },
  // THUMBS: a fist held out toward the arena at chest height, the thumb up,
  // the sleeve hanging under the wrist
  thumbs: {
    as: 'thumbs',
    hand: [4, 7],
    points: { back: [16, 4], waist: [16, 8] },
    rows: [
      '.............................',
      '.............................',
      '.............................',
      '.............................',
      '....O...oooooooooooooooo.....',
      '...OSO.ONNNvvvwwwwwwwwXLO....',
      '...OSKOONMOvvwwwwwwwwxOLO....',
      '...OSKNNNMOvwwwwwwwwxxOLLO...',
      '....OONMMLOgghgghgghhhoko....',
      '......OLLOovvwwwowwwxxoko....',
      '.......OOovvwwwoqowwxxxo.....',
      '..........oobbbooqqrooo......',
      '..........ouuttoouutto.......',
    ],
  },
  // SCRATCH: the sheepish scratch, the hand up on the hair at the temple on
  // the arena side, the elbow out past the cheek; the sleeve slid back
  scratch: {
    as: 'scratch',
    eyes: 'happy',
    hand: [6, 7],
    points: { back: [16, 15], waist: [16, 19] },
    rows: [
      '.............................',
      '.............................',
      '.............................',
      '.............................',
      '.............................',
      '.............................',
      '......OOO....................',
      '.....OSSKO...................',
      '.....OSKKO...................',
      '....OSKOO....................',
      '....OSKO.....................',
      '...ONNO......................',
      '...ONNMO.....................',
      '...ONMMLO....................',
      '....ONMMLO...................',
      '.....ONMLLoooooooooooo.......',
      '......OONNvvvwwwwwwwwXLO.....',
      '........OOvvwwwwwwwwxOLO.....',
      '..........OvwwwwwwwwxxOLLO...',
      '..........ogghgghgghhhoko....',
      '..........ovvwwwowwwxxoko....',
      '.........ovvwwwoqowwxxxo.....',
      '..........oobbbooqqrooo......',
      '..........ouuttoouutto.......',
    ],
  },
  // POKE: fingertips poked together under the chin, the elbows tucked
  poke: {
    as: 'poke',
    hand: [15, 7],
    points: { back: [16, 4], waist: [16, 9] },
    rows: [
      '.............................',
      '.............................',
      '.............................',
      '.............................',
      '........oooooooooooooooo.....',
      '.......ONNNvvvwwwwwwwwXLO....',
      '.......ONMOvvOOOOOOwwxOLO....',
      '......ONNMOvONSKSKMOwxOLLO...',
      '......ONMMONMOOOOOOMOOMLLO...',
      '......OOOOOOOgghghhOOOOOOO...',
      '.........ovvwwwoqowwxxxo.....',
      '..........oobbbooqqrooo......',
      '..........ouuttoouutto.......',
    ],
  },
  // KICK: a side kick at the arena off the back leg, the leg one straight
  // line at the hip (trouser, shin wrap, the sole), the coat thrown open round
  // it, the hands up either side for balance, the head leaned back off it
  kick: {
    as: 'kick',
    head: [2, 0],
    eyes: 'focus',
    hand: [1, 9],
    points: { back: [16, 4], waist: [16, 8] },
    rows: [
      '.............................',
      '.............................',
      '.............................',
      '.............................',
      '.........ooooooooooooooo.....',
      '........ONNNvvvwwwwwwwXLO....',
      '......OOSKOvvwwwwwwwwxOSKO...',
      '......OSKKONvwwwwwwwwxxOKKO..',
      'oooooooooooooogghgghhhooOO...',
      'utbbbbbbqqqqqqpvwwwwwxxxo....',
      'utbbbbbbrrrrrrrowwwwxxxo.....',
      'oooooooooooooooowwxxoqro.....',
      '...............oouuutto......',
    ],
  },
  // RAISE: a fist raised high beside the head on the arena side (a signal,
  // a summoning), the arm straight, the sleeve slid down to the shoulder
  raise: {
    as: 'raise',
    breath: 'raiseBreath',
    eyes: 'focus',
    hand: [4, 1],
    points: { back: [16, 15], waist: [16, 19] },
    rows: [
      '.............................',
      '....OO.......................',
      '...OSSO......................',
      '...OSKO......................',
      '...OKKO......................',
      '....OSO......................',
      '....OSO......................',
      '....OSKO.....................',
      '....ONNO.....................',
      '....ONMO.....................',
      '...ONNMO.....................',
      '...ONMMLO....................',
      '...ONMMLO....................',
      '....ONMLO....................',
      '.....ONMLO...................',
      '......ONLOoooooooooooo.......',
      '.......ONNvvvwwwwwwwwXLO.....',
      '........OOvvwwwwwwwwxOLO.....',
      '..........OvwwwwwwwwxxOLLO...',
      '..........ogghgghgghhhoko....',
      '..........ovvwwwowwwxxoko....',
      '.........ovvwwwoqowwxxxo.....',
      '..........oobbbooqqrooo......',
      '..........ouuttoouutto.......',
    ],
  },
  // the breath: the head sinks a pixel, and the body with it, the knees taking it
  raiseBreath: {
    as: 'raise',
    eyes: 'focus',
    hand: [4, 2],
    points: { back: [16, 16], waist: [16, 20] },
    rows: [
      '.............................',
      '.............................',
      '....OO.......................',
      '...OSSO......................',
      '...OSKO......................',
      '...OKKO......................',
      '....OSO......................',
      '....OSO......................',
      '....OSKO.....................',
      '....ONNO.....................',
      '....ONMO.....................',
      '...ONNMO.....................',
      '...ONMMLO....................',
      '...ONMMLO....................',
      '....ONMLO....................',
      '.....ONMLO...................',
      '......ONLOoooooooooooo.......',
      '.......ONNvvvwwwwwwwwXLO.....',
      '........OOvvwwwwwwwwxOLO.....',
      '..........OvwwwwwwwwxxOLLO...',
      '..........ogghgghgghhhoko....',
      '..........ovvwwwowwwxxoko....',
      '.........ovvwwwoqowwxxxo.....',
      '..........ouuttoouutto.......',
    ],
  },

  // RAISE, in the wind of the jutsu: the hanging sleeves and the hem
  // trailed a pixel or two away from the arena (hold()'s flutter frame)
  raiseWind: {
    as: 'raise',
    eyes: 'focus',
    hand: [4, 1],
    points: { back: [16, 15], waist: [16, 19] },
    rows: [
      '.............................',
      '....OO.......................',
      '...OSSO......................',
      '...OSKO......................',
      '...OKKO......................',
      '....OSO......................',
      '....OSO......................',
      '....OSKO.....................',
      '....ONNO.....................',
      '....ONMO.....................',
      '...ONNMMO....................',
      '...ONMMLLO...................',
      '....ONMMLLO..................',
      '.....ONMLLO..................',
      '.....ONMLLO..................',
      '......ONLOoooooooooooo.......',
      '.......ONNvvvwwwwwwwwXLO.....',
      '........OOvvwwwwwwwwxOLO.....',
      '..........OvwwwwwwwwxxOLLLO..',
      '..........ogghgghgghhhokko...',
      '..........ovvwwwowwwxxoko....',
      '.........ovvwwwoqowwxxxxo....',
      '..........oobbbooqqroooo.....',
      '..........ouuttoouutto.......',
    ],
  },
  // SLAM: dropped low, the arena-side arm one line down to the palm slapped
  // flat on the ground, clear air between it and the knee, the
  // other hand at the chest
  slam: {
    as: 'slam',
    head: [-1, 1],
    eyes: 'focus',
    hand: [2, 11],
    points: { back: [16, 4], waist: [16, 8] },
    rows: [
      '.............................',
      '.............................',
      '.............................',
      '.............................',
      '............oooooooooooo.....',
      '...........oNvvvwwwwwwwXLo...',
      '..........ONMvwwwwwwwwwxOLO..',
      '.........ONMOvwwwwwwwwxxOLO..',
      '........ONMOoggghgOSKOhhOOO..',
      '......OONMO.ovvwwwOOOwwxxxo..',
      '....OONMLO..ovvwwwwwwwxxxxxo.',
      'OSSSKKOOO..obbbboooouuuttto..',
    ],
  },
  // SPREAD: arms flung wide, the wide sleeves hanging from them like wings
  spread: {
    as: 'spread',
    breath: 'spreadBreath',
    eyes: 'focus',
    hand: [4, 6],
    points: { back: [16, 4], waist: [16, 8] },
    rows: [
      '..............................',
      '..............................',
      '..............................',
      '..............................',
      '.........oooooooooooooo.......',
      '....OOOOONNvvvwwwwwwwwXLOOOOO.',
      '...OSKNNNNMOvwwwwwwwwxOMMMLSKO',
      '...OKKMMMMMOvwwwwwwwwxOLLLLKKO',
      '....OOOMLLLOgghgghghhhOLLLLOO.',
      '......OOOOOOvwwwowwwxxOOOOO...',
      '.........ovvwwwoqowwxxxo......',
      '..........obbboooooqqroo......',
      '.........ouuutto.ouuutto......',
    ],
  },
  // the breath: the head sinks a pixel, and the body with it, the knees taking it
  spreadBreath: {
    as: 'spread',
    eyes: 'focus',
    hand: [4, 7],
    points: { back: [16, 5], waist: [16, 9] },
    rows: [
      '..............................',
      '..............................',
      '..............................',
      '..............................',
      '..............................',
      '.........oooooooooooooo.......',
      '....OOOOONNvvvwwwwwwwwXLOOOOO.',
      '...OSKNNNNMOvwwwwwwwwxOMMMLSKO',
      '...OKKMMMMMOvwwwwwwwwxOLLLLKKO',
      '....OOOMLLLOgghgghghhhOLLLLOO.',
      '......OOOOOOvwwwowwwxxOOOOO...',
      '.........ovvwwwoqowwxxxo......',
      '.........ouuutto.ouuutto......',
    ],
  },

  // SPREAD, in the wind of the jutsu: the hanging sleeves and the hem
  // trailed a pixel or two away from the arena (hold()'s flutter frame)
  spreadWind: {
    as: 'spread',
    eyes: 'focus',
    hand: [4, 6],
    points: { back: [16, 4], waist: [16, 8] },
    rows: [
      '..............................',
      '..............................',
      '..............................',
      '..............................',
      '.........oooooooooooooo.......',
      '....OOOOONNvvvwwwwwwwwXLOOOOO.',
      '...OSKNNNNMOvwwwwwwwwxOMMMLSKO',
      '...OKKMMMMMOvwwwwwwwwxOLLLLKKO',
      '.....OOOMLLOgghgghghhhOOLLLLO.',
      '......OOOOOOvwwwowwwxxOOOOOO..',
      '.........ovvwwwoqowwxxxxo.....',
      '..........obbboooooqqrooo.....',
      '.........ouuutto.ouuutto......',
    ],
  },
  // SIDE ON (the Rotation's turn): a true profile, facing the post, the body
  // narrow, the near arm flung out toward us (its palm a fist's width in
  // front of the chest, the sleeve hanging off it), the far one hidden behind
  // him, the robe's skirt and sleeve swung out behind by the spin, the feet one
  // before the other (a cel gives it the profile head, NinjaSprite.heads.side)
  side: {
    as: 'spread',
    head: [-1, 0],
    eyes: 'focus',
    hand: [11, 6],
    points: { back: [17, 4], waist: [16, 8] },
    rows: [
      '.............................',
      '.............................',
      '.............................',
      '.............................',
      '............oooooooooo.......',
      '...........onnvvvwwwxxo......',
      '..........OSKNNvvwwwxxlo.....',
      '..........OKKMMvvwwwxxllo....',
      '...........OOMMLgghhhxlllo...',
      '............ovvvwwwxxxxlllo..',
      '...........ovvvwwwwxxxxxxxxo.',
      '............obbqqrooooooooo..',
      '...........ouuttoouutto......',
    ],
  },
  // FROM BEHIND (the Rotation's turn): the arms flung wide, the robe's back
  // whole (no open front), the long hair hanging down it, tied over the sash (a
  // cel gives it the back of the head)
  back: {
    as: 'spread',
    eyes: 'focus',
    hand: [4, 6],
    points: { back: [16, 4], waist: [16, 8] },
    rows: [
      '..............................',
      '..............................',
      '..............................',
      '..............................',
      '.........oooooooooooooo.......',
      '....OOOOONNvvvwwwwwwwwXLOOOOO.',
      '...OSKNNNNMOvwwoyzowwxOMMMLSKO',
      '...OKKMMMMMOvwwoyzowwxOLLLLKKO',
      '....OOOMLLLOgghobbohhhOLLLLOO.',
      '......OOOOOOvwwoyzowxxOOOOO...',
      '.........ovvwwwozowwxxxo......',
      '..........obbboooooqqroo......',
      '.........ouuutto.ouuutto......',
    ],
  },


  // THE SPIN FLAT OUT (the Rotation's blur): the arms flung out straight,
  // one sleeve streaming, and the robe flared out below the sash into a wide
  // bell, its folds swept round (whirl leaning one way, whirlB the other, the
  // trailing arm swapped), the feet together under it: a spinning top. A cel
  // gives it the flared heads ('whirl', 'whirlBack') where a ninja has them.
  whirl: {
    as: 'spread',
    eyes: 'focus',
    hand: [2, 6],
    points: { back: [16, 4], waist: [16, 8] },
    rows: [
      '..............................',
      '..............................',
      '..............................',
      '..............................',
      '.........oooooooooooooo.......',
      '.OOOOOOOONNvvvwwwwwwwwXLOOOO..',
      'OSKNNNNNNMOvwwwwwwwwwxOMMMLSKO',
      '.OOOMMMMMOvvwwwwwwwwxxOLLLOOO.',
      '....OOOOOOgghgghghhhhhOOO.....',
      '........ovvvwwwwwwwwxxo.......',
      '.....oovvvwvwwwwwxwwxxxxoo....',
      '...oovvwwwvwwwwwxwwwwxxxxxoo..',
      '....oooooooouuttuuoooooooo....',
    ],
  },
  whirlB: {
    as: 'spread',
    eyes: 'focus',
    hand: [5, 6],
    points: { back: [16, 4], waist: [16, 8] },
    rows: [
      '..............................',
      '..............................',
      '..............................',
      '..............................',
      '.........oooooooooooooo.......',
      '....OOOOONNvvvwwwwwwwwXLOOOOOO',
      '...OSKNNNMOvwwwwwwwwwxOMMMMMLO',
      '....OOOMMOvvwwwwwwwwxxOLLLLLLO',
      '......OOOOgghgghghhhhhOOOOOOO.',
      '........ovvvwwwwwwwwxxo.......',
      '.....oovwvvwwwwxwwwwxxxxoo....',
      '...oovwwvvwwwwxwwwwwxxxxxxoo..',
      '....oooooooouuttuuoooooooo....',
    ],
  },

  // PUNCH: a straight punch at the arena, the far fist chambered out of
  // sight behind the coat
  punch: {
    as: 'punch',
    head: [-1, 0],
    eyes: 'focus',
    hand: [4, 6],
    points: { back: [16, 4], waist: [18, 8] },
    rows: [
      '.............................',
      '.............................',
      '.............................',
      '.............................',
      '..........oooooooooooooo.....',
      '....OOOOOOONvvvwwwwwwwwxxo...',
      '...OSKNNNNNNNvwwwwwwwwwxxo...',
      '...OKKMMMMMMMovwwwwwwwxxxo...',
      '....OOOLLLMMOogghgghghhxxoo..',
      '.......OOOOOOvvwwwoqwwwxxxo..',
      '...........ovvwwwoqqowwwxxo..',
      '..........oobbbboooooqqrrro..',
      '.........ouuuttoo....ouuutto.',
    ],
  },
  // GATHER: chakra gathered in the arena-side hand, held out low and open,
  // the other hand at the belly
  gather: {
    as: 'gather',
    head: [0, 1],
    eyes: 'focus',
    hand: [4, 9],
    points: { back: [16, 4], waist: [14, 8] },
    rows: [
      '.............................',
      '.............................',
      '.............................',
      '.............................',
      '........oooooooooooooooo.....',
      '.......ONNNvvvwwwwwwwwXLO....',
      '......ONNMOvvwwwwwwwwxOLO....',
      '....OONNMMOvwwwwwwwwxxOLLO...',
      '...OSSNNMLOgghgOOOOOOOOLO....',
      '...OSKOLLOvvwwOSKMMMMMMLO....',
      '....OOOOOovvwwwoOOOOOOOO.....',
      '........oobbbboo..oqqqro.....',
      '.......ouuuttoo...ouuutto....',
    ],
  },  // GATHER, in the wind of the jutsu: the hanging sleeves and the hem
  // trailed a pixel away from the arena (hold()'s flutter frame)
  gatherWind: {
    as: 'gather',
    head: [0, 1],
    eyes: 'focus',
    hand: [4, 9],
    points: { back: [16, 4], waist: [14, 8] },
    rows: [
      '.............................',
      '.............................',
      '.............................',
      '.............................',
      '........oooooooooooooooo.....',
      '.......ONNNvvvwwwwwwwwXLO....',
      '......ONNMOvvwwwwwwwwxOLLO...',
      '....OONNMMOvwwwwwwwwxxOLLLO..',
      '...OSSNNMLOgghgOOOOOOOOLLO...',
      '...OSKOOLLOvwwOSKMMMMMMLO....',
      '....OOOOOOovwwwoOOOOOOOO.....',
      '........oobbbboo..oqqqroo....',
      '.......ouuuttoo...ouuutto....',
    ],
  },

  // WAVE: hello, the open hand up beside the head on the arena side, the
  // sleeve fallen back down the forearm
  wave: {
    as: 'raise',
    eyes: 'happy',
    hand: [4, 4],
    points: { back: [16, 15], waist: [16, 19] },
    rows: [
      '.............................',
      '.............................',
      '.............................',
      '....O.O......................',
      '...OSOSO.....................',
      '...OSSSKO....................',
      '...OSSKKO....................',
      '....OSKO.....................',
      '....OSKO.....................',
      '....ONNO.....................',
      '...ONNMO.....................',
      '...ONMMO.....................',
      '...ONMMLO....................',
      '....ONMLO....................',
      '.....ONMLO...................',
      '......ONLOoooooooooooo.......',
      '.......ONNvvvwwwwwwwwXLO.....',
      '........OOvvwwwwwwwwxOLO.....',
      '..........OvwwwwwwwwxxOLLO...',
      '..........ogghgghgghhhoko....',
      '..........ovvwwwowwwxxoko....',
      '.........ovvwwwoqowwxxxo.....',
      '..........oobbbooqqrooo......',
      '..........ouuttoouutto.......',
    ],
  },
}

// Every companion pose (art/chibi.ts's Pose) to the robe's drawing of it:
// the same as the vest's (templates/vest.ts's VEST_MAP), every one drawn.
export const ROBE_MAP: Readonly<Record<Pose, string>> = {
  idle: 'idle0',
  crossed: 'crossed',
  think: 'think',
  signs: 'sign1',
  signs2: 'sign2',
  signs3: 'sign3',
  gather: 'gather',
  charge: 'charge',
  strike: 'strike',
  punch: 'punch',
  kick: 'kick',
  dash: 'dash',
  slam: 'slam',
  spread: 'spread',
  raise: 'raise',
  thumbs: 'thumbs',
  scratch: 'scratch',
  alert: 'alert',
  poke: 'poke',
  tuck: 'tuck',
  sleep: 'sleep',
  slump: 'slump',
}

export const ROBE: Template = {
  name: 'robe',
  letters: 'oskvwxnmlghpqrbtuyz',
  root: 16,
  neck: 6,
  poses: POSES,
  map: ROBE_MAP,
}

// ------------------------------------------------------------------ dressing

// What a ninja wears over the robe, baked into their own copy of it once, at
// load (nothing per frame). Everything is
// placed in the pose's own grid coordinates, at its named points:
//   poses     their own drawings, in place of the template's under its name
//             (Gaara's sleep) or new ones
//   back      a prop worn on the back (`anchor`: its pixel laid on the pose's
//             `back` point, the nape), stamped only into the grid's clear
//             pixels, so it shows behind the shoulders and under the head;
//             its own outline pixels left outlining nothing (where the body
//             hides all of it) are dropped. `variants` gives a pose its own
//             drawing (shorter hair in a crouch), or null for none
//   marks     something worn ON the clothes (a strap, a knot), laid at the
//             pose's `back` or `waist` point but only over pixels of the
//             template letters in `on` (so an arm across the chest stays in
//             front of it); each pixel takes the case of the one it covers
//   overlays  their own pixels over a pose ('over') or only into its clear
//             pixels ('back'), at [x, y] in its grid
//   faces     a pose's default eyes for this ninja
// Rows a prop reaches above a grid grow it upward (the feet stay on the last
// row; the hand and points move down with the old rows); a pixel left of
// column 0 or below the feet is clipped for a back prop, an error otherwise.
export type Worn = { rows: Grid; anchor: XY }
export type BackProp = Worn & { variants?: Readonly<Record<string, Worn | null>> }
export type Mark = Worn & { at?: 'back' | 'waist'; on: string; skip?: readonly string[]; variants?: Readonly<Record<string, Worn>> }
export type RobeOverlay = { at: XY; rows: Grid; mode?: 'over' | 'back' }
export type RobeDress = {
  poses?: Readonly<Record<string, PoseGrid>>
  back?: BackProp
  marks?: readonly Mark[]
  overlays?: Readonly<Record<string, readonly RobeOverlay[]>>
  faces?: Readonly<Record<string, string>>
}

const dressPose = (name: string, base: PoseGrid, spec: RobeDress): PoseGrid => {
  const grid = base.rows.map(r => [...r])
  const feet = grid.length
  let pad = 0
  const put = (x: number, y: number, ch: string, mode: 'over' | 'back', on?: string): void => {
    if (x < 0 || y >= feet) {
      if (mode === 'back') return
      throw new Error(`robe ${name}: pixel ${x},${y} left of or below the grid`)
    }
    while (y + pad < 0) {
      grid.unshift([])
      pad++
    }
    const row = grid[y + pad]!
    while (row.length <= x) row.push('.')
    const was = row[x]!
    if (mode === 'back' && was !== '.') return
    if (on !== undefined) {
      if (!on.includes(was.toLowerCase())) return
      ch = was === was.toLowerCase() ? ch.toLowerCase() : ch.toUpperCase()
    }
    row[x] = ch
  }
  const at = (point: string): XY | null => base.points?.[point] ?? null
  const lay = (rows: Grid, [x0, y0]: XY, mode: 'over' | 'back', on?: string): void =>
    rows.forEach((r, y) => [...r].forEach((ch, x) => ch !== '.' && put(x0 + x, y0 + y, ch, mode, on)))
  const cell = (x: number, y: number): string => grid[y + pad]?.[x] ?? '.'
  // the back prop, into the clear pixels, then its lone outline pixels dropped
  const b = spec.back ? (spec.back.variants && name in spec.back.variants ? spec.back.variants[name]! : spec.back) : null
  const nape = at('back')
  if (b && nape) {
    const [x0, y0] = [nape[0] - b.anchor[0], nape[1] - b.anchor[1]]
    const placed = new Set<string>()
    b.rows.forEach((r, y) =>
      [...r].forEach((ch, x) => {
        if (ch === '.') return
        const before = cell(x0 + x, y0 + y)
        put(x0 + x, y0 + y, ch, 'back')
        if (before === '.' && cell(x0 + x, y0 + y) === ch) placed.add(`${x0 + x},${y0 + y}`)
      }),
    )
    const shows = (x: number, y: number): boolean => placed.has(`${x},${y}`) && cell(x, y) !== 'o'
    for (const key of placed) {
      const [x, y] = key.split(',').map(Number) as [number, number]
      if (cell(x, y) !== 'o') continue
      let lone = true
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (shows(x + dx, y + dy)) lone = false
      if (lone) grid[y + pad]![x] = '.'
    }
  }
  for (const m of spec.marks ?? []) {
    if (m.skip?.includes(name)) continue
    const v = m.variants?.[name] ?? m
    const p = at(m.at ?? 'back')
    if (p) lay(v.rows, [p[0] - v.anchor[0], p[1] - v.anchor[1]], 'over', m.on)
  }
  for (const o of spec.overlays?.[name] ?? []) lay(o.rows, o.at, o.mode ?? 'over')
  const w = Math.max(...grid.map(r => r.length))
  const down = (p: XY): XY => [p[0], p[1] + pad]
  const eyes = spec.faces?.[name] ?? base.eyes
  return {
    ...base,
    rows: grid.map(r => r.join('').padEnd(w, '.')),
    ...(base.hand ? { hand: down(base.hand) } : {}),
    ...(base.points ? { points: Object.fromEntries(Object.entries(base.points).map(([k, p]) => [k, down(p)])) } : {}),
    ...(eyes ? { eyes } : {}),
  }
}

// The robe dressed for one ninja: a copy with what they wear baked into every
// pose, and the letters it adds.
export const dress = (t: Template, spec: RobeDress): Template => {
  const poses: Record<string, PoseGrid> = {}
  for (const [name, base] of Object.entries({ ...t.poses, ...(spec.poses ?? {}) })) poses[name] = dressPose(name, base, spec)
  const letters = new Set(t.letters)
  for (const p of Object.values(poses)) for (const row of p.rows) for (const ch of row) if (ch !== '.') letters.add(ch.toLowerCase())
  return { ...t, name: t.name, letters: [...letters].join(''), poses }
}
