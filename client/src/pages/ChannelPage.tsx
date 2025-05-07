import { useRoute, Link } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { User, AlertCircle, UserX, CheckCircle } from 'lucide-react';
import VideoGrid from '@/components/VideoGrid';
import { formatViews } from '@/lib/constants';
import { Video, User as UserType } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export default function ChannelPage() {
  const [, params] = useRoute<{ username: string }>('/channel/:username');
  const username = params?.username || '';
  const { toast } = useToast();
  
  // Fetch channel data and videos
  const { data: channelData, isLoading, error } = useQuery<{ user: UserType, videos: Video[] }>({
    queryKey: [`/api/channels/username/${username}/videos`],
    enabled: !!username, // Only run query if username is available
  });
  
  const { user } = useAuth();
  const isCurrentUserChannel = user?.username === username;
  
  // Check if user is subscribed to this channel
  const { data: subscriptionData } = useQuery<{ isSubscribed: boolean }>({
    queryKey: [`/api/channels/${channelData?.user?.id}/subscribed`],
    enabled: !!channelData?.user?.id && !!user && !isCurrentUserChannel,
  });
  
  // Subscribe mutation
  const subscribeMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', `/api/channels/${channelData?.user?.id}/subscribe`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/channels/${channelData?.user?.id}/subscribed`] });
      queryClient.invalidateQueries({ queryKey: [`/api/channels/username/${username}/videos`] });
      toast({
        title: "Subscribed!",
        description: `You have subscribed to ${channelData?.user?.displayName}'s channel`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to subscribe. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  if (isLoading) {
    return <ChannelPageSkeleton />;
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-16 w-16 text-destructive mb-4" />
        <h3 className="text-xl font-semibold mb-2">Failed to load channel</h3>
        <p className="text-muted-foreground mb-4">There was an error loading the channel data.</p>
        <Button onClick={() => window.history.back()}>Go Back</Button>
      </div>
    );
  }
  
  if (!channelData) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <UserX className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">Channel not found</h3>
        <p className="text-muted-foreground mb-4">The channel you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => window.history.back()}>Go Back</Button>
      </div>
    );
  }
  
  const { user: channelUser, videos } = channelData;
  const isSubscribed = subscriptionData?.isSubscribed || false;
  
  // Handle subscribe button click
  const handleSubscribe = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to subscribe to channels",
        variant: "destructive",
      });
      return;
    }
    subscribeMutation.mutate();
  };
  
  return (
    <div>
      {/* Channel Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div className="flex items-center">
          <Avatar className="w-24 h-24 mr-6">
            <AvatarImage 
              src={channelUser.avatar || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=48&h=48&q=80'} 
              alt={channelUser.displayName} 
            />
            <AvatarFallback>
              <User className="h-12 w-12" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{channelUser.displayName}</h1>
            <p className="text-muted-foreground">
              @{channelUser.username} • {formatViews(channelUser.subscribers || 0)} subscribers
            </p>
            <p className="text-muted-foreground mt-1">
              {videos.length} videos
            </p>
          </div>
        </div>
        {!isCurrentUserChannel && (
          <Button 
            className="mt-4 md:mt-0"
            onClick={handleSubscribe}
            disabled={subscribeMutation.isPending || isSubscribed}
            variant={isSubscribed ? "outline" : "default"}
          >
            {isSubscribed ? (
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" /> 
                Subscribed
              </div>
            ) : (
              "Subscribe"
            )}
          </Button>
        )}
        {isCurrentUserChannel && (
          <Button variant="outline" className="mt-4 md:mt-0">
            Edit Channel
          </Button>
        )}
      </div>
      
      {/* Channel Content */}
      <Tabs defaultValue="videos">
        <TabsList className="mb-6">
          <TabsTrigger value="videos">Videos</TabsTrigger>
          <TabsTrigger value="playlists">Playlists</TabsTrigger>
          <TabsTrigger value="community">Community</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>
        
        <TabsContent value="videos">
          <VideoGrid videos={videos} />
        </TabsContent>
        
        <TabsContent value="playlists">
          <div className="flex flex-col items-center justify-center py-12">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
              <rect x="3" y="14" width="14" height="7" rx="2"></rect>
              <rect x="7" y="3" width="14" height="7" rx="2"></rect>
            </svg>
            <h3 className="mt-4 text-xl font-medium">No playlists yet</h3>
            <p className="text-muted-foreground">This channel hasn't created any playlists</p>
          </div>
        </TabsContent>
        
        <TabsContent value="community">
          <div className="flex flex-col items-center justify-center py-12">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
              <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path>
            </svg>
            <h3 className="mt-4 text-xl font-medium">No community posts yet</h3>
            <p className="text-muted-foreground">This channel hasn't posted in the community</p>
          </div>
        </TabsContent>
        
        <TabsContent value="about">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <h3 className="text-lg font-medium mb-4">Description</h3>
              <p className="text-muted-foreground">
                {channelUser.description || `Welcome to ${channelUser.displayName}'s channel!`}
              </p>
              
              {isCurrentUserChannel && (
                <div className="mt-4">
                  <Button variant="outline" size="sm">
                    Edit Channel Description
                  </Button>
                </div>
              )}
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4">Stats</h3>
              <div className="space-y-3">
                <p className="text-muted-foreground">
                  Joined: {new Date(channelUser.createdAt).toLocaleDateString()}
                </p>
                <p className="text-muted-foreground">
                  {videos.length} videos
                </p>
                <p className="text-muted-foreground">
                  {formatViews(channelUser.subscribers || 0)} subscribers
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ChannelPageSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Channel Header Skeleton */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div className="flex items-center">
          <Skeleton className="w-24 h-24 rounded-full mr-6" />
          <div>
            <Skeleton className="h-7 w-56 mb-2" />
            <Skeleton className="h-5 w-40 mb-1" />
            <Skeleton className="h-5 w-24" />
          </div>
        </div>
        <Skeleton className="h-10 w-24 mt-4 md:mt-0" />
      </div>
      
      {/* Tabs Skeleton */}
      <Skeleton className="h-10 w-96 mb-6" />
      
      {/* Videos Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-card rounded-xl overflow-hidden">
            <Skeleton className="aspect-video w-full" />
            <div className="p-3">
              <div className="flex">
                <Skeleton className="w-9 h-9 rounded-full" />
                <div className="ml-3 space-y-2 flex-1">
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
