import categoryData from '~/resources/category.json';

interface CategoryItem {
  id: string;
  displayName: string;
  tags?: string[];
  fileName?: string;
  regDate?: string;
  lastModifiedDate?: string;
  children?: CategoryItem[];
}

interface DocumentInfo {
  title: string;
  tags: string[];
  fileName: string;
  regDate: string;
  lastModifiedDate: string;
}

function extractDocumentsFromCategory(category: CategoryItem): DocumentInfo[] {
  let documents: DocumentInfo[] = [];

  if (category.fileName && category.displayName && category.tags) {
    documents.push(<DocumentInfo>{
      title: category.displayName,
      tags: category.tags,
      fileName: category.fileName,
      regDate: category.regDate,
      lastModifiedDate: category.lastModifiedDate
    });
  }

  if (category.children) {
    category.children.forEach(child => {
      documents = [...documents, ...extractDocumentsFromCategory(child)];
    });
  }

  return documents;
}

function findDocumentByFileName(category: CategoryItem, fileName: string): DocumentInfo | null {
  if (category.fileName === fileName
    && category.displayName
    && category.tags
    && category.regDate
    && category.lastModifiedDate
  ) {
    return {
      title: category.displayName,
      tags: category.tags,
      fileName: category.fileName,
      regDate: category.regDate,
      lastModifiedDate: category.lastModifiedDate
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

export function getAllDocuments(): DocumentInfo[] {
  try {
    const documents: DocumentInfo[] = [];
    categoryData.forEach(category => {
      documents.push(...extractDocumentsFromCategory(category));
    });
    // 최종수정일 내림차순, 일련번호 내림차순 정렬
    return documents.sort((a, b) => {
      let dateA = a.lastModifiedDate;
      let dateB = b.lastModifiedDate;

      let serialA = extractSerial(a.fileName);
      let serialB = extractSerial(b.fileName);

      if (dateA !== dateB) return dateB.localeCompare(dateA);
      return serialB.localeCompare(serialA);
    });
  } catch (error) {
    return [];
  }
}

export function getDocumentByFileName(fileName: string): DocumentInfo | null {
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
