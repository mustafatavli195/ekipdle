"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface GameCardProps {
  id: string;
  title: string;
  createdAt: string;
}

export default function GameCard({ id, title, createdAt }: GameCardProps) {
  const router = useRouter();

  return (
    <motion.li
      onClick={() => router.push(`/game/${id}`)}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className="cursor-pointer rounded-3xl p-6 bg-white/40 border-2 border-purple-300 hover:bg-white/60 hover:shadow-xl transform transition-all duration-300 backdrop-blur-sm"
    >
      <h2 className="text-2xl font-bold mb-2 text-purple-700">{title}</h2>
      <p className="text-purple-500 text-sm">
        {new Date(createdAt).toLocaleDateString()}
      </p>
    </motion.li>
  );
}
