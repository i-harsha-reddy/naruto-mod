// A small GIF89a encoder, and a decoder to check it, in plain JS: for the
// README's animations, which are flat pixel art in a few dozen colours.
//
//   encodeGif(width, height, frames, opts) → Buffer
//     frames: [{ px: Int32Array of 0xRRGGBB per pixel (-1: clear), ms }]
//     opts.loop         0 loops forever (the default), n plays n + 1 times, null plays once
//     opts.transparent  clear pixels show the page behind (default: drawn in opts.background)
//     opts.background   the colour clear pixels are drawn in otherwise (default 0x000000)
//     opts.diff         each frame draws only what changed since the last, the rest
//                       left transparent, and an unchanged frame lengthens the one
//                       before it (default true)
//   decodeGif(buffer) → { width, height, loop, frames: [{ px, ms }] }, each frame
//     composited as a browser shows it (-1 where nothing is drawn)
//
// One global palette of the film's 255 commonest colours (one index kept for
// transparency); a frame that draws a colour outside it carries a local table
// of its own, so every colour is exact unless one frame alone has more than 255.

// ------------------------------------------------------------------ LZW

// the dictionary as a table keyed by prefix code and next index, each entry
// stamped with the generation it was made in, so a clear code empties it at once
const KEYS = 4096 * 256
const stamp = new Int32Array(KEYS)
const value = new Int16Array(KEYS)
let generation = 0

const lzwEncode = (indices, minCodeSize) => {
  const out = []
  let acc = 0
  let bits = 0
  const emit = (code, size) => {
    acc |= code << bits
    bits += size
    while (bits >= 8) {
      out.push(acc & 255)
      acc >>>= 8
      bits -= 8
    }
  }
  const clear = 1 << minCodeSize
  const eoi = clear + 1
  let size = minCodeSize + 1
  let next = eoi + 1
  generation++
  emit(clear, size)
  let prefix = indices[0]
  for (let i = 1; i < indices.length; i++) {
    const k = indices[i]
    const key = (prefix << 8) | k
    if (stamp[key] === generation) {
      prefix = value[key]
      continue
    }
    emit(prefix, size)
    if (next === 4096) {
      // the table is full: start it again
      emit(clear, size)
      generation++
      size = minCodeSize + 1
      next = eoi + 1
    } else {
      if (next >= 1 << size) size++
      stamp[key] = generation
      value[key] = next++
    }
    prefix = k
  }
  emit(prefix, size)
  emit(eoi, size)
  if (bits > 0) out.push(acc & 255)
  return Uint8Array.from(out)
}

const lzwDecode = (data, minCodeSize, count) => {
  const out = new Uint8Array(count)
  const clear = 1 << minCodeSize
  const eoi = clear + 1
  const prefix = new Int16Array(4096).fill(-1)
  const suffix = new Uint8Array(4096)
  const first = new Uint8Array(4096)
  for (let i = 0; i < clear; i++) {
    suffix[i] = i
    first[i] = i
  }
  const stack = new Uint8Array(4097)
  let size = minCodeSize + 1
  let next = eoi + 1
  let prev = -1
  let acc = 0
  let bits = 0
  let pos = 0
  let o = 0
  for (;;) {
    while (bits < size && pos < data.length) {
      acc |= data[pos++] << bits
      bits += 8
    }
    if (bits < size) break
    const code = acc & ((1 << size) - 1)
    acc >>>= size
    bits -= size
    if (code === clear) {
      size = minCodeSize + 1
      next = eoi + 1
      prev = -1
      continue
    }
    if (code === eoi) break
    if (prev === -1) {
      if (code >= clear) throw new Error(`gif: code ${code} before any string`)
      if (o < count) out[o++] = code
      prev = code
      continue
    }
    if (code > next) throw new Error(`gif: code ${code} past the table (${next})`)
    if (next < 4096) {
      // the new string: the previous one and the first index of this one
      prefix[next] = prev
      suffix[next] = code === next ? first[prev] : first[code]
      first[next] = first[prev]
      next++
      if (next >= 1 << size && size < 12) size++
    }
    let sp = 0
    for (let c = code; c >= 0; c = prefix[c]) stack[sp++] = suffix[c]
    while (sp > 0 && o < count) out[o++] = stack[--sp]
    prev = code
  }
  if (o < count) throw new Error(`gif: ${o} of ${count} pixels`)
  return out
}

// ------------------------------------------------------------------ palette

// how often each colour is drawn (-1, clear, left out)
const countColors = (pixels, counts = new Map()) => {
  let last = -2
  let run = 0
  for (let i = 0; i < pixels.length; i++) {
    const c = pixels[i]
    if (c === last) {
      run++
      continue
    }
    if (last >= 0) counts.set(last, (counts.get(last) ?? 0) + run)
    last = c
    run = 1
  }
  if (last >= 0) counts.set(last, (counts.get(last) ?? 0) + run)
  return counts
}

// A colour table of at most `room` colours: the commonest, the rest matched
// to the nearest of them. `exact` says whether every colour got its own.
const tableOf = (counts, room) => {
  const colors = [...counts.keys()].sort((a, b) => counts.get(b) - counts.get(a))
  const kept = colors.slice(0, room)
  const index = new Map(kept.map((c, i) => [c, i]))
  for (const c of colors.slice(room)) {
    let best = 0
    let bestD = Infinity
    kept.forEach((k, i) => {
      const dr = ((c >> 16) & 255) - ((k >> 16) & 255)
      const dg = ((c >> 8) & 255) - ((k >> 8) & 255)
      const db = (c & 255) - (k & 255)
      const d = 3 * dr * dr + 4 * dg * dg + 2 * db * db
      if (d < bestD) {
        bestD = d
        best = i
      }
    })
    index.set(c, best)
  }
  return { colors: kept, index, exact: colors.length <= room }
}

// the bits a table of `count` entries needs (a GIF table has 2 to 256)
const bitsFor = count => {
  let bits = 1
  while (1 << bits < count) bits++
  return bits
}

const tableBytes = (colors, bits) => {
  const table = Buffer.alloc(3 << bits)
  colors.forEach((c, i) => {
    table[i * 3] = (c >> 16) & 255
    table[i * 3 + 1] = (c >> 8) & 255
    table[i * 3 + 2] = c & 255
  })
  return table
}

// ------------------------------------------------------------------ encode

const u16 = n => [n & 255, (n >> 8) & 255]

export const encodeGif = (width, height, frames, opts = {}) => {
  const { loop = 0, transparent = false, background = 0x000000, diff = true } = opts
  const n = width * height
  for (const f of frames) if (f.px.length !== n) throw new Error(`gif: a frame of ${f.px.length} pixels, not ${width}×${height}`)
  // one index kept for "transparent": clear, or unchanged since the last frame
  const reserve = diff || transparent
  const room = reserve ? 255 : 256

  // the frames' colours (-1 where clear and transparent); unchanged frames merged
  const shots = []
  for (const f of frames) {
    const px = transparent ? Int32Array.from(f.px) : Int32Array.from(f.px, c => (c < 0 ? background : c))
    const prev = shots[shots.length - 1]
    if (diff && prev && prev.px.every((v, i) => v === px[i])) prev.ms += f.ms
    else shots.push({ px, ms: f.ms })
  }
  // the global table: the commonest colours of the whole film
  const counts = new Map()
  for (const s of shots) countColors(s.px, counts)
  const global = tableOf(counts, room)
  const globalBits = bitsFor(global.colors.length + (reserve ? 1 : 0))
  const inGlobal = new Set(global.colors)
  // a frame that clears a pixel the one before drew: the one before is
  // disposed of whole (only possible with a transparent background)
  const clears = shots.map((s, k) => {
    if (!transparent || k === 0) return false
    const before = shots[k - 1].px
    for (let i = 0; i < n; i++) if (s.px[i] < 0 && before[i] >= 0) return true
    return false
  })

  const parts = []
  const push = bytes => parts.push(Buffer.from(bytes))
  push([...Buffer.from('GIF89a'), ...u16(width), ...u16(height), 0xf0 | (globalBits - 1), 0, 0])
  parts.push(tableBytes(global.colors, globalBits))
  if (loop !== null) push([0x21, 0xff, 11, ...Buffer.from('NETSCAPE2.0'), 3, 1, ...u16(loop), 0])

  // what a viewer shows before each frame (-1: nothing yet)
  const canvas = new Int32Array(n).fill(-1)
  const NONE = -2
  let clock = 0
  let locals = 0
  shots.forEach((s, k) => {
    const dispose = clears[k + 1] ? 2 : 1
    // the pixels this frame changes, and the box round them
    let x0 = width
    let y0 = height
    let x1 = -1
    let y1 = -1
    for (let y = 0; y < height; y++)
      for (let x = 0; x < width; x++) {
        const i = y * width + x
        if (diff && s.px[i] === canvas[i]) continue
        if (x < x0) x0 = x
        if (x > x1) x1 = x
        if (y < y0) y0 = y
        if (y > y1) y1 = y
      }
    if (x1 < 0) {
      // nothing changed (after a disposal that cleared nothing drawn): one pixel, as it is
      x0 = y0 = x1 = y1 = 0
    }
    if (dispose === 2) {
      // disposal clears the frame's box: make it the whole picture
      x0 = y0 = 0
      x1 = width - 1
      y1 = height - 1
    }
    const w = x1 - x0 + 1
    const h = y1 - y0 + 1
    // the box's colours: an unchanged pixel left transparent (NONE), unless
    // drawing it carries on a run of its colour
    const box = new Int32Array(w * h)
    for (let y = 0; y < h; y++) {
      let run = NONE
      for (let x = 0; x < w; x++) {
        const i = (y0 + y) * width + x0 + x
        const want = s.px[i]
        const v = want < 0 || (diff && want === canvas[i] && want !== run) ? NONE : want
        box[y * w + x] = v
        run = v
        canvas[i] = want
      }
    }
    if (dispose === 2) canvas.fill(-1)
    // the global table, or a local one when the box has a colour it lacks
    let table = global
    let bits = globalBits
    let local = null
    for (let i = 0; i < box.length && !global.exact; i++)
      if (box[i] >= 0 && !inGlobal.has(box[i])) {
        table = tableOf(countColors(box), room)
        bits = bitsFor(table.colors.length + (reserve ? 1 : 0))
        local = tableBytes(table.colors, bits)
        locals++
        break
      }
    const T = reserve ? table.colors.length : 0
    const ix = new Uint8Array(box.length)
    let lastColor = NONE - 1
    let lastIndex = 0
    for (let i = 0; i < box.length; i++) {
      const c = box[i]
      if (c !== lastColor) {
        lastColor = c
        lastIndex = c < 0 ? T : table.index.get(c)
      }
      ix[i] = lastIndex
    }
    const delay = Math.round((clock + s.ms) / 10) - Math.round(clock / 10)
    clock += s.ms
    const minCodeSize = Math.max(2, bits)
    push([0x21, 0xf9, 4, (dispose << 2) | (reserve ? 1 : 0), ...u16(delay), T, 0])
    push([0x2c, ...u16(x0), ...u16(y0), ...u16(w), ...u16(h), local ? 0x80 | (bits - 1) : 0])
    if (local) parts.push(local)
    push([minCodeSize])
    const data = lzwEncode(ix, minCodeSize)
    for (let p = 0; p < data.length; p += 255) {
      const block = data.subarray(p, p + 255)
      push([block.length])
      parts.push(Buffer.from(block))
    }
    push([0])
  })
  push([0x3b])
  const gif = Buffer.concat(parts)
  gif.stats = { colors: counts.size, global: global.colors.length, locals, frames: shots.length, ms: clock }
  return gif
}

// ------------------------------------------------------------------ decode

export const decodeGif = buf => {
  const sig = buf.toString('latin1', 0, 6)
  if (sig !== 'GIF89a' && sig !== 'GIF87a') throw new Error('gif: not a GIF')
  const width = buf.readUInt16LE(6)
  const height = buf.readUInt16LE(8)
  const flags = buf[10]
  let p = 13
  const readTable = (flags) => {
    const size = 2 << (flags & 7)
    const t = []
    for (let i = 0; i < size; i++) t.push((buf[p + i * 3] << 16) | (buf[p + i * 3 + 1] << 8) | buf[p + i * 3 + 2])
    p += size * 3
    return t
  }
  const global = flags & 0x80 ? readTable(flags) : null
  const subBlocks = () => {
    const chunks = []
    for (let len = buf[p++]; len > 0; len = buf[p++]) {
      chunks.push(buf.subarray(p, p + len))
      p += len
    }
    return Buffer.concat(chunks)
  }
  const canvas = new Int32Array(width * height).fill(-1)
  const frames = []
  let loop = null
  let gce = { dispose: 0, ms: 0, transparent: -1 }
  while (p < buf.length) {
    const b = buf[p++]
    if (b === 0x3b) break
    if (b === 0x21) {
      const label = buf[p++]
      if (label === 0xf9) {
        const size = buf[p++]
        const f = buf[p]
        gce = { dispose: (f >> 2) & 7, ms: buf.readUInt16LE(p + 1) * 10, transparent: f & 1 ? buf[p + 3] : -1 }
        p += size
        subBlocks()
      } else if (label === 0xff) {
        const size = buf[p++]
        const id = buf.toString('latin1', p, p + size)
        p += size
        const data = subBlocks()
        if (id === 'NETSCAPE2.0' && data[0] === 1) loop = data.readUInt16LE(1)
      } else subBlocks()
      continue
    }
    if (b !== 0x2c) throw new Error(`gif: unexpected byte 0x${b.toString(16)} at ${p - 1}`)
    const x0 = buf.readUInt16LE(p)
    const y0 = buf.readUInt16LE(p + 2)
    const w = buf.readUInt16LE(p + 4)
    const h = buf.readUInt16LE(p + 6)
    const f = buf[p + 8]
    p += 9
    const colors = f & 0x80 ? readTable(f) : global
    if (!colors) throw new Error('gif: no colour table')
    if (f & 0x40) throw new Error('gif: interlaced frames are not read here')
    if (x0 + w > width || y0 + h > height) throw new Error(`gif: a frame out of bounds (${x0},${y0} ${w}×${h})`)
    const minCodeSize = buf[p++]
    const ix = lzwDecode(subBlocks(), minCodeSize, w * h)
    const saved = gce.dispose === 3 ? canvas.slice() : null
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const v = ix[y * w + x]
        if (v !== gce.transparent) canvas[(y0 + y) * width + x0 + x] = colors[v]
      }
    frames.push({ px: canvas.slice(), ms: gce.ms, box: [x0, y0, w, h] })
    if (gce.dispose === 2) for (let y = 0; y < h; y++) canvas.fill(-1, (y0 + y) * width + x0, (y0 + y) * width + x0 + w)
    else if (saved) canvas.set(saved)
    gce = { dispose: 0, ms: 0, transparent: -1 }
  }
  return { width, height, loop, frames }
}
