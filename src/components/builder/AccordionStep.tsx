import { useId } from 'react';
import { Button } from '@/components/primitives/Button';
import { Icon } from '@/components/primitives/Icon';
import { useBundle, useBundleDispatch, useStepCount } from '@/hooks/useBundle';
import { useInert } from '@/hooks/useInert';
import { stepDomId } from '@/hooks/useScrollToOpenStep';
import type { Step } from '@/types/catalog';
import { ProductGrid } from './ProductGrid';
import styles from './AccordionStep.module.css';

interface AccordionStepProps {
  step: Step;
  isOpen: boolean;
  totalSteps: number;
}

export function AccordionStep({ step, isOpen, totalSteps }: AccordionStepProps) {
  const { catalog } = useBundle();
  const dispatch = useBundleDispatch();
  const selectedCount = useStepCount(step.id);
  const panelId = useId();
  const headerId = useId();
  const panelRef = useInert<HTMLDivElement>(!isOpen);

  const products = catalog.products.filter((product) => product.stepId === step.id);
  const nextStep = catalog.steps.find((candidate) => candidate.index === step.index + 1);

  return (
    <section
      id={stepDomId(step.id)}
      className={[styles.step, isOpen ? styles.open : ''].filter(Boolean).join(' ')}
    >
      <p className={styles.eyebrow}>{`Step ${step.index} of ${totalSteps}`}</p>

      <h2>
        <button
          type="button"
          id={headerId}
          className={styles.headerRow}
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={() => dispatch({ type: 'toggleStep', stepId: step.id })}
        >
          <span className={styles.titleGroup}>
            <Icon name={step.icon} size={30} className={styles.stepIcon} />
            <span className={styles.title}>{step.title}</span>
          </span>

          <span className={styles.state}>
            {/* The design only shows the count on the expanded step. */}
            {isOpen && <span>{selectedCount} selected</span>}
            <Icon
              name="chevron"
              size={16}
              className={[styles.chevron, isOpen ? styles.chevronUp : ''].filter(Boolean).join(' ')}
            />
            <span className="visuallyHidden">
              {`, ${selectedCount} selected, ${isOpen ? 'expanded' : 'collapsed'}`}
            </span>
          </span>
        </button>
      </h2>

      <div className={styles.panelWrap}>
        <div className={styles.panel}>
          <div
            ref={panelRef}
            id={panelId}
            role="region"
            aria-labelledby={headerId}
            className={styles.panelInner}
          >
            <ProductGrid products={products} />

            {nextStep && (
              <div className={styles.nextRow}>
                <Button
                  variant="outline"
                  onClick={() => dispatch({ type: 'openStep', stepId: nextStep.id })}
                >
                  {step.nextLabel ?? `Next: ${nextStep.title}`}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
