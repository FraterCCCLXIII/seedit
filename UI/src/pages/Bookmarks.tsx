export function Bookmarks() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-twitter-border bg-background/80 backdrop-blur-md px-4 py-3">
        <h1 className="text-xl font-bold text-foreground">Bookmarks</h1>
      </div>
      
      <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <div className="space-y-4">
          <div className="p-4 border-b border-twitter-border">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-primary"></div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold">Web3 Builder</span>
                  <span className="text-twitter-gray">@web3builder</span>
                  <span className="text-twitter-gray">·</span>
                  <span className="text-twitter-gray">6h</span>
                </div>
                <p className="text-foreground mb-2">The beauty of decentralized social networks: ✅ Censorship resistant ✅ User-owned data ✅ Open source ✅ Community governed</p>
                <p className="text-sm text-twitter-gray">Bookmarked 2 hours ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}