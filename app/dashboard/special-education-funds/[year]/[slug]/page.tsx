// app/dashboard/special-education-funds/[year]/[slug]/page.tsx

"use client";

import { useState, useEffect, use } from "react";
import { useQuery, useMutation } from "convex/react";
import { toast } from "sonner";

// API & Models
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

// Contexts
import { useBreadcrumb } from "@/contexts/BreadcrumbContext";

// Centralized Breakdown Components
import {
    BreakdownHeader,
    EntityOverviewCards,
    BreakdownStatsAccordion,
    BreakdownHistoryTable,
    BreakdownForm,
    Breakdown,
} from "@/components/ppdo/breakdown";

// Shared Components
import { TrashBinModal } from "@/components/TrashBinModal";
import { Modal } from "@/app/dashboard/project/[year]/components/BudgetModal";
import { ConfirmationModal } from "@/app/dashboard/project/[year]/components/BudgetConfirmationModal";

// Shared Hooks
import { useEntityStats, useEntityMetadata } from "@/lib/hooks/useEntityStats";

// Utility function to extract Fund ID from slug
function extractFundId(slug: string): string {
    const parts = slug.split("-");
    return parts[parts.length - 1];
}

// Utility function to get status color
function getStatusColor(status?: string): string {
    if (!status) return "";
    switch (status.toLowerCase()) {
        case "completed":
            return "text-green-700 dark:text-green-300";
        case "delayed":
            return "text-red-700 dark:text-red-300";
        case "ongoing":
            return "text-blue-700 dark:text-blue-300";
        default:
            return "";
    }
}

interface PageProps {
    params: Promise<{ year: string; slug: string }>;
}

export default function SpecialEducationFundBreakdownPage({ params }: PageProps) {
    const { year, slug } = use(params);
    const { setCustomBreadcrumbs } = useBreadcrumb();

    // Extract ID
    const fundId = extractFundId(slug);

    // Local State
    const [showTrashModal, setShowTrashModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedBreakdown, setSelectedBreakdown] = useState<Breakdown | null>(null);
    const [showHeader, setShowHeader] = useState(false);

    // Queries
    const fund = useQuery(
        api.specialEducationFunds.get,
        fundId ? { id: fundId as Id<"specialEducationFunds"> } : "skip"
    );

    const breakdownHistory = useQuery(
        api.specialEducationFundBreakdowns.getBreakdowns,
        fund ? { specialEducationFundId: fundId as Id<"specialEducationFunds"> } : "skip"
    );

    // Hooks - Using shared hooks for statistics
    const stats = useEntityStats(breakdownHistory as Breakdown[] | undefined);
    const metadata = useEntityMetadata(breakdownHistory as Breakdown[] | undefined);

    // Effects - Breadcrumbs
    useEffect(() => {
        if (fund) {
            setCustomBreadcrumbs([
                { label: "Home", href: "/dashboard" },
                { label: "Special Education Funds", href: "/dashboard/special-education-funds" },
                { label: `${year}`, href: `/dashboard/special-education-funds/${year}` },
                { label: fund.projectTitle || "Loading..." },
            ]);
        }
        return () => setCustomBreadcrumbs(null);
    }, [fund, year, setCustomBreadcrumbs]);

    // Mutations
    const createBreakdown = useMutation(api.specialEducationFundBreakdowns.createBreakdown);
    const updateBreakdown = useMutation(api.specialEducationFundBreakdowns.updateBreakdown);
    const deleteBreakdown = useMutation(api.specialEducationFundBreakdowns.moveToTrash);

    // Handlers
    const handlePrint = () => window.print();

    const handleAdd = async (breakdownData: Omit<Breakdown, "_id">) => {
        try {
            if (!fund) {
                toast.error("Fund not found");
                return;
            }
            await createBreakdown({
                ...breakdownData,
                specialEducationFundId: fundId as Id<"specialEducationFunds">,
                reportDate: breakdownData.reportDate || Date.now(),
                reason: "Created via dashboard form",
            } as any);

            toast.success("Breakdown record created successfully!");
            setShowAddModal(false);
        } catch (error: any) {
            toast.error("Failed to create breakdown record", {
                description: error.message,
            });
        }
    };

    const handleUpdate = async (breakdownData: Omit<Breakdown, "_id">) => {
        try {
            if (!selectedBreakdown) {
                toast.error("No breakdown selected");
                return;
            }
            await updateBreakdown({
                id: selectedBreakdown._id as Id<"specialEducationFundBreakdowns">,
                ...breakdownData,
            } as any);

            toast.success("Breakdown record updated successfully!");
            setShowEditModal(false);
            setSelectedBreakdown(null);
        } catch (error: any) {
            toast.error("Failed to update breakdown record", {
                description: error.message,
            });
        }
    };

    const handleConfirmDelete = async () => {
        try {
            if (!selectedBreakdown) return;
            await deleteBreakdown({
                id: selectedBreakdown._id as Id<"specialEducationFundBreakdowns">,
                reason: "Moved to trash via dashboard confirmation",
            });
            toast.success("Breakdown record moved to trash!");
            setShowDeleteModal(false);
            setSelectedBreakdown(null);
        } catch (error) {
            toast.error("Failed to move breakdown record to trash");
        }
    };

    const handleEdit = (breakdown: Breakdown) => {
        setSelectedBreakdown(breakdown);
        setShowEditModal(true);
    };

    const handleDelete = (id: string) => {
        const breakdown = breakdownHistory?.find((b) => b._id === id);
        if (breakdown) {
            setSelectedBreakdown(breakdown as Breakdown);
            setShowDeleteModal(true);
        }
    };

    return (
        <>
            <BreakdownHeader
                backUrl={`/dashboard/special-education-funds/${year}`}
                backLabel="Back to Special Education Funds"
                entityName={fund?.projectTitle}
                entityType="specialeducationfund"
                implementingOffice={fund?.officeInCharge}
                year={year}
                subtitle={`Historical breakdown and progress tracking for ${year}`}
                showHeader={showHeader}
                setShowHeader={setShowHeader}
                showRecalculateButton={false}
                showActivityLog={true}
            />

            {showHeader && fund && (
                <EntityOverviewCards
                    entityType="specialeducationfund"
                    implementingOffice={fund.officeInCharge}
                    totalBudget={fund.received}
                    statusText={fund.status}
                    statusColor={getStatusColor(fund.status)}
                    year={year}
                    remarks={fund.remarks}
                    breakdownCounts={
                        stats
                            ? {
                                completed: stats.statusCounts.completed,
                                delayed: stats.statusCounts.delayed,
                                ongoing: stats.statusCounts.ongoing,
                            }
                            : undefined
                    }
                />
            )}

            {showHeader && stats && (
                <BreakdownStatsAccordion
                    stats={stats}
                    entityType="specialeducationfund"
                    uniqueOffices={metadata.uniqueOffices}
                    uniqueLocations={metadata.uniqueLocations}
                    getStatusColor={getStatusColor}
                />
            )}

            <div className="mb-6">
                {breakdownHistory === undefined ? (
                    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-12 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-zinc-300 border-t-transparent dark:border-zinc-700 dark:border-t-transparent"></div>
                        <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
                            Loading breakdown history...
                        </p>
                    </div>
                ) : (
                    <BreakdownHistoryTable
                        breakdowns={breakdownHistory as Breakdown[]}
                        onPrint={handlePrint}
                        onAdd={() => setShowAddModal(true)}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onOpenTrash={() => setShowTrashModal(true)}
                        entityType="specialeducationfund"
                    />
                )}
            </div>

            {showAddModal && fund && (
                <Modal
                    isOpen={showAddModal}
                    onClose={() => setShowAddModal(false)}
                    title="Add Breakdown Record"
                    size="xl"
                >
                    <BreakdownForm
                        defaultProjectName={fund.projectTitle}
                        defaultImplementingOffice={fund.officeInCharge}
                        projectId={fundId}
                        onSave={handleAdd}
                        onCancel={() => setShowAddModal(false)}
                        entityType="specialeducationfund"
                    />
                </Modal>
            )}

            {showEditModal && selectedBreakdown && (
                <Modal
                    isOpen={showEditModal}
                    onClose={() => {
                        setShowEditModal(false);
                        setSelectedBreakdown(null);
                    }}
                    title="Edit Breakdown Record"
                    size="xl"
                >
                    <BreakdownForm
                        breakdown={selectedBreakdown}
                        projectId={fundId}
                        onSave={handleUpdate}
                        onCancel={() => {
                            setShowEditModal(false);
                            setSelectedBreakdown(null);
                        }}
                        entityType="specialeducationfund"
                    />
                </Modal>
            )}

            {showDeleteModal && selectedBreakdown && (
                <ConfirmationModal
                    isOpen={showDeleteModal}
                    onClose={() => {
                        setShowDeleteModal(false);
                        setSelectedBreakdown(null);
                    }}
                    onConfirm={handleConfirmDelete}
                    title="Move to Trash"
                    message={`Are you sure you want to move this breakdown record for ${selectedBreakdown.implementingOffice} to trash?`}
                    confirmText="Move to Trash"
                    variant="danger"
                />
            )}

            <TrashBinModal
                isOpen={showTrashModal}
                onClose={() => setShowTrashModal(false)}
                type="breakdown"
            />
        </>
    );
}
