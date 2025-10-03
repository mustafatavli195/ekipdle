import { create } from "zustand";
import { supabase } from "@/app/lib/supabase/supabaseClient";
import { ROUTES } from "@/app/utils/constants";

interface AuthStore {
  userId: string | null;
  email: string | null;
  initialLoading: boolean;
  setUser: (id: string, email: string) => void;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  userId: null,
  email: null,
  initialLoading: true,
  setUser: (id, email) => set({ userId: id, email }),
  checkAuth: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = ROUTES.AUTH;
      return;
    }
    set({ userId: user.id, email: user.email || "", initialLoading: false });
  },
  logout: async () => {
    await supabase.auth.signOut();
    set({ userId: null, email: null });
    window.location.href = ROUTES.AUTH;
  },
}));
