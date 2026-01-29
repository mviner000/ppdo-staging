"use client";

import { use, useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { TrashBinModal } from "@/components/TrashBinModal";

// 20% DF Components
import { TwentyPercentDFTable } from "@/components/ppdo/twenty-percent-df/components/TwentyPercentDFTable";
import { TwentyPercentDFStatistics } from "@/components/ppdo/twenty-percent-df/components/TwentyPercentDFStatistics";
import { TwentyPercentDFYearHeader } from "./components/TwentyPercentDFYearHeader";

// Types
import { TwentyPercentDF } from "@/components/ppdo/twenty-percent-df/types";

interface PageProps {
    params: Promise<{ year: string }>;
}

export default function YearTwentyPercentDFPage({ params }: PageProps) {
    const { year: yearParam } = use(params);
    const year = parseInt(yearParam);

    // Fetch data
    const projectsRaw = useQuery(api.twentyPercentDF.list, { year });
    const projects = useMemo(() => projectsRaw || [], [projectsRaw]);
    const isLoading = projectsRaw === undefined;

    // Mutations (only for top-level page actions if needed, table handles most)
    const createProject = useMutation(api.twentyPercentDF.create);
    const moveToTrash = useMutation(api.twentyPercentDF.moveToTrash);

    const [showTrashModal, setShowTrashModal] = useState(false);
    const [showDetails, setShowDetails] = useState(true);

    // Calculate statistics
    const yearStatistics = useMemo(() => {
        if (projects.length === 0) {
            return {
                totalAllocated: 0,
                totalUtilized: 0,
                totalObligated: 0,
                averageUtilizationRate: 0,
                totalProjects: 0,
            };
        }

        const totalAllocated = projects.reduce((sum, p) => sum + p.totalBudgetAllocated, 0);
        const totalUtilized = projects.reduce((sum, p) => sum + p.totalBudgetUtilized, 0);
        const totalObligated = projects.reduce((sum, p) => sum + (p.obligatedBudget || 0), 0);
        const averageUtilizationRate = projects.reduce((sum, p) => sum + p.utilizationRate, 0) / projects.length;

        return {
            totalAllocated,
            totalUtilized,
            totalObligated,
            averageUtilizationRate,
            totalProjects: projects.length,
        };
    }, [projects]);

    const handleAdd = async (data: Omit<TwentyPercentDF, "id" | "utilizationRate" | "projectCompleted" | "projectDelayed" | "projectsOngoing" | "status"> & { autoCalculateBudgetUtilized?: boolean }) => {
        try {
            await createProject({
                ...data,
                year,
            });
            toast.success("Successfully added 20% DF item");
        } catch (error) {
            toast.error("Failed to add item");
            console.error(error);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await moveToTrash({ id: id as Id<"twentyPercentDF"> });
            toast.success("Moved to trash");
        } catch (error) {
            toast.error("Failed to delete item");
            console.error(error);
        }
    };

    if (isLoading) {
        return (
            <div className="p-6 space-y-6">
                <div className="space-y-2">
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="h-4 w-96" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Skeleton className="h-32" />
                    <Skeleton className="h-32" />
                    <Skeleton className="h-32" />
                </div>
                <Skeleton className="h-96" />
            </div>
        );
    }

    if (isNaN(year)) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <div className="text-center">
                    <p className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
                        Invalid Year
                    </p>
                    <p className="text-zinc-600 dark:text-zinc-400">
                        The year parameter &quot;{yearParam}&quot; is not valid.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <TwentyPercentDFYearHeader
                year={year}
                pageTitle="20% Development Fund"
                pageDescription="Monitor 20% development fund allocations and utilization"
                showDetails={showDetails}
                onToggleDetails={() => setShowDetails(!showDetails)}
                onOpenTrash={() => setShowTrashModal(true)}
                activityLogType="twentyPercentDF"
            />

            {showDetails && (
                <TwentyPercentDFStatistics
                    totalAllocated={yearStatistics.totalAllocated}
                    totalUtilized={yearStatistics.totalUtilized}
                    totalObligated={yearStatistics.totalObligated}
                    averageUtilizationRate={yearStatistics.averageUtilizationRate}
                    totalProjects={yearStatistics.totalProjects}
                    items={projects as any}
                />
            )}

            <TwentyPercentDFTable
                items={projects as any}
                budgetItemYear={year}
                onAdd={handleAdd}
                onDelete={handleDelete}
                onOpenTrash={() => setShowTrashModal(true)}
            />

            <TrashBinModal
                isOpen={showTrashModal}
                onClose={() => setShowTrashModal(false)}
                type="twentyPercentDF"
            />
        </div>
    );
}