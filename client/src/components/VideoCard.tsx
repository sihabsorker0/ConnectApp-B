import { Link } from 'wouter';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, X } from 'lucide-react';
import { Video } from '@/lib/types';
import { formatViews, formatDuration, formatTimeAgo } from '@/lib/constants';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, Bookmark, Share, Flag } from "lucide-react";

interface VideoCardProps {
  video: Video;
  isRecommended?: boolean;
}

export default function VideoCard({ video, isRecommended = false }: VideoCardProps) {
  const {
    id,
    title,
    thumbnailUrl,
    views,
    createdAt,
    duration,
    user
  } = video;

  const navigateToChannel = (e: React.MouseEvent, username: string) => {
    e.preventDefault();
    e.stopPropagation();
    window.location.href = `/channel/${username}`;
  };

  if (isRecommended) {
    return (
      <div className="group">
        <Link href={`/watch?v=${id}`} className="video-card flex space-x-2 cursor-pointer hover:bg-secondary/20 p-2 rounded-lg transition-colors w-full overflow-hidden">
          <div className="flex-shrink-0 w-32 sm:w-40 relative">
            <img 
              src={`${thumbnailUrl}?ixlib=rb-1.2.1&auto=format&fit=crop&w=240&q=80`}
              alt={title} 
              className="w-full h-20 sm:h-24 object-cover rounded-lg" 
            />
            <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 rounded">
              {formatDuration(duration)}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="space-y-0.5 flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium text-sm line-clamp-2 break-words">{title}</h4>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Bookmark className="h-4 w-4 mr-2" />
                        Save to Watch Later
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Share className="h-4 w-4 mr-2" />
                        Share
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <X className="h-4 w-4 mr-2" />
                        Not Interested
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Flag className="h-4 w-4 mr-2" />
                        Report
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                {user && (
              <div
                onClick={(e) => navigateToChannel(e, user.username)}
                className="cursor-pointer text-muted-foreground text-xs mt-1 truncate hover:text-primary"
              >
                {user.displayName}
              </div>
            )}
            <p className="text-muted-foreground text-xs truncate">
              {formatViews(views)} views • {formatTimeAgo(createdAt)}
            </p>
          </div>
          </div>
        </Link>
      </div>
    );
  }

  return (
    <div className="group">
      <Link href={`/watch?v=${id}`} className="block video-card bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all hover:-translate-y-1 w-full">
        <div className="relative aspect-video group">
          <img 
            src={`${thumbnailUrl}?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80`}
            alt={title} 
            className="w-full h-full object-cover" 
          />
          {duration > 0 && (
            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
              {formatDuration(Math.round(duration))}
            </div>
          )}
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-black/60 text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-play"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            </div>
          </div>
        </div>
        <div className="p-2 sm:p-3">
          <div className="flex">
            {user && (
              <div className="flex-shrink-0 mt-1">
                <div 
                  onClick={(e) => navigateToChannel(e, user.username)}
                  className="cursor-pointer"
                >
                  <Avatar className="w-8 h-8 sm:w-9 sm:h-9">
                    <AvatarImage src={`${user.avatar}?ixlib=rb-1.2.1&auto=format&fit=crop&w=48&h=48&q=80`} alt={user.displayName} />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
            )}
            <div className="ml-2 sm:ml-3 min-w-0">
              <div className="space-y-0.5 flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-foreground text-sm sm:text-base line-clamp-2 break-words">{title}</h3>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Bookmark className="h-4 w-4 mr-2" />
                        Save to Watch Later
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Share className="h-4 w-4 mr-2" />
                        Share
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <X className="h-4 w-4 mr-2" />
                        Not Interested
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Flag className="h-4 w-4 mr-2" />
                        Report
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                {user && (
                <div
                  onClick={(e) => navigateToChannel(e, user.username)}
                  className="cursor-pointer text-muted-foreground text-xs sm:text-sm mt-1 truncate hover:text-primary"
                >
                  {user.displayName}
                </div>
              )}
              <p className="text-muted-foreground text-xs sm:text-sm truncate">
                {formatViews(views)} views • {formatTimeAgo(createdAt)}
              </p>
            </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}