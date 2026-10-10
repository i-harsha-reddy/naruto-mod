// Every effect family by name, as cels name them: { fx: 'chidori', ... }.
// To add one, draw it in a file here (see types.ts's FxFamily) and list it
// below. The summoned animals (fx/summons/) are effects too, by their
// summon id: 'pakkun', 'bull', 'ninken', 'toad'...
//
// WHERE THEY GO. Each family's comment gives its size, its anchor (the pixel
// of its grid laid on the place asked for) and where it was drawn to be
// placed: 'hand', 'feet', 'head' or 'post' (the post's struck face), or one
// of the stage points in AT below (the post's foot, its middle, its crown).
// Two are drawn the size of the whole stage, anchored at its top-left:
// tsukuyomiWipe and shinra, placed at AT.stage ([0, 0]), behind (back: true).

import { aura, auraLow } from './aura.ts'
import { clayBird, claySpider, katsu } from './clay.ts'
import { dust, earth } from './dust.ts'
import { burnPost, embers, fireStream, fireball, greatFireball, greatFireballForm, phoenix, scorch } from './fire.ts'
import { lionFist, palmFlash, rotation, vacuum } from './gentle.ts'
import { trigram } from './gentle.ts'
import { mandaRear } from './summons/manda.ts'
import { impact } from './impact.ts'
import { vortex } from './kamui.ts'
import { chidori, chidoriBuild, sparks, streak } from './lightning.ts'
import { gloom, zzz } from './marks.ts'
import { dragonAura, ftgFlash, ftgKunai, gateSteam, leafWhirl, sageAura, snake, woodSpikes } from './misc.ts'
import { bandageWrap } from './misc.ts'
import { bansho, chakraRod, chibaku, shinra } from './pain.ts'
import { kunai } from './props.ts'
import { dustWave, quake, rubble, shockRing } from './quake.ts'
import { fissure, heelArc } from './quake.ts'
import { quakeFade } from './quake.ts'
import { TOP_FX } from './quake.ts'
import { mini as katsuyuMini } from './summons/slug.ts'
import { giant as katsuyuGiant } from './summons/slug.ts'
import { toadTop } from './summons/toad.ts'
import { meteorBig } from './summons/meteor.ts'
import { meteorRoll } from './summons/meteor.ts'
import { grains, sandCoffin, sandShuriken, sandSpear, sandWall } from './sand.ts'
import { sealLine, sealRing } from './seal.ts'
import { shadowHands, shadowLine, shadowStitch } from './shadow.ts'
import { sigh, smoke, wisp } from './smoke.ts'
import { SUMMON_FX } from './summons.ts'
import { amaterasu, boundPost, feathers, kamui, redMoon, tsukuyomiWipe } from './uchiha.ts'
import { foam, sharkWake, splash, waterBullet, waterPrison, waterPrisonForm, waterStream } from './water.ts'
import { giantRasengan, rasengan, rasenganHit, rasenshuriken, rasenshurikenDome, windBlade } from './wind.ts'
import { heatFlash } from './fire.ts'
import { chidoriBirds } from './chidori2.ts'
import { palmFan } from './wind.ts'
import { miniShark } from './sharks.ts'
import { katsuyu, katsuyuBits } from './katsuyu.ts'
import { leafFall, peacock } from './peacock.ts'
import { JUMPSUIT_FX } from './peacock.ts'
import { HAORI_FX } from './firewall.ts'
import { VEST_FX } from './flash.ts'
import { breakup } from './smoke.ts'
import { sweat } from './marks.ts'
import { GROUND, POST_HIT, POST_X } from '../stage.ts'
import type { FxFamily, XY } from '../types.ts'
import { gravityWell } from './pain.ts'
import { bijuudama, bijuuBlast, airBurst, clayPop } from './akatsuki.ts'
import { ROBE_FX } from './serpent.ts'
import { gravityFade } from './pain.ts'
import { shinraFront } from './pain.ts'
import { LION_FX } from './lions.ts'
import { acidJet, acidPool, healGlow, healOrb, healSparkle } from './katsuyu.ts'
import { kamuiWring } from './kamui.ts'
import { groundBurst } from './akatsuki.ts'
import { SASUKE_FX } from './chidori2.ts'

export { FX_PALETTES } from './palettes.ts'

// The stage points the effects were drawn to land on, besides the cel's named
// anchors ('hand', 'feet', 'head', 'post', 'home').
export const AT = {
  // the stage's top-left: the full-stage effects (tsukuyomiWipe, shinra)
  stage: [0, 0] as XY,
  // the post's own anchor (post.ts), its foot on the ground: the overlays
  // drawn pixel for pixel over the post's wood (burnPost, scorch, embers,
  // sandCoffin)
  postFoot: [POST_X, GROUND] as XY,
  // the middle of the post's foot, a column right of its anchor: what was
  // drawn standing on the ground round the post (waterPrison, foam,
  // shadowHands, shadowStitch, amaterasu, boundPost, woodSpikes, katsu); at
  // AT.postFoot instead they land a pixel left
  postBase: [POST_X + 1, GROUND] as XY,
  // the post's middle, at the height of the rope (kamui, feathers, ftgFlash, leafWhirl)
  postMid: [POST_X + 1, 18] as XY,
  // its crown (grains falling off it)
  postTop: [POST_X + 1, 13] as XY,
  // its struck face, the same as 'post'
  postHit: POST_HIT,
} as const

export const FX: Readonly<Record<string, FxFamily>> = {
  ...SUMMON_FX,
  // Kakashi's
  chidori,
  chidoriBuild,
  streak,
  sparks,
  aura,
  auraLow,
  impact,
  smoke,
  sigh,
  wisp,
  dust,
  earth,
  kunai,
  zzz,
  gloom,
  vortex,
  sealRing,
  sealLine,
  // fire
  fireball,
  greatFireballForm,
  greatFireball,
  fireStream,
  phoenix,
  burnPost,
  scorch,
  embers,
  // water
  waterBullet,
  splash,
  waterStream,
  waterPrisonForm,
  waterPrison,
  foam,
  sharkWake,
  // wind and the Rasengan
  rasengan,
  giantRasengan,
  rasenganHit,
  rasenshuriken,
  rasenshurikenDome,
  windBlade,
  // sand
  sandCoffin,
  sandWall,
  sandSpear,
  sandShuriken,
  grains,
  // earth and impact
  quake,
  rubble,
  shockRing,
  dustWave,
  // the Gentle Fist
  palmFlash,
  lionFist,
  rotation,
  vacuum,
  // shadow
  shadowLine,
  shadowHands,
  shadowStitch,
  // clay
  clayBird,
  claySpider,
  katsu,
  // the Uchiha
  kamui,
  amaterasu,
  tsukuyomiWipe,
  redMoon,
  boundPost,
  feathers,
  // Pain
  shinra,
  bansho,
  chibaku,
  chakraRod,
  // the rest of the signatures
  ftgFlash,
  ftgKunai,
  woodSpikes,
  snake,
  sageAura,
  leafWhirl,
  dragonAura,
  gateSteam,
  // Lee's Primary Lotus: the bandages lashed round the post
  bandageWrap,
  // Sakura and Tsunade: the floor split along a line, the heel's arc, the little Katsuyu on a shoulder
  fissure,
  heelArc,
  katsuyuMini,
  // Neji's Sixty-Four Palms: the Eight Trigrams' field on the floor
  trigram,
  // Orochimaru's Manda rearing over the arena, his head moving
  mandaRear,
  // Jiraiya's Gamabunta, close: the crown of his head across the stage, the sage stood on it
  toadTop,
  // the jacket team's: the Great Fireball's heat on the post, Sasuke's
  // thousand birds, Hinata's wall of palms
  heatFlash,
  chidoriBirds,
  palmFan,
  // Madara's second meteor, bigger than the first
  meteorBig,
  // Kisame's little water-sharks (the Five Feeding Sharks)
  miniShark,
  // Guy's Morning Peacock: the fan of flaming fist-comets on the post; the
  // leaves a Leaf whirlwind leaves when it breaks (Guy, Lee)
  peacock,
  leafFall,
  // the haori team's (Madara's fire wall, his Susanoo's ribs, Jiraiya's grinding Rasengan)
  ...HAORI_FX,
  // the vest team's (the Raikiri's flare, Shikamaru's shadow wisps, Minato's Yellow Flash)
  ...VEST_FX,
  // the shared fizzle's: the charge breaking apart (in the ninja's chakra), the sweat drop by the head
  breakup,
  sweat,
  gravityWell,
  // Sakura's Katsuyu: the great slug's bust, and the little slugs she divides into
  katsuyu,
  katsuyuBits,
  bijuudama,
  bijuuBlast,
  airBurst,
  clayPop,
  // the crater crumbling away after quake's hold (frame for frame over it)
  quakeFade,
  // the robe team's (Orochimaru's shadow snakes and his tongue, the sand climbing round Gaara)
  ...ROBE_FX,
  // Tsunade's giant Katsuyu, mouth shut and spitting
  katsuyuGiant,
  gravityFade,
  // the jacket team's Twin Lion Fists: Hinata's two solid lion heads
  ...LION_FX,
  // the jumpsuit team's (the air torn behind Guy's and Lee's flying kicks)
  ...JUMPSUIT_FX,
  // the top team's: Sakura's heal settling over the post, Katsuyu's solid acid
  healGlow, healSparkle, healOrb, acidJet, acidPool,
  kamuiWring,
  groundBurst,
  // the haori team's: Madara's first meteor rolling as it grinds into its crater
  meteorRoll,  // the jacket team's: Sasuke's Kusanagi cut, a straight slash of light
  ...SASUKE_FX,
  // the top team's: Cherry Blossom Impact's arena-wide crater and its dome of force
  ...TOP_FX,
  // the Akatsuki's: Shinra Tensei's ring, its near half drawn in front of Pain
  shinraFront,
}
