"use client";

export default function LoadingOverlay() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900/70 z-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 border-4 border-gray-300 border-t-purple-600 rounded-full animate-spin"></div>
        <p className="text-white text-lg font-medium">Yükleniyor...</p>
      </div>
    </div>
  );
}
