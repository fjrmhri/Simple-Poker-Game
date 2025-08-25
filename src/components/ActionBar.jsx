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
    <div className="mt-4 flex gap-2 items-center">
      {fold && (
        <button
          onClick={() => onAction("fold")}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg shadow transition transform hover:scale-105"
        >
          Fold
        </button>
      )}
      {check && (
        <button
          onClick={() => onAction("check")}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg shadow transition transform hover:scale-105"
        >
          Check
        </button>
      )}
      {call && (
        <button
          onClick={() => onAction("call")}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg shadow transition transform hover:scale-105"
        >
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
          <button
            onClick={() => onAction("bet", amount)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg shadow transition transform hover:scale-105"
          >
            {check ? "Bet" : "Raise"}
          </button>
        </>
      )}
    </div>
  );
}
