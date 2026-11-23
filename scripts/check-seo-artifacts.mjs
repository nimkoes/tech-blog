import fs from 'fs';
import path from 'path';

const ROOT_DIR = process.cwd();
const OUT_DIR = path.join(ROOT_DIR, 'out');
const SITEMAP_PATH = path.join(OUT_DIR, 'sitemap.xml');
const FEED_PATH = path.join(OUT_DIR, 'feed.xml');
const OG_IMAGE_PATH = path.join(OUT_DIR, 'og-image.png');
const APPLE_ICON_PATH = path.join(OUT_DIR, 'apple-touch-icon.png');
const POST_INDEX_PATH = path.join(ROOT_DIR, 'src/resources/post-index.json');
const BASE_PATH = '/tech-blog';

const errors = [];

function readFileSafe(filePath, label) {
  if (!fs.existsSync(filePath)) {
    errors.push(`[missing artifact] ${label} (${filePath})`);
    return '';
  }

  return fs.readFileSync(filePath, 'utf8');
}

function getXmlValues(xml, tagName) {
  const matches = [...xml.matchAll(new RegExp(`<${tagName}>([^<]+)</${tagName}>`, 'g'))];
  return matches.map(match => match[1].trim());
}

const sitemapXml = readFileSafe(SITEMAP_PATH, 'sitemap.xml');
const feedXml = readFileSafe(FEED_PATH, 'feed.xml');
readFileSafe(OG_IMAGE_PATH, 'og-image.png');
readFileSafe(APPLE_ICON_PATH, 'apple-touch-icon.png');
const postIndexJson = readFileSafe(POST_INDEX_PATH, 'post-index.json');

if (errors.length > 0) {
  errors.forEach(error => console.error(`- ${error}`));
  process.exit(1);
}

const sitemapLocs = getXmlValues(sitemapXml, 'loc');
const feedLinks = getXmlValues(feedXml, 'link').filter(link => link.includes(`${BASE_PATH}/post/`));

const duplicatedSitemapLocs = sitemapLocs.filter((loc, index) => sitemapLocs.indexOf(loc) !== index);
if (duplicatedSitemapLocs.length > 0) {
  errors.push(`[duplicate sitemap URL] ${[...new Set(duplicatedSitemapLocs)].join(', ')}`);
}

const invalidBasePathLocs = sitemapLocs.filter(loc => loc.includes(`${BASE_PATH}${BASE_PATH}/`));
if (invalidBasePathLocs.length > 0) {
  errors.push(`[invalid basePath duplication] ${invalidBasePathLocs.join(', ')}`);
}

const postLocs = sitemapLocs.filter(loc => loc.includes(`${BASE_PATH}/post/`));
const postIndex = JSON.parse(postIndexJson);

postIndex.forEach(post => {
  const ogImagePath = path.join(OUT_DIR, 'og', `${post.fileName}.png`);
  if (!fs.existsSync(ogImagePath)) {
    errors.push(`[missing post OG image] ${post.fileName}`);
  }
});

postLocs.forEach(loc => {
  const slug = loc.split(`${BASE_PATH}/post/`)[1]?.replace(/\/$/, '');
  if (!slug) {
    errors.push(`[invalid sitemap post URL] ${loc}`);
    return;
  }

  const postHtmlPath = path.join(OUT_DIR, 'post', slug, 'index.html');
  if (!fs.existsSync(postHtmlPath)) {
    errors.push(`[missing static post page] ${loc} -> ${postHtmlPath}`);
  }
});

const sitemapPostSet = new Set(postLocs.map(loc => loc.replace(/\/$/, '')));
feedLinks.forEach(link => {
  const normalized = link.replace(/\/$/, '');
  if (!sitemapPostSet.has(normalized)) {
    errors.push(`[feed URL missing in sitemap] ${link}`);
  }
});

// ---- 페이지 단위 검사: 사이트맵 URL 과 각 페이지의 title, description, H1, Canonical, OG URL 정합성 ----

const SITE_URL = `https://nimkoes.github.io${BASE_PATH}/`;

function normalizeUrl(url) {
  try {
    return decodeURI(url);
  } catch {
    return url;
  }
}

function getMetaContent(html, attr, name) {
  const tags = html.match(/<meta\b[^>]*>/gi) ?? [];
  const tag = tags.find(value => new RegExp(`${attr}="${name}"`, 'i').test(value));
  return tag?.match(/content="([^"]*)"/i)?.[1];
}

function getAllMetaContents(html, attr, name) {
  const tags = html.match(/<meta\b[^>]*>/gi) ?? [];
  return tags
    .filter(value => new RegExp(`${attr}="${name}"`, 'i').test(value))
    .map(tag => tag.match(/content="([^"]*)"/i)?.[1] ?? '');
}

function isNoindex(html) {
  return [...getAllMetaContents(html, 'name', 'robots'), ...getAllMetaContents(html, 'name', 'googlebot')]
    .some(value => /noindex|none/i.test(value));
}

function getCanonical(html) {
  return html.match(/<link\b[^>]*rel="canonical"[^>]*href="([^"]+)"/i)?.[1];
}

function locToHtmlPath(loc) {
  const relative = normalizeUrl(loc).slice(SITE_URL.length);
  return path.join(OUT_DIR, relative, 'index.html');
}

function checkPage(label, html, expectedCanonical) {
  if (!/<title>[^<]+<\/title>/i.test(html)) errors.push(`[missing title] ${label}`);
  if (!getMetaContent(html, 'name', 'description')) errors.push(`[missing description] ${label}`);

  const h1Count = (html.match(/<h1\b/gi) ?? []).length;
  if (h1Count !== 1) errors.push(`[h1 count ${h1Count}] ${label}`);

  const canonical = getCanonical(html);
  if (!canonical) {
    errors.push(`[missing canonical] ${label}`);
  } else if (normalizeUrl(canonical) !== normalizeUrl(expectedCanonical)) {
    errors.push(`[canonical mismatch] ${label}: ${canonical} != ${expectedCanonical}`);
  }

  const ogUrl = getMetaContent(html, 'property', 'og:url');
  if (!ogUrl) {
    errors.push(`[missing og:url] ${label}`);
  } else if (canonical && normalizeUrl(ogUrl) !== normalizeUrl(canonical)) {
    errors.push(`[og:url mismatch] ${label}: ${ogUrl} != ${canonical}`);
  }
}

sitemapLocs.forEach(loc => {
  if (!loc.startsWith(SITE_URL)) errors.push(`[sitemap URL outside site] ${loc}`);
  if (!loc.endsWith('/')) errors.push(`[sitemap URL without trailing slash] ${loc}`);
  if (/localhost|127\.0\.0\.1/.test(loc)) errors.push(`[sitemap URL is local] ${loc}`);
  if (/%25/i.test(loc)) errors.push(`[sitemap URL double encoded] ${loc}`);
  if (!loc.startsWith(SITE_URL)) return;

  const htmlPath = locToHtmlPath(loc);
  if (!fs.existsSync(htmlPath)) {
    errors.push(`[sitemap URL has no page] ${loc} -> ${htmlPath}`);
    return;
  }

  const html = fs.readFileSync(htmlPath, 'utf8');
  if (isNoindex(html)) errors.push(`[noindex URL in sitemap] ${loc}`);
  if (/http-equiv="refresh"/i.test(html)) errors.push(`[redirect URL in sitemap] ${loc}`);
  checkPage(loc, html, loc);
});

// 사이트맵 누락과 상관없이 모든 게시물 페이지가 자기 자신을 Canonical 로 가리키는지 본다.
postIndex.forEach(post => {
  const expected = `${SITE_URL}post/${post.fileName}/`;
  const htmlPath = path.join(OUT_DIR, 'post', post.fileName, 'index.html');
  if (!fs.existsSync(htmlPath)) {
    errors.push(`[missing static post page] ${post.fileName}`);
    return;
  }
  checkPage(`post/${post.fileName}`, fs.readFileSync(htmlPath, 'utf8'), expected);
  if (!sitemapLocs.includes(expected)) errors.push(`[post missing in sitemap] ${expected}`);
});

// 공식 robots.txt 는 루트 저장소(nimkoes.github.io)가 배포한다. 하위 경로 robots.txt 가 다시 생기지 않게 한다.
if (fs.existsSync(path.join(OUT_DIR, 'robots.txt'))) {
  errors.push('[child robots.txt] out/robots.txt 가 생성됐습니다. 공식 robots 는 루트 저장소가 관리합니다.');
}

// 게시물 JSON-LD dateModified 와 사이트맵 lastmod 는 같은 날짜여야 한다(날짜 원본이 둘로 갈라지는 것을 막는 트립와이어).
const sitemapLastmodByLoc = new Map(
  [...sitemapXml.matchAll(/<url>\s*<loc>([^<]+)<\/loc>\s*(?:<lastmod>([^<]+)<\/lastmod>)?/g)].map(([, loc, lastmod]) => [
    loc.trim(),
    lastmod?.trim(),
  ])
);
postIndex.forEach(post => {
  const loc = `${SITE_URL}post/${post.fileName}/`;
  const htmlPath = path.join(OUT_DIR, 'post', post.fileName, 'index.html');
  if (!fs.existsSync(htmlPath)) return;
  const dateModified = fs.readFileSync(htmlPath, 'utf8').match(/"dateModified":"([^"]+)"/)?.[1];
  const lastmod = sitemapLastmodByLoc.get(loc);
  if (!dateModified || !lastmod || dateModified.slice(0, 10) !== lastmod.slice(0, 10)) {
    errors.push(`[dateModified != sitemap lastmod] ${post.fileName}: ${dateModified} / ${lastmod}`);
  }
});

// 운영 빌드에서 percent-encoding 된 이름의 태그 디렉토리가 생기면 /tags/%25.../ 같은 중복 URL 이 된다.
const tagsDir = path.join(OUT_DIR, 'tags');
if (fs.existsSync(tagsDir)) {
  fs.readdirSync(tagsDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && entry.name.includes('%'))
    .forEach(entry => errors.push(`[double-encoded tag directory] out/tags/${entry.name}`));
}

// lastmod 는 미래 날짜가 될 수 없다. 글 날짜는 한국 시간 기준 날짜로 쓰므로 KST 오늘 날짜와 날짜 단위로 비교한다.
// (CI 는 UTC 로 돌기 때문에 시각으로 비교하면 KST 오전 빌드가 오늘 글을 미래로 오판한다.)
const todayKst = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(new Date());
getXmlValues(sitemapXml, 'lastmod').forEach(lastmod => {
  const date = lastmod.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(new Date(date).getTime())) {
    errors.push(`[invalid lastmod] ${lastmod}`);
  } else if (date > todayKst) {
    errors.push(`[future lastmod] ${lastmod} > ${todayKst}`);
  }
});

if (errors.length > 0) {
  console.error('SEO artifact validation failed.');
  errors.forEach(error => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`SEO artifact validation passed. sitemapPosts=${postLocs.length}, feedPosts=${feedLinks.length}`);
