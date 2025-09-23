import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Author, useAccount, useComment, useSubplebbit } from '@plebbit/plebbit-react-hooks';
// Removed CSS modules import - converted to Tailwind classes
import EditMenu from './edit-menu';
import HideMenu from './hide-menu';
import Label from '../label';
import ModMenu from './mod-menu';
import { isInboxView } from '../../../lib/utils/view-utils';
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
}

interface ModOrReportButtonProps {
  cid: string;
  isAuthor: boolean | undefined;
  isAccountMod: boolean | undefined;
  isCommentAuthorMod?: boolean;
}

const ModOrReportButton = ({ cid, isAuthor, isAccountMod, isCommentAuthorMod }: ModOrReportButtonProps) => {
  const { t } = useTranslation();

  return isAccountMod ? (
    <ModMenu cid={cid} isCommentAuthorMod={isCommentAuthorMod} />
  ) : (
    !isAuthor && (
      <li className='text-gray-600 dark:text-gray-400 font-bold no-underline px-1 cursor-pointer hidden sm:block'>
        <span>{t('report')}</span>
      </li>
    )
  );
};

const ShareButton = ({ cid, subplebbitAddress }: { cid: string; subplebbitAddress: string }) => {
  const { t } = useTranslation();
  const [hasCopied, setHasCopied] = useState(false);

  useEffect(() => {
    if (hasCopied) {
      setTimeout(() => setHasCopied(false), 2000);
    }
  }, [hasCopied]);

  const handleCopy = async () => {
    try {
      setHasCopied(true);
      await copyShareLinkToClipboard(subplebbitAddress, cid);
    } catch (error) {
      console.error('Failed to copy share link:', error);
      setHasCopied(false);
    }
  };

  return (
    <li
      className={`${
        !hasCopied ? 'text-gray-600 dark:text-gray-400 font-bold no-underline px-1 cursor-pointer' : '!cursor-default !text-gray-800 dark:!text-gray-200 !no-underline'
      }`}
      onClick={() => cid && handleCopy()}
    >
      {hasCopied ? t('link_copied') : t('share')}
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
  const commentCount = validReplyCount === 0 ? t('post_no_comments') : `${validReplyCount} ${validReplyCount === 1 ? t('post_comment') : t('post_comments')}`;

  // show gray dotted border around last clicked post
  const handlePostClick = () => {
    if (cid) {
      if (sessionStorage.getItem('lastClickedPost') === cid) {
        sessionStorage.removeItem('lastClickedPost');
      } else {
        sessionStorage.setItem('lastClickedPost', cid);
      }
    }
  };

  const commentCountButton = failed ? (
    <span>{commentCount}</span>
  ) : (
    <Link to={cid ? `/p/${subplebbitAddress}/c/${cid}` : `/profile/${index}`} onClick={() => cid && handlePostClick?.()}>
      {commentCount}
    </Link>
  );

  return (
    <>
      <li className={`text-gray-600 dark:text-gray-400 font-bold no-underline px-1 cursor-pointer ${!hasLabel ? '!pl-0' : ''}`}>{commentCountButton}</li>
      <ShareButton cid={cid} subplebbitAddress={subplebbitAddress} />
      {/* TODO: Implement save functionality
        <li className="text-gray-600 dark:text-gray-400 font-bold no-underline px-1 cursor-pointer">
          <span>{t('save')}</span>
        </li> 
      */}
      {isAuthor && <EditMenu commentCid={cid} showCommentEditForm={showCommentEditForm} />}
      <HideMenu author={author} cid={cid} isAccountMod={isAccountMod} subplebbitAddress={subplebbitAddress} />
      {/* TODO: Implement crosspost functionality
        <li className="text-gray-600 dark:text-gray-400 font-bold no-underline px-1 cursor-pointer hidden sm:block">
          <span>{t('crosspost')}</span>
        </li> 
      */}
      <ModOrReportButton cid={cid} isAuthor={isAuthor} isAccountMod={isAccountMod} isCommentAuthorMod={isCommentAuthorMod} />
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
  showReplyForm,
  subplebbitAddress,
  showCommentEditForm,
}: CommentToolsProps) => {
  const { t } = useTranslation();

  const permalink = failed ? (
    <span>permalink</span>
  ) : (
    <Link to={cid ? `/p/${subplebbitAddress}/c/${cid}` : `/profile/${index}`} onClick={(e) => !cid && e.preventDefault()}>
      permalink
    </Link>
  );

  return (
    <>
      <li className={`text-gray-600 dark:text-gray-400 font-bold no-underline px-1 cursor-pointer ${!hasLabel ? '!pl-0' : ''}`}>{permalink}</li>
      <ShareButton cid={cid} subplebbitAddress={subplebbitAddress} />
      {/* TODO: Implement save functionality
        <li className="text-gray-600 dark:text-gray-400 font-bold no-underline px-1 cursor-pointer">
          <span>{t('save')}</span>
        </li> 
      */}
      {isAuthor && <EditMenu commentCid={cid} showCommentEditForm={showCommentEditForm} />}
      <HideMenu author={author} cid={cid} isAccountMod={isAccountMod} subplebbitAddress={subplebbitAddress} />
      <li className={!cid ? '!hidden' : 'text-gray-600 dark:text-gray-400 font-bold no-underline px-1 cursor-pointer'}>
        <span onClick={() => cid && showReplyForm?.()}>{t('reply_reply')}</span>
      </li>
      <ModOrReportButton cid={cid} isAuthor={isAuthor} isAccountMod={isAccountMod} isCommentAuthorMod={isCommentAuthorMod} />
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
  showReplyForm,
  subplebbitAddress,
  showCommentEditForm,
}: CommentToolsProps) => {
  const { t } = useTranslation();
  const comment = useComment({ commentCid: postCid, onlyIfCached: true });

  const hasContext = parentCid !== postCid;

  const permalinkButton = cid ? (
    <Link to={cid ? `/p/${subplebbitAddress}/c/${cid}` : `/profile/${index}`} onClick={(e) => !cid && e.preventDefault()}>
      permalink
    </Link>
  ) : (
    <span>permalink</span>
  );

  const contextButton = cid ? (
    <Link to={cid ? (hasContext ? `/p/${subplebbitAddress}/c/${cid}/?context=3` : `/p/${subplebbitAddress}/c/${cid}`) : `/profile/${index}`}>{t('context')}</Link>
  ) : (
    <span>{t('context')}</span>
  );

  const fullCommentsButton = cid ? (
    <Link to={cid ? `/p/${subplebbitAddress}/c/${postCid}` : `/profile/${index}`}>
      {t('full_comments')} {comment?.replyCount ? `(${comment?.replyCount})` : ''}
    </Link>
  ) : (
    <span>
      {t('full_comments')} {comment?.replyCount ? `(${comment?.replyCount})` : ''}
    </span>
  );

  return (
    <>
      <li className={`text-gray-600 dark:text-gray-400 font-bold no-underline px-1 cursor-pointer ${!hasLabel ? '!pl-0' : ''}`}>{permalinkButton}</li>
      {/* TODO: Implement save functionality
        <li className="text-gray-600 dark:text-gray-400 font-bold no-underline px-1 cursor-pointer">
          <span>{t('save')}</span>
        </li> 
      */}
      {isAuthor && <EditMenu commentCid={cid} showCommentEditForm={showCommentEditForm} />}
      <li className='text-gray-600 dark:text-gray-400 font-bold no-underline px-1 cursor-pointer'>{contextButton}</li>
      <li className='text-gray-600 dark:text-gray-400 font-bold no-underline px-1 cursor-pointer'>{fullCommentsButton}</li>
      <HideMenu author={author} cid={cid} isAccountMod={isAccountMod} subplebbitAddress={subplebbitAddress} />
      <li className={!cid ? '!hidden' : 'text-gray-600 dark:text-gray-400 font-bold no-underline px-1 cursor-pointer'}>
        <span onClick={() => cid && showReplyForm?.()}>{t('reply_reply')}</span>
      </li>
      <ModOrReportButton cid={cid} isAuthor={isAuthor} isAccountMod={isAccountMod} isCommentAuthorMod={isCommentAuthorMod} />
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

  return (
    <>
      {visibleLabels.map((label, index) => (
        <Label key={label.text} color={label.color} text={label.text} isFirstInLine={index === 0} />
      ))}
    </>
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
}: CommentToolsProps) => {
  const account = useAccount();
  const isAuthor = account?.author?.address === author?.address;
  const subplebbit = useSubplebbit({ subplebbitAddress, onlyIfCached: true });
  const accountAuthorRole = subplebbit?.roles?.[account?.author?.address]?.role;
  const commentAuthorRole = subplebbit?.roles?.[author?.address]?.role;
  const isAccountMod = accountAuthorRole === 'admin' || accountAuthorRole === 'owner' || accountAuthorRole === 'moderator';
  const isCommentAuthorMod = commentAuthorRole === 'admin' || commentAuthorRole === 'owner' || commentAuthorRole === 'moderator';
  const isInInboxView = isInboxView(useLocation().pathname);

  return (
    (!(deleted || removed) || (!deleted && isAccountMod)) && (
      <ul
        className={`list-none py-0.5 px-0 block ${isReply && !isInInboxView ? 'ml-7' : ''} ${
          hasLabel ? 'pt-1.5' : ''
        } [&_li]:inline-block [&_li]:border-none [&_li]:pr-1 [&_li]:leading-6 [&_li]:whitespace-nowrap [&_li_a]:text-gray-600 dark:[&_li_a]:text-gray-400 [&_li_a]:font-bold [&_li_a]:no-underline [&_li_a]:px-0.5 [&_li:hover]:underline [&_li_span]:cursor-pointer`}
      >
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
