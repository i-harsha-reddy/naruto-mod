// The effects' palettes, by name: an effect family names its own (fx/*.ts),
// and a cel can swap it for another (the impact star in 'hit' gold is a
// kunai's, in 'warp' violet Kamui's snap). Each uses the same few letters, so
// families can share them: w white-hot core, c pale, b mid, d deep, n the
// darkest rim, plus a family's own.

import { pal } from '../grid.ts'
import type { Palette } from '../types.ts'

export const FX_PALETTES: Readonly<Record<string, Palette>> = {
  // lightning: white core, pale cyan, light blue, blue, deep blue rim
  volt: pal(`w:#ffffff c:#c8f4ff b:#6cc6ff d:#2f7bf0 n:#1d3ea6`),
  // chakra aura: the same family, softer and cooler
  aura: pal(`w:#f2fbff c:#d4f2ff b:#86cdf6 d:#3f86da n:#24489e`),
  // smoke: a ninja's poof
  smoke: pal(`w:#ffffff c:#e6e8f0 b:#c0c4d2 d:#8e93a8 n:#5d6278`),
  // dust kicked up off the ground, and earth broken by a summoning
  dust: pal(`w:#efe4cc c:#d8ccb4 b:#b0a088 d:#857664 n:#5c5148`),
  // a plain hit (kunai): warm white and gold
  hit: pal(`w:#ffffff c:#fff4c0 b:#ffd658 d:#f0a020 n:#b05a10`),
  // the kunai
  kunai: pal(`w:#f4f6fa c:#c4cad8 d:#6a7088 o:#0e1019 r:#c83a34`),
  // the sleep z, a sigh's puff
  ink: pal(`w:#e8ecf8 c:#b8c2e0 d:#7480b0`),
  gloom: pal(`d:#3c3a6a n:#2a2850`),
  // Kamui: the void at the eye, deep violet, the pale light wound round it
  warp: pal(`v:#0c0814 n:#2a1f4a d:#5a4a86 b:#b8acd8 c:#d8d0f0 w:#f4f0ff`),
  // a summoning seal: chakra white and cyan, its script in ink
  seal: pal(`w:#ffffff c:#c8f4ff b:#6cc6ff d:#2f7bf0 k:#1a1a2a`),
  // ---------------------------------------------------- the elements (fire.ts, water.ts, wind.ts, sand.ts, quake.ts)
  // fire: white-hot heart, yellow, orange, red, a dark red rim
  fire: pal(`w:#fffbe0 c:#ffdf4a b:#ff9426 d:#e2441c n:#8e1e18`),
  // char on burnt wood: glowing gold and orange cooling to soot
  char: pal(`w:#ffcf5a c:#ff7a28 b:#a83218 d:#3c2a22 n:#191210`),
  // foam white, pale aqua, teal, blue, deep blue rim
  water: pal(`w:#f4fdff c:#a6ecf6 b:#3fb8e2 d:#2170c8 n:#17368c`),
  // Katsuyu's acid: mint green, for the water families' frames
  acid: pal(`w:#f4fff8 c:#d8ffe8 b:#6aeea4 d:#14a060 n:#0a5a36`),
  // the Rasengan: white core, ice blue, azure, blue rim, deep blue shadow rim
  rasen: pal(`w:#ffffff c:#bdf3ff b:#59c9f5 d:#2d86e0 n:#2347a8`),
  // wind chakra: paler and greyer, so blades read as air, not water
  wind: pal(`w:#ffffff c:#e4f8ff b:#a6def2 d:#5ea6d6 n:#36679a`),
  // pale lip, light tan, tan, dark tan, the dark grain and rim
  sand: pal(`w:#fff2c8 c:#f2d38c b:#d4a95c d:#a2773a n:#5e4222`),
  // rock and dirt: pale edge, stone, shadowed stone, dark face, crack
  earth: pal(`w:#efe6d6 c:#c4b29a b:#927d66 d:#5f4f42 n:#2e2622`),
  // a force wave (Shinra Tensei): white into lilac
  shock: pal(`w:#ffffff c:#ece8ff b:#b9b2f2 d:#7f77cc n:#4b4594`),
  // Sakura's chakra, for the same ring on a Cherry Blossom Impact
  blossom: pal(`w:#fff4f8 c:#ffc8de b:#f08cb8 d:#c45088 n:#7c2a56`),

  // ---------------------------------------------------- the signature jutsu (gentle.ts, shadow.ts, clay.ts, uchiha.ts, pain.ts, misc.ts)
  // Neji's Gentle Fist: white to blue
  gentle: pal(`w:#ffffff c:#cfe6ff b:#86b4ff d:#4a74e6 n:#283a9a`),
  // Hinata's chakra: lavender going to deep blue-violet
  lion: pal(`w:#ffffff c:#eee4ff b:#bba2ff d:#8460e0 n:#45309c`),
  // the Vacuum Palm's compressed air: nearly white, cool grey-blue edges
  air: pal(`w:#ffffff c:#e2f0ff b:#a8c8ec d:#7092c4 n:#41598c`),
  // n the shadow's body, d its lit body, b the violet rim, c the glint
  shadow: pal(`n:#0b0910 d:#2c2244 b:#7450cc c:#c2a6ff`),
  // white clay: lit, clay, shade, edge
  clay: pal(`w:#fbf8ef c:#dcd5c4 b:#a39a86 n:#3e372f`),
  // the bang: white heart, gold, orange, red rim; k the soot
  blast: pal(`w:#ffffff y:#ffe066 o:#ff8a24 r:#c8341c k:#6b5a63`),
  // Kamui: the space-time swirl, pale violet at the heart to deep indigo
  kamui: pal(`w:#f4eeff c:#c6b2f0 b:#8a6cc8 d:#4c3690 n:#140c26`),
  // Amaterasu: black fire, a dark-red lick inside it, a red rim, hot tips
  amaterasu: pal(`n:#050307 d:#3a0e16 r:#c41c26 e:#ff6a3c`),
  // the Tsukuyomi world: crimson sky, its dark bands, black ground and
  // silhouettes, red rims and moon, the moon's pale light
  tsuku: pal(`m:#72101a k:#2c060c n:#0a0306 r:#e82230 p:#ff9a86`),
  // crow feathers: the black vane, its dark-blue rim, the blue sheen on the quill
  crow: pal(`n:#09080d d:#2b3f8f c:#7d93e0`),
  // the push and pull: white heart, lilac, deep violet, the fading rim
  push: pal(`w:#ffffff c:#e6dcff b:#b29cf2 d:#7660cc n:#3c3078`),
  // the black sphere and its rocks: core, its violet shade and rim light,
  // rock lit and rock dark
  chibaku: pal(`n:#0a0810 d:#3a2f5e b:#9c88e6 r:#a8927a k:#665642`),
  // the chakra rod: black iron, its edge, the light along it, a glint
  rod: pal(`n:#0e0e14 d:#454558 c:#a6a6c0 w:#f2f2ff`),
  // the Flying Thunder God's flash: white, lemon, gold, amber, a burnt rim
  ftg: pal(`w:#ffffff y:#fff27a g:#ffc81e o:#e8901a n:#8a4a08`),
  // the three-pronged kunai: steel lit and mid, the grip, the tag's paper and ink
  kunai3: pal(`w:#f4f6fa c:#aab2c4 d:#5e6680 t:#f2e2aa r:#c8322c`),
  // wood: lit grain, heartwood, bark shadow, the dark split between stakes
  wood: pal(`l:#ecc48a m:#b47c46 d:#704626 n:#2e1b0c`),
  // the shadow snakes: violet with a pale belly and rim, red eye and tongue
  snake: pal(`c:#e2d4f6 b:#9c7ad6 d:#5e409a n:#26163f r:#ff4c5a`),
  // sage chakra: gold heart, orange, a red-orange rim
  sage: pal(`y:#ffd45a o:#ff9a2a r:#cc5418`),
  // the Leaf Hurricane: wind white, leaf lit, leaf, leaf shade, vein
  leaf: pal(`w:#eefff0 l:#c4f07a g:#62bc44 d:#2c7e30 n:#123e1c`),
  // Night Guy: blood-red chakra from a pale-hot heart to a dark rim
  night: pal(`e:#ffb09a r:#ff3a2c d:#b8141e n:#5c0812`),
  // the Gates' steam
  steam: pal(`w:#ffffff c:#e4e0ec b:#b4accb d:#7a7290`),
  // the Eighth Gate's steam, blood-red (gateSteam's letters)
  steamRed: pal(`w:#ffe4dc c:#ffa08e b:#e8463a d:#9a1c1c`),
  // Lee's chakra: leaf green, in the letters the force rings, stars and steam use
  leafChakra: pal(`w:#f4fff0 c:#c8f5a8 b:#78d860 d:#34a040 n:#1a5a24`),
  // Sakura's and Tsunade's blows, the impact star tinted through (its heart
  // no plain white): pink chakra, violet chakra, a stone-and-dust hit, a
  // flick's air
  blossomHit: pal(`w:#ffe2ef c:#ffa8cc b:#f0609e d:#c43a7c n:#7c2a56`),
  lionHit: pal(`w:#efe6ff c:#c9adff b:#9a74f4 d:#6a46d0 n:#3a248c`),
  earthHit: pal(`w:#fff0cc c:#f2d49a b:#c49a62 d:#8a6a44 n:#4a3626`),
  airHit: pal(`w:#eaf8ff c:#c4e6ff b:#8ec4ee d:#5a90cc n:#36609a`),
  // medical chakra: the healing green (Sakura's Katsuyu), its glow and sparkle
  heal: pal(`w:#f0fff4 c:#b8ffd0 b:#5ee89a d:#20b060 n:#0c6a3a`),
  // Madara's Susanoo: its blue chakra (the aura, the blade's impact and ring)
  susanooBlue: pal(`w:#f2f8ff c:#c4dcff b:#7aa6ff d:#2c56c4 n:#0c1a4a`),
  // Hinata's Twin Lion Fists (lions.ts): n the near-black violet outline, c
  // the pale face and fangs, b the mane, d its darker edge (the mane a ring
  // darker than the face); and the second lion's, a step dimmer
  lions: pal(`n:#1e1240 c:#f1ecff b:#9478ea d:#5c40b8`),
  lionsDim: pal(`n:#1e1240 c:#c4b2f8 b:#6e56c8 d:#46329a`),
  // 'chakra' is never drawn as written: an effect given pal 'chakra' is
  // turned to the ninja's own chakra colour by brightness (compose.ts's
  // chakraTable), or keeps its own palette without one. This entry only names
  // every letter (a neutral ramp), so a check of a palette's letters passes.
  chakra: Object.fromEntries([...'abcdefghijklmnopqrstuvwxyz'].map((l, i) => [l, 0x101010 * (1 + (i % 15))])),
}
