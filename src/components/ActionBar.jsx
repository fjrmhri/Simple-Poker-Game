// src/components/ActionBar.jsx
import React, { useState } from "react";

export default function ActionBar({ actions, onAction }) {
  const [amount, setAmount] = useState(10);
  const baseBtn =
    "px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 border border-white backdrop-blur-sm transition";

  if (!actions || !actions.length) return null;

  const hasBet = actions.find((a) => a.type === "bet");
  const call = actions.find((a) => a.type === "call");
  const check = actions.find((a) => a.type === "check");
  const fold = actions.find((a) => a.type === "fold");

  return (
    <div className="mt-4 flex gap-2 items-center">
      {fold && (
        <button onClick={() => onAction("fold")} className={baseBtn}>
          Fold
        </button>
      )}
      {check && (
        <button onClick={() => onAction("check")} className={baseBtn}>
          Check
        </button>
      )}
      {call && (
        <button onClick={() => onAction("call")} className={baseBtn}>
          Call {call.amount}
        </button>
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
          <button onClick={() => onAction("bet", amount)} className={baseBtn}>
            {check ? "Bet" : "Raise"}
          </button>
        </>
      )}
    </div>
  );
}
