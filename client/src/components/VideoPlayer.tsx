import { useRef, useEffect, useState } from 'react';
import ReactPlayer from 'react-player';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  Play, Pause, Volume2, VolumeX, Maximize, Minimize,
  Settings, Subtitles, SkipBack, SkipForward
} from 'lucide-react';
import { formatDuration } from '@/lib/constants';

interface VideoPlayerProps {
  url: string;
  title: string;
}

export default function VideoPlayer({ url, title }: VideoPlayerProps) {
  const playerRef = useRef<ReactPlayer>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const [progress, setProgress] = useState({
    played: 0,
    loaded: 0,
    playedSeconds: 0,
    loadedSeconds: 0
  });
  const [duration, setDuration] = useState(0);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Detect if it's a YouTube URL (including video ID)
  const isYouTubeVideo = url.includes('youtube.com') || 
                          url.includes('youtu.be') || 
                          url.includes('googlevideo.com');

  // Hide controls after inactivity
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const handleActivity = () => {
      setIsControlsVisible(true);
      clearTimeout(timeout);
      
      if (isPlaying) {
        timeout = setTimeout(() => {
          setIsControlsVisible(false);
        }, 3000);
      }
    };
    
    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleActivity);
      container.addEventListener('mousedown', handleActivity);
      container.addEventListener('touchstart', handleActivity);
    }
    
    return () => {
      clearTimeout(timeout);
      if (container) {
        container.removeEventListener('mousemove', handleActivity);
        container.removeEventListener('mousedown', handleActivity);
        container.removeEventListener('touchstart', handleActivity);
      }
    };
  }, [isPlaying]);

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Handle progress updates
  const handleProgress = (state: any) => {
    setProgress(state);
  };

  // Handle seeking
  const handleSeek = (value: number[]) => {
    playerRef.current?.seekTo(value[0] / 100);
  };

  // Format current time display
  const formatCurrentTime = () => {
    return formatDuration(Math.floor(progress.playedSeconds));
  };

  // Handle player error
  const handlePlayerError = (error: any) => {
    console.error("Video player error:", error);
    setError("Failed to load video. Please check the URL and try again.");
  };

  return (
    <div 
      ref={containerRef} 
      className="relative bg-black rounded-xl overflow-hidden shadow-lg group"
      onMouseEnter={() => setIsControlsVisible(true)}
      onMouseLeave={() => isPlaying && setIsControlsVisible(false)}
    >
      {/* Show error message if needed */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-10 p-4">
          <div className="text-white text-center max-w-md">
            <h3 className="text-xl font-bold mb-2">Playback Error</h3>
            <p>{error}</p>
            <p className="mt-4 text-sm opacity-80">
              If this is a YouTube video, please upload using a proper YouTube URL (e.g., https://youtube.com/watch?v=VIDEO_ID)
            </p>
          </div>
        </div>
      )}

      {/* ReactPlayer for all video types */}
      <ReactPlayer
        ref={playerRef}
        url={url}
        width="100%"
        height="100%"
        playing={isPlaying}
        volume={volume}
        muted={isMuted}
        className="aspect-video"
        onProgress={handleProgress}
        onDuration={setDuration}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onClick={() => setIsPlaying(!isPlaying)}
        onError={handlePlayerError}
        config={{
          youtube: {
            playerVars: { 
              modestbranding: 1,
              playsinline: 1,
              controls: 0,
              disablekb: 1,
              showinfo: 0,
              rel: 0,
              iv_load_policy: 3
            }
          },
          file: {
            attributes: {
              controlsList: 'nodownload',
              disablePictureInPicture: true,
            }
          }
        }}
      />
      
      {/* Custom Video Controls */}
      <div 
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
          isControlsVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Progress bar */}
        <div className="mb-3">
          <Slider
            value={[progress.played * 100]}
            min={0}
            max={100}
            step={0.1}
            onValueChange={handleSeek}
            className="video-progress h-1.5 hover:h-2.5 transition-all"
          />
        </div>
        
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-1 sm:space-x-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-white/20 h-8 w-8 sm:h-10 sm:w-10" 
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause className="h-4 w-4 sm:h-5 sm:w-5" /> : <Play className="h-4 w-4 sm:h-5 sm:w-5" />}
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-white/20 h-8 w-8 sm:h-10 sm:w-10 hidden sm:flex"
              onClick={() => playerRef.current?.seekTo(progress.playedSeconds - 10)}
            >
              <SkipBack className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-white/20 h-8 w-8 sm:h-10 sm:w-10 hidden sm:flex"
              onClick={() => playerRef.current?.seekTo(progress.playedSeconds + 10)}
            >
              <SkipForward className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            
            <div className="relative hidden sm:block" onMouseEnter={() => setShowVolumeSlider(true)} onMouseLeave={() => setShowVolumeSlider(false)}>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white hover:bg-white/20 h-8 w-8 sm:h-10 sm:w-10" 
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted || volume === 0 ? <VolumeX className="h-4 w-4 sm:h-5 sm:w-5" /> : <Volume2 className="h-4 w-4 sm:h-5 sm:w-5" />}
              </Button>
              
              {showVolumeSlider && (
                <div className="absolute bottom-full left-2 w-24 p-2 bg-background/80 backdrop-blur-sm rounded shadow-lg">
                  <Slider
                    value={[isMuted ? 0 : volume * 100]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={(value) => {
                      setVolume(value[0] / 100);
                      if (value[0] > 0 && isMuted) setIsMuted(false);
                    }}
                    className="h-1.5"
                  />
                </div>
              )}
            </div>
            
            <span className="text-white text-xs sm:text-sm">
              {formatCurrentTime()} / {formatDuration(Math.floor(duration))}
            </span>
          </div>
          
          <div className="flex items-center space-x-1 sm:space-x-2">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 h-8 w-8 sm:h-10 sm:w-10 hidden sm:flex">
              <Subtitles className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 h-8 w-8 sm:h-10 sm:w-10 hidden sm:flex">
              <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-white/20 h-8 w-8 sm:h-10 sm:w-10" 
              onClick={toggleFullscreen}
            >
              {isFullscreen ? <Minimize className="h-4 w-4 sm:h-5 sm:w-5" /> : <Maximize className="h-4 w-4 sm:h-5 sm:w-5" />}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Play/Pause overlay */}
      <div 
        className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-200 ${
          isPlaying ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <div className="h-16 w-16 sm:h-20 sm:w-20 bg-black/40 rounded-full flex items-center justify-center">
          <Play className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
        </div>
      </div>
    </div>
  );
}
