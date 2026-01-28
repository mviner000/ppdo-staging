// convex/schema/suggestions.ts

import { defineTable } from "convex/server";
import { v } from "convex/values";

export const suggestionsTables = {
  suggestions: defineTable({
    title: v.string(),
    description: v.string(),
    submittedBy: v.id("users"),
    status: v.union(v.literal("pending"), v.literal("acknowledged"), v.literal("to_review"), v.literal("denied")),
    submittedAt: v.number(),
    updatedAt: v.optional(v.number()),
    updatedBy: v.optional(v.id("users")),
    multimedia: v.optional(
      v.array(
        v.object({
          storageId: v.id("_storage"),
          type: v.string(), // "image" or "video"
          name: v.string(),
        })
      )
    ),
  }),
};