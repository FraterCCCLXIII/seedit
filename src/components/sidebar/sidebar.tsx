import { useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { mergeFeedShellRouteParams } from '../../lib/utils/feed-shell-route-params';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { useAccount, useBlock, Role, Subplebbit, usePlebbitRpcSettings } from '@bitsocialnet/bitsocial-react-hooks';
import Plebbit from '@plebbit/plebbit-js';
import { getFormattedTimeDuration } from '../../lib/utils/time-utils';
import { findSubplebbitCreator } from '../../lib/utils/user-utils';
import {
  isAllView,
  isDomainView,
  isHomeAboutView,
  isHomeView,
  isModView,
  isPostPageAboutView,
  isSubplebbitAboutView,
  isSubplebbitSettingsView,
  isSubplebbitsView,
  isSubplebbitView,
  type ParamsType,
} from '../../lib/utils/view-utils';
import useIsMobile from '../../hooks/use-is-mobile';
import useWindowWidth from '../../hooks/use-window-width';
import { useSubmitPostRoute } from '../../hooks/use-submit-post-route';
import { FAQ } from '../../views/about/about';
import Markdown from '../markdown';
import SearchBar from '../search-bar';
import CreateCommunityModal from '../create-community-modal';
import { Version } from '../version';
import styles from './sidebar.module.css';

const RulesList = ({ rules }: { rules: string[] }) => {
  const { t } = useTranslation();
  const markdownRules = rules.map((rule, index) => `${index + 1}. ${rule}`).join('\n');

  return (
    <div className={styles.rules}>
      <h2 className={styles.sidebarSectionHeading}>{t('rules')}</h2>
      <Markdown content={markdownRules} />
    </div>
  );
};

const ModeratorsList = ({ roles }: { roles: Record<string, Role> }) => {
  const { t } = useTranslation();
  const rolesList = roles ? Object.entries(roles).map(([address, { role }]) => ({ address, role })) : [];

  return (
    <div className={styles.list}>
      <h2 className={styles.sidebarSectionHeading}>{t('moderators')}</h2>
      <ul className={`${styles.listContent} ${styles.modsList}`}>
        {rolesList.map(({ address }, index) => (
          <li key={index} onClick={() => window.alert('Direct profile links are not supported yet.')}>
            u/{Plebbit.getShortAddress({ address })}
          </li>
        ))}
        {/* TODO: https://github.com/bitsocialhq/seedit/issues/274
         <li className={styles.listMore}>{t('about_moderation')} »</li> */}
      </ul>
    </div>
  );
};

const ModerationTools = ({ address }: { address?: string }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const params = useParams();
  const isInSubplebbitSettingsView = isSubplebbitSettingsView(location.pathname, params);

  return (
    <div className={styles.list}>
      <h2 className={styles.sidebarSectionHeading}>{t('moderation_tools')}</h2>
      <ul className={`${styles.listContent} ${styles.modsList}`}>
        <li className={`${styles.moderationTool} ${isInSubplebbitSettingsView ? styles.selectedTool : ''}`}>
          <Link className={styles.communitySettingsTool} to={`/s/${address}/settings`}>
            {t('community_settings')}
          </Link>
        </li>
      </ul>
    </div>
  );
};

interface SidebarProps {
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
      className={`${styles.footer} ${isMobile && (isInHomeAboutView || isInPostPageAboutView) ? styles.mobileFooter : ''} ${
        isInSubplebbitView ? styles.subplebbitFooterMargin : ''
      }`}
    >
      <nav className={styles.footerNav} aria-label='App links'>
        <span className={styles.footerItem}>
          <Version />
        </span>
        <a className={styles.footerItem} href='https://github.com/bitsocialhq/seedit' target='_blank' rel='noopener noreferrer'>
          github
        </a>
        <a className={styles.footerItem} href='https://t.me/bitsocialhq' target='_blank' rel='noopener noreferrer'>
          telegram
        </a>
        <a className={styles.footerItem} href='https://x.com/bitsocialhq' target='_blank' rel='noopener noreferrer'>
          x
        </a>
        <a className={styles.footerItem} href='https://bitsocial.net' target='_blank' rel='noopener noreferrer'>
          docs
        </a>
      </nav>
    </div>
  );
};

const Sidebar = ({ settings, subplebbit, reset }: SidebarProps) => {
  const { t } = useTranslation();
  const { address, createdAt, description, roles, rules, title } = subplebbit || {};

  const location = useLocation();
  const rawParams = useParams() as ParamsType;
  const params = mergeFeedShellRouteParams(rawParams, location.pathname);
  const isInAllView = isAllView(location.pathname);
  const isInDomainView = isDomainView(location.pathname);
  const isInHomeAboutView = isHomeAboutView(location.pathname);
  const isInPostPageAboutView = isPostPageAboutView(location.pathname, params);
  const isInHomeView = isHomeView(location.pathname);
  const isInModView = isModView(location.pathname);
  const isInSubplebbitsView = isSubplebbitsView(location.pathname);
  const isInSubplebbitAboutView = isSubplebbitAboutView(location.pathname, params);
  const isInSubplebbitView = isSubplebbitView(location.pathname, params);

  const { submitRoute } = useSubmitPostRoute(address || params?.subplebbitAddress);
  /** Left feed rail (≥900px) hosts submit under Settings; 640–899px use sidebar CTA. Below 640px the nav rail still has New Post — omit duplicate sidebar submit. */
  const windowWidth = useWindowWidth();
  const isMobile = useIsMobile();
  const showSubmitInSidebar = !isMobile && windowWidth < 900;
  /** Wide layout + subplebbit route: submit is in the rail and create-community is in ctaStackBottom — skip empty wrapper. */
  const showCtaStack = showSubmitInSidebar || isInSubplebbitsView || !isInSubplebbitView;

  const showSidebarCommunityPanel =
    !isInHomeView &&
    !isInHomeAboutView &&
    !isInAllView &&
    !isInModView &&
    !isInSubplebbitsView &&
    !isInDomainView &&
    !isInPostPageAboutView;

  const subplebbitCreator = findSubplebbitCreator(roles);
  const creatorAddress = subplebbitCreator === 'anonymous' ? 'anonymous' : `${Plebbit.getShortAddress({ address: subplebbitCreator })}`;

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

  const showReadOnlyCommunitySettings = !!(address && !(moderatorRole || isOwner));
  const showCommunityChromeCard =
    showSidebarCommunityPanel ||
    !!(moderatorRole || isOwner) ||
    (roles && Object.keys(roles).length > 0) ||
    showReadOnlyCommunitySettings;

  const isConnectedToRpc = usePlebbitRpcSettings()?.state === 'connected';
  const navigate = useNavigate();
  const [createCommunityModalOpen, setCreateCommunityModalOpen] = useState(false);

  const handleCreateCommunityClick = () => {
    setCreateCommunityModalOpen(true);
  };

  const handleContinueCreateCommunity = () => {
    setCreateCommunityModalOpen(false);
    navigate('/communities/create');
  };

  return (
    <div className={cn(isMobile ? styles.mobileSidebar : styles.sidebar, styles.sidebarChrome, 'text-foreground')}>
      <div className={styles.searchBarWrapper}>
        <SearchBar />
      </div>
        <div>
        {showCtaStack ? (
          <div className={styles.ctaStack}>
            {showSubmitInSidebar && (
              <button
                type='button'
                className={cn(styles.ctaBase, styles.ctaPrimary)}
                onClick={() => navigate(submitRoute, { state: { backgroundLocation: location } })}
              >
                {t('submit_post')}
              </button>
            )}
            {isInSubplebbitsView && (
              <a
                href='https://github.com/bitsocialhq/lists'
                target='_blank'
                rel='noopener noreferrer'
                className={cn(styles.ctaBase, styles.ctaSecondaryLink)}
              >
                {t('submit_community')}
              </a>
            )}
            {!isInSubplebbitView ? (
              <button type='button' className={cn(styles.ctaBase, styles.ctaOutline)} onClick={handleCreateCommunityClick}>
                {t('create_your_community')}
              </button>
            ) : null}
          </div>
        ) : null}
        {showCommunityChromeCard ? (
          <div className={styles.communityChromeCard}>
            {showSidebarCommunityPanel ? (
              <section className={styles.communityPanel} aria-label={subplebbit?.address}>
                {moderatorRole ? (
                  <div className={styles.moderatorLine}>
                    <div className={styles.moderatorStatus}>
                      {moderatorRole === 'moderator' ? t('you_are_moderator') : moderatorRole === 'admin' ? t('you_are_admin') : t('you_are_owner')}
                    </div>
                  </div>
                ) : null}
                {description && description.length > 0 ? (
                  <div className={styles.aboutBlock}>
                    {title && title.length > 0 ? (
                      <h2 className={styles.sidebarSectionHeading}>{title}</h2>
                    ) : null}
                    <div className={styles.description}>
                      <Markdown content={description} />
                    </div>
                  </div>
                ) : null}
                {rules && rules.length > 0 ? <RulesList rules={rules} /> : null}
                <div className={styles.bottom}>
                  <div className={styles.bottomMeta}>
                    <span className={styles.bottomMetaPrimary}>
                      {t('created_by', {
                        creatorAddress: creatorAddress === 'anonymous' ? 'anonymous' : `u/${creatorAddress}`,
                      })}
                    </span>
                    {createdAt ? <span className={styles.bottomMetaSecondary}>{t('community_for', { date: getFormattedTimeDuration(createdAt) })}</span> : null}
                  </div>
                  <div className={styles.bottomButtons}>
                    {showBlockConfirm ? (
                      <span className={styles.blockConfirm}>
                        {t('are_you_sure')}{' '}
                        <button type='button' className={styles.confirmButton} onClick={handleBlock}>
                          {t('yes')}
                        </button>
                        {' / '}
                        <button type='button' className={styles.cancelButton} onClick={cancelBlock}>
                          {t('no')}
                        </button>
                      </span>
                    ) : (
                      <button type='button' className={styles.blockSub} onClick={blockConfirm}>
                        {blocked ? t('unblock_community') : t('block_community')}
                      </button>
                    )}
                  </div>
                </div>
              </section>
            ) : null}
            {(moderatorRole || isOwner) && <ModerationTools address={address} />}
            {roles && Object.keys(roles).length > 0 && <ModeratorsList roles={roles} />}
            {showReadOnlyCommunitySettings ? (
              <div className={styles.readOnlySettingsLink}>
                <Link to={`/s/${address}/settings`}>{t('community_settings')}</Link>
              </div>
            ) : null}
          </div>
        ) : null}
        {(!(isMobile && isInHomeAboutView) || isInSubplebbitAboutView || isInPostPageAboutView) && <Footer />}
        {isInSubplebbitView ? (
          <div className={styles.ctaStackBottom}>
            <button type='button' className={cn(styles.ctaBase, styles.ctaOutline)} onClick={handleCreateCommunityClick}>
              {t('create_your_community')}
            </button>
          </div>
        ) : null}
        {isMobile && isInHomeAboutView && <FAQ />}
      </div>
      <CreateCommunityModal
        open={createCommunityModalOpen}
        onClose={() => setCreateCommunityModalOpen(false)}
        isConnectedToRpc={isConnectedToRpc}
        onContinueToCreate={handleContinueCreateCommunity}
      />
    </div>
  );
};

export default Sidebar;
