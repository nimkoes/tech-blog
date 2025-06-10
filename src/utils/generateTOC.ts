import { unified } from 'unified';
import remarkParse from 'remark-parse';
import { visit } from 'unist-util-visit';

interface TOCItem {
  level: number;
  text: string;
  id: string;
}

export function generateTOC(markdown: string): { toc: TOCItem[], idMap: Record<string, string> } {
  const tree = unified().use(remarkParse).parse(markdown);
  const toc: TOCItem[] = [];
  const idMap: Record<string, string> = {};
  const counters = [0, 0, 0, 0, 0, 0];

  visit(tree, 'heading', (node: any) => {
    const level = node.depth;
    const text = node.children.map((c: any) => c.value || '').join('').trim();
    counters[level - 1]++;
    for (let i = level; i < counters.length; i++) counters[i] = 0;
    const id = counters.slice(0, level).join('_');
    toc.push({ level, text, id });
    idMap[`${level}_${text}`] = id;
  });

  return { toc, idMap };
}

export function generateTOCMarkdown(toc: TOCItem[]): string {
  if (toc.length === 0) return '';
  const tocMarkdown = toc.map(item => {
    const indent = '  '.repeat(item.level - 1);
    return `${indent}- [${item.text}](#${item.id})`;
  }).join('\n');
  return `# 목차\n\n<details open>\n<summary>▼ 목차</summary>\n\n${tocMarkdown}\n\n</details>\n\n`;
} 