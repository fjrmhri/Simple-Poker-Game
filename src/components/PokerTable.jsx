import React from "react";
import { motion } from "framer-motion";
import CardImg from "./CardImg";
import PlayerSeat from "./PlayerSeat";

export default function PokerTable({ state, pot, winners, accentColor = "#facc15" }) {
  const { players = [], currentPlayer, community = [], round, dealerIndex } = state;
  if (!players.length) return null;
  const reveal = round === "Showdown";
  const leftOpponents = players.slice(1, 1 + Math.ceil((players.length - 1) / 2));
  const rightOpponents = players.slice(1 + leftOpponents.length);

  return (
    <div className="relative rounded-[80px] border border-white/10 bg-gradient-to-b from-emerald-900/80 via-emerald-950/70 to-black p-6 shadow-2xl">
      <div className="absolute inset-0 rounded-[80px] border border-emerald-300/10" style={{ boxShadow: `inset 0 0 80px rgba(0,0,0,0.7)` }} />
      <div className="relative space-y-6">
        <div className="flex flex-wrap items-center justify-between text-sm text-white/70">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Round</p>
            <p className="text-2xl font-black text-white">{round}</p>
          </div>
          <motion.div
            key={pot}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-right"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Pot</p>
            <p className="text-3xl font-black text-yellow-300">{pot}</p>
          </motion.div>
        </div>

        <div className="flex items-center justify-center gap-3">
          {[0, 1, 2, 3, 4].map((index) => (
            <motion.div
              key={`${community[index]?.rank ?? "card"}-${index}`}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.08 }}
            >
              <CardImg card={community[index]} w={80} />
            </motion.div>
          ))}
        </div>

        <div className="relative min-h-[320px]">
          <div className="absolute inset-x-0 bottom-0 flex justify-center">
            <PlayerSeat
              player={players[0]}
              community={community}
              isYou
              isTurn={
                0 === currentPlayer && round !== "Showdown" && !players[0]?.folded
              }
              reveal={reveal}
              round={round}
              accentColor={accentColor}
              isDealer={dealerIndex === 0}
              isWinner={winners.includes(0)}
            />
          </div>

          <div className="absolute left-0 top-0 flex h-full flex-col justify-between">
            {leftOpponents.map((player, index) => {
              const seatIndex = index + 1;
              return (
                <PlayerSeat
                  key={player.name}
                  player={player}
                  community={community}
                  isTurn={
                    seatIndex === currentPlayer && round !== "Showdown" && !player.folded
                  }
                  reveal={reveal}
                  round={round}
                  accentColor={accentColor}
                  isDealer={dealerIndex === seatIndex}
                  isWinner={winners.includes(seatIndex)}
                  position="left"
                />
              );
            })}
          </div>

          <div className="absolute right-0 top-0 flex h-full flex-col justify-between items-end">
            {rightOpponents.map((player, index) => {
              const seatIndex = index + 1 + leftOpponents.length;
              return (
                <PlayerSeat
                  key={player.name}
                  player={player}
                  community={community}
                  isTurn={
                    seatIndex === currentPlayer && round !== "Showdown" && !player.folded
                  }
                  reveal={reveal}
                  round={round}
                  accentColor={accentColor}
                  isDealer={dealerIndex === seatIndex}
                  isWinner={winners.includes(seatIndex)}
                  position="right"
                />
              );
            })}
          </div>
        </div>

        {winners?.length > 0 && (
          <div className="text-center text-sm font-semibold text-emerald-200">
            Winner: {winners.map((i) => players[i].name).join(", ")}
          </div>
        )}
      </div>
    </div>
  );
}
