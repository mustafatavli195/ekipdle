"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";
import Image from "next/image";

interface Friend {
  id?: string;
  name: string;
  height: string;
  weight: string;
  gender?: "Erkek" | "Kadın" | "Bilinmiyor";
  zodiac?:
    | "Koç"
    | "Boğa"
    | "İkizler"
    | "Yengeç"
    | "Aslan"
    | "Başak"
    | "Terazi"
    | "Akrep"
    | "Yay"
    | "Oğlak"
    | "Kova"
    | "Balık";
  iq?: number;
  photo_url?: string;
}

export default function ManageGamePage() {
  const { id: gameId } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [friends, setFriends] = useState<Friend[]>([]);

  const [newFriend, setNewFriend] = useState<Friend>({
    name: "",
    height: "",
    weight: "",
    gender: "Bilinmiyor",
    zodiac: undefined,
    iq: undefined,
  });
  const [newPhoto, setNewPhoto] = useState<File | null>(null);

  const [editingFriend, setEditingFriend] = useState<Friend | null>(null);
  const [editPhoto, setEditPhoto] = useState<File | null>(null);

  useEffect(() => {
    const checkOwnership = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/auth");
        return;
      }

      const { data: game, error } = await supabase
        .from("games")
        .select("*")
        .eq("id", gameId)
        .single();

      if (error || !game || game.user_id !== user.id) {
        router.replace("/dashboard");
        return;
      }

      setAuthorized(true);
      setLoading(false);
      fetchFriends();
    };

    checkOwnership();
  }, [gameId, router]);

  const fetchFriends = async () => {
    const { data, error } = await supabase
      .from("friends")
      .select("*")
      .eq("game_id", String(gameId));

    if (error) console.error("Fetch friends error:", error);

    setFriends(data || []);
  };

  const uploadPhoto = async (friendId: string, file: File) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const fileExt = file.name.split(".").pop();
    const fileName = `${friendId}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    const { error } = await supabase.storage
      .from("friends")
      .upload(filePath, file, { upsert: true });

    if (error) {
      console.error("Upload error:", error);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("friends")
      .getPublicUrl(filePath);

    setFriends((prev) =>
      prev.map((f) =>
        f.id === friendId ? { ...f, photo_url: urlData.publicUrl } : f
      )
    );

    await supabase
      .from("friends")
      .update({ photo_url: urlData.publicUrl })
      .eq("id", friendId);
  };

  const handleAddFriend = async () => {
    if (!newFriend.name) return;

    try {
      const { data, error } = await supabase
        .from("friends")
        .insert([{ game_id: gameId, ...newFriend }])
        .select();

      if (error) {
        console.error("Add friend error:", error);
        return;
      }

      const newFriendData = data![0];
      setFriends((prev) => [...prev, newFriendData]);

      if (newPhoto) {
        await uploadPhoto(newFriendData.id!, newPhoto);
      }

      setNewFriend({
        name: "",
        height: "",
        weight: "",
        gender: "Bilinmiyor",
        zodiac: undefined,
        iq: undefined,
      });
      setNewPhoto(null);
    } catch (err) {
      console.error("Unexpected error adding friend:", err);
    }
  };

  const handleDeleteFriend = async (id: string) => {
    const { error } = await supabase.from("friends").delete().eq("id", id);
    if (error) console.error("Delete friend error:", error);
    setFriends((friends) => friends.filter((f) => f.id !== id));
  };

  const handleOpenEdit = (friend: Friend) => {
    setEditingFriend(friend);
    setEditPhoto(null);
  };

  const handleSaveEdit = async () => {
    if (!editingFriend) return;

    const { error } = await supabase
      .from("friends")
      .update({
        name: editingFriend.name,
        height: editingFriend.height,
        weight: editingFriend.weight,
        gender: editingFriend.gender,
        zodiac: editingFriend.zodiac,
        iq: editingFriend.iq,
      })
      .eq("id", editingFriend.id);

    if (error) {
      console.error("Edit friend error:", error);
      return;
    }

    if (editPhoto) {
      await uploadPhoto(editingFriend.id!, editPhoto);
    }

    setFriends((prev) =>
      prev.map((f) => (f.id === editingFriend.id ? editingFriend : f))
    );
    setEditingFriend(null);
  };

  if (loading) return <p>Yükleniyor...</p>;
  if (!authorized) return null;

  return (
    <main className="min-h-screen p-6 max-w-3xl mx-auto bg-gray-900 text-gray-100 relative">
      <h1 className="text-3xl font-semibold mb-6 text-center">
        Arkadaşları Yönet
      </h1>

      {/* Yeni arkadaş ekleme */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        <input
          type="text"
          placeholder="İsim"
          className="border rounded-lg px-3 py-2 bg-gray-800"
          value={newFriend.name}
          onChange={(e) => setNewFriend({ ...newFriend, name: e.target.value })}
        />
        <input
          type="text"
          placeholder="Boy"
          className="border rounded-lg px-3 py-2 bg-gray-800"
          value={newFriend.height}
          onChange={(e) =>
            setNewFriend({ ...newFriend, height: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Kilo"
          className="border rounded-lg px-3 py-2 bg-gray-800"
          value={newFriend.weight}
          onChange={(e) =>
            setNewFriend({ ...newFriend, weight: e.target.value })
          }
        />

        {/* IQ alanı ipucu yerine */}
        <input
          type="number"
          placeholder="IQ"
          className="border rounded-lg px-3 py-2 bg-gray-800 w-full text-white"
          value={newFriend.iq || ""}
          onChange={(e) =>
            setNewFriend({
              ...newFriend,
              iq: e.target.value ? parseInt(e.target.value) : undefined,
            })
          }
        />

        <select
          className="border rounded-lg px-3 py-2 bg-gray-800 w-full text-white"
          value={newFriend.gender}
          onChange={(e) =>
            setNewFriend({
              ...newFriend,
              gender: e.target.value as Friend["gender"],
            })
          }
        >
          <option value="Erkek">Erkek</option>
          <option value="Kadın">Kadın</option>
          <option value="Bilinmiyor">Bilinmiyor</option>
        </select>

        <select
          className="border rounded-lg px-3 py-2 bg-gray-800 w-full text-white"
          value={newFriend.zodiac || ""}
          onChange={(e) =>
            setNewFriend({
              ...newFriend,
              zodiac: e.target.value as Friend["zodiac"],
            })
          }
        >
          <option value="">Seçiniz</option>
          <option value="Koç">Koç</option>
          <option value="Boğa">Boğa</option>
          <option value="İkizler">İkizler</option>
          <option value="Yengeç">Yengeç</option>
          <option value="Aslan">Aslan</option>
          <option value="Başak">Başak</option>
          <option value="Terazi">Terazi</option>
          <option value="Akrep">Akrep</option>
          <option value="Yay">Yay</option>
          <option value="Oğlak">Oğlak</option>
          <option value="Kova">Kova</option>
          <option value="Balık">Balık</option>
        </select>

        <input
          type="file"
          accept="image/*"
          className="border rounded-lg px-3 py-2 bg-gray-800 col-span-1 md:col-span-2"
          onChange={(e) => e.target.files && setNewPhoto(e.target.files[0])}
        />

        <button
          onClick={handleAddFriend}
          className="col-span-1 md:col-span-2 border rounded-lg px-3 py-2 bg-purple-600 hover:bg-purple-700 transition"
        >
          Kaydet
        </button>
      </div>

      {/* Fotoğraflar */}
      <div className="flex flex-wrap gap-4 justify-center mb-6">
        {friends.map((f) => (
          <div
            key={f.id}
            className="w-24 h-24 rounded-lg overflow-hidden cursor-pointer relative transform transition hover:scale-110 hover:shadow-lg"
            onClick={() => handleOpenEdit(f)}
          >
            {f.photo_url ? (
              <Image
                src={f.photo_url}
                alt={f.name}
                fill
                style={{ objectFit: "cover" }}
                className="rounded-lg"
              />
            ) : (
              <div className="w-full h-full bg-gray-600 flex items-center justify-center text-gray-400">
                ?
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingFriend && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-xl w-full max-w-sm flex flex-col gap-4 relative">
            {/* Daha belirgin kapatma tuşu */}
            <button
              onClick={() => setEditingFriend(null)}
              className="absolute top-2 right-2 text-white hover:text-red-500 text-3xl font-bold"
            >
              ×
            </button>

            {editingFriend.photo_url && (
              <div className="w-32 h-32 mx-auto rounded-lg overflow-hidden relative">
                <Image
                  src={editingFriend.photo_url}
                  alt={editingFriend.name}
                  fill
                  style={{ objectFit: "cover" }}
                  className="rounded-lg"
                />
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                e.target.files && setEditPhoto(e.target.files[0])
              }
              className="text-sm text-gray-300 w-full"
            />

            <input
              type="text"
              className="border rounded-lg px-3 py-2 bg-gray-800 w-full text-white"
              value={editingFriend.name}
              onChange={(e) =>
                setEditingFriend({ ...editingFriend, name: e.target.value })
              }
              placeholder="İsim"
            />
            <input
              type="text"
              className="border rounded-lg px-3 py-2 bg-gray-800 w-full text-white"
              value={editingFriend.height}
              onChange={(e) =>
                setEditingFriend({ ...editingFriend, height: e.target.value })
              }
              placeholder="Boy"
            />
            <input
              type="text"
              className="border rounded-lg px-3 py-2 bg-gray-800 w-full text-white"
              value={editingFriend.weight}
              onChange={(e) =>
                setEditingFriend({ ...editingFriend, weight: e.target.value })
              }
              placeholder="Kilo"
            />

            {/* IQ alanı ipucu yerine */}
            <input
              type="number"
              className="border rounded-lg px-3 py-2 bg-gray-800 w-full text-white"
              value={editingFriend.iq || ""}
              onChange={(e) =>
                setEditingFriend({
                  ...editingFriend,
                  iq: e.target.value ? parseInt(e.target.value) : undefined,
                })
              }
              placeholder="IQ"
            />

            <select
              className="border rounded-lg px-3 py-2 bg-gray-800 w-full text-white"
              value={editingFriend.gender || "Bilinmiyor"}
              onChange={(e) =>
                setEditingFriend({
                  ...editingFriend,
                  gender: e.target.value as Friend["gender"],
                })
              }
            >
              <option value="Erkek">Erkek</option>
              <option value="Kadın">Kadın</option>
              <option value="Bilinmiyor">Bilinmiyor</option>
            </select>

            <select
              className="border rounded-lg px-3 py-2 bg-gray-800 w-full text-white"
              value={editingFriend.zodiac || ""}
              onChange={(e) =>
                setEditingFriend({
                  ...editingFriend,
                  zodiac: e.target.value as Friend["zodiac"],
                })
              }
            >
              <option value="">Seçiniz</option>
              <option value="Koç">Koç</option>
              <option value="Boğa">Boğa</option>
              <option value="İkizler">İkizler</option>
              <option value="Yengeç">Yengeç</option>
              <option value="Aslan">Aslan</option>
              <option value="Başak">Başak</option>
              <option value="Terazi">Terazi</option>
              <option value="Akrep">Akrep</option>
              <option value="Yay">Yay</option>
              <option value="Oğlak">Oğlak</option>
              <option value="Kova">Kova</option>
              <option value="Balık">Balık</option>
            </select>

            <div className="flex gap-3 justify-center mt-2">
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-white flex-1"
              >
                Kaydet
              </button>
              <button
                onClick={() => {
                  if (editingFriend.id) handleDeleteFriend(editingFriend.id);
                  setEditingFriend(null);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white flex-1"
              >
                Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
