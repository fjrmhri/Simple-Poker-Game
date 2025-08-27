// src/components/ActionPanel.js

import React, { useState } from "react";
import { Action } from "../core/models";

export default function ActionPanel({
  availableActions,
  handleAction,
  status,
}) {
  // store raw input to validate
  const [betAmount, setBetAmount] = useState("");

  if (status !== "CHOICE") return null;

  return (
    <div className="flex flex-col items-center gap-4 mt-6">
      <div className="flex gap-4">
        {availableActions.map((action, idx) => {
          if (Array.isArray(action)) {
            const [act, range] = action;
            const min = range[0];
            const max = range[1];
            const numericBet = parseInt(betAmount, 10);
            const isValid = !isNaN(numericBet) && numericBet >= min;
            return (
              <div key={idx} className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={min}
                    max={max}
                    value={betAmount}
                    onChange={(e) => setBetAmount(e.target.value)}
                    className="p-1 rounded text-black w-20"
                  />
                  <button
                    onClick={() => {
                      const clamped = Math.min(Math.max(numericBet, min), max);
                      handleAction(act, clamped, range);
                    }}
                    disabled={!isValid}
                    className={`px-4 py-2 rounded-lg shadow transition transform hover:scale-105 ${
                      isValid
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-blue-400 cursor-not-allowed opacity-50"
                    }`}
                  >
                    Bet/Raise
                  </button>
                </div>
                {!isValid && (
                  <p className="text-red-500 text-sm">Enter a valid amount ≥ {min}</p>
                )}
              </div>
            );
          }

          return (
            <button
              key={idx}
              onClick={() => handleAction(action)}
              className={`px-4 py-2 rounded-lg shadow transition transform hover:scale-105 ${
                action === Action.Fold
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {action}
            </button>
          );
        })}
      </div>
    </div>
  );
}
