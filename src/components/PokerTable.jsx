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
            transition={{ ease: "easeInOut", duration: 0.3 }}
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

        {/* Players layout */}
        <div className="relative mt-6 h-[260px]">
          {/* Player (you) at bottom center */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
            <PlayerSeat
              player={players[0]}
              community={community}
              isYou
              isTurn={
                0 === currentPlayer && round !== "Showdown" && !players[0].folded
              }
              round={round}
              reveal={revealEveryone}
            />
          </div>

          {/* Bots on the sides */}
          <div className="absolute top-0 left-0 flex flex-col gap-4">
            {players.slice(1, 1 + Math.ceil((players.length - 1) / 2)).map(
              (p, idx) => (
                <PlayerSeat
                  key={idx + 1}
                  player={p}
                  community={community}
                  isTurn={
                    idx + 1 === currentPlayer &&
                    round !== "Showdown" &&
                    !p.folded
                  }
                  round={round}
                  reveal={revealEveryone}
                />
              )
            )}
          </div>

          <div className="absolute top-0 right-0 flex flex-col gap-4 items-end">
            {players
              .slice(1 + Math.ceil((players.length - 1) / 2))
              .map((p, idx) => (
                <PlayerSeat
                  key={idx + 1 + Math.ceil((players.length - 1) / 2)}
                  player={p}
                  community={community}
                  isTurn={
                    idx + 1 + Math.ceil((players.length - 1) / 2) ===
                      currentPlayer &&
                    round !== "Showdown" &&
                    !p.folded
                  }
                  round={round}
                  reveal={revealEveryone}
                />
              ))}
          </div>
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
