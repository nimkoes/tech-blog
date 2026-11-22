import type { CategoryNode, CategoryNodeKind, PostMeta } from '~/types/content';

export interface CategoryTreePost {
  type: 'post';
  id: string;
  post: PostMeta;
}

export interface CategoryTreeGroup {
  type: 'group';
  id: string;
  name: string;
  kind: Exclude<CategoryNodeKind, 'root'>;
  children: CategoryTreeItem[];
  postCount: number;
}

export type CategoryTreeItem = CategoryTreeGroup | CategoryTreePost;

function buildTreeItem(
  node: CategoryNode,
  documentMap: Map<string, PostMeta>
): CategoryTreeItem | null {
  if (node.fileName) {
    const post = documentMap.get(node.fileName);
    return post ? { type: 'post', id: node.id, post } : null;
  }

  const children = (node.children ?? [])
    .map(child => buildTreeItem(child, documentMap))
    .filter((child): child is CategoryTreeItem => Boolean(child));

  if (children.length === 0) return null;

  const kind = node.kind === 'series' || node.kind === 'folder' ? node.kind : 'category';
  const postCount = children.reduce(
    (total, child) => total + (child.type === 'post' ? 1 : child.postCount),
    0
  );

  return {
    type: 'group',
    id: node.id,
    name: node.displayName,
    kind,
    children,
    postCount,
  };
}

export function buildCategoryTree(
  nodes: CategoryNode[],
  documents: PostMeta[]
): CategoryTreeGroup[] {
  const documentMap = new Map(documents.map(post => [post.fileName, post]));
  const visibleRoots = nodes.flatMap(node => (node.kind === 'root' ? node.children ?? [] : [node]));

  return visibleRoots
    .map(node => buildTreeItem(node, documentMap))
    .filter((item): item is CategoryTreeGroup => item?.type === 'group');
}

function matchesPost(post: PostMeta, query: string) {
  return `${post.title} ${post.description} ${post.tags.join(' ')}`
    .toLowerCase()
    .includes(query);
}

function filterTreeItem(item: CategoryTreeItem, query: string): CategoryTreeItem | null {
  if (item.type === 'post') {
    return matchesPost(item.post, query) ? item : null;
  }

  if (item.name.toLowerCase().includes(query)) {
    return item;
  }

  const children = item.children
    .map(child => filterTreeItem(child, query))
    .filter((child): child is CategoryTreeItem => Boolean(child));

  if (children.length === 0) return null;

  return {
    ...item,
    children,
    postCount: children.reduce(
      (total, child) => total + (child.type === 'post' ? 1 : child.postCount),
      0
    ),
  };
}

export function filterCategoryTree(
  tree: CategoryTreeGroup[],
  query: string
): CategoryTreeGroup[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return tree;

  return tree
    .map(group => filterTreeItem(group, normalizedQuery))
    .filter((item): item is CategoryTreeGroup => item?.type === 'group');
}

export function collectCategoryGroupIds(items: CategoryTreeItem[]): string[] {
  return items.flatMap(item => {
    if (item.type === 'post') return [];
    return [item.id, ...collectCategoryGroupIds(item.children)];
  });
}

export function findCategoryAncestorIds(
  items: CategoryTreeItem[],
  slug: string,
  ancestors: string[] = []
): string[] {
  for (const item of items) {
    if (item.type === 'post') {
      if (item.post.fileName === slug) return ancestors;
      continue;
    }

    const found = findCategoryAncestorIds(item.children, slug, [...ancestors, item.id]);
    if (found.length > 0) return found;
  }

  return [];
}
