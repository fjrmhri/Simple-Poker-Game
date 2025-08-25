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
      style={{
        padding: 12,
        minWidth: 220,
        borderRadius: 12,
        background: isTurn ? "#ffffff22" : "#222a",
        color: "white",
        boxShadow: isTurn ? "0 0 0 2px #ffd54f inset" : "none",
      }}
    >
      <div style={{ fontWeight: 700 }}>
        {player.name} {player.folded ? "(Fold)" : ""}
      </div>
      <div style={{ fontSize: 12, opacity: 0.85 }}>
        Chips: {player.chips} &nbsp; • &nbsp; Bet: {player.bet}
      </div>
      <div style={{ marginTop: 6, display: "flex", gap: 6 }}>
        <CardImg card={showFace ? c1 : { back: true }} />
        <CardImg card={showFace ? c2 : { back: true }} />
      </div>
      {showFace && (
        <div style={{ marginTop: 4, fontSize: 12, textAlign: "center" }}>
          {comboName}
        </div>
      )}
      <div style={{ marginTop: 8 }}>
        <div
          style={{
            height: 8,
            background: "#ffffff44",
            borderRadius: 4,
            overflow: "hidden",
          }}
        >
          <motion.div
            animate={{ width: `${(timeLeft / MAX_TIME) * 100}%` }}
            transition={{ ease: "linear", duration: 1 }}
            style={{ height: "100%", background: "#ffd54f" }}
          />
        </div>
        <div style={{ marginTop: 4, fontSize: 12, textAlign: "center" }}>
          {timeLeft}s
        </div>
      </div>
    </div>
  );
}
