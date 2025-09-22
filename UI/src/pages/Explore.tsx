export function Explore() {
  return (
    <div className="min-h-screen">{/* ... keep existing code ... */}
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-twitter-border bg-background/80 backdrop-blur-md px-4 py-3">
        <h1 className="text-xl font-bold text-foreground">Explore</h1>
      </div>
      
      <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <div className="space-y-6">
          <div className="p-6 border border-twitter-border rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Trending Topics</h2>
            <div className="space-y-3">
              <div className="text-twitter-gray">#Decentralization</div>
              <div className="text-twitter-gray">#Web3Social</div>
              <div className="text-twitter-gray">#Plebbit</div>
            </div>
          </div>
          <div className="p-6 border border-twitter-border rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Discover Communities</h2>
            <p className="text-muted-foreground">Find new communities to join and explore different topics.</p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}