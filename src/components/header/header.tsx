import { Link, useLocation, useParams } from 'react-router-dom';
import { useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAccount, useAccountComment, useSubplebbit } from '@bitsocialnet/bitsocial-react-hooks';
import Plebbit from '@plebbit/plebbit-js';
import { sortTypes } from '../../constants/sort-types';
import { sortLabels } from '../../constants/sort-labels';
import {
  getAboutLink,
  isAllView,
  isAuthorView,
  isAuthorCommentsView,
  isAuthorSubmittedView,
  isAuthorAboutView,
  isProfileAboutView,
  isCreateSubplebbitView,
  isHomeAboutView,
  isHomeView,
  isInboxView,
  isSearchView,
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
  isProfileUpvotedView,
  isSettingsContentOptionsView,
  isSettingsPlebbitOptionsView,
  isSubplebbitAboutView,
  isDomainView,
  isPostPageAboutView,
  isSettingsAccountDataView,
  type ParamsType,
} from '../../lib/utils/view-utils';
import { mergeFeedShellRouteParams } from '../../lib/utils/feed-shell-route-params';
import useContentOptionsStore from '../../stores/use-content-options-store';
import useNotFoundStore from '../../stores/use-not-found-store';
import { useIsBroadlyNsfwSubplebbit } from '../../hooks/use-is-broadly-nsfw-subplebbit';
import useWindowWidth from '../../hooks/use-window-width';
import CommunityFeedHeader from '../community-feed-header/community-feed-header';
import { useFeedShellLayout } from '../layout';
import { FeedNavLogoMark } from '../layout/feed-nav-logo-mark';
import UserFeedHeader from '../user-feed-header/user-feed-header';
import { HeaderTabOverflowList, type HeaderTabItem } from './header-tab-overflow-list';
import styles from './header.module.css';

const AboutButton = () => {
  const { t } = useTranslation();
  const rawParams = useParams() as ParamsType;
  const location = useLocation();
  const params = mergeFeedShellRouteParams(rawParams, location.pathname);
  const aboutLink = getAboutLink(location.pathname, params);
  const isInHomeAboutView = isHomeAboutView(location.pathname);
  const isInPostPageAboutView = isPostPageAboutView(location.pathname, params);
  const isInSubplebbitAboutView = isSubplebbitAboutView(location.pathname, params);

  return (
    <li data-header-tab-trailing className={`${styles.about} ${isInHomeAboutView || isInSubplebbitAboutView || isInPostPageAboutView ? styles.selected : styles.choice}`}>
      <Link to={aboutLink}>{t('about')}</Link>
    </li>
  );
};

function useHeaderTabItems(): HeaderTabItem[] | null {
  const { t } = useTranslation();
  const rawParams = useParams() as ParamsType;
  const location = useLocation();
  const params = mergeFeedShellRouteParams(rawParams, location.pathname);
  const isInAllView = isAllView(location.pathname);
  const isInAuthorView = isAuthorView(location.pathname);
  const isInAuthorCommentsView = isAuthorCommentsView(location.pathname, params);
  const isInAuthorSubmittedView = isAuthorSubmittedView(location.pathname, params);
  const isInAuthorAboutView = isAuthorAboutView(location.pathname, params);
  const isInDomainView = isDomainView(location.pathname);
  const isInHomeAboutView = isHomeAboutView(location.pathname);
  const isInPostPageAboutView = isPostPageAboutView(location.pathname, params);
  const isInHomeView = isHomeView(location.pathname);
  const isInInboxView = isInboxView(location.pathname);
  const isInSearchView = isSearchView(location.pathname);
  const isInModView = isModView(location.pathname);
  const isInPendingPostView = isPendingPostView(location.pathname, params);
  const isInPostPageView = isPostPageView(location.pathname, params);
  const isInProfileAboutView = isProfileAboutView(location.pathname);
  const isInProfileCommentsView = isProfileCommentsView(location.pathname);
  const isInProfileDownvotedView = isProfileDownvotedView(location.pathname);
  const isInProfileHiddenView = isProfileHiddenView(location.pathname);
  const isInProfileSubmittedView = isProfileSubmittedView(location.pathname);
  const isInProfileUpvotedView = isProfileUpvotedView(location.pathname);
  const isInProfileView = isProfileView(location.pathname);
  const isInSubplebbitView = isSubplebbitView(location.pathname, params);
  const isInSubplebbitSettingsView = isSubplebbitSettingsView(location.pathname, params);
  const isInSubplebbitSubmitView = isSubplebbitSubmitView(location.pathname, params);
  const isInSubplebbitsView = isSubplebbitsView(location.pathname);
  const isInCreateSubplebbitView = isCreateSubplebbitView(location.pathname);
  const isInSettingsView = isSettingsView(location.pathname);
  const isInSettingsAccountDataView = isSettingsAccountDataView(location.pathname);
  const isInSettingsContentOptionsView = isSettingsContentOptionsView(location.pathname);
  const isInSettingsPlebbitOptionsView = isSettingsPlebbitOptionsView(location.pathname);
  const isInSubplebbitAboutView = isSubplebbitAboutView(location.pathname, params);

  return useMemo((): HeaderTabItem[] | null => {
    if (isInPostPageView || isInPendingPostView) {
      const commentsSelected = (isInPostPageView || isInPendingPostView) && !isInHomeAboutView && !isInPostPageAboutView;
      return [
        {
          id: 'comments',
          to: `/s/${params.subplebbitAddress}/c/${params.commentCid}`,
          label: t('comments'),
          selected: commentsSelected,
          preventNavigation: isInPendingPostView,
        },
      ];
    }
    if (
      isInHomeView ||
      isInHomeAboutView ||
      isInPostPageAboutView ||
      (isInSubplebbitView && !isInSubplebbitSubmitView && !isInSubplebbitSettingsView) ||
      isInAllView ||
      isInModView ||
      isInDomainView
    ) {
      const selectedSortType = isInHomeAboutView || isInSubplebbitAboutView || isInPostPageAboutView ? '' : params.sortType || 'hot';
      const timeFilterName = params.timeFilterName;
      return sortTypes.map((sortType, index) => {
        let sortLink = isInSubplebbitView
          ? `/s/${params.subplebbitAddress}/${sortType}`
          : isInAllView
            ? `/s/all/${sortType}`
            : isInModView
              ? `/s/mod/${sortType}`
              : isInDomainView
                ? `/domain/${params.domain}/${sortType}`
                : sortType;
        if (timeFilterName) {
          sortLink = sortLink + `/${timeFilterName}`;
        }
        return {
          id: `sort-${sortType}`,
          to: sortLink,
          label: t(sortLabels[index]),
          selected: selectedSortType === sortType,
        };
      });
    }
    if (isInProfileView || isInAuthorView) {
      const authorRoute = `/u/${params.authorAddress}/c/${params.commentCid}`;
      const overviewSelected =
        (isInProfileView || isInAuthorView) &&
        !isInProfileUpvotedView &&
        !isInProfileDownvotedView &&
        !isInProfileCommentsView &&
        !isInProfileSubmittedView &&
        !isInAuthorCommentsView &&
        !isInProfileHiddenView &&
        !isInAuthorSubmittedView &&
        !isInAuthorAboutView &&
        !isInProfileAboutView;

      const items: HeaderTabItem[] = [
        {
          id: 'overview',
          to: isInAuthorView ? authorRoute : '/profile',
          label: t('overview'),
          selected: overviewSelected,
        },
        {
          id: 'profile-comments',
          to: isInAuthorView ? `${authorRoute}/comments` : '/profile/comments',
          label: t('comments'),
          selected: isInProfileCommentsView || isInAuthorCommentsView,
        },
        {
          id: 'submitted',
          to: isInAuthorView ? `${authorRoute}/submitted` : '/profile/submitted',
          label: t('submitted'),
          selected: isInProfileSubmittedView || isInAuthorSubmittedView,
        },
        {
          id: 'profile-about',
          to: isInAuthorView ? `${authorRoute}/about` : '/profile/about',
          label: t('about'),
          selected: isInAuthorAboutView || isInProfileAboutView,
        },
      ];
      if (isInProfileView) {
        items.push(
          { id: 'upvoted', to: '/profile/upvoted', label: t('upvoted'), selected: isInProfileUpvotedView },
          { id: 'downvoted', to: '/profile/downvoted', label: t('downvoted'), selected: isInProfileDownvotedView },
          { id: 'hidden', to: '/profile/hidden', label: t('hidden'), selected: isInProfileHiddenView },
        );
      }
      return items;
    }
    if (isInInboxView) {
      return null;
    }
    if (isInSubplebbitsView && !isInCreateSubplebbitView) {
      const isMyCommunities = location.pathname === '/communities';
      const isAllCommunities = location.pathname === '/communities/all';
      return [
        { id: 'my-communities', to: '/communities', label: t('my_communities'), selected: isMyCommunities },
        { id: 'all-communities', to: '/communities/all', label: t('all_communities'), selected: isAllCommunities },
      ];
    }
    if (isInSettingsView || isInSettingsPlebbitOptionsView || isInSettingsContentOptionsView) {
      const generalSelected = !isInSettingsPlebbitOptionsView && !isInSettingsContentOptionsView && !isInSettingsAccountDataView;
      return [
        { id: 'settings-general', to: '/settings', label: t('general'), selected: generalSelected },
        {
          id: 'settings-content',
          to: '/settings/content-options',
          label: t('content_options'),
          selected: isInSettingsContentOptionsView,
        },
        {
          id: 'settings-plebbit',
          to: '/settings/plebbit-options',
          label: t('plebbit_options'),
          selected: isInSettingsPlebbitOptionsView,
        },
      ];
    }
    if (isInSearchView) {
      const sp = new URLSearchParams(location.search);
      const q = sp.get('q') || '';
      const tabParam = sp.get('tab') || 'posts';
      const activeTab = ['posts', 'users', 'communities'].includes(tabParam) ? tabParam : 'posts';
      const buildLink = (tab: string) => {
        const next = new URLSearchParams();
        if (q) next.set('q', q);
        next.set('tab', tab);
        return `/search?${next.toString()}`;
      };
      return [
        { id: 'search-posts', to: buildLink('posts'), label: t('search_scope_posts'), selected: activeTab === 'posts' },
        { id: 'search-users', to: buildLink('users'), label: t('search_scope_users'), selected: activeTab === 'users' },
        {
          id: 'search-communities',
          to: buildLink('communities'),
          label: t('search_scope_communities'),
          selected: activeTab === 'communities',
        },
      ];
    }
    return null;
  }, [
    isInAllView,
    isInAuthorAboutView,
    isInAuthorCommentsView,
    isInAuthorSubmittedView,
    isInAuthorView,
    isInCreateSubplebbitView,
    isInDomainView,
    isInHomeAboutView,
    isInHomeView,
    isInInboxView,
    isInModView,
    isInPendingPostView,
    isInPostPageAboutView,
    isInPostPageView,
    isInProfileAboutView,
    isInProfileCommentsView,
    isInProfileDownvotedView,
    isInProfileHiddenView,
    isInProfileSubmittedView,
    isInProfileUpvotedView,
    isInProfileView,
    isInSettingsAccountDataView,
    isInSettingsContentOptionsView,
    isInSettingsPlebbitOptionsView,
    isInSettingsView,
    isInSearchView,
    isInSubplebbitAboutView,
    isInSubplebbitSettingsView,
    isInSubplebbitSubmitView,
    isInSubplebbitView,
    isInSubplebbitsView,
    location.pathname,
    location.search,
    params.commentCid,
    params.domain,
    params.sortType,
    params.subplebbitAddress,
    params.timeFilterName,
    params.authorAddress,
    isInSubplebbitAboutView,
    t,
  ]);
}

const HeaderTitle = ({ title, pendingPostSubplebbitAddress }: { title: string; pendingPostSubplebbitAddress?: string }) => {
  const account = useAccount();
  const { t } = useTranslation();
  const rawParams = useParams() as ParamsType;
  const location = useLocation();
  const params = mergeFeedShellRouteParams(rawParams, location.pathname);
  const isInAllView = isAllView(location.pathname);
  const isInAuthorView = isAuthorView(location.pathname);
  const isInDomainView = isDomainView(location.pathname);
  const isInInboxView = isInboxView(location.pathname);
  const isInSearchView = isSearchView(location.pathname);
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
    <Link to={`/s/${isInPendingPostView ? pendingPostSubplebbitAddress : subplebbitAddress}`}>
      {title ||
        (subplebbitAddress && Plebbit.getShortAddress({ address: subplebbitAddress })) ||
        (pendingPostSubplebbitAddress && Plebbit.getShortAddress({ address: pendingPostSubplebbitAddress }))}
    </Link>
  );
  const domainTitle = <Link to={`/domain/${params.domain}`}>{params.domain}</Link>;
  const submitTitle = <span className={styles.submitTitle}>{t('submit')}</span>;
  const profileTitle = <Link to='/profile'>{account?.author?.shortAddress}</Link>;
  const authorTitle = (
    <Link to={`/u/${params.authorAddress}/c/${params.commentCid}`}>{params.authorAddress && Plebbit.getShortAddress({ address: params.authorAddress })}</Link>
  );

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
        {subplebbitTitle}: <span className={styles.lowercase}>{t('community_settings')}</span>
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
    return t('feed_nav_inbox');
  } else if (isInSearchView) {
    return t('search_page_title');
  } else if (isInCreateSubplebbitView) {
    return <span className={styles.lowercase}>{t('create_community')}</span>;
  } else if (isInSubplebbitsView) {
    return t('communities');
  } else if (isInNotFoundView) {
    return <span className={styles.lowercase}>{t('page_not_found')}</span>;
  } else if (isInAllView) {
    return t('all');
  } else if (isInModView) {
    return <span className={styles.lowercase}>{t('communities_you_moderate')}</span>;
  } else if (isInDomainView) {
    return domainTitle;
  }
  return null;
};

const Header = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const rawParams = useParams() as ParamsType;
  const params = mergeFeedShellRouteParams(rawParams, location.pathname);
  const subplebbitAddressForHooks = params?.subplebbitAddress || undefined;
  const subplebbit = useSubplebbit({ subplebbitAddress: subplebbitAddressForHooks });
  const { suggested, title } = subplebbit || {};

  const commentIndex = params?.accountCommentIndex ? parseInt(params?.accountCommentIndex) : undefined;
  const accountComment = useAccountComment({ commentIndex });

  const viewportWidth = useWindowWidth();
  const isMobile = viewportWidth < 640;
  const isInAllView = isAllView(location.pathname);
  const isInAuthorView = isAuthorView(location.pathname);
  const isInHomeView = isHomeView(location.pathname);
  const isInHomeAboutView = isHomeAboutView(location.pathname);
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

  const subplebbitAddress = params.subplebbitAddress;

  const contentOptionsStore = useContentOptionsStore();
  const hasUnhiddenAnyNsfwCommunity =
    !contentOptionsStore.hideAdultCommunities ||
    !contentOptionsStore.hideGoreCommunities ||
    !contentOptionsStore.hideAntiCommunities ||
    !contentOptionsStore.hideVulgarCommunities;
  const isBroadlyNsfwSubplebbit = useIsBroadlyNsfwSubplebbit(subplebbitAddress || '');

  const showCommunityFeedHeader =
    Boolean(subplebbitAddress) &&
    isInSubplebbitView &&
    !isInSubplebbitSubmitView &&
    !isInSubplebbitSettingsView &&
    !isInPostPageView &&
    !isInPendingPostView &&
    !isInHomeAboutView &&
    !isInSubplebbitAboutView &&
    !isInPostPageAboutView &&
    !(isBroadlyNsfwSubplebbit && !hasUnhiddenAnyNsfwCommunity);

  const showUserFeedHeader = isInAuthorView || (isInProfileView && !isPendingPostView(location.pathname, params));

  const isInInboxView = isInboxView(location.pathname);
  const hideShellSortTabs = isInPostPageView || isInPendingPostView || isInSettingsView || isInInboxView;
  const showPostThreadBack = isInPostPageView || isInPendingPostView;
  const postThreadBackTo = isInPendingPostView ? '/profile' : subplebbitAddress ? `/s/${subplebbitAddress}` : '/';

  const logoIsAvatar = isInSubplebbitView && !showCommunityFeedHeader && Boolean(suggested?.avatarUrl) && !(isBroadlyNsfwSubplebbit && !hasUnhiddenAnyNsfwCommunity);
  const logoSrc = logoIsAvatar ? suggested?.avatarUrl : undefined;
  const logoLink = '/';

  const isInFeedShellLayout = useFeedShellLayout();
  /** Feed shell: rail has wordmark; omit header wordmark. Subplebbit avatar only 640–899px (matches former CSS). */
  const showHeaderLogoSlot = !isInFeedShellLayout || (viewportWidth >= 640 && viewportWidth < 900 && logoIsAvatar && Boolean(logoSrc));

  /* Home /home about: only logo+wordmark in this row (nav rail has brand on desktop); omit the strip entirely */
  const showTitleRow = !(isInHomeView || isInHomeAboutView) || showPostThreadBack;
  const tabMenuHomeNoTopRule = (isInHomeView || isInHomeAboutView) && !showPostThreadBack;
  const headerTabItems = useHeaderTabItems();
  const showAboutTab = (!isMobile && (isInHomeView || isInHomeAboutView)) || (isMobile && (isInHomeView || isInHomeAboutView || isInSubplebbitView || isInPostPageView));

  /* Settings uses in-page {@link SettingsNav}; shell header was only a duplicate title strip. */
  if (isInSettingsView) {
    return null;
  }

  return (
    <div className={styles.header}>
      <div className={`${styles.container} ${isInSubmitView && isInSubplebbitSubmitView && !isInSubplebbitView && isMobile && styles.reduceSubmitPageHeight}`}>
        {showTitleRow ? (
          <div className={`${styles.titleRow} ${showCommunityFeedHeader ? styles.titleRowSubplebbitFeed : ''} ${showUserFeedHeader ? styles.titleRowUserFeed : ''}`}>
            {showPostThreadBack ? (
              <Link to={postThreadBackTo} className={styles.headerBackLink} aria-label={t('go_back')}>
                <ArrowLeft className={styles.headerBackIcon} aria-hidden />
              </Link>
            ) : null}
            {showHeaderLogoSlot ? (
              <div className={styles.logoContainer}>
                <Link to={logoLink} className={styles.logoLink} aria-label={t('feed_nav_home')}>
                  {logoIsAvatar && logoSrc ? <img className={styles.avatar} src={logoSrc} alt='' /> : <FeedNavLogoMark className={styles.headerWordmark} />}
                </Link>
              </div>
            ) : null}
            {!showCommunityFeedHeader && !showUserFeedHeader && !isInHomeView && !isInHomeAboutView && !isInModView && !isInAllView && (
              <span className={`${styles.pageName} ${(!showHeaderLogoSlot || !logoIsAvatar) && styles.soloPageName}`}>
                <HeaderTitle title={title} pendingPostSubplebbitAddress={accountComment?.subplebbitAddress} />
              </span>
            )}
            {(isInModView || isInAllView) && (
              <div className={`${styles.pageName} ${styles.allOrModPageName}`}>
                <HeaderTitle title={title} pendingPostSubplebbitAddress={accountComment?.subplebbitAddress} />
              </div>
            )}
          </div>
        ) : null}
        {showCommunityFeedHeader && subplebbitAddress ? <CommunityFeedHeader subplebbit={subplebbit} subplebbitAddress={subplebbitAddress} placement='shell' /> : null}
        {showUserFeedHeader ? <UserFeedHeader placement='shell' /> : null}
        {!isMobile && !hideShellSortTabs && !(isBroadlyNsfwSubplebbit && !hasUnhiddenAnyNsfwCommunity) && headerTabItems && (
          <HeaderTabOverflowList
            items={headerTabItems}
            trailing={showAboutTab ? <AboutButton /> : undefined}
            inTabMenuRow={showCommunityFeedHeader || showUserFeedHeader}
            listClassName={!showCommunityFeedHeader && !showUserFeedHeader && tabMenuHomeNoTopRule ? styles.tabMenuNoTopRule : undefined}
          />
        )}
      </div>
      {isMobile && !hideShellSortTabs && !isInSubplebbitSubmitView && !(isBroadlyNsfwSubplebbit && !hasUnhiddenAnyNsfwCommunity) && headerTabItems && (
        <HeaderTabOverflowList
          items={headerTabItems}
          trailing={showAboutTab ? <AboutButton /> : undefined}
          inTabMenuRow={false}
          listClassName={tabMenuHomeNoTopRule ? styles.tabMenuNoTopRule : undefined}
        />
      )}
    </div>
  );
};

export default Header;
