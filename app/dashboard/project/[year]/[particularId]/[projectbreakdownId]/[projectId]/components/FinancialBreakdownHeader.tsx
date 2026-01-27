"use client"

import type React from "react"

export const tabs = [
  { id: "inspection", label: "Inspections" },
  { id: "overview", label: "Overview" },
  { id: "analytics", label: "Analytics" },
  { id: "remarks", label: "Remarks" },
  { id: "report", label: "Report" },
]

interface FinancialBreakdownHeaderProps {
  activeTab: string
  onTabChange: (id: string) => void
}

export const FinancialBreakdownHeader: React.FC<FinancialBreakdownHeaderProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="flex gap-0 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-t-lg">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-6 py-3 text-sm font-medium transition-all relative
                          ${
                            activeTab === tab.id
                              ? "text-[#15803D] dark:text-[#15803D] bg-white dark:bg-gray-900"
                              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                          }`}
        >
          {tab.label}
          {activeTab === tab.id && (
            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-[#15803D]"></div>
          )}
        </button>
      ))}
    </div>
  )
}
