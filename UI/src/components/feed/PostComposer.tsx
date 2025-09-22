import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Image, Smile, Calendar, MapPin } from "lucide-react";

export function PostComposer() {
  const [content, setContent] = useState("");
  const maxLength = 280;
  const remaining = maxLength - content.length;

  return (
    <Card className="border-b border-twitter-border bg-background p-4">
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="h-12 w-12 rounded-full bg-gradient-primary flex-shrink-0" />
        
        {/* Composer */}
        <div className="flex-1">
          <Textarea
            placeholder="What's happening?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[120px] resize-none border-none p-0 text-xl placeholder:text-twitter-gray focus-visible:ring-0"
            maxLength={maxLength}
          />
          
          {/* Tools and Post Button */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex gap-4">
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-primary hover:bg-primary/10">
                <Image className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-primary hover:bg-primary/10">
                <Smile className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-primary hover:bg-primary/10">
                <Calendar className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-primary hover:bg-primary/10">
                <MapPin className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="flex items-center gap-3">
              {content.length > 0 && (
                <span className={`text-sm ${remaining < 20 ? 'text-destructive' : 'text-twitter-gray'}`}>
                  {remaining}
                </span>
              )}
              <Button
                className="rounded-full px-6 py-2 font-bold transition-smooth hover:bg-primary-hover"
                disabled={content.length === 0 || remaining < 0}
              >
                Post
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}