import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import AboutView from '../../views/about';
import UserAbout from '../../views/user-about/user-about';
import All from '../../views/all';
import Author from '../../views/author';
import Domain from '../../views/domain';
import Home from '../../views/home';
import Inbox from '../../views/inbox';
import Mod from '../../views/mod';
import NotFound from '../../views/not-found';
import SearchPage from '../../views/search/search';
import PostPage from '../../views/post-page';
import Profile from '../../views/profile';
import Settings from '../../views/settings';
import AccountDataEditor from '../../views/settings/account-data-editor';
import SubplebbitDataEditor from '../../views/subplebbit-settings/subplebbit-data-editor';
import Subplebbit from '../../views/subplebbit';
import SubplebbitSettings from '../../views/subplebbit-settings';
import Subplebbits from '../../views/subplebbits';
import SubmitModal from '../submit-modal/submit-modal';
import type { SubmitModalLocationState } from '../../lib/feed-shell-data';

/**
 * Renders feed routes; when navigating to submit with `state.backgroundLocation`, keeps the
 * underlying route visible and stacks the submit modal on top (second Routes).
 */
const FeedShellWithModalRoutes = () => {
  const location = useLocation();
  const state = location.state as SubmitModalLocationState | null;
  const backgroundLocation = state?.backgroundLocation;

  return (
    <>
      <Routes location={backgroundLocation ?? location}>
        <Route path='/inbox/*' element={<Inbox />} />

        <Route path='/settings' element={<Settings />} />
        <Route path='/settings/plebbit-options' element={<Settings />} />
        <Route path='/settings/content-options' element={<Settings />} />
        <Route path='/settings/account-data' element={<AccountDataEditor />} />

        <Route path='/communities/all' element={<Subplebbits />} />
        <Route path='/communities' element={<Subplebbits />} />
        <Route path='/communities/subscriber' element={<Navigate to='/communities' replace />} />
        <Route path='/communities/moderator' element={<Navigate to='/communities' replace />} />
        <Route path='/communities/admin' element={<Navigate to='/communities' replace />} />
        <Route path='/communities/owner' element={<Navigate to='/communities' replace />} />
        <Route path='/communities/vote' element={<Navigate to='/communities/all' replace />} />
        <Route path='/communities/vote/passing' element={<Navigate to='/communities/all' replace />} />
        <Route path='/communities/vote/rejecting' element={<Navigate to='/communities/all' replace />} />
        <Route path='/communities/create' element={<SubplebbitSettings />} />

        <Route path='/about' element={<AboutView />} />
        <Route path='/profile/about' element={<UserAbout />} />
        <Route path='/s/:subplebbitAddress/about' element={<AboutView />} />
        <Route path='/u/:authorAddress/c/:commentCid/about' element={<UserAbout />} />
        <Route path='/s/:subplebbitAddress/c/:commentCid/about' element={<AboutView />} />
        <Route path='/s/:subplebbitAddress/c/:commentCid' element={<PostPage />} />

        <Route path='/submit' element={<SubmitModal />} />
        <Route path='/s/:subplebbitAddress/submit' element={<SubmitModal />} />

        <Route path='/search' element={<SearchPage />} />

        {/* Before `/:sortType?/:timeFilterName?` — that pattern matches `/s/all` as sort=s time=all and breaks All/Mod tabs */}
        <Route path='/s/all/:sortType?/:timeFilterName?' element={<All />} />

        <Route path='/s/mod/:sortType?/:timeFilterName?' element={<Mod />} />

        <Route path='/:sortType?/:timeFilterName?' element={<Home />} />

        <Route path='/s/:subplebbitAddress/settings/editor' element={<SubplebbitDataEditor />} />
        <Route path='/s/:subplebbitAddress/settings' element={<SubplebbitSettings />} />

        <Route path='/s/:subplebbitAddress/:sortType?/:timeFilterName?' element={<Subplebbit />} />

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
      </Routes>
      {backgroundLocation && (
        <Routes location={location}>
          <Route path='/submit' element={<SubmitModal />} />
          <Route path='/s/:subplebbitAddress/submit' element={<SubmitModal />} />
        </Routes>
      )}
    </>
  );
};

export default FeedShellWithModalRoutes;
