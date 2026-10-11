import { useState } from "react";
import { currencyFlag } from "../utils/currencyFlags.js";
import { formatNumber } from "../utils/formatNumber.js";

const POPULAR = [
  "usd",
  "eur",
  "gbp",
  "inr",
  "jpy",
  "aud",
  "cad",
  "chf",
  "cny",
  "sgd",
  "aed",
  "btc",
];

function TickerRow({ rates, base, idPrefix, hidden = false }) {
  return (
    <div
      className="flex shrink-0 items-center"
      aria-hidden={hidden || undefined}
    >
      {POPULAR.filter((code) => code !== base && rates[code]).map((code) => (
        <span
          key={`${idPrefix}-${code}`}
          className="flex items-center gap-1.5 whitespace-nowrap px-5 text-xs text-slate-300"
        >
          <span aria-hidden="true">
            {currencyFlag(base)}→{currencyFlag(code)}
          </span>
          <span className="font-semibold tracking-wide text-white/90">
            {base.toUpperCase()}/{code.toUpperCase()}
          </span>
          <span className="tabular-nums font-medium text-cyan-300">
            {formatNumber(rates[code])}
          </span>
        </span>
      ))}
    </div>
  );
}

function RateTicker({ rates = {}, base = "usd", loading = false }) {
  const [paused, setPaused] = useState(false);
  const hasRates = Object.keys(rates).length > 0;

  if (loading) {
    return (
      <section
        aria-label="Live exchange rates"
        className="w-full border-t border-white/10 bg-slate-950/60 py-3 backdrop-blur-md"
      >
        <div className="mx-auto flex max-w-3xl items-center gap-4 overflow-hidden px-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <span
              key={i}
              className="skeleton h-3 w-28 shrink-0 rounded-full"
              aria-hidden="true"
            />
          ))}
        </div>
      </section>
    );
  }

  if (!hasRates) {
    return (
      <section
        aria-label="Live exchange rates"
        className="w-full border-t border-white/10 bg-slate-950/60 py-3 backdrop-blur-md"
      >
        <p className="px-4 text-center text-xs text-slate-400">
          Live rates unavailable
        </p>
      </section>
    );
  }

  return (
    <section
      aria-label="Live exchange rates"
      className="flex w-full items-center gap-2 border-t border-white/10 bg-slate-950/60 py-2.5 backdrop-blur-md"
    >
      <button
        type="button"
        onClick={() => setPaused((p) => !p)}
        aria-label={paused ? "Play rate ticker" : "Pause rate ticker"}
        className="ml-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/15 text-slate-300 transition-colors hover:border-white/40 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-3 w-3"
          fill="currentColor"
          aria-hidden="true"
        >
          {paused ? (
            <path d="M7 5l12 7-12 7z" />
          ) : (
            <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
          )}
        </svg>
      </button>
      <div
        className={`ticker min-w-0 flex-1 overflow-hidden ${
          paused ? "ticker-paused" : ""
        }`}
      >
        <div className="ticker-track flex w-max">
          <TickerRow rates={rates} base={base} idPrefix="a" />
          <TickerRow rates={rates} base={base} idPrefix="b" hidden />
          <TickerRow rates={rates} base={base} idPrefix="c" hidden />
        </div>
      </div>
    </section>
  );
}

export default RateTicker;
