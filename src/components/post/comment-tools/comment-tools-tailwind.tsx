import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Author, useAccount, useComment, useSubplebbit } from '@plebbit/plebbit-react-hooks';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import EditMenu from './edit-menu';
import HideMenu from './hide-menu';
import Label from '../label';
import ModMenu from './mod-menu';
import { isInboxView } from '../../../lib/utils/view-utils';
import { copyShareLinkToClipboard } from '../../../lib/utils/url-utils';
import { 
  MoreHorizontal, 
  Edit, 
  Eye, 
  EyeOff, 
  Share2, 
  Flag, 
  Copy,
  ExternalLink,
  MessageSquare,
  Reply,
  Link as LinkIcon
} from 'lucide-react';

interface CommentToolsProps {
  author?: Author;
  cid: string;
  deleted?: boolean;
  failed?: boolean;
  editState?: string;
  hasLabel?: boolean;
  hasThumbnail?: boolean;
  isReply?: boolean;
  isCrosspost?: boolean;
  isInboxView?: boolean;
  isModerator?: boolean;
  isOwner?: boolean;
  isAdmin?: boolean;
  label?: string;
  parentCid?: string;
  replyCount?: number;
  subplebbitAddress?: string;
  timestamp?: number;
  title?: string;
  url?: string;
}

const CommentTools = ({
  author,
  cid,
  deleted = false,
  failed = false,
  editState,
  hasLabel = false,
  hasThumbnail = false,
  isReply = false,
  isCrosspost = false,
  isInboxView: isInInboxView = false,
  isModerator = false,
  isOwner = false,
  isAdmin = false,
  label,
  parentCid,
  replyCount = 0,
  subplebbitAddress,
  timestamp,
  title,
  url,
}: CommentToolsProps) => {
  const { t } = useTranslation();
  const location = useLocation();
  const account = useAccount();
  const comment = useComment(cid);
  const subplebbit = useSubplebbit(subplebbitAddress);
  
  // State
  const [hasCopied, setHasCopied] = useState(false);
  const [showEditMenu, setShowEditMenu] = useState(false);
  const [showHideMenu, setShowHideMenu] = useState(false);
  const [showModMenu, setShowModMenu] = useState(false);

  // Computed values
  const isInInboxView = isInboxView(location.pathname);
  const isAuthor = account?.address === author?.address;
  const canEdit = isAuthor && !deleted && !failed;
  const canModerate = isModerator || isOwner || isAdmin;
  const canReport = !isAuthor && !deleted && !failed;

  // Handlers
  const handleCopy = async () => {
    if (cid) {
      await copyShareLinkToClipboard(cid);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (navigator.share && url) {
      try {
        await navigator.share({
          title: title || 'Post',
          url: url,
        });
      } catch (error) {
        // Fallback to copy
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  const handleReport = () => {
    // Implementation for reporting
    console.log('Report post:', cid);
  };

  const handleEdit = () => {
    setShowEditMenu(true);
  };

  const handleHide = () => {
    setShowHideMenu(true);
  };

  const handleModerate = () => {
    setShowModMenu(true);
  };

  // Render helpers
  const renderCommentCount = () => {
    if (replyCount === 0) return null;
    
    return (
      <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
        <MessageSquare className="w-3 h-3 mr-1" />
        {replyCount} {replyCount === 1 ? t('comment') : t('comments')}
      </Button>
    );
  };

  const renderPermalink = () => {
    if (!cid) return null;
    
    return (
      <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
        <LinkIcon className="w-3 h-3 mr-1" />
        {t('permalink')}
      </Button>
    );
  };

  const renderReply = () => {
    if (!cid) return null;
    
    return (
      <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
        <Reply className="w-3 h-3 mr-1" />
        {t('reply')}
      </Button>
    );
  };

  const renderContext = () => {
    if (!parentCid) return null;
    
    return (
      <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
        <ExternalLink className="w-3 h-3 mr-1" />
        {t('context')}
      </Button>
    );
  };

  const renderFullComments = () => {
    if (!parentCid) return null;
    
    return (
      <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
        <MessageSquare className="w-3 h-3 mr-1" />
        {t('full_comments')}
      </Button>
    );
  };

  const renderCrosspost = () => {
    if (!isCrosspost) return null;
    
    return (
      <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
        <ExternalLink className="w-3 h-3 mr-1" />
        {t('crosspost')}
      </Button>
    );
  };

  const renderLabel = () => {
    if (!hasLabel || !label) return null;
    
    return (
      <Badge variant="secondary" className="text-xs">
        {label}
      </Badge>
    );
  };

  return (
    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
      {/* Label */}
      {renderLabel()}
      
      {/* Comment Count */}
      {renderCommentCount()}
      
      {/* Permalink */}
      {renderPermalink()}
      
      {/* Crosspost */}
      {renderCrosspost()}
      
      {/* Reply */}
      {renderReply()}
      
      {/* Context */}
      {renderContext()}
      
      {/* Full Comments */}
      {renderFullComments()}
      
      {/* Separator */}
      <Separator orientation="vertical" className="h-4" />
      
      {/* Action Buttons */}
      <div className="flex items-center space-x-1">
        {/* Share */}
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-xs"
          onClick={handleShare}
        >
          <Share2 className="w-3 h-3 mr-1" />
          {t('share')}
        </Button>
        
        {/* Copy */}
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-xs"
          onClick={handleCopy}
        >
          <Copy className="w-3 h-3 mr-1" />
          {hasCopied ? t('copied') : t('copy')}
        </Button>
        
        {/* Edit */}
        {canEdit && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs"
            onClick={handleEdit}
          >
            <Edit className="w-3 h-3 mr-1" />
            {t('edit')}
          </Button>
        )}
        
        {/* Hide */}
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-xs"
          onClick={handleHide}
        >
          <EyeOff className="w-3 h-3 mr-1" />
          {t('hide')}
        </Button>
        
        {/* Report */}
        {canReport && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs"
            onClick={handleReport}
          >
            <Flag className="w-3 h-3 mr-1" />
            {t('report')}
          </Button>
        )}
        
        {/* Moderate */}
        {canModerate && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs"
            onClick={handleModerate}
          >
            <MoreHorizontal className="w-3 h-3 mr-1" />
            {t('moderate')}
          </Button>
        )}
      </div>
      
      {/* Modals */}
      {showEditMenu && (
        <EditMenu
          cid={cid}
          onClose={() => setShowEditMenu(false)}
        />
      )}
      
      {showHideMenu && (
        <HideMenu
          cid={cid}
          onClose={() => setShowHideMenu(false)}
        />
      )}
      
      {showModMenu && (
        <ModMenu
          cid={cid}
          onClose={() => setShowModMenu(false)}
        />
      )}
    </div>
  );
};

export default CommentTools;
