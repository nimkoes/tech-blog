import { create } from 'zustand';
import categoryData from "@resources/category.json";

interface CategoryItem {
  id: string;
  displayName: string;
  fileName?: string;
  children?: CategoryItem[];
}

interface CategoryState {
  openFolders: { [key: string]: boolean };
  searchQuery: string;
  selectedFile: string | null;
  lastOpenedFolders: { [key: string]: boolean };
  setOpenFolders: (openFolders: { [key: string]: boolean }) => void;
  toggleFolder: (id: string) => void;
  setSearchQuery: (query: string) => void;
  setSelectedFile: (fileName: string | null) => void;
  expandAll: () => void;
  collapseAll: () => void;
  searchFiles: (query: string) => void;
}

const findMatchingItems = (items: CategoryItem[], query: string): { files: string[], folders: string[], matchedFolders: string[] } => {
  const result = { 
    files: [] as string[], 
    folders: [] as string[],
    matchedFolders: [] as string[] // 검색어와 일치하는 폴더들
  };
  
  const traverse = (items: CategoryItem[], parentIds: string[] = []) => {
    items.forEach((item) => {
      const matchesQuery = item.displayName.toLowerCase().includes(query.toLowerCase());
      const currentPath = [...parentIds, item.id];

      if (item.children) {
        // 폴더인 경우
        const childResults = traverse(item.children, currentPath);
        
        // 현재 폴더가 검색어와 일치하거나, 하위 항목(파일/폴더)이 검색어와 일치하는 경우
        if (matchesQuery || childResults.files.length > 0 || childResults.matchedFolders.length > 0) {
          // 현재 폴더와 모든 상위 폴더를 결과에 추가
          result.folders.push(...currentPath);
          
          // 검색어와 일치하는 폴더라면 matchedFolders에 추가
          if (matchesQuery) {
            result.matchedFolders.push(item.id);
          }
          
          // 하위 항목의 결과도 추가
          result.files.push(...childResults.files);
          result.matchedFolders.push(...childResults.matchedFolders);
        }
      } else {
        // 파일인 경우
        if (matchesQuery) {
          result.files.push(item.fileName || '');
          // 파일이 검색어와 일치하면 모든 상위 폴더를 결과에 추가
          result.folders.push(...parentIds);
        }
      }
    });
    return result;
  };

  const searchResult = traverse(items);
  
  // 중복 제거
  return {
    files: Array.from(new Set(searchResult.files)),
    folders: Array.from(new Set(searchResult.folders)),
    matchedFolders: Array.from(new Set(searchResult.matchedFolders))
  };
};

const useCategoryStore = create<CategoryState>((set, get) => ({
  openFolders: {},
  searchQuery: "",
  selectedFile: null,
  lastOpenedFolders: {},

  setOpenFolders: (openFolders) => set({ openFolders }),
  
  toggleFolder: (id) => 
    set((state) => ({
      openFolders: {
        ...state.openFolders,
        [id]: !state.openFolders[id],
      },
      lastOpenedFolders: state.searchQuery ? state.lastOpenedFolders : {
        ...state.lastOpenedFolders,
        [id]: !state.openFolders[id],
      },
    })),

  setSearchQuery: (query) => {
    set({ searchQuery: query });
    if (!query) {
      set((state) => ({ openFolders: state.lastOpenedFolders }));
    } else {
      get().searchFiles(query);
    }
  },
  
  setSelectedFile: (fileName) => set({ selectedFile: fileName }),
  
  expandAll: () => {
    const allOpen: { [key: string]: boolean } = {};
    const traverse = (items: CategoryItem[]) => {
      items.forEach((item) => {
        if (item.children) {
          allOpen[item.id] = true;
          traverse(item.children);
        }
      });
    };
    traverse(categoryData);
    
    // searchQuery가 있을 때는 lastOpenedFolders를 유지
    set((state) => ({
      openFolders: allOpen,
      lastOpenedFolders: state.searchQuery ? state.lastOpenedFolders : allOpen
    }));
  },
  
  collapseAll: () => {
    // searchQuery가 있을 때는 lastOpenedFolders를 유지
    set((state) => ({
      openFolders: {},
      lastOpenedFolders: state.searchQuery ? state.lastOpenedFolders : {}
    }));
  },

  searchFiles: (query: string) => {
    const { folders } = findMatchingItems(categoryData, query);
    
    const openFolders: { [key: string]: boolean } = {};
    folders.forEach(folderId => {
      openFolders[folderId] = true;
    });

    set({ openFolders });
  },
}));

export default useCategoryStore; 