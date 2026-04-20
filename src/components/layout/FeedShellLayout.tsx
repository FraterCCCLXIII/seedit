import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import FeedNavRail from './FeedNavRail';
import styles from './FeedShellLayout.module.css';

export type FeedShellLayoutProps = {
  /** TopBar + AccountBar — hidden on desktop so the fixed left rail can span full height (Primal-style). */
  stickyHeader: ReactNode;
  header: ReactNode;
  children: ReactNode;
};

/**
 * Primal-style shell: left nav stays in the first grid column (`position: sticky`) so it cannot
 * overlap the feed; `.app` uses `overflow-y: visible` so window scroll + sticky work together.
 */
const FeedShellLayout = ({ stickyHeader, header, children }: FeedShellLayoutProps) => {
  return (
    <div className={styles.shell} data-feed-shell-layout>
      <div className={styles.leftRailColumn}>
        <aside className={styles.leftRailSticky}>
          <FeedNavRail />
        </aside>
      </div>
      <div className={styles.center}>
        <div className={cn(styles.centerInner, 'bg-background text-foreground')}>
          <div className={styles.stickyHeaderSlot}>{stickyHeader}</div>
          <div className={styles.mainGrid}>
            <div className={styles.headerArea}>{header}</div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedShellLayout;
