import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { Comment, useAuthorAddress, useBlock, useComment, useEditedComment, useSubplebbit, useSubscribe } from '@plebbit/plebbit-react-hooks';
import Plebbit from '@plebbit/plebbit-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
import _ from 'lodash';
import useContentOptionsStore from '../../stores/use-content-options-store';
import React from 'react';
import { 
  ChevronUp, 
  ChevronDown, 
  ExternalLink, 
  Pin, 
  Clock,
  User,
  MessageSquare
} from 'lucide-react';

interface PostAuthorProps {
  authorAddress: string;
  shortDisplayName: string;
  shortAddress: string;
  shortAuthorAddress: string;
  authorAddressChanged: boolean;
  cid?: string;
  index: number;
  pinned: boolean;
  isAuthorOwner: boolean;
  isAuthorAdmin: boolean;
  isAuthorModerator: boolean;
}

const PostAuthor = ({ 
  authorAddress, 
  shortDisplayName, 
  shortAddress, 
  shortAuthorAddress, 
  authorAddressChanged, 
  cid, 
  index, 
  pinned,
  isAuthorOwner,
  isAuthorAdmin,
  isAuthorModerator
}: PostAuthorProps) => {
  const { t } = useTranslation();
  
  const getModeratorBadge = () => {
    if (isAuthorOwner) return <Badge variant="destructive" className="text-xs">Owner</Badge>;
    if (isAuthorAdmin) return <Badge variant="destructive" className="text-xs">Admin</Badge>;
    if (isAuthorModerator) return <Badge variant="secondary" className="text-xs">Mod</Badge>;
    return null;
  };

  return (
    <div className="flex items-center space-x-2">
      <Link 
        to={cid ? `/u/${authorAddress}/c/${cid}` : `/profile/${index}`} 
        className="flex items-center space-x-2 hover:underline"
      >
        <User className="w-4 h-4 text-muted-foreground" />
        <span className="font-medium text-sm">{shortDisplayName}</span>
        {getModeratorBadge()}
      </Link>
      
      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
        <span className="hidden sm:inline">u/{shortAddress || shortAuthorAddress}</span>
        {authorAddressChanged && (
          <span className="text-primary">u/{shortAuthorAddress}</span>
        )}
      </div>
    </div>
  );
};

interface PostProps {
  comment: Comment;
  index: number;
  rank?: number;
  searchQuery?: string;
  isLastClicked?: boolean;
}

const Post = ({ comment, index, rank, searchQuery, isLastClicked }: PostProps) => {
  const { t } = useTranslation();
  const location = useLocation();
  const params = useParams();
  const [searchParams] = useSearchParams();
  
  // Hooks
  const authorAddress = useAuthorAddress(comment);
  const subplebbit = useSubplebbit(comment.subplebbitAddress);
  const editedComment = useEditedComment(comment.cid);
  const { subscribe, unsubscribe } = useSubscribe(comment.subplebbitAddress);
  const { block, unblock } = useBlock(comment.cid);
  const upvote = useUpvote(comment.cid);
  const downvote = useDownvote(comment.cid);
  const isMobile = useIsMobile();
  const windowWidth = useWindowWidth();
  const { isNsfwSubplebbit } = useIsNsfwSubplebbit(comment.subplebbitAddress);
  const { pinnedPosts } = usePinnedPostsStore();
  const { showThumbnails } = useContentOptionsStore();
  
  // State
  const [edit, setEdit] = useState(false);
  const [expanded, setExpanded] = useState(false);
  
  // Computed values
  const postScore = getPostScore(comment);
  const upvoted = comment.upvoteCount > 0;
  const downvoted = comment.downvoteCount > 0;
  const blocked = comment.blocked;
  const subscribed = subplebbit?.subscribed;
  const pinned = pinnedPosts.includes(comment.cid);
  
  // View detection
  const isInPostPageView = isPostPageView(location.pathname);
  const isInProfileView = isProfileView(location.pathname);
  const isInAuthorView = isAuthorView(location.pathname);
  const isInProfileHiddenView = isProfileHiddenView(location.pathname);
  
  // Author info
  const shortDisplayName = comment.author?.displayName || 'Anonymous';
  const shortAddress = authorAddress ? authorAddress.slice(0, 6) + '...' + authorAddress.slice(-4) : '';
  const shortAuthorAddress = authorAddress ? authorAddress.slice(0, 6) + '...' + authorAddress.slice(-4) : '';
  const authorAddressChanged = comment.authorAddress !== authorAddress;
  
  // Subplebbit info
  const subplebbitAddress = comment.subplebbitAddress;
  const subplebbitTitle = subplebbit?.title || subplebbitAddress;
  
  // Content info
  const link = comment.link;
  const hasThumbnail = getHasThumbnail(comment);
  const title = comment.title || '';
  const content = comment.content || '';
  
  // Handlers
  const handleSubscribe = () => {
    if (subscribed) {
      unsubscribe();
    } else {
      subscribe();
    }
  };

  const handleUpvote = () => {
    if (comment.cid) upvote();
  };

  const handleDownvote = () => {
    if (comment.cid) downvote();
  };

  const handleExpand = () => {
    setExpanded(!expanded);
  };

  const handleUnblock = () => {
    unblock();
  };

  // Render helpers
  const renderTitle = () => {
    if (!title) return null;
    
    const highlightedTitle = searchQuery ? highlightMatchedText(title, searchQuery) : title;
    
    if (link) {
      return (
        <a 
          href={link} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-lg font-semibold text-primary hover:underline"
          dangerouslySetInnerHTML={{ __html: highlightedTitle }}
        />
      );
    }
    
    return (
      <Link 
        to={`/p/${subplebbitAddress}/c/${comment.cid}`}
        className="text-lg font-semibold text-foreground hover:text-primary"
        dangerouslySetInnerHTML={{ __html: highlightedTitle }}
      />
    );
  };

  const renderThumbnail = () => {
    if (!hasThumbnail || !showThumbnails) return null;
    
    return (
      <div className="flex-shrink-0 mr-3">
        <Thumbnail comment={comment} />
      </div>
    );
  };

  const renderVotingButtons = () => {
    if (isInPostPageView) return null;
    
    return (
      <div className="flex flex-col items-center space-y-1">
        <Button
          variant="ghost"
          size="sm"
          className={`h-6 w-6 p-0 ${upvoted ? 'text-orange-500' : 'text-muted-foreground'}`}
          onClick={handleUpvote}
        >
          <ChevronUp className="w-4 h-4" />
        </Button>
        
        <span className="text-sm font-medium text-center min-w-[2rem]">
          {formatScore(postScore)}
        </span>
        
        <Button
          variant="ghost"
          size="sm"
          className={`h-6 w-6 p-0 ${downvoted ? 'text-blue-500' : 'text-muted-foreground'}`}
          onClick={handleDownvote}
        >
          <ChevronDown className="w-4 h-4" />
        </Button>
      </div>
    );
  };

  if (blocked && !isInProfileHiddenView) {
    return (
      <Card className="mb-2">
        <CardContent className="pt-4">
          <div className="text-center text-muted-foreground">
            <p className="mb-2">{t('post_hidden').charAt(0).toUpperCase() + t('post_hidden').slice(1)}</p>
            <Button variant="outline" size="sm" onClick={handleUnblock}>
              {t('undo')}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`mb-2 ${isLastClicked ? 'ring-2 ring-primary' : ''}`}>
      <CardContent className="pt-4">
        <div className="flex space-x-3">
          {/* Voting buttons */}
          {renderVotingButtons()}
          
          {/* Thumbnail */}
          {renderThumbnail()}
          
          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                {!isMobile && !isInProfileView && !isInAuthorView && !isInPostPageView && rank && (
                  <span className="text-sm text-muted-foreground font-mono w-8 text-right">
                    {pinned ? undefined : rank}
                  </span>
                )}
                
                <PostAuthor
                  authorAddress={authorAddress}
                  shortDisplayName={shortDisplayName}
                  shortAddress={shortAddress}
                  shortAuthorAddress={shortAuthorAddress}
                  authorAddressChanged={authorAddressChanged}
                  cid={comment.cid}
                  index={index}
                  pinned={pinned}
                  isAuthorOwner={false} // TODO: implement owner check
                  isAuthorAdmin={false} // TODO: implement admin check
                  isAuthorModerator={false} // TODO: implement moderator check
                />
              </div>
              
              {pinned && (
                <Badge variant="secondary" className="text-xs">
                  <Pin className="w-3 h-3 mr-1" />
                  {t('pinned')}
                </Badge>
              )}
            </div>
            
            {/* Title */}
            <div className="mb-2">
              {renderTitle()}
            </div>
            
            {/* Domain */}
            {link && (
              <div className="mb-2">
                <a 
                  href={link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-muted-foreground hover:text-primary flex items-center space-x-1"
                >
                  <span>{getHostname(link)}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
            
            {/* Content */}
            {content && (
              <div className="mb-3">
                <div className="text-sm text-muted-foreground leading-relaxed">
                  {expanded ? (
                    <div dangerouslySetInnerHTML={{ __html: content }} />
                  ) : (
                    <div className="line-clamp-3" dangerouslySetInnerHTML={{ __html: content }} />
                  )}
                </div>
                
                {content.length > 200 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mt-2 h-6 px-2 text-xs"
                    onClick={handleExpand}
                  >
                    {expanded ? t('show_less') : t('show_more')}
                  </Button>
                )}
              </div>
            )}
            
            {/* Footer */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center space-x-3">
                <Link 
                  to={`/p/${subplebbitAddress}`}
                  className="hover:text-primary flex items-center space-x-1"
                >
                  <span>p/{subplebbitTitle}</span>
                </Link>
                
                <Separator orientation="vertical" className="h-3" />
                
                <span className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{getFormattedTimeAgo(comment.timestamp)}</span>
                </span>
                
                {comment.replyCount > 0 && (
                  <>
                    <Separator orientation="vertical" className="h-3" />
                    <span className="flex items-center space-x-1">
                      <MessageSquare className="w-3 h-3" />
                      <span>{comment.replyCount} {comment.replyCount === 1 ? t('comment') : t('comments')}</span>
                    </span>
                  </>
                )}
              </div>
              
              <CommentTools comment={comment} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Post;
