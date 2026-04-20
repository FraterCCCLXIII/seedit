import type { ReactElement } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PixelIcon } from '@/components/ui/pixel-icon';
import { isAllView, isHomeView, isInboxView } from '../../lib/utils/view-utils';
import { cn } from '@/lib/utils';
import { useSubmitPostRoute } from '../../hooks/use-submit-post-route';
import useWindowWidth from '../../hooks/use-window-width';
import FeedNavAccountMenu from './FeedNavAccountMenu';
import { FeedNavLogoMark } from './feed-nav-logo-mark';
import { FeedNavRailTooltip } from './feed-nav-rail-tooltip';
import styles from './FeedNavRail.module.css';

/** Matches `FeedShellLayout.module.css` / `FeedNavRail.module.css` compact rail breakpoint. */
const COMPACT_RAIL_BREAKPOINT_PX = 900;

function withCompactTooltip(isCompact: boolean, label: string, node: ReactElement) {
  return (
    <FeedNavRailTooltip content={label} enabled={isCompact}>
      {node}
    </FeedNavRailTooltip>
  );
}

/**
 * Primary navigation for feed routes — left column, inspired by Primal / X desktop layout.
 */
const FeedNavRail = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { pathname } = location;
  const navigate = useNavigate();
  const { submitRoute } = useSubmitPostRoute();
  const isCompactRail = useWindowWidth() < COMPACT_RAIL_BREAKPOINT_PX;

  const homeOn = isHomeView(pathname);
  const allOn = isAllView(pathname);
  const commOn = pathname.startsWith('/communities');
  const inboxOn = isInboxView(pathname);
  const settingsOn = pathname.startsWith('/settings');

  const homeLabel = t('feed_nav_home');
  const allLabel = t('feed_nav_all');
  const commLabel = t('feed_nav_communities');
  const inboxLabel = t('feed_nav_inbox');
  const settingsLabel = t('feed_nav_settings');
  const newPostLabel = t('feed_nav_new_post', { defaultValue: 'New Post' });

  return (
    <nav className={styles.navShell} aria-label={t('feed_nav_aria')}>
      <div className={styles.navScroll}>
        <div className={styles.logoContainer}>
          {withCompactTooltip(
            isCompactRail,
            homeLabel,
            <Link to='/' className={styles.logoLink} aria-label={homeLabel}>
              <FeedNavLogoMark className={styles.logoMark} />
            </Link>,
          )}
        </div>
        {withCompactTooltip(
          isCompactRail,
          homeLabel,
          <Link to='/hot' className={cn(styles.navItem, homeOn && styles.navItemActive)} aria-current={homeOn ? 'page' : undefined}>
            <PixelIcon glyph='home' className={styles.navIcon} aria-hidden />
            <span className={styles.navLabel}>{homeLabel}</span>
          </Link>,
        )}
        {withCompactTooltip(
          isCompactRail,
          allLabel,
          <Link to='/s/all/hot' className={cn(styles.navItem, allOn && styles.navItemActive)} aria-current={allOn ? 'page' : undefined}>
            <PixelIcon glyph='globe' className={styles.navIcon} aria-hidden />
            <span className={styles.navLabel}>{allLabel}</span>
          </Link>,
        )}
        {withCompactTooltip(
          isCompactRail,
          commLabel,
          <Link to='/communities' className={cn(styles.navItem, commOn && styles.navItemActive)} aria-current={commOn ? 'page' : undefined}>
            <PixelIcon glyph='users' className={styles.navIcon} aria-hidden />
            <span className={styles.navLabel}>{commLabel}</span>
          </Link>,
        )}
        {withCompactTooltip(
          isCompactRail,
          inboxLabel,
          <Link to='/inbox' className={cn(styles.navItem, inboxOn && styles.navItemActive)} aria-current={inboxOn ? 'page' : undefined}>
            <PixelIcon glyph='envelope' className={styles.navIcon} aria-hidden />
            <span className={styles.navLabel}>{inboxLabel}</span>
          </Link>,
        )}
        {withCompactTooltip(
          isCompactRail,
          settingsLabel,
          <Link to='/settings' className={cn(styles.navItem, settingsOn && styles.navItemActive)} aria-current={settingsOn ? 'page' : undefined}>
            <PixelIcon glyph='cog' className={styles.navIcon} aria-hidden />
            <span className={styles.navLabel}>{settingsLabel}</span>
          </Link>,
        )}
        {withCompactTooltip(
          isCompactRail,
          newPostLabel,
          <button
            type='button'
            className={styles.submitPostButton}
            aria-label={newPostLabel}
            onClick={() => navigate(submitRoute, { state: { backgroundLocation: location } })}
          >
            <PixelIcon glyph='pencil' className={styles.submitPostIcon} aria-hidden />
            <span className={styles.navLabel}>{newPostLabel}</span>
          </button>,
        )}
      </div>
      <FeedNavAccountMenu isCompact={isCompactRail} />
    </nav>
  );
};

export default FeedNavRail;
