import { useQuery } from '@tanstack/react-query';

import VideoGrid from '@/components/VideoGrid';
import { Video } from '@/lib/types';
import { ThumbsUp } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Link } from 'wouter';

export default function LikedVideosPage() {
  const { user } = useAuth();
  
  const { data: videos, isLoading } = useQuery<Video[]>({
    queryKey: ['liked-videos'],
    queryFn: async () => {
      const res = await fetch('/api/users/me/liked-videos', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!res.ok) throw new Error('Failed to fetch liked videos');
      return res.json();
    },
    enabled: !!user
  });

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-6">
        <h2 className="text-2xl font-bold mb-4">Sign in to view your liked videos</h2>
        <p className="text-muted-foreground mb-6">Keep track of videos you've liked</p>
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
        <ThumbsUp className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Liked Videos</h1>
      </div>
      
      {!isLoading && videos && videos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <ThumbsUp className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-medium mb-2">No liked videos</h2>
          <p className="text-muted-foreground mb-6">Videos you like will appear here</p>
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