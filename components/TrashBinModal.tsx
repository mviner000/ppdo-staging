// components/TrashBinModal.tsx - COMPLETE UPDATED FILE

"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Trash2,
  RotateCcw,
  CheckSquare,
  Square,
  Loader2,
  Search
} from "lucide-react";
import { toast } from "sonner";
import { useAccentColor } from "../contexts/AccentColorContext";

// 🆕 UPDATED: Added fund types to type union
type EntityType = "budget" | "project" | "breakdown" | "trustFund" | "specialEducationFund" | "specialHealthFund";

interface TrashBinModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: EntityType;
}

export function TrashBinModal({ isOpen, onClose, type }: TrashBinModalProps) {
  const { accentColorValue } = useAccentColor();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // 🆕 UPDATED: Dynamic Queries with all fund types support
  const trashItems = useQuery(
    type === "budget" ? api.budgetItems.getTrash :
      type === "project" ? api.projects.getTrash :
        type === "trustFund" ? api.trustFunds.getTrash :
          type === "specialEducationFund" ? api.specialEducationFunds.getTrash :
            type === "specialHealthFund" ? api.specialHealthFunds.getTrash :
              api.govtProjects.getTrash
  );

  // 🆕 UPDATED: Dynamic Mutations with all fund types support
  const restoreMutation = useMutation(
    type === "budget" ? api.budgetItems.restoreFromTrash :
      type === "project" ? api.projects.restoreFromTrash :
        type === "trustFund" ? api.trustFunds.restoreFromTrash :
          type === "specialEducationFund" ? api.specialEducationFunds.restoreFromTrash :
            type === "specialHealthFund" ? api.specialHealthFunds.restoreFromTrash :
              api.govtProjects.restoreFromTrash
  );

  const deleteMutation = useMutation(
    type === "budget" ? api.budgetItems.remove :
      type === "project" ? api.projects.remove :
        type === "trustFund" ? api.trustFunds.remove :
          type === "specialEducationFund" ? api.specialEducationFunds.remove :
            type === "specialHealthFund" ? api.specialHealthFunds.remove :
              api.govtProjects.deleteProjectBreakdown
  );

  // 🆕 UPDATED: Filter items with all fund types support
  const filteredItems = trashItems?.filter((item: any) => {
    const term = searchQuery.toLowerCase();
    if (type === "budget") return item.particulars.toLowerCase().includes(term);
    if (type === "project") return item.particulars.toLowerCase().includes(term) || item.implementingOffice.toLowerCase().includes(term);
    if (type === "trustFund") return item.projectTitle.toLowerCase().includes(term) || item.officeInCharge.toLowerCase().includes(term);
    if (type === "specialEducationFund") return item.projectTitle.toLowerCase().includes(term) || item.officeInCharge.toLowerCase().includes(term);
    if (type === "specialHealthFund") return item.projectTitle.toLowerCase().includes(term) || item.officeInCharge.toLowerCase().includes(term);
    if (type === "breakdown") return item.projectName.toLowerCase().includes(term) || item.implementingOffice.toLowerCase().includes(term);
    return false;
  }) || [];

  // --- Helpers ---

  const handleToggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredItems.map((i: any) => i._id)));
    }
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(val || 0);

  const formatDate = (ts?: number) =>
    ts ? new Date(ts).toLocaleDateString() : "N/A";

  // 🆕 UPDATED: ACTIONS with all fund types support
  const handleRestore = async (ids: string[]) => {
    if (!ids.length) return;
    setIsProcessing(true);
    try {
      await Promise.all(ids.map(id => {
        if (type === "budget") {
          return restoreMutation({ id: id as Id<"budgetItems"> });
        } else if (type === "project") {
          return restoreMutation({ id: id as Id<"projects"> });
        } else if (type === "trustFund") {
          return restoreMutation({ id: id as Id<"trustFunds"> });
        } else if (type === "specialEducationFund") {
          return restoreMutation({ id: id as Id<"specialEducationFunds"> });
        } else if (type === "specialHealthFund") {
          return restoreMutation({ id: id as Id<"specialHealthFunds"> });
        } else {
          return restoreMutation({ breakdownId: id as Id<"govtProjectBreakdowns"> });
        }
      }));

      toast.success(`Restored ${ids.length} item(s) successfully`);
      setSelectedIds(new Set());
    } catch (error) {
      toast.error("Failed to restore items");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteForever = async (ids: string[]) => {
    if (!ids.length) return;
    if (!confirm("Are you sure? This action is irreversible.")) return;

    setIsProcessing(true);
    try {
      await Promise.all(ids.map(id => {
        if (type === "budget") {
          return deleteMutation({ id: id as Id<"budgetItems"> });
        } else if (type === "project") {
          return deleteMutation({ id: id as Id<"projects"> });
        } else if (type === "trustFund") {
          return deleteMutation({ id: id as Id<"trustFunds"> });
        } else if (type === "specialEducationFund") {
          return deleteMutation({ id: id as Id<"specialEducationFunds"> });
        } else if (type === "specialHealthFund") {
          return deleteMutation({ id: id as Id<"specialHealthFunds"> });
        } else {
          return deleteMutation({ breakdownId: id as Id<"govtProjectBreakdowns"> });
        }
      }));

      toast.success(`Permanently deleted ${ids.length} item(s)`);
      setSelectedIds(new Set());
    } catch (error) {
      toast.error("Failed to delete items");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  // 🆕 UPDATED: Title with all fund types support
  const getTitle = () => {
    switch (type) {
      case "budget": return "Budget Items";
      case "project": return "Projects";
      case "trustFund": return "Trust Funds";
      case "specialEducationFund": return "Special Education Funds";
      case "specialHealthFund": return "Special Health Funds";
      case "breakdown": return "Breakdowns";
      default: return "Items";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="w-[95vw] h-[90vh] flex flex-col bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
        style={{ maxWidth: '1200px', maxHeight: '900px' }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Trash2 className="w-5 h-5 text-zinc-500" />
            Trash Bin: {getTitle()}
          </DialogTitle>
          <DialogDescription>
            Items in the trash can be restored or permanently deleted.
          </DialogDescription>
        </DialogHeader>

        {/* Toolbar */}
        <div className="flex items-center justify-between py-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2 flex-1 mr-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
              <input
                placeholder="Search trash..."
                className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-md pl-9 pr-4 py-2 text-sm outline-none focus:ring-2"
                style={{ '--tw-ring-color': accentColorValue } as any}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {selectedIds.size > 0 && (
              <>
                <span className="text-sm text-zinc-500 mr-2">{selectedIds.size} selected</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRestore(Array.from(selectedIds))}
                  disabled={isProcessing}
                  className="gap-2 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                >
                  <RotateCcw className="w-4 h-4" />
                  Restore
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteForever(Array.from(selectedIds))}
                  disabled={isProcessing}
                  className="gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Forever
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Table Area */}
        <div className="flex-1 overflow-auto min-h-[300px]">
          {trashItems === undefined ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-zinc-500">
              <Trash2 className="w-12 h-12 mb-4 opacity-20" />
              <p>Trash is empty</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-950/50 sticky top-0 z-10">
                <tr className="border-b border-zinc-200 dark:border-zinc-800">
                  <th className="w-10 px-4 py-3">
                    <button onClick={handleSelectAll} className="flex items-center justify-center">
                      {selectedIds.size === filteredItems.length && filteredItems.length > 0 ?
                        <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-zinc-400" />
                      }
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">Item Details</th>
                  <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">Office</th>
                  <th className="px-4 py-3 text-right font-medium text-zinc-600 dark:text-zinc-400">Amount</th>
                  <th className="px-4 py-3 text-right font-medium text-zinc-600 dark:text-zinc-400">Deleted</th>
                  <th className="px-4 py-3 text-right font-medium text-zinc-600 dark:text-zinc-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {filteredItems.map((item: any) => (
                  <tr key={item._id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                    <td className="px-4 py-3">
                      <button onClick={() => handleToggleSelect(item._id)}>
                        {selectedIds.has(item._id) ?
                          <CheckSquare className="w-4 h-4 text-blue-500" /> : <Square className="w-4 h-4 text-zinc-300" />
                        }
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-zinc-900 dark:text-zinc-100">
                        {/* 🆕 UPDATED: Display fund title */}
                        {type === "budget" ? item.particulars :
                          type === "project" ? item.particulars :
                            type === "trustFund" ? item.projectTitle :
                              type === "specialEducationFund" ? item.projectTitle :
                                type === "specialHealthFund" ? item.projectTitle :
                                  item.projectName || item.projectTitle || "Untitled"}
                      </div>
                      <div className="text-xs text-zinc-500">
                        ID: {item._id.slice(-6)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                      {/* 🆕 UPDATED: Display fund office */}
                      {(type === "trustFund" || type === "specialEducationFund" || type === "specialHealthFund") ? item.officeInCharge : item.implementingOffice || "-"}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-zinc-700 dark:text-zinc-300">
                      {/* 🆕 UPDATED: Display fund received amount */}
                      {formatCurrency(
                        (type === "trustFund" || type === "specialEducationFund" || type === "specialHealthFund") ? item.received :
                          item.totalBudgetAllocated || item.allocatedBudget
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-zinc-500 text-xs">
                      {formatDate(item.deletedAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleRestore([item._id])}
                          className="p-1 hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600 rounded"
                          title="Restore"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteForever([item._id])}
                          className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 rounded"
                          title="Delete Permanently"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}