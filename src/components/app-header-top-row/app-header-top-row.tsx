import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import styles from './app-header-top-row.module.css';

export type AppHeaderTopRowProps = {
  children: ReactNode;
  className?: string;
};

/**
 * First row of the sticky app header: logo + page title (+ optional back control).
 * Horizontal padding uses `--header-pad-x` (themes.css, aligned with `--feed-shell-main-pad-x`).
 * Single-line rows share one min-height via parent `.header`’s `--header-tab-row-height`.
 */
export function AppHeaderTopRow({ children, className }: AppHeaderTopRowProps) {
  return <div className={cn(styles.root, className)}>{children}</div>;
}
