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
