'use client'

import { useEffect } from 'react';

type Props = {
  isOpen: boolean;
  title?: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({ isOpen, title = 'Konfirmasi', message, onConfirm, onCancel }: Props) {
  useEffect(() => {
    // Disable scroll saat modal buka
    document.body.style.overflow = isOpen ? 'hidden' : 'auto';
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-2">{title}</h2>
        <p className="mb-4">{message}</p>
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-4 py-2 text-gray-600 hover:text-black">
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}
