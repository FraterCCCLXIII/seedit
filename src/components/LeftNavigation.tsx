import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAccount, useSubplebbits } from '@plebbit/plebbit-react-hooks';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Home,
  Mail,
  Search,
  Settings,
  Edit3,
  Users,
  ChevronRight,
  User,
  MessageSquare,
  MoreHorizontal,
  Bell,
  Bookmark,
  Hash,
  List,
  Globe,
  TrendingUp,
} from 'lucide-react';

function LeftNavigation() {
  const { t } = useTranslation();
  const location = useLocation();
  const account = useAccount();
  const { subplebbits } = useSubplebbits();
  const [showAllCommunities, setShowAllCommunities] = useState(false);

  // Get user's subscribed communities from subplebbits
  const subscribedCommunities = subplebbits?.pages?.flatMap((page) => page.subplebbits) || [];
  const topCommunities = subscribedCommunities.slice(0, 5);
  const displayedCommunities = showAllCommunities ? subscribedCommunities : topCommunities;

  // Helper function to check if current route is active
  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  // Navigation items with proper routing
  const navigationItems = [
    { path: '/', icon: Home, label: t('home') || 'Home' },
    { path: '/all', icon: Globe, label: t('all') || 'All' },
    { path: '/search', icon: Search, label: t('search') || 'Explore' },
    { path: '/inbox', icon: Bell, label: t('notifications') || 'Notifications' },
    { path: '/inbox', icon: Mail, label: t('messages') || 'Messages' },
    { path: '/profile', icon: User, label: t('profile') || 'Profile' },
    { path: '/settings', icon: Settings, label: t('settings') || 'Settings' },
  ];

  return (
    <div className='h-full bg-background border-r border-border flex flex-col overflow-y-auto w-64'>
      {/* Logo Section */}
      <div className='px-6 py-5 border-b border-border'>
        <Link to='/' className='flex items-center justify-center'>
          <h1 className='text-2xl font-bold text-foreground font-inter tracking-tight'>Seedit</h1>
        </Link>
      </div>

      {/* Navigation Menu */}
      <nav className='flex-1 px-6 py-4 space-y-2'>
        {navigationItems.map(({ path, icon: Icon, label }) => (
          <Link
            key={path}
            to={path}
            className={`flex items-center space-x-4 w-full px-4 py-3.5 text-left hover:bg-accent hover:text-accent-foreground rounded-full transition-all duration-200 group ${
              isActive(path) ? 'bg-accent text-accent-foreground font-semibold' : ''
            }`}
          >
            <Icon className={`w-6 h-6 transition-colors ${isActive(path) ? 'text-accent-foreground' : 'text-foreground group-hover:text-accent-foreground'}`} />
            <span className='text-xl font-medium'>{label}</span>
          </Link>
        ))}

        <Separator className='my-6 mx-3' />

        <div className='px-6'>
          <Link to='/submit'>
            <Button className='w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 flex items-center justify-center space-x-2 rounded-full text-lg font-semibold'>
              <Edit3 className='w-6 h-6' />
              <span>{t('submit_post') || 'Post'}</span>
            </Button>
          </Link>
        </div>

        <Separator className='my-6 mx-3' />

        {/* Communities Section */}
        <div className='space-y-3 px-4'>
          <div className='px-2'>
            <h3 className='text-lg font-semibold text-foreground'>{t('communities') || 'Communities'}</h3>
          </div>
          <div className='space-y-2'>
            {displayedCommunities.map((subplebbit) => (
              <Link
                key={subplebbit.address}
                to={`/p/${subplebbit.address}`}
                className={`flex items-center space-x-3 w-full px-4 py-3.5 text-left hover:bg-accent hover:text-accent-foreground rounded-full transition-all duration-200 group ${
                  location.pathname.includes(`/p/${subplebbit.address}`) ? 'bg-accent text-accent-foreground' : ''
                }`}
              >
                <div className='w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center'>
                  <Hash className='w-4 h-4 text-primary' />
                </div>
                <span className='text-base font-medium truncate'>{subplebbit.title || subplebbit.address}</span>
              </Link>
            ))}

            {!showAllCommunities && subscribedCommunities.length > 5 && (
              <button
                onClick={() => setShowAllCommunities(true)}
                className='flex items-center space-x-3 w-full px-4 py-3.5 text-left hover:bg-accent hover:text-accent-foreground rounded-full transition-all duration-200 group'
              >
                <div className='w-8 h-8 bg-muted rounded-full flex items-center justify-center'>
                  <ChevronRight className='w-4 h-4 text-muted-foreground' />
                </div>
                <span className='text-base font-medium text-muted-foreground'>{t('view_more') || 'View more'}</span>
              </button>
            )}

            {showAllCommunities && subscribedCommunities.length > 5 && (
              <button
                onClick={() => setShowAllCommunities(false)}
                className='flex items-center space-x-3 w-full px-4 py-3.5 text-left hover:bg-accent hover:text-accent-foreground rounded-full transition-all duration-200 group'
              >
                <div className='w-8 h-8 bg-muted rounded-full flex items-center justify-center'>
                  <ChevronRight className='w-4 h-4 text-muted-foreground rotate-180' />
                </div>
                <span className='text-base font-medium text-muted-foreground'>{t('show_less') || 'Show less'}</span>
              </button>
            )}

            {/* Quick access to popular communities */}
            <Link
              to='/communities'
              className='flex items-center space-x-3 w-full px-4 py-3.5 text-left hover:bg-accent hover:text-accent-foreground rounded-full transition-all duration-200 group'
            >
              <div className='w-8 h-8 bg-muted rounded-full flex items-center justify-center'>
                <TrendingUp className='w-4 h-4 text-muted-foreground' />
              </div>
              <span className='text-base font-medium text-muted-foreground'>{t('discover_communities') || 'Discover'}</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* User Profile Section */}
      <div className='px-6 py-4 border-t border-border'>
        <Link to='/profile' className='flex items-center space-x-3 p-3 hover:bg-accent rounded-full transition-all duration-200 cursor-pointer group'>
          <Avatar className='w-10 h-10'>
            <AvatarFallback className='font-inter text-sm font-semibold'>{account?.author?.shortAddress?.slice(0, 2).toUpperCase() || 'AN'}</AvatarFallback>
          </Avatar>
          <div className='flex-1 min-w-0'>
            <div className='text-sm font-semibold truncate'>{account?.author?.shortAddress || 'Anonymous'}</div>
            <div className='text-xs text-muted-foreground'>{account?.karma ? `${account.karma.postScore + account.karma.replyScore} karma` : '0 karma'}</div>
          </div>
          <MoreHorizontal className='w-5 h-5 text-muted-foreground' />
        </Link>
      </div>
    </div>
  );
}

export default LeftNavigation;
