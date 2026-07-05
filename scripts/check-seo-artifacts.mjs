import fs from 'fs';
import path from 'path';

const ROOT_DIR = process.cwd();
const OUT_DIR = path.join(ROOT_DIR, 'out');
const SITEMAP_PATH = path.join(OUT_DIR, 'sitemap.xml');
const FEED_PATH = path.join(OUT_DIR, 'feed.xml');
const OG_IMAGE_PATH = path.join(OUT_DIR, 'og-image.png');
const APPLE_ICON_PATH = path.join(OUT_DIR, 'apple-touch-icon.png');
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

if (errors.length > 0) {
  console.error('SEO artifact validation failed.');
  errors.forEach(error => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`SEO artifact validation passed. sitemapPosts=${postLocs.length}, feedPosts=${feedLinks.length}`);
