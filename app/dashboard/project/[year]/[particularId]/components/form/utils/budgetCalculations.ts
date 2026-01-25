// app/dashboard/project/[year]/[particularId]/components/form/utils/budgetCalculations.ts

export interface BudgetAvailabilityResult {
  isLoading: boolean;
  parentTotal: number;
  siblingTotal: number;
  available: number;
  isOverBudget: boolean;
  overBudgetAmount: number;
  percentage: number;
}

export const calculateBudgetAvailability = (
  shouldFetchParent: boolean,
  parentBudgetItem: any | null,
  siblingProjects: any[] | undefined,
  currentProject: any | null,
  totalBudgetAllocated: number
): BudgetAvailabilityResult => {
  if (!shouldFetchParent || !parentBudgetItem || !siblingProjects) {
    return {
      available: 0,
      isOverBudget: false,
      overBudgetAmount: 0,
      parentTotal: 0,
      siblingTotal: 0,
      percentage: 0,
      isLoading: true,
    };
  }

  const parentTotal = parentBudgetItem.totalBudgetAllocated;
  const filteredSiblings = currentProject
    ? siblingProjects.filter(p => p._id !== currentProject.id)
    : siblingProjects;
  const siblingTotal = filteredSiblings.reduce((sum, p) => sum + p.totalBudgetAllocated, 0);
  const available = parentTotal - siblingTotal;
  const isOverBudget = totalBudgetAllocated > available;
  const overBudgetAmount = isOverBudget ? totalBudgetAllocated - available : 0;
  const percentage = available > 0 ? (totalBudgetAllocated / available) * 100 : 0;

  return {
    isLoading: false,
    parentTotal,
    siblingTotal,
    available,
    isOverBudget,
    overBudgetAmount,
    percentage,
  };
};