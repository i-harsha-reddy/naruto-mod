// The 'jacket' outfit template: a chibi in a zip-up track jacket (or an open
// shirt) with a collar and cuffs, trousers and sandals (Naruto, Hinata,
// Sasuke). Semantic letters, mapped to colours by each ninja's `body` palette:
//   o          outline
//   s k        skin, skin shadow (hands)
//   v w x      jacket body: lit, mid, shadow
//   n m l      sleeves (upper arm): lit, mid, shadow
//   c b        cuffs (forearm): lit, shadow
//   f j        shoulder yoke and collar: lit, shadow
//   h g        the front under the chin: h the neck opening, g the zip
//              (Sasuke: the mesh in his open shirt)
//   i e        the hem band / belt: lit, shadow
//   p q r      trousers: lit, mid, shadow
//   t u        sandals: shadow, lit
//   y z        hair, light and shadow (for smears and afterimages)
// (no held prop in this template: a and d are free.) UPPERCASE = drawn over
// the head. Light from the top left. A ninja maps the letters to their own
// garment: Naruto's yoke black over orange, Hinata's lavender over cream,
// Sasuke's white shirt with the neck opening and zip in mesh, the hem band a
// purple rope belt and the cuffs navy arm guards.
//
// Drawn in the prototype in 31 poses: every
// companion pose has its own drawing, plus the breath (idle1), the dash's
// smear, the follow-through, the landing crouch, the hop, the two-fisted
// "yatta!" cheer and its pump (cheer2) and the wave. Each pose: rows (26 wide,
// root column 13, last row on the feet), head [dx, dy], hand [x, y] (the held
// hand, for effects), eyes (its default eye state), as (the companion pose it
// stands for), breath (its other breathing frame). See templates/vest.ts for
// how to add one.

import type { Pose } from '../../art/chibi.ts'
import type { PoseGrid, Template } from '../types.ts'

const POSES: Record<string, PoseGrid> = {
  idle0: {
    as: 'idle',
    breath: 'idle1',
    rows: [
      //        1111111111222222
      //234567890123456789012345
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '......oooooooooooooo......',
      '....offfjjjhhghhjjjjjo....',
      '....onmofjjhhghhjjjolo....',
      '....ocbovvvhhghhwxxobo....',
      '....oskovvvwhghwwxxoko....',
      '....oskoiiiiiiiiiieoko....',
      '.....ooopqqqqqqqqrooo.....',
      '........oppqooqqro........',
      '.......ouuttoouutto.......',
    ],
  },
  // inhale: shoulders and hands up a pixel, the jacket stretched
  idle1: {
    as: 'idle',
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '......oooooooooooooo......',
      '....offfjjjhhghhjjjjjo....',
      '....onmofjjhhghhjjjolo....',
      '....ocbovvvhhghhwxxobo....',
      '....oskovvvwhghwwxxoko....',
      '....oskovvvvwgwwwxxoko....',
      '....ooooiiiiiiiiiieooo....',
      '.....ooopqqqqqqqqrooo.....',
      '........oppqooqqro........',
      '.......ouuttoouutto.......',
    ],
  },
  // OX: elbows thrown wide, the flat hand under the upright one at the belly
  sign1: {
    breath: 'sign1In',
    as: 'signs',
    eyes: 'focus',
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '......oooooooooooooo......',
      '....offfjjjhhghhjjjjjo....',
      '...onnmofjjhhOOOOjjxolo...',
      '...onmmovvvhOSKOwwxxolo...',
      '..onmmOOOOOOSKKOOOOOOlo...',
      '..oomCCCCCOSSSKKOBBBBBoo..',
      '...ooOOOOOOOOOOOOOOOOoo...',
      '........oppqooqqro........',
      '.......ouuttoouutto.......',
    ],
  },
  // RABBIT: fingers up under the chin, elbows tucked tight to the ribs
  sign2: {
    breath: 'sign2In',
    as: 'signs2',
    eyes: 'focus',
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '......oooooooooooooo......',
      '....offfjjjhhghhjjjjjo....',
      '....onmofjjoskohjjjolo....',
      '....onmovvosskkowxxolo....',
      '....onmovcosskkobxxolo....',
      '....onmocbokkkkobbxolo....',
      '.....oooooooooooooooo.....',
      '........oppqooqqro........',
      '.......ouuttoouutto.......',
    ],
  },
  // the clone seal: the first two fingers of each hand crossed in a plus
  // under the chin, the elbows out level with it
  sign3: {
    breath: 'sign3In',
    as: 'signs3',
    eyes: 'focus',
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '......oooooooOoooooo......',
      '....offfjjjhOSOhjjjjjo....',
      '...onnmofjjOSSSOjjjxolo...',
      '..onnmmOOOOOOSOOOOOOolo...',
      '..onmmOCCCCOSKSKOBBBBlo...',
      '...oooOOOOOOOOOOOOOOooo...',
      '.....ooopqqqqqqqqrooo.....',
      '........oppqooqqro........',
      '.......ouuttoouutto.......',
    ],
  },

  // CHARGE: knees bent, the chakra hand thrust forward and down, the other
  // hand clamped on its wrist
  charge: {
    as: 'charge',
    head: [-1, 2],
    eyes: 'focus',
    hand: [1, 8],
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '......oooooooooooooo......',
      '....offfjjjhhghhjjjjjo....',
      '..oonmmofjjhhghhjjxolo....',
      'oocccnmoOOOOOOhwwxxolo....',
      'SKbboOSKBBBBBOiiieoko.....',
      'KKooOOOOOOOOOOqqqrro......',
      'oo..oppppo..oqqqqro.......',
      '...ouuuto...ouuutto.......',
    ],
  },
  // WINDUP: sunk low and rocked back, weight on the back foot, the chakra
  // hand drawn in low at the front, the far fist cocked at the ribs
  windup: {
    as: 'gather',
    head: [1, 3],
    eyes: 'focus',
    hand: [4, 11],
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '........ooooooooooooooo...',
      '......offfjjjjhghjjjjjjo..',
      '.....onmmofjjjhghjjjxolo..',
      '....onmmoovwwwhgOOOOolo...',
      '...occbooiiiiieOSKKOoo....',
      '..oskooooqqqqqqqOOOrro....',
      '..oskkoooppppo..oqqqqro...',
      '...oooouuutto....ouuutto..',
    ],
  },
  // DASH smear: the run frame smeared back along its path: streaks of hair,
  // jacket and trousers trailing behind, the front edge left crisp
  smear: {
    as: 'dash',
    head: [-4, 3],
    eyes: 'focus',
    hand: [2, 20],
    rows: [
      '.....................................',
      '.....................................',
      '.....................................',
      '.....................................',
      '.....................................',
      '.....................................',
      '.................yyyyyz...yz.........',
      '.....................................',
      '...................yyyyyyyyzz...yz...',
      '.....................................',
      '....................yyyyyz..z........',
      '....................yyyyyyyyyzz...z..',
      '.....................................',
      '...................zzzzz...z.........',
      '.....................................',
      '.....................................',
      '.........oooooooooooooo..............',
      '.......offfjjhghjjjjjjjjjwwww..ww....',
      '......onmmfjhghjjwwxxolmmll..m.......',
      '....oocnmovvwwwwwwxxolxxww..w........',
      '..oskccbooiiiiiiiiieoqqrr..rr..r.....',
      '.oskkooo.oqqqqqqqqqrrqqrr..r.........',
      '..oo....oppppo..ooqqrrqq...r..r......',
      '.......ouuuttto...oouttt..tt.........',
    ],
  },
  // DASH: the run's contact frame, a long low split, the chakra hand carried
  // forward and low, the far arm flung back
  dash: {
    as: 'dash',
    head: [-4, 3],
    eyes: 'focus',
    hand: [2, 9],
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '.........oooooooooooooo...',
      '.......offfjjhghjjjjjjjoo.',
      '......onmmfjhghjjwwxxolbbo',
      '....oocnmovvwwwwwwxxoobboo',
      '..oskccbooiiiiiiiiieoooo..',
      '.oskkooo.oqqqqqqqqqrro....',
      '..oo....oppppo..ooqqrro...',
      '.......ouuuttto...oqqrro..',
      '..................oouutto.',
    ],
  },
  // STRIKE: a long lunge, the near arm driven straight out at the post in
  // one line from the shoulder to the fist (under the chin, the chin's
  // outline over it), the far arm flung back and down, the front knee bent
  // over its foot and the back leg straight: the head rides high over the
  // shoulders, never sunk into them
  strike: {
    as: 'strike',
    head: [-2, 1],
    eyes: 'focus',
    hand: [0, 3],
    rows: [
      //        1111111111222222222
      //234567890123456789012345678
      '..........oooooooooooo.....',
      '.........ofjhghjjjjnmo.....',
      'ooooooooooovvwwwwwxonmo....',
      'ssocccnnnnnnvwwwwwxxomlo...',
      'kkobbbmmmmmmvwwwwwxxoocbo..',
      'oooooooooooooiiiiiiieooskoo',
      '......opppqqqqqqqqqrro.oo..',
      '....oppppo........oqqro....',
      '...ouuutto.........ouutto..',
    ],
  },
  // WHIP: the throwing arm a blur (the frame between the arm cocked behind
  // and the strike): the strike's lunge with the arm smeared along its path
  // in broken streaks of sleeve and cuff, the hand a smudge of skin at the
  // front, over the far arm still flung back
  whip: {
    as: 'strike',
    head: [-2, 1],
    eyes: 'focus',
    hand: [0, 3],
    rows: [
      //        1111111111222222222
      //234567890123456789012345678
      '..nn.nnn..oooooooooooo.....',
      '.n..nnnnnofjhghjjjjnmo.....',
      '.....oooooovvwwwwwxonmo....',
      'ss.scccnnnnnvwwwwwxxomlo...',
      'k.kbbbmmmmmmvwwwwwxxoocbo..',
      '..m.mm.oooooooiiiiieooskoo.',
      '......opppqqqqqqqqqrro.oo..',
      '....oppppo........oqqro....',
      '...ouuutto.........ouutto..',
    ],
  },
  // FOLLOW-THROUGH: carried past the hit, the back foot kicked up, the arm
  // still out under the chin (the chin's outline over it), the head riding
  // over the shoulders
  follow: {
    as: 'punch',
    head: [-3, 1],
    eyes: 'focus',
    hand: [0, 9],
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '...........oooooooooooooo.',
      '...oooooooofhghjjjjjjjjjo.',
      '.oocccnnnnnnjjhjjwwwxxolo.',
      'oskbbbmmmmmmovwwwwwwxxooqo',
      'okkooooooooooiiiiiiiieoqro',
      '.oo.....oopqqqqqqqqqqrrro.',
      '.......oppppoo.......oo...',
      '......ouuuttto............',
    ],
  },
  // CROUCH: the landing squash, knees wide, arms out for balance
  crouch: {
    as: 'slam',
    head: [0, 3],
    eyes: 'shut',
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '.......oooooooooooooo.....',
      '..ooooofffjjhghjjjjjjjooo.',
      '.occnnmofjjjhghjjjjxomlbbo',
      '.osskooovvwwwgwwwwxxoosko.',
      '..ooooooiiiiiiiiiiieoooo..',
      '....oopppoqqqqqqqqqroo....',
      '...ouutttoo......ouuttto..',
    ],
  },
  // TUCK: a cannonball in the air, knees hugged up under the chin, hands on
  // the shins, soles showing
  tuck: {
    as: 'tuck',
    head: [0, 4],
    eyes: 'shut',
    rows: [
      '..........................',
      '..........................',
      '......oooooooooooooo......',
      '...ooofffjjjhghjjjjjo.....',
      '..oqqqoofjjjhghjjjjolo....',
      '.oqqqqqOSKjjhghjxxoqqo....',
      '.oqqrrrOKKoiiiiieoqqqro...',
      '..oqrroOOooqqqqqoqqrro....',
      '..ouuuttoo......oouutto...',
      '...oooooo........ooooo....',
    ],
  },
  // FLIP: the top of a backflip, a side-on tuck roll: the tuck turned a
  // quarter onto its back, the knees hugged at either end, the soles out at
  // the left, the shirt and zip along its right side where the head, turned
  // with it (the ninja's 'roll' head, its crown to the right), is seated by
  // its chin, the whole figure centred on the root. Its last row is the
  // figure's lowest, so a hop's lift is its clearance off the ground
  flip: {
    as: 'tuck',
    head: [-5, -3],
    eyes: 'shut',
    rows: [
      '...oo.....................',
      '.ooqqo....................',
      'ouqqqqo...................',
      'ourrqqo...................',
      'ourrqqo...................',
      'otorqofo..................',
      'otOOOofo..................',
      'ooOKSffo..................',
      '.ooKKjjo..................',
      '..oojjjo..................',
      '..oijjjo..................',
      '..oihhho..................',
      '..oigggo..................',
      '..oihhho..................',
      '..oijjjo..................',
      '.ooexjjo..................',
      'ooqoxjjo..................',
      'ouqqojjo..................',
      'ourqqojo..................',
      'otrqqlo...................',
      'otoroo....................',
      '.o.o......................',
    ],
  },
  // JUMP: a happy hop, heels kicked up behind, a fist pumped beside the face
  jump: {
    as: 'raise',
    head: [0, 2],
    eyes: 'happy',
    rows: [
      '..........................',
      '.oo.......................',
      'oSKo......................',
      'oKKo......................',
      'oCBo......................',
      '.oNMo.....................',
      '..oNMoooooooooooooo.......',
      '...oonmfjjjjhghjjjjjo.....',
      '.....omofjjjhghjjxolo.....',
      '.....omovvwwhghwxxoko.....',
      '.....oooiiiiiiiiieooo.....',
      '.......opqqqqqqqqroooo....',
      '.......opppooqqqqrqqtto...',
      '........ouuto.ooooqqtto...',
      '.........ooo......oooo....',
    ],
  },
  // CHEER: both fists thrown up beside the head, elbows out: "yatta!"
  cheer: {
    as: 'raise',
    breath: 'cheer2',
    head: [0, 0],
    eyes: 'happy',
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '..oo......................',
      '.oSKo.....................',
      '.oKKo.....................',
      '.oCBo...................o.',
      '.oNMo..................OSo',
      '..oNMo................OSKo',
      '..oNMo................oKKo',
      '...oNMo...............obco',
      '...oNMo..............omlo.',
      '....oNmo............oomlo.',
      '.....onmoooooooooooooomlo.',
      '.....offfjjjhhghhjjjjmlo..',
      '.......ofjjhhghhjjjoooo...',
      '.......ovvvhhghhwxxo......',
      '.......ovvvwhghwwxxo......',
      '.......oiiiiiiiiiieo......',
      '.......opqqqqqqqqro.......',
      '........oppqooqqro........',
      '.......ouuttoouutto.......',
    ],
  },
  // the pump: both fists jerked down a pixel, the shoulders hunched up
  cheer2: {
    as: 'raise',
    head: [0, 0],
    eyes: 'happy',
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '..oo......................',
      '.oSKo.....................',
      '.oKKo.....................',
      '.oCBo...................o.',
      '..oNMo.................OSo',
      '..oNMo................OSKo',
      '...oNMo...............oKKo',
      '...oNMo..............oobco',
      '....oNmo............oomlo.',
      '.....onmoooooooooooooomlo.',
      '.....offfjjjhhghhjjjjmlo..',
      '.......ofjjhhghhjjjoooo...',
      '.......ovvvhhghhwxxo......',
      '.......ovvvwhghwwxxo......',
      '.......oiiiiiiiiiieo......',
      '.......opqqqqqqqqro.......',
      '........oppqooqqro........',
      '.......ouuttoouutto.......',
    ],
  },
  // SLUMP: the whole frame sags forward: head hung out in front, the back
  // rounded behind it, arms dangling to the knees
  slump: {
    as: 'slump',
    head: [-3, 2],
    eyes: 'sad',
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '.............oooooooo.....',
      '..........oooofffjjjjoo...',
      '.......oooofffjjjjjjjjjo..',
      '....oonnmmmovvvwwwwwxxlo..',
      '...onnmmoovvwwwwwwwxxolo..',
      '...ocboooiiiiiiiiiieooko..',
      '...oskoooqqqqqqqqrroooo...',
      '...oskkooopppooqqro.......',
      '....oooouuttoouutto.......',
    ],
  },
  // SLEEP: sat cross-legged, nodded off, the head drooped onto the chest: the
  // yoke and the jacket's front either side of the chin down to the hem band,
  // the elbows bent and the cuffed forearms in along the thighs to the hands
  // folded in the lap, the knees out a pixel or two past the head on each
  // side and the shins crossed under the hands, the sandals' toes peeking
  // where they cross; one rounded base on the floor, nothing toward the post
  sleep: {
    as: 'sleep',
    head: [0, 2],
    eyes: 'shut',
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '.....ooooooooooooooooo....',
      '....offfjjjhhghhjjjjjjo...',
      '....onmofjjhhghhjjjomlo...',
      '....onmovvwwwgwwxxxomlo...',
      '..ooonmmoiiiiiiiieommlooo.',
      '.oppqonmcbsssksskcbmloqrro',
      '.opqqqqqqouutouutoqqqqrrro',
      '..ooooooooooooooooooooooo.',
    ],
  },
  // THINK: the near hand up at the chin, the forearm straight down from it
  // to the elbow at the belt, the upper arm angled in to meet it; the far
  // arm hanging
  think: {
    breath: 'thinkIn',
    as: 'think',
    head: [0, 0],
    eyes: 'half',
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '......ooooOOoooooooo......',
      '....offfjOSKOghjjjjjjo....',
      '....onmovOSKOghjjjxolo....',
      '....oonmoOCBOghwwxxobo....',
      '.....oonmOCBOgwwwxxoko....',
      '......oonmCBOiiiiieoko....',
      '.......oOOOOqqqqqrooo.....',
      '........oppqooqqro........',
      '.......ouuttoouutto.......',
    ],
  },

  // INHALE: the seal at the lips, the deep breath in before a fire jutsu:
  // the chest and shoulders heaved up a pixel, the elbow lifted with them,
  // the head thrown back two pixels
  inhale: {
    as: 'think',
    head: [2, 0],
    eyes: 'shut',
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '......ooooOOoooooooo......',
      '....offfjOSKOghjjjjjjo....',
      '....onmovOSKOghjjjxolo....',
      '....oonmoOCBOghwwxxobo....',
      '.....oonmOCBOgwwwxxoko....',
      '.....oonmOCBOgwwwxxoko....',
      '......oonmCBOiiiiieoko....',
      '.......oOOOOqqqqqrooo.....',
      '........oppqooqqro........',
      '.......ouuttoouutto.......',
    ],
  },
  // CROSSED: the arms folded, two forearms that visibly cross: the upper arms
  // down the sides; the near forearm climbing in a 1 px diagonal step from
  // the near elbow to its fist on the far upper arm, outlined dark above and
  // below each step (so a light sleeve never reads as one flat bar or belt);
  // the far forearm behind it, in the cuff's shade, along the bottom from
  // the far elbow to its hand tucked under the near bicep; the jacket's body
  // showing above the near forearm and the hem band below both
  crossed: {
    as: 'crossed',
    breath: 'crossedIn',
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '......oooooooooooooo......',
      '....offfjjjhhghhjjjjjo....',
      '....onmoooooooooooomlo....',
      '....onmwwwwwwocccskmlo....',
      '....onmskoccccbookkmlo....',
      '....onmcccobbbbbbbbmlo....',
      '....ooiiiiiiiiiiiiieoo....',
      '......oooppqooqqrooo......',
      '.......ouuttoouutto.......',
    ],
  },
  // and breathing in: the shoulders up a pixel, the folded arms with them
  crossedIn: {
    as: 'crossed',
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '......oooooooooooooo......',
      '....offfjjjhhghhjjjjjo....',
      '....onmoooooooooooomlo....',
      '....onmwwwwwwocccskmlo....',
      '....onmskoccccbookkmlo....',
      '....onmcccobbbbbbbbmlo....',
      '....ooiiiiiiiiiiiiieoo....',
      '.....oooqqqqqqqqqrooo.....',
      '........oppqooqqro........',
      '.......ouuttoouutto.......',
    ],
  },
  // ALERT: startled, both hands flung up by the head, stretched tall
  alert: {
    as: 'alert',
    head: [1, 0],
    eyes: 'wide',
    rows: [
      '..........................',
      '.oo.......................',
      'oSKo......................',
      'oKKo...................Oo.',
      '.oCBo.................OSKo',
      '..oNMo...............ooKKo',
      '...oNMoooooooooooooooomlo.',
      '....onmffjjjjhghjjjjjjoo..',
      '.....ofjjjjhhghhjjjjoo....',
      '.....ovvvvhhhghhhwxxo.....',
      '.....ovvvvwwhghwwwxxo.....',
      '.....oiiiiiiiiiiiiieo.....',
      '.....ooopqqqqqqqqrooo.....',
      '........oppqooqqro........',
      '.......ouuttoouutto.......',
    ],
  },
  // THUMBS: a fist held out toward the arena at chest height, thumb up
  thumbs: {
    as: 'thumbs',
    eyes: 'happy',
    hand: [1, 6],
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '..o.......................',
      '.oSo..oooooooooooooo......',
      '.oSoofffjjjhhghhjjjjjo....',
      'oSKCCnmofjjhhghhjjxolo....',
      'oKKBBmmovvvhhghhwxxolo....',
      '.ooooooovvvwhghwwxxoko....',
      '.......oiiiiiiiiiieoko....',
      '.......opqqqqqqqqrooo.....',
      '........oppqooqqro........',
      '.......ouuttoouutto.......',
    ],
  },
  // SCRATCH: the sheepish scratch, the near hand up on the side of the head
  scratch: {
    as: 'scratch',
    eyes: 'happy',
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '...OO.....................',
      '..OSKO....................',
      '..OKKO....................',
      '.OCBO.....................',
      '.OCBO.....................',
      'oNMO......................',
      'oNMo......................',
      'onmoo.....................',
      '.onmoo....................',
      '..onmoo...................',
      '...onfoooooooooooooo......',
      '....offfjjjhhghhjjjjjo....',
      '.......ofjjhhghhjjxolo....',
      '.......ovvvhhghhwxxobo....',
      '.......ovvvwhghwwxxoko....',
      '.......oiiiiiiiiiieoko....',
      '.......opqqqqqqqqrooo.....',
      '........oppqooqqro........',
      '.......ouuttoouutto.......',
    ],
  },
  // FLICK: the near hand brought up to the bangs, flicking the hair off the
  // brow (Sasuke's cheer), the forearm across the side of the face from the
  // elbow at the shoulder
  flick: {
    as: 'scratch',
    eyes: 'half',
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '.....OO...................',
      '....OSKO..................',
      '....OKKO..................',
      '...OCBO...................',
      '..OCBO....................',
      '..oNMo....................',
      '..onmoo...................',
      '...onfoooooooooooooo......',
      '....offfjjjhhghhjjjjjo....',
      '.......ofjjhhghhjjxolo....',
      '.......ovvvhhghhwxxobo....',
      '.......ovvvwhghwwxxoko....',
      '.......oiiiiiiiiiieoko....',
      '.......opqqqqqqqqrooo.....',
      '........oppqooqqro........',
      '.......ouuttoouutto.......',
    ],
  },
  // POKE: the fingertips poked together at the chest, elbows in (shy): the
  // two fingertips touching in skin (no outline between them) a row under the
  // collar, the fists under them, the jacket showing between the chin and
  // the hands (held at the chin they read as a goatee). Its face is happy, as
  // the roster's cheers are (Hinata's poseEyes draw it shy)
  poke: {
    as: 'poke',
    eyes: 'happy',
    hand: [12, 8],
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '......oooooooooooooo......',
      '....offfjjjhhghhjjjjjo....',
      '....onmofjjhhghhjjxolo....',
      '....onmovvvwhghwwxxolo....',
      '....onmovvvossowwxxolo....',
      '....occcccsskkssbbbblo....',
      '....oooooooooooooooooo....',
      '........oppqooqqro........',
      '.......ouuttoouutto.......',
    ],
  },
  // KICK: a side kick, the near leg driven out level at the post in one line
  // from the hip to the sole, the body leaning back over the standing leg,
  // the far arm flung back for balance and the near fist pulled to the hip;
  // the head rides back and high, clear of the leg
  kick: {
    as: 'kick',
    head: [2, 1],
    eyes: 'focus',
    hand: [0, 4],
    rows: [
      //        1111111111222222222
      //2345678901234567890123456789
      '.............ooooooooooooooo',
      '.............offjjjjjnnmcbso',
      '.............ovvwwwwxmllbbko',
      'oooooooooooooovvwwwwxooooooo',
      'uuoppppppppppppiiiiieo......',
      'ttoqqqqqqqqqqqqqqqrro.......',
      'oooooooooooooooqqqro........',
      '..............opqqro........',
      '.............ouuutto........',
    ],
  },
  // RAISE: the near hand thrust straight up, high over the head
  raise: {
    as: 'raise',
    head: [1, 0],
    eyes: 'focus',
    hand: [2, 5],
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '..oo......................',
      '.oSKo.....................',
      '.oKKo.....................',
      '.oCBo.....................',
      '.oCBo.....................',
      '.oNMo.....................',
      '.oNMo.....................',
      '..oNMo....................',
      '..oNMoo...................',
      '...oNmoo..................',
      '....onmoooooooooooooo.....',
      '....offfjjjjjhghjjjjjo....',
      '.......ofjjjhhghhjjolo....',
      '.......ovvvwhhghhwxobo....',
      '.......ovvvvwhghwxxoko....',
      '.......oiiiiiiiiiieoko....',
      '.......opqqqqqqqqrooo.....',
      '........oppqooqqro........',
      '.......ouuttoouutto.......',
    ],
  },
  // SLAM: crouched forward over folded knees, both arms driven straight
  // down from under the chin to the palms slapped flat on the ground ahead
  // (the near arm and the far one a step behind it, two clean parallel
  // lines), the rounded back up behind the head
  slam: {
    as: 'slam',
    head: [-1, 2],
    eyes: 'focus',
    hand: [2, 10],
    rows: [
      //        1111111111222222
      //234567890123456789012345
      '....................ooo.....',
      '...................ovwxo....',
      '..................ovwwxxo...',
      '.................ovwwwwxo...',
      '................ovwwwwwxo...',
      '...ooo.........ovvwwwwwxo...',
      '..onmo.........oiiiiiiieo...',
      '.onmo.oo......opqqqqqqrro...',
      '.ocbooonmo...oppqqqqqrro....',
      'oskoo.ocbo..oppppoooqqro....',
      'osskkooosskko.ouuutto.ouutto',
    ],
  },
  // PERCH: crouched frog-like on top of something narrow (a Shadow Clone on
  // the post's stump): the knees thrown out wide on either side of the
  // jaw, the hands gripping them, the feet planted under them, the seat
  // between; the head sunk four pixels, so a clone stood four pixels up
  // still has its hair's tips on the stage
  perch: {
    as: 'tuck',
    head: [0, 4],
    eyes: 'focus',
    rows: [
      //        1111111111222222
      //234567890123456789012345
      '...ooooo.........ooooo....',
      '..oSKppqo.......oqppKSo...',
      '..oKKqqro.......orqqKKo...',
      '...ooqrrooooooooorrqoo....',
      '....ouuttoqqqqqouutto.....',
    ],
  },
  // SPREAD: arms flung wide and down, feet planted apart
  spread: {
    as: 'spread',
    eyes: 'focus',
    hand: [2, 8],
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '......oooooooooooooo......',
      '....offfjjjhhghhjjjjjo....',
      '...onmoofjjhhghhjjxomlo...',
      '..ocbo.ovvvhhghhwxxoocboo.',
      '.oSKo..ovvvwhghwwxxo.ooKKo',
      '.oKKo..oiiiiiiiiiieo..oKKo',
      '..oo...opqqqqqqqqrro...oo.',
      '......oppppo..oqqqro......',
      '.....ouutto...oouutto.....',
    ],
  },
  // PUNCH: a straight right at the post, the far fist cocked at the chest;
  // the arm out under the chin (the chin's outline over it), the head
  // riding over the shoulders
  punch: {
    as: 'punch',
    head: [-1, 1],
    eyes: 'focus',
    hand: [1, 6],
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '.ooo......................',
      'osskoooooooooooooooooo....',
      'oskkocccnnnnfjjjjjjjjjjjo.',
      'okkkobbbmmmmfjjvwwwwwxxlo.',
      '.oooooooooovvwwwwwwxoSKo..',
      '.........oiiiiiiiiieoKKo..',
      '.......oopqqqqqqqqqqrooo..',
      '......oppppoo....oqqqro...',
      '.....ouuuttto.....oouutto.',
    ],
  },
  // GATHER: feet planted wide, both hands cupped at the navel round the
  // gathering chakra
  gather: {
    as: 'gather',
    head: [0, 1],
    eyes: 'focus',
    hand: [12, 10],
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '......oooooooooooooo......',
      '....offfjjjhhghhjjjjjo....',
      '....onmofjjhhghhjjxolo....',
      '.....onmovvhhghhxxomlo....',
      '......ocbOOSSKOOOBBlo.....',
      '.....ooooOSKKKKOooooo.....',
      '.....oppppooOOooqqqro.....',
      '....ouuutto....ouuutto....',
    ],
  },
  // WAVE: hello, the far hand up and open beside the head
  wave: {
    as: 'raise',
    eyes: 'happy',
    hand: [23, 10],
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '.......................oo.',
      '.......................SSo',
      '.......................SKo',
      '......................oKKo',
      '.....................oobco',
      '....................ooomlo',
      '......oooooooooooooooomlo.',
      '....offfjjjhhghhjjjjmloo..',
      '....onmofjjhhghhjjoooo....',
      '....ocbovvvhhghhwxxo......',
      '....oskovvvwhghwwxxo......',
      '....oskoiiiiiiiiiieo......',
      '.....ooopqqqqqqqqro.......',
      '........oppqooqqro........',
      '.......ouuttoouutto.......',
    ],
  },
  // THINK BREATHING IN (the hand at the chin): the chest, the shoulders and the
  // hands heaved up a pixel, the legs kept (the companion's breath, `bob` 1)
  thinkIn: {
    as: 'think',
    head: [0, 0],
    eyes: 'half',
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '......ooooOOoooooooo......',
      '....offfjOSKOghjjjjjjo....',
      '....onmovOSKOghjjjxolo....',
      '....oonmoOCBOghwwxxobo....',
      '.....oonmOCBOgwwwxxoko....',
      '......oonmCBOiiiiieoko....',
      '.......oOOOOqqqqqrooo.....',
      '.......oOOOOqqqqqrooo.....',
      '........oppqooqqro........',
      '.......ouuttoouutto.......',
    ],
  },
  // SIGN1 BREATHING IN (the ox seal): the chest, the shoulders and the
  // hands heaved up a pixel, the legs kept (the companion's breath, `bob` 1)
  sign1In: {
    as: 'signs',
    eyes: 'focus',
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '......oooooooooooooo......',
      '....offfjjjhhghhjjjjjo....',
      '...onnmofjjhhOOOOjjxolo...',
      '...onmmovvvhOSKOwwxxolo...',
      '..onmmOOOOOOSKKOOOOOOlo...',
      '..oomCCCCCOSSSKKOBBBBBoo..',
      '...ooOOOOOOOOOOOOOOOOoo...',
      '.....ooopqqqqqqqqrooo.....',
      '........oppqooqqro........',
      '.......ouuttoouutto.......',
    ],
  },
  // SIGN2 BREATHING IN (the rabbit seal): the chest, the shoulders and the
  // hands heaved up a pixel, the legs kept (the companion's breath, `bob` 1)
  sign2In: {
    as: 'signs2',
    eyes: 'focus',
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '......oooooooooooooo......',
      '....offfjjjhhghhjjjjjo....',
      '....onmofjjoskohjjjolo....',
      '....onmovvosskkowxxolo....',
      '....onmovcosskkobxxolo....',
      '....onmocbokkkkobbxolo....',
      '.....oooooooooooooooo.....',
      '.....ooopqqqqqqqqrooo.....',
      '........oppqooqqro........',
      '.......ouuttoouutto.......',
    ],
  },
  // SIGN3 BREATHING IN (the clone seal): the chest, the shoulders and the
  // hands heaved up a pixel, the legs kept (the companion's breath, `bob` 1)
  sign3In: {
    as: 'signs3',
    eyes: 'focus',
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '......oooooooOoooooo......',
      '....offfjjjhOSOhjjjjjo....',
      '...onnmofjjOSSSOjjjxolo...',
      '..onnmmOOOOOOSOOOOOOolo...',
      '..onmmOCCCCOSKSKOBBBBlo...',
      '...oooOOOOOOOOOOOOOOooo...',
      '.....ooopqqqqqqqqrooo.....',
      '.....ooopqqqqqqqqrooo.....',
      '........oppqooqqro........',
      '.......ouuttoouutto.......',
    ],
  },

  // ---------------------------------------------------------------- stirring
  // The `<pose>Wind` drawings a moving hold alternates with its pose every
  // two frames (kit.ts's hold()): the hands, feet and head kept exactly
  // where the pose has them (the effects anchored on the hand stay put),
  // the jacket's back hem flicked out from under the far arm in the breeze
  // and the back trouser leg stirring. Each ninja adds their own hair (and
  // Naruto his headband's tails) streaming off the back of the head, as
  // overlays on these (ninja/<id>.ts).
  // CHARGE STIRRING (the charge held)
  chargeWind: {
    as: 'charge',
    head: [-1, 2],
    eyes: 'focus',
    hand: [1, 8],
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '......oooooooooooooo......',
      '....offfjjjhhghhjjjjjo....',
      '..oonmmofjjhhghhjjxolo....',
      'oocccnmoOOOOOOhwwxxolo....',
      'SKbboOSKBBBBBOiiieoko.....',
      'KKooOOOOOOOOOOqqqrrieo....',
      'oo..oppppo..oqqqqrro......',
      '...ouuuto...ouuutto.......',
    ],
  },
  // SIGN3 STIRRING (the clone seal held)
  sign3Wind: {
    as: 'signs3',
    eyes: 'focus',
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '......oooooooOoooooo......',
      '....offfjjjhOSOhjjjjjo....',
      '...onnmofjjOSSSOjjjxolo...',
      '..onnmmOOOOOOSOOOOOOolo...',
      '..onmmOCCCCOSKSKOBBBBlo...',
      '...oooOOOOOOOOOOOOOOooo...',
      '.....ooopqqqqqqqqroiieo...',
      '........oppqooqqro........',
      '.......ouuttoouutto.......',
    ],
  },
  // SIGN2 STIRRING (the rabbit seal held)
  sign2Wind: {
    as: 'signs2',
    eyes: 'focus',
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '......oooooooooooooo......',
      '....offfjjjhhghhjjjjjo....',
      '....onmofjjoskohjjjolo....',
      '....onmovvosskkowxxolo....',
      '....onmovcosskkobxxolo....',
      '....onmocbokkkkobbxolo....',
      '.....oooooooooooooooiieo..',
      '........oppqooqqro........',
      '.......ouuttoouutto.......',
    ],
  },
  // SIGN1 STIRRING (the ox seal held)
  sign1Wind: {
    as: 'signs',
    eyes: 'focus',
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '......oooooooooooooo......',
      '....offfjjjhhghhjjjjjo....',
      '...onnmofjjhhOOOOjjxolo...',
      '...onmmovvvhOSKOwwxxolo...',
      '..onmmOOOOOOSKKOOOOOOlo...',
      '..oomCCCCCOSSSKKOBBBBBoo..',
      '...ooOOOOOOOOOOOOOOOOoo...',
      '........oppqooqqroieo.....',
      '.......ouuttoouutto.......',
    ],
  },
  // RAISE STIRRING (the hand held up)
  raiseWind: {
    as: 'raise',
    head: [1, 0],
    eyes: 'focus',
    hand: [2, 5],
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '..oo......................',
      '.oSKo.....................',
      '.oKKo.....................',
      '.oCBo.....................',
      '.oCBo.....................',
      '.oNMo.....................',
      '.oNMo.....................',
      '..oNMo....................',
      '..oNMoo...................',
      '...oNmoo..................',
      '....onmoooooooooooooo.....',
      '....offfjjjjjhghjjjjjo....',
      '.......ofjjjhhghhjjolo....',
      '.......ovvvwhhghhwxobo....',
      '.......ovvvvwhghwxxoko....',
      '.......oiiiiiiiiiieoko....',
      '.......opqqqqqqqqroiieo...',
      '........oppqooqqro........',
      '.......ouuttoouutto.......',
    ],
  },
  // GATHER STIRRING (chakra gathered at the navel)
  gatherWind: {
    as: 'gather',
    head: [0, 1],
    eyes: 'focus',
    hand: [12, 10],
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '......oooooooooooooo......',
      '....offfjjjhhghhjjjjjo....',
      '....onmofjjhhghhjjxolo....',
      '.....onmovvhhghhxxomlo....',
      '......ocbOOSSKOOOBBlo.....',
      '.....ooooOSKKKKOoooooieo..',
      '.....oppppooOOooqqqro.....',
      '....ouuutto....ouuutto....',
    ],
  },
  // THUMBS STIRRING (the thumbs-up held)
  thumbsWind: {
    as: 'thumbs',
    eyes: 'happy',
    hand: [1, 6],
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '..o.......................',
      '.oSo..oooooooooooooo......',
      '.oSoofffjjjhhghhjjjjjo....',
      'oSKCCnmofjjhhghhjjxolo....',
      'oKKBBmmovvvhhghhwxxolo....',
      '.ooooooovvvwhghwwxxoko....',
      '.......oiiiiiiiiiieoko....',
      '.......opqqqqqqqqroiieo...',
      '........oppqooqqro........',
      '.......ouuttoouutto.......',
    ],
  },
  // POKE STIRRING (the shy poke held)
  pokeWind: {
    as: 'poke',
    eyes: 'happy',
    hand: [12, 8],
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '......oooooooooooooo......',
      '....offfjjjhhghhjjjjjo....',
      '....onmofjjhhghhjjxolo....',
      '....onmovvvwhghwwxxolo....',
      '....onmovvvossowwxxolo....',
      '....occcccsskkssbbbblo....',
      '....oooooooooooooooooo....',
      '........oppqooqqroieo.....',
      '.......ouuttoouutto.......',
    ],
  },
  // THINK STIRRING (the seal at the lips)
  thinkWind: {
    as: 'think',
    head: [0, 0],
    eyes: 'half',
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '......ooooOOoooooooo......',
      '....offfjOSKOghjjjjjjo....',
      '....onmovOSKOghjjjxolo....',
      '....oonmoOCBOghwwxxobo....',
      '.....oonmOCBOgwwwxxoko....',
      '......oonmCBOiiiiieoko....',
      '.......oOOOOqqqqqroiieo...',
      '........oppqooqqro........',
      '.......ouuttoouutto.......',
    ],
  },
  // CROSSED STIRRING (arms folded, waiting)
  crossedWind: {
    as: 'crossed',
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '......oooooooooooooo......',
      '....offfjjjhhghhjjjjjo....',
      '....onmoooooooooooomlo....',
      '....onmwwwwwwocccskmlo....',
      '....onmskoccccbookkmlo....',
      '....onmcccobbbbbbbbmlo....',
      '....ooiiiiiiiiiiiiieiieo..',
      '......oooppqooqqrooo......',
      '.......ouuttoouutto.......',
    ],
  },
  // WINDUP STIRRING (sunk low, rocked back)
  windupWind: {
    as: 'gather',
    head: [1, 3],
    eyes: 'focus',
    hand: [4, 11],
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '........ooooooooooooooo...',
      '......offfjjjjhghjjjjjjo..',
      '.....onmmofjjjhghjjjxolo..',
      '....onmmoovwwwhgOOOOolo...',
      '...occbooiiiiieOSKKOoo....',
      '..oskooooqqqqqqqOOOrrieo..',
      '..oskkoooppppo..oqqqqro...',
      '...oooouuutto....ouuutto..',
    ],
  },
  // SPREAD STIRRING (arms flung wide)
  spreadWind: {
    as: 'spread',
    eyes: 'focus',
    hand: [2, 8],
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '......oooooooooooooo......',
      '....offfjjjhhghhjjjjjo....',
      '...onmoofjjhhghhjjxomlo...',
      '..ocbo.ovvvhhghhwxxoocboo.',
      '.oSKo..ovvvwhghwwxxo.ooKKo',
      '.oKKo..oiiiiiiiiiieo..oKKo',
      '..oo...opqqqqqqqqrrieo.oo.',
      '......oppppo..oqqqro......',
      '.....ouutto...oouutto.....',
    ],
  },
}

// Every companion pose (art/chibi.ts's Pose) to the jacket's drawing of it:
// all of them drawn, the signs and the stance under their own names.
export const JACKET_MAP: Readonly<Record<Pose, string>> = {
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

export const JACKET: Template = {
  name: 'jacket',
  letters: 'oskvwxnmlcbfjhgiepqrtuyz',
  root: 13,
  neck: 6,
  poses: POSES,
  map: JACKET_MAP,
}
