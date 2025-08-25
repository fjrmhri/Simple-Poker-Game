// src/components/PlayerSeat.jsx
import React from "react";
import CardImg from "./CardImg";

export default function PlayerSeat({
  player,
  isYou = false,
  isTurn = false,
  reveal = false,
}) {
  const showFace = isYou || reveal;
  const [c1, c2] = player.hand || [];
  return (
    <div
      style={{
        padding: 12,
        minWidth: 220,
        borderRadius: 12,
        background: isTurn ? "#2d2a" : "#222a",
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
    </div>
  );
}
