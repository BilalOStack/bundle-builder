import { describe, expect, it, vi } from 'vitest';
import { act, screen, within } from '@testing-library/react';
import { card, quantityIn, renderApp, reviewLine, reviewPanel, stepHeader } from '@/test/renderApp';

const increase = (scope: HTMLElement) =>
  within(scope).getByRole('button', { name: /^increase quantity/i });
const decrease = (scope: HTMLElement) =>
  within(scope).getByRole('button', { name: /^decrease quantity/i });

describe('initial render', () => {
  it('loads seeded to match the design', () => {
    renderApp();

    expect(screen.getByRole('heading', { name: "Let's get started!" })).toBeInTheDocument();
    expect(stepHeader(/choose your cameras/i)).toHaveAttribute('aria-expanded', 'true');
    expect(stepHeader(/choose your plan/i)).toHaveAttribute('aria-expanded', 'false');

    // The counts shown in the design.
    expect(stepHeader(/choose your cameras/i)).toHaveAccessibleName(/2 selected/);
    expect(stepHeader(/choose your plan/i)).toHaveAccessibleName(/1 selected/);
    expect(stepHeader(/choose your sensors/i)).toHaveAccessibleName(/2 selected/);
    expect(stepHeader(/add extra protection/i)).toHaveAccessibleName(/1 selected/);
  });

  it('lists the seeded items under the right review headings, in panel order', () => {
    renderApp();
    const headings = within(reviewPanel())
      .getAllByRole('heading', { level: 3 })
      .map((node) => node.textContent);

    expect(headings).toEqual(['Cameras', 'Sensors', 'Accessories', 'Plan']);
    expect(reviewLine('Wyze Cam v4')).not.toBeNull();
    expect(reviewLine('Wyze Sense Hub')).not.toBeNull();
    expect(reviewLine('Cam Unlimited')).not.toBeNull();
  });

  it('shows the design’s savings figure', () => {
    renderApp();
    expect(within(reviewPanel()).getByText(/saving \$50\.92/i)).toBeInTheDocument();
  });

  it('renders no variant selector for a product without variants', () => {
    renderApp();
    expect(within(card('Wyze Duo Cam Doorbell')).queryByRole('radiogroup')).toBeNull();
    expect(within(card('Wyze Cam v4')).getByRole('radiogroup')).toBeInTheDocument();
  });
});

describe('stepper sync between card and review panel', () => {
  it('propagates a card change to the review line and the total', async () => {
    const { user } = renderApp();
    const panel = reviewPanel();

    expect(within(panel).getByText('$209.87')).toBeInTheDocument();

    await user.click(increase(card('Wyze Cam v4')));

    expect(quantityIn(card('Wyze Cam v4'), 'Wyze Cam v4, White')).toBe(2);
    expect(quantityIn(reviewLine('Wyze Cam v4')!, 'Wyze Cam v4, White')).toBe(2);
    // 209.87 + 27.98
    expect(within(reviewPanel()).getByText('$237.85')).toBeInTheDocument();
  });

  it('propagates a review-panel change back to the card', async () => {
    const { user } = renderApp();

    await user.click(decrease(reviewLine('Wyze Cam Pan v3')!));

    expect(quantityIn(card('Wyze Cam Pan v3'), 'Wyze Cam Pan v3, White')).toBe(1);
    expect(quantityIn(reviewLine('Wyze Cam Pan v3')!, 'Wyze Cam Pan v3, White')).toBe(1);
  });

  it('drops the line and the step count once a product reaches zero', async () => {
    const { user } = renderApp();

    await user.click(decrease(card('Wyze Cam v4')));

    expect(reviewLine('Wyze Cam v4')).toBeNull();
    expect(stepHeader(/choose your cameras/i)).toHaveAccessibleName(/1 selected/);
  });

  it('leaves a locked product’s stepper inoperable', () => {
    renderApp();
    const line = reviewLine('Wyze Sense Hub')!;
    expect(increase(line)).toBeDisabled();
    expect(decrease(line)).toBeDisabled();
  });
});

describe('variant selection', () => {
  it('binds the stepper to the active variant and keeps counts separate', async () => {
    const { user } = renderApp();
    const floodlight = card('Wyze Cam Floodlight v2');

    // Add 2 White…
    await user.click(increase(floodlight));
    await user.click(increase(floodlight));
    expect(quantityIn(card('Wyze Cam Floodlight v2'), 'Wyze Cam Floodlight v2, White')).toBe(2);

    // …then switch the card to Black: the stepper now reads Black's own count.
    await user.click(within(card('Wyze Cam Floodlight v2')).getByRole('radio', { name: /black/i }));
    expect(quantityIn(card('Wyze Cam Floodlight v2'), 'Wyze Cam Floodlight v2, Black')).toBe(0);

    // The 2 White are untouched and still listed on the right.
    const lines = within(reviewPanel())
      .getAllByRole('listitem')
      .filter((item) => item.textContent?.includes('Wyze Cam Floodlight v2'));
    expect(lines).toHaveLength(1);
    expect(quantityIn(lines[0], 'Wyze Cam Floodlight v2, White')).toBe(2);
  });

  it('lists every variant above zero as its own line', async () => {
    const { user } = renderApp();

    await user.click(increase(card('Wyze Cam Floodlight v2')));
    await user.click(within(card('Wyze Cam Floodlight v2')).getByRole('radio', { name: /black/i }));
    await user.click(increase(card('Wyze Cam Floodlight v2')));

    const lines = within(reviewPanel())
      .getAllByRole('listitem')
      .filter((item) => item.textContent?.includes('Wyze Cam Floodlight v2'));

    expect(lines).toHaveLength(2);
    expect(lines[0]).toHaveTextContent('White');
    expect(lines[1]).toHaveTextContent('Black');
  });

  it('counts a product with two selected variants once in the step header', async () => {
    const { user } = renderApp();

    await user.click(increase(card('Wyze Cam Floodlight v2')));
    await user.click(within(card('Wyze Cam Floodlight v2')).getByRole('radio', { name: /black/i }));
    await user.click(increase(card('Wyze Cam Floodlight v2')));

    expect(stepHeader(/choose your cameras/i)).toHaveAccessibleName(/3 selected/);
  });

  it('does not add anything just by selecting a colour', async () => {
    const { user } = renderApp();

    await user.click(within(card('Wyze Battery Cam Pro')).getByRole('radio', { name: /black/i }));

    expect(reviewLine('Wyze Battery Cam Pro')).toBeNull();
  });
});

describe('accordion', () => {
  it('collapses the open step and expands another', async () => {
    const { user } = renderApp();

    await user.click(stepHeader(/choose your cameras/i));
    expect(stepHeader(/choose your cameras/i)).toHaveAttribute('aria-expanded', 'false');

    await user.click(stepHeader(/choose your sensors/i));
    expect(stepHeader(/choose your sensors/i)).toHaveAttribute('aria-expanded', 'true');
    expect(stepHeader(/choose your cameras/i)).toHaveAttribute('aria-expanded', 'false');
  });

  it('brings the opened step into view', async () => {
    const scrollIntoView = vi
      .spyOn(Element.prototype, 'scrollIntoView')
      .mockImplementation(() => {});
    vi.useFakeTimers({ shouldAdvanceTime: true });

    try {
      const { user } = renderApp();
      // Opening step 1 on arrival must not scroll the page.
      expect(scrollIntoView).not.toHaveBeenCalled();

      await user.click(stepHeader(/choose your plan/i));
      // The scroll waits for the collapse above to finish.
      await act(async () => {
        vi.advanceTimersByTime(300);
      });

      expect(scrollIntoView).toHaveBeenCalledTimes(1);
      expect(scrollIntoView.mock.instances[0]).toBe(document.getElementById('step-plan'));
    } finally {
      vi.useRealTimers();
      scrollIntoView.mockRestore();
    }
  });

  it('advances via the Next button', async () => {
    const { user } = renderApp();

    await user.click(screen.getByRole('button', { name: /next: choose your plan/i }));

    expect(stepHeader(/choose your plan/i)).toHaveAttribute('aria-expanded', 'true');
    expect(stepHeader(/choose your cameras/i)).toHaveAttribute('aria-expanded', 'false');
  });
});

describe('persistence', () => {
  it('restores the configuration after a reload', async () => {
    const { user, unmount } = renderApp();

    await user.click(increase(card('Wyze Cam v4')));
    await user.click(within(card('Wyze Cam Floodlight v2')).getByRole('radio', { name: /black/i }));
    await user.click(increase(card('Wyze Cam Floodlight v2')));
    await user.click(screen.getByRole('button', { name: /save my system for later/i }));

    unmount();
    renderApp();

    expect(quantityIn(card('Wyze Cam v4'), 'Wyze Cam v4, White')).toBe(2);
    // The active chip is restored too, so the stepper reads Black's count.
    expect(quantityIn(card('Wyze Cam Floodlight v2'), 'Wyze Cam Floodlight v2, Black')).toBe(1);
    expect(reviewLine('Wyze Cam Floodlight v2')).not.toBeNull();
  });

  it('still opens step 1 after restoring a system saved on another step', async () => {
    const { user, unmount } = renderApp();

    await user.click(stepHeader(/add extra protection/i));
    expect(stepHeader(/add extra protection/i)).toHaveAttribute('aria-expanded', 'true');
    await user.click(screen.getByRole('button', { name: /save my system for later/i }));

    unmount();
    renderApp();

    expect(stepHeader(/choose your cameras/i)).toHaveAttribute('aria-expanded', 'true');
    expect(stepHeader(/add extra protection/i)).toHaveAttribute('aria-expanded', 'false');
  });

  it('falls back to the seed when nothing was saved', async () => {
    const { user, unmount } = renderApp();

    await user.click(increase(card('Wyze Cam v4')));
    unmount();
    renderApp();

    expect(quantityIn(card('Wyze Cam v4'), 'Wyze Cam v4, White')).toBe(1);
  });

  it('ignores a corrupt saved bundle instead of crashing', () => {
    window.localStorage.setItem('wyze-bundle-builder:v1', '{ not json');
    renderApp();
    expect(quantityIn(card('Wyze Cam v4'), 'Wyze Cam v4, White')).toBe(1);
  });
});

describe('checkout', () => {
  it('confirms rather than navigating away', async () => {
    const { user } = renderApp();

    await user.click(within(reviewPanel()).getByRole('button', { name: /^checkout$/i }));

    expect(screen.getByRole('heading', { name: /your system is ready/i })).toBeInTheDocument();
    expect(screen.getByText(/isn.t wired up to a payment flow/i)).toBeInTheDocument();
  });
});
