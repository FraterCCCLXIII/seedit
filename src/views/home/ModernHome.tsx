import { useEffect, useRef, useState, useMemo, useCallback, startTransition } from 'react';
import { Link, useNavigate, useParams, useSearchParams, useLocation } from 'react-router-dom';
import { Virtuoso, VirtuosoHandle, StateSnapshot } from 'react-virtuoso';
import { useAccount, useFeed, Comment } from '@plebbit/plebbit-react-hooks';
import { Trans, useTranslation } from 'react-i18next';
import { commentMatchesPattern } from '../../lib/utils/pattern-utils';
import useFeedFiltersStore from '../../stores/use-feed-filters-store';
import { useAutoSubscribeStore } from '../../stores/use-auto-subscribe-store';
import useTimeFilter, { isValidTimeFilterName } from '../../hooks/use-time-filter';
import useRedirectToDefaultSort from '../../hooks/use-redirect-to-default-sort';
import { Layout } from '../../components/ui/layout';
import { Feed } from '../../components/ui/feed';
import { Post as ModernPost } from '../../components/ui/post';
import { Sidebar } from '../../components/ui/sidebar';
import { sortTypes } from '../../constants/sort-types';
import { cn } from '../../lib/utils';

const lastVirtuosoStates: { [key: string]: StateSnapshot } = {};

type SubscriptionState = 'loading' | 'noSubscriptions' | 'hasSubscriptions';

// Convert Plebbit comment to modern post format
const convertCommentToPost = (comment: Comment) => {
  const author = comment.author?.displayName || comment.author?.shortAddress || 'Anonymous';
  const username = comment.author?.shortAddress || 'anon';
  const time = new Date(comment.timestamp).toLocaleDateString();
  const content = comment.content || '';
  const likes = comment.upvoteCount || 0;
  const reposts = 0; // Plebbit doesn't have reposts
  const replies = comment.replyCount || 0;

  return {
    author,
    username,
    time,
    content,
    likes,
    reposts,
    replies,
    isLiked: false, // TODO: Implement like state
    isReposted: false,
    avatarUrl: comment.author?.avatarUrl,
  };
};

const ModernHome = () => {
  const { t } = useTranslation();
  const account = useAccount();
  const subplebbitAddresses = useMemo(() => account?.subscriptions || [], [account?.subscriptions]);
  const { isCheckingAccount } = useAutoSubscribeStore();
  const accountAddress = account?.author?.address;
  const isCheckingSubscriptions = !accountAddress || isCheckingAccount(accountAddress);

  const params = useParams<{ sortType?: string; timeFilterName?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const navigate = useNavigate();
  const location = useLocation();

  const sortType = params?.sortType && sortTypes.includes(params.sortType) ? params.sortType : sortTypes[0];

  useRedirectToDefaultSort();

  useEffect(() => {
    if ((params?.sortType && !sortTypes.includes(params.sortType)) || (params.timeFilterName && !isValidTimeFilterName(params.timeFilterName))) {
      navigate('/not-found', { replace: true });
    }
  }, [params?.sortType, params.timeFilterName, navigate]);

  const { timeFilterName, timeFilterSeconds, sessionKey, timeFilterNames } = useTimeFilter();

  useEffect(() => {
    if (!params.timeFilterName && !searchQuery && sessionKey) {
      const sessionPreference = sessionStorage.getItem(sessionKey);
      if (sessionPreference && timeFilterNames.includes(sessionPreference)) {
        navigate(`/${sortType}/${sessionPreference}`, { replace: true });
      }
    }
  }, [params.timeFilterName, searchQuery, sessionKey, timeFilterNames, sortType, navigate]);

  const { feedFilters, setFeedFilters } = useFeedFiltersStore();
  const { hideBlockedUsers, hideDownvotedPosts, hideHiddenPosts, hideReadPosts, hideReportedPosts } = feedFilters;

  const feedOptions = useMemo(
    () => ({
      subplebbitAddresses,
      sortType,
      timeFilter: timeFilterSeconds,
      ...(searchQuery && { searchQuery }),
    }),
    [subplebbitAddresses, sortType, timeFilterSeconds, searchQuery],
  );

  const { comments, hasMore, loadMore, loading, error } = useFeed(feedOptions);

  const virtuosoRef = useRef<VirtuosoHandle>(null);

  const [subscriptionState, setSubscriptionState] = useState<SubscriptionState>('loading');

  useEffect(() => {
    if (isCheckingSubscriptions) {
      setSubscriptionState('loading');
    } else if (subplebbitAddresses.length === 0) {
      setSubscriptionState('noSubscriptions');
    } else {
      setSubscriptionState('hasSubscriptions');
    }
  }, [isCheckingSubscriptions, subplebbitAddresses.length]);

  const filteredComments = useMemo(() => {
    if (!comments) return [];
    return comments.filter((comment) => {
      if (hideBlockedUsers && comment.author?.address && account?.blockedAddresses?.includes(comment.author.address)) {
        return false;
      }
      if (hideDownvotedPosts && comment.vote === -1) {
        return false;
      }
      if (hideHiddenPosts && comment.hidden) {
        return false;
      }
      if (hideReadPosts && comment.read) {
        return false;
      }
      if (hideReportedPosts && comment.reported) {
        return false;
      }
      if (searchQuery && !commentMatchesPattern(comment, searchQuery)) {
        return false;
      }
      return true;
    });
  }, [comments, hideBlockedUsers, hideDownvotedPosts, hideHiddenPosts, hideReadPosts, hideReportedPosts, searchQuery, account?.blockedAddresses]);

  const loadMoreComments = useCallback(() => {
    if (hasMore && !loading) {
      startTransition(() => {
        loadMore();
      });
    }
  }, [hasMore, loading, loadMore]);

  const virtuosoStateKey = `${sortType}-${timeFilterName}-${searchQuery}`;

  const handleStateChange = useCallback(
    (state: StateSnapshot) => {
      lastVirtuosoStates[virtuosoStateKey] = state;
    },
    [virtuosoStateKey],
  );

  const handlePostClick = useCallback(() => {
    navigate('/submit');
  }, [navigate]);

  // Convert comments to modern post format
  const modernPosts = useMemo(() => {
    return filteredComments.map(convertCommentToPost);
  }, [filteredComments]);

  const navigation = [
    { name: 'Home', icon: () => <div>🏠</div>, current: true, href: '/' },
    { name: 'Explore', icon: () => <div>🔍</div>, current: false, href: '/explore' },
    { name: 'Notifications', icon: () => <div>🔔</div>, current: false, href: '/notifications' },
    { name: 'Messages', icon: () => <div>✉️</div>, current: false, href: '/messages' },
    { name: 'Bookmarks', icon: () => <div>🔖</div>, current: false, href: '/bookmarks' },
    { name: 'Profile', icon: () => <div>👤</div>, current: false, href: '/profile' },
    { name: 'Settings', icon: () => <div>⚙️</div>, current: false, href: '/settings' },
  ];

  const user = {
    name: account?.author?.displayName || 'Anonymous',
    username: account?.author?.shortAddress || 'anon',
    avatarUrl: account?.author?.avatarUrl,
  };

  if (subscriptionState === 'loading') {
    return (
      <Layout navigation={navigation} user={user} onPostClick={handlePostClick}>
        <div className='flex items-center justify-center h-64'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4'></div>
            <p className='text-muted-foreground'>Loading feed...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (subscriptionState === 'noSubscriptions') {
    return (
      <Layout navigation={navigation} user={user} onPostClick={handlePostClick}>
        <div className='flex items-center justify-center h-64'>
          <div className='text-center'>
            <h2 className='text-xl font-semibold mb-2'>No subscriptions yet</h2>
            <p className='text-muted-foreground mb-4'>Subscribe to communities to see posts in your feed</p>
            <button className='modern-button modern-button-primary' onClick={() => navigate('/communities')}>
              Browse Communities
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout navigation={navigation} user={user} onPostClick={handlePostClick}>
        <div className='flex items-center justify-center h-64'>
          <div className='text-center'>
            <h2 className='text-xl font-semibold mb-2'>Error loading feed</h2>
            <p className='text-muted-foreground mb-4'>{error.message}</p>
            <button className='modern-button modern-button-primary' onClick={() => window.location.reload()}>
              Retry
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout navigation={navigation} user={user} onPostClick={handlePostClick}>
      <div className='min-h-screen'>
        {/* Header */}
        <div className='sticky top-0 z-10 border-b border-twitter-border bg-background/80 backdrop-blur-md px-4 py-3'>
          <h1 className='text-xl font-bold text-foreground'>Home</h1>
        </div>

        {/* Posts */}
        <div>
          {modernPosts.map((post, index) => (
            <ModernPost key={index} {...post} />
          ))}
        </div>

        {/* Load more indicator */}
        {loading && (
          <div className='flex items-center justify-center py-8'>
            <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-primary'></div>
          </div>
        )}

        {/* End of feed */}
        {!hasMore && modernPosts.length > 0 && <div className='text-center py-8 text-muted-foreground'>You've reached the end of your feed</div>}
      </div>
    </Layout>
  );
};

export default ModernHome;
