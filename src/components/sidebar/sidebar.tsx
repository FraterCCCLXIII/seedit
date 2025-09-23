import { useState, useEffect } from 'react';
import { Link, useLocation, useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Comment, Role, Subplebbit, useSubplebbitStats } from '@plebbit/plebbit-react-hooks';
import Plebbit from '@plebbit/plebbit-js';
import { Button } from '@/components/ui/button';
import { getPostScore } from '../../lib/utils/post-utils';
import { getFormattedDate, getFormattedTimeAgo, getFormattedTimeDuration } from '../../lib/utils/time-utils';
import {
  isAllView,
  isDomainView,
  isHomeAboutView,
  isHomeView,
  isModView,
  isPendingPostView,
  isPostPageAboutView,
  isPostPageView,
  isSubplebbitSettingsView,
  isSubplebbitsView,
  isSubplebbitView,
} from '../../lib/utils/view-utils';
import useIsSubplebbitOffline from '../../hooks/use-is-subplebbit-offline';
import useIsMobile from '../../hooks/use-is-mobile';
import { FAQ } from '../../views/about/about';
import Markdown from '../markdown';
import SearchBar from '../search-bar';
import SubscribeButton from '../subscribe-button';
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
    <div className='p-4 bg-muted/50 rounded-lg border border-border mb-4'>
      <div className='mb-3'>
        <h3 className='text-sm font-semibold text-foreground uppercase tracking-wide flex items-center space-x-2'>
          <Shield className='w-4 h-4' />
          <span>{t('rules')}</span>
        </h3>
      </div>
      <div className='text-sm text-muted-foreground leading-relaxed'>
        <Markdown content={markdownRules} />
      </div>
    </div>
  );
};

const ModeratorsList = ({ roles }: { roles: Record<string, Role> }) => {
  const { t } = useTranslation();
  const rolesList = roles ? Object.entries(roles).map(([address, { role }]) => ({ address, role })) : [];

  return (
    <div className='p-4 bg-muted/50 rounded-lg border border-border mb-4'>
      <div className='mb-3'>
        <h3 className='text-sm font-semibold text-foreground uppercase tracking-wide flex items-center space-x-2'>
          <Users className='w-4 h-4' />
          <span>{t('moderators')}</span>
        </h3>
      </div>
      <ul className='space-y-2'>
        {rolesList.map(({ address }, index) => (
          <li key={index} className='text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors'>
            u/{Plebbit.getShortAddress(address)}
          </li>
        ))}
      </ul>
    </div>
  );
};

const PostInfo = ({ comment }: { comment: Comment }) => {
  const { t } = useTranslation();
  const postScore = getPostScore(comment?.score || 0, comment?.upvoteCount || 0, comment?.downvoteCount || 0);
  const postDate = getFormattedDate(comment?.timestamp, 'en');
  const postTimeAgo = getFormattedTimeAgo(comment?.timestamp);

  return (
    <div className='p-4 bg-muted/50 rounded-lg border border-border mb-4'>
      <div className='space-y-3'>
        <div className='flex items-center space-x-2 text-sm text-muted-foreground'>
          <Calendar className='w-4 h-4' />
          <span>{postDate}</span>
          <span>•</span>
          <span>{postTimeAgo}</span>
        </div>
        
        <div className='flex items-center space-x-2 text-sm text-muted-foreground'>
          <TrendingUp className='w-4 h-4' />
          <span className='font-medium'>{postScore === '•' ? '0' : postScore}</span>
          <span>{postScore === 1 ? t('point') : t('points')}</span>
        </div>
        
        <div className='flex items-center space-x-2 text-sm text-muted-foreground'>
          <Share2 className='w-4 h-4' />
          <span>{t('share')}</span>
        </div>
      </div>
    </div>
  );
};

const ModerationTools = ({ address, isInSubplebbitSettingsView }: { address: string; isInSubplebbitSettingsView: boolean }) => {
  const { t } = useTranslation();

  return (
    <div className='p-4 bg-muted/50 rounded-lg border border-border mb-4'>
      <div className='mb-3'>
        <h3 className='text-sm font-semibold text-foreground uppercase tracking-wide flex items-center space-x-2'>
          <Settings className='w-4 h-4' />
          <span>{t('moderation_tools')}</span>
        </h3>
      </div>
      <ul className='space-y-2'>
        <li className={`text-sm ${isInSubplebbitSettingsView ? 'text-primary font-medium' : 'text-muted-foreground hover:text-foreground'} cursor-pointer transition-colors`}>
          <Link to={`/p/${address}/settings`} className='block'>
            {t('community_settings')}
          </Link>
        </li>
      </ul>
    </div>
  );
};

export const Footer = ({ 
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
  return (
    <div className={`mt-6 pt-4 border-t border-border ${isMobile && (isInHomeAboutView || isInPostPageAboutView) ? 'mb-4' : ''} ${isInSubplebbitView ? 'mt-8' : ''}`}>
      <div className='flex flex-wrap items-center justify-center space-x-2 text-xs text-muted-foreground'>
        <a href="https://github.com/plebbit/seedit/releases/tag/v0.5.9" target="_blank" rel="noopener noreferrer" className='hover:text-foreground transition-colors'>
          v0.5.9
        </a>
        <span>|</span>
        <a href="https://github.com/plebbit/seedit" target="_blank" rel="noopener noreferrer" className='hover:text-foreground transition-colors'>
          github
        </a>
        <span>|</span>
        <a href="https://t.me/plebbit" target="_blank" rel="noopener noreferrer" className='hover:text-foreground transition-colors'>
          telegram
        </a>
        <span>|</span>
        <a href="https://x.com/getplebbit" target="_blank" rel="noopener noreferrer" className='hover:text-foreground transition-colors'>
          x
        </a>
        <span>|</span>
        <a href="https://plebbit.github.io/docs/learn/clients/seedit/what-is-seedit" target="_blank" rel="noopener noreferrer" className='hover:text-foreground transition-colors'>
          docs
        </a>
      </div>
    </div>
  );
};

const Sidebar = ({ subplebbit, comment, settings }: { subplebbit?: Subplebbit; comment?: Comment; settings?: any }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const isMobile = useIsMobile();
  const isOffline = useIsSubplebbitOffline(subplebbit?.address);
  const allActiveUserCount = useSubplebbitStats(subplebbit?.address)?.allActiveUserCount || 0;
  const roles = subplebbit?.roles;
  const rules = subplebbit?.rules;
  const address = subplebbit?.address || '';
  const description = subplebbit?.description || '';
  const createdAt = subplebbit?.createdAt;

  const [subtitle1, setSubtitle1] = useState('');
  const [subtitle2, setSubtitle2] = useState('');
  const [showExpando, setShowExpando] = useState(false);

  useEffect(() => {
    const communitySubtitles: string[] = [];
    if (communitySubtitles.length >= 2) {
      const indices = new Set<number>();
      while (indices.size < 2) {
        const randomIndex = Math.floor(Math.random() * communitySubtitles.length);
        indices.add(randomIndex);
      }
      const [index1, index2] = Array.from(indices);
      setSubtitle1(communitySubtitles[index1]);
      setSubtitle2(communitySubtitles[index2]);
    } else if (communitySubtitles.length === 1) {
      setSubtitle1(communitySubtitles[0]);
      setSubtitle2('');
    }
  }, []);

  const isConnectedToRpc = true;
  const handleCreateCommunity = () => {
    if (isConnectedToRpc) {
      navigate('/communities/create');
    } else {
      window.alert('Creating a community requires running a full node. Please check the documentation for more information.');
    }
  };

  const handleSearchBarExpandoChange = (expanded: boolean) => {
    setShowExpando(expanded);
  };

  // View detection
  const isInPostPageView = isPostPageView(location.pathname, params);
  const isInPendingPostView = isPendingPostView(location.pathname, params);
  const isInSubplebbitView = isSubplebbitView(location.pathname, params);
  const isInHomeView = isHomeView(location.pathname);
  const isInAllView = isAllView(location.pathname);
  const isInModView = isModView(location.pathname);
  const isInSubplebbitsView = isSubplebbitsView(location.pathname);
  const isInHomeAboutView = isHomeAboutView(location.pathname);
  const isInDomainView = isDomainView(location.pathname);
  const isInPostPageAboutView = isPostPageAboutView(location.pathname, params);
  const isInSubplebbitSettingsView = isSubplebbitSettingsView(location.pathname, params);

  const submitRoute = isInSubplebbitView ? `/p/${address}/submit` : '/submit';

  return (
    <div className='w-full max-w-sm mx-auto'>
      <div className='mb-6'>
        <SearchBar onExpandoChange={handleSearchBarExpandoChange} />
      </div>
      <div
        className='space-y-6'
        style={{
          transform: showExpando ? 'translateY(47px)' : 'translateY(0)',
          transition: 'transform 0.3s linear',
          willChange: 'transform',
          marginTop: '-47px',
        }}
      >
        {(isInPostPageView || isInPendingPostView) && comment && <PostInfo comment={comment} />}
        
        {(isInSubplebbitView || isInHomeView || isInAllView || isInModView || isInDomainView || isInPendingPostView) && (
          <Link to={submitRoute} className='block mb-6'>
            <Button className='w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 flex items-center justify-center space-x-2 text-base font-semibold'>
              <Plus className='w-5 h-5' />
              <span>{t('submit_post')}</span>
            </Button>
          </Link>
        )}
        
        {!isInHomeView &&
          !isInHomeAboutView &&
          !isInAllView &&
          !isInModView &&
          !isInSubplebbitsView &&
          !isInHomeAboutView &&
          !isInDomainView &&
          !isInPostPageAboutView && (
            <div className='mb-6'>
              <div className='p-6 bg-muted/30 rounded-lg border border-border'>
                <div className='space-y-4'>
                  <Link to={`/p/${address}`} className='block'>
                    <h2 className='text-xl font-bold text-foreground hover:text-primary transition-colors'>
                      {subplebbit?.address}
                    </h2>
                  </Link>
                  
                  <div className='flex items-center justify-between'>
                    <SubscribeButton address={address} />
                    <span className='text-sm text-muted-foreground'>
                      {t('members_count', { count: allActiveUserCount })}
                    </span>
                  </div>
                  
                  <div className='flex items-center space-x-2'>
                    <div className={`w-2 h-2 rounded-full ${!isOffline ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <span className='text-sm text-muted-foreground'>
                      {!isOffline ? t('online') : t('offline')}
                    </span>
                  </div>
                  
                  {false && (
                    <div className='text-sm text-primary font-medium'>
                      {t('moderator')}
                    </div>
                  )}
                  
                  {description && (
                    <div className='space-y-2'>
                      <h3 className='text-sm font-semibold text-foreground'>{t('description')}</h3>
                      <div className='text-sm text-muted-foreground leading-relaxed'>
                        <Markdown content={description} />
                      </div>
                    </div>
                  )}
                  
                  <div className='flex items-center justify-between text-sm text-muted-foreground'>
                    {createdAt && (
                      <span>{t('community_for', { date: getFormattedTimeDuration(createdAt) })}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        
        {rules && rules.length > 0 && <RulesList rules={rules} />}
        {roles && Object.keys(roles).length > 0 && <ModeratorsList roles={roles} />}
        {isInSubplebbitView && <ModerationTools address={address} isInSubplebbitSettingsView={isInSubplebbitSettingsView} />}
        
        <div className='space-y-4'>
          <Link to={submitRoute} className='block'>
            <Button className='w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 flex items-center justify-center space-x-2 text-base font-semibold'>
              <Plus className='w-5 h-5' />
              <span>{t('submit_post')}</span>
            </Button>
          </Link>
          
          <Button 
            onClick={handleCreateCommunity}
            className='w-full h-12 bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-all duration-200 flex items-center justify-center space-x-2 text-base font-semibold'
          >
            <ExternalLink className='w-5 h-5' />
            <span>{t('create_community')}</span>
          </Button>
          
          <div className='text-center space-y-2'>
            <div className='flex items-center justify-center space-x-2'>
              <img src="assets/sprout/sprout-2.png" alt="" className='w-8 h-8' />
            </div>
            {subtitle1 && <div className='text-sm text-muted-foreground italic'>{subtitle1}</div>}
            {subtitle2 && <div className='text-sm text-muted-foreground italic'>{subtitle2}</div>}
          </div>
        </div>
        
        {isMobile && isInHomeAboutView && <FAQ />}
        
        <Footer 
          isMobile={isMobile}
          isInHomeAboutView={isInHomeAboutView}
          isInPostPageAboutView={isInPostPageAboutView}
          isInSubplebbitView={isInSubplebbitView}
        />
      </div>
    </div>
  );
};

export default Sidebar;