import categoryData from '~/resources/category.json';

interface CategoryItem {
  id: string;
  displayName: string;
  tags?: string[];
  fileName?: string;
  children?: CategoryItem[];
}

interface DocumentInfo {
  title: string;
  tags: string[];
  fileName: string;
}

function extractTagsFromCategory(category: CategoryItem): string[] {
  let tags: string[] = category.tags || [];
  
  if (category.children) {
    category.children.forEach(child => {
      tags = [...tags, ...extractTagsFromCategory(child)];
    });
  }
  
  return Array.from(new Set(tags)); // 중복 제거
}

function extractDocumentsFromCategory(category: CategoryItem): DocumentInfo[] {
  let documents: DocumentInfo[] = [];
  
  if (category.fileName && category.displayName && category.tags) {
    documents.push({
      title: category.displayName,
      tags: category.tags,
      fileName: category.fileName
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
  if (category.fileName === fileName && category.displayName && category.tags) {
    return {
      title: category.displayName,
      tags: category.tags,
      fileName: category.fileName
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

export function extractDateAndSerial(fileName: string) {
  // 예: 0001206012-hello-world
  const serial = fileName.slice(0, 4);
  const dateStr = fileName.slice(4, 10); // 6자리
  // yyMMdd → yyyy-MM-dd로 변환
  const year = parseInt(dateStr.slice(0, 2), 10);
  const fullYear = year >= 70 ? 1900 + year : 2000 + year; // 70~99: 1900년대, 00~69: 2000년대
  const month = dateStr.slice(2, 4);
  const day = dateStr.slice(4, 6);
  const date = `${fullYear}-${month}-${day}`;
  return { serial, date, dateStr };
}

export function getAllDocuments(): DocumentInfo[] {
  try {
    const documents: DocumentInfo[] = [];
    categoryData.forEach(category => {
      documents.push(...extractDocumentsFromCategory(category));
    });
    // 등록일 내림차순, 일련번호 내림차순 정렬
    return documents.sort((a, b) => {
      const { date: dateA, serial: serialA } = extractDateAndSerial(a.fileName);
      const { date: dateB, serial: serialB } = extractDateAndSerial(b.fileName);
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

export function getAllTags(): string[] {
  try {
    const allTags = new Set<string>();
    
    categoryData.forEach(category => {
      extractTagsFromCategory(category).forEach(tag => allTags.add(tag));
    });
    
    return Array.from(allTags).sort((a, b) => a.localeCompare(b));
  } catch (error) {
    return [];
  }
} 