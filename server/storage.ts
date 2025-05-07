import { 
  users, type User, type InsertUser, 
  videos, type Video, type InsertVideo, 
  comments, type Comment, type InsertComment, 
  subscriptions, type Subscription, type InsertSubscription,
  categories, type Category, type InsertCategory 
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Video operations
  getVideo(id: number, userId?: number): Promise<Video | undefined>;
  getVideos(limit?: number, offset?: number, categoryId?: number): Promise<Video[]>;
  getUserVideos(userId: number): Promise<Video[]>;
  createVideo(video: InsertVideo): Promise<Video>;
  incrementViews(id: number): Promise<void>;
  likeVideo(id: number, userId: number): Promise<Video>;
  dislikeVideo(id: number, userId: number): Promise<Video>;
  searchVideos(query: string, categoryId?: number): Promise<Video[]>;
  saveVideo(id: number, userId: number): Promise<boolean>;
  unsaveVideo(id: number, userId: number): Promise<boolean>;
  getSavedVideos(userId: number): Promise<Video[]>;
  isSaved(videoId: number, userId: number): Promise<boolean>;
  
  // Comment operations
  getVideoComments(videoId: number): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  
  // Subscription operations
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  getUserSubscriptions(userId: number): Promise<User[]>;
  isSubscribed(subscriberId: number, publisherId: number): Promise<boolean>;
  
  // Category operations
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private videos: Map<number, Video>;
  private comments: Map<number, Comment>;
  private subscriptions: Map<number, Subscription>;
  private categories: Map<number, Category>;
  
  private userId: number;
  private videoId: number;
  private commentId: number;
  private subscriptionId: number;
  private categoryId: number;
  
  // Maps to track likes and dislikes by user (videoId_userId)
  private userLikes: Map<string, boolean>;
  private userDislikes: Map<string, boolean>;
  
  // Map to track saved videos by user (videoId_userId)
  private userSavedVideos: Map<string, boolean>;

  constructor() {
    this.users = new Map();
    this.videos = new Map();
    this.comments = new Map();
    this.subscriptions = new Map();
    this.categories = new Map();
    this.userLikes = new Map();
    this.userDislikes = new Map();
    this.userSavedVideos = new Map();
    
    this.userId = 1;
    this.videoId = 1;
    this.commentId = 1;
    this.subscriptionId = 1;
    this.categoryId = 1;
    
    // Initialize with some data
    this.initializeData();
  }
  
  private initializeData() {
    // Create default categories
    const categoryNames = ["All", "Gaming", "Music", "Tech Reviews", "Cooking", "Tutorials", "Vlogs", "Comedy", "Sports", "Travel"];
    categoryNames.forEach(name => {
      this.createCategory({ name });
    });
    
    // No pre-created users, videos, or comments - everything will be dynamic
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { 
      ...insertUser, 
      id, 
      subscribers: 0, 
      description: insertUser.description || '', 
      createdAt: new Date() 
    };
    this.users.set(id, user);
    return user;
  }
  
  // Video operations
  async getVideo(id: number, userId?: number): Promise<Video | undefined> {
    const video = this.videos.get(id);
    if (!video) return undefined;
    
    // If userId is provided, include user's like/dislike/saved status
    if (userId) {
      const likeKey = `${id}_${userId}`;
      const dislikeKey = `${id}_${userId}`;
      const savedKey = `${id}_${userId}`;
      
      return {
        ...video,
        userLiked: this.userLikes.get(likeKey) || false,
        userDisliked: this.userDislikes.get(dislikeKey) || false,
        userSaved: this.userSavedVideos.get(savedKey) || false
      };
    }
    
    return video;
  }
  
  async getVideos(limit = 20, offset = 0, categoryId?: number): Promise<Video[]> {
    return Array.from(this.videos.values())
      .filter(video => !categoryId || categoryId === 1 || video.categoryId === categoryId)
      .sort((a, b) => b.id - a.id)
      .slice(offset, offset + limit);
  }
  
  async getUserVideos(userId: number): Promise<Video[]> {
    return Array.from(this.videos.values())
      .filter(video => video.userId === userId)
      .sort((a, b) => b.id - a.id);
  }
  
  async createVideo(video: InsertVideo): Promise<Video> {
    const id = this.videoId++;
    const newVideo: Video = { 
      ...video, 
      id, 
      views: 0, 
      likes: 0, 
      dislikes: 0, 
      createdAt: new Date()
    };
    this.videos.set(id, newVideo);
    return newVideo;
  }
  
  async incrementViews(id: number): Promise<void> {
    const video = this.videos.get(id);
    if (video) {
      video.views += 1;
      this.videos.set(id, video);
    }
  }
  
  async likeVideo(id: number, userId: number): Promise<Video> {
    const video = this.videos.get(id);
    if (!video) {
      throw new Error('Video not found');
    }
    
    // Generate keys for tracking
    const likeKey = `${id}_${userId}`;
    const dislikeKey = `${id}_${userId}`;
    
    // Check if user already liked this video
    if (this.userLikes.get(likeKey)) {
      // User already liked - remove like
      video.likes = Math.max(0, video.likes - 1);
      this.userLikes.delete(likeKey);
    } else {
      // New like - add it
      video.likes += 1;
      this.userLikes.set(likeKey, true);
      
      // If user previously disliked, remove that dislike
      if (this.userDislikes.get(dislikeKey)) {
        video.dislikes = Math.max(0, video.dislikes - 1);
        this.userDislikes.delete(dislikeKey);
      }
    }
    
    this.videos.set(id, video);
    
    // Return updated video with user's like status
    return {
      ...video,
      userLiked: this.userLikes.get(likeKey) || false,
      userDisliked: this.userDislikes.get(dislikeKey) || false
    };
  }
  
  async dislikeVideo(id: number, userId: number): Promise<Video> {
    const video = this.videos.get(id);
    if (!video) {
      throw new Error('Video not found');
    }
    
    // Generate keys for tracking
    const likeKey = `${id}_${userId}`;
    const dislikeKey = `${id}_${userId}`;
    
    // Check if user already disliked this video
    if (this.userDislikes.get(dislikeKey)) {
      // User already disliked - remove dislike
      video.dislikes = Math.max(0, video.dislikes - 1);
      this.userDislikes.delete(dislikeKey);
    } else {
      // New dislike - add it
      video.dislikes += 1;
      this.userDislikes.set(dislikeKey, true);
      
      // If user previously liked, remove that like
      if (this.userLikes.get(likeKey)) {
        video.likes = Math.max(0, video.likes - 1);
        this.userLikes.delete(likeKey);
      }
    }
    
    this.videos.set(id, video);
    
    // Return updated video with user's like status
    return {
      ...video,
      userLiked: this.userLikes.get(likeKey) || false,
      userDisliked: this.userDislikes.get(dislikeKey) || false
    };
  }
  
  async searchVideos(query: string, categoryId?: number): Promise<Video[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.videos.values())
      .filter(video => 
        (video.title.toLowerCase().includes(lowerQuery) || 
        (video.description && video.description.toLowerCase().includes(lowerQuery))) &&
        (!categoryId || categoryId === 1 || video.categoryId === categoryId)
      );
  }
  
  // Comment operations
  async getVideoComments(videoId: number): Promise<Comment[]> {
    const comments = Array.from(this.comments.values())
      .filter(comment => comment.videoId === videoId)
      .sort((a, b) => b.id - a.id);
    
    // Explicitly log all users and comments for debugging
    console.log('All users:', Array.from(this.users.values()).map(u => ({ id: u.id, username: u.username })));
    console.log('Comments being returned:', comments);
    
    return comments;
  }
  
  async createComment(comment: InsertComment): Promise<Comment> {
    const id = this.commentId++;
    const newComment: Comment = { 
      ...comment, 
      id, 
      likes: comment.likes || 0, 
      dislikes: comment.dislikes || 0, 
      createdAt: new Date()
    };
    this.comments.set(id, newComment);
    return newComment;
  }
  
  // Subscription operations
  async createSubscription(subscription: InsertSubscription): Promise<Subscription> {
    const id = this.subscriptionId++;
    const newSubscription: Subscription = { 
      ...subscription, 
      id, 
      createdAt: new Date()
    };
    
    // Increment subscribers count
    const publisher = this.users.get(subscription.publisherId);
    if (publisher) {
      publisher.subscribers += 1;
      this.users.set(publisher.id, publisher);
    }
    
    this.subscriptions.set(id, newSubscription);
    return newSubscription;
  }
  
  async getUserSubscriptions(userId: number): Promise<User[]> {
    const subscriptions = Array.from(this.subscriptions.values())
      .filter(sub => sub.subscriberId === userId);
    
    return subscriptions.map(sub => {
      const publisher = this.users.get(sub.publisherId);
      return publisher!;
    }).filter(Boolean);
  }
  
  async isSubscribed(subscriberId: number, publisherId: number): Promise<boolean> {
    return Array.from(this.subscriptions.values())
      .some(sub => sub.subscriberId === subscriberId && sub.publisherId === publisherId);
  }
  
  // Category operations
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }
  
  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.categoryId++;
    const newCategory: Category = { ...category, id };
    this.categories.set(id, newCategory);
    return newCategory;
  }
  
  // Video saving operations
  async saveVideo(id: number, userId: number): Promise<boolean> {
    const video = this.videos.get(id);
    if (!video) {
      throw new Error('Video not found');
    }
    
    const savedKey = `${id}_${userId}`;
    this.userSavedVideos.set(savedKey, true);
    return true;
  }
  
  async unsaveVideo(id: number, userId: number): Promise<boolean> {
    const video = this.videos.get(id);
    if (!video) {
      throw new Error('Video not found');
    }
    
    const savedKey = `${id}_${userId}`;
    this.userSavedVideos.delete(savedKey);
    return true;
  }
  
  async getSavedVideos(userId: number): Promise<Video[]> {
    const savedKeys = Array.from(this.userSavedVideos.keys())
      .filter(key => key.endsWith(`_${userId}`) && this.userSavedVideos.get(key));
      
    const videoIds = savedKeys.map(key => parseInt(key.split('_')[0]));
    
    return Array.from(this.videos.values())
      .filter(video => videoIds.includes(video.id))
      .sort((a, b) => b.id - a.id);
  }
  
  async isSaved(videoId: number, userId: number): Promise<boolean> {
    const savedKey = `${videoId}_${userId}`;
    return this.userSavedVideos.get(savedKey) || false;
  }
}

export const storage = new MemStorage();
