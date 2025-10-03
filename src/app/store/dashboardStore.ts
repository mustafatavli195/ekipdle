// store/dashboardStore.ts
import { create } from "zustand";
import { supabase } from "@/app/lib/supabase/supabaseClient";

interface Game {
  id: string;
  title: string;
  user_id: string;
}

interface DashboardStore {
  userId: string | null;
  email: string | null;
  games: Game[];
  loading: boolean;
  initialLoading: boolean;
  setUser: (id: string, email: string) => void;
  fetchGames: () => Promise<void>;
  createGame: (title: string) => Promise<void>;
  deleteGame: (id: string) => Promise<void>;
}

export const useDashboardStore = create<
  DashboardStore & { checkAuth: () => Promise<void>; logout: ()=>Promise<void> }
>((set, get) => ({
  userId: null,
  email: null,
  games: [],
  loading: false,
  initialLoading: true,

  setUser: (id, email) => set({ userId: id, email }),

  logout: async () => {
    await supabase.auth.signOut();
    set({ userId: null, email: null, games: [] });
    window.location.href = "/auth/login";
  },

  fetchGames: async () => {
    const { userId } = get();
    if (!userId) return;
    const { data } = await supabase
      .from("games")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    set({ games: data || [], initialLoading: false });
  },

  createGame: async (title) => {
    const { userId, games } = get();
    if (!userId) return;
    set({ loading: true });
    const { data, error } = await supabase
      .from("games")
      .insert([{ title, user_id: userId }])
      .select();
    if (!error) set({ games: [...games, ...(data || [])], loading: false });
  },

  deleteGame: async (id) => {
    const { games } = get();
    await supabase.from("friends").delete().eq("game_id", id);
    await supabase.from("games").delete().eq("id", id);
    set({ games: games.filter((g) => g.id !== id) });
  },

  checkAuth: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = "/auth/login"; // giriş yoksa yönlendir
      return;
    }
    get().setUser(user.id, user.email || "");
    await get().fetchGames();
  },
}));
