"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";
import { User } from "@supabase/supabase-js";

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const router = useRouter();

  useEffect(() => {
    setMounted(true);

    const fetchUser = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ?? null);
    };
    fetchUser();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
      router.replace("/");
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };
  if (!mounted) return null; // server HTML’i render etmiyor

  return (
    <nav className="bg-purple-200/30 backdrop-blur-lg p-4 flex flex-col md:flex-row items-center justify-center shadow-md border-b border-purple-300 rounded-b-xl">
      {/* Logo + Hamburger */}
      <div className="w-full flex justify-between items-center md:justify-center md:gap-12">
        <Link
          href="/"
          className="font-comic text-3xl md:text-4xl font-extrabold text-purple-600 
                     animate-bounce-slow hover:scale-110 transition-transform duration-300"
        >
          Yourdle
        </Link>

        {/* Hamburger sadece mobil */}
        <button
          className="md:hidden text-purple-700 focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            {menuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Menü */}
      <div
        className={`w-full flex flex-col overflow-hidden transition-all duration-300
          ${
            menuOpen
              ? "max-h-96 mt-4 items-center"
              : "max-h-0 mt-0 items-center"
          }
          md:flex md:flex-row md:items-center md:gap-6 md:max-h-full md:mt-4`}
      >
        <Link
          href="/"
          className="text-purple-600 hover:text-purple-500 transition-all duration-300"
          onClick={() => setMenuOpen(false)}
        >
          Ana Sayfa
        </Link>
        <Link
          href="/dashboard"
          className="text-purple-600 hover:text-purple-500 transition-all duration-300"
          onClick={() => setMenuOpen(false)}
        >
          Oyun Kur
        </Link>

        {user ? (
          <>
            <Link
              href="/profile"
              className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-bold shadow-sm hover:bg-purple-200 transition"
              onClick={() => setMenuOpen(false)}
            >
              {user.email || "Kullanıcı"}
            </Link>
            <button
              onClick={handleSignOut}
              disabled={isProcessing}
              className={`px-3 py-1 bg-red-200 hover:bg-red-100 rounded-xl text-sm font-bold transition-all duration-300 shadow-sm transform hover:-translate-y-1 ${
                isProcessing
                  ? "opacity-70 animate-pulse cursor-not-allowed"
                  : ""
              }`}
            >
              {isProcessing ? "Çıkış Yapılıyor..." : "Çıkış Yap"}
            </button>
          </>
        ) : (
          <Link
            href="/auth"
            className={`px-3 py-1 bg-green-200 hover:bg-green-100 rounded-xl text-sm font-bold transition-all duration-300 shadow-sm transform hover:-translate-y-1 ${
              isProcessing ? "opacity-70 animate-pulse cursor-not-allowed" : ""
            }`}
            onClick={() => setMenuOpen(false)}
          >
            Giriş Yap
          </Link>
        )}
      </div>
    </nav>
  );
}
