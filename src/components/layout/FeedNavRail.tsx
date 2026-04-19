import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Globe, Home, Inbox, Settings, Users } from 'lucide-react';
import { isAllView, isHomeView, isInboxView } from '../../lib/utils/view-utils';
import { cn } from '@/lib/utils';
import FeedNavAccountMenu from './FeedNavAccountMenu';
import styles from './FeedNavRail.module.css';

/**
 * Primary navigation for feed routes — left column, inspired by Primal / X desktop layout.
 */
const FeedNavRail = () => {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  const homeOn = isHomeView(pathname);
  const allOn = isAllView(pathname);
  const commOn = pathname.startsWith('/communities');
  const inboxOn = isInboxView(pathname);
  const settingsOn = pathname.startsWith('/settings');

  return (
    <nav className={styles.nav} aria-label={t('feed_nav_aria')}>
      <div className={styles.logoContainer}>
        <Link to='/' className={styles.logoLink}>
          <span className={styles.wordmark}>Commons</span>
        </Link>
      </div>
      <Link to='/hot' className={cn(styles.navItem, homeOn && styles.navItemActive)} aria-current={homeOn ? 'page' : undefined}>
        <Home className={styles.navIcon} aria-hidden strokeWidth={2} />
        <span>{t('feed_nav_home')}</span>
      </Link>
      <Link to='/s/all/hot' className={cn(styles.navItem, allOn && styles.navItemActive)} aria-current={allOn ? 'page' : undefined}>
        <Globe className={styles.navIcon} aria-hidden strokeWidth={2} />
        <span>{t('feed_nav_all')}</span>
      </Link>
      <Link to='/communities' className={cn(styles.navItem, commOn && styles.navItemActive)} aria-current={commOn ? 'page' : undefined}>
        <Users className={styles.navIcon} aria-hidden strokeWidth={2} />
        <span>{t('feed_nav_communities')}</span>
      </Link>
      <Link to='/inbox' className={cn(styles.navItem, inboxOn && styles.navItemActive)} aria-current={inboxOn ? 'page' : undefined}>
        <Inbox className={styles.navIcon} aria-hidden strokeWidth={2} />
        <span>{t('feed_nav_inbox')}</span>
      </Link>
      <Link to='/settings' className={cn(styles.navItem, settingsOn && styles.navItemActive)} aria-current={settingsOn ? 'page' : undefined}>
        <Settings className={styles.navIcon} aria-hidden strokeWidth={2} />
        <span>{t('feed_nav_settings')}</span>
      </Link>
      <FeedNavAccountMenu />
    </nav>
  );
};

export default FeedNavRail;
