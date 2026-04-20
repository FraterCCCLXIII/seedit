import type { SVGAttributes } from 'react';
import { cn } from '@/lib/utils';

export type FeedNavLogoMarkProps = SVGAttributes<SVGSVGElement>;

/**
 * App mark (four-square grid). Uses `currentColor` for theme-aware fill.
 */
export function FeedNavLogoMark({ className, ...props }: FeedNavLogoMarkProps) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 3.89 3.89'
      className={cn(className)}
      aria-hidden
      {...props}
    >
      <rect fill='currentColor' y='1.3' width='1.3' height='1.3' />
      <rect fill='currentColor' x='1.3' y='2.6' width='1.3' height='1.3' />
      <rect fill='currentColor' x='1.3' width='1.3' height='1.3' />
      <rect fill='currentColor' x='2.6' y='1.3' width='1.3' height='1.3' />
    </svg>
  );
}
