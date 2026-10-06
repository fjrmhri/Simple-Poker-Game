import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import CardImg from "./CardImg";
import { getHandName } from "../core/handEvaluator";

export const TURN_SECONDS = 30;
// Relatif terhadap lebar meja (container terdekat)
const SEAT_CARD_WIDTH = "clamp(36px, 10cqw, 60px)";

// Timer satu giliran. Di-remount (lewat key) setiap giliran/street baru,
// sehingga hitungan mulai ulang tanpa perlu reset di dalam efek.
function TurnTimer({ active, accentColor, onTimeout }) {
  const [timeLeft, setTimeLeft] = useState(TURN_SECONDS);
  const onTimeoutRef = useRef(onTimeout);
  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  useEffect(() => {
    if (!active) return;
    let remaining = TURN_SECONDS;
    const timer = setInterval(() => {
      remaining -= 1;
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(timer);
        onTimeoutRef.current?.();
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [active]);

  return (
    <div
      className={`flex w-full items-center gap-2 text-[11px] text-white/70 ${active ? "" : "invisible"}`}
      aria-hidden={!active}
    >
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full"
          style={{
            width: `${(timeLeft / TURN_SECONDS) * 100}%`,
            background: accentColor,
          }}
        />
      </div>
      <span>{timeLeft}s</span>
    </div>
  );
}

export default function PlayerSeat({
  player,
  community = [],
  isYou = false,
  isTurn = false,
  reveal = false,
  round,
  accentColor = "#facc15",
  isDealer = false,
  isWinner = false,
  position = "center",
  onTimeout,
}) {
  const showFace = isYou || reveal;
  const [uploadedAvatar, setUploadedAvatar] = useState(null);
  const avatar =
    uploadedAvatar || player?.avatar || "/assets/others/dealer.png";

  // Lepas object URL lama agar tidak bocor memori
  useEffect(() => {
    if (!uploadedAvatar) return;
    return () => URL.revokeObjectURL(uploadedAvatar);
  }, [uploadedAvatar]);

  if (!player) return null;

  const comboName =
    showFace && player.hand?.length === 2
      ? getHandName(player.hand || [], community || [])
      : "";

  const handleAvatarChange = (event) => {
    if (!isYou) return;
    const file = event.target.files?.[0];
    if (file) {
      setUploadedAvatar(URL.createObjectURL(file));
    }
  };

  const allIn = player.chips === 0 && !player.folded && !player.sittingOut;
  const actionLabel = player.folded
    ? "FOLD"
    : allIn
      ? "ALL-IN"
      : player.lastAction?.toUpperCase();

  const seatAlignment =
    position === "left"
      ? "items-start"
      : position === "right"
        ? "items-end"
        : "items-center";

  return (
    <motion.div
      className={`flex w-full max-w-[190px] flex-col items-center gap-2 rounded-3xl border bg-black/50 p-2 text-xs @[600px]:w-[190px] @[600px]:p-3 text-white shadow-xl backdrop-blur ${seatAlignment} ${isTurn ? "" : "border-white/10"}`}
      style={
        isTurn
          ? { borderColor: accentColor, boxShadow: `0 0 24px ${accentColor}55` }
          : undefined
      }
      animate={{
        scale: isTurn ? 1.05 : 1,
        opacity: player.folded && !isYou ? 0.5 : 1,
      }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <label className="relative">
          <img
            src={avatar}
            alt={player.name}
            className={`h-12 w-12 rounded-full border-2 object-cover shadow-inner`}
            style={{ borderColor: accentColor }}
          />
          {isYou && (
            <input
              type="file"
              className="absolute inset-0 cursor-pointer opacity-0"
              onChange={handleAvatarChange}
            />
          )}
          {isDealer && (
            <span className="absolute -right-2 -top-2 rounded-full bg-yellow-400 px-1 text-[10px] font-black text-black">
              D
            </span>
          )}
        </label>
        <div>
          <p className="text-sm font-semibold leading-tight">{player.name}</p>
          <p className="text-[11px] text-white/60">{player.chips} chips</p>
        </div>
        {isWinner && <span className="text-lg">🏆</span>}
        <div className="flex min-h-[26px] flex-wrap items-center justify-center gap-1.5">
          {player.sittingOut ? (
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-white/50">
              OUT
            </span>
          ) : (
            actionLabel && (
              <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] text-white/80">
                {actionLabel}
              </span>
            )
          )}
          {player.bet > 0 && (
            <span
              className="rounded-full bg-yellow-400/90 px-2.5 py-1 text-[11px] font-bold text-black"
              title="Taruhan di street ini"
            >
              {player.bet}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-center gap-2">
        <CardImg
          card={showFace ? player.hand?.[0] : { back: true }}
          w={SEAT_CARD_WIDTH}
        />
        <CardImg
          card={showFace ? player.hand?.[1] : { back: true }}
          w={SEAT_CARD_WIDTH}
        />
      </div>

      {comboName && (
        <p className="text-center text-[11px] text-emerald-200">{comboName}</p>
      )}

      <TurnTimer
        key={`${round}-${isTurn}`}
        active={isTurn}
        accentColor={accentColor}
        onTimeout={onTimeout}
      />
    </motion.div>
  );
}
