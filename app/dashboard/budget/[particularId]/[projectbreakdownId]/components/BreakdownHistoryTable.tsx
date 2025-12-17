"use client";

import { useState, useMemo } from "react";
import { useAccentColor } from "../../../../contexts/AccentColorContext";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
  X,
  Search,
  Edit,
  Trash2,
} from "lucide-react";

interface Breakdown {
  _id: string;
  projectName: string;
  implementingOffice: string;
  projectTitle?: string;
  allocatedBudget?: number;
  obligatedBudget?: number;
  budgetUtilized?: number;
  utilizationRate?: number;
  balance?: number;
  dateStarted?: number;
  targetDate?: number;
  completionDate?: number;
  projectAccomplishment?: number;
  status?: "Completed" | "On-Going" | "On-Hold" | "Cancelled" | "Delayed";
  remarks?: string;
  district?: string;
  municipality?: string;
  barangay?: string;
  reportDate?: number;
  batchId?: string;
  fundSource?: string;
}

interface BreakdownHistoryTableProps {
  breakdowns: Breakdown[];
  onPrint: () => void;
  onAdd?: () => void;
  onEdit?: (breakdown: Breakdown) => void;
  onDelete?: (id: string) => void;
}

type SortDirection = "asc" | "desc" | null;
type SortField = keyof Breakdown | null;

export function BreakdownHistoryTable({
  breakdowns,
  onPrint,
  onAdd,
  onEdit,
  onDelete,
}: BreakdownHistoryTableProps) {
  const { accentColorValue } = useAccentColor();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("dateStarted");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [officeFilter, setOfficeFilter] = useState<string[]>([]);
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    breakdown: Breakdown;
  } | null>(null);

  // Get unique values for filters
  const uniqueStatuses = useMemo(() => {
    const statuses = new Set<string>();
    breakdowns.forEach((breakdown) => {
      if (breakdown.status) statuses.add(breakdown.status);
    });
    return Array.from(statuses).sort();
  }, [breakdowns]);

  const uniqueOffices = useMemo(() => {
    const offices = new Set<string>();
    breakdowns.forEach((breakdown) => {
      if (breakdown.implementingOffice) offices.add(breakdown.implementingOffice);
    });
    return Array.from(offices).sort();
  }, [breakdowns]);

  // Filter and sort breakdowns
  const filteredAndSortedBreakdowns = useMemo(() => {
    let filtered = [...breakdowns];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((breakdown) => {
        return (
          breakdown.projectName?.toLowerCase().includes(query) ||
          breakdown.implementingOffice?.toLowerCase().includes(query) ||
          breakdown.projectTitle?.toLowerCase().includes(query) ||
          breakdown.district?.toLowerCase().includes(query) ||
          breakdown.municipality?.toLowerCase().includes(query) ||
          breakdown.barangay?.toLowerCase().includes(query) ||
          breakdown.fundSource?.toLowerCase().includes(query) ||
          breakdown.status?.toLowerCase().includes(query) ||
          breakdown.remarks?.toLowerCase().includes(query) ||
          breakdown.allocatedBudget?.toString().includes(query)
        );
      });
    }

    // Apply status filter
    if (statusFilter.length > 0) {
      filtered = filtered.filter((breakdown) =>
        breakdown.status ? statusFilter.includes(breakdown.status) : false
      );
    }

    // Apply office filter
    if (officeFilter.length > 0) {
      filtered = filtered.filter((breakdown) =>
        officeFilter.includes(breakdown.implementingOffice)
      );
    }

    // Apply sorting
    if (sortField && sortDirection) {
      filtered.sort((a, b) => {
        let aVal = a[sortField];
        let bVal = b[sortField];

        // Handle undefined values
        if (aVal === undefined) return 1;
        if (bVal === undefined) return -1;

        // Compare values
        if (typeof aVal === "string" && typeof bVal === "string") {
          return sortDirection === "asc"
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }

        if (typeof aVal === "number" && typeof bVal === "number") {
          return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
        }

        return 0;
      });
    }

    return filtered;
  }, [
    breakdowns,
    searchQuery,
    statusFilter,
    officeFilter,
    sortField,
    sortDirection,
  ]);

  const formatCurrency = (amount?: number): string => {
    if (amount === undefined) return "-";
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (timestamp?: number): string => {
    if (!timestamp) return "-";
    return new Intl.DateTimeFormat("en-PH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(timestamp));
  };

  const getStatusColor = (status?: string): string => {
    if (status === "Completed") return "text-green-600 dark:text-green-400";
    if (status === "On-Going") return "text-blue-600 dark:text-blue-400";
    if (status === "On-Hold") return "text-orange-600 dark:text-orange-400";
    if (status === "Delayed") return "text-red-600 dark:text-red-400";
    if (status === "Cancelled") return "text-zinc-600 dark:text-zinc-400";
    return "text-zinc-600 dark:text-zinc-400";
  };

  const getAccomplishmentColor = (rate?: number): string => {
    if (!rate) return "text-zinc-600 dark:text-zinc-400";
    if (rate >= 80) return "text-green-600 dark:text-green-400";
    if (rate >= 50) return "text-orange-600 dark:text-orange-400";
    return "text-red-600 dark:text-red-400";
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortField(null);
        setSortDirection(null);
      }
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const toggleStatusFilter = (status: string) => {
    setStatusFilter((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const toggleOfficeFilter = (office: string) => {
    setOfficeFilter((prev) =>
      prev.includes(office)
        ? prev.filter((o) => o !== office)
        : [...prev, office]
    );
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setStatusFilter([]);
    setOfficeFilter([]);
    setSortField("dateStarted");
    setSortDirection("desc");
  };

  const toggleSearch = () => {
    setIsSearchVisible(!isSearchVisible);
    if (isSearchVisible) {
      clearAllFilters();
    }
  };

  const hasActiveFilters =
    searchQuery ||
    statusFilter.length > 0 ||
    officeFilter.length > 0 ||
    (sortField !== "dateStarted" && sortField !== null);

  const handleContextMenu = (e: React.MouseEvent, breakdown: Breakdown) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      breakdown,
    });
  };

  const handleEdit = (breakdown: Breakdown) => {
    if (onEdit) {
      onEdit(breakdown);
    }
    setContextMenu(null);
  };

  const handleDelete = (id: string) => {
    if (onDelete) {
      onDelete(id);
    }
    setContextMenu(null);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field)
      return <ArrowUpDown className="w-3.5 h-3.5 opacity-50" />;
    if (sortDirection === "asc") return <ArrowUp className="w-3.5 h-3.5" />;
    return <ArrowDown className="w-3.5 h-3.5" />;
  };

  // Format location string
  const formatLocation = (breakdown: Breakdown): string => {
    const parts = [];
    if (breakdown.barangay) parts.push(breakdown.barangay);
    if (breakdown.municipality) parts.push(breakdown.municipality);
    if (breakdown.district) parts.push(breakdown.district);
    return parts.length > 0 ? parts.join(", ") : "-";
  };

  return (
    <>
      <div className="print-area bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        {/* Header with Search and Actions */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 space-y-4 no-print">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Breakdown History
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleSearch}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all hover:shadow-md ${
                  isSearchVisible
                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-2 border-blue-500"
                    : "bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-300 dark:hover:bg-zinc-600"
                }`}
                title={isSearchVisible ? "Hide Search" : "Show Search"}
              >
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Search
                </div>
              </button>
              <button
                onClick={onPrint}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:shadow-md bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-300 dark:hover:bg-zinc-600"
                title="Print"
              >
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                    />
                  </svg>
                  Print
                </div>
              </button>
              {onAdd && (
                <button
                  onClick={onAdd}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:shadow-md text-white flex items-center gap-2"
                  style={{ backgroundColor: accentColorValue }}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Add New Project
                </button>
              )}
            </div>
          </div>

          {/* Search Bar - Collapsible */}
          {isSearchVisible && (
            <div className="space-y-4 animate-in slide-in-from-top duration-200">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Search by project name, title, location, office, or any value..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-offset-0"
                    style={
                      {
                        "--tw-ring-color": accentColorValue,
                      } as React.CSSProperties
                    }
                  />
                </div>
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Clear Filters
                  </button>
                )}
              </div>

              {/* Active Filters Display */}
              {(statusFilter.length > 0 || officeFilter.length > 0) && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    Active filters:
                  </span>
                  {statusFilter.map((status) => (
                    <span
                      key={status}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                    >
                      Status: {status}
                      <button
                        onClick={() => toggleStatusFilter(status)}
                        className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {officeFilter.map((office) => (
                    <span
                      key={office}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                    >
                      Office: {office}
                      <button
                        onClick={() => toggleOfficeFilter(office)}
                        className="hover:bg-purple-200 dark:hover:bg-purple-800 rounded p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Print Header */}
        <div className="hidden print-only p-4 border-b border-zinc-900">
          <h2 className="text-xl font-bold text-zinc-900 mb-2">
            Project Breakdown History
          </h2>
          <p className="text-sm text-zinc-700">
            Generated on:{" "}
            {new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        {/* Table with fixed header */}
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto relative">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
                <th className="px-3 sm:px-4 py-3 text-left min-w-[200px] sticky top-0 bg-zinc-50 dark:bg-zinc-950 z-10">
                  <button
                    onClick={() => handleSort("projectTitle")}
                    className="group flex items-center gap-2 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                  >
                    <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">
                      Project Title
                    </span>
                    <SortIcon field="projectTitle" />
                  </button>
                </th>
                <th className="px-3 sm:px-4 py-3 text-left min-w-[150px] sticky top-0 bg-zinc-50 dark:bg-zinc-950 z-10">
                  <button
                    onClick={() => handleSort("implementingOffice")}
                    className="group flex items-center gap-2 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                  >
                    <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">
                      Implementing Office
                    </span>
                    <SortIcon field="implementingOffice" />
                  </button>
                </th>
                <th className="px-3 sm:px-4 py-3 text-left min-w-[180px] sticky top-0 bg-zinc-50 dark:bg-zinc-950 z-10">
                  <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">
                    Location
                  </span>
                </th>
                <th className="px-3 sm:px-4 py-3 text-right min-w-[140px] sticky top-0 bg-zinc-50 dark:bg-zinc-950 z-10">
                  <button
                    onClick={() => handleSort("allocatedBudget")}
                    className="group flex items-center gap-2 ml-auto hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                  >
                    <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">
                      Allocated Budget
                    </span>
                    <SortIcon field="allocatedBudget" />
                  </button>
                </th>
                <th className="px-3 sm:px-4 py-3 text-right min-w-[140px] sticky top-0 bg-zinc-50 dark:bg-zinc-950 z-10">
                  <button
                    onClick={() => handleSort("budgetUtilized")}
                    className="group flex items-center gap-2 ml-auto hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                  >
                    <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">
                      Budget Utilized
                    </span>
                    <SortIcon field="budgetUtilized" />
                  </button>
                </th>
                <th className="px-3 sm:px-4 py-3 text-right min-w-[120px] sticky top-0 bg-zinc-50 dark:bg-zinc-950 z-10">
                  <button
                    onClick={() => handleSort("projectAccomplishment")}
                    className="group flex items-center gap-2 ml-auto hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                  >
                    <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">
                      Accomplishment (%)
                    </span>
                    <SortIcon field="projectAccomplishment" />
                  </button>
                </th>
                <th className="px-3 sm:px-4 py-3 text-center min-w-[120px] sticky top-0 bg-zinc-50 dark:bg-zinc-950 z-10">
                  <button
                    onClick={() => handleSort("status")}
                    className="group flex items-center gap-2 mx-auto hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                  >
                    <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">
                      Status
                    </span>
                    <SortIcon field="status" />
                  </button>
                </th>
                <th className="px-3 sm:px-4 py-3 text-left min-w-[100px] sticky top-0 bg-zinc-50 dark:bg-zinc-950 z-10">
                  <button
                    onClick={() => handleSort("dateStarted")}
                    className="group flex items-center gap-2 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                  >
                    <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">
                      Date Started
                    </span>
                    <SortIcon field="dateStarted" />
                  </button>
                </th>
                <th className="px-3 sm:px-4 py-3 text-left min-w-[200px] sticky top-0 bg-zinc-50 dark:bg-zinc-950 z-10">
                  <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">
                    Remarks
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {filteredAndSortedBreakdowns.length > 0 ? (
                filteredAndSortedBreakdowns.map((breakdown) => (
                  <tr
                    key={breakdown._id}
                    onContextMenu={(e) => handleContextMenu(e, breakdown)}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors cursor-pointer"
                  >
                    <td className="px-3 sm:px-4 py-3">
                      <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {breakdown.projectTitle || "-"}
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 py-3">
                      <span className="text-sm text-zinc-700 dark:text-zinc-300">
                        {breakdown.implementingOffice}
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 py-3">
                      <span className="text-sm text-zinc-700 dark:text-zinc-300">
                        {formatLocation(breakdown)}
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-right">
                      <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {formatCurrency(breakdown.allocatedBudget)}
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-right">
                      <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {formatCurrency(breakdown.budgetUtilized)}
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-right">
                      <span
                        className={`text-sm font-semibold ${getAccomplishmentColor(
                          breakdown.projectAccomplishment
                        )}`}
                      >
                        {breakdown.projectAccomplishment?.toFixed(1) || "0.0"}%
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-center">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          breakdown.status
                        )}`}
                      >
                        {breakdown.status || "N/A"}
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 py-3">
                      <span className="text-sm text-zinc-700 dark:text-zinc-300">
                        {formatDate(breakdown.dateStarted)}
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 py-3">
                      <span className="text-sm text-zinc-600 dark:text-zinc-400">
                        {breakdown.remarks || "-"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-4 sm:px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
                        <svg
                          className="w-8 h-8 text-zinc-400 dark:text-zinc-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                      <p className="text-base font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                        {searchQuery || statusFilter.length > 0 || officeFilter.length > 0
                          ? "No results found"
                          : "No breakdown records yet"}
                      </p>
                      <p className="text-sm text-zinc-500 dark:text-zinc-500 mb-4">
                        {searchQuery || statusFilter.length > 0 || officeFilter.length > 0
                          ? "Try adjusting your search or filters"
                          : "Click 'Add New Project' to create your first breakdown record"}
                      </p>
                      {onAdd && !searchQuery && statusFilter.length === 0 && officeFilter.length === 0 && (
                        <button
                          onClick={onAdd}
                          className="px-5 py-2.5 rounded-lg text-sm font-medium transition-all hover:shadow-md text-white"
                          style={{ backgroundColor: accentColorValue }}
                        >
                          Add New Project
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setContextMenu(null)}
          />
          <div
            className="fixed bg-white dark:bg-zinc-800 rounded-lg shadow-xl border border-zinc-200 dark:border-zinc-700 py-1 z-50 min-w-[180px]"
            style={{
              top: `${contextMenu.y}px`,
              left: `${contextMenu.x}px`,
            }}
          >
            {onEdit && (
              <button
                onClick={() => handleEdit(contextMenu.breakdown)}
                className="w-full px-4 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors flex items-center gap-3"
              >
                <Edit className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                <span className="text-zinc-700 dark:text-zinc-300">Edit</span>
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => handleDelete(contextMenu.breakdown._id)}
                className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors flex items-center gap-3"
              >
                <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                <span className="text-red-700 dark:text-red-300">Delete</span>
              </button>
            )}
          </div>
        </>
      )}
    </>
  );
}