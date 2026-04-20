import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Comment,
  useAuthorAddress,
  useAuthorAvatar,
  useBlock,
  useComment,
  useEditedComment,
  useSubplebbit,
  useSubscribe,
} from '@bitsocialnet/bitsocial-react-hooks';
import Plebbit from '@plebbit/plebbit-js';
import { getPostScore, formatScore } from '../../lib/utils/post-utils';
import { getFormattedTimeAgo, formatLocalizedUTCTimestamp } from '../../lib/utils/time-utils';
import { getHostname } from '../../lib/utils/url-utils';
import { isAllView, isAuthorView, isPendingPostView, isPostPageView, isProfileHiddenView, isProfileView, isSubplebbitView } from '../../lib/utils/view-utils';
import { highlightMatchedText } from '../../lib/utils/pattern-utils';
import { useCommentMediaInfo } from '../../hooks/use-comment-media-info';
import useDownvote from '../../hooks/use-downvote';
import { useIsNsfwSubplebbit } from '../../hooks/use-is-nsfw-subplebbit';
import useUpvote from '../../hooks/use-upvote';
import useContentOptionsStore from '../../stores/use-content-options-store';
import CommentEditForm from '../comment-edit-form';
import SubscribeButton from '../subscribe-button';
import Expando from './expando';
import Flair from './flair';
import { PixelIcon } from '@/components/ui/pixel-icon';
import { cn } from '@/lib/utils';
import CommentTools from './comment-tools';
import styles from './post.module.css';
import _ from 'lodash';
import React from 'react';

interface PostAuthorProps {
  authorAddress: string;
  authorRole: string;
  cid: string;
  displayName: string;
  index?: number;
  pinned?: boolean;
  shortAddress: string;
  shortAuthorAddress: string | undefined;
  authorAddressChanged: boolean;
  className?: string;
}

const PostAuthor = ({
  authorAddress,
  authorRole,
  cid,
  displayName,
  index,
  pinned,
  shortAddress,
  shortAuthorAddress,
  authorAddressChanged,
  className,
}: PostAuthorProps) => {
  // TODO: implement comment.highlightRole once implemented in API
  const isAuthorOwner = authorRole === 'owner';
  const isAuthorAdmin = authorRole === 'admin';
  const isAuthorModerator = authorRole === 'moderator';
  const moderatorClass = `${isAuthorOwner ? styles.owner : isAuthorAdmin ? styles.admin : isAuthorModerator ? styles.moderator : ''}`;
  const authorRoleInitial = (isAuthorOwner && 'O') || (isAuthorAdmin && 'A') || (isAuthorModerator && 'M') || '';

  const shortDisplayName = displayName?.trim().length > 20 ? displayName?.trim().slice(0, 20).trim() + '...' : displayName?.trim();

  return (
    <>
      <Link
        to={cid ? `/u/${authorAddress}/c/${cid}` : `/profile/${index}`}
        className={`${styles.author} ${pinned && moderatorClass} ${className || ''}`}
      >
        {displayName && (
          <>
            {' '}
            <span className={`${styles.displayName} ${pinned && moderatorClass}`}>{shortDisplayName}</span>
          </>
        )}{' '}
        <span className={`${styles.authorAddressWrapper} ${pinned && moderatorClass}`}>
          <span className={styles.authorAddressHidden}>u/{shortAddress || shortAuthorAddress}</span>
          <span className={`${styles.authorAddressVisible} ${authorAddressChanged && styles.authorAddressChanged}`}>u/{shortAuthorAddress}</span>
        </span>
      </Link>
      {/* TODO: implement comment.highlightRole once implemented in API */}
      {authorRole && pinned && (
        <span>
          {' '}
          [
          <span className={moderatorClass} title={authorRole}>
            {authorRoleInitial}
          </span>
          ]
        </span>
      )}
    </>
  );
};

interface PostProps {
  index?: number;
  post: Comment | undefined;
}

const Post = ({ index, post = {} }: PostProps) => {
  // handle single comment thread
  const op = useComment({ commentCid: post?.parentCid ? post?.postCid : '', onlyIfCached: true });

  if (post?.parentCid) {
    post = op;
  }
  // handle pending mod or author edit
  const { state: editState, editedComment } = useEditedComment({ comment: post });
  if (editedComment) {
    post = editedComment;
  }
  const {
    author,
    cid,
    content,
    deleted,
    downvoteCount,
    edit,
    flair,
    link,
    pinned,
    reason,
    removed,
    replyCount,
    spoiler,
    state,
    subplebbitAddress,
    timestamp,
    title,
    upvoteCount,
  } = post || {};

  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';

  // Check if the subplebbit is NSFW based on its tags
  const isNsfwSubplebbit = useIsNsfwSubplebbit(subplebbitAddress);
  const nsfw = post?.nsfw || isNsfwSubplebbit;

  const { displayName, shortAddress } = author || {};
  const { shortAuthorAddress, authorAddressChanged } = useAuthorAddress({ comment: post });

  const { t, i18n } = useTranslation();
  const { language } = i18n;
  const postDate = formatLocalizedUTCTimestamp(timestamp, language);
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const subplebbit = useSubplebbit({ subplebbitAddress, onlyIfCached: true });

  const authorRole = subplebbit?.roles?.[post.author?.address]?.role;

  const isInAllView = isAllView(location.pathname);
  const isInPendingPostView = isPendingPostView(location.pathname, params);
  const isInPostPageView = isPostPageView(location.pathname, params);
  const isInProfileView = isProfileView(location.pathname);
  const isInAuthorView = isAuthorView(location.pathname);
  const isInProfileHiddenView = isProfileHiddenView(location.pathname);
  const isInSubplebbitView = isSubplebbitView(location.pathname, params);

  const commentMediaInfo = useCommentMediaInfo(post);

  /** Inline media and body — no expand/collapse control in the feed. */
  const isExpanded = true;

  const [isEditing, setIsEditing] = useState(false);
  const showCommentEditForm = () => setIsEditing(true);
  const hideCommentEditForm = () => setIsEditing(false);

  const [upvoted, upvote] = useUpvote(post);
  const [downvoted, downvote] = useDownvote(post);
  const postScore = getPostScore(upvoteCount, downvoteCount, state);
  const postTitle =
    (title?.length > 300 ? title?.slice(0, 300) + '...' : title) ||
    (content?.length > 300 ? content?.slice(0, 300) + '...' : content)?.replace('&nbsp;', ' ')?.replace('>', '')?.replace('<', '')?.trim();

  // Ensure we have a meaningful title - if it's only whitespace/newlines, treat as empty
  const cleanedTitle = postTitle?.trim();
  const finalTitle = cleanedTitle || '-';

  const displayedTitle = searchQuery ? highlightMatchedText(finalTitle, searchQuery) : finalTitle;

  const hostname = getHostname(link);
  const linkClass = `${isInPostPageView ? (link ? styles.externalLink : styles.internalLink) : styles.link} ${pinned ? styles.pinnedLink : ''}`;

  const { blocked, unblock } = useBlock({ cid });

  const [hasClickedSubscribe, setHasClickedSubscribe] = useState(false);
  const { subscribed } = useSubscribe({ subplebbitAddress });

  // show gray dotted border around last clicked post
  const isLastClicked = sessionStorage.getItem('lastClickedPost') === cid && !isInPostPageView;
  const handlePostClick = () => {
    if (cid) {
      if (sessionStorage.getItem('lastClickedPost') === cid) {
        sessionStorage.removeItem('lastClickedPost');
      } else {
        sessionStorage.setItem('lastClickedPost', cid);
      }
    }
  };

  const postPermalink =
    cid && subplebbitAddress
      ? `/s/${subplebbitAddress}/c/${cid}`
      : post?.index != null
        ? `/profile/${post.index}`
        : null;

  const isPostRowNavEnabled =
    Boolean(postPermalink) && !isInPostPageView && !(blocked && !isInProfileHiddenView) && !isEditing;

  const handlePostRowClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPostRowNavEnabled || !postPermalink) return;
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
    const target = e.target as HTMLElement | null;
    if (!target) return;
    if (
      target.closest(
        'a, button, input, textarea, select, summary, label, video, audio, iframe, [role="button"], [role="menuitem"]',
      )
    ) {
      return;
    }
    navigate(postPermalink);
    handlePostClick();
  };

  const hideAvatars = useContentOptionsStore((s) => s.hideAvatars);
  const { imageUrl: authorAvatarUrl } = useAuthorAvatar({ author });
  const [authorAvatarFailed, setAuthorAvatarFailed] = useState(false);

  const communityShort = subplebbit?.shortAddress || (subplebbitAddress ? Plebbit.getShortAddress({ address: subplebbitAddress }) : '');

  useEffect(() => {
    setAuthorAvatarFailed(false);
  }, [author?.address, authorAvatarUrl]);

  const showAuthorAvatar = Boolean(!hideAvatars && authorAvatarUrl && !authorAvatarFailed);

  const avatarProfileHref =
    cid && author?.address ? `/u/${author.address}/c/${cid}` : post?.index != null ? `/profile/${post.index}` : `/s/${subplebbitAddress}`;

  const showFeedRowHover = !isInPostPageView && !(blocked && !isInProfileHiddenView);

  return (
    <div className={cn(styles.content, showFeedRowHover && styles.contentInFeed, isInPostPageView && styles.contentPostPage)} key={index}>
      <div className={isLastClicked ? styles.lastClicked : ''}>
        <div className={`${styles.hiddenPost} ${blocked && !isInProfileHiddenView ? styles.visible : styles.hidden}`}>
          <div className={styles.hiddenPostText}>{t('post_hidden').charAt(0).toUpperCase() + t('post_hidden').slice(1)}</div>
          <div className={styles.undoHiddenPost} onClick={unblock}>
            {t('undo')}
          </div>
        </div>
        <div className={`${styles.container} ${blocked && !isInProfileHiddenView ? styles.hidden : styles.visible}`}>
          <div className={`${styles.row} ${isPostRowNavEnabled ? styles.rowClickable : ''}`} onClick={handlePostRowClick}>
            <Link to={avatarProfileHref} className={styles.avatarColumn}>
              {showAuthorAvatar ? (
                <img
                  src={authorAvatarUrl}
                  alt=''
                  className={styles.avatarImg}
                  onError={() => setAuthorAvatarFailed(true)}
                />
              ) : (
                <span className={styles.avatarFallback} aria-hidden>
                  <PixelIcon glyph='user' className={styles.avatarUserIcon} />
                </span>
              )}
            </Link>
            <div className={styles.entry}>
              <div className={styles.topMatter}>
                <div className={styles.metaRow}>
                  <PostAuthor
                    authorAddress={author?.address}
                    authorRole={authorRole}
                    cid={cid}
                    displayName={displayName}
                    index={post?.index}
                    pinned={pinned}
                    shortAddress={shortAddress}
                    shortAuthorAddress={shortAuthorAddress}
                    authorAddressChanged={authorAddressChanged}
                    className={styles.metaAuthor}
                  />
                  <span className={styles.metaSep}>·</span>
                  <span className={styles.metaTime} title={postDate}>
                    {getFormattedTimeAgo(timestamp)}
                  </span>
                  {edit && isInPostPageView && (
                    <>
                      <span className={styles.metaSep}>·</span>
                      <span className={styles.timeEdit}>{t('last_edited', { timestamp: getFormattedTimeAgo(edit.timestamp) })}</span>
                    </>
                  )}
                  {!isInSubplebbitView && (
                    <>
                      <span className={styles.metaSep}>·</span>
                      <span className={styles.subscribeHoverGroup}>
                        {isInAllView && (!subscribed || (subscribed && hasClickedSubscribe)) && (
                          <span className={styles.subscribeButtonWrapper}>
                            <SubscribeButton
                              address={subplebbitAddress}
                              pillSize='sm'
                              onJoinClick={() => setHasClickedSubscribe(true)}
                            />
                          </span>
                        )}
                        <Link className={`${styles.subplebbit} ${subscribed && hasClickedSubscribe ? styles.greenSubplebbitAddress : ''}`} to={`/s/${subplebbitAddress}`}>
                          s/{subplebbit?.shortAddress || (subplebbitAddress && Plebbit.getShortAddress({ address: subplebbitAddress }))}
                        </Link>
                      </span>
                    </>
                  )}
                  {pinned && <span className={styles.pinnedBadge}> · {t('announcement')}</span>}
                </div>
                <div className={styles.titleStack}>
                  <p className={styles.title}>
                    {isInPostPageView && link ? (
                      <a href={link} className={linkClass} target='_blank' rel='noopener noreferrer' onClick={handlePostClick}>
                        {displayedTitle}
                      </a>
                    ) : (
                      <Link className={linkClass} to={cid ? `/s/${subplebbitAddress}/c/${cid}` : `/profile/${post?.index}`} onClick={handlePostClick}>
                        {displayedTitle}
                      </Link>
                    )}
                    {flair && (
                      <>
                        {' '}
                        <Flair flair={flair} />
                      </>
                    )}
                  </p>
                  <div className={styles.postSourceLine}>
                    <span className={styles.domain}>
                      {hostname ? (
                        <Link to={`/domain/${hostname}`}>{hostname.length > 25 ? hostname.slice(0, 25) + '...' : hostname}</Link>
                      ) : (
                        <Link to={`/s/${subplebbitAddress}`}>
                          self.{subplebbit?.shortAddress || (subplebbitAddress && Plebbit.getShortAddress({ address: subplebbitAddress }))}
                        </Link>
                      )}
                    </span>
                  </div>
                </div>
              </div>
              {!(!content && !link) && (
                <>
                  {isEditing ? (
                    <CommentEditForm commentCid={cid} hideCommentEditForm={hideCommentEditForm} />
                  ) : (
                    <Expando
                      authorEditReason={edit?.reason}
                      commentMediaInfo={commentMediaInfo}
                      content={removed ? `[${_.lowerCase(t('removed'))}]` : deleted ? `[${_.lowerCase(t('deleted'))}]` : content}
                      expanded={isExpanded}
                      link={link}
                      modEditReason={reason}
                      nsfw={nsfw}
                      deleted={deleted}
                      removed={removed}
                      showContent={true}
                      spoiler={spoiler && (content || link)}
                    />
                  )}
                </>
              )}
              <div className={styles.engagementRow}>
                <div className={styles.voteCluster}>
                  <button
                    type='button'
                    className={cn(styles.voteBtn, upvoted && styles.votedUp)}
                    onClick={() => cid && upvote()}
                    disabled={!cid}
                    aria-label='upvote'
                  >
                    <PixelIcon glyph='arrow-up' className={styles.voteIcon} aria-hidden />
                  </button>
                  <span className={styles.score}>{formatScore(postScore)}</span>
                  <button
                    type='button'
                    className={cn(styles.voteBtn, downvoted && styles.votedDown)}
                    onClick={() => cid && downvote()}
                    disabled={!cid}
                    aria-label='downvote'
                  >
                    <PixelIcon glyph='arrow-down' className={styles.voteIcon} aria-hidden />
                  </button>
                </div>
                <CommentTools
                  author={author}
                  cid={cid}
                  deleted={deleted}
                  failed={state === 'failed'}
                  editState={editState}
                  index={post?.index}
                  nsfw={nsfw}
                  removed={removed}
                  replyCount={replyCount}
                  showCommentEditForm={showCommentEditForm}
                  spoiler={spoiler}
                  subplebbitAddress={subplebbitAddress}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Post);
