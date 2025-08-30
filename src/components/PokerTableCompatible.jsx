// src/components/PokerTableCompatible.jsx
import React from "react";
import { motion } from "framer-motion";
import CardImg from "./CardImg";
import PlayerSeat from "./PlayerSeat";

export default function PokerTableCompatible({ state, pot, winners }) {
  const { players, currentPlayer, community, round } = state;

  const revealEveryone = round === "Showdown";
  const dealerButtonPositions = [
    { top: "85%", left: "50%" },
    { top: "50%", left: "12%" },
    { top: "50%", left: "88%" },
  ];

  return (
    <div className="p-4">
      <div className="relative mx-auto max-w-4xl p-4 rounded-[60px] border-4 border-yellow-600 shadow-[0_0_0_6px_#000,0_0_0_12px_#fff,0_0_30px_rgba(255,215,0,0.3)] bg-gradient-to-br from-green-800 via-green-700 to-green-900 text-white font-mono">
        {/* Header info */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="text-[#e5e7eb]">
              <div className="flex items-center gap-2">
                <span className="text-sm opacity-80">Ronde:</span>
                <span className="text-xl font-bold text-yellow-400">
                  {round}
                </span>
              </div>
            </div>
          </div>

          <motion.div
            key={pot}
            initial={{ scale: 0.8, rotateY: 180 }}
            animate={{ scale: 1, rotateY: 0 }}
            transition={{
              ease: "easeInOut",
              duration: 0.5,
              rotateY: { duration: 0.6 },
            }}
            className="text-center"
          >
            <div className="text-sm opacity-80">Pot</div>
            <div className="text-3xl font-bold text-yellow-400 drop-shadow-lg">
              {pot}
            </div>
          </motion.div>
        </div>

        {/* Community cards dengan animasi */}
        <div className="flex justify-center gap-3 my-4 min-h-[120px]">
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              initial={{
                scale: 0,
                rotateY: 180,
                y: 50,
              }}
              animate={{
                scale: community[i] ? 1 : 0.8,
                rotateY: community[i] ? 0 : 180,
                y: community[i] ? 0 : 20,
              }}
              transition={{
                delay: i * 0.1,
                duration: 0.4,
                type: "spring",
                stiffness: 200,
              }}
              className="relative"
            >
              <CardImg
                card={community[i]}
                w={100}
                className={`transition-all duration-300 ${
                  community[i]
                    ? "drop-shadow-lg hover:drop-shadow-xl hover:scale-105"
                    : "opacity-50"
                }`}
              />
              {!community[i] && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-28 bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg opacity-50"></div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Players layout */}
        <div className="relative mt-2 min-h-[220px]">
          {/* Player (kamu) at bottom center */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="absolute bottom-0 left-1/2 -translate-x-1/2"
          >
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
          </motion.div>

          {/* Bots layout */}
          <div className="absolute top-1/2 -translate-y-1/2 flex justify-between w-full px-4">
            {/* Left-side Bots */}
            <div className="flex flex-col gap-4 items-start w-1/3">
              {players
                .slice(1, 1 + Math.ceil((players.length - 1) / 2))
                .map((p, idx) => (
                  <motion.div
                    key={idx + 1}
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 + idx * 0.1 }}
                  >
                    <PlayerSeat
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
                  </motion.div>
                ))}
            </div>

            {/* Right-side Bots */}
            <div className="flex flex-col gap-4 items-end w-1/3">
              {players
                .slice(1 + Math.ceil((players.length - 1) / 2))
                .map((p, idx) => (
                  <motion.div
                    key={idx + 1 + Math.ceil((players.length - 1) / 2)}
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4 + idx * 0.1 }}
                  >
                    <PlayerSeat
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
                  </motion.div>
                ))}
            </div>
          </div>
        </div>

        {/* Winners announcement */}
        {winners?.length ? (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20,
            }}
            className="mt-6 text-center"
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-yellow-600 to-yellow-700 rounded-full border-2 border-yellow-400 shadow-lg">
              <span className="text-2xl">🏆</span>
              <span className="text-xl font-bold text-white">
                Pemenang: {winners.map((i) => players[i].name).join(", ")}
              </span>
            </div>
          </motion.div>
        ) : null}

        {/* Dealer button indicator */}
        <motion.div
          animate={
            dealerButtonPositions[state.dealerIndex] || dealerButtonPositions[0]
          }
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="absolute w-10 h-10 bg-yellow-400 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-black font-bold text-xs -translate-x-1/2 -translate-y-1/2 z-10"
        >
          D
        </motion.div>
      </div>
    </div>
  );
}
