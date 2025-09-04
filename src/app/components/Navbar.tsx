"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/app/lib/supabaseClient";
import { User } from "@supabase/supabase-js";

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
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
    <nav className="bg-gray-900 bg-purple-200/30 backdrop-blur-lg p-4 flex justify-between items-center shadow-md border-b border-purple-300 rounded-b-xl">
      <Link
        href="/"
        className="font-bold text-2xl text-purple-700 hover:text-purple-500 transition-all duration-300"
      >
        Ekipdle
      </Link>

      <div className="flex gap-4 items-center">
        <Link
          href="/"
          className="text-purple-700 hover:text-purple-500 transition-all duration-300"
        >
          Ana Sayfa
        </Link>
        <Link
          href="/dashboard"
          className="text-purple-700 hover:text-purple-500 transition-all duration-300"
        >
          Oyun Kur
        </Link>

        {user ? (
          <>
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-bold shadow-sm">
              {user.email || "Kullanıcı"}
            </span>
            <button
              onClick={handleSignOut}
              className="px-3 py-1 bg-red-200 hover:bg-red-100 rounded-xl text-sm font-bold transition-all duration-300 shadow-sm transform hover:-translate-y-1"
            >
              Çıkış Yap
            </button>
          </>
        ) : (
          <Link
            href="/auth"
            className="px-3 py-1 bg-green-200 hover:bg-green-100 rounded-xl text-sm font-bold transition-all duration-300 shadow-sm transform hover:-translate-y-1"
          >
            Giriş Yap
          </Link>
        )}
      </div>
    </nav>
  );
}
