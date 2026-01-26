// convex/init/clearSeededData.ts
import { mutation } from "../_generated/server";

export const clearAllData = mutation({
    args: {},
    handler: async (ctx) => {
        // Delete all budget items
        const budgetItems = await ctx.db.query("budgetItems").collect();
        for (const item of budgetItems) {
            await ctx.db.delete(item._id);
        }

        // Delete all projects
        const projects = await ctx.db.query("projects").collect();
        for (const project of projects) {
            await ctx.db.delete(project._id);
        }

        // Delete all trust funds
        const trustFunds = await ctx.db.query("trustFunds").collect();
        for (const fund of trustFunds) {
            await ctx.db.delete(fund._id);
        }

        return `Cleared ${budgetItems.length} budget items, ${projects.length} projects, ${trustFunds.length} trust funds`;
    },
});
