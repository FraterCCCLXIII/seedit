import { useEffect } from 'react';
import { Outlet, Route, Routes } from 'react-router-dom';
import { initializeNotificationSystem } from './lib/push';
import useTheme from './hooks/use-theme';
import { useAutoSubscribe } from './hooks/use-auto-subscribe';
import ChallengeModal from './components/challenge-modal';
import Header from './components/header';
import NotificationHandler from './components/notification-handler';
import StickyHeader from './components/sticky-header';
import { FeedShellLayout, FeedShellWithModalRoutes } from './components/layout';
import styles from './app.module.css';

initializeNotificationSystem();

const App = () => {
  useAutoSubscribe();

  const globalLayout = (
    <>
      <ChallengeModal />
      <NotificationHandler />
      <Outlet />
    </>
  );

  const feedLayout = (
    <FeedShellLayout stickyHeader={<StickyHeader />} header={<Header />}>
      <Outlet />
    </FeedShellLayout>
  );

  // add theme className to body so it can set the correct body background in index.css
  const [theme] = useTheme();
  useEffect(() => {
    document.body.classList.forEach((className) => document.body.classList.remove(className));
    document.body.classList.add(theme);
  }, [theme]);

  return (
    <div className={`${styles.app} ${theme}`}>
      <div className='asset-preloader'>
        <div className='asset-preloader-seedit-text-light'></div>
        <div className='asset-preloader-seedit-text-dark'></div>
        <div className='asset-preloader-delete-button-hover'></div>
        <div className='asset-preloader-close-x-button-large-hover'></div>
        <div className='asset-preloader-play-button-hover'></div>
        <div className='asset-preloader-text-button-hover'></div>
        <div className='asset-preloader-button-large-hover-dark'></div>
        <div className='asset-preloader-button-large-hover'></div>
        <div className='asset-preloader-button-large-nub-hover-dark'></div>
        <div className='asset-preloader-button-large-nub-hover'></div>
        <div className='asset-preloader-close-button-hover'></div>
        <div className='asset-preloader-arrow-upvoted'></div>
        <div className='asset-preloader-arrow-downvoted'></div>
      </div>

      <Routes>
        <Route element={globalLayout}>
          <Route element={feedLayout}>
            <Route path='/*' element={<FeedShellWithModalRoutes />} />
          </Route>
        </Route>
      </Routes>
    </div>
  );
};

export default App;
