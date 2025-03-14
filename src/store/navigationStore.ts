import { create } from 'zustand';

interface NavigationState {
  isCategoryOpen: boolean;
  isLogOpen: boolean;
  toggleCategory: () => void;
  toggleLog: () => void;
  hideAll: () => void;
}

const useNavigationStore = create<NavigationState>((set) => ({
  isCategoryOpen: false,
  isLogOpen: false,
  toggleCategory: () => set((state) => ({ isCategoryOpen: !state.isCategoryOpen })),
  toggleLog: () => set((state) => ({ isLogOpen: !state.isLogOpen })),
  hideAll: () => set({ isCategoryOpen: false, isLogOpen: false }),
}));

export default useNavigationStore; 