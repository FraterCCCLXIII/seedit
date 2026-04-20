import * as React from 'react';
import { cn } from '@/lib/utils';
import styles from './select.module.css';

/**
 * Styled native `<select>` — single surface, monochrome focus ring (`--shadcn-ring`), 15px/500.
 * Chevron is CSS-only (no extra nodes). Option menus remain OS-native.
 */
const Select = React.forwardRef<HTMLSelectElement, React.ComponentProps<'select'>>(({ className, children, ...props }, ref) => {
  return (
    <select className={cn(styles.select, className)} ref={ref} {...props}>
      {children}
    </select>
  );
});
Select.displayName = 'Select';

export { Select };
