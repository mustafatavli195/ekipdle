"use client";

import { useRouter } from "next/navigation";

interface Game {
  id: string;
  title: string;
  user_id: string;
}

interface DashboardProps {
  games: Game[];
  userId: string | null;
  onDelete: (id: string) => void;
}

export default function DashboardList({
  games,
  userId,
  onDelete,
}: DashboardProps) {
  const router = useRouter();

  return (
    <ul className="space-y-3">
      {games.map((game) => (
        <li
          key={game.id}
          className="border border-gray-700 rounded-xl p-4 bg-gray-800 hover:bg-gradient-to-r hover:from-purple-700 hover:to-indigo-700 cursor-pointer transition shadow-lg flex justify-between items-center"
          onClick={() => router.push(`/game/${game.id}/manage`)}
        >
          <span className="font-bold text-lg">{game.title}</span>

          {game.user_id === userId && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(game.id);
              }}
              className="ml-4 px-4 py-1 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg text-sm font-semibold shadow-md hover:shadow-lg hover:-translate-y-1 transform transition-all duration-200 cursor-pointer hover:from-red-700 hover:to-red-900"
            >
              Sil
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
