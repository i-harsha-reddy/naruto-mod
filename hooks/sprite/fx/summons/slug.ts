// Katsuyu, the giant slug (Tsunade's summon), rearing up over the arena
// (26x30, taller than the stage): a white-mint body lit from the upper left,
// two blue stripes running from between her eye stalks over her crown and
// down her back, the stalks up on top with dark round eyes glinting at their
// tips, a gloss on her brow, a smiling mouth at the front of her big head,
// the deep shade of her chin on the neck, and the broad foot along the floor.
// Drawn to loom where she can be seen: placed with her foot sunk below the
// floor (FxUse's `sink`, 6) she fills the stage from the ground to its top
// row, the eyes at its very top; her head (columns 0-14) leans out between
// the post and Tsunade at home (whose hair starts at stage column 27), the
// face right over the post's shoulder, her back behind Tsunade. GIANT_OPEN: spitting,
// the mouth gaping with acid in it (fx 'katsuyuGiant', frame 1; the jet comes
// out of the mouth's front, column 2, row 9). Letters: a body, b shade, c stripe, d eye,
// e white, f foot, g mouth, h deep shade, i acid.
import { outlined } from '../../grid.ts'
import type { FxFamily } from '../../types.ts'
import type { PixelSprite } from '../summons.ts'

export const GIANT: readonly string[] = [
  '....edd...edd.............',
  '....ddd...ddd.............',
  '.....aj....aj.............',
  '.....aj....aj.............',
  '....aakcaakcjjjb..........',
  '...aeeaakcaakcjjjb........',
  '..aeaaaakcaakcjjjjb.......',
  '.aeaaaaaakcaakcjjjjb......',
  'aaaaaaaaakcaakcjjjjjb.....',
  'agaaaagaaakcaakcjjjjjb....',
  'aaggggaaaakcaakcjjjjjb....',
  'aaaaaaaaaakcaakcjjjjjbj...',
  'haaaaaaaaaakcaakcjjjjbj...',
  '.haaaaaaaaakcaakcjjjjbj...',
  '.aaaaaaaaaakcaakcjjjjjbj..',
  '.aaaaaaaaaaakcjjkcjjjjbj..',
  '.bbaaaaaaaaakcjjkcjjjbbj..',
  '.bbbbaaaaaaakcjjkcjjjbbj..',
  '.bbbbbaaaaaakcjjkcjjjbbbj.',
  '.bbbbbaaaaajkcjjkcjjjbbbj.',
  'hhhbbbaaajjjjkcjjkcjbbbbj.',
  'hhhhbbbjjjjjjkcjjkcjbbbbj.',
  'hhhhbbbjjjjjjkcjjkcbbbbbj.',
  'hhhhhbbbjjjjjkcjjkcbbbbbbj',
  'hhhhhbbbjjjjjkcjjklbbbbbbj',
  'hhhhhbbbjjjjjjkcjbclbbbbbh',
  'hhhhhbbbjjjjjjkcbbclbbbbbh',
  'hhhbbbbbbbbbbbclbbclbbbbhh',
  'hffffffhffffffhffffffhffff',
  'ffffffffffffffffffffffffff',
]
export const GIANT_OPEN: readonly string[] = [
  '....edd...edd.............',
  '....ddd...ddd.............',
  '.....aj....aj.............',
  '.....aj....aj.............',
  '....aakcaakcjjjb..........',
  '...aeeaakcaakcjjjb........',
  '..aeaaaakcaakcjjjjb.......',
  '.aeaaaaaakcaakcjjjjb......',
  'aaaaaaaaakcaakcjjjjjb.....',
  'aggggggaaakcaakcjjjjjb....',
  'agiiigaaaakcaakcjjjjjb....',
  'aagggaaaaakcaakcjjjjjbj...',
  'haaaaaaaaaakcaakcjjjjbj...',
  '.haaaaaaaaakcaakcjjjjbj...',
  '.aaaaaaaaaakcaakcjjjjjbj..',
  '.aaaaaaaaaaakcjjkcjjjjbj..',
  '.bbaaaaaaaaakcjjkcjjjbbj..',
  '.bbbbaaaaaaakcjjkcjjjbbj..',
  '.bbbbbaaaaaakcjjkcjjjbbbj.',
  '.bbbbbaaaaajkcjjkcjjjbbbj.',
  'hhhbbbaaajjjjkcjjkcjbbbbj.',
  'hhhhbbbjjjjjjkcjjkcjbbbbj.',
  'hhhhbbbjjjjjjkcjjkcbbbbbj.',
  'hhhhhbbbjjjjjkcjjkcbbbbbbj',
  'hhhhhbbbjjjjjkcjjklbbbbbbj',
  'hhhhhbbbjjjjjjkcjbclbbbbbh',
  'hhhhhbbbjjjjjjkcbbclbbbbbh',
  'hhhbbbbbbbbbbbclbbclbbbbhh',
  'hffffffhffffffhffffffhffff',
  'ffffffffffffffffffffffffff',
]
const PALETTE = [0xeefaf5, 0x9ccabd, 0x3a6cc8, 0x24243e, 0xffffff, 0x78b4a4, 0x3a4a6a, 0x6e9c8e, 0x6aeea4, 0xc8e6dc, 0x8cb4f4, 0x24489a]
export const sprite: PixelSprite = {
  palette: PALETTE,
  foot: [10, 29],
  rows: GIANT,
}
// the giant as an effect of two frames (closed, spitting), outlined like the summons
const LETTERS = 'abcdefghijkl'
export const giant: FxFamily = {
  palette: { ...Object.fromEntries(PALETTE.map((c, k) => [LETTERS[k]!, c])), o: 0x0e1019 },
  anchor: [11, 30],
  frames: [outlined(GIANT), outlined(GIANT_OPEN)],
}

// A little Katsuyu split off to ride on a medic's shoulder (Sakura's healing
// summon, one of the little slugs the great one divides into): 10 x 6 inside
// her outline, facing the arena, two stalks up with dark round eyes glinting
// at their tips, a gloss on her head, a small mouth at the front, the two blue
// stripes down her back, the foot along the shoulder. 0: sitting; 1: lit
// through with the healing green as she heals; 2: landing, squashed flat, the
// stalks bowed; 3: in the air, tucked up, the stalks swept back. Anchor: the
// foot's middle, on the shoulder.
const MINI = outlined([
  '.ed...ed..',
  '..a....a..',
  '..aaaaaab.',
  '.aeaacacab',
  'gaaaacacab',
  '.fffffffff',
])
const MINI_LIT = outlined([
  '.ed...ed..',
  '..h....h..',
  '..hhhhhhb.',
  '.hehhchchb',
  'ghhhhchchb',
  '.fffffffff',
])
const MINI_LAND = outlined([
  '..........',
  'ed.....ed.',
  '.aa...aa..',
  '.aeaaacacab',
  'gaaaaacacab',
  'ffffffffff.',
])
const MINI_AIR = outlined([
  '...ed.ed..',
  '....aaa...',
  '..aaaaaab.',
  '.aeaacacab',
  '.gaaacacb.',
  '..ffffff..',
])
export const mini: FxFamily = {
  palette: { a: 0xe6f6f0, b: 0xa8d4c8, c: 0x3e74d0, d: 0x1c1a2a, e: 0xffffff, f: 0x78b4a4, g: 0x3a4a6a, h: 0xc8ffd8, o: 0x0e1019 },
  anchor: [5, 7],
  frames: [MINI, MINI_LIT, MINI_LAND, MINI_AIR],
}
