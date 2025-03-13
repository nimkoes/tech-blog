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

const findMatchingItems = (items: CategoryItem[], query: string): { files: string[], folders: string[] } => {
  const result = { files: [] as string[], folders: [] as string[] };
  
  const traverse = (items: CategoryItem[], parentId?: string) => {
    items.forEach((item) => {
      const matchesQuery = item.displayName.toLowerCase().includes(query.toLowerCase());

      if (item.children) {
        const childResults = traverse(item.children, item.id);
        if (childResults.files.length > 0 || matchesQuery) {
          result.folders.push(item.id);
          result.files.push(...childResults.files);
        }
      } else if (matchesQuery) {
        result.files.push(item.fileName || '');
      }
    });
    return result;
  };

  traverse(items);
  return result;
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
    set({ openFolders: allOpen });
  },
  
  collapseAll: () => set({ openFolders: {} }),

  searchFiles: (query: string) => {
    const { files, folders } = findMatchingItems(categoryData, query);
    
    const openFolders: { [key: string]: boolean } = {};
    folders.forEach(folderId => {
      openFolders[folderId] = true;
    });

    set({ openFolders });
  },
}));

export default useCategoryStore; 