import { unified } from 'unified';
import remarkParse from 'remark-parse';
import { isDefinitionSection } from '~/utils/generateTOC';

export interface GlossaryEntry {
  term: string;
  aliases: string[];
  definition: string;
}

type AstNode = {
  type?: string;
  depth?: number;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: AstNode[];
};

const SKIPPED_TAGS = new Set([
  'a',
  'code',
  'dfn',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'pre',
  'script',
  'style',
]);

const KOREAN_PARTICLES = [
  '이라는',
  '이라고',
  '이며',
  '이고',
  '에게',
  '에서',
  '으로',
  '부터',
  '까지',
  '처럼',
  '보다',
  '은',
  '는',
  '이',
  '가',
  '을',
  '를',
  '의',
  '에',
  '와',
  '과',
  '도',
  '만',
  '로',
];

function readText(node: AstNode | undefined): string {
  if (!node) return '';
  if (typeof node.value === 'string') return node.value;
  return (node.children || []).map(readText).join('');
}

function normalizeText(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function createAliases(term: string) {
  const aliases = new Set<string>();
  const normalizedTerm = normalizeText(term);

  if (normalizedTerm.length >= 2) {
    aliases.add(normalizedTerm);
  }

  const openParen = normalizedTerm.indexOf('(');
  const closeParen = normalizedTerm.lastIndexOf(')');
  if (openParen > 0 && closeParen > openParen) {
    const primary = normalizedTerm.slice(0, openParen).trim();
    const parenthetical = normalizedTerm.slice(openParen + 1, closeParen);

    if (primary.length >= 2) aliases.add(primary);
    parenthetical
      .split(/[,/]/)
      .map(value => value.trim())
      .filter(value => value.length >= 2)
      .forEach(value => aliases.add(value));
  }

  return Array.from(aliases).sort((a, b) => b.length - a.length);
}

function parseListDefinitions(node: AstNode, entries: GlossaryEntry[]) {
  if (node.type === 'listItem') {
    const paragraph = (node.children || []).find(child => child.type === 'paragraph');
    const strong = paragraph?.children?.find(child => child.type === 'strong');
    const term = normalizeText(readText(strong));
    const fullText = normalizeText(readText(paragraph));
    const definition = normalizeText(
      term ? fullText.slice(fullText.indexOf(term) + term.length).replace(/^\s*[:—–-]\s*/, '') : ''
    );

    if (term && definition) {
      entries.push({ term, aliases: createAliases(term), definition });
    }
  }

  for (const child of node.children || []) {
    parseListDefinitions(child, entries);
  }
}

export function extractGlossary(markdown: string): GlossaryEntry[] {
  const tree = unified().use(remarkParse).parse(markdown) as AstNode;
  const rootChildren = tree.children || [];
  const entries: GlossaryEntry[] = [];
  let sectionLevel: number | null = null;
  let headingTerm = '';
  let headingDefinitionParts: string[] = [];

  const flushHeadingDefinition = () => {
    const definition = normalizeText(headingDefinitionParts.join(' '));
    if (headingTerm && definition) {
      entries.push({
        term: headingTerm,
        aliases: createAliases(headingTerm),
        definition,
      });
    }
    headingTerm = '';
    headingDefinitionParts = [];
  };

  for (const node of rootChildren) {
    if (node.type === 'heading') {
      const level = node.depth || 0;
      const text = normalizeText(readText(node));

      if (sectionLevel !== null && level <= sectionLevel) {
        flushHeadingDefinition();
        sectionLevel = null;
      } else if (sectionLevel !== null && level > sectionLevel) {
        flushHeadingDefinition();
        headingTerm = text;
        continue;
      }

      if (isDefinitionSection(text)) {
        flushHeadingDefinition();
        sectionLevel = level;
      }
      continue;
    }

    if (sectionLevel === null) continue;

    if (headingTerm) {
      const text = normalizeText(readText(node));
      if (text) headingDefinitionParts.push(text);
      continue;
    }

    if (node.type === 'list') {
      parseListDefinitions(node, entries);
    }
  }

  flushHeadingDefinition();

  const uniqueEntries = new Map<string, GlossaryEntry>();
  for (const entry of entries) {
    const key = entry.term.toLocaleLowerCase('ko-KR');
    if (!uniqueEntries.has(key) && entry.aliases.length > 0) {
      uniqueEntries.set(key, entry);
    }
  }

  return Array.from(uniqueEntries.values());
}

function isWordCharacter(value: string | undefined) {
  return Boolean(value && /[A-Za-z0-9_가-힣]/.test(value));
}

function canStartAt(text: string, index: number) {
  return index === 0 || !isWordCharacter(text[index - 1]);
}

function canEndAt(text: string, index: number) {
  if (index >= text.length || !isWordCharacter(text[index])) return true;
  const remainder = text.slice(index);
  return KOREAN_PARTICLES.some(particle => remainder.startsWith(particle));
}

interface GlossaryMatch {
  start: number;
  end: number;
  text: string;
  entry: GlossaryEntry;
}

export function findGlossaryMatches(text: string, entries: GlossaryEntry[]): GlossaryMatch[] {
  const aliases = entries
    .flatMap(entry => entry.aliases.map(alias => ({ alias, entry })))
    .sort((a, b) => b.alias.length - a.alias.length);
  const matches: GlossaryMatch[] = [];
  let index = 0;

  while (index < text.length) {
    const match = aliases.find(({ alias }) =>
      text.startsWith(alias, index) &&
      canStartAt(text, index) &&
      canEndAt(text, index + alias.length)
    );

    if (!match) {
      index += 1;
      continue;
    }

    matches.push({
      start: index,
      end: index + match.alias.length,
      text: text.slice(index, index + match.alias.length),
      entry: match.entry,
    });
    index += match.alias.length;
  }

  return matches;
}

function annotateTextNode(node: AstNode, entries: GlossaryEntry[]) {
  const text = node.value || '';
  const matches = findGlossaryMatches(text, entries);
  if (matches.length === 0) return [node];

  const children: AstNode[] = [];
  let cursor = 0;

  for (const match of matches) {
    if (match.start > cursor) {
      children.push({ type: 'text', value: text.slice(cursor, match.start) });
    }

    children.push({
      type: 'element',
      tagName: 'dfn',
      properties: {
        dataDefinition: match.entry.definition,
        dataTerm: match.entry.term,
      },
      children: [{ type: 'text', value: match.text }],
    });
    cursor = match.end;
  }

  if (cursor < text.length) {
    children.push({ type: 'text', value: text.slice(cursor) });
  }

  return children;
}

function annotateNode(node: AstNode, entries: GlossaryEntry[]) {
  if (!node.children || SKIPPED_TAGS.has(node.tagName || '')) return;

  node.children = node.children.flatMap(child => {
    if (child.type === 'text') {
      return annotateTextNode(child, entries);
    }
    annotateNode(child, entries);
    return [child];
  });
}

export function rehypeGlossaryTerms(options: { entries: GlossaryEntry[] }) {
  return (tree: AstNode) => {
    if (options.entries.length === 0 || !tree.children) return;

    let definitionSectionLevel: number | null = null;

    for (const child of tree.children) {
      const headingMatch = /^h([1-6])$/.exec(child.tagName || '');
      if (headingMatch) {
        const level = Number(headingMatch[1]);
        const text = normalizeText(readText(child));

        if (definitionSectionLevel !== null && level <= definitionSectionLevel) {
          definitionSectionLevel = null;
        }
        if (isDefinitionSection(text)) {
          definitionSectionLevel = level;
        }
      }

      if (definitionSectionLevel === null) {
        annotateNode(child, options.entries);
      }
    }
  };
}
