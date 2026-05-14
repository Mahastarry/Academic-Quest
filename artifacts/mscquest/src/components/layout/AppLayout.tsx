import React from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  UploadCloud, 
  Cpu, 
  BookOpen, 
  CheckSquare, 
  BarChart2, 
  Settings,
  Search,
  Bell
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/upload", label: "Upload Center", icon: UploadCloud },
  { href: "/processing", label: "AI Processing", icon: Cpu },
  { href: "/notes", label: "Study Notes", icon: BookOpen },
  { href: "/questions", label: "Review Questions", icon: CheckSquare },
  { href: "/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const getPageTitle = () => {
    const item = navItems.find(i => i.href === location);
    return item ? item.label : "MSCQuest";
  };

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden text-foreground">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-sidebar flex flex-col justify-between hidden md:flex shrink-0">
        <div>
          <div className="h-16 flex items-center px-6 border-b border-border">
            <div className="flex items-center gap-2 text-primary font-bold text-xl tracking-tight">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
                M
              </div>
              MSCQuest
            </div>
          </div>
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = location === item.href;
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}>
                  <div
                    data-testid={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer transition-colors duration-200 ${
                      isActive 
                        ? "bg-primary/10 text-primary font-medium" 
                        : "text-muted-foreground hover:bg-black/5 hover:text-foreground"
                    }`}
                  >
                    <Icon size={18} className={isActive ? "text-primary" : ""} />
                    <span>{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback className="bg-primary/20 text-primary">JD</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium">Jane Doe</span>
              <Badge variant="secondary" className="text-[10px] w-fit font-normal text-muted-foreground bg-black/5">University Plan</Badge>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border bg-background/80 backdrop-blur flex items-center justify-between px-6 shrink-0 sticky top-0 z-10">
          <h1 className="text-lg font-semibold">{getPageTitle()}</h1>
          <div className="flex items-center gap-4">
            <button className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-black/5 transition-colors">
              <Search size={20} />
            </button>
            <button className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-black/5 transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive border border-background"></span>
            </button>
            <div className="md:hidden">
              <Avatar className="w-8 h-8">
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-muted/30 p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
