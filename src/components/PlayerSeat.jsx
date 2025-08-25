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
}) {
  const showFace = isYou || reveal;
  const [c1, c2] = player.hand || [];
  const MAX_TIME = 30;
  const [timeLeft, setTimeLeft] = useState(MAX_TIME);

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
  return (
    <div
      className={`p-3 min-w-[220px] rounded-xl text-white ${
        isTurn ? "bg-white/10 ring-2 ring-amber-300" : "bg-black/40"
      }`}
    >
      <div className="font-bold">
        {player.name} {player.folded ? "(Fold)" : ""}
      </div>
      <div className="text-xs opacity-80">
        Chips: {player.chips} &nbsp; • &nbsp; Bet: {player.bet}
      </div>
      <div className="mt-2 flex gap-2">
        <CardImg card={showFace ? c1 : { back: true }} />
        <CardImg card={showFace ? c2 : { back: true }} />
      </div>
      {showFace && (
        <div className="mt-1 text-xs text-center">{comboName}</div>
      )}
      <div className="mt-3">
        <div className="h-2 bg-white/30 rounded overflow-hidden">
          <motion.div
            animate={{ width: `${(timeLeft / MAX_TIME) * 100}%` }}
            transition={{ ease: "linear", duration: 1 }}
            className="h-full bg-amber-300"
          />
        </div>
        <div className="mt-1 text-xs text-center">{timeLeft}s</div>
      </div>
    </div>
  );
}
