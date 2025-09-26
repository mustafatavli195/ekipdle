"use client";

interface DashboardFormProps {
  newTitle: string;
  setNewTitle: (title: string) => void;
  onCreate: () => void;
  loading: boolean;
}


export default function DashboardForm({
  newTitle,
  setNewTitle,
  onCreate,
  loading,
}: DashboardFormProps) {
  return (
    <div className="mb-6 flex gap-2">
      <input
        type="text"
        placeholder="Yeni oyun adı"
        className="flex-1 border border-gray-700 rounded-lg px-3 py-2 bg-gray-800 text-gray-100 focus:outline-purple-400"
        value={newTitle}
        onChange={(e) => setNewTitle(e.target.value)}
      />
      <button
        onClick={onCreate}
        disabled={loading}
        className="border border-gray-700 rounded-lg px-3 py-2 bg-purple-600 hover:bg-purple-700 transition text-white"
      >
        {loading ? "Ekleniyor..." : "Oyun Ekle"}
      </button>
    </div>
  );
}
