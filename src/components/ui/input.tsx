import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const inputVariants = cva(
  'flex w-full transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
  {
    variants: {
      variant: {
        default:
          'h-9 rounded-control border border-input bg-background px-3 py-1 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
        /** Single segment inside a bordered group (search + button) — avoids stacking conflicting utilities */
        grouped:
          'h-9 min-h-9 flex-1 rounded-none border-0 bg-transparent px-3 py-2 text-sm text-foreground shadow-none ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface InputProps extends React.ComponentProps<'input'>, VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, variant, ...props }, ref) => {
  return <input type={type} className={cn(inputVariants({ variant }), className)} ref={ref} {...props} />;
});
Input.displayName = 'Input';

export { Input };
