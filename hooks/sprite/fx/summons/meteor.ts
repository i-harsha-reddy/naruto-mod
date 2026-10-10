// The meteor of Tengai Shinsei: a great round rock (25 x 25, bigger than
// the ninja), cratered, lit on its upper left, burning along its leading
// edge (lower right, the way it falls): a white-hot rim and a ragged bow of
// flame. Its foot is the bottom of the rock. And `meteorBig`, the second
// one, bigger still (34 x 34): it does not fit on the stage.
//
// Rolling (`meteorRoll`, and meteorBig's frames 1-3): the same rock turned
// a little a frame, its craters carried round its centre (20 degrees a
// frame for the first, 15 for the second) while the light on its upper left
// and the fire on its leading edge stay where they are: rocked 0 1 2 3 2 1
// it grinds into its crater, never a dead dome.
import { outlined } from '../../grid.ts'
import type { FxFamily } from '../../types.ts'
import type { PixelSprite } from '../summons.ts'

// a rock, b rock shade, c lit rim and crater lips, d crater, e white-hot rim,
// f flame, g the fire's heat on the rock
const PALETTE = [0x9a8a7e, 0x6e6058, 0xc4b6a8, 0x2e2426, 0xffe27a, 0xf06a24, 0xc86a3a] as const
const LETTERS = 'abcdefg'

export const sprite: PixelSprite = {
  palette: PALETTE,
  foot: [11, 22],
  rows: [
    '......cccccccaaa.........',
    '.....cccccccaaaaa........',
    '...ccccaaaaaaaaaaaa......',
    '..ccccaaaaaaaaaaaaab.....',
    '..ccaaaaaaaaaaaaaabb.....',
    '.cccaaaaaaaaaddcabbbb....',
    'cccaaaddaaaaaddcbbbbee...',
    'ccaaaddddcaaaccabbbbbee..',
    'ccaaaaddcaaaaaaaabbbbeef.',
    'ccaaaacccaaaaaaaabbbgeeff',
    'ccaaaaaaaaaaaaaaabbbgeef.',
    'ccaaaaaaaaaaaaaddcbbgeef.',
    'caaaaaaaadddcaaddcbbgeef.',
    'aaaaaaaaadddcaacccbbgeef.',
    'aaaddcaaadddcaaabbbggeeff',
    'aaaddcaaaddccaabbbbgeeef.',
    '.aaccabbacccaabbbbggeeff.',
    '..aaabbbbbbbbbbbbggeeeff.',
    '..aabbbbbbbbbbbbggeeeff..',
    '...bbbbbbbbbbbgggeeefff..',
    '.....bebbggggggeeeefff...',
    '......eeeeeeeeeeeefff....',
    '.......eeeeeeeeeffff.....',
    '........ffffffffff.......',
    '.........f....f..........',
  ],
}

const BIG = [
  '..........cccccccaaa..............',
  '.......cccccccccaaaaaaa...........',
  '......ccccaaaaaadaaaaaaa..........',
  '.....cccaaaaaaadddcaaaaaa.........',
  '....cccaaaaaaaaaccaaaaaaaa........',
  '...cccaaaaaaaaaaaaaaaaaaaab.......',
  '..cccaaaaaaaaaaaaaaaaaaaabbb......',
  '.cccaaaaaaaaaaaaaaddcaaabbbbe.....',
  '.ccaaaaadddaaaaaaaddcaabbbbbe.....',
  '.ccaaaaaddddcaaaaacccabbbbbbee....',
  'ccaaaaadddddcaaaaaaaaabbbbbbeee...',
  'ccaaaaaadddccaaaaaaaaaabbbbbgeef..',
  'ccaaaaaacdccaaaaaaaaaaabbbbbgeeff.',
  'ccaaaaaaacaaaaaaaaaaaaabbbbbgeef..',
  'ccaaaaaaaaaaaaaaaaaaaaaabbbbgeeff.',
  'ccaaaaaaaaaaaaaaaaaaaddabbbbgeeff.',
  'caaaaaaaaaaaaddaaaaaaddcbbbbgeeff.',
  'aaaaaaaaaaaaddddccaaaddcbbbbgeeff.',
  'aaaaaaaaaaaadddddcaaaccbbbbggeefff',
  'aaaaaddcaaaadddddcaaabbbbbbgeeeff.',
  '.aaadddcaaaaddddcaaabbbbbbbgeeeff.',
  '.aaaaddcaaaacccccaabbbbbbbggeefff.',
  '.aaacccaabbaaaaaaabbbbbbbggeeefff.',
  '..aaaaaabbbbbbaabbbbbbbbbgeeefff..',
  '...aaaabbbbbbbbbbbbbbbbbggeeffff..',
  '....aabbbbbbbbbbbbbbbbgggeeefff...',
  '.....bbbbbbbbbbbbbbbbggeeeeffff...',
  '......bbbbbbbbbbbbggggeeeeffff....',
  '.......eeeeggggggggeeeeefffff.....',
  '.........eeeeeeeeeeeeeefffff......',
  '..........eeeeeeeeeeeffffff.......',
  '...........ffffffffffffff.........',
  '............f.fffffffff...........',
  '..................f...............',
]
// (turned 15, 30 and 45 degrees)
const BIG_ROLL: readonly (readonly string[])[] = [
    [
      '..........cccccccaaa..............',
      '.......cccccccccaaaaaaa...........',
      '......ccccaaaaaaaaaaaaaa..........',
      '.....cccaaaaaaaaaaadaaaaa.........',
      '....cccaaaaaaaaaaadddcaaaa........',
      '...cccaaaaaaaaaaaaaccaaaaab.......',
      '..cccaaaaaaaaaaaaaaaaaaaabbb......',
      '.cccaaaaadddaaaaaaaaaaaabbbbe.....',
      '.ccaaaaaaddddcaaaaaaddcbbbbbe.....',
      '.ccaaaaadddddcaaaaaaddcbbbbbee....',
      'ccaaaaaaadddccaaaaaacccbbbbbeee...',
      'ccaaaaaaacdccaaaaaaaaaabbbbbgeef..',
      'ccaaaaaaaacaaaaaaaaaaaabbbbbgeeff.',
      'ccaaaaaaaaaaaaaaaaaaaaabbbbbgeef..',
      'ccaaaaaaaaaaaaaaaaaaaaaabbbbgeeff.',
      'ccaaaaaaaaaaddaaaaaaaaaabbbbgeeff.',
      'caaaaaaaaaaddddcaaaaddbbbbbbgeeff.',
      'aaaaddcaaaadddddccaaddcbbbbbgeeff.',
      'aaadddcaaaadddddcaaaddcbbbbggeefff',
      'aaaaddcaaaaddddcaaaaccbbbbbgeeeff.',
      '.aaaccaaaaacccccaaaabbbbbbbgeeeff.',
      '.aaaaaaaaaaaaaaaaaabbbbbbbggeefff.',
      '.aaacaaaabbaaaaaaabbbbbbbggeeefff.',
      '..aaaaaabbbbbbaabbbbbbbbbgeeefff..',
      '...aaaabbbbbbbbbbbbbbbbbggeeffff..',
      '....aabbbbbbbbbbbbbbbbgggeeefff...',
      '.....bbbbbbbbbbbbbbbbggeeeeffff...',
      '......bbbbbbbbbbbbggggeeeeffff....',
      '.......eeeeggggggggeeeeefffff.....',
      '.........eeeeeeeeeeeeeefffff......',
      '..........eeeeeeeeeeeffffff.......',
      '...........ffffffffffffff.........',
      '............f.fffffffff...........',
      '..................f...............',
    ],
    [
      '..........cccccccaaa..............',
      '.......cccccccccaaaaaaa...........',
      '......ccccaaaaaaaaaaaaaa..........',
      '.....cccaaaaaaaaaaaaaaaaa.........',
      '....cccaaaaaaaaaaaaaaadaaa........',
      '...cccaaaaaaaaaaaaaaadddcab.......',
      '..cccaaaaaadddaaaaaaaaccabbb......',
      '.cccaaaaaaaddddcaaaaaaaabbbbe.....',
      '.ccaaaaaaadddddcaaaaaaabbbbbe.....',
      '.ccaaaaaaaadddccaaaaaabbbbbbee....',
      'ccaaaaaaaaacdccaaaaaaddcbbbbeee...',
      'ccaaaaaaaaaacaaaaaaaaddcbbbbgeef..',
      'ccaaaaaaaaaaaaaaaaaaacccbbbbgeeff.',
      'ccaaaaaaaaaaaaaaaaaaaaabbbbbgeef..',
      'ccaddcaaaaaaaaaaaaaaaaaabbbbgeeff.',
      'ccdddcaaaaaddaaaaaaaaaaabbbbgeeff.',
      'caaddcaaaaddddcaaaaaaabbbbbbgeeff.',
      'aaaccaaaaadddddcacaaaabbbbbbgeeff.',
      'aaaaaaaaaadddddcaaaddbbbbbbggeefff',
      'aaaaaaaaaaddddcaaaaddcbbbbbgeeeff.',
      '.aaaaaaaaacccccaaaaddcbbbbbgeeeff.',
      '.aaaaaaaaaaaaaaaaaaccbbbbbggeefff.',
      '.aaacaaaabbaaaaaaabbbbbbbggeeefff.',
      '..aaaaaabbbbbbaabbbbbbbbbgeeefff..',
      '...aaaabbbbbbbbbbbbbbbbbggeeffff..',
      '....aabbbbbbbbbbbbbbbbgggeeefff...',
      '.....bbbbbbbbbbbbbbbbggeeeeffff...',
      '......bbbbbbbbbbbbggggeeeeffff....',
      '.......eeeeggggggggeeeeefffff.....',
      '.........eeeeeeeeeeeeeefffff......',
      '..........eeeeeeeeeeeffffff.......',
      '...........ffffffffffffff.........',
      '............f.fffffffff...........',
      '..................f...............',
    ],
    [
      '..........cccccccaaa..............',
      '.......cccccccccaaaaaaa...........',
      '......ccccaaaaaaaaaaaaaa..........',
      '.....cccaaaaaaaaaaaaaaaaa.........',
      '....cccaaaaaaaaaaaaaaaaaaa........',
      '...cccaaaaaaaaaaaaaaaaaaaab.......',
      '..cccaaaaaaaadddaaaaaaaaabbb......',
      '.cccaaaaaaaaaddddcaaaaaadbbbe.....',
      '.ccaaaaaaaaadddddcaaaaadddcbe.....',
      '.ccaaaaaaaaaadddccaaaabbccbbee....',
      'ccaaaaaaaaaaacdccaaaaabbbbbbeee...',
      'ccaaddcaaaaaaacaaaaaaaabbbbbgeef..',
      'ccadddcaaaaaaaaaaaaaaaddcbbbgeeff.',
      'ccaaddcaaaaaaaaaaaaaaaddcbbbgeef..',
      'ccaaccaaaaaddaaaaaaaaacccbbbgeeff.',
      'ccaaaaaaaaddddcaaaaaaaaabbbbgeeff.',
      'caaaaaaaaadddddcaaaaaabbbbbbgeeff.',
      'aaaaaaaaaadddddcacaaaabbbbbbgeeff.',
      'aaaaaaaaaaddddcaaaaaabbbbbbggeefff',
      'aaaaaaaaaacccccaaaddabbbbbbgeeeff.',
      '.aaaaaaaaaaaaaaaaaddcbbbbbbgeeeff.',
      '.aaaaaaaaaaaaaaaaaddcbbbbbggeefff.',
      '.aaacaaaabbaaaaaaaccbbbbbggeeefff.',
      '..aaaaaabbbbbbaabbbbbbbbbgeeefff..',
      '...aaaabbbbbbbbbbbbbbbbbggeeffff..',
      '....aabbbbbbbbbbbbbbbbgggeeefff...',
      '.....bbbbbbbbbbbbbbbbggeeeeffff...',
      '......bbbbbbbbbbbbggggeeeeffff....',
      '.......eeeeggggggggeeeeefffff.....',
      '.........eeeeeeeeeeeeeefffff......',
      '..........eeeeeeeeeeeffffff.......',
      '...........ffffffffffffff.........',
      '............f.fffffffff...........',
      '..................f...............',
    ],
]
export const meteorBig: FxFamily = {
  palette: { ...Object.fromEntries(PALETTE.map((c, i) => [LETTERS[i]!, c])), o: 0x0e1019 },
  anchor: [16, 31],
  frames: [outlined(BIG), ...BIG_ROLL.map(rows => outlined(rows))],
}

// the first rock turned 20, 40 and 60 degrees (frame 0 is the rock as drawn):
// the summons' 'meteor' family in four frames, outlined the same, its foot
// the same
const ROLL: readonly (readonly string[])[] = [
    [
      '......cccccccaaa.........',
      '.....cccccccaaaaa........',
      '...ccccaaaaaaaaaaaa......',
      '..ccccaaaaaaaaaaaaab.....',
      '..ccaaaddaaaaaaaaabb.....',
      '.cccaaddddcaaaaaabbbb....',
      'cccaaaaddcaaaaddcbbbee...',
      'ccaaaaacccaaaaddcbbbbee..',
      'ccaaaaaaaaaaaaccabbbbeef.',
      'ccaaaaaaaaaaaaaaabbbgeeff',
      'ccaaaaaaaaaaaaaaabbbgeef.',
      'ccddcaaaaaaaaaaaabbbgeef.',
      'caddcaaadddcaaaabbbbgeef.',
      'aaccaaaadddcaaddcbbbgeef.',
      'aaaaaaaadddcaaddcbbggeeff',
      'aaaaaaaaddccaacccbbgeeef.',
      '.aaaaabbcccaaabbbbggeeff.',
      '..aaabbbbbbbbbbbbggeeeff.',
      '..aabbbbbbbbbbbbggeeeff..',
      '...bbbbbbbbbbbgggeeefff..',
      '.....bebbggggggeeeefff...',
      '......eeeeeeeeeeeefff....',
      '.......eeeeeeeeeffff.....',
      '........ffffffffff.......',
      '.........f....f..........',
    ],
    [
      '......cccccccaaa.........',
      '.....cccccccaaaaa........',
      '...ccccaaaaaaaaaaaa......',
      '..ccccaaaaaaaaaaaaab.....',
      '..ccaaaaaddaaaaaaabb.....',
      '.cccaaaaddddcaaaabbbb....',
      'cccaaaaaaddcaaaabbbbee...',
      'ccaaaaaaacccaaaabbbbbee..',
      'ccddcaaaaaaaaaaddcbbbeef.',
      'ccddcaaaaaaaaaaddcbbgeeff',
      'ccccaaaaaaaaaaaccbbbgeef.',
      'ccaaaaaadddcaaaaabbbgeef.',
      'caaaaaaadddcaaaabbbbgeef.',
      'aaaaaaaadddcaaaabbbbgeef.',
      'aaaaaaaaddccaddcbbbggeeff',
      'aaaaaaaacccaaddcbbbgeeef.',
      '.aaaaabbabbaacccbbggeeff.',
      '..aaabbbbbbbbbbbbggeeeff.',
      '..aabbbbbbbbbbbbggeeeff..',
      '...bbbbbbbbbbbgggeeefff..',
      '.....bebbggggggeeeefff...',
      '......eeeeeeeeeeeefff....',
      '.......eeeeeeeeeffff.....',
      '........ffffffffff.......',
      '.........f....f..........',
    ],
    [
      '......cccccccaaa.........',
      '.....cccccccaaaaa........',
      '...ccccaaaaaaaaaaaa......',
      '..ccccaaaaaaaaaaaaab.....',
      '..ccaaaaaaaddaaaaabb.....',
      '.cccaaaaaaddddcaabbbb....',
      'cccddcaaaaaddcaabbbbee...',
      'ccaddcaaaaacccaabbbbbee..',
      'ccaccaaaaaaaaaaaabbbbeef.',
      'ccaaaaaaaaaaaaaaabbbgeeff',
      'ccaaaaadddcaaaaaddcbgeef.',
      'ccaaaaadddcaaaaaddcbgeef.',
      'caaaaaadddcaaaaaccbbgeef.',
      'aaaaaaaddccaaaaabbbbgeef.',
      'aaaaaaacccaaaaaabbbggeeff',
      'aaaaaaaaaabaddcbbbbgeeef.',
      '.aaaaabbabbaddcbbbggeeff.',
      '..aaabbbbbbbcccbbggeeeff.',
      '..aabbbbbbbbbbbbggeeeff..',
      '...bbbbbbbbbbbgggeeefff..',
      '.....bebbggggggeeeefff...',
      '......eeeeeeeeeeeefff....',
      '.......eeeeeeeeeffff.....',
      '........ffffffffff.......',
      '.........f....f..........',
    ],
]
export const meteorRoll: FxFamily = {
  palette: { ...Object.fromEntries(PALETTE.map((c, i) => [LETTERS[i]!, c])), h: 0x0e1019 },
  anchor: [sprite.foot[0] + 1, sprite.foot[1] + 1],
  frames: [sprite.rows, ...ROLL].map(rows => outlined(rows, 'h')),
}

// Landed, the first rock keeps cracking (`meteorCrack`, never re-forming):
// from the ground line where it is half buried in the post (it sits 7 px
// down, so the cracks start at its row 15) a crack runs up through it, a
// frame at a time, branching; then the cracks glow white-hot inside; then
// the main one splits it open two pixels wide, fire in the gap. Each frame
// is the rock as it sits (unturned) with all the cracks so far.
//   (x, y) on the rock's own 25 x 25 rows; d the crack, e its glow
const CRACKS: readonly (readonly (readonly [number, number, string])[])[] = [
  [[12, 15, 'd'], [12, 14, 'd'], [11, 13, 'd'], [11, 12, 'd'], [11, 11, 'd']],
  [[10, 10, 'd'], [10, 9, 'd'], [9, 8, 'd'], [12, 13, 'd'], [13, 12, 'd'], [14, 12, 'd'], [15, 11, 'd'], [16, 10, 'd']],
  [[9, 7, 'd'], [8, 6, 'd'], [8, 5, 'd'], [16, 9, 'd'], [17, 8, 'd'], [17, 7, 'd'], [12, 14, 'e'], [11, 12, 'e'], [10, 9, 'e']],
  [[7, 4, 'd'], [7, 3, 'd'], [8, 2, 'd'], [13, 14, 'd'], [13, 15, 'd'], [12, 15, 'f'], [12, 14, 'f'], [11, 13, 'e'], [11, 11, 'e'], [10, 10, 'e'], [9, 8, 'e'], [14, 12, 'e']],
]
// (each crack pixel with a lit lip on its right where the rock is, so the
// crack reads as a split in the stone, not another crater)
const cracked = (n: number): string[] => {
  const g = sprite.rows.map(r => [...r])
  const done = new Set<string>()
  for (const set of CRACKS.slice(0, n + 1)) for (const [x, y, ch] of set) if (g[y]?.[x] && g[y]![x] !== '.') { g[y]![x] = ch; done.add(`${x},${y}`) }
  for (const key of done) {
    const [x, y] = key.split(',').map(Number) as [number, number]
    if ('ab'.includes(g[y]?.[x + 1] ?? '.') && !done.has(`${x + 1},${y}`)) g[y]![x + 1] = 'c'
  }
  return g.map(r => r.join(''))
}
export const meteorCrack: FxFamily = {
  palette: { ...Object.fromEntries(PALETTE.map((c, i) => [LETTERS[i]!, c])), h: 0x0e1019 },
  anchor: [sprite.foot[0] + 1, sprite.foot[1] + 1],
  frames: [0, 1, 2, 3].map(n => outlined(cracked(n), 'h')),
}
