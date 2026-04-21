import { useEffect, useMemo, useState, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Subplebbit as SubplebbitType, useAccount, useSubplebbits, useSubplebbitStats } from '@bitsocialnet/bitsocial-react-hooks';
import styles from './subplebbits.module.css';
import { getFormattedTimeDuration } from '../../lib/utils/time-utils';
import useErrorStore from '../../stores/use-error-store';
import { useDefaultSubplebbitAddresses, useDefaultSubplebbits } from '../../hooks/use-default-subplebbits';
import useDisplayedSubscriptions from '../../hooks/use-displayed-subscriptions';
import useIsMobile from '../../hooks/use-is-mobile';
import useIsSubplebbitOffline from '../../hooks/use-is-subplebbit-offline';
import ErrorDisplay from '../../components/error-display';
import Markdown from '../../components/markdown';
import Label from '../../components/post/label';
import Sidebar from '../../components/sidebar';
import SubscribeButton from '../../components/subscribe-button';
import { StandardPageContent } from '@/components/layout';
import { feedShellMainProps, feedShellSidebarProps } from '../../lib/feed-shell-data';
import { nsfwTags } from '../../constants/nsfw-tags';
import { PixelIcon } from '@/components/ui/pixel-icon';
import _ from 'lodash';

interface SubplebbitProps {
  subplebbit: SubplebbitType;
  tags?: string[];
  isUnsubscribed?: boolean;
  onUnsubscribe?: (address: string) => void;
}

const NoCommunitiesMessage = () => {
  const { t } = useTranslation();
  return <div className={styles.noSubsMessage}>{t('nothing_found')}</div>;
};

const Infobar = () => {
  const account = useAccount();
  const subscriptions = account?.subscriptions || [];
  const { t } = useTranslation();
  const location = useLocation();

  const isMyCommunities = location.pathname === '/communities';

  const urlParams = new URLSearchParams(location.search);
  const currentTag = urlParams.get('tag');

  const basePath = location.pathname;

  let mainInfobarText: string | undefined;
  if (isMyCommunities) {
    mainInfobarText = subscriptions.length === 0 ? t('not_subscribed') : undefined;
  }

  return (
    <>
      {mainInfobarText != null && (
        <div className={styles.infobar}>
          <div>{mainInfobarText}</div>
        </div>
      )}
      {currentTag && (
        <div className={styles.infobar}>
          {currentTag === 'nsfw' ? t('filtering_by_nsfw') + ' ("adult", "gore", "vulgar", "anti") —' : t('filtering_by_tag', { tag: currentTag }) + ' —'}{' '}
          <Link className={styles.undoLink} to={basePath}>
            {t('undo')}
          </Link>
        </div>
      )}
    </>
  );
};

const Subplebbit = ({ subplebbit, tags, isUnsubscribed, onUnsubscribe }: SubplebbitProps) => {
  const { t } = useTranslation();
  const { address, createdAt, description, roles, shortAddress, settings, suggested, title } = subplebbit || {};
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setAvatarLoadFailed(false);
  }, [subplebbit?.address, suggested?.avatarUrl]);

  // subplebbit.settings is a private field that is only available to the owner of the subplebbit
  const isUserOwner = settings;
  const account = useAccount();
  const userRole = roles?.[account?.author?.address]?.role;

  const getTagFilterRoute = (tag: string) => {
    const pathname = location.pathname;
    return `${pathname}?tag=${encodeURIComponent(tag)}`;
  };

  const { allActiveUserCount } = useSubplebbitStats({ subplebbitAddress: address });
  const { isOffline, isOnlineStatusLoading, offlineTitle } = useIsSubplebbitOffline(subplebbit);

  const isNsfw = tags?.some((tag) => nsfwTags.includes(tag));
  const communityPath = `/s/${address}`;
  const displayAddress = address?.includes('.') ? address : shortAddress;
  const hasBadgeRow = Boolean(userRole || isUserOwner) || isNsfw || (isOffline && !isOnlineStatusLoading) || Boolean(tags && tags.length > 0);

  const isMobile = useIsMobile();
  const descriptionText =
    description &&
    (isMobile
      ? description.length > 100
        ? description.slice(0, 100) + '...'
        : description
      : description.length > 400
        ? description.slice(0, 400) + '...'
        : description);

  return (
    <div className={`${styles.subplebbit} ${isUnsubscribed ? styles.unsubscribed : ''}`}>
      <div className={styles.row}>
        <Link
          className={styles.rowHitArea}
          to={communityPath}
          aria-label={`${t('go_to_a_community')}: ${title ? `${title}, s/${displayAddress}` : `s/${displayAddress}`}`}
        />
        <div className={styles.rowMainBody}>
          <div className={styles.leftcol}>
            <div className={styles.avatar}>
              <div className={styles.avatarLink}>
                {suggested?.avatarUrl && !avatarLoadFailed ? (
                  <img
                    key={suggested.avatarUrl}
                    src={suggested.avatarUrl}
                    alt=''
                    className={styles.customAvatarImg}
                    onError={() => {
                      setAvatarLoadFailed(true);
                    }}
                  />
                ) : (
                  <span className={styles.avatarFallback} aria-hidden>
                    <PixelIcon glyph='users' className={styles.avatarFallbackIcon} aria-hidden />
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className={styles.entry}>
            <div className={styles.titleBlock}>
              {title ? (
                <>
                  <span className={styles.titlePrimary}>{title}</span>
                  <span className={styles.titleAddress}>s/{displayAddress}</span>
                </>
              ) : (
                <span className={styles.titlePrimary}>s/{displayAddress}</span>
              )}
            </div>
            <div className={styles.tagline}>
              {t('members_count', { count: allActiveUserCount })}, {t('community_for', { date: getFormattedTimeDuration(createdAt) })}
            </div>
            {description && (
              <div className={styles.description}>
                <Markdown content={descriptionText} />
              </div>
            )}
            {hasBadgeRow ? (
              <div className={styles.badgeRow}>
                {(userRole || isUserOwner) && (
                  <Link to={`/s/${address}/settings`} className={styles.badgeRowIconLink}>
                    <span className={styles.moderatorIcon} title={userRole || 'owner'} />
                  </Link>
                )}
                {isNsfw && (
                  <Link to={getTagFilterRoute('nsfw')} className={styles.badgeRowIconLink}>
                    <span className={styles.over18icon} title='Filter NSFW communities' />
                  </Link>
                )}
                {isOffline && !isOnlineStatusLoading && <Label color='red' title={offlineTitle} text={t('offline')} />}
                {tags && tags.length > 0 && (
                  <div className={styles.tagBadgeList}>
                    {tags.map((tag) => (
                      <Link key={tag} to={getTagFilterRoute(tag)} className={styles.tagBadge}>
                        {tag}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
        <div className={styles.joinSlot}>
          <SubscribeButton address={address} onUnsubscribe={onUnsubscribe} pillSize='default' />
        </div>
      </div>
    </div>
  );
};

const SubscriberSubplebbits = () => {
  const account = useAccount();
  const { setError } = useErrorStore();
  const location = useLocation();
  const defaultSubplebbits = useDefaultSubplebbits();

  const urlParams = new URLSearchParams(location.search);
  const currentTag = urlParams.get('tag');

  const getAccountSubscriptions = useCallback(() => {
    return account?.subscriptions ? [...account.subscriptions].reverse() : [];
  }, [account?.subscriptions]);

  const {
    list: displayedSubscriptions,
    isUnsubscribed,
    handleUnsubscribe,
  } = useDisplayedSubscriptions(
    getAccountSubscriptions,
    [account?.author?.address], // Reset dependencies
  );

  const { subplebbits, error: subplebbitsError } = useSubplebbits({ subplebbitAddresses: displayedSubscriptions });

  useEffect(() => {
    setError('SubscriberSubplebbits_useSubplebbits', subplebbitsError);
  }, [subplebbitsError, setError]);

  const subplebbitElements = Object.values(subplebbits ?? {})
    .filter((subplebbit): subplebbit is SubplebbitType => Boolean(subplebbit))
    .filter((subplebbitData) => {
      if (currentTag) {
        const tags = defaultSubplebbits.find((defaultSub) => defaultSub.address === (subplebbitData as any).address)?.tags;

        if (currentTag === 'nsfw') {
          return tags?.some((tag) => nsfwTags.includes(tag));
        } else {
          return tags?.includes(currentTag);
        }
      }
      return true;
    })
    .map((subplebbitData) => {
      const tags = defaultSubplebbits.find((defaultSub) => defaultSub.address === (subplebbitData as any).address)?.tags;
      return subplebbitData ? (
        <Subplebbit
          key={subplebbitData.address}
          subplebbit={subplebbitData}
          tags={tags}
          isUnsubscribed={isUnsubscribed(subplebbitData.address)}
          onUnsubscribe={handleUnsubscribe}
        />
      ) : null;
    })
    .filter(Boolean);

  if (subplebbitElements.length === 0) {
    return <NoCommunitiesMessage />;
  }
  return <>{subplebbitElements}</>;
};

const AllDefaultSubplebbits = () => {
  const defaultSubplebbitsList = useDefaultSubplebbits(); // Renamed to avoid conflict
  const subplebbitAddresses = useDefaultSubplebbitAddresses();
  const location = useLocation();

  const urlParams = new URLSearchParams(location.search);
  const currentTag = urlParams.get('tag');

  const { subplebbits, error: subplebbitsError } = useSubplebbits({ subplebbitAddresses });
  const { setError } = useErrorStore();

  useEffect(() => {
    setError('AllDefaultSubplebbits_useSubplebbits', subplebbitsError);
  }, [subplebbitsError, setError]);

  const subplebbitElements = Object.values(subplebbits ?? {})
    .filter((subplebbit): subplebbit is SubplebbitType => Boolean(subplebbit)) // Type guard
    .filter((subplebbitData) => {
      if (currentTag) {
        const tags = defaultSubplebbitsList.find((defaultSub) => defaultSub.address === (subplebbitData as any).address)?.tags;

        if (currentTag === 'nsfw') {
          return tags?.some((tag) => nsfwTags.includes(tag));
        } else {
          return tags?.includes(currentTag);
        }
      }
      return true;
    })
    .map((subplebbitData) => {
      const tags = defaultSubplebbitsList.find((defaultSub) => defaultSub.address === (subplebbitData as any).address)?.tags;
      return <Subplebbit key={(subplebbitData as any).address} subplebbit={subplebbitData} tags={tags} />;
    });

  if (subplebbitElements.length === 0) {
    return <NoCommunitiesMessage />;
  }
  return <>{subplebbitElements}</>;
};

const Subplebbits = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { errors, clearAllErrors } = useErrorStore();

  useEffect(() => {
    return () => {
      clearAllErrors();
    };
  }, [location, clearAllErrors]);

  useEffect(() => {
    Object.entries(errors).forEach(([source, errorObj]) => {
      if (errorObj) {
        console.error(`Error from ${source}:`, errorObj.message, errorObj.stack);
      }
    });
  }, [errors]);

  const isMyCommunities = location.pathname === '/communities';
  const isAllCommunities = location.pathname === '/communities/all';

  const documentTitle = useMemo(() => {
    let title = t('communities').charAt(0).toUpperCase() + t('communities').slice(1);
    if (isAllCommunities) {
      title += ` - ${_.startCase(t('all_communities'))}`;
    } else if (isMyCommunities) {
      title += ` - ${_.startCase(t('my_communities'))}`;
    }
    return `${title} - Seedit`;
  }, [isAllCommunities, isMyCommunities, t]);

  useEffect(() => {
    document.title = documentTitle;
  }, [documentTitle]);

  const renderErrors = () => {
    const errorsToDisplay: React.JSX.Element[] = [];
    Object.entries(errors).forEach(([source, errorObj]) => {
      if (!errorObj) return;

      if (source === 'SubscriberSubplebbits_useSubplebbits' && isMyCommunities) {
        errorsToDisplay.push(<ErrorDisplay key={source} error={errorObj} variant='bar' fullBleed />);
      } else if (source === 'AllDefaultSubplebbits_useSubplebbits' && isAllCommunities) {
        errorsToDisplay.push(<ErrorDisplay key={source} error={errorObj} variant='bar' fullBleed />);
      }
    });
    return errorsToDisplay;
  };

  const errorNodes = renderErrors();

  return (
    <div className={styles.content}>
      <div {...feedShellMainProps}>
        {errorNodes.length > 0 ? (
          <div className={styles.feedErrorBarBleed} role='presentation'>
            {errorNodes}
          </div>
        ) : null}
        <StandardPageContent variant='feedColumn'>
          <Infobar />
          {isAllCommunities && <AllDefaultSubplebbits />}
          {isMyCommunities && <SubscriberSubplebbits />}
        </StandardPageContent>
      </div>
      <div className={styles.sidebar} {...feedShellSidebarProps}>
        <Sidebar />
      </div>
    </div>
  );
};

export default Subplebbits;
