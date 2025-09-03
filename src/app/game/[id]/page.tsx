'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/app/lib/supabaseClient';
import { useParams } from 'next/navigation';

interface Friend {
  id: string;
  name: string;
  height: number;
  weight: number;
  hint: string;
  photo_url?: string;
}

export default function PlayGame() {
  const { id: gameId } = useParams();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [secretFriend, setSecretFriend] = useState<Friend | null>(null);
  const [guess, setGuess] = useState('');
  const [guesses, setGuesses] = useState<Friend[]>([]);
  const [hintShown, setHintShown] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    const { data } = await supabase.from('friends').select('*').eq('game_id', gameId);
    if (data) {
      setFriends(data);
      const random = data[Math.floor(Math.random() * data.length)];
      setSecretFriend(random);
      console.log("Secret is:", random); // test amaçlı
    }
  };

  const handleGuess = () => {
    if (gameOver || !secretFriend) return;

    const guessed = friends.find(f => f.name.toLowerCase() === guess.toLowerCase());
    if (!guessed) return;

    setGuesses([...guesses, guessed]);
    setGuess('');

    if (guessed.id === secretFriend.id) {
      setGameOver(true); // ✅ doğru tahmin → oyun bitti
    }
  };

  const renderBox = (label: string, value: string | number, correct: boolean, arrow?: string) => {
    return (
      <div className="flex flex-col items-center">
        <span className="text-sm text-gray-700 mb-1">{label}</span>
        <div
          className={`w-24 h-24 flex items-center justify-center text-center rounded-lg font-semibold ${
            correct ? 'bg-green-400' : 'bg-red-400'
          }`}
        >
          {value} {arrow}
        </div>
      </div>
    );
  };

  return (
    <main className="min-h-screen p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Tahmin Et!</h1>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Arkadaş ismi yaz..."
          className="flex-1 border rounded-lg px-3 py-2"
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          disabled={gameOver} // ✅ oyun bittiyse input kapalı
        />
        <button
          onClick={handleGuess}
          className="border rounded-lg px-3 py-2"
          disabled={gameOver} // ✅ oyun bittiyse buton kapalı
        >
          Tahmin Et
        </button>
      </div>

      <button
        onClick={() => setHintShown(true)}
        className="mb-4 px-3 py-2 border rounded-lg bg-yellow-200"
        disabled={hintShown}
      >
        İpucu Göster
      </button>

      {hintShown && secretFriend && (
        <p className="mb-4 text-gray-700">💡 İpucu: {secretFriend.hint}</p>
      )}

      <div className="space-y-4">
        {guesses.map((g, idx) => {
          if (!secretFriend) return null;

          const nameCorrect = g.name.toLowerCase() === secretFriend.name.toLowerCase();
          const heightCorrect = g.height === secretFriend.height;
          const weightCorrect = g.weight === secretFriend.weight;

          const heightArrow = !heightCorrect
            ? g.height > secretFriend.height
              ? '⬇️'
              : '⬆️'
            : '';
          const weightArrow = !weightCorrect
            ? g.weight > secretFriend.weight
              ? '⬇️'
              : '⬆️'
            : '';

          return (
            <div key={idx} className="flex gap-4">
              {renderBox("İsim", g.name, nameCorrect)}
              {renderBox("Boy", g.height, heightCorrect, heightArrow)}
              {renderBox("Kilo", g.weight, weightCorrect, weightArrow)}
            </div>
          );
        })}
      </div>

      {gameOver && secretFriend && (
        <div className="mt-6 p-4 bg-green-100 border border-green-400 rounded-lg">
          🎉 Doğru bildin! Cevap: <b>{secretFriend.name}</b>
        </div>
      )}
    </main>
  );
}
