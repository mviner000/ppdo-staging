// app/dashboard/particulars/_components/SearchResultCard.tsx

"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Folder, FileText, Boxes } from "lucide-react";

type NodeType = "budget" | "project" | "breakdown";

interface SearchResultCardProps {
  type: NodeType;
  item: any;
  parent?: string;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
  }).format(amount);
};

export function SearchResultCard({ type, item, parent }: SearchResultCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="shrink-0 mt-0.5">
            {type === "budget" && (
              <Folder className="h-5 w-5 text-blue-500" />
            )}
            {type === "project" && (
              <FileText className="h-5 w-5 text-purple-500" />
            )}
            {type === "breakdown" && (
              <Boxes className="h-5 w-5 text-green-500" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge
                variant="outline"
                className="text-xs capitalize shrink-0"
              >
                {type}
              </Badge>
              {type === "budget" && (
                <Badge variant="outline" className="text-xs font-mono">
                  {item.code}
                </Badge>
              )}
            </div>
            <h3 className="font-semibold text-sm mb-1 truncate">
              {type === "budget"
                ? item.fullName
                : type === "project"
                ? item.particulars
                : item.projectName}
            </h3>
            {parent && (
              <p className="text-xs text-gray-500 mb-2 truncate">
                {parent}
              </p>
            )}
            {(type === "project" ||
              type === "breakdown") && (
              <Badge variant="secondary" className="text-xs mb-2">
                {item.implementingOffice}
              </Badge>
            )}
            <div className="flex items-center justify-between mt-2 pt-2 border-t">
              <span className="text-xs text-gray-500">Budget</span>
              <span className="text-xs font-mono font-semibold">
                {formatCurrency(
                  type === "budget"
                    ? item.totalBudgetAllocated || 0
                    : type === "project"
                    ? item.totalBudgetAllocated || 0
                    : item.allocatedBudget || 0
                )}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}