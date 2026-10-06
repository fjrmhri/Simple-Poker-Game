import React, { useMemo, useState } from "react";

export default function ActionBar({
  actions = [],
  onAction,
  hints,
  heroBet = 0,
  waitingFor = null,
}) {
  const betAction = actions.find((a) => a.type === "bet");
  const callAction = actions.find((a) => a.type === "call");
  const checkAction = actions.find((a) => a.type === "check");
  const foldAction = actions.find((a) => a.type === "fold");

  const [amount, setAmount] = useState(betAction?.min ?? 10);
  // Teks mentah selama input angka sedang diketik; null = tampilkan nilai efektif
  const [draft, setDraft] = useState(null);

  const sliderRange = useMemo(() => {
    if (!betAction) return { min: 0, max: 0 };
    return { min: betAction.min, max: Math.max(betAction.min, betAction.max) };
  }, [betAction]);

  // Nilai efektif selalu dibatasi ke rentang aksi saat ini (dihitung saat render)
  const formattedAmount = betAction
    ? Math.min(
        Math.max(Number.isFinite(amount) ? amount : 0, betAction.min),
        betAction.max,
      )
    : 0;

  const quickAmounts = useMemo(() => {
    if (!betAction) return [];
    const mid = Math.round((betAction.min + betAction.max) / 2);
    const options = [
      { label: "Min", value: betAction.min },
      { label: "Mid", value: mid },
      { label: "All-in", value: betAction.max },
    ];
    return options.filter(
      (option, index) =>
        option.value &&
        options.findIndex((o) => o.value === option.value) === index,
    );
  }, [betAction]);

  const callAmount = callAction?.amount ?? 0;
  // Jumlah di input adalah kenaikan di atas call; tampilkan total taruhan street ini
  const totalBet = heroBet + callAmount + formattedAmount;
  const isAllIn = betAction && formattedAmount >= betAction.max;
  const betLabel = isAllIn
    ? `All-in (${totalBet})`
    : checkAction
      ? `Bet ${formattedAmount}`
      : `Raise to ${totalBet}`;

  const primaryLabel = callAction
    ? `Call ${callAction.amount}`
    : checkAction
      ? "Check"
      : "Check / Call";

  const buttonBase =
    "flex-1 rounded-full @[520px]:min-w-[120px] @[520px]:flex-none px-5 py-2 text-sm font-semibold shadow transition disabled:cursor-not-allowed";

  return (
    <div className="@container rounded-3xl border border-white/10 bg-black/40 p-4 shadow-2xl backdrop-blur">
      <div className="flex flex-col gap-3 @[520px]:flex-row @[520px]:items-center @[520px]:justify-between">
        <div className="min-w-0 space-y-1">
          <p className="text-xs uppercase tracking-widest text-white/60">
            Action console
          </p>
          <h3 className="text-xl font-semibold leading-tight">
            {actions.length ? hints?.recommendation || "Your move" : "Waiting"}
          </h3>
          <p className="text-xs text-white/60">
            {actions.length
              ? hints?.tip
              : waitingFor
                ? `${waitingFor} is deciding…`
                : "Waiting for the next hand…"}
          </p>
        </div>
        <div className="flex w-full shrink-0 gap-2 @[520px]:w-auto">
          <button
            type="button"
            onClick={() => onAction("fold")}
            disabled={!foldAction}
            className={`${buttonBase} ${
              foldAction
                ? "bg-red-500/80 hover:bg-red-500"
                : "bg-white/5 text-white/30"
            }`}
          >
            Fold
          </button>
          <button
            type="button"
            onClick={() => onAction(callAction ? "call" : "check")}
            disabled={!callAction && !checkAction}
            className={`${buttonBase} ${
              callAction || checkAction
                ? "bg-emerald-500/80 hover:bg-emerald-500"
                : "bg-white/5 text-white/30"
            }`}
          >
            {primaryLabel}
          </button>
        </div>
      </div>

      {betAction && (
        <div className="mt-4 space-y-3">
          <div className="flex flex-col gap-2 @[420px]:flex-row @[420px]:items-center">
            <input
              type="range"
              aria-label="Jumlah bet atau raise"
              min={sliderRange.min}
              max={sliderRange.max}
              value={formattedAmount}
              onChange={(event) => setAmount(Number(event.target.value))}
              className="h-2 flex-1 cursor-pointer rounded-full bg-black/40 accent-yellow-300"
            />
            <input
              type="number"
              aria-label="Jumlah bet atau raise"
              min={sliderRange.min}
              max={sliderRange.max}
              value={draft ?? formattedAmount}
              onFocus={() => setDraft(String(formattedAmount))}
              onChange={(event) => {
                setDraft(event.target.value);
                setAmount(Number(event.target.value));
              }}
              onBlur={() => {
                setDraft(null);
                setAmount(formattedAmount);
              }}
              className="w-24 rounded-2xl border border-white/10 bg-black/40 px-2 py-1 text-right text-sm"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-white/60">
            {quickAmounts.map((option) => (
              <button
                type="button"
                key={option.label}
                onClick={() => setAmount(option.value)}
                className={`rounded-full border px-3 py-1 hover:bg-white/10 ${
                  formattedAmount === option.value
                    ? "border-yellow-300/60 text-yellow-200"
                    : "border-white/10"
                }`}
              >
                {option.label} · {option.value}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => onAction("bet", formattedAmount)}
            className="w-full rounded-2xl bg-yellow-400 px-4 py-2 text-sm font-semibold text-black shadow hover:bg-yellow-300"
          >
            {betLabel}
          </button>
        </div>
      )}
    </div>
  );
}
