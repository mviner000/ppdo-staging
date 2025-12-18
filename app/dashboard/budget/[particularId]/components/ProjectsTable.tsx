  // app/dashboard/budget/[particularId]/components/ProjectsTable.tsx

  "use client";

  import { useState, useEffect, useRef, useMemo } from "react";
  import { useRouter } from "next/navigation";
  import { useMutation } from "convex/react";
  import { api } from "@/convex/_generated/api";
  import { Project } from "../../types";
  import { useAccentColor } from "../../../contexts/AccentColorContext";
  import { Modal } from "../../components/Modal";
  import { ConfirmationModal } from "../../components/ConfirmationModal";
  import { ProjectForm } from "./ProjectForm";
  import { 
    Search, 
    ArrowUpDown, 
    ArrowUp,
    ArrowDown,
    Pin,
    PinOff,
    Edit,
    Trash2,
    Filter,
    X,
    FileText
  } from "lucide-react";
  import { Id } from "@/convex/_generated/dataModel";
  import { toast } from "sonner";

  interface ProjectsTableProps {
    projects: Project[];
    particularId: string;
    onAdd?: (project: Omit<Project, "id" | "utilizationRate">) => void;
    onEdit?: (id: string, project: Omit<Project, "id" | "utilizationRate">) => void;
    onDelete?: (id: string) => void;
  }

  type SortDirection = "asc" | "desc" | null;
  type SortField = keyof Project | null;

  export function ProjectsTable({
    projects,
    particularId,
    onAdd,
    onEdit,
    onDelete,
  }: ProjectsTableProps) {
    const { accentColorValue } = useAccentColor();
    const router = useRouter();
    const pinProject = useMutation(api.projects.pin);
    const unpinProject = useMutation(api.projects.unpin);
    
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    
    // Context menu state
    const [contextMenu, setContextMenu] = useState<{
      x: number;
      y: number;
      project: Project;
    } | null>(null);
    
    // Search and filter state
    const [searchQuery, setSearchQuery] = useState("");
    const [sortField, setSortField] = useState<SortField>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>(null);
    const [statusFilter, setStatusFilter] = useState<string[]>([]);
    const [officeFilter, setOfficeFilter] = useState<string[]>([]);
    const [activeFilterColumn, setActiveFilterColumn] = useState<string | null>(null);
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    
    const contextMenuRef = useRef<HTMLDivElement>(null);
    const filterMenuRef = useRef<HTMLDivElement>(null);

    // Close context menu on click outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
          setContextMenu(null);
        }
        if (filterMenuRef.current && !filterMenuRef.current.contains(event.target as Node)) {
          setActiveFilterColumn(null);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Close context menu on scroll
    useEffect(() => {
      const handleScroll = () => {
        setContextMenu(null);
        setActiveFilterColumn(null);
      };

      document.addEventListener("scroll", handleScroll, true);
      return () => document.removeEventListener("scroll", handleScroll, true);
    }, []);

    // Get unique values for filters
    const uniqueStatuses = useMemo(() => {
      const statuses = new Set<string>();
      projects.forEach(project => {
        if (project.status) statuses.add(project.status);
      });
      return Array.from(statuses).sort();
    }, [projects]);

    /**
   * Creates a URL-friendly slug from text
   * @param text - The text to convert to a slug
   * @returns A lowercase slug with hyphens
   */
  const createSlug = (text: string): string => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  };


    const uniqueOffices = useMemo(() => {
      const offices = new Set<string>();
      projects.forEach(project => {
        if (project.implementingOffice) offices.add(project.implementingOffice);
      });
      return Array.from(offices).sort();
    }, [projects]);

    // Filter and sort projects
    const filteredAndSortedProjects = useMemo(() => {
      let filtered = [...projects];

      // Apply search filter - UPDATED
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(project => {
          return (
            project.projectName.toLowerCase().includes(query) ||
            project.implementingOffice.toLowerCase().includes(query) ||
            project.status?.toLowerCase().includes(query) ||
            project.totalBudgetAllocated.toString().includes(query) ||
            (project.obligatedBudget && project.obligatedBudget.toString().includes(query)) ||
            project.totalBudgetUtilized.toString().includes(query) ||
            project.utilizationRate.toFixed(1).includes(query) ||
            project.projectCompleted.toString().includes(query) ||
            project.projectDelayed.toString().includes(query) ||
            project.projectsOnTrack.toString().includes(query) ||
            (project.notes && project.notes.toLowerCase().includes(query)) ||
            (project.year && project.year.toString().includes(query))
          );
        });
      }

      // Apply status filter
      if (statusFilter.length > 0) {
        filtered = filtered.filter(project => project.status && statusFilter.includes(project.status));
      }

      // Apply office filter
      if (officeFilter.length > 0) {
        filtered = filtered.filter(project => officeFilter.includes(project.implementingOffice));
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

      // Keep pinned projects at top
      return filtered.sort((a, b) => {
        // Check if projects have isPinned property (type-safe check)
        const aIsPinned = 'isPinned' in a ? (a as any).isPinned : false;
        const bIsPinned = 'isPinned' in b ? (b as any).isPinned : false;
        
        if (aIsPinned && !bIsPinned) return -1;
        if (!aIsPinned && bIsPinned) return 1;
        return 0;
      });
    }, [projects, searchQuery, statusFilter, officeFilter, sortField, sortDirection]);

    const formatCurrency = (amount: number): string => {
      return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    };

    const formatDate = (dateString: string): string => {
      if (!dateString) return "-";
      try {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("en-PH", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }).format(date);
      } catch {
        return dateString;
      }
    };

    const formatPercentage = (value: number): string => {
      return `${value.toFixed(1)}%`;
    };

    const getUtilizationColor = (rate: number): string => {
      if (rate >= 80) return "text-red-600 dark:text-red-400";
      if (rate >= 60) return "text-orange-600 dark:text-orange-400";
      return "text-green-600 dark:text-green-400";
    };

    const getAccomplishmentColor = (rate: number): string => {
      if (rate >= 80) return "text-green-600 dark:text-green-400";
      if (rate >= 50) return "text-orange-600 dark:text-orange-400";
      return "text-zinc-600 dark:text-zinc-400";
    };

    const getStatusColor = (status?: string): string => {
      if (!status) return "text-zinc-600 dark:text-zinc-400";
      if (status === "completed") return "text-green-600 dark:text-green-400";
      if (status === "on_track") return "text-blue-600 dark:text-blue-400";
      if (status === "delayed") return "text-red-600 dark:text-red-400";
      if (status === "on_hold") return "text-orange-600 dark:text-orange-400";
      if (status === "cancelled") return "text-zinc-600 dark:text-zinc-400";
      return "text-zinc-600 dark:text-zinc-400";
    };

    /**
   * Creates a combined slug with department name and project ID
   * @param departmentName - The department/implementing office name
   * @param projectId - The Convex project ID
   * @returns A slug like "provincial-planning-development-office-kd7cr00b8yacfx9cv36dn64f317xesg5"
   */
  const createProjectSlug = (departmentName: string, projectId: string): string => {
    const departmentSlug = createSlug(departmentName);
    return `${departmentSlug}-${projectId}`;
  };

  // Then update these two functions in your ProjectsTable component:

  const handleRowClick = (project: Project, e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) {
      return;
    }
    // Navigate to the project breakdown page with slug
    const projectSlug = createProjectSlug(project.implementingOffice, project.id);
    router.push(
      `/dashboard/budget/${encodeURIComponent(particularId)}/${projectSlug}`
    );
  };

    const handleContextMenu = (e: React.MouseEvent, project: Project) => {
      e.preventDefault();
      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        project,
      });
    };

    const handleEdit = (project: Project) => {
      setSelectedProject(project);
      setShowEditModal(true);
      setContextMenu(null);
    };

    const handleDelete = (project: Project) => {
      setSelectedProject(project);
      setShowDeleteModal(true);
      setContextMenu(null);
    };

    const handleViewBreakdown = (project: Project) => {
      const projectSlug = createProjectSlug(project.implementingOffice, project.id);
      router.push(
        `/dashboard/budget/${encodeURIComponent(particularId)}/${projectSlug}`
      );
      setContextMenu(null);
    };

    const handlePin = async (project: Project) => {
      try {
        const isPinned = 'isPinned' in project ? (project as any).isPinned : false;
        
        if (isPinned) {
          await unpinProject({ id: project.id as Id<"projects"> });
          toast.success("Project unpinned");
        } else {
          await pinProject({ id: project.id as Id<"projects"> });
          toast.success("Project pinned to top");
        }
      } catch (error) {
        console.error("Error toggling pin:", error);
        toast.error("Failed to pin/unpin project");
      }
      setContextMenu(null);
    };

    const handleSave = (formData: Omit<Project, "id" | "utilizationRate">) => {
      if (selectedProject && onEdit) {
        onEdit(selectedProject.id, formData);
      } else if (onAdd) {
        onAdd(formData);
      }
      setShowAddModal(false);
      setShowEditModal(false);
      setSelectedProject(null);
    };

    const handleConfirmDelete = () => {
      if (selectedProject && onDelete) {
        onDelete(selectedProject.id);
      }
      setSelectedProject(null);
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
      setStatusFilter(prev =>
        prev.includes(status)
          ? prev.filter(s => s !== status)
          : [...prev, status]
      );
    };

    const toggleOfficeFilter = (office: string) => {
      setOfficeFilter(prev =>
        prev.includes(office)
          ? prev.filter(o => o !== office)
          : [...prev, office]
      );
    };

    const clearAllFilters = () => {
      setSearchQuery("");
      setStatusFilter([]);
      setOfficeFilter([]);
      setSortField(null);
      setSortDirection(null);
    };

    const toggleSearch = () => {
      setIsSearchVisible(!isSearchVisible);
      if (isSearchVisible) {
        clearAllFilters();
      }
    };

    const hasActiveFilters = searchQuery || statusFilter.length > 0 || officeFilter.length > 0 || sortField;

    const handlePrint = () => {
      window.print();
    };

    // Calculate totals - UPDATED
    const totals = filteredAndSortedProjects.reduce(
      (acc, project) => ({
        totalBudgetAllocated: acc.totalBudgetAllocated + project.totalBudgetAllocated,
        totalBudgetUtilized: acc.totalBudgetUtilized + project.totalBudgetUtilized,
        utilizationRate: acc.utilizationRate + project.utilizationRate / filteredAndSortedProjects.length,
        projectCompleted: acc.projectCompleted + project.projectCompleted,
        projectDelayed: acc.projectDelayed + project.projectDelayed,
        projectsOnTrack: acc.projectsOnTrack + project.projectsOnTrack,
      }),
      {
        totalBudgetAllocated: 0,
        totalBudgetUtilized: 0,
        utilizationRate: 0,
        projectCompleted: 0,
        projectDelayed: 0,
        projectsOnTrack: 0,
      }
    );

    const totalUtilizationRate = totals.utilizationRate;

    const SortIcon = ({ field }: { field: SortField }) => {
      if (sortField !== field) return <ArrowUpDown className="w-3.5 h-3.5 opacity-50" />;
      if (sortDirection === "asc") return <ArrowUp className="w-3.5 h-3.5" />;
      return <ArrowDown className="w-3.5 h-3.5" />;
    };

    return (
      <>
        <div className="print-area bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          {/* Header with Search and Actions */}
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 space-y-4 no-print">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Projects
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleSearch}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all hover:shadow-md ${
                    isSearchVisible 
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-2 border-blue-500' 
                      : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-300 dark:hover:bg-zinc-600'
                  }`}
                  title={isSearchVisible ? "Hide Search" : "Show Search"}
                >
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    Search
                  </div>
                </button>
                <button
                  onClick={handlePrint}
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
                    onClick={() => setShowAddModal(true)}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:shadow-md text-white"
                    style={{ backgroundColor: accentColorValue }}
                  >
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
                      placeholder="Search by project name, office, status, or any value..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-offset-0"
                      style={{ 
                        '--tw-ring-color': accentColorValue,
                      } as React.CSSProperties}
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
                    <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Active filters:</span>
                    {statusFilter.map(status => (
                      <span
                        key={status}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                      >
                        Status: {status.replace('_', ' ')}
                        <button
                          onClick={() => toggleStatusFilter(status)}
                          className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    {officeFilter.map(office => (
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
            <h2 className="text-xl font-bold text-zinc-900 mb-2">Projects</h2>
            <p className="text-sm text-zinc-700">
              Generated on: {new Date().toLocaleDateString("en-US", {
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
                  {/* Project Name */}
                  <th className="px-3 sm:px-4 py-3 text-left min-w-[200px] sticky top-0 bg-zinc-50 dark:bg-zinc-950 z-10">
                    <button
                      onClick={() => handleSort("projectName")}
                      className="group flex items-center gap-2 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                    >
                      <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">
                        Project Name
                      </span>
                      <SortIcon field="projectName" />
                    </button>
                  </th>
                  
                  {/* Implementing Office - Moved after Project Name */}
                  <th className="px-3 sm:px-4 py-3 text-left min-w-[150px] sticky top-0 bg-zinc-50 dark:bg-zinc-950 z-10">
                    <div className="relative inline-block">
                      <button
                        onClick={() => setActiveFilterColumn(activeFilterColumn === "office" ? null : "office")}
                        className="group flex items-center gap-2 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                      >
                        <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">
                          Implementing Office
                        </span>
                        <Filter className={`w-3.5 h-3.5 ${officeFilter.length > 0 ? 'text-blue-600' : 'opacity-50'}`} />
                      </button>
                      {/* Filter dropdown omitted for brevity */}
                    </div>
                  </th>

                  {/* Total Budget Allocated */}
                  <th className="px-3 sm:px-4 py-3 text-right min-w-[120px] sticky top-0 bg-zinc-50 dark:bg-zinc-950 z-10">
                    <button
                      onClick={() => handleSort("totalBudgetAllocated")}
                      className="group flex items-center gap-2 ml-auto hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                    >
                      <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">
                        Budget Allocated
                      </span>
                      <SortIcon field="totalBudgetAllocated" />
                    </button>
                  </th>

                  {/* Obligated Budget (Optional) */}
                  <th className="px-3 sm:px-4 py-3 text-right min-w-[120px] sticky top-0 bg-zinc-50 dark:bg-zinc-950 z-10">
                    <button
                      onClick={() => handleSort("obligatedBudget")}
                      className="group flex items-center gap-2 ml-auto hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                    >
                      <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">
                        Obligated Budget
                      </span>
                      <SortIcon field="obligatedBudget" />
                    </button>
                  </th>

                  {/* Total Budget Utilized */}
                  <th className="px-3 sm:px-4 py-3 text-right min-w-[120px] sticky top-0 bg-zinc-50 dark:bg-zinc-950 z-10">
                    <button
                      onClick={() => handleSort("totalBudgetUtilized")}
                      className="group flex items-center gap-2 ml-auto hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                    >
                      <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">
                        Budget Utilized
                      </span>
                      <SortIcon field="totalBudgetUtilized" />
                    </button>
                  </th>

                  {/* Utilization Rate */}
                  <th className="px-3 sm:px-4 py-3 text-right min-w-[110px] sticky top-0 bg-zinc-50 dark:bg-zinc-950 z-10">
                    <button
                      onClick={() => handleSort("utilizationRate")}
                      className="group flex items-center gap-2 ml-auto hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                    >
                      <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">
                        Utilization Rate (%)
                      </span>
                      <SortIcon field="utilizationRate" />
                    </button>
                  </th>

                  {/* Project Completed */}
                  <th className="px-3 sm:px-4 py-3 text-right min-w-[110px] sticky top-0 bg-zinc-50 dark:bg-zinc-950 z-10">
                    <button
                      onClick={() => handleSort("projectCompleted")}
                      className="group flex items-center gap-2 ml-auto hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                    >
                      <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">
                        Completed (%)
                      </span>
                      <SortIcon field="projectCompleted" />
                    </button>
                  </th>

                  {/* Project Delayed */}
                  <th className="px-3 sm:px-4 py-3 text-right min-w-[110px] sticky top-0 bg-zinc-50 dark:bg-zinc-950 z-10">
                    <button
                      onClick={() => handleSort("projectDelayed")}
                      className="group flex items-center gap-2 ml-auto hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                    >
                      <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">
                        Delayed (%)
                      </span>
                      <SortIcon field="projectDelayed" />
                    </button>
                  </th>

                  {/* Projects On Track */}
                  <th className="px-3 sm:px-4 py-3 text-right min-w-[110px] sticky top-0 bg-zinc-50 dark:bg-zinc-950 z-10">
                    <button
                      onClick={() => handleSort("projectsOnTrack")}
                      className="group flex items-center gap-2 ml-auto hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                    >
                      <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">
                        On Track (%)
                      </span>
                      <SortIcon field="projectsOnTrack" />
                    </button>
                  </th>

                  {/* Status */}
                  <th className="px-3 sm:px-4 py-3 text-left min-w-[100px] sticky top-0 bg-zinc-50 dark:bg-zinc-950 z-10">
                    <div className="relative inline-block">
                      <button
                        onClick={() => setActiveFilterColumn(activeFilterColumn === "status" ? null : "status")}
                        className="group flex items-center gap-2 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                      >
                        <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">
                          Status
                        </span>
                        <Filter className={`w-3.5 h-3.5 ${statusFilter.length > 0 ? 'text-blue-600' : 'opacity-50'}`} />
                      </button>
                      {/* Filter dropdown omitted for brevity */}
                    </div>
                  </th>

                  {/* Notes */}
                  <th className="px-3 sm:px-4 py-3 text-left min-w-[150px] sticky top-0 bg-zinc-50 dark:bg-zinc-950 z-10">
                    <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">
                      Notes
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {filteredAndSortedProjects.map((project) => {
                  const isPinned = 'isPinned' in project ? (project as any).isPinned : false;
                  
                  return (
                    <tr
                      key={project.id}
                      onContextMenu={(e) => handleContextMenu(e, project)}
                      onClick={(e) => handleRowClick(project, e)}
                      className={`hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors cursor-pointer ${
                        isPinned ? 'bg-amber-50 dark:bg-amber-950/20' : ''
                      }`}
                    >
                      {/* Project Name */}
                      <td className="px-3 sm:px-4 py-3">
                        <div className="flex items-center gap-2">
                          {isPinned && (
                            <Pin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500 flex-shrink-0" />
                          )}
                          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                            {project.projectName}
                          </span>
                        </div>
                      </td>
                      
                      {/* Implementing Office */}
                      <td className="px-3 sm:px-4 py-3">
                        <span className="text-sm text-zinc-700 dark:text-zinc-300">
                          {project.implementingOffice}
                        </span>
                      </td>
                      
                      {/* Total Budget Allocated */}
                      <td className="px-3 sm:px-4 py-3 text-right">
                        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                          {formatCurrency(project.totalBudgetAllocated)}
                        </span>
                      </td>
                      
                      {/* Obligated Budget */}
                      <td className="px-3 sm:px-4 py-3 text-right">
                        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                          {project.obligatedBudget ? formatCurrency(project.obligatedBudget) : "-"}
                        </span>
                      </td>
                      
                      {/* Total Budget Utilized */}
                      <td className="px-3 sm:px-4 py-3 text-right">
                        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                          {formatCurrency(project.totalBudgetUtilized)}
                        </span>
                      </td>
                      
                      {/* Utilization Rate */}
                      <td className="px-3 sm:px-4 py-3 text-right">
                        <span className={`text-sm font-semibold ${getUtilizationColor(project.utilizationRate)}`}>
                          {formatPercentage(project.utilizationRate)}
                        </span>
                      </td>
                      
                      {/* Project Completed */}
                      <td className="px-3 sm:px-4 py-3 text-right">
                        <span className={`text-sm font-medium ${getAccomplishmentColor(project.projectCompleted)}`}>
                          {formatPercentage(project.projectCompleted)}
                        </span>
                      </td>
                      
                      {/* Project Delayed */}
                      <td className="px-3 sm:px-4 py-3 text-right">
                        <span className={`text-sm font-medium ${getAccomplishmentColor(project.projectDelayed)}`}>
                          {formatPercentage(project.projectDelayed)}
                        </span>
                      </td>
                      
                      {/* Projects On Track */}
                      <td className="px-3 sm:px-4 py-3 text-right">
                        <span className={`text-sm font-medium ${getAccomplishmentColor(project.projectsOnTrack)}`}>
                          {formatPercentage(project.projectsOnTrack)}
                        </span>
                      </td>
                      
                      {/* Status */}
                      <td className="px-3 sm:px-4 py-3">
                        <span className={`text-sm font-medium ${getStatusColor(project.status)}`}>
                          {project.status ? project.status.charAt(0).toUpperCase() + project.status.slice(1) : '-'}
                        </span>
                      </td>
                      
                      {/* Notes */}
                      <td className="px-3 sm:px-4 py-3">
                        <span className="text-sm text-zinc-600 dark:text-zinc-400">
                          {project.notes || "-"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                
                {/* Totals Row - Updated */}
                <tr className="border-t-2 border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950/50 font-semibold">
                  <td className="px-3 sm:px-4 py-3" colSpan={2}>
                    <span className="text-sm text-zinc-900 dark:text-zinc-100">TOTAL</span>
                  </td>
                  <td className="px-3 sm:px-4 py-3 text-right">
                    <span className="text-sm" style={{ color: accentColorValue }}>
                      {formatCurrency(totals.totalBudgetAllocated)}
                    </span>
                  </td>
                  <td className="px-3 sm:px-4 py-3 text-right">
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">-</span>
                  </td>
                  <td className="px-3 sm:px-4 py-3 text-right">
                    <span className="text-sm" style={{ color: accentColorValue }}>
                      {formatCurrency(totals.totalBudgetUtilized)}
                    </span>
                  </td>
                  <td className="px-3 sm:px-4 py-3 text-right">
                    <span className={`text-sm ${getUtilizationColor(totalUtilizationRate)}`}>
                      {formatPercentage(totalUtilizationRate)}
                    </span>
                  </td>
                  <td className="px-3 sm:px-4 py-3 text-right">
                    <span className="text-sm" style={{ color: accentColorValue }}>
                      {formatPercentage(totals.projectCompleted / filteredAndSortedProjects.length || 0)}
                    </span>
                  </td>
                  <td className="px-3 sm:px-4 py-3 text-right">
                    <span className="text-sm" style={{ color: accentColorValue }}>
                      {formatPercentage(totals.projectDelayed / filteredAndSortedProjects.length || 0)}
                    </span>
                  </td>
                  <td className="px-3 sm:px-4 py-3 text-right">
                    <span className="text-sm" style={{ color: accentColorValue }}>
                      {formatPercentage(totals.projectsOnTrack / filteredAndSortedProjects.length || 0)}
                    </span>
                  </td>
                  <td className="px-3 sm:px-4 py-3" colSpan={2}>
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">-</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Context Menu */}
        {contextMenu && (
          <div
            ref={contextMenuRef}
            className="fixed bg-white dark:bg-zinc-800 rounded-lg shadow-xl border border-zinc-200 dark:border-zinc-700 py-1 z-50 min-w-[180px]"
            style={{
              top: `${contextMenu.y}px`,
              left: `${contextMenu.x}px`,
            }}
          >
            <button
              onClick={() => handlePin(contextMenu.project)}
              className="w-full px-4 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors flex items-center gap-3"
            >
              {('isPinned' in contextMenu.project && (contextMenu.project as any).isPinned) ? (
                <>
                  <PinOff className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                  <span className="text-zinc-700 dark:text-zinc-300">Unpin</span>
                </>
              ) : (
                <>
                  <Pin className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                  <span className="text-zinc-700 dark:text-zinc-300">Pin to top</span>
                </>
              )}
            </button>
            {onEdit && (
              <button
                onClick={() => handleEdit(contextMenu.project)}
                className="w-full px-4 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors flex items-center gap-3"
              >
                <Edit className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                <span className="text-zinc-700 dark:text-zinc-300">Edit</span>
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => handleDelete(contextMenu.project)}
                className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors flex items-center gap-3"
              >
                <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                <span className="text-red-700 dark:text-red-300">Delete</span>
              </button>
            )}
          </div>
        )}

        {/* Add Modal */}
        {showAddModal && (
          <Modal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            title="Add Project"
            size="xl"
          >
            <ProjectForm
              onSave={handleSave}
              onCancel={() => setShowAddModal(false)}
            />
          </Modal>
        )}

        {/* Edit Modal */}
        {showEditModal && selectedProject && (
          <Modal
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setSelectedProject(null);
            }}
            title="Edit Project"
            size="xl"
          >
            <ProjectForm
              project={selectedProject}
              onSave={handleSave}
              onCancel={() => {
                setShowEditModal(false);
                setSelectedProject(null);
              }}
            />
          </Modal>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedProject && (
          <ConfirmationModal
            isOpen={showDeleteModal}
            onClose={() => {
              setShowDeleteModal(false);
              setSelectedProject(null);
            }}
            onConfirm={handleConfirmDelete}
            title="Delete Project"
            message={`Are you sure you want to delete "${selectedProject.projectName}"? This action cannot be undone.`}
            confirmText="Delete"
            variant="danger"
          />
        )}
      </>
    );
  }