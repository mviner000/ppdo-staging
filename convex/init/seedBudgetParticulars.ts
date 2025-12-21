// convex/init/seedBudgetParticulars.ts
import { mutation } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Seed the database with default budget particulars
 * Can only be called by super_admin
 * This should be run once during initial setup
 * Can also be used to restore defaults if needed
 */
export const initializeDefaultParticulars = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if user is super admin
    const user = await ctx.db.get(userId);
    if (!user || user.role !== "super_admin") {
      throw new Error("Only super_admin can initialize default particulars");
    }

    // Inline the seeding logic to avoid circular reference
    const now = Date.now();

    // Define the 12 default particulars with their full names
    const defaultParticulars = [
      {
        code: "GAD",
        fullName: "Gender and Development",
        description: "Programs and projects promoting gender equality and women empowerment",
        category: "Social Development",
        colorCode: "#FF6B9D",
        displayOrder: 1,
      },
      {
        code: "LDRRMP",
        fullName: "Local Disaster Risk Reduction and Management Plan",
        description: "Programs for disaster preparedness, response, and recovery",
        category: "Public Safety",
        colorCode: "#FF5733",
        displayOrder: 2,
      },
      {
        code: "LCCAP",
        fullName: "Local Climate Change Action Plan",
        description: "Climate change mitigation and adaptation programs",
        category: "Environment",
        colorCode: "#4CAF50",
        displayOrder: 3,
      },
      {
        code: "LCPC",
        fullName: "Local Council for the Protection of Children",
        description: "Programs for child protection and welfare",
        category: "Social Development",
        colorCode: "#FFC107",
        displayOrder: 4,
      },
      {
        code: "SCPD",
        fullName: "Sectoral Committee for Persons with Disabilities",
        description: "Programs supporting persons with disabilities",
        category: "Social Development",
        colorCode: "#9C27B0",
        displayOrder: 5,
      },
      {
        code: "POPS",
        fullName: "Provincial Operations",
        description: "General provincial operational programs",
        category: "Operations",
        colorCode: "#2196F3",
        displayOrder: 6,
      },
      {
        code: "CAIDS",
        fullName: "Community Affairs and Information Development Services",
        description: "Community engagement and information dissemination programs",
        category: "Communications",
        colorCode: "#00BCD4",
        displayOrder: 7,
      },
      {
        code: "LNP",
        fullName: "Local Nutrition Program",
        description: "Nutrition and food security programs",
        category: "Health",
        colorCode: "#8BC34A",
        displayOrder: 8,
      },
      {
        code: "PID",
        fullName: "Provincial Information Department",
        description: "Provincial information and public affairs programs",
        category: "Communications",
        colorCode: "#03A9F4",
        displayOrder: 9,
      },
      {
        code: "ACDP",
        fullName: "Agricultural Competitiveness Development Program",
        description: "Programs for agricultural development and competitiveness",
        category: "Agriculture",
        colorCode: "#795548",
        displayOrder: 10,
      },
      {
        code: "LYDP",
        fullName: "Local Youth Development Program",
        description: "Youth development and empowerment programs",
        category: "Social Development",
        colorCode: "#E91E63",
        displayOrder: 11,
      },
      {
        code: "20%_DF",
        fullName: "20% Development Fund",
        description: "Mandatory 20% allocation for development projects",
        category: "Development",
        colorCode: "#607D8B",
        displayOrder: 12,
      },
    ];

    const insertedIds = [];

    for (const particular of defaultParticulars) {
      // Check if particular already exists
      const existing = await ctx.db
        .query("budgetParticulars")
        .withIndex("code", (q) => q.eq("code", particular.code))
        .first();

      if (existing) {
        console.log(`Particular ${particular.code} already exists, skipping`);
        continue;
      }

      // Insert the particular
      const id = await ctx.db.insert("budgetParticulars", {
        code: particular.code,
        fullName: particular.fullName,
        description: particular.description,
        displayOrder: particular.displayOrder,
        isActive: true,
        isSystemDefault: true, // Mark as system default
        usageCount: 0,
        projectUsageCount: 0,
        category: particular.category,
        colorCode: particular.colorCode,
        createdBy: userId,
        createdAt: now,
        updatedAt: now,
      });

      insertedIds.push(id);
      console.log(`Inserted default particular: ${particular.code}`);
    }

    return {
      success: true,
      inserted: insertedIds.length,
      total: defaultParticulars.length,
      insertedIds,
    };
  },
});