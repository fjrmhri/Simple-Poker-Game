// src/components/ActionBar.jsx
import React, { useState } from "react";

const ICONS = {
  fold: "/assets/buttons/fold.png",
  call: "/assets/buttons/call.png",
  check: "/assets/buttons/check.png",
  bet: "/assets/buttons/bet.png",
  raise: "/assets/buttons/raise.png",
};

export default function ActionBar({ actions, onAction }) {
  const [amount, setAmount] = useState(10);

  const renderBtn = (label, handler, color, icon) => (
    <button
      onClick={handler}
      className={`flex items-center gap-2 px-5 py-2 rounded-full text-white text-lg font-semibold shadow-md bg-gradient-to-b ${color} transition-all duration-200 hover:scale-105 hover:shadow-xl`}
    >
      <img src={icon} alt="" className="w-5 h-5" />
      {label}
    </button>
  );

  if (!actions || !actions.length) return null;

  const hasBet = actions.find((a) => a.type === "bet");
  const call = actions.find((a) => a.type === "call");
  const check = actions.find((a) => a.type === "check");
  const fold = actions.find((a) => a.type === "fold");

  return (
    <div className="mt-4 flex flex-wrap gap-4 items-center justify-center">
      {fold &&
        renderBtn(
          "Fold",
          () => onAction("fold"),
          "from-red-500 to-red-700",
          ICONS.fold
        )}

      {check &&
        renderBtn(
          "Check",
          () => onAction("check"),
          "from-gray-500 to-gray-700",
          ICONS.check
        )}

      {call && (
        <div className="flex flex-col items-center">
          {renderBtn(
            "Call",
            () => onAction("call"),
            "from-green-500 to-green-700",
            ICONS.call
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
          {renderBtn(
            check ? "Bet" : "Raise",
            () => onAction("bet", amount),
            "from-blue-500 to-blue-700",
            check ? ICONS.bet : ICONS.raise
          )}
        </>
      )}
    </div>
  );
}
