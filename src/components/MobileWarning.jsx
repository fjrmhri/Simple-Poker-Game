// src/components/MobileWarning.js
import React from "react";
import { motion } from "framer-motion";

export default function MobileWarning() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-90 z-50 p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gradient-to-br from-red-900 via-red-800 to-red-900 text-white rounded-2xl p-8 max-w-md w-full text-center border-2 border-red-600 shadow-2xl"
      >
        <motion.div
          animate={{
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          className="text-6xl mb-4"
        >
          📱
        </motion.div>

        <h2 className="text-3xl font-bold mb-4 text-red-100">
          Layar Terlalu Kecil
        </h2>

        <p className="text-lg mb-6 text-red-200">
          Maaf, game poker ini membutuhkan layar yang lebih besar untuk
          pengalaman bermain yang optimal.
        </p>

        <div className="bg-black/30 rounded-lg p-4 mb-6 border border-red-600">
          <h3 className="font-semibold mb-2 text-red-100">
            Persyaratan Minimum:
          </h3>
          <ul className="text-sm text-left space-y-1 text-red-200">
            <li>• Lebar layar: minimal 768px</li>
            <li>• Tinggi layar: minimal 600px</li>
            <li>• Orientasi: Landscape direkomendasikan</li>
          </ul>
        </div>

        <div className="space-y-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.reload()}
            className="w-full px-6 py-3 bg-red-600 text-white font-bold rounded-lg border-2 border-red-700 shadow-lg hover:bg-red-700 transition-colors"
          >
            Coba Lagi
          </motion.button>

          <div className="text-xs text-red-300">
            💡 Tips: Rotasi perangkat Anda ke mode landscape atau gunakan layar
            yang lebih besar
          </div>
        </div>
      </motion.div>
    </div>
  );
}
