import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { Comment, useAuthorAddress, useBlock, useComment, useEditedComment, useSubplebbit, useSubscribe } from '@plebbit/plebbit-react-hooks';
import Plebbit from '@plebbit/plebbit-js';
import { getHasThumbnail } from '../../lib/utils/media-utils';
import { getPostScore, formatScore } from '../../lib/utils/post-utils';
import { getFormattedTimeAgo, formatLocalizedUTCTimestamp } from '../../lib/utils/time-utils';
import { getHostname } from '../../lib/utils/url-utils';
import { isAllView, isAuthorView, isPendingPostView, isPostPageView, isProfileHiddenView, isProfileView, isSubplebbitView } from '../../lib/utils/view-utils';
import { highlightMatchedText } from '../../lib/utils/pattern-utils';
import { usePinnedPostsStore } from '../../stores/use-pinned-posts-store';
import { useCommentMediaInfo } from '../../hooks/use-comment-media-info';
import useDownvote from '../../hooks/use-downvote';
import useIsMobile from '../../hooks/use-is-mobile';
import { useIsNsfwSubplebbit } from '../../hooks/use-is-nsfw-subplebbit';
import useUpvote from '../../hooks/use-upvote';
import useWindowWidth from '../../hooks/use-window-width';
import CommentEditForm from '../comment-edit-form';
import ExpandButton from './expand-button';
import Expando from './expando';
import Flair from './flair';
import CommentTools from './comment-tools';
import Thumbnail from './thumbnail';
// Removed CSS modules import - converted to Tailwind classes
import _ from 'lodash';
import useContentOptionsStore from '../../stores/use-content-options-store';
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
}

const PostAuthor = ({ authorAddress, authorRole, cid, displayName, index, pinned, shortAddress, shortAuthorAddress, authorAddressChanged }: PostAuthorProps) => {
  // TODO: implement comment.highlightRole once implemented in API
  const isAuthorOwner = authorRole === 'owner';
  const isAuthorAdmin = authorRole === 'admin';
  const isAuthorModerator = authorRole === 'moderator';
  const moderatorClass = `${
    isAuthorOwner ? 'text-green-500 font-bold' : isAuthorAdmin ? 'text-green-500 font-bold' : isAuthorModerator ? 'text-green-500 font-bold' : ''
  }`;
  const authorRoleInitial = (isAuthorOwner && 'O') || (isAuthorAdmin && 'A') || (isAuthorModerator && 'M') || '';

  const shortDisplayName = displayName?.trim().length > 20 ? displayName?.trim().slice(0, 20).trim() + '...' : displayName?.trim();

  return (
    <>
      <Link to={cid ? `/u/${authorAddress}/c/${cid}` : `/profile/${index}`} className={`text-blue-600 hover:underline no-underline ${pinned && moderatorClass}`}>
        {displayName && (
          <>
            {' '}
            <span className={`text-gray-900 dark:text-gray-100 ${pinned && moderatorClass}`}>{shortDisplayName}</span>
          </>
        )}{' '}
        <span className={`inline-block overflow-x-clip ${pinned && moderatorClass}`}>
          <span className='invisible select-none'>u/{shortAddress || shortAuthorAddress}</span>
          <span className={`float-left w-0 whitespace-nowrap ${authorAddressChanged && 'post-author-address-changed'}`}>u/{shortAuthorAddress}</span>
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
    linkHeight,
    linkWidth,
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

  const { mediaPreviewOption, thumbnailDisplayOption } = useContentOptionsStore();

  const [isExpanded, setIsExpanded] = useState((isInPostPageView || isInPendingPostView) && mediaPreviewOption === 'autoExpandAll');
  const toggleExpanded = () => setIsExpanded(!isExpanded);

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

  const hasThumbnail = getHasThumbnail(commentMediaInfo, link);
  const hostname = getHostname(link);
  const linkClass = `${
    isInPostPageView
      ? link
        ? 'text-blue-600 dark:text-blue-400 no-underline visited:text-purple-600 dark:visited:text-purple-400'
        : 'text-blue-600 dark:text-blue-400 no-underline visited:text-blue-600 dark:visited:text-blue-400'
      : 'text-blue-600 dark:text-blue-400 no-underline visited:text-purple-600 dark:visited:text-purple-400'
  } ${pinned ? 'text-green-500 font-bold' : ''}`;

  const { blocked, unblock } = useBlock({ cid });

  const [hasClickedSubscribe, setHasClickedSubscribe] = useState(false);
  const { subscribe, subscribed } = useSubscribe({ subplebbitAddress });

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

  const isMobile = useIsMobile();
  const windowWidth = useWindowWidth();
  const pinnedPostsCount = usePinnedPostsStore((state) => state.pinnedPostsCount);
  let rank = (index ?? 0) + 1;
  if (isInSubplebbitView) {
    rank = rank - pinnedPostsCount;
  }

  return (
    <div className='flex flex-col pb-2' key={index}>
      <div className={isLastClicked ? 'border border-dashed border-gray-500' : ''}>
        <div className={`overflow-hidden border border-dashed border-gray-300 p-3 ${blocked && !isInProfileHiddenView ? 'block' : 'hidden'}`}>
          <div className='text-sm text-gray-700 dark:text-gray-300'>{t('post_hidden').charAt(0).toUpperCase() + t('post_hidden').slice(1)}</div>
          <div className='inline-block text-gray-500 font-bold text-xs cursor-pointer' onClick={unblock}>
            {t('undo')}
          </div>
        </div>
        <div className={`${blocked && !isInProfileHiddenView ? 'hidden' : 'block'}`}>
          <div className='flex items-start'>
            {!isMobile && !isInProfileView && !isInAuthorView && !isInPostPageView && (
              <div className='pr-1 pl-1 min-w-[2.2ex] mt-4 text-gray-400 font-arial text-base text-right'>{pinned ? undefined : rank}</div>
            )}
            <div className='flex-shrink-0'>
              <div className='w-[37px] font-bold text-sm float-left pr-2 bg-transparent overflow-hidden'>
                <div className='pl-[11px] pt-0.5'>
                  <div className={`w-[15px] h-[14px] block cursor-pointer ${upvoted ? 'arrow-up-voted' : 'arrow-up'}`} onClick={() => cid && upvote()} />
                </div>
                <div className='text-center text-muted-foreground'>{formatScore(postScore)}</div>
                <div className='pl-[11px] pt-0.5'>
                  <div className={`w-[15px] h-[14px] block cursor-pointer ${downvoted ? 'arrow-down-voted' : 'arrow-down'}`} onClick={() => cid && downvote()} />
                </div>
              </div>
              {thumbnailDisplayOption === 'show' && (
                <Thumbnail
                  cid={cid}
                  commentMediaInfo={commentMediaInfo}
                  isReply={false}
                  isLink={!hasThumbnail && link}
                  isNsfw={nsfw}
                  isSpoiler={spoiler}
                  isText={!hasThumbnail && !link}
                  link={link}
                  linkHeight={linkHeight}
                  linkWidth={linkWidth}
                  subplebbitAddress={subplebbitAddress}
                  isPdf={commentMediaInfo?.type === 'pdf'}
                />
              )}
            </div>
            <div className='flex-grow overflow-visible p-0 overflow-hidden'>
              <div>
                <p className='text-base font-normal'>
                  {isInPostPageView && link ? (
                    <a href={link} className={linkClass} target='_blank' rel='noopener noreferrer' onClick={handlePostClick}>
                      {displayedTitle}
                    </a>
                  ) : (
                    <Link className={linkClass} to={cid ? `/p/${subplebbitAddress}/c/${cid}` : `/profile/${post?.index}`} onClick={handlePostClick}>
                      {displayedTitle}
                    </Link>
                  )}
                  {flair && (
                    <>
                      {' '}
                      <Flair flair={flair} />
                    </>
                  )}{' '}
                  <span className='text-gray-500 text-xs whitespace-nowrap align-middle inline-block pb-0.5'>
                    (
                    {hostname ? (
                      <Link to={`/domain/${hostname}`}>{hostname.length > 25 ? hostname.slice(0, 25) + '...' : hostname}</Link>
                    ) : (
                      <Link to={`/p/${subplebbitAddress}`}>self.{subplebbit?.shortAddress || (subplebbitAddress && Plebbit.getShortAddress(subplebbitAddress))}</Link>
                    )}
                    )
                  </span>
                </p>
                {(!(commentMediaInfo?.type === 'webpage') || (commentMediaInfo?.type === 'webpage' && content?.trim().length > 0)) &&
                  !(isInPostPageView && !link && content?.trim().length > 0) && (
                    <ExpandButton
                      commentMediaInfo={commentMediaInfo}
                      content={content}
                      expanded={isExpanded}
                      hasThumbnail={hasThumbnail}
                      link={link}
                      toggleExpanded={toggleExpanded}
                    />
                  )}
                <div className='text-xs'>
                  {t('submitted')} <span title={postDate}>{getFormattedTimeAgo(timestamp)}</span>{' '}
                  {edit && isInPostPageView && <span className='lowercase italic'>{t('last_edited', { timestamp: getFormattedTimeAgo(edit.timestamp) })}</span>}{' '}
                  {t('post_by')}
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
                  />
                  {!isInSubplebbitView && (
                    <>
                       {t('post_to')}
                      <span className='px-1 whitespace-nowrap'>
                        {isInAllView && (!subscribed || (subscribed && hasClickedSubscribe)) && (
                          <span className='pr-3.5'>
                            <button
                              className={`absolute border-none bg-none bg-no-repeat h-3 w-3 bg-[length:12px] cursor-pointer ${
                                subscribed
                                  ? 'bg-[url("/assets/buttons/all_feed_subscribed.png")]'
                                  : 'bg-[url("/assets/buttons/all_feed_subscribe.png")] hover:bg-[url("/assets/buttons/all_feed_subscribe_hover.png")]'
                              }`}
                              onClick={() => {
                                subscribe();
                                setHasClickedSubscribe(true);
                              }}
                            />
                          </span>
                        )}
                        <Link
                          className={`text-gray-600 dark:text-gray-400 hover:underline ${subscribed && hasClickedSubscribe ? 'text-green-400' : ''}`}
                          to={`/p/${subplebbitAddress}`}
                        >
                          p/{subplebbit?.shortAddress || (subplebbitAddress && Plebbit.getShortAddress(subplebbitAddress))}
                        </Link>
                      </span>
                    </>
                  )}
                  {pinned && <span className='text-green-500'> - {t('announcement')}</span>}
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
              {!(windowWidth < 770) && !(!content && !link) && (
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
            </div>
          </div>
          {windowWidth < 770 && !(!content && !link) && (
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
        </div>
      </div>
    </div>
  );
};

export default React.memo(Post);
