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
 * Primal-style shell: fixed left nav (persistent), bounded center column (~640px feed + sidebar).
 * Sticky nav fails under `.app { overflow-y: hidden }`, so the rail uses `position: fixed` + grid spacer.
 */
const FeedShellLayout = ({ stickyHeader, header, children }: FeedShellLayoutProps) => {
  return (
    <div className={styles.shell} data-feed-shell-layout>
      <div className={styles.leftRailColumn}>
        <div className={styles.leftRailSpacer} aria-hidden />
        <aside className={styles.leftRailFixed}>
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
