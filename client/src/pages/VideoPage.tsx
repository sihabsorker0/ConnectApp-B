import { useEffect, useState } from 'react';
import { useRoute, Link } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { User, ThumbsUp, ThumbsDown, Share, Bookmark, MoreHorizontal, CheckCircle, Copy, Flag, Clock, Link as LinkIcon } from 'lucide-react';
import { TwitterIcon, FacebookIcon, LinkedinIcon, MailIcon } from 'lucide-react';
import VideoPlayer from '@/components/VideoPlayer';
import CommentSection from '@/components/CommentSection';
import RecommendedVideos from '@/components/RecommendedVideos';
import { formatViews, formatTimeAgo } from '@/lib/constants';
import { Video } from '@/lib/types';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function VideoPage() {
  const [location] = useRoute('/watch');
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Get video ID from query parameter
  const searchParams = new URLSearchParams(window.location.search);
  const videoId = parseInt(searchParams.get('v') || '1');
  
  // Fetch video details
  const { data: video, isLoading } = useQuery<Video>({
    queryKey: [`/api/videos/${videoId}`],
  });
  
  // Like and dislike mutations
  const likeMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', `/api/videos/${videoId}/like`);
      return await res.json();
    },
    onSuccess: (videoData) => {
      // Update video cache with the returned data, avoiding a GET request
      queryClient.setQueryData([`/api/videos/${videoId}`], videoData);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "You need to be logged in to like videos",
        variant: "destructive",
      });
    }
  });
  
  const dislikeMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', `/api/videos/${videoId}/dislike`);
      return await res.json();
    },
    onSuccess: (videoData) => {
      // Update video cache with the returned data, avoiding a GET request
      queryClient.setQueryData([`/api/videos/${videoId}`], videoData);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "You need to be logged in to dislike videos",
        variant: "destructive",
      });
    }
  });
  
  // Check if user is subscribed to the video's channel
  const { data: subscriptionData } = useQuery<{ isSubscribed: boolean }>({
    queryKey: [`/api/channels/${video?.userId}/subscribed`],
    enabled: !!video?.userId && !!user && video?.userId !== user?.id,
  });
  
  // Check if the video is saved
  const { data: savedData } = useQuery<{ isSaved: boolean }>({
    queryKey: [`/api/videos/${videoId}/saved`],
    enabled: !!videoId && !!user,
  });
  
  // Subscribe mutation
  const subscribeMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', `/api/channels/${video?.userId}/subscribe`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/channels/${video?.userId}/subscribed`] });
      toast({
        title: "Subscribed!",
        description: `You have subscribed to ${video?.user?.displayName}'s channel`,
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
  
  // Save video mutation
  const saveVideoMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', `/api/videos/${videoId}/save`);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`/api/videos/${videoId}/saved`] });
      queryClient.setQueryData([`/api/videos/${videoId}`], data.video);
      toast({
        title: "Video saved",
        description: "This video has been added to your saved videos",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to save video. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Unsave video mutation
  const unsaveVideoMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', `/api/videos/${videoId}/unsave`);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`/api/videos/${videoId}/saved`] });
      queryClient.setQueryData([`/api/videos/${videoId}`], data.video);
      toast({
        title: "Video removed",
        description: "This video has been removed from your saved videos",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to remove video. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Handle like and dislike
  const handleLike = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to like videos",
        variant: "destructive",
      });
      return;
    }
    likeMutation.mutate();
  };
  
  const handleDislike = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to dislike videos",
        variant: "destructive",
      });
      return;
    }
    dislikeMutation.mutate();
  };
  
  // Handle subscribe
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
  
  // Handle save/unsave video
  const handleSaveVideo = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to save videos",
        variant: "destructive",
      });
      return;
    }
    
    if (savedData?.isSaved || video.userSaved) {
      unsaveVideoMutation.mutate();
    } else {
      saveVideoMutation.mutate();
    }
  };
  
  // Update document title
  useEffect(() => {
    if (video?.title) {
      document.title = `${video.title} - VidVault`;
    }
    return () => {
      document.title = 'VidVault';
    };
  }, [video?.title]);
  
  if (isLoading) {
    return <VideoPageSkeleton />;
  }
  
  if (!video) {
    return <VideoPageSkeleton />;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 w-full overflow-x-hidden">
      <div className="lg:col-span-2 w-full">
        {/* Video Player */}
        <VideoPlayer url={video.videoUrl} title={video.title} />
        
        {/* Video Info */}
        <div className="mt-4 w-full">
          <h1 className="text-xl md:text-2xl font-bold break-words">{video.title}</h1>
          
          <div className="flex flex-col md:flex-row justify-between mt-3 w-full">
            <div className="flex items-center">
              <span className="text-muted-foreground text-sm">
                {formatViews(video.views || 0)} views • {formatTimeAgo(video.createdAt)}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-3 md:mt-0">
              <Button 
                variant="ghost" 
                className={`flex items-center gap-1 h-9 px-2 sm:px-3 ${video.userLiked ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : ''}`}
                onClick={handleLike}
                disabled={likeMutation.isPending}
              >
                <ThumbsUp className={`h-4 w-4 sm:h-5 sm:w-5 ${video.userLiked ? 'fill-blue-600 dark:fill-blue-400' : ''}`} />
                <span className="text-xs sm:text-sm">{formatViews(video.likes || 0)}</span>
              </Button>
              <Button 
                variant="ghost" 
                className={`flex items-center gap-1 h-9 px-2 sm:px-3 ${video.userDisliked ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400' : ''}`}
                onClick={handleDislike}
                disabled={dislikeMutation.isPending}
              >
                <ThumbsDown className={`h-4 w-4 sm:h-5 sm:w-5 ${video.userDisliked ? 'fill-red-600 dark:fill-red-400' : ''}`} />
                <span className="text-xs sm:text-sm">{formatViews(video.dislikes || 0)}</span>
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-1 h-9 px-2 sm:px-3">
                    <Share className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="text-xs sm:text-sm">Share</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Share video</DialogTitle>
                    <DialogDescription>
                      Copy the link below to share this video with others
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex items-center space-x-2 mt-4">
                    <div className="grid flex-1 gap-2">
                      <Label htmlFor="link" className="sr-only">Link</Label>
                      <Input
                        id="link"
                        defaultValue={window.location.href}
                        readOnly
                      />
                    </div>
                    <Button
                      type="submit"
                      size="sm"
                      className="px-3"
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        toast({
                          title: "Link copied",
                          description: "Video link copied to clipboard",
                        });
                      }}
                    >
                      <span className="sr-only">Copy</span>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-4 mt-4">
                    <p className="text-sm text-muted-foreground">Share on:</p>
                    <div className="flex gap-4">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 rounded-full"
                        onClick={() => {
                          const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${video.title}`)}&url=${encodeURIComponent(window.location.href)}`;
                          window.open(twitterUrl, '_blank');
                        }}
                      >
                        <TwitterIcon className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 rounded-full"
                        onClick={() => {
                          const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
                          window.open(fbUrl, '_blank');
                        }}
                      >
                        <FacebookIcon className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 rounded-full"
                        onClick={() => {
                          const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`;
                          window.open(linkedInUrl, '_blank');
                        }}
                      >
                        <LinkedinIcon className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 rounded-full"
                        onClick={() => {
                          const mailtoUrl = `mailto:?subject=${encodeURIComponent(`Check out this video: ${video.title}`)}&body=${encodeURIComponent(`I thought you might like this video: ${window.location.href}`)}`;
                          window.location.href = mailtoUrl;
                        }}
                      >
                        <MailIcon className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 rounded-full"
                        onClick={() => {
                          const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out this video: ${video.title} ${window.location.href}`)}`;
                          window.open(whatsappUrl, '_blank');
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
                        </svg>
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 rounded-full"
                        onClick={() => {
                          const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(`Check out this video: ${video.title}`)}`;
                          window.open(telegramUrl, '_blank');
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.287 5.906c-.778.324-2.334.994-4.666 2.01-.378.15-.577.298-.595.442-.03.243.275.339.69.47l.175.055c.408.133.958.288 1.243.294.26.006.549-.1.868-.32 2.179-1.471 3.304-2.214 3.374-2.23.05-.012.12-.026.166.016.047.041.042.12.037.141-.03.129-1.227 1.241-1.846 1.817-.193.18-.33.307-.358.336a8.154 8.154 0 0 1-.188.186c-.38.366-.664.64.015 1.088.327.216.589.393.85.571.284.194.568.387.936.629.093.06.183.125.27.187.331.236.63.448.997.414.214-.02.435-.22.547-.82.265-1.417.786-4.486.906-5.751a1.426 1.426 0 0 0-.013-.315.337.337 0 0 0-.114-.217.526.526 0 0 0-.31-.093c-.3.005-.763.166-2.984 1.09z"/>
                        </svg>
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button 
                variant="ghost" 
                className={`flex items-center gap-1 h-9 px-2 sm:px-3 ${(savedData?.isSaved || video.userSaved) ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400' : ''}`}
                onClick={handleSaveVideo}
                disabled={saveVideoMutation.isPending || unsaveVideoMutation.isPending}
              >
                <Bookmark className={`h-4 w-4 sm:h-5 sm:w-5 ${(savedData?.isSaved || video.userSaved) ? 'fill-green-600 dark:fill-green-400' : ''}`} />
                <span className="text-xs sm:text-sm">{(savedData?.isSaved || video.userSaved) ? 'Saved' : 'Save'}</span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <MoreHorizontal className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => window.open(`/report?v=${videoId}`, '_blank')}>
                    <Flag className="h-4 w-4 mr-2" />
                    <span>Report</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    const element = document.createElement('textarea');
                    element.value = window.location.href;
                    document.body.appendChild(element);
                    element.select();
                    document.execCommand('copy');
                    document.body.removeChild(element);
                    toast({
                      title: "Link copied",
                      description: "Video link copied to clipboard",
                    });
                  }}>
                    <LinkIcon className="h-4 w-4 mr-2" />
                    <span>Copy link</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    const startTime = Math.floor(document.querySelector('video')?.currentTime || 0);
                    const element = document.createElement('textarea');
                    element.value = `${window.location.href}&t=${startTime}`;
                    document.body.appendChild(element);
                    element.select();
                    document.execCommand('copy');
                    document.body.removeChild(element);
                    toast({
                      title: "Link copied",
                      description: "Video link with timestamp copied to clipboard",
                    });
                  }}>
                    <Clock className="h-4 w-4 mr-2" />
                    <span>Copy at current time</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          {/* Channel Info & Description */}
          <div className="mt-4 border-t border-b border-border py-4 overflow-hidden">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <Link href={`/channel/${video.user?.username}`} className="flex items-center">
                <Avatar className="w-10 h-10 sm:w-12 sm:h-12">
                  <AvatarImage 
                    src={video.user?.avatar} 
                    alt={video.user?.displayName} 
                  />
                  <AvatarFallback>
                    <User className="h-5 w-5 sm:h-6 sm:w-6" />
                  </AvatarFallback>
                </Avatar>
                <div className="ml-3 max-w-[calc(100vw-7rem)] sm:max-w-none">
                  <h3 className="font-medium text-foreground text-base sm:text-lg truncate">{video.user?.displayName}</h3>
                  <p className="text-muted-foreground text-xs sm:text-sm">
                    {video.user?.subscribers ? formatViews(video.user.subscribers) : 0} subscribers
                  </p>
                </div>
              </Link>
              {user && video.userId !== user.id && (
                <Button 
                  className="mt-4 md:mt-0" 
                  variant={subscriptionData?.isSubscribed ? "outline" : "default"} 
                  size="sm"
                  onClick={handleSubscribe}
                  disabled={subscribeMutation.isPending || subscriptionData?.isSubscribed}
                >
                  {subscriptionData?.isSubscribed ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" /> 
                      Subscribed
                    </div>
                  ) : (
                    "Subscribe"
                  )}
                </Button>
              )}
            </div>
            
            <div className="mt-4 text-foreground text-xs sm:text-sm">
              <p className="mb-2 whitespace-pre-line break-words">
                {video.description}
              </p>
              <Button variant="link" className="px-0 h-auto text-xs sm:text-sm">Show more</Button>
            </div>
          </div>
          
          {/* Comments Section */}
          <CommentSection videoId={videoId} />
        </div>
      </div>
      
      {/* Recommendations Column */}
      <div className="lg:col-span-1">
        <h3 className="text-lg font-medium mb-4">Recommended videos</h3>
        <RecommendedVideos currentVideoId={videoId} />
      </div>
    </div>
  );
}

function VideoPageSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 w-full overflow-x-hidden animate-pulse">
      <div className="lg:col-span-2 w-full">
        {/* Video Player Placeholder */}
        <div className="bg-muted aspect-video rounded-xl"></div>
        
        {/* Video Info Placeholder */}
        <div className="mt-4 w-full">
          <Skeleton className="h-8 w-full mb-3" />
          
          <div className="flex flex-col md:flex-row justify-between mt-3">
            <Skeleton className="h-5 w-32" />
            <div className="flex flex-wrap gap-2 mt-3 md:mt-0">
              <Skeleton className="h-9 w-16 sm:w-20" />
              <Skeleton className="h-9 w-16 sm:w-20" />
              <Skeleton className="h-9 w-16 sm:w-20" />
              <Skeleton className="h-9 w-16 sm:w-20" />
              <Skeleton className="h-9 w-9" />
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <div className="flex items-center">
              <Skeleton className="h-10 w-10 sm:h-12 sm:w-12 rounded-full" />
              <div className="ml-3">
                <Skeleton className="h-5 w-32 mb-1" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <Skeleton className="h-8 w-24 mt-4 md:mt-0" />
          </div>
          
          <Skeleton className="h-4 w-full my-2" />
          <Skeleton className="h-4 w-full my-2" />
          <Skeleton className="h-4 w-3/4 my-2" />
          
          <Separator className="my-4" />
          
          <Skeleton className="h-6 w-32 mb-4" />
          
          {/* Comments Placeholder */}
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex space-x-3 mb-6">
              <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <Skeleton className="h-5 w-40 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Recommendations Placeholder */}
      <div className="lg:col-span-1 w-full">
        <Skeleton className="h-6 w-48 mb-4" />
        
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex space-x-2 mb-4 w-full">
            <Skeleton className="w-32 sm:w-40 h-20 sm:h-24 rounded-lg flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-3 w-3/4 mb-1" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
