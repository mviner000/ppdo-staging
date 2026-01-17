// app/dashboard/particulars/_hooks/useHierarchyData.ts

import { useMemo } from "react";
import { Doc } from "@/convex/_generated/dataModel";

type SortOrder = "asc" | "desc";

interface UseHierarchyDataProps {
  budgetParticulars: Doc<"budgetParticulars">[] | undefined;
  projectParticulars: Doc<"projectParticulars">[] | undefined;
  budgetItems: Doc<"budgetItems">[] | undefined;
  projects: Doc<"projects">[] | undefined;
  breakdowns: Doc<"govtProjectBreakdowns">[] | undefined;
  selectedYear: string;
  sortOrder: SortOrder;
}

export function useHierarchyData({
  budgetParticulars,
  projectParticulars,
  budgetItems,
  projects,
  breakdowns,
  selectedYear,
  sortOrder,
}: UseHierarchyDataProps) {
  const hierarchyData = useMemo(() => {
    if (!budgetParticulars || !projectParticulars || !budgetItems || !projects || !breakdowns) {
      return [];
    }

    let data = budgetParticulars.map((budgetParticular) => {
      const relatedBudgetItems = budgetItems.filter(
        (bi) => bi.particulars === budgetParticular.code && !bi.isDeleted
      );

      const budgetItemsWithProjects = relatedBudgetItems.map((budgetItem) => {
        let relatedProjects = projects.filter(
          (p) => p.budgetItemId === budgetItem._id && !p.isDeleted
        );

        // Filter by year if not "all"
        if (selectedYear !== "all") {
          relatedProjects = relatedProjects.filter(
            (p) => p.year?.toString() === selectedYear
          );
        }

        const projectsWithBreakdowns = relatedProjects.map((project) => {
          const relatedBreakdowns = breakdowns.filter(
            (b) => b.projectId === project._id && !b.isDeleted
          );

          return {
            ...project,
            breakdowns: relatedBreakdowns,
          };
        });

        return {
          ...budgetItem,
          projects: projectsWithBreakdowns,
        };
      });

      const totalProjects = budgetItemsWithProjects.reduce(
        (sum, bi) => sum + bi.projects.length,
        0
      );
      const totalBreakdowns = budgetItemsWithProjects.reduce(
        (sum, bi) =>
          sum +
          bi.projects.reduce((s, p) => s + (p.breakdowns?.length || 0), 0),
        0
      );

      return {
        particular: budgetParticular,
        budgetItems: budgetItemsWithProjects,
        totalProjects,
        totalBreakdowns,
      };
    });

    // Sort alphabetically by fullName
    data.sort((a, b) => {
      const comparison = a.particular.fullName.localeCompare(b.particular.fullName);
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return data;
  }, [budgetParticulars, projectParticulars, budgetItems, projects, breakdowns, selectedYear, sortOrder]);

  const totals = useMemo(() => {
    const totalBudgetItems = hierarchyData.reduce(
      (sum, item) => sum + item.budgetItems.length,
      0
    );
    const totalProjects = hierarchyData.reduce(
      (sum, item) => sum + item.totalProjects,
      0
    );
    const totalBreakdowns = hierarchyData.reduce(
      (sum, item) => sum + item.totalBreakdowns,
      0
    );

    return {
      budgetItems: totalBudgetItems,
      projects: totalProjects,
      breakdowns: totalBreakdowns,
    };
  }, [hierarchyData]);

  return { hierarchyData, totals };
}