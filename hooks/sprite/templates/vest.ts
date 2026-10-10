// The 'vest' outfit template: a chibi in a jonin flak vest over a long-sleeved
// shirt, trousers and sandals (Kakashi; with other palettes Shikamaru, Asuma,
// Guy...). Drawn once, in SEMANTIC letters; each ninja who wears it maps them
// to colours in their own file (ninja/<id>.ts's `body`):
//   o          outline
//   s k        skin, skin shadow (hands)
//   v w x      vest: lit, mid, shadow
//   n m l      shirt and sleeves: lit, mid, shadow
//   p q r      trousers: lit, mid, shadow
//   t u        sandals: shadow, lit
//   g h        metal (glove plates): lit, shadow
//   c          the crest on the shoulder
//   b          shin wrap
//   y z        hair, light and shadow (for smears and afterimages)
//   a e d      a held prop: main, shadow, light (Kakashi's book: orange,
//              spine, pages); a ninja who carries none maps them clear (a:-)
// UPPERCASE: the same colour drawn OVER the head (a hand in front of the
// face). Light from the top left.
//
// HOW TO ADD A POSE. Draw it 26 columns wide (wider if it must be: a smear),
// the point between the feet in column 13 (ROOT), the last row on the feet.
// Give it:
//   as      the companion pose it stands for (art/chibi.ts's Pose)
//   head    [dx, dy] if the head moves from where it sits standing (the
//           neck pixel 6 rows above the feet, over the root)
//   hand    [x, y] of the held hand, if effects anchor on it
//   eyes    its own eye state, if not the face's (sign poses: 'focus')
//   breath  its other breathing frame, if it has one
// Name a pose after the companion pose it is ('crossed', 'alert'...) and point
// VEST_MAP below at it. The poses from CROSSED on were drawn after the first
// set.

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
      '....oncnvvvwwmmmwwwxlo....',
      '....onmovvwwwmwwwxxolo....',
      '....onmovwwwwwwwwxxolo....',
      '....oskovwwwwwwwwxxoko....',
      '....oskoxxxxxxxxxxxoko....',
      '.....ooopqqqqqqqqrooo.....',
      '........obbbooqqro........',
      '.......ouuttoouutto.......',
    ],
  },

  // inhale: shoulders and hands up a pixel, the vest stretched
  idle1: {
    as: 'idle',
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '......oooooooooooooo......',
      '....oncnvvvwwmmmwwwxlo....',
      '....onmovvwwwmwwwxxolo....',
      '....onmovwwwwwwwwxxolo....',
      '....oskovwwwwwwwwxxoko....',
      '....oskovwwwwwwwwxxoko....',
      '....ooooxxxxxxxxxxxooo....',
      '.....ooopqqqqqqqqrooo.....',
      '........obbbooqqro........',
      '.......ouuttoouutto.......',
    ],
  },
  // OX: elbows thrown wide, the flat hand under the upright one at the belly
  sign1: {
    as: 'signs',
    eyes: 'focus',
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '......oooooooooooooo......',
      '....oncnvvvwwmmmwwwxlo....',
      '...onnmovvwwwOOOOwxxolo...',
      '...onmmovwwwOSKOwwwxolo...',
      '..onmmOOOOOOSKKOOOOOOlo...',
      '..oonNNNNNOSSSKKOMMMMMoo..',
      '...ooOOOOOOOOOOOOOOOOoo...',
      '........obbbooqqro........',
      '.......ouuttoouutto.......',
    ],
  },
  // RAT: the hands pressed together at the collar, fingers up, the elbows
  // tucked tight to the ribs. Drawn under the head (lowercase), the fingertips
  // tucked behind the chin, so the hands never read as a beard over the mask
  sign2: {
    as: 'signs2',
    eyes: 'focus',
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '......oooooooooooooo......',
      '....oncnvvvwwmmmwwwxlo....',
      '....onmovvwwwmwwwxxolo....',
      '....onmovvwoskowwxxolo....',
      '....onmovwwoskowxxxolo....',
      '....onmnnnosskkommmolo....',
      '.....oooooooooooooooo.....',
      '........obbbooqqro........',
      '.......ouuttoouutto.......',
    ],
  },
  // MONKEY: the near elbow cocked up and out, the hands meeting point-forward
  sign3: {
    as: 'signs3',
    eyes: 'focus',
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '...ooo.oooooooooooo.......',
      '..oNNNOoncvvwwmmwwwxlo....',
      '..oNMMNOOOvwwwwwwxxolo....',
      '...OOMMNNNOOOOOwwxxolo....',
      '....OOOMMMOSSSKOOwxxolo...',
      '......OOOOSSKKOMMMMMoko...',
      '.....ooooOOOOOOOOOOooo....',
      '........obbbooqqro........',
      '.......ouuttoouutto.......',
    ],
  },

  // CHARGE: knees bent, the Chidori hand thrust forward and down, the
  // other hand clamped on its wrist
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
      '....oncnvvvwwmmmwwwxlo....',
      '..oonmmovwwwwwwwwxxolo....',
      'oonnmmoOOOOOOwwwwxxolo....',
      'SKmmoOSKMMMMMOwwxxoko.....',
      'KKooOOOOOOOOOOqqqrro......',
      'oo..obbbbo..oqqqqro.......',
      '...ouuuto...ouuutto.......',
    ],
  },
  // WINDUP: sunk low and rocked back, weight on the back foot, the Chidori
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
      '......oncnvvvwwmmmwwwxlo..',
      '.....onmmovwwwwwwwwxxolo..',
      '....onmmoovwwwwwOOOOolo...',
      '...onmmooxxxxxxOSKKOoo....',
      '..oskooooqqqqqqqOOOrro....',
      '..oskko.obbbbo..oqqqqro...',
      '...oooouuutto....ouuutto..',
    ],
  },
  // DASH smear: the run frame smeared back along its path: streaks of hair,
  // vest and trousers trailing behind, the front edge left crisp
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
      '.......onnvvvwwmmmwwxxlxxwwww..ww....',
      '......onmmvwwwwwwwwxxolmmll..m.......',
      '....oonmmovwwwwwwwxxolxxww..w........',
      '..oskmmmooxxxxxxxxxxoqqrr..rr..r.....',
      '.oskkooo.oqqqqqqqqqrrqqrr..r.........',
      '..oo....obbbbo..ooqqrrqq...r..r......',
      '.......ouuuttto...oouttt..tt.........',
    ],
  },
  // DASH: the run's contact frame, a long low split, the Chidori
  // carried forward and low, the far arm flung back
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
      '.......onnvvvwwmmmwwxxloo.',
      '......onmmvwwwwwwwwxxolmlo',
      '....oonmmovwwwwwwwxxoolloo',
      '..oskmmmooxxxxxxxxxxoooo..',
      '.oskkooo.oqqqqqqqqqrro....',
      '..oo....obbbbo..ooqqrro...',
      '.......ouuuttto...oqqrro..',
      '..................oouutto.',
    ],
  },
  // STRIKE: the lunge, the near arm driven straight out at the post (Raikiri
  // in the fist), one clean line from under the jaw to the knuckles, the
  // head carried level, leaning in, so the vest shows under the chin; the far
  // fist chambered at the hip, the front knee bent, the back leg long
  strike: {
    as: 'strike',
    head: [-2, 0],
    eyes: 'focus',
    hand: [1, 7],
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '..........ooooooooooo.....',
      '.........onvvvwwmmmxlo....',
      '.ooooooo.onmvwwwwwxxlo....',
      'osskonnnnnnmvwwwwwxxlo....',
      'okkkommmmmmmovwwwwxxoko...',
      '.oooooooooooooxxxxxxoko...',
      '........oopqqqqqqqqrroo...',
      '.......obbbboo.....oqqro..',
      '......ouuuttto......ouutto',
    ],
  },
  // FOLLOW-THROUGH: carried a pixel past the hit and sunk into it, the arm
  // still out, the back heel kicked up behind
  follow: {
    as: 'punch',
    head: [-3, 1],
    eyes: 'focus',
    hand: [1, 8],
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '...........ooooooooooo....',
      '..........onvvvwwmmmxlo...',
      '.oooooooo.onmvwwwwwxxlo.oo',
      'osskonnnnnnnmvwwwwwxxloouo',
      'okkkommmmmmmmovwwwwxxootuo',
      '.ooooooooooooooxxxxxxooqro',
      '.......oobbbbopqqqqqqrrrro',
      '......ouuuttto.oooooooooo.',
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
      '..oooooncvvvwwmmmwwwxlooo.',
      '.onnmmmovvwwwwwwwwxxommllo',
      '.osskooovwwwwwwwwwxxoosko.',
      '..ooo.ooxxxxxxxxxxxxoooo..',
      '....oobbboqqqqqqqqqroo....',
      '...ouutttoo......ouuttto..',
    ],
  },
  // TUCK: a cannonball in the air, knees hugged up under the chin, hands
  // on the shins, soles showing; compact so the feet clear the ground by
  // 4 px while the head rises only 1
  tuck: {
    as: 'tuck',
    head: [0, 4],
    eyes: 'shut',
    rows: [
      '..........................',
      '..........................',
      '......oooooooooooooo......',
      '...oooncvvvwwmmmwwwlo.....',
      '..oqqqoovwwwwwwwwxxolo....',
      '.oqqqqqOSKwwwwwwxxoqqo....',
      '.oqqrrrOKKoxxxxxxoqqqro...',
      '..oqrroOOooqqqqqoqqrro....',
      '..ouuuttoo......oouutto...',
      '...oooooo........ooooo....',
    ],
  },
  // JUMP: the cheer's happy hop, heels kicked up behind, a fist pumped
  // beside his face; folded so it can rise 3 px without clipping the hair
  jump: {
    as: 'raise',
    head: [0, 2],
    eyes: 'happy',
    rows: [
      '..........................',
      '.oo.......................',
      'oSKo......................',
      'oKKo......................',
      'oNMo......................',
      '.oNMo.....................',
      '..oNMoooooooooooooo.......',
      '...oonmvvvwwmmmwwwxlo.....',
      '.....omovwwwwwwwxxolo.....',
      '.....omovwwwwwwwxxoko.....',
      '.....oooxxxxxxxxxxooo.....',
      '.......opqqqqqqqqroooo....',
      '.......obbbooqqqqrqqtto...',
      '........ouuto.ooooqqtto...',
      '.........ooo......oooo....',
    ],
  },
  // CHEER: the sheepish head-scratch: the far hand on the back of his hair,
  // the elbow jutting up and out, the eye-smile
  cheer: {
    as: 'scratch',
    breath: 'cheer2',
    head: [0, 0],
    eyes: 'happy',
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '.....................OOOo.',
      '....................OSSKKo',
      '....................OSKKmo',
      '.....................OOmlo',
      '.......................mlo',
      '.......................mlo',
      '......................omlo',
      '.....................omlo.',
      '....................omlo..',
      '......oooooooooooooomlo...',
      '....oncnvvvwwmmmwwwxlo....',
      '....onmovvwwwwwwwxxolo....',
      '....onmovwwwwwwwwxxolo....',
      '....oskovwwwwwwwwxxoo.....',
      '....oskoxxxxxxxxxxxo......',
      '.....ooopqqqqqqqqrro......',
      '........obbbooqqro........',
      '.......ouuttoouutto.......',
    ],
  },
  // the scratch: the hand rubbed a pixel lower
  cheer2: {
    as: 'scratch',
    head: [0, 0],
    eyes: 'happy',
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '.....................OOOo.',
      '....................OSSKKo',
      '....................OSKKmo',
      '.....................OOmlo',
      '.......................mlo',
      '......................omlo',
      '.....................omlo.',
      '....................omlo..',
      '......oooooooooooooomlo...',
      '....oncnvvvwwmmmwwwxlo....',
      '....onmovvwwwwwwwxxolo....',
      '....onmovwwwwwwwwxxolo....',
      '....oskovwwwwwwwwxxoo.....',
      '....oskoxxxxxxxxxxxo......',
      '.....ooopqqqqqqqqrro......',
      '........obbbooqqro........',
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
      '..........oooonvvwwxxoo...',
      '.......oooonnmvwwwwwxxlo..',
      '....oonnmmmovwwwwwwwxxlo..',
      '...onnmmoovwwwwwwwwxxolo..',
      '...onmoooxxxxxxxxxxxooko..',
      '...osko.oqqqqqqqqrroooo...',
      '...oskko.obbbooqqro.......',
      '....oooouuttoouutto.......',
    ],
  },
  // SLEEP: sat cross-legged, nodded off, the head drooped onto the chest: the
  // shoulders and the vest's hem either side of the chin, the elbows bent and
  // the forearms in along the thighs to the hands folded in the lap, the
  // knees out a pixel or two past the head on each side and the shins crossed
  // under the hands, the sandals' toes peeking where they cross; one rounded
  // base on the floor, nothing trailing toward the post
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
      '....oncovvwwwwwwwwxomlo...',
      '....onmovvwwwwwwwxxomlo...',
      '....onmovwwwwwwwwxxomlo...',
      '..ooonmmoxxxxxxxxxommlooo.',
      '.oppqonnmmsssksskmmlloqrro',
      '.opqqqqqqouutouutoqqqqrrro',
      '..ooooooooooooooooooooooo.',
    ],
  },
  // THINK: the far hand holding his book up, the near hand on his chin
  think: {
    as: 'think',
    head: [0, 0],
    eyes: 'half',
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '......oooooooooooooo......',
      '....oncnvOOOOmmmwwwxlo....',
      '....onmoOSSKOwwwwxxolo....',
      '...ooooONNMOwwwwwxxolo....',
      '..ODDDDOONMowwwwwxxoko....',
      '..OAACAOOMOwwwwwxxxoko....',
      '..OAACAOxxxxxxxxxxxoko....',
      '...OOOOOopqqqqqqqqroo.....',
      '........obbbooqqro........',
      '.......ouuttoouutto.......',
    ],
  },

  // ------------------------------------------------------------ drawn later
  // CROSSED: arms folded across the chest, waiting, tucked up under the chin so
  // the vest shows above them (at the sides) and below them (two rows, its
  // pouches either side of the zip). The upper arms run down the sides to
  // the elbows, which stick out a pixel past the waist (the silhouette
  // narrows under them: nothing hangs at the sides); the near forearm runs
  // from its elbow along under the chin and steps up to a fist on the far
  // upper arm; the far hand tucked under the near arm, its fingers peeking
  // at the near elbow. Rows 7-9 are drawn over the head (UPPERCASE): a
  // breath or a nod sinks the chin behind the folded arms, never below them.
  crossed: {
    as: 'crossed',
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '......oooooooooooooo......',
      '....oncnvvvwwmmmwwwxlo....',
      '....onmkvwwwwwwwonsslo....',
      '....ONNNNNNNNNNNNNKKLO....',
      '....OOOOWVVVXMXVVVXOOOO...',
      '.......OXWWWXXXWWWXO......',
      '.......opqqqqqqqqroo......',
      '........obbbooqqro........',
      '.......ouuttoouutto.......',
    ],
  },
  // ALERT: the start, both hands flung up (eyes left to the face: surprised)
  alert: {
    as: 'alert',
    head: [1, 0],
    rows: [
      '..........................',
      '.oo.......................',
      'oSKo......................',
      'oKKo....................o.',
      '.oNMo.................OSKo',
      '..oNMo................oKKo',
      '...oNMoooooooooooooooomlo.',
      '....onmcvvvwwmmmwwwwxlo...',
      '.....oooovvwwwmwwwxxoo....',
      '........ovwwwwwwwwxxo.....',
      '.......ovwwwwwwwwxxo......',
      '.......oxxxxxxxxxxxo......',
      '.......opqqqqqqqqro.......',
      '........obbbooqqro........',
      '.......ouuttoouutto.......',
    ],
  },
  // THUMBS: a thumbs-up held out
  thumbs: {
    as: 'thumbs',
    hand: [1, 6],
    eyes: 'happy',
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '..o.......................',
      '.oSo..oooooooooooooo......',
      '.oSooncnvvvwwmmmwwwxlo....',
      'oSKNNnmovvwwwmwwwxxolo....',
      'oKKMMmmovwwwwwwwwxxolo....',
      '.ooooooovwwwwwwwwxxoko....',
      '.......oxxxxxxxxxxxoko....',
      '.......opqqqqqqqqrooo.....',
      '........obbbooqqro........',
      '.......ouuttoouutto.......',
    ],
  },
  // SCRATCH: the near hand up at the side of his head, scratching: the elbow out
  // at the side in one sharp corner, the forearm up to the fingers in the hair
  scratch: {
    as: 'scratch',
    hand: [4, 9],
    eyes: 'happy',
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '....OO....................',
      '...OSKO...................',
      '..oOKKO...................',
      '.onNMO....................',
      'onmmo.....................',
      'onmo......................',
      '.onmo.....................',
      '..onmooooooooooooooo......',
      '....oncnvvvwwmmmwwwxlo....',
      '.......ovvwwwmwwwxxolo....',
      '.......ovwwwwwwwwxxolo....',
      '.......ovwwwwwwwwxxoko....',
      '.......oxxxxxxxxxxxoko....',
      '.......opqqqqqqqqrooo.....',
      '........obbbooqqro........',
      '.......ouuttoouutto.......',
    ],
  },
  // POKE: fingertips poked together under the chin
  poke: {
    as: 'poke',
    head: [0, 1],
    hand: [12, 7],
    eyes: 'happy',
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '......oooooooooooooo......',
      '....oncnvvvwwmmmwwwxlo....',
      '....onmovvOOOOOwwxxolo....',
      '....onmovOSKSSKOwxxolo....',
      '....onmoNMKKOKKMLxolo.....',
      '....onmNMOOOoOOOLlolo.....',
      '.....oooooqqqqqroooo......',
      '........obbbooqqro........',
      '.......ouuttoouutto.......',
    ],
  },
  // KICK: a side kick at the post: the near leg shot out level from the hip
  // in one clean line, the sole on the post (the hand point), the body leant
  // back off it on the standing leg, the head carried up and back, the far arm
  // flung back for balance
  kick: {
    as: 'kick',
    head: [2, 0],
    hand: [1, 9],
    eyes: 'focus',
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '...........ooooooooooo....',
      '..........onvvvwwmmmxlooo.',
      '.........onmvwwwwwwxxlmlko',
      '.oo......onmvwwwwwxxolooo.',
      'outoooooooooxxxxxxxxoo....',
      'ottbbbpppppqqqqqqqqrro....',
      'ottbbbqqqqqqqqqqqqqro.....',
      '.ooooooooooooqqqqqro......',
      '...........ouuutto........',
    ],
  },
  // RAISE: a hand raised high, the hand point just above the palm (where an orb sits)
  raise: {
    as: 'raise',
    head: [1, 0],
    hand: [2, 5],
    eyes: 'focus',
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '..oo......................',
      '.oSKo.....................',
      '.oKKo.....................',
      '.oNMo.....................',
      '.oNMo.....................',
      '.oNMo.....................',
      '.oNMo.....................',
      '..oNMo....................',
      '..oNMo....................',
      '...oNmo...................',
      '....onmoooooooooooooo.....',
      '....oncnvvvwwmmmwwwxlo....',
      '.......ovvwwwmwwwxxolo....',
      '.......ovwwwwwwwwxxolo....',
      '.......ovwwwwwwwwxxoko....',
      '.......oxxxxxxxxxxxoko....',
      '.......opqqqqqqqqrooo.....',
      '........obbbooqqro........',
      '.......ouuttoouutto.......',
    ],
  },
  // SLAM: dropped into a crouch, the head straight over the body, the near
  // arm one clean diagonal from under the jaw down to the palms slapped flat on
  // the ground in front (the hand point, between them), the back and the
  // folded legs behind
  slam: {
    as: 'slam',
    head: [0, 1],
    hand: [3, 13],
    eyes: 'focus',
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '....................oooo..',
      '...................ovvxo..',
      '......oo...........ovwxo..',
      '.....onmo.........ovwwxo..',
      '....onmlo........oxxxxxo..',
      '...onmlo...oooooopqqqqro..',
      '..onmlo...obbbbo..oqqro...',
      'ossksskko.obbbo...oqqro...',
      'okkkokkko.ouutto..ouutto..',
    ],
  },
  // SPREAD: arms flung wide
  spread: {
    as: 'spread',
    hand: [2, 8],
    eyes: 'focus',
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '......oooooooooooooo......',
      '....oncnvvvwwmmmwwwxlo....',
      '...onmoovvwwwmwwwxxomlo...',
      '..onmo.ovwwwwwwwwxxo.mlo..',
      '.oSKo..ovwwwwwwwwxxo..oKKo',
      '.oKKo..oxxxxxxxxxxxo..oKKo',
      '..oo...opqqqqqqqqrro...oo.',
      '......obbbbo..oqqqro......',
      '.....ouutto...oouutto.....',
    ],
  },
  // PUNCH: a straight punch from a short stance, upright: the near arm out
  // level under the jaw in one clean line, the far fist chambered at the hip
  punch: {
    as: 'punch',
    head: [-1, 0],
    hand: [1, 7],
    eyes: 'focus',
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '.........oooooooooooo.....',
      '........onvvvwwmmmwxlo....',
      '.ooooooonmvwwwwwwwxxlo....',
      'osskonnnnnnmvwwwwwxxoko...',
      'okkkommmmmmmovwwwwxxoko...',
      '.oooooooooooooxxxxxxooo...',
      '.........oopqqqqqqrro.....',
      '......obbbbo..oqqqro......',
      '.....ouuutto..oouutto.....',
    ],
  },
  // GATHER: chakra gathered between the hands, low
  gather: {
    as: 'gather',
    head: [0, 1],
    hand: [11, 9],
    eyes: 'focus',
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '......oooooooooooooo......',
      '....oncnvvvwwmmmwwwxlo....',
      '....onmovvwwwmwwwxxolo....',
      '....onmovwwwwwwwwxxolo....',
      '.....onNNOOSSKKOOMMlo.....',
      '......ooNNOSKKKOMloo......',
      '.....obbbboOOOOoqqqro.....',
      '....ouuutto....ouuutto....',
    ],
  },
  // WAVE: a hello, the hand raised to the side
  wave: {
    as: 'raise',
    hand: [23, 10],
    eyes: 'happy',
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
      '........................o.',
      '.......................SSo',
      '.......................SKo',
      '.......................KKo',
      '......................omlo',
      '......................omlo',
      '......oooooooooooooo.omlo.',
      '....oncnvvvwwmmmwwwxmlo...',
      '....onmovvwwwmwwwxxoo.....',
      '....onmovwwwwwwwwxxo......',
      '....oskovwwwwwwwwxxo......',
      '....oskoxxxxxxxxxxxo......',
      '.....ooopqqqqqqqqro.......',
      '........obbbooqqro........',
      '.......ouuttoouutto.......',
    ],
  },
  // SIGN1 STIRRING (the OX seal held): the shoulders and chest heaved up a
  // pixel under the strain, the hands and feet kept (kit.ts's hold())
  sign1Wind: {
    as: 'signs',
    eyes: 'focus',
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '......oooooooooooooo......',
      '....oncnvvvwwmmmwwwxlo....',
      '...onnmovvwwwOOOOwxxolo...',
      '...onmmovwwwOSKOwwwxolo...',
      '...onmmovwwwOSKOwwwxolo...',
      '..onmmOOOOOOSKKOOOOOOlo...',
      '..oonNNNNNOSSSKKOMMMMMoo..',
      '...ooOOOOOOOOOOOOOOOOoo...',
      '........obbbooqqro........',
      '.......ouuttoouutto.......',
    ],
  },
  // SIGN2 STIRRING (the Rat seal held): the shoulders and chest heaved up a
  // pixel under the strain, the hands and feet kept (kit.ts's hold())
  sign2Wind: {
    as: 'signs2',
    eyes: 'focus',
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '......oooooooooooooo......',
      '....oncnvvvwwmmmwwwxlo....',
      '....onmovvwwwmwwwxxolo....',
      '....onmovvwwwmwwwxxolo....',
      '....onmovvwoskowwxxolo....',
      '....onmovwwoskowxxxolo....',
      '....onmnnnosskkommmolo....',
      '.....oooooooooooooooo.....',
      '........obbbooqqro........',
      '.......ouuttoouutto.......',
    ],
  },
  // SIGN3 STIRRING (the MONKEY seal held): the shoulders and chest heaved up a
  // pixel under the strain, the hands and feet kept (kit.ts's hold())
  sign3Wind: {
    as: 'signs3',
    eyes: 'focus',
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '...ooo.oooooooooooo.......',
      '..oNNNOoncvvwwmmwwwxlo....',
      '..oNMMNOOOvwwwwwwxxolo....',
      '...OOMMNNNOOOOOwwxxolo....',
      '...OOMMNNNOOOOOwwxxolo....',
      '....OOOMMMOSSSKOOwxxolo...',
      '......OOOOSSKKOMMMMMoko...',
      '.....ooooOOOOOOOOOOooo....',
      '........obbbooqqro........',
      '.......ouuttoouutto.......',
    ],
  },
  // CROSSED STIRRING (arms folded, waiting): the shoulders heaved up a pixel,
  // the fist squeezed a pixel up the far arm (kit.ts's hold())
  crossedWind: {
    as: 'crossed',
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '......oooooooooooooo......',
      '....oncnvvvwwmmmwwwxlo....',
      '....onmovwwwwwwwwosslo....',
      '....onmkvwwwwwwwonkklo....',
      '....ONNNNNNNNNNNNNNNLO....',
      '....OOOOWVVVXMXVVVXOOOO...',
      '.......OXWWWXXXWWWXO......',
      '.......opqqqqqqqqroo......',
      '........obbbooqqro........',
      '.......ouuttoouutto.......',
    ],
  },
  // GATHER STIRRING (chakra gathered low): the shoulders and chest heaved up a
  // pixel under the strain, the hands and feet kept (kit.ts's hold())
  gatherWind: {
    as: 'gather',
    head: [0, 1],
    hand: [11, 9],
    eyes: 'focus',
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '......oooooooooooooo......',
      '....oncnvvvwwmmmwwwxlo....',
      '....onmovvwwwmwwwxxolo....',
      '....onmovwwwwwwwwxxolo....',
      '....onmovwwwwwwwwxxolo....',
      '.....onNNOOSSKKOOMMlo.....',
      '......ooNNOSKKKOMloo......',
      '.....obbbboOOOOoqqqro.....',
      '....ouuutto....ouuutto....',
    ],
  },
  // CHARGE STIRRING (the charge held): the shoulders and chest heaved up a
  // pixel under the strain, the hands and feet kept (kit.ts's hold())
  chargeWind: {
    as: 'charge',
    head: [-1, 2],
    hand: [1, 7],
    eyes: 'focus',
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '......oooooooooooooo......',
      '....oncnvvvwwmmmwwwxlo....',
      '..oonmmovwwwwwwwwxxolo....',
      'oonnmmoOOOOOOwwwwxxolo....',
      'oonnmmoOOOOOOwwwwxxolo....',
      'SKmmoOSKMMMMMOwwxxoko.....',
      'KKooOOOOOOOOOOqqqrro......',
      'oo..obbbbo..oqqqqro.......',
      '...ouuuto...ouuutto.......',
    ],
  },
  // SPREAD STIRRING (arms flung wide, roaring): the shoulders and chest heaved up a
  // pixel under the strain, the hands and feet kept (kit.ts's hold())
  spreadWind: {
    as: 'spread',
    hand: [2, 8],
    eyes: 'focus',
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '......oooooooooooooo......',
      '....oncnvvvwwmmmwwwxlo....',
      '...onmoovvwwwmwwwxxomlo...',
      '..onmo.ovwwwwwwwwxxo.mlo..',
      '..onmo.ovwwwwwwwwxxo.mlo..',
      '.oSKo..ovwwwwwwwwxxo..oKKo',
      '.oKKo..oxxxxxxxxxxxo..oKKo',
      '..oo...opqqqqqqqqrro...oo.',
      '......obbbbo..oqqqro......',
      '.....ouutto...oouutto.....',
    ],
  },
  // ALERT STIRRING (hands flung up): the shoulders and chest heaved up a
  // pixel under the strain, the hands and feet kept (kit.ts's hold())
  alertWind: {
    as: 'alert',
    head: [1, 0],
    rows: [
      '.oo.......................',
      'oSKo......................',
      'oKKo....................o.',
      '.oNMo.................OSKo',
      '.oNMo.................OSKo',
      '..oNMo................oKKo',
      '...oNMoooooooooooooooomlo.',
      '....onmcvvvwwmmmwwwwxlo...',
      '.....oooovvwwwmwwwxxoo....',
      '........ovwwwwwwwwxxo.....',
      '.......ovwwwwwwwwxxo......',
      '.......oxxxxxxxxxxxo......',
      '.......opqqqqqqqqro.......',
      '........obbbooqqro........',
      '.......ouuttoouutto.......',
    ],
  },
  // PUNCH STIRRING (the fist held out, clenched): the shoulders and chest heaved up a
  // pixel under the strain, the hands and feet kept (kit.ts's hold())
  punchWind: {
    as: 'punch',
    head: [-1, 0],
    hand: [1, 6],
    eyes: 'focus',
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '.........oooooooooooo.....',
      '........onvvvwwmmmwxlo....',
      '.ooooooonmvwwwwwwwxxlo....',
      'osskonnnnnnmvwwwwwxxoko...',
      'osskonnnnnnmvwwwwwxxoko...',
      'okkkommmmmmmovwwwwxxoko...',
      '.oooooooooooooxxxxxxooo...',
      '.........oopqqqqqqrro.....',
      '......obbbbo..oqqqro......',
      '.....ouuutto..oouutto.....',
    ],
  },
  // RAISE STIRRING: the raised arm stretched a pixel higher (the orb on the
  // palm bobs with it), the body kept
  raiseWind: {
    as: 'raise',
    head: [1, 0],
    hand: [2, 4],
    eyes: 'focus',
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '..oo......................',
      '.oSKo.....................',
      '.oKKo.....................',
      '.oNMo.....................',
      '.oNMo.....................',
      '.oNMo.....................',
      '.oNMo.....................',
      '..oNMo....................',
      '..oNMo....................',
      '...oNmo...................',
      '...oNmo...................',
      '....onmoooooooooooooo.....',
      '....oncnvvvwwmmmwwwxlo....',
      '.......ovvwwwmwwwxxolo....',
      '.......ovwwwwwwwwxxolo....',
      '.......ovwwwwwwwwxxoko....',
      '.......oxxxxxxxxxxxoko....',
      '.......opqqqqqqqqrooo.....',
      '........obbbooqqro........',
      '.......ouuttoouutto.......',
    ],
  },
  // STRIKE STIRRING: the arm held out at the post trembling a pixel up at the
  // fist (Kamui's strain), the body and head still
  strikeWind: {
    as: 'strike',
    head: [-2, 0],
    hand: [1, 6],
    eyes: 'focus',
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '..........ooooooooooo.....',
      '.ooooooo.onvvvwwmmmxlo....',
      'osskonnnnonmvwwwwwxxlo....',
      'okkkommmmnnmvwwwwwxxlo....',
      '.oooooooommmovwwwwxxoko...',
      '.oooooooooooooxxxxxxoko...',
      '........oopqqqqqqqqrroo...',
      '.......obbbboo.....oqqro..',
      '......ouuuttto......ouutto',
    ],
  },
  // SLAM STIRRING: the palms pressed to the ground, the back heaving a pixel,
  // the arm and the folded legs kept
  slamWind: {
    as: 'slam',
    head: [0, 1],
    hand: [3, 13],
    eyes: 'focus',
    rows: [
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '....................oooo..',
      '...................ovvxo..',
      '...................ovwxo..',
      '......oo..........ovwwxo..',
      '.....onmo........oxxxxxo..',
      '....onmlo........oxxxxxo..',
      '...onmlo...oooooopqqqqro..',
      '..onmlo...obbbbo..oqqro...',
      'ossksskko.obbbo...oqqro...',
      'okkkokkko.ouutto..ouutto..',
    ],
  },
  // SCRATCH, RUBBING: the hand drawn a pixel down the side of his head (the
  // scratch's other frame, and its stir in a moving hold)
  scratchWind: {
    as: 'scratch',
    hand: [4, 10],
    eyes: 'happy',
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
      '....OO....................',
      '...OSKO...................',
      '.onOKKO...................',
      'onmmo.....................',
      'onmo......................',
      '.onmo.....................',
      '..onmooooooooooooooo......',
      '....oncnvvvwwmmmwwwxlo....',
      '.......ovvwwwmwwwxxolo....',
      '.......ovwwwwwwwwxxolo....',
      '.......ovwwwwwwwwxxoko....',
      '.......oxxxxxxxxxxxoko....',
      '.......opqqqqqqqqrooo.....',
      '........obbbooqqro........',
      '.......ouuttoouutto.......',
    ],
  },
}

// Every companion pose (art/chibi.ts's Pose) to the vest's drawing of it. A
// template not yet drawn in every pose points the missing ones at the nearest
// drawn (a stand-in) until they are; the vest has them all.
//   companion   drawn      what
//   idle        idle0      standing (the breath: idle1)
//   crossed     crossed    arms folded, waiting
//   think       think      the book up, a hand on the chin
//   signs       sign1      OX
//   signs2      sign2      RABBIT
//   signs3      sign3      MONKEY
//   gather      gather     chakra between the hands, low
//   charge      charge     the Chidori hand thrust down
//   strike      strike     the arm driven out at the post
//   punch       punch      a straight punch
//   kick        kick       a side kick
//   dash        dash       the run's contact frame
//   slam        slam       both palms to the ground
//   raise       raise      a hand raised high
//   alert       alert      the start, both hands up
//   thumbs      thumbs     a thumbs-up
//   scratch     scratch    a hand to the back of the head (Kakashi: his cheer)
//   spread      spread     arms flung wide
//   poke        poke       fingertips under the chin
//   tuck        tuck       knees hugged in the air
//   sleep       sleep      sat down, arms folded, head on chest
//   slump       slump      the frame sagging forward
// (Before the later poses were drawn their stand-ins were: crossed idle0,
// gather charge, punch and kick follow, slam and spread crouch, raise and
// thumbs jump, alert idle1, scratch cheer, poke sign2.)
export const VEST_MAP: Readonly<Record<Pose, string>> = {
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

export const VEST: Template = {
  name: 'vest',
  letters: 'oskvwxnmlpqrtughcbyzaed',
  root: 13,
  neck: 6,
  poses: POSES,
  map: VEST_MAP,
}
