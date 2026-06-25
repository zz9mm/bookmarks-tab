const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// ---- PNG 编码（RGBA, color type 6）----
function crc32(data) {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc = (crc >>> 8) ^ TABLE[(crc ^ data[i]) & 0xff];
  }
  return (crc ^ 0xffffffff) >>> 0;
}
const TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    t[n] = c;
  }
  return t;
})();
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
  const tb = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([tb, data])), 0);
  return Buffer.concat([len, tb, data, crc]);
}
function encodePng(width, height, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const raw = Buffer.alloc((width * 4 + 1) * height);
  let o = 0;
  for (let y = 0; y < height; y++) {
    raw[o++] = 0; // filter: none
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      raw[o++] = rgba[i]; raw[o++] = rgba[i + 1]; raw[o++] = rgba[i + 2]; raw[o++] = rgba[i + 3];
    }
  }
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// ---- 图形定义（归一化坐标 0..1）----
const TOP = [59, 130, 246];   // #3B82F6
const BOT = [37, 99, 235];    // #2563EB
const RADIUS = 0.22;          // 圆角半径占比

// 书签缎带
const L = 0.37, R = 0.63, T = 0.27, FLAT = 0.73, NOTCH = 0.59;
const MID = (L + R) / 2, HALF = (R - L) / 2;

function inRoundedRect(nx, ny) {
  const r = RADIUS;
  const cx = Math.min(Math.max(nx, r), 1 - r);
  const cy = Math.min(Math.max(ny, r), 1 - r);
  const dx = nx - cx, dy = ny - cy;
  return dx * dx + dy * dy <= r * r;
}
function inBookmark(nx, ny) {
  if (nx < L || nx > R || ny < T) return false;
  const bottom = FLAT - (FLAT - NOTCH) * (1 - Math.abs(nx - MID) / HALF);
  return ny <= bottom;
}

function render(size, ss = 4) {
  const rgba = Buffer.alloc(size * size * 4);
  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      let r = 0, g = 0, b = 0, a = 0;
      for (let sy = 0; sy < ss; sy++) {
        for (let sx = 0; sx < ss; sx++) {
          const nx = (px + (sx + 0.5) / ss) / size;
          const ny = (py + (sy + 0.5) / ss) / size;
          if (!inRoundedRect(nx, ny)) continue;
          let cr, cg, cb;
          if (inBookmark(nx, ny)) {
            cr = cg = cb = 255;
          } else {
            cr = TOP[0] + (BOT[0] - TOP[0]) * ny;
            cg = TOP[1] + (BOT[1] - TOP[1]) * ny;
            cb = TOP[2] + (BOT[2] - TOP[2]) * ny;
          }
          r += cr; g += cg; b += cb; a += 255;
        }
      }
      const n = ss * ss;
      const i = (py * size + px) * 4;
      // 背景外的子样本计为透明，颜色用已命中样本的均值避免黑边
      const hit = a / 255;
      rgba[i] = hit ? Math.round(r / hit) : 0;
      rgba[i + 1] = hit ? Math.round(g / hit) : 0;
      rgba[i + 2] = hit ? Math.round(b / hit) : 0;
      rgba[i + 3] = Math.round(a / n);
    }
  }
  return encodePng(size, size, rgba);
}

const dir = __dirname;
[16, 32, 48, 128].forEach(s => {
  fs.writeFileSync(path.join(dir, `icon${s}.png`), render(s));
  console.log(`icon${s}.png`);
});
fs.writeFileSync(path.join(dir, 'store-logo-300.png'), render(300));
console.log('store-logo-300.png');
console.log('Done!');
