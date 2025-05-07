import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import VideoGrid from '@/components/VideoGrid';
import CategoryPills from '@/components/CategoryPills';
import { Video } from '@/lib/types';

export default function ExplorePage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const categoryId = selectedCategory === 'All' ? undefined : 
    parseInt(selectedCategory);
  
  const { data: videos, isLoading } = useQuery<Video[]>({
    queryKey: ['/api/videos', { categoryId }],
  });

  return (
    <div className="container px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Explore</h1>
      <div className="sticky top-14 bg-background z-10 pb-4">
        <CategoryPills 
          selectedCategory={selectedCategory} 
          onSelectCategory={(category) => setSelectedCategory(category)} 
        />
      </div>
      <VideoGrid videos={videos || []} isLoading={isLoading} />
    </div>
  );
}