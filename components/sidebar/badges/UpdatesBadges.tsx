import React from "react";
import { useBadgeCounts } from "../hooks/useBadgeCounts";

const Badge = ({ count, color }: { count: number; color: string }) => {
    if (count <= 0) return null;

    return (
        <span
            className={`ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-medium ${color === "green"
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : color === "blue"
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                        : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
                }`}
        >
            {count}
        </span>
    );
};

export const BugsBadge = () => {
    // Always enabled because this component is only mounted when the submenu is expanded
    const { bugBadgeCount, bugBadgeColor } = useBadgeCounts(true);
    return <Badge count={bugBadgeCount} color={bugBadgeColor} />;
};

export const SuggestionsBadge = () => {
    // Always enabled because this component is only mounted when the submenu is expanded
    const { suggestionBadgeCount, suggestionBadgeColor } = useBadgeCounts(true);
    return <Badge count={suggestionBadgeCount} color={suggestionBadgeColor} />;
};
