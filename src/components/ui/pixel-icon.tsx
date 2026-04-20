import type { ComponentProps } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Check,
  ChevronDown,
  MessageCircle,
  Settings,
  Mail,
  Globe,
  Home,
  Pencil,
  Search,
  Share2,
  X,
  Trash2,
  User,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const GLYPH_ICONS = {
  'arrow-down': ArrowDown,
  'arrow-left': ArrowLeft,
  'arrow-up': ArrowUp,
  check: Check,
  'chevron-down': ChevronDown,
  'comment-dots': MessageCircle,
  cog: Settings,
  envelope: Mail,
  globe: Globe,
  home: Home,
  pencil: Pencil,
  search: Search,
  share: Share2,
  times: X,
  trash: Trash2,
  user: User,
  users: Users,
} as const;

export type PixelIconGlyph = keyof typeof GLYPH_ICONS;

type GlyphIconProps = ComponentProps<(typeof GLYPH_ICONS)[PixelIconGlyph]>;

export type PixelIconProps = { glyph: PixelIconGlyph } & GlyphIconProps;

/**
 * Renders a Lucide icon. The `PixelIcon` name is legacy; prefer importing from `lucide-react` in new code.
 */
export function PixelIcon({ glyph, className, strokeWidth = 2, ...rest }: PixelIconProps) {
  const Icon = GLYPH_ICONS[glyph];
  return <Icon className={cn('shrink-0', className)} strokeWidth={strokeWidth} {...rest} />;
}
