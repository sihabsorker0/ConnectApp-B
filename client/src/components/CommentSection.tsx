import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { ThumbsUp, ThumbsDown, Reply, ListOrdered, User } from 'lucide-react';
import { DEFAULT_AVATAR, formatTimeAgo } from '@/lib/constants';
import { Comment } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

interface CommentSectionProps {
  videoId: number;
}

export default function CommentSection({ videoId }: CommentSectionProps) {
  const [commentText, setCommentText] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Fetch comments for the video
  const { data: comments, isLoading } = useQuery<Comment[]>({
    queryKey: [`/api/videos/${videoId}/comments`],
  });
  
  // Default empty array if no comments
  const videoComments: Comment[] = comments || [];
  
  // Mutation to submit a new comment
  const { mutate: submitComment, isPending: isSubmitting } = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('You must be logged in to comment');
      
      const res = await apiRequest('POST', `/api/videos/${videoId}/comments`, {
        content: commentText
      });
      
      return await res.json();
    },
    onSuccess: () => {
      // Clear the input and refetch comments
      setCommentText('');
      // Invalidate query to refetch comments
      queryClient.invalidateQueries({ queryKey: [`/api/videos/${videoId}/comments`] });
    },
    onError: (error: Error) => {
      console.error('Error submitting comment:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit comment",
        variant: "destructive"
      });
    }
  });
  
  const handleSubmitComment = () => {
    if (!commentText.trim()) return;
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to comment on videos",
        variant: "destructive"
      });
      return;
    }
    submitComment();
  };
  
  if (isLoading) {
    return <div className="mt-6 animate-pulse">
      <div className="h-5 bg-muted rounded w-40 mb-6"></div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex space-x-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-muted"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-muted rounded w-40"></div>
            <div className="h-3 bg-muted rounded w-full"></div>
            <div className="h-3 bg-muted rounded w-3/4"></div>
          </div>
        </div>
      ))}
    </div>;
  }
  
  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Comments <span className="text-muted-foreground">
          {videoComments.length}
        </span></h3>
        <Button variant="ghost" size="sm" className="flex items-center gap-1">
          <ListOrdered className="h-4 w-4" />
          <span>ListOrdered by</span>
        </Button>
      </div>
      
      {/* Comment Input */}
      <div className="flex space-x-3 mb-6">
        <Avatar>
          <AvatarImage src={DEFAULT_AVATAR} alt="Your avatar" />
          <AvatarFallback>
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <Textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add a comment..."
            className="min-h-[60px] border-b resize-none focus-visible:ring-0 border-x-0 border-t-0 rounded-none px-0 focus-visible:ring-offset-0"
          />
          
          {commentText && (
            <div className="flex justify-end gap-2 mt-2">
              <Button variant="ghost" onClick={() => setCommentText('')}>
                Cancel
              </Button>
              <Button onClick={handleSubmitComment}>
                Comment
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Comments List */}
      <div className="space-y-6">
        {videoComments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} />
        ))}
        
        <Button variant="outline" className="w-full">
          Show more comments
        </Button>
      </div>
    </div>
  );
}

interface CommentItemProps {
  comment: Comment;
  isReply?: boolean;
}

function CommentItem({ comment, isReply = false }: CommentItemProps) {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Mutation to submit a reply
  const { mutate: submitReply, isPending: isSubmittingReply } = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('You must be logged in to reply');
      
      const res = await apiRequest('POST', `/api/videos/${comment.videoId}/comments`, {
        content: replyText,
        parentId: comment.id
      });
      
      return await res.json();
    },
    onSuccess: () => {
      // Clear the input and hide the reply form
      setReplyText('');
      setShowReplyInput(false);
      // Invalidate query to refetch comments
      queryClient.invalidateQueries({ queryKey: [`/api/videos/${comment.videoId}/comments`] });
    },
    onError: (error: Error) => {
      console.error('Error submitting reply:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit reply",
        variant: "destructive"
      });
    }
  });
  
  const handleSubmitReply = () => {
    if (!replyText.trim()) return;
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to reply to comments",
        variant: "destructive"
      });
      return;
    }
    submitReply();
  };
  
  return (
    <div className={`${isReply ? 'ml-12' : ''}`}>
      <div className="flex space-x-3">
        <Avatar className={isReply ? 'w-8 h-8' : 'w-10 h-10'}>
          {comment.user?.avatar ? (
            <AvatarImage 
              src={comment.user.avatar} 
              alt={comment.user.displayName || 'User'} 
            />
          ) : (
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          )}
        </Avatar>
        <div>
          <div className="flex items-center space-x-2">
            <h4 className="font-medium">{comment.user?.displayName}</h4>
            <span className="text-muted-foreground text-xs">{formatTimeAgo(comment.createdAt)}</span>
          </div>
          <p className="mt-1 text-sm">{comment.content}</p>
          <div className="flex items-center space-x-4 mt-2">
            <Button variant="ghost" size="sm" className="h-8 px-2">
              <ThumbsUp className="h-4 w-4 mr-1" />
              <span>{comment.likes}</span>
            </Button>
            <Button variant="ghost" size="sm" className="h-8 px-2">
              <ThumbsDown className="h-4 w-4" />
              {comment.dislikes > 0 && <span className="ml-1">{comment.dislikes}</span>}
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-2"
              onClick={() => setShowReplyInput(!showReplyInput)}
            >
              <Reply className="h-4 w-4 mr-1" />
              <span>Reply</span>
            </Button>
          </div>
          
          {/* Reply input form */}
          {showReplyInput && (
            <div className="flex space-x-3 mt-4">
              <Avatar className="w-8 h-8">
                <AvatarImage src={DEFAULT_AVATAR} alt="Your avatar" />
                <AvatarFallback>
                  <User className="h-3 w-3" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Reply to ${comment.user?.displayName}...`}
                  className="min-h-[60px] text-sm"
                />
                
                <div className="flex justify-end gap-2 mt-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setReplyText('');
                      setShowReplyInput(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    size="sm"
                    onClick={handleSubmitReply}
                  >
                    Reply
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 space-y-4">
              {comment.replies.map(reply => (
                <CommentItem key={reply.id} comment={reply} isReply />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
