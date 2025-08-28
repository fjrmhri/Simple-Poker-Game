// src/components/PlayerSeat.jsx
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
}) {
  const showFace = isYou || reveal;
  const [c1, c2] = player.hand || [];
  const MAX_TIME = 30;
  const [timeLeft, setTimeLeft] = useState(MAX_TIME);
  const [avatar, setAvatar] = useState(
    player.avatar || "/assets/others/dealer.png"
  );

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    if (!isTurn) {
      setTimeLeft(MAX_TIME);
      return;
    }
    setTimeLeft(MAX_TIME);
    const id = setInterval(() => {
      setTimeLeft((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [isTurn, MAX_TIME]);

  const comboName = showFace
    ? getHandName(player.hand || [], community || [])
    : "";
  const getStatusText = () => {
    if (player.folded) return "Fold";
    if (player.allIn) return "All In";
    if (player.lastAction === "bet" || player.lastAction === "raise") {
      return `${player.lastAction === "bet" ? "Bet" : "Raise"} ${
        player.lastActionAmount ?? 0
      }`;
    }
    if (player.lastAction === "call") return "Call";
    if (player.lastAction === "check") return "Check";
    return "";
  };
  const statusText = getStatusText();
  const statusColor = player.folded
    ? "bg-gray-600"
    : player.allIn
    ? "bg-purple-600"
    : isTurn
    ? "bg-green-600"
    : "bg-blue-600";
  return (
      <div
        className={`p-2 min-w-[200px] rounded-xl transition-all duration-300 ease-in-out border border-black shadow-[0_0_0_2px_#fff,0_0_0_4px_#000] bg-black/40 text-gray-100 ${
          isTurn ? "ring-2 ring-white" : ""
        } ${round !== "Showdown" && !isTurn ? "opacity-50" : ""}`}
      >
      <div className="flex items-center gap-2">
        <label className="relative cursor-pointer">
          <img
            src={avatar}
            alt={player.name}
            className="w-10 h-10 rounded-full border border-black shadow-[0_0_0_2px_#fff,0_0_0_4px_#000] object-cover"
          />
          {isYou && (
            <input
              type="file"
              onChange={handleAvatarChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          )}
        </label>
        <div className="font-bold flex-1">{player.name}</div>
        {statusText && (
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded ${statusColor}`}
          >
            {statusText}
          </span>
        )}
      </div>
      <div className="mt-1 flex items-center gap-2 text-sm opacity-90">
        <img
          src="/assets/others/bet.png"
          alt="chips"
          className="w-4 h-4 drop-shadow"
        />
        <span className="text-lg font-bold">{player.chips}</span>
        {player.bet > 0 && (
          <span className="text-xs">Bet: {player.bet}</span>
        )}
        {player.taruhanSaatIni > 0 && (
          <span className="text-xs">Bet: {player.taruhanSaatIni}</span>
        )}
      </div>
        <div className="mt-2 flex gap-3 justify-center">
          <CardImg card={showFace ? c1 : { back: true }} w={90} />
          <CardImg card={showFace ? c2 : { back: true }} w={90} />
        </div>
      {showFace && <div className="mt-1 text-xs text-center">{comboName}</div>}
      <div className="mt-2">
        <div className="h-2 rounded bg-gray-700 overflow-hidden">
          <motion.div
            animate={{ width: `${(timeLeft / MAX_TIME) * 100}%` }}
            transition={{ ease: "easeInOut", duration: 1 }}
            className="h-full bg-green-400"
          />
        </div>
        <div className="mt-1 text-xs text-center">{timeLeft}s</div>
      </div>
    </div>
  );
}
