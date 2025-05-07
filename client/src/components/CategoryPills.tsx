import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Category } from '@/lib/types';

interface CategoryPillsProps {
  selectedCategory: string;
  onSelectCategory: (categoryName: string) => void;
}

export default function CategoryPills({ 
  selectedCategory, 
  onSelectCategory 
}: CategoryPillsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(false);
  
  // Use query to get categories from the API
  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });
  
  // Use categories without adding "All" since it's already in our database
  const allCategories: Category[] = categories || [];
  
  // Update scroll buttons visibility when container resizes or categories load
  useEffect(() => {
    const checkScroll = () => {
      if (!containerRef.current) return;
      
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
      setShowLeftButton(scrollLeft > 0);
      setShowRightButton(scrollLeft + clientWidth < scrollWidth);
    };
    
    const container = containerRef.current;
    checkScroll();
    
    // Add resize observer
    const resizeObserver = new ResizeObserver(checkScroll);
    if (container) {
      resizeObserver.observe(container);
      container.addEventListener('scroll', checkScroll);
    }
    
    return () => {
      if (container) {
        resizeObserver.unobserve(container);
        container.removeEventListener('scroll', checkScroll);
      }
    };
  }, [categories]); // Re-run when categories change
  
  // Scroll container left/right
  const scrollContainer = (direction: 'left' | 'right') => {
    if (!containerRef.current) return;
    
    const { clientWidth } = containerRef.current;
    const scrollAmount = direction === 'left' ? -clientWidth / 2 : clientWidth / 2;
    
    containerRef.current.scrollBy({
      left: scrollAmount,
      behavior: 'smooth'
    });
  };
  
  return (
    <div className="relative">
      {showLeftButton && (
        <Button 
          variant="outline" 
          size="icon" 
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-full bg-background/80 backdrop-blur-sm"
          onClick={() => scrollContainer('left')}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}
      
      <div 
        ref={containerRef}
        className="overflow-x-auto pb-3 mb-4 flex gap-2 scrollbar-hide"
      >
        {isLoading ? (
          // Loading state
          Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-10 bg-muted animate-pulse rounded-full w-20"></div>
          ))
        ) : (
          // Render categories
          allCategories.map(category => (
            <Button
              key={category.id}
              variant={selectedCategory === category.name ? "default" : "outline"}
              className="whitespace-nowrap px-4 py-1.5 rounded-full"
              onClick={() => onSelectCategory(category.name)}
            >
              {category.name}
            </Button>
          ))
        )}
      </div>
      
      {showRightButton && (
        <Button 
          variant="outline" 
          size="icon" 
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-full bg-background/80 backdrop-blur-sm"
          onClick={() => scrollContainer('right')}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
