import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createPng(width, height, r, g, b) {
  // Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // bit depth 8
  ihdrData.writeUInt8(6, 9); // color type 6: RGBA
  ihdrData.writeUInt8(0, 10); // compression 0
  ihdrData.writeUInt8(0, 11); // filter 0
  ihdrData.writeUInt8(0, 12); // interlace 0
  const ihdr = makeChunk('IHDR', ihdrData);

  // Raw image data with filter byte 0 per scanline
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowSize);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData.writeUInt8(0, rowOffset); // filter type: none

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      // Draw background gradient / navy with central emblem
      const cx = width / 2;
      const cy = height / 2;
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      const radius = width * 0.44;

      if (dist < radius) {
        // Inside icon circle
        // Draw gold accent in center or white graduation cap shape
        if (Math.abs(y - cy) < height * 0.15 && Math.abs(x - cx) < width * 0.25) {
          // White emblem
          rawData.writeUInt8(255, pxOffset);
          rawData.writeUInt8(255, pxOffset + 1);
          rawData.writeUInt8(255, pxOffset + 2);
          rawData.writeUInt8(255, pxOffset + 3);
        } else {
          // Navy blue (#172554 -> #2563EB)
          const grad = y / height;
          rawData.writeUInt8(Math.floor(23 * (1 - grad) + 37 * grad), pxOffset);
          rawData.writeUInt8(Math.floor(37 * (1 - grad) + 99 * grad), pxOffset + 1);
          rawData.writeUInt8(Math.floor(84 * (1 - grad) + 235 * grad), pxOffset + 2);
          rawData.writeUInt8(255, pxOffset + 3);
        }
      } else {
        // Transparent outside rounded icon
        rawData.writeUInt8(0, pxOffset);
        rawData.writeUInt8(0, pxOffset + 1);
        rawData.writeUInt8(0, pxOffset + 2);
        rawData.writeUInt8(0, pxOffset + 3);
      }
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idat = makeChunk('IDAT', compressed);
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

function makeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(8 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);

  const crc = crc32(chunk.subarray(4, 8 + len));
  chunk.writeInt32BE(crc, 8 + len);
  return chunk;
}

// CRC32 implementation
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return crc ^ -1;
}

const iconsDir = path.resolve('frontend/public/icons');
fs.writeFileSync(path.join(iconsDir, 'icon-192.png'), createPng(192, 192, 23, 37, 84));
fs.writeFileSync(path.join(iconsDir, 'icon-512.png'), createPng(512, 512, 23, 37, 84));
fs.writeFileSync(path.join(iconsDir, 'icon-512-maskable.png'), createPng(512, 512, 23, 37, 84));
console.log('✅ Generated PWA icons: icon-192.png, icon-512.png, icon-512-maskable.png');
