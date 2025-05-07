import { useQuery } from '@tanstack/react-query';
import VideoCard from './VideoCard';
import { Video } from '@/lib/types';

interface RecommendedVideosProps {
  currentVideoId: number;
}

export default function RecommendedVideos({ currentVideoId }: RecommendedVideosProps) {
  // Fetch recommended videos
  const { data: recommendedVideos, isLoading } = useQuery<Video[]>({
    queryKey: ['/api/videos'],
  });
  
  // Filter out the current video and limit to 6 videos
  const filteredVideos: Video[] = recommendedVideos
    ? recommendedVideos.filter(video => video.id !== currentVideoId).slice(0, 6)
    : [];
    
  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex space-x-2">
            <div className="w-40 h-24 bg-muted rounded-lg"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-3 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {filteredVideos.map(video => (
        <VideoCard key={video.id} video={video} isRecommended />
      ))}
    </div>
  );
}
