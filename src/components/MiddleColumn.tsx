import React from 'react';

interface MiddleColumnProps {
  children: React.ReactNode;
}

function MiddleColumn({ children }: MiddleColumnProps) {
  return <div className='flex-1 max-w-2xl mx-auto px-4 py-6 ml-64 mr-80'>{children}</div>;
}

export default MiddleColumn;
