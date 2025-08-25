import React from "react";

export default function OutOfChipsModal({ onRestart, onExit }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
      <div className="bg-white text-black rounded-lg p-6 shadow-xl w-96 text-center">
        <h2 className="text-2xl font-bold mb-4">Saldo chip Anda habis</h2>
        <p className="mb-4">Apakah Anda ingin memulai permainan dari awal?</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onRestart}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Mulai Ulang
          </button>
          <button
            onClick={onExit}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Keluar
          </button>
        </div>
      </div>
    </div>
  );
}
