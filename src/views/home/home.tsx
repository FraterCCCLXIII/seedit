import { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Virtuoso, VirtuosoHandle, StateSnapshot } from 'react-virtuoso';
import { useFeed } from '@plebbit/plebbit-react-hooks';
import { useTranslation } from 'react-i18next';
import styles from './home.module.css';
import LoadingEllipsis from '../../components/loading-ellipsis';
import NewerPostsButton from '../../components/newer-posts-button';
import Post from '../../components/post';
import Sidebar from '../../components/sidebar';
import { useDefaultAndSubscriptionsSubplebbitAddresses } from '../../hooks/use-default-subplebbits';
import useFeedStateString from '../../hooks/use-feed-state-string';
import useTimeFilter, { TimeFilterKey } from '../../hooks/use-time-filter';

const lastVirtuosoStates: { [key: string]: StateSnapshot } = {};

const Home = () => {
  const { t } = useTranslation();
  const subplebbitAddresses = useDefaultAndSubscriptionsSubplebbitAddresses();
  const params = useParams<{ sortType?: string; timeFilterName?: string }>();
  const sortType = params?.sortType || 'hot';
  const timeFilterName = params.timeFilterName as TimeFilterKey;
  const { timeFilter } = useTimeFilter(sortType, timeFilterName);

  const { feed, hasMore, loadMore, reset, subplebbitAddressesWithNewerPosts } = useFeed({
    filter: timeFilter,
    postsPerPage: 10,
    sortType,
    subplebbitAddresses: subplebbitAddresses || [],
  });

  let loadingStateString = useFeedStateString(subplebbitAddresses) || t('loading');
  const loadingString = (
    <div className={styles.stateString}>
      <LoadingEllipsis string={loadingStateString} />
    </div>
  );
  const Footer = () => {
    let footerContent;
    if (feed.length === 0) {
      footerContent = t('no_posts');
    }
    if (hasMore || (subplebbitAddresses && subplebbitAddresses.length === 0)) {
      footerContent = loadingString;
    }
    return <div className={styles.footer}>{footerContent}</div>;
  };

  const virtuosoRef = useRef<VirtuosoHandle | null>(null);

  useEffect(() => {
    const setLastVirtuosoState = () => {
      virtuosoRef.current?.getState((snapshot: StateSnapshot) => {
        if (snapshot?.ranges?.length) {
          lastVirtuosoStates[sortType + timeFilterName] = snapshot;
        }
      });
    };
    window.addEventListener('scroll', setLastVirtuosoState);
    return () => window.removeEventListener('scroll', setLastVirtuosoState);
  }, [sortType, timeFilterName]);

  const lastVirtuosoState = lastVirtuosoStates?.[sortType + timeFilterName];

  useEffect(() => {
    document.title = `Seedit`;
  }, [t]);

  return (
    <div>
      <div className={styles.content}>
        <div className={`${styles.sidebar}`}>
          <Sidebar />
        </div>
        <div className={styles.feed}>
          <NewerPostsButton reset={reset} subplebbitAddressesWithNewerPosts={subplebbitAddressesWithNewerPosts} />
          <Virtuoso
            increaseViewportBy={{ bottom: 1200, top: 600 }}
            totalCount={feed?.length || 0}
            data={feed}
            itemContent={(index, post) => <Post index={index} post={post} />}
            useWindowScroll={true}
            components={{ Footer }}
            endReached={loadMore}
            ref={virtuosoRef}
            restoreStateFrom={lastVirtuosoState}
            initialScrollTop={lastVirtuosoState?.scrollTop}
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
