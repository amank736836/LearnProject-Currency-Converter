import { currencyFlag } from "../utils/currencyFlags.js";

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

const rateFormat = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 4,
});

function TickerRow({ rates, base, idPrefix }) {
  return (
    <div className="flex shrink-0 items-center">
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
            {rateFormat.format(rates[code])}
          </span>
        </span>
      ))}
    </div>
  );
}

function RateTicker({ rates = {}, base = "usd", loading = false }) {
  const hasRates = Object.keys(rates).length > 0;

  if (loading || !hasRates) {
    return (
      <div className="w-full border-t border-white/10 bg-slate-950/60 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center gap-4 overflow-hidden px-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} className="skeleton h-3 w-28 shrink-0 rounded-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="ticker w-full overflow-hidden border-t border-white/10 bg-slate-950/60 py-2.5 backdrop-blur-md">
      <div className="ticker-track flex w-max">
        <TickerRow rates={rates} base={base} idPrefix="a" />
        <TickerRow rates={rates} base={base} idPrefix="b" />
      </div>
    </div>
  );
}

export default RateTicker;
