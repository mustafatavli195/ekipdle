"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";
import Image from "next/image";

interface Interest {
  id: string;
  name: string;
}

interface Friend {
  id?: string;
  name: string;
  height: string;
  weight: string;
  gender?: "Erkek" | "Kadın" | "Bilinmiyor";
  iq?: number;
  charm?: number;
  race?: "Kürt" | "Türk" | "Karadeniz" | "Amerika" | "Zenci" | "Danimarka";
  photo_url?: string;
  interests?: Interest[];
}

export default function ManageGamePage() {
  const { id: gameId } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [allInterests, setAllInterests] = useState<Interest[]>([]);

  const [newFriend, setNewFriend] = useState<Friend>({
    name: "",
    height: "",
    weight: "",
    gender: "Bilinmiyor",
    iq: undefined,
    charm: undefined,
    race: undefined,
    interests: [],
  });
  const [newPhoto, setNewPhoto] = useState<File | null>(null);

  const [editingFriend, setEditingFriend] = useState<Friend | null>(null);
  const [editPhoto, setEditPhoto] = useState<File | null>(null);
  const [editInterests, setEditInterests] = useState<Interest[]>([]);

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
      fetchInterests();
    };

    checkOwnership();
  }, [gameId, router]);

  const fetchFriends = async () => {
    const { data, error } = await supabase
      .from("friends")
      .select(
        `
      *,
      friend_interests (
        interests (id, name)
      )
    `
      )
      .eq("game_id", String(gameId));

    if (error) {
      console.error("Fetch friends error:", error);
      return;
    }

    const normalized = (data || []).map((f: any) => ({
      ...f,
      interests: f.friend_interests?.map((fi: any) => fi.interests) || [],
    }));

    setFriends(normalized);
  };

  const fetchInterests = async () => {
    const { data, error } = await supabase.from("interests").select("*");
    if (error) console.error("Fetch interests error:", error);
    setAllInterests(data || []);
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
        .insert([
          {
            game_id: gameId,
            name: newFriend.name,
            height: newFriend.height,
            weight: newFriend.weight,
            gender: newFriend.gender,
            iq: newFriend.iq,
            charm: newFriend.charm,
            race: newFriend.race,
          },
        ])
        .select();

      if (error) {
        console.error("Add friend error:", error);
        return;
      }

      const newFriendData = data![0];

      if (newPhoto) {
        await uploadPhoto(newFriendData.id!, newPhoto);
      }

      let interestsToSet: Interest[] = [];
      if (newFriend.interests?.length) {
        const insertInterests = newFriend.interests.map((i) => ({
          friend_id: newFriendData.id,
          interest_id: i.id,
        }));
        await supabase.from("friend_interests").insert(insertInterests);
        interestsToSet = newFriend.interests;
      }

      setFriends((prev) => [
        ...prev,
        { ...newFriendData, interests: interestsToSet },
      ]);

      setNewFriend({
        name: "",
        height: "",
        weight: "",
        gender: "Bilinmiyor",
        iq: undefined,
        charm: undefined,
        race: undefined,
        interests: [],
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
    setEditInterests(friend.interests || []);
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
        iq: editingFriend.iq,
        charm: editingFriend.charm,
        race: editingFriend.race,
      })
      .eq("id", editingFriend.id);

    if (error) {
      console.error("Edit friend error:", error);
      return;
    }

    if (editPhoto) {
      await uploadPhoto(editingFriend.id!, editPhoto);
    }

    if (editingFriend.id) {
      await supabase
        .from("friend_interests")
        .delete()
        .eq("friend_id", editingFriend.id);

      if (editInterests.length) {
        const insertInterests = editInterests.map((i) => ({
          friend_id: editingFriend.id,
          interest_id: i.id,
        }));
        await supabase.from("friend_interests").insert(insertInterests);
      }
    }

    setFriends((prev) =>
      prev.map((f) =>
        f.id === editingFriend.id
          ? { ...editingFriend, interests: editInterests }
          : f
      )
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
        <input
          type="number"
          placeholder="Charm"
          className="border rounded-lg px-3 py-2 bg-gray-800 w-full text-white"
          value={newFriend.charm || ""}
          onChange={(e) =>
            setNewFriend({
              ...newFriend,
              charm: e.target.value ? parseInt(e.target.value) : undefined,
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
          value={newFriend.race || ""}
          onChange={(e) =>
            setNewFriend({
              ...newFriend,
              race: e.target.value as Friend["race"],
            })
          }
        >
          <option value="">Seçiniz</option>
          <option value="Kürt">Kürt</option>
          <option value="Türk">Türk</option>
          <option value="Karadeniz">Karadeniz</option>
          <option value="Amerika">Amerika</option>
          <option value="Zenci">Zenci</option>
          <option value="Danimarka">Danimarka</option>
        </select>

        <label className="text-sm text-gray-300 col-span-1 md:col-span-2">
          Interests (Ctrl/Cmd ile çoklu seçim)
        </label>
        <select
          multiple
          className="border rounded-lg px-3 py-2 bg-gray-800 w-full text-white col-span-1 md:col-span-2"
          value={newFriend.interests?.map((i) => i.id) || []}
          onChange={(e) => {
            const selected = Array.from(
              e.target.selectedOptions,
              (o) => o.value
            );
            setNewFriend({
              ...newFriend,
              interests: allInterests.filter((i) => selected.includes(i.id)),
            });
          }}
        >
          {allInterests.map((i) => (
            <option key={i.id} value={i.id}>
              {i.name}
            </option>
          ))}
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
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setEditingFriend(null)}
        >
          <div
            className="bg-gray-900 p-6 rounded-xl w-full max-w-sm flex flex-col gap-3 relative"
            onClick={(e) => e.stopPropagation()}
          >
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

            <label className="text-sm text-gray-300">İsim</label>
            <input
              type="text"
              className="border rounded-lg px-3 py-2 bg-gray-800 w-full text-white"
              value={editingFriend.name}
              onChange={(e) =>
                setEditingFriend({ ...editingFriend, name: e.target.value })
              }
            />

            <label className="text-sm text-gray-300">Boy</label>
            <input
              type="text"
              className="border rounded-lg px-3 py-2 bg-gray-800 w-full text-white"
              value={editingFriend.height}
              onChange={(e) =>
                setEditingFriend({ ...editingFriend, height: e.target.value })
              }
            />

            <label className="text-sm text-gray-300">Kilo</label>
            <input
              type="text"
              className="border rounded-lg px-3 py-2 bg-gray-800 w-full text-white"
              value={editingFriend.weight}
              onChange={(e) =>
                setEditingFriend({ ...editingFriend, weight: e.target.value })
              }
            />

            <label className="text-sm text-gray-300">IQ</label>
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
            />

            <label className="text-sm text-gray-300">Charm</label>
            <input
              type="number"
              className="border rounded-lg px-3 py-2 bg-gray-800 w-full text-white"
              value={editingFriend.charm || ""}
              onChange={(e) =>
                setEditingFriend({
                  ...editingFriend,
                  charm: e.target.value ? parseInt(e.target.value) : undefined,
                })
              }
            />

            <label className="text-sm text-gray-300">Cinsiyet</label>
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

            <label className="text-sm text-gray-300">Race</label>
            <select
              className="border rounded-lg px-3 py-2 bg-gray-800 w-full text-white"
              value={editingFriend.race || ""}
              onChange={(e) =>
                setEditingFriend({
                  ...editingFriend,
                  race: e.target.value as Friend["race"],
                })
              }
            >
              <option value="">Seçiniz</option>
              <option value="Kürt">Kürt</option>
              <option value="Türk">Türk</option>
              <option value="Karadeniz">Karadeniz</option>
              <option value="Amerika">Amerika</option>
              <option value="Zenci">Zenci</option>
              <option value="Danimarka">Danimarka</option>
            </select>

            <label className="text-sm text-gray-300">
              Interests (Ctrl/Cmd ile çoklu seçim)
            </label>
            <select
              multiple
              className="border rounded-lg px-3 py-2 bg-gray-800 w-full text-white"
              value={editInterests.map((i) => i.id)}
              onChange={(e) => {
                const selected = Array.from(
                  e.target.selectedOptions,
                  (o) => o.value
                );
                setEditInterests(
                  allInterests.filter((i) => selected.includes(i.id))
                );
              }}
            >
              {allInterests.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name}
                </option>
              ))}
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
