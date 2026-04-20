import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-control text-[15px] font-normal leading-5 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow-none hover:bg-primary/90',
        /** Join CTA — monochrome (matches New Post / `neutral`); transparent border aligns height with `following` */
        join: 'border border-transparent bg-foreground text-background shadow-none hover:bg-foreground/88 dark:bg-white dark:text-black dark:hover:bg-[hsl(0_0%_93%)]',
        /** Solid CTA without X blue — light: inverted fg/bg, dark: white bar + black label (matches feed New Post) */
        neutral:
          'border border-transparent bg-foreground text-background shadow-none hover:bg-foreground/88 dark:bg-white dark:text-black dark:hover:bg-[hsl(0_0%_93%)]',
        destructive: 'bg-destructive text-destructive-foreground shadow-none hover:bg-destructive/90',
        outline:
          'border border-input bg-transparent shadow-none text-foreground hover:bg-accent hover:text-accent-foreground',
        /** Subscribed / “Following”-style pill — docs/DESIGN.md secondary (outline) */
        following:
          'border border-border bg-transparent text-foreground shadow-none hover:border-muted-foreground/55 hover:bg-accent/45',
        secondary: 'bg-secondary text-secondary-foreground shadow-none hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'rounded-none font-normal text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 min-h-9 px-4 py-2',
        sm: 'h-8 min-h-8 px-3 text-xs',
        lg: 'h-[52px] min-h-[52px] px-8 text-[17px]',
        icon: 'h-9 w-9',
        /** Join / Leave — 36px primary per DESIGN.md; not composer `lg` (52px) */
        subscribeSm:
          'h-8 min-h-8 min-w-[4.25rem] px-3 py-0 !text-[13px] font-normal !leading-4 shadow-none',
        subscribe: 'h-9 min-h-9 min-w-[5.25rem] px-4 py-0 !text-[15px] font-normal !leading-5 shadow-none',
        subscribeLg: 'h-9 min-h-9 min-w-[6.75rem] px-5 py-0 !text-[15px] font-normal !leading-5 shadow-none',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button';
  return <Comp className={cn(buttonVariants({ variant, size }), className)} ref={ref} {...props} />;
});
Button.displayName = 'Button';

export { Button, buttonVariants };
