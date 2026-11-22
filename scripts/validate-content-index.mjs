import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const ROOT_DIR = process.cwd();
const CATEGORY_PATH = path.join(ROOT_DIR, 'src/resources/category.json');
const RESOURCES_DIR = path.join(ROOT_DIR, 'public/resources');

const categoryData = JSON.parse(fs.readFileSync(CATEGORY_PATH, 'utf8'));
const markdownSlugs = fs
  .readdirSync(RESOURCES_DIR)
  .filter(file => file.endsWith('.md'))
  .map(file => file.replace('.md', ''));

const categoryPosts = [];
const errors = [];
const allowedStatuses = new Set(['published', 'needs-review', 'deprecated']);

function walk(node, trail = []) {
  const currentTrail = [...trail, node.displayName || node.id || '(unknown)'];
  const pathLabel = currentTrail.join(' > ');

  if (node.fileName) {
    categoryPosts.push(node.fileName);

    if (!Array.isArray(node.tags) || node.tags.length === 0) {
      errors.push(`[missing tags] ${pathLabel} (${node.fileName})`);
    }

    if (!node.regDate) {
      errors.push(`[missing regDate] ${pathLabel} (${node.fileName})`);
    }

    if (!node.lastModifiedDate) {
      errors.push(`[missing lastModifiedDate] ${pathLabel} (${node.fileName})`);
    }
  }

  if (Array.isArray(node.children)) {
    node.children.forEach(child => walk(child, currentTrail));
  }
}

categoryData.forEach(node => walk(node));

const categoryCountBySlug = new Map();
categoryPosts.forEach(slug => {
  categoryCountBySlug.set(slug, (categoryCountBySlug.get(slug) || 0) + 1);
});

const duplicateCategorySlugs = [...categoryCountBySlug.entries()]
  .filter(([, count]) => count > 1)
  .map(([slug]) => slug);

if (duplicateCategorySlugs.length > 0) {
  errors.push(`[duplicate category slug] ${duplicateCategorySlugs.join(', ')}`);
}

const markdownCountBySlug = new Map();
markdownSlugs.forEach(slug => {
  markdownCountBySlug.set(slug, (markdownCountBySlug.get(slug) || 0) + 1);
});

const duplicateMarkdownSlugs = [...markdownCountBySlug.entries()]
  .filter(([, count]) => count > 1)
  .map(([slug]) => slug);

if (duplicateMarkdownSlugs.length > 0) {
  errors.push(`[duplicate markdown slug] ${duplicateMarkdownSlugs.join(', ')}`);
}

const categorySet = new Set(categoryPosts);
const markdownSet = new Set(markdownSlugs);

const missingMarkdown = categoryPosts.filter(slug => !markdownSet.has(slug));
const missingCategory = markdownSlugs.filter(slug => !categorySet.has(slug));

if (missingMarkdown.length > 0) {
  errors.push(`[missing markdown file] ${missingMarkdown.join(', ')}`);
}

if (missingCategory.length > 0) {
  errors.push(`[missing category entry] ${missingCategory.join(', ')}`);
}

for (const slug of markdownSlugs) {
  const filePath = path.join(RESOURCES_DIR, `${slug}.md`);
  const parsed = matter(fs.readFileSync(filePath, 'utf8'));
  const data = parsed.data;

  for (const key of ['title', 'description', 'publishedAt', 'updatedAt', 'tags', 'status']) {
    if (!data[key] || (Array.isArray(data[key]) && data[key].length === 0)) {
      errors.push(`[missing frontmatter ${key}] ${slug}`);
    }
  }

  if (data.status && !allowedStatuses.has(String(data.status))) {
    errors.push(`[invalid status] ${slug}: ${data.status}`);
  }

  for (const match of parsed.content.matchAll(/!\[[^\]]*]\(([^)\s]+)[^)]*\)/g)) {
    const imageUrl = match[1];
    if (!imageUrl.startsWith('/tech-blog/')) continue;
    const publicPath = path.join(ROOT_DIR, 'public', imageUrl.replace(/^\/tech-blog\//, ''));
    if (!fs.existsSync(publicPath)) {
      errors.push(`[missing local image] ${slug}: ${imageUrl}`);
    }
  }
}

if (errors.length > 0) {
  console.error('Content index validation failed.');
  errors.forEach(error => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Content index validation passed. category=${categoryPosts.length}, markdown=${markdownSlugs.length}`);
