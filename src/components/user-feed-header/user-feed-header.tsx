import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PixelIcon } from '@/components/ui/pixel-icon';
import { useAccount, useAuthor, useAuthorAvatar, useAuthorComments, useComment } from '@bitsocialnet/bitsocial-react-hooks';
import Plebbit from '@plebbit/plebbit-js';
import { cn } from '@/lib/utils';
import { estimateAuthorKarma } from '@/lib/utils/user-utils';
import { isPendingPostView, type ParamsType } from '@/lib/utils/view-utils';
import { mergeFeedShellRouteParams } from '@/lib/utils/feed-shell-route-params';
import styles from './user-feed-header.module.css';

export type UserFeedHeaderProps = {
  placement?: 'feed' | 'shell';
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

  const profileHref = '/profile';
  const authorHref =
    authorAddress && commentCid ? `/u/${authorAddress}/c/${commentCid}` : authorAddress ? `/u/${authorAddress}` : profileHref;

  const titleHref = isProfile ? profileHref : authorHref;

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
            <span className={styles.userHandle}>u/{shortLabel}</span>
            {displayName ? <span className={styles.displayName}>{`: ${displayName}`}</span> : null}
          </Link>
          {isProfile && (
            <div className={styles.actionSlot}>
              <Link to='/settings' className={styles.settingsLink}>
                {t('preferences')}
              </Link>
            </div>
          )}
        </div>
        <p className={styles.meta}>
          <span className={styles.karmaStrong}>{postKarmaShown}</span> {t('post_karma')}
          <span className={styles.metaSep}>·</span>
          <span className={styles.karmaStrong}>{replyScore}</span> {t('comment_karma')}
        </p>
      </div>
    </header>
  );
};

export default UserFeedHeader;
