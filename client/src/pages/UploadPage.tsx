import { useState } from 'react';
import { useLocation } from 'wouter';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { Upload, X, AlertCircle, Loader2 } from 'lucide-react';

import { useAuth } from '@/hooks/use-auth';
import { useUpload } from '@/hooks/use-upload';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';

// Form validation schema
const uploadSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long'),
  description: z.string().min(10, 'Description must be at least 10 characters long'),
  videoUrl: z.string().url('Please enter a valid video URL'),
  thumbnailUrl: z.string().url('Please enter a valid thumbnail URL'),
  duration: z.number().min(1, 'Duration must be at least 1 second'),
  categoryId: z.string().transform(val => parseInt(val, 10)),
});

type UploadFormValues = z.infer<typeof uploadSchema>;

export default function UploadPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const { startUpload } = useUpload();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');

  // Fetch categories
  const { data: categories = [], isLoading: categoriesLoading } = useQuery<{id: number, name: string}[]>({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      const res = await fetch('/api/categories');
      if (!res.ok) throw new Error('Failed to fetch categories');
      return res.json();
    }
  });

  // Upload form
  const form = useForm<UploadFormValues>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      title: '',
      description: '',
      videoUrl: '',
      thumbnailUrl: '',
      duration: 0,
      categoryId: '1', // Default to "All" category
    },
  });

  const onSubmit = (data: UploadFormValues) => {
    setIsSubmitting(true);

    // Start background upload
    startUpload(data.title, {
      ...data,
      categoryId: parseInt(data.categoryId),
      userId: user?.id
    });

    // Show a temporary toast
    toast({
      title: 'Upload started',
      description: 'Your video is uploading in the background. You can now navigate away from this page.',
    });

    // Reset form
    form.reset();
    setPreviewUrl('');
    setIsSubmitting(false);

    // Navigate to homepage
    navigate('/');
  };

  // Handle thumbnail preview
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const thumbnailUrl = e.target.value;
    setPreviewUrl(thumbnailUrl);
    form.setValue('thumbnailUrl', thumbnailUrl);
  };

  // Handle duration calculation from video URL
  const handleVideoDurationChange = (videoUrl: string) => {
    // ***This needs to be replaced with actual duration calculation logic***
    // For now, using a placeholder random duration.  This is crucial for a functional upload.
    const randomDuration = Math.floor(Math.random() * 540) + 60;
    form.setValue('duration', randomDuration);
  };

  if (!user) {
    return (
      <div className="container max-w-4xl py-10">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication required</AlertTitle>
          <AlertDescription>
            You need to be logged in to upload videos. Please sign in or create an account.
          </AlertDescription>
          <div className="mt-4">
            <Button onClick={() => navigate('/auth')}>Sign In / Register</Button>
          </div>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Upload className="h-6 w-6" />
            Upload New Video
          </CardTitle>
          <CardDescription>
            Share your content with the world. All fields are required unless marked optional.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Thumbnail preview */}
              {previewUrl && (
                <div className="relative">
                  <div className="aspect-video overflow-hidden rounded-lg border border-border mb-4">
                    <img 
                      src={previewUrl} 
                      alt="Video thumbnail preview" 
                      className="w-full h-full object-cover"
                      onError={() => setPreviewUrl('')}
                    />
                  </div>
                  <Button 
                    type="button"
                    variant="outline"
                    size="icon"
                    className="absolute top-2 right-2 bg-background/80 hover:bg-background"
                    onClick={() => {
                      setPreviewUrl('');
                      form.setValue('thumbnailUrl', '');
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Title field */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Video Title</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter a compelling title" 
                        {...field} 
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description field */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your video" 
                        className="resize-y min-h-24" 
                        {...field} 
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Video URL field */}
              <FormField
                control={form.control}
                name="videoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Video URL</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://www.youtube.com/watch?v=VIDEO_ID" 
                        {...field} 
                        onChange={(e) => {
                          field.onChange(e);
                          if (e.target.value) {
                            handleVideoDurationChange(e.target.value);
                          }
                        }}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <div className="text-sm text-muted-foreground mt-1">
                      For YouTube videos, use full YouTube URL (e.g., https://youtube.com/watch?v=abcdef). 
                      For direct videos, use a direct link to MP4, WebM, or other video files.
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Thumbnail URL field */}
              <FormField
                control={form.control}
                name="thumbnailUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thumbnail URL</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://example.com/thumbnail.jpg" 
                        onChange={handleThumbnailChange}
                        value={field.value}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Category selection */}
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={categoriesLoading || isSubmitting}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories?.map((category) => (
                            <SelectItem key={category.id} value={String(category.id)}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Duration field (hidden but required) */}
              <input type="hidden" {...form.register('duration')} />

              {/* Submit button */}
              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Upload Video'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>

        <CardFooter className="border-t flex flex-col sm:flex-row items-center justify-between gap-4 pt-6">
          <Button variant="outline" onClick={() => navigate('/')}>
            Cancel
          </Button>
          <div className="text-sm text-muted-foreground">
            By uploading a video, you agree to our <span className="underline cursor-pointer">Terms of Service</span> and <span className="underline cursor-pointer">Community Guidelines</span>.
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}