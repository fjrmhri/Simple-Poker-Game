import React from "react";

export default function OutOfChipsModal({ onRestart, onExit }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
      <div className="bg-[rgba(0,0,0,0.8)] text-[#e5e7eb] rounded-lg p-6 w-96 text-center border border-black shadow-[0_0_0_2px_#fff,0_0_0_4px_#000]">
        <h2 className="text-2xl font-bold mb-4">Saldo chip Anda habis</h2>
        <p className="mb-4">Apakah Anda ingin memulai permainan dari awal?</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onRestart}
            className="px-4 py-2 bg-blue-600 border border-blue-700 text-[#e5e7eb] rounded-lg hover:brightness-110 shadow-[0_0_0_2px_#fff,0_0_0_4px_#000]"
          >
            Mulai Ulang
          </button>
          <button
            onClick={onExit}
            className="px-4 py-2 bg-gray-600 border border-gray-700 text-[#e5e7eb] rounded-lg hover:brightness-110 shadow-[0_0_0_2px_#fff,0_0_0_4px_#000]"
          >
            Keluar
          </button>
        </div>
      </div>
    </div>
  );
}
