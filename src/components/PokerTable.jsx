// src/components/PokerTable.jsx
import React from "react";
import { motion } from "framer-motion";
import CardImg from "./CardImg";
import PlayerSeat from "./PlayerSeat";

export default function PokerTable({ state, pot, winners }) {
  const { players, currentPlayer, community, round } = state;

  const revealEveryone = round === "Showdown";

  return (
    <div className="p-4 text-white">
      <div className="relative mx-auto max-w-4xl border-2 border-white rounded-lg p-8 bg-white/10">
        <div className="flex justify-between">
          <div>
            Round: <b>{round}</b>
          </div>
          <motion.div key={pot} initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-lg">
            Pot: <b>{pot}</b>
          </motion.div>
        </div>

        {/* Community cards */}
        <div className="flex gap-2 justify-center my-4">
          {[0, 1, 2, 3, 4].map((i) => (
            <CardImg key={i} card={community[i]} w={88} />
          ))}
        </div>

        {/* Players grid */}
        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(230px,1fr))" }}
        >
          {players.map((p, i) => (
            <PlayerSeat
              key={i}
              player={p}
              community={community}
              isYou={i === 0}
              isTurn={i === currentPlayer && round !== "Showdown" && !p.folded}
              reveal={revealEveryone}
            />
          ))}
        </div>

        {/* Winners */}
        {winners?.length ? (
          <div className="mt-3 text-center font-bold">
            Winner: {winners.map((i) => players[i].name).join(", ")}
          </div>
        ) : null}
      </div>
    </div>
  );
}
