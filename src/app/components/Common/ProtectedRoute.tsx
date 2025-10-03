"use client";

import { ReactNode, useEffect } from "react";
import { useAuthStore } from "@/app/store/authStore";
import LoadingOverlay from "@/app/components/Common/LoadingOverlay";

interface Props {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: Props) {
  const { userId, checkAuth, initialLoading } = useAuthStore();

  useEffect(() => {
    if (!userId) checkAuth();
  }, [userId, checkAuth]);

  if (initialLoading) return <LoadingOverlay />;

  return <>{children}</>;
}
