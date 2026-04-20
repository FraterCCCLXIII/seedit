import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PixelIcon } from '@/components/ui/pixel-icon';
import { isAllView, isHomeView, isInboxView } from '../../lib/utils/view-utils';
import { cn } from '@/lib/utils';
import { useSubmitPostRoute } from '../../hooks/use-submit-post-route';
import FeedNavAccountMenu from './FeedNavAccountMenu';
import { FeedNavLogoMark } from './feed-nav-logo-mark';
import styles from './FeedNavRail.module.css';

/**
 * Primary navigation for feed routes — left column, inspired by Primal / X desktop layout.
 */
const FeedNavRail = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { pathname } = location;
  const navigate = useNavigate();
  const { submitRoute } = useSubmitPostRoute();

  const homeOn = isHomeView(pathname);
  const allOn = isAllView(pathname);
  const commOn = pathname.startsWith('/communities');
  const inboxOn = isInboxView(pathname);
  const settingsOn = pathname.startsWith('/settings');

  return (
    <nav className={styles.navShell} aria-label={t('feed_nav_aria')}>
      <div className={styles.navScroll}>
        <div className={styles.logoContainer}>
          <Link to='/' className={styles.logoLink} aria-label={t('feed_nav_home')}>
            <FeedNavLogoMark className={styles.logoMark} />
          </Link>
        </div>
        <Link to='/hot' className={cn(styles.navItem, homeOn && styles.navItemActive)} aria-current={homeOn ? 'page' : undefined}>
          <PixelIcon glyph='home' className={styles.navIcon} aria-hidden />
          <span>{t('feed_nav_home')}</span>
        </Link>
        <Link to='/s/all/hot' className={cn(styles.navItem, allOn && styles.navItemActive)} aria-current={allOn ? 'page' : undefined}>
          <PixelIcon glyph='globe' className={styles.navIcon} aria-hidden />
          <span>{t('feed_nav_all')}</span>
        </Link>
        <Link to='/communities' className={cn(styles.navItem, commOn && styles.navItemActive)} aria-current={commOn ? 'page' : undefined}>
          <PixelIcon glyph='users' className={styles.navIcon} aria-hidden />
          <span>{t('feed_nav_communities')}</span>
        </Link>
        <Link to='/inbox' className={cn(styles.navItem, inboxOn && styles.navItemActive)} aria-current={inboxOn ? 'page' : undefined}>
          <PixelIcon glyph='envelope' className={styles.navIcon} aria-hidden />
          <span>{t('feed_nav_inbox')}</span>
        </Link>
        <Link to='/settings' className={cn(styles.navItem, settingsOn && styles.navItemActive)} aria-current={settingsOn ? 'page' : undefined}>
          <PixelIcon glyph='cog' className={styles.navIcon} aria-hidden />
          <span>{t('feed_nav_settings')}</span>
        </Link>
        <button
          type='button'
          className={styles.submitPostButton}
          onClick={() => navigate(submitRoute, { state: { backgroundLocation: location } })}
        >
          <PixelIcon glyph='pencil' className={styles.submitPostIcon} aria-hidden />
          <span>{t('feed_nav_new_post', { defaultValue: 'New Post' })}</span>
        </button>
      </div>
      <FeedNavAccountMenu />
    </nav>
  );
};

export default FeedNavRail;
