// src/components/WinnerModal.js

import React from "react";

export default function WinnerModal({ winners }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
      <div className="bg-white text-black rounded-lg p-6 shadow-xl w-96 text-center">
        <h2 className="text-2xl font-bold mb-4">Pemenang Ronde</h2>
        <ul className="mb-4">
          {winners.map((winner, idx) => (
            <li key={idx} className="text-lg font-semibold text-green-700">
              {winner}
            </li>
          ))}
        </ul>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Main Lagi
        </button>
      </div>
    </div>
  );
}
