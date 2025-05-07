import { useQuery } from '@tanstack/react-query';

import VideoGrid from '@/components/VideoGrid';
import { Video } from '@/lib/types';
import { Clock } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Link } from 'wouter';

export default function WatchLaterPage() {
  const { user } = useAuth();
  
  const { data: videos, isLoading } = useQuery<Video[]>({
    queryKey: ['/api/users/me/watch-later'],
    enabled: !!user
  });

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-6">
        <h2 className="text-2xl font-bold mb-4">Sign in to view your Watch Later list</h2>
        <p className="text-muted-foreground mb-6">Save videos to watch later</p>
        <Link href="/auth">
          <a className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium">
            Sign In
          </a>
        </Link>
      </div>
    );
  }

  return (
    <div className="container px-4 py-6">
      <div className="flex items-center gap-2 mb-6">
        <Clock className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Watch Later</h1>
      </div>
      
      {!isLoading && videos && videos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Clock className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-medium mb-2">No videos in Watch Later</h2>
          <p className="text-muted-foreground mb-6">Save videos to watch later</p>
          <Link href="/">
            <a className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium">
              Browse Videos
            </a>
          </Link>
        </div>
      ) : (
        <VideoGrid videos={videos || []} isLoading={isLoading} />
      )}
    </div>
  );
}