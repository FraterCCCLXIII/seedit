import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import FeedNavRail from './FeedNavRail';
import { FeedShellLayoutProvider } from './feed-shell-layout-context';
import styles from './FeedShellLayout.module.css';

export type FeedShellLayoutProps = {
  /** Optional strip above `header` (e.g. legacy top chrome); omit when unused. */
  stickyHeader?: ReactNode;
  header: ReactNode;
  children: ReactNode;
};

/**
 * Primal-style shell: left nav stays in the first grid column (`position: sticky`) so it cannot
 * overlap the feed; `.app` uses `overflow-y: visible` so window scroll + sticky work together.
 */
const FeedShellLayout = ({ stickyHeader, header, children }: FeedShellLayoutProps) => {
  return (
    <FeedShellLayoutProvider value={true}>
      <div className={styles.shell} data-feed-shell-layout>
        <div className={styles.leftRailColumn}>
          <aside className={styles.leftRailSticky}>
            <FeedNavRail />
          </aside>
        </div>
        <div className={styles.center}>
          <div className={cn(styles.centerInner, 'bg-background text-foreground')}>
            {stickyHeader ? <div className={styles.stickyHeaderSlot}>{stickyHeader}</div> : null}
            <div className={styles.mainGrid}>
              <div className={styles.headerArea}>{header}</div>
              {children}
            </div>
          </div>
        </div>
      </div>
    </FeedShellLayoutProvider>
  );
};

export default FeedShellLayout;
