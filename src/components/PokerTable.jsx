// src/components/PokerTable.jsx
import React from "react";
import { motion } from "framer-motion";
import CardImg from "./CardImg";
import PlayerSeat from "./PlayerSeat";

export default function PokerTable({ state, pot, winners }) {
  const { players, currentPlayer, community, round } = state;

  const revealEveryone = round === "Showdown";

  return (
    <div className="p-2 text-white">
      <div className="relative mx-auto max-w-5xl p-4 rounded-[50px] border-2 border-white shadow-[0_0_0_2px_#000,0_0_0_4px_#fff] bg-[rgba(0,0,0,0.3)] text-[#111827] font-mono box-border">
        {" "}
        <div className="text-[#e5e7eb]">
          <div>
            Round: <b>{round}</b>
          </div>
          <motion.div
            key={pot}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ ease: "easeInOut", duration: 0.3 }}
            className="text-[#e5e7eb]"
          >
            Pot: <b>{pot}</b>
          </motion.div>
        </div>
          {/* Community cards */}
          <div className="flex gap-4 justify-center my-4">
            {[0, 1, 2, 3, 4].map((i) => (
              <CardImg key={i} card={community[i]} w={100} />
            ))}
          </div>
          {/* Players layout */}
          <div className="relative mt-4 h-[260px]">
          {/* Player (you) at bottom center */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
            <PlayerSeat
              player={players[0]}
              community={community}
              isYou
              isTurn={
                0 === currentPlayer &&
                round !== "Showdown" &&
                !players[0].folded
              }
              round={round}
              reveal={revealEveryone}
            />
          </div>

            {/* Bots on the sides */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 flex flex-col gap-4">
            {players
              .slice(1, 1 + Math.ceil((players.length - 1) / 2))
              .map((p, idx) => (
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
              ))}
          </div>

            <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-4 items-end">
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
