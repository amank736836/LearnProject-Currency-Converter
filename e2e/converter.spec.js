import { test, expect } from "@playwright/test";
import {
  mockRates,
  selectFrom,
  selectTo,
  amountInput,
  toOutput,
  swapButton,
  ticker,
} from "./helpers.js";

const VIEWPORTS = [
  [320, 568], [375, 667], [390, 844], [425, 800],
  [768, 1024], [820, 1180], [1024, 1366],
  [1280, 800], [1366, 768], [1440, 900], [1920, 1080], [2560, 1440],
  [667, 375], [844, 390], // landscape phones
];

test.describe("responsive layout", () => {
  for (const [width, height] of VIEWPORTS) {
    test(`no horizontal overflow at ${width}x${height}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await mockRates(page);
      await page.goto("/");
      await expect(selectFrom(page)).toBeVisible();

      const result = await page.evaluate(() => {
        const vw = document.documentElement.clientWidth;
        const offenders = [];
        for (const el of document.querySelectorAll("body *")) {
          if (el.closest('[aria-hidden="true"]')) continue; // decorative blobs
          const r = el.getBoundingClientRect();
          if (r.width === 0 && r.height === 0) continue;
          if (r.right > vw + 0.5 || r.left < -0.5) {
            // Ignore content clipped by an overflow-hidden ancestor (e.g. the ticker).
            let clipped = false;
            for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
              const o = getComputedStyle(p);
              if (/(hidden|clip)/.test(o.overflowX)) {
                const pr = p.getBoundingClientRect();
                if (pr.right <= vw + 0.5 && pr.left >= -0.5) { clipped = true; break; }
              }
            }
            if (!clipped) offenders.push(el.tagName + "." + String(el.className).slice(0, 40));
          }
        }
        return { vw, offenders };
      });
      expect(result.offenders).toEqual([]);
    });
  }
});

test.describe("rate display", () => {
  test("very small rates are not rounded to zero", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await mockRates(page);
    await page.goto("/");
    await expect(page.getByText(/1 USD = 83\.2/)).toBeVisible();
    await selectTo(page).selectOption("btc");
    await expect(page.getByText(/1 USD = 0\.0000105 BTC/)).toBeVisible();
  });

  test("ticker shows small rates without rounding them to zero", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await mockRates(page);
    await page.goto("/");
    const btcPair = page.getByText("USD/BTC", { exact: true }).first();
    await expect(btcPair.locator("xpath=following-sibling::span[1]")).toHaveText("0.0000105");
  });

  test("currency select shows a single flag", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await mockRates(page);
    await page.goto("/");
    const wrapper = selectFrom(page).locator("xpath=..");
    // The flag is rendered once, inside the native select; no overlaid second flag.
    await expect(wrapper.locator("span")).toHaveCount(0);
  });

  test("converted value is a labelled field", async ({ page }) => {
    await mockRates(page);
    await page.goto("/");
    await expect(page.getByLabel("To", { exact: true })).toHaveText("8,320");
  });
});

test.describe("input validation", () => {
  test("negative amounts are flagged and not converted", async ({ page }) => {
    await mockRates(page);
    await page.goto("/");
    await amountInput(page).fill("-50");
    await expect(amountInput(page)).toHaveAttribute("aria-invalid", "true");
    await expect(page.getByRole("alert")).toHaveText("Amount can't be negative.");
    await expect(toOutput(page)).toHaveText("—");
  });

  test("valid amount clears the negative-amount state", async ({ page }) => {
    await mockRates(page);
    await page.goto("/");
    await amountInput(page).fill("-5");
    await amountInput(page).fill("2");
    await expect(amountInput(page)).not.toHaveAttribute("aria-invalid", "true");
    await expect(toOutput(page)).toHaveText("166.4");
  });
});

test.describe("loading and error states", () => {
  test("converted value is not shown from the previous base while rates load", async ({ page }) => {
    await mockRates(page, { delayMs: 1500 });
    await page.goto("/");
    await expect(toOutput(page)).toHaveText("8,320", { timeout: 10_000 });
    await swapButton(page).click();
    // Pending: skeleton state instead of a wrong number such as "100".
    await expect(toOutput(page)).toHaveAttribute("aria-busy", "true");
    await expect(toOutput(page)).not.toHaveText("100");
    // Once loaded: 100 INR ≈ 1.2019 USD.
    await expect(toOutput(page)).not.toHaveAttribute("aria-busy", "true", { timeout: 10_000 });
    await expect(toOutput(page)).toHaveText("1.2019");
  });

  test("failed rate requests keep the currency list usable", async ({ page }) => {
    await mockRates(page, { fail: true });
    await page.goto("/");
    await expect(page.getByText(/Rates unavailable/)).toBeVisible();
    await expect(ticker(page).getByText("Live rates unavailable")).toBeVisible();
    // Dropdown still offers currencies, so the advertised "try another currency" works.
    const count = await selectFrom(page).locator("option").count();
    expect(count).toBeGreaterThan(10);
    await selectFrom(page).selectOption("eur");
    await expect(selectFrom(page)).toHaveValue("eur");
  });

  test("a stalled primary request falls back to the mirror", async ({ page }) => {
    test.setTimeout(40_000);
    await page.route("https://cdn.jsdelivr.net/**", () => {}); // never responds
    await mockRates(page, { hosts: ["https://latest.currency-api.pages.dev/**"] });
    await page.goto("/");
    await expect(toOutput(page)).toHaveText("8,320", { timeout: 30_000 });
  });
});

test.describe("accessibility and motion", () => {
  test("count-up animation is skipped with prefers-reduced-motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await mockRates(page);
    await page.goto("/");
    await expect(page.getByText(/1 USD = 83\.2/)).toBeVisible();
    await amountInput(page).fill("1000");
    await expect(toOutput(page)).toHaveText("83,200", { timeout: 150 });
  });

  test("rate ticker has a pause control and hides duplicate copies", async ({ page }) => {
    await mockRates(page);
    await page.goto("/");
    const pause = ticker(page).getByRole("button", { name: "Pause rate ticker" });
    await expect(pause).toBeVisible();
    await pause.click();
    await expect(ticker(page).getByRole("button", { name: "Play rate ticker" })).toBeVisible();
    const hidden = await ticker(page).locator('[aria-hidden="true"]').count();
    expect(hidden).toBeGreaterThanOrEqual(2);
  });

  test("ticker loop covers the full width on ultrawide screens", async ({ page }) => {
    await page.setViewportSize({ width: 2560, height: 1440 });
    await mockRates(page);
    await page.goto("/");
    await expect(page.locator(".ticker-track")).toBeVisible();
    const metrics = await page.evaluate(() => {
      const track = document.querySelector(".ticker-track");
      const anim = track.getAnimations()[0];
      const frames = anim.effect.getKeyframes();
      const end = frames[frames.length - 1].transform; // e.g. "translateX(-33.3333%)"
      const percent = Math.abs(parseFloat(end.match(/(-?[\d.]+)%/)[1]));
      const trackWidth = track.getBoundingClientRect().width;
      const container = track.parentElement.getBoundingClientRect().width;
      return { visibleAtLoopEnd: trackWidth - (percent / 100) * trackWidth, container };
    });
    // At the end of each loop the viewport must still be filled with ticker content.
    expect(metrics.visibleAtLoopEnd).toBeGreaterThanOrEqual(metrics.container);
  });

  test("keyboard focus shows a visible ring on the currency select", async ({ page }) => {
    await mockRates(page);
    await page.goto("/");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await expect(selectFrom(page)).toBeFocused();
    const shadow = await selectFrom(page).evaluate((el) => getComputedStyle(el).boxShadow);
    expect(shadow).not.toBe("none");
  });
});

test.describe("interactions", () => {
  test("rapid swap clicks leave a consistent pair", async ({ page }) => {
    await mockRates(page);
    await page.goto("/");
    await expect(selectFrom(page)).toHaveValue("usd");
    for (let i = 0; i < 20; i++) await swapButton(page).click();
    await expect(selectFrom(page)).toHaveValue("usd");
    await expect(selectTo(page)).toHaveValue("inr");
  });
});
