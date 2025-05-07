import { Video } from '@/lib/types';
import VideoCard from './VideoCard';

interface VideoGridProps {
  videos: Video[];
  isLoading?: boolean;
  className?: string;
}

export default function VideoGrid({ videos, isLoading = false, className = '' }: VideoGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <VideoCardSkeleton key={i} />
        ))}
      </div>
    );
  }
  
  if (!videos || videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
          <rect x="2" y="6" width="20" height="12" rx="2" ry="2"></rect>
          <path d="m10 16 4-4-4-4v8Z"></path>
        </svg>
        <h3 className="mt-4 text-xl font-medium">No videos found</h3>
        <p className="text-muted-foreground">Try changing your search or filter criteria</p>
      </div>
    );
  }
  
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ${className}`}>
      {videos.map(video => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  );
}

// Skeleton loader for VideoCard
function VideoCardSkeleton() {
  return (
    <div className="bg-card rounded-xl overflow-hidden shadow-sm animate-pulse">
      <div className="relative aspect-video bg-muted"></div>
      <div className="p-3">
        <div className="flex">
          <div className="flex-shrink-0 mt-1">
            <div className="w-9 h-9 rounded-full bg-muted"></div>
          </div>
          <div className="ml-3 space-y-2">
            <div className="h-4 bg-muted rounded w-full"></div>
            <div className="h-3 bg-muted rounded w-3/4"></div>
            <div className="h-3 bg-muted rounded w-1/2"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
