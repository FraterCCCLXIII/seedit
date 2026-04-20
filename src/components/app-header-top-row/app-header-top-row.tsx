import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import styles from './app-header-top-row.module.css';

export type AppHeaderTopRowProps = {
  children: ReactNode;
  className?: string;
};

/**
 * First row of the sticky app header: logo + page title (+ optional back control).
 * Horizontal padding uses `--header-chrome-pad-x` (themes.css; feed main column has no shell padding).
 * Single-line rows share one min-height via parent `.header`’s `--header-tab-row-height`.
 */
export function AppHeaderTopRow({ children, className }: AppHeaderTopRowProps) {
  return <div className={cn(styles.root, className)}>{children}</div>;
}
