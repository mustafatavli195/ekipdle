"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase/supabaseClient";
import LoadingOverlay from "@/app/components/Common/LoadingOverlay";
import LanguageModal from "@/app/components/UI/LanguageModal";
import SettingsModal from "@/app/components/UI/SettingsModal";
import {
  FaBullseye,
  FaTheaterMasks,
  FaSmile,
  FaImage,
  FaRandom,
  FaQuestion,
} from "react-icons/fa";

interface Game {
  id: string;
  title: string;
  created_at: string;
  photo_url: string | null;
  user_id: string;
}

interface User {
  id: string;
  full_name: string;
}

export default function GameDetailPage() {
  const { id } = useParams();
  const [game, setGame] = useState<Game | null>(null);
  const [creator, setCreator] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showLanguage, setShowLanguage] = useState(false);
  const [alertMessage, setAlertMessage] = useState(""); // Yeni
  const router = useRouter();

  useEffect(() => {
    const fetchGame = async () => {
      setLoading(true);
      const { data: gameData, error: gameError } = await supabase
        .from("games")
        .select("*")
        .eq("id", id)
        .single();

      if (gameError) {
        console.error("Supabase error:", gameError);
        setLoading(false);
        return;
      }

      setGame(gameData);

      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id, full_name")
        .eq("id", gameData.user_id)
        .single();

      if (userError) console.error("User fetch error:", userError);
      else setCreator(userData);

      setLoading(false);
    };

    if (id) fetchGame();
  }, [id]);

  const showTempAlert = (message: string) => {
    setAlertMessage(message);
    setTimeout(() => setAlertMessage(""), 2000); // 2 saniye sonra kaybolur
  };

  if (loading) return <LoadingOverlay />;

  if (!game)
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-xl text-gray-400">Oyun bulunamadı 😢</p>
      </main>
    );

  const modes = [
    {
      label: "Klasik Mod",
      path: `/game/${game.id}/classic`,
      icon: <FaBullseye />,
    },
    {
      label: "Replik Modu",
      path: `/game/${game.id}/quote`,
      icon: <FaTheaterMasks />,
    },
    { label: "Emoji Modu", path: `/game/${game.id}/emoji`, icon: <FaSmile /> },
    { label: "Görsel Modu", path: `/game/${game.id}/image`, icon: <FaImage /> },
    {
      label: "Kör Sıralama",
      path: `/game/${game.id}/blind-rank`,
      icon: <FaRandom />,
    },
    { label: "Quiz Modu", path: `/game/${game.id}/quiz`, icon: <FaQuestion /> },
  ];

  return (
    <main className="min-h-screen flex items-start justify-center p-8 pt-16 font-comic relative">
      <div className="flex flex-col md:flex-row gap-10 w-full max-w-7xl">
        {/* Sol Kart */}

        <div className="bg-[#1D2242] bg-opacity-100 rounded-3xl shadow-2xl p-8 flex flex-col items-center gap-6 w-full md:w-1/3 text-white border-3 border-black">
          {game.photo_url ? (
            <img
              src={game.photo_url}
              alt={game.title}
              className="w-64 h-64 object-contain rounded-lg shadow-lg"
            />
          ) : (
            <div className="w-64 h-64 bg-gray-700 rounded-lg flex items-center justify-center font-bold text-xl">
              Fotoğraf yok
            </div>
          )}

          <h1 className="text-3xl font-bold text-center">{game.title}</h1>
          <p className="text-gray-300 text-center text-lg">
            Oluşturulma zamanı:{" "}
            {new Date(game.created_at).toLocaleString("tr-TR")}
          </p>
          {creator && (
            <p className="text-gray-300 text-center text-lg">
              Oluşturan: {creator.full_name}
            </p>
          )}
        </div>

        {/* Sağ Kart */}
        <div className="bg-[#1D2242] bg-opacity-100 rounded-3xl shadow-2xl p-8 flex flex-col gap-8 w-full md:w-2/3 text-white border-3 border-black">
          <h2 className="text-3xl font-bold text-center mb-4">Mod</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modes.map((mode) => {
              const isDisabled = ["quote", "emoji", "image", "quiz"].some((m) =>
                mode.path.includes(m)
              );

              return (
                <div
                  key={mode.path}
                  onClick={() =>
                    isDisabled
                      ? showTempAlert("Bu mod henüz hazır değil 😢")
                      : router.push(mode.path)
                  }
                  className={`${
                    isDisabled
                      ? "cursor-not-allowed opacity-50"
                      : "cursor-pointer hover:border-[#FFD700] hover:scale-105"
                  } bg-[#1D2242] bg-opacity-100 border border-black rounded-3xl p-6 flex flex-col items-center justify-center gap-3 text-center shadow-lg transition-all duration-300 transform`}
                >
                  <div className="bg-[#314158] rounded-full p-4 text-2xl mb-2 flex items-center justify-center">
                    {mode.icon}
                  </div>
                  <span className="text-xl font-semibold">{mode.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Uyarı Mesajı */}
      {alertMessage && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-xl shadow-lg z-50 animate-fade-in">
          {alertMessage}
        </div>
      )}

      <LanguageModal
        isOpen={showLanguage}
        onClose={() => setShowLanguage(false)}
      />
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </main>
  );
}
