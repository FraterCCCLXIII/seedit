import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAccount, useAccountComment, useSubplebbit } from '@plebbit/plebbit-react-hooks';
import Plebbit from '@plebbit/plebbit-js';
import { sortTypes } from '../../constants/sort-types';
import { sortLabels } from '../../constants/sort-labels';
import {
  getAboutLink,
  isAllView,
  isAllAboutView,
  isAuthorView,
  isAuthorCommentsView,
  isAuthorSubmittedView,
  isCreateSubplebbitView,
  isHomeAboutView,
  isHomeView,
  isInboxView,
  isModView,
  isPendingPostView,
  isPostPageView,
  isProfileView,
  isProfileCommentsView,
  isProfileDownvotedView,
  isProfileSubmittedView,
  isProfileHiddenView,
  isSettingsView,
  isSubmitView,
  isSubplebbitView,
  isSubplebbitSettingsView,
  isSubplebbitSubmitView,
  isSubplebbitsView,
  isSubplebbitsSubscriberView,
  isSubplebbitsModeratorView,
  isSubplebbitsAdminView,
  isSubplebbitsVoteView,
  isSubplebbitsOwnerView,
  isProfileUpvotedView,
  isSettingsContentOptionsView,
  isSettingsPlebbitOptionsView,
  isSubplebbitAboutView,
  isDomainView,
  isPostPageAboutView,
  isSettingsAccountDataView,
} from '../../lib/utils/view-utils';
import useContentOptionsStore from '../../stores/use-content-options-store';
import useNotFoundStore from '../../stores/use-not-found-store';
import { useIsBroadlyNsfwSubplebbit } from '../../hooks/use-is-broadly-nsfw-subplebbit';
import useTheme from '../../hooks/use-theme';
import useWindowWidth from '../../hooks/use-window-width';

const AboutButton = () => {
  const { t } = useTranslation();
  const params = useParams();
  const location = useLocation();
  const aboutLink = getAboutLink(location.pathname, params);
  const isInHomeAboutView = isHomeAboutView(location.pathname);
  const isInPostPageAboutView = isPostPageAboutView(location.pathname, params);
  const isInSubplebbitAboutView = isSubplebbitAboutView(location.pathname, params);

  return (
    <li className={`inline-flex items-end font-bold mx-1 leading-[1.3] ${isInHomeAboutView || isInSubplebbitAboutView || isInPostPageAboutView ? 'selected' : 'choice'}`}>
      <Link
        to={aboutLink}
        className={
          isInHomeAboutView || isInSubplebbitAboutView || isInPostPageAboutView
            ? 'px-1.5 pt-0.5 pb-0 bg-white dark:bg-gray-900 text-green-500 border border-gray-300 dark:border-gray-600 border-b-white dark:border-b-gray-900 inline-flex items-end -mb-px'
            : 'px-1.5 pt-0.5 pb-0 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 no-underline'
        }
      >
        {t('about')}
      </Link>
    </li>
  );
};

const CommentsButton = () => {
  const { t } = useTranslation();
  const params = useParams();
  const location = useLocation();
  const isInPostPageView = isPostPageView(location.pathname, params);
  const isInPendingPostView = isPendingPostView(location.pathname, params);
  const isInHomeAboutView = isHomeAboutView(location.pathname);
  const isInPostPageAboutView = isPostPageAboutView(location.pathname, params);

  return (
    <li
      className={`inline-flex items-end font-bold mx-1 leading-[1.3] ${
        (isInPostPageView || isInPendingPostView) && !isInHomeAboutView && !isInPostPageAboutView ? 'selected' : 'choice'
      }`}
    >
      <Link
        to={`/p/${params.subplebbitAddress}/c/${params.commentCid}`}
        onClick={(e) => isInPendingPostView && e.preventDefault()}
        className={
          (isInPostPageView || isInPendingPostView) && !isInHomeAboutView && !isInPostPageAboutView
            ? 'px-1.5 pt-0.5 pb-0 bg-white dark:bg-gray-900 text-green-500 border border-gray-300 dark:border-gray-600 border-b-white dark:border-b-gray-900 inline-flex items-end -mb-px'
            : 'px-1.5 pt-0.5 pb-0 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 no-underline'
        }
      >
        {t('comments')}
      </Link>
    </li>
  );
};

const SortItems = () => {
  const { t } = useTranslation();
  const params = useParams();
  const location = useLocation();
  const isInHomeAboutView = isHomeAboutView(location.pathname);
  const isInPostPageAboutView = isPostPageAboutView(location.pathname, params);
  const isInSubplebbitAboutView = isSubplebbitAboutView(location.pathname, params);
  const isInAllView = isAllView(location.pathname);
  const isInModView = isModView(location.pathname);
  const isInDomainView = isDomainView(location.pathname);
  const isInSubplebbitView = isSubplebbitView(location.pathname, params);
  const [selectedSortType, setSelectedSortType] = useState(params.sortType || '/hot');
  const timeFilterName = params.timeFilterName;

  useEffect(() => {
    if (isInHomeAboutView || isInSubplebbitAboutView || isInPostPageAboutView) {
      setSelectedSortType('');
    } else if (params.sortType) {
      setSelectedSortType(params.sortType);
    } else {
      setSelectedSortType('hot');
    }
  }, [params.sortType, isInHomeAboutView, isInSubplebbitAboutView, isInPostPageAboutView]);

  return sortTypes.map((sortType, index) => {
    let sortLink = isInSubplebbitView
      ? `/p/${params.subplebbitAddress}/${sortType}`
      : isInAllView
      ? `p/all/${sortType}`
      : isInModView
      ? `p/mod/${sortType}`
      : isInDomainView
      ? `domain/${params.domain}/${sortType}`
      : sortType;
    if (timeFilterName) {
      sortLink = sortLink + `/${timeFilterName}`;
    }
    return (
      <li key={sortType} className={`inline-flex items-end font-bold mx-1 leading-[1.3] ${selectedSortType === sortType ? 'selected' : 'choice'}`}>
        <Link
          to={sortLink}
          onClick={() => setSelectedSortType(sortType)}
          className={
            selectedSortType === sortType
              ? 'px-1.5 pt-0.5 pb-0 bg-white dark:bg-gray-900 text-green-500 border border-gray-300 dark:border-gray-600 border-b-white dark:border-b-gray-900 inline-flex items-end -mb-px'
              : 'px-1.5 pt-0.5 pb-0 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 no-underline'
          }
        >
          {t(sortLabels[index])}
        </Link>
      </li>
    );
  });
};

const AuthorHeaderTabs = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const params = useParams();
  const isInAuthorView = isAuthorView(location.pathname);
  const isInAuthorCommentsView = isAuthorCommentsView(location.pathname, params);
  const isInAuthorSubmittedView = isAuthorSubmittedView(location.pathname, params);
  const isInProfileDownvotedView = isProfileDownvotedView(location.pathname);
  const isInProfileView = isProfileView(location.pathname);
  const isInProfileCommentsView = isProfileCommentsView(location.pathname);
  const isInProfileSubmittedView = isProfileSubmittedView(location.pathname);
  const isInProfileUpvotedView = isProfileUpvotedView(location.pathname);
  const isInProfileHiddenView = isProfileHiddenView(location.pathname);

  const authorRoute = `/u/${params.authorAddress}/c/${params.commentCid}`;
  const overviewSelectedClass =
    (isInProfileView || isInAuthorView) &&
    !isInProfileUpvotedView &&
    !isInProfileDownvotedView &&
    !isInProfileCommentsView &&
    !isInProfileSubmittedView &&
    !isInAuthorCommentsView &&
    !isInProfileHiddenView &&
    !isInAuthorSubmittedView
      ? 'px-1.5 pt-0.5 pb-0 bg-white dark:bg-gray-900 text-green-500 border border-gray-300 dark:border-gray-600 border-b-white dark:border-b-gray-900 inline-flex items-end -mb-px'
      : 'px-1.5 pt-0.5 pb-0 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 no-underline';

  return (
    <>
      <li className='inline-flex items-end font-bold mx-1 leading-[1.3]'>
        <Link to={isInAuthorView ? authorRoute : '/profile'} className={overviewSelectedClass}>
          {t('overview')}
        </Link>
      </li>
      <li className='inline-flex items-end font-bold mx-1 leading-[1.3]'>
        <Link
          to={isInAuthorView ? authorRoute + '/comments' : '/profile/comments'}
          className={
            isInProfileCommentsView || isInAuthorCommentsView
              ? 'px-1.5 pt-0.5 pb-0 bg-white dark:bg-gray-900 text-green-500 border border-gray-300 dark:border-gray-600 border-b-white dark:border-b-gray-900 inline-flex items-end -mb-px'
              : 'px-1.5 pt-0.5 pb-0 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 no-underline'
          }
        >
          {t('comments')}
        </Link>
      </li>
      <li className='inline-flex items-end font-bold mx-1 leading-[1.3]'>
        <Link
          to={isInAuthorView ? authorRoute + '/submitted' : '/profile/submitted'}
          className={
            isInProfileSubmittedView || isInAuthorSubmittedView
              ? 'px-1.5 pt-0.5 pb-0 bg-white dark:bg-gray-900 text-green-500 border border-gray-300 dark:border-gray-600 border-b-white dark:border-b-gray-900 inline-flex items-end -mb-px'
              : 'px-1.5 pt-0.5 pb-0 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 no-underline'
          }
        >
          {t('submitted')}
        </Link>
      </li>
      {isInProfileView && (
        <>
          <li className='inline-flex items-end font-bold mx-1 leading-[1.3]'>
            <Link
              to='/profile/upvoted'
              className={
                isInProfileUpvotedView
                  ? 'px-1.5 pt-0.5 pb-0 bg-white dark:bg-gray-900 text-green-500 border border-gray-300 dark:border-gray-600 border-b-white dark:border-b-gray-900 inline-flex items-end -mb-px'
                  : 'px-1.5 pt-0.5 pb-0 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 no-underline'
              }
            >
              {t('upvoted')}
            </Link>
          </li>
          <li className='inline-flex items-end font-bold mx-1 leading-[1.3]'>
            <Link
              to='/profile/downvoted'
              className={
                isInProfileDownvotedView
                  ? 'px-1.5 pt-0.5 pb-0 bg-white dark:bg-gray-900 text-green-500 border border-gray-300 dark:border-gray-600 border-b-white dark:border-b-gray-900 inline-flex items-end -mb-px'
                  : 'px-1.5 pt-0.5 pb-0 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 no-underline'
              }
            >
              {t('downvoted')}
            </Link>
          </li>
          <li className='inline-flex items-end font-bold mx-1 leading-[1.3]'>
            <Link
              to={'/profile/hidden'}
              className={
                isInProfileHiddenView
                  ? 'px-1.5 pt-0.5 pb-0 bg-white dark:bg-gray-900 text-green-500 border border-gray-300 dark:border-gray-600 border-b-white dark:border-b-gray-900 inline-flex items-end -mb-px'
                  : 'px-1.5 pt-0.5 pb-0 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 no-underline'
              }
            >
              {t('hidden')}
            </Link>
          </li>
          {/* TODO: implement functionality from API once available
          <li>
            <Link to={'/'} className="px-1.5 pt-0.5 pb-0 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 no-underline" onClick={(e) => e.preventDefault()}>
              {t('saved')}
            </Link>
          </li> */}
        </>
      )}
    </>
  );
};

const InboxHeaderTabs = () => {
  const { t } = useTranslation();

  return (
    <>
      <li className='inline-flex items-end font-bold mx-1 leading-[1.3]'>
        <Link
          to={'/inbox'}
          className='px-1.5 pt-0.5 pb-0 bg-white dark:bg-gray-900 text-green-500 border border-gray-300 dark:border-gray-600 border-b-white dark:border-b-gray-900 inline-flex items-end -mb-px'
        >
          {t('inbox')}
        </Link>
      </li>
      {/* TODO: add tabs for messaging when available in the API */}
    </>
  );
};

const SubplebbitsHeaderTabs = () => {
  const { t } = useTranslation();
  const location = useLocation();
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

  return (
    <>
      <li className='inline-flex items-end font-bold mx-1 leading-[1.3]'>
        <Link
          to={'/communities/vote'}
          className={
            isInSubplebbitsVoteView
              ? 'px-1.5 pt-0.5 pb-0 bg-white dark:bg-gray-900 text-green-500 border border-gray-300 dark:border-gray-600 border-b-white dark:border-b-gray-900 inline-flex items-end -mb-px'
              : 'px-1.5 pt-0.5 pb-0 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 no-underline'
          }
        >
          {t('vote')}
        </Link>
      </li>
      <li className='inline-flex items-end font-bold mx-1 leading-[1.3]'>
        <Link
          to={'/communities'}
          className={
            isInSubplebbitsSubscriberView || isInSubplebbitsModeratorView || isInSubplebbitsAdminView || isInSubplebbitsOwnerView || isInSubplebbitsView
              ? 'px-1.5 pt-0.5 pb-0 bg-white dark:bg-gray-900 text-green-500 border border-gray-300 dark:border-gray-600 border-b-white dark:border-b-gray-900 inline-flex items-end -mb-px'
              : 'px-1.5 pt-0.5 pb-0 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 no-underline'
          }
        >
          {t('my_communities')}
        </Link>
      </li>
    </>
  );
};

const SettingsHeaderTabs = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const isInSettingsPlebbitOptionsView = isSettingsPlebbitOptionsView(location.pathname);
  const isInSettingsContentOptionsView = isSettingsContentOptionsView(location.pathname);
  const isInSettingsAccountDataView = isSettingsAccountDataView(location.pathname);

  return (
    <>
      <li className='inline-flex items-end font-bold mx-1 leading-[1.3]'>
        <Link
          to={'/settings'}
          className={
            isInSettingsPlebbitOptionsView || isInSettingsContentOptionsView || isInSettingsAccountDataView
              ? 'px-1.5 pt-0.5 pb-0 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 no-underline'
              : 'px-1.5 pt-0.5 pb-0 bg-white dark:bg-gray-900 text-green-500 border border-gray-300 dark:border-gray-600 border-b-white dark:border-b-gray-900 inline-flex items-end -mb-px'
          }
        >
          {t('general')}
        </Link>
      </li>
      <li className='inline-flex items-end font-bold mx-1 leading-[1.3]'>
        <Link
          to={'/settings/content-options'}
          className={
            isInSettingsContentOptionsView
              ? 'px-1.5 pt-0.5 pb-0 bg-white dark:bg-gray-900 text-green-500 border border-gray-300 dark:border-gray-600 border-b-white dark:border-b-gray-900 inline-flex items-end -mb-px'
              : 'px-1.5 pt-0.5 pb-0 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 no-underline'
          }
        >
          {t('content_options')}
        </Link>
      </li>
      <li className='inline-flex items-end font-bold mx-1 leading-[1.3]'>
        <Link
          to={'/settings/plebbit-options'}
          className={
            isInSettingsPlebbitOptionsView
              ? 'px-1.5 pt-0.5 pb-0 bg-white dark:bg-gray-900 text-green-500 border border-gray-300 dark:border-gray-600 border-b-white dark:border-b-gray-900 inline-flex items-end -mb-px'
              : 'px-1.5 pt-0.5 pb-0 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 no-underline'
          }
        >
          {t('plebbit_options')}
        </Link>
      </li>
    </>
  );
};

const HeaderTabs = () => {
  const { t } = useTranslation();
  const params = useParams();
  const location = useLocation();
  const isInAllView = isAllView(location.pathname);
  const isInAuthorView = isAuthorView(location.pathname);
  const isInDomainView = isDomainView(location.pathname);
  const isInHomeAboutView = isHomeAboutView(location.pathname);
  const isInPostPageAboutView = isPostPageAboutView(location.pathname, params);
  const isInHomeView = isHomeView(location.pathname);
  const isInInboxView = isInboxView(location.pathname);
  const isInModView = isModView(location.pathname);
  const isInPendingPostView = isPendingPostView(location.pathname, params);
  const isInPostPageView = isPostPageView(location.pathname, params);
  const isInProfileView = isProfileView(location.pathname);
  const isInSubplebbitView = isSubplebbitView(location.pathname, params);
  const isInSubplebbitSettingsView = isSubplebbitSettingsView(location.pathname, params);
  const isInSubplebbitSubmitView = isSubplebbitSubmitView(location.pathname, params);
  const isInSubplebbitsView = isSubplebbitsView(location.pathname);
  const isInCreateSubplebbitView = isCreateSubplebbitView(location.pathname);
  const isInSettingsView = isSettingsView(location.pathname);
  const isInSettingsContentOptionsView = isSettingsContentOptionsView(location.pathname);
  const isInSettingsPlebbitOptionsView = isSettingsPlebbitOptionsView(location.pathname);

  if (isInPostPageView || isInPendingPostView) {
    return <CommentsButton />;
  } else if (
    isInHomeView ||
    isInHomeAboutView ||
    isInPostPageAboutView ||
    (isInSubplebbitView && !isInSubplebbitSubmitView && !isInSubplebbitSettingsView) ||
    isInAllView ||
    isInModView ||
    isInDomainView
  ) {
    return <SortItems />;
  } else if (isInProfileView || isInAuthorView) {
    return <AuthorHeaderTabs />;
  } else if (isInPendingPostView) {
    return <span className='font-bold text-sm text-gray-900 dark:text-gray-100'>{t('pending')}</span>;
  } else if (isInInboxView) {
    return <InboxHeaderTabs />;
  } else if (isInSubplebbitsView && !isInCreateSubplebbitView) {
    return <SubplebbitsHeaderTabs />;
  } else if (isInSettingsView || isInSettingsPlebbitOptionsView || isInSettingsContentOptionsView) {
    return <SettingsHeaderTabs />;
  }
  return null;
};

const HeaderTitle = ({ title, pendingPostSubplebbitAddress }: { title: string; pendingPostSubplebbitAddress?: string }) => {
  const account = useAccount();
  const { t } = useTranslation();
  const params = useParams();
  const location = useLocation();
  const isInAllView = isAllView(location.pathname);
  const isInAuthorView = isAuthorView(location.pathname);
  const isInDomainView = isDomainView(location.pathname);
  const isInInboxView = isInboxView(location.pathname);
  const isInModView = isModView(location.pathname);
  const isInPendingPostView = isPendingPostView(location.pathname, params);
  const isInPostPageView = isPostPageView(location.pathname, params);
  const isInProfileView = isProfileView(location.pathname);
  const isInSettingsView = isSettingsView(location.pathname);
  const isInSettingsContentOptionsView = isSettingsContentOptionsView(location.pathname);
  const isInSettingsPlebbitOptionsView = isSettingsPlebbitOptionsView(location.pathname);
  const isInSubmitView = isSubmitView(location.pathname);
  const isInSubplebbitView = isSubplebbitView(location.pathname, params);
  const isInSubplebbitSubmitView = isSubplebbitSubmitView(location.pathname, params);
  const isInSubplebbitSettingsView = isSubplebbitSettingsView(location.pathname, params);
  const isInSubplebbitsView = isSubplebbitsView(location.pathname);
  const isInCreateSubplebbitView = isCreateSubplebbitView(location.pathname);
  const isInNotFoundView = useNotFoundStore((state) => state.isNotFound);

  const subplebbitAddress = params.subplebbitAddress;

  const { hideAdultCommunities, hideGoreCommunities, hideAntiCommunities, hideVulgarCommunities } = useContentOptionsStore();
  const hasUnhiddenAnyNsfwCommunity = !hideAdultCommunities || !hideGoreCommunities || !hideAntiCommunities || !hideVulgarCommunities;
  const isBroadlyNsfwSubplebbit = useIsBroadlyNsfwSubplebbit(subplebbitAddress || '');

  const subplebbitTitle = (
    <Link to={`/p/${isInPendingPostView ? pendingPostSubplebbitAddress : subplebbitAddress}`}>
      {title ||
        (subplebbitAddress && Plebbit.getShortAddress(subplebbitAddress)) ||
        (pendingPostSubplebbitAddress && Plebbit.getShortAddress(pendingPostSubplebbitAddress))}
    </Link>
  );
  const domainTitle = <Link to={`/domain/${params.domain}`}>{params.domain}</Link>;
  const submitTitle = <span className='uppercase text-[11px]'>{t('submit')}</span>;
  const profileTitle = <Link to='/profile'>{account?.author?.shortAddress}</Link>;
  const authorTitle = <Link to={`/u/${params.authorAddress}/c/${params.commentCid}`}>{params.authorAddress && Plebbit.getShortAddress(params.authorAddress)}</Link>;

  if (isBroadlyNsfwSubplebbit && !hasUnhiddenAnyNsfwCommunity) {
    return <span>{t('over_18')}</span>;
  } else if (isInSubplebbitSubmitView) {
    return (
      <>
        {subplebbitTitle}: {submitTitle}
      </>
    );
  } else if (isInSubplebbitSettingsView) {
    return (
      <>
        {subplebbitTitle}: <span className='lowercase'>{t('community_settings')}</span>
      </>
    );
  } else if (isInSubmitView) {
    return submitTitle;
  } else if (isInSettingsView || isInSettingsPlebbitOptionsView || isInSettingsContentOptionsView) {
    return t('preferences');
  } else if (isInProfileView && !isInPendingPostView) {
    return profileTitle;
  } else if (isInPostPageView || isInPendingPostView || (isInSubplebbitView && !isInSubplebbitSettingsView)) {
    return subplebbitTitle;
  } else if (isInAuthorView) {
    return authorTitle;
  } else if (isInInboxView) {
    return t('messages');
  } else if (isInCreateSubplebbitView) {
    return <span className='lowercase'>{t('create_community')}</span>;
  } else if (isInSubplebbitsView) {
    return t('communities');
  } else if (isInNotFoundView) {
    return <span className='lowercase'>{t('page_not_found')}</span>;
  } else if (isInAllView) {
    return t('all');
  } else if (isInModView) {
    return <span className='lowercase'>{t('communities_you_moderate')}</span>;
  } else if (isInDomainView) {
    return domainTitle;
  }
  return null;
};

const Header = () => {
  const { t } = useTranslation();
  const [theme] = useTheme();
  const location = useLocation();
  const params = useParams();
  const subplebbit = useSubplebbit({ subplebbitAddress: params?.subplebbitAddress, onlyIfCached: true });
  const { suggested, title } = subplebbit || {};

  const commentIndex = params?.accountCommentIndex ? parseInt(params?.accountCommentIndex) : undefined;
  const accountComment = useAccountComment({ commentIndex });

  const isMobile = useWindowWidth() < 640;
  const isInAllAboutView = isAllAboutView(location.pathname);
  const isInAllView = isAllView(location.pathname);
  const isInAuthorView = isAuthorView(location.pathname);
  const isInDomainView = isDomainView(location.pathname);
  const isInHomeView = isHomeView(location.pathname);
  const isInHomeAboutView = isHomeAboutView(location.pathname);
  const isInInboxView = isInboxView(location.pathname);
  const isInModView = isModView(location.pathname);
  const isInPostPageView = isPostPageView(location.pathname, params);
  const isInPostPageAboutView = isPostPageAboutView(location.pathname, params);
  const isInPendingPostView = isPendingPostView(location.pathname, params);
  const isInProfileView = isProfileView(location.pathname);
  const isInSettingsView = isSettingsView(location.pathname);
  const isInSubplebbitView = isSubplebbitView(location.pathname, params);
  const isInSubplebbitAboutView = isSubplebbitAboutView(location.pathname, params);
  const isInSubmitView = isSubmitView(location.pathname);
  const isInSubplebbitSubmitView = isSubplebbitSubmitView(location.pathname, params);
  const isInSubplebbitSettingsView = isSubplebbitSettingsView(location.pathname, params);
  const isInNotFoundView = useNotFoundStore((state) => state.isNotFound);

  const hasFewTabs =
    isInPostPageView || isInSubmitView || isInSubplebbitSubmitView || isInSubplebbitSettingsView || isInSettingsView || isInInboxView || isInSettingsView;
  const hasStickyHeader =
    isInHomeView ||
    isInNotFoundView ||
    (isInSubplebbitView &&
      !isInSubplebbitSubmitView &&
      !isInSubplebbitSettingsView &&
      !isInPostPageView &&
      !isInHomeAboutView &&
      !isInSubplebbitAboutView &&
      !isInPostPageAboutView) ||
    (isInProfileView && !isInHomeAboutView) ||
    (isInAllView && !isInAllAboutView) ||
    (isInModView && !isInHomeAboutView) ||
    (isInDomainView && !isInHomeAboutView) ||
    (isInAuthorView && !isInHomeAboutView);

  const subplebbitAddress = params.subplebbitAddress;

  const contentOptionsStore = useContentOptionsStore();
  const hasUnhiddenAnyNsfwCommunity =
    !contentOptionsStore.hideAdultCommunities ||
    !contentOptionsStore.hideGoreCommunities ||
    !contentOptionsStore.hideAntiCommunities ||
    !contentOptionsStore.hideVulgarCommunities;
  const isBroadlyNsfwSubplebbit = useIsBroadlyNsfwSubplebbit(subplebbitAddress || '');

  const logoIsAvatar = isInSubplebbitView && suggested?.avatarUrl && !(isBroadlyNsfwSubplebbit && !hasUnhiddenAnyNsfwCommunity);
  const logoSrc = logoIsAvatar ? suggested?.avatarUrl : 'assets/sprout/sprout.png';
  const logoLink = '/';

  const mobileSubmitButtonRoute =
    isInHomeView || isInHomeAboutView || isInAllView || isInModView || isInDomainView
      ? '/submit'
      : isInPendingPostView
      ? `/p/${accountComment?.subplebbitAddress}/submit`
      : subplebbitAddress
      ? `/p/${subplebbitAddress}/submit`
      : '/submit';

  return (
    <div className='border-b border-gray-300 dark:border-gray-600 relative bg-white dark:bg-gray-900 text-xs flex flex-col'>
      <div
        className={`flex items-end justify-start whitespace-nowrap h-[45px] ${hasFewTabs ? 'pb-0' : ''} ${
          isInSubmitView && isInSubplebbitSubmitView && !isInSubplebbitView && isMobile ? '-mb-1' : ''
        } ${hasStickyHeader ? 'pt-5' : ''}`}
      >
        <div className='relative top-0 left-0'>
          <Link to={logoLink} className='cursor-pointer'>
            {(logoIsAvatar || (!isInSubplebbitView && !isInProfileView && !isInAuthorView) || !logoIsAvatar) && (
              <img className={`${logoIsAvatar ? 'max-h-10 mx-1' : 'max-h-10 mr-1 ml-1 opacity-90'}`} src={logoSrc} alt='' />
            )}
            {((!isInSubplebbitView && !isInProfileView && !isInAuthorView) || !logoIsAvatar) && (
              <img src={`assets/sprout/seedit-text-${theme === 'dark' ? 'dark' : 'light'}.svg`} className='w-[84px] max-h-[26px] mt-4 pr-1 opacity-90' alt='' />
            )}
          </Link>
        </div>
        {!isInHomeView && !isInHomeAboutView && !isInModView && !isInAllView && (
          <span className={`font-bold text-sm text-gray-900 dark:text-gray-100 ${!logoIsAvatar ? 'pl-2' : ''}`}>
            <HeaderTitle title={title} pendingPostSubplebbitAddress={accountComment?.subplebbitAddress} />
          </span>
        )}
        {(isInModView || isInAllView) && (
          <div className={`font-bold text-sm text-gray-900 dark:text-gray-100 absolute ${isMobile ? 'top-[46px] left-[138px]' : 'top-[26px] left-[140px]'}`}>
            <HeaderTitle title={title} pendingPostSubplebbitAddress={accountComment?.subplebbitAddress} />
          </div>
        )}
        {!isMobile && !(isBroadlyNsfwSubplebbit && !hasUnhiddenAnyNsfwCommunity) && (
          <ul className='list-none whitespace-nowrap flex items-end lowercase pl-2'>
            <HeaderTabs />
            {(isInHomeView || isInHomeAboutView) && <AboutButton />}
          </ul>
        )}
      </div>
      {isMobile && !isInSubplebbitSubmitView && !(isBroadlyNsfwSubplebbit && !hasUnhiddenAnyNsfwCommunity) && (
        <ul className={`list-none whitespace-nowrap flex items-end lowercase pl-0 ${isInProfileView ? 'flex overflow-x-auto scrollbar-none' : ''}`}>
          <HeaderTabs />
          {(isInHomeView || isInHomeAboutView || isInSubplebbitView || isInHomeAboutView || isInPostPageView) && <AboutButton />}
          {!isInSubmitView && !isInSettingsView && (
            <li className='inline-flex items-end font-bold mx-1 leading-[1.3] order-3 mb-1 ml-1'>
              <Link to={mobileSubmitButtonRoute} className='px-1.5 pt-0.5 pb-0 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 no-underline'>
                {t('submit')}
              </Link>
            </li>
          )}
        </ul>
      )}
    </div>
  );
};

export default Header;
