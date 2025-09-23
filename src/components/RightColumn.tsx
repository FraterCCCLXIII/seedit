import React from 'react';
import { useParams } from 'react-router-dom';
import { useSubplebbit, useComment } from '@plebbit/plebbit-react-hooks';
import Sidebar from './sidebar/sidebar';

interface RightColumnProps {
  children: React.ReactNode;
}

function RightColumn({ children }: RightColumnProps) {
  const params = useParams();
  const subplebbitAddress = params?.subplebbitAddress || '';
  const commentCid = params?.commentCid;

  const subplebbit = useSubplebbit({ subplebbitAddress });
  const comment = useComment({ commentCid });

  return (
    <div className='h-full bg-background border-l border-border flex flex-col w-80'>
      <div className='flex-1 overflow-y-auto px-8 py-8'>
        <div className='max-w-sm mx-auto'>
          <Sidebar subplebbit={subplebbit} comment={comment} settings={subplebbit?.settings} />
        </div>
      </div>
      {children && (
        <div className='border-t border-border px-8 py-8'>
          <div className='max-w-sm mx-auto'>{children}</div>
        </div>
      )}
    </div>
  );
}

export default RightColumn;
