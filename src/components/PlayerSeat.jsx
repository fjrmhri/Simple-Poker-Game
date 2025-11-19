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
      className={`flex w-[200px] flex-col gap-2 rounded-3xl border border-white/10 bg-black/50 p-3 text-xs text-white shadow-xl backdrop-blur ${seatAlignment}`}
      animate={{ scale: isTurn ? 1.05 : 1, opacity: player.folded && !isYou ? 0.5 : 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
    >
      <div className="flex items-center gap-2">
        <label className="relative">
          <img
            src={avatar}
            alt={player.name}
            className={`h-10 w-10 rounded-full border-2 object-cover`}
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
        <div className="flex-1">
          <p className="text-sm font-semibold">{player.name}</p>
          <p className="text-[11px] text-white/60">{player.chips} chips</p>
        </div>
        {isWinner && <span className="text-lg">🏆</span>}
      </div>

      <div className="flex items-center justify-between text-[11px] text-white/70">
        <span>{player.lastAction ? player.lastAction : round}</span>
        {player.bet > 0 && <span>Bet {player.bet}</span>}
      </div>

      <div className="flex justify-center gap-2">
        <CardImg card={showFace ? player.hand?.[0] : { back: true }} w={64} />
        <CardImg card={showFace ? player.hand?.[1] : { back: true }} w={64} />
      </div>

      {comboName && (
        <p className="text-center text-[11px] text-emerald-200">{comboName}</p>
      )}

      <div className="flex items-center gap-2 text-[11px] text-white/70">
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
