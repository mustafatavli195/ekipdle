'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/app/lib/supabaseClient';
import { useRouter } from 'next/navigation';

interface Game {
  id: string;
  title: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.replace('/auth');
      else {
        setEmail(user.email || null);
        fetchGames(user.id);
      }
    });
  }, [router]);

  const fetchGames = async (userId: string) => {
    const { data } = await supabase.from('games').select('*').eq('user_id', userId);
    setGames(data || []);
  };

  const createGame = async () => {
    if (!newTitle) return;
    setLoading(true);
    const { data, error } = await supabase.from('games').insert([{ title: newTitle }]).select();
    if (error) console.log(error);
    else setGames([...games, ...(data || [])]);
    setNewTitle('');
    setLoading(false);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    router.replace('/auth');
  };

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <button onClick={logout} className="border rounded-lg px-3 py-2">
            Çıkış
          </button>
        </div>

        <p className="mb-4">Hoş geldin {email}</p>

        

        <div className="mb-6 flex gap-2">
          <input
            type="text"
            placeholder="Yeni oyun adı"
            className="flex-1 border rounded-lg px-3 py-2"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <button
            onClick={createGame}
            disabled={loading}
            className="border rounded-lg px-3 py-2"
          >
            {loading ? 'Ekleniyor...' : 'Oyun Ekle'}
          </button>
        </div>

        <ul className="space-y-2">
          {games.map((game) => (
            <li key={game.id} className="border p-3 rounded-lg flex justify-between items-center">
              <span>{game.title}</span>
              <button
                onClick={() => router.push(`/game/${game.id}/manage`)}
                className="text-blue-600 underline"
              >
                Yönet
              </button>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
