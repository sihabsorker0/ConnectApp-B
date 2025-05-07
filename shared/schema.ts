import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name").notNull(),
  avatar: text("avatar"),
  description: text("description"),
  subscribers: integer("subscribers").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Category schema
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

// Video schema
export const videos = pgTable("videos", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  categoryId: integer("category_id").references(() => categories.id),
  title: text("title").notNull(),
  description: text("description"),
  thumbnailUrl: text("thumbnail_url"),
  videoUrl: text("video_url").notNull(),
  views: integer("views").default(0),
  likes: integer("likes").default(0),
  dislikes: integer("dislikes").default(0),
  duration: integer("duration"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Comment schema - define with no parentId first
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  videoId: integer("video_id").references(() => videos.id),
  userId: integer("user_id").references(() => users.id),
  content: text("content").notNull(),
  likes: integer("likes").default(0),
  dislikes: integer("dislikes").default(0),
  parentId: integer("parent_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Subscription schema
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  subscriberId: integer("subscriber_id").references(() => users.id),
  publisherId: integer("publisher_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Schemas for inserts
export const insertUserSchema = createInsertSchema(users).omit({ id: true, subscribers: true, createdAt: true });
export const insertVideoSchema = createInsertSchema(videos).omit({ id: true, views: true, likes: true, dislikes: true, createdAt: true });
export const insertCommentSchema = createInsertSchema(comments).omit({ id: true, likes: true, dislikes: true, createdAt: true });
export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({ id: true, createdAt: true });
export const insertCategorySchema = createInsertSchema(categories).omit({ id: true });

// Types for insert and select
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertVideo = z.infer<typeof insertVideoSchema>;
export type Video = typeof videos.$inferSelect & {
  // Virtual fields for user's interaction with the video
  userLiked?: boolean;
  userDisliked?: boolean;
  userSaved?: boolean;
};

export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof comments.$inferSelect;

export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Subscription = typeof subscriptions.$inferSelect;

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;
