import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Home, Mail, Search, Settings, Edit3, Users, ChevronRight, User, MessageSquare, MoreHorizontal, Bell, Bookmark, Hash, List } from 'lucide-react';

function LeftNavigation() {
  const [showAllCommunities, setShowAllCommunities] = useState(false);

  // Top 5 communities
  const topCommunities = ['fatpeoplehate.eth', 'business-and-finance.eth', 'politically-incorrect.eth', 'weaponized-autism.eth', 'vote.plebbit.eth'];

  // All communities
  const allCommunities = [
    'fatpeoplehate.eth',
    'business-and-finance.eth',
    'politically-incorrect.eth',
    'weaponized-autism.eth',
    'vote.plebbit.eth',
    'videos-livestreams-podcasts.eth',
    'technopleb.eth',
    'redditdeath.sol',
    'reddit-screenshots.eth',
    'plebwhales.eth',
    'plebtoken.eth',
    'plebpiracy.eth',
    'plebmusic.eth',
    'pleblore.eth',
    'plebbitai.eth',
    'movies-tv-anime.eth',
    'health-nutrition-science.eth',
    'censorship-watch.eth',
    'blog.plebbit.eth',
  ];

  const displayedCommunities = showAllCommunities ? allCommunities : topCommunities;

  return (
    <div className='h-full bg-background border-r border-border flex flex-col overflow-y-auto w-64'>
      {/* Logo Section */}
      <div className='px-6 py-5 border-b border-border'>
        <div className='flex items-center justify-center'>
          <h1 className='text-2xl font-bold text-foreground font-inter tracking-tight'>Holons</h1>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className='flex-1 px-6 py-4 space-y-2'>
        <a
          href='#/'
          className='flex items-center space-x-4 w-full px-4 py-3.5 text-left hover:bg-accent hover:text-accent-foreground rounded-full transition-all duration-200 group'
        >
          <Home className='w-6 h-6 text-foreground group-hover:text-accent-foreground transition-colors' />
          <span className='text-xl font-medium'>Home</span>
        </a>
        <a
          href='#/search'
          className='flex items-center space-x-4 w-full px-4 py-3.5 text-left hover:bg-accent hover:text-accent-foreground rounded-full transition-all duration-200 group'
        >
          <Search className='w-6 h-6 text-foreground group-hover:text-accent-foreground transition-colors' />
          <span className='text-xl font-medium'>Explore</span>
        </a>
        <a
          href='#/notifications'
          className='flex items-center space-x-4 w-full px-4 py-3.5 text-left hover:bg-accent hover:text-accent-foreground rounded-full transition-all duration-200 group'
        >
          <Bell className='w-6 h-6 text-foreground group-hover:text-accent-foreground transition-colors' />
          <span className='text-xl font-medium'>Notifications</span>
        </a>
        <a
          href='#/inbox'
          className='flex items-center space-x-4 w-full px-4 py-3.5 text-left hover:bg-accent hover:text-accent-foreground rounded-full transition-all duration-200 group'
        >
          <Mail className='w-6 h-6 text-foreground group-hover:text-accent-foreground transition-colors' />
          <span className='text-xl font-medium'>Messages</span>
        </a>
        <a
          href='#/bookmarks'
          className='flex items-center space-x-4 w-full px-4 py-3.5 text-left hover:bg-accent hover:text-accent-foreground rounded-full transition-all duration-200 group'
        >
          <Bookmark className='w-6 h-6 text-foreground group-hover:text-accent-foreground transition-colors' />
          <span className='text-xl font-medium'>Bookmarks</span>
        </a>
        <a
          href='#/lists'
          className='flex items-center space-x-4 w-full px-4 py-3.5 text-left hover:bg-accent hover:text-accent-foreground rounded-full transition-all duration-200 group'
        >
          <List className='w-6 h-6 text-foreground group-hover:text-accent-foreground transition-colors' />
          <span className='text-xl font-medium'>Lists</span>
        </a>
        <a
          href='#/profile'
          className='flex items-center space-x-4 w-full px-4 py-3.5 text-left hover:bg-accent hover:text-accent-foreground rounded-full transition-all duration-200 group'
        >
          <User className='w-6 h-6 text-foreground group-hover:text-accent-foreground transition-colors' />
          <span className='text-xl font-medium'>Profile</span>
        </a>
        <a
          href='#/settings'
          className='flex items-center space-x-4 w-full px-4 py-3.5 text-left hover:bg-accent hover:text-accent-foreground rounded-full transition-all duration-200 group'
        >
          <MoreHorizontal className='w-6 h-6 text-foreground group-hover:text-accent-foreground transition-colors' />
          <span className='text-xl font-medium'>More</span>
        </a>

        <Separator className='my-6 mx-3' />

        <div className='px-6'>
          <Button className='w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 flex items-center justify-center space-x-2 rounded-full text-lg font-semibold'>
            <Edit3 className='w-6 h-6' />
            <span>Post</span>
          </Button>
        </div>

        <Separator className='my-6 mx-3' />

        {/* Communities Section */}
        <div className='space-y-3 px-4'>
          <div className='px-2'>
            <h3 className='text-lg font-semibold text-foreground'>Communities</h3>
          </div>
          <div className='space-y-2'>
            {displayedCommunities.map((community, index) => (
              <a
                key={community}
                href={`#/p/${community}`}
                className='flex items-center space-x-3 w-full px-4 py-3.5 text-left hover:bg-accent hover:text-accent-foreground rounded-full transition-all duration-200 group'
              >
                <div className='w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center'>
                  <Hash className='w-4 h-4 text-primary' />
                </div>
                <span className='text-base font-medium truncate'>{community}</span>
              </a>
            ))}

            {!showAllCommunities && allCommunities.length > 5 && (
              <button
                onClick={() => setShowAllCommunities(true)}
                className='flex items-center space-x-3 w-full px-4 py-3.5 text-left hover:bg-accent hover:text-accent-foreground rounded-full transition-all duration-200 group'
              >
                <div className='w-8 h-8 bg-muted rounded-full flex items-center justify-center'>
                  <ChevronRight className='w-4 h-4 text-muted-foreground' />
                </div>
                <span className='text-base font-medium text-muted-foreground'>View more</span>
              </button>
            )}

            {showAllCommunities && (
              <button
                onClick={() => setShowAllCommunities(false)}
                className='flex items-center space-x-3 w-full px-4 py-3.5 text-left hover:bg-accent hover:text-accent-foreground rounded-full transition-all duration-200 group'
              >
                <div className='w-8 h-8 bg-muted rounded-full flex items-center justify-center'>
                  <ChevronRight className='w-4 h-4 text-muted-foreground rotate-180' />
                </div>
                <span className='text-base font-medium text-muted-foreground'>Show less</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* User Profile Section */}
      <div className='px-6 py-4 border-t border-border'>
        <div className='flex items-center space-x-3 p-3 hover:bg-accent rounded-full transition-all duration-200 cursor-pointer group'>
          <Avatar className='w-10 h-10'>
            <AvatarFallback className='font-inter text-sm font-semibold'>NT</AvatarFallback>
          </Avatar>
          <div className='flex-1 min-w-0'>
            <div className='text-sm font-semibold truncate'>NT3qkUQ7L8AL</div>
            <div className='text-xs text-muted-foreground'>1 karma</div>
          </div>
          <MoreHorizontal className='w-5 h-5 text-muted-foreground' />
        </div>
      </div>
    </div>
  );
}

export default LeftNavigation;
