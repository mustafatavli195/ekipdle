// hooks/useDashboard.ts
import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase/supabaseClient";

interface Game {
  id: string;
  title: string;
  user_id: string;
}

export function useDashboard() {
  const [email, setEmail] = useState<string | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      setInitialLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setEmail(user.email || null);
      setUserId(user.id);
      await fetchGames(user.id);
      setInitialLoading(false);
    };
    checkUser();
  }, []);

  const fetchGames = async (uid: string) => {
    const { data } = await supabase
      .from("games")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });
    setGames(data || []);
  };

  const createGame = async (title: string) => {
    if (!title || !userId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("games")
      .insert([{ title, user_id: userId }])
      .select();
    if (!error) setGames([...games, ...(data || [])]);
    setLoading(false);
  };

  const deleteGame = async (id: string) => {
    await supabase.from("friends").delete().eq("game_id", id);
    await supabase.from("games").delete().eq("id", id);
    setGames(games.filter((g) => g.id !== id));
  };

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/auth/login";
  };

  return {
    email,
    userId,
    games,
    loading,
    initialLoading,
    createGame,
    deleteGame,
    logout,
  };
}
