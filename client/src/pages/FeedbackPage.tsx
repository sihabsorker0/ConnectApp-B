import { useState } from 'react';

import { MessageSquare, Send, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

export default function FeedbackPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [feedbackType, setFeedbackType] = useState('suggestion');
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [email, setEmail] = useState(user?.username ? `${user.username}@example.com` : '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!feedbackText.trim()) {
      toast({
        title: "Error",
        description: "Please provide feedback before submitting.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      toast({
        title: "Feedback Sent",
        description: "Thank you for your feedback! We appreciate you taking the time to help us improve.",
      });
    }, 1000);
  };

  if (isSubmitted) {
    return (
      <div className="container max-w-2xl px-4 py-8">
        <div className="flex flex-col items-center justify-center text-center py-12">
          <div className="bg-primary/10 p-4 rounded-full mb-4">
            <CheckCircle className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Thank You for Your Feedback!</h1>
          <p className="text-muted-foreground mb-6">
            We appreciate you taking the time to share your thoughts with us. Your feedback helps us make our platform better for everyone.
          </p>
          <Button onClick={() => setIsSubmitted(false)}>
            Send More Feedback
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl px-4 py-8">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Send Feedback</h1>
      </div>
      
      <p className="text-muted-foreground mb-8">
        We're always looking to improve our platform. Let us know what you think, report issues, or suggest new features.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <Label>Feedback Type</Label>
          <RadioGroup 
            value={feedbackType} 
            onValueChange={setFeedbackType}
            className="flex flex-col space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="suggestion" id="suggestion" />
              <Label htmlFor="suggestion" className="cursor-pointer">Suggestion</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="issue" id="issue" />
              <Label htmlFor="issue" className="cursor-pointer">Report an Issue</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="praise" id="praise" />
              <Label htmlFor="praise" className="cursor-pointer">Share Praise</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="other" id="other" />
              <Label htmlFor="other" className="cursor-pointer">Other</Label>
            </div>
          </RadioGroup>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="feedback">Your Feedback</Label>
          <Textarea 
            id="feedback" 
            placeholder="Tell us what's on your mind..." 
            className="min-h-[150px]"
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email Address (optional)</Label>
          <p className="text-sm text-muted-foreground mb-2">
            If you'd like us to follow up with you regarding your feedback
          </p>
          <Input 
            id="email" 
            type="email" 
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full sm:w-auto"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>Processing...</>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Send Feedback
            </>
          )}
        </Button>
      </form>
    </div>
  );
}