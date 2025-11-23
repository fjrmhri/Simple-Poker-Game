import React, { useEffect, useMemo, useState } from "react";

export default function ActionBar({ actions = [], onAction, hints }) {
  const betAction = actions.find((a) => a.type === "bet");
  const callAction = actions.find((a) => a.type === "call");
  const checkAction = actions.find((a) => a.type === "check");
  const foldAction = actions.find((a) => a.type === "fold");

  const [amount, setAmount] = useState(betAction?.min ?? 10);

  useEffect(() => {
    if (betAction) {
      setAmount((prev) => Math.min(Math.max(prev, betAction.min), betAction.max));
    }
  }, [betAction]);

  const sliderRange = useMemo(() => {
    if (!betAction) return { min: 0, max: 0 };
    return { min: betAction.min, max: Math.max(betAction.min, betAction.max) };
  }, [betAction]);

  const disabled = actions.length === 0;
  const formattedAmount = Number.isFinite(amount) ? amount : betAction?.min ?? 0;

  const quickAmounts = useMemo(() => {
    if (!betAction) return [];
    const mid = Math.round((betAction.min + betAction.max) / 2);
    return [betAction.min, mid, betAction.max].filter((value, index, arr) => value && arr.indexOf(value) === index);
  }, [betAction]);

  const renderPrimaryLabel = () => {
    if (callAction) return `Call ${callAction.amount}`;
    if (checkAction) return "Check";
    return "Waiting";
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-black/40 p-4 shadow-2xl backdrop-blur">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-widest text-white/60">Action console</p>
          <h3 className="text-xl font-semibold leading-tight">{hints?.recommendation || "Your move"}</h3>
          <p className="text-xs text-white/60">{hints?.tip}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => foldAction && onAction("fold")}
            disabled={!foldAction}
            className={`rounded-full px-4 py-2 text-sm font-semibold shadow ${
              foldAction ? "bg-red-500/80 hover:bg-red-500" : "bg-white/10 text-white/50"
            }`}
          >
            Fold
          </button>
          <button
            onClick={() => onAction(callAction ? "call" : "check")}
            disabled={!callAction && !checkAction}
            className={`rounded-full px-4 py-2 text-sm font-semibold shadow ${
              callAction || checkAction ? "bg-emerald-500/80 hover:bg-emerald-500" : "bg-white/10 text-white/50"
            }`}
          >
            {renderPrimaryLabel()}
          </button>
        </div>
      </div>

      {betAction ? (
        <div className="mt-4 space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              type="range"
              min={sliderRange.min}
              max={sliderRange.max}
              value={formattedAmount}
              onChange={(event) => setAmount(Number(event.target.value))}
              className="h-2 flex-1 cursor-pointer rounded-full bg-black/40 accent-yellow-300"
            />
            <input
              type="number"
              min={sliderRange.min}
              max={sliderRange.max}
              value={formattedAmount}
              onChange={(event) => setAmount(Number(event.target.value))}
              className="w-20 rounded-2xl border border-white/10 bg-black/40 px-2 py-1 text-right text-sm"
            />
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-white/60">
            {quickAmounts.map((value) => (
              <button
                key={value}
                onClick={() => setAmount(value)}
                className="rounded-full border border-white/10 px-3 py-1 hover:bg-white/10"
              >
                {value}
              </button>
            ))}
          </div>
          <button
            onClick={() => onAction("bet", formattedAmount)}
            disabled={!betAction || disabled}
            className={`w-full rounded-2xl px-4 py-2 text-sm font-semibold shadow ${
              betAction ? "bg-yellow-400 text-black hover:bg-yellow-300" : "bg-white/10 text-white/50"
            }`}
          >
            {checkAction ? "Bet" : "Raise"}
          </button>
        </div>
      ) : (
        <p className="mt-3 text-sm text-white/60">Waiting for opponent actions…</p>
      )}
    </div>
  );
}
