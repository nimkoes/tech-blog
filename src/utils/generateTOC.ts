import { unified } from 'unified';
import remarkParse from 'remark-parse';
import { visit } from 'unist-util-visit';
import type { TocItem } from '~/types/content';

export function generateTOC(markdown: string): { toc: TocItem[]; idMap: Record<string, string> } {
  const tree = unified().use(remarkParse).parse(markdown);
  const toc: TocItem[] = [];
  const idMap: Record<string, string> = {};
  const seenByKey: Record<string, number> = {};

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
    // Long-form technical posts are easier to scan with h2/h3-only TOC.
    if (level < 2 || level > 3) {
      return;
    }

    const text = normalizeText(readText(node));
    if (!text) {
      return;
    }

    const baseKey = `${level}_${text}`;
    const occurrence = (seenByKey[baseKey] || 0) + 1;
    seenByKey[baseKey] = occurrence;

    const id = `${level}_${toc.length + 1}`;
    toc.push({ level, text, id });
    idMap[`${baseKey}__${occurrence}`] = id;
  });

  return { toc, idMap };
}

export function generateTOCMarkdown(toc: TocItem[]): string {
  if (toc.length === 0) return '';
  const tocMarkdown = toc.map(item => {
    const indent = '  '.repeat(item.level - 1);
    return `${indent}- [${item.text}](#${item.id})`;
  }).join('\n');
  return `# 목차\n\n<details open>\n<summary>▼ 목차</summary>\n\n${tocMarkdown}\n\n</details>\n\n`;
} 
