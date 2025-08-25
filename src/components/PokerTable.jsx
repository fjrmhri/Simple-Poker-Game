// src/components/PokerTable.jsx
import React from "react";
import CardImg from "./CardImg";
import PlayerSeat from "./PlayerSeat";

export default function PokerTable({ state, pot, winners }) {
  const { players, currentPlayer, community, round } = state;

  const revealEveryone = round === "Showdown";

  return (
    <div style={{ padding: 16, color: "white" }}>
      <div
        style={{
          background: "#3b0d1d",
          borderRadius: 20,
          padding: 16,
          boxShadow: "inset 0 0 40px rgba(0,0,0,0.4)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            Round: <b>{round}</b>
          </div>
          <div style={{ fontSize: 18 }}>
            Pot: <b>{pot}</b>
          </div>
        </div>

        {/* Community cards */}
        <div
          style={{
            display: "flex",
            gap: 8,
            justifyContent: "center",
            margin: "18px 0",
          }}
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <CardImg key={i} card={community[i]} w={88} />
          ))}
        </div>

        {/* Players grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
            gap: 12,
          }}
        >
          {players.map((p, i) => (
            <PlayerSeat
              key={i}
              player={p}
              isYou={i === 0}
              isTurn={i === currentPlayer && round !== "Showdown" && !p.folded}
              reveal={revealEveryone}
            />
          ))}
        </div>

        {/* Winners */}
        {winners?.length ? (
          <div style={{ marginTop: 12, textAlign: "center", fontWeight: 700 }}>
            Winner: {winners.map((i) => players[i].name).join(", ")}
          </div>
        ) : null}
      </div>
    </div>
  );
}
