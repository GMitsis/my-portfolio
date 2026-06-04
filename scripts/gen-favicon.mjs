// Generates a brand-matched favicon.ico (no external deps).
// Mark: chartreuse squircle + dark geometric "G" monogram.
// Brand: --accent #cdfc4f on --bg #0b0c0a (editorial / Swiss portfolio).
import zlib from 'node:zlib';
import { writeFileSync } from 'node:fs';

const ACCENT = [0xcd, 0xfc, 0x4f]; // #cdfc4f
const INK    = [0x0b, 0x0c, 0x0a]; // #0b0c0a

// ---- shape coverage in normalized [0,1] space (y down), supersampled ----
function squircleCoverage(x, y) {
  // rounded-rect (superellipse) filling the tile with small margin
  const m = 0.02, n = 4.5;          // exponent -> squircle
  const cx = 0.5, cy = 0.5, r = 0.5 - m;
  const dx = Math.abs(x - cx) / r, dy = Math.abs(y - cy) / r;
  return Math.pow(dx, n) + Math.pow(dy, n) <= 1 ? 1 : 0;
}

function gCoverage(x, y) {
  const cx = 0.5, cy = 0.5;
  const dx = x - cx, dy = y - cy;
  const dist = Math.hypot(dx, dy);
  const Ro = 0.30, t = 0.105, Ri = Ro - t;

  // annulus (ring)
  let inRing = dist <= Ro && dist >= Ri;

  // opening of the C: carve a wedge in the upper-right
  // angle in degrees, 0 = right, negative = upward (screen y is down)
  const ang = Math.atan2(dy, dx) * 180 / Math.PI;
  if (inRing && ang > -52 && ang < -6) inRing = false;

  // crossbar / jaw: horizontal bar from centre to the right edge at mid-height
  const barT = t;
  const inBar =
    x >= cx - 0.005 && x <= cx + Ro + 0.012 &&
    Math.abs(dy - 0.012) <= barT / 2;

  // small vertical terminal where the bar meets the opening, to read as "G"
  const inTip =
    Math.abs(dx - (Ro - t / 2)) <= t / 2 &&
    dy <= 0.012 + barT / 2 && dy >= -0.07;

  return (inRing || inBar || inTip) ? 1 : 0;
}

function renderSize(size, fullBleed = false) {
  const SS = 4; // supersampling
  const buf = Buffer.alloc(size * size * 4);
  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      let bg = 0, fg = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const x = (px + (sx + 0.5) / SS) / size;
          const y = (py + (sy + 0.5) / SS) / size;
          // apple-touch icons want a full square (iOS masks the corners itself)
          bg += fullBleed ? 1 : squircleCoverage(x, y);
          fg += gCoverage(x, y);
        }
      }
      const samples = SS * SS;
      const bgA = bg / samples;     // squircle alpha
      const fgA = fg / samples;     // letter coverage (inside squircle)
      // composite: accent base, ink letter painted over it, all masked by squircle
      const r = ACCENT[0] * (1 - fgA) + INK[0] * fgA;
      const g = ACCENT[1] * (1 - fgA) + INK[1] * fgA;
      const b = ACCENT[2] * (1 - fgA) + INK[2] * fgA;
      const i = (py * size + px) * 4;
      buf[i]     = Math.round(r);
      buf[i + 1] = Math.round(g);
      buf[i + 2] = Math.round(b);
      buf[i + 3] = Math.round(bgA * 255);
    }
  }
  return buf;
}

// ---- minimal PNG encoder (RGBA, 8-bit) ----
function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xEDB88320 & -(c & 1));
  }
  return (~c) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
  const t = Buffer.from(type, 'ascii');
  const body = Buffer.concat([t, data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}
function encodePNG(rgba, size) {
  const sig = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  // add per-scanline filter byte (0 = none)
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    rgba.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// ---- ICO container (embeds PNGs; supported by all modern browsers) ----
function buildICO(images) {
  const count = images.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(count, 4);
  const dir = Buffer.alloc(16 * count);
  let offset = 6 + 16 * count;
  const blobs = [];
  images.forEach((img, idx) => {
    const o = idx * 16;
    dir[o] = img.size >= 256 ? 0 : img.size;     // width
    dir[o + 1] = img.size >= 256 ? 0 : img.size; // height
    dir[o + 2] = 0; dir[o + 3] = 0;
    dir.writeUInt16LE(1, o + 4);   // planes
    dir.writeUInt16LE(32, o + 6);  // bpp
    dir.writeUInt32LE(img.data.length, o + 8);
    dir.writeUInt32LE(offset, o + 12);
    offset += img.data.length;
    blobs.push(img.data);
  });
  return Buffer.concat([header, dir, ...blobs]);
}

// ---- vector favicon (crisp at any DPI) — mirrors the analytic mark ----
function buildSVG(fullBleed = false) {
  const S = 100, cx = 50, cy = 50;
  const Ro = 30, t = 10.5, Rm = Ro - t / 2; // ring mid-radius
  const accent = '#cdfc4f', ink = '#0b0c0a';
  const pt = (deg, r) => {
    const a = deg * Math.PI / 180;
    return [(cx + r * Math.cos(a)).toFixed(2), (cy + r * Math.sin(a)).toFixed(2)];
  };
  // C-arc: present everywhere except the wedge in (-52°, -6°)
  const [sx, sy] = pt(-6, Rm);   // arc start
  const [ex, ey] = pt(-52, Rm);  // arc end (long way round)
  const arc = `M ${sx} ${sy} A ${Rm} ${Rm} 0 1 1 ${ex} ${ey}`;
  const barY = cy + 1.2;
  const spurX = cx + (Ro - t / 2);
  const bg = fullBleed
    ? `<rect width="${S}" height="${S}" fill="${accent}"/>`
    : `<rect x="2" y="2" width="${S - 4}" height="${S - 4}" rx="24" ry="24" fill="${accent}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${S} ${S}">
  ${bg}
  <g fill="none" stroke="${ink}" stroke-width="${t}" stroke-linecap="butt">
    <path d="${arc}"/>
    <line x1="${cx - 0.5}" y1="${barY}" x2="${spurX + t / 2}" y2="${barY}"/>
    <line x1="${spurX}" y1="${barY + t / 2}" x2="${spurX}" y2="${(barY - 8).toFixed(2)}"/>
  </g>
</svg>
`;
}

const sizes = [16, 32, 48, 64, 128, 256];
const images = sizes.map((s) => ({ size: s, data: encodePNG(renderSize(s), s) }));
const ico = buildICO(images);

const outDir = process.argv[2] || '.';
writeFileSync(`${outDir}/favicon.ico`, ico);
writeFileSync(`${outDir}/favicon.svg`, buildSVG(false));
const apple = renderSize(180, true);
writeFileSync(`${outDir}/apple-touch-icon.png`, encodePNG(apple, 180));
// preview sheet
writeFileSync(`${outDir}/favicon-preview.png`, images[5].data);
console.log(`wrote favicon.ico (${ico.length} bytes), favicon.svg, apple-touch-icon.png`);
