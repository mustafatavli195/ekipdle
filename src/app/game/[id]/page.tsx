"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase/supabaseClient";
import LoadingOverlay from "@/app/components/Common/LoadingOverlay";
import MainMenu from "@/app/components/Common/MainMenu";

import LanguageModal from "@/app/components/UI/LanguageModal";
import SettingsModal from "@/app/components/UI/SettingsModal";

interface Game {
  id: string;
  title: string;
  created_at: string;
}

export default function GameDetailPage() {
  const { id } = useParams();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showLanguage, setShowLanguage] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchGame = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("games")
        .select("*")
        .eq("id", id)
        .single();

      if (error) console.error("Supabase error:", error);
      else setGame(data);
      setLoading(false);
    };
    if (id) fetchGame();
  }, [id]);

  if (loading) return <LoadingOverlay />;
  if (!game)
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-500">Oyun bulunamadı 😢</p>
      </main>
    );

  const modes = [
    { label: "🎯 Klasik Mod", path: `/game/${game.id}/classic` },
    { label: "🎭 Replik Modu", path: `/game/${game.id}/quote` },
    { label: "😂 Emoji Modu", path: `/game/${game.id}/emoji` },
    { label: "🖼 Görsel Modu", path: `/game/${game.id}/image` },
    { label: "🔀 Kör Sıralama", path: `/game/${game.id}/blind-rank` },
    { label: "❓ Quiz Modu", path: `/game/${game.id}/quiz` },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-6 max-w-3xl mx-auto font-comic text-gray-900 rounded-3xl relative">
      {/* MainMenu componentini kullanıyoruz */}
      <MainMenu
        buttons={modes}
        showSettings={showSettings}
        setShowSettings={setShowSettings}
        showLanguage={showLanguage}
        setShowLanguage={setShowLanguage}
      />

      {/* Modallar */}
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
