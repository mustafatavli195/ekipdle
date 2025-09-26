// app/store/homeStore.ts
import { create } from "zustand";

interface HomeStore {
  showSettings: boolean;
  showLanguage: boolean;
  loading: boolean;
  setShowSettings: (val: boolean) => void;
  setShowLanguage: (val: boolean) => void;
  setLoading: (val: boolean) => void;
}

export const useHomeStore = create<HomeStore>((set) => ({
  showSettings: false,
  showLanguage: false,
  loading: true,
  setShowSettings: (val) => set({ showSettings: val }),
  setShowLanguage: (val) => set({ showLanguage: val }),
  setLoading: (val) => set({ loading: val }),
}));
