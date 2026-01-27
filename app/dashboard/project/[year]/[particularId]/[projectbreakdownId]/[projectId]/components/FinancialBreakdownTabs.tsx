"use client"

import type React from "react"
import { useState } from "react"
import { Id, Doc } from "@/convex/_generated/dataModel"
import { Card } from "./Card"
import { FinancialBreakdownHeader, tabs } from "./FinancialBreakdownHeader"
import { FinancialBreakdownMain } from "./FinancialBreakdownMain"

interface FinancialBreakdownTabsProps {
  projectId: Id<"projects">
  breakdown: Doc<"govtProjectBreakdowns">
  project: Doc<"projects">
}

export const FinancialBreakdownTabs: React.FC<FinancialBreakdownTabsProps> = ({
  projectId,
  breakdown,
  project,
}) => {
  const [activeTab, setActiveTab] = useState(tabs[0].id)

  return (
    <Card className="border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
      {/* Tabs */}
      <FinancialBreakdownHeader activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Content */}
      <div className="pt-0">
        <FinancialBreakdownMain activeTab={activeTab} projectId={projectId} />
      </div>
    </Card>
  )
}
