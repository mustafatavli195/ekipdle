"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";
import LoadingOverlay from "@/app/components/LoadingOverlay";
import { Settings, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Game {
  id: string;
  title: string;
  created_at: string;
}

export default function GameDetail() {
  const { id } = useParams();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [showSettings, setShowSettings] = useState(false);
  const [showLanguage, setShowLanguage] = useState(false);

  useEffect(() => {
    const fetchGame = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("games")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Supabase error:", error);
      } else {
        setGame(data);
      }
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

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
  };

  const ModalWrapper = ({
    children,
    onClose,
  }: {
    children: React.ReactNode;
    onClose: () => void;
  }) => (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onClose} // arka plan tıklayınca kapanır
    >
      <motion.div
        onClick={(e) => e.stopPropagation()} // modal tıklaması kapanmayı engeller
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={modalVariants}
        transition={{ duration: 0.25 }}
        className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl"
      >
        {children}
      </motion.div>
    </div>
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-6 max-w-3xl mx-auto font-comic text-gray-900 rounded-3xl relative">
      {/* Üst sağ settings ve language */}
      <div className="absolute top-6 right-6 flex gap-4">
        <button
          onClick={() => setShowLanguage(true)}
          className="p-2 rounded-full bg-white/70 border border-purple-300 hover:bg-white shadow-md transition cursor-pointer hover:scale-105"
        >
          <Globe className="w-6 h-6 text-purple-600" />
        </button>
        <button
          onClick={() => setShowSettings(true)}
          className="p-2 rounded-full bg-white/70 border border-purple-300 hover:bg-white shadow-md transition cursor-pointer hover:scale-105"
        >
          <Settings className="w-6 h-6 text-purple-600" />
        </button>
      </div>

      <h1 className="text-5xl font-bold mb-6 text-center text-purple-600">
        {game.title}
      </h1>
      <p className="text-center text-purple-500 mb-10">
        Oluşturulma tarihi: {new Date(game.created_at).toLocaleDateString()}
      </p>

      <div className="flex flex-col gap-6">
        {modes.map((mode) => (
          <motion.button
            key={mode.label}
            onClick={() => router.push(mode.path)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full py-6 bg-white/40 border-2 border-purple-300 rounded-3xl text-2xl text-purple-700 font-bold hover:bg-white/60 hover:shadow-xl transition-all duration-300 backdrop-blur-sm cursor-pointer"
          >
            {mode.label}
          </motion.button>
        ))}
      </div>

      {/* Language Modal */}
      <AnimatePresence>
        {showLanguage && (
          <ModalWrapper onClose={() => setShowLanguage(false)}>
            <h2 className="text-xl font-bold text-purple-700 mb-4">
              🌐 Dil Seç
            </h2>
            <div className="flex flex-col gap-3">
              <button className="py-2 bg-purple-100 rounded-lg hover:bg-purple-200 cursor-pointer">
                Türkçe
              </button>
              <button className="py-2 bg-purple-100 rounded-lg hover:bg-purple-200 cursor-pointer">
                English
              </button>
            </div>
            <button
              onClick={() => setShowLanguage(false)}
              className="mt-6 w-full py-2 bg-gray-200 rounded-lg hover:bg-gray-300 cursor-pointer"
            >
              Kapat
            </button>
          </ModalWrapper>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <ModalWrapper onClose={() => setShowSettings(false)}>
            <h2 className="text-xl font-bold text-purple-700 mb-4">
              ⚙️ Ayarlar
            </h2>
            <div className="flex flex-col gap-3">
              <button className="py-2 bg-purple-100 rounded-lg hover:bg-purple-200 cursor-pointer">
                Tema: Açık / Koyu
              </button>
              <button className="py-2 bg-purple-100 rounded-lg hover:bg-purple-200 cursor-pointer">
                Bildirimler
              </button>
            </div>
            <button
              onClick={() => setShowSettings(false)}
              className="mt-6 w-full py-2 bg-gray-200 rounded-lg hover:bg-gray-300 cursor-pointer"
            >
              Kapat
            </button>
          </ModalWrapper>
        )}
      </AnimatePresence>
    </main>
  );
}
