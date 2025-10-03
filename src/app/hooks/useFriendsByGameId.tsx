import { useState, useEffect } from "react";
import { supabase } from "@/app/lib/supabase/supabaseClient";

export interface Friend {
  id: string;
  name: string;
  photo_url: string | null;
  game_id: string;
}

export interface GameModeWithFriends {
  id: string;
  name: string;
  friends: Friend[];
}

// Supabase’den dönen raw tipler
interface SupabaseFriend {
  id: string;
  name: string;
  photo_url: string | null;
  game_id: string;
}

interface SupabaseGame {
  friends?: SupabaseFriend[];
}

interface SupabaseGameMode {
  id: string;
  name: string;
  games?: SupabaseGame[];
}

export function useGameModesWithFriends(gameId: string) {
  const [gameModes, setGameModes] = useState<GameModeWithFriends[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!gameId) return;

    const fetchGameModes = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("game_modes")
        .select(
          `
          id,
          name,
          games (
            friends (
              id,
              name,
              photo_url,
              game_id
            )
          )
        `
        )
        .eq("game_id", gameId);

      if (error) {
        console.error("Supabase error:", error);
        setGameModes([]);
      } else {
        // Supabase nested ilişkiden sadece friends array'ini alıyoruz
        const formatted: GameModeWithFriends[] =
          data?.map((gm: SupabaseGameMode) => ({
            id: gm.id,
            name: gm.name,
            friends: gm.games?.[0]?.friends || [],
          })) || [];

        setGameModes(formatted);
      }

      setLoading(false);
    };

    fetchGameModes();
  }, [gameId]);

  return { gameModes, loading };
}
