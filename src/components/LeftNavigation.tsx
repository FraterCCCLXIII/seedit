import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

function LeftNavigation() {
  return (
    <div className='fixed left-0 top-0 h-screen w-64 bg-background border-r border-border z-50 flex flex-col'>
      {/* Logo Section */}
      <div className='p-6 border-b border-border'>
        <div className='flex items-center space-x-3'>
          <img src='/assets/sprout/sprout.png' alt='Seedit Logo' className='w-8 h-8' />
          <img src='/assets/sprout/seedit-text-dark.svg' alt='Seedit' className='h-6' />
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className='flex-1 p-4 space-y-2'>
        <Button variant='ghost' className='w-full justify-start text-left'>
          🏠 Home
        </Button>
        <Button variant='ghost' className='w-full justify-start text-left'>
          📧 Inbox
        </Button>
        <Button variant='ghost' className='w-full justify-start text-left'>
          🔍 Search
        </Button>
        <Button variant='ghost' className='w-full justify-start text-left'>
          ⚙️ Preferences
        </Button>

        <Separator className='my-4' />

        <Button className='w-full bg-primary text-primary-foreground hover:bg-primary/90'>✏️ Post</Button>

        <Separator className='my-4' />

        {/* Communities Section */}
        <div className='space-y-2'>
          <h3 className='text-sm font-semibold text-muted-foreground px-2'>My Communities</h3>
          <div className='max-h-64 overflow-y-auto space-y-1'>
            <Button variant='ghost' className='w-full justify-start text-left text-sm h-8'>
              fatpeoplehate.eth
            </Button>
            <Button variant='ghost' className='w-full justify-start text-left text-sm h-8'>
              business-and-finance.eth
            </Button>
            <Button variant='ghost' className='w-full justify-start text-left text-sm h-8'>
              politically-incorrect.eth
            </Button>
            <Button variant='ghost' className='w-full justify-start text-left text-sm h-8'>
              weaponized-autism.eth
            </Button>
            <Button variant='ghost' className='w-full justify-start text-left text-sm h-8'>
              vote.plebbit.eth
            </Button>
            <Button variant='ghost' className='w-full justify-start text-left text-sm h-8'>
              videos-livestreams-podcasts.eth
            </Button>
            <Button variant='ghost' className='w-full justify-start text-left text-sm h-8'>
              technopleb.eth
            </Button>
            <Button variant='ghost' className='w-full justify-start text-left text-sm h-8'>
              redditdeath.sol
            </Button>
            <Button variant='ghost' className='w-full justify-start text-left text-sm h-8'>
              reddit-screenshots.eth
            </Button>
            <Button variant='ghost' className='w-full justify-start text-left text-sm h-8'>
              plebwhales.eth
            </Button>
            <Button variant='ghost' className='w-full justify-start text-left text-sm h-8'>
              plebtoken.eth
            </Button>
            <Button variant='ghost' className='w-full justify-start text-left text-sm h-8'>
              plebpiracy.eth
            </Button>
            <Button variant='ghost' className='w-full justify-start text-left text-sm h-8'>
              plebmusic.eth
            </Button>
            <Button variant='ghost' className='w-full justify-start text-left text-sm h-8'>
              pleblore.eth
            </Button>
            <Button variant='ghost' className='w-full justify-start text-left text-sm h-8'>
              plebbitai.eth
            </Button>
            <Button variant='ghost' className='w-full justify-start text-left text-sm h-8'>
              movies-tv-anime.eth
            </Button>
            <Button variant='ghost' className='w-full justify-start text-left text-sm h-8'>
              health-nutrition-science.eth
            </Button>
            <Button variant='ghost' className='w-full justify-start text-left text-sm h-8'>
              censorship-watch.eth
            </Button>
            <Button variant='ghost' className='w-full justify-start text-left text-sm h-8'>
              blog.plebbit.eth
            </Button>
          </div>
          <Button variant='outline' className='w-full text-xs h-8 mt-2'>
            Edit Subscriptions
          </Button>
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
