import * as React from 'react';
import { Sidebar, type SidebarProps } from './sidebar';
import { cn } from '../../lib/utils';

interface LayoutProps extends Pick<SidebarProps, 'navigation' | 'user' | 'onPostClick'> {
  children: React.ReactNode;
  className?: string;
  showSidebar?: boolean;
  showRightSidebar?: boolean;
  rightSidebarContent?: React.ReactNode;
}

export function Layout({ children, className, showSidebar = true, showRightSidebar = true, rightSidebarContent, navigation, user, onPostClick }: LayoutProps) {
  return (
    <div className={cn('min-h-screen w-full flex', className)}>
      {/* Left Sidebar */}
      {showSidebar && <Sidebar navigation={navigation} user={user} onPostClick={onPostClick} />}

      {/* Main Content */}
      <main className={cn('flex-1', showSidebar && 'ml-64')}>
        <div className='modern-main-content'>{children}</div>
      </main>

      {/* Right Sidebar */}
      {showRightSidebar && (
        <div className='modern-right-sidebar'>
          {rightSidebarContent || (
            <div className='modern-card p-4'>
              <h3 className='font-semibold mb-4'>What's happening</h3>
              <div className='space-y-4'>
                <div className='text-sm text-muted-foreground'>Trending topics and updates will appear here</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
