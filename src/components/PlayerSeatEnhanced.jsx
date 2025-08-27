// src/components/PlayerSeatEnhanced.jsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import CardImg from "./CardImg";
import { getHandName as dapatkanNamaTangan } from "../core/handEvaluator";

export default function PlayerSeatEnhanced({
  pemain,
  komunitas = [],
  adalahAnda = false,
  adalahGiliran = false,
  tampilkan = false,
  ronde,
}) {
  const tampilkanMuka = adalahAnda || tampilkan;
  const [kartu1, kartu2] = pemain.tangan || [];
  const WAKTU_MAKSIMAL = 30;
  const [waktuTersisa, setWaktuTersisa] = useState(WAKTU_MAKSIMAL);
  const [avatar, setAvatar] = useState(
    pemain.avatar || "/assets/others/dealer.png"
  );

  const handleUbahAvatar = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    if (!adalahGiliran) {
      setWaktuTersisa(WAKTU_MAKSIMAL);
      return;
    }
    setWaktuTersisa(WAKTU_MAKSIMAL);
    const id = setInterval(() => {
      setWaktuTersisa((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [adalahGiliran, WAKTU_MAKSIMAL]);

  const namaKombinasi = tampilkanMuka
    ? dapatkanNamaTangan(pemain.tangan || [], komunitas || [])
    : "";
    
  const dapatkanTeksStatus = () => {
    if (pemain.fold) return "Fold";
    if (pemain.allIn) return "All In";
    if (pemain.aksiTerakhir === "bet" || pemain.aksiTerakhir === "raise") {
      return `${pemain.aksiTerakhir === "bet" ? "Bet" : "Raise"} ${
        pemain.jumlahAksiTerakhir ?? 0
      }`;
    }
    if (pemain.aksiTerakhir === "call") return "Call";
    if (pemain.aksiTerakhir === "check") return "Check";
    return "";
  };
  
  const teksStatus = dapatkanTeksStatus();
  const warnaStatus = pemain.fold
    ? "bg-gray-600"
    : pemain.allIn
    ? "bg-purple-600"
    : adalahGiliran
    ? "bg-green-600 animate-pulse"
    : "bg-blue-600";

  return (
    <motion.div
      whileHover={{ scale: adalahGiliran ? 1.02 : 1 }}
      className={`
        relative p-4 min-w-[200px] rounded-2xl transition-all duration-300 ease-in-out
        border-2 shadow-xl backdrop-blur-sm
        ${adalahGiliran 
          ? "border-yellow-400 shadow-[0_0_20px_rgba(255,215,0,0.5)] bg-gradient-to-br from-yellow-900/30 to-yellow-800/20" 
          : "border-gray-600 bg-gradient-to-br from-gray-800/30 to-gray-700/20"
        }
        ${ronde !== "Showdown" && !adalahGiliran ? "opacity-75" : "opacity-100"}
      `}
    >
      {/* Glow effect untuk player's turn */}
      {adalahGiliran && (
        <motion.div
          className="absolute inset-0 rounded-2xl bg-yellow-400 opacity-20 blur-xl"
          animate={{ 
            opacity: [0.1, 0.3, 0.1],
            scale: [1, 1.05, 1]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}

      {/* Player info */}
      <div className="flex items-center gap-3 mb-3">
        <label className="relative cursor-pointer group">
          <motion.img
            whileHover={{ scale: 1.1 }}
            src={avatar}
            alt={pemain.nama}
            className={`
              w-12 h-12 rounded-full border-2 object-cover transition-all
              ${adalahGiliran 
                ? "border-yellow-400 shadow-[0_0_10px_rgba(255,215,0,0.5)]" 
                : "border-gray-400"
              }
            `}
          />
          {adalahAnda && (
            <>
              <input
                type="file"
                onChange={handleUbahAvatar}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </>
          )}
        </label>
        
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div className="font-bold text-lg truncate">
              {pemain.nama}
              {adalahAnda && (
                <span className="ml-2 text-xs bg-blue-600 px-2 py-1 rounded-full">Anda</span>
              )}
              {pemain.adalahBot && (
                <span className="ml-2 text-xs bg-red-600 px-2 py-1 rounded-full">
                  {pemain.tingkatKesulitan === "mudah" ? "🤖" : 
                   pemain.tingkatKesulitan === "normal" ? "🤖🤖" : "🤖🤖🤖"}
                </span>
              )}
            </div>
          </div>
        </div>
        
        {teksStatus && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`text-xs font-bold px-3 py-1 rounded-full ${warnaStatus} shadow-lg`}
          >
            {teksStatus}
          </motion.span>
        )}
      </div>

      {/* Chip info */}
      <div className="flex items-center gap-2 mb-3 text-sm">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <img
            src="/assets/others/bet.png"
            alt="chip"
            className="w-5 h-5 drop-shadow"
          />
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
        </motion.div>
        <span className={`font-bold text-lg ${
          pemain.chips < 100 ? "text-red-400" : 
          pemain.chips < 500 ? "text-yellow-400" : "text-green-400"
        }`}>
          {pemain.chips}
        </span>
        {pemain.taruhanSaatIni > 0 && (
          <span className="text-xs bg-gray-700 px-2 py-1 rounded">
            Bet: {pemain.taruhanSaatIni}
          </span>
        )}
      </div>

      {/* Cards */}
      <div className="flex gap-3 mb-3 justify-center">
        <motion.div
          whileHover={{ scale: tampilkanMuka ? 1.1 : 1, rotateY: tampilkanMuka ? 5 : 0 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <CardImg 
            card={tampilkanMuka ? kartu1 : { back: true }} 
            w={75} 
            className={`transition-all duration-300 transform-gpu ${
              tampilkanMuka 
                ? "drop-shadow-2xl hover:drop-shadow-3xl hover:rotate-3" 
                : "hover:scale-105"
            }`}
          />
        </motion.div>
        <motion.div
          whileHover={{ scale: tampilkanMuka ? 1.1 : 1, rotateY: tampilkanMuka ? -5 : 0 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <CardImg 
            card={tampilkanMuka ? kartu2 : { back: true }} 
            w={75} 
            className={`transition-all duration-300 transform-gpu ${
              tampilkanMuka 
                ? "drop-shadow-2xl hover:drop-shadow-3xl hover:-rotate-3" 
                : "hover:scale-105"
            }`}
          />
        </motion.div>
      </div>

      {/* Hand combination name */}
      {tampilkanMuka && namaKombinasi && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-xs font-semibold text-yellow-400 bg-black/30 px-2 py-1 rounded"
        >
          {namaKombinasi}
        </motion.div>
      )}

      {/* Timer */}
      {adalahGiliran && (
        <motion.div className="mt-3">
          <div className="h-2 rounded-full bg-gray-700 overflow-hidden">
            <motion.div
              animate={{ 
                width: `${(waktuTersisa / WAKTU_MAKSIMAL) * 100}%`,
                backgroundColor: waktuTersisa > 10 ? "#10b981" : "#ef4444"
              }}
              transition={{ ease: "linear", duration: 1 }}
              className="h-full rounded-full"
            />
          </div>
          <div className={`mt-1 text-xs text-center font-bold ${
            waktuTersisa > 10 ? "text-green-400" : "text-red-400 animate-pulse"
          }`}>
            {waktuTersisa}s
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}