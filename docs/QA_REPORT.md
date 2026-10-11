# QA Audit Report — Currency Converter

**Scope:** responsive layout (14 viewports incl. landscape), visual consistency, functional behaviour,
accessibility (WCAG 2.2 AA via axe-core + manual checks), performance, edge cases, and automated regression tests.
**Branch:** `arena/4a6f0bc5-learnproject-currency-converte` (base `ab3350e`)
**Browser under test:** Chromium 153 (headless). Firefox, Safari/WebKit and Microsoft Edge could **not** be tested (see *Not verified*).

## 1. Summary

| | Count |
|---|---|
| Issues discovered | 16 |
| Fixed | 16 |
| Open items (see §7) | 7 limitations/observations, none blocking |

- **Automated tests:** 28 Playwright tests added (`e2e/converter.spec.js`). **28/28 pass on the fixed code.**
  Run against the original commit, **13 of the 14 behavioural tests fail**; the rapid-swap test passes on both as a regression guard.
  The 14 responsive-overflow tests pass on both (no horizontal overflow was found, so they guard against future regressions).
- **Lint:** `npm run lint` was failing with 2 `react-hooks` errors; it now passes (exit 0).
- **Build:** passes.

## 2. Issues and fixes

Severity: Critical / High / Medium / Low. Viewports are where the issue was reproduced.

| # | Page/Component | Issue | Severity | Viewport | Root Cause | Fix | Status |
|---|---|---|---|---|---|---|---|
| 1 | Currency select (From/To) | Two flags appear in every select: the native select text already contains the flag and an absolutely positioned overlay flag sat on top of it (not `aria-hidden`). | Medium | 320–2560, all | Overlay `<span>` duplicated the option label's flag. | Removed overlay; padding adjusted to `pl-3`. | Fixed |
| 2 | Currency dropdowns, error state | When the base-rate request fails, the dropdowns are empty while the message says "try another currency" — the user has no way to act on it. | High | 320–2560, all (when rates fail) | `options` was derived only from loaded rate keys, so an error left zero options. | Dropdowns fall back to the known currency list (`KNOWN_CURRENCIES`); conversion still requires real rates. | Fixed |
| 3 | Rate ticker, error state | Ticker shows an animated skeleton forever after a failed request (no error state). | Medium | All | `RateTicker` treated "no rates" the same as "loading". | Separate "Live rates unavailable" state. | Fixed |
| 4 | Converted amount ("To") | After changing currency, the To value shows the previous base's rate applied to the new currency (e.g. "100" for 100 INR, real answer ≈ 1.20 USD) until the request completes — seconds on slow networks. | High | All (slow network) | Rates were kept in state without tracking which base they belonged to; conversion used them immediately. | Results stored with their base currency; `loading` derived; To shows a skeleton while pending. Hook refactor also removes a lint error. | Fixed |
| 5 | Rate pill and ticker | Small rates round to zero: `1 USD = 0BTC`, ticker `USD/BTC 0`, `1 IDR` → `0 USD`. | High | All | `maximumFractionDigits: 4` on values below 0.0001. | `formatNumber` keeps 4 significant digits for values below 1. | Fixed |
| 6 | Rate ticker | Auto-moving content has no pause control (WCAG 2.2.2, Level A). Hover-only pause is not available to keyboard or touch users. | High | All (motion on) | No pause mechanism. | Pause/play button next to the ticker. | Fixed |
| 7 | Rate ticker | Duplicate copies of the rates are read by screen readers; ticker sits outside any landmark (axe `region`). | Medium | All | Second row lacked `aria-hidden`; no `<section>` landmark. | Copies 2–3 are `aria-hidden`; wrapped in `<section aria-label="Live exchange rates">`. | Fixed |
| 8 | Rate ticker | Blank gap appears during the loop on wide screens (≈57 px at 1920 px, ≈697 px at 2560 px). | Medium | 1920, 2560 | Two copies of the row (≈1863 px each) were shorter than the viewport. | Three copies, loop moves one row (`-33.3333%`); same scroll speed. | Fixed |
| 9 | Converted amount ("To") | The converted value has no accessible name; `<label for>` pointed at a non-labelable `<p>`. | Medium | All | Used `<p>` instead of a labelable element. | `<output>` (labelable; `aria-live="off"` so the count-up doesn't spam announcements). | Fixed |
| 10 | Amount input | Negative amounts are accepted and converted into negative values with no message. | Medium | All | No validation. | `aria-invalid`, `aria-describedby`, inline "Amount can't be negative." message; To shows "—". | Fixed |
| 11 | Count-up animation | The JavaScript count-up ignores `prefers-reduced-motion` (the CSS rule does not cover it), contradicting the README. | Medium | All (reduced-motion users) | Tween was JS-driven. | Tween is skipped when reduced motion is requested. | Fixed |
| 12 | Rate requests | A stalled request keeps the UI loading indefinitely (no timeout). | Medium | All (slow/stalled network) | `fetch` had no timeout. | 8 s `AbortController` timeout per URL; falls back to the mirror. | Fixed |
| 13 | Input and select focus | Focus indicator is weak: `outline-none` on the select with only a border-colour change; the input's focus ring is 15% alpha. | Medium | All (keyboard) | Styling relied on `:focus` border only. | `focus-visible` ring on the select; focus-within ring raised to 40% alpha. | Fixed |
| 14 | Footer "Built by" link | Text splits awkwardly across lines at 320–390 px ("Built / by", "· rates auto- / update"). | Low | 320, 390 | Each text node became its own flex item. | Text grouped in one `<span>`. | Fixed |
| 15 | Rate pill | Screen-reader text reads "0.012USD" (no space between rate and code). | Low | All | Flex children split the text. | Text grouped in one `<span>`. | Fixed |
| 16 | Project lint | `npm run lint` failed (2 `react-hooks/set-state-in-effect` errors). | Low | n/a | Synchronous `setState` in effects. | Resolved by the hook refactor (#4) and derived conversion. | Fixed |

## 3. Responsive testing

Checked at 320, 375, 390, 425, 768, 820, 1024, 1280, 1366, 1440, 1920, 2560 px, and landscape 667×375, 844×390.

- **Horizontal overflow:** none at any size (`scrollWidth == clientWidth`; element-level check ignores content clipped by the ticker).
- **Touch targets:** no interactive element below 24×24 CSS px (WCAG 2.5.8) at any tested viewport (measured in the sweep). The swap button is 48 px.
- **Layout:** no overlaps or clipped text found at any size. Header wraps to two lines at 320 px, as expected.
- **Fixed/sticky elements:** none in the design, so none can cover content.
- **Landscape:** page scrolls; no overflow.
- **Zoom / reflow (WCAG 1.4.10):** the 320 css px viewport (equivalent to 400% zoom of a 1280 px screen) was checked for overflow; no horizontal scroll. A dedicated 200% (640 css px) pass was **not** run separately.

Evidence: full-page and fold screenshots in `qa-artifacts/sweep/` and `qa-artifacts/after/` (outside the repo, not committed).

## 4. Accessibility

- **axe-core (latest), WCAG 2.0/2.1/2.2 A & AA + best practice, after fixes:** 0 violations at 390 px and 1440 px.
  - `color-contrast` is reported as *incomplete* (18 nodes at 390 px, 37 at 1440 px) because text sits on gradient/blurred backgrounds. **Manual contrast check still required** (see §6).
- **Keyboard order (verified):** From input → From select → Swap → To select → footer link → Pause ticker. Logical, no traps.
- **Focus visibility:** verified via computed style (box-shadow ring on keyboard focus of the select, test in suite).
- **Names/roles:** To amount is now a labelled field; ticker is a named region; duplicate content hidden.
- **Motion:** CSS and JS motion now respect `prefers-reduced-motion`. Ticker has a pause control.
- **Known gaps:** placeholder text (`text-white/30`) is low contrast; manual check recommended.

## 5. Cross-browser testing

| Browser | Status |
|---|---|
| Chromium 153 (headless) | Tested — all automated and manual checks |
| Google Chrome (stable) | Not separately tested; Chromium is the same engine family, so behaviour is expected to match but this is **not verified** |
| Microsoft Edge | **Not tested** — no Edge binary available in the sandbox |
| Mozilla Firefox | **Not tested** — no Firefox binary available (Playwright's CDN and Debian/Ubuntu repos are unreachable) |
| Safari / WebKit | **Not tested** — no WebKit binary available |

## 6. Performance, stability and edge cases

Measured with Chromium, throttled to 1.6 Mbps / 150 ms latency and 4× CPU.

- **LCP:** 1.3 s · **CLS:** 0 · **Longest task:** 128 ms · **DOM content loaded:** 0.7 s.
- **Memory:** heap flat across 40 currency changes (10 MB → 10 MB); no measurable leak.
- **Console:** only environment errors (blocked Google Fonts, blocked GitHub API TLS, Vercel analytics script absent from `vite preview`). No application errors.
- **Failed requests:** rate hosts blocked in the sandbox → error state tested (covered by the failure tests).
- **Edge inputs tested:** empty, `0`, `-50`, `1e308` (formats to a very long number; truncated with `title`), rapid swap ×21 (ends in a consistent swapped pair).
- **Browser back/forward:** single route, no history entries; navigating away and back leaves the app; state is not stored in the URL.

**Observations (not fixed):**
- The animated aurora (`background-position`) and three blurred, animated blobs run continuously. This is a likely GPU cost on low-end phones. It was **not profiled** (no FPS trace), so the cost is unmeasured.
- INP was not measured reliably: headless software rendering produced 50–150 ms pointer-event durations that aren't representative of a real device.

## 7. Not verified / open items

1. **Firefox, Safari/WebKit, Edge** — not tested (binaries unavailable in the sandbox).
2. **Real rates API** — the sandbox blocks `cdn.jsdelivr.net`; all rate tests use mocked data with 28 currencies. The live list is ~300 codes; dropdown behaviour at full size is untested in this environment.
3. **Emoji flags** — the sandbox has no emoji font, so flags render as boxes in screenshots. Flag rendering was not visually verified.
4. **Colour contrast** — axe returned *incomplete* results on gradient backgrounds; needs a manual check.
5. **Error pill wrap at 320 px** — "Rates unavailable — try another currency" wraps to two lines inside a pill (cosmetic, Low, left as-is).
6. **No retry button and no URL state** — by design, the app has no retry control or shareable state. Consider adding both (Low).
7. **Light theme** — the app is dark-only (`color-scheme: dark`); there is no theme toggle to test.

## 8. Automated test suite

File: `e2e/converter.spec.js` (helpers in `e2e/helpers.js`), config `playwright.config.js`, run with `npm run test:e2e`.

| Group | Tests | Result (fixed code) | Result (original code) |
|---|---|---|---|
| Responsive overflow (14 viewports) | 14 | 14 pass | 14 pass |
| Rate display (small rates, ticker, single flag, labelled output) | 4 | 4 pass | 4 fail |
| Input validation (negative amounts) | 2 | 2 pass | 2 fail |
| Loading & error states (stale value, failure fallback, stalled request) | 3 | 3 pass | 3 fail |
| Accessibility & motion (reduced motion, pause control, ultrawide loop, focus ring) | 4 | 4 pass | 4 fail |
| Interactions (rapid swap) | 1 | 1 pass | 1 pass |
| **Total** | **28** | **28 pass** | **13 fail / 15 pass** |
