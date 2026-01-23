// app/dashboard/project/[year]/components/hooks/useBudgetAccess.ts

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useBudgetAccess() {
  const accessCheck = useQuery(api.budgetAccess.canAccess);

  return {
    accessCheck,
    isLoading: accessCheck === undefined,
    canAccess: accessCheck?.canAccess ?? false,
    user: accessCheck?.user,
    department: accessCheck?.department,
  };
}