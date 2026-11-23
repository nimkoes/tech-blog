import fs from 'fs';
import os from 'os';
import path from 'path';

const rootDir = process.cwd();

// 빌드하는 기기(로컬 macOS, 배포 ubuntu)의 시스템 폰트와 상관없이 같은 결과가 나오도록
// sharp(librsvg) 가 저장소에 설치된 Pretendard 만 보게 한다. sharp 를 불러오기 전에 설정해야 한다.
const fontDir = path.join(rootDir, 'node_modules/pretendard/dist/public/static');
const fontConfigDir = fs.mkdtempSync(path.join(os.tmpdir(), 'og-fontconfig-'));
const fontConfigFile = path.join(fontConfigDir, 'fonts.conf');
fs.writeFileSync(
  fontConfigFile,
  `<?xml version="1.0"?><!DOCTYPE fontconfig SYSTEM "fonts.dtd"><fontconfig><dir>${fontDir}</dir><cachedir>${fontConfigDir}</cachedir></fontconfig>`
);
process.env.FONTCONFIG_FILE = fontConfigFile;
const { default: sharp } = await import('sharp');
const postIndex = JSON.parse(
  fs.readFileSync(path.join(rootDir, 'src/resources/post-index.json'), 'utf8')
);
const outputDir = path.join(rootDir, 'public/og');
fs.mkdirSync(outputDir, { recursive: true });

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function wrapText(value, maxLength = 24, maxLines = 3) {
  const words = String(value).split(/\s+/).filter(Boolean);
  const lines = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxLength || !current) {
      current = candidate;
      continue;
    }
    lines.push(current);
    current = word;
    if (lines.length === maxLines - 1) break;
  }
  if (current && lines.length < maxLines) lines.push(current);
  const consumed = lines.join(' ').length;
  if (consumed < String(value).length && lines.length > 0) {
    lines[lines.length - 1] = `${lines[lines.length - 1].replace(/[.…]+$/, '')}…`;
  }
  return lines;
}

for (const post of postIndex) {
  const titleLines = wrapText(post.title);
  const tags = post.tags.slice(0, 4).map(tag => `#${tag}`).join('  ');
  const titleSvg = titleLines
    .map((line, index) => `<text x="72" y="${205 + index * 78}" class="title">${escapeXml(line)}</text>`)
    .join('');
  const svg = `
    <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#0f172a"/>
          <stop offset="0.55" stop-color="#111827"/>
          <stop offset="1" stop-color="#172554"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="630" fill="url(#bg)"/>
      <circle cx="1080" cy="80" r="220" fill="#0ea5e9" opacity="0.12"/>
      <circle cx="1050" cy="580" r="280" fill="#6366f1" opacity="0.1"/>
      <style>
        text { font-family: 'Pretendard', sans-serif; }
        .brand { fill: #7dd3fc; font-size: 28px; font-weight: 700; letter-spacing: 3px; }
        .title { fill: #f8fafc; font-size: 62px; font-weight: 750; }
        .meta { fill: #cbd5e1; font-size: 25px; }
        .tags { fill: #93c5fd; font-size: 23px; }
      </style>
      <text x="72" y="82" class="brand">NIMKOES TECH BLOG</text>
      ${titleSvg}
      <text x="72" y="520" class="tags">${escapeXml(tags)}</text>
      <text x="72" y="576" class="meta">약 ${post.readingTime}분 · ${escapeXml(post.lastModifiedDate)} 업데이트</text>
    </svg>`;

  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(
    path.join(outputDir, `${post.fileName}.png`)
  );
}

console.log(`Open Graph images generated. images=${postIndex.length}`);
