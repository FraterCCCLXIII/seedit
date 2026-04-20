import * as React from 'react';
import { cn } from '@/lib/utils';
import { PixelIcon } from '@/components/ui/pixel-icon';

/**
 * Custom checkbox (no Radix): square with 2px corners, monochrome checked state (foreground fill + background check).
 */
const Checkbox = React.forwardRef<HTMLInputElement, Omit<React.ComponentProps<'input'>, 'type'>>(({ className, ...props }, ref) => (
  <span className={cn('relative inline-flex h-4 w-4 shrink-0 align-middle', className)}>
    <input type='checkbox' ref={ref} className='peer absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0' {...props} />
    <span
      className={cn(
        'pointer-events-none flex h-4 w-4 items-center justify-center rounded-[2px] border border-border bg-background shadow-sm',
        'peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background',
        'peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
        'peer-checked:border-foreground peer-checked:bg-foreground peer-checked:text-background',
        'peer-checked:[&>i]:opacity-100',
      )}
      aria-hidden
    >
      <PixelIcon glyph='check' className='text-xs opacity-0 transition-opacity' />
    </span>
  </span>
));
Checkbox.displayName = 'Checkbox';

export { Checkbox };
