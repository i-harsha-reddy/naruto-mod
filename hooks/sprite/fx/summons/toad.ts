// Gamabunta, the toad boss: so big the stage holds only his head and
// shoulders, and not all of those (34 x 30). He faces us: two great eye bumps
// on top of the head, yellow eyes with black slit pupils, the scar gouged
// down over his left eye, a wide flat head mottled with warts, the long mouth
// turned up at the corners, his pipe out of its corner and up across his
// cheek, and the blue haori over his shoulders, its pale collar in a V under
// the jaw. Placed on the ground at the stage's left (anims/jiraiya.ts), the
// stage's top and left edges cut him off: the tops of his eyes, the far
// side of his face.
//
// And `toadFace`, the same bust as an effect of its own frames for the
// summoning's climax, when the stage shows his face whole: 0 as he sits, 1
// his eyes shut (a slow blink; the lids drawn down in his shade, a dark line
// where the eyes close), 2 his cheeks puffed round the pipe as he draws on it.
//
// And `toadTop`, the same toad seen close (no longer the hero shot: its two
// halved eyes read as two yellow shapes, not a toad): the crown of
// his head across the whole stage (48 x 17), an eye bump at either edge so
// big the stage's edges cut it in half: a dome of skin lit on its crest, a
// heavy lid's shadow over a round yellow eye, its fat oval slit pupil in the
// middle and its shade only in the eye's lower curve (rounded shapes, never
// layers of stripes), the scar down through his left eye; Jiraiya stood on
// the crown between them.
import { outlined } from '../../grid.ts'
import type { FxFamily } from '../../types.ts'
import type { PixelSprite } from '../summons.ts'

// a body, b shade, c light (lip, throat, the lit edges), d eye, e slit and
// mouth, f haori, g haori shade, h pipe, i its bowl, j scar, k collar, l the
// eye's shade, m warts
const PALETTE = [0xcc5a2c, 0x8a3424, 0xf0a868, 0xfadc4a, 0x1c1418, 0x3e60b8, 0x24387a, 0x3a2018, 0xc8ccd8, 0x5a1418, 0xa8c0f0, 0xd8a830, 0x9a3e22] as const

export const sprite: PixelSprite = {
  palette: PALETTE,
  // (the point on the ground when he sits at the stage's left edge)
  foot: [13, 25],
  rows: [
    '......ccc................jccc.....',
    '....cccccaa.............cjcccaa...',
    '...cccaaaaaa...........cccjaaaaa..',
    '...ccccddaab...ccccc...cccjddaab..',
    '..ccdddddddacccaaaaacccaddjddddbb.',
    '..ccdeeeeedaaaaaaaaaaaaadejeeedbb.',
    '..ccdddddddaaaaaacaaaaaadddjdddbb.',
    '..calllllllaaaaaaaaaaaaallljlllbb.',
    '..aaaalllaaaaaaaaaaaaaaaaaljlai.i.',
    '.amaaaaaaaaabbbbbbbbbbbaaaajaaiiib',
    '.aaaaaaaaaaaaaaaaaaaaaaaaaaajaiiim',
    'aaaaaaaaaaaaaamaaaaamaaaaaaaachhbb',
    'aaaamccaaacaaaaaaaaaaaaaamaachhabb',
    'aaaaaacaaaaaaaaaaaaaaaaaaaaahhaabb',
    'aeaaaaaaaaaaaaaaaaaaaaaaaaahhaaabe',
    '.beeeeeeeeeeeeeeeeeeeeeeeeeheeeeeb',
    '.bbbcccccccccccccccccccccccccccbbb',
    '..bbbbcccccccccccccccccccccccbbbb.',
    '...bbbbbbbbbmbbbbbbbbbmbbbbbbbbb..',
    '.....bbbbbbbbbbbbbbbbbbbbbbbbb....',
    '.......bbbbbbbbbbbbbbbbbbbbb......',
    '.........bbbbbbbbbbbbbbbbb........',
    '.....fffffkkbbbbbbbbbbbkkfgggg....',
    '...ffffffffkkbbbbbbbbbkkffgggggg..',
    '.fffffffffffkkbbbbbbbkkfffgggggggg',
    'fffffffffffffkkbbbbbkkffffgggggggg',
    'ffffffffffffffkkbbbkkfffffgggggggg',
    'fffffffffffffffkkbkkffffffgggggggg',
    'ffffffffffffffffkkkfffffffgggggggg',
    'ffffffffffffffffkkkfffffffgggggggg',
  ],
}

// (the bust's rows with the eyes shut: the yellow and the slits under his
// shade, the eye's lower shade a dark line; the cheeks puffed: the mouth's
// corners pushed out a pixel either side, lit)
const BLINK_ROWS = sprite.rows.map((r, y) => (y >= 3 && y <= 6 ? r.replace(/[de]/g, 'b') : y === 7 ? r.replace(/l/g, 'e') : r))
const PUFF_ROWS = sprite.rows.map((r, y) => (y === 13 || y === 14 ? r.replace(/^a/, 'c').replace(/b$/, 'c') : r))
const OUTLINE_LETTER = 'abcdefghijklmnopqrstuvwxyz'[PALETTE.length]!
export const toadFace: FxFamily = {
  palette: { ...Object.fromEntries(PALETTE.map((c, i) => ['abcdefghijklm'[i]!, c])), [OUTLINE_LETTER]: 0x0e1019 },
  anchor: [sprite.foot[0] + 1, sprite.foot[1] + 1],
  frames: [sprite.rows, BLINK_ROWS, PUFF_ROWS].map(rows => outlined(rows, OUTLINE_LETTER)),
}

// the crown, close: its foot the middle of the stage's bottom row (placed at
// [24, GROUND] it fills the stage's lower part edge to edge, the crown a
// pixel under the sage's feet)
const TOP_ROWS = [
  'aaaaaaaac..............................cajaaaaaa',
  'aaaaaaaaacc..........................ccaajaaaaaa',
  'abbbbbaaaacc........................ccaaajbbbbba',
  'bdddddbbaaac........................caaabjdddddb',
  'ddddddddbaaac......................caaabdjdddddd',
  'dddddddddbaac......................caabddjdddddd',
  'dddddddddbbaac....................caabbdddjddddd',
  'ddeeedddddaaab....................baaaddddjeeedd',
  'eeeeeeedddaaab....................baaadddejeeeee',
  'eeeeeeeddlaaab....................baaalddejeeeee',
  'ddeeeddddlaaab....................baaaldddjeeedd',
  'ddddddddlaaab......................baaaldddjdddd',
  'dddddddllaaabccccccccccccccccccccccbaaallddjdddd',
  'llllllllaaabaaaaaaaaaaaaaaaaaaaaaaaabaaallljllll',
  'alllllaaaabbaaaaaaaaaaaaaaaaaaaaaaaabbaaaallllla',
  'aaaaaaaaaaaaaaaaamaaaaaaaaaaaamaaaaaaaaaaaaaaaaa',
  'aaaaaaaaaaamaaaaaaaaaaaamaaaaaaaaaaaamaaaaaaaaaa',
]
export const toadTop: FxFamily = {
  palette: { ...Object.fromEntries(PALETTE.map((c, i) => ['abcdefghijklm'[i]!, c])), o: 0x0e1019 },
  anchor: [25, 17],
  frames: [outlined(TOP_ROWS)],
}
