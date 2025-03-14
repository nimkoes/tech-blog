import { create } from 'zustand';

interface LogState {
  logs: string[];
  addLog: (message: string) => void;
  clearLogs: () => void;
  setLogs: (logs: string[]) => void;
}

const MAX_LOGS = 30;
const STORAGE_KEY = 'nktbsdb';

export const useLogStore = create<LogState>((set) => ({
  logs: [],
  addLog: (message) => set((state) => {
    const newLogs = [...state.logs, message];
    const trimmedLogs = newLogs.slice(-MAX_LOGS);
    
    // 로컬 스토리지에 저장
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedLogs));
    }
    
    return { logs: trimmedLogs };
  }),
  clearLogs: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    set({ logs: [] });
  },
  setLogs: (logs) => set({ logs }),
})); 