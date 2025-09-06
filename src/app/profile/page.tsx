"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import LoadingOverlay from "@/app/components/LoadingOverlay";
import { User } from "@supabase/supabase-js";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) throw error;
        setUser(data.user);
      } catch (err) {
        console.error(err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (loading) return <LoadingOverlay />;

  if (!user)
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-white">
        <p className="text-gray-500 text-lg">Kullanıcı bulunamadı.</p>
      </main>
    );

  return (
    <main className="min-h-screen p-6 bg-white font-comic">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-extrabold text-purple-700 mb-6 text-center">
          Profilim
        </h1>

        <div className="bg-white rounded-3xl shadow-2xl p-8 flex flex-col md:flex-row gap-8 items-center border border-gray-200">
          {/* Placeholder avatar */}
          <div className="w-28 h-28 rounded-full bg-purple-100 flex items-center justify-center text-purple-500 font-bold text-2xl">
            {user.email?.charAt(0).toUpperCase() || "U"}
          </div>

          {/* Bilgiler */}
          <div className="flex-1 space-y-4 w-full">
            <ProfileInfo label="Email" value={user.email || "-"} />
            <ProfileInfo label="ID" value={user.id} />
            <ProfileInfo
              label="Oluşturulma Tarihi"
              value={
                user.created_at
                  ? new Date(user.created_at).toLocaleString()
                  : "-"
              }
            />
          </div>
        </div>
      </div>
    </main>
  );
}

interface ProfileInfoProps {
  label: string;
  value: string;
}

function ProfileInfo({ label, value }: ProfileInfoProps) {
  return (
    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl shadow-sm border border-gray-200">
      <span className="font-bold text-purple-700">{label}</span>
      <span className="text-gray-900 font-medium">{value}</span>
    </div>
  );
}
