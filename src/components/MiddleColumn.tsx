import React from 'react';

interface MiddleColumnProps {
  children: React.ReactNode;
}

function MiddleColumn({ children }: MiddleColumnProps) {
  return (
    <div className='flex-1 min-w-0'>
      {/* Header Section */}
      <div className='sticky top-0 z-10 bg-background border-b border-border'>
        <div className='px-4 py-3'>
          <div className='flex items-center justify-between'>
            {/* Logo */}
            <div className='flex items-center space-x-3'>
              <a href='#/' className='flex items-center space-x-2'>
                <img src='/assets/sprout/sprout.png' alt='Seedit Logo' className='w-6 h-6' />
                <img src='/assets/sprout/seedit-text-dark.svg' alt='Seedit' className='h-5' />
              </a>
            </div>

            {/* Tab Menu */}
            <ul className='flex space-x-6'>
              <li>
                <a href='#/hot' className='text-sm font-medium text-primary'>
                  hot
                </a>
              </li>
              <li>
                <a href='#/new' className='text-sm text-muted-foreground hover:text-foreground'>
                  new
                </a>
              </li>
              <li>
                <a href='#/active' className='text-sm text-muted-foreground hover:text-foreground'>
                  active
                </a>
              </li>
              <li>
                <a href='#/topAll' className='text-sm text-muted-foreground hover:text-foreground'>
                  top
                </a>
              </li>
              <li>
                <a href='#/about' className='text-sm text-muted-foreground hover:text-foreground'>
                  about
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Filter Bar */}
        <div className='px-4 py-2 border-t border-border bg-muted/30'>
          <div className='flex items-center space-x-4'>
            {/* Tags Dropdown */}
            <div className='relative group'>
              <button className='flex items-center space-x-1 text-sm text-muted-foreground hover:text-foreground'>
                <span>Tags</span>
                <span className='text-xs'>▼</span>
              </button>
              <div className='absolute top-full left-0 mt-1 w-48 bg-background border border-border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20'>
                <div className='p-2 space-y-1'>
                  <div className='px-3 py-2 text-sm hover:bg-accent rounded cursor-pointer'>hide all nsfw</div>
                  <div className='px-3 py-2 text-sm hover:bg-accent rounded cursor-pointer'>
                    hide <em>adult</em>
                  </div>
                  <div className='px-3 py-2 text-sm hover:bg-accent rounded cursor-pointer'>
                    hide <em>gore</em>
                  </div>
                  <div className='px-3 py-2 text-sm hover:bg-accent rounded cursor-pointer'>
                    hide <em>vulgar</em>
                  </div>
                  <div className='px-3 py-2 text-sm hover:bg-accent rounded cursor-pointer'>
                    hide <em>anti</em>
                  </div>
                  <div className='border-t border-border my-1'></div>
                  <a href='#/settings/content-options' className='block px-3 py-2 text-sm hover:bg-accent rounded'>
                    Content options
                  </a>
                </div>
              </div>
            </div>

            {/* Sort Dropdown */}
            <div className='relative group'>
              <button className='flex items-center space-x-1 text-sm text-muted-foreground hover:text-foreground'>
                <span>hot</span>
                <span className='text-xs'>▼</span>
              </button>
              <div className='absolute top-full left-0 mt-1 w-32 bg-background border border-border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20'>
                <div className='p-2 space-y-1'>
                  <a href='#/p/all/hot/24h' className='block px-3 py-2 text-sm hover:bg-accent rounded'>
                    hot
                  </a>
                  <a href='#/p/all/new/24h' className='block px-3 py-2 text-sm hover:bg-accent rounded'>
                    new
                  </a>
                  <a href='#/p/all/active/24h' className='block px-3 py-2 text-sm hover:bg-accent rounded'>
                    active
                  </a>
                  <a href='#/p/all/topAll/24h' className='block px-3 py-2 text-sm hover:bg-accent rounded'>
                    top
                  </a>
                </div>
              </div>
            </div>

            {/* Time Dropdown */}
            <div className='relative group'>
              <button className='flex items-center space-x-1 text-sm text-muted-foreground hover:text-foreground'>
                <span>24h</span>
                <span className='text-xs'>▼</span>
              </button>
              <div className='absolute top-full left-0 mt-1 w-24 bg-background border border-border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20'>
                <div className='p-2 space-y-1'>
                  <a href='#/p/all/hot/1h' className='block px-3 py-2 text-sm hover:bg-accent rounded'>
                    1h
                  </a>
                  <a href='#/p/all/hot/24h' className='block px-3 py-2 text-sm hover:bg-accent rounded'>
                    24h
                  </a>
                  <a href='#/p/all/hot/1w' className='block px-3 py-2 text-sm hover:bg-accent rounded'>
                    1w
                  </a>
                  <a href='#/p/all/hot/1m' className='block px-3 py-2 text-sm hover:bg-accent rounded'>
                    1m
                  </a>
                  <a href='#/p/all/hot/1y' className='block px-3 py-2 text-sm hover:bg-accent rounded'>
                    1y
                  </a>
                  <a href='#/p/all/hot/all' className='block px-3 py-2 text-sm hover:bg-accent rounded'>
                    all
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feed Content */}
      <div className='px-4 py-6'>{children}</div>
    </div>
  );
}

export default MiddleColumn;
