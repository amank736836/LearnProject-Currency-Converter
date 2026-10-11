// Deterministic exchange-rate data so tests don't depend on live rates.
const RATES = {
  usd: 1, eur: 0.92, gbp: 0.79, inr: 83.2, jpy: 149.5, aud: 1.52, cad: 1.36,
  chf: 0.88, cny: 7.24, sgd: 1.34, aed: 3.6725, btc: 0.0000105, idr: 15700,
  vnd: 25400, krw: 1350, sar: 3.75, brl: 5.05, mxn: 17.1, zar: 18.4,
};

export const RATE_HOSTS = [
  "https://cdn.jsdelivr.net/**",
  "https://latest.currency-api.pages.dev/**",
];

const ratesFor = (base) => {
  const b = RATES[base] ?? 1;
  return Object.fromEntries(Object.entries(RATES).map(([k, v]) => [k, v / b]));
};

/**
 * Serve mocked rates for every rate host.
 * @param {import('@playwright/test').Page} page
 * @param {{ delayMs?: number, fail?: boolean, hosts?: string[] }} [options]
 */
export async function mockRates(page, { delayMs = 0, fail = false, hosts = RATE_HOSTS } = {}) {
  for (const host of hosts) {
    await page.route(host, async (route) => {
      const match = route.request().url().match(/currencies\/([a-z]+)\.json/);
      if (!match) return route.continue();
      if (fail) return route.fulfill({ status: 503, body: "unavailable" });
      if (delayMs) await new Promise((r) => setTimeout(r, delayMs));
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ date: "2026-10-10", [match[1]]: ratesFor(match[1]) }),
      });
    });
  }
}

export const selectFrom = (page) => page.getByRole("combobox", { name: "Select From currency" });
export const selectTo = (page) => page.getByRole("combobox", { name: "Select To currency" });
export const amountInput = (page) => page.getByRole("spinbutton");
export const toOutput = (page) => page.locator("output");
export const swapButton = (page) => page.getByRole("button", { name: "Swap currencies" });
export const ticker = (page) => page.getByRole("region", { name: "Live exchange rates" });
