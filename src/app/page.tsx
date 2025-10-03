"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/app/lib/supabase/supabaseClient";
import { useRouter } from "next/navigation";
import LoadingOverlay from "@/app/components/Common/LoadingOverlay";

interface Game {
  id: string;
  title: string;
  created_at: string;
  photo_url?: string; // <-- eklendi
}

export default function HomePage() {
  const [games, setGames] = useState<Game[]>([]);
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const router = useRouter();

  const fetchGames = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("games")
      .select("id, title, created_at, photo_url") // <-- fotoğrafı çekiyoruz
      .order("created_at", { ascending: sortOrder === "asc" });

    if (error) console.log("Supabase error:", error);
    else setGames(data || []);
    setLoading(false);
  }, [sortOrder]);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  useEffect(() => {
    const filtered = games.filter((game) =>
      game.title.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredGames(filtered);
  }, [search, games]);

  if (loading) return <LoadingOverlay />;

  return (
    <main className="min-h-screen p-6 font-comic text-gray-900">
      {/* Search + Filter */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 w-full max-w-2xl mx-auto mb-18">
        <div className="relative w-full md:w-2/3">
          {/* Büyüteç ikonu */}
          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 text-xl transition-colors group-focus-within:text-purple-500">
            🔍
          </span>
          <input
            type="text"
            placeholder="Oyun Ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-14 pr-4 h-14 rounded-lg border border-gray-300 bg-white/90 shadow-md focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-500 transition placeholder:text-gray-400 placeholder:italic text-lg"
          />
        </div>

        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
          className="w-full md:w-1/3 px-4 h-14 rounded-lg border border-gray-300 bg-white/90 shadow-md focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-500 transition text-lg"
        >
          <option value="desc">Son yüklenenler</option>
          <option value="asc">İlk yüklenenler</option>
        </select>
      </div>

      {/* Oyun Kartları */}
      {filteredGames.length === 0 ? (
        <p className="text-gray-500 text-center mt-24 font-bold text-lg">
          Henüz oyun yok 😢
        </p>
      ) : (
        <div className="flex flex-wrap justify-center gap-8">
          {filteredGames.map((game) => (
            <div
              key={game.id}
              onClick={() => router.push(`/game/${game.id}/`)}
              className="cursor-pointer rounded-3xl border-2 border-purple-300 overflow-hidden hover:shadow-2xl transform hover:scale-105 transition-all duration-300
                         w-[320px] sm:w-[350px] md:w-[380px] lg:w-[400px]"
            >
              {/* Üst kısım: Fotoğraf */}
              <div className="relative w-full h-56 rounded-xl overflow-hidden">
                {/* Blur arka plan */}
                {game.photo_url && (
                  <img
                    src={game.photo_url}
                    alt={game.title}
                    className="absolute inset-0 w-full h-full object-cover blur-3xl scale-125"
                  />
                )}

                {/* Ön taraftaki asıl foto */}
                <div className="relative z-10 flex items-center justify-center w-full h-full">
                  {game.photo_url ? (
                    <img
                      src={game.photo_url}
                      alt={game.title}
                      className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                    />
                  ) : (
                    <span className="text-gray-500 text-lg">
                      Placeholder Fotoğraf
                    </span>
                  )}
                </div>
              </div>

              {/* Alt kısım: Oyun bilgileri */}
              <div className="p-6 bg-purple-100/20 backdrop-blur-sm flex flex-col flex-1">
                <h2 className="text-3xl font-bold mb-2 text-purple-700">
                  {game.title}
                </h2>
                <p className="text-purple-500 text-lg">
                  Oluşturulma Tarihi:{" "}
                  {new Date(game.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
