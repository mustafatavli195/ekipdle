"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase/supabaseClient";
import LoadingOverlay from "@/app/components/Common/LoadingOverlay";
import DashboardHeader from "@/app/components/Dashboard/DashboardHeader";
import DashboardForm from "@/app/components/Dashboard/DashboardForm";
import DashboardList from "@/app/components/Dashboard/DashboardList";
import { useDashboardStore } from "@/app/store/dashboardStore";
import ProtectedRoute from "@/app/components/Common/ProtectedRoute";
export default function Dashboard() {
  const {
    email,
    userId,
    games,
    loading,
    initialLoading,
    logout,
    createGame,
    deleteGame,
    checkAuth,
  } = useDashboardStore();
  const [newTitle, setNewTitle] = useState("");

  useEffect(() => {
    checkAuth(); // ✅ Auth kontrolü ve game fetch burada yapılır
  }, [checkAuth]);

  if (initialLoading) return <LoadingOverlay />;

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gray-900 text-gray-100 p-6 max-w-4xl rounded-3xl mx-auto">
        <DashboardHeader email={email} onLogout={logout} />
        <DashboardForm
          newTitle={newTitle}
          setNewTitle={setNewTitle}
          onCreate={() => {
            createGame(newTitle);
            setNewTitle("");
          }}
          loading={loading}
        />
        <DashboardList games={games} userId={userId} onDelete={deleteGame} />
      </main>
    </ProtectedRoute>
  );
}
