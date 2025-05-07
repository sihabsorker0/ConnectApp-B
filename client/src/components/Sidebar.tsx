import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { 
  Home, Compass, Tv2, Library, History, Clock, ThumbsUp, 
  Settings, HelpCircle, MessageSquarePlus, User
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { User as UserType } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface SidebarProps {
  isOpen: boolean;
}

export default function Sidebar({ isOpen }: SidebarProps) {
  const [location] = useLocation();
  
  const { data: subscriptions, isLoading: isSubscriptionsLoading } = useQuery<UserType[]>({
    queryKey: ['/api/subscriptions'],
    enabled: true,
  });
  

  
  // Sidebar links with active state based on current location
  const mainLinks = [
    { icon: <Home className="h-5 w-5" />, label: 'Home', path: '/' },
    { icon: <Compass className="h-5 w-5" />, label: 'Explore', path: '/explore' },
    { icon: <Tv2 className="h-5 w-5" />, label: 'Subscriptions', path: '/subscriptions' }
  ];
  
  const libraryLinks = [
    { icon: <Library className="h-5 w-5" />, label: 'Library', path: '/library' },
    { icon: <History className="h-5 w-5" />, label: 'History', path: '/history' },
    { icon: <Clock className="h-5 w-5" />, label: 'Watch Later', path: '/watch-later' },
    { icon: <ThumbsUp className="h-5 w-5" />, label: 'Liked Videos', path: '/liked-videos' }
  ];
  
  const moreLinks = [
    { icon: <Settings className="h-5 w-5" />, label: 'Settings', path: '/settings' },
    { icon: <HelpCircle className="h-5 w-5" />, label: 'Help', path: '/help' },
    { icon: <MessageSquarePlus className="h-5 w-5" />, label: 'Send Feedback', path: '/feedback' }
  ];
  
  return (
    <aside 
      className={`fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] bg-background border-r border-border transition-all duration-300 ${
        isOpen ? 'translate-x-0 w-64' : '-translate-x-full w-0 opacity-0'
      }`}
    >
      <ScrollArea className="h-full py-4">
        <nav className="px-3 space-y-1">
          {/* Main Links */}
          {mainLinks.map(link => (
            <Link key={link.path} href={link.path}>
              <a className={`flex items-center px-4 py-2 rounded-lg ${
                location === link.path 
                  ? 'bg-secondary text-foreground' 
                  : 'text-muted-foreground hover:bg-secondary/50'
              }`}>
                {link.icon}
                <span className="ml-4">{link.label}</span>
              </a>
            </Link>
          ))}
          
          <Separator className="my-4" />
          
          {/* Library Links */}
          {libraryLinks.map(link => (
            <Link key={link.path} href={link.path}>
              <a className={`flex items-center px-4 py-2 rounded-lg ${
                location === link.path 
                  ? 'bg-secondary text-foreground' 
                  : 'text-muted-foreground hover:bg-secondary/50'
              }`}>
                {link.icon}
                <span className="ml-4">{link.label}</span>
              </a>
            </Link>
          ))}
          
          <Separator className="my-4" />
          
          {/* Subscriptions */}
          <h3 className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Subscriptions
          </h3>
          
          {subscriptions && subscriptions.length > 0 ? (
            subscriptions.map((sub: UserType) => (
              <Link key={sub.id} href={`/channel/${sub.username}`}>
                <a className={`flex items-center px-4 py-2 rounded-lg ${
                  location === `/channel/${sub.username}` 
                    ? 'bg-secondary text-foreground' 
                    : 'text-muted-foreground hover:bg-secondary/50'
                }`}>
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={sub.avatar} alt={sub.displayName} />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="ml-4 truncate">{sub.displayName}</span>
                </a>
              </Link>
            ))
          ) : (
            <div className="px-4 py-2 text-muted-foreground text-sm">
              No subscriptions yet
            </div>
          )}
          
          <Separator className="my-4" />
          
          {/* More from VidVault */}
          <h3 className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            More from VidVault
          </h3>
          
          {moreLinks.map(link => (
            <Link key={link.path} href={link.path}>
              <a className={`flex items-center px-4 py-2 rounded-lg ${
                location === link.path 
                  ? 'bg-secondary text-foreground' 
                  : 'text-muted-foreground hover:bg-secondary/50'
              }`}>
                {link.icon}
                <span className="ml-4">{link.label}</span>
              </a>
            </Link>
          ))}
        </nav>
      </ScrollArea>
    </aside>
  );
}
