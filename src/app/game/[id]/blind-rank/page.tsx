"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/app/lib/supabase/supabaseClient";

interface Player {
  friend_id: string;
  name: string;
  avatar?: string;
  scorePercent: number;
  first_count: number;
  second_count: number;
  third_count: number;
}

interface Mode {
  id: string;
  name: string;
  leaderboard: Player[];
}

interface Game {
  id: string;
  title?: string;
  photoUrl?: string;
}

interface ModalProps {
  show: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

interface LeaderboardRow {
  friend_id: string;
  friend_name: string;
  photo_url?: string;
  total_points: number;
  first_count: number;
  second_count: number;
  third_count: number;
}

// Basit modal bileşeni
const Modal: React.FC<ModalProps> = ({ show, onClose, children }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-96 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
};
export default function BlindRankPage() {
  const [modes, setModes] = useState<Mode[]>([]);
  const [currentModeIndex, setCurrentModeIndex] = useState(0);
  const [showPlayModal, setShowPlayModal] = useState(false);
  const [showAddModeModal, setShowAddModeModal] = useState(false);
  const [newModeName, setNewModeName] = useState("");
  const [currentGame, setCurrentGame] = useState<Game | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const router = useRouter();
  const params = useParams();
  const gameId = params.id;
  const currentMode = modes[currentModeIndex];

  // Kullanıcı bilgisi
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getSession();
      setUserId(data?.session?.user?.id ?? null);
    };
    fetchUser();
  }, []);

  // Oyun ve modları çek
  useEffect(() => {
    if (!gameId) return;

    const fetchData = async () => {
      const { data: gameData, error: gameError } = await supabase
        .from("games")
        .select("id, title, photo_url")
        .eq("id", gameId)
        .single();
      if (gameError || !gameData) return console.error(gameError);

      setCurrentGame({
        id: gameData.id,
        title: gameData.title,
        photoUrl: gameData.photo_url,
      });

      const { data: modesData, error: modesError } = await supabase
        .from("game_modes")
        .select("*")
        .eq("game_id", gameData.id)
        .order("created_at", { ascending: true });

      if (modesError) return console.error(modesError);

      setModes(
        modesData.map((mode) => ({
          id: mode.id,
          name: mode.name,
          leaderboard: [],
        }))
      );
    };

    fetchData();
  }, [gameId]);

  // Leaderboard çek
  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!currentMode?.id) return;

      try {
        const { data, error } = await supabase.rpc("blind_rank_leaderboard", {
          mode_uuid: currentMode.id,
        });

        if (error) throw error;

        const leaderboardData = Array.isArray(data) ? data : [];

        setModes((prev) =>
          prev.map((mode) =>
            mode.id === currentMode.id
              ? {
                  ...mode,
                  leaderboard: (leaderboardData as LeaderboardRow[]).map(
                    (p) => ({
                      friend_id: p.friend_id,
                      name: p.friend_name,
                      avatar: p.photo_url,
                      scorePercent: Number(p.total_points),
                      first_count: Number(p.first_count),
                      second_count: Number(p.second_count),
                      third_count: Number(p.third_count),
                    })
                  ),
                }
              : mode
          )
        );
      } catch (err) {
        console.error("RPC fetch error:", err);
      }
    };

    fetchLeaderboard();
  }, [currentMode?.id]);

  // Mode navigation
  const handleNextMode = () =>
    setCurrentModeIndex((prev) => (prev + 1) % modes.length);
  const handlePrevMode = () =>
    setCurrentModeIndex((prev) => (prev - 1 + modes.length) % modes.length);

  // Oyna
  const handlePlay = (mode: Mode) => {
    setShowPlayModal(false);
    router.push(`/game/${gameId}/blind-rank/${mode.name}`);
  };

  // Rastgele oynama
  const handleRandomPlay = () => {
    if (modes.length === 0) return;
    const randomMode = modes[Math.floor(Math.random() * modes.length)];
    router.push(`/game/${gameId}/blind-rank/${randomMode.name}`);
  };

  // Mod ekleme
  const handleAddMode = async (modeName: string) => {
    if (!userId) {
      setAlertMessage("Mod eklemek için giriş yapmalısınız.");
      return;
    }
    if (!modeName || !currentGame?.id) return;

    const { data, error } = await supabase
      .from("game_modes")
      .insert([{ name: modeName, game_id: currentGame.id, created_by: userId }])
      .select();

    if (error) return console.error(error);

    setModes((prev) => [
      ...prev,
      { id: data[0].id, name: data[0].name, leaderboard: [] },
    ]);
    setNewModeName("");
    setShowAddModeModal(false);
    setAlertMessage(null);
  };

  return (
    <main className="min-h-screen p-6 max-w-7xl mx-auto font-comic rounded-2xl text-gray-900 bg-gray-50 flex justify-center backdrop-blur-md">
      <div className="flex gap-12 bg-white/30 backdrop-blur-md p-8 rounded-2xl w-full">
        {/* Left */}
        <div className="w-1/3 flex flex-col items-center gap-6">
          <div className="w-full h-64 rounded-xl mb-4 flex items-center justify-center overflow-hidden relative">
            {currentGame?.photoUrl && (
              <img
                src={currentGame?.photoUrl}
                alt={currentGame?.title}
                className="absolute inset-0 w-full h-full object-cover blur-3xl scale-125"
              />
            )}

            <div className="relative z-10 flex items-center justify-center w-full h-full">
              {currentGame?.photoUrl && (
                <img
                  src={currentGame?.photoUrl}
                  alt={currentGame?.title}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                />
              )}
            </div>
          </div>

          {/* Oyna Butonu (CTA) */}
          <button
            onClick={() => setShowPlayModal(true)}
            className="w-64 py-4 text-2xl bg-[#007BFF] text-white font-bold rounded cursor-pointer transition-all duration-300 ease-in-out hover:scale-105 hover:bg-[#0056b3]"
          >
            Oyna
          </button>

          {/* Rastgele Oyna */}
          <button
            onClick={handleRandomPlay}
            className="w-64 py-4 text-xl bg-[#1D2242] text-white rounded cursor-pointer hover:bg-[#13173A] transition-colors duration-300 ease-in-out"
          >
            Rastgele Oyna
          </button>

          {/* Mod Ekle */}
          <button
            onClick={() => setShowAddModeModal(true)}
            className="w-64 py-3 text-lg bg-[#1D2242] text-white rounded cursor-pointer hover:bg-[#13173A] transition-colors duration-300 ease-in-out"
          >
            Mod Ekle
          </button>
        </div>

        {/* Right */}
        <div className="w-2/3 flex flex-col gap-6">
          <h1 className="text-6xl font-bold">
            {currentGame?.title || "Oyunun Adı"}
          </h1>

          {/* Leaderboard */}
          {currentMode && (
            <div className="mt-6">
              {/* Başlık ve mod değiştirme butonları */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={handlePrevMode}
                  className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400 transition"
                >
                  ←
                </button>
                <h2 className="text-xl font-bold text-[#13173A]">
                  {currentMode.name} Leaderboard
                </h2>
                <button
                  onClick={handleNextMode}
                  className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400 transition"
                >
                  →
                </button>
              </div>

              {/* Liste */}
              <div className="space-y-2">
                {currentMode.leaderboard.length === 0 ? (
                  <p className="text-gray-600">Leaderboard boş</p>
                ) : (
                  currentMode.leaderboard.map((player, idx) => {
                    const maxScore =
                      currentMode.leaderboard[0]?.scorePercent || 1;
                    const widthPercent = (player.scorePercent / maxScore) * 100;

                    return (
                      <div
                        key={player.friend_id}
                        className="flex items-center gap-3 py-2"
                      >
                        {/* Sıra */}
                        <span className="w-6 text-[#13173A] font-bold">
                          {idx + 1}.
                        </span>

                        {/* Avatar */}
                        <img
                          src={player.avatar || "/default-avatar.png"}
                          alt={player.name}
                          className="w-10 h-10 rounded-full object-cover border-2 border-[#13173A]"
                        />

                        {/* İsim */}
                        <span className="flex-1 text-[#13173A] font-medium truncate">
                          {player.name}
                        </span>

                        {/* Progress bar */}
                        <div className="flex-1 bg-gray-200 h-5 rounded-full relative overflow-hidden">
                          <div
                            className="bg-[#13173A] h-5 rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-1 text-white text-xs font-semibold"
                            style={{ width: `${widthPercent}%` }}
                          >
                            {Math.round(widthPercent)}%
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      {/* PLAY MODAL */}
      {showPlayModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-start justify-center z-50"
          onClick={() => setShowPlayModal(false)}
        >
          <div
            className="mt-20 bg-white rounded-lg max-w-md w-full p-6 relative"
            onClick={(e) => e.stopPropagation()} // Modal içi tıklamada kapanmasın
          >
            <h2 className="text-2xl font-bold mb-4 text-[#007BFF]">Mod Seç</h2>
            {modes.length === 0 ? (
              <p className="text-gray-600">Mod bulunamadı</p>
            ) : (
              modes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => handlePlay(mode)}
                  className="w-full py-3 mb-2 bg-[#1D2242] text-white rounded transition-all duration-300 ease-in-out hover:scale-105 hover:bg-[#13173A]"
                >
                  {mode.name}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* ADD MODE MODAL */}
      {showAddModeModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-start justify-center z-50"
          onClick={() => setShowAddModeModal(false)}
        >
          <div
            className="mt-20 bg-white rounded-lg max-w-md w-full p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-4 text-[#007BFF]">
              Yeni Mod Ekle
            </h2>
            <input
              type="text"
              value={newModeName}
              onChange={(e) => setNewModeName(e.target.value)}
              className="w-full mb-4 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#007BFF]"
              placeholder="Mod adı girin"
            />
            <button
              onClick={() => handleAddMode(newModeName)}
              className="w-full py-3 bg-[#1D2242] text-white rounded transition-all duration-300 ease-in-out hover:scale-105 hover:bg-[#13173A]"
            >
              Ekle
            </button>
            {alertMessage && (
              <p className="text-red-600 mt-2">{alertMessage}</p>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
