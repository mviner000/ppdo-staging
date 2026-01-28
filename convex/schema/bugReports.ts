// convex/schema/bugReports.ts

import { defineTable } from "convex/server";
import { v } from "convex/values";

export const bugReportsTables = {
  bugReports: defineTable({
    title: v.optional(v.string()),
    description: v.string(),
    stepsToReplicate: v.optional(v.string()),
    submittedBy: v.id("users"),
    status: v.union(v.literal("pending"), v.literal("fixed"), v.literal("not_fixed")),
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