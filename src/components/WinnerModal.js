import React from "react";
import { motion } from "framer-motion";

export default function WinnerModal({ winners, onRestart }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md rounded-[40px] border border-yellow-400/40 bg-gradient-to-br from-black/80 to-emerald-900/40 p-6 text-center text-white shadow-2xl"
      >
        <p className="text-sm uppercase tracking-[0.4em] text-white/60">
          Hand complete
        </p>
        <h2 className="mt-2 text-3xl font-black text-yellow-300">Winner</h2>
        <ul className="mt-4 space-y-1 text-lg">
          {winners.map((winner) => (
            <li key={winner} className="font-semibold text-emerald-200">
              {winner}
            </li>
          ))}
        </ul>
        <button
          onClick={onRestart}
          className="mt-6 w-full rounded-2xl bg-yellow-400 py-3 text-lg font-semibold text-black"
        >
          Deal next hand
        </button>
      </motion.div>
    </div>
  );
}
