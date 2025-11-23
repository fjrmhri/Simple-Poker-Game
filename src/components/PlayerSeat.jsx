import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import CardImg from "./CardImg";
import { getHandName } from "../core/handEvaluator";

export default function PlayerSeat({
  player,
  community = [],
  isYou = false,
  isTurn = false,
  reveal = false,
  round,
  accentColor = "#facc15",
  isDealer = false,
  isWinner = false,
  position = "center",
}) {
  const showFace = isYou || reveal;
  const [timeLeft, setTimeLeft] = useState(30);
  const [avatar, setAvatar] = useState(
    player?.avatar || "/assets/others/dealer.png"
  );

  useEffect(() => {
    if (!isTurn) {
      setTimeLeft(30);
      return;
    }
    setTimeLeft(30);
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isTurn]);

  if (!player) return null;

  const comboName = showFace
    ? getHandName(player.hand || [], community || [])
    : "";

  const handleAvatarChange = (event) => {
    if (!isYou) return;
    const file = event.target.files?.[0];
    if (file) {
      setAvatar(URL.createObjectURL(file));
    }
  };

  const seatAlignment = position === "left" ? "items-start" : position === "right" ? "items-end" : "items-center";

  return (
    <motion.div
      className={`flex w-[190px] flex-col items-center gap-2 rounded-3xl border border-white/10 bg-black/50 p-3 text-xs text-white shadow-xl backdrop-blur ${seatAlignment}`}
      animate={{ scale: isTurn ? 1.05 : 1, opacity: player.folded && !isYou ? 0.5 : 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <label className="relative">
          <img
            src={avatar}
            alt={player.name}
            className={`h-12 w-12 rounded-full border-2 object-cover shadow-inner`}
            style={{ borderColor: accentColor }}
          />
          {isYou && (
            <input
              type="file"
              className="absolute inset-0 cursor-pointer opacity-0"
              onChange={handleAvatarChange}
            />
          )}
          {isDealer && (
            <span className="absolute -right-2 -top-2 rounded-full bg-yellow-400 px-1 text-[10px] font-black text-black">D</span>
          )}
        </label>
        <div>
          <p className="text-sm font-semibold leading-tight">{player.name}</p>
          <p className="text-[11px] text-white/60">{player.chips} chips</p>
        </div>
        {isWinner && <span className="text-lg">🏆</span>}
        {player.lastAction && (
          <span
            className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] text-white/80"
            style={{ boxShadow: isTurn ? `0 0 0 1px ${accentColor}` : undefined }}
          >
            {player.lastActionAmount > 0
              ? `${player.lastAction.toUpperCase()} ${player.lastActionAmount}`
              : player.lastAction.toUpperCase()}
          </span>
        )}
      </div>

      <div className="flex items-center justify-center gap-2">
        <CardImg card={showFace ? player.hand?.[0] : { back: true }} w={60} />
        <CardImg card={showFace ? player.hand?.[1] : { back: true }} w={60} />
      </div>

      {comboName && (
        <p className="text-center text-[11px] text-emerald-200">{comboName}</p>
      )}

      <div className="flex items-center gap-2 text-[11px] text-white/70 w-full">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full"
            style={{ width: `${(timeLeft / 30) * 100}%`, background: accentColor }}
          />
        </div>
        <span>{timeLeft}s</span>
      </div>
    </motion.div>
  );
}
