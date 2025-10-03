"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase/supabaseClient";
import { User } from "@supabase/supabase-js";

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isShrunk, setIsShrunk] = useState(false); // scroll ile küçültme
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Scroll ile navbar küçültme
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) setIsShrunk(true);
      else setIsShrunk(false);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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

  if (!mounted) return null;

  const buttonBase =
    "px-5 py-1.5 md:px-6 md:py-2 rounded-xl font-bold text-sm md:text-base shadow-sm transition-all duration-300 transform hover:-translate-y-1 hover:scale-105";

  return (
    <nav
      className={`sticky top-0 z-50 bg-purple-200/20 backdrop-blur-lg flex flex-col md:flex-row items-center justify-center shadow-md border-b border-purple-300 rounded-b-xl overflow-visible
      transition-all duration-300
      ${isShrunk ? "py-2" : "py-4"}`}
    >
      {/* Logo + Hamburger */}
      <div className="w-full flex justify-between items-center md:justify-center md:gap-12 transition-all duration-300">
        <Link
          href="/"
          className="hover:scale-105 transition-transform duration-300"
        >
          <img
            src="/images/logo.png"
            alt="Yourdle Logo"
            className={`w-auto transition-all duration-300 ${
              isShrunk ? "h-16" : "h-20"
            }`}
          />
        </Link>

        {/* Hamburger sadece mobil */}
        <button
          className="md:hidden text-[#13173A] focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
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
        className={`w-full flex flex-col overflow-visible transition-all duration-300
          ${
            menuOpen
              ? "max-h-96 mt-3 items-center"
              : "max-h-0 mt-0 items-center"
          }
          md:flex md:flex-row md:items-center md:gap-4 md:max-h-full md:mt-3`}
      >
        {/* Oyun Kur */}
        <Link
          href="/dashboard"
          className={`${buttonBase} bg-[#13173A] text-white hover:bg-[#0f142d]  rounded-2xl font-black`}
          onClick={() => setMenuOpen(false)}
        >
          Oyun Kur
        </Link>

        {/* Dil */}
        <div className="relative">
          <button
            className={`${buttonBase} bg-[#13173A] text-white hover:bg-[#0f142d]`}
          >
            TR
          </button>
        </div>

        {/* Kullanıcı */}
        {user ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={`${buttonBase} bg-[#13173A] text-white hover:bg-[#0f142d] w-full md:w-auto`}
            >
              {user.email || "Kullanıcı"}
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col overflow-visible z-50">
                <Link
                  href="/profile"
                  className="px-4 py-2 text-gray-700 hover:bg-purple-100 rounded-t-xl transition-colors"
                  onClick={() => setDropdownOpen(false)}
                >
                  Profil
                </Link>
                <button
                  onClick={handleSignOut}
                  disabled={isProcessing}
                  className={`px-4 py-2 text-gray-700 hover:bg-red-100 rounded-b-xl transition-colors text-left ${
                    isProcessing ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {isProcessing ? "Çıkış Yapılıyor..." : "Çıkış Yap"}
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            href="/auth/login"
            className={`${buttonBase} bg-[#13173A] text-white hover:bg-[#0f142d]`}
            onClick={() => setMenuOpen(false)}
          >
            Giriş Yap
          </Link>
        )}
      </div>
    </nav>
  );
}
