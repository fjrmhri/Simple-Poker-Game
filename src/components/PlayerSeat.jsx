// src/components/PlayerSeat.jsx
import React, { useEffect, useState } from "react";
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
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    if (!isTurn) {
      setTimeLeft(30);
      return;
    }
    setTimeLeft(30);
    const id = setInterval(() => {
      setTimeLeft((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [isTurn]);

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
        <div style={{ marginTop: 4, fontSize: 12 }}>{comboName}</div>
      )}
      <div style={{ marginTop: 4, fontSize: 12 }}>Time left: {timeLeft}s</div>
    </div>
  );
}
