// components/ppdo/funds/hooks/useFundsData.ts

/**
 * Generic hook for fetching fund data
 * Works with any fund type by accepting Convex API endpoints as parameters
 */

import { useQuery } from "convex/react";
import { useMemo } from "react";
import { FunctionReference } from "convex/server";
import { UseFundsDataReturn, FundStatistics } from "../types";

interface UseFundsDataOptions<TFund> {
    listQuery: FunctionReference<"query", "public", Record<string, never>, TFund[]>;
    statsQuery: FunctionReference<"query", "public", Record<string, never>, any>;
    converter?: (dbRecord: any) => TFund;
}

/**
 * Generic funds data hook
 * 
 * @example
 * // For Trust Funds
 * const { funds, statistics, isLoading } = useFundsData({
 *   listQuery: api.trustFunds.list,
 *   statsQuery: api.trustFunds.getStatistics,
 *   converter: convertTrustFundFromDB
 * });
 * 
 * @example
 * // For Special Education Funds
 * const { funds, statistics, isLoading } = useFundsData({
 *   listQuery: api.specialEducationFunds.list,
 *   statsQuery: api.specialEducationFunds.getStatistics,
 *   converter: convertSpecialEducationFundFromDB
 * });
 */
export function useFundsData<TFund = any>(
    options: UseFundsDataOptions<TFund>
): UseFundsDataReturn<TFund> {
    const { listQuery, statsQuery, converter } = options;

    // Fetch funds from Convex
    const fundsFromDB = useQuery(listQuery);
    const statisticsFromDB = useQuery(statsQuery);

    // Convert to frontend format
    const funds = useMemo(() => {
        if (!fundsFromDB) return [];
        if (converter) {
            return fundsFromDB.map(converter);
        }
        return fundsFromDB as TFund[];
    }, [fundsFromDB, converter]);

    // Statistics with defaults
    const statistics: FundStatistics = useMemo(() => {
        return {
            totalReceived: statisticsFromDB?.totalReceived || 0,
            totalUtilized: statisticsFromDB?.totalUtilized || 0,
            totalBalance: statisticsFromDB?.totalBalance || 0,
            totalProjects: statisticsFromDB?.totalProjects || 0,
            averageUtilizationRate: statisticsFromDB?.averageUtilizationRate || 0,
        };
    }, [statisticsFromDB]);

    const isLoading = fundsFromDB === undefined || statisticsFromDB === undefined;

    return {
        funds,
        statistics,
        isLoading,
    };
}
