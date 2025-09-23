import { Fragment, useEffect, useMemo, useState, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import { Subplebbit as SubplebbitType, useAccount, useAccountSubplebbits, useSubplebbits, useSubplebbitStats } from '@plebbit/plebbit-react-hooks';
import { getFormattedTimeDuration } from '../../lib/utils/time-utils';
import {
  isSubplebbitsView,
  isSubplebbitsSubscriberView,
  isSubplebbitsModeratorView,
  isSubplebbitsAdminView,
  isSubplebbitsOwnerView,
  isSubplebbitsVoteView,
  isSubplebbitsVotePassingView,
  isSubplebbitsVoteRejectingView,
} from '../../lib/utils/view-utils';
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
import { nsfwTags } from '../../constants/nsfw-tags';
import _ from 'lodash';

interface SubplebbitProps {
  index?: number;
  subplebbit: SubplebbitType;
  tags?: string[];
  isUnsubscribed?: boolean;
  onUnsubscribe?: (address: string) => void;
}

const NoCommunitiesMessage = () => {
  const { t } = useTranslation();
};

const MyCommunitiesTabs = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const isInSubplebbitsSubscriberView = isSubplebbitsSubscriberView(location.pathname);
  const isInSubplebbitsModeratorView = isSubplebbitsModeratorView(location.pathname);
  const isInSubplebbitsAdminView = isSubplebbitsAdminView(location.pathname);
  const isInSubplebbitsOwnerView = isSubplebbitsOwnerView(location.pathname);
  const isInSubplebbitsView =
    isSubplebbitsView(location.pathname) && !isInSubplebbitsSubscriberView && !isInSubplebbitsModeratorView && !isInSubplebbitsAdminView && !isInSubplebbitsOwnerView;

  return (
    <div>
      <Link to='/subplebbits'>
        {t('all')}
      </Link>
      <Link to='/subplebbits/subscriber'>
        {t('subscriber')}
      </Link>
      <Link to='/subplebbits/moderator'>
        {t('moderator')}
      </Link>
      <Link to='/subplebbits/admin'>
        {t('admin')}
      </Link>
      <Link to='/subplebbits/owner'>
        {t('owner')}
      </Link>
    </div>
  );
};

const VoteTabs = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const isInSubplebbitsVoteView = isSubplebbitsVoteView(location.pathname);
  const isInSubplebbitsVotePassingView = isSubplebbitsVotePassingView(location.pathname);
  const isInSubplebbitsVoteRejectingView = isSubplebbitsVoteRejectingView(location.pathname);

  return (
    <div>
      <Link to='/communities/vote'>
        {t('all')}
      </Link>
      <Link
        to='/communities/vote/passing'
        onClick={(e) => {
          e.preventDefault();
          alert('This feature is not available yet.');
        }}
        style={{ cursor: 'not-allowed' }}
      >
        {t('passing')}
      </Link>
      <Link
        to='/communities/vote/rejecting'
        onClick={(e) => {
          e.preventDefault();
          alert('This feature is not available yet.');
        }}
        style={{ cursor: 'not-allowed' }}
      >
        {t('rejecting')}
      </Link>

    </div>
  );
};

const Infobar = () => {
  const account = useAccount();
  const { accountSubplebbits, error: accountSubplebbitsError } = useAccountSubplebbits();
  const { setError } = useErrorStore();

  useEffect(() => {
    setError('Infobar_useAccountSubplebbits', accountSubplebbitsError);
  }, [accountSubplebbitsError, setError]);

  const subscriptions = account?.subscriptions || [];
  const { t } = useTranslation();
  const location = useLocation();

  const isInSubplebbitsSubscriberView = isSubplebbitsSubscriberView(location.pathname);
  const isInSubplebbitsModeratorView = isSubplebbitsModeratorView(location.pathname);
  const isInSubplebbitsAdminView = isSubplebbitsAdminView(location.pathname);
  const isInSubplebbitsOwnerView = isSubplebbitsOwnerView(location.pathname);

  // Check if we're filtering by any tag
  const urlParams = new URLSearchParams(location.search);
  const currentTag = urlParams.get('tag');

  // Get base path without search params
  const basePath = location.pathname;

  let mainInfobarText;
  if (isInSubplebbitsSubscriberView) {
    mainInfobarText = subscriptions.length === 0 ? t('not_subscribed') : t('below_subscribed');
  } else if (isInSubplebbitsModeratorView || isInSubplebbitsAdminView || isInSubplebbitsOwnerView) {
    mainInfobarText = Object.keys(accountSubplebbits).length > 0 ? t('below_moderator_access') : t('not_moderator');
  } else if (subscriptions.length === 0 && Object.keys(accountSubplebbits).length === 0) {
    mainInfobarText = t('not_subscriber_nor_moderator');
  } else {
    mainInfobarText = (
      <Trans i18nKey='join_communities_notice' values={{ join: t('join'), leave: t('leave') }} components={{ 1: <code key='join' />, 2: <code key='leave' /> }} />
    );
  }

  return (
    <>
        <div>{mainInfobarText}</div>

    </div>
      {currentTag && (
          {currentTag === 'nsfw' ? t('filtering_by_nsfw') + ' ("adult", "gore", "vulgar", "anti") —' : t('filtering_by_tag', { tag: currentTag }) + ' —'}{' '}
            {t('undo')}
          </Link>

    </div>
      )}
    </>
  );
};

const Subplebbit = ({ subplebbit, tags, index, isUnsubscribed, onUnsubscribe }: SubplebbitProps) => {
  const { t } = useTranslation();
  const { address, createdAt, description, roles, shortAddress, settings, suggested, title } = subplebbit || {};
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
  const showSprout = !suggested?.avatarUrl || avatarLoadFailed;
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

  // TODO: make arrows functional when token voting is implemented in the API
  const upvoted = false;
  const downvoted = false;
  const upvoteCount = 0;
  const downvoteCount = 0;

  const postScore = upvoteCount === 0 && downvoteCount === 0 ? '•' : upvoteCount - downvoteCount || '•';
  const { allActiveUserCount } = useSubplebbitStats({ subplebbitAddress: address });
  const { isOffline, isOnlineStatusLoading, offlineTitle } = useIsSubplebbitOffline(subplebbit);

  const isNsfw = tags?.some((tag) => nsfwTags.includes(tag));

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
              <div
                style={{ cursor: 'not-allowed' }}
                onClick={(e) => {
                  e.preventDefault();
                  alert('This feature is not available yet.');
                }}
              />

    </div>
              <div
                style={{ cursor: 'not-allowed' }}
                onClick={(e) => {
                  e.preventDefault();
                  alert('This feature is not available yet.');
                }}
              />

    </div>

    </div>
            <Link to={`/p/${address}`}>
              {suggested?.avatarUrl ? (
                <img
                  key={suggested.avatarUrl}
                  src={suggested.avatarUrl}
                  alt=''
                  onError={() => {
                    setAvatarLoadFailed(true);
                  }}
                />
              ) : (
                  H

    </div>
              )}
            </Link>

    </div>

    </div>
              <Link to={`/p/${address}`}>
                p/{address?.includes('.') ? address : shortAddress}
                {title && `: ${title}`}
              </Link>

    </div>

    </div>
            {t('members_count', { count: allActiveUserCount })}, {t('community_for', { date: getFormattedTimeDuration(createdAt) })}
                <SubscribeButton address={address} onUnsubscribe={onUnsubscribe} />

    </span>
              {(userRole || isUserOwner) && (
                <Link to={`/p/${address}/settings`}>
                </Link>
              )}
              {isNsfw && (
                <Link to={getTagFilterRoute('nsfw')}>
                </Link>
              )}
              {isOffline && !isOnlineStatusLoading && <Label color='red' title={offlineTitle} text={t('offline')} />}
              {tags && tags.length > 0 && (
                  {tags.map((tag, index) => (
                    <Fragment key={index}>
                      <Link to={getTagFilterRoute(tag)}>{tag}</Link>
                    </Fragment>
                  ))}

    </span>
              )}

    </div>

    </div>
          {description && (
              <Markdown content={descriptionText} />

    </div>
          )}

    </div>

    </div>

    </div>
  );
};

const AccountSubplebbits = ({ viewRole }: { viewRole: string }) => {
  const account = useAccount();
  const { accountSubplebbits, error: accountSubplebbitsError } = useAccountSubplebbits();
  const { setError } = useErrorStore();
  const location = useLocation();
  const defaultSubplebbits = useDefaultSubplebbits();

  useEffect(() => {
    setError('AccountSubplebbits_useAccountSubplebbits', accountSubplebbitsError);
  }, [accountSubplebbitsError, setError, viewRole]);

  const urlParams = new URLSearchParams(location.search);
  const currentTag = urlParams.get('tag');

  const subplebbitElements = Object.values(accountSubplebbits)
    .filter((subplebbit: any) => {
      const isUserOwner = subplebbit.settings !== undefined;
      const userRole = (subplebbit as any).roles?.[account?.author?.address]?.role;
      return isUserOwner || userRole === viewRole;
    })
    .filter((subplebbitData: any) => {
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
    .map((subplebbitData, index) => {
      const tags = defaultSubplebbits.find((defaultSub) => defaultSub.address === (subplebbitData as any).address)?.tags;
      return <Subplebbit key={index} subplebbit={subplebbitData} tags={tags} index={index} />;
    });

  if (subplebbitElements.length === 0) {
    return <NoCommunitiesMessage />;
  }
  return <>{subplebbitElements}</>;
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
    .map((subplebbitData, index) => {
      const tags = defaultSubplebbits.find((defaultSub) => defaultSub.address === (subplebbitData as any).address)?.tags;
      return subplebbitData ? (
        <Subplebbit
          key={subplebbitData.address || index}
          subplebbit={subplebbitData}
          tags={tags}
          index={index}
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
    .map((subplebbitData, index) => {
      const tags = defaultSubplebbitsList.find((defaultSub) => defaultSub.address === (subplebbitData as any).address)?.tags;
      return <Subplebbit key={subplebbitData.address || index} subplebbit={subplebbitData} tags={tags} index={index} />;
    });

  if (subplebbitElements.length === 0) {
    return <NoCommunitiesMessage />;
  }
  return <>{subplebbitElements}</>;
};

const AllAccountSubplebbits = () => {
  const account = useAccount();
  const { accountSubplebbits, error: accountSubplebbitsError } = useAccountSubplebbits();
  const { setError } = useErrorStore();
  const location = useLocation();
  const defaultSubplebbits = useDefaultSubplebbits();

  useEffect(() => {
    setError('AllAccountSubplebbits_useAccountSubplebbits', accountSubplebbitsError);
  }, [accountSubplebbitsError, setError]);

  const urlParams = new URLSearchParams(location.search);
  const currentTag = urlParams.get('tag');

  const getAllAccountRelatedAddresses = useCallback(() => {
    const accountAddrs = Object.keys(accountSubplebbits);
    const subs = account?.subscriptions ? [...account.subscriptions].reverse() : [];
    return Array.from(new Set([...accountAddrs, ...subs]));
  }, [accountSubplebbits, account?.subscriptions]);

  const { list: displayedAddresses, isUnsubscribed, handleUnsubscribe } = useDisplayedSubscriptions(getAllAccountRelatedAddresses, [account?.author?.address]);

  const { subplebbits, error: subplebbitsError } = useSubplebbits({ subplebbitAddresses: displayedAddresses });

  useEffect(() => {
    setError('AllAccountSubplebbits_useSubplebbits', subplebbitsError);
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
    .map((subplebbitData, index) => {
      const tags = defaultSubplebbits.find((defaultSub) => defaultSub.address === (subplebbitData as any).address)?.tags;
      return subplebbitData ? (
        <Subplebbit
          key={subplebbitData.address || index}
          subplebbit={subplebbitData}
          tags={tags}
          index={index}
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

  const isInSubplebbitsSubscriberView = isSubplebbitsSubscriberView(location.pathname);
  const isInSubplebbitsModeratorView = isSubplebbitsModeratorView(location.pathname);
  const isInSubplebbitsAdminView = isSubplebbitsAdminView(location.pathname);
  const isInSubplebbitsOwnerView = isSubplebbitsOwnerView(location.pathname);
  const isInSubplebbitsVoteView = isSubplebbitsVoteView(location.pathname);
  const isInSubplebbitsView =
    isSubplebbitsView(location.pathname) &&
    !isInSubplebbitsSubscriberView &&
    !isInSubplebbitsModeratorView &&
    !isInSubplebbitsAdminView &&
    !isInSubplebbitsOwnerView &&
    !isInSubplebbitsVoteView;

  let viewRole = 'subscriber';
  if (isInSubplebbitsModeratorView) {
    viewRole = 'moderator';
  } else if (isInSubplebbitsAdminView) {
    viewRole = 'admin';
  } else if (isInSubplebbitsOwnerView) {
    viewRole = 'owner';
  }

  const documentTitle = useMemo(() => {
    let title = t('communities').charAt(0).toUpperCase() + t('communities').slice(1);
    if (isInSubplebbitsVoteView) {
      title += ` - ${_.startCase(t('vote'))}`;
    } else if (isInSubplebbitsSubscriberView) {
      title += ` - ${_.startCase(t('subscriber'))}`;
    } else if (isInSubplebbitsModeratorView) {
      title += ` - ${_.startCase(t('moderator'))}`;
    } else if (isInSubplebbitsAdminView) {
      title += ` - ${_.startCase(t('admin'))}`;
    } else if (isInSubplebbitsOwnerView) {
      title += ` - ${_.startCase(t('owner'))}`;
    } else if (isInSubplebbitsView) {
      title += ` - ${_.startCase(t('all'))}`;
    }
    return `${title} - Seedit`;
  }, [isInSubplebbitsSubscriberView, isInSubplebbitsModeratorView, isInSubplebbitsAdminView, isInSubplebbitsOwnerView, isInSubplebbitsView, isInSubplebbitsVoteView, t]);

  useEffect(() => {
    document.title = documentTitle;
  }, [documentTitle]);

  const renderErrors = () => {
    const errorsToDisplay: JSX.Element[] = [];
    Object.entries(errors).forEach(([source, errorObj]) => {
      if (!errorObj) return;

      if (
        source === 'Infobar_useAccountSubplebbits' &&
        (isInSubplebbitsView || isInSubplebbitsSubscriberView || isInSubplebbitsModeratorView || isInSubplebbitsAdminView || isInSubplebbitsOwnerView)
      ) {
        errorsToDisplay.push(<ErrorDisplay key={source} error={errorObj} />);
      } else if (source === 'AccountSubplebbits_useAccountSubplebbits' && (isInSubplebbitsModeratorView || isInSubplebbitsAdminView || isInSubplebbitsOwnerView)) {
        errorsToDisplay.push(<ErrorDisplay key={source} error={errorObj} />);
      } else if (source === 'SubscriberSubplebbits_useSubplebbits' && isInSubplebbitsSubscriberView) {
        errorsToDisplay.push(<ErrorDisplay key={source} error={errorObj} />);
      } else if (source === 'AllDefaultSubplebbits_useSubplebbits' && isInSubplebbitsVoteView) {
        errorsToDisplay.push(<ErrorDisplay key={source} error={errorObj} />);
      } else if (source === 'AllAccountSubplebbits_useAccountSubplebbits' && isInSubplebbitsView) {
        errorsToDisplay.push(<ErrorDisplay key={source} error={errorObj} />);
      } else if (source === 'AllAccountSubplebbits_useSubplebbits' && isInSubplebbitsView) {
        // Avoid duplicate key if both errors from AllAccountSubplebbits are present
        errorsToDisplay.push(<ErrorDisplay key={`${source}_subplebbits`} error={errorObj} />);
      }
    });
    return errorsToDisplay;
  };

  return (
        <Sidebar />

    </div>
      {isInSubplebbitsSubscriberView || isInSubplebbitsModeratorView || isInSubplebbitsAdminView || isInSubplebbitsOwnerView || isInSubplebbitsView ? (
        <MyCommunitiesTabs />
      ) : (
        <VoteTabs />
      )}
      <Infobar />
      {isInSubplebbitsVoteView && <AllDefaultSubplebbits />}
      {(isInSubplebbitsModeratorView || isInSubplebbitsAdminView || isInSubplebbitsOwnerView) && <AccountSubplebbits viewRole={viewRole} />}
      {isInSubplebbitsSubscriberView && <SubscriberSubplebbits />}
      {isInSubplebbitsView && <AllAccountSubplebbits />}
    </div>
  );
};

export default Subplebbits;
