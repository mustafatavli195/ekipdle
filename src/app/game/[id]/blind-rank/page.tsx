"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/app/lib/supabase/supabaseClient";

interface Player {
  name: string;
  scorePercent: number;
  avatar?: string;
}

interface Mode {
  id: string;
  name: string;
  leaderboard: Player[];
}

interface Game {
  title?: string; // title ekledik
  photoUrl?: string; // optional ekle
}

export default function BlindRankPage() {
  const [modes, setModes] = useState<Mode[]>([]);
  const [currentModeIndex, setCurrentModeIndex] = useState(0);
  const [showPlayModal, setShowPlayModal] = useState(false);
  const [showAddModeModal, setShowAddModeModal] = useState(false);
  const [newModeName, setNewModeName] = useState("");
  const [currentGame, setCurrentGame] = useState<Game>({});

  const router = useRouter();
  const currentMode = modes[currentModeIndex];

  // Sayfa açıldığında modları çek
  useEffect(() => {
    const fetchData = async () => {
      // Modları çek
      const { data: modesData, error: modesError } = await supabase
        .from("modes")
        .select("*")
        .order("created_at", { ascending: true });

      if (modesError) {
        console.error(modesError);
        return;
      }

      setModes(
        modesData.map((mode) => ({
          ...mode,
          leaderboard: Array.from({ length: 10 }, (_, i) => ({
            name: `Player ${i + 1}`,
            scorePercent: Math.floor(Math.random() * 100),
            avatar: `https://i.pravatar.cc/150?img=${
              i + 1 + Math.floor(Math.random() * 50)
            }`,
          })),
        }))
      );

      // Games tablosundan oyun bilgilerini çek
      const { data: gamesData, error: gamesError } = await supabase
        .from("games")
        .select("id, title, photo_url");

      if (gamesError) {
        console.error(gamesError);
        return;
      }

      if (gamesData && gamesData.length > 0) {
        // İlk oyunu default olarak göster
        setCurrentGame({
          title: gamesData[0].title,
          photoUrl: gamesData[0].photo_url,
        });
      }
    };

    fetchData();
  }, []);

  // Mod ekleme fonksiyonu
  const handleAddMode = async (modeName: string) => {
    if (!modeName) return;

    const { data, error } = await supabase
      .from("modes")
      .insert([{ name: modeName }])
      .select();

    if (error) {
      console.error(error);
      return;
    }

    setModes((prev) => [
      ...prev,
      { id: data[0].id, name: data[0].name, leaderboard: [] },
    ]);
    setNewModeName("");
    setShowAddModeModal(false);
  };

  // Mod değişimi
  const handleNextMode = () =>
    setCurrentModeIndex((prev) => (prev + 1) % modes.length);
  const handlePrevMode = () =>
    setCurrentModeIndex((prev) => (prev - 1 + modes.length) % modes.length);

  // Oyna butonu
  const handlePlay = (mode: Mode) => {
    setShowPlayModal(false);
    const gameId = uuidv4();
    router.push(`/game/${gameId}/blind-rank/${encodeURIComponent(mode.name)}`);
  };

  // Rastgele oyna
  const handleRandomPlay = () => {
    const randomMode = modes[Math.floor(Math.random() * modes.length)];
    const gameId = uuidv4();
    router.push(
      `/game/${gameId}/blind-rank/${encodeURIComponent(randomMode.name)}`
    );
  };

  return (
    <main className="min-h-screen p-6 max-w-7xl mx-auto font-comic rounded-2xl text-gray-900 bg-gray-50 flex justify-center">
      <div className="flex gap-12 bg-white/30 backdrop-blur-md p-8 rounded-2xl w-full">
        {/* Sol taraf */}
        <div className="w-1/3 flex flex-col items-center gap-6">
          <div className="w-64 h-64 bg-gray-300 rounded-lg mb-4 flex items-center justify-center">
            {currentGame?.photoUrl ? (
              <img
                src={currentGame.photoUrl}
                alt={currentGame.title}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <span className="text-gray-600 text-lg">Game Image</span>
            )}
          </div>
          <button
            onClick={() => setShowPlayModal(true)}
            className="w-64 py-4 text-xl bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Oyna
          </button>
          <button
            onClick={handleRandomPlay}
            className="w-64 py-4 text-xl bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            🎲 Rastgele Oyna
          </button>
          <button
            onClick={() => setShowAddModeModal(true)}
            className="w-64 py-3 text-lg bg-green-600 text-white rounded hover:bg-green-700"
          >
            ➕ Mod Ekle
          </button>
        </div>

        {/* Sağ taraf */}
        <div className="w-2/3 flex flex-col gap-6">
          <h1 className="text-4xl font-bold text-purple-700">
            {currentGame?.title || "Oyunun Adı"}
          </h1>
          <p className="text-gray-700">
            Yapımcı: <span className="font-semibold">Ali Veli</span>
          </p>
          <p className="text-gray-700">
            Kategori: <span className="font-semibold">Zeka Oyunu</span>
          </p>
          <p className="text-gray-700">
            Açıklama:{" "}
            <span className="font-semibold">
              Bu oyun, arkadaşlarınızı tahmin etme oyunu.
            </span>
          </p>

          {/* Leaderboard */}
          {currentMode && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={handlePrevMode}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  ←
                </button>
                <h2 className="text-2xl font-bold">
                  {currentMode.name} Leaderboard
                </h2>
                <button
                  onClick={handleNextMode}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  →
                </button>
              </div>

              <div className="space-y-4">
                {currentMode.leaderboard
                  .sort((a, b) => b.scorePercent - a.scorePercent)
                  .slice(0, 10)
                  .map((player, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <span className="w-8 text-lg font-bold">{idx + 1}.</span>
                      <img
                        src={player.avatar}
                        alt={player.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <span className="flex-1 text-lg">{player.name}</span>
                      <div className="flex-1 bg-gray-300 h-6 rounded-full relative">
                        <div
                          className="bg-purple-600 h-6 rounded-full"
                          style={{ width: `${player.scorePercent}%` }}
                        ></div>
                      </div>
                      <span className="w-16 text-right font-semibold">
                        {player.scorePercent}%
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mod Seçimi Modal */}
      {showPlayModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-xl font-bold mb-4">Mod Seçimi</h3>
            {modes.map((mode) => (
              <div
                key={mode.id}
                onClick={() => handlePlay(mode)}
                className="py-2 px-3 mb-2 bg-gray-100 rounded hover:bg-gray-200 cursor-pointer"
              >
                {mode.name}
              </div>
            ))}
            <button
              onClick={() => setShowPlayModal(false)}
              className="mt-4 w-full py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Kapat
            </button>
          </div>
        </div>
      )}

      {/* Mod Ekleme Modal */}
      {showAddModeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-xl font-bold mb-4">Yeni Mod Ekle</h3>
            <input
              type="text"
              placeholder="Mod Adı"
              className="w-full mb-4 p-2 border border-gray-300 rounded"
              value={newModeName}
              onChange={(e) => setNewModeName(e.target.value)}
            />
            <button
              onClick={() => handleAddMode(newModeName)}
              className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Ekle
            </button>
            <button
              onClick={() => setShowAddModeModal(false)}
              className="mt-2 w-full py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Kapat
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
