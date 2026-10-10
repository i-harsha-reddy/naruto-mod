// The stage a native ninja plays on: 48 x 24 pixels, which the terminal shows
// as 48 columns by 12 rows of half blocks (two pixels a cell). The arena and
// its training post are on the left, the ninja stands at HOME on the right.
//
//   x  0 ............ 9 (the post) ............ 26 (a strike) ...... 35 (home) .. 47
//   y  0: the top row (the hair's tips at rest)
//     23: GROUND, the row the feet stand on; floor shadows are drawn on it,
//         behind the feet

export const STAGE_W = 48
export const STAGE_H = 24
export const GROUND = 23

// the ninja's root column at rest (the point between the feet)
export const HOME = 35
// the post's anchor column (post.ts's anchor lands here, on the ground)
export const POST_X = 9
// the point on the post a blow lands on (where 'post' effects anchor)
export const POST_HIT: readonly [number, number] = [POST_X + 3, 17]
// the root column at the moment a run-in blow lands (the fist on the post)
export const STRIKE = 26

// The terminal's peek (22 columns, no arena) shows the stage from this column:
// the whole head at rest (its outline at HOME - 10) with a column to spare.
export const PEEK_LEFT = HOME - 10

// floor shadows: under the post, and under the ninja (smaller the higher they leap)
export const SHADOW = 0x09090c
