import { useCallback, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Author, useAccount, useComment, useSubplebbit } from '@bitsocialnet/bitsocial-react-hooks';
import useScheduledReset from '../../../hooks/use-scheduled-reset';
import { PixelIcon } from '@/components/ui/pixel-icon';
import { EngagementActionTooltip } from './engagement-action-tooltip';
import styles from './comment-tools.module.css';
import EditMenu from './edit-menu';
import HideMenu from './hide-menu';
import Label from '../label';
import ModMenu from './mod-menu';
import { copyShareLinkToClipboard } from '../../../lib/utils/url-utils';

interface CommentToolsProps {
  author?: Author;
  cid: string;
  deleted?: boolean;
  failed?: boolean;
  editState?: string;
  hasLabel?: boolean;
  hasThumbnail?: boolean;
  index?: number;
  isAuthor?: boolean;
  isAccountMod?: boolean;
  isCommentAuthorMod?: boolean;
  isReply?: boolean;
  isSingleReply?: boolean;
  nsfw?: boolean;
  parentCid?: string;
  postCid?: string;
  removed?: boolean;
  replyCount?: number;
  spoiler?: boolean | undefined;
  subplebbitAddress: string;
  showCommentEditForm?: () => void;
  showReplyForm?: () => void;
  /** Vote cluster as first column in reply toolbars (reply / single-reply rows). */
  replyVoteCluster?: ReactNode;
}

const ShareButton = ({ cid, subplebbitAddress }: { cid: string; subplebbitAddress: string }) => {
  const { t } = useTranslation();
  const [hasCopied, setHasCopied] = useState(false);

  const resetCopied = useCallback(() => setHasCopied(false), []);
  const [scheduleReset, clearReset] = useScheduledReset(resetCopied, 2000);

  const handleCopy = async () => {
    try {
      setHasCopied(true);
      scheduleReset();
      await copyShareLinkToClipboard(subplebbitAddress, cid);
    } catch (error) {
      console.error('Failed to copy share link:', error);
      setHasCopied(false);
      clearReset();
    }
  };

  return (
    <li className={`${!hasCopied ? styles.button : styles.text}`}>
      <EngagementActionTooltip
        content={
          hasCopied
            ? t('link_copied', { defaultValue: 'Link copied' })
            : t('engagement_tooltip_share', { defaultValue: 'Copy link to clipboard' })
        }
      >
        <button
          type='button'
          className={styles.shareIconButton}
          onClick={() => cid && handleCopy()}
          disabled={!cid}
          aria-label={
            hasCopied
              ? t('link_copied', { defaultValue: 'Link copied' })
              : t('engagement_tooltip_share', { defaultValue: 'Copy link to clipboard' })
          }
        >
          {hasCopied ? (
            <PixelIcon glyph='check' className={styles.engagementIcon} aria-hidden />
          ) : (
            <PixelIcon glyph='share' className={styles.engagementIcon} aria-hidden />
          )}
        </button>
      </EngagementActionTooltip>
    </li>
  );
};

const PostTools = ({
  author,
  cid,
  failed,
  hasLabel,
  index,
  isAuthor,
  isAccountMod,
  isCommentAuthorMod,
  subplebbitAddress,
  replyCount = 0,
  showCommentEditForm,
}: CommentToolsProps) => {
  const { t } = useTranslation();
  const validReplyCount = isNaN(replyCount) ? 0 : replyCount;
  const commentCountDisplay = String(validReplyCount);
  const commentsAriaLabel = `${validReplyCount} ${validReplyCount === 1 ? t('post_comment') : t('post_comments')}`;

  const commentIconCount = (
    <>
      <PixelIcon glyph='comment-dots' className={styles.engagementIcon} aria-hidden />
      <span className={styles.engagementCount}>{commentCountDisplay}</span>
    </>
  );

  const commentCountButton = failed ? (
    <span className={styles.engagementAction} aria-label={commentsAriaLabel}>
      {commentIconCount}
    </span>
  ) : (
    <EngagementActionTooltip content={t('engagement_tooltip_comments', { defaultValue: 'Open discussion' })}>
      <Link
        to={cid ? `/s/${subplebbitAddress}/c/${cid}` : `/profile/${index}`}
        className={styles.engagementAction}
        aria-label={commentsAriaLabel}
      >
        {commentIconCount}
      </Link>
    </EngagementActionTooltip>
  );

  return (
    <>
      <li className={`${styles.button} ${!hasLabel ? styles.firstButton : ''}`}>{commentCountButton}</li>
      <ShareButton cid={cid} subplebbitAddress={subplebbitAddress} />
      {/* TODO: Implement save functionality
        <li className={styles.button}>
          <span>{t('save')}</span>
        </li> 
      */}
      {isAuthor && <EditMenu commentCid={cid} showCommentEditForm={showCommentEditForm} />}
      <HideMenu author={author} cid={cid} isAccountMod={isAccountMod} isAuthor={isAuthor} subplebbitAddress={subplebbitAddress} />
      {/* TODO: Implement crosspost functionality
        <li className={`${styles.button} ${styles.crosspostButton}`}>
          <span>{t('crosspost')}</span>
        </li> 
      */}
      {isAccountMod ? <ModMenu cid={cid} isCommentAuthorMod={isCommentAuthorMod} /> : null}
    </>
  );
};

const ReplyTools = ({
  author,
  cid,
  failed,
  hasLabel,
  index,
  isAuthor,
  isAccountMod,
  isCommentAuthorMod,
  replyVoteCluster,
  showReplyForm,
  subplebbitAddress,
  showCommentEditForm,
}: CommentToolsProps) => {
  const { t } = useTranslation();

  const replyPermalink = failed ? { mode: 'failed' as const } : { mode: 'link' as const, to: cid ? `/s/${subplebbitAddress}/c/${cid}` : `/profile/${index}` };

  return (
    <>
      {replyVoteCluster ? <li className={styles.voteToolSlot}>{replyVoteCluster}</li> : null}
      <li
        className={`${styles.button} ${!hasLabel && !replyVoteCluster ? styles.firstButton : ''} ${!cid ? styles.hideReply : ''}`}
      >
        <span onClick={() => cid && showReplyForm?.()}>{t('reply_reply')}</span>
      </li>
      <ShareButton cid={cid} subplebbitAddress={subplebbitAddress} />
      {/* TODO: Implement save functionality
        <li className={styles.button}>
          <span>{t('save')}</span>
        </li> 
      */}
      {isAuthor && <EditMenu commentCid={cid} showCommentEditForm={showCommentEditForm} />}
      <HideMenu
        author={author}
        cid={cid}
        isAccountMod={isAccountMod}
        isAuthor={isAuthor}
        replyPermalink={replyPermalink}
        subplebbitAddress={subplebbitAddress}
      />
      {isAccountMod ? <ModMenu cid={cid} isCommentAuthorMod={isCommentAuthorMod} /> : null}
    </>
  );
};

const SingleReplyTools = ({
  author,
  cid,
  hasLabel,
  index,
  isAuthor,
  isAccountMod,
  isCommentAuthorMod,
  parentCid,
  postCid,
  replyVoteCluster,
  showReplyForm,
  subplebbitAddress,
  showCommentEditForm,
}: CommentToolsProps) => {
  const { t } = useTranslation();
  const comment = useComment({ commentCid: postCid, onlyIfCached: true });

  const hasContext = parentCid !== postCid;

  const permalinkButton = cid ? (
    <Link to={cid ? `/s/${subplebbitAddress}/c/${cid}` : `/profile/${index}`} onClick={(e) => !cid && e.preventDefault()}>
      permalink
    </Link>
  ) : (
    <span>permalink</span>
  );

  const contextButton = cid ? (
    <Link to={cid ? (hasContext ? `/s/${subplebbitAddress}/c/${cid}/?context=3` : `/s/${subplebbitAddress}/c/${cid}`) : `/profile/${index}`}>{t('context')}</Link>
  ) : (
    <span>{t('context')}</span>
  );

  const fullCommentsButton = cid ? (
    <Link to={cid ? `/s/${subplebbitAddress}/c/${postCid}` : `/profile/${index}`}>
      {t('full_comments')} {comment?.replyCount ? `(${comment?.replyCount})` : ''}
    </Link>
  ) : (
    <span>
      {t('full_comments')} {comment?.replyCount ? `(${comment?.replyCount})` : ''}
    </span>
  );

  return (
    <>
      {replyVoteCluster ? <li className={styles.voteToolSlot}>{replyVoteCluster}</li> : null}
      <li className={`${styles.button} ${!hasLabel && !replyVoteCluster ? styles.firstButton : ''}`}>{permalinkButton}</li>
      {/* TODO: Implement save functionality
        <li className={styles.button}>
          <span>{t('save')}</span>
        </li> 
      */}
      {isAuthor && <EditMenu commentCid={cid} showCommentEditForm={showCommentEditForm} />}
      <li className={styles.button}>{contextButton}</li>
      <li className={styles.button}>{fullCommentsButton}</li>
      <HideMenu author={author} cid={cid} isAccountMod={isAccountMod} isAuthor={isAuthor} subplebbitAddress={subplebbitAddress} />
      <li className={`${!cid ? styles.hideReply : styles.button}`}>
        <span onClick={() => cid && showReplyForm?.()}>{t('reply_reply')}</span>
      </li>
      {isAccountMod ? <ModMenu cid={cid} isCommentAuthorMod={isCommentAuthorMod} /> : null}
    </>
  );
};

const CommentToolsLabel = ({ cid, deleted, failed, editState, isReply, nsfw, removed, spoiler }: CommentToolsProps) => {
  const { t } = useTranslation();
  const pending = cid === undefined && !isReply && !failed;
  const failedEdit = editState === 'failed';
  const pendingEdit = editState === 'pending';

  const labels = [
    { show: nsfw, color: 'nsfw-red', text: t('nsfw') },
    { show: spoiler, color: 'black', text: t('spoiler') },
    { show: pending, color: 'yellow', text: t('pending') },
    { show: failed, color: 'red', text: t('failed') },
    { show: deleted, color: 'red', text: t('deleted') },
    { show: removed, color: 'red', text: t('removed') },
    { show: failedEdit, color: 'red', text: t('failed_edit') },
    { show: pendingEdit, color: 'yellow', text: t('pending_edit') },
  ];

  const visibleLabels = labels.filter((label) => label.show);

  if (visibleLabels.length === 0) {
    return null;
  }

  return (
    <li className={styles.labelClusterSlot}>
      <span className={styles.labelCluster}>
        {visibleLabels.map((label, index) => (
          <Label key={label.text} color={label.color} text={label.text} isFirstInLine={index === 0} />
        ))}
      </span>
    </li>
  );
};

const CommentTools = ({
  author,
  cid,
  deleted,
  failed,
  editState,
  hasLabel = false,
  hasThumbnail = false,
  index,
  isReply,
  isSingleReply,
  nsfw,
  parentCid,
  postCid,
  removed,
  replyCount,
  spoiler,
  subplebbitAddress,
  showCommentEditForm,
  showReplyForm,
  replyVoteCluster,
}: CommentToolsProps) => {
  const account = useAccount();
  const isAuthor = account?.author?.address === author?.address;
  const subplebbit = useSubplebbit({ subplebbitAddress, onlyIfCached: true });
  const accountAuthorRole = subplebbit?.roles?.[account?.author?.address]?.role;
  const commentAuthorRole = subplebbit?.roles?.[author?.address]?.role;
  const isAccountMod = accountAuthorRole === 'admin' || accountAuthorRole === 'owner' || accountAuthorRole === 'moderator';
  const isCommentAuthorMod = commentAuthorRole === 'admin' || commentAuthorRole === 'owner' || commentAuthorRole === 'moderator';
  return (
    (!(deleted || removed) || (!deleted && isAccountMod)) && (
      <ul className={`${styles.buttons} ${hasLabel ? styles.buttonsLabel : ''}`}>
        {isReply ? (
          isSingleReply ? (
            <SingleReplyTools
              author={author}
              cid={cid}
              failed={failed}
              hasLabel={hasLabel}
              hasThumbnail={hasThumbnail}
              index={index}
              isAuthor={isAuthor}
              isAccountMod={isAccountMod}
              isCommentAuthorMod={isCommentAuthorMod}
              parentCid={parentCid}
              postCid={postCid}
              replyVoteCluster={replyVoteCluster}
              showCommentEditForm={showCommentEditForm}
              showReplyForm={showReplyForm}
              subplebbitAddress={subplebbitAddress}
            />
          ) : (
            <ReplyTools
              author={author}
              cid={cid}
              failed={failed}
              hasLabel={hasLabel}
              hasThumbnail={hasThumbnail}
              index={index}
              isAuthor={isAuthor}
              isAccountMod={isAccountMod}
              isCommentAuthorMod={isCommentAuthorMod}
              replyVoteCluster={replyVoteCluster}
              showCommentEditForm={showCommentEditForm}
              showReplyForm={showReplyForm}
              subplebbitAddress={subplebbitAddress}
            />
          )
        ) : (
          <>
            <CommentToolsLabel
              cid={cid}
              deleted={deleted}
              failed={failed}
              editState={editState}
              isReply={isReply}
              nsfw={nsfw}
              removed={removed}
              spoiler={spoiler}
              subplebbitAddress={subplebbitAddress}
            />
            <PostTools
              author={author}
              cid={cid}
              failed={failed}
              hasLabel={hasLabel}
              hasThumbnail={hasThumbnail}
              index={index}
              isAuthor={isAuthor}
              isAccountMod={isAccountMod}
              isCommentAuthorMod={isCommentAuthorMod}
              replyCount={replyCount}
              showCommentEditForm={showCommentEditForm}
              subplebbitAddress={subplebbitAddress}
            />
          </>
        )}
      </ul>
    )
  );
};

export default CommentTools;
