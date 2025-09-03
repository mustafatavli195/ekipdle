'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/app/lib/supabaseClient';
import { useRouter } from 'next/navigation';

interface Game {
  id: string;
  title: string;
  created_at: string;
}

export default function Home() {
  const [games, setGames] = useState<Game[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    const { data, error } = await supabase.from('games').select('*').order('created_at', { ascending: false });
    if (error) console.log(error);
    else setGames(data || []);
  };


  return (
    <main className="min-h-screen p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Tüm Oyunlar</h1>

      <ul className="space-y-3">
        {games.map((game) => (
          <li
            key={game.id}
            className="border p-4 rounded-lg flex justify-between items-center hover:bg-gray-50 cursor-pointer"
            onClick={() => router.push(`/game/${game.id}`)}
          >
            <span className="font-medium">{game.title}</span>
            <span className="text-sm text-gray-500">{new Date(game.created_at).toLocaleDateString()}</span>
          </li>
        ))}
      </ul>
    </main>
  );
}
