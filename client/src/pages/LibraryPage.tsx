import { useQuery } from '@tanstack/react-query';

import VideoGrid from '@/components/VideoGrid';
import { Video } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { Link } from 'wouter';
import { Clock, ThumbsUp, PlaySquare, History, BookmarkCheck } from 'lucide-react';

export default function LibraryPage() {
  const { user } = useAuth();
  
  const { data: likedVideos, isLoading: isLoadingLiked } = useQuery<Video[]>({
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
  
  const { data: watchLaterVideos, isLoading: isLoadingWatchLater } = useQuery<Video[]>({
    queryKey: ['/api/users/me/watch-later'],
    enabled: !!user
  });
  
  const { data: historyVideos, isLoading: isLoadingHistory } = useQuery<Video[]>({
    queryKey: ['/api/users/me/history'],
    enabled: !!user
  });

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-6">
        <h2 className="text-2xl font-bold mb-4">Sign in to access your library</h2>
        <p className="text-muted-foreground mb-6">Keep track of your liked videos, playlists, and more</p>
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
      <h1 className="text-2xl font-bold mb-6">Library</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <LibrarySection 
          title="History" 
          icon={<History className="h-5 w-5" />}
          videos={historyVideos || []}
          isLoading={isLoadingHistory}
          emptyMessage="No watch history yet"
          viewAllLink="/history"
        />
        
        <LibrarySection 
          title="Watch Later" 
          icon={<Clock className="h-5 w-5" />}
          videos={watchLaterVideos || []}
          isLoading={isLoadingWatchLater}
          emptyMessage="No videos added to watch later"
          viewAllLink="/watch-later"
        />
        
        <LibrarySection 
          title="Liked Videos" 
          icon={<ThumbsUp className="h-5 w-5" />}
          videos={likedVideos || []}
          isLoading={isLoadingLiked}
          emptyMessage="No liked videos yet"
          viewAllLink="/liked-videos"
        />
        
        <LibrarySection 
          title="Your Videos" 
          icon={<PlaySquare className="h-5 w-5" />}
          videos={user ? [] : []}
          isLoading={false}
          emptyMessage="No uploaded videos yet"
          viewAllLink={`/channel/${user?.username}`}
        />
      </div>
    </div>
  );
}

interface LibrarySectionProps {
  title: string;
  icon: React.ReactNode;
  videos: Video[];
  isLoading: boolean;
  emptyMessage: string;
  viewAllLink: string;
}

function LibrarySection({ title, icon, videos, isLoading, emptyMessage, viewAllLink }: LibrarySectionProps) {
  const displayVideos = videos.slice(0, 4);
  
  return (
    <div className="border rounded-md p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-lg font-medium">{title}</h2>
        </div>
        {videos.length > 0 && (
          <Link href={viewAllLink}>
            <a className="text-primary text-sm">View All</a>
          </Link>
        )}
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <BookmarkCheck className="h-8 w-8 animate-pulse text-muted-foreground" />
        </div>
      ) : videos.length > 0 ? (
        <VideoGrid videos={displayVideos} className="grid-cols-1 md:grid-cols-2 gap-3" />
      ) : (
        <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
          <BookmarkCheck className="h-10 w-10 mb-2" />
          <p>{emptyMessage}</p>
        </div>
      )}
    </div>
  );
}