// app/dashboard/project/[year]/[particularId]/[projectbreakdownId]/hooks/useFormDisplayValues.ts

import { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { BreakdownFormValues } from "../types/form.types";
import { formatNumberForDisplay } from "../utils/form.utils";

/**
 * Hook to manage formatted display values for currency inputs
 */
export function useFormDisplayValues(form: UseFormReturn<BreakdownFormValues>) {
  const [displayAllocated, setDisplayAllocated] = useState("");
  const [displayObligated, setDisplayObligated] = useState("");
  const [displayUtilized, setDisplayUtilized] = useState("");

  /**
   * Initialize display values on mount
   */
  useEffect(() => {
    const allocated = form.getValues("allocatedBudget");
    const obligated = form.getValues("obligatedBudget");
    const utilized = form.getValues("budgetUtilized");

    if (allocated && allocated > 0) {
      setDisplayAllocated(formatNumberForDisplay(allocated));
    }
    if (obligated && obligated > 0) {
      setDisplayObligated(formatNumberForDisplay(obligated));
    }
    if (utilized && utilized > 0) {
      setDisplayUtilized(formatNumberForDisplay(utilized));
    }
  }, [form]);

  return {
    displayAllocated,
    setDisplayAllocated,
    displayObligated,
    setDisplayObligated,
    displayUtilized,
    setDisplayUtilized,
  };
}