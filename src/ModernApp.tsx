import { useEffect } from 'react';
import { Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { initializeNotificationSystem } from './lib/push';
import useTheme from './hooks/use-theme';
import { useAutoSubscribe } from './hooks/use-auto-subscribe';
import { useAccount } from '@plebbit/plebbit-react-hooks';
import AboutView from './views/about';
import All from './views/all';
import Author from './views/author';
import Domain from './views/domain';
import Home from './views/home/ModernHomeWrapper';
import Inbox from './views/inbox';
import Mod from './views/mod';
import NotFound from './views/not-found';
import PostPage from './views/post-page';
import Profile from './views/profile';
import Settings from './views/settings';
import AccountDataEditor from './views/settings/account-data-editor';
import SubplebbitDataEditor from './views/subplebbit-settings/subplebbit-data-editor';
import SubmitPage from './views/submit-page';
import Subplebbit from './views/subplebbit';
import SubplebbitSettings from './views/subplebbit-settings';
import Subplebbits from './views/subplebbits';
import { Layout } from './components/ui/layout';
import { Sidebar } from './components/ui/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import ChallengeModal from './components/challenge-modal';
import NotificationHandler from './components/notification-handler';
import styles from './app.module.css';

initializeNotificationSystem();

// Navigation items for the modern sidebar
const navigation = [
  { name: 'Home', icon: () => <div>🏠</div>, current: true, href: '/' },
  { name: 'All', icon: () => <div>🌐</div>, current: false, href: '/p/all' },
  { name: 'Mod', icon: () => <div>🛡️</div>, current: false, href: '/p/mod' },
  { name: 'Communities', icon: () => <div>👥</div>, current: false, href: '/communities' },
  { name: 'Inbox', icon: () => <div>📨</div>, current: false, href: '/inbox' },
  { name: 'Profile', icon: () => <div>👤</div>, current: false, href: '/profile' },
  { name: 'Settings', icon: () => <div>⚙️</div>, current: false, href: '/settings' },
];

const ModernApp = () => {
  useAutoSubscribe();
  const account = useAccount();
  const location = useLocation();
  const navigate = useNavigate();

  // Update navigation based on current route
  const updatedNavigation = navigation.map((item) => ({
    ...item,
    current: location.pathname === item.href || (item.href === '/' && location.pathname === '/') || (item.href !== '/' && location.pathname.startsWith(item.href)),
  }));

  const user = {
    name: account?.author?.displayName || 'Anonymous',
    username: account?.author?.shortAddress || 'anon',
    avatarUrl: account?.author?.avatarUrl,
  };

  const handlePostClick = () => {
    navigate('/submit');
  };

  const rightSidebarContent = (
    <div className='space-y-4'>
      <Card>
        <CardHeader>
          <CardTitle>What's happening</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <div className='text-sm'>
              <div className='font-semibold'>#Decentralization</div>
              <div className='text-muted-foreground'>2.1K posts</div>
            </div>
            <div className='text-sm'>
              <div className='font-semibold'>#Web3</div>
              <div className='text-muted-foreground'>1.8K posts</div>
            </div>
            <div className='text-sm'>
              <div className='font-semibold'>#Plebbit</div>
              <div className='text-muted-foreground'>456 posts</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-2'>
            <button className='w-full text-left p-2 rounded hover:bg-muted transition-colors' onClick={() => navigate('/submit')}>
              📝 Submit Post
            </button>
            <button className='w-full text-left p-2 rounded hover:bg-muted transition-colors' onClick={() => navigate('/communities/create')}>
              ➕ Create Community
            </button>
            <button className='w-full text-left p-2 rounded hover:bg-muted transition-colors' onClick={() => navigate('/communities')}>
              🔍 Browse Communities
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const globalLayout = (
    <>
      <ChallengeModal />
      <NotificationHandler />
      <Layout
        navigation={updatedNavigation}
        user={user}
        onPostClick={handlePostClick}
        rightSidebarContent={rightSidebarContent}
        showSidebar={true}
        showRightSidebar={true}
      >
        <Outlet />
      </Layout>
    </>
  );

  const pagesLayout = (
    <>
      <ChallengeModal />
      <NotificationHandler />
      <Layout navigation={updatedNavigation} user={user} onPostClick={handlePostClick} showSidebar={true} showRightSidebar={false}>
        <Outlet />
      </Layout>
    </>
  );

  const feedLayout = (
    <>
      <ChallengeModal />
      <NotificationHandler />
      <Layout
        navigation={updatedNavigation}
        user={user}
        onPostClick={handlePostClick}
        rightSidebarContent={rightSidebarContent}
        showSidebar={true}
        showRightSidebar={true}
      >
        <Outlet />
      </Layout>
    </>
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
        <div className='asset-preloader-all-feed-subscribe-hover'></div>
        <div className='asset-preloader-arrow-upvoted'></div>
        <div className='asset-preloader-arrow-downvoted'></div>
      </div>

      <Routes>
        <Route element={globalLayout}>
          <Route element={pagesLayout}>
            <Route path='/about' element={<AboutView />} />
            <Route path='/submit' element={<SubmitPage />} />

            <Route path='/p/:subplebbitAddress/c/:commentCid' element={<PostPage />} />
            <Route path='/p/:subplebbitAddress/c/:commentCid/about' element={<AboutView />} />

            <Route path='/p/:subplebbitAddress/submit' element={<SubmitPage />} />
            <Route path='/p/:subplebbitAddress/about' element={<AboutView />} />

            <Route path='/settings' element={<Settings />} />
            <Route path='/p/:subplebbitAddress/settings' element={<SubplebbitSettings />} />
            <Route path='/p/:subplebbitAddress/settings/editor' element={<SubplebbitDataEditor />} />
            <Route path='/settings/plebbit-options' element={<Settings />} />
            <Route path='/settings/content-options' element={<Settings />} />
            <Route path='/settings/account-data' element={<AccountDataEditor />} />

            <Route path='/profile/about' element={<AboutView />} />

            <Route path='/u/:authorAddress/c/:commentCid/about' element={<AboutView />} />

            <Route path='/inbox' element={<Inbox />} />
            <Route path='/inbox/unread' element={<Inbox />} />
            <Route path='/inbox/commentreplies' element={<Inbox />} />
            <Route path='/inbox/postreplies' element={<Inbox />} />

            <Route path='/communities' element={<Subplebbits />} />
            <Route path='/communities/subscriber' element={<Subplebbits />} />
            <Route path='/communities/moderator' element={<Subplebbits />} />
            <Route path='/communities/admin' element={<Subplebbits />} />
            <Route path='/communities/owner' element={<Subplebbits />} />
            <Route path='/communities/vote' element={<Subplebbits />} />
            <Route path='/communities/vote/passing' element={<Subplebbits />} />
            <Route path='/communities/vote/rejecting' element={<Subplebbits />} />
            <Route path='/communities/create' element={<SubplebbitSettings />} />
          </Route>
          <Route element={feedLayout}>
            <Route path='/:sortType?/:timeFilterName?' element={<Home />} />

            <Route path='/p/all/:sortType?/:timeFilterName?' element={<All />} />

            <Route path='/p/mod/:sortType?/:timeFilterName?' element={<Mod />} />

            <Route path='/p/:subplebbitAddress/:sortType?/:timeFilterName?' element={<Subplebbit />} />

            <Route path='/domain/:domain/:sortType?/:timeFilterName?' element={<Domain />} />

            <Route path='/profile/:accountCommentIndex' element={<PostPage />} />

            <Route path='/profile' element={<Profile />}>
              <Route index element={<Profile.Overview />} />
              <Route path='upvoted' element={<Profile.VotedComments voteType={1} />} />
              <Route path='downvoted' element={<Profile.VotedComments voteType={-1} />} />
              <Route path='hidden' element={<Profile.HiddenComments />} />
              <Route path='comments' element={<Profile.Comments />} />
              <Route path='submitted' element={<Profile.Submitted />} />
            </Route>

            <Route path='/u/:authorAddress/c/:commentCid?/:sortType?/:timeFilterName?' element={<Author />} />
            <Route path='/u/:authorAddress/c/:commentCid?/comments/:sortType?/:timeFilterName?' element={<Author />} />
            <Route path='/u/:authorAddress/c/:commentCid?/submitted/:sortType?/:timeFilterName?' element={<Author />} />

            <Route path='*' element={<NotFound />} />
            <Route path='/not-found' element={<NotFound />} />
          </Route>
        </Route>
      </Routes>
    </div>
  );
};

export default ModernApp;
