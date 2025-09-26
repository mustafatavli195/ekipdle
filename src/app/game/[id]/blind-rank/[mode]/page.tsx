"use client";
import { useState, useEffect } from "react";
import { useFriends, Friend } from "@/app/hooks/useFriends";
import { supabase } from "@/app/lib/supabase/supabaseClient";
import { usePathname } from "next/navigation";

type LeaderboardEntry = {
  position: number;
  friend_name: string;
  photo_url: string | null;
};

type BlindRankResultWithFriend = {
  position: number;
  friend_id: string;
  friends: {
    name: string;
    photo_url: string | null;
  }[]; // Dizi olarak
};

export default function BlindRankGamePage() {
  const { friends, loading } = useFriends();
  const pathname = usePathname(); // /game/<gameId>/blind-rank/<mode>
  const parts = pathname.split("/");
  const modeName = decodeURIComponent(parts[parts.length - 1]);

  const [characters, setCharacters] = useState<Friend[]>([]); // kalan karakterler
  const [currentChar, setCurrentChar] = useState<Friend | null>(null);
  const [placements, setPlacements] = useState<(Friend | null)[]>(
    Array(10).fill(null)
  );
  const [gameOver, setGameOver] = useState(false);
  const [rolling, setRolling] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  // Supabase’den gelen karakterleri shuffle edip başlat
  useEffect(() => {
    if (!loading && friends.length > 0) {
      const shuffled = [...friends]
        .sort(() => Math.random() - 0.5)
        .slice(0, 10); // 10 karakter al
      setCharacters(shuffled);
      setPlacements(Array(10).fill(null));
    }
  }, [loading, friends]);

  // Karakter ruleti
  const startRoll = () => {
    if (rolling || gameOver || characters.length === 0) return;

    setRolling(true);
    let i = 0;
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * characters.length);
      setCurrentChar(characters[randomIndex]);
      i++;
      if (i > 20) {
        clearInterval(interval);
        setRolling(false);
      }
    }, 100);
  };

  // Karakteri kutuya yerleştir ve kaydet
  const handlePlaceCharacter = async (index: number) => {
    if (rolling || !currentChar) return;

    const newPlacements = [...placements];
    if (!newPlacements[index]) {
      newPlacements[index] = currentChar;

      // Karakteri kalanlardan çıkar
      const newCharacters = characters.filter((c) => c.id !== currentChar.id);
      setCharacters(newCharacters);
      setPlacements(newPlacements);

      if (newPlacements.filter(Boolean).length >= placements.length) {
        setGameOver(true);
        setCurrentChar(null);
        await saveResults(newPlacements);
        fetchLeaderboard();
      } else {
        startRoll();
      }
    }
  };

  // Başlangıçta bir karakter göster
  useEffect(() => {
    if (characters.length > 0) startRoll();
  }, [characters]);

  // Sonuçları Supabase'e kaydet
  const saveResults = async (placementsToSave: (Friend | null)[]) => {
    const gameId = crypto.randomUUID();
    const results = placementsToSave.filter(Boolean).map((char, idx) => ({
      game_id: gameId,
      friend_id: char!.id,
      position: idx + 1,
    }));

    const { data, error } = await supabase
      .from("blind_rank_results")
      .insert(results);

    if (error) console.error("Save results error:", error);
    else console.log("Results saved:", data);
  };

  // Leaderboard fetch
  const fetchLeaderboard = async () => {
    const { data, error } = await supabase
      .from("blind_rank_results")
      .select(`position, friend_id, friends(name, photo_url)`)
      .order("position", { ascending: true })
      .limit(10);

    if (error) console.error(error);
    else {
      const mapped: LeaderboardEntry[] =
        data?.map((item: BlindRankResultWithFriend) => {
          const friend = item.friends[0]; // ilk elemanı alıyoruz
          return {
            position: item.position,
            friend_name: friend?.name ?? "Unknown",
            photo_url: friend?.photo_url ?? null,
          };
        }) || [];

      setLeaderboard(mapped);
    }
  };

  return (
    <main className="min-h-screen flex flex-col md:flex-row gap-8 p-6 max-w-7xl mx-auto font-comic text-white">
      {/* Sol taraf: kutular */}
      <div className="flex flex-col gap-4 w-1/4">
        {placements.map((char, idx) => (
          <div
            key={idx}
            onClick={() => handlePlaceCharacter(idx)}
            className="w-16 h-16 bg-gray-700 rounded-md flex items-center justify-center cursor-pointer hover:bg-gray-600 border-2 border-gray-400 overflow-hidden"
          >
            {char && (
              <img
                src={char.photo_url ?? ""}
                alt={char.name}
                className="w-full h-full object-cover"
              />
            )}
          </div>
        ))}
      </div>

      {/* Orta: karakter ruleti */}
      <div className="flex-1 flex flex-col items-center gap-4">
        {!gameOver && currentChar && (
          <>
            <h2 className="text-2xl font-bold">{modeName}</h2>
            <div className="flex flex-col items-center gap-2">
              <img
                src={currentChar.photo_url ?? ""}
                alt={currentChar.name}
                className={`w-48 h-48 rounded-lg object-cover shadow-lg transition-transform duration-100 ${
                  rolling ? "scale-110" : ""
                }`}
              />
              <p className="text-xl font-semibold mt-2">{currentChar.name}</p>
            </div>
            <p className="mt-2 text-gray-300">
              Kutulardan birine tıklayarak bu karakteri yerleştirin
            </p>
          </>
        )}
      </div>

      {/* Oyun Bitti Modal */}
      {gameOver && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 text-white p-6 rounded-xl w-[400px] max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 text-center">
              Blind Rank Bitti!
            </h2>
            <p className="mb-4 text-center">Kör sıralamanız:</p>
            <div className="flex flex-col gap-2">
              {placements.map((char, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 bg-purple-800 p-2 rounded"
                >
                  <span className="w-8 font-bold">{idx + 1}.</span>
                  {char && (
                    <img
                      src={char.photo_url ?? ""}
                      alt={char.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  )}
                  <span>{char?.name}</span>
                </div>
              ))}
            </div>

            {/* Leaderboard */}
            {leaderboard.length > 0 && (
              <div className="mt-4">
                <h3 className="text-lg font-bold mb-2 text-center">
                  Leaderboard
                </h3>
                {leaderboard.map((entry, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-4 bg-purple-700 p-2 rounded"
                  >
                    <span className="w-8 font-bold">{idx + 1}.</span>
                    <img
                      src={entry.photo_url ?? ""}
                      alt={entry.friend_name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <span>{entry.friend_name}</span>
                    <span className="ml-auto">{entry.position}</span>
                  </div>
                ))}
              </div>
            )}

            <button
              className="mt-6 w-full py-2 bg-red-600 hover:bg-red-700 rounded"
              onClick={() => window.location.reload()}
            >
              Tekrar Oyna
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
