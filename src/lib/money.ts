import type { Cents } from '@/types/catalog';

/**
 * Money is integer cents everywhere in the app and is only turned into a
 * string at the render edge. Floating-point dollars in a pricing UI produce
 * $69.96000000000001 sooner or later.
 */

const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatMoney(cents: Cents): string {
  return formatter.format(cents / 100);
}

/** `$27.98` plus an optional suffix such as `/mo`. */
export function formatPrice(cents: Cents, suffix?: string): string {
  return suffix ? `${formatMoney(cents)}${suffix}` : formatMoney(cents);
}

export function sum(values: Cents[]): Cents {
  return values.reduce((total, value) => total + value, 0);
}

/**
 * Discount percentage shown on the card badge.
 *
 * Floors rather than rounds: the design's Wyze Cam Pan v3 goes $39.98 → $34.98,
 * which is 12.5% off and is labelled "Save 12%". Rounding would render 13%.
 * The other two badges (22.2% → "Save 22%") agree under either rule.
 */
export function discountPercent(price: Cents, compareAtPrice?: Cents): number | null {
  if (!compareAtPrice || compareAtPrice <= price) return null;
  return Math.floor((1 - price / compareAtPrice) * 100);
}

/**
 * Monthly instalment for the financing line.
 *
 * Implemented as a real amortisation formula so it stays data-driven, but note
 * that the design's "as low as $19.19/mo" against its $187.89 total does not
 * correspond to any clean term or rate (it implies ~9.79 months at 0% APR), so
 * it appears to be a hand-authored figure in the mock. See the README.
 */
export function monthlyPayment(total: Cents, months: number, apr: number): Cents {
  if (months <= 0) return total;
  if (apr <= 0) return Math.ceil(total / months);
  const monthlyRate = apr / 12;
  const payment = (total * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
  return Math.ceil(payment);
}
