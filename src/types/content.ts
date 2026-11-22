export type CategoryNodeKind = 'root' | 'category' | 'folder' | 'series';

export interface CategoryNode {
  id: string;
  displayName: string;
  kind?: CategoryNodeKind;
  fileName?: string;
  tags?: string[];
  regDate?: string;
  lastModifiedDate?: string;
  children?: CategoryNode[];
}

export interface PostMeta {
  title: string;
  description: string;
  tags: string[];
  fileName: string;
  regDate: string;
  lastModifiedDate: string;
  status: 'published' | 'needs-review' | 'deprecated';
  reviewedAt?: string | null;
  readingTime: number;
}

export interface PostContent {
  slug: string;
  title: string;
  description: string;
  date: string;
  updatedAt: string;
  status: PostMeta['status'];
  reviewedAt?: string;
  sources: string[];
  content: string;
}

export interface TocItem {
  level: number;
  text: string;
  id: string;
}
