import React from 'react';

interface MiddleColumnProps {
  children: React.ReactNode;
}

function MiddleColumn({ children }: MiddleColumnProps) {
  return (
    <div className='h-full bg-background flex flex-col'>
      {/* Scrollable Content */}
      <div className='flex-1 overflow-y-auto px-8 py-8 max-w-4xl mx-auto w-full'>
        <div className='space-y-6'>{children}</div>
      </div>
    </div>
  );
}

export default MiddleColumn;
