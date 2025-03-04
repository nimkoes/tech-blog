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
  setOpenFolders: (openFolders: { [key: string]: boolean }) => void;
  toggleFolder: (id: string) => void;
  setSearchQuery: (query: string) => void;
  setSelectedFile: (fileName: string | null) => void;
  expandAll: () => void;
  collapseAll: () => void;
}

const useCategoryStore = create<CategoryState>((set) => ({
  openFolders: {},
  searchQuery: "",
  selectedFile: null,

  setOpenFolders: (openFolders) => set({ openFolders }),
  
  toggleFolder: (id) => 
    set((state) => ({
      openFolders: {
        ...state.openFolders,
        [id]: !state.openFolders[id],
      },
    })),

  setSearchQuery: (query) => set({ searchQuery: query }),
  
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
}));

export default useCategoryStore; 