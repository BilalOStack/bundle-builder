import { describe, expect, it } from 'vitest';
import { discountPercent, formatMoney, formatPrice, monthlyPayment } from './money';

describe('formatting', () => {
  it('renders cents as US currency', () => {
    expect(formatMoney(2798)).toBe('$27.98');
    expect(formatMoney(0)).toBe('$0.00');
    expect(formatMoney(20987)).toBe('$209.87');
  });

  it('appends a suffix for subscription pricing', () => {
    expect(formatPrice(999, '/mo')).toBe('$9.99/mo');
    expect(formatPrice(999)).toBe('$9.99');
  });
});

describe('discount badge', () => {
  it('matches every badge in the design', () => {
    expect(discountPercent(2798, 3598)).toBe(22); // Wyze Cam v4
    expect(discountPercent(3498, 3998)).toBe(12); // Wyze Cam Pan v3
    expect(discountPercent(6998, 8998)).toBe(22); // Floodlight v2
  });

  it('floors rather than rounds', () => {
    // Pan v3 is 12.5% off and the design labels it "Save 12%".
    expect(discountPercent(3498, 3998)).not.toBe(13);
  });

  it('returns null when there is no discount to show', () => {
    expect(discountPercent(6998)).toBeNull();
    expect(discountPercent(6998, 6998)).toBeNull();
    expect(discountPercent(6998, 5000)).toBeNull();
  });
});

describe('financing', () => {
  it('divides evenly at 0% APR', () => {
    expect(monthlyPayment(20987, 12, 0)).toBe(1749);
  });

  it('adds interest above 0% APR', () => {
    expect(monthlyPayment(20987, 12, 0.15)).toBeGreaterThan(1749);
  });

  it('falls back to the full amount with no term', () => {
    expect(monthlyPayment(20987, 0, 0)).toBe(20987);
  });
});
