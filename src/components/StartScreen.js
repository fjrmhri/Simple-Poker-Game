import React, { useState } from "react";
import { motion } from "framer-motion";

const avatars = [
  "/assets/others/avatar1.jpg",
  "/assets/others/avatar2.jpg",
  "/assets/others/avatar3.jpg",
];

const colors = ["#facc15", "#f97316", "#34d399", "#60a5fa", "#a855f7"];

export default function StartScreen({ onStartGame }) {
  const [name, setName] = useState("Player");
  const [avatar, setAvatar] = useState(avatars[1]);
  const [color, setColor] = useState(colors[0]);
  const [tagline, setTagline] = useState("Ready to shuffle!");
  const [confirming, setConfirming] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleBegin = () => {
    // Validasi ringan sebelum masuk tahap konfirmasi untuk mencegah state tidak konsisten
    if (!name.trim()) {
      setErrorMessage("Nama tidak boleh kosong.");
      return;
    }
    setErrorMessage("");
    setConfirming(true);
  };

  const handleConfirm = () => {
    try {
      setErrorMessage("");
      onStartGame?.({ name: name.trim(), avatar, color, tagline });
    } catch (error) {
      // Pesan yang ramah pengguna agar pemain tahu ada masalah saat memulai permainan
      console.error("Gagal memulai permainan", error);
      setErrorMessage("Terjadi kesalahan saat memulai permainan. Coba lagi.");
      setConfirming(false);
    }
  };

  if (confirming) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/80">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-[360px] rounded-3xl border border-white/10 bg-white/5 p-6 text-center text-white shadow-2xl"
        >
          <h2 className="text-2xl font-bold">Take your seat?</h2>
          <p className="text-sm text-white/60">
            We'll lock in your profile and shuffle the deck.
          </p>
          <img
            src={avatar}
            alt={name}
            className="mx-auto my-4 h-24 w-24 rounded-full border-4 border-white/20 object-cover"
          />
          <p className="text-lg font-semibold">{name}</p>
          <p className="text-sm text-white/60">{tagline}</p>
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => setConfirming(false)}
              className="flex-1 rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-sm"
            >
              Edit
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 rounded-2xl bg-yellow-400 px-4 py-2 text-sm font-semibold text-black"
            >
              Start
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 via-black to-slate-900 p-4 text-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md rounded-[40px] border border-white/10 bg-white/5 p-6 shadow-2xl"
      >
        <p className="text-xs uppercase tracking-[0.4em] text-white/60">
          Texas Hold'em
        </p>
        <h1 className="text-4xl font-black text-yellow-300">PokeReact</h1>
        <p className="text-sm text-white/70">
          Build your legend and conquer the felt.
        </p>

        <div className="mt-6 space-y-4 text-sm">
          <label className="flex flex-col gap-2">
            <span className="text-white/70">Display name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-2xl border border-white/10 bg-black/40 px-3 py-2"
              maxLength={18}
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-white/70">Tagline</span>
            <input
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="rounded-2xl border border-white/10 bg-black/40 px-3 py-2"
              maxLength={40}
            />
          </label>

          <div>
            <p className="text-white/70">Choose avatar</p>
            <div className="mt-3 flex gap-3">
              {avatars.map((option) => (
                <button
                  key={option}
                  onClick={() => setAvatar(option)}
                  className={`rounded-full border-2 ${
                    avatar === option ? "border-yellow-300" : "border-white/20"
                  } p-1`}
                >
                  <img
                    src={option}
                    alt="avatar"
                    className="h-14 w-14 rounded-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-white/70">Accent color</p>
            <div className="mt-3 flex gap-2">
              {colors.map((option) => (
                <button
                  key={option}
                  onClick={() => setColor(option)}
                  style={{ background: option }}
                  className={`h-10 w-10 rounded-full ${color === option ? "ring-4 ring-white/60" : "ring-2 ring-transparent"}`}
                />
              ))}
            </div>
          </div>
        </div>

        {errorMessage && (
          <p className="mt-4 rounded-2xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {errorMessage}
          </p>
        )}

        <button
          onClick={handleBegin}
          className="mt-6 w-full rounded-2xl bg-yellow-400 py-3 text-lg font-semibold text-black shadow-lg"
        >
          Enter the table
        </button>
      </motion.div>
    </div>
  );
}
