import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

export function Settings() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-twitter-border bg-background/80 backdrop-blur-md px-4 py-3">
        <h1 className="text-xl font-bold text-foreground">Settings</h1>
      </div>
      
      <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <div className="space-y-6">
          <div className="p-6 border border-twitter-border rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Privacy & Safety</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Make posts private</span>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <span>Allow direct messages</span>
                <Switch defaultChecked />
              </div>
            </div>
          </div>
          <div className="p-6 border border-twitter-border rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Notifications</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Email notifications</span>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <span>Push notifications</span>
                <Switch defaultChecked />
              </div>
            </div>
          </div>
          <div className="p-6 border border-twitter-border rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Appearance</h2>
            <div className="space-y-4">
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => document.documentElement.classList.toggle('dark')}
              >
                Toggle Dark Mode
              </Button>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}