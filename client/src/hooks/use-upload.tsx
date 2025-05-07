import { 
  createContext, 
  ReactNode, 
  useContext, 
  useState 
} from "react";
import { useLocation } from "wouter";
import { useToast } from "./use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "./use-auth";

interface UploadProgress {
  id: string;
  title: string;
  progress: number;
  completed: boolean;
  error: boolean;
  errorMessage?: string;
  videoId?: number;
}

interface UploadContextType {
  uploads: UploadProgress[];
  startUpload: (title: string, data: any) => string;
  cancelUpload: (id: string) => void;
  viewUpload: (id: string) => void;
}

export const UploadContext = createContext<UploadContextType | null>(null);

export function UploadProvider({ children }: { children: ReactNode }) {
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const { user } = useAuth();

  const startUpload = (title: string, data: any): string => {
    // Generate unique ID for this upload
    const uploadId = Date.now().toString();
    
    // Add to uploads list
    setUploads(prev => [
      ...prev,
      {
        id: uploadId,
        title,
        progress: 0,
        completed: false,
        error: false
      }
    ]);

    // Create toast notification
    toast({
      title: "Upload started",
      description: `"${title}" is uploading in the background.`,
      duration: 5000,
    });

    // Start the upload process
    const simulateUpload = async () => {
      try {
        // Start progress simulation
        const interval = setInterval(() => {
          setUploads(prev => 
            prev.map(upload => 
              upload.id === uploadId
                ? { 
                    ...upload, 
                    progress: Math.min(upload.progress + 5, 95) 
                  }
                : upload
            )
          );
        }, 200);

        // Send data to server
        const res = await apiRequest('POST', '/api/videos', {
          ...data,
          userId: user?.id,
        });
        
        // Get response data
        const responseData = await res.json();
        
        // Complete the upload
        clearInterval(interval);
        setUploads(prev => 
          prev.map(upload => 
            upload.id === uploadId
              ? { 
                  ...upload, 
                  progress: 100, 
                  completed: true,
                  videoId: responseData.id
                }
              : upload
          )
        );

        // Show success toast
        toast({
          title: "Upload complete",
          description: (
            <div className="flex flex-col">
              <span>"{title}" has been uploaded successfully.</span>
              <span 
                className="text-primary underline cursor-pointer mt-1"
                onClick={() => viewUpload(uploadId)}
              >
                Click to view
              </span>
            </div>
          ),
          duration: 5000,
        });

        // Invalidate queries
        queryClient.invalidateQueries({ queryKey: ['/api/videos'] });

        return responseData;
      } catch (error: any) {
        // Handle error
        setUploads(prev => 
          prev.map(upload => 
            upload.id === uploadId
              ? { 
                  ...upload, 
                  error: true, 
                  errorMessage: error.message 
                }
              : upload
          )
        );

        // Show error toast
        toast({
          title: "Upload failed",
          description: error.message,
          variant: "destructive",
        });
      }
    };

    simulateUpload();
    return uploadId;
  };

  const cancelUpload = (id: string) => {
    setUploads(prev => prev.filter(upload => upload.id !== id));
  };

  const viewUpload = (id: string) => {
    const upload = uploads.find(u => u.id === id);
    if (upload?.videoId) {
      navigate(`/watch?v=${upload.videoId}`);
    }
  };

  return (
    <UploadContext.Provider
      value={{
        uploads,
        startUpload,
        cancelUpload,
        viewUpload
      }}
    >
      {children}
    </UploadContext.Provider>
  );
}

export function useUpload() {
  const context = useContext(UploadContext);
  if (!context) {
    throw new Error("useUpload must be used within an UploadProvider");
  }
  return context;
}