import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * Glyph names map to classes from [@hackernoon/pixel-icon-library](https://github.com/hackernoon/pixel-icon-library).
 * Requires `iconfont.css` (imported once in `src/index.tsx`).
 */
export const PIXEL_ICON_GLYPHS = {
  'arrow-down': 'hn-arrow-down',
  'arrow-left': 'hn-arrow-left',
  'arrow-up': 'hn-arrow-up',
  check: 'hn-check',
  'chevron-down': 'hn-chevron-down',
  'comment-dots': 'hn-comment-dots',
  cog: 'hn-cog',
  envelope: 'hn-envelope',
  globe: 'hn-globe',
  home: 'hn-home',
  pencil: 'hn-pencil',
  search: 'hn-search',
  times: 'hn-times',
  trash: 'hn-trash',
  user: 'hn-user',
  users: 'hn-users',
} as const;

export type PixelIconGlyph = keyof typeof PIXEL_ICON_GLYPHS;

export type PixelIconProps = {
  glyph: PixelIconGlyph;
} & ComponentPropsWithoutRef<'i'>;

export function PixelIcon({ glyph, className, ...rest }: PixelIconProps) {
  return <i className={cn('hn', PIXEL_ICON_GLYPHS[glyph], className)} {...rest} />;
}
