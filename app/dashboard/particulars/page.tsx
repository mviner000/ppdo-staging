// app/dashboard/particulars/page.tsx

"use client";

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loader2, Calendar } from "lucide-react";

import { ParticularTypeSelector } from "./_components/ParticularTypeSelector";
import { BudgetParticularsList } from "./_components/BudgetParticularsList";
import { ProjectParticularsList } from "./_components/ProjectParticularsList";
import { useCurrentUser } from "@/app/hooks/useCurrentUser";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Lock } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ParticularPage() {
  const { user, isLoading: isUserLoading } = useCurrentUser();

  // Fetch all data
  const budgetParticulars = useQuery(api.budgetParticulars.list, {
    includeInactive: true,
  });
  const projectParticulars = useQuery(api.projectParticulars.list, {
    includeInactive: true,
  });
  const budgetItems = useQuery(api.budgetItems.list);
  const projects = useQuery(api.projects.list, {});

  const [selectedType, setSelectedType] = useState<"budget" | "project">("budget");
  const [selectedYear, setSelectedYear] = useState<string>("all");

  // Check if user has access
  const hasAccess =
    user?.role === "admin" || user?.role === "super_admin" || user?.role === "user";
  const canManage = user?.role === "admin" || user?.role === "super_admin";

  // Calculate year statistics for budget particulars
  const budgetYearCounts = useMemo(() => {
    if (!budgetParticulars || !budgetItems) return [];

    const yearMap = new Map<number | "all", Set<string>>();
    yearMap.set("all", new Set());

    budgetItems.forEach((item) => {
      if (item.isDeleted) return;

      // Add to all
      yearMap.get("all")!.add(item.particulars);

      // Add to specific year
      if (item.year) {
        if (!yearMap.has(item.year)) {
          yearMap.set(item.year, new Set());
        }
        yearMap.get(item.year)!.add(item.particulars);
      }
    });

    return Array.from(yearMap.entries())
      .map(([year, codes]) => ({
        year,
        count: codes.size,
      }))
      .sort((a, b) => {
        if (a.year === "all") return -1;
        if (b.year === "all") return 1;
        return (b.year as number) - (a.year as number);
      });
  }, [budgetParticulars, budgetItems]);

  // Calculate year statistics for project particulars
  const projectYearCounts = useMemo(() => {
    if (!projectParticulars || !projects) return [];

    const yearMap = new Map<number | "all", Set<string>>();
    yearMap.set("all", new Set());

    projects.forEach((project) => {
      if (project.isDeleted) return;

      // Add to all
      yearMap.get("all")!.add(project.particulars);

      // Add to specific year
      if (project.year) {
        if (!yearMap.has(project.year)) {
          yearMap.set(project.year, new Set());
        }
        yearMap.get(project.year)!.add(project.particulars);
      }
    });

    return Array.from(yearMap.entries())
      .map(([year, codes]) => ({
        year,
        count: codes.size,
      }))
      .sort((a, b) => {
        if (a.year === "all") return -1;
        if (b.year === "all") return 1;
        return (b.year as number) - (a.year as number);
      });
  }, [projectParticulars, projects]);

  // Get available years for dropdown
  const availableYears = useMemo(() => {
    const years = new Set<number>();

    if (selectedType === "budget" && budgetItems) {
      budgetItems.forEach((item) => {
        if (item.year && !item.isDeleted) years.add(item.year);
      });
    } else if (selectedType === "project" && projects) {
      projects.forEach((project) => {
        if (project.year && !project.isDeleted) years.add(project.year);
      });
    }

    return Array.from(years).sort((a, b) => b - a);
  }, [selectedType, budgetItems, projects]);

  // Loading state
  if (
    isUserLoading ||
    budgetParticulars === undefined ||
    projectParticulars === undefined ||
    budgetItems === undefined ||
    projects === undefined
  ) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // Access denied for inspectors
  if (user?.role === "inspector") {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <Alert variant="destructive">
          <Lock className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You don't have permission to access this page. This area is restricted to
            administrators and standard users.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // No access
  if (!hasAccess) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You don't have permission to view particulars. Please contact your
            administrator for access.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header with Year Filter */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Particulars Management</h1>
          <p className="text-gray-500 mt-1">
            Manage budget and project particular categories
          </p>
        </div>

        {/* Year Filter Dropdown */}
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {availableYears.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Permission Notice */}
      {!canManage && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You can view particulars but cannot edit or delete them. Only administrators
            can modify particulars.
          </AlertDescription>
        </Alert>
      )}

      {/* Type Selector Cards */}
      <ParticularTypeSelector
        budgetYearCounts={budgetYearCounts}
        projectYearCounts={projectYearCounts}
        selectedType={selectedType}
        onSelectType={(type) => {
          setSelectedType(type);
          setSelectedYear("all"); // Reset year filter when switching types
        }}
      />

      {/* Main Content - Show selected list */}
      {selectedType === "budget" ? (
        <BudgetParticularsList selectedYear={selectedYear} />
      ) : (
        <ProjectParticularsList selectedYear={selectedYear} />
      )}
    </div>
  );
}