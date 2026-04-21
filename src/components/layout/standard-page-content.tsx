import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import styles from './standard-page-content.module.css';

export type StandardPageContentProps = {
  children: ReactNode;
  /**
   * full — default page padding (top/sides/bottom).
   * narrow — centered form column max-width.
   * feedColumn — feed lists: `[data-feed-shell='main']` has no horizontal shell padding; keeps bottom padding.
   * flush — no padding; use when child regions set insets (e.g. settings nav vs main).
   */
  variant?: 'full' | 'narrow' | 'feedColumn' | 'flush';
  /** Add vertical stack gap between direct children (flex flex-col gap-4) */
  stack?: boolean;
  className?: string;
};

export function StandardPageContent({ children, variant = 'full', stack = false, className }: StandardPageContentProps) {
  return (
    <div
      className={cn(
        variant === 'feedColumn' ? styles.rootFeedColumn : variant === 'flush' ? styles.rootFlush : styles.root,
        variant === 'narrow' && styles.narrow,
        stack && styles.stack,
        className,
      )}
    >
      {children}
    </div>
  );
}
