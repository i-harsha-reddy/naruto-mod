// Madara's Susanoo, its first form, blue: a skeleton built round him, not
// beside him, centred on his root (his home, [33, GROUND]).
//
// THE SKULL is behind him, centred over his head and behind his hair, whole
// from its crown down: a cranium dome over the brow (the stage's top row its
// outline, lit on its upper left); under the brow ridge two slanted, angry
// sockets (the brow coming down at the nose), a light in each; the nasal
// notch between and below them; a lit cheekbone row under it all, which his
// hair's spikes poke up into (he sinks his head into his shoulders in the
// stance, anims/madara.ts, so the whole upper face clears his hair); its
// cheeks and the jaw and teeth behind his head.
// THE RIBS are curved bone arcs round him: two pairs, each from its top at
// the cage's side (by the skull's cheek, and lower, by his shoulder) down
// and round in front of him, the outer pair meeting under his chin at the
// sternum, a joint in the bottom rib; their far halves arc back in over his
// shoulders toward the spine, behind the skull and his hair. So the near
// halves (susanooRibs) are drawn in front of him, over his mane, his arms and
// his hem, never over his face, and the far halves and the skull
// (susanooCage) behind him.
// It grows in: ribs frame 0 the bottom rib and the sternum, 1 up his sides,
// 2 the whole of the near ribs; cage frame 2 their far halves, 3 the whole
// with the skull, 4 and 5 the skull rising behind him (two pixels low, then
// one) to it. Chakra-blue in a lit, a mid and a shaded tone (c a b), so it
// reads as light more than bone, the skull outlined in its own deep blue.
// Each frame is stage-sized, cut to what it draws: its anchor is his feet.
//
// `sprite` is the whole of it in one (the summons' registry draws every
// summoned thing from one sprite).
import type { FxFamily, FxFrame, Palette } from '../../types.ts'
import type { PixelSprite } from '../summons.ts'

// a chakra, b shade, c glow, d socket, e the light in a socket; o its outline
const PALETTE: Palette = { a: 0x5a8af0, b: 0x2c56c4, c: 0xc4dcff, d: 0x0c1a4a, e: 0xf4f8ff, o: 0x0c1a4a }

// behind him: the far halves of the ribs and the skull
export const susanooCage: FxFamily = {
  palette: PALETTE,
  anchor: [33, 23],
  frames: [
    { anchor: [0, 0], rows: ['.'] },
    { anchor: [0, 0], rows: ['.'] },
    {
      anchor: [20, 19],
      rows: [
        '..ccccc...........................c',
        'ccabbbb...........................b',
        '...................................',
        '....cccc.........................cc',
        '...ccbbb.........................bb',
      ],
    },
    {
      anchor: [20, 23],
      rows: [
        '...............ooooooooooo.........',
        '............oooccccccaaaabooo......',
        '..........ooacddccaaaaaccddaboo....',
        '.........oacaaddedaaaaadeddaabbo...',
        '..ccccc.oacaaaaaddaadaaddaaaabbbo.c',
        'ccabbbb.oaccccccccadddaccccccabbo.b',
        '.......oaaaaaaaaaaabdbaaaaaaaabbbo.',
        '....cccoaaaaaaaaaaaaaaaaaaaaaabbboc',
        '...ccbbbocbcbcbcbcbcbcbcbcbcbcbcobb',
        '........oabababababababababababao..',
        '.........obbbbbbbbbbbbbbbbbbbbbo...',
        '..........ooooooooooooooooooooo....',
      ],
    },
    {
      anchor: [20, 21],
      rows: [
        '...............ooooooooooo.........',
        '............oooccccccaaaabooo......',
        '..ccccc...ooacddccaaaaaccddaboo...c',
        'ccabbbb..oacaaddedaaaaadeddaabbo..b',
        '........oacaaaaaddaadaaddaaaabbbo..',
        '....ccccoaccccccccadddaccccccabbocc',
        '...ccbboaaaaaaaaaaabdbaaaaaaaabbbob',
        '.......oaaaaaaaaaaaaaaaaaaaaaabbbo.',
        '........ocbcbcbcbcbcbcbcbcbcbcbco..',
        '........oabababababababababababao..',
        '.........obbbbbbbbbbbbbbbbbbbbbo...',
        '..........ooooooooooooooooooooo....',
      ],
    },
    {
      anchor: [20, 22],
      rows: [
        '...............ooooooooooo.........',
        '............oooccccccaaaabooo......',
        '..........ooacddccaaaaaccddaboo....',
        '..ccccc..oacaaddedaaaaadeddaabbo..c',
        'ccabbbb.oacaaaaaddaadaaddaaaabbbo.b',
        '........oaccccccccadddaccccccabbo..',
        '....cccoaaaaaaaaaaabdbaaaaaaaabbboc',
        '...ccbboaaaaaaaaaaaaaaaaaaaaaabbbob',
        '........ocbcbcbcbcbcbcbcbcbcbcbco..',
        '........oabababababababababababao..',
        '.........obbbbbbbbbbbbbbbbbbbbbo...',
        '..........ooooooooooooooooooooo....',
      ],
    },
  ],
}

// in front of him: the near halves of the ribs and the sternum (chakra light: no outline)
export const susanooRibs: FxFamily = {
  palette: PALETTE,
  anchor: [33, 23],
  frames: [
    {
      anchor: [15, 4],
      rows: [
        'ccab.......................bac',
        '.cccab...................baccc',
        '...ccab.................bacc..',
        '.....ccab.....cac.....bacc....',
        '.......cccccccbabccccccc......',
      ],
    },
    {
      anchor: [20, 11],
      rows: [
        'cabca..............................',
        'cabca..............................',
        '.cabca.............................',
        '.cabca.............................',
        '..cabca...........................a',
        '...cabcc.........................cc',
        '....cabb.........................bb',
        '.....ccab.......................bac',
        '......cccab...................baccc',
        '........ccab.................bacc..',
        '..........ccab.....cac.....bacc....',
        '............cccccccbabccccccc......',
      ],
    },
    {
      anchor: [21, 17],
      rows: [
        'cc..................................',
        'cab.................................',
        'cab.................................',
        'cab.c...............................',
        'cabca...............................',
        'cabca...............................',
        '.cabca..............................',
        '.cabca..............................',
        '..cabca.............................',
        '..cabca.............................',
        '...cabca...........................a',
        '....cabcc.........................cc',
        '.....cabb.........................bb',
        '......ccab.......................bac',
        '.......cccab...................baccc',
        '.........ccab.................bacc..',
        '...........ccab.....cac.....bacc....',
        '.............cccccccbabccccccc......',
      ],
    },
  ],
}

// the whole of it in one, for the summons' registry: the ribs over the cage
// (each frame laid on the stage at its anchor, his feet at [33, 23])
const onStage = (f: FxFrame, fam: FxFamily, x: number, y: number): string => {
  const [ax, ay] = Array.isArray(f) ? fam.anchor : (f as { anchor: readonly [number, number] }).anchor
  const rows = (Array.isArray(f) ? f : (f as { rows: readonly string[] }).rows) as readonly string[]
  return rows[y - 23 + ay]?.[x - 33 + ax] ?? '.'
}
const whole = (): string[] => {
  const back = susanooCage.frames[3]!
  const front = susanooRibs.frames[2]!
  const out: string[] = []
  for (let y = 0; y < 24; y++) {
    let row = ''
    for (let x = 0; x < 48; x++) {
      const f = onStage(front, susanooRibs, x, y)
      const b = onStage(back, susanooCage, x, y)
      row += f !== '.' ? f : b !== '.' && b !== 'o' ? b : '.'
    }
    out.push(row)
  }
  return out
}
export const sprite: PixelSprite = {
  palette: [PALETTE['a']!, PALETTE['b']!, PALETTE['c']!, PALETTE['d']!],
  foot: [33, 23],
  rows: whole(),
}
