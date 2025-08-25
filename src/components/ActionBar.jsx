// src/components/ActionBar.jsx
import React, { useState } from "react";

export default function ActionBar({ actions, onAction }) {
  const [amount, setAmount] = useState(10);

  if (!actions || !actions.length) return null;

  const hasBet = actions.find((a) => a.type === "bet");
  const call = actions.find((a) => a.type === "call");
  const check = actions.find((a) => a.type === "check");
  const fold = actions.find((a) => a.type === "fold");

  return (
    <div
      style={{ marginTop: 16, display: "flex", gap: 8, alignItems: "center" }}
    >
      {fold && (
        <button onClick={() => onAction("fold")} className="btn">
          Fold
        </button>
      )}
      {check && (
        <button onClick={() => onAction("check")} className="btn">
          Check
        </button>
      )}
      {call && (
        <button onClick={() => onAction("call")} className="btn">
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
            style={{ width: 90, padding: 6 }}
          />
          <button onClick={() => onAction("bet", amount)} className="btn">
            {check ? "Bet" : "Raise"}
          </button>
        </>
      )}
      <style>{`
        .btn {
          padding: 8px 12px;
          border-radius: 8px;
          border: none;
          background: #8f1d2c;
          color: white;
          cursor: pointer;
        }
        .btn:hover { filter: brightness(1.1); }
      `}</style>
    </div>
  );
}
