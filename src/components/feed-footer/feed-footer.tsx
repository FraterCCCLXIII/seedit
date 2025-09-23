import { useState, useEffect } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import { isAllView, isModView } from '../../lib/utils/view-utils';
import { useFeedStateString } from '../../hooks/use-state-string';
import LoadingEllipsis from '../loading-ellipsis';
import React from 'react';

interface FeedFooterProps {
  feedLength: number;
  hasFeedLoaded: boolean;
  hasMore: boolean;
  subplebbitAddresses: string[];
  subplebbitAddressesWithNewerPosts: string[];
  weeklyFeedLength: number;
  monthlyFeedLength: number;
  yearlyFeedLength: number;
  currentTimeFilterName: string;
  reset: () => void;
  searchQuery?: string;
  isSearching?: boolean;
  showNoResults?: boolean;
  onClearSearch?: () => void;
}

const FeedFooter = ({
  feedLength,
  hasFeedLoaded,
  hasMore,
  subplebbitAddresses,
  weeklyFeedLength,
  monthlyFeedLength,
  yearlyFeedLength,
  currentTimeFilterName,
  searchQuery,
  isSearching,
  showNoResults,
  onClearSearch,
}: FeedFooterProps) => {
  let footerContent;
  const { t } = useTranslation();
  const params = useParams();
  const location = useLocation();
  const isInModView = isModView(location.pathname);
  const isInAllView = isAllView(location.pathname);

  const feedStateString = useFeedStateString(subplebbitAddresses);
  const loadingStateString =
    useFeedStateString(subplebbitAddresses) ||
    (!hasFeedLoaded || (feedLength === 0 && !(weeklyFeedLength > feedLength || monthlyFeedLength > feedLength || yearlyFeedLength > feedLength))
      ? t('loading_feed')
      : t('looking_for_more_posts'));

  // Add state to track initial loading
  const [hasFetchedSubplebbitAddresses, setHasFetchedSubplebbitAddresses] = useState(false);

  // Set hasInitialized after a short delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setHasFetchedSubplebbitAddresses(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (!hasFetchedSubplebbitAddresses) {
    footerContent = <LoadingEllipsis string={t('loading_feed')} />;
  }

  // Handle search state
  if (isSearching) {
    footerContent = (
        <LoadingEllipsis string={t('searching')} />
      </div>
    );
  } else if (showNoResults && searchQuery) {
    footerContent = (
        <br />
        <br />
            {t('clear_search')}
          </span>
        </div>
      </div>
    );
  } else if (searchQuery && feedLength > 0) {
    // When search results are found
    footerContent = (
        <br />
        <br />
            {t('clear_search')}
          </span>
        </div>
      </div>
    );
  } else if (
    hasFeedLoaded &&
    feedLength === 0 &&
    !hasMore &&
    !isSearching &&
    !searchQuery &&
    !(weeklyFeedLength > feedLength || monthlyFeedLength > feedLength || yearlyFeedLength > feedLength)
  ) {
    footerContent = t('no_posts');
  } else if (hasMore || subplebbitAddresses.length > 0 || (subplebbitAddresses && subplebbitAddresses.length === 0)) {
    // Only show newer posts/weekly/monthly suggestions when not searching
    footerContent = (
      <>
        {weeklyFeedLength > feedLength && !searchQuery ? (
            <Trans
              i18nKey='more_posts_last_week'
              values={{ currentTimeFilterName, count: feedLength }}
              components={{
                1: <Link key='weekly-posts-link' to={(isInModView ? '/p/mod/' : isInAllView ? '/p/all/' : '/') + (params?.sortType || 'hot') + '/1w'} />,
              }}
            />
          </div>
        ) : monthlyFeedLength > feedLength && !searchQuery ? (
            <Trans
              i18nKey='more_posts_last_month'
              values={{ currentTimeFilterName, count: feedLength }}
              components={{
                1: <Link key='monthly-posts-link' to={(isInModView ? '/p/mod/' : isInAllView ? '/p/all/' : '/') + (params?.sortType || 'hot') + '/1m'} />,
              }}
            />
          </div>
        ) : yearlyFeedLength > feedLength && !searchQuery ? (
            <Trans
              i18nKey='more_posts_last_year'
              values={{ currentTimeFilterName, count: feedLength }}
              components={{
                1: <Link key='yearly-posts-link' to={(isInModView ? '/p/mod/' : isInAllView ? '/p/all/' : '/') + (params?.sortType || 'hot') + '/1y'} />,
              }}
            />
          </div>
        ) : null}
          {subplebbitAddresses.length === 0 ? (
            isInModView ? (
            ) : (
              <div>
                <Trans i18nKey='no_communities_found' components={[<a href='https://github.com/plebbit/lists'>https://github.com/plebbit/lists</a>]} />
                <br />
                {t('connect_community_notice')}
              </div>
            )
          ) : !searchQuery ? (
            <LoadingEllipsis string={feedStateString || loadingStateString} />
          ) : null}
        </div>
      </>
    );
  }
};

export default React.memo(FeedFooter);
