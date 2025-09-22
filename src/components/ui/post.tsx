import * as React from 'react';
import { Heart, MessageCircle, Repeat2, Share, MoreHorizontal } from 'lucide-react';
import { Button } from './button';
import { cn } from '../../lib/utils';

interface PostProps {
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
  className?: string;
}

export function Post({ author, username, time, content, likes, reposts, replies, isLiked = false, isReposted = false, avatarUrl, className }: PostProps) {
  return (
    <div className={cn('modern-post', className)}>
      <div className='flex gap-3'>
        {/* Avatar */}
        <div className='modern-post-avatar' style={{ backgroundImage: avatarUrl ? `url(${avatarUrl})` : 'var(--gradient-primary)' }} />

        {/* Post Content */}
        <div className='modern-post-content'>
          {/* Header */}
          <div className='modern-post-header'>
            <span className='modern-post-author'>{author}</span>
            <span className='modern-post-username'>@{username}</span>
            <span className='modern-post-username'>·</span>
            <span className='modern-post-time'>{time}</span>
            <div className='ml-auto'>
              <Button variant='ghost' size='icon' className='h-8 w-8 p-0 text-twitter-gray hover:bg-twitter-light-gray hover:text-foreground'>
                <MoreHorizontal className='h-4 w-4' />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className='mb-3'>
            <p className='modern-post-text'>{content}</p>
          </div>

          {/* Actions */}
          <div className='modern-post-actions'>
            <Button variant='ghost' size='sm' className='modern-post-action'>
              <MessageCircle className='h-5 w-5' />
              <span className='text-sm'>{replies}</span>
            </Button>

            <Button variant='ghost' size='sm' className={cn('modern-post-action', isReposted && 'reposted')}>
              <Repeat2 className='h-5 w-5' />
              <span className='text-sm'>{reposts}</span>
            </Button>

            <Button variant='ghost' size='sm' className={cn('modern-post-action', isLiked && 'liked')}>
              <Heart className={cn('h-5 w-5', isLiked && 'fill-current')} />
              <span className='text-sm'>{likes}</span>
            </Button>

            <Button variant='ghost' size='sm' className='modern-post-action'>
              <Share className='h-5 w-5' />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
