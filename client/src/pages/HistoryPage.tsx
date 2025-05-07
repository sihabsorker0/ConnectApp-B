import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

import VideoGrid from '@/components/VideoGrid';
import { Video } from '@/lib/types';
import { History, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useMutation } from '@tanstack/react-query';

export default function HistoryPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: videos, isLoading } = useQuery<Video[]>({
    queryKey: ['/api/users/me/history'],
    enabled: !!user
  });

  const { mutate: clearHistory, isPending: isClearing } = useMutation({
    mutationFn: async () => {
      await apiRequest('DELETE', '/api/users/me/history');
    },
    onSuccess: () => {
      queryClient.setQueryData(['/api/users/me/history'], []);
      toast({
        title: "History cleared",
        description: "Your watch history has been cleared successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to clear watch history. " + error.message,
        variant: "destructive"
      });
    }
  });

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-6">
        <h2 className="text-2xl font-bold mb-4">Sign in to view your history</h2>
        <p className="text-muted-foreground mb-6">Keep track of what you watch</p>
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
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <History className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Watch History</h1>
        </div>
        
        {videos && videos.length > 0 && (
          <Button 
            variant="outline" 
            onClick={() => clearHistory()}
            disabled={isClearing}
            className="gap-1"
          >
            <Trash2 className="h-4 w-4" />
            Clear History
          </Button>
        )}
      </div>
      
      {!isLoading && videos && videos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <History className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-medium mb-2">No watch history</h2>
          <p className="text-muted-foreground mb-6">Videos you watch will appear here</p>
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