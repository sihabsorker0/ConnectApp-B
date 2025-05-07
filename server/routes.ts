import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCommentSchema, insertVideoSchema } from "@shared/schema";
import { setupAuth } from "./auth";

// Import sessions from auth.ts for token-based authentication
import { sessions } from "./auth";

// Middleware to check if user is authenticated
function checkAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token || !sessions[token] || sessions[token].expires < new Date()) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  // Add userId to request
  (req as any).userId = sessions[token].userId;
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);
  
  // API routes
  
  // Get all videos
  app.get('/api/videos', async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
      
      const videos = await storage.getVideos(limit, offset, categoryId);
      
      // Add user data to each video
      const videosWithUser = await Promise.all(videos.map(async (video) => {
        const user = await storage.getUser(video.userId);
        return {
          ...video,
          user: user ? {
            id: user.id,
            username: user.username,
            displayName: user.displayName,
            avatar: user.avatar,
            subscribers: user.subscribers
          } : null
        };
      }));
      
      res.json(videosWithUser);
    } catch (error) {
      console.error('Error fetching videos:', error);
      res.status(500).json({ message: 'Failed to fetch videos' });
    }
  });
  
  // Get single video
  app.get('/api/videos/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Check if user is authenticated to include like/dislike status
      const token = req.headers.authorization?.split(' ')[1];
      const userId = token && sessions[token] && sessions[token].expires > new Date() 
        ? sessions[token].userId 
        : undefined;
      
      // Check if this is a request from a like/dislike action to avoid incrementing views
      const referer = req.headers.referer || '';
      const isFromLikeDislikeAction = req.headers['x-from-action'] === 'true' || 
        referer.includes('/like') || referer.includes('/dislike');
      
      // Pass userId to getVideo to include like/dislike status if user is logged in
      const video = await storage.getVideo(id, userId);
      
      if (!video) {
        return res.status(404).json({ message: 'Video not found' });
      }
      
      // Only increment views if not from a like/dislike action
      if (!isFromLikeDislikeAction) {
        await storage.incrementViews(id);
      }
      
      // Get user data
      const user = await storage.getUser(video.userId);
      
      res.json({
        ...video,
        user: user ? {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          avatar: user.avatar,
          subscribers: user.subscribers,
          description: user.description,
          createdAt: user.createdAt
        } : null
      });
    } catch (error) {
      console.error('Error fetching video:', error);
      res.status(500).json({ message: 'Failed to fetch video' });
    }
  });
  
  // Create new video
  app.post('/api/videos', async (req, res) => {
    try {
      const validatedData = insertVideoSchema.parse(req.body);
      const video = await storage.createVideo(validatedData);
      res.status(201).json(video);
    } catch (error) {
      console.error('Error creating video:', error);
      res.status(400).json({ message: 'Invalid video data' });
    }
  });
  
  // Search videos
  app.get('/api/search', async (req, res) => {
    try {
      const query = req.query.q as string || '';
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
      
      if (!query) {
        return res.json([]);
      }
      
      const videos = await storage.searchVideos(query, categoryId);
      
      // Add user data
      const videosWithUser = await Promise.all(videos.map(async (video) => {
        const user = await storage.getUser(video.userId);
        return {
          ...video,
          user: user ? {
            id: user.id,
            username: user.username,
            displayName: user.displayName,
            avatar: user.avatar,
            subscribers: user.subscribers
          } : null
        };
      }));
      
      res.json(videosWithUser);
    } catch (error) {
      console.error('Error searching videos:', error);
      res.status(500).json({ message: 'Failed to search videos' });
    }
  });
  
  // Get user channel videos by ID
  app.get('/api/channels/:userId/videos', async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const videos = await storage.getUserVideos(userId);
      
      // Get user data
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
    
      // Add user data to videos
      const videosWithUser = videos.map(video => ({
        ...video,
        user: {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          avatar: user.avatar,
          subscribers: user.subscribers
        }
      }));
      
      res.json({
        user: {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          avatar: user.avatar,
          subscribers: user.subscribers,
          description: user.description,
          createdAt: user.createdAt
        },
        videos: videosWithUser
      });
    } catch (error) {
      console.error('Error fetching channel videos:', error);
      res.status(500).json({ message: 'Failed to fetch channel videos' });
    }
  });
  
  // Get user channel videos by username
  app.get('/api/channels/username/:username/videos', async (req, res) => {
    try {
      const username = req.params.username;
      
      // Get user data by username
      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Get videos for this user
      const videos = await storage.getUserVideos(user.id);
      
      // Add user data to videos
      const videosWithUser = videos.map(video => ({
        ...video,
        user: {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          avatar: user.avatar,
          subscribers: user.subscribers
        }
      }));
      
      res.json({
        user: {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          avatar: user.avatar,
          subscribers: user.subscribers,
          description: user.description,
          createdAt: user.createdAt
        },
        videos: videosWithUser
      });
    } catch (error) {
      console.error('Error fetching channel videos:', error);
      res.status(500).json({ message: 'Failed to fetch channel videos' });
    }
  });
  
  // Get video comments
  app.get('/api/videos/:id/comments', async (req, res) => {
    try {
      const videoId = parseInt(req.params.id);
      const comments = await storage.getVideoComments(videoId);
      
      console.log(`Getting comments for video ID ${videoId}. Found ${comments.length} comments:`, comments);
      
      // Add user data to comments
      const commentsWithUser = await Promise.all(comments.map(async (comment) => {
        // Explicitly log the userId
        console.log(`Comment ID ${comment.id} has userId ${comment.userId}`);
        
        // If userId is not defined, use fallback user data
        if (!comment.userId) {
          console.log(`Comment ID ${comment.id} has no userId!`);
          return {
            ...comment,
            user: null
          };
        }
        
        const user = await storage.getUser(comment.userId);
        console.log(`User data for comment ${comment.id}:`, user);
        
        return {
          ...comment,
          user: user ? {
            id: user.id,
            username: user.username,
            displayName: user.displayName,
            avatar: user.avatar
          } : null
        };
      }));
      
      // Organize comments (parents and replies)
      const parentComments = commentsWithUser.filter(c => !c.parentId);
      const replies = commentsWithUser.filter(c => c.parentId);
      
      // Attach replies to parent comments
      const commentsWithReplies = parentComments.map(parent => {
        const commentReplies = replies.filter(reply => reply.parentId === parent.id);
        return {
          ...parent,
          replies: commentReplies
        };
      });
      
      console.log('Final comments being sent to client:', commentsWithReplies);
      res.json(commentsWithReplies);
    } catch (error) {
      console.error('Error fetching comments:', error);
      res.status(500).json({ message: 'Failed to fetch comments' });
    }
  });
  
  // Create comment
  app.post('/api/videos/:id/comments', checkAuth, async (req: Request, res: Response) => {
    try {
      const videoId = parseInt(req.params.id);
      // Get the user ID from the authenticated request
      const userId = (req as any).userId;
      
      if (!userId) {
        return res.status(401).json({ message: 'You must be logged in to comment' });
      }
      
      const data = { 
        ...req.body, 
        videoId,
        userId // Use the authenticated user's ID
      };
      
      const validatedData = insertCommentSchema.parse(data);
      const comment = await storage.createComment(validatedData);
      
      // Add user data
      const user = await storage.getUser(userId);
      
      res.status(201).json({
        ...comment,
        user: user ? {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          avatar: user.avatar
        } : null
      });
    } catch (error) {
      console.error('Error creating comment:', error);
      res.status(400).json({ message: 'Invalid comment data' });
    }
  });
  
  // Get categories
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ message: 'Failed to fetch categories' });
    }
  });
  
  // Get user subscriptions
  app.get('/api/users/:userId/subscriptions', async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const subscriptions = await storage.getUserSubscriptions(userId);
      res.json(subscriptions);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      res.status(500).json({ message: 'Failed to fetch subscriptions' });
    }
  });
  
  // Like video
  app.post('/api/videos/:id/like', checkAuth, async (req, res) => {
    try {
      const videoId = parseInt(req.params.id);
      const userId = (req as any).userId;
      
      // Skip view increment for this API call completely - don't rely on headers
      const video = await storage.likeVideo(videoId, userId);
      
      // Include user data in the response to avoid a separate request
      const user = await storage.getUser(video.userId || 0);
      
      res.json({
        ...video,
        user: user ? {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          avatar: user.avatar,
          subscribers: user.subscribers,
          description: user.description,
          createdAt: user.createdAt
        } : null
      });
    } catch (error) {
      console.error('Error liking video:', error);
      res.status(500).json({ message: 'Failed to like video' });
    }
  });
  
  // Dislike video
  app.post('/api/videos/:id/dislike', checkAuth, async (req, res) => {
    try {
      const videoId = parseInt(req.params.id);
      const userId = (req as any).userId;
      
      // Skip view increment for this API call completely - don't rely on headers
      const video = await storage.dislikeVideo(videoId, userId);
      
      // Include user data in the response to avoid a separate request
      const user = await storage.getUser(video.userId || 0);
      
      res.json({
        ...video,
        user: user ? {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          avatar: user.avatar,
          subscribers: user.subscribers,
          description: user.description,
          createdAt: user.createdAt
        } : null
      });
    } catch (error) {
      console.error('Error disliking video:', error);
      res.status(500).json({ message: 'Failed to dislike video' });
    }
  });
  
  // Subscribe to a channel
  app.post('/api/channels/:publisherId/subscribe', checkAuth, async (req, res) => {
    try {
      const publisherId = parseInt(req.params.publisherId);
      const subscriberId = (req as any).userId;
      
      // Prevent subscribing to own channel
      if (publisherId === subscriberId) {
        return res.status(400).json({ message: 'Cannot subscribe to your own channel' });
      }
      
      // Check if already subscribed
      const alreadySubscribed = await storage.isSubscribed(subscriberId, publisherId);
      if (alreadySubscribed) {
        return res.status(400).json({ message: 'Already subscribed to this channel' });
      }
      
      const subscription = await storage.createSubscription({
        subscriberId,
        publisherId
      });
      
      res.status(201).json(subscription);
    } catch (error) {
      console.error('Error subscribing to channel:', error);
      res.status(500).json({ message: 'Failed to subscribe to channel' });
    }
  });
  
  // Check if user is subscribed to a channel
  app.get('/api/channels/:publisherId/subscribed', checkAuth, async (req, res) => {
    try {
      const publisherId = parseInt(req.params.publisherId);
      const subscriberId = (req as any).userId;
      
      const isSubscribed = await storage.isSubscribed(subscriberId, publisherId);
      res.json({ isSubscribed });
    } catch (error) {
      console.error('Error checking subscription:', error);
      res.status(500).json({ message: 'Failed to check subscription' });
    }
  });
  
  // Save video
  app.post('/api/videos/:id/save', checkAuth, async (req, res) => {
    try {
      const videoId = parseInt(req.params.id);
      const userId = (req as any).userId;
      
      const success = await storage.saveVideo(videoId, userId);
      
      // Get video with updated saved status
      const video = await storage.getVideo(videoId, userId);
      
      res.json({ success, video });
    } catch (error) {
      console.error('Error saving video:', error);
      res.status(500).json({ message: 'Failed to save video' });
    }
  });
  
  // Unsave video
  app.post('/api/videos/:id/unsave', checkAuth, async (req, res) => {
    try {
      const videoId = parseInt(req.params.id);
      const userId = (req as any).userId;
      
      const success = await storage.unsaveVideo(videoId, userId);
      
      // Get video with updated saved status
      const video = await storage.getVideo(videoId, userId);
      
      res.json({ success, video });
    } catch (error) {
      console.error('Error unsaving video:', error);
      res.status(500).json({ message: 'Failed to unsave video' });
    }
  });
  
  // Get saved videos
  app.get('/api/videos/saved', checkAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      
      const videos = await storage.getSavedVideos(userId);
      res.json(videos);
    } catch (error) {
      console.error('Error fetching saved videos:', error);
      res.status(500).json({ message: 'Failed to fetch saved videos' });
    }
  });
  
  // Check if a video is saved
  app.get('/api/videos/:id/saved', checkAuth, async (req, res) => {
    try {
      const videoId = parseInt(req.params.id);
      const userId = (req as any).userId;
      
      const isSaved = await storage.isSaved(videoId, userId);
      res.json({ isSaved });
    } catch (error) {
      console.error('Error checking if video is saved:', error);
      res.status(500).json({ message: 'Failed to check if video is saved' });
    }
  });
  
  const httpServer = createServer(app);
  return httpServer;
}
