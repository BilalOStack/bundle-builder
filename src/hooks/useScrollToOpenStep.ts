import { useEffect, useRef } from 'react';
import type { StepId } from '@/types/catalog';

export function stepDomId(stepId: StepId) {
  return `step-${stepId}`;
}

/** Matches --t-base in tokens.css, plus a frame of headroom. */
const PANEL_TRANSITION_MS = 220;

/**
 * Brings the newly opened step into view.
 *
 * Without this, expanding a later step is disorienting: the previously open
 * step collapses above it, the page loses that height, and the content the
 * shopper was looking at lurches upward — click "Choose your plan" and you
 * land somewhere around steps 3 and 4.
 *
 * The scroll waits for the collapse to finish, because until it does the
 * target's final offset isn't known and the page lands short.
 */
export function useScrollToOpenStep(openStepId: StepId | null) {
  const isInitialRender = useRef(true);

  useEffect(() => {
    // Step 1 is open on arrival; that shouldn't scroll anything.
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }

    // Collapsing the open step leaves the page where it is.
    if (!openStepId) return;

    const section = document.getElementById(stepDomId(openStepId));
    if (!section) return;

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

    const timer = window.setTimeout(
      () => {
        section.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      },
      reduceMotion ? 0 : PANEL_TRANSITION_MS,
    );

    return () => window.clearTimeout(timer);
  }, [openStepId]);
}
