/**
 * Shared Breakdown Components Index
 *
 * Export all shared components for the Container/Presenter architecture.
 */

export { BreakdownHeader } from "./BreakdownHeader";
export type { BreakdownHeaderProps } from "./BreakdownHeader";

export { EntityOverviewCards } from "./EntityOverviewCards";
export type { EntityOverviewCardsProps } from "./EntityOverviewCards";

export { BreakdownStatsAccordion } from "./BreakdownStatsAccordion";
export type { BreakdownStatsAccordionProps } from "./BreakdownStatsAccordion";

/**
 * Note on BreakdownTable and BreakdownForm:
 *
 * The existing BreakdownHistoryTable and BreakdownForm in the project breakdown page
 * are highly complex with many custom hooks and features (column resizing, drag-drop,
 * print adapters, etc.).
 *
 * For the Trust Fund implementation, these components can be reused directly from:
 * - app/dashboard/project/[year]/[particularId]/[projectbreakdownId]/components/
 *
 * In the future, these could be further abstracted, but they already work with
 * IBaseBreakdown[] data and can be parameterized through props.
 */
