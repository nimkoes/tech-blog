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

function getCategoryData(): CategoryItem[] {
  try {
    // 상대 경로로 변경
    const categoryPath = path.join(process.cwd(), 'src/resources/category.json');
    console.log('Category path:', categoryPath);
    
    if (!fs.existsSync(categoryPath)) {
      console.error('Category file not found at:', categoryPath);
      return [];
    }
    
    const categoryContent = fs.readFileSync(categoryPath, 'utf8');
    const categoryData = JSON.parse(categoryContent);
    console.log('Category data loaded successfully');
    return categoryData;
  } catch (error) {
    console.error('Error loading category data:', error);
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
    
    console.log('Total documents found:', documents.length);
    console.log('Sample document:', documents[0]);
    
    return documents;
  } catch (error) {
    console.error('Error in getAllDocuments:', error);
    return [];
  }
}

export function getAllTags(): string[] {
  try {
    const categoryData = getCategoryData();
    const allTags = new Set<string>();
    
    categoryData.forEach(category => {
      extractTagsFromCategory(category).forEach(tag => allTags.add(tag));
    });
    
    const sortedTags = Array.from(allTags).sort((a, b) => a.localeCompare(b));
    console.log('All tags:', sortedTags);
    
    return sortedTags;
  } catch (error) {
    console.error('Error in getAllTags:', error);
    return [];
  }
} 