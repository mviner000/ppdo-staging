// app/dashboard/special-education-funds/[year]/page.tsx

"use client";

import { use, useState, useMemo } from "react";
import { useFundsData, useFundsMutations, FundsPageHeader, FundsStatistics, FundsTable, FundForm } from "@/components/ppdo/funds";
import { api } from "@/convex/_generated/api";
import { TrashBinModal } from "@/components/TrashBinModal";
import { Skeleton } from "@/components/ui/skeleton";

interface PageProps {
    params: Promise<{ year: string }>;
}

export default function YearSpecialEducationFundsPage({ params }: PageProps) {
    const { year: yearParam } = use(params);
    const year = parseInt(yearParam);

    // Use shared hooks with Special Education Funds API
    const { funds, statistics, isLoading } = useFundsData({
        listQuery: api.specialEducationFunds.list,
        statsQuery: api.specialEducationFunds.getStatistics,
        converter: (fund) => ({ ...fund, id: fund._id }),
    });

    const { handleAdd, handleEdit, handleDelete } = useFundsMutations({
        createMutation: api.specialEducationFunds.create,
        updateMutation: api.specialEducationFunds.update,
        moveToTrashMutation: api.specialEducationFunds.moveToTrash,
        entityName: "special education fund"
    });

    const [showTrashModal, setShowTrashModal] = useState(false);
    const [showDetails, setShowDetails] = useState(true);

    // Filter funds by year
    const yearFilteredFunds = useMemo(() => {
        if (isNaN(year)) return funds;
        return funds.filter((fund) => fund.year === year);
    }, [funds, year]);

    // Calculate statistics and status summary for filtered items
    const { yearStatistics, statusCounts } = useMemo(() => {
        if (yearFilteredFunds.length === 0) {
            return {
                yearStatistics: {
                    totalReceived: 0,
                    totalUtilized: 0,
                    totalBalance: 0,
                    totalProjects: 0,
                },
                statusCounts: {
                    active: 0,
                    not_yet_started: 0,
                    on_process: 0,
                    ongoing: 0,
                    completed: 0,
                    not_available: 0
                }
            };
        }

        const stats = yearFilteredFunds.reduce(
            (acc, fund) => {
                acc.totalReceived += fund.received;
                acc.totalUtilized += fund.utilized;
                acc.totalBalance += fund.balance;

                // Handle all status types including 'active'
                const status = fund.status || 'not_available';

                // Explicitly check each status type
                switch (status) {
                    case 'active':
                        acc.counts.active = (acc.counts.active || 0) + 1;
                        break;
                    case 'not_yet_started':
                        acc.counts.not_yet_started++;
                        break;
                    case 'on_process':
                        acc.counts.on_process++;
                        break;
                    case 'ongoing':
                        acc.counts.ongoing++;
                        break;
                    case 'completed':
                        acc.counts.completed++;
                        break;
                    case 'not_available':
                    default:
                        acc.counts.not_available++;
                        break;
                }

                return acc;
            },
            {
                totalReceived: 0,
                totalUtilized: 0,
                totalBalance: 0,
                counts: {
                    active: 0,
                    not_yet_started: 0,
                    on_process: 0,
                    ongoing: 0,
                    completed: 0,
                    not_available: 0
                }
            }
        );

        return {
            yearStatistics: {
                totalReceived: stats.totalReceived,
                totalUtilized: stats.totalUtilized,
                totalBalance: stats.totalBalance,
                totalProjects: yearFilteredFunds.length,
            },
            statusCounts: stats.counts
        };
    }, [yearFilteredFunds]);

    if (isLoading) {
        return (
            <div className="p-6 space-y-6">
                <div className="space-y-2">
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="h-4 w-96" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <Skeleton key={i} className="h-32" />
                    ))}
                </div>

                <Skeleton className="h-96" />
            </div>
        );
    }

    // Validate year
    if (isNaN(year)) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <div className="text-center">
                    <p className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
                        Invalid Year
                    </p>
                    <p className="text-zinc-600 dark:text-zinc-400">
                        The year parameter "{yearParam}" is not valid.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <FundsPageHeader
                year={year}
                showDetails={showDetails}
                onToggleDetails={() => setShowDetails(!showDetails)}
                pageTitle="Special Education Funds"
                pageDescription="Manage special education fund allocations and utilization"
                activityLogType="specialEducationFund"
            />

            {showDetails && (
                <FundsStatistics
                    totalReceived={yearStatistics.totalReceived}
                    totalUtilized={yearStatistics.totalUtilized}
                    totalBalance={yearStatistics.totalBalance}
                    totalProjects={yearStatistics.totalProjects}
                    statusCounts={statusCounts}
                />
            )}

            <FundsTable
                data={yearFilteredFunds}
                year={year}
                fundType="specialEducation"
                title="Special Education Funds"
                searchPlaceholder="Search special education funds..."
                emptyMessage="No special education funds found"
                activityLogType="specialEducationFund"
                onAdd={handleAdd}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onOpenTrash={() => setShowTrashModal(true)}
                FormComponent={FundForm}
            />

            <TrashBinModal
                isOpen={showTrashModal}
                onClose={() => setShowTrashModal(false)}
                type="specialEducationFund"
            />
        </div>
    );
}
