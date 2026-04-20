import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  autoUpdate,
  flip,
  FloatingFocusManager,
  FloatingPortal,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useId,
  useInteractions,
  useRole,
} from '@floating-ui/react';
import { PixelIcon } from '@/components/ui/pixel-icon';
import {
  useAccount,
  useAccountComments,
  useAuthor,
  useAuthorAvatar,
  useAuthorComments,
  useComment,
  useBlock,
} from '@bitsocialnet/bitsocial-react-hooks';
import Plebbit from '@plebbit/plebbit-js';
import { cn } from '@/lib/utils';
import { getOldestAccountHistoryTimestamp } from '@/lib/utils/account-history-utils';
import { getFormattedTimeDuration } from '@/lib/utils/time-utils';
import { estimateAuthorKarma } from '@/lib/utils/user-utils';
import { isPendingPostView, type ParamsType } from '@/lib/utils/view-utils';
import { mergeFeedShellRouteParams } from '@/lib/utils/feed-shell-route-params';
import styles from './user-feed-header.module.css';

export type UserFeedHeaderProps = {
  placement?: 'feed' | 'shell';
};

type AuthorOverflowMenuProps = {
  authorAddress: string;
};

/**
 * ⋮ menu for another user's profile strip — block / unblock with confirm for block.
 */
const AuthorOverflowMenu = ({ authorAddress }: AuthorOverflowMenuProps) => {
  const { t } = useTranslation();
  const { blocked, unblock, block } = useBlock({ address: authorAddress });
  const [open, setOpen] = useState(false);
  const [confirmBlock, setConfirmBlock] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    placement: 'bottom-end',
    open,
    onOpenChange: (next) => {
      setOpen(next);
      if (!next) {
        setConfirmBlock(false);
      }
    },
    middleware: [offset(4), flip({ fallbackAxisSideDirection: 'end' }), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'menu' });
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);
  const menuPanelId = useId();

  const closeMenu = () => {
    setOpen(false);
    setConfirmBlock(false);
  };

  const onBlockUserClick = () => {
    setConfirmBlock(true);
  };

  const onConfirmYes = () => {
    if (blocked) {
      unblock();
    } else {
      block();
    }
    closeMenu();
  };

  const onConfirmNo = () => {
    setConfirmBlock(false);
  };

  return (
    <>
      <button
        type='button'
        ref={refs.setReference}
        className={styles.overflowButton}
        aria-label={t('post_more_menu')}
        aria-expanded={open}
        aria-haspopup='menu'
        aria-controls={menuPanelId}
        {...getReferenceProps()}
      >
        <span className={styles.overflowIcon} aria-hidden>
          ⋮
        </span>
      </button>
      {open && (
        <FloatingPortal>
          <FloatingFocusManager context={context} modal={false}>
            <div
              id={menuPanelId}
              className={styles.overflowDropdown}
              ref={refs.setFloating}
              style={floatingStyles}
              {...getFloatingProps()}
            >
              <div className={styles.overflowMenu} role='presentation'>
                {confirmBlock ? (
                  <>
                    <div className={styles.overflowMenuHint}>{t('are_you_sure')}</div>
                    <button type='button' role='menuitem' className={styles.overflowMenuItem} onClick={onConfirmYes}>
                      {t('yes')}
                    </button>
                    <button type='button' role='menuitem' className={styles.overflowMenuItem} onClick={onConfirmNo}>
                      {t('no')}
                    </button>
                  </>
                ) : (
                  <button type='button' role='menuitem' className={styles.overflowMenuItem} onClick={onBlockUserClick}>
                    {blocked ? t('unblock_user') : t('block_user')}
                  </button>
                )}
              </div>
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </>
  );
};

/**
 * Shell/feed strip for `/profile` and `/u/…` — same visual role as {@link CommunityFeedHeader}.
 */
const UserFeedHeader = ({ placement = 'shell' }: UserFeedHeaderProps) => {
  const { t } = useTranslation();
  const location = useLocation();
  const rawParams = useParams() as ParamsType;
  const params = mergeFeedShellRouteParams(rawParams, location.pathname);
  const account = useAccount();
  const { accountComments: oldestAccountComment } = useAccountComments({ page: 0, pageSize: 1, order: 'asc' });
  const profileOldestAccountTimestamp = getOldestAccountHistoryTimestamp(oldestAccountComment as { timestamp?: number }[]);

  const isProfile =
    location.pathname.startsWith('/profile') &&
    location.pathname !== '/profile/about' &&
    !isPendingPostView(location.pathname, params);

  const authorAddress = params.authorAddress;
  const commentCid = params.commentCid;

  const authorRecord = useAuthor({
    authorAddress: isProfile ? account?.author?.address : authorAddress,
    commentCid: isProfile ? undefined : commentCid,
  });
  const comment = useComment({ commentCid, onlyIfCached: true });
  const { authorComments } = useAuthorComments({
    authorAddress: isProfile ? undefined : authorAddress,
    commentCid: isProfile ? undefined : commentCid,
  });

  const pageAuthor = isProfile ? account?.author : authorRecord?.author ?? comment?.author;

  const { imageUrl: avatarUrl } = useAuthorAvatar({ author: pageAuthor });
  const [avatarFailed, setAvatarFailed] = useState(false);

  useEffect(() => {
    setAvatarFailed(false);
  }, [avatarUrl, pageAuthor?.address]);

  const rawAddress = pageAuthor?.address ?? (isProfile ? account?.author?.address : authorAddress) ?? '';
  const shortLabel = rawAddress ? Plebbit.getShortAddress({ address: rawAddress }) : '';

  const displayName = pageAuthor?.displayName || '';
  const estimated = !isProfile && authorComments?.length ? estimateAuthorKarma(authorComments) : null;
  const postScore = isProfile ? (account?.karma?.postScore ?? 0) : (estimated?.postScore ?? 0);
  const replyScore = isProfile ? (account?.karma?.replyScore ?? 0) : (estimated?.replyScore ?? 0);
  const postKarmaShown = postScore + 1;

  const authorOldestCommentTimestamp = authorComments?.length
    ? Math.min(
        ...authorComments
          .filter((c): c is NonNullable<typeof c> => c != null)
          .map((c) => c.timestamp),
      )
    : Math.floor(Date.now() / 1000);
  const oldestCommentTimestamp = isProfile ? profileOldestAccountTimestamp : authorOldestCommentTimestamp;

  const profileHref = '/profile';
  const authorHref =
    authorAddress && commentCid ? `/u/${authorAddress}/c/${commentCid}` : authorAddress ? `/u/${authorAddress}` : profileHref;

  const titleHref = isProfile ? profileHref : authorHref;

  const showAuthorOverflow =
    !isProfile &&
    Boolean(authorAddress) &&
    Boolean(pageAuthor?.address) &&
    pageAuthor?.address !== account?.author?.address;

  return (
    <header
      className={cn(styles.header, placement === 'shell' ? styles.headerShell : undefined)}
      aria-label={isProfile ? t('profile') : t('overview')}
    >
      <Link to={titleHref} className={styles.avatarWrap}>
        {avatarUrl && !avatarFailed ? (
          <img src={avatarUrl} alt='' className={styles.avatarImg} onError={() => setAvatarFailed(true)} />
        ) : (
          <span className={styles.avatarFallback} aria-hidden>
            <PixelIcon glyph='user' className={styles.avatarIcon} aria-hidden />
          </span>
        )}
      </Link>
      <div className={styles.body}>
        <div className={styles.titleRow}>
          <Link to={titleHref} className={styles.titleLink}>
            <span className={styles.titlePrimary}>{displayName || `u/${shortLabel}`}</span>
            {displayName ? <span className={styles.titleAddress}>u/{shortLabel}</span> : null}
          </Link>
          {(isProfile || showAuthorOverflow) && (
            <div className={styles.actionSlot}>
              {isProfile ? (
                <Link to='/settings' className={styles.settingsLink}>
                  {t('preferences')}
                </Link>
              ) : authorAddress ? (
                <AuthorOverflowMenu authorAddress={authorAddress} />
              ) : null}
            </div>
          )}
        </div>
        <p className={styles.meta}>
          <span className={styles.karmaStrong}>{postKarmaShown}</span> {t('post_karma')}
          <span className={styles.metaSep}>·</span>
          <span className={styles.karmaStrong}>{replyScore}</span> {t('comment_karma')}
        </p>
        <span className={styles.age}>{t('user_since', { time: getFormattedTimeDuration(oldestCommentTimestamp) })}</span>
      </div>
    </header>
  );
};

export default UserFeedHeader;
