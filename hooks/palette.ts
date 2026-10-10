// Colour depth: whether Claude Code paints this terminal in 24-bit colour, and
// the 256-colour palette match the cells are sent in when it does not.

// The terminal variables Claude Code decides its colour depth from ('' unset).
export type ColorEnv = { term: string; program: string; colorterm: string; force: string; os: string }

// Claude Code paints in 24-bit colour where chalk's supports-color says so, and
// otherwise rounds every colour to the 256-colour palette. Its rules, in its order:
// Windows, COLORTERM=truecolor and the terminals it knows for 24-bit come first;
// then a terminal it knows for less, or any COLORTERM, settles it; FORCE_COLOR
// counts only where nothing else does.
export const isTruecolor = ({ term, program, colorterm, force, os }: ColorEnv): boolean => {
  if (os === 'Windows_NT' || colorterm === 'truecolor' || term === 'xterm-kitty' || term === 'xterm-ghostty' || term === 'wezterm' || program === 'iTerm.app') return true
  if (program === 'Apple_Terminal' || /-256(color)?$|^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(term) || colorterm !== '') return false
  return parseInt(force, 10) >= 3
}

const clamp8 = (n: number): number => (n < 0 ? 0 : n > 255 ? 255 : n | 0)
const rgb = (r: number, g: number, b: number): number => (clamp8(r) << 16) | (clamp8(g) << 8) | clamp8(b)

// In a 256-colour session Claude Code turns each colour into a palette entry by
// rounding every channel on its own, which drags dark outlines up to purple
// and greys off to tints. Picking the nearest palette colour here, and sending
// a value both that rounding and a true nearest match land on, keeps the art.
const LEVELS = [0, 95, 135, 175, 215, 255]
const SEND = [0, 70, 122, 168, 215, 255]
const GREY_SEND: number[] = []
for (let i = 0; i < 24; i++) {
  const shown = 8 + 10 * i
  let best = shown
  for (let v = 0; v < 256; v++) {
    if (Math.round(((v - 8) / 247) * 24) !== i) continue
    if (Math.abs(v - shown) <= Math.abs(best - shown) || Math.round(((best - 8) / 247) * 24) !== i) best = v
  }
  GREY_SEND.push(best)
}

const hueOf = (r: number, g: number, b: number): number => {
  const max = Math.max(r, g, b)
  const d = max - Math.min(r, g, b)
  if (d === 0) return 0
  const h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4
  return (h * 60 + 360) % 360
}

// every colour a 256-colour session can show that its rounding can reach:
// the cube off its grey diagonal, its black and white, and the grey ramp,
// with the channels, hue and chroma the match needs worked out once
type Candidate = { r: number; g: number; b: number; hue: number; chroma: number; send: number }
const CANDIDATES: Candidate[] = []
const candidate = (shown: number, send: number): void => {
  const r = (shown >> 16) & 255
  const g = (shown >> 8) & 255
  const b = shown & 255
  CANDIDATES.push({ r, g, b, hue: hueOf(r, g, b), chroma: Math.max(r, g, b) - Math.min(r, g, b), send })
}
for (let r = 0; r < 6; r++)
  for (let g = 0; g < 6; g++)
    for (let b = 0; b < 6; b++) {
      if (r === g && g === b && r > 0 && r < 5) continue
      const send = r === g && g === b ? rgb(LEVELS[r]!, LEVELS[r]!, LEVELS[r]!) : rgb(SEND[r]!, SEND[g]!, SEND[b]!)
      candidate(rgb(LEVELS[r]!, LEVELS[g]!, LEVELS[b]!), send)
    }
for (let i = 0; i < 24; i++) candidate(rgb(8 + 10 * i, 8 + 10 * i, 8 + 10 * i), rgb(GREY_SEND[i]!, GREY_SEND[i]!, GREY_SEND[i]!))

// shades the match can't place well, placed by hand: Hinata's dark hair
// shade would land on a pure blue the rest of her hair never shows
const PINNED = new Map<number, number>([[0x30287a, 0x46467a]])

// matches found so far; the art's gradients make thousands, so it is emptied now and then
const matched = new Map<number, number>()

// the value to send for 0xRRGGBB `c` in a 256-colour session
export const to256 = (c: number): number => {
  const hit = matched.get(c)
  if (hit !== undefined) return hit
  const pin = PINNED.get(c)
  if (pin !== undefined) return pin
  const r = (c >> 16) & 255
  const g = (c >> 8) & 255
  const b = c & 255
  const hue = hueOf(r, g, b)
  const chroma = Math.max(r, g, b) - Math.min(r, g, b)
  const warm = hue < 170 || hue >= 300
  let best = CANDIDATES[0]!
  let bestD = Infinity
  for (const k of CANDIDATES) {
    // "redmean": a cheap distance that weighs channels the way the eye does
    const mean = (k.r + r) / 2
    const dr = k.r - r
    const dg = k.g - g
    const db = k.b - b
    let d = (2 + mean / 256) * dr * dr + 4 * dg * dg + (2 + (255 - mean) / 256) * db * db
    // keep a coloured thing the same colour: red hair stays red, not brown
    if (k.chroma >= 20 && chroma >= 20) {
      let turn = Math.abs(k.hue - hue)
      if (turn > 180) turn = 360 - turn
      d += (turn / 180) ** 2 * chroma * chroma * 32
    }
    // and a warm shade warm: a dark brown, wood or green is not a grey (a navy
    // may be, where it is the art's black)
    if (warm && chroma >= 30 && k.chroma < 20) d += 2 * (chroma - k.chroma) ** 2
    if (d < bestD) {
      bestD = d
      best = k
    }
  }
  if (matched.size >= 65536) matched.clear()
  matched.set(c, best.send)
  return best.send
}
