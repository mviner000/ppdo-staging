// app/dashboard/trust-funds/[year]/components/TrustFundsTable.tsx

"use client";

import { useState, useRef, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { useAccentColor } from "@/contexts/AccentColorContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowUpDown, 
  Pin,
  MoreVertical,
  Eye,
  Edit,
  Archive,
  GripVertical
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Modal } from "@/app/dashboard/project/[year]/components/Modal";
import { ConfirmationModal } from "@/app/dashboard/project/[year]/components/ConfirmationModal";
import { TrustFundForm } from "./TrustFundForm";
import { TrustFund } from "@/types/trustFund.types";
import { ActivityLogSheet } from "@/components/ActivityLogSheet";
import { TrustFundTableToolbar } from "./TrustFundTableToolbar";
import { TrustFundContextMenu } from "./TrustFundContextMenu";
import { PrintOrientationModal } from "./PrintOrientationModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Props = {
  data: TrustFund[];
  onAdd?: (data: any) => void;
  onEdit?: (id: string, data: any) => void;
  onDelete?: (id: string) => void;
  onOpenTrash?: () => void;
  year?: number;
};

type SortField = "projectTitle" | "officeInCharge" | "status" | "dateReceived" | "received" | "utilized" | "balance" | null;
type SortDirection = "asc" | "desc" | null;

interface ContextMenuState {
  x: number;
  y: number;
  entity: TrustFund;
}

// Available columns configuration
const AVAILABLE_COLUMNS = [
  { id: "projectTitle", label: "Project Title", expandable: true },
  { id: "officeInCharge", label: "Office In-Charge" },
  { id: "status", label: "Status" },
  { id: "dateReceived", label: "Date Received" },
  { id: "received", label: "Received" },
  { id: "obligatedPR", label: "Obligated PR" },
  { id: "utilized", label: "Utilized" },
  { id: "balance", label: "Balance" },
  { id: "remarks", label: "Remarks", expandable: true },
];

export function TrustFundsTable({ data, onAdd, onEdit, onDelete, onOpenTrash, year }: Props) {
  const { accentColorValue } = useAccentColor();
  
  // Mutations
  const togglePin = useMutation(api.trustFunds.togglePin);
  const bulkMoveToTrash = useMutation(api.trustFunds.bulkMoveToTrash);
  const updateStatus = useMutation(api.trustFunds.updateStatus);
  
  // Current user for permissions
  const currentUser = useQuery(api.users.current);
  
  // State
  const [selected, setSelected] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<TrustFund | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  
  // Activity Log State
  const [logSheetOpen, setLogSheetOpen] = useState(false);
  const [selectedLogItem, setSelectedLogItem] = useState<TrustFund | null>(null);

  // Context Menu State
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  // Column Visibility State
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());

  // Expandable Columns State
  const [expandedColumns, setExpandedColumns] = useState<Set<string>>(new Set());

  const searchInputRef = useRef<HTMLInputElement>(null);
  const isAdmin = currentUser?.role === "admin" || currentUser?.role === "super_admin";

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let result = [...data];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.projectTitle.toLowerCase().includes(query) ||
          item.officeInCharge.toLowerCase().includes(query) ||
          (item.status && item.status.toLowerCase().includes(query)) ||
          (item.remarks && item.remarks.toLowerCase().includes(query))
      );
    }

    // Sort
    if (sortField && sortDirection) {
      result.sort((a, b) => {
        let aVal: any = a[sortField];
        let bVal: any = b[sortField];

        // Handle null/undefined
        if (aVal === null || aVal === undefined) aVal = "";
        if (bVal === null || bVal === undefined) bVal = "";

        // String comparison
        if (typeof aVal === "string" && typeof bVal === "string") {
          return sortDirection === "asc"
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }

        // Number comparison
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      });
    }

    return result;
  }, [data, searchQuery, sortField, sortDirection]);

  // Calculate totals
  const totals = useMemo(() => {
    return filteredAndSortedData.reduce(
      (acc, item) => {
        acc.received += item.received;
        acc.obligatedPR += item.obligatedPR || 0;
        acc.utilized += item.utilized;
        acc.balance += item.balance;
        return acc;
      },
      { received: 0, obligatedPR: 0, utilized: 0, balance: 0 }
    );
  }, [filteredAndSortedData]);

  const allSelected = selected.length === filteredAndSortedData.length && filteredAndSortedData.length > 0;

  const toggleAll = () =>
    setSelected(allSelected ? [] : filteredAndSortedData.map((item) => item.id));

  const toggleOne = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(
        sortDirection === "asc" ? "desc" : sortDirection === "desc" ? null : "asc"
      );
      if (sortDirection === "desc") setSortField(null);
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handlePin = async (item: TrustFund) => {
    try {
      await togglePin({ id: item.id as Id<"trustFunds"> });
      toast.success(item.isPinned ? "Unpinned" : "Pinned to top");
    } catch (error) {
      toast.error("Failed to toggle pin");
    }
  };

  const handleBulkTrash = async () => {
    if (selected.length === 0) return;
    
    try {
      await bulkMoveToTrash({ ids: selected as Id<"trustFunds">[] });
      toast.success(`Moved ${selected.length} item(s) to trash`);
      setSelected([]);
    } catch (error) {
      toast.error("Failed to move items to trash");
    }
  };

  const handleStatusChange = async (itemId: string, newStatus: string) => {
    try {
      await updateStatus({ 
        id: itemId as Id<"trustFunds">, 
        status: newStatus as any,
        reason: "Status updated via quick dropdown"
      });
      toast.success("Status updated successfully");
    } catch (error) {
      toast.error("Failed to update status");
      console.error(error);
    }
  };

  const handleEdit = (item: TrustFund) => {
    setSelectedItem(item);
    setShowEditModal(true);
  };

  const handleDelete = (item: TrustFund) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  const handleViewLog = (item: TrustFund) => {
    setSelectedLogItem(item);
    setLogSheetOpen(true);
  };

  const handleContextMenu = (item: TrustFund, e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, entity: item });
  };

  const handleToggleColumn = (columnId: string, isChecked: boolean) => {
    const newHidden = new Set(hiddenColumns);
    if (isChecked) {
      newHidden.delete(columnId);
    } else {
      newHidden.add(columnId);
    }
    setHiddenColumns(newHidden);
  };

  const handleToggleExpandColumn = (columnId: string) => {
    const newExpanded = new Set(expandedColumns);
    if (newExpanded.has(columnId)) {
      newExpanded.delete(columnId);
    } else {
      newExpanded.add(columnId);
    }
    setExpandedColumns(newExpanded);
  };

  const handleExportCSV = () => {
    try {
      const headers = AVAILABLE_COLUMNS.filter(col => !hiddenColumns.has(col.id)).map(col => col.label);
      const rows = filteredAndSortedData.map(item => 
        AVAILABLE_COLUMNS
          .filter(col => !hiddenColumns.has(col.id))
          .map(col => {
            switch(col.id) {
              case "projectTitle": return item.projectTitle;
              case "officeInCharge": return item.officeInCharge;
              case "status": return formatStatus(item.status);
              case "dateReceived": return formatDate(item.dateReceived);
              case "received": return item.received;
              case "obligatedPR": return item.obligatedPR || 0;
              case "utilized": return item.utilized;
              case "balance": return item.balance;
              case "remarks": return item.remarks || "";
              default: return "";
            }
          })
      );
      
      const csvContent = [
        headers.join(","),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
      ].join("\n");
      
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `trust-funds-${year || 'all'}-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast.success("CSV exported successfully");
    } catch (error) {
      toast.error("Failed to export CSV");
    }
  };

  const handlePrint = (orientation: 'portrait' | 'landscape') => {
    // Set print orientation via CSS
    const style = document.createElement('style');
    style.textContent = `
      @page {
        size: ${orientation === 'portrait' ? 'A4 portrait' : 'A4 landscape'};
        margin: 0.5in;
      }
      @media print {
        .no-print { display: none !important; }
        .print-area { break-inside: avoid; }
        body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
      }
    `;
    document.head.appendChild(style);
    
    setTimeout(() => {
      window.print();
      document.head.removeChild(style);
    }, 100);
    
    setShowPrintModal(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return "—";
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatStatus = (status?: string) => {
    if (!status) return "—";
    
    const statusConfig: Record<string, { label: string; className: string }> = {
      not_available: { label: "Not Available", className: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300" },
      not_yet_started: { label: "Not Yet Started", className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" },
      ongoing: { label: "Ongoing", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
      completed: { label: "Completed", className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" },
      active: { label: "Active", className: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" },
    };

    const config = statusConfig[status] || statusConfig.not_available;
    return config.label;
  };

  const getStatusClassName = (status?: string) => {
    if (!status) return "bg-zinc-100/50 text-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-300";
    
    const statusClasses: Record<string, string> = {
      not_available: "bg-zinc-100/50 text-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-300",
      not_yet_started: "bg-zinc-100/50 text-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-300",
      ongoing: "bg-zinc-200/50 text-zinc-800 dark:bg-zinc-700/50 dark:text-zinc-200",
      completed: "bg-zinc-300/50 text-zinc-900 dark:bg-zinc-600/50 dark:text-zinc-100",
      active: "bg-zinc-400/50 text-zinc-900 dark:bg-zinc-500/50 dark:text-zinc-100",
    };

    return statusClasses[status] || statusClasses.not_available;
  };

  const isColumnVisible = (columnId: string) => !hiddenColumns.has(columnId);
  const isColumnExpanded = (columnId: string) => expandedColumns.has(columnId);

  return (
    <>
      <Card className="rounded-lg border print-area">
        {/* Toolbar */}
        <TrustFundTableToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchInputRef={searchInputRef}
          selectedCount={selected.length}
          onClearSelection={() => setSelected([])}
          hiddenColumns={hiddenColumns}
          onToggleColumn={handleToggleColumn}
          onShowAllColumns={() => setHiddenColumns(new Set())}
          onHideAllColumns={() => setHiddenColumns(new Set(AVAILABLE_COLUMNS.map(c => c.id)))}
          onExportCSV={handleExportCSV}
          onPrint={() => setShowPrintModal(true)}
          isAdmin={isAdmin}
          onOpenTrash={onOpenTrash}
          onBulkTrash={handleBulkTrash}
          onAddNew={onAdd ? () => setShowAddModal(true) : undefined}
          accentColor={accentColorValue}
        />

        {/* Table */}
        <CardContent className="p-0">
          <div className="relative max-h-[600px] overflow-auto">
            <Table className="w-full table-fixed text-sm">
              <colgroup>
                {isAdmin && <col className="w-[44px]" />}
                {isColumnVisible("projectTitle") && <col className={isColumnExpanded("projectTitle") ? "w-[400px]" : "w-[260px]"} />}
                {isColumnVisible("officeInCharge") && <col className="w-[200px]" />}
                {isColumnVisible("status") && <col className="w-[180px]" />}
                {isColumnVisible("dateReceived") && <col className="w-[130px]" />}
                {isColumnVisible("received") && <col className="w-[150px]" />}
                {isColumnVisible("obligatedPR") && <col className="w-[150px]" />}
                {isColumnVisible("utilized") && <col className="w-[150px]" />}
                {isColumnVisible("balance") && <col className="w-[150px]" />}
                {isColumnVisible("remarks") && <col className={isColumnExpanded("remarks") ? "w-[400px]" : "w-[200px]"} />}
                <col className="w-[80px]" />
              </colgroup>

              <TableHeader className="sticky top-0 z-10 bg-zinc-50 dark:bg-zinc-950">
                <TableRow className="h-10 border-b">
                  {isAdmin && (
                    <TableHead className="px-2 text-center">
                      <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
                    </TableHead>
                  )}

                  {isColumnVisible("projectTitle") && (
                    <TableHead
                      className="px-3 uppercase text-[11px] tracking-wide text-muted-foreground font-medium cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      onClick={() => handleSort("projectTitle")}
                    >
                      <div className="flex items-center gap-1">
                        {AVAILABLE_COLUMNS.find(c => c.id === "projectTitle")?.expandable && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleExpandColumn("projectTitle");
                            }}
                            className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                          >
                            <GripVertical className="h-3 w-3" />
                          </button>
                        )}
                        PROJECT TITLE
                        <ArrowUpDown className="h-3 w-3 opacity-40" />
                      </div>
                    </TableHead>
                  )}

                  {isColumnVisible("officeInCharge") && (
                    <TableHead
                      className="px-3 uppercase text-[11px] tracking-wide text-muted-foreground font-medium cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      onClick={() => handleSort("officeInCharge")}
                    >
                      <div className="flex items-center gap-1">
                        OFFICE IN-CHARGE
                        <ArrowUpDown className="h-3 w-3 opacity-40" />
                      </div>
                    </TableHead>
                  )}

                  {isColumnVisible("status") && (
                    <TableHead
                      className="px-3 uppercase text-[11px] tracking-wide text-muted-foreground font-medium cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      onClick={() => handleSort("status")}
                    >
                      <div className="flex items-center gap-1">
                        STATUS
                        <ArrowUpDown className="h-3 w-3 opacity-40" />
                      </div>
                    </TableHead>
                  )}

                  {isColumnVisible("dateReceived") && (
                    <TableHead
                      className="px-3 uppercase text-[11px] tracking-wide text-muted-foreground font-medium cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      onClick={() => handleSort("dateReceived")}
                    >
                      <div className="flex items-center gap-1">
                        DATE RECEIVED
                        <ArrowUpDown className="h-3 w-3 opacity-40" />
                      </div>
                    </TableHead>
                  )}

                  {isColumnVisible("received") && (
                    <TableHead
                      className="px-3 uppercase text-[11px] tracking-wide text-muted-foreground font-medium text-right cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      onClick={() => handleSort("received")}
                    >
                      <div className="flex w-full items-center justify-end gap-1">
                        RECEIVED
                        <ArrowUpDown className="h-3 w-3 opacity-40 shrink-0" />
                      </div>
                    </TableHead>
                  )}

                  {isColumnVisible("obligatedPR") && (
                    <TableHead className="px-3 uppercase text-[11px] tracking-wide text-muted-foreground font-medium text-right">
                      OBLIGATED PR
                    </TableHead>
                  )}

                  {isColumnVisible("utilized") && (
                    <TableHead
                      className="px-3 uppercase text-[11px] tracking-wide text-muted-foreground font-medium text-right cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      onClick={() => handleSort("utilized")}
                    >
                      <div className="flex w-full items-center justify-end gap-1">
                        UTILIZED
                        <ArrowUpDown className="h-3 w-3 opacity-40 shrink-0" />
                      </div>
                    </TableHead>
                  )}

                  {isColumnVisible("balance") && (
                    <TableHead
                      className="px-3 uppercase text-[11px] tracking-wide text-muted-foreground font-medium text-right cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      onClick={() => handleSort("balance")}
                    >
                      <div className="flex w-full items-center justify-end gap-1">
                        BALANCE
                        <ArrowUpDown className="h-3 w-3 opacity-40 shrink-0" />
                      </div>
                    </TableHead>
                  )}

                  {isColumnVisible("remarks") && (
                    <TableHead className="px-3 uppercase text-[11px] tracking-wide text-muted-foreground font-medium">
                      <div className="flex items-center gap-1">
                        {AVAILABLE_COLUMNS.find(c => c.id === "remarks")?.expandable && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleExpandColumn("remarks");
                            }}
                            className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                          >
                            <GripVertical className="h-3 w-3" />
                          </button>
                        )}
                        REMARKS
                      </div>
                    </TableHead>
                  )}

                  <TableHead className="px-3 uppercase text-[11px] tracking-wide text-muted-foreground font-medium text-center no-print">
                    ACTIONS
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredAndSortedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={20} className="text-center py-8 text-zinc-500">
                      No trust funds found
                    </TableCell>
                  </TableRow>
                ) : (
                  <>
                    {filteredAndSortedData.map((item) => (
                      <TableRow 
                        key={item.id} 
                        className="h-10 hover:bg-muted/40"
                        onContextMenu={(e) => handleContextMenu(item, e)}
                      >
                        {isAdmin && (
                          <TableCell className="px-2 text-center no-print">
                            <Checkbox
                              checked={selected.includes(item.id)}
                              onCheckedChange={() => toggleOne(item.id)}
                            />
                          </TableCell>
                        )}

                        {isColumnVisible("projectTitle") && (
                          <TableCell className="px-3 font-medium">
                            <div className="flex items-center gap-2">
                              {item.isPinned && (
                                <Pin className="h-3 w-3 text-amber-500 fill-amber-500 shrink-0" />
                              )}
                              <span className={isColumnExpanded("projectTitle") ? "" : "truncate"}>
                                {item.projectTitle}
                              </span>
                            </div>
                          </TableCell>
                        )}

                        {isColumnVisible("officeInCharge") && (
                          <TableCell className="px-3 truncate">
                            {item.officeInCharge}
                          </TableCell>
                        )}

                        {isColumnVisible("status") && (
                          <TableCell className="px-3" onClick={(e) => e.stopPropagation()}>
                            <Select
                              value={item.status || "not_available"}
                              onValueChange={(value) => handleStatusChange(item.id, value)}
                            >
                              <SelectTrigger 
                                className={`h-7 text-xs border-0 shadow-none focus:ring-1 ${getStatusClassName(item.status)}`}
                              >
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent align="start">
                                <SelectItem value="not_available" className="text-xs">
                                  <span className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-zinc-400" />
                                    Not Available
                                  </span>
                                </SelectItem>
                                <SelectItem value="not_yet_started" className="text-xs">
                                  <span className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-zinc-400" />
                                    Not Yet Started
                                  </span>
                                </SelectItem>
                                <SelectItem value="ongoing" className="text-xs">
                                  <span className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-zinc-500" />
                                    Ongoing
                                  </span>
                                </SelectItem>
                                <SelectItem value="completed" className="text-xs">
                                  <span className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-zinc-600" />
                                    Completed
                                  </span>
                                </SelectItem>
                                <SelectItem value="active" className="text-xs">
                                  <span className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-zinc-700" />
                                    Active
                                  </span>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        )}

                        {isColumnVisible("dateReceived") && (
                          <TableCell className="px-3">
                            {formatDate(item.dateReceived)}
                          </TableCell>
                        )}

                        {isColumnVisible("received") && (
                          <TableCell className="px-3 text-right tabular-nums">
                            {formatCurrency(item.received)}
                          </TableCell>
                        )}

                        {isColumnVisible("obligatedPR") && (
                          <TableCell className="px-3 text-right tabular-nums">
                            {item.obligatedPR ? formatCurrency(item.obligatedPR) : "—"}
                          </TableCell>
                        )}

                        {isColumnVisible("utilized") && (
                          <TableCell className="px-3 text-right tabular-nums">
                            {formatCurrency(item.utilized)}
                          </TableCell>
                        )}

                        {isColumnVisible("balance") && (
                          <TableCell className="px-3 text-right font-semibold tabular-nums">
                            {formatCurrency(item.balance)}
                          </TableCell>
                        )}

                        {isColumnVisible("remarks") && (
                          <TableCell className="px-3 text-muted-foreground">
                            <span className={isColumnExpanded("remarks") ? "" : "truncate block"}>
                              {item.remarks || "—"}
                            </span>
                          </TableCell>
                        )}

                        {/* FIXED ACTIONS COLUMN SYNTAX AND DROPDOWN */}
                        <TableCell className="px-3 text-center no-print">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewLog(item)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Activity Log
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handlePin(item)}>
                                <Pin className="h-4 w-4 mr-2" />
                                {item.isPinned ? "Unpin" : "Pin"}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {onEdit && (
                                <DropdownMenuItem onClick={() => handleEdit(item)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                              )}
                              {onDelete && (
                                <DropdownMenuItem
                                  onClick={() => handleDelete(item)}
                                  className="text-red-600"
                                >
                                  <Archive className="h-4 w-4 mr-2" />
                                  Move to Trash
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                    
                    {/* Total Row */}
                    <TableRow className="border-t bg-muted/30 font-semibold h-11">
                      {isAdmin && <TableCell />}
                      
                      {isColumnVisible("projectTitle") && (
                        <TableCell className="px-3">TOTAL</TableCell>
                      )}

                      {isColumnVisible("officeInCharge") && <TableCell />}
                      {isColumnVisible("status") && <TableCell />}
                      {isColumnVisible("dateReceived") && <TableCell />}

                      {isColumnVisible("received") && (
                        <TableCell className="px-3 text-right tabular-nums">
                          {formatCurrency(totals.received)}
                        </TableCell>
                      )}

                      {isColumnVisible("obligatedPR") && (
                        <TableCell className="px-3 text-right tabular-nums">
                          {formatCurrency(totals.obligatedPR)}
                        </TableCell>
                      )}

                      {isColumnVisible("utilized") && (
                        <TableCell className="px-3 text-right tabular-nums">
                          {formatCurrency(totals.utilized)}
                        </TableCell>
                      )}

                      {isColumnVisible("balance") && (
                        <TableCell className="px-3 text-right tabular-nums">
                          {formatCurrency(totals.balance)}
                        </TableCell>
                      )}

                      {isColumnVisible("remarks") && <TableCell />}
                      <TableCell className="no-print" />
                    </TableRow>
                  </>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Context Menu */}
      <TrustFundContextMenu
        contextMenu={contextMenu}
        onClose={() => setContextMenu(null)}
        onPin={() => {
          if (contextMenu) handlePin(contextMenu.entity);
          setContextMenu(null);
        }}
        onViewLog={() => {
          if (contextMenu) handleViewLog(contextMenu.entity);
          setContextMenu(null);
        }}
        onEdit={() => {
          if (contextMenu) handleEdit(contextMenu.entity);
          setContextMenu(null);
        }}
        onDelete={() => {
          if (contextMenu) handleDelete(contextMenu.entity);
          setContextMenu(null);
        }}
        canEdit={!!onEdit}
        canDelete={!!onDelete}
      />

      {/* Modals */}
      {showAddModal && (
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Add Trust Fund"
          size="xl"
        >
          <TrustFundForm
            year={year}
            onSave={(data) => {
              if (onAdd) onAdd(data);
              setShowAddModal(false);
            }}
            onCancel={() => setShowAddModal(false)}
          />
        </Modal>
      )}

      {showEditModal && selectedItem && (
        <Modal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedItem(null);
          }}
          title="Edit Trust Fund"
          size="xl"
        >
          <TrustFundForm
            trustFund={selectedItem}
            year={year}
            onSave={(data) => {
              if (onEdit) onEdit(selectedItem.id, data);
              setShowEditModal(false);
              setSelectedItem(null);
            }}
            onCancel={() => {
              setShowEditModal(false);
              setSelectedItem(null);
            }}
          />
        </Modal>
      )}

      {showDeleteModal && selectedItem && (
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedItem(null);
          }}
          onConfirm={() => {
            if (onDelete) onDelete(selectedItem.id);
            setShowDeleteModal(false);
            setSelectedItem(null);
          }}
          title="Move to Trash"
          message={`Are you sure you want to move "${selectedItem.projectTitle}" to trash?`}
          confirmText="Move to Trash"
          variant="danger"
        />
      )}

      {/* Print Orientation Modal */}
      <PrintOrientationModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        onConfirm={handlePrint}
      />

      {/* Activity Log Sheet */}
      {selectedLogItem && (
        <ActivityLogSheet
          type="trustFund"
          entityId={selectedLogItem.id}
          title={`Trust Fund History: ${selectedLogItem.projectTitle}`}
          isOpen={logSheetOpen}
          onOpenChange={(open) => {
            setLogSheetOpen(open);
            if (!open) setSelectedLogItem(null);
          }}
        />
      )}
    </>
  );
}