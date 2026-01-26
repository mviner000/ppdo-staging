// convex/init/seedMockData.ts
import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";

export const seedDatabase = mutation({
    args: {
        confirm: v.boolean(),
    },
    handler: async (ctx, args) => {
        if (!args.confirm) return "Seed not confirmed";

        const now = Date.now();

        // 1. Create a dummy user if none exists (for attribution)
        let adminUser = await ctx.db.query("users").first();
        let adminId: Id<"users">;

        if (!adminUser) {
            adminId = await ctx.db.insert("users", {
                name: "Mock Admin",
                email: "admin@mock.gov",
                role: "super_admin",
                createdAt: now,
                updatedAt: now,
            });
        } else {
            adminId = adminUser._id;
        }

        // 2. Departments
        const departments = [
            { name: "Provincial Planning & Development Office", code: "PPDO" },
            { name: "Provincial Engineering Office", code: "PEO" },
            { name: "Provincial Health Office", code: "PHO" },
            { name: "Provincial Agriculture Office", code: "PAgO" },
            { name: "Provincial Social Welfare & Development", code: "PSWDO" },
            { name: "Provincial Disaster Risk Reduction", code: "PDRRMO" },
            { name: "Provincial Tourism Office", code: "PTourO" },
            { name: "General Services Office", code: "GSO" },
            { name: "Human Resource Management Office", code: "HRMO" },
        ];

        const departmentIds: Record<string, Id<"departments">> = {};
        for (const d of departments) {
            const existing = await ctx.db.query("departments").withIndex("code", q => q.eq("code", d.code)).first();
            if (!existing) {
                const id = await ctx.db.insert("departments", {
                    ...d,
                    isActive: true,
                    createdBy: adminId,
                    createdAt: now,
                    updatedAt: now,
                });
                departmentIds[d.code] = id;
            } else {
                departmentIds[d.code] = existing._id;
            }
        }

        // 3. Particulars
        const particulars = [
            { code: "GAD", fullName: "Gender and Development" },
            { code: "LDRRMP", fullName: "Local Disaster Risk Reduction Management" },
            { code: "LCCAP", fullName: "Local Climate Change Action Plan" },
            { code: "20%_DF", fullName: "20% Development Fund" },
        ];

        for (const p of particulars) {
            const existing = await ctx.db.query("budgetParticulars").withIndex("code", q => q.eq("code", p.code)).first();
            if (!existing) {
                await ctx.db.insert("budgetParticulars", {
                    ...p,
                    isActive: true,
                    usageCount: 0,
                    projectUsageCount: 0,
                    createdBy: adminId,
                    createdAt: now,
                    updatedAt: now,
                });
            }
        }

        // 4. Budget Items
        const years = [2023, 2024, 2025, 2026];
        const budgetItemIds: Id<"budgetItems">[] = [];

        for (const year of years) {
            for (const p of particulars) {
                // Randomly pick a department
                const deptCode = departments[Math.floor(Math.random() * departments.length)].code;
                const deptId = departmentIds[deptCode];

                const allocated = Math.floor(Math.random() * 5000000) + 1000000;
                const utilized = Math.floor(Math.random() * allocated);
                const obligated = Math.floor(Math.random() * (allocated - utilized));

                const id = await ctx.db.insert("budgetItems", {
                    particulars: p.code,
                    year,
                    fiscalYear: year,
                    departmentId: deptId,
                    totalBudgetAllocated: allocated,
                    totalBudgetUtilized: utilized,
                    obligatedBudget: obligated,
                    utilizationRate: (utilized / allocated) * 100,
                    projectCompleted: Math.floor(Math.random() * 10),
                    projectDelayed: Math.floor(Math.random() * 3),
                    projectsOnTrack: Math.floor(Math.random() * 5),
                    status: "ongoing",
                    createdBy: adminId,
                    createdAt: now - (2026 - year) * 31536000000, // Offset by year
                    updatedAt: now,
                });
                budgetItemIds.push(id);
            }
        }

        // 5. Projects
        const projectTitles = [
            "Road Repair phase 1", "Health Center Expansion", "Water System Upgrade",
            "Sustainable Farming Support", "Typhoon Shelter Construction", "School Building Rehab",
            "Flood Control Project", "Public Market Modernization", "Bridge Reconstruction",
            "Livelihood Training Center", "Emergency Response Vehicles", "Mangrove Reforestation"
        ];

        for (let i = 0; i < 60; i++) {
            const budgetItem = await ctx.db.get(budgetItemIds[Math.floor(Math.random() * budgetItemIds.length)]);
            if (!budgetItem) continue;

            const title = `${projectTitles[i % projectTitles.length]} ${Math.floor(i / projectTitles.length) + 1}`;
            const allocated = Math.floor(Math.random() * 500000) + 50000;
            const utilized = Math.floor(Math.random() * allocated);
            const status = ["completed", "ongoing", "delayed"][Math.floor(Math.random() * 3)] as "completed" | "ongoing" | "delayed";

            await ctx.db.insert("projects", {
                particulars: title,
                budgetItemId: budgetItem._id,
                departmentId: budgetItem.departmentId,
                implementingOffice: departments.find(d => departmentIds[d.code] === budgetItem.departmentId)?.code || "PPDO",
                totalBudgetAllocated: allocated,
                totalBudgetUtilized: utilized,
                utilizationRate: (utilized / allocated) * 100,
                projectCompleted: status === "completed" ? 1 : 0,
                projectDelayed: status === "delayed" ? 1 : 0,
                projectsOnTrack: status === "ongoing" ? 1 : 0,
                status,
                year: budgetItem.year,
                createdBy: adminId,
                createdAt: budgetItem.createdAt + Math.random() * 1000000,
                updatedAt: now,
            });
        }

        // 6. Trust Funds
        const tfTitles = ["National Subsidy A", "UNICEF Grant Child Health", "DA Agriculture Fund", "LGU Equity Fund"];
        for (let i = 0; i < 20; i++) {
            const year = years[Math.floor(Math.random() * years.length)];
            const received = Math.floor(Math.random() * 10000000) + 2000000;
            const utilized = Math.floor(Math.random() * received);
            const deptCode = departments[Math.floor(Math.random() * departments.length)].code;

            await ctx.db.insert("trustFunds", {
                projectTitle: `${tfTitles[i % tfTitles.length]} ${year}`,
                officeInCharge: deptCode,
                departmentId: departmentIds[deptCode],
                received,
                utilized,
                balance: received - utilized,
                utilizationRate: (utilized / received) * 100,
                year,
                fiscalYear: year,
                status: "ongoing",
                createdBy: adminId,
                createdAt: now - (2026 - year) * 31536000000,
                updatedAt: now,
            });
        }

        return "Seed completed successfully";
    },
});
