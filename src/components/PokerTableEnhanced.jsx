// src/components/PokerTableEnhanced.jsx
import React from "react";
import { motion } from "framer-motion";
import CardImg from "./CardImg";
import PlayerSeat from "./PlayerSeatEnhanced";

export default function PokerTableEnhanced({ state, pot, winners }) {
  const { pemain, pemainSaatIni, komunitas, ronde } = state;

  const tampilkanSemua = ronde === "Showdown";

  return (
    <div className="p-4">
      <div className="relative mx-auto max-w-6xl p-6 rounded-[60px] border-4 border-yellow-600 shadow-[0_0_0_6px_#000,0_0_0_12px_#fff,0_0_30px_rgba(255,215,0,0.3)] bg-gradient-to-br from-green-800 via-green-700 to-green-900 text-white font-mono">
        {/* Header info */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="text-[#e5e7eb]">
              <div className="flex items-center gap-2">
                <span className="text-sm opacity-80">Ronde:</span>
                <span className="text-xl font-bold text-yellow-400">
                  {ronde}
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
        <div className="flex justify-center gap-4 my-8 min-h-[120px]">
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              initial={{
                scale: 0,
                rotateY: 180,
                y: 50,
              }}
              animate={{
                scale: komunitas[i] ? 1 : 0.8,
                rotateY: komunitas[i] ? 0 : 180,
                y: komunitas[i] ? 0 : 20,
              }}
              transition={{
                delay: i * 0.15,
                duration: 0.5,
                type: "spring",
                stiffness: 150,
              }}
              className="relative"
            >
              <CardImg
                card={komunitas[i]}
                w={100}
                className={`transition-all duration-300 ${
                  komunitas[i]
                    ? "drop-shadow-2xl hover:drop-shadow-3xl hover:scale-110 hover:rotate-1 transform-gpu"
                    : "opacity-50"
                }`}
              />
              {!komunitas[i] && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-28 bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg opacity-50"></div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Players layout */}
        <div className="relative mt-8 min-h-[400px]">
          {/* Baris kursi di bawah */}
          <div className="absolute inset-x-0 bottom-0 px-4">
            <div className="mx-auto w-full max-w-5xl grid grid-cols-[1fr_auto_1fr] items-end gap-x-6 sm:gap-x-10 lg:gap-x-16">
              {/* Bot kiri (di kiri player) */}
              <div className="justify-self-end">
                {pemain.length > 1 && (
                  <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <PlayerSeat
                      pemain={pemain[1]}
                      komunitas={komunitas}
                      adalahGiliran={
                        1 === pemainSaatIni &&
                        ronde !== "Showdown" &&
                        !pemain[1].fold
                      }
                      ronde={ronde}
                      tampilkan={tampilkanSemua}
                    />
                  </motion.div>
                )}
              </div>

              {/* Player (kamu) tepat di tengah bawah */}
              <div className="justify-self-center">
                <motion.div
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="mb-2" // sedikit naik biar ada ruang dari tepi bawah
                >
                  <PlayerSeat
                    pemain={pemain[0]}
                    komunitas={komunitas}
                    adalahAnda
                    adalahGiliran={
                      0 === pemainSaatIni &&
                      ronde !== "Showdown" &&
                      !pemain[0].fold
                    }
                    ronde={ronde}
                    tampilkan={tampilkanSemua}
                  />
                </motion.div>
              </div>

              {/* Bot kanan (di kanan player) */}
              <div className="justify-self-start">
                {pemain.length > 2 && (
                  <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.25 }}
                  >
                    <PlayerSeat
                      pemain={pemain[2]}
                      komunitas={komunitas}
                      adalahGiliran={
                        2 === pemainSaatIni &&
                        ronde !== "Showdown" &&
                        !pemain[2].fold
                      }
                      ronde={ronde}
                      tampilkan={tampilkanSemua}
                    />
                  </motion.div>
                )}
              </div>
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
                Pemenang: {winners.map((i) => pemain[i].nama).join(", ")}
              </span>
            </div>
          </motion.div>
        ) : null}

        {/* Dealer button indicator */}
        <motion.div
          animate={{
            x:
              state.indexDealer === 0
                ? "50%"
                : state.indexDealer === 1
                ? "0%"
                : state.indexDealer === 2
                ? "100%"
                : "50%",
            y:
              state.indexDealer === 0
                ? "85%"
                : state.indexDealer === 1
                ? "45%"
                : state.indexDealer === 2
                ? "45%"
                : "50%",
          }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full border-4 border-white shadow-xl flex items-center justify-center text-black font-bold text-sm z-20"
          whileHover={{ scale: 1.1 }}
        >
          <div className="flex flex-col items-center">
            <span className="text-sm font-bold">D</span>
            <span className="text-[9px]">{state.indexDealer + 1}</span>
          </div>
          {/* Glow effect */}
          <motion.div
            className="absolute inset-0 rounded-full bg-yellow-400 opacity-30 blur-sm"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}
