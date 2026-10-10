// Letter grids to pixels: palettes written as text, grids compiled once into
// arrays of letters, and stamping a grid onto a canvas (an Int32Array of
// 0xRRGGBB, CLEAR where nothing is drawn). Everything here is whole pixels:
// a grid lands exactly as drawn, mirrored at most.

import type { Grid, Palette } from './types.ts'

export const CLEAR = -1
// a letter its palette does not name
const MISSING = -2

// A palette written as 'a:#rrggbb b:#rrggbb ...', or 'x:-' for a letter drawn clear.
export const pal = (spec: string): Palette =>
  Object.fromEntries(
    spec
      .trim()
      .split(/\s+/)
      .map(kv => {
        const [k, v] = kv.split(':') as [string, string]
        return [k, v === '-' ? null : parseInt(v.replace('#', ''), 16)]
      }),
  )

// a grid as letter codes, row by row (0 clear), and its size
export type Compiled = { w: number; h: number; codes: Uint8Array }
const compiled = new WeakMap<Grid, Compiled>()
export const compile = (rows: Grid): Compiled => {
  let c = compiled.get(rows)
  if (c) return c
  const h = rows.length
  let w = 0
  for (const r of rows) w = Math.max(w, r.length)
  const codes = new Uint8Array(w * h)
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const ch = row.charCodeAt(x)
      // '.' and ' ' are clear
      if (ch !== 46 && ch !== 32) codes[y * w + x] = ch & 127
    }
  })
  c = { w, h, codes }
  compiled.set(rows, c)
  return c
}

// a palette as a table by letter code, an UPPERCASE letter the colour of its lowercase one
const tables = new WeakMap<Palette, Int32Array>()
export const tableOf = (palette: Palette): Int32Array => {
  let t = tables.get(palette)
  if (t) return t
  t = new Int32Array(128).fill(MISSING)
  for (const [k, v] of Object.entries(palette)) {
    const c = v === null ? CLEAR : v
    t[k.charCodeAt(0) & 127] = c
    t[k.toUpperCase().charCodeAt(0) & 127] = c
  }
  tables.set(palette, t)
  return t
}

// which letters a stamp draws: all, lowercase only (under the head), or
// UPPERCASE only (over it)
export const ALL = 0
export const BACK = 1
export const FRONT = 2

// Stamps `rows` onto the w x h canvas `px` with its top-left at (x, y),
// mirrored if `flip`, nothing drawn at or below row `clip`. A letter the
// palette lacks throws, naming it (the tests catch a grid an artist got wrong).
export const stamp = (px: Int32Array, w: number, h: number, rows: Grid, x: number, y: number, table: Int32Array, layer = ALL, flip = false, clip = Infinity): void => {
  const g = compile(rows)
  const gw = g.w
  const codes = g.codes
  for (let ry = 0; ry < g.h; ry++) {
    const Y = y + ry
    if (Y < 0 || Y >= h || Y >= clip) continue
    const o = ry * gw
    for (let rx = 0; rx < gw; rx++) {
      const code = codes[o + rx]!
      if (code === 0) continue
      if (layer !== ALL && (code >= 65 && code <= 90 ? layer === BACK : layer === FRONT)) continue
      const X = x + (flip ? gw - 1 - rx : rx)
      if (X < 0 || X >= w) continue
      const c = table[code]!
      if (c === MISSING) throw new Error(`no colour for '${String.fromCharCode(code)}' in grid row ${ry}: ${rows[ry]}`)
      if (c !== CLEAR) px[Y * w + X] = c
    }
  }
}

// the letters a grid uses that `palette` does not name (for the tests)
export const missing = (rows: Grid, palette: Palette): string[] => {
  const t = tableOf(palette)
  const out = new Set<string>()
  for (const row of rows) for (const ch of row) if (ch !== '.' && ch !== ' ' && t[ch.charCodeAt(0) & 127] === MISSING) out.add(ch)
  return [...out]
}

// A grid with an outline grown a pixel round it in letter `o` (a pixel clear
// beside a drawn one, four ways), a pixel bigger every side: for art drawn
// without one (the summoned animals). Its anchor moves a pixel right and down.
export const outlined = (rows: Grid, o = 'o'): string[] => {
  const g = compile(rows)
  const W = g.w + 2
  const H = g.h + 2
  const at = (x: number, y: number): number => (x < 0 || y < 0 || x >= g.w || y >= g.h ? 0 : g.codes[y * g.w + x]!)
  const out: string[] = []
  for (let y = 0; y < H; y++) {
    let row = ''
    for (let x = 0; x < W; x++) {
      const c = at(x - 1, y - 1)
      if (c !== 0) row += String.fromCharCode(c)
      else row += at(x - 2, y - 1) || at(x, y - 1) || at(x - 1, y - 2) || at(x - 1, y) ? o : '.'
    }
    out.push(row)
  }
  return out
}

export const mixc = (a: number, b: number, f: number): number => {
  const ch = (s: number): number => Math.round(((a >> s) & 255) * (1 - f) + ((b >> s) & 255) * f)
  return (ch(16) << 16) | (ch(8) << 8) | ch(0)
}
