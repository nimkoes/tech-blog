export interface CategoryNode {
  id: string;
  displayName: string;
  fileName?: string;
  tags?: string[];
  regDate?: string;
  lastModifiedDate?: string;
  children?: CategoryNode[];
}

export interface PostMeta {
  title: string;
  tags: string[];
  fileName: string;
  regDate: string;
  lastModifiedDate: string;
}

export interface PostContent {
  slug: string;
  title: string;
  description: string;
  date: string;
  content: string;
}

export interface TocItem {
  level: number;
  text: string;
  id: string;
}
