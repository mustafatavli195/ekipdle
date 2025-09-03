'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/app/lib/supabaseClient';
import { useParams } from 'next/navigation';

interface Friend {
  id: string;
  name: string;
  height: string;
  weight: string;
  hint: string;
  photo_url?: string;
}

export default function ManageGame() {
  const { id: gameId } = useParams();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [name, setName] = useState('');
  const [hint, setHint] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');

  // fetchFriends fonksiyonunu useCallback ile sarmaladık
  const fetchFriends = useCallback(async () => {
    const { data, error } = await supabase
      .from('friends')
      .select('*')
      .eq('game_id', String(gameId));

    console.log("Game ID:", gameId);
    console.log("Friends data:", data);
    console.log("Supabase error:", error);

    setFriends(data || []);
  }, [gameId]);

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]); // artık exhaustive-deps hatası yok

  const addFriend = async () => {
    if (!name || !hint) return;
    const { data, error } = await supabase
      .from('friends')
      .insert([{
        game_id: String(gameId),
        name,
        hint,
        height,
        weight
      }])
      .select();

    console.log("Insert data:", data);
    console.log("Insert error:", error);

    if (!error) {
      setFriends([...friends, ...(data || [])]);
    }

    setName('');
    setHint('');
    setHeight('');
    setWeight('');
  };

  const deleteFriend = async (id: string) => {
    const { error } = await supabase.from('friends').delete().eq('id', id);
    if (error) console.log("Delete error:", error);
    setFriends(friends.filter(f => f.id !== id));
  };

  return (
    <main className="min-h-screen p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Arkadaşları Yönet</h1>

      <div className="flex gap-2 mb-4 flex-wrap">
        <input
          type="text"
          placeholder="İsim"
          className="flex-1 border rounded-lg px-3 py-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Height"
          className="flex-1 border rounded-lg px-3 py-2"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
        />
        <input
          type="text"
          placeholder="Weight"
          className="flex-1 border rounded-lg px-3 py-2"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
        />
        <input
          type="text"
          placeholder="İpucu"
          className="flex-1 border rounded-lg px-3 py-2"
          value={hint}
          onChange={(e) => setHint(e.target.value)}
        />
        <button onClick={addFriend} className="border rounded-lg px-3 py-2">
          Ekle
        </button>
      </div>

      {friends.length === 0 ? (
        <p className="text-gray-500">Bu oyunda henüz arkadaş yok.</p>
      ) : (
        <ul className="space-y-2">
          {friends.map((f) => (
            <li key={f.id} className="border p-3 rounded-lg flex justify-between items-center">
              <div>
                <p className="font-semibold">{f.name}</p>
                <p className="text-sm text-gray-600">
                  {f.hint} | Height: {f.height} | Weight: {f.weight}
                </p>
              </div>
              <button
                onClick={() => deleteFriend(f.id)}
                className="text-red-600 underline"
              >
                Sil
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
