"use client";
import LoadingOverlay from "@/app/components/LoadingOverlay";
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

interface RawFriend {
  id: string;
  name: string;
  height: string;
  weight: string;
  gender?: "Erkek" | "Kadın" | "Bilinmiyor";
  iq?: number;
  charm?: number;
  race?: "Kürt" | "Türk" | "Karadeniz" | "Amerika" | "Zenci" | "Danimarka";
  photo_url?: string;
  friend_interests?: {
    interests: Interest;
  }[];
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
  const [saving, setSaving] = useState(false);

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
      .select(`*, friend_interests (interests (id, name))`)
      .eq("game_id", String(gameId));

    if (error) {
      console.error("Fetch friends error:", error);
      return;
    }

    const normalized: Friend[] = (data || []).map((f: RawFriend) => ({
      id: f.id,
      name: f.name,
      height: f.height,
      weight: f.weight,
      gender: f.gender,
      iq: f.iq,
      charm: f.charm,
      race: f.race,
      photo_url: f.photo_url,
      interests: f.friend_interests?.map((fi) => fi.interests) || [],
    }));

    setFriends(normalized);
  };

  const fetchInterests = async () => {
    const { data, error } = await supabase.from("interests").select("*");
    if (error) console.error("Fetch interests error:", error);
    setAllInterests(data || []);
  };

  // Fotoğraf yükleme ve hemen state güncelleme
  const uploadPhoto = async (friendId: string, file: File) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const fileExt = file.name.split(".").pop();
    const fileName = `${friendId}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    // Fotoğrafı yükle
    const { error } = await supabase.storage
      .from("friends")
      .upload(filePath, file, { upsert: true });
    if (error) {
      console.error("Upload error:", error);
      return null;
    }

    // Public URL al
    const { data: urlData } = supabase.storage
      .from("friends")
      .getPublicUrl(filePath);

    // URL’i veritabanına kaydet
    await supabase
      .from("friends")
      .update({ photo_url: urlData.publicUrl })
      .eq("id", friendId);

    // Arkadaşın en güncel verisini çek
    const { data: freshFriend } = await supabase
      .from("friends")
      .select("*")
      .eq("id", friendId)
      .single();

    return freshFriend?.photo_url || null;
  };

  // Helper: fotoğraf yükle ve Friend objesini güncelle
  const uploadAndSetPhoto = async (friend: Friend, file: File | null) => {
    if (!file || !friend.id) return friend;
    const url = await uploadPhoto(friend.id, file);
    if (url) friend.photo_url = url;
    return friend;
  };

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const validateFriend = (friend: Friend) => {
    const errs: { [key: string]: string } = {};

    if (!friend.name.trim()) errs.name = "İsim zorunludur.";

    if (!friend.height || isNaN(Number(friend.height)))
      errs.height = "Boy zorunludur ve sayı olmalı.";

    if (!friend.weight || isNaN(Number(friend.weight)))
      errs.weight = "Kilo zorunludur ve sayı olmalı.";

    if (friend.iq === undefined || friend.iq === null || isNaN(friend.iq))
      errs.iq = "IQ zorunludur ve sayı olmalı.";
    else if (friend.iq < 0) errs.iq = "IQ pozitif olmalı.";

    if (
      friend.charm === undefined ||
      friend.charm === null ||
      isNaN(friend.charm)
    )
      errs.charm = "Charm zorunludur.";
    else if (friend.charm < 1 || friend.charm > 10)
      errs.charm = "Charm 1 ile 10 arasında olmalı.";

    if (!friend.interests || friend.interests.length === 0)
      errs.interests = "En az bir ilgi alanı seçmelisiniz.";

    return errs;
  };

  const handleAddFriend = async () => {
    const validationErrors = validateFriend(newFriend);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setSaving(true);
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

      let newFriendData = data![0];

      // Fotoğraf varsa yükle ve güncelle
      newFriendData = await uploadAndSetPhoto(newFriendData, newPhoto);

      // İlgi alanları
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
    } finally {
      setSaving(false); // kaydetme bitti
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

  const [editErrors, setEditErrors] = useState<{ [key: string]: string }>({});

  const validateEditFriend = (friend: Friend) => {
    const errs: { [key: string]: string } = {};
    if (!friend.name.trim()) errs.name = "İsim zorunludur.";
    if (
      !friend.height ||
      !friend.height.toString().trim() ||
      isNaN(Number(friend.height))
    )
      errs.height = "Boy sayı olmalı.";

    if (
      !friend.weight ||
      !friend.weight.toString().trim() ||
      isNaN(Number(friend.weight))
    )
      errs.weight = "Kilo sayı olmalı.";

    if (friend.iq !== undefined && (isNaN(friend.iq) || friend.iq < 0))
      errs.iq = "IQ pozitif sayı olmalı.";
    if (friend.charm !== undefined && (friend.charm < 1 || friend.charm > 10))
      errs.charm = "Charm 1 ile 10 arasında olmalı.";
    return errs;
  };

  const handleSaveEdit = async () => {
    if (!editingFriend) return;

    const validationErrors = validateEditFriend(editingFriend);
    if (Object.keys(validationErrors).length > 0) {
      setEditErrors(validationErrors);
      return;
    }
    setEditErrors({});

    try {
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

      // Fotoğraf varsa yükle ve güncelle
      const updatedFriend = await uploadAndSetPhoto(editingFriend, editPhoto);

      // İlgi alanları
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
          f.id === updatedFriend.id
            ? { ...updatedFriend, interests: editInterests }
            : f
        )
      );

      setEditingFriend(null);
      setEditPhoto(null);
      setEditInterests([]);
    } catch (err) {
      console.error("Unexpected error editing friend:", err);
    }
  };

  if (loading) return <LoadingOverlay />;
  if (!authorized) return null;
  return (
    <main className="min-h-screen p-6 max-w-3xl mx-auto bg-gray-900 text-gray-100 rounded-3xl relative">
      <h1 className="text-3xl font-semibold mb-6 text-center">
        Arkadaşları Yönet
      </h1>

      {/* Yeni arkadaş ekleme */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        {/* İsim */}
        <div className="col-span-1 md:col-span-2 relative">
          <input
            type="text"
            placeholder="İsim (zorunlu)"
            className="border rounded-lg px-3 py-2 bg-gray-800 w-full"
            value={newFriend.name}
            onChange={(e) => {
              setNewFriend({ ...newFriend, name: e.target.value });
              setErrors((prev) => {
                const copy = { ...prev };
                delete copy.name; // ✅ EKLENDİ - hata temizleme
                return copy;
              });
            }}
          />
          <p className="text-red-400 text-sm min-h-[1em]">
            {errors.name || "\u00A0"}
          </p>
        </div>

        {/* Boy */}
        <div className="relative">
          <input
            type="number"
            placeholder="Boy (cm)"
            className="border rounded-lg px-3 py-2 bg-gray-800 w-full"
            min={0}
            value={newFriend.height}
            onChange={(e) => {
              setNewFriend({ ...newFriend, height: e.target.value });
              setErrors((prev) => {
                const copy = { ...prev };
                delete copy.height; // ✅ EKLENDİ
                return copy;
              });
            }}
          />
          <p className="text-red-400 text-sm min-h-[1em]">
            {errors.height || "\u00A0"}
          </p>
        </div>

        {/* Kilo */}
        <div className="relative">
          <input
            type="number"
            placeholder="Kilo (kg)"
            className="border rounded-lg px-3 py-2 bg-gray-800 w-full"
            min={0}
            value={newFriend.weight}
            onChange={(e) => {
              setNewFriend({ ...newFriend, weight: e.target.value });
              setErrors((prev) => {
                const copy = { ...prev };
                delete copy.weight; // ✅ EKLENDİ
                return copy;
              });
            }}
          />
          <p className="text-red-400 text-sm min-h-[1em]">
            {errors.weight || "\u00A0"}
          </p>
        </div>

        {/* IQ */}
        <div className="relative col-span-1 md:col-span-2">
          <input
            type="number"
            placeholder="IQ"
            className="border rounded-lg px-3 py-2 bg-gray-800 w-full text-white"
            value={newFriend.iq || ""}
            onChange={(e) => {
              setNewFriend({
                ...newFriend,
                iq: e.target.value ? parseInt(e.target.value) : undefined,
              });
              setErrors((prev) => {
                const copy = { ...prev };
                delete copy.iq; // ✅ EKLENDİ
                return copy;
              });
            }}
          />
          <p className="text-red-400 text-sm min-h-[1em]">
            {errors.iq || "\u00A0"}
          </p>
        </div>

        {/* Charm */}
        <div className="relative col-span-1 md:col-span-2">
          <input
            type="number"
            placeholder="Charm (1-10)"
            className="border rounded-lg px-3 py-2 bg-gray-800 w-full text-white"
            min={1}
            max={10}
            value={newFriend.charm || ""}
            onChange={(e) => {
              setNewFriend({
                ...newFriend,
                charm: e.target.value ? parseInt(e.target.value) : undefined,
              });
              setErrors((prev) => {
                const copy = { ...prev };
                delete copy.charm; // ✅ EKLENDİ
                return copy;
              });
            }}
          />
          <p className="text-red-400 text-sm min-h-[1em]">
            {errors.charm || "\u00A0"}
          </p>
        </div>

        {/* Gender */}
        <div className="relative col-span-1 md:col-span-2">
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
          <p className="text-red-400 text-sm min-h-[1em]">&nbsp;</p>
        </div>

        {/* Race */}
        <div className="relative col-span-1 md:col-span-2">
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
          <p className="text-red-400 text-sm min-h-[1em]">&nbsp;</p>
        </div>

        {/* Interests */}
        <div className="col-span-1 md:col-span-2 flex flex-col">
          <label className="text-sm text-gray-300 mb-1">Interests</label>
          <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 border rounded-lg bg-gray-800">
            {allInterests.map((i) => (
              <label
                key={i.id}
                className="flex items-center gap-1 px-2 py-1 bg-gray-700 rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={newFriend.interests?.some((ni) => ni.id === i.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setNewFriend({
                        ...newFriend,
                        interests: [...(newFriend.interests || []), i],
                      });
                    } else {
                      setNewFriend({
                        ...newFriend,
                        interests: (newFriend.interests || []).filter(
                          (ni) => ni.id !== i.id
                        ),
                      });
                    }
                  }}
                />
                {i.name}
              </label>
            ))}
          </div>
          <p className="text-red-400 text-sm min-h-[1em]">
            {errors.interests || "\u00A0"}
          </p>
        </div>
        {/* Fotoğraf yükleme alanı */}
        <div className="relative col-span-1 md:col-span-2">
          <label
            htmlFor="photo-upload"
            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-500 rounded-xl cursor-pointer hover:border-blue-500 transition"
          >
            {newPhoto ? (
              <span className="text-green-400 font-medium">
                📷 {newPhoto.name}
              </span>
            ) : (
              <span className="text-gray-400">
                📁 Fotoğraf eklemek için tıklayın veya sürükleyin
              </span>
            )}
            <input
              id="photo-upload"
              type="file"
              className="hidden"
              accept="image/png, image/jpeg"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                if (file && !file.type.startsWith("image/")) {
                  setErrors((prev) => ({
                    ...prev,
                    photo: "Lütfen sadece resim dosyası seçin.", // ✅ kullanıcı dostu hata
                  }));
                  setNewPhoto(null);
                } else {
                  setNewPhoto(file);
                  setErrors((prev) => {
                    const copy = { ...prev };
                    delete copy.photo;
                    return copy;
                  });
                }
              }}
            />
          </label>
          <p className="text-red-400 text-sm min-h-[1em] mt-1">
            {errors.photo || "\u00A0"}
          </p>
        </div>
      </div>

      {/* Kaydet / Arkadaş ekle butonu */}
      <div className="col-span-1 md:col-span-2 flex justify-center mb-12">
        <button
          onClick={handleAddFriend}
          disabled={saving}
          className={`w-full md:w-1/2 py-3 rounded-xl font-semibold text-lg transition ${
            saving
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 shadow-lg"
          } text-white`}
        >
          {saving ? "Kaydediliyor..." : "➕ Arkadaş Ekle"}
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
                sizes="(max-width: 768px) 100vw, 96px" // <-- eklendi
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
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setEditingFriend(null)}
        >
          <div
            className="bg-gray-900 p-6 rounded-xl w-full max-w-2xl grid grid-cols-2 gap-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setEditingFriend(null)}
              className="absolute top-2 right-2 text-white hover:text-red-500 text-3xl font-bold"
            >
              ×
            </button>
            {/* Fotoğraf + Yatay Bilgiler */}
            <div className="col-span-2 flex flex-row gap-4 items-start">
              {/* Sol: Fotoğraf */}
              <div
                className="w-32 h-32 rounded-lg overflow-hidden cursor-pointer relative flex items-center justify-center shadow hover:shadow-lg transition-transform transform hover:scale-105 group bg-gray-800 flex-shrink-0"
                onClick={() =>
                  document.getElementById("edit-photo-input")?.click()
                }
              >
                {editingFriend.photo_url ? (
                  <Image
                    src={editingFriend.photo_url}
                    alt={editingFriend.name}
                    fill
                    style={{ objectFit: "cover" }}
                    className="rounded-lg"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 font-bold text-sm">
                    Fotoğraf
                  </div>
                )}

                {/* Düzenleme simgesi - daha belirgin */}
                <div className="absolute bottom-2 right-2 bg-black/50 text-white text-sm p-1.5 rounded-full flex items-center justify-center shadow-lg">
                  ✎
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/10 flex items-center justify-center text-white text-xs font-semibold transition opacity-0 group-hover:opacity-100 rounded-lg">
                  Fotoğrafı değiştir
                </div>

                {/* Gizli input */}
                <input
                  id="edit-photo-input"
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    e.target.files && setEditPhoto(e.target.files[0])
                  }
                  className="hidden"
                />
              </div>

              {/* Sağ: Yatay Bilgiler */}
              <div className="flex-1 flex flex-col gap-1 text-white text-sm">
                {/* 1. Satır: İsim / Cinsiyet */}
                <div className="flex gap-4">
                  <p className="flex items-center gap-1">
                    <span className="text-gray-400">İsim:</span>
                    <span className="font-semibold">{editingFriend.name}</span>
                  </p>
                  <p className="flex items-center gap-1">
                    <span className="text-gray-400">Cinsiyet:</span>
                    <span className="font-semibold">
                      {editingFriend.gender || "Bilinmiyor"}
                    </span>
                  </p>
                </div>

                {/* 2. Satır: Boy / Kilo / IQ */}
                <div className="flex gap-4">
                  <p className="flex items-center gap-1">
                    <span className="text-gray-400">Boy / Kilo:</span>
                    <span className="font-semibold">
                      {editingFriend.height} / {editingFriend.weight}
                    </span>
                  </p>
                  <p className="flex items-center gap-1">
                    <span className="text-gray-400">IQ:</span>
                    <span className="font-semibold">
                      {editingFriend.iq ?? "-"}
                    </span>
                  </p>
                </div>

                {/* 3. Satır: Charm / Irk */}
                <div className="flex gap-4">
                  <p className="flex items-center gap-1">
                    <span className="text-gray-400">Charm:</span>
                    <span className="font-semibold">
                      {editingFriend.charm ?? "-"}
                    </span>
                  </p>
                  <p className="flex items-center gap-1">
                    <span className="text-gray-400">Irk:</span>
                    <span className="font-semibold">
                      {editingFriend.race || "-"}
                    </span>
                  </p>
                </div>

                {/* Interests: tek satır */}
                <div className="flex flex-wrap gap-1 mt-1">
                  {(editingFriend.interests || []).map((i, idx) => (
                    <span
                      key={typeof i === "string" ? i : i.id || idx}
                      className="bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full"
                    >
                      {typeof i === "string" ? i : i.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* İsim */}
            <div className="col-span-2 flex flex-col">
              <label className="text-sm text-gray-300">İsim</label>
              <input
                type="text"
                className="border rounded-lg px-3 py-2 bg-gray-800 text-white"
                value={editingFriend.name}
                onChange={(e) =>
                  setEditingFriend({ ...editingFriend, name: e.target.value })
                }
              />
              <p className="text-red-400 text-sm min-h-[1em]">
                {editErrors.name || "\u00A0"}
              </p>
            </div>

            {/* Boy & Kilo */}
            <div className="flex flex-col">
              <label className="text-sm text-gray-300">Boy</label>
              <input
                type="text"
                className="border rounded-lg px-3 py-2 bg-gray-800 text-white"
                value={editingFriend.height}
                onChange={(e) =>
                  setEditingFriend({ ...editingFriend, height: e.target.value })
                }
              />
              <p className="text-red-400 text-sm min-h-[1em]">
                {editErrors.height || "\u00A0"}
              </p>
            </div>
            <div className="flex flex-col">
              <label className="text-sm text-gray-300">Kilo</label>
              <input
                type="text"
                className="border rounded-lg px-3 py-2 bg-gray-800 text-white"
                value={editingFriend.weight}
                onChange={(e) =>
                  setEditingFriend({ ...editingFriend, weight: e.target.value })
                }
              />
              <p className="text-red-400 text-sm min-h-[1em]">
                {editErrors.weight || "\u00A0"}
              </p>
            </div>

            {/* IQ & Charm */}
            <div className="flex flex-col">
              <label className="text-sm text-gray-300">IQ</label>
              <input
                type="number"
                className="border rounded-lg px-3 py-2 bg-gray-800 text-white"
                value={editingFriend.iq || ""}
                onChange={(e) =>
                  setEditingFriend({
                    ...editingFriend,
                    iq: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
              />
              <p className="text-red-400 text-sm min-h-[1em]">
                {editErrors.iq || "\u00A0"}
              </p>
            </div>
            <div className="flex flex-col">
              <label className="text-sm text-gray-300">Charm</label>
              <input
                type="number"
                className="border rounded-lg px-3 py-2 bg-gray-800 text-white"
                value={editingFriend.charm || ""}
                onChange={(e) =>
                  setEditingFriend({
                    ...editingFriend,
                    charm: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  })
                }
              />
              <p className="text-red-400 text-sm min-h-[1em]">
                {editErrors.charm || "\u00A0"}
              </p>
            </div>

            {/* Cinsiyet & Race */}
            <div className="flex flex-col">
              <label className="text-sm text-gray-300">Cinsiyet</label>
              <select
                className="border rounded-lg px-3 py-2 bg-gray-800 text-white"
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
            </div>
            <div className="flex flex-col">
              <label className="text-sm text-gray-300">Race</label>
              <select
                className="border rounded-lg px-3 py-2 bg-gray-800 text-white"
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
            </div>

            {/* Interests */}
            <div className="col-span-2 flex flex-col">
              <label className="text-sm text-gray-300 mb-1">Interests</label>
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 border rounded-lg bg-gray-800">
                {allInterests.map((i) => (
                  <label
                    key={i.id}
                    className="flex items-center gap-1 px-2 py-1 bg-gray-700 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={editInterests.some((ei) => ei.id === i.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setEditInterests([...editInterests, i]);
                        } else {
                          setEditInterests(
                            editInterests.filter((ei) => ei.id !== i.id)
                          );
                        }
                      }}
                    />
                    <span className="text-white">{i.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Butonlar */}
            <div className="col-span-2 flex gap-3 justify-center mt-2">
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
