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
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      src={imgSrc(card)}
      alt={card?.back ? "Back" : `${card?.rank ?? "?"}${card?.suit ?? ""}`}
      style={{ width: w, height: "auto", borderRadius: 8 }}
    />
  );
}
