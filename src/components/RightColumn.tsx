import React from 'react';

interface RightColumnProps {
  children: React.ReactNode;
}

function RightColumn({ children }: RightColumnProps) {
  return (
    <div className='sticky top-0 h-screen bg-background border-l border-border overflow-y-auto'>
      <div className='p-4'>{children}</div>
    </div>
  );
}

export default RightColumn;
