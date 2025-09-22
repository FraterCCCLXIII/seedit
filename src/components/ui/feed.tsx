import * as React from 'react';
import { Post } from './post';
import { cn } from '../../lib/utils';

interface PostData {
  author: string;
  username: string;
  time: string;
  content: string;
  likes: number;
  reposts: number;
  replies: number;
  isLiked?: boolean;
  isReposted?: boolean;
  avatarUrl?: string;
}

interface FeedProps {
  posts: PostData[];
  className?: string;
  title?: string;
  showHeader?: boolean;
}

export function Feed({ posts, className, title = 'Home', showHeader = true }: FeedProps) {
  return (
    <div className={cn('min-h-screen', className)}>
      {/* Header */}
      {showHeader && (
        <div className='sticky top-0 z-10 border-b border-twitter-border bg-background/80 backdrop-blur-md px-4 py-3'>
          <h1 className='text-xl font-bold text-foreground'>{title}</h1>
        </div>
      )}

      {/* Posts */}
      <div>
        {posts.map((post, index) => (
          <Post key={index} {...post} />
        ))}
      </div>
    </div>
  );
}
