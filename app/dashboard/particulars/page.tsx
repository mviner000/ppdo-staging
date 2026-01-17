// app/dashboard/particulars/page.tsx

"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loader2, AlertCircle, Lock } from "lucide-react";
import { toast } from "sonner";

import { ConsolidatedParticularsList } from "./_components/ConsolidatedParticularsList";
import { YearSelector } from "./_components/YearSelector";
import { useCurrentUser } from "@/app/hooks/useCurrentUser";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useUrlState } from "./_hooks/useUrlState";

export default function ParticularPage() {
  const { user, isLoading: isUserLoading } = useCurrentUser();
  const { urlState, updateUrlState } = useUrlState();
  
  const [selectedYear, setSelectedYear] = useState<string>(urlState.year || "all");
  
  // Ref to track last year update to URL
  const lastYearUpdate = useRef<string>("");
  const isInitialMount = useRef(true);

  // Fetch all data
  const budgetParticulars = useQuery(api.budgetParticulars.list, {
    includeInactive: true,
  });
  const projectParticulars = useQuery(api.projectParticulars.list, {
    includeInactive: true,
  });
  const budgetItems = useQuery(api.budgetItems.list);
  const projects = useQuery(api.projects.list, {});

  // Get available years
  const availableYears = useMemo(() => {
    if (!budgetItems || !projects) return [];
    const years = new Set<number>();
    budgetItems.forEach((item) => {
      if (item.year) years.add(item.year);
    });
    projects.forEach((project) => {
      if (project.year) years.add(project.year);
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [budgetItems, projects]);

  // Sync URL state with local state ONLY on mount
  useEffect(() => {
    if (isInitialMount.current && urlState.year) {
      setSelectedYear(urlState.year);
    }
    isInitialMount.current = false;
  }, []); // Only run once on mount

  // Update URL when year changes - with deduplication
  useEffect(() => {
    if (lastYearUpdate.current !== selectedYear) {
      lastYearUpdate.current = selectedYear;
      // Always include year in URL, even if "all"
      updateUrlState({ year: selectedYear });
    }
  }, [selectedYear]); // Removed updateUrlState from deps

  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    const yearText = year === "all" ? "All Years" : `Year ${year}`;
    toast.success(`Filtering by: ${yearText}`, { duration: 2000 });
  };

  // Check if user has access
  const hasAccess =
    user?.role === "admin" || user?.role === "super_admin" || user?.role === "user";
  const canManage = user?.role === "admin" || user?.role === "super_admin";

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
    <div className="space-y-4">
      {/* Page Header with Year Selector */}
      <div>
        <YearSelector
          selectedYear={selectedYear}
          availableYears={availableYears}
          onYearChange={handleYearChange}
        />
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

      {/* Consolidated List */}
      <ConsolidatedParticularsList 
        selectedYear={selectedYear} 
        onYearChange={handleYearChange}
      />
    </div>
  );
}