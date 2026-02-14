import { createContext, useContext } from 'react';
import type { Dispatch, SetStateAction } from 'react';

export interface TagContextValue {
  selectedTags: string[];
  setSelectedTags: Dispatch<SetStateAction<string[]>>;
  handleTagSelect: (tag: string) => void;
  toastMessage: string;
  setToastMessage: (message: string) => void;
}

export const TagContext = createContext<TagContextValue | undefined>(undefined);

export const useTagContext = () => {
  const ctx = useContext(TagContext);
  if (!ctx) {
    throw new Error('useTagContext must be used within TagContext.Provider');
  }
  return ctx;
};
