"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { Plus, CheckCircle2, Clock, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { BugsSuggestionsDataTable, MediaThumbnails } from "@/components/ppdo/dashboard/BugsSuggestionsDataTable";
import { SuggestionModal } from "@/components/maintenance/SuggestionModal";

export default function SuggestionsPage() {
  const router = useRouter();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Fetch all suggestions
  const suggestions = useQuery(api.suggestions.getAll);

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => <span className="font-medium text-stone-900 dark:text-stone-100">{row.getValue("title")}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        let colorClass = "";
        let icon = null;
        let label = "";

        switch (status) {
          case "acknowledged":
            colorClass = "bg-[#15803D]/10 text-[#15803D] border-[#15803D]/20";
            icon = <CheckCircle2 className="w-3 h-3 mr-1" />;
            label = "Acknowledged";
            break; // Added break
          case "to_review":
            colorClass = "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800";
            icon = <Clock className="w-3 h-3 mr-1" />;
            label = "To Review";
            break;
          case "denied":
            colorClass = "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800";
            icon = <XCircle className="w-3 h-3 mr-1" />;
            label = "Denied";
            break;
          default:
            colorClass = "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
            icon = <Clock className="w-3 h-3 mr-1" />;
            label = "Pending";
        }

        return (
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${colorClass}`}>
            {icon}
            {label}
          </span>
        );
      },
    },
    {
      accessorKey: "submitter",
      header: "Suggested By",
      cell: ({ row }) => {
        const submitter = row.original.submitter;
        if (!submitter) return <span className="text-muted-foreground text-xs">Unknown</span>;

        let name = "Unknown";
        if (submitter.firstName || submitter.lastName) {
          name = [submitter.firstName, submitter.lastName].filter(Boolean).join(" ");
        } else if (submitter.name) {
          name = submitter.name;
        } else if (submitter.email) {
          name = submitter.email;
        }
        return <span className="text-sm text-stone-600 dark:text-stone-400">{name}</span>;
      },
    },
    {
      accessorKey: "submittedAt",
      header: "Date",
      cell: ({ row }) => {
        return <span className="text-xs text-muted-foreground whitespace-nowrap">
          {new Date(row.getValue("submittedAt")).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
          })}
        </span>
      }
    },
    {
      id: "multimedia",
      header: "Media",
      cell: ({ row }) => {
        return <MediaThumbnails multimedia={row.original.multimedia} />
      }
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Suggestions</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Share your ideas to improve the system
          </p>
        </div>

        <Button
          className="gap-2 bg-[#15803D] hover:bg-[#15803D]/90 text-white"
          onClick={() => setIsCreateDialogOpen(true)}
        >
          <Plus className="w-4 h-4" />
          Submit Suggestion
        </Button>

        <SuggestionModal
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
        />
      </div>

      <BugsSuggestionsDataTable
        columns={columns}
        data={suggestions || []}
        loading={suggestions === undefined}
        onRowClick={(row) => router.push(`/dashboard/settings/updates/suggestions/${row._id}`)}
      />
    </div>
  );
}