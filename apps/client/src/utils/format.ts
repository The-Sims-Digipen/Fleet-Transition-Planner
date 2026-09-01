export const money = new Intl.NumberFormat("en-SG", {
  style: "currency",
  currency: "SGD",
  maximumFractionDigits: 0,
});

export const compactMoney = new Intl.NumberFormat("en-SG", {
  style: "currency",
  currency: "SGD",
  notation: "compact",
  maximumFractionDigits: 1,
});

export const wholeNumber = new Intl.NumberFormat("en-SG", {
  maximumFractionDigits: 0,
});

export function formatPayback(years: number | null): string {
  return years === null ? "Not viable" : `${years.toFixed(1)} yrs`;
}

export function formatTonnes(kilograms: number): string {
  return `${wholeNumber.format(kilograms / 1000)} t CO₂`;
}
