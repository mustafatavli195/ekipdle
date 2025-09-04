"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import { useRouter } from "next/navigation";

interface Game {
  id: string;
  title: string;
  created_at: string;
}

export default function Home() {
  const [games, setGames] = useState<Game[]>([]);
  const router = useRouter();

  const fetchGames = useCallback(async () => {
    const { data, error } = await supabase
      .from("games")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) console.log("Supabase error:", error);
    else setGames(data || []);
  }, []);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-6 max-w-5xl mx-auto font-comic text-gray-900 rounded-3xl">
      <h1 className="text-5xl font-bold mb-10 text-center text-purple-600">
        Tüm Oyunlar
      </h1>
      <hr />
      <br />

      {games.length === 0 ? (
        <p className="text-gray-500 text-center mt-24 font-bold text-lg">
          Henüz oyun yok 😢
        </p>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {games.map((game) => (
            <li
              key={game.id}
              onClick={() => router.push(`/game/${game.id}/`)}
              className="cursor-pointer rounded-3xl p-6 bg-white/40 border-2 border-purple-300 hover:bg-white/60 hover:shadow-xl transform hover:scale-105 transition-all duration-300 backdrop-blur-sm"
            >
              <h2 className="text-2xl font-bold mb-2 text-purple-700">
                {game.title}
              </h2>
              <p className="text-purple-500 text-sm">
                {new Date(game.created_at).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
