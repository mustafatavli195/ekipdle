"use client";
import { useState, useEffect, useRef } from "react";
import {
  useGameModesWithFriends,
  Friend,
} from "@/app/hooks/useGameModesWithFriends";
import { supabase } from "@/app/lib/supabase/supabaseClient";
import { useParams } from "next/navigation";

type LeaderboardEntry = {
  position: number;
  friend_name: string;
  photo_url: string | null;
};

export default function BlindRankGamePage() {
  const params = useParams();
  const rawGameId = params?.id;
  const rawModeId = params?.mode;

  const gameId: string = Array.isArray(rawGameId)
    ? rawGameId[0]
    : rawGameId ?? "";
  const modeName: string = Array.isArray(rawModeId)
    ? rawModeId[0]
    : rawModeId ?? "";

  const { gameModes, loading } = useGameModesWithFriends(gameId);

  const [characters, setCharacters] = useState<Friend[]>([]);
  const [currentChar, setCurrentChar] = useState<Friend | null>(null);
  const [placements, setPlacements] = useState<(Friend | null)[]>(
    Array(10).fill(null)
  );
  const [gameOver, setGameOver] = useState(false);
  const [rolling, setRolling] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  const rollTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );

  // Karakterleri yükle
  useEffect(() => {
    if (!loading && gameModes.length > 0 && modeName) {
      const selectedMode = gameModes.find((m) => m.name === modeName);
      if (selectedMode?.friends && selectedMode.friends.length > 0) {
        const allCharacters = [...selectedMode.friends];
        setCharacters(allCharacters);
        setPlacements(Array(10).fill(null));
      }
    }
  }, [loading, gameModes, modeName]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (rollTimeout.current) clearTimeout(rollTimeout.current);
    };
  }, []);

  // Rulet

  const startRoll = () => {
    if (rolling || gameOver || characters.length === 0) return;
    setRolling(true);

    if (rollTimeout.current) clearTimeout(rollTimeout.current);

    // Mevcut characters dizisini kullan, ama placements'da yerleşmiş olanları çıkar
    const available = characters.filter(
      (c) => !placements.find((p) => p?.id === c.id)
    );

    if (available.length === 0) {
      setRolling(false);
      return;
    }

    const finalIndex = Math.floor(Math.random() * available.length);

    let i = 0;
    const fastRounds = available.length * 2;
    const slowSteps = finalIndex + 1;
    let delay = 20;

    const roll = () => {
      const nextChar = available[i % available.length];
      setCurrentChar(nextChar);
      i++;

      if (i <= fastRounds) {
        rollTimeout.current = setTimeout(roll, delay);
      } else if (i <= fastRounds + slowSteps) {
        delay += 40;
        rollTimeout.current = setTimeout(roll, delay);
      } else {
        setRolling(false);
      }
    };

    roll();
  };

  // Kutucuğa yerleştirme

  const handlePlaceCharacter = async (index: number) => {
    if (rolling || !currentChar) return;

    const newPlacements = [...placements];
    if (!newPlacements[index]) {
      newPlacements[index] = currentChar;
      setPlacements(newPlacements);

      // Yerleştirilen karakteri characters dizisinden çıkar
      setCharacters((prev) => prev.filter((c) => c.id !== currentChar.id));

      if (newPlacements.filter(Boolean).length >= 10) {
        setGameOver(true);
        setCurrentChar(null);
        await saveResults(newPlacements);
        await fetchLeaderboard();
      } else {
        setCurrentChar(null);
        startRoll();
      }
    }
  };

  useEffect(() => {
    if (characters.length > 0) startRoll();
  }, [characters]);

  const saveResults = async (placementsToSave: (Friend | null)[]) => {
    if (!gameId || !modeName) return;
    const mode = gameModes.find((m) => m.name === modeName);
    if (!mode) return;

    const results = placementsToSave.filter(Boolean).map((char, idx) => ({
      game_id: gameId,
      mode_id: mode.id,
      friend_id: char!.id,
      position: idx + 1,
    }));

    try {
      await supabase.from("blind_rank_results").insert(results);
    } catch (error) {
      console.error("Save results error:", error);
    }
  };

  const fetchLeaderboard = async () => {
    if (!gameId || !modeName) return;
    const mode = gameModes.find((m) => m.name === modeName);
    if (!mode) return;

    try {
      const { data: results } = await supabase
        .from("blind_rank_results")
        .select("friend_id, position")
        .eq("game_id", gameId)
        .eq("mode_id", mode.id)
        .order("position", { ascending: true })
        .limit(10);

      if (!results) return;

      const friendIds = results.map((r) => r.friend_id);
      const { data: friendsData } = await supabase
        .from("friends")
        .select("id, name, photo_url")
        .in("id", friendIds);

      const friendsMap = new Map(friendsData?.map((f) => [f.id, f]) || []);

      const mapped: LeaderboardEntry[] = results.map((r) => {
        const friend = friendsMap.get(r.friend_id);
        return {
          position: r.position,
          friend_name: friend?.name ?? "Unknown",
          photo_url: friend?.photo_url ?? null,
        };
      });

      setLeaderboard(mapped);
    } catch (error) {
      console.error("Leaderboard fetch error:", error);
    }
  };

  const resetGame = () => {
    setPlacements(Array(10).fill(null));
    setCurrentChar(null);
    setGameOver(false);
    setLeaderboard([]);
    startRoll();
  };

  return (
    <main className="min-h-screen flex flex-col md:flex-row gap-8 p-6 max-w-7xl mx-auto font-comic text-white">
      {/* Sol taraf: kutular */}

      <div className="flex flex-col gap-4 w-1/4">
        {placements.map((char, idx) => (
          <div key={idx} className="flex items-center gap-2">
            {/* soldaki sıra numarası, animasyonlu ve büyük */}
            <div className="w-8 text-right">
              <span
                className={`text-xl font-extrabold text-white transition-all duration-300 ease-out transform ${
                  char
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-2"
                }`}
              >
                {char ? idx + 1 : ""}
              </span>
            </div>

            {/* kutu */}
            <div
              onClick={() => handlePlaceCharacter(idx)}
              className="relative w-16 h-16 bg-gray-700 rounded-md flex items-center justify-center cursor-pointer hover:bg-gray-600 border-2 border-gray-400 overflow-hidden p-0"
            >
              {/* boşsa saydam numara kutunun içinde */}
              {!char && (
                <span className="absolute text-2xl font-bold text-white/40">
                  {idx + 1}
                </span>
              )}

              {/* foto varsa, animasyonlu */}
              {char && (
                <img
                  src={char.photo_url ?? ""}
                  alt={char.name}
                  className="w-full h-full object-cover rounded-md block transition-all duration-300 ease-out transform scale-90 opacity-0 animate-slideIn"
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Orta: karakter ruleti */}
      <div className="flex-1 flex flex-col items-center gap-4">
        {!gameOver && currentChar && (
          <div className="flex flex-col items-center gap-2">
            <h2 className="text-2xl font-bold">{modeName}</h2>
            <img
              src={currentChar.photo_url ?? ""}
              alt={currentChar.name}
              className={`w-48 h-48 rounded-lg object-cover shadow-lg transition-transform duration-200 ${
                rolling ? "scale-110" : "scale-100"
              }`}
            />
            <p className="text-xl font-semibold mt-2">{currentChar.name}</p>
            <p className="mt-2 text-gray-300">
              Kutulardan birine tıklayarak bu karakteri yerleştirin
            </p>
          </div>
        )}
      </div>

      {/* Game Over Modal */}
      {gameOver && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-900 text-white p-6 rounded-2xl w-[1000px] max-h-[100vh] overflow-y-auto shadow-xl border-4 border-purple-600">
            <h2 className="text-3xl font-bold mb-6 text-center">
              Blind Rank Bitti!
            </h2>

            <div className="flex flex-col gap-2">
              {placements.map((char, idx) => (
                <div
                  key={char?.id ?? idx}
                  className="flex items-center gap-4 bg-purple-800 p-3 rounded-lg"
                >
                  <span className="w-8 font-bold text-lg">{idx + 1}.</span>
                  {char && (
                    <img
                      src={char.photo_url ?? ""}
                      alt={char.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  )}
                  <span className="text-white font-medium">{char?.name}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-4 mt-6">
              <button
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 rounded font-bold transition"
                onClick={resetGame}
              >
                Tekrar Oyna
              </button>
              <button
                className="flex-1 py-2 bg-gray-600 hover:bg-gray-700 rounded font-bold transition"
                onClick={() => window.history.back()}
              >
                Geri Dön
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
