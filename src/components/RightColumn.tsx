import React from 'react';

interface RightColumnProps {
  children: React.ReactNode;
}

function RightColumn({ children }: RightColumnProps) {
  return (
    <div className='fixed right-0 top-0 h-screen w-80 bg-background border-l border-border z-40 overflow-y-auto'>
      <div className='p-4'>{children}</div>
    </div>
  );
}

export default RightColumn;
