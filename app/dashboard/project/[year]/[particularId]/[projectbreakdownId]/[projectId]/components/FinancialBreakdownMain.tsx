"use client"

import type React from "react"
import { Id } from "@/convex/_generated/dataModel"
import { OverviewContent } from "./tabs/OverviewContent"
import { AnalyticsContent } from "./tabs/AnalyticsContent"
import { InspectionContent } from "./tabs/InspectionContent"
import { RemarksContent } from "./tabs/RemarksContent"

interface FinancialBreakdownMainProps {
    activeTab: string
    projectId: Id<"projects">
}

const ReportContent: React.FC = () => {
    return (
        <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                Report Content Placeholder
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
                Report data summary and key recommendations would be displayed here.
            </p>
        </div>
    )
}

interface FinancialBreakdownMainPropsExt extends FinancialBreakdownMainProps {
    viewMode?: "table" | "list"
    onViewModeChange?: (mode: "table" | "list") => void
}

export const FinancialBreakdownMain: React.FC<FinancialBreakdownMainPropsExt> = ({
    activeTab,
    projectId,
    viewMode = "table",
    onViewModeChange,
}) => {
    switch (activeTab) {
        case "overview":
            return <OverviewContent projectId={projectId} />
        case "analytics":
            return <AnalyticsContent />
        case "inspection":
            return (
                <InspectionContent projectId={projectId} viewMode={viewMode} onViewModeChange={onViewModeChange} />
            )
        case "remarks":
            return <RemarksContent projectId={projectId} />
        case "report":
            return <ReportContent />
        default:
            return (
                <InspectionContent projectId={projectId} viewMode={viewMode} onViewModeChange={onViewModeChange} />
            )
    }
}
