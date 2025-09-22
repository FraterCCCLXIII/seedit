export function Messages() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-twitter-border bg-background/80 backdrop-blur-md px-4 py-3">
        <h1 className="text-xl font-bold text-foreground">Messages</h1>
      </div>
      
      <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <div className="space-y-4">
          <div className="p-4 border border-twitter-border rounded-lg hover:bg-muted/50 cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-primary"></div>
              <div className="flex-1">
                <p className="font-semibold">Decentralized Dev</p>
                <p className="text-sm text-twitter-gray">Thanks for the feedback on my dApp!</p>
              </div>
              <p className="text-xs text-twitter-gray">2h</p>
            </div>
          </div>
          <div className="p-4 border border-twitter-border rounded-lg hover:bg-muted/50 cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-primary"></div>
              <div className="flex-1">
                <p className="font-semibold">Privacy Advocate</p>
                <p className="text-sm text-twitter-gray">Have you tried the new privacy features?</p>
              </div>
              <p className="text-xs text-twitter-gray">5h</p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}