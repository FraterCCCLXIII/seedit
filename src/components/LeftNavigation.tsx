import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

function LeftNavigation() {
  return (
    <div className='fixed left-0 top-0 h-screen w-64 max-w-64 bg-background border-r border-border z-50 flex flex-col overflow-y-auto'>
      {/* Logo Section */}
      <div className='p-6 border-b border-border'>
        <div className='flex items-center space-x-3'>
          <img src='/assets/sprout/sprout.png' alt='Seedit Logo' className='w-8 h-8' />
          <img src='/assets/sprout/seedit-text-dark.svg' alt='Seedit' className='h-6' />
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className='flex-1 p-4 space-y-2'>
        <a href='#/' className='block w-full px-3 py-2 text-left hover:bg-accent rounded-md transition-colors'>
          🏠 Home
        </a>
        <a href='#/inbox' className='block w-full px-3 py-2 text-left hover:bg-accent rounded-md transition-colors'>
          📧 Inbox
        </a>
        <a href='#/search' className='block w-full px-3 py-2 text-left hover:bg-accent rounded-md transition-colors'>
          🔍 Search
        </a>
        <a href='#/settings' className='block w-full px-3 py-2 text-left hover:bg-accent rounded-md transition-colors'>
          ⚙️ Preferences
        </a>

        <Separator className='my-4' />

        <Button className='w-full bg-primary text-primary-foreground hover:bg-primary/90'>✏️ Post</Button>

        <Separator className='my-4' />

        {/* Communities Section */}
        <div className='space-y-2'>
          <h3 className='text-sm font-semibold text-muted-foreground px-2'>My Communities</h3>
          <div className='space-y-1'>
            <a href='#/p/fatpeoplehate.eth' className='block w-full px-3 py-2 text-left text-sm hover:bg-accent rounded-md transition-colors'>
              fatpeoplehate.eth
            </a>
            <a href='#/p/business-and-finance.eth' className='block w-full px-3 py-2 text-left text-sm hover:bg-accent rounded-md transition-colors'>
              business-and-finance.eth
            </a>
            <a href='#/p/politically-incorrect.eth' className='block w-full px-3 py-2 text-left text-sm hover:bg-accent rounded-md transition-colors'>
              politically-incorrect.eth
            </a>
            <a href='#/p/weaponized-autism.eth' className='block w-full px-3 py-2 text-left text-sm hover:bg-accent rounded-md transition-colors'>
              weaponized-autism.eth
            </a>
            <a href='#/p/vote.plebbit.eth' className='block w-full px-3 py-2 text-left text-sm hover:bg-accent rounded-md transition-colors'>
              vote.plebbit.eth
            </a>
            <a href='#/p/videos-livestreams-podcasts.eth' className='block w-full px-3 py-2 text-left text-sm hover:bg-accent rounded-md transition-colors'>
              videos-livestreams-podcasts.eth
            </a>
            <a href='#/p/technopleb.eth' className='block w-full px-3 py-2 text-left text-sm hover:bg-accent rounded-md transition-colors'>
              technopleb.eth
            </a>
            <a href='#/p/redditdeath.sol' className='block w-full px-3 py-2 text-left text-sm hover:bg-accent rounded-md transition-colors'>
              redditdeath.sol
            </a>
            <a href='#/p/reddit-screenshots.eth' className='block w-full px-3 py-2 text-left text-sm hover:bg-accent rounded-md transition-colors'>
              reddit-screenshots.eth
            </a>
            <a href='#/p/plebwhales.eth' className='block w-full px-3 py-2 text-left text-sm hover:bg-accent rounded-md transition-colors'>
              plebwhales.eth
            </a>
            <a href='#/p/plebtoken.eth' className='block w-full px-3 py-2 text-left text-sm hover:bg-accent rounded-md transition-colors'>
              plebtoken.eth
            </a>
            <a href='#/p/plebpiracy.eth' className='block w-full px-3 py-2 text-left text-sm hover:bg-accent rounded-md transition-colors'>
              plebpiracy.eth
            </a>
            <a href='#/p/plebmusic.eth' className='block w-full px-3 py-2 text-left text-sm hover:bg-accent rounded-md transition-colors'>
              plebmusic.eth
            </a>
            <a href='#/p/pleblore.eth' className='block w-full px-3 py-2 text-left text-sm hover:bg-accent rounded-md transition-colors'>
              pleblore.eth
            </a>
            <a href='#/p/plebbitai.eth' className='block w-full px-3 py-2 text-left text-sm hover:bg-accent rounded-md transition-colors'>
              plebbitai.eth
            </a>
            <a href='#/p/movies-tv-anime.eth' className='block w-full px-3 py-2 text-left text-sm hover:bg-accent rounded-md transition-colors'>
              movies-tv-anime.eth
            </a>
            <a href='#/p/health-nutrition-science.eth' className='block w-full px-3 py-2 text-left text-sm hover:bg-accent rounded-md transition-colors'>
              health-nutrition-science.eth
            </a>
            <a href='#/p/censorship-watch.eth' className='block w-full px-3 py-2 text-left text-sm hover:bg-accent rounded-md transition-colors'>
              censorship-watch.eth
            </a>
            <a href='#/p/blog.plebbit.eth' className='block w-full px-3 py-2 text-left text-sm hover:bg-accent rounded-md transition-colors'>
              blog.plebbit.eth
            </a>
          </div>
          <a href='#/communities/subscriber' className='block w-full px-3 py-2 text-left text-xs border border-border rounded-md hover:bg-accent transition-colors mt-2'>
            Edit Subscriptions
          </a>
        </div>
      </nav>

      {/* User Profile Section */}
      <div className='p-4 border-t border-border'>
        <div className='flex items-center space-x-3'>
          <Avatar className='w-8 h-8'>
            <AvatarImage src='/assets/sprout/sprout.png' />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <div className='flex-1 min-w-0'>
            <p className='text-sm font-medium truncate'>User Profile</p>
            <p className='text-xs text-muted-foreground'>1 karma</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LeftNavigation;
