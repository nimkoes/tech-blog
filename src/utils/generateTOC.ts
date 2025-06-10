interface TOCItem {
  level: number;
  text: string;
  id: string;
}

export function generateTOC(markdown: string): TOCItem[] {
  const lines = markdown.split('\n');
  const toc: TOCItem[] = [];
  
  lines.forEach(line => {
    const headerMatch = line.match(/^(#{1,3})\s+(.+)$/);
    if (headerMatch) {
      const level = headerMatch[1].length;
      const text = headerMatch[2].trim();
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');
      
      toc.push({ level, text, id });
    }
  });
  
  return toc;
}

export function generateTOCMarkdown(toc: TOCItem[]): string {
  if (toc.length === 0) return '';
  
  const tocMarkdown = toc.map(item => {
    const indent = '  '.repeat(item.level - 1);
    return `${indent}- [${item.text}](#${item.id})`;
  }).join('\n');
  
  return `# 목차\n\n<details open>\n<summary>▼ 목차</summary>\n\n${tocMarkdown}\n\n</details>\n\n`;
} 