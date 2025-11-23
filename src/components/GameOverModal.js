import React from "react";
import { motion } from "framer-motion";

export default function GameOverModal({
  isWin,
  playerChips,
  onRestart,
  onExit,
}) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/80 p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md rounded-[40px] border border-white/10 bg-gradient-to-br from-slate-900 to-black p-8 text-center text-white shadow-2xl"
      >
        <div className="text-5xl">{isWin ? "🏆" : "💸"}</div>
        <h2 className="mt-4 text-3xl font-black">
          {isWin ? "Champion!" : "Out of chips"}
        </h2>
        <p className="mt-2 text-sm text-white/60">
          {isWin
            ? "You emptied every stack on the felt."
            : "All chips are gone, but the felt awaits another run."}
        </p>
        <div className="mt-6 rounded-3xl border border-white/10 bg-black/40 p-4">
          <p className="text-sm uppercase tracking-[0.3em] text-white/50">
            Final stack
          </p>
          <p className="text-3xl font-bold text-yellow-300">{playerChips}</p>
        </div>
        <div className="mt-6 space-y-3">
          <button
            onClick={onRestart}
            className="w-full rounded-2xl bg-emerald-500 py-3 text-lg font-semibold text-black"
          >
            {isWin ? "Defend the title" : "Try again"}
          </button>
          <button
            onClick={onExit}
            className="w-full rounded-2xl border border-white/20 bg-white/10 py-3 text-sm"
          >
            Leave table
          </button>
        </div>
      </motion.div>
    </div>
  );
}
