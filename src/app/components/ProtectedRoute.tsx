"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";

interface Props {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: Props) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        router.push("/auth"); // Giriş yoksa /auth sayfasına yönlendir
      } else {
        setLoading(false); // Giriş varsa sayfayı göster
      }
    };

    checkAuth();
  }, [router]);

  if (loading) return <p>Yükleniyor...</p>;

  return <>{children}</>;
}
