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
  game_id: string;
  friends: Friend[];
}

// Supabase’den gelen raw tipler
interface SupabaseGameMode {
  id: string;
  name: string;
  game_id: string;
}

export function useGameModesWithFriends(gameId: string) {
  const [gameModes, setGameModes] = useState<GameModeWithFriends[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!gameId) return;

    const fetchGameModesWithFriends = async () => {
      setLoading(true);

      try {
        // 1️⃣ game_modes çek
        const { data: modes, error: modesError } = await supabase
          .from("game_modes")
          .select("id, name, game_id")
          .eq("game_id", gameId);

        if (modesError || !modes)
          throw modesError || new Error("Modlar bulunamadı");

        // 2️⃣ friends çek
        const { data: friends, error: friendsError } = await supabase
          .from("friends")
          .select("id, name, photo_url, game_id")
          .eq("game_id", gameId);

        if (friendsError || !friends)
          throw friendsError || new Error("Arkadaşlar bulunamadı");

        // 3️⃣ her mod için arkadaşları eşleştir
        const formatted: GameModeWithFriends[] = modes.map(
          (mode: SupabaseGameMode) => ({
            id: mode.id,
            name: mode.name,
            game_id: mode.game_id,
            friends: friends.filter((f) => f.game_id === mode.game_id),
          })
        );

        console.log("Fetched GameModes with Friends:", formatted);
        setGameModes(formatted);
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Bilinmeyen hata";
        console.error("Error fetching game modes with friends:", message);
        setGameModes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGameModesWithFriends();
  }, [gameId]);

  return { gameModes, loading };
}
