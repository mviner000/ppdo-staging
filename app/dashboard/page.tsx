// app/dashboard/page.tsx
"use client";

/**
 * Main Dashboard Landing Page
 *
 * Displays fiscal year cards as the primary dashboard interface.
 * Users select a fiscal year to view year-specific analytics.
 *
 * This replaces the previous single analytics view with a year-selection view.
 */

import { FiscalYearLanding, DashboardFundSelection } from "@/components/ppdo/dashboard/landing";
import { useRouter, useSearchParams } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const view = searchParams.get("view");

  const handleSelectBudget = () => {
    router.push("/dashboard?view=years");
  };

  const handleBackToSelection = () => {
    router.push("/dashboard");
  };

  const handleBackToHome = () => {
    router.push("/");
  };

  if (view === "years") {
    return <FiscalYearLanding onBack={handleBackToSelection} />;
  }

  return <DashboardFundSelection onSelectBudget={handleSelectBudget} onBack={handleBackToHome} />;
}
