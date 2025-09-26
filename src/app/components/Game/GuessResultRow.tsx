"use client";

import { Friend } from "@/app/types/types";
import { motion } from "framer-motion";
import Image from "next/image";
import { JSX } from "react";

interface Props {
  guess: Friend;
  secretFriend: Friend;
  renderBox: (
    label: string,
    value: string | number | JSX.Element,
    correct: boolean,
    arrow?: JSX.Element,
    customBg?: string
  ) => JSX.Element;
  getArrow: (
    guessValue?: number,
    secretValue?: number
  ) => JSX.Element | undefined;
  getInterestsStatus: (
    guessInterests: string[],
    secretInterests: string[]
  ) => "wrong" | "partial" | "correct";
}

export default function GuessResultRow({
  guess,
  secretFriend,
  renderBox,
  getArrow,
  getInterestsStatus,
}: Props) {
  const nameCorrect =
    guess.name.toLowerCase() === secretFriend.name.toLowerCase();
  const heightCorrect = guess.height === secretFriend.height;
  const weightCorrect = guess.weight === secretFriend.weight;
  const iqCorrect = guess.iq === secretFriend.iq;
  const genderCorrect = guess.gender === secretFriend.gender;
  const charmCorrect = guess.charm === secretFriend.charm;
  const raceCorrect = guess.race === secretFriend.race;
  const interestsStatus = getInterestsStatus(
    guess.interests || [],
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
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="flex gap-2 p-4 border-2 border-purple-300 rounded-2xl bg-purple-100/50 justify-start flex-nowrap overflow-x-auto shadow-md"
    >
      {renderBox(
        "Fotoğraf",
        guess.photo_url ? (
          <Image
            src={guess.photo_url}
            alt={guess.name}
            width={120}
            height={120}
            quality={100}
            sizes="120px"
            className="object-cover w-full h-full rounded-xl"
          />
        ) : (
          "?"
        ),
        guess.id === secretFriend.id
      )}
      {renderBox("İsim", guess.name, nameCorrect)}
      {renderBox("Cinsiyet", guess.gender || "-", genderCorrect)}
      {renderBox(
        "Boy",
        guess.height,
        heightCorrect,
        getArrow(guess.height, secretFriend.height)
      )}
      {renderBox(
        "Kilo",
        guess.weight,
        weightCorrect,
        getArrow(guess.weight, secretFriend.weight)
      )}
      {renderBox(
        "İlgi Alanları",
        guess.interests?.length ? guess.interests.join(", ") : "-",
        interestsStatus === "correct",
        undefined,
        interestsBgColor
      )}
      {renderBox(
        "IQ",
        guess.iq ?? "-",
        iqCorrect,
        getArrow(guess.iq, secretFriend.iq)
      )}
      {renderBox("Ülke", guess.race || "-", raceCorrect)}
      {renderBox(
        "Charm",
        guess.charm ? `${guess.charm}/10` : "-",
        charmCorrect,
        getArrow(guess.charm, secretFriend.charm)
      )}
    </motion.div>
  );
}
