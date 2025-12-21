// convex/schema/budgetParticulars.ts
import { defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Budget Particulars Table
 * 
 * This table stores the master list of budget particulars (codes and names)
 * that can be used by both budgetItems and projects.
 * 
 * Example particulars:
 * - GAD: "Gender and Development"
 * - LDRRMP: "Local Disaster Risk Reduction and Management Plan"
 * - etc.
 */
export const budgetParticularTables = {
  budgetParticulars: defineTable({
    /**
     * Short code/abbreviation (e.g., "GAD", "LDRRMP")
     * Must be unique across all particulars
     */
    code: v.string(),
    
    /**
     * Full name/description
     * (e.g., "Gender and Development", "Local Disaster Risk Reduction and Management Plan")
     */
    fullName: v.string(),
    
    /**
     * Optional description providing more context
     */
    description: v.optional(v.string()),
    
    /**
     * Display order for sorting in UI (lower numbers appear first)
     */
    displayOrder: v.optional(v.number()),
    
    /**
     * Whether this particular is currently active/available for use
     * Inactive particulars won't show in dropdowns but existing records remain valid
     */
    isActive: v.boolean(),
    
    /**
     * Whether this is a system default particular (cannot be deleted)
     * Set to true for the 12 default particulars
     */
    isSystemDefault: v.optional(v.boolean()),
    
    /**
     * Usage statistics
     */
    usageCount: v.optional(v.number()), // How many budget items use this
    projectUsageCount: v.optional(v.number()), // How many projects use this
    
    /**
     * Optional category for grouping (e.g., "Social Development", "Infrastructure")
     */
    category: v.optional(v.string()),
    
    /**
     * Optional color code for UI display (hex color)
     */
    colorCode: v.optional(v.string()),
    
    /**
     * Audit fields
     */
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
    updatedBy: v.optional(v.id("users")),
    
    /**
     * Optional notes about this particular
     */
    notes: v.optional(v.string()),
  })
    // Indexes for efficient queries
    .index("code", ["code"]) // For uniqueness check and lookups by code
    .index("isActive", ["isActive"]) // For filtering active particulars
    .index("displayOrder", ["displayOrder"]) // For ordered display
    .index("category", ["category"]) // For category filtering
    .index("isActiveAndDisplayOrder", ["isActive", "displayOrder"]) // Combined for sorted active list
    .index("createdBy", ["createdBy"])
    .index("createdAt", ["createdAt"])
    .index("isSystemDefault", ["isSystemDefault"])
    .index("usageCount", ["usageCount"]), // For sorting by popularity
};