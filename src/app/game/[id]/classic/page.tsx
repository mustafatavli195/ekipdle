"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useGameStore } from "@/app/store/gameStore";
import LoadingOverlay from "@/app/components/Common/LoadingOverlay";
import GuessInput from "@/app/components/Game/GuessInput";
import FriendSuggestionList from "@/app/components/Game/FriendSuggestionList";
import GuessResultRow from "@/app/components/Game/GuessResultRow";
import GameOverModal from "@/app/components/Game/GameOverModal";
import {
  normalizeString,
  renderBox,
  getArrow,
  getInterestsStatus,
} from "@/app/utils/gameHelpers";

export default function PlayGame() {
  const { id: gameId } = useParams();
  const {
    friends,
    secretFriend,
    guesses,
    gameOver,
    loading,
    fetchFriends,
    handleGuess,
    resetGame,
  } = useGameStore();

  const [guess, setGuess] = useState("");

  useEffect(() => {
    fetchFriends(String(gameId));
  }, [gameId, fetchFriends]);

  if (loading) return <LoadingOverlay />;

  const filteredFriends =
    guess.trim() === ""
      ? []
      : friends
          .filter((f) =>
            normalizeString(f.name).startsWith(normalizeString(guess))
          )
          .filter((f) => !guesses.find((g) => g.id === f.id));

  return (
    <main className="min-h-screen p-6 max-w-5xl mx-auto font-comic text-gray-900 relative">
      <h1 className="text-4xl font-bold mb-6 text-center text-purple-700">
        Tahmin Et!
      </h1>

      <GuessInput
        guess={guess}
        setGuess={setGuess}
        filteredFriends={filteredFriends}
        handleGuess={(name) => {
          handleGuess(name || guess);
          setGuess("");
        }}
        gameOver={gameOver}
      />

      {!gameOver && guess.trim() !== "" && (
        <FriendSuggestionList
          filteredFriends={filteredFriends}
          handleGuess={(name) => {
            handleGuess(name || guess);
            setGuess("");
          }}
        />
      )}

      {secretFriend && guesses.length > 0 && (
        <div className="space-y-4">
          {guesses.map((g, idx) => (
            <GuessResultRow
              key={idx}
              guess={g}
              secretFriend={secretFriend}
              renderBox={renderBox}
              getArrow={getArrow}
              getInterestsStatus={getInterestsStatus}
            />
          ))}
        </div>
      )}

      {gameOver && <GameOverModal />}
    </main>
  );
}
