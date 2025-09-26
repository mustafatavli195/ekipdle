"use client";

import { Dispatch, SetStateAction, FormEvent } from "react";
import { Friend } from "../../types/types";

interface Props {
  guess: string;
  setGuess: Dispatch<SetStateAction<string>>;
  filteredFriends: Friend[];
  handleGuess: (name?: string) => void;
  gameOver: boolean;
}

export default function GuessInput({
  guess,
  setGuess,
  filteredFriends,
  handleGuess,
  gameOver,
}: Props) {
  return (
    <form
      onSubmit={(e: FormEvent) => {
        e.preventDefault();
        if (filteredFriends.length > 0) handleGuess(filteredFriends[0].name);
      }}
      className="flex gap-3 mb-6"
    >
      <input
        type="text"
        placeholder="Arkadaş ismi yaz..."
        className="flex-1 border-2 border-purple-300 rounded-2xl px-4 py-3 bg-purple-100/50 focus:outline-none focus:ring-2 focus:ring-purple-200 text-gray-900 font-bold"
        value={guess}
        onChange={(e) => setGuess(e.target.value)}
        disabled={gameOver}
      />
      <button
        type="submit"
        className="px-6 py-3 bg-orange-200 hover:bg-orange-100 rounded-2xl text-gray-900 font-bold shadow-md transform hover:-translate-y-1 transition-all duration-200"
        disabled={gameOver}
      >
        Tahmin Et
      </button>
    </form>
  );
}
