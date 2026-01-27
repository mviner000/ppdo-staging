"use client"

import React from "react"

interface InspectionViewToggleProps {
  viewMode: "table" | "list"
  onChange: (mode: "table" | "list") => void
}

export const InspectionViewToggle: React.FC<InspectionViewToggleProps> = ({ viewMode, onChange }) => {
  return (
    <div className="inline-flex items-center gap-2 rounded-md bg-white dark:bg-gray-900 p-1 border border-gray-200 dark:border-gray-700">
      <button
        aria-pressed={viewMode === "table"}
        onClick={() => onChange("table")}
        className={`px-3 py-1 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${
          viewMode === "table"
            ? "bg-[#15803D] text-white"
            : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
        }`}
      >
        Table
      </button>

      <button
        aria-pressed={viewMode === "list"}
        onClick={() => onChange("list")}
        className={`px-3 py-1 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${
          viewMode === "list"
            ? "bg-[#15803D] text-white"
            : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
        }`}
      >
        List
      </button>
    </div>
  )
}
