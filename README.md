# 💱 Currency Converter

A live currency converter built with **React + Vite + Tailwind CSS**, featuring an animated
glassmorphic UI inspired by modern web animation techniques.

## Live Demos

- Vercel: https://currency-amank736836.vercel.app/
- Vercel: https://amank736836-currency.vercel.app/
- Render: https://currency-convertor-silk.vercel.app/
- Vercel: https://currency-convertor-skcr.onrender.com/

## ✨ Features

- **Instant conversion** across 150+ currencies using live rates from the
  [currency-api](https://github.com/fawazahmed0/exchange-api) CDN.
- **Glassmorphism card** floating over an animated aurora gradient with ambient
  blur blobs.
- **Micro-interactions** everywhere — glowing focus states, hover lifts, a
  spinning swap button, and an animated count-up on the converted amount.
- **Live rate ticker** marquee that pauses on hover.
- **Skeleton loading states** while rates are fetched, plus a graceful error pill.
- **Currency flags** in every dropdown for quick visual scanning.
- Respects `prefers-reduced-motion` for accessibility.

## 🚀 Getting Started

```bash
npm install
npm run dev     # start dev server at http://localhost:5173
npm run build   # production build
npm run lint    # eslint
```

## 🧩 How It Works

- `src/hooks/useCurrencyinfo.js` — fetches the latest rates for the base
  currency (with a fallback mirror) and exposes `{ data, loading, error }`.
- `src/components/InputBox.jsx` — amount field + currency selector with an
  animated-number hook that tweens the result value.
- `src/components/RateTicker.jsx` — scrolling marquee of popular currency pairs.
- `src/App.jsx` — state, conversion logic and layout.
