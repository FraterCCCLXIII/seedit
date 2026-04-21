import { useId } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import styles from './settings-nav.module.css';

/**
 * Vertical settings navigation (replaces top tab row on /settings routes).
 */
export function SettingsNav() {
  const { t } = useTranslation();
  const titleId = useId();
  const settingsLabel = t('feed_nav_settings', { defaultValue: 'Settings' });

  return (
    <div className={styles.column}>
      <div className={styles.stickyBlock}>
        <h1 id={titleId} className={styles.title}>
          {settingsLabel}
        </h1>
        <nav className={styles.root} aria-labelledby={titleId}>
          <ul className={styles.list}>
            <li>
              <NavLink to='/settings' end className={({ isActive }) => cn(styles.link, isActive && styles.linkActive)}>
                {t('general')}
              </NavLink>
            </li>
            <li>
              <NavLink to='/settings/content-options' className={({ isActive }) => cn(styles.link, isActive && styles.linkActive)}>
                {t('content_options')}
              </NavLink>
            </li>
            <li>
              <NavLink to='/settings/plebbit-options' className={({ isActive }) => cn(styles.link, isActive && styles.linkActive)}>
                {t('plebbit_options')}
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
