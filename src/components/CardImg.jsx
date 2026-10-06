// src/components/CardImg.jsx
import React from "react";
import { motion } from "framer-motion";

function imgSrc(card) {
  if (!card) return "/assets/cards/back_red.png";
  if (card.back) return "/assets/cards/back_red.png";
  // card like {rank:"A", suit:"S"} => "AS.png"
  return `/assets/cards/${card.rank}${card.suit}.png`;
}

export default function CardImg({ card, w = 72 }) {
  return (
    <motion.img
      initial={{ rotateY: 90, opacity: 0 }}
      animate={{ rotateY: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      src={imgSrc(card)}
      alt={card?.back ? "Back" : `${card?.rank ?? "?"}${card?.suit ?? ""}`}
      style={{
        width: w,
        height: "auto",
        borderRadius: "clamp(8px, 22%, 18px)",
        border: "2px solid rgba(255,255,255,0.6)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
        background:
          "radial-gradient(circle, rgba(255,255,255,0.2), transparent)",
        imageRendering: "pixelated",
      }}
    />
  );
}

// Slot kosong untuk kartu komunitas yang belum dibuka
export function CardSlot({ w = 72 }) {
  return (
    <div
      aria-hidden="true"
      className="border-2 border-dashed border-white/15 bg-white/[0.03]"
      style={{
        width: w,
        aspectRatio: "35 / 47",
        borderRadius: "clamp(8px, 22%, 18px)",
      }}
    />
  );
}
