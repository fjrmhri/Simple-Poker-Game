// src/components/ActionBar.jsx
import React, { useState } from "react";

export default function ActionBar({ actions = [], onAction }) {
  const [amount, setAmount] = useState(10);

  const renderBtn = (label, handler, color, disabled) => (
    <button
      onClick={handler}
      disabled={disabled}
      className={`px-4 py-2 rounded-xl font-semibold text-white shadow-md transition-colors ${
        disabled
          ? "opacity-50 cursor-not-allowed"
          : `${color} hover:brightness-110`
      }`}
    >
      {label}
    </button>
  );

  const hasBet = actions.find((a) => a.type === "bet");
  const call = actions.find((a) => a.type === "call");
  const check = actions.find((a) => a.type === "check");
  const fold = actions.find((a) => a.type === "fold");

  const callOrCheck = call
    ? { label: "Call", disabled: false }
    : check
    ? { label: "Check", disabled: false }
    : { label: "Call/Check", disabled: true };

  return (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
      {renderBtn("Fold", () => onAction("fold"), "bg-red-600", !fold)}

      {renderBtn(
        `${call ? `Call ${call.amount}` : callOrCheck.label}`,
        () => onAction(call ? "call" : "check"),
        "bg-green-600",
        callOrCheck.disabled
      )}

      <div className="flex items-center gap-2">
        <input
          type="number"
          value={amount}
          min={hasBet?.min ?? 1}
          max={hasBet?.max ?? 9999}
          onChange={(e) => setAmount(parseInt(e.target.value || "0", 10))}
          disabled={!hasBet}
          className="w-24 p-1 rounded border border-gray-500 bg-gray-800 text-white transition-colors disabled:bg-gray-700 disabled:text-gray-400"
        />
        {renderBtn(
          check ? "Bet" : "Raise",
          () => onAction("bet", amount),
          "bg-blue-600",
          !hasBet
        )}
      </div>
    </div>
  );
}
