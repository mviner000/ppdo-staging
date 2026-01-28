import { MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";

type FundType = "trustFunds" | "specialEducationFunds" | "specialHealthFunds";

/**
 * Recalculates financial metrics for a specific fund based on its breakdowns.
 * 
 * Logic:
 * 1. Checks if the fund has `autoCalculateFinancials` enabled.
 * 2. If enabled, sums up `obligatedBudget` and `budgetUtilized` from all non-deleted breakdowns.
 * 3. Updates the fund's `obligatedPR`, `utilized`, `balance`, and `utilizationRate`.
 * 
 * @param ctx Mutation Context
 * @param fundId The ID of the fund to recalculate
 * @param fundType The collection name of the fund
 * @param userId The ID of the user triggering the calculation
 */
export async function recalculateFundMetrics(
    ctx: MutationCtx,
    fundId: Id<FundType>,
    fundType: FundType,
    userId: Id<"users">
) {
    const fund = await ctx.db.get(fundId);
    if (!fund || fund.isDeleted) return;

    // Only auto-calculate if flag is explicitly True
    // (undefined defaults to false/manual for backward compatibility)
    if (!fund.autoCalculateFinancials) return;

    // Determine breakdown table name based on fund type
    let breakdownTable: "trustFundBreakdowns" | "specialEducationFundBreakdowns" | "specialHealthFundBreakdowns";
    let parentIdField: string;

    switch (fundType) {
        case "trustFunds":
            breakdownTable = "trustFundBreakdowns";
            parentIdField = "trustFundId";
            break;
        case "specialEducationFunds":
            breakdownTable = "specialEducationFundBreakdowns";
            parentIdField = "specialEducationFundId";
            break;
        case "specialHealthFunds":
            breakdownTable = "specialHealthFundBreakdowns";
            parentIdField = "specialHealthFundId";
            break;
        default:
            console.error(`Unknown fund type: ${fundType}`);
            return;
    }

    // Fetch all active breakdowns for this fund
    const breakdowns = await ctx.db
        .query(breakdownTable)
        .withIndex(parentIdField as any, (q) => q.eq(parentIdField as any, fundId))
        .collect();

    const activeBreakdowns = breakdowns.filter((b) => !b.isDeleted);

    // Sum up financials
    let totalObligated = 0;
    let totalUtilized = 0;

    for (const b of activeBreakdowns) {
        if (b.obligatedBudget) totalObligated += b.obligatedBudget;
        if (b.budgetUtilized) totalUtilized += b.budgetUtilized;
    }

    // Calculate Balance and Utilization Rate
    // Balance = Received - Utilized (Standard accounting for these funds)
    // Note: Some logic might use Allocated vs Utilized, but for Funds, 'received' is the main 'budget'.

    const currentReceived = fund.received || 0;
    const balance = currentReceived - totalUtilized;

    const utilizationRate = currentReceived > 0
        ? (totalUtilized / currentReceived) * 100
        : 0;

    // Update Fund
    await ctx.db.patch(fundId, {
        obligatedPR: totalObligated,
        utilized: totalUtilized,
        balance: balance,
        utilizationRate: utilizationRate,
        updatedAt: Date.now(),
        updatedBy: userId,
    });
}
