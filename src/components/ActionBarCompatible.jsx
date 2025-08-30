// src/components/ActionBarCompatible.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";

export default function ActionBarCompatible({ actions = [], onAction }) {
  const [amount, setAmount] = useState("10");

  const renderButton = (label, handler, color, disabled) => (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      onClick={handler}
      disabled={disabled}
      className={`
        px-6 py-3 font-bold text-white border-2 shadow-lg transition-all duration-200
        ${
          disabled
            ? "opacity-50 cursor-not-allowed bg-gray-600 border-gray-700"
            : `${color} hover:brightness-110 active:scale-95`
        }
      `}
    >
      {label}
    </motion.button>
  );

  const hasBet = actions.find((a) => a.type === "bet");
  const call = actions.find((a) => a.type === "call");
  const check = actions.find((a) => a.type === "check");
  const fold = actions.find((a) => a.type === "fold");

  const min = hasBet?.min ?? 1;
  const max = hasBet?.max ?? 9999;
  const numericAmount = parseInt(amount, 10);
  const isValidAmount = !isNaN(numericAmount) && numericAmount >= min;

  const callOrCheck = call
    ? { label: `Call ${call.amount}`, disabled: false }
    : check
    ? { label: "Check", disabled: false }
    : { label: "Call/Check", disabled: true };

  return (
    <div className="min-h-screen">
      <div className=" mt-4 flex flex-wrap items-center justify-center gap-4">
        {/* Fold Button */}
        {renderButton(
          "Fold",
          () => onAction("fold"),
          "bg-red-600 border-red-700",
          !fold
        )}

        {/* Call/Check Button */}
        {renderButton(
          callOrCheck.label,
          () => onAction(call ? "call" : "check"),
          "bg-green-600 border-green-700",
          callOrCheck.disabled
        )}

        {/* Input and Bet/Raise Button */}
        {hasBet && (
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="number"
                value={amount}
                min={min}
                max={max}
                onChange={(e) => setAmount(e.target.value)}
                disabled={!hasBet}
                className={`
                  w-20 px-3 py-2 bg-gray-700 border text-white rounded-md
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                  disabled:bg-gray-600 disabled:text-gray-400
                  ${!hasBet ? "cursor-not-allowed" : "border-gray-500"}
                `}
              />
            </div>

            {renderButton(
              check ? "Bet" : "Raise",
              () => {
                const clamped = Math.min(Math.max(numericAmount, min), max);
                onAction("bet", clamped);
              },
              "bg-blue-600 border-blue-700",
              !hasBet || !isValidAmount
            )}
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="mt-4 text-center text-xs text-gray-400">
        <p>
          💡 Tips: Perhatikan pola taruhan lawan dan kelola chip dengan bijak
        </p>
      </div>
    </div>
  );
}
