"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoadingOverlay from "@/app/components/Common/LoadingOverlay";
import GameCard from "@/app/components/Game/GameCard";
import { supabase } from "@/app/lib/supabase/supabaseClient";
import { useGameStore } from "@/app/store/gameStore";

export default function MyGamesPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();
  const { games, loading, fetchGames } = useGameStore();

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUserId(data.user.id);
        fetchGames(data.user.id); // store üzerinden fetch
      } else router.push("/auth/login");
    };
    fetchUser();
  }, [router, fetchGames]);

  if (loading) return <LoadingOverlay />;

  if (games.length === 0)
    return (
      <main className="min-h-screen p-6 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 font-comic flex flex-col items-center justify-center">
        <h1 className="text-5xl font-bold mb-6 text-center text-purple-600">
          Oyunlarım
        </h1>
        <p className="text-gray-500 text-center font-bold text-lg mt-6">
          Henüz oyun oluşturmadın 😢
        </p>
      </main>
    );

  return (
    <main className="min-h-screen p-6 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 font-comic">
      <h1 className="text-5xl font-bold mb-10 text-center text-purple-600">
        Oyunlarım
      </h1>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {games.map((game) => (
          <GameCard
            key={game.id}
            id={game.id}
            title={game.title}
            createdAt={game.created_at}
          />
        ))}
      </ul>
    </main>
  );
}
