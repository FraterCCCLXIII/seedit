import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Comment, useAccount, useBlock, Role, Subplebbit, useSubplebbitStats, useAccountComment, usePlebbitRpcSettings } from '@plebbit/plebbit-react-hooks';
import Plebbit from '@plebbit/plebbit-js';
import { getPostScore } from '../../lib/utils/post-utils';
import { getFormattedDate, getFormattedTimeDuration, getFormattedTimeAgo } from '../../lib/utils/time-utils';
import { findSubplebbitCreator } from '../../lib/utils/user-utils';
import {
  isAllView,
  isDomainView,
  isHomeAboutView,
  isHomeView,
  isModView,
  isPendingPostView,
  isPostPageAboutView,
  isPostPageView,
  isSubplebbitAboutView,
  isSubplebbitSettingsView,
  isSubplebbitsView,
  isSubplebbitView,
} from '../../lib/utils/view-utils';
import useCommunitySubtitles from '../../hooks/use-community-subtitles';
import useIsMobile from '../../hooks/use-is-mobile';
import useIsSubplebbitOffline from '../../hooks/use-is-subplebbit-offline';
import { FAQ } from '../../views/about/about';
import LoadingEllipsis from '../loading-ellipsis';
import Markdown from '../markdown';
import SearchBar from '../search-bar';
import SubscribeButton from '../subscribe-button';
import { Version } from '../version';

// Removed CSS modules import - converted to Tailwind classes
const RulesList = ({ rules }: { rules: string[] }) => {
  const { t } = useTranslation();
  const markdownRules = rules.map((rule, index) => `${index + 1}. ${rule}`).join('\n');

  return (
    <div className='pb-1.5 pt-2 text-gray-700 dark:text-gray-300 leading-4 break-words'>
      <div className='mb-1.5 capitalize'>
        <strong>{t('rules')}</strong>
      </div>
      <Markdown content={markdownRules} />
    </div>
  );
};

const ModeratorsList = ({ roles }: { roles: Record<string, Role> }) => {
  const { t } = useTranslation();
  const rolesList = roles ? Object.entries(roles).map(([address, { role }]) => ({ address, role })) : [];

  return (
    <div className='mb-3 -mr-1.5'>
      <div className='inline uppercase m-0 text-gray-500 text-xs font-normal'>{t('moderators')}</div>
      <ul className='m-0 p-1.5 border border-gray-300 dark:border-gray-600 list-none'>
        {rolesList.map(({ address }, index) => (
          <li
            key={index}
            className='text-xs list-none no-underline text-gray-800 dark:text-gray-200 cursor-pointer'
            onClick={() => window.alert('Direct profile links are not supported yet.')}
          >
            u/{Plebbit.getShortAddress(address)}
          </li>
        ))}
        {/* TODO: https://github.com/plebbit/seedit/issues/274
         <li className="text-gray-500 text-right text-xs cursor-pointer">{t('about_moderation')} »</li> */}
      </ul>
    </div>
  );
};

const PostInfo = ({ comment }: { comment: Comment | undefined }) => {
  const { t, i18n } = useTranslation();
  const { language } = i18n;
  const { upvoteCount, downvoteCount, timestamp, state, subplebbitAddress, cid } = comment || {};
  const postScore = getPostScore(upvoteCount, downvoteCount, state);
  const totalVotes = upvoteCount + downvoteCount;
  const upvotePercentage = totalVotes > 0 ? Math.round((upvoteCount / totalVotes) * 100) : 0;
  const postDate = getFormattedDate(timestamp, language);

  return (
    <div className='p-1.5 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 font-arial text-lg rounded text-gray-700 dark:text-gray-300 mb-3 -mr-1.5'>
      <div>
        <span>{t('post_submitted_on', { postDate: postDate })}</span>
      </div>
      <div>
        <span className='text-2xl font-bold'>{postScore === '•' ? '0' : postScore}</span>{' '}
        <span className='text-base font-bold'>{postScore === 1 ? t('point') : t('points')}</span>{' '}
        {`(${postScore === '?' ? '?' : `${upvotePercentage}`}% ${t('upvoted')})`}
      </div>
      <div className='text-xs mt-1'>
        {t('share_link')}:{' '}
        <input
          className='border border-gray-300 dark:border-gray-600 font-mono text-xs p-1 w-44 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300'
          type='text'
          value={`https://pleb.bz/p/${subplebbitAddress}/c/${cid}`}
          readOnly={true}
        />
      </div>
    </div>
  );
};

const ModerationTools = ({ address }: { address?: string }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const params = useParams();
  const isInSubplebbitSettingsView = isSubplebbitSettingsView(location.pathname, params);

  return (
    <div className='mb-3 -mr-1.5'>
      <div className='inline uppercase m-0 text-gray-500 text-xs font-normal'>{t('moderation_tools')}</div>
      <ul className='m-0 p-1.5 border border-gray-300 dark:border-gray-600 list-none'>
        <li className={`my-1.5 lowercase ${isInSubplebbitSettingsView ? 'font-bold' : ''}`}>
          <Link
            className="no-underline text-gray-800 dark:text-gray-200 cursor-pointer before:bg-[url('/assets/community_settings.png')] before:bg-[length:16px_16px] before:h-4 before:w-4 before:content-[''] before:float-left before:mr-1.5"
            to={`/p/${address}/settings`}
          >
            {t('community_settings')}
          </Link>
        </li>
      </ul>
    </div>
  );
};

interface SidebarProps {
  comment?: Comment;
  isSubCreatedButNotYetPublished?: boolean;
  settings?: any;
  subplebbit?: Subplebbit;
  reset?: () => void;
}

export const Footer = () => {
  const location = useLocation();
  const params = useParams();
  const isMobile = useIsMobile();
  const isInHomeAboutView = isHomeAboutView(location.pathname);
  const isInPostPageAboutView = isPostPageAboutView(location.pathname, params);
  const isInSubplebbitView = isSubplebbitView(location.pathname, params);

  return (
    <div
      className={`font-verdana text-xs w-full box-border bg-white dark:bg-gray-900 overflow-hidden ${
        isMobile && (isInHomeAboutView || isInPostPageAboutView) ? 'mt-5 mb-5' : ''
      } ${isInSubplebbitView ? 'mt-4 mb-4' : ''}`}
    >
      <div className='overflow-hidden flex justify-center'>
        <ul className='flex list-none lowercase pl-0 flex-wrap'>
          <li className='whitespace-nowrap'>
            <Version />
          </li>
          <span className='mx-0.5 text-gray-400'>|</span>
          <li className='whitespace-nowrap'>
            <a className='text-xs text-blue-600 dark:text-blue-400' href='https://github.com/plebbit/seedit' target='_blank' rel='noopener noreferrer'>
              github
            </a>
            <span className='mx-0.5 text-gray-400'>|</span>
          </li>
          <li className='whitespace-nowrap'>
            <a className='text-xs text-blue-600 dark:text-blue-400' href='https://t.me/plebbit' target='_blank' rel='noopener noreferrer'>
              telegram
            </a>
            <span className='mx-0.5 text-gray-400'>|</span>
          </li>
          <li className='whitespace-nowrap'>
            <a className='text-xs text-blue-600 dark:text-blue-400' href='https://x.com/getplebbit' target='_blank' rel='noopener noreferrer'>
              x
            </a>
            <span className='mx-0.5 text-gray-400'>|</span>
          </li>
          <li className='whitespace-nowrap'>
            <a
              className='text-xs text-blue-600 dark:text-blue-400'
              href='https://plebbit.github.io/docs/learn/clients/seedit/what-is-seedit'
              target='_blank'
              rel='noopener noreferrer'
            >
              docs
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};

const Sidebar = ({ comment, isSubCreatedButNotYetPublished, settings, subplebbit, reset }: SidebarProps) => {
  const { t } = useTranslation();
  const { address, createdAt, description, roles, rules, title, updatedAt } = subplebbit || {};
  const { allActiveUserCount, hourActiveUserCount } = useSubplebbitStats({ subplebbitAddress: address });
  const { isOffline, offlineTitle } = useIsSubplebbitOffline(subplebbit || {});
  const onlineNotice = t('users_online', { count: hourActiveUserCount || 0 });
  const offlineNotice = updatedAt ? t('posts_last_synced', { dateAgo: getFormattedTimeAgo(updatedAt) }) : offlineTitle;
  const onlineStatus = !isOffline ? onlineNotice : offlineNotice;

  const subCreatedButNotYetPublishedStatus = <LoadingEllipsis string='Publishing community over IPFS' />;

  const location = useLocation();
  const params = useParams();
  const isInAllView = isAllView(location.pathname);
  const isInDomainView = isDomainView(location.pathname);
  const isInHomeAboutView = isHomeAboutView(location.pathname);
  const isInPostPageAboutView = isPostPageAboutView(location.pathname, params);
  const isInHomeView = isHomeView(location.pathname);
  const isInModView = isModView(location.pathname);
  const isInPendingPostView = isPendingPostView(location.pathname, params);
  const isInPostPageView = isPostPageView(location.pathname, params);
  const isInSubplebbitsView = isSubplebbitsView(location.pathname);
  const isInSubplebbitAboutView = isSubplebbitAboutView(location.pathname, params);
  const isInSubplebbitView = isSubplebbitView(location.pathname, params);

  const pendingPost = useAccountComment({ commentIndex: params?.accountCommentIndex as any });

  const subplebbitCreator = findSubplebbitCreator(roles);
  const creatorAddress = subplebbitCreator === 'anonymous' ? 'anonymous' : `${Plebbit.getShortAddress(subplebbitCreator)}`;
  const submitRoute =
    isInHomeView || isInHomeAboutView || isInAllView || isInModView || isInDomainView
      ? '/submit'
      : isInPendingPostView
      ? `/p/${pendingPost?.subplebbitAddress}/submit`
      : address || params?.subplebbitAddress
      ? `/p/${address || params?.subplebbitAddress}/submit`
      : '/submit';

  const { blocked, unblock, block } = useBlock({ address });

  const [showBlockConfirm, setShowBlockConfirm] = useState(false);

  const blockConfirm = () => {
    setShowBlockConfirm(true);
  };

  const handleBlock = () => {
    if (blocked) {
      unblock();
    } else {
      block();
    }
    setShowBlockConfirm(false);
    reset?.();
  };

  const cancelBlock = () => {
    setShowBlockConfirm(false);
  };

  const account = useAccount();
  const moderatorRole = roles?.[account.author?.address]?.role;
  const isOwner = !!settings;

  const [subtitle1, setSubtitle1] = useState('');
  const [subtitle2, setSubtitle2] = useState('');

  const communitySubtitles = useCommunitySubtitles();

  useEffect(() => {
    if (communitySubtitles.length >= 2) {
      const indices = new Set<number>();
      while (indices.size < 2) {
        const randomIndex = Math.floor(Math.random() * communitySubtitles.length);
        indices.add(randomIndex);
      }
      const [index1, index2] = Array.from(indices);
      setSubtitle1(communitySubtitles[index1]);
      setSubtitle2(communitySubtitles[index2]);
    } else if (communitySubtitles.length === 1) {
      setSubtitle1(communitySubtitles[0]);
      setSubtitle2('');
    }
  }, [communitySubtitles]);

  const isConnectedToRpc = usePlebbitRpcSettings()?.state === 'connected';
  const navigate = useNavigate();
  const handleCreateCommunity = () => {
    // creating a community only works if the user is running a full node
    if (isConnectedToRpc) {
      navigate('/communities/create');
    } else if (window.confirm(t('create_community_warning'))) {
      const link = document.createElement('a');
      link.href = 'https://github.com/plebbit/seedit/releases/latest';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.click();
    }
  };

  const isMobile = useIsMobile();
  const [showExpando, setShowExpando] = useState(false);

  const handleSearchBarExpandoChange = (expanded: boolean) => {
    setShowExpando(expanded);
  };

  return (
    <div className='w-full'>
      <div className='mb-6'>
        <SearchBar onExpandoChange={handleSearchBarExpandoChange} />
      </div>
      <div
        className='space-y-6'
        style={{
          transform: showExpando ? 'translateY(47px)' : 'translateY(0)',
          transition: 'transform 0.3s linear',
          willChange: 'transform',
          marginTop: '-47px',
        }}
      >
        {(isInPostPageView || isInPendingPostView) && <PostInfo comment={comment} />}
        {(isInSubplebbitView || isInHomeView || isInAllView || isInModView || isInDomainView || isInPendingPostView) && (
          <Link to={submitRoute}>
            <div className='text-center relative border border-gray-400 dark:border-gray-600 bg-white dark:bg-gray-800 bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 text-xl font-bold tracking-tight leading-7 h-7 cursor-pointer mb-3 text-gray-800 dark:text-gray-200 -mr-1.5 hover:bg-gradient-to-b hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-800 dark:hover:to-blue-900 hover:border-blue-500 hover:text-white dark:hover:text-white'>
              {t('submit_post')}
              <div className='absolute -top-px -right-px h-8 w-6 bg-white dark:bg-gray-800 bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 bg-no-repeat' />
            </div>
          </Link>
        )}
        {!isInHomeView &&
          !isInHomeAboutView &&
          !isInAllView &&
          !isInModView &&
          !isInSubplebbitsView &&
          !isInHomeAboutView &&
          !isInDomainView &&
          !isInPostPageAboutView && (
            <div className='text-xs text-gray-700 dark:text-gray-300 mb-3'>
              <Link className='font-bold text-lg break-words font-arial hover:underline' to={`/p/${address}`}>
                {subplebbit?.address}
              </Link>
              <div className='mt-1.5'>
                <span className='mr-1.5'>
                  <SubscribeButton address={address} />
                </span>
                <span>{t('members_count', { count: allActiveUserCount })}</span>
              </div>
              <div className='pb-1.5'>
                <span
                  className={`bg-no-repeat inline-block h-3.5 w-3.5 my-2 mx-2 -mb-0.5 ml-0.5 ${
                    !isOffline ? 'bg-[url("/assets/indicator-online.png")]' : 'bg-[url("/assets/indicator-offline.png")]'
                  }`}
                  title={!isOffline ? t('online') : t('offline')}
                />
                <span>{isSubCreatedButNotYetPublished ? subCreatedButNotYetPublished : onlineStatus}</span>
                {moderatorRole && (
                  <div className="text-gray-500 pt-2 pl-px text-xs before:bg-[url('/assets/mod.png')] before:bg-no-repeat before:h-4 before:w-3.5 before:content-[''] before:float-left before:pr-1.5">
                    {moderatorRole === 'moderator' ? t('you_are_moderator') : moderatorRole === 'admin' ? t('you_are_admin') : t('you_are_owner')}
                  </div>
                )}
              </div>
              {description && description.length > 0 && (
                <div>
                  {title && title.length > 0 && (
                    <div className='pt-1.5 text-gray-700 dark:text-gray-300'>
                      <strong>{title}</strong>
                    </div>
                  )}
                  <div className='py-1.5 break-words text-gray-700 dark:text-gray-300 leading-4 -mr-1.5 -mb-1.5'>
                    <Markdown content={description} />
                  </div>
                </div>
              )}
              {rules && rules.length > 0 && <RulesList rules={rules} />}
              <div className='border-t border-gray-300 dark:border-gray-600 text-gray-500 pt-0.5 text-xs -mr-1.5'>
                {t('created_by', { creatorAddress: '' })}
                <span>{`u/${creatorAddress}`}</span>
                {createdAt && <span className='float-right'> {t('community_for', { date: getFormattedTimeDuration(createdAt) })}</span>}
                <div className='mt-2.5 lowercase'>
                  {showBlockConfirm ? (
                    <span className='text-red-500'>
                      {t('are_you_sure')}{' '}
                      <span className='text-gray-500 font-bold cursor-pointer' onClick={handleBlock}>
                        {t('yes')}
                      </span>
                      {' / '}
                      <span className='text-gray-500 font-bold cursor-pointer' onClick={cancelBlock}>
                        {t('no')}
                      </span>
                    </span>
                  ) : (
                    <span className='pt-2.5 font-bold text-gray-500 cursor-pointer' onClick={blockConfirm}>
                      {blocked ? t('unblock_community') : t('block_community')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        {(moderatorRole || isOwner) && <ModerationTools address={address} />}
        {isInSubplebbitsView && (
          <a href='https://github.com/plebbit/lists' target='_blank' rel='noopener noreferrer'>
            <div className='text-center relative border border-gray-400 dark:border-gray-600 bg-white dark:bg-gray-800 bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 text-xl font-bold tracking-tight leading-7 h-7 cursor-pointer mb-3 text-gray-800 dark:text-gray-200 -mr-1.5 hover:bg-gradient-to-b hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-800 dark:hover:to-blue-900 hover:border-blue-500 hover:text-white dark:hover:text-white'>
              <div className='absolute -top-px -right-px h-8 w-6 bg-white dark:bg-gray-800 bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 bg-no-repeat' />
              {t('submit_community')}
            </div>
          </a>
        )}
        <div
          className='text-center relative border border-gray-400 dark:border-gray-600 bg-white dark:bg-gray-800 bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 text-xl font-bold tracking-tight leading-7 h-7 cursor-pointer mb-3 text-gray-800 dark:text-gray-200 -mr-1.5 hover:bg-gradient-to-b hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-800 dark:hover:to-blue-900 hover:border-blue-500 hover:text-white dark:hover:text-white'
          onClick={handleCreateCommunity}
        >
          {t('create_your_community')}
          <div className='absolute -top-px -right-px h-8 w-6 bg-white dark:bg-gray-800 bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 bg-no-repeat' />
        </div>
        <div className='relative mt-2.5 py-1.5 pl-11 min-h-10 my-2 mb-3'>
          <span className='inline-block mr-2.5 absolute top-0 left-1.5 block h-10 w-10'>
            <img className='h-11' src='assets/sprout/sprout-2.png' alt='' />
          </span>
          {subtitle1 && <div className='ml-4 text-gray-400 text-xs'>{subtitle1}</div>}
          {subtitle2 && <div className='ml-4 text-gray-400 text-xs'>{subtitle2}</div>}
        </div>
        {roles && Object.keys(roles).length > 0 && <ModeratorsList roles={roles} />}
        {(!(isMobile && isInHomeAboutView) || isInSubplebbitAboutView || isInPostPageAboutView) && <Footer />}
        {address && !(moderatorRole || isOwner) && (
          <div className='my-2 mb-3 text-center lowercase'>
            <Link className='text-blue-600 dark:text-blue-400 no-underline' to={`/p/${address}/settings`}>
              {t('community_settings')}
            </Link>
          </div>
        )}
        {isMobile && isInHomeAboutView && <FAQ />}
      </div>
    </div>
  );
};

export default Sidebar;
