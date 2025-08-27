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
      <div className="relative mx-auto max-w-4xl p-8 rounded-[50px] shadow-2xl bg-gradient-to-b from-green-700 via-green-800 to-green-900">
        <div className="flex justify-between text-sm md:text-base">
          <div>
            Round: <b>{round}</b>
          </div>
          <motion.div
            key={pot}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="text-lg font-semibold bg-black/40 px-3 py-1 rounded shadow-[0_0_10px_rgba(251,191,36,0.5)]"
          >
            Pot: <b>{pot}</b>
          </motion.div>
        </div>

        {/* Community cards */}
        <div className="flex gap-3 justify-center my-6">
          {[0, 1, 2, 3, 4].map((i) => (
            <CardImg key={i} card={community[i]} w={88} />
          ))}
        </div>

        {/* Players grid */}
        <div
          className="grid gap-6"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(230px,1fr))" }}
        >
          {players.map((p, i) => (
            <PlayerSeat
              key={i}
              player={p}
              community={community}
              isYou={i === 0}
              isTurn={i === currentPlayer && round !== "Showdown" && !p.folded}
              round={round}
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
