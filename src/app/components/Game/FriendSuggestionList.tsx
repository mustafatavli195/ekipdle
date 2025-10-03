"use client";

import { Friend } from "../../types/types";
import { motion } from "framer-motion";
import Image from "next/image";

interface Props {
  filteredFriends: Friend[];
  handleGuess: (name?: string) => void;
}

export default function FriendSuggestionList({
  filteredFriends,
  handleGuess,
}: Props) {
  if (!filteredFriends.length)
    return <p className="text-purple-500 font-bold">Eşleşme bulunamadı 😢</p>;

  return (
    <div className="space-y-2 mb-6">
      {filteredFriends.map((f) => (
        <motion.div
          key={f.id}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-3 p-3 border-2 border-purple-300 rounded-2xl bg-purple-100/50 hover:bg-purple-200 cursor-pointer shadow-md transform hover:scale-105 transition-all duration-200"
          onClick={() => handleGuess(f.name)}
        >
          {f.photo_url ? (
            <Image
              src={f.photo_url}
              alt={f.name}
              width={120}
              height={120}
              quality={100}
              sizes="120px"
              className="object-cover w-12 h-12 rounded-2xl"
            />
          ) : (
            <div className="w-12 h-12 bg-purple-200 rounded-2xl flex items-center justify-center text-purple-600 text-sm font-bold">
              ?
            </div>
          )}
          <div className="flex flex-col">
            <span className="font-bold text-purple-700">{f.name}</span>
            <span className="text-xs text-purple-500">
              Boy: {f.height} | Kilo: {f.weight} | IQ: {f.iq || "-"} | Charm:{" "}
              {f.charm ? `${f.charm}/10` : "-"}
            </span>
            <span className="text-xs text-purple-400">
              Cinsiyet: {f.gender || "-"} | Ülke: {f.race || "-"}
            </span>
            <span className="text-xs text-purple-600">
              İlgi Alanları:{" "}
              {f.interests?.length ? f.interests.join(", ") : "-"}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
