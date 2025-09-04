"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace("/dashboard");
    });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
      router.replace("/dashboard");
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + "/dashboard" },
    });
    if (error) setError(error.message); 
  };

  return (
    <main className="min-h-screen bg-gray-900 flex items-center justify-center p-4 text-gray-100">
      <div className="w-full max-w-md bg-gray-800 border border-gray-700 rounded-2xl p-6 shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-purple-400 text-center">
          {mode === "signup" ? "Kayıt Ol" : "Giriş Yap"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="E-posta"
            className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-gray-900 text-gray-100 focus:outline-purple-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Şifre"
            className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-gray-900 text-gray-100 focus:outline-purple-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            disabled={loading}
            className="w-full px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition font-bold"
          >
            {loading
              ? "İşleniyor..."
              : mode === "signup"
              ? "Kayıt Ol"
              : "Giriş Yap"}
          </button>
        </form>

        {/* Google ile giriş butonu */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full mt-4 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition font-bold text-white flex items-center justify-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 48 48"
          >
            <path
              fill="#fff"
              d="M44.5 20H24v8.5h11.7C34 33 30 36 24 36c-7.7 0-14-6.3-14-14s6.3-14 14-14c3.6 0 6.8 1.4 9.3 3.7l6.5-6.5C36 2 30 0 24 0 10.7 0 0 10.7 0 24s10.7 24 24 24c11.6 0 21.3-8.2 23.7-19h-3.2z"
            />
          </svg>
          Google ile Giriş Yap
        </button>

        <p className="text-sm mt-4 text-gray-400 text-center">
          {mode === "signup" ? "Hesabın var mı?" : "Hesabın yok mu?"}{" "}
          <button
            className="underline text-purple-400 hover:text-purple-500"
            onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
          >
            {mode === "signup" ? "Giriş Yap" : "Kayıt Ol"}
          </button>
        </p>
      </div>
    </main>
  );
}
