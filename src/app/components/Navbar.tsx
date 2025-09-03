"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/app/lib/supabaseClient";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const session = supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <nav className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-4 flex justify-between items-center shadow-lg">
      <Link href="/" className="font-bold text-xl hover:text-gray-200">
      Ekipdle
      </Link>

      <div className="flex gap-4 items-center">
        <Link href="/" className="hover:text-gray-200">
          Ana Sayfa
        </Link>
        <Link href="/dashboard" className="hover:text-gray-200">
          Oyun Kur
        </Link>

        {user ? (
          <>
            <span className="px-2 py-1 bg-white text-indigo-600 rounded-full text-sm font-medium">
              {user.email || "Kullanıcı"}
            </span>
            <button
              onClick={handleSignOut}
              className="px-3 py-1 bg-red-500 hover:bg-red-600 rounded-lg text-sm"
            >
              Çıkış Yap
            </button>
          </>
        ) : (
          <Link
            href="/auth"
            className="px-3 py-1 bg-green-500 hover:bg-green-600 rounded-lg text-sm"
          >
            Giriş Yap
          </Link>
        )}
      </div>
    </nav>
  );
}
