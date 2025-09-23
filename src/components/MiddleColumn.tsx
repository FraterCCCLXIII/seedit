import React from 'react';

interface MiddleColumnProps {
  children: React.ReactNode;
}

function MiddleColumn({ children }: MiddleColumnProps) {
  return (
    <div className='h-full bg-background flex flex-col'>
      {/* Scrollable Content */}
      <div className='flex-1 overflow-y-auto px-4 py-6'>{children}</div>
    </div>
  );
}

export default MiddleColumn;
