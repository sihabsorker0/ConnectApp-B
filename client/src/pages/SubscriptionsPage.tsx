import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Bell, AlertCircle, Loader2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import VideoGrid from '@/components/VideoGrid';
import { useAuth } from '@/hooks/use-auth';
import { Video, User as UserType } from '@/lib/types';

export default function SubscriptionsPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch subscriptions
  const { data: subscriptions = [], isLoading } = useQuery<UserType[]>({
    queryKey: ['/api/subscriptions'],
    enabled: !!user,
  });
  
  // Fetch videos from subscriptions
  const { data: videos = [], isLoading: isLoadingVideos } = useQuery<Video[]>({
    queryKey: ['/api/subscriptions/videos'],
    enabled: !!user,
  });
  
  if (!user) {
    return (
      <div className="container py-12">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Bell className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Sign in to see your subscriptions</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            Subscribe to channels to keep up with your favorite content creators.
          </p>
          <Button onClick={() => navigate('/auth')}>Sign In</Button>
        </div>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="container py-12">
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }
  
  const filteredSubscriptions = subscriptions?.filter(sub => 
    sub.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sub.username.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];
  
  // Filter videos based on active tab (all or specific channel)
  const filteredVideos = videos?.filter(video => {
    if (activeTab === 'all') return true;
    return video.userId === parseInt(activeTab);
  }) || [];

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Subscriptions</h1>
        <div className="w-full max-w-xs">
          <Input 
            placeholder="Search subscriptions" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {subscriptions?.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <User className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No subscriptions yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            Find channels you enjoy and subscribe to them to see their content here.
          </p>
          <Button onClick={() => navigate('/')}>Explore Channels</Button>
        </div>
      )}
      
      {subscriptions && subscriptions.length > 0 && (
        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="border-b">
              <TabsList className="flex overflow-x-auto pb-px">
                <TabsTrigger value="all" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                  All Channels
                </TabsTrigger>
                
                {filteredSubscriptions.map(sub => (
                  <TabsTrigger 
                    key={sub.id} 
                    value={sub.id.toString()} 
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary flex items-center gap-2"
                  >
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={sub.avatar} alt={sub.displayName} />
                      <AvatarFallback>{sub.displayName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {sub.displayName}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            
            <TabsContent value={activeTab} className="pt-4">
              {isLoadingVideos ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : filteredVideos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {activeTab === 'all' 
                      ? 'No videos from your subscriptions' 
                      : 'No videos from this channel'}
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    {activeTab === 'all'
                      ? 'Your subscribed channels haven\'t uploaded any videos yet.'
                      : 'This channel hasn\'t uploaded any videos yet.'}
                  </p>
                </div>
              ) : (
                <VideoGrid videos={filteredVideos} />
              )}
            </TabsContent>
          </Tabs>
          
          <Separator className="my-8" />
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Manage Subscriptions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSubscriptions.map(sub => (
                <div key={sub.id} className="flex items-center gap-3 border p-3 rounded-lg">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={sub.avatar} alt={sub.displayName} />
                    <AvatarFallback>{sub.displayName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{sub.displayName}</p>
                    <p className="text-sm text-muted-foreground truncate">@{sub.username}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => navigate(`/channel/${sub.id}`)}
                    >
                      View
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                    >
                      Unsubscribe
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}