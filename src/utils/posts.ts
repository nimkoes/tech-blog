import categoryData from '~/resources/category.json';
import { Post } from '~/types/post';

interface CategoryItem {
  id: string;
  displayName: string;
  fileName?: string;
  tags?: string[];
  children?: CategoryItem[];
}

function extractPosts(categories: CategoryItem[]): Post[] {
  const posts: Post[] = [];

  function traverse(items: CategoryItem[]) {
    items.forEach(item => {
      if (item.fileName) {
        // 파일명에서 날짜 추출 (ex: 0008250303-kubernetes)
        // 실제 날짜는 fileName의 앞 8자리(YYYYMMDD)로 가정
        const dateMatch = item.fileName.match(/^(\d{4})(\d{2})(\d{2})/);
        let formattedDate = '';
        if (dateMatch) {
          const [_, year, month, day] = dateMatch;
          formattedDate = `${year}.${month}.${day}`;
        } else {
          formattedDate = '';
        }
        posts.push({
          id: item.id,
          title: item.displayName,
          description: `${item.displayName}에 대한 포스트입니다.`,
          content: '',
          date: formattedDate,
          category: item.displayName.split(' - ')[0] || 'Uncategorized',
          tags: item.tags || [],
          image: `/images/posts/${item.fileName.split('-')[1] || 'default'}.jpg`,
          slug: item.fileName
        });
      }
      if (item.children) {
        traverse(item.children);
      }
    });
  }
  traverse(categories);
  // 날짜 기준으로 정렬 (최신순, 날짜 없는 경우 맨 뒤)
  return posts.sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    return b.date.localeCompare(a.date);
  });
}

export function getAllPosts(): Post[] {
  return extractPosts(categoryData);
}

export function getRecentPosts(count: number = 5): Post[] {
  return getAllPosts().slice(0, count);
}

export function getPostsByCategory(category: string): Post[] {
  return getAllPosts().filter(post => post.category === category);
}

export function getPostsByTag(tag: string): Post[] {
  return getAllPosts().filter(post => post.tags.includes(tag));
}

export function getPostBySlug(slug: string): Post | undefined {
  return getAllPosts().find(post => post.slug === slug);
} 