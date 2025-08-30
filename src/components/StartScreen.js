// src/components/StartScreen.js
import React, { useState } from "react";
import { motion } from "framer-motion";

export default function StartScreen({ onStartGame }) {
  const [namaPemain, setNamaPemain] = useState("Pemain");
  const [avatarTerpilih, setAvatarTerpilih] = useState(
    "/assets/others/avatar2.jpg"
  );
  const [showConfirmation, setShowConfirmation] = useState(false);

  const avatarOptions = [
    "/assets/others/avatar1.jpg",
    "/assets/others/avatar2.jpg",
    "/assets/others/avatar3.jpg",
  ];

  const handleMulai = () => {
    if (!namaPemain.trim()) {
      alert("Silakan masukkan nama Anda!");
      return;
    }
    setShowConfirmation(true);
  };

  const handleKonfirmasi = () => {
    onStartGame({
      nama: namaPemain.trim(),
      avatar: avatarTerpilih,
    });
  };

  const handleBatal = () => {
    setShowConfirmation(false);
  };

  if (showConfirmation) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-[rgba(0,0,0,0.9)] text-[#e5e7eb] rounded-2xl p-8 w-96 text-center border-2 border-white shadow-[0_0_0_4px_#000,0_0_0_8px_#fff]"
        >
          <h2 className="text-3xl font-bold mb-4 text-yellow-400">
            Konfirmasi
          </h2>
          <div className="mb-6">
            <p className="text-lg mb-2">Apakah Anda siap memulai permainan?</p>
            <div className="flex items-center justify-center gap-3 mt-4">
              <img
                src={avatarTerpilih}
                alt="Avatar"
                className="w-16 h-16 rounded-full border-2 border-white shadow-lg"
              />
              <div className="text-left">
                <p className="font-semibold text-xl">{namaPemain}</p>
                <p className="text-sm text-gray-400">Chip Awal: 1000</p>
              </div>
            </div>
          </div>
          <div className="flex gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleKonfirmasi}
              className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg border-2 border-green-700 shadow-lg hover:bg-green-700 transition-colors"
            >
              Ya, Mulai!
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBatal}
              className="px-6 py-3 bg-red-600 text-white font-bold rounded-lg border-2 border-red-700 shadow-lg hover:bg-red-700 transition-colors"
            >
              Batal
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-[rgba(0,0,0,0.9)] text-[#e5e7eb] rounded-2xl p-8 w-96 text-center border-2 border-white shadow-[0_0_0_4px_#000,0_0_0_8px_#fff]"
      >
        <h1 className="text-4xl font-bold mb-2 text-yellow-400">PokeReact</h1>
        <p className="text-lg mb-6 text-gray-300">Game Poker Interaktif</p>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Nama Pemain</label>
          <input
            type="text"
            value={namaPemain}
            onChange={(e) => setNamaPemain(e.target.value)}
            placeholder="Masukkan nama Anda"
            className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            maxLength={20}
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-3">Pilih Avatar</label>
          <div className="flex justify-center gap-4">
            {avatarOptions.map((avatar, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setAvatarTerpilih(avatar)}
                className={`relative p-1 rounded-full transition-all ${
                  avatarTerpilih === avatar
                    ? "ring-4 ring-yellow-400 ring-offset-2 ring-offset-gray-900"
                    : "ring-2 ring-gray-600 hover:ring-gray-400"
                }`}
              >
                <img
                  src={avatar}
                  alt={`Avatar ${index + 1}`}
                  className="w-16 h-16 rounded-full border-2 border-gray-400"
                />
                {avatarTerpilih === avatar && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleMulai}
          className="w-full px-6 py-3 bg-blue-600 text-white font-bold rounded-lg border-2 border-blue-700 shadow-lg hover:bg-blue-700 transition-colors"
        >
          Mulai Permainan
        </motion.button>
      </motion.div>
    </div>
  );
}
