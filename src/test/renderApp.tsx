import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '@/App';

/**
 * Renders the whole app, exactly as a shopper gets it — including the seeded
 * state and localStorage restore. These are integration tests; the reducer and
 * selectors already have their own unit specs.
 */
export function renderApp() {
  const view = render(<App />);
  return { ...view, user: userEvent.setup() };
}

/** The review panel on the right. */
export function reviewPanel() {
  return screen.getByRole('complementary', { name: /your security system summary/i });
}

/** A product card in the builder, by product title. */
export function card(title: string) {
  return screen.getByRole('article', { name: title });
}

/**
 * Reads the quantity a stepper is showing. The visible digit is aria-hidden,
 * so the assertable value comes from the stepper's visually-hidden label.
 */
export function quantityIn(scope: HTMLElement, itemLabel: string): number {
  const node = within(scope).getByText(
    new RegExp(`^Quantity of ${escapeRegExp(itemLabel)}: \\d+$`),
  );
  return Number(node.textContent!.split(':').pop()!.trim());
}

/**
 * The accordion header button for a step. Matched on aria-expanded so it
 * can't collide with the "Next: <step title>" advance button.
 */
export function stepHeader(title: RegExp) {
  const header = screen
    .getAllByRole('button', { name: title })
    .find((button) => button.hasAttribute('aria-expanded'));
  if (!header) throw new Error(`No step header matching ${title}`);
  return header;
}

/** The review-panel line for a product, or null when it isn't listed. */
export function reviewLine(productTitle: string): HTMLElement | null {
  const items = within(reviewPanel()).queryAllByRole('listitem');
  return items.find((item) => item.textContent?.includes(productTitle)) ?? null;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
