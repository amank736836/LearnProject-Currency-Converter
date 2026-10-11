const fractionFormat = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 4,
});

const significantFormat = new Intl.NumberFormat("en-US", {
  maximumSignificantDigits: 4,
});

// Values below 1 (e.g. BTC or IDR rates) would round to "0" with 4 decimal
// places, so keep 4 significant digits for them instead.
export const formatNumber = (value) =>
  Number.isFinite(value) && value !== 0 && Math.abs(value) < 1
    ? significantFormat.format(value)
    : fractionFormat.format(value);
