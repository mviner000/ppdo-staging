// app/dashboard/particulars/_components/ParticularTypeSelector.tsx

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, FolderKanban } from "lucide-react";

interface YearCount {
  year: number | "all";
  count: number;
}

interface ParticularTypeSelectorProps {
  budgetYearCounts: YearCount[];
  projectYearCounts: YearCount[];
  selectedType: "budget" | "project";
  onSelectType: (type: "budget" | "project") => void;
}

export function ParticularTypeSelector({
  budgetYearCounts,
  projectYearCounts,
  selectedType,
  onSelectType,
}: ParticularTypeSelectorProps) {
  // Get total counts
  const budgetTotal = budgetYearCounts.find(y => y.year === "all")?.count || 0;
  const projectTotal = projectYearCounts.find(y => y.year === "all")?.count || 0;

  // Get year breakdown (exclude "all")
  const budgetYears = budgetYearCounts.filter(y => y.year !== "all");
  const projectYears = projectYearCounts.filter(y => y.year !== "all");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* Budget Particulars Card */}
      <Card
        className={`cursor-pointer transition-all hover:shadow-lg ${
          selectedType === "budget"
            ? "ring-2 ring-blue-500 dark:ring-blue-400 shadow-lg"
            : "hover:ring-2 hover:ring-gray-300 dark:hover:ring-gray-600"
        }`}
        onClick={() => onSelectType("budget")}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-lg">Budget Particulars</CardTitle>
                <p className="text-sm text-gray-500">Budget item categories</p>
              </div>
            </div>
            {selectedType === "budget" && (
              <Badge variant="default" className="bg-blue-500">
                Selected
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Total Count */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total</span>
              <span className="text-2xl font-bold">{budgetTotal}</span>
            </div>

            {/* Year Breakdown */}
            {budgetYears.length > 0 && (
              <div className="pt-3 border-t">
                <p className="text-xs text-gray-500 mb-2">By Year:</p>
                <div className="flex flex-wrap gap-2">
                  {budgetYears.map(({ year, count }) => (
                    <Badge key={year} variant="outline" className="text-xs">
                      {year}: {count}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Project Particulars Card */}
      <Card
        className={`cursor-pointer transition-all hover:shadow-lg ${
          selectedType === "project"
            ? "ring-2 ring-purple-500 dark:ring-purple-400 shadow-lg"
            : "hover:ring-2 hover:ring-gray-300 dark:hover:ring-gray-600"
        }`}
        onClick={() => onSelectType("project")}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <FolderKanban className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <CardTitle className="text-lg">Project Particulars</CardTitle>
                <p className="text-sm text-gray-500">Project type categories</p>
              </div>
            </div>
            {selectedType === "project" && (
              <Badge variant="default" className="bg-purple-500">
                Selected
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Total Count */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total</span>
              <span className="text-2xl font-bold">{projectTotal}</span>
            </div>

            {/* Year Breakdown */}
            {projectYears.length > 0 && (
              <div className="pt-3 border-t">
                <p className="text-xs text-gray-500 mb-2">By Year:</p>
                <div className="flex flex-wrap gap-2">
                  {projectYears.map(({ year, count }) => (
                    <Badge key={year} variant="outline" className="text-xs">
                      {year}: {count}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}