import { create } from 'zustand';

interface NavigationState {
  isCategoryOpen: boolean;
  isLogOpen: boolean;
  isTagModalOpen: boolean;
  toggleCategory: () => void;
  toggleLog: () => void;
  toggleTagModal: () => void;
  hideAll: () => void;
}

const useNavigationStore = create<NavigationState>((set) => ({
  isCategoryOpen: false,
  isLogOpen: false,
  isTagModalOpen: false,
  toggleCategory: () => set((state) => ({ isCategoryOpen: !state.isCategoryOpen })),
  toggleLog: () => set((state) => ({ isLogOpen: !state.isLogOpen })),
  toggleTagModal: () => set((state) => ({ isTagModalOpen: !state.isTagModalOpen })),
  hideAll: () => set({ isCategoryOpen: false, isLogOpen: false, isTagModalOpen: false }),
}));

export default useNavigationStore; 