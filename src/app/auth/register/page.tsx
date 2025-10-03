"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/app/lib/supabase/supabaseClient";
import { useRouter } from "next/navigation";
import LoadingOverlay from "@/app/components/Common/LoadingOverlay";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace("/dashboard");
    });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError("Şifreler eşleşmiyor.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({ email, password });

      if (error) {
        setError(error.message); // Aynı email veya diğer hataları göster
        return;
      }

      // Hata yoksa, email doğrulama için başarı mesajı
      setSuccess(
        "Kayıt isteği başarılı! Lütfen e-postanı doğrula, ardından giriş yapabilirsin."
      );
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin + "/dashboard" },
      });

      if (error) setError(error.message);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Google ile girişte bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-900 flex items-center justify-center p-4 text-gray-100 relative">
      {loading && <LoadingOverlay />}

      <div className="w-full max-w-md bg-gray-800 border border-gray-700 rounded-2xl p-6 shadow-lg relative z-10">
        <h1 className="text-3xl font-bold mb-6 text-purple-400 text-center">
          Kayıt Ol
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="E-posta"
            className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-gray-900 text-gray-100 focus:outline-purple-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />

          <input
            type="password"
            placeholder="Şifre"
            className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-gray-900 text-gray-100 focus:outline-purple-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />

          <input
            type="password"
            placeholder="Şifre Onayı"
            className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-gray-900 text-gray-100 focus:outline-purple-400"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={loading}
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-500 text-sm">{success}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition font-bold"
          >
            Kayıt Ol
          </button>
        </form>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full mt-4 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition font-bold text-white flex items-center justify-center gap-2"
        >
          Google ile Kayıt Ol
        </button>

        <p className="text-sm mt-4 text-gray-400 text-center">
          Hesabın var mı?{" "}
          <a
            href="/auth/login"
            className="underline text-purple-400 hover:text-purple-500"
          >
            Giriş Yap
          </a>
        </p>
      </div>
    </main>
  );
}
