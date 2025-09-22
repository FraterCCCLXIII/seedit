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
import { Post as ModernPost } from '../../components/ui/post';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { sortTypes } from '../../constants/sort-types';
import { cn } from '../../lib/utils';
import styles from './home.module.css';

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

const ModernHomeWrapper = () => {
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

  // Convert comments to modern post format
  const modernPosts = useMemo(() => {
    return filteredComments.map(convertCommentToPost);
  }, [filteredComments]);

  if (subscriptionState === 'loading') {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4'></div>
          <p className='text-muted-foreground'>Loading feed...</p>
        </div>
      </div>
    );
  }

  if (subscriptionState === 'noSubscriptions') {
    return (
      <div className='flex items-center justify-center h-64'>
        <Card className='max-w-md'>
          <CardHeader>
            <CardTitle>No subscriptions yet</CardTitle>
            <CardDescription>Subscribe to communities to see posts in your feed</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className='w-full' onClick={() => navigate('/communities')}>
              Browse Communities
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex items-center justify-center h-64'>
        <Card className='max-w-md'>
          <CardHeader>
            <CardTitle>Error loading feed</CardTitle>
            <CardDescription>{error.message}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className='w-full' onClick={() => window.location.reload()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='min-h-screen'>
      {/* Header */}
      <div className='sticky top-0 z-10 border-b border-twitter-border bg-background/80 backdrop-blur-md px-4 py-3'>
        <h1 className='text-xl font-bold text-foreground'>Home</h1>
        {searchQuery && <p className='text-sm text-muted-foreground'>Search results for: "{searchQuery}"</p>}
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

      {/* No posts message */}
      {modernPosts.length === 0 && !loading && <div className='text-center py-8 text-muted-foreground'>No posts to show</div>}
    </div>
  );
};

export default ModernHomeWrapper;
