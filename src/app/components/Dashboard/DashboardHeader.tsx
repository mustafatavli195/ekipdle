"use client";

interface DashboardHeaderProps {
  email: string | null;
  onLogout: () => void;
}

export default function DashboardHeader({
  email: _email,
  onLogout,
}: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <button
        onClick={onLogout}
        className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded-lg transition"
      >
        Çıkış
      </button>
    </div>
  );
}
