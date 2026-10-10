// The native sprite format: every pixel of a ninja, an effect and the arena
// placed by hand, in letter grids, and stamped as drawn (never scaled,
// rotated, blurred or resampled). compose.ts draws every frame from these.
//
// GRIDS. A grid is an array of strings, one per pixel row, all read from the
// top-left. '.' (or ' ') is clear. Every other character is a letter naming a
// colour in the grid's palette. In a body grid an UPPERCASE letter is the same
// colour as its lowercase one, drawn OVER the head (a hand in front of the
// face, the book held up to it); lowercase is drawn under the head.
//
// PALETTES. A palette maps letters to colours: `pal('a:#f48a24 b:#a84e12')`
// (grid.ts), or `x:-` for a letter that is drawn clear for this ninja (a prop
// the outfit has that they do not carry).
//
// THE PIECES.
//   Template   an outfit's body, drawn once in SEMANTIC letters (vest: o
//              outline, s k skin, v w x vest lit/mid/shadow...), one PoseGrid
//              per pose. Many ninja share one (the jonin vest: Kakashi,
//              Shikamaru, Guy, Minato) with their own palettes.
//   NinjaSprite a ninja: a template, their colours for its letters, their
//              hand-drawn head and eyes (every mood, blink and glance as eye
//              states), a dojutsu variant, poses and props of their own, and
//              their moves as cels.
//   FxFamily   an effect: hand-drawn frames (lightning, smoke, an impact
//              star), each with an anchor, in a palette that can be swapped
//              per use (the same impact star in gold is a kunai's).
//   Cel        one held drawing of a move: the ninja's pose and place, their
//              clones, the post's frame, the effects, held `n` frames at 10 fps.
//   CelMove    a move as the companion plays it: the mod's own Move (name,
//              shout, `on`, dojutsu, beats) carrying its cels. The beats are
//              derived from the cels' tags (cels.ts), so the companion's
//              timing, shouts, hits and fizzles work unchanged.
//
// THE STAGE is 48 x 24 pixels (48 terminal columns x 12 rows, two pixels a
// cell): the arena and its post on the left, the ninja standing at HOME on the
// right, the feet on GROUND, the bottom row (stage.ts).
//
// ------------------------------------------------------------------------
// WHAT A NINJA CAN CARRY (NinjaSprite), beyond a template, colours and a head:
//
//   poses     poses of their own, by name (a template pose's name or a
//             companion pose's):
//               'cheer'                          another pose's drawing (Kakashi's
//                                                scratch is the vest's cheer)
//               { base: 'thumbs', eyes: 'grin' } another pose with its own eyes,
//                                                head offset, hand or points
//               { rows, head, ... }              a drawing of their own (Gaara's sleep)
//   overlays  per-pose edits to their copy of the template, baked once, in
//             the body's letters: { pose: [{ rows, at?, on?, under? }] }, or
//             '*' for every pose. '.' keeps the template's pixel, '_' (or '-')
//             clears it, a letter paints it (UPPERCASE over the head).
//             `at` is the overlay's top-left in the pose grid (a negative row
//             grows the grid upward; left out, its last row sits on the feet
//             at column 0); on: 'head' measures `at` from the head's top-left
//             where the pose seats it. `under` paints only where the grid is
//             clear (a prop behind the body). Minato's haori, Sakura's skirt,
//             the Akatsuki collars.
//   rules     per-pose passes over the grid's rows, run before the overlays
//             (Guy's leg warmers recoloured wherever shins show)
//   props     things worn that ride with the head, the body or a named point,
//             drawn at run time, in the body's letters or a palette of their
//             own: [{ rows, on, at, palette?, behind?, onto?, only?, skip?,
//             poses? }]. on: 'head' (the head's top-left as drawn, nods and
//             all), 'grid' (the pose grid's top-left), 'feet' (the root on
//             the feet row), 'hand' (the pose's held hand: a sword in the
//             fist) or a point the pose names ('back', 'waist': see
//             PoseGrid.points); `at` is the prop's top-left from there.
//             behind: under the body and head (a slung gourd, gunbai, scroll,
//             Samehada, a mane down the back); else with the body, lowercase
//             under the head and UPPERCASE over it (Naruto's nightcap).
//             onto: only over the body's pixels of these letters (a strap
//             across the coat). only / skip: by pose name; poses: { pose:
//             changes, or null to hide it there }.
//   poseEyes  their own face for a pose: { thumbs: 'grin' } (a cel's own eyes win)
//   heads     variant heads by name, for a cel to ask for ({ k: { head:
//             'seal2' } }): Tsunade's seal spreading in stages
//   home      the column they stand at, at rest (stage.ts's HOME, 35, unless
//             given): the rest pose, the shared arrival, fizzle and dispel,
//             the 'home' anchor, the peek and the badges follow it
//   eyes      hand-drawn eyes: grids over BOTH eyes (stamped at the left
//             eye's top-left + at), or, with `mirror`, one eye's grid that
//             the right eye mirrors. Any state names: the faces' eight (see
//             EyeState) plus their own ('grin', 'wink', 'rinnegan') for cels
//             and poseEyes to ask for; a face falls back to 'open' (wide to
//             open, smug to half) where a state is not drawn. `moods` gives
//             a state of their own the mood the companion reports for it (a
//             cel's 'grin' is 'happy'); pass the eyes to celMove for that.
//   dojutsu   what changes while the dojutsu is awake (the face's `active`,
//             a cel's `awake`): its head (Kakashi's headband up, Naruto's
//             toad pigment, Hinata's veins) and an eye grid stamped at the
//             viewer's RIGHT eye + at over the ordinary eyes (a both-eye grid
//             reaches the left eye with at [-5, 0]); `states` gives a state
//             its own grid, or null for none at rest (a blink).
//
// WHAT A CEL CAN DRAW, beyond the ninja, the post and effects:
//   clones    copies of the ninja, full size, same template, colours, face:
//             [{ x, pose, flip?, lift?, dy?, eyes?, awake?, puff?,
//             ghost?, front? }]. Behind the ninja when at or right of them,
//             in front when ahead (toward the post), unless `front` says;
//             among themselves the one further left is drawn over, unless
//             `z` orders them: the ninja is z 0, a clone below 0 is drawn
//             behind them, 0 and over in front, a higher z over a lower
//             (a clone standing on the ground over the leaping ones). flip faces
//             right; puff: a smoke frame over it (appearing, vanishing);
//             ghost: an afterimage traced in a colour, or 'chakra' (the
//             ninja's glow): its outline in the tone, a line a pixel inside
//             it and its inner lines in a deeper tint of the tone, a sparse
//             dot of the tint within, the stage showing through (a trace,
//             never a screen-door block). Shadow Clones, Itachi's crow
//             clone, Minato's afterimages.
//   fx        an effect drawn 48 x 24 anchored at [0, 0] covers the stage
//             (a Tsukuyomi sky behind, a Shinra Tensei ring in front)
//   tint      the whole stage, but the effects in front, washed toward a
//             colour ({ colour, amount }) or remapped by brightness between
//             two ({ dark, light }): the Tsukuyomi world turned red and black
//   shake     the whole stage jolted by whole pixels, like a camera's
//             shake: dx, or [dx, dy] (the post and its shadow too, unless
//             the cel sets `postStill`: the old jolt of all but the post)
//   shout     the beat it starts shouts: true for the jutsu's name, or a
//             string of its own ("Second meteor")
//   post      'cut', 'split', 'felled': a sword's stroke through it
//   flash     a blow's one-frame flash without washing the whole stage:
//             'post' the post alone white within its outline; 'rim' the
//             ninja drawn as ever inside a white rim a pixel wide, their
//             outermost pixels lit toward their chakra (a gate opening, a
//             burst of power); 'silhouette' is drawn as 'rim' now (a body
//             blanked white read as a glitch at real size). A tint turns the
//             ninja to a ghost too, which reads as a glitch; use these for a
//             hit's flash
//
// WHAT THE NINJA IN A CEL CAN DO, beyond a pose and a place (NinjaCel):
//   held      this frame's place in a moving hold (kit.ts's hold()): where
//             the ninja has a drawing named `<pose>Wind` (sign2Wind,
//             crossedWind: the hair, a sleeve or a cloak's hem stirring),
//             it alternates with the pose every two frames, the head sunk a
//             pixel on frames 2-5 of every 8 (the breath under it); else the
//             pose breathes every other two frames (its `breath` drawing if
//             it has one, and the head a pixel down). compose.ts's heldOf.
//   wear      the props of another pose worn in this one too, nudged
//             (the nightcap through a sleeper's start, then lifting off)
//   clip      airborne, at most this many pixels of the hair cut off by the
//             stage's top: the lift is cut short to keep it so (the shared
//             leaps keep it to 3)
//   A pose named `<pose>Wind` is drawn like any other (on the pose's root
//   and feet row), in the template (every ninja wearing it gets it) or as a
//   ninja's own pose; a hold finds it by name, so a hold written before it
//   is drawn starts stirring the moment it is. It wears the pose's overlays
//   (Sakura's skirt) unless the ninja gives it overlays of its own.

import type { Pose } from '../art/chibi.ts'
import type { Move } from '../art/move.ts'
import type { Mood } from '../art/portrait.ts'

export type Grid = readonly string[]
// letter → 0xRRGGBB, or null for a letter drawn clear
export type Palette = Readonly<Record<string, number | null>>
export type XY = readonly [number, number]

// The eye states every face maps to (cels.ts's eyesOfFace), so a cel can ask
// for one whether the ninja's eyes are hand-drawn or not. A hand-drawn set
// may add its own names.
export type EyeState = 'open' | 'left' | 'half' | 'shut' | 'focus' | 'happy' | 'sad' | 'wide' | 'smug'

// ------------------------------------------------------------------ bodies

// One pose of a template.
//   rows    the body. Every pose's ROOT column (Template.root) is the point
//           between the feet, and its LAST row is the row the feet stand on;
//           grids may be any width and height about that (a smear is wider).
//   head    where the head sits, [dx, dy] from where it sits standing (a
//           crouch drops it, a lunge throws it forward). Default [0, 0].
//   hand    the held hand, [x, y] in this grid: where 'hand' effects anchor.
//   points  other named points in this grid, for props: 'back' (where a
//           slung thing rides), 'waist' (a pouch); Template.points gives
//           the defaults.
//   eyes    the eye state this pose shows unless the cel or face says other.
//   as      the companion pose this drawing stands for (beats are named in
//           the companion's poses: art/chibi.ts's Pose).
//   breath  the pose's other breathing frame (idle0 ↔ idle1): the
//           companion's breath (`bob` 1) shows it, the head sunk a pixel
//           with it (a pose without one only sinks its head); a moving
//           hold's breath shows it too. (A breath drawing that must keep the
//           head where it is, a hand raised to the jaw, gives itself
//           head: [0, -1] against the sink.) (A pose named `<pose>Wind` is the
//           pose stirring, for a moving hold: see NinjaCel's `held`.)
export type PoseGrid = {
  rows: Grid
  head?: XY
  hand?: XY
  points?: Readonly<Record<string, XY>>
  eyes?: string
  as?: Pose
  breath?: string
}

// An outfit's body in every pose it is drawn in.
//   letters  the semantic letters it uses, documented in its file; every
//            ninja wearing it maps each of them.
//   root     the column of every grid that is the point between the feet.
//   neck     how many rows above the feet the head's neck pixel sits,
//            standing (a head is seated by its neck pixel over the root).
//   poses    the drawings, by name.
//   map      every companion pose to its drawing (or, until one is drawn,
//            the nearest drawn); a pose drawn under the companion's own
//            name wins over the map.
//   points   default named points for poses that do not give their own.
export type Template = {
  name: string
  letters: string
  root: number
  neck: number
  poses: Readonly<Record<string, PoseGrid>>
  map: Readonly<Record<Pose, string>>
  points?: Readonly<Record<string, XY>>
}

// A hand-drawn head (20 x 19 or so, outline included): `palette` names its
// letters' colours; `neck` the pixel set over the body's neck; `eyes` each
// eye's top-left pixel (viewer's left, right), 2 x 2 each, on skin the head
// leaves for them.
export type HeadGrid = {
  palette: Palette
  rows: Grid
  neck: XY
  eyes: readonly [XY, XY]
}

// One hand-drawn eye state: `rows` in the eyes' palette, stamped with its
// top-left at the eye's position plus `at` (a lid, a brow or a mouth may
// reach past the eyes).
export type EyeGrid = { at: XY; rows: Grid }

// Hand-drawn eyes.
//   states       the drawings by state name; 'open' at least
//   mirror       each grid is the viewer's left eye alone, and the right eye
//                (when it shows) mirrors it; else each grid covers both eyes
//   rightHidden  the right eye shows only while the dojutsu head is on
//                (under a headband)
export type HandEyes = {
  palette: Palette
  states: { readonly open: EyeGrid; readonly [state: string]: EyeGrid }
  mirror?: boolean
  rightHidden?: boolean
  // the mood the companion reports for a state of their own ('grin': 'happy')
  moods?: Readonly<Record<string, Mood>>
}

// The dojutsu awake (the face's `active`; a cel's `awake`).
//   head    the head while it is awake
//   eyes    stamped at the viewer's right eye + at, over the ordinary eyes
//   states  a state's own grid instead, or null for none at rest (a blink
//           shuts both); in a move a null state keeps `eyes` (the dojutsu
//           stays open whatever the other eye does)
export type Dojutsu = {
  head?: HeadGrid
  eyes?: EyeGrid
  states?: Readonly<Record<string, EyeGrid | null>>
}

// Another pose's drawing under a ninja's own name for it, changed a little.
export type PoseRef = { base: string; eyes?: string; head?: XY; hand?: XY; points?: Readonly<Record<string, XY>> }

// A per-pose edit baked into a ninja's copy of a template pose (see the top).
export type Overlay = { rows: Grid; at?: XY; on?: 'grid' | 'head'; under?: boolean }

// A thing worn, drawn at run time with the figure (see the top).
export type PropPlace = { rows: Grid; on: string; at: XY; behind?: boolean }
export type Prop = PropPlace & {
  palette?: Palette
  onto?: string
  only?: readonly string[]
  skip?: readonly string[]
  poses?: Readonly<Record<string, Partial<PropPlace> | null>>
}

export type NinjaSprite = {
  id: string
  template: Template
  // the template's letters in this ninja's colours (and any letters of their own overlays and props)
  body: Palette
  head: HeadGrid
  eyes: HandEyes
  dojutsu?: Dojutsu
  poses?: Readonly<Record<string, string | PoseGrid | PoseRef>>
  overlays?: Readonly<Record<string, readonly Overlay[]>>
  rules?: readonly ((rows: Grid, pose: string) => Grid)[]
  props?: readonly Prop[]
  poseEyes?: Readonly<Record<string, string>>
  heads?: Readonly<Record<string, HeadGrid>>
  home?: number
  // the moves: the three jutsu (index 0-2), the quick strike, the cheer, and
  // optionally their own arrival, fizzle and dispel (else the shared ones)
  moves: readonly CelMove[]
  quick: CelMove
  cheer: CelMove
  arrival?: CelMove
  fizzle?: CelMove
  dispel?: CelMove
}

// ------------------------------------------------------------------ effects

// A frame is a grid (anchored at the family's anchor) or its own anchor and grid.
export type FxFrame = Grid | { anchor: XY; rows: Grid }

// An effect: frames, the anchor each is placed by (the point of the grid that
// lands on the place asked for), and the palette: a name in fx/palettes.ts's
// FX_PALETTES (swappable per use) or a palette of its own. `outline`: grown a
// pixel round its drawn pixels in this colour (the summoned animals). A
// stage-sized effect is 48 x 24 with anchor [0, 0], placed at [0, 0].
export type FxFamily = {
  palette: string | Palette
  anchor: XY
  frames: readonly FxFrame[]
  outline?: number
}

// Where an effect goes: on the held hand, the feet (the root on the ground),
// the head's top-left, the brow (the head's leftmost column near its top, on
// its hair's top row: where the badges sit beside it), the post's struck
// point, the ninja's home, or a stage pixel ([0, 0] for a stage-sized effect).
export type Anchor = 'hand' | 'feet' | 'head' | 'brow' | 'post' | 'home' | XY

// One effect in a cel.
//   fx     the family's name (fx/index.ts)
//   f      the frame, or 'cycle': the move's frame count (plus `phase`) round its frames
//   at     where; `d` a nudge from there
//   back   behind the ninja and the post (else in front of the ninja)
//   pal    another palette by name, or 'chakra': its own colours turned to
//          the ninja's chakra by brightness (their glow; a fizzle's sparks)
//   flip   mirrored left to right about its anchor
//   sink   pushed this many pixels down, cut off below its anchor row (a
//          summoned animal rising out of the ground)
export type FxUse = {
  fx: string
  f: number | 'cycle'
  at: Anchor
  d?: XY
  back?: boolean
  pal?: string
  flip?: boolean
  phase?: number
  sink?: number
}

// ------------------------------------------------------------------ cels

// The ninja in a cel.
//   pose       a pose of the template, or a companion pose (its map finds the
//              nearest drawn), or one of the ninja's own (NinjaSprite.poses)
//   x          the root column on the stage (stage.ts's HOME at rest)
//   lift       pixels off the ground (a hop); dy pixels sunk
//   hdx, hdy   the head nudged (a head that lags the body by a frame)
//   eyes       the eye state (else the ninja's poseEyes, the pose's own, open)
//   awake      the dojutsu awake: the Sharingan, Byakugan, Rinnegan, Sage
//              Mode or Tsunade's seal (the dojutsu head and eye; kit.ts's awake())
//   head       one of the ninja's variant heads, by name (NinjaSprite.heads)
//   noShadow   no shadow on the floor under them
//   held       the frame's place in a moving hold: the pose stirs (its
//              `<pose>Wind` drawing) or breathes (see the top; kit.ts's hold())
//   clip       in the air, at most this many pixels of the hair cut off by
//              the stage's top: the lift is cut short to keep it so
//   wear       the props worn only in another pose worn in this one too,
//              nudged by d (Naruto's nightcap through the start of waking,
//              then lifting off)
export type NinjaCel = {
  pose: string
  x: number
  lift?: number
  dy?: number
  hdx?: number
  hdy?: number
  eyes?: string
  awake?: boolean
  head?: string
  noShadow?: boolean
  held?: number
  clip?: number
  wear?: { pose: string; d?: XY }
}

// A copy of the ninja in a cel (see the top): full size, their template,
// colours and face.
export type CloneCel = NinjaCel & {
  flip?: boolean
  puff?: number
  ghost?: number | 'chakra'
  front?: boolean
  z?: number
}

// The whole stage washed toward a colour, or remapped by brightness between two.
export type StageTint = { colour: number; amount: number } | { dark: number; light: number }

// The post's drawings (post.ts).
export type PostFrame = 'stand' | 'lean' | 'scorch' | 'scorchLean' | 'scarred' | 'twist1' | 'twist2' | 'twist3' | 'cut' | 'split' | 'felled'

// One held drawing of a move, `n` frames at 10 fps.
//   tag     the beat it belongs to: consecutive cels with one tag are one beat
//           of the Move ('signs', 'charge', 'dash', 'impact', 'back',
//           'recover'...). 'impact' is a blow landing (the companion's hit),
//           'recover' where a cut-short jutsu stops; the shout comes at the
//           launch before the first impact, or at a beat marked `shout`.
//   k       the ninja (none: out of sight, under a cloud of smoke)
//   clones  copies of the ninja
//   post    the post's frame (none: no post), pdx/pdy its shake or hop
//   fx      effects, back to front as listed
//   tint    the stage washed or remapped (all but the effects in front)
//   shake   the whole stage jolted (a camera's shake): dx, or [dx, dy];
//           postStill keeps the post, its shadow and its anchor still
//   shout   this beat starts the shout (else the launch before the blow), or
//           shouts a string of its own through the beat ("Second meteor")
//   flash   a one-frame flash: 'post' the post white, 'rim' (or 'silhouette',
//           drawn the same) a white rim round the ninja (instead of a tint
//           over the whole stage)
//   poof    set by kit.ts's postIn/postOut on the post's poof in and out
export type Cel = {
  n: number
  tag: string
  k?: NinjaCel
  clones?: readonly CloneCel[]
  post?: PostFrame | null
  pdx?: number
  pdy?: number
  fx?: readonly FxUse[]
  tint?: StageTint
  shake?: number | XY
  postStill?: boolean
  shout?: true | string
  flash?: CelFlash
  poof?: 'in' | 'out'
}

// A cel's one-frame flash (see Cel): the post alone white, or a white rim round the ninja.
export type CelFlash = 'post' | 'rim' | 'silhouette'

// A cel as drawn on one 10 fps frame: `t` the frame's index in the move.
export type Frame = Cel & { t: number }

// A move as the mod plays it, carrying its cels, expanded a frame each.
export type CelMove = Move & { cels: readonly Cel[]; frames: readonly Frame[] }
