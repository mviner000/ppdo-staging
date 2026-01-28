// app/dashboard/settings/updates/bugs-report/[id]/page.tsx

"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, User, Calendar, CheckCircle2, AlertCircle, Clock, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Id } from "@/convex/_generated/dataModel";

export default function BugReportDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const idParam = params.id as string;

    console.log("🔍 Bug Report Detail Page - Params:", params);
    console.log("🆔 ID Parameter:", idParam);

    // Convert string ID to Convex ID
    let reportId: Id<"bugReports"> | null = null;
    try {
        reportId = idParam as Id<"bugReports">;
        console.log("✅ Converted to Convex ID:", reportId);
    } catch (error) {
        console.error("❌ Invalid ID format:", error);
    }

    const report = useQuery(
        api.bugReports.getById,
        reportId ? { id: reportId } : "skip"
    );

    console.log("📄 Bug Report Data:", report);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "fixed":
                return "bg-[#15803D]/10 text-[#15803D] border-[#15803D]/20";
            case "not_fixed":
                return "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800";
            default:
                return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "fixed":
                return <CheckCircle2 className="w-4 h-4" />;
            case "not_fixed":
                return <AlertCircle className="w-4 h-4" />;
            default:
                return <Clock className="w-4 h-4" />;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case "fixed":
                return "Fixed";
            case "not_fixed":
                return "Not Fixed Yet";
            default:
                return "Pending";
        }
    };

    const handleSubmitAnother = () => {
        router.push("/dashboard/settings/updates/bugs-report");
    };

    if (!reportId) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Invalid Bug Report ID</h1>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                    The bug report ID format is invalid.
                </p>
                <Button onClick={() => router.push("/dashboard/settings/updates/bugs-report")}>
                    Back to Bug Reports
                </Button>
            </div>
        );
    }

    if (report === undefined) {
        console.log("⏳ Loading bug report...");
        return <BugReportSkeleton />;
    }

    if (report === null) {
        console.log("❌ Bug report not found");
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Bug Report Not Found</h1>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                    The bug report you're looking for doesn't exist or has been removed.
                </p>
                <Button onClick={() => router.push("/dashboard/settings/updates/bugs-report")}>
                    Back to Bug Reports
                </Button>
            </div>
        );
    }

    console.log("✅ Bug report loaded successfully:", report);

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20 px-4 sm:px-0">
            {/* Header Actions */}
            <div className="flex items-center justify-between">
                <Button
                    variant="ghost"
                    onClick={() => router.push("/dashboard/settings/updates/bugs-report")}
                    className="gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to list
                </Button>

                <Button
                    onClick={handleSubmitAnother}
                    className="gap-2 bg-[#15803D] hover:bg-[#15803D]/90 text-white shadow-sm"
                >
                    <PlusCircle className="w-4 h-4" />
                    Report Another Bug
                </Button>
            </div>

            {/* Main Content Card */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                {/* Header Section */}
                <div className="p-6 border-b border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-start justify-between gap-4">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                                {report.title}
                            </h1>
                            <span
                                className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                                    report.status
                                )}`}
                            >
                                {getStatusIcon(report.status)}
                                {getStatusText(report.status)}
                            </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>
                                    Submitted on{" "}
                                    {new Date(report.submittedAt).toLocaleDateString("en-US", {
                                        weekday: "long",
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sender Details */}
                <div className="px-6 py-4 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                            <span className="text-blue-700 dark:text-blue-300 font-semibold text-lg">
                                {(() => {
                                    const submitter = (report as any).submitter;
                                    if (submitter?.firstName) return submitter.firstName.charAt(0).toUpperCase();
                                    if (submitter?.name) return submitter.name.charAt(0).toUpperCase();
                                    if (submitter?.email) return submitter.email.charAt(0).toUpperCase();
                                    return "?";
                                })()}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {(() => {
                                    const submitter = (report as any).submitter;
                                    if (submitter?.firstName || submitter?.lastName) {
                                        const parts = [
                                            submitter.firstName,
                                            submitter.middleName,
                                            submitter.lastName,
                                            submitter.nameExtension,
                                        ].filter(Boolean);
                                        return parts.join(" ");
                                    }
                                    if (submitter?.name) return submitter.name;
                                    if (submitter?.email) return submitter.email;
                                    return report.submittedBy;
                                })()}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                <User className="w-3 h-3" />
                                <span>Reporter</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Rich Description */}
                <div className="p-8">
                    <div className="prose dark:prose-invert max-w-none">
                        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                            Description & Details
                        </h3>
                        <div
                            className="text-gray-900 dark:text-white leading-relaxed whitespace-pre-wrap"
                            dangerouslySetInnerHTML={{ __html: report.description }}
                        />
                    </div>
                </div>
            </div>

            {/* Footer Info / Meta */}
            <div className="text-center text-xs text-gray-400 dark:text-gray-500">
                Bug Report ID: {report._id}
            </div>
        </div>
    );
}

function BugReportSkeleton() {
    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20 px-4 sm:px-0">
            <div className="flex items-center justify-between">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-40" />
            </div>
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-zinc-800">
                    <div className="space-y-4">
                        <div className="flex justify-between">
                            <Skeleton className="h-8 w-2/3" />
                            <Skeleton className="h-8 w-24 rounded-full" />
                        </div>
                        <Skeleton className="h-4 w-1/3" />
                    </div>
                </div>
                <div className="px-6 py-4 border-b border-gray-200 dark:border-zinc-800">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-20" />
                        </div>
                    </div>
                </div>
                <div className="p-8 space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-40 w-full rounded-lg" />
                </div>
            </div>
        </div>
    );
}