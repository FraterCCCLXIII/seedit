import { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Comment, Role, Subplebbit, useSubplebbitStats } from '@plebbit/plebbit-react-hooks';
import Plebbit from '@plebbit/plebbit-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { getPostScore } from '../../lib/utils/post-utils';
import { getFormattedDate, getFormattedTimeAgo } from '../../lib/utils/time-utils';
import {
  isAllView,
  isDomainView,
  isHomeAboutView,
  isHomeView,
  isModView,
  isPendingPostView,
  isPostPageAboutView,
  isPostPageView,
  isSubplebbitAboutView,
  isSubplebbitSettingsView,
  isSubplebbitsView,
  isSubplebbitView,
} from '../../lib/utils/view-utils';
import useIsSubplebbitOffline from '../../hooks/use-is-subplebbit-offline';
import { FAQ } from '../../views/about/about';
import LoadingEllipsis from '../loading-ellipsis';
import Markdown from '../markdown';
import SearchBar from '../search-bar';
import SubscribeButton from '../subscribe-button';
import { Version } from '../version';
import { 
  Users, 
  Settings, 
  Shield, 
  Plus, 
  Calendar,
  TrendingUp,
  Share2,
  ExternalLink
} from 'lucide-react';

const RulesList = ({ rules }: { rules: string[] }) => {
  const { t } = useTranslation();
  const markdownRules = rules.map((rule, index) => `${index + 1}. ${rule}`).join('\n');

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold uppercase tracking-wide flex items-center space-x-2">
          <Shield className="w-4 h-4" />
          <span>{t('rules')}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <Markdown content={markdownRules} />
      </CardContent>
    </Card>
  );
};

const ModeratorsList = ({ moderators }: { moderators: Role[] }) => {
  const { t } = useTranslation();

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold uppercase tracking-wide">
          {t('moderators')}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ul className="space-y-2">
          {moderators.map((moderator) => (
            <li key={moderator.address} className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{moderator.address}</span>
              <Badge variant="secondary" className="text-xs">
                {moderator.role}
              </Badge>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

const PostInfo = ({ comment }: { comment: Comment }) => {
  const { t } = useTranslation();
  const postScore = getPostScore(comment);
  const postDate = getFormattedDate(comment.timestamp);

  return (
    <Card className="mb-4">
      <CardContent className="pt-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t('posted')}</span>
            <span className="font-medium">{postDate}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t('score')}</span>
            <div className="flex items-center space-x-1">
              <span className="font-medium">{postScore === '•' ? '0' : postScore}</span>
              <span className="text-muted-foreground">
                {postScore === 1 ? t('point') : t('points')}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t('share')}</span>
            <Button variant="ghost" size="sm" className="h-8 px-2">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ModerationTools = ({ address }: { address: string }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const isInSubplebbitSettingsView = location.pathname.includes('/settings');

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold uppercase tracking-wide">
          {t('moderation_tools')}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ul className="space-y-2">
          <li>
            <Link 
              to={`/p/${address}/settings`}
              className={`flex items-center space-x-2 p-2 rounded-md transition-colors ${
                isInSubplebbitSettingsView 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-muted'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span className="text-sm">{t('community_settings')}</span>
            </Link>
          </li>
        </ul>
      </CardContent>
    </Card>
  );
};

const Footer = ({ 
  isMobile, 
  isInHomeAboutView, 
  isInPostPageAboutView, 
  isInSubplebbitView 
}: {
  isMobile: boolean;
  isInHomeAboutView: boolean;
  isInPostPageAboutView: boolean;
  isInSubplebbitView: boolean;
}) => {
  const { t } = useTranslation();

  return (
    <div className={`text-xs text-muted-foreground ${
      isMobile && (isInHomeAboutView || isInPostPageAboutView) ? 'mt-4' : 'mt-6'
    } ${isInSubplebbitView ? 'mt-4' : ''}`}>
      <div className="flex flex-wrap items-center gap-2">
        <Link to="/about" className="hover:text-foreground transition-colors">
          {t('about')}
        </Link>
        <Separator orientation="vertical" className="h-3" />
        <Link to="/faq" className="hover:text-foreground transition-colors">
          {t('faq')}
        </Link>
        <Separator orientation="vertical" className="h-3" />
        <a 
          href="https://github.com/plebbit/seedit" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:text-foreground transition-colors flex items-center space-x-1"
        >
          <span>{t('github')}</span>
          <ExternalLink className="w-3 h-3" />
        </a>
        <Separator orientation="vertical" className="h-3" />
        <Version />
      </div>
    </div>
  );
};

interface SidebarProps {
  comment?: Comment;
  subplebbit?: Subplebbit;
  address?: string;
  isMobile?: boolean;
}

const Sidebar = ({ comment, subplebbit, address, isMobile = false }: SidebarProps) => {
  const { t } = useTranslation();
  const location = useLocation();
  const params = useParams();
  
  // View detection
  const isInPostPageView = isPostPageView(location.pathname);
  const isInPendingPostView = isPendingPostView(location.pathname);
  const isInSubplebbitView = isSubplebbitView(location.pathname);
  const isInHomeView = isHomeView(location.pathname);
  const isInAllView = isAllView(location.pathname);
  const isInModView = isModView(location.pathname);
  const isInDomainView = isDomainView(location.pathname);
  const isInSubplebbitsView = isSubplebbitsView(location.pathname);
  const isInHomeAboutView = isHomeAboutView(location.pathname);
  const isInPostPageAboutView = isPostPageAboutView(location.pathname);
  const isInSubplebbitAboutView = isSubplebbitAboutView(location.pathname);
  const isInSubplebbitSettingsView = isSubplebbitSettingsView(location.pathname);

  // Subplebbit data
  const title = subplebbit?.title || '';
  const description = subplebbit?.description || '';
  const rules = subplebbit?.rules || [];
  const moderators = subplebbit?.roles || [];
  const createdAt = subplebbit?.createdAt;
  const isOwner = subplebbit?.owner === Plebbit.getPlebbit().signer?.address;
  const moderatorRole = moderators.find(role => role.address === Plebbit.getPlebbit().signer?.address);
  const allActiveUserCount = useSubplebbitStats(address)?.allActiveUserCount || 0;
  const isOffline = useIsSubplebbitOffline(address);

  // Routes
  const submitRoute = address ? `/p/${address}/submit` : '/submit';

  // Handlers
  const handleCreateCommunity = () => {
    // Implementation for creating community
  };

  const handleBlock = () => {
    // Implementation for blocking
  };

  const cancelBlock = () => {
    // Implementation for canceling block
  };

  const blockConfirm = () => {
    // Implementation for block confirmation
  };

  const getFormattedTimeDuration = (timestamp: number) => {
    return getFormattedTimeAgo(timestamp);
  };

  return (
    <div className="w-80 space-y-4">
      {/* Search Bar */}
      <SearchBar />

      {/* Post Info */}
      {(isInPostPageView || isInPendingPostView) && comment && (
        <PostInfo comment={comment} />
      )}

      {/* Submit Post Button */}
      {(isInSubplebbitView || isInHomeView || isInAllView || isInModView || isInDomainView || isInPendingPostView) && (
        <Link to={submitRoute}>
          <Button variant="submit" size="submit" className="w-full mb-3">
            {t('submit_post')}
          </Button>
        </Link>
      )}

      {/* Subplebbit Info */}
      {isInSubplebbitView && subplebbit && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Link to={`/p/${address}`} className="hover:underline">
                <CardTitle className="text-lg font-bold">{title}</CardTitle>
              </Link>
              <SubscribeButton address={address} />
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>{t('members_count', { count: allActiveUserCount })}</span>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${!isOffline ? 'bg-green-500' : 'bg-gray-400'}`} />
                <span>{!isOffline ? t('online') : t('offline')}</span>
              </div>
            </div>

            {moderatorRole && (
              <Badge variant="secondary" className="w-fit">
                {t('moderator')}
              </Badge>
            )}
          </CardHeader>

          {description && (
            <CardContent className="pt-0">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">{t('description')}</h3>
                <div className="text-sm text-muted-foreground leading-relaxed">
                  <Markdown content={description} />
                </div>
              </div>
            </CardContent>
          )}

          <CardContent className="pt-0">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              {createdAt && (
                <span>{t('community_for', { date: getFormattedTimeDuration(createdAt) })}</span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rules */}
      {rules.length > 0 && <RulesList rules={rules} />}

      {/* Moderators */}
      {moderators.length > 0 && <ModeratorsList moderators={moderators} />}

      {/* Moderation Tools */}
      {(moderatorRole || isOwner) && <ModerationTools address={address} />}

      {/* Submit Community Button */}
      {isInSubplebbitsView && (
        <a href="https://github.com/plebbit/lists" target="_blank" rel="noopener noreferrer">
          <Button variant="outline" className="w-full mb-3">
            <ExternalLink className="w-4 h-4 mr-2" />
            {t('submit_community')}
          </Button>
        </a>
      )}

      {/* Create Community Button */}
      <Button 
        variant="outline" 
        className="w-full mb-3" 
        onClick={handleCreateCommunity}
      >
        <Plus className="w-4 h-4 mr-2" />
        {t('create_your_community')}
      </Button>

      {/* Footer */}
      <Footer 
        isMobile={isMobile}
        isInHomeAboutView={isInHomeAboutView}
        isInPostPageAboutView={isInPostPageAboutView}
        isInSubplebbitView={isInSubplebbitView}
      />
    </div>
  );
};

export default Sidebar;