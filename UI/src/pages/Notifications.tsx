export function Notifications() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-twitter-border bg-background/80 backdrop-blur-md px-4 py-3">
        <h1 className="text-xl font-bold text-foreground">Notifications</h1>
      </div>
      
      <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <div className="space-y-4">
          <div className="p-4 border-b border-twitter-border">
            <p className="text-foreground"><span className="font-semibold">@decentdev</span> liked your post</p>
            <p className="text-sm text-twitter-gray">2 hours ago</p>
          </div>
          <div className="p-4 border-b border-twitter-border">
            <p className="text-foreground"><span className="font-semibold">@privacyfirst</span> reposted your post</p>
            <p className="text-sm text-twitter-gray">4 hours ago</p>
          </div>
          <div className="p-4 border-b border-twitter-border">
            <p className="text-foreground"><span className="font-semibold">@web3builder</span> followed you</p>
            <p className="text-sm text-twitter-gray">1 day ago</p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}