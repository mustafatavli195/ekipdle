import { create } from "zustand";
import { supabase } from "@/app/lib/supabase/supabaseClient";
import { Friend, RawFriend } from "@/app/types/types";

// Oyun tipi
export interface Game {
  id: string;
  title: string;
  created_at: string;
}

interface GameStore {
  // Games
  games: Game[];
  fetchGames: (userId: string) => Promise<void>;

  // Friends & Secret Friend (oyun içi)
  friends: Friend[];
  secretFriend: Friend | null;
  guesses: Friend[];
  gameOver: boolean;

  // Loading state
  loading: boolean;

  // Fonksiyonlar
  fetchFriends: (gameId: string) => Promise<void>;
  handleGuess: (name: string) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  // Games
  games: [],
  fetchGames: async (userId: string) => {
    set({ loading: true });
    const { data } = await supabase
      .from("games")
      .select("*")
      .eq("user_id", userId);
    set({ games: data || [], loading: false });
  },

  // Friends
  friends: [],
  secretFriend: null,
  guesses: [],
  gameOver: false,

  fetchFriends: async (gameId: string) => {
    set({ loading: true });
    const { data } = await supabase
      .from("friends")
      .select(`*, friend_interests (interests (name))`)
      .eq("game_id", gameId);

    if (!data || data.length === 0) {
      set({ friends: [], secretFriend: null, loading: false });
      return;
    }

    const normalized: Friend[] = (data as RawFriend[]).map((f) => ({
      ...f,
      interests: f.friend_interests?.map((fi) => fi.interests.name) || [],
    }));

    set({
      friends: normalized,
      secretFriend: normalized[Math.floor(Math.random() * normalized.length)],
      loading: false,
    });
  },

  handleGuess: (name: string) => {
    const { secretFriend, friends, guesses, gameOver } = get();
    if (!secretFriend || gameOver) return;

    const guessed = friends.find(
      (f) => f.name.toLowerCase() === name.toLowerCase()
    );
    if (!guessed) return;

    set({ guesses: [guessed, ...guesses] });

    if (guessed.id === secretFriend.id) set({ gameOver: true });
  },

  resetGame: () => {
    const { friends } = get();
    set({ guesses: [], gameOver: false });
    if (friends.length > 0) {
      const random = friends[Math.floor(Math.random() * friends.length)];
      set({ secretFriend: random });
    }
  },

  // Loading state
  loading: false,
}));
