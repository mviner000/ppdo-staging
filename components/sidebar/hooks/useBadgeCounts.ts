import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCurrentUser } from "@/app/hooks/useCurrentUser";

export function useBadgeCounts(isEnabled: boolean) {
    const { user } = useCurrentUser();
    const isSuperAdmin = user?.role === "super_admin";

    // Only run queries if enabled is true
    const commandArgs = isEnabled ? undefined : "skip";

    // 👤 User/Admin → personal reports
    const myReports = useQuery(
        api.bugReports.getMyReports,
        commandArgs === "skip" ? "skip" : undefined
    );

    // 👑 Always call stats (safe for all roles)
    const stats = useQuery(
        api.bugReports.getStats,
        commandArgs === "skip" ? "skip" : undefined
    );

    // 👤 User/Admin → pending bugs only
    const myPendingBugCount =
        myReports?.filter((r) => r.status === "pending").length || 0;

    // 👑 Super admin → ALL pending bugs
    const globalPendingBugCount = stats?.pending || 0;

    const bugBadgeCount = isSuperAdmin
        ? globalPendingBugCount
        : myPendingBugCount;

    const bugBadgeColor = isSuperAdmin ? "green" : "default";

    // 👤 User/Admin → personal suggestions
    const mySuggestions = useQuery(
        api.suggestions.getMySuggestions,
        commandArgs === "skip" ? "skip" : undefined
    );

    // 👑 Always call suggestion stats (safe for all roles)
    const suggestionStats = useQuery(
        api.suggestions.getStats,
        commandArgs === "skip" ? "skip" : undefined
    );

    // 👤 User/Admin → pending suggestions only
    const myPendingSuggestionCount =
        mySuggestions?.filter((s) => s.status === "pending").length || 0;

    // 👑 Super admin → ALL pending suggestions
    const globalPendingSuggestionCount = suggestionStats?.pending || 0;

    const suggestionBadgeCount = isSuperAdmin
        ? globalPendingSuggestionCount
        : myPendingSuggestionCount;

    const suggestionBadgeColor = isSuperAdmin ? "blue" : "default";

    return {
        bugBadgeCount,
        bugBadgeColor,
        suggestionBadgeCount,
        suggestionBadgeColor,
    };
}
