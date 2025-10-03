"use client";

import Modal from "../Common/Modal";

interface LanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LanguageModal({ isOpen, onClose }: LanguageModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-xl font-bold text-purple-700 mb-4">🌐 Dil Seç</h2>
      <div className="flex flex-col gap-3">
        <button className="py-2 bg-purple-100 rounded-lg hover:bg-purple-200 cursor-pointer">
          Türkçe
        </button>
        <button className="py-2 bg-purple-100 rounded-lg hover:bg-purple-200 cursor-pointer">
          English
        </button>
      </div>
      <button
        onClick={onClose}
        className="mt-6 w-full py-2 bg-gray-200 rounded-lg hover:bg-gray-300 cursor-pointer"
      >
        Kapat
      </button>
    </Modal>
  );
}
