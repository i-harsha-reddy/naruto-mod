// A tiny PNG writer for previews: RGB, every pixel scaled up `s` times.
import { deflateSync } from 'node:zlib'
import { writeFileSync } from 'node:fs'

const table = new Uint32Array(256).map((_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})
const crc = buf => {
  let c = 0xffffffff
  for (const b of buf) c = table[(c ^ b) & 255] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}
const chunk = (type, data) => {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type), data])
  const sum = Buffer.alloc(4)
  sum.writeUInt32BE(crc(body))
  return Buffer.concat([len, body, sum])
}

// px: 0xRRGGBB per pixel, -1 transparent (drawn as `bg`)
export const writePng = (path, w, h, px, s = 6, bg = 0x1e1e24) => {
  const W = w * s
  const H = h * s
  const raw = Buffer.alloc((W * 3 + 1) * H)
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      let c = px[Math.floor(y / s) * w + Math.floor(x / s)]
      if (c < 0) c = bg
      const o = y * (W * 3 + 1) + 1 + x * 3
      raw[o] = (c >> 16) & 255
      raw[o + 1] = (c >> 8) & 255
      raw[o + 2] = c & 255
    }
  const head = Buffer.alloc(13)
  head.writeUInt32BE(W, 0)
  head.writeUInt32BE(H, 4)
  head[8] = 8
  head[9] = 2
  writeFileSync(path, Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', head), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]))
}
