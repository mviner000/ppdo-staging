import { Button } from "@/components/ui/button";
import { Calendar, Plus } from "lucide-react";

interface FiscalYearEmptyStateProps {
    onCreateFirst: () => void;
    accentColor?: string;
}

export function FiscalYearEmptyState({
    onCreateFirst,
    accentColor = "#15803D"
}: FiscalYearEmptyStateProps) {
    return (
        <div className="min-h-[300px] flex flex-col items-center justify-center text-center">
            <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                style={{ backgroundColor: `${accentColor}20` }}
            >
                <Calendar className="w-8 h-8" style={{ color: accentColor }} />
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                No fiscal years created yet.
            </p>
            <Button
                onClick={onCreateFirst}
                className="text-white"
                style={{ backgroundColor: accentColor }}
            >
                <Plus className="w-4 h-4" />
                Create First Fiscal Year
            </Button>
        </div>
    );
}
