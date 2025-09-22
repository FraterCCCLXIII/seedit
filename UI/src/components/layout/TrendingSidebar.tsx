import { Search, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const trending = [
  { category: "Technology", topic: "#Blockchain", posts: "42.1K" },
  { category: "Decentralized", topic: "#Web3", posts: "28.5K" },
  { category: "Trending", topic: "#Plebbit", posts: "15.2K" },
  { category: "Politics", topic: "#Decentralization", posts: "12.8K" },
  { category: "Technology", topic: "#Privacy", posts: "9.4K" },
];

const suggestions = [
  { name: "Satoshi Nakamoto", username: "satoshi", verified: true },
  { name: "Vitalik Buterin", username: "vitalik", verified: true },
  { name: "Web3 Builder", username: "web3builder", verified: false },
];

export function TrendingSidebar() {
  return (
    <div className="fixed right-0 top-0 h-full w-80 px-6 py-6 space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-twitter-gray" />
        <Input
          placeholder="Search Plebbit"
          className="bg-twitter-light-gray border-none pl-12 py-3 rounded-full focus-visible:ring-2 focus-visible:ring-primary"
        />
      </div>

      {/* What's happening */}
      <Card className="bg-twitter-light-gray border-none p-4">
        <h2 className="text-xl font-bold mb-4">What's happening</h2>
        <div className="space-y-3">
          {trending.map((item, index) => (
            <div
              key={index}
              className="flex items-start justify-between p-2 rounded-lg hover:bg-background/60 cursor-pointer transition-smooth"
            >
              <div className="flex-1">
                <p className="text-sm text-twitter-gray">{item.category}</p>
                <p className="font-bold text-foreground">{item.topic}</p>
                <p className="text-sm text-twitter-gray">{item.posts} posts</p>
              </div>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-twitter-gray">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        <Button variant="ghost" className="w-full justify-start p-3 text-primary hover:bg-background/60">
          Show more
        </Button>
      </Card>

      {/* Who to follow */}
      <Card className="bg-twitter-light-gray border-none p-4">
        <h2 className="text-xl font-bold mb-4">Who to follow</h2>
        <div className="space-y-3">
          {suggestions.map((user, index) => (
            <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-background/60 cursor-pointer transition-smooth">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-primary" />
                <div>
                  <div className="flex items-center gap-1">
                    <p className="font-bold text-foreground">{user.name}</p>
                    {user.verified && <div className="h-4 w-4 rounded-full bg-primary" />}
                  </div>
                  <p className="text-sm text-twitter-gray">@{user.username}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full border-twitter-border bg-background px-4 py-1 font-bold text-foreground hover:bg-twitter-light-gray"
              >
                Follow
              </Button>
            </div>
          ))}
        </div>
        <Button variant="ghost" className="w-full justify-start p-3 text-primary hover:bg-background/60">
          Show more
        </Button>
      </Card>
    </div>
  );
}