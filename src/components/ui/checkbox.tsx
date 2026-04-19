import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * shadcn-style checkbox (custom paint, no Radix) — avoids native OS appearance while matching design tokens.
 */
const Checkbox = React.forwardRef<HTMLInputElement, Omit<React.ComponentProps<'input'>, 'type'>>(({ className, ...props }, ref) => (
  <span className={cn('relative inline-flex h-4 w-4 shrink-0 align-middle', className)}>
    <input type='checkbox' ref={ref} className='peer absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0' {...props} />
    <span
      className={cn(
        'pointer-events-none flex h-4 w-4 items-center justify-center rounded-sm border border-input bg-background shadow-sm',
        'peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background',
        'peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
        'peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground',
        'peer-checked:[&>svg]:opacity-100',
      )}
      aria-hidden
    >
      <Check strokeWidth={3} className='h-3 w-3 opacity-0 transition-opacity' />
    </span>
  </span>
));
Checkbox.displayName = 'Checkbox';

export { Checkbox };
