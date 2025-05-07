import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import CategoryPills from '@/components/CategoryPills';
import VideoGrid from '@/components/VideoGrid';
import { Video, Category } from '@/lib/types';

export default function Home() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(1); // Default to "All" (ID: 1)
  
  // Fetch categories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      const res = await fetch('/api/categories');
      if (!res.ok) throw new Error('Failed to fetch categories');
      return res.json();
    }
  });
  
  // Get the selected category name for display
  const selectedCategory = categories.find(cat => cat.id === selectedCategoryId)?.name || 'All';
  
  // Fetch videos from the server based on selected category
  const { data: videos = [], isLoading: isLoadingVideos } = useQuery<Video[]>({
    queryKey: ['/api/videos', selectedCategoryId],
    queryFn: async () => {
      const url = selectedCategoryId === 1 
        ? '/api/videos' 
        : `/api/videos?categoryId=${selectedCategoryId}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch videos');
      return res.json();
    }
  });
  
  // Handle category selection change
  const handleCategoryChange = (categoryName: string) => {
    const category = categories.find(cat => cat.name === categoryName);
    if (category) {
      setSelectedCategoryId(category.id);
    } else {
      // Default to "All" if category not found
      setSelectedCategoryId(1);
    }
  };
  
  return (
    <div>
      <CategoryPills 
        selectedCategory={selectedCategory} 
        onSelectCategory={handleCategoryChange} 
      />
      
      <VideoGrid 
        videos={videos} 
        isLoading={isLoadingVideos} 
      />
    </div>
  );
}
