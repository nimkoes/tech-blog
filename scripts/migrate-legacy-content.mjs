import fs from 'fs';
import path from 'path';
import * as parse5 from 'parse5';

const ROOT_DIR = process.cwd();
const LEGACY_ROOT = path.join(ROOT_DIR, 'migration', 'xxxelppa-1-1');
const CATEGORY_PATH = path.join(ROOT_DIR, 'src', 'resources', 'category.json');
const MARKDOWN_DIR = path.join(ROOT_DIR, 'public', 'resources');
const IMAGE_ROOT = path.join(MARKDOWN_DIR, 'images', 'migration');
const BASE_IMAGE_URL = '/tech-blog/resources/images/migration';

const BLOCK_TAGS = new Set([
  'article',
  'aside',
  'blockquote',
  'div',
  'figure',
  'figcaption',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hr',
  'li',
  'main',
  'ol',
  'p',
  'pre',
  'section',
  'table',
  'thead',
  'tbody',
  'tr',
  'th',
  'td',
  'ul',
]);

const TOPIC_ORDER = {
  java: 0,
  go: 1,
  javascript: 2,
  기타: 3,
};

const LANGUAGE_ALIASES = {
  js: 'javascript',
  jsx: 'javascript',
  ts: 'typescript',
  tsx: 'typescript',
  yml: 'yaml',
  sh: 'bash',
  shell: 'bash',
  zsh: 'bash',
  csharp: 'cs',
  'c#': 'cs',
  cpp: 'c++',
  cxx: 'c++',
};

function ensureDirectory(directoryPath) {
  fs.mkdirSync(directoryPath, { recursive: true });
}

function normalizeText(rawText) {
  return String(rawText || '')
    .replace(/\u00a0/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function toDateOnly(rawDateText) {
  const matched = String(rawDateText || '').match(/(\d{4}-\d{2}-\d{2})/);
  return matched ? matched[1] : '';
}

function truncateByChars(value, maxChars) {
  return Array.from(value).slice(0, maxChars).join('');
}

function sanitizeSlugPart(rawValue) {
  const normalized = String(rawValue || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/["'`’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '');

  return truncateByChars(normalized, 72);
}

function getAttribute(node, attributeName) {
  if (!node?.attrs) return '';
  const found = node.attrs.find(attr => attr.name === attributeName);
  return found?.value || '';
}

function setAttribute(node, attributeName, value) {
  if (!node.attrs) {
    node.attrs = [];
  }

  const found = node.attrs.find(attr => attr.name === attributeName);
  if (found) {
    found.value = value;
    return;
  }

  node.attrs.push({ name: attributeName, value });
}

function hasClass(node, className) {
  const classValue = getAttribute(node, 'class');
  if (!classValue) return false;
  return classValue
    .split(/\s+/)
    .filter(Boolean)
    .includes(className);
}

function walk(node, visit) {
  visit(node);
  if (Array.isArray(node?.childNodes)) {
    node.childNodes.forEach(child => walk(child, visit));
  }
}

function findFirst(node, predicate) {
  if (predicate(node)) {
    return node;
  }

  if (!Array.isArray(node?.childNodes)) {
    return null;
  }

  for (const child of node.childNodes) {
    const found = findFirst(child, predicate);
    if (found) return found;
  }

  return null;
}

function findFirstByTag(node, tagName) {
  const normalizedTag = String(tagName || '').toLowerCase();
  return findFirst(node, candidate => String(candidate?.tagName || '').toLowerCase() === normalizedTag);
}

function extractText(node) {
  if (!node) return '';

  if (node.nodeName === '#text') {
    return String(node.value || '');
  }

  if (String(node?.tagName || '').toLowerCase() === 'br') {
    return '\n';
  }

  if (!Array.isArray(node.childNodes)) {
    return '';
  }

  return node.childNodes.map(child => extractText(child)).join('');
}

function collectLegacyEntries() {
  const directories = fs
    .readdirSync(LEGACY_ROOT, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name);

  const entries = [];
  directories.forEach(directoryName => {
    const directoryPath = path.join(LEGACY_ROOT, directoryName);
    const htmlFileName = fs
      .readdirSync(directoryPath)
      .find(fileName => fileName.toLowerCase().endsWith('.html'));

    if (!htmlFileName) {
      return;
    }

    entries.push({
      sourceId: Number.parseInt(directoryName, 10),
      sourceDirectory: directoryPath,
      htmlPath: path.join(directoryPath, htmlFileName),
      sourceFileName: htmlFileName,
      sourceBaseName: path.basename(htmlFileName, '.html'),
    });
  });

  return entries
    .filter(entry => Number.isFinite(entry.sourceId))
    .sort((a, b) => a.sourceId - b.sourceId);
}

function isMigratedSlug(slug, sourceIdSet) {
  if (/-legacy-\d+$/.test(String(slug || ''))) {
    return true;
  }

  const matched = String(slug || '').match(/^\d{4}-(\d{2,3})-/);
  if (!matched) return false;

  const sourceId = Number.parseInt(matched[1], 10);
  return sourceIdSet.has(sourceId);
}

function cleanupGeneratedResources(sourceIdSet) {
  const markdownFiles = fs
    .readdirSync(MARKDOWN_DIR)
    .filter(fileName => fileName.toLowerCase().endsWith('.md'));

  markdownFiles.forEach(fileName => {
    const slug = fileName.slice(0, -3);
    if (isMigratedSlug(slug, sourceIdSet)) {
      fs.rmSync(path.join(MARKDOWN_DIR, fileName), { force: true });
    }
  });

  fs.rmSync(IMAGE_ROOT, { recursive: true, force: true });
  ensureDirectory(IMAGE_ROOT);
}

function resetGeneratedCategories(rootNode) {
  if (!Array.isArray(rootNode.children)) {
    rootNode.children = [];
    return;
  }

  rootNode.children = rootNode.children.filter(child => {
    const topId = Number.parseInt(String(child.id || '').split('-')[0], 10);
    if (!Number.isFinite(topId)) {
      return true;
    }
    return topId < 90;
  });
}

function sanitizeElementAttributes(node) {
  if (!node?.tagName || !Array.isArray(node.attrs)) {
    return;
  }

  const tagName = String(node.tagName).toLowerCase();
  const allowedByTag = {
    a: new Set(['href']),
    img: new Set(['src', 'alt', 'title']),
    pre: new Set(['class', 'data-ke-language']),
    code: new Set(['class']),
  };

  const allowed = allowedByTag[tagName] ?? new Set();

  node.attrs = node.attrs.filter(attr => {
    if (attr.name.startsWith('on')) return false;
    return allowed.has(attr.name);
  });

  if (tagName === 'a') {
    const href = getAttribute(node, 'href').trim();
    if (!href || /^javascript:/i.test(href)) {
      node.attrs = [];
      return;
    }
    setAttribute(node, 'href', href);
  }
}

function pruneUnsafeNodes(node) {
  if (!Array.isArray(node?.childNodes)) {
    return;
  }

  node.childNodes = node.childNodes.filter(child => {
    const tagName = String(child?.tagName || '').toLowerCase();
    if (!tagName) return true;
    return tagName !== 'script' && tagName !== 'style' && tagName !== 'iframe';
  });

  node.childNodes.forEach(child => pruneUnsafeNodes(child));
}

function rewriteAndCopyImages(fragment, context) {
  const imageSourceToOutput = new Map();
  let imageIndex = 0;

  function resolveLegacyImagePath(rawSource) {
    const decoded = decodeURIComponent(rawSource).replace(/\\/g, '/');
    const relativeSource = decoded.replace(/^\.\//, '');
    return path.resolve(context.sourceDirectory, relativeSource);
  }

  walk(fragment, node => {
    if (String(node?.tagName || '').toLowerCase() !== 'img') return;

    const source = getAttribute(node, 'src').trim();
    if (!source) return;
    if (/^https?:\/\//i.test(source)) return;
    if (/^\/\//.test(source)) return;
    if (source.startsWith('/')) return;

    if (!imageSourceToOutput.has(source)) {
      const absoluteSourcePath = resolveLegacyImagePath(source);
      if (!fs.existsSync(absoluteSourcePath)) {
        return;
      }

      imageIndex += 1;
      const extension = path.extname(absoluteSourcePath).toLowerCase() || '.png';
      const outputFileName = `img-${String(imageIndex).padStart(2, '0')}${extension}`;
      const outputDirectory = path.join(IMAGE_ROOT, context.slug);
      ensureDirectory(outputDirectory);

      const absoluteOutputPath = path.join(outputDirectory, outputFileName);
      fs.copyFileSync(absoluteSourcePath, absoluteOutputPath);
      imageSourceToOutput.set(source, `${BASE_IMAGE_URL}/${context.slug}/${outputFileName}`);
    }

    const replacedSource = imageSourceToOutput.get(source);
    if (!replacedSource) {
      return;
    }

    setAttribute(node, 'src', replacedSource);

    if (!getAttribute(node, 'alt')) {
      const fileLabel = path.basename(replacedSource);
      setAttribute(node, 'alt', `${context.slug}-${fileLabel}`);
    }
  });

  return imageSourceToOutput.size;
}

function normalizeInlineOutput(rawText) {
  return String(rawText || '')
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n');
}

function markdownCodeFence(codeText) {
  let fence = '```';
  while (codeText.includes(fence)) {
    fence += '`';
  }
  return fence;
}

function markdownInlineCode(value) {
  const codeText = String(value || '').replace(/\n+/g, ' ').trim();
  if (!codeText) return '';

  let fence = '`';
  while (codeText.includes(fence)) {
    fence += '`';
  }

  return `${fence}${codeText}${fence}`;
}

function detectCodeLanguage(preNode, codeNode) {
  const candidates = [
    getAttribute(preNode, 'data-ke-language'),
    getAttribute(preNode, 'class'),
    getAttribute(codeNode, 'class'),
  ].filter(Boolean);

  for (const candidate of candidates) {
    const languageMatch = candidate.match(/language-([a-z0-9#+.-]+)/i);
    if (languageMatch?.[1]) {
      const rawKey = languageMatch[1].toLowerCase();
      return LANGUAGE_ALIASES[rawKey] || rawKey;
    }

    const firstToken = candidate
      .split(/\s+/)
      .map(token => token.trim())
      .find(token => token && token.toLowerCase() !== 'hljs');

    if (firstToken && /^[a-z0-9#+.-]+$/i.test(firstToken)) {
      const rawKey = firstToken.toLowerCase();
      return LANGUAGE_ALIASES[rawKey] || rawKey;
    }
  }

  return '';
}

function renderInlineChildren(node, state = {}) {
  return (node.childNodes || []).map(child => renderInline(child, state)).join('');
}

function renderInline(node, state = {}) {
  if (!node) return '';

  if (node.nodeName === '#text') {
    return String(node.value || '').replace(/\u00a0/g, ' ');
  }

  const tagName = String(node.tagName || '').toLowerCase();

  if (!tagName) {
    return '';
  }

  if (tagName === 'br') {
    return '\n';
  }

  if (tagName === 'a') {
    const href = getAttribute(node, 'href').trim();
    const label = normalizeInlineOutput(renderInlineChildren(node, state)).trim();
    if (!href) return label;
    return `[${label || href}](${href})`;
  }

  if (tagName === 'img') {
    const src = getAttribute(node, 'src').trim();
    if (!src) return '';
    const alt = normalizeInlineOutput(getAttribute(node, 'alt')).trim();
    return `![${alt}](${src})`;
  }

  if (tagName === 'strong' || tagName === 'b') {
    const content = normalizeInlineOutput(renderInlineChildren(node, state)).trim();
    return content ? `**${content}**` : '';
  }

  if (tagName === 'em' || tagName === 'i') {
    const content = normalizeInlineOutput(renderInlineChildren(node, state)).trim();
    return content ? `*${content}*` : '';
  }

  if (tagName === 'code' && !state.inPre) {
    return markdownInlineCode(extractText(node));
  }

  if (tagName === 'pre') {
    return renderPre(node);
  }

  if (tagName === 'figure') {
    return renderFigure(node);
  }

  if (tagName === 'table') {
    return renderTable(node);
  }

  return renderInlineChildren(node, state);
}

function renderPre(node) {
  const codeNode = findFirstByTag(node, 'code');
  const codeText = extractText(codeNode || node)
    .replace(/\u00a0/g, ' ')
    .replace(/\r\n/g, '\n')
    .replace(/^\n+|\n+$/g, '');

  if (!codeText.trim()) {
    return '';
  }

  const language = detectCodeLanguage(node, codeNode);
  const fence = markdownCodeFence(codeText);
  const languageSuffix = language || '';

  return `${fence}${languageSuffix}\n${codeText}\n${fence}\n\n`;
}

function renderHeading(node, level) {
  const content = normalizeInlineOutput(renderInlineChildren(node)).trim();
  if (!content) return '';
  return `${'#'.repeat(level)} ${content}\n\n`;
}

function renderParagraph(node) {
  const hasBlockChild = (node.childNodes || []).some(child => {
    const tag = String(child?.tagName || '').toLowerCase();
    return BLOCK_TAGS.has(tag) && tag !== 'span';
  });

  if (hasBlockChild) {
    return renderChildrenAsBlocks(node.childNodes || []);
  }

  const content = normalizeInlineOutput(renderInlineChildren(node)).trim();
  if (!content) return '';
  return `${content}\n\n`;
}

function renderListItem(node, marker, depth) {
  const inlineParts = [];
  const nestedParts = [];

  (node.childNodes || []).forEach(child => {
    const tag = String(child?.tagName || '').toLowerCase();
    if (tag === 'ul' || tag === 'ol') {
      nestedParts.push(renderList(child, tag === 'ol', depth + 1));
      return;
    }

    if (BLOCK_TAGS.has(tag) && tag !== 'span' && tag !== 'a' && tag !== 'strong' && tag !== 'em' && tag !== 'code') {
      inlineParts.push(renderBlock(child, depth));
      return;
    }

    inlineParts.push(renderInline(child));
  });

  const text = normalizeInlineOutput(inlineParts.join(''))
    .replace(/\n+/g, ' ')
    .trim();

  let result = `${'  '.repeat(depth)}${marker} ${text}`.trimEnd() + '\n';
  nestedParts.forEach(part => {
    if (part.trim()) {
      result += part;
    }
  });

  return result;
}

function renderList(node, ordered, depth = 0) {
  const items = (node.childNodes || []).filter(child => String(child?.tagName || '').toLowerCase() === 'li');
  if (items.length === 0) return '';

  let result = '';
  let index = 1;

  items.forEach(itemNode => {
    const marker = ordered ? `${index}.` : '-';
    result += renderListItem(itemNode, marker, depth);
    index += 1;
  });

  return `${result}\n`;
}

function renderBlockquote(node) {
  const inner = renderChildrenAsBlocks(node.childNodes || []).trim() ||
    normalizeInlineOutput(renderInlineChildren(node)).trim();

  if (!inner) return '';

  const lines = inner
    .split('\n')
    .map(line => line.trim())
    .filter((line, index, array) => !(line === '' && array[index - 1] === ''));

  const quoted = lines.map(line => (line ? `> ${line}` : '>')).join('\n');
  return `${quoted}\n\n`;
}

function renderFigure(node) {
  const imageNode = findFirstByTag(node, 'img');
  if (!imageNode) {
    return renderChildrenAsBlocks(node.childNodes || []);
  }

  const imageMarkdown = renderInline(imageNode).trim();
  const captionNode = findFirstByTag(node, 'figcaption');
  const caption = captionNode
    ? normalizeInlineOutput(renderInlineChildren(captionNode)).trim()
    : '';

  if (!imageMarkdown) return '';

  if (caption) {
    return `${imageMarkdown}\n*${caption}*\n\n`;
  }

  return `${imageMarkdown}\n\n`;
}

function renderTable(node) {
  const serialized = parse5.serializeOuter(node).trim();
  if (!serialized) return '';
  return `${serialized}\n\n`;
}

function renderChildrenAsBlocks(nodes, depth = 0) {
  return nodes.map(node => renderBlock(node, depth)).join('');
}

function renderBlock(node, depth = 0) {
  if (!node) return '';

  if (node.nodeName === '#text') {
    const content = normalizeInlineOutput(String(node.value || '')).trim();
    return content ? `${content}\n\n` : '';
  }

  const tagName = String(node.tagName || '').toLowerCase();

  if (!tagName) {
    return '';
  }

  if (tagName === 'p') return renderParagraph(node);
  if (tagName === 'pre') return renderPre(node);
  if (tagName === 'h1') return renderHeading(node, 1);
  if (tagName === 'h2') return renderHeading(node, 2);
  if (tagName === 'h3') return renderHeading(node, 3);
  if (tagName === 'h4') return renderHeading(node, 4);
  if (tagName === 'h5') return renderHeading(node, 5);
  if (tagName === 'h6') return renderHeading(node, 6);
  if (tagName === 'ul') return renderList(node, false, depth);
  if (tagName === 'ol') return renderList(node, true, depth);
  if (tagName === 'blockquote') return renderBlockquote(node);
  if (tagName === 'figure') return renderFigure(node);
  if (tagName === 'table') return renderTable(node);
  if (tagName === 'hr') return '---\n\n';
  if (tagName === 'img') {
    const imageMarkdown = renderInline(node).trim();
    return imageMarkdown ? `${imageMarkdown}\n\n` : '';
  }

  if (tagName === 'li') {
    return renderListItem(node, '-', depth);
  }

  return renderChildrenAsBlocks(node.childNodes || [], depth);
}

function normalizeMarkdownOutput(rawMarkdown) {
  const normalized = String(rawMarkdown || '')
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n');

  const lines = normalized.split('\n').map(line => {
    const trimmed = line.trim();

    const decoratedHeading = trimmed.match(/^(#{1,6})\s+\*{1,3}\s*#?\s*(.+?)\s*\*{1,3}$/);
    if (decoratedHeading?.[1] && decoratedHeading[2]) {
      return `${decoratedHeading[1]} ${decoratedHeading[2].trim()}`;
    }

    const numberedHeading = trimmed.match(/^\*{1,3}\s*(\d+(?:-\d+)?\.\s*.+?)\s*\*{1,3}$/);
    if (numberedHeading?.[1]) {
      return `## ${numberedHeading[1].trim()}`;
    }

    const subSectionHeading = trimmed.match(/^\*{3}\s*(\d+(?:-\d+)?\s+.+?)\s*\*{3}$/);
    if (subSectionHeading?.[1]) {
      return `### ${subSectionHeading[1].trim()}`;
    }

    const simpleSectionHeading = trimmed.match(/^\*{2}\s*([^*]+?)\s*\*{2}$/);
    if (simpleSectionHeading?.[1]) {
      return `#### ${simpleSectionHeading[1].trim()}`;
    }

    if (/^>\s*\*{2,3}\s+[^*]+$/.test(trimmed)) {
      return line.replace(/^(\s*>\s*)\*+\s*/, '$1');
    }

    if (/^\*{2,3}[^*]+$/.test(trimmed)) {
      return line.replace(/^\*+/, '');
    }

    return line;
  });

  return lines
    .join('\n')
    .replace(/레거시\s*라기보다/g, '기존 시스템이라기보다')
    .replace(/레거시/g, '기존 시스템')
    .trim() + '\n';
}

function normalizeCategory(rawCategoryText) {
  const normalized = normalizeText(rawCategoryText);
  return normalized || '기타';
}

function classifyTopic(groupName, title) {
  const seed = `${groupName} ${title}`;

  if (/javascript|(?:^|[^a-z])js(?:[^a-z]|$)|자바스크립트/i.test(seed)) {
    return 'javascript';
  }

  if (/(?:^|[^a-z])go(?:[^a-z]|$)/i.test(seed)) {
    return 'go';
  }

  if (/java|자바|jvm/i.test(seed)) {
    return 'java';
  }

  return '기타';
}

function normalizeSeriesName(rawCategoryText) {
  const normalized = normalizeCategory(rawCategoryText);
  const parts = normalized
    .split('/')
    .map(part => normalizeText(part))
    .filter(Boolean);

  if (parts.length === 0) return '미분류';

  const [head, ...tailParts] = parts;
  const tail = tailParts.join(' / ');

  if (/^시리즈$/i.test(head)) {
    return tail || '시리즈';
  }

  if (/^단편$/i.test(head)) {
    return '단편';
  }

  if (/^archive$/i.test(head)) {
    return 'Archive';
  }

  if (/^i did 2015 ~$/i.test(head)) {
    return 'I DID 2015 ~';
  }

  return normalized;
}

function deriveTags(groupName, title, topic) {
  const tags = new Set();

  if (topic === 'java') tags.add('Java');
  if (topic === 'go') tags.add('Go');
  if (topic === 'javascript') tags.add('JavaScript');

  if (/live\s*study/i.test(`${groupName} ${title}`)) {
    tags.add('live study');
  }

  if (/나\s*혼자\s*떠드는\s*자바/.test(groupName)) {
    tags.add('학습노트');
  }

  if (groupName.startsWith('시리즈/')) {
    tags.add('시리즈');
  }

  if (groupName.startsWith('단편/')) {
    tags.add('단편');
  }

  if (tags.size === 0) {
    tags.add('기록');
  }

  return [...tags].slice(0, 6);
}

function buildMarkdownFromLegacyHtml(htmlRaw, context) {
  const document = parse5.parse(htmlRaw);
  const titleNode = findFirst(document, node => hasClass(node, 'title-article'));
  const categoryNode = findFirst(document, node => hasClass(node, 'category'));
  const dateNode = findFirst(document, node => hasClass(node, 'date'));
  const contentsNode = findFirst(document, node => hasClass(node, 'contents_style'));

  if (!titleNode || !dateNode || !contentsNode) {
    throw new Error(`required nodes not found for slug=${context.slug}`);
  }

  const title = normalizeText(extractText(titleNode));
  const category = normalizeCategory(extractText(categoryNode));
  const date = toDateOnly(extractText(dateNode));

  if (!title) {
    throw new Error(`title is empty for slug=${context.slug}`);
  }

  if (!date) {
    throw new Error(`date is empty for slug=${context.slug}`);
  }

  const innerHtml = (contentsNode.childNodes || [])
    .map(child => parse5.serializeOuter(child))
    .join('');

  const fragment = parse5.parseFragment(innerHtml);

  pruneUnsafeNodes(fragment);
  const copiedImageCount = rewriteAndCopyImages(fragment, {
    sourceDirectory: context.sourceDirectory,
    slug: context.slug,
  });
  walk(fragment, sanitizeElementAttributes);

  const markdownBody = normalizeMarkdownOutput(renderChildrenAsBlocks(fragment.childNodes || []));
  if (!markdownBody.trim()) {
    throw new Error(`content is empty for slug=${context.slug}`);
  }

  return {
    title,
    category,
    date,
    markdown: markdownBody,
    copiedImageCount,
  };
}

function getRootCategoryNode(categoryJson) {
  const rootNode = categoryJson.find(node => node.id === '0') || categoryJson[0];
  if (!rootNode) {
    throw new Error('category root node not found');
  }

  if (!Array.isArray(rootNode.children)) {
    rootNode.children = [];
  }

  return rootNode;
}

function getMaxSerialInResources() {
  const markdownFiles = fs
    .readdirSync(MARKDOWN_DIR)
    .filter(fileName => fileName.endsWith('.md'));

  return markdownFiles.reduce((maxSerial, fileName) => {
    const matched = fileName.match(/^(\d{4})-/);
    if (!matched) return maxSerial;

    const serial = Number.parseInt(matched[1], 10);
    return Number.isFinite(serial) ? Math.max(maxSerial, serial) : maxSerial;
  }, 0);
}

function extractTitleFromLegacyHtml(htmlRaw) {
  const document = parse5.parse(htmlRaw);
  const titleNode = findFirst(document, node => hasClass(node, 'title-article'));
  if (!titleNode) return '';
  return normalizeText(extractText(titleNode));
}

function nextTopLevelCategoryId(existingTopLevelIds) {
  let id = 90;
  while (existingTopLevelIds.has(String(id))) {
    id += 1;
  }
  return String(id);
}

function createSlug(entry, serial, usedSlugs, titleHint = '') {
  const removedLeadingId = entry.sourceBaseName.replace(new RegExp(`^${entry.sourceId}[-_\\s]*`), '');
  const cleanedFromFileName = sanitizeSlugPart(removedLeadingId);
  const cleanedFromTitle = sanitizeSlugPart(titleHint);
  const cleaned = (cleanedFromFileName && cleanedFromFileName !== 'post')
    ? cleanedFromFileName
    : (cleanedFromTitle || `article-${entry.sourceId}`);
  const basePart = `${entry.sourceId}-${cleaned}`;

  let candidate = `${serial}-${basePart}`;
  let suffix = 1;
  while (usedSlugs.has(candidate)) {
    suffix += 1;
    candidate = `${serial}-${basePart}-${suffix}`;
  }

  usedSlugs.add(candidate);
  return candidate;
}

function topicDisplayName(topicKey) {
  if (topicKey === 'java') return 'java';
  if (topicKey === 'go') return 'go';
  if (topicKey === 'javascript') return 'javascript';
  return '기타';
}

function seriesOrder(seriesName) {
  if (seriesName === '단편') return 8;
  if (seriesName === '미분류') return 9;
  return 0;
}

function migrate() {
  if (!fs.existsSync(LEGACY_ROOT)) {
    throw new Error(`legacy root not found: ${LEGACY_ROOT}`);
  }

  ensureDirectory(IMAGE_ROOT);

  const legacyEntries = collectLegacyEntries();
  if (legacyEntries.length === 0) {
    console.log('No legacy html entries found.');
    return;
  }

  const sourceIdSet = new Set(legacyEntries.map(entry => entry.sourceId));
  cleanupGeneratedResources(sourceIdSet);

  const categoryJson = JSON.parse(fs.readFileSync(CATEGORY_PATH, 'utf8'));
  const rootNode = getRootCategoryNode(categoryJson);
  resetGeneratedCategories(rootNode);

  const maxSerial = getMaxSerialInResources();
  const usedSlugs = new Set(
    fs
      .readdirSync(MARKDOWN_DIR)
      .filter(fileName => fileName.endsWith('.md'))
      .map(fileName => fileName.replace(/\.md$/, ''))
  );

  const createdPosts = [];
  legacyEntries.forEach((entry, index) => {
    const serial = String(maxSerial + index + 1).padStart(4, '0');
    const rawHtml = fs.readFileSync(entry.htmlPath, 'utf8');
    const titleHint = extractTitleFromLegacyHtml(rawHtml);
    const slug = createSlug(entry, serial, usedSlugs, titleHint);
    const markdownPath = path.join(MARKDOWN_DIR, `${slug}.md`);

    const converted = buildMarkdownFromLegacyHtml(rawHtml, {
      slug,
      sourceDirectory: entry.sourceDirectory,
    });

    const topic = classifyTopic(converted.category, converted.title);
    const series = normalizeSeriesName(converted.category);
    const tags = deriveTags(converted.category, converted.title, topic);

    fs.writeFileSync(markdownPath, converted.markdown, 'utf8');

    createdPosts.push({
      sourceId: entry.sourceId,
      slug,
      title: converted.title,
      category: converted.category,
      topic,
      series,
      date: converted.date,
      tags,
      copiedImageCount: converted.copiedImageCount,
    });
  });

  const grouped = new Map();
  createdPosts.forEach(post => {
    if (!grouped.has(post.topic)) {
      grouped.set(post.topic, new Map());
    }

    const seriesMap = grouped.get(post.topic);
    if (!seriesMap.has(post.series)) {
      seriesMap.set(post.series, []);
    }

    seriesMap.get(post.series).push(post);
  });

  const existingTopLevelIds = new Set(
    (rootNode.children || []).map(child => String(child.id))
  );

  const sortedTopics = [...grouped.entries()].sort((a, b) => {
    const orderA = TOPIC_ORDER[a[0]] ?? 99;
    const orderB = TOPIC_ORDER[b[0]] ?? 99;
    if (orderA !== orderB) return orderA - orderB;
    return a[0].localeCompare(b[0], 'ko');
  });

  sortedTopics.forEach(([topicKey, seriesMap]) => {
    const categoryId = nextTopLevelCategoryId(existingTopLevelIds);
    existingTopLevelIds.add(categoryId);

    const sortedSeries = [...seriesMap.entries()].sort((a, b) => {
      const rankA = seriesOrder(a[0]);
      const rankB = seriesOrder(b[0]);
      if (rankA !== rankB) return rankA - rankB;
      return a[0].localeCompare(b[0], 'ko');
    });

    const seriesNodes = sortedSeries.map(([seriesName, posts], seriesIndex) => {
      const seriesId = `${categoryId}-${String(seriesIndex + 1).padStart(2, '0')}`;
      const sortedPosts = [...posts].sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.sourceId - b.sourceId;
      });

      const postNodes = sortedPosts.map((post, postIndex) => ({
        id: `${seriesId}-${String(postIndex + 1).padStart(2, '0')}`,
        regDate: post.date,
        lastModifiedDate: post.date,
        displayName: post.title,
        fileName: post.slug,
        tags: post.tags,
      }));

      return {
        id: seriesId,
        displayName: seriesName,
        children: postNodes,
      };
    });

    rootNode.children.push({
      id: categoryId,
      displayName: topicDisplayName(topicKey),
      children: seriesNodes,
    });
  });

  fs.writeFileSync(CATEGORY_PATH, `${JSON.stringify(categoryJson, null, 2)}\n`, 'utf8');

  const imageCount = createdPosts.reduce((sum, post) => sum + post.copiedImageCount, 0);
  console.log('Legacy migration completed.');
  console.log(`- posts: ${createdPosts.length}`);
  console.log(`- images: ${imageCount}`);
  console.log(`- topics: ${sortedTopics.length}`);
  console.log(`- updated category file: ${CATEGORY_PATH}`);
}

try {
  migrate();
} catch (error) {
  console.error('Legacy migration failed.');
  console.error(error);
  process.exit(1);
}
