import { BundleBuilder } from '@/components/builder/BundleBuilder';
import { MobileSummaryBar } from '@/components/layout/MobileSummaryBar';
import { ReviewPanel } from '@/components/review/ReviewPanel';
import { useCatalog } from '@/hooks/useCatalog';
import { BundleProvider } from '@/store/BundleProvider';
import type { Catalog } from '@/types/catalog';
import styles from './App.module.css';

const PANEL_ID = 'review-panel';

export default function App() {
  const catalogState = useCatalog();

  if (catalogState.status === 'loading') {
    return <p className={styles.status}>Loading your builder…</p>;
  }

  if (catalogState.status === 'error') {
    return <p className={styles.status}>Couldn&apos;t load the catalog: {catalogState.message}</p>;
  }

  return (
    <BundleProvider catalog={catalogState.catalog}>
      <BuilderPage catalog={catalogState.catalog} />
    </BundleProvider>
  );
}

function BuilderPage({ catalog }: { catalog: Catalog }) {
  return (
    <>
      <main className={styles.page}>
        <h1 className={styles.pageTitle}>{catalog.page.title}</h1>

        <div className={styles.layout}>
          <BundleBuilder />
          <div className={styles.panelColumn} id={PANEL_ID}>
            <ReviewPanel />
          </div>
        </div>
      </main>

      <MobileSummaryBar panelId={PANEL_ID} />
    </>
  );
}
