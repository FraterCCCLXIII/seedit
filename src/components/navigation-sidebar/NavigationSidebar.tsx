import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './NavigationSidebar.module.css';

const NavigationSidebar = () => {
  const location = useLocation();
  const isInHomeView = location.pathname === '/' || location.pathname === '';

  return (
    <div className={styles.sidebar}>
      {/* Logo */}
      <div className={styles.logo}>
        <h1>Plebbit</h1>
      </div>

      {/* Navigation Items */}
      <div className={styles.navigation}>
        <Link to='/' className={`${styles.navItem} ${isInHomeView ? styles.navItemActive : ''}`}>
          <span className={styles.navIcon}>🏠</span>
          <span className={styles.navText}>Home</span>
        </Link>
        <Link to='/inbox' className={`${styles.navItem} ${location.pathname.startsWith('/inbox') ? styles.navItemActive : ''}`}>
          <span className={styles.navIcon}>📨</span>
          <span className={styles.navText}>Inbox</span>
        </Link>
        <Link to='/settings' className={`${styles.navItem} ${location.pathname.startsWith('/settings') ? styles.navItemActive : ''}`}>
          <span className={styles.navIcon}>⚙️</span>
          <span className={styles.navText}>Settings</span>
        </Link>
      </div>

      {/* User Profile Section */}
      <div className={styles.userProfile}>{/* User profile will be added here */}</div>
    </div>
  );
};

export default NavigationSidebar;
