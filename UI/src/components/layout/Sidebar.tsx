import { Home, Search, Bell, Mail, Bookmark, User, Settings, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Home", icon: Home, current: true, href: "/" },
  { name: "Explore", icon: Search, current: false, href: "/explore" },
  { name: "Notifications", icon: Bell, current: false, href: "/notifications" },
  { name: "Messages", icon: Mail, current: false, href: "/messages" },
  { name: "Bookmarks", icon: Bookmark, current: false, href: "/bookmarks" },
  { name: "Profile", icon: User, current: false, href: "/profile" },
  { name: "Settings", icon: Settings, current: false, href: "/settings" },
];

export function Sidebar() {
  return (
    <div className="fixed left-0 top-0 h-full w-64 border-r border-twitter-border bg-background px-4 py-6">
      {/* Logo */}
      <div className="mb-8 px-3">
        <h1 className="text-2xl font-bold text-primary">Plebbit</h1>
      </div>

      {/* Navigation */}
      <nav className="space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.name}
              variant={item.current ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start gap-4 px-3 py-6 text-lg font-medium transition-smooth",
                item.current
                  ? "bg-twitter-light-gray text-primary"
                  : "text-foreground hover:bg-twitter-light-gray hover:text-primary"
              )}
              onClick={() => window.location.href = item.href}
            >
              <Icon className="h-6 w-6" />
              <span>{item.name}</span>
            </Button>
          );
        })}
      </nav>

      {/* Tweet Button */}
      <Button className="mt-8 w-full rounded-full bg-primary py-6 text-lg font-bold text-primary-foreground transition-smooth hover:bg-primary-hover">
        Post
      </Button>

      {/* Profile Section */}
      <div className="absolute bottom-6 left-4 right-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 px-3 py-4 transition-smooth hover:bg-twitter-light-gray"
        >
          <div className="h-10 w-10 rounded-full bg-gradient-primary" />
          <div className="flex-1 text-left">
            <p className="font-semibold">Anonymous</p>
            <p className="text-sm text-twitter-gray">@anon</p>
          </div>
          <MoreHorizontal className="h-5 w-5 text-twitter-gray" />
        </Button>
      </div>
    </div>
  );
}