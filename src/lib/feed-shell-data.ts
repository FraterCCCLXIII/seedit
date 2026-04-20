import type { Location } from 'react-router-dom';

/** Markers for FeedShellLayout CSS grid: header only over the feed column; sidebar full height in column 2 */
export const feedShellMainProps = { 'data-feed-shell': 'main' } as const;
export const feedShellSidebarProps = { 'data-feed-shell': 'sidebar' } as const;

/** Pass when navigating to `/submit` so the feed route stays mounted behind the modal (see FeedShellWithModalRoutes). */
export type SubmitModalLocationState = { backgroundLocation?: Location };
