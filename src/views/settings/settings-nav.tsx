import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import styles from './settings-nav.module.css';

/**
 * Vertical settings navigation (replaces top tab row on /settings routes).
 */
export function SettingsNav() {
  const { t } = useTranslation();

  return (
    <nav className={styles.root} aria-label={t('preferences')}>
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
  );
}
