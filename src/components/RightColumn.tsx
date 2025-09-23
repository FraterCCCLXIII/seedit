import React from 'react';

interface RightColumnProps {
  children: React.ReactNode;
}

function RightColumn({ children }: RightColumnProps) {
  return (
    <div className='sticky top-0 h-screen bg-background border-l border-border overflow-y-auto'>
      <div className='p-4 space-y-6'>
        {/* Search Bar */}
        <div className='space-y-2'>
          <form className='flex gap-2'>
            <input
              type='text'
              placeholder='Enter a community address'
              className='flex-1 px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring'
              autoCorrect='off'
              autoComplete='off'
              spellCheck='false'
              autoCapitalize='off'
            />
            <button type='submit' className='px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90'>
              Go
            </button>
          </form>
          <div className='space-y-1 text-xs'>
            <label className='flex items-center space-x-2 cursor-pointer'>
              <input type='checkbox' defaultChecked className='rounded' />
              <span>Go to a community</span>
            </label>
            <label className='flex items-center space-x-2 cursor-pointer'>
              <input type='checkbox' className='rounded' />
              <span>Search a post in this feed</span>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className='space-y-3'>
          <a href='#/submit' className='block'>
            <button className='w-full px-4 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 font-medium'>Submit a new post</button>
          </a>

          <button className='w-full px-4 py-3 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 font-medium'>Create your own community</button>
        </div>

        {/* Community Subtitles */}
        <div className='space-y-2 text-center'>
          <img src='/assets/sprout/sprout-2.png' alt='Community' className='w-12 h-12 mx-auto' />
          <div className='text-sm text-muted-foreground space-y-1'>
            <div>...for Reddit's downfall.</div>
            <div>...unstoppable by design.</div>
          </div>
        </div>

        {/* Footer Links */}
        <div className='pt-4 border-t border-border'>
          <div className='text-xs text-muted-foreground'>
            <ul className='flex flex-wrap gap-2'>
              <li>
                <a href='https://github.com/plebbit/seedit/releases/tag/v0.5.9' target='_blank' rel='noopener noreferrer' className='hover:text-foreground'>
                  v0.5.9
                </a>
              </li>
              <li>|</li>
              <li>
                <a href='https://github.com/plebbit/seedit' target='_blank' rel='noopener noreferrer' className='hover:text-foreground'>
                  github
                </a>
              </li>
              <li>|</li>
              <li>
                <a href='https://t.me/plebbit' target='_blank' rel='noopener noreferrer' className='hover:text-foreground'>
                  telegram
                </a>
              </li>
              <li>|</li>
              <li>
                <a href='https://x.com/getplebbit' target='_blank' rel='noopener noreferrer' className='hover:text-foreground'>
                  x
                </a>
              </li>
              <li>|</li>
              <li>
                <a href='https://plebbit.github.io/docs/learn/clients/seedit/what-is-seedit' target='_blank' rel='noopener noreferrer' className='hover:text-foreground'>
                  docs
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Additional Content */}
        {children}
      </div>
    </div>
  );
}

export default RightColumn;
