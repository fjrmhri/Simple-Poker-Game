import React from "react";
import { motion } from "framer-motion";
import CardImg, { CardSlot } from "./CardImg";
import PlayerSeat from "./PlayerSeat";

// Lebar kartu komunitas relatif terhadap lebar meja (cqw) agar 5 kartu selalu muat
const COMMUNITY_CARD_WIDTH = "clamp(36px, 14cqw, 80px)";

export default function PokerTable({
  state,
  pot,
  winners,
  accentColor = "#facc15",
  onHeroTimeout,
}) {
  const {
    players = [],
    currentPlayer,
    community = [],
    round,
    dealerIndex,
  } = state;
  if (!players.length) return null;
  const reveal = round === "Showdown";
  const leftOpponents = players.slice(
    1,
    1 + Math.ceil((players.length - 1) / 2),
  );
  const rightOpponents = players.slice(1 + leftOpponents.length);

  return (
    <div className="@container relative rounded-[36px] border border-white/10 bg-gradient-to-b from-emerald-900/80 via-emerald-950/70 to-black p-3 shadow-2xl md:rounded-[70px] md:p-5">
      <div
        className="absolute inset-0 rounded-[36px] border border-emerald-300/10 md:rounded-[70px]"
        style={{ boxShadow: `inset 0 0 80px rgba(0,0,0,0.7)` }}
      />
      <div className="relative space-y-5">
        <div className="flex flex-wrap items-center justify-between text-sm text-white/70">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">
              Round
            </p>
            <p className="text-2xl font-black text-white">{round}</p>
          </div>
          <motion.div
            key={pot}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-right"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">
              Pot
            </p>
            <p className="text-3xl font-black text-yellow-300">{pot}</p>
          </motion.div>
        </div>

        <div className="flex items-center justify-center gap-2 md:gap-3">
          {[0, 1, 2, 3, 4].map((index) => (
            <motion.div
              key={`${community[index]?.rank ?? "card"}-${index}`}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.08 }}
            >
              {community[index] ? (
                <CardImg card={community[index]} w={COMMUNITY_CARD_WIDTH} />
              ) : (
                <CardSlot w={COMMUNITY_CARD_WIDTH} />
              )}
            </motion.div>
          ))}
        </div>

        {/* Meja sempit: grid 2 kolom (lawan di atas, pemain di bawah); meja ≥600px: posisi absolut */}
        <div className="grid grid-cols-2 gap-3 @[600px]:relative @[600px]:block @[600px]:min-h-[300px]">
          <div className="order-last col-span-2 flex justify-center @[600px]:absolute @[600px]:inset-x-0 @[600px]:bottom-0">
            <PlayerSeat
              player={players[0]}
              community={community}
              isYou
              onTimeout={onHeroTimeout}
              isTurn={
                0 === currentPlayer &&
                round !== "Showdown" &&
                !players[0]?.folded
              }
              reveal={reveal}
              round={round}
              accentColor={accentColor}
              isDealer={dealerIndex === 0}
              isWinner={winners.includes(0)}
            />
          </div>

          <div className="flex flex-col gap-3 @[600px]:absolute @[600px]:left-0 @[600px]:top-0 @[600px]:h-full @[600px]:justify-between">
            {leftOpponents.map((player, index) => {
              const seatIndex = index + 1;
              return (
                <PlayerSeat
                  key={player.name}
                  player={player}
                  community={community}
                  isTurn={
                    seatIndex === currentPlayer &&
                    round !== "Showdown" &&
                    !player.folded
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

          <div className="flex flex-col items-end gap-3 @[600px]:absolute @[600px]:right-0 @[600px]:top-0 @[600px]:h-full @[600px]:justify-between">
            {rightOpponents.map((player, index) => {
              const seatIndex = index + 1 + leftOpponents.length;
              return (
                <PlayerSeat
                  key={player.name}
                  player={player}
                  community={community}
                  isTurn={
                    seatIndex === currentPlayer &&
                    round !== "Showdown" &&
                    !player.folded
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
