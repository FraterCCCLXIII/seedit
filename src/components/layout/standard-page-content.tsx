import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import styles from './standard-page-content.module.css';

export type StandardPageContentProps = {
  children: ReactNode;
  /**
   * full — default page padding (top/sides/bottom).
   * narrow — centered form column max-width.
   * feedColumn — feed lists: no top/side page inset (only shell `--feed-shell-main-pad-x` applies); keeps bottom padding.
   */
  variant?: 'full' | 'narrow' | 'feedColumn';
  /** Add vertical stack gap between direct children (flex flex-col gap-4) */
  stack?: boolean;
  className?: string;
};

export function StandardPageContent({ children, variant = 'full', stack = false, className }: StandardPageContentProps) {
  return (
    <div
      className={cn(
        variant === 'feedColumn' ? styles.rootFeedColumn : styles.root,
        variant === 'narrow' && styles.narrow,
        stack && styles.stack,
        className,
      )}
    >
      {children}
    </div>
  );
}
