"use client";

import { Eye, EyeOff, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ActivityLogSheet } from "@/components/ActivityLogSheet";

interface FundsPageHeaderProps {
    year: number;
    showDetails: boolean;
    onToggleDetails: () => void;
    pageTitle: string;
    pageDescription?: string;
    activityLogType: "trustFund" | "specialEducationFund" | "specialHealthFund";
}

export function FundsPageHeader({
    year,
    showDetails,
    onToggleDetails,
    pageTitle,
    pageDescription = "Monitor fund allocation, utilization, and project status",
    activityLogType
}: FundsPageHeaderProps) {
    return (
        <div className="mb-6 no-print">
            <div className="flex items-start justify-between gap-4 mb-1">
                <div>
                    <h1
                        className="text-3xl sm:text-4xl font-semibold text-zinc-900 dark:text-zinc-100"
                        style={{ fontFamily: "var(--font-cinzel), serif" }}
                    >
                        {pageTitle} {year}
                    </h1>
                    <p className="text-zinc-600 dark:text-zinc-400 mt-1">
                        {pageDescription} for year {year}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {/* Show Details Toggle Button */}
                    <Button
                        onClick={onToggleDetails}
                        variant="outline"
                        size="sm"
                        className="gap-2 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                        {showDetails ? (
                            <>
                                <EyeOff className="w-4 h-4" />
                                <span className="hidden sm:inline">Hide Details</span>
                            </>
                        ) : (
                            <>
                                <Eye className="w-4 h-4" />
                                <span className="hidden sm:inline">Show Details</span>
                            </>
                        )}
                    </Button>

                    {/* Activity Log Button */}
                    <ActivityLogSheet
                        type={activityLogType}
                        entityId="all"
                        title={`${pageTitle} Activity Log - ${year}`}
                        trigger={
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            >
                                <History className="w-4 h-4" />
                                <span className="hidden sm:inline">Activity Log</span>
                            </Button>
                        }
                    />
                </div>
            </div>
        </div>
    );
}
