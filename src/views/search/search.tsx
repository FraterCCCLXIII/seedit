import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Virtuoso, VirtuosoHandle, StateSnapshot } from 'react-virtuoso';
import { useAccount, useFeed } from '@bitsocialnet/bitsocial-react-hooks';
import Plebbit from '@plebbit/plebbit-js';
import { commentMatchesPattern } from '../../lib/utils/pattern-utils';
import useFeedFiltersStore from '../../stores/use-feed-filters-store';
import { useDefaultSubplebbitAddresses } from '../../hooks/use-default-subplebbits';
import FeedFooter from '../../components/feed-footer';
import LoadingEllipsis from '../../components/loading-ellipsis';
import Post from '../../components/post';
import Sidebar from '../../components/sidebar';
import { sortTypes } from '../../constants/sort-types';
import { feedShellMainProps, feedShellSidebarProps } from '../../lib/feed-shell-data';
import { StandardPageContent } from '@/components/layout';
import { Button } from '@/components/ui/button';
import styles from '../home/home.module.css';

const VALID_TABS = ['posts', 'users', 'communities'] as const;
export type SearchTab = (typeof VALID_TABS)[number];

const lastVirtuosoStates: { [key: string]: StateSnapshot } = {};

function SearchPostsPanel({ searchQuery }: { searchQuery: string }) {
  const { t } = useTranslation();
  const [, setSearchParams] = useSearchParams();
  const subplebbitAddresses = useDefaultSubplebbitAddresses();
  const sortType = sortTypes[0];
  const { isSearching } = useFeedFiltersStore();
  const [showNoResults, setShowNoResults] = useState(false);
  const [searchAttemptCompleted, setSearchAttemptCompleted] = useState(false);

  const feedOptions = useMemo(() => {
    const options: any = {
      newerThan: 0,
      sortType,
      subplebbitAddresses,
      filter: {
        filter: (comment: any) => {
          if (!searchQuery.trim()) return true;
          return commentMatchesPattern(comment, searchQuery);
        },
        key: `search-filter-${searchQuery}`,
      },
    };
    return options;
  }, [subplebbitAddresses, sortType, searchQuery]);

  const { feed, hasMore, loadMore, reset, subplebbitAddressesWithNewerPosts } = useFeed(feedOptions);

  const onClearSearch = useCallback(() => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('q');
      return next;
    });
    reset();
  }, [setSearchParams, reset]);

  useEffect(() => {
    setShowNoResults(false);
    setSearchAttemptCompleted(false);
  }, [searchQuery]);

  useEffect(() => {
    if (searchQuery && !isSearching && !searchAttemptCompleted) {
      setSearchAttemptCompleted(true);
    }
  }, [searchQuery, isSearching, searchAttemptCompleted]);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (searchQuery && feed?.length === 0 && searchAttemptCompleted) {
      timer = setTimeout(() => {
        setShowNoResults(true);
      }, 1500);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [searchQuery, feed?.length, searchAttemptCompleted]);

  const {
    feed: weeklyFeed,
    hasMore: hasMoreWeekly,
    loadMore: loadMoreWeekly,
  } = useFeed({
    subplebbitAddresses,
    sortType,
    newerThan: 60 * 60 * 24 * 7,
  });
  const {
    feed: monthlyFeed,
    hasMore: hasMoreMonthly,
    loadMore: loadMoreMonthly,
  } = useFeed({
    subplebbitAddresses,
    sortType,
    newerThan: 60 * 60 * 24 * 30,
  });
  const {
    feed: yearlyFeed,
    hasMore: hasMoreYearly,
    loadMore: loadMoreYearly,
  } = useFeed({
    subplebbitAddresses,
    sortType,
    newerThan: 60 * 60 * 24 * 365,
  });

  const combinedLoadMore = () => {
    loadMore();
    if (sortType !== 'top') {
      if (hasMoreWeekly) loadMoreWeekly();
      if (hasMoreMonthly) loadMoreMonthly();
      if (hasMoreYearly) loadMoreYearly();
    }
  };

  const virtuosoRef = useRef<VirtuosoHandle | null>(null);

  useEffect(() => {
    const setLastVirtuosoState = () => {
      virtuosoRef.current?.getState((snapshot: StateSnapshot) => {
        if (snapshot?.ranges?.length) {
          lastVirtuosoStates[`search-${sortType}-all-${searchQuery}`] = snapshot;
        }
      });
    };
    window.addEventListener('scroll', setLastVirtuosoState);
    return () => window.removeEventListener('scroll', setLastVirtuosoState);
  }, [sortType, searchQuery]);

  const lastVirtuosoState = lastVirtuosoStates?.[`search-${sortType}-all-${searchQuery}`];

  const footerProps = {
    feedLength: feed?.length,
    hasFeedLoaded: !!feed,
    hasMore,
    subplebbitAddresses,
    subplebbitAddressesWithNewerPosts,
    weeklyFeedLength: weeklyFeed.length,
    monthlyFeedLength: monthlyFeed.length,
    yearlyFeedLength: yearlyFeed.length,
    currentTimeFilterName: 'all',
    reset,
    searchQuery,
    isSearching,
    showNoResults,
    onClearSearch,
  };

  if (isSearching) {
    return (
      <div className={styles.feed}>
        <div className={styles.footer}>
          <div className={styles.stateString}>
            <LoadingEllipsis string={t('searching')} />
          </div>
        </div>
      </div>
    );
  }

  if (showNoResults && searchQuery) {
    return (
      <div className={styles.feed}>
        <div className={styles.footer}>
          <div className={styles.stateString}>
            <span className={styles.noMatchesFound}>{t('no_matches_found_for', { query: searchQuery })}</span>
            <br />
            <br />
            <div className={styles.morePostsSuggestion}>
              <span className={styles.link} onClick={onClearSearch}>
                {t('clear_search')}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.feed}>
      <Virtuoso
        increaseViewportBy={{ bottom: 1200, top: 600 }}
        totalCount={feed?.length || 0}
        data={feed}
        computeItemKey={(index, post) => post?.cid || index}
        itemContent={(index, post) => <Post key={post?.cid} index={index} post={post} />}
        useWindowScroll={true}
        components={{ Footer: () => <FeedFooter {...footerProps} /> }}
        endReached={combinedLoadMore}
        ref={virtuosoRef}
        restoreStateFrom={lastVirtuosoState}
        initialScrollTop={lastVirtuosoState?.scrollTop}
      />
    </div>
  );
}

function SearchCommunitiesPanel({ query }: { query: string }) {
  const { t } = useTranslation();
  const account = useAccount();
  const subplebbitAddresses = useMemo(() => account?.subscriptions || [], [account?.subscriptions]);
  const defaultSubplebbitAddresses = useDefaultSubplebbitAddresses();
  const combined = useMemo(() => Array.from(new Set([...subplebbitAddresses, ...defaultSubplebbitAddresses])), [subplebbitAddresses, defaultSubplebbitAddresses]);
  const filtered = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return combined.filter((address: string) => address?.toLowerCase().includes(q)).slice(0, 50);
  }, [combined, query]);

  if (!query.trim()) {
    return <p className='text-sm text-muted-foreground'>{t('search_enter_query')}</p>;
  }

  if (filtered.length === 0) {
    return <p className='text-sm text-muted-foreground'>{t('search_communities_no_results')}</p>;
  }

  return (
    <ul className='list-none space-y-1 p-0'>
      {filtered.map((address) => (
        <li key={address}>
          <Link to={`/s/${encodeURIComponent(address)}`} className='text-sm font-medium text-primary hover:text-primary/90'>
            {Plebbit.getShortAddress({ address })}
          </Link>
          <span className='ml-2 break-all text-xs text-muted-foreground'>{address}</span>
        </li>
      ))}
    </ul>
  );
}

function SearchUsersPanel({ query }: { query: string }) {
  const { t } = useTranslation();
  const trimmed = query.trim();
  const profilePath = trimmed ? `/u/${encodeURIComponent(trimmed)}` : '#';

  if (!trimmed) {
    return <p className='text-sm text-muted-foreground'>{t('search_enter_query')}</p>;
  }

  return (
    <div className='flex flex-col gap-3'>
      <p className='text-sm text-muted-foreground'>{t('search_users_hint')}</p>
      <Button type='button' asChild variant='default' className='w-fit'>
        <Link to={profilePath}>{t('search_users_view_profile')}</Link>
      </Button>
    </div>
  );
}

const SearchPage = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const tabParam = searchParams.get('tab') || 'posts';
  const activeTab: SearchTab = VALID_TABS.includes(tabParam as SearchTab) ? (tabParam as SearchTab) : 'posts';

  useEffect(() => {
    const title = q ? `${t('search_page_title')}: ${q}` : t('search_page_title');
    document.title = `${title} - Seedit`;
  }, [q, t]);

  return (
    <div className={styles.content}>
      <div {...feedShellMainProps}>
        <StandardPageContent variant='feedColumn' stack>
          {q ? <p className='text-sm text-muted-foreground'>{t('search_results_for', { query: q })}</p> : null}
          {activeTab === 'posts' ? q.trim() ? <SearchPostsPanel searchQuery={q} /> : <p className='text-sm text-muted-foreground'>{t('search_enter_query')}</p> : null}
          {activeTab === 'users' ? <SearchUsersPanel query={q} /> : null}
          {activeTab === 'communities' ? <SearchCommunitiesPanel query={q} /> : null}
        </StandardPageContent>
      </div>
      <div className={styles.sidebar} {...feedShellSidebarProps}>
        <Sidebar />
      </div>
    </div>
  );
};

export default SearchPage;
