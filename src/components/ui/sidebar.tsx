import * as React from 'react';
import { Home, Search, Bell, Mail, Bookmark, User, Settings, MoreHorizontal } from 'lucide-react';
import { Button } from './button';
import { cn } from '../../lib/utils';

interface NavigationItem {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  current: boolean;
  href: string;
}

interface SidebarProps {
  className?: string;
  navigation?: NavigationItem[];
  user?: {
    name: string;
    username: string;
    avatarUrl?: string;
  };
  onPostClick?: () => void;
}

const defaultNavigation: NavigationItem[] = [
  { name: 'Home', icon: Home, current: true, href: '/' },
  { name: 'Explore', icon: Search, current: false, href: '/explore' },
  { name: 'Notifications', icon: Bell, current: false, href: '/notifications' },
  { name: 'Messages', icon: Mail, current: false, href: '/messages' },
  { name: 'Bookmarks', icon: Bookmark, current: false, href: '/bookmarks' },
  { name: 'Profile', icon: User, current: false, href: '/profile' },
  { name: 'Settings', icon: Settings, current: false, href: '/settings' },
];

export function Sidebar({ className, navigation = defaultNavigation, user = { name: 'Anonymous', username: 'anon' }, onPostClick }: SidebarProps) {
  return (
    <div className={cn('modern-sidebar', className)}>
      {/* Logo */}
      <div className='mb-8 px-3'>
        <h1 className='text-2xl font-bold text-primary'>Seedit</h1>
      </div>

      {/* Navigation */}
      <nav className='space-y-2'>
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.name}
              variant={item.current ? 'secondary' : 'ghost'}
              className={cn('modern-nav-item', item.current ? 'active' : '')}
              onClick={() => (window.location.href = item.href)}
            >
              <Icon className='icon' />
              <span>{item.name}</span>
            </Button>
          );
        })}
      </nav>

      {/* Post Button */}
      <Button
        className='mt-8 w-full rounded-full bg-primary py-6 text-lg font-bold text-primary-foreground transition-smooth hover:bg-primary-hover'
        onClick={onPostClick}
      >
        Post
      </Button>

      {/* Profile Section */}
      <div className='absolute bottom-6 left-4 right-4'>
        <Button variant='ghost' className='w-full justify-start gap-3 px-3 py-4 transition-smooth hover:bg-twitter-light-gray'>
          <div
            className='h-10 w-10 rounded-full bg-gradient-primary'
            style={{ backgroundImage: user.avatarUrl ? `url(${user.avatarUrl})` : 'var(--gradient-primary)' }}
          />
          <div className='flex-1 text-left'>
            <p className='font-semibold'>{user.name}</p>
            <p className='text-sm text-twitter-gray'>@{user.username}</p>
          </div>
          <MoreHorizontal className='h-5 w-5 text-twitter-gray' />
        </Button>
      </div>
    </div>
  );
}
