// src/components/CardImg.jsx
import React from "react";

function imgSrc(card) {
  if (!card) return "/assets/cards/back_red.png";
  if (card.back) return "/assets/cards/back_red.png";
  // card like {rank:"A", suit:"S"} => "AS.png"
  return `/assets/cards/${card.rank}${card.suit}.png`;
}

export default function CardImg({ card, w = 72 }) {
  return (
    <img
      src={imgSrc(card)}
      alt={card?.back ? "Back" : `${card?.rank ?? "?"}${card?.suit ?? ""}`}
      style={{ width: w, height: "auto", borderRadius: 8 }}
    />
  );
}
