import { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { 
  LayoutDashboard, Video, Users, Settings, Bell, LogOut, ChevronLeft, ChevronRight,
  Menu, User, BarChart, FileText, HelpCircle
} from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [location, navigate] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { toast } = useToast();
  const [adminUser, setAdminUser] = useState<{username: string} | null>(null);
  
  // Check if admin is logged in on component mount
  useEffect(() => {
    const adminAuth = localStorage.getItem('adminAuth') || sessionStorage.getItem('adminAuth');
    if (adminAuth) {
      try {
        const auth = JSON.parse(adminAuth);
        if (auth && auth.isAdmin) {
          setAdminUser({
            username: auth.username
          });
        } else {
          // Redirect to login if not admin
          navigate('/admin/login');
        }
      } catch (e) {
        // Invalid stored data
        localStorage.removeItem('adminAuth');
        sessionStorage.removeItem('adminAuth');
        navigate('/admin/login');
      }
    } else {
      // No auth data found
      navigate('/admin/login');
    }
  }, [navigate]);
  
  // Handle admin logout
  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    sessionStorage.removeItem('adminAuth');
    
    toast({
      title: "Logged out",
      description: "You have been successfully logged out of the admin panel.",
    });
    
    navigate('/admin/login');
  };
  
  const mainNavItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
    { icon: Video, label: 'Videos', href: '/admin/videos' },
    { icon: Users, label: 'Users', href: '/admin/users' },
    { icon: FileText, label: 'Comments', href: '/admin/comments' },
    { icon: BarChart, label: 'Analytics', href: '/admin/analytics' },
    { icon: Bell, label: 'Notifications', href: '/admin/notifications' },
    { icon: Settings, label: 'Settings', href: '/admin/settings' },
  ];
  
  const secondaryNavItems = [
    { icon: HelpCircle, label: 'Help', href: '/admin/help' },
    { icon: LogOut, label: 'Back to Site', href: '/' },
  ];
  
  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const toggleMobileSidebar = () => {
    setMobileOpen(!mobileOpen);
  };
  
  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-card md:relative transition-all duration-300",
          collapsed ? "w-16" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex h-14 items-center border-b px-4 justify-between">
          <Link href="/admin" className="flex items-center">
            {!collapsed && (
              <span className="text-xl font-bold tracking-tight">VidVault Admin</span>
            )}
            {collapsed && (
              <span className="text-xl font-bold">VV</span>
            )}
          </Link>
          <Button 
            variant="ghost" 
            size="icon" 
            className="hidden md:flex" 
            onClick={toggleSidebar}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
        
        <ScrollArea className="flex-1 overflow-auto py-2">
          <nav className="grid gap-1 px-2">
            {mainNavItems.map((item, index) => (
              <Link key={index} href={item.href}>
                <a className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                  location === item.href
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}>
                  <item.icon className="h-4 w-4" />
                  {!collapsed && <span>{item.label}</span>}
                </a>
              </Link>
            ))}
          </nav>
          
          <div className="mt-4 px-2">
            <div className="border-t pt-4">
              <nav className="grid gap-1">
                {secondaryNavItems.map((item, index) => (
                  <Link key={index} href={item.href}>
                    <a className={cn(
                      "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                      location === item.href
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                    )}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.label}</span>}
                    </a>
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </ScrollArea>
        
        <div className="mt-auto border-t p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://images.unsplash.com/photo-1633332755192-727a05c4013d" alt="Admin User" />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="flex flex-col space-y-0.5 text-sm">
                  <span className="font-medium">{adminUser?.username || 'Admin'}</span>
                  <span className="text-xs text-muted-foreground">Administrator</span>
                </div>
              )}
            </div>
            {!collapsed && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout} 
                className="ml-2"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            )}
            {collapsed && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </aside>
      
      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex h-14 items-center gap-4 border-b bg-card px-4 md:px-6">
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden" 
            onClick={toggleMobileSidebar}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="w-full flex items-center justify-between">
            <h2 className="font-semibold text-lg">
              {mainNavItems.find(item => item.href === location)?.label || 'Admin'}
            </h2>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <div className="hidden md:block">|</div>
              <span className="hidden md:block text-sm text-muted-foreground">
                Welcome, {adminUser?.username || 'Admin'}
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className="flex items-center gap-1 text-red-500 hover:text-red-700 hover:bg-red-100"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
