import React from 'react';

interface MiddleColumnProps {
  children: React.ReactNode;
}

function MiddleColumn({ children }: MiddleColumnProps) {
  return (
    <div className='flex-1 flex justify-center ml-64 mr-80'>
      <div className='w-full max-w-2xl'>
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
        </div>

        {/* Feed Content */}
        <div className='px-4 py-6'>{children}</div>
      </div>
    </div>
  );
}

export default MiddleColumn;
