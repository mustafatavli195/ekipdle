"use client";

import { useEffect, useState, useCallback, JSX } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import { useParams } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";

interface Friend {
  id: string;
  name: string;
  height: number;
  weight: number;
  iq?: number;
  gender?: "Erkek" | "Kadın" | "Bilinmiyor";
  charm?: number;
  race?: string;
  interests?: string[];
  photo_url?: string;
}

export default function PlayGame() {
  const { id: gameId } = useParams();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [secretFriend, setSecretFriend] = useState<Friend | null>(null);
  const [guess, setGuess] = useState("");
  const [guesses, setGuesses] = useState<Friend[]>([]);
  const [gameOver, setGameOver] = useState(false);

  const fetchFriends = useCallback(async () => {
    const { data } = await supabase
      .from("friends")
      .select(
        `
        *,
        friend_interests (
          interests (name)
        )
      `
      )
      .eq("game_id", String(gameId));

    if (data && data.length > 0) {
      const normalized = data.map((f: any) => ({
        ...f,
        interests:
          f.friend_interests?.map((fi: any) => fi.interests.name) || [],
      }));

      setFriends(normalized);
      setSecretFriend(
        normalized[Math.floor(Math.random() * normalized.length)]
      );
    } else {
      setFriends([]);
      setSecretFriend(null);
    }
  }, [gameId]);

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  const normalizeString = (str: string) =>
    str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/ı/g, "i")
      .replace(/İ/g, "i");

  const handleGuess = (name?: string) => {
    if (!secretFriend || gameOver) return;

    const guessedName = name || guess;
    const guessed = friends.find(
      (f) => normalizeString(f.name) === normalizeString(guessedName)
    );
    if (!guessed) return;

    setGuesses((prev) => [guessed, ...prev]);
    setGuess("");

    if (guessed.id === secretFriend.id) setGameOver(true);
  };

  const getInterestsStatus = (
    guessInterests: string[],
    secretInterests: string[]
  ) => {
    if (!guessInterests.length || !secretInterests.length) return "wrong";
    const common = guessInterests.filter((i) => secretInterests.includes(i));
    if (common.length === 0) return "wrong";
    if (
      common.length === secretInterests.length &&
      guessInterests.length === secretInterests.length
    )
      return "correct";
    return "partial";
  };

  const renderBox = (
    label: string,
    value: string | number | JSX.Element,
    correct: boolean,
    arrow?: JSX.Element,
    customBg?: string
  ) => (
    <div className="flex flex-col items-center mx-1">
      <span className="text-xs text-purple-600 mb-1">{label}</span>
      <div
        className={`w-20 h-20 flex items-center justify-center text-center rounded-2xl font-bold transition-all duration-300 overflow-hidden text-sm shadow-md ${
          customBg ? customBg : correct ? "bg-green-200" : "bg-pink-200"
        }`}
      >
        {value} {arrow}
      </div>
    </div>
  );

  const getArrow = (
    guessValue?: number,
    secretValue?: number
  ): JSX.Element | undefined => {
    if (guessValue === undefined || secretValue === undefined) return undefined;
    if (guessValue === secretValue) return undefined;
    return guessValue > secretValue ? (
      <span className="text-red-600 font-bold text-lg">⬆️</span>
    ) : (
      <span className="text-blue-600 font-bold text-lg">⬇️</span>
    );
  };

  const filteredFriends =
    guess.trim() === ""
      ? []
      : friends
          .filter((f) =>
            normalizeString(f.name).includes(normalizeString(guess))
          )
          .filter((f) => !guesses.find((g) => g.id === f.id));

  return (
    <main className="min-h-screen p-6 max-w-5xl mx-auto font-comic text-gray-900 relative">
      <h1 className="text-4xl font-bold mb-6 text-center text-purple-700">
        Tahmin Et!
      </h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (filteredFriends.length > 0) {
            handleGuess(filteredFriends[0].name);
          }
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

      {!gameOver && guess.trim() !== "" && (
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
                  width={48}
                  height={48}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center text-purple-600 text-sm font-bold">
                  ?
                </div>
              )}
              <div className="flex flex-col">
                <span className="font-bold text-purple-700">{f.name}</span>
                <span className="text-xs text-purple-500">
                  Boy: {f.height} | Kilo: {f.weight} | IQ: {f.iq || "-"} |
                  Charm: {f.charm ? `${f.charm}/10` : "-"}
                </span>
                <span className="text-xs text-purple-400">
                  Cinsiyet: {f.gender || "-"} | Irk: {f.race || "-"}
                </span>
                <span className="text-xs text-purple-600">
                  İlgi Alanları:{" "}
                  {f.interests?.length ? f.interests.join(", ") : "-"}
                </span>
              </div>
            </motion.div>
          ))}
          {filteredFriends.length === 0 && (
            <p className="text-purple-500 font-bold">Eşleşme bulunamadı 😢</p>
          )}
        </div>
      )}

      <div className="space-y-4">
        <AnimatePresence>
          {guesses.map((g, idx) => {
            if (!secretFriend) return null;

            const nameCorrect =
              g.name.toLowerCase() === secretFriend.name.toLowerCase();
            const heightCorrect = g.height === secretFriend.height;
            const weightCorrect = g.weight === secretFriend.weight;
            const iqCorrect = g.iq === secretFriend.iq;
            const genderCorrect = g.gender === secretFriend.gender;
            const charmCorrect = g.charm === secretFriend.charm;
            const raceCorrect = g.race === secretFriend.race;

            const interestsStatus = getInterestsStatus(
              g.interests || [],
              secretFriend.interests || []
            );
            const interestsBgColor =
              interestsStatus === "correct"
                ? "bg-green-200"
                : interestsStatus === "partial"
                ? "bg-yellow-200"
                : "bg-pink-200";

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex gap-2 p-4 border-2 border-purple-300 rounded-2xl bg-purple-100/50 justify-start flex-nowrap overflow-x-auto shadow-md"
              >
                {renderBox(
                  "Fotoğraf",
                  g.photo_url ? (
                    <Image
                      src={g.photo_url}
                      alt={g.name}
                      width={60}
                      height={60}
                      className="object-cover w-full h-full rounded-xl"
                    />
                  ) : (
                    <span>?</span>
                  ),
                  g.id === secretFriend.id
                )}
                {renderBox("İsim", g.name, nameCorrect)}
                {renderBox("Cinsiyet", g.gender || "-", genderCorrect)}
                {renderBox(
                  "Boy",
                  g.height,
                  heightCorrect,
                  getArrow(g.height, secretFriend.height)
                )}
                {renderBox(
                  "Kilo",
                  g.weight,
                  weightCorrect,
                  getArrow(g.weight, secretFriend.weight)
                )}
                {renderBox(
                  "İlgi Alanları",
                  g.interests?.length ? g.interests.join(", ") : "-",
                  interestsStatus === "correct",
                  undefined,
                  interestsBgColor
                )}
                {renderBox(
                  "IQ",
                  g.iq ?? "-",
                  iqCorrect,
                  getArrow(g.iq, secretFriend.iq)
                )}
                {renderBox("Irk", g.race || "-", raceCorrect)}
                {renderBox(
                  "Charm",
                  g.charm ? `${g.charm}/10` : "-",
                  charmCorrect,
                  getArrow(g.charm, secretFriend.charm)
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {gameOver && secretFriend && (
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
              onClick={() => {
                setGuesses([]);
                setGuess("");
                setGameOver(false);
                if (friends.length > 0) {
                  setSecretFriend(
                    friends[Math.floor(Math.random() * friends.length)]
                  );
                }
              }}
              className="px-6 py-3 bg-purple-500 hover:bg-purple-400 text-white font-bold rounded-2xl shadow-md transition-transform transform hover:-translate-y-1"
            >
              Tekrar Oyna
            </button>
          </motion.div>
        </motion.div>
      )}
    </main>
  );
}
