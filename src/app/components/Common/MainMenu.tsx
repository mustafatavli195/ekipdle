"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface Button {
  label: string;
  path: string;
}

interface Props {
  buttons: Button[];
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
  showLanguage: boolean;
  setShowLanguage: (show: boolean) => void;
}

export default function MainMenu({
  buttons,
  showSettings,
  setShowSettings,
  showLanguage,
  setShowLanguage,
}: Props) {
  const router = useRouter();

  return (
    <>
      {/* Ana menü */}
      <div className="w-full max-w-md mx-auto flex flex-col gap-6 mt-24">
        {buttons.map((btn) => (
          <motion.button
            key={btn.label}
            onClick={() => btn.path !== "#" && router.push(btn.path)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full py-4 bg-white/40 border-2 border-purple-300 rounded-3xl text-2xl text-purple-700 font-bold hover:bg-white/60 hover:shadow-xl transform transition-all duration-300 backdrop-blur-sm cursor-pointer"
          >
            {btn.label}
          </motion.button>
        ))}
      </div>
    </>
  );
}
