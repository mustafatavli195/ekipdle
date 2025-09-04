"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import { useRouter } from "next/navigation";

interface Game {
  id: string;
  title: string;
  user_id: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.replace("/auth");
      else {
        setEmail(user.email || null);
        setUserId(user.id);
        fetchGames(user.id);
      }
    });
  }, [router]);

  const fetchGames = async (uid: string) => {
    const { data } = await supabase
      .from("games")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });
    setGames(data || []);
  };

  const createGame = async () => {
    if (!newTitle) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("games")
      .insert([{ title: newTitle, user_id: userId }])
      .select();
    if (error) console.log(error);
    else setGames([...games, ...(data || [])]);
    setNewTitle("");
    setLoading(false);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    router.replace("/auth");
  };

  const deleteGame = async (id: string) => {
    if (!confirm("Bu oyunu silmek istediğine emin misin?")) return;
    // Önce ilgili arkadaşları silmek gerekiyor
    await supabase.from("friends").delete().eq("game_id", id);

    const { error } = await supabase.from("games").delete().eq("id", id);
    if (error) console.log(error);
    else setGames(games.filter((g) => g.id !== id));
  };

  return (
    <main className="min-h-screen bg-gray-900 text-gray-100 p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <button
          onClick={logout}
          className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded-lg transition"
        >
          Çıkış
        </button>
      </div>

      <p className="mb-6 text-gray-400">Hoş geldin {email}</p>

      <div className="mb-6 flex gap-2">
        <input
          type="text"
          placeholder="Yeni oyun adı"
          className="flex-1 border border-gray-700 rounded-lg px-3 py-2 bg-gray-800 text-gray-100 focus:outline-purple-400"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <button
          onClick={createGame}
          disabled={loading}
          className="border border-gray-700 rounded-lg px-3 py-2 bg-purple-600 hover:bg-purple-700 transition text-white"
        >
          {loading ? "Ekleniyor..." : "Oyun Ekle"}
        </button>
      </div>

      <ul className="space-y-3">
        {games.map((game) => (
          <li
            key={game.id}
            className="border border-gray-700 rounded-xl p-4 bg-gray-800 hover:bg-gradient-to-r hover:from-purple-700 hover:to-indigo-700 cursor-pointer transition shadow-lg flex justify-between items-center"
            onClick={() => router.push(`/game/${game.id}/manage`)}
          >
            <span className="font-bold text-lg">{game.title}</span>

            {game.user_id === userId && (
              <button
                onClick={(e) => {
                  e.stopPropagation(); // satır tıklamasını engelle
                  deleteGame(game.id);
                }}
                className="ml-4 px-4 py-1 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg text-sm font-semibold 
                           shadow-md hover:shadow-lg hover:-translate-y-1 transform transition-all duration-200 cursor-pointer
                           hover:from-red-700 hover:to-red-900"
              >
                Sil
              </button>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
