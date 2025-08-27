// src/components/ActionBar.jsx
import React, { useState } from "react";

export default function ActionBar({ actions = [], onAction }) {
  const [amount, setAmount] = useState(10);

  const renderBtn = (label, handler, color, disabled) => (
    <button
      onClick={handler}
      disabled={disabled}
      className={`px-5 py-2 border-2 rounded text-lg font-semibold transition-all duration-300 ease-in-out ${
        disabled
          ? "bg-gray-500 border-gray-600 text-gray-300 cursor-not-allowed opacity-60"
          : `${color} text-white hover:brightness-110`
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
    <div className="mt-4 flex flex-wrap gap-4 items-center justify-center">
      {renderBtn(
        "Fold",
        () => onAction("fold"),
        "bg-red-600 border-red-700 text-[#e5e7eb] shadow-[0_0_0_2px_#fff,0_0_0_4px_#000]",
        !fold
      )}

      <div className="flex flex-col items-center">
        {renderBtn(
          `${call ? `Call ${call.amount}` : callOrCheck.label}`,
          () => onAction(call ? "call" : "check"),
          "bg-green-600 border-green-700 text-[#e5e7eb] shadow-[0_0_0_2px_#fff,0_0_0_4px_#000]",
          callOrCheck.disabled
        )}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="number"
          value={amount}
          min={hasBet?.min ?? 1}
          max={hasBet?.max ?? 9999}
          onChange={(e) => setAmount(parseInt(e.target.value || "0", 10))}
          disabled={!hasBet}
          className="w-24 p-1 border border-black rounded text-[#e5e7eb] bg-[rgba(0,0,0,0.3)] disabled:bg-gray-200 disabled:text-gray-500 transition-colors duration-300 ease-in-out shadow-[0_0_0_2px_#fff,0_0_0_4px_#000]"
        />
        {renderBtn(
          check ? "Bet" : "Raise",
          () => onAction("bet", amount),
          "bg-blue-600 border-blue-700 text-[#e5e7eb] shadow-[0_0_0_2px_#fff,0_0_0_4px_#000]",
          !hasBet
        )}
      </div>
    </div>
  );
}
