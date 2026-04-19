import * as React from 'react';
import { cn } from '@/lib/utils';

export type RadioProps = Omit<React.ComponentProps<'input'>, 'type'>;

const Radio = React.forwardRef<HTMLInputElement, RadioProps>(({ className, ...props }, ref) => (
  <input
    type='radio'
    ref={ref}
    className={cn(
      'h-4 w-4 shrink-0 border border-input text-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
      className,
    )}
    {...props}
  />
));
Radio.displayName = 'Radio';

export { Radio };
