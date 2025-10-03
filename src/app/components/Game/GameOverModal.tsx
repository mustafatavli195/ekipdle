"use client";

import { motion } from "framer-motion";
import Confetti from "react-confetti";
import { useGameStore } from "@/app/store/gameStore";

export default function GameOverModal() {
  const { secretFriend, resetGame } = useGameStore();

  if (!secretFriend) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 flex items-center justify-center bg-black/60 z-50"
    >
      <Confetti
        width={window.innerWidth}
        height={window.innerHeight}
        recycle={false}
        numberOfPieces={800}
      />
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-3xl shadow-2xl p-10 text-center max-w-lg w-full"
      >
        <h2 className="text-4xl font-extrabold text-purple-700 mb-4">
          🎉 Kazandın! Tebrikler 🎉
        </h2>
        <p className="text-xl font-bold text-gray-700 mb-6">
          Doğru cevap: {secretFriend.name}
        </p>
        <button
          onClick={resetGame}
          className="px-6 py-3 bg-purple-500 hover:bg-purple-400 text-white font-bold rounded-2xl shadow-md transition-transform transform hover:-translate-y-1"
        >
          Tekrar Oyna
        </button>
      </motion.div>
    </motion.div>
  );
}
