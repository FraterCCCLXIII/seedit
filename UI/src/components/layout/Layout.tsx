import { Sidebar } from "./Sidebar";
import { TrendingSidebar } from "./TrendingSidebar";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen w-full flex">
      {/* Left Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <main className="flex-1 ml-64">
        <div className="max-w-2xl mx-auto border-x border-twitter-border min-h-screen">
          {children}
        </div>
      </main>
      
      {/* Right Sidebar */}
      <div className="w-80 p-4">
        <TrendingSidebar />
      </div>
    </div>
  );
}