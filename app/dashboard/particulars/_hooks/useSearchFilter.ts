// app/dashboard/particulars/_hooks/useSearchFilter.ts

import { useMemo } from "react";
import { Doc } from "@/convex/_generated/dataModel";

type NodeType = "budget" | "project" | "breakdown";

interface SearchResult {
  type: NodeType;
  item: any;
  parent?: string;
  children?: SearchResult[];
}

interface UseSearchFilterProps {
  hierarchyData: any[];
  debouncedSearch: string;
  budgetParticulars: Doc<"budgetParticulars">[] | undefined;
  projects: Doc<"projects">[] | undefined;
  breakdowns: Doc<"govtProjectBreakdowns">[] | undefined;
}

export function useSearchFilter({
  hierarchyData,
  debouncedSearch,
  budgetParticulars,
  projects,
  breakdowns,
}: UseSearchFilterProps) {
  // Filter hierarchy by search
  const filteredData = useMemo(() => {
    if (!debouncedSearch) return hierarchyData;

    const term = debouncedSearch.toLowerCase();
    return hierarchyData
      .map((item) => {
        const budgetMatch =
          item.particular.code.toLowerCase().includes(term) ||
          item.particular.fullName.toLowerCase().includes(term);

        const filteredBudgetItems = item.budgetItems
          .map((bi: any) => {
            const filteredProjects = bi.projects.filter(
              (p: any) =>
                p.particulars.toLowerCase().includes(term) ||
                p.implementingOffice.toLowerCase().includes(term) ||
                p.breakdowns.some(
                  (b: any) =>
                    b.projectName.toLowerCase().includes(term) ||
                    b.implementingOffice.toLowerCase().includes(term)
                )
            );

            return {
              ...bi,
              projects: filteredProjects,
            };
          })
          .filter((bi: any) => bi.projects.length > 0);

        if (budgetMatch || filteredBudgetItems.length > 0) {
          return {
            ...item,
            budgetItems: budgetMatch ? item.budgetItems : filteredBudgetItems,
          };
        }

        return null;
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }, [hierarchyData, debouncedSearch]);

  // Generate search results with hierarchy for card view
  const searchResults = useMemo((): SearchResult[] => {
    if (!debouncedSearch) return [];

    const results: SearchResult[] = [];
    const term = debouncedSearch.toLowerCase();

    filteredData.forEach((data) => {
      // Check if budget particular matches
      const budgetMatches =
        data.particular.code.toLowerCase().includes(term) ||
        data.particular.fullName.toLowerCase().includes(term);

      // Collect all matching projects and breakdowns
      const projectResults: SearchResult[] = [];

      data.budgetItems.forEach((bi: any) => {
        bi.projects.forEach((project: any) => {
          const projectMatches =
            project.particulars.toLowerCase().includes(term) ||
            project.implementingOffice.toLowerCase().includes(term);

          // Collect matching breakdowns for this project
          const breakdownResults: SearchResult[] = project.breakdowns
            ?.filter(
              (breakdown: any) =>
                breakdown.projectName.toLowerCase().includes(term) ||
                breakdown.implementingOffice.toLowerCase().includes(term)
            )
            .map((breakdown: any) => ({
              type: "breakdown" as const,
              item: breakdown,
              parent: `${data.particular.code} > ${project.particulars}`,
            })) || [];

          // Add project with its breakdowns if it matches or has matching breakdowns
          if (projectMatches || breakdownResults.length > 0) {
            projectResults.push({
              type: "project" as const,
              item: project,
              parent: data.particular.code,
              children: breakdownResults.length > 0 ? breakdownResults : undefined,
            });
          }
        });
      });

      // Add budget particular with its projects if it matches or has matching children
      if (budgetMatches || projectResults.length > 0) {
        results.push({
          type: "budget" as const,
          item: data.particular,
          children: projectResults.length > 0 ? projectResults : undefined,
        });
      }
    });

    return results;
  }, [filteredData, debouncedSearch]);

  // Generate search suggestions
  const searchSuggestions = useMemo(() => {
    if (!debouncedSearch || debouncedSearch.length < 2) return [];

    const term = debouncedSearch.toLowerCase();
    const suggestions: Array<{
      type: string;
      label: string;
      secondary: string;
    }> = [];

    // Search budget particulars
    budgetParticulars?.forEach((bp) => {
      if (
        bp.code.toLowerCase().includes(term) ||
        bp.fullName.toLowerCase().includes(term)
      ) {
        suggestions.push({
          type: "Budget",
          label: bp.code,
          secondary: bp.fullName,
        });
      }
    });

    // Search projects
    projects?.forEach((p) => {
      if (
        p.particulars.toLowerCase().includes(term) ||
        p.implementingOffice.toLowerCase().includes(term)
      ) {
        suggestions.push({
          type: "Project",
          label: p.particulars,
          secondary: p.implementingOffice,
        });
      }
    });

    // Search breakdowns
    breakdowns?.forEach((b) => {
      if (
        b.projectName.toLowerCase().includes(term) ||
        b.implementingOffice.toLowerCase().includes(term)
      ) {
        suggestions.push({
          type: "Breakdown",
          label: b.projectName,
          secondary: b.implementingOffice,
        });
      }
    });

    return suggestions.slice(0, 5);
  }, [debouncedSearch, budgetParticulars, projects, breakdowns]);

  return { filteredData, searchResults, searchSuggestions };
}