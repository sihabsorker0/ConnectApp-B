import { useUpload } from "@/hooks/use-upload";
import { X, CheckCircle, AlertCircle, ExternalLink } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";

export function UploadProgress() {
  const { uploads, cancelUpload, viewUpload } = useUpload();
  const [expanded, setExpanded] = useState(true);

  // Filter out completed uploads that are older than 10 seconds
  const activeUploads = uploads.filter(upload => 
    !upload.completed || 
    (upload.completed && Date.now() - parseInt(upload.id) < 10000)
  );

  if (activeUploads.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 bg-card rounded-lg shadow-lg border border-border overflow-hidden">
      <div className="px-4 py-3 bg-muted flex items-center justify-between cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="font-medium flex items-center gap-2">
          <span>Uploads</span>
          <span className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5">
            {activeUploads.length}
          </span>
        </div>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
          {expanded ? <X className="h-4 w-4" /> : <span className="h-4 w-4">+</span>}
        </Button>
      </div>
      
      {expanded && (
        <div className="max-h-80 overflow-y-auto p-3 space-y-3">
          {activeUploads.map(upload => (
            <div key={upload.id} className="bg-muted/50 rounded-md p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium truncate flex-1">{upload.title}</div>
                {!upload.completed && !upload.error && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0"
                    onClick={() => cancelUpload(upload.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
              
              {!upload.error ? (
                <>
                  <Progress value={upload.progress} className="h-2 mb-2" />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{upload.completed ? 'Completed' : `${upload.progress}%`}</span>
                    {upload.completed && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 py-0 px-2 text-xs flex items-center gap-1 text-primary"
                        onClick={() => viewUpload(upload.id)}
                      >
                        <span>View</span>
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2 text-destructive text-xs">
                  <AlertCircle className="h-3 w-3" />
                  <span>Upload failed: {upload.errorMessage || 'Unknown error'}</span>
                </div>
              )}
              
              {upload.completed && !upload.error && (
                <div className="flex items-center gap-1 text-primary text-xs mt-1">
                  <CheckCircle className="h-3 w-3" />
                  <span>Upload complete</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}