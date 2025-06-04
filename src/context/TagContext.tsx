import { createContext, useContext } from 'react';

export const TagContext = createContext<any>(null);
export const useTagContext = () => useContext(TagContext); 