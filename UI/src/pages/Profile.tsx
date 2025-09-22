export function Profile() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-twitter-border bg-background/80 backdrop-blur-md px-4 py-3">
        <h1 className="text-xl font-bold text-foreground">Profile</h1>
      </div>
      
      <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <div className="border-b border-twitter-border pb-8 mb-8">
          <div className="flex items-start gap-4">
            <div className="h-20 w-20 rounded-full bg-gradient-primary"></div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground">Anonymous</h1>
              <p className="text-twitter-gray">@anon</p>
              <p className="text-foreground mt-2">Building the decentralized future, one post at a time.</p>
              <div className="flex items-center gap-4 mt-4 text-sm text-twitter-gray">
                <span><span className="font-semibold text-foreground">42</span> Following</span>
                <span><span className="font-semibold text-foreground">128</span> Followers</span>
              </div>
            </div>
          </div>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4">Your Posts</h2>
          <p className="text-muted-foreground">Your posts will appear here when you start sharing.</p>
        </div>
        </div>
      </div>
    </div>
  );
}