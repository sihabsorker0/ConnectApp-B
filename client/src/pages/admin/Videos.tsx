import { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatViews, formatTimeAgo } from '@/lib/constants';
import { Video } from '@/lib/types';
import { Pencil, Trash2, Search, Filter, Upload, X, Eye, ThumbsUp, MessageSquare } from 'lucide-react';

export default function AdminVideos() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch videos from API
  const { data: videos, isLoading: isLoadingVideos } = useQuery<Video[]>({
    queryKey: ['/api/videos'],
  });

  // Filter and search videos
  const filteredVideos = videos ? videos.filter((video: Video) => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (video.description ? video.description.toLowerCase().includes(searchTerm.toLowerCase()) : false) || 
                          (video.user ? video.user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) : false);
    
    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'trending') return matchesSearch && (video.views || 0) > 1000000;
    if (filterStatus === 'recent') {
      const videoDate = new Date(video.createdAt);
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return matchesSearch && videoDate > sevenDaysAgo;
    }
    return matchesSearch;
  }) : [];

  // Pagination
  const totalPages = Math.ceil(filteredVideos.length / itemsPerPage);
  const currentVideos = filteredVideos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle pagination
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Handle video deletion
  const handleDeleteVideo = (videoId: number) => {
    // In a real app, this would call an API endpoint to delete the video
    console.log(`Delete video with ID: ${videoId}`);
    // Then refetch the videos list or update the state
  };

  return (
    <div className="p-4 space-y-6 overflow-y-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Video Management</h1>
          <p className="text-muted-foreground">Manage all videos on the platform</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button className="flex items-center gap-1" onClick={() => setLocation('/admin/videos/new')}>
            <Upload className="h-4 w-4" /> Upload New Video
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search videos by title, description, or channel..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Videos</SelectItem>
                  <SelectItem value="trending">Trending</SelectItem>
                  <SelectItem value="recent">Recently Uploaded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Videos Table */}
      <Card>
        <CardHeader>
          <CardTitle>Videos</CardTitle>
          <CardDescription>
            {isLoadingVideos ? 'Loading videos...' : `Found ${filteredVideos.length} videos matching your criteria.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingVideos ? (
            <div className="flex items-center justify-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-md border">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-muted">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Video</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Creator</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Stats</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Uploaded</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-card divide-y divide-border">
                    {currentVideos.map((video: Video) => (
                      <tr key={video.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-20 w-32 relative">
                              <img 
                                src={`${video.thumbnailUrl}?ixlib=rb-1.2.1&auto=format&fit=crop&w=240&q=80`}
                                alt={video.title} 
                                className="h-full w-full object-cover rounded-md" 
                              />
                            </div>
                            <div className="ml-4 max-w-xs">
                              <div className="text-sm font-medium text-foreground line-clamp-2">{video.title}</div>
                              <div className="text-sm text-muted-foreground line-clamp-1">{video.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-foreground">{video.user?.displayName}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col space-y-1">
                            <div className="flex items-center">
                              <Eye className="h-4 w-4 text-muted-foreground mr-1" />
                              <span className="text-sm text-muted-foreground">{formatViews(video.views)}</span>
                            </div>
                            <div className="flex items-center">
                              <ThumbsUp className="h-4 w-4 text-muted-foreground mr-1" />
                              <span className="text-sm text-muted-foreground">{formatViews(video.likes)}</span>
                            </div>
                            <div className="flex items-center">
                              <MessageSquare className="h-4 w-4 text-muted-foreground mr-1" />
                              <span className="text-sm text-muted-foreground">428</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-muted-foreground">{formatTimeAgo(video.createdAt)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => setLocation(`/admin/videos/edit/${video.id}`)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 px-2 text-red-500 hover:text-red-700 hover:bg-red-100" onClick={() => handleDeleteVideo(video.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredVideos.length)}</span> of <span className="font-medium">{filteredVideos.length}</span> results
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={page === currentPage ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        className="hidden sm:inline-flex"
                      >
                        {page}
                      </Button>
                    ))}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
