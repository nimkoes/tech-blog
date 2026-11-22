import { unified } from 'unified';
import remarkParse from 'remark-parse';
import { visit } from 'unist-util-visit';
import type { TocItem } from '~/types/content';

interface TocResult {
  toc: TocItem[];
  idMap: Record<string, string>;
  definitionHeadingMap: Record<string, true>;
}

function isDefinitionSection(text: string) {
  const compactText = text.replace(/\s+/g, '');
  return (
    compactText.includes('용어') ||
    /별역할$/.test(compactText) ||
    /개념(?:정리|요약)$/.test(compactText) ||
    /^glossary$/i.test(text.trim())
  );
}

export function generateTOC(markdown: string): TocResult {
  const tree = unified().use(remarkParse).parse(markdown);
  const toc: TocItem[] = [];
  const idMap: Record<string, string> = {};
  const definitionHeadingMap: Record<string, true> = {};
  const seenByKey: Record<string, number> = {};
  let definitionSectionLevel: number | null = null;

  const readText = (node: any): string => {
    if (!node) return '';

    if (typeof node.value === 'string') {
      return node.value;
    }

    if (!Array.isArray(node.children)) {
      return '';
    }

    return node.children.map((child: any) => readText(child)).join('');
  };

  const normalizeText = (value: string) =>
    value
      .replace(/\s+/g, ' ')
      .replace(/^[`"'“”‘’]+|[`"'“”‘’]+$/g, '')
      .trim();

  visit(tree, 'heading', (node: any) => {
    const level = node.depth;
    const text = normalizeText(readText(node));
    if (!text) {
      return;
    }

    const baseKey = `${level}_${text}`;
    const occurrence = (seenByKey[baseKey] || 0) + 1;
    seenByKey[baseKey] = occurrence;
    const headingKey = `${baseKey}__${occurrence}`;

    if (definitionSectionLevel !== null && level <= definitionSectionLevel) {
      definitionSectionLevel = null;
    }

    if (isDefinitionSection(text)) {
      definitionSectionLevel = level;
    } else if (definitionSectionLevel !== null && level > definitionSectionLevel) {
      definitionHeadingMap[headingKey] = true;
      return;
    }

    // Markdown h1/h2 become the document map's major section and its children.
    if (level < 1 || level > 2) {
      return;
    }

    const tocLevel = level + 1;
    const id = `${tocLevel}_${toc.length + 1}`;
    toc.push({ level: tocLevel, text, id });
    idMap[headingKey] = id;
  });

  return { toc, idMap, definitionHeadingMap };
}

export function generateTOCMarkdown(toc: TocItem[]): string {
  if (toc.length === 0) return '';
  const tocMarkdown = toc.map(item => {
    const indent = '  '.repeat(item.level - 1);
    return `${indent}- [${item.text}](#${item.id})`;
  }).join('\n');
  return `# 목차\n\n<details open>\n<summary>▼ 목차</summary>\n\n${tocMarkdown}\n\n</details>\n\n`;
} 
