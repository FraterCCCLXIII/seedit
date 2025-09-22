import { Heart, MessageCircle, Repeat2, Share, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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
}

export function Post({ 
  author, 
  username, 
  time, 
  content, 
  likes, 
  reposts, 
  replies,
  isLiked = false,
  isReposted = false 
}: PostProps) {
  return (
    <div className="border-b border-twitter-border bg-background p-4 transition-smooth hover:bg-muted/50">
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="h-12 w-12 rounded-full bg-gradient-primary flex-shrink-0" />
        
        {/* Post Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-foreground hover:underline cursor-pointer">
              {author}
            </span>
            <span className="text-twitter-gray">@{username}</span>
            <span className="text-twitter-gray">·</span>
            <span className="text-twitter-gray hover:underline cursor-pointer">
              {time}
            </span>
            <div className="ml-auto">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-twitter-gray hover:bg-twitter-light-gray hover:text-foreground">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Content */}
          <div className="mb-3">
            <p className="text-foreground leading-relaxed whitespace-pre-wrap">
              {content}
            </p>
          </div>
          
          {/* Actions */}
          <div className="flex items-center justify-between max-w-md">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 px-3 py-2 text-twitter-gray hover:bg-primary/10 hover:text-primary transition-smooth group"
            >
              <MessageCircle className="h-5 w-5 group-hover:scale-110 transition-transform" />
              <span className="text-sm">{replies}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "flex items-center gap-2 px-3 py-2 transition-smooth group",
                isReposted
                  ? "text-green-600 hover:bg-green-600/10"
                  : "text-twitter-gray hover:bg-green-600/10 hover:text-green-600"
              )}
            >
              <Repeat2 className="h-5 w-5 group-hover:scale-110 transition-transform" />
              <span className="text-sm">{reposts}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "flex items-center gap-2 px-3 py-2 transition-smooth group",
                isLiked
                  ? "text-red-600 hover:bg-red-600/10"
                  : "text-twitter-gray hover:bg-red-600/10 hover:text-red-600"
              )}
            >
              <Heart className={cn("h-5 w-5 group-hover:scale-110 transition-transform", isLiked && "fill-current")} />
              <span className="text-sm">{likes}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 px-3 py-2 text-twitter-gray hover:bg-primary/10 hover:text-primary transition-smooth group"
            >
              <Share className="h-5 w-5 group-hover:scale-110 transition-transform" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}