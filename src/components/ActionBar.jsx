// src/components/ActionBar.jsx
import React, { useState } from "react";

export default function ActionBar({ actions, onAction }) {
  const [amount, setAmount] = useState(10);

  const renderImgBtn = (src, alt, handler) => (
    <button
      onClick={handler}
      className="transition-transform hover:scale-105 focus:outline-none"
    >
      <img src={src} alt={alt} className="h-12 w-auto" />
    </button>
  );

  if (!actions || !actions.length) return null;

  const hasBet = actions.find((a) => a.type === "bet");
  const call = actions.find((a) => a.type === "call");
  const check = actions.find((a) => a.type === "check");
  const fold = actions.find((a) => a.type === "fold");

  return (
    <div className="mt-4 flex gap-3 items-center">
      {fold &&
        renderImgBtn("/assets/buttons/fold.png", "Fold", () => onAction("fold"))}

      {check &&
        renderImgBtn(
          "/assets/buttons/check.png",
          "Check",
          () => onAction("check")
        )}

      {call && (
        <div className="flex flex-col items-center">
          {renderImgBtn(
            "/assets/buttons/call.png",
            "Call",
            () => onAction("call")
          )}
          <span className="text-xs mt-1">Call {call.amount}</span>
        </div>
      )}

      {hasBet && (
        <>
          <input
            type="number"
            value={amount}
            min={hasBet.min ?? 1}
            max={hasBet.max ?? 9999}
            onChange={(e) => setAmount(parseInt(e.target.value || "0", 10))}
            className="w-24 p-1 rounded text-black"
          />
          {renderImgBtn(
            check ? "/assets/buttons/bet.png" : "/assets/buttons/raise.png",
            check ? "Bet" : "Raise",
            () => onAction("bet", amount)
          )}
        </>
      )}
    </div>
  );
}
