import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

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

function getCategoryData(): CategoryItem[] {
  try {
    // 상대 경로로 변경
    const categoryPath = path.join(process.cwd(), 'src/resources/category.json');
    if (!fs.existsSync(categoryPath)) {
      console.error('Category file not found at:', categoryPath);
      return [];
    }
    
    const categoryContent = fs.readFileSync(categoryPath, 'utf8');
    return JSON.parse(categoryContent);
  } catch (error) {
    return [];
  }
}

export function getAllDocuments(): DocumentInfo[] {
  try {
    const categoryData = getCategoryData();
    const documents: DocumentInfo[] = [];
    
    categoryData.forEach(category => {
      const extractedDocs = extractDocumentsFromCategory(category);
      documents.push(...extractedDocs);
    });
    
    return documents;
  } catch (error) {
    return [];
  }
}

export function getDocumentByFileName(fileName: string): DocumentInfo | null {
  try {
    const categoryData = getCategoryData();
    
    for (const category of categoryData) {
      const found = findDocumentByFileName(category, fileName);
      if (found) return found;
    }
    
    return null;
  } catch (error) {
    console.error('Error in getDocumentByFileName:', error);
    return null;
  }
}

export function getAllTags(): string[] {
  try {
    const categoryData = getCategoryData();
    const allTags = new Set<string>();
    
    categoryData.forEach(category => {
      extractTagsFromCategory(category).forEach(tag => allTags.add(tag));
    });
    
    return Array.from(allTags).sort((a, b) => a.localeCompare(b));
  } catch (error) {
    return [];
  }
} 