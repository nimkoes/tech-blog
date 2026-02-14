import categoryData from '~/resources/category.json';
import type { CategoryNode, PostMeta } from '~/types/content';

function isPostNode(node: CategoryNode): node is CategoryNode &
  Required<Pick<CategoryNode, 'fileName' | 'tags' | 'regDate' | 'lastModifiedDate'>> {
  return Boolean(
    node.fileName &&
      node.displayName &&
      node.tags &&
      node.regDate &&
      node.lastModifiedDate
  );
}

function extractDocumentsFromCategory(category: CategoryNode): PostMeta[] {
  let documents: PostMeta[] = [];

  if (isPostNode(category)) {
    documents.push({
      title: category.displayName,
      tags: category.tags,
      fileName: category.fileName,
      regDate: category.regDate,
      lastModifiedDate: category.lastModifiedDate,
    });
  }

  if (category.children) {
    category.children.forEach(child => {
      documents = [...documents, ...extractDocumentsFromCategory(child)];
    });
  }

  return documents;
}

function findDocumentByFileName(category: CategoryNode, fileName: string): PostMeta | null {
  if (isPostNode(category) && category.fileName === fileName) {
    return {
      title: category.displayName,
      tags: category.tags,
      fileName: category.fileName,
      regDate: category.regDate,
      lastModifiedDate: category.lastModifiedDate,
    };
  }

  if (category.children) {
    for (const child of category.children) {
      const found = findDocumentByFileName(child, fileName);
      if (found) return found;
    }
  }

  return null;
}

export function extractSerial(fileName: string) {
  return fileName.slice(0, 4);
}

export function getAllDocuments(): PostMeta[] {
  try {
    const documents: PostMeta[] = [];
    categoryData.forEach(category => {
      documents.push(...extractDocumentsFromCategory(category));
    });
    // 최종수정일 내림차순, 일련번호 내림차순 정렬
    return documents.sort((a, b) => {
      const dateA = a.lastModifiedDate;
      const dateB = b.lastModifiedDate;
      const serialA = extractSerial(a.fileName);
      const serialB = extractSerial(b.fileName);

      if (dateA !== dateB) return dateB.localeCompare(dateA);
      return serialB.localeCompare(serialA);
    });
  } catch (error) {
    return [];
  }
}

export function getDocumentByFileName(fileName: string): PostMeta | null {
  try {
    for (const category of categoryData) {
      const found = findDocumentByFileName(category, fileName);
      if (found) return found;
    }
    return null;
  } catch (error) {
    return null;
  }
}
