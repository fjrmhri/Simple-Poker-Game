// src/components/ActionBar.jsx
import React, { useState } from "react";

export default function ActionBar({ actions, onAction }) {
  const [amount, setAmount] = useState(10);

  const renderBtn = (label, handler, color) => (
    <button
      onClick={handler}
      className={`px-4 py-2 rounded text-white font-semibold shadow-md transition-transform hover:scale-105 ${color}`}
    >
      {label}
    </button>
  );

  if (!actions || !actions.length) return null;

  const hasBet = actions.find((a) => a.type === "bet");
  const call = actions.find((a) => a.type === "call");
  const check = actions.find((a) => a.type === "check");
  const fold = actions.find((a) => a.type === "fold");

  return (
    <div className="mt-4 flex flex-wrap gap-3 items-center justify-center">
      {fold && renderBtn("Fold", () => onAction("fold"), "bg-red-600 hover:bg-red-700")}

      {check && renderBtn("Check", () => onAction("check"), "bg-gray-600 hover:bg-gray-700")}

      {call && (
        <div className="flex flex-col items-center">
          {renderBtn("Call", () => onAction("call"), "bg-green-600 hover:bg-green-700")}
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
          {renderBtn(
            check ? "Bet" : "Raise",
            () => onAction("bet", amount),
            "bg-blue-600 hover:bg-blue-700"
          )}
        </>
      )}
    </div>
  );
}
