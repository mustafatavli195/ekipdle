"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import { useRouter } from "next/navigation";
import LoadingOverlay from "@/app/components/LoadingOverlay";
import { Settings, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Game {
  id: string;
  title: string;
  created_at: string;
}

export default function MyGames() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [showSettings, setShowSettings] = useState(false);
  const [showLanguage, setShowLanguage] = useState(false);

  const fetchGames = async (uid: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("games")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });

    if (error) console.error("Supabase error:", error);
    else setGames(data || []);
    setLoading(false);
  };

  useEffect(() => {
    const getUserAndFetch = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) fetchGames(user.id);
      else router.push("/login");
    };

    getUserAndFetch();
  }, [router]);

  if (loading) return <LoadingOverlay />;

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
      onClick={onClose}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
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
    <main className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-6 max-w-5xl mx-auto font-comic text-gray-900 rounded-3xl relative">
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

      <h1 className="text-5xl font-bold mb-10 text-center text-purple-600">
        Oyunlarım
      </h1>
      <hr />
      <br />

      {games.length === 0 ? (
        <p className="text-gray-500 text-center mt-24 font-bold text-lg">
          Henüz oyun oluşturmadın 😢
        </p>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {games.map((game) => (
            <motion.li
              key={game.id}
              onClick={() => router.push(`/game/${game.id}`)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="cursor-pointer rounded-3xl p-6 bg-white/40 border-2 border-purple-300 hover:bg-white/60 hover:shadow-xl transform transition-all duration-300 backdrop-blur-sm"
            >
              <h2 className="text-2xl font-bold mb-2 text-purple-700">
                {game.title}
              </h2>
              <p className="text-purple-500 text-sm">
                {new Date(game.created_at).toLocaleDateString()}
              </p>
            </motion.li>
          ))}
        </ul>
      )}

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
