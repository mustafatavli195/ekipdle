import { useState, useEffect } from "react";
import { supabase } from "@/app/lib/supabase/supabaseClient";

export interface Game {
  id: string;
  title: string;
  created_at: string;
}

export function useGames(userId?: string) {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchGames = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("games")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) console.error("Supabase error:", error);
      else setGames(data || []);
      setLoading(false);
    };

    fetchGames();
  }, [userId]);

  return { games, loading };
}
