import { useBundle } from '@/hooks/useBundle';
import { useScrollToOpenStep } from '@/hooks/useScrollToOpenStep';
import { AccordionStep } from './AccordionStep';
import styles from './BundleBuilder.module.css';

export function BundleBuilder() {
  const { catalog, state } = useBundle();

  // Expanding a step brings it into view — see the hook for why.
  useScrollToOpenStep(state.openStepId);

  return (
    <div className={styles.builder}>
      {catalog.steps.map((step) => (
        <AccordionStep
          key={step.id}
          step={step}
          isOpen={state.openStepId === step.id}
          totalSteps={catalog.steps.length}
        />
      ))}
    </div>
  );
}
