'use client';

import { useEffect, useState } from 'react';
import { supabase } from './lib/supabaseClient';
import Link from 'next/link';

interface Game {
  id: string;
  title: string;
  created_at: string;
}

export default function HomePage() {
  const [user, setUser] = useState<any>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Kullanıcı durumunu kontrol et
    supabase.auth.getSession().then(({ data }) => {
      const sessionUser = data.session?.user ?? null;
      setUser(sessionUser);
      if (sessionUser) fetchGames();
      else setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const sessionUser = session?.user ?? null;
      setUser(sessionUser);
      if (sessionUser) fetchGames();
      else setLoading(false);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const fetchGames = async () => {
    const { data, error } = await supabase.from('games').select('*').order('created_at', { ascending: false });
    if (data) setGames(data);
    setLoading(false);
  };

  if (loading) return <p className="text-center mt-10">Yükleniyor...</p>;

  if (!user) {
    // Giriş yapılmamışsa
    return (
      <div className="flex flex-col items-center justify-center mt-20">
        <h1 className="text-2xl font-bold mb-4">Oyuna başlamak için giriş yap!</h1>
        <Link href="/auth" className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-white">
          Giriş Yap
        </Link>
      </div>
    );
  }

  // Giriş yapılmışsa → oyunları listele
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Mevcut Oyunlar</h1>
      {games.length === 0 ? (
        <p className="text-gray-500">Henüz oyun yok. Oyun kurmak için "Oyun Kur" sayfasına gidin.</p>
      ) : (
        <ul className="space-y-3">
          {games.map((game) => (
            <li key={game.id}>
              <Link
                href={`/game/${game.id}/play`}
                className="block p-4 border rounded-lg shadow hover:shadow-md transition"
              >
                <div className="font-semibold">{game.title || 'Yeni Oyun'}</div>
                <div className="text-sm text-gray-500">Oluşturulma tarihi: {new Date(game.created_at).toLocaleString()}</div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
