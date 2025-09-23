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
    <div className='h-full bg-background border-l border-border overflow-y-auto'>
      <Sidebar subplebbit={subplebbit} comment={comment} settings={subplebbit?.settings} />
      {children}
    </div>
  );
}

export default RightColumn;
