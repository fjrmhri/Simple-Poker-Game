// src/components/ActionPanel.js

import React, { useState } from "react";
import { Action } from "../core/models";

export default function ActionPanel({
  availableActions,
  handleAction,
  status,
}) {
  const [betAmount, setBetAmount] = useState(0);

  if (status !== "CHOICE") return null;

  return (
    <div className="flex flex-col items-center gap-4 mt-6">
      <div className="flex gap-4">
        {availableActions.map((action, idx) => {
          if (Array.isArray(action)) {
            const [act, range] = action;
            return (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="number"
                  min={range[0]}
                  max={range[1]}
                  value={betAmount}
                  onChange={(e) => setBetAmount(Number(e.target.value))}
                  className="p-1 rounded text-black w-20"
                />
                <button
                  onClick={() => handleAction(act, betAmount, range)}
                  className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Bet/Raise
                </button>
              </div>
            );
          }

          return (
            <button
              key={idx}
              onClick={() => handleAction(action)}
              className={`px-4 py-2 rounded-lg ${
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
