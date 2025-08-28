// src/components/GameOverModal.js
import React from "react";
import { motion } from "framer-motion";

export default function GameOverModal({ 
  isWin, 
  playerChips, 
  onRestart, 
  onExit 
}) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-[rgba(0,0,0,0.95)] text-[#e5e7eb] rounded-2xl p-8 w-96 text-center border-2 border-white shadow-[0_0_0_4px_#000,0_0_0_8px_#fff]"
      >
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className="mb-6"
        >
          {isWin ? (
            <div className="text-6xl mb-4">🏆</div>
          ) : (
            <div className="text-6xl mb-4">💸</div>
          )}
          <h2 className="text-4xl font-bold mb-2">
            {isWin ? "SELAMAT!" : "GAME OVER"}
          </h2>
          <p className={`text-xl font-semibold ${
            isWin ? "text-green-400" : "text-red-400"
          }`}>
            {isWin ? "Anda Menang!" : "Chip Anda Habis"}
          </p>
        </motion.div>

        <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-gray-600">
          <div className="text-lg font-semibold mb-2">
            Total Chip: <span className={isWin ? "text-green-400" : "text-red-400"}>
              {playerChips}
            </span>
          </div>
          <p className="text-sm text-gray-400">
            {isWin 
              ? "Anda berhasil mengumpulkan semua chip!" 
              : "Semua lawan telah mengambil chip Anda."
            }
          </p>
        </div>

        <div className="space-y-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRestart}
            className="w-full px-6 py-3 bg-green-600 text-white font-bold rounded-lg border-2 border-green-700 shadow-lg hover:bg-green-700 transition-colors"
          >
            {isWin ? "Main Lagi" : "Coba Lagi"}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onExit}
            className="w-full px-6 py-3 bg-gray-600 text-white font-bold rounded-lg border-2 border-gray-700 shadow-lg hover:bg-gray-700 transition-colors"
          >
            Keluar
          </motion.button>
        </div>

        {isWin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4 text-sm text-gray-400"
          >
            🎉 Terima kasih telah bermain!
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}