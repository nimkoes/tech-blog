import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();
const imageRoot = path.join(rootDir, 'public/resources/images');
const outputPath = path.join(rootDir, 'src/resources/image-metadata.json');

function readPngSize(buffer) {
  if (buffer.toString('ascii', 1, 4) !== 'PNG') return null;
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

function readGifSize(buffer) {
  if (!buffer.toString('ascii', 0, 3).startsWith('GIF')) return null;
  return { width: buffer.readUInt16LE(6), height: buffer.readUInt16LE(8) };
}

function readJpegSize(buffer) {
  if (buffer[0] !== 0xff || buffer[1] !== 0xd8) return null;
  let offset = 2;
  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = buffer[offset + 1];
    const length = buffer.readUInt16BE(offset + 2);
    if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
      return { width: buffer.readUInt16BE(offset + 7), height: buffer.readUInt16BE(offset + 5) };
    }
    if (!length) break;
    offset += length + 2;
  }
  return null;
}

function collectFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const absolutePath = path.join(directory, entry.name);
    return entry.isDirectory() ? collectFiles(absolutePath) : [absolutePath];
  });
}

const metadata = {};
for (const filePath of collectFiles(imageRoot)) {
  const extension = path.extname(filePath).toLowerCase();
  if (!['.png', '.jpg', '.jpeg', '.gif'].includes(extension)) continue;
  const buffer = fs.readFileSync(filePath);
  const size = extension === '.png'
    ? readPngSize(buffer)
    : extension === '.gif'
      ? readGifSize(buffer)
      : readJpegSize(buffer);
  if (!size) continue;
  const relativePath = path.relative(path.join(rootDir, 'public'), filePath).split(path.sep).join('/');
  metadata[`/tech-blog/${relativePath}`] = size;
}

fs.writeFileSync(outputPath, `${JSON.stringify(metadata, null, 2)}\n`);
console.log(`Image metadata generated. images=${Object.keys(metadata).length}`);
