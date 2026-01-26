// components/ppdo/funds/components/FundsStatistics.tsx

import React, { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MoreHorizontal } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { StatusCounts } from "../types";

export interface FundsStatisticsProps {
    totalReceived: number;
    totalUtilized: number;
    totalBalance: number;
    totalProjects: number;
    statusCounts: StatusCounts;
    labels?: {
        received?: string;
        utilized?: string;
        balance?: string;
        utilizationRate?: string;
        projects?: string;
    };
}

export function FundsStatistics({
    totalReceived,
    totalUtilized,
    totalBalance,
    totalProjects,
    statusCounts,
    labels = {
        received: "Total Funds Received",
        utilized: "Total Funds Utilized",
        balance: "Total Available Balance",
        utilizationRate: "Average Utilization Rate",
        projects: "Total Projects"
    }
}: FundsStatisticsProps) {
    const [showAllStatuses, setShowAllStatuses] = useState(false);

    const currency = useMemo(
        () =>
            new Intl.NumberFormat("en-PH", {
                style: "currency",
                currency: "PHP",
                maximumFractionDigits: 0,
            }),
        []
    );

    const utilizationRate = useMemo(() => {
        if (totalReceived === 0) return 0;
        return ((totalUtilized / totalReceived) * 100).toFixed(1);
    }, [totalReceived, totalUtilized]);

    // Define all possible statuses with their display configuration
    // Note: not_yet_started is hidden from UI (legacy - will be migrated to on_process)
    const statusConfig = [
        {
            key: 'on_process' as const,
            label: 'On Process',
            dotColor: 'bg-amber-500'
        },
        {
            key: 'ongoing' as const,
            label: 'Ongoing',
            dotColor: 'bg-zinc-600'
        },
        {
            key: 'completed' as const,
            label: 'Completed',
            dotColor: 'bg-zinc-700'
        },
    ];

    // Create the sub-description list for Total Projects
    const projectBreakdown = (
        <div className="mt-3 flex flex-col gap-1 text-xs text-zinc-500 dark:text-zinc-400">
            <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Status Breakdown</span>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                        >
                            <MoreHorizontal className="h-3.5 w-3.5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setShowAllStatuses(!showAllStatuses)}>
                            {showAllStatuses ? "Hide Other Subtotals" : "Show All Subtotals"}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {statusConfig.map((status) => {
                const count = statusCounts[status.key];
                return (
                    <div key={status.key} className="flex justify-between items-center">
                        <span className="flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${status.dotColor}`} />
                            {status.label}
                        </span>
                        <span className="font-mono tabular-nums">{count}</span>
                    </div>
                );
            })}

            {/* Divider and Total */}
            <div className="h-px bg-zinc-200 dark:bg-zinc-700 my-1" />
            <div className="flex justify-between items-center font-medium text-zinc-700 dark:text-zinc-300">
                <span>Total</span>
                <span className="font-mono tabular-nums">{totalProjects}</span>
            </div>
        </div>
    );

    return (
        <section
            aria-label="Fund statistics"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 no-print"
        >
            {/* Column 1: Total Received & Total Utilized (stacked vertically) */}
            <div className="flex flex-col gap-4">
                <StatCard
                    label={labels.received || "Total Funds Received"}
                    value={currency.format(totalReceived)}
                />
                <StatCard
                    label={labels.utilized || "Total Funds Utilized"}
                    value={currency.format(totalUtilized)}
                />
            </div>

            {/* Column 2: Total Balance & Average Utilization Rate (stacked vertically) */}
            <div className="flex flex-col gap-4">
                <StatCard
                    label={labels.balance || "Total Available Balance"}
                    value={currency.format(totalBalance)}
                />
                <StatCard
                    label={labels.utilizationRate || "Average Utilization Rate"}
                    value={`${utilizationRate}%`}
                />
            </div>

            {/* Column 3: Total Projects with Breakdown */}
            <div className="md:col-span-2 lg:col-span-1">
                <StatCard
                    label={labels.projects || "Total Projects"}
                    value={totalProjects.toLocaleString()}
                    subContent={projectBreakdown}
                />
            </div>
        </section>
    );
}

const StatCard = React.memo(function StatCard({
    label,
    value,
    subContent,
}: {
    label: string;
    value: string;
    subContent?: React.ReactNode;
}) {
    return (
        <Card role="group" aria-label={label} className="h-full">
            <CardContent className="-my-3 px-6 -mb-4">
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                    {label}
                </p>
                <p
                    className="text-2xl font-bold text-zinc-900 dark:text-zinc-100"
                    aria-live="polite"
                >
                    {value}
                </p>
                {subContent}
            </CardContent>
        </Card>
    );
});
