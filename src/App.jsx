import { useEffect, useMemo, useState } from "react";
import { InputBox, RateTicker } from "./components";
import useCurrencyInfo from "./hooks/useCurrencyinfo.js";
import { Analytics } from "@vercel/analytics/react";

const rateFormat = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 4,
});

function App() {
  const [amount, setAmount] = useState("100");
  const [convertedAmount, setConvertedAmount] = useState(0);

  const [from, setFrom] = useState("usd");
  const [to, setTo] = useState("inr");
  const [spin, setSpin] = useState(0);

  const { data: currencyInfo, loading, error } = useCurrencyInfo(from);
  const options = useMemo(
    () => Object.keys(currencyInfo).sort(),
    [currencyInfo]
  );

  const swap = () => {
    setFrom(to);
    setTo(from);
    setSpin((s) => s + 180);
  };

  const convert = () => {
    setConvertedAmount((Number(amount) || 0) * (currencyInfo[to] || 0));
  };

  useEffect(() => {
    convert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [to, from, amount, currencyInfo]);

  const [github, setGithub] = useState(null);
  useEffect(() => {
    fetch("https://api.github.com/users/amank736836")
      .then((response) => response.json())
      .then((data) => {
        if (data && data.avatar_url) setGithub(data);
      })
      .catch(() => {});
  }, []);

  const rate = currencyInfo[to];

  return (
    <>
      <Analytics />
      <div className="aurora-bg relative flex min-h-screen w-full flex-col overflow-hidden text-white">
        {/* Ambient floating gradient blobs */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="animate-blob absolute -left-32 -top-32 h-96 w-96 rounded-full bg-fuchsia-500/30 blur-3xl" />
          <div
            className="animate-blob absolute -right-32 top-1/3 h-[28rem] w-[28rem] rounded-full bg-cyan-400/25 blur-3xl"
            style={{ animationDelay: "-6s" }}
          />
          <div
            className="animate-blob absolute -bottom-40 left-1/3 h-[26rem] w-[26rem] rounded-full bg-indigo-500/25 blur-3xl"
            style={{ animationDelay: "-11s" }}
          />
        </div>

        {/* Main content */}
        <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-10">
          <div
            className="glass animate-fade-up w-full max-w-md rounded-3xl p-6 sm:p-8"
            style={{ animationDelay: "100ms" }}
          >
            {/* Header */}
            <header className="mb-6 flex flex-col items-center text-center">
              <div
                className="animate-float mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400/90 via-indigo-500/90 to-fuchsia-500/90 text-3xl shadow-lg shadow-indigo-500/40"
                aria-hidden="true"
              >
                💱
              </div>
              <h1 className="gradient-text text-3xl font-bold tracking-tight sm:text-4xl">
                Currency Converter
              </h1>
              <p className="mt-1 text-sm text-slate-300/80">
                Live rates · instant conversion
              </p>
            </header>

            {/* Live rate pill */}
            <div
              className="animate-fade-up mb-6 flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2"
              style={{ animationDelay: "200ms" }}
            >
              {loading ? (
                <span className="skeleton h-4 w-44 rounded-full" />
              ) : error || rate === undefined ? (
                <span className="text-sm text-rose-300">
                  ⚠️ Rates unavailable — try another currency
                </span>
              ) : (
                <span
                  key={`${from}-${to}-${rate}`}
                  className="animate-pop flex items-center gap-2 text-sm text-slate-200"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                  </span>
                  1 {from.toUpperCase()} ={" "}
                  <strong className="tabular-nums text-cyan-300">
                    {rateFormat.format(rate)}
                  </strong>
                  {to.toUpperCase()}
                </span>
              )}
            </div>

            {/* Converter form */}
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="animate-fade-up" style={{ animationDelay: "300ms" }}>
                <InputBox
                  label="From"
                  amount={amount}
                  currencyOptions={options}
                  onCurrencyChange={(currency) => {
                    if (currency === to) {
                      setFrom(currency);
                      setTo(from);
                    } else {
                      setFrom(currency);
                    }
                  }}
                  selectedCurrency={from}
                  onAmountChange={(value) => setAmount(value)}
                />
              </div>

              {/* Swap button */}
              <div className="relative z-10 -my-3.5 flex justify-center">
                <button
                  type="button"
                  onClick={swap}
                  aria-label="Swap currencies"
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 via-indigo-500 to-fuchsia-500 text-white shadow-lg shadow-indigo-500/40 ring-4 ring-slate-950/50 transition-all duration-300 hover:scale-110 hover:shadow-fuchsia-500/50 active:scale-95"
                >
                  <span
                    className="flex transition-transform duration-500 ease-out"
                    style={{ transform: `rotate(${spin}deg)` }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M7 16V4m0 0L3 8m4-4 4 4" />
                      <path d="M17 8v12m0 0 4-4m-4 4-4-4" />
                    </svg>
                  </span>
                </button>
              </div>

              <div className="animate-fade-up" style={{ animationDelay: "400ms" }}>
                <InputBox
                  label="To"
                  amount={convertedAmount}
                  currencyOptions={options}
                  onCurrencyChange={(currency) => {
                    if (currency === from) {
                      setTo(currency);
                      setFrom(to);
                    } else {
                      setTo(currency);
                    }
                  }}
                  selectedCurrency={to}
                  amountDisabled
                  animateValue
                  highlight
                />
              </div>
            </form>

            {/* Footer chip */}
            <a
              href={github?.html_url ?? "https://github.com/amank736836"}
              target="_blank"
              rel="noreferrer"
              className="group mt-6 flex items-center justify-center gap-2.5 text-xs text-slate-400 transition-colors duration-300 hover:text-white"
            >
              {github?.avatar_url ? (
                <img
                  src={github.avatar_url}
                  alt="GitHub avatar of amank736836"
                  className="h-6 w-6 rounded-full ring-2 ring-white/20 transition-transform duration-300 group-hover:scale-110 group-hover:ring-cyan-300/60"
                />
              ) : (
                <span className="skeleton h-6 w-6 rounded-full" />
              )}
              Built by{" "}
              <span className="font-semibold text-slate-300 transition-colors group-hover:text-cyan-300">
                amank736836
              </span>
              · rates auto-update
            </a>
          </div>
        </main>

        {/* Live rate ticker */}
        <div className="animate-fade-in relative z-10" style={{ animationDelay: "600ms" }}>
          <RateTicker rates={currencyInfo} base={from} loading={loading} />
        </div>
      </div>
    </>
  );
}

export default App;
