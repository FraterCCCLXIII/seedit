import React from 'react';
import { Outlet } from 'react-router-dom';
import NavigationSidebar from '../navigation-sidebar/NavigationSidebar';
import RightColumn from '../right-column/RightColumn';
import styles from './ThreeColumnLayout.module.css';

const ThreeColumnLayout = () => {
  return (
    <div className={styles.layout}>
      {/* Left Column - Navigation */}
      <div className={styles.leftColumn}>
        <NavigationSidebar />
      </div>

      {/* Center Column - Main Content */}
      <div className={styles.centerColumn}>
        <Outlet />
      </div>

      {/* Right Column - Community Info */}
      <div className={styles.rightColumn}>
        <RightColumn />
      </div>
    </div>
  );
};

export default ThreeColumnLayout;
