import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

function createPng(width, height, bgColor, drawMark) {
  // Color components
  const [bgR, bgG, bgB] = bgColor;
  const rawData = Buffer.alloc(height * (1 + width * 4));

  for (let y = 0; y < height; y++) {
    const rowOffset = y * (1 + width * 4);
    rawData[rowOffset] = 0; // Filter type None

    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      const isMark = drawMark(x, y, width, height);

      if (isMark === 'gold') {
        // Gold: #D4AF37 -> 212, 175, 55
        rawData[pixelOffset] = 212;
        rawData[pixelOffset + 1] = 175;
        rawData[pixelOffset + 2] = 55;
        rawData[pixelOffset + 3] = 255;
      } else if (isMark === 'white') {
        // White: 255, 255, 255
        rawData[pixelOffset] = 255;
        rawData[pixelOffset + 1] = 255;
        rawData[pixelOffset + 2] = 255;
        rawData[pixelOffset + 3] = 255;
      } else {
        rawData[pixelOffset] = bgR;
        rawData[pixelOffset + 1] = bgG;
        rawData[pixelOffset + 2] = bgB;
        rawData[pixelOffset + 3] = 255;
      }
    }
  }

  const compressed = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace

  const ihdrChunk = createChunk('IHDR', ihdrData);
  const idatChunk = createChunk('IDAT', compressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = data.length;
  const chunk = Buffer.alloc(12 + length);
  chunk.writeUInt32BE(length, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);

  const crc = crc32(chunk.subarray(4, 8 + length));
  chunk.writeUInt32BE(crc >>> 0, 8 + length);
  return chunk;
}

// CRC32 table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) c = 0xedb88320 ^ (c >>> 1);
    else c = c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return c ^ 0xffffffff;
}

// Geometric rule for R mark
function drawRMark(x, y, w, h) {
  const nx = x / w;
  const ny = y / h;

  // Stem vertical bar (nx: 0.22 - 0.38, ny: 0.18 - 0.82)
  if (nx >= 0.24 && nx <= 0.36 && ny >= 0.20 && ny <= 0.80) {
    return 'white';
  }
  // Serifs
  if (nx >= 0.18 && nx <= 0.42 && ((ny >= 0.18 && ny <= 0.23) || (ny >= 0.77 && ny <= 0.82))) {
    return 'white';
  }
  // Top arch loop
  const cx = 0.44;
  const cy = 0.36;
  const dx = (nx - cx) / 0.26;
  const dy = (ny - cy) / 0.18;
  const dist = dx * dx + dy * dy;
  if (dist <= 1.0 && dist >= 0.45 && nx >= 0.30) {
    return 'white';
  }

  // Golden inner plumes
  if (dist < 0.45 && nx >= 0.34 && ny <= 0.46) {
    // 3 diagonal plume rays
    const diag = (nx - 0.32) + (ny - 0.28);
    if ((diag > 0.08 && diag < 0.14) || (diag > 0.18 && diag < 0.24) || (diag > 0.28 && diag < 0.35)) {
      return 'gold';
    }
  }

  // Golden swooping lower leg
  const legX = 0.34 + (ny - 0.50) * 0.9;
  if (ny >= 0.48 && ny <= 0.82 && Math.abs(nx - legX) <= 0.08 - (0.82 - ny) * 0.04) {
    return 'gold';
  }

  return null;
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate PWA icons with #002147 navy background
const navy = [0, 33, 71];

fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPng(192, 192, navy, drawRMark));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPng(512, 512, navy, drawRMark));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPng(512, 512, navy, drawRMark));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPng(180, 180, navy, drawRMark));

console.log('Successfully generated PWA icon PNGs in /public!');
