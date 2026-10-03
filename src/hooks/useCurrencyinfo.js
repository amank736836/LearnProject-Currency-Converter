import { useEffect, useState } from "react";

// Primary CDN + fallback mirror so the app survives an endpoint outage.
const API_URLS = (currency) => [
  `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${currency}.json`,
  `https://latest.currency-api.pages.dev/v1/currencies/${currency}.json`,
];

async function fetchRates(currency) {
  let lastError = null;
  for (const url of API_URLS(currency)) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json && json[currency]) return json[currency];
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError ?? new Error("No rates available");
}

function useCurrencyInfo(currency) {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    fetchRates(currency)
      .then((rates) => {
        if (cancelled) return;
        setData(rates);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError(true);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [currency]);

  return { data, loading, error };
}

export default useCurrencyInfo;
