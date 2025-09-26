import { supabase } from "./supabase/supabaseClient";

export async function uploadFriendPhoto(friendId: string, file: File) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Kullanıcı giriş yapmamış.");
  }

  const fileExt = file.name.split(".").pop();
  const fileName = `${friendId}.${fileExt}`;
  const filePath = `${user.id}/${fileName}`;

  // ✅ Fotoğrafı Supabase Storage'a yükle
  const { error: uploadError } = await supabase.storage
    .from("friends")
    .upload(filePath, file, { upsert: true });

  if (uploadError) {
    console.error("Upload error:", uploadError);
    throw uploadError;
  }

  // ✅ Public URL al
  const { data: urlData } = supabase.storage
    .from("friends")
    .getPublicUrl(filePath);

  if (!urlData?.publicUrl) {
    throw new Error("Public URL alınamadı.");
  }

  // ✅ friends tablosunda photo_url güncelle
  const { error: updateError } = await supabase
    .from("friends")
    .update({ photo_url: urlData.publicUrl })
    .eq("id", friendId);

  if (updateError) {
    console.error("Update error:", updateError);
    throw updateError;
  }

  return urlData.publicUrl;
}
