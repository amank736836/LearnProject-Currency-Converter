import { useEffect, useId, useRef, useState } from "react";
import { currencyFlag } from "../utils/currencyFlags.js";
import { formatNumber } from "../utils/formatNumber.js";

/**
 * Smoothly tweens toward `value` so the converted amount
 * glides instead of jumping (skipped when duration = 0).
 */
function useAnimatedNumber(value, duration = 0) {
  const [display, setDisplay] = useState(value);
  const previous = useRef(value);

  useEffect(() => {
    const from = previous.current;
    const to = value;

    // Respect prefers-reduced-motion for the JS-driven count-up as well.
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (
      duration <= 0 ||
      prefersReducedMotion ||
      !Number.isFinite(from) ||
      !Number.isFinite(to)
    ) {
      previous.current = to;
      setDisplay(to);
      return;
    }
    if (from === to) return;

    let raf;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      setDisplay(from + (to - from) * eased);
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        previous.current = to;
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return display;
}

function InputBox({
  label,
  amount,
  onAmountChange,
  onCurrencyChange,
  currencyOptions = [],
  selectedCurrency = "usd",
  amountDisabled = false,
  animateValue = false,
  highlight = false,
  pending = false,
  error,
  className = "",
}) {
  const amountInputId = useId();
  const errorId = `${amountInputId}-error`;
  const numericAmount = Number(amount) || 0;
  const displayed = useAnimatedNumber(numericAmount, animateValue ? 450 : 0);
  const shownAmount =
    amount === null ? "—" : animateValue ? formatNumber(displayed) : amount;

  return (
    <div
      className={`group rounded-2xl border p-4 transition-all duration-300 ${
        highlight
          ? "border-cyan-300/40 bg-gradient-to-br from-cyan-400/15 to-fuchsia-500/10"
          : "border-white/15 bg-white/[0.07]"
      } hover:border-white/30 hover:bg-white/[0.1] hover:shadow-lg hover:shadow-cyan-500/10 focus-within:border-cyan-300/70 focus-within:shadow-[0_0_0_4px_rgba(34,211,238,0.4)] ${className}`}
    >
      <div className="mb-2 flex items-center justify-between">
        <label
          htmlFor={amountInputId}
          className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/80"
        >
          {label}
        </label>
        <span
          className="text-lg leading-none transition-transform duration-300 group-hover:scale-125"
          aria-hidden="true"
        >
          {currencyFlag(selectedCurrency)}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {animateValue ? (
          <output
            id={amountInputId}
            aria-live="off"
            aria-busy={pending || undefined}
            className="w-full min-w-0 flex-1 truncate text-2xl font-semibold tabular-nums text-white"
            title={pending ? undefined : String(shownAmount)}
          >
            {pending ? (
              <span
                className="skeleton inline-block h-7 w-28 rounded-lg align-middle"
                aria-hidden="true"
              />
            ) : (
              shownAmount
            )}
          </output>
        ) : (
          <input
            id={amountInputId}
            className="w-full min-w-0 flex-1 bg-transparent text-2xl font-semibold text-white outline-none placeholder:text-white/30"
            type="number"
            inputMode="decimal"
            min="0"
            placeholder="Enter amount"
            disabled={amountDisabled}
            value={amount}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            onChange={(e) => onAmountChange && onAmountChange(e.target.value)}
          />
        )}

        <div className="relative shrink-0">
          <select
            className="cursor-pointer appearance-none rounded-xl border border-white/15 bg-slate-900/80 py-2 pl-3 pr-8 text-sm font-semibold uppercase tracking-wide text-white outline-none transition-all duration-300 hover:border-white/40 hover:bg-slate-800 focus:border-cyan-300/70 focus-visible:ring-2 focus-visible:ring-cyan-300"
            value={selectedCurrency}
            onChange={(e) =>
              onCurrencyChange && onCurrencyChange(e.target.value)
            }
            aria-label={`Select ${label} currency`}
          >
            {currencyOptions.map((currency) => (
              <option key={currency} value={currency}>
                {currencyFlag(currency)} {currency.toUpperCase()}
              </option>
            ))}
          </select>
          <svg
            className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-300 transition-transform duration-300 group-hover:text-cyan-300"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </div>

      {error && (
        <p id={errorId} className="mt-2 text-xs text-rose-300" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default InputBox;
