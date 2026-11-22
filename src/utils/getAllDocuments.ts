import postIndex from '~/resources/post-index.json';
import type { PostMeta } from '~/types/content';

const documents = postIndex as PostMeta[];

export function extractSerial(fileName: string) {
  return fileName.slice(0, 4);
}

export function getAllDocuments(): PostMeta[] {
  return [...documents];
}

export function getDocumentByFileName(fileName: string): PostMeta | null {
  return documents.find(document => document.fileName === fileName) ?? null;
}
