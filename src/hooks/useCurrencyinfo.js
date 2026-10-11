import { useEffect, useState } from "react";

// Primary CDN + fallback mirror so the app survives an endpoint outage.
const API_URLS = (currency) => [
  `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${currency}.json`,
  `https://latest.currency-api.pages.dev/v1/currencies/${currency}.json`,
];

// Don't let a stalled request leave the UI in a loading state forever.
const REQUEST_TIMEOUT_MS = 8000;

async function fetchJson(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

async function fetchRates(currency) {
  let lastError = null;
  for (const url of API_URLS(currency)) {
    try {
      const json = await fetchJson(url);
      if (json && json[currency]) return json[currency];
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError ?? new Error("No rates available");
}

function useCurrencyInfo(currency) {
  // Results are stored together with the currency they belong to, so `loading`
  // is derived instead of being set inside the effect, and stale rates for a
  // previous base currency are never treated as the current ones.
  const [state, setState] = useState({ currency: null, data: {}, error: false });

  useEffect(() => {
    let cancelled = false;

    fetchRates(currency)
      .then((rates) => {
        if (cancelled) return;
        setState({ currency, data: rates, error: false });
      })
      .catch(() => {
        if (cancelled) return;
        setState((prev) => ({ currency, data: prev.data, error: true }));
      });

    return () => {
      cancelled = true;
    };
  }, [currency]);

  const ready = state.currency === currency;
  return { data: state.data, loading: !ready, error: ready && state.error, ready };
}

export default useCurrencyInfo;
