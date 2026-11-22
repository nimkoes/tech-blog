import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const rootDir = process.cwd();
const categoryPath = path.join(rootDir, 'src/resources/category.json');
const resourcesDir = path.join(rootDir, 'public/resources');
const postIndexPath = path.join(rootDir, 'src/resources/post-index.json');
const searchIndexPath = path.join(rootDir, 'public/search-index.json');

const categoryData = JSON.parse(fs.readFileSync(categoryPath, 'utf8'));
const posts = [];

function collect(node) {
  if (node.fileName) {
    posts.push(node);
  }
  node.children?.forEach(collect);
}

categoryData.forEach(collect);

function stripMarkdown(markdown) {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[([^\]]*)]\([^)]+\)/g, ' $1 ')
    .replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
    .replace(/^\s{0,3}#{1,6}\s+/gm, ' ')
    .replace(/^\s*([-*_])\1{2,}\s*$/gm, ' ')
    .replace(/^\s*[-*+]\s+/gm, ' ')
    .replace(/^\s*\d+\.\s+/gm, ' ')
    .replace(/^\s*>\s?/gm, ' ')
    .replace(/[`*_~|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function createDescription(content) {
  const prose = content
    .replace(/```[\s\S]*?```/g, ' ')
    .split(/\n\s*\n/)
    .map(block => block.trim())
    .filter(block => block && !/^(#{1,6}|!\[|[-*_]{3,}|[-*+]\s|\d+\.\s|\||<)/.test(block))
    .join(' ');
  const plainText = stripMarkdown(prose || content);
  const maxLength = 240;
  if (plainText.length <= maxLength) return plainText;

  const candidate = plainText.slice(0, maxLength);
  const sentenceEnd = Math.max(
    candidate.lastIndexOf('. '),
    candidate.lastIndexOf('다. '),
    candidate.lastIndexOf('요. '),
    candidate.lastIndexOf('! '),
    candidate.lastIndexOf('? ')
  );

  if (sentenceEnd >= 100) {
    return candidate.slice(0, sentenceEnd + 1).trim();
  }

  return `${candidate.trimEnd()}…`;
}

function getReadingTime(content) {
  const plainText = stripMarkdown(content);
  return Math.max(1, Math.ceil(plainText.length / 500));
}

function getHeadings(content) {
  return Array.from(content.matchAll(/^#{1,4}\s+(.+)$/gm), match =>
    match[1].replace(/[`*_~]/g, '').trim()
  );
}

const postIndex = [];
const searchIndex = [];
const refreshDescriptions = process.argv.includes('--refresh-descriptions');
const indexOnly = process.argv.includes('--index-only');

for (const post of posts) {
  const filePath = path.join(resourcesDir, `${post.fileName}.md`);
  const parsed = matter(fs.readFileSync(filePath, 'utf8'));
  const existing = parsed.data;
  const description = String(
    refreshDescriptions ? createDescription(parsed.content) : existing.description || createDescription(parsed.content)
  );
  const status = String(
    existing.status || (post.lastModifiedDate < '2024-01-01' ? 'needs-review' : 'published')
  );
  const readingTime = getReadingTime(parsed.content);
  const metadata = {
    title: String(existing.title || post.displayName),
    description,
    publishedAt: String(existing.publishedAt || existing.date || post.regDate),
    updatedAt: String(existing.updatedAt || post.lastModifiedDate),
    tags: Array.isArray(existing.tags) ? existing.tags : post.tags,
    status,
    ...(existing.reviewedAt ? { reviewedAt: String(existing.reviewedAt) } : {}),
    ...(Array.isArray(existing.sources) && existing.sources.length > 0
      ? { sources: existing.sources }
      : {}),
  };

  if (!indexOnly) {
    fs.writeFileSync(filePath, matter.stringify(parsed.content.trimStart(), metadata));
  }

  postIndex.push({
    title: metadata.title,
    description,
    tags: metadata.tags,
    fileName: post.fileName,
    regDate: metadata.publishedAt,
    lastModifiedDate: metadata.updatedAt,
    status,
    reviewedAt: metadata.reviewedAt || null,
    readingTime,
  });

  searchIndex.push({
    slug: post.fileName,
    title: metadata.title,
    description,
    tags: metadata.tags,
    headings: getHeadings(parsed.content),
    content: stripMarkdown(parsed.content),
    updatedAt: metadata.updatedAt,
  });
}

postIndex.sort(
  (a, b) =>
    b.lastModifiedDate.localeCompare(a.lastModifiedDate) || b.fileName.localeCompare(a.fileName)
);

fs.writeFileSync(postIndexPath, `${JSON.stringify(postIndex, null, 2)}\n`);
fs.writeFileSync(searchIndexPath, `${JSON.stringify(searchIndex)}\n`);

console.log(
  `Content metadata migrated. posts=${postIndex.length}, searchIndex=${searchIndex.length}`
);
