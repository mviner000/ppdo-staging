// convex/media.ts

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Upload a media file
 * Stores media metadata and associates it with the current user
 */
export const uploadMedia = mutation({
  args: {
    storageId: v.id("_storage"),
    name: v.string(),
    type: v.string(),
    size: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized: Must be logged in to upload media");
    }

    const now = Date.now();
    const mediaId = await ctx.db.insert("media", {
      storageId: args.storageId,
      name: args.name,
      type: args.type,
      size: args.size,
      userId,
      uploadedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    return mediaId;
  },
});

/**
 * Get all media files for the current user
 * Returns media items with download URLs
 */
export const getMyMedia = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      console.log("No user ID, returning empty array");
      return [];
    }

    const media = await ctx.db
      .query("media")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    console.log(`Found ${media.length} media items for user ${userId}`);

    // Get download URLs for each media item
    const mediaWithUrls = await Promise.all(
      media.map(async (item) => {
        const url = await ctx.storage.getUrl(item.storageId);
        console.log(`[${item.name}] StorageId: ${item.storageId} -> URL: ${url}`);
        
        return {
          _id: item._id,
          _creationTime: item._creationTime,
          storageId: item.storageId,
          name: item.name,
          type: item.type,
          size: item.size,
          userId: item.userId,
          uploadedAt: item.uploadedAt,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          url: url,
        };
      })
    );

    console.log("Returning media with URLs:", mediaWithUrls.map(m => ({ name: m.name, hasUrl: !!m.url })));
    return mediaWithUrls;
  },
});

/**
 * Get a single media item by ID
 */
export const getMediaById = query({
  args: {
    mediaId: v.id("media"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized: Must be logged in");
    }

    const media = await ctx.db.get(args.mediaId);
    if (!media) {
      return null;
    }

    // Verify user owns this media
    if (media.userId !== userId) {
      throw new Error("Unauthorized: Cannot access this media");
    }

    const url = await ctx.storage.getUrl(media.storageId);
    return {
      ...media,
      url,
    };
  },
});

/**
 * Delete a media item
 * Removes both the database record and the file from storage
 */
export const deleteMedia = mutation({
  args: {
    mediaId: v.id("media"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized: Must be logged in to delete media");
    }

    const media = await ctx.db.get(args.mediaId);
    if (!media) {
      throw new Error("Media not found");
    }

    // Verify user owns this media
    if (media.userId !== userId) {
      throw new Error("Unauthorized: Cannot delete this media");
    }

    // Delete from storage
    await ctx.storage.delete(media.storageId);

    // Delete from database
    await ctx.db.delete(args.mediaId);

    return { success: true };
  },
});

/**
 * Update media metadata (name only for now)
 */
export const updateMedia = mutation({
  args: {
    mediaId: v.id("media"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized: Must be logged in to update media");
    }

    const media = await ctx.db.get(args.mediaId);
    if (!media) {
      throw new Error("Media not found");
    }

    // Verify user owns this media
    if (media.userId !== userId) {
      throw new Error("Unauthorized: Cannot update this media");
    }

    await ctx.db.patch(args.mediaId, {
      name: args.name,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Generate an upload URL for storing files
 */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized: Must be logged in to upload");
    }

    return await ctx.storage.generateUploadUrl();
  },
});