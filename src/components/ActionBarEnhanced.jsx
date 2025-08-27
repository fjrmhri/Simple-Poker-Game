// src/components/ActionBarEnhanced.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";

export default function ActionBarEnhanced({ actions = [], onAction }) {
  const [jumlah, setJumlah] = useState("10");

  const renderTombol = (label, handler, warna, disabled) => (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      onClick={handler}
      disabled={disabled}
      className={`
        px-6 py-3 font-bold text-white border-2 shadow-lg transition-all duration-200
        ${disabled 
          ? "opacity-50 cursor-not-allowed bg-gray-600 border-gray-700" 
          : `${warna} hover:brightness-110 active:scale-95`
        }
      `}
    >
      {label}
    </motion.button>
  );

  const adaBet = actions.find((a) => a.type === "bet");
  const adaRaise = actions.find((a) => a.type === "raise");
  const call = actions.find((a) => a.type === "call");
  const check = actions.find((a) => a.type === "check");
  const fold = actions.find((a) => a.type === "fold");

  const min = (adaBet || adaRaise)?.min ?? 1;
  const max = (adaBet || adaRaise)?.max ?? 9999;
  const jumlahNumerik = parseInt(jumlah, 10);
  const jumlahValid = !isNaN(jumlahNumerik) && jumlahNumerik >= min;

  const callAtauCheck = call
    ? { label: `Call ${call.jumlah}`, disabled: false }
    : check
    ? { label: "Check", disabled: false }
    : { label: "Call/Check", disabled: true };

  return (
    <div className="mt-6 p-4 bg-[rgba(0,0,0,0.4)] rounded-xl border border-gray-600 shadow-lg">
      <div className="flex flex-wrap items-center justify-center gap-4">
        {/* Tombol Fold */}
        {renderTombol(
          "Fold",
          () => onAction("fold"),
          "bg-red-600 border-red-700",
          !fold
        )}

        {/* Tombol Call/Check */}
        {renderTombol(
          callAtauCheck.label,
          () => onAction(call ? "call" : "check"),
          "bg-green-600 border-green-700",
          callAtauCheck.disabled
        )}

        {/* Input dan Tombol Bet/Raise */}
        {(adaBet || adaRaise) && (
          <div className="flex items-center gap-3 bg-gray-800 p-2 rounded-lg border border-gray-600">
            <div className="relative">
              <input
                type="number"
                value={jumlah}
                min={min}
                max={max}
                onChange={(e) => setJumlah(e.target.value)}
                disabled={!adaBet && !adaRaise}
                className={`
                  w-20 px-3 py-2 bg-gray-700 border text-white rounded-md
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                  disabled:bg-gray-600 disabled:text-gray-400
                  ${!adaBet && !adaRaise ? "cursor-not-allowed" : "border-gray-500"}
                `}
              />
              <div className="absolute -bottom-6 left-0 right-0 text-xs text-gray-400 text-center">
                Min: {min}
              </div>
            </div>
            
            {renderTombol(
              adaRaise ? "Raise" : "Bet",
              () => {
                const terklampir = Math.min(Math.max(jumlahNumerik, min), max);
                onAction(adaRaise ? "raise" : "bet", terklampir);
              },
              "bg-blue-600 border-blue-700",
              !adaBet && !adaRaise || !jumlahValid
            )}
          </div>
        )}
      </div>
      
      {!jumlahValid && (adaBet || adaRaise) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 text-center"
        >
          <p className="text-red-400 text-sm font-medium">
            Masukkan jumlah yang valid (minimal {min})
          </p>
        </motion.div>
      )}
      
      {/* Tips */}
      <div className="mt-4 text-center text-xs text-gray-400">
        <p>💡 Tips: Perhatikan pola taruhan lawan dan kelola chip dengan bijak</p>
      </div>
    </div>
  );
}