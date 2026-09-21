const WIDTH = 1200;
const HEIGHT = 630;

type RGB = [number, number, number];

const ACCENTS: RGB[] = [
  [188, 167, 255],
  [200, 255, 61],
  [67, 245, 255],
  [255, 111, 125],
  [255, 119, 168],
];

const FONT: Record<string, number[]> = {
  ' ': [0, 0, 0, 0, 0, 0, 0],
  '%': [17, 2, 4, 8, 17, 0, 0],
  '-': [0, 0, 0, 31, 0, 0, 0],
  '0': [14, 17, 19, 21, 25, 17, 14],
  '1': [4, 12, 4, 4, 4, 4, 14],
  '2': [14, 17, 1, 2, 4, 8, 31],
  '3': [30, 1, 1, 14, 1, 1, 30],
  '4': [2, 6, 10, 18, 31, 2, 2],
  '5': [31, 16, 16, 30, 1, 1, 30],
  '6': [14, 16, 16, 30, 17, 17, 14],
  '7': [31, 1, 2, 4, 8, 8, 8],
  '8': [14, 17, 17, 14, 17, 17, 14],
  '9': [14, 17, 17, 15, 1, 1, 14],
  A: [14, 17, 17, 31, 17, 17, 17],
  B: [30, 17, 17, 30, 17, 17, 30],
  C: [14, 17, 16, 16, 16, 17, 14],
  D: [30, 17, 17, 17, 17, 17, 30],
  E: [31, 16, 16, 30, 16, 16, 31],
  F: [31, 16, 16, 30, 16, 16, 16],
  G: [14, 17, 16, 23, 17, 17, 15],
  H: [17, 17, 17, 31, 17, 17, 17],
  I: [14, 4, 4, 4, 4, 4, 14],
  J: [7, 2, 2, 2, 2, 18, 12],
  K: [17, 18, 20, 24, 20, 18, 17],
  L: [16, 16, 16, 16, 16, 16, 31],
  M: [17, 27, 21, 21, 17, 17, 17],
  N: [17, 25, 21, 19, 17, 17, 17],
  O: [14, 17, 17, 17, 17, 17, 14],
  P: [30, 17, 17, 30, 16, 16, 16],
  Q: [14, 17, 17, 17, 21, 18, 13],
  R: [30, 17, 17, 30, 20, 18, 17],
  S: [15, 16, 16, 14, 1, 1, 30],
  T: [31, 4, 4, 4, 4, 4, 4],
  U: [17, 17, 17, 17, 17, 17, 14],
  V: [17, 17, 17, 17, 17, 10, 4],
  W: [17, 17, 17, 21, 21, 21, 10],
  X: [17, 17, 10, 4, 10, 17, 17],
  Y: [17, 17, 10, 4, 4, 4, 4],
  Z: [31, 1, 2, 4, 8, 16, 31],
};

function mixWithBlack(color: RGB, ratio: number): RGB {
  return color.map(channel => Math.round(channel * ratio)) as RGB;
}

function dominantAccent(scores: number[]) {
  const dominantIndex = scores.reduce((best, score, index) => score > scores[best] ? index : best, 0);
  return ACCENTS[dominantIndex];
}

function setPixel(raw: Uint8Array, x: number, y: number, paletteIndex: number) {
  if (x < 0 || x >= WIDTH || y < 0 || y >= HEIGHT) return;
  raw[y * (WIDTH + 1) + 1 + x] = paletteIndex;
}

function fillRect(raw: Uint8Array, x: number, y: number, width: number, height: number, paletteIndex: number) {
  const left = Math.max(0, x);
  const right = Math.min(WIDTH, x + width);
  const top = Math.max(0, y);
  const bottom = Math.min(HEIGHT, y + height);
  for (let py = top; py < bottom; py += 1) {
    raw.fill(paletteIndex, py * (WIDTH + 1) + 1 + left, py * (WIDTH + 1) + 1 + right);
  }
}

function fillCircle(raw: Uint8Array, centerX: number, centerY: number, radius: number, paletteIndex: number) {
  for (let y = -radius; y <= radius; y += 1) {
    const halfWidth = Math.floor(Math.sqrt(radius * radius - y * y));
    fillRect(raw, centerX - halfWidth, centerY + y, halfWidth * 2, 1, paletteIndex);
  }
}

function textWidth(value: string, scale: number) {
  return Math.max(0, value.length * 6 * scale - scale);
}

function drawText(raw: Uint8Array, value: string, centerX: number, y: number, scale: number, paletteIndex: number) {
  let cursorX = Math.round(centerX - textWidth(value, scale) / 2);
  for (const character of value.toUpperCase()) {
    const glyph = FONT[character] || FONT[' '];
    glyph.forEach((row, rowIndex) => {
      for (let column = 0; column < 5; column += 1) {
        if ((row & (1 << (4 - column))) !== 0) {
          fillRect(raw, cursorX + column * scale, y + rowIndex * scale, scale, scale, paletteIndex);
        }
      }
    });
    cursorX += 6 * scale;
  }
}

function concat(parts: Uint8Array[]) {
  const output = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
  let offset = 0;
  for (const part of parts) {
    output.set(part, offset);
    offset += part.length;
  }
  return output;
}

function uint32(value: number) {
  return new Uint8Array([(value >>> 24) & 255, (value >>> 16) & 255, (value >>> 8) & 255, value & 255]);
}

function crc32(data: Uint8Array) {
  let crc = 0xffffffff;
  for (const byte of data) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type: string, data: Uint8Array) {
  const typeBytes = new TextEncoder().encode(type);
  return concat([uint32(data.length), typeBytes, data, uint32(crc32(concat([typeBytes, data])))]);
}

function adler32(data: Uint8Array) {
  let a = 1;
  let b = 0;
  for (const byte of data) {
    a = (a + byte) % 65521;
    b = (b + a) % 65521;
  }
  return ((b << 16) | a) >>> 0;
}

function storeZlib(data: Uint8Array) {
  const parts: Uint8Array[] = [new Uint8Array([0x78, 0x01])];
  let offset = 0;
  while (offset < data.length) {
    const length = Math.min(65535, data.length - offset);
    const final = offset + length >= data.length ? 1 : 0;
    const inverse = (~length) & 0xffff;
    parts.push(new Uint8Array([final, length & 255, (length >>> 8) & 255, inverse & 255, (inverse >>> 8) & 255]));
    parts.push(data.subarray(offset, offset + length));
    offset += length;
  }
  parts.push(uint32(adler32(data)));
  return concat(parts);
}

interface PersonalOgResult {
  genreName: string;
  typeTitle: string;
  compatibility: number;
}

export function createOgPng(hostScores: number[], matchScore?: number | null, personalResult?: PersonalOgResult) {
  const accent = dominantAccent(hostScores);
  const palette: RGB[] = [
    [6, 7, 9],
    [11, 12, 16],
    [31, 33, 40],
    [112, 115, 126],
    [247, 247, 244],
    accent,
    [67, 245, 255],
    mixWithBlack(accent, 0.2),
  ];
  const raw = new Uint8Array((WIDTH + 1) * HEIGHT);
  for (let y = 0; y < HEIGHT; y += 1) {
    raw[y * (WIDTH + 1)] = 0;
    raw.fill(y > 470 ? 1 : 0, y * (WIDTH + 1) + 1, (y + 1) * (WIDTH + 1));
  }

  fillCircle(raw, 1040, 80, 235, 7);
  fillCircle(raw, 130, 620, 190, 2);
  for (let y = 58; y < HEIGHT - 40; y += 26) {
    for (let x = 58; x < WIDTH - 40; x += 26) setPixel(raw, x, y, 2);
  }
  fillRect(raw, 40, 40, WIDTH - 80, 2, 2);
  fillRect(raw, 40, HEIGHT - 42, WIDTH - 80, 2, 2);
  fillRect(raw, 40, 40, 2, HEIGHT - 80, 2);
  fillRect(raw, WIDTH - 42, 40, 2, HEIGHT - 80, 2);

  drawText(raw, 'MUSIC PERSONALITY', 265, 82, 4, 4);
  drawText(raw, personalResult ? 'MY MUSIC TYPE' : matchScore === null || matchScore === undefined ? 'FRIEND INVITE' : 'OUR MUSIC MATCH', 930, 84, 3, 3);

  if (personalResult) {
    const titleScale = Math.min(10, Math.max(4, Math.floor(1030 / Math.max(1, personalResult.typeTitle.length * 6))));
    const genreScale = Math.min(7, Math.max(4, Math.floor(880 / Math.max(1, personalResult.genreName.length * 6))));
    drawText(raw, 'MY MUSIC PERSONALITY', WIDTH / 2, 174, 4, 3);
    drawText(raw, personalResult.typeTitle, WIDTH / 2, 238, titleScale, 5);
    drawText(raw, personalResult.genreName, WIDTH / 2, 342, genreScale, 3);
    drawText(raw, `${personalResult.compatibility}% GENRE MATCH`, WIDTH / 2, 422, 6, 4);
    drawText(raw, 'WHAT IS YOUR MUSIC TYPE', WIDTH / 2, 502, 4, 3);
  } else if (matchScore === null || matchScore === undefined) {
    drawText(raw, 'A FRIEND INVITED YOU', WIDTH / 2, 226, 5, 3);
    drawText(raw, 'JOIN', WIDTH / 2, 302, 19, 5);
    drawText(raw, 'COMPARE YOUR MUSIC TASTE', WIDTH / 2, 478, 4, 4);
  } else {
    drawText(raw, 'TASTE COMPATIBILITY', WIDTH / 2, 196, 4, 3);
    drawText(raw, `${matchScore}%`, WIDTH / 2, 264, 20, 5);
    drawText(raw, matchScore >= 88 ? 'ALMOST THE SAME PLAYLIST' : matchScore >= 74 ? 'BETTER TOGETHER' : matchScore >= 60 ? 'FAMILIAR AND NEW' : 'DISCOVER NEW TASTES', WIDTH / 2, 455, 4, 4);
  }
  drawText(raw, 'BY CHAMELEONS', 942, 548, 3, 3);

  const ihdr = new Uint8Array(13);
  ihdr.set(uint32(WIDTH), 0);
  ihdr.set(uint32(HEIGHT), 4);
  ihdr[8] = 8;
  ihdr[9] = 3;
  const plte = new Uint8Array(palette.flat());
  return concat([
    new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk('IHDR', ihdr),
    pngChunk('PLTE', plte),
    pngChunk('IDAT', storeZlib(raw)),
    pngChunk('IEND', new Uint8Array()),
  ]);
}
