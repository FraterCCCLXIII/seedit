import type { SVGAttributes } from 'react';
import { cn } from '@/lib/utils';

export type FeedNavLogoMarkProps = SVGAttributes<SVGSVGElement>;

/**
 * Seedit wordmark (pixel logotype). Uses `currentColor` for theme-aware fill.
 */
export function FeedNavLogoMark({ className, ...props }: FeedNavLogoMarkProps) {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 17 3.15' className={cn(className)} aria-hidden {...props}>
      <path
        fill='currentColor'
        d='M1.89,3.15H0v-.31h.31V.63h-.31v-.31h1.89v.31h.31v.95h-.31v.31h-.95v.95h.95v-.95h.63v.95h-.31v.31h-.31ZM1.26,1.58h.31v-.95h-.63v.95h.32Z'
      />
      <path fill='currentColor' d='M3.46,3.15h-.95v-.31h.32v-.95h-.32v-.31h.32v-.32h.63v1.58h.31v.31h-.31ZM3.15.95h-.31V.32h.63v.63h-.32Z' />
      <path fill='currentColor' d='M4.72,3.15h-.32v-.31h-.31v-1.26h-.32v-.32h.32v-.31h.31v-.32h.32v.63h.63v.32h-.63v1.26h.31v.31h-.31ZM5.04,2.83v-.32h.32v.32h-.32Z' />
      <path
        fill='currentColor'
        d='M5.35,3.15v-.94h.31v.31h.32v.32h.94v-.63h-.31v-.32h-.63v-.31h-.32v-.32h-.31v-.63h.31v-.31h.95v.31h.31v-.31h.32v.94h-.32v-.31h-.31v-.32h-.63v.63h.63v.32h.63v.31h.31v.95h-.31v.31h-1.26v-.31h-.32v.31h-.31Z'
      />
      <path
        fill='currentColor'
        d='M8.82,3.15h-.63v-.31h-.32v-.32h-.31v-.94h.31v-.32h.32v-.31h.94v.31h.32v.32h.31v.94h-.31v.32h-.32v.31h-.31ZM8.82,2.83v-.32h.31v-.94h-.31v-.32h-.32v.32h-.31v.94h.31v.32h.32Z'
      />
      <path
        fill='currentColor'
        d='M11.34,2.83h.31v.31h-1.57v-.31h-.32v-1.26h.32v-.32h.31v-.31h.95v.31h-.63v.32h-.32v.94h.32v.32h.63ZM11.65,1.89v-.31h-.31v-.32h.31v-.31h.31v.94h-.31ZM11.65,2.83v-.32h.31v.32h-.31ZM11.97,2.52v-.31h.32v.31h-.32Z'
      />
      <path fill='currentColor' d='M13.23,3.15h-.94v-.31h.31v-.95h-.31v-.31h.31v-.32h.63v1.58h.32v.31h-.32ZM12.91.95h-.32V.32h.63v.63h-.31Z' />
      <path
        fill='currentColor'
        d='M15.43,3.15h-.32v-.31h-.31v-.63h-.63v.63h.63v.31h-.95v-.31h-.31v-.63h.31v-.32h.95v-.63h-.63v-.31h.94v.31h.32v1.58h.31v.31h-.31ZM13.86,1.58v-.32h.32v.32h-.32Z'
      />
      <path fill='currentColor' d='M16.69,3.15h-.63V.63h-.31v-.31h.63v-.32h.31v2.83h.32v.31h-.32Z' />
    </svg>
  );
}
