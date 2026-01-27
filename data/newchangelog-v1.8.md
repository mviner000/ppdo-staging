PS C:\ppdo\ppdo-next> git log
commit a3cbfae1b14e97a4e7fa360b99d3d19e9c6b151b (HEAD -> main)
Merge: 9adce55 4252a61
Author: mviner000 <m.viner001@gmail.com>
Date:   Tue Jan 27 11:26:03 2026 +0800

    Merge branch refactor-project-breakdownv1 into main

commit 4252a61b2a6ce62a1d2bbbb784f4ba3e8f652fd0 (refactor-project-breakdownv1)
Author: mviner000 <m.viner001@gmail.com>
Date:   Tue Jan 27 11:23:20 2026 +0800

    feat: redesign dashboard landing with folder-style years and fund selection flow; adds folder-style fiscal year cards, fund selection flow, dynamic accents, routing via search params, fixes build with use client, and improves landing typography

commit 28cfd859aa6c57c031faf5168c40da2266d910c3
Author: primex-melvin <nogoy.melvin@primex.ventures>
Date:   Tue Jan 27 09:49:59 2026 +0800

    feat: complete dashboard implementation with optimized data fetching

    Restructure dashboard with two-tier year system (landing  year summaries)
    Optimize Convex queries with single bulk fetch and server-side aggregation (~60% smaller payload, no N+1)
    Add beta banner with role-based dismissal and localStorage persistence
    Ensure zero breaking changes to existing routes and functions

    Create new dashboard architecture:
    - 7 new React components (landing, summary, KPI cards, analytics grid)
    - Optimized Convex module with 2 queries
    - Type definitions and barrel exports
    - Dynamic year route and updated dashboard page
    - Comprehensive documentation

    UI/UX updates:
    - 5 items per row on large screens with responsive tablet/mobile layout
    - Replace all 'fiscal year' and 'FY' references with 'year'
    - Match office page folder background color while preserving layout and UX

    All code compiles with zero TypeScript errors and is ready for testing

commit e521809d3ac7a8a28310673975dc073a3a1583c4
Author: primex-melvin <nogoy.melvin@primex.ventures>
Date:   Tue Jan 27 08:59:56 2026 +0800

    feat: animated category filter with counts, reduced-motion, and sidebar last-click

    Add accessible animations and counts to category filter (ProjectCategoryFilter.tsx)
    Respect prefers-reduced-motion via useReducedMotion.ts
    Animate table safely using motion.tr in ProjectsTableRow.tsx and ProjectCategoryGroup.tsx (fixes invalid <tr> ancestry / hydration errors)
    Compute and pass categoriesForFilter counts in ProjectsTable.tsx
    Persist sidebar last-click active state in SidebarNav.tsx
    UX polish: outline-only active pill style, numeric badges, pointer affordances
    Type and JSX fixes for Framer Motion easing and parsing issues

commit f1f26e1c2aa5b0d453884611ebd68c51bca9f5bc
Author: primex-melvin <nogoy.melvin@primex.ventures>
Date:   Tue Jan 27 06:47:47 2026 +0800

    feat: enhance inspections table with thumbnail image gallery and remove unused mockData

    - Display actual thumbnail images in table rows for better visual feedback
    - Show up to 3 thumbnails per inspection with overflow indicator (+N)
    - Add hover effects and click-to-open gallery on thumbnails
    - Implement robust image error handling with fallback placeholders
    - Remove mockData.ts dependency from project detail pages
    - Update InspectionContent to remove unused data prop
    - All existing functionality preserved with no breaking changes

commit 449335e6edc593c3526151c25ae6cb743ba2d0b6
Author: mviner000 <m.viner001@gmail.com>
Date:   Tue Jan 27 06:03:42 2026 +0800

    fix: resolve 404 navigation error on project row click by ensuring correct URL encoding

commit deed4efa8454378e8d598dca35b8c4a5dac757a8
Author: mviner000 <m.viner001@gmail.com>
Date:   Tue Jan 27 00:21:51 2026 +0800

    feat(ui): refactor financial tabs, clean breadcrumbs, and add summary toggle

    - Modularized FinancialBreakdownTabs into Header and Main components
    - Repositioned tab selector to header next to navigation
    - Implemented clean name extraction for breadcrumbs to remove ID suffixes
    - Added toggle button to show/hide financial summary statistics card
    - Improved responsive layout for breakdown details page

commit 470da724c32d10e3d7dd1ffe17a6e3d85ab53786
Author: primex-melvin <nogoy.melvin@primex.ventures>
Date:   Mon Jan 26 22:07:52 2026 +0800

    feat: implement toolbar standardization with reusable hooks and standardize print preview pattern 
    
    - Add useTableSearch, useTableSelection, useTableColumnVisibility hooks
    - Add bulkOperations and bulkMutations backend helpers
    - Reduce table code by ~60% through hook reuse
    - Standardize print preview pattern across FundsTableToolbar and ProjectsTableToolbar
    - Add onOpenPrintPreview and hasPrintDraft props
    - Apply consistent Export Options dropdown to all tables
    - Maintain backward compatibility with existing toolbars

    Impact: Unified table infrastructure across all data pages

commit 8e82d7c630130b7a3235efbc468a8a68dc011889
Author: primex-melvin <nogoy.melvin@primex.ventures>
Date:   Mon Jan 26 21:21:17 2026 +0800

    refactor: unify table toolbars into single reusable TableToolbar component

    Consolidate BudgetTableToolbar, ProjectsTableToolbar, and FundsTableToolbar into a unified, pluggable TableToolbar component with backward-compatible adapters. Reduces code duplication while maintaining 100% backward compatibility.

    - Extract TableToolbarColumnVisibility and TableToolbarBulkActions
    - Create backward-compatible adapters for all existing toolbars
    - Add comprehensive TypeScript interfaces and documentation
    - No breaking changes - all existing imports work unchanged

commit 5e43c624e2996174989d6a0c396ad92a21b1a30c
Author: primex-melvin <nogoy.melvin@primex.ventures>
Date:   Mon Jan 26 20:54:56 2026 +0800

    refactor: move FiscalYearModal to shared folder and remove OpenAI chat

    - Move `FiscalYearModal.tsx` from `app/dashboard/project/components/` to `components/ppdo/fiscal-years/`
    - Update exports in `components/ppdo/fiscal-years/index.ts`
    - Update imports in project, trust funds, SHF, and SEF dashboard pages
    - Remove unused `app/api/chat/route.ts` and `components/AIAssistant.tsx`
    - Remove `openai` dependency from package.json
    - Clean up AIAssistant references in dashboard, mail, and changelog layouts
    - Fix ActivityLogCard missing type definitions for SEF/SHF breakdown

commit 895a63ded8e6eab7056b38efc6a84a3ab438c878
Author: primex-melvin <nogoy.melvin@primex.ventures>
Date:   Mon Jan 26 20:33:26 2026 +0800

    style(ui): improve fiscal year card layout and typography

    - Move stats to display above action buttons for better grouping
    - Update mobile layout to position menu actions more efficiently
    - Ensure responsive behavior preserves accessibility and touch targets

Author: primex-melvin <nogoy.melvin@primex.ventures>
Date:   Mon Jan 26 20:07:15 2026 +0800

    refactor(dashboard): implement DRY principle for fiscal year landing pages

    Extract common UI components to components/ppdo/fiscal-years:
    - FiscalYearHeader
    - FiscalYearCard
    - FiscalYearEmptyState
    - FiscalYearDeleteDialog

    Refactor project, trust-funds, special-health-funds, and special-education-funds pages to use shared components while maintaining existing functionality and styling.

commit 66aa2c1b5dac6395d1f947ede23d6cfe9cd043ca
Author: primex-melvin <nogoy.melvin@primex.ventures>
Date:   Mon Jan 26 19:58:58 2026 +0800

    feat: implement shadcn tooltips and improve sidebar accessibility

commit af8c7308dc5b3b08898636b1d6734774c360b8e8
Author: primex-melvin <nogoy.melvin@primex.ventures>
Date:   Mon Jan 26 19:46:09 2026 +0800

    refactor: migrate middleware to proxy convention

commit d5b0952d2c14e2e088b2b672a90fb560eea9f5f0 (origin/refactor-project-breakdownv1)
Author: alec <narq.99@gmail.com>
Date:   Mon Jan 26 19:07:38 2026 +0800

    fix(activity-logs): fix special education and special health logging

    - Align backend activity loggers with frontend consumption
    - Add breakdown activity tracking for special ed and special health
    - Update activity log types and hooks
    - Document activity log behavior

commit deafb60f9313c980cf295d2e1432d204fc68b59f
Author: primex-melvin <nogoy.melvin@primex.ventures>
Date:   Mon Jan 26 15:37:27 2026 +0800

    feat: add on_process status support.

    Includes schema, validators, UI, and status counting updates.

commit 9688ab68c66df0f138801a101f7dbfd6a36a3057
Author: primex-melvin <nogoy.melvin@primex.ventures>
Date:   Mon Jan 26 15:03:07 2026 +0800

    style: move NEW badge to top-left of nav items

commit 0e15be75655eda89e96497e52f0514d5e6be9cb5
Author: primex-melvin <nogoy.melvin@primex.ventures>
Date:   Mon Jan 26 15:02:14 2026 +0800

    fix: prevent dropdown action clicks from triggering row navigation

    fix: remove unsupported fields from createBreakdown mutation payload

commit 001f789cd29fa912e957d5731ffa87c07938f725
Author: primex-melvin <nogoy.melvin@primex.ventures>
Date:   Mon Jan 26 14:16:58 2026 +0800

    feat: add Special Education Funds and Special Health Funds nav items

commit 9cd180515274e94179cbeca8f1a2c068179e70d9
Author: primex-melvin <nogoy.melvin@primex.ventures>
Date:   Mon Jan 26 13:41:08 2026 +0800

    feat: implement special health funds and refactor shared funds UI

    - Create specialHealthFunds backend module with schema, mutations, and queries
    - Add activity logging for Special Health Funds
    - Refactor Trust Funds components into reusable ppdo/funds components
    - Implement SpecialEducationFunds and SpecialHealthFunds pages using shared UI
    - Update schema registry and breakdown types
    - Migrate Trust Funds page to use new shared components

commit b2cbd4ee75b09a0af8257f3d3462956b6d8e7658
Merge: 2c26fc9 5d3a7c6
Author: primex-melvin <nogoy.melvin@primex.ventures>
Date:   Mon Jan 26 11:16:53 2026 +0800

    feat: dashboard initial style MVPv1 updated, merge from sir alec

commit 2c26fc9bd2ab2d9079a34e339099bed7c53a5ad2
Author: primex-melvin <nogoy.melvin@primex.ventures>
Date:   Mon Jan 26 11:11:36 2026 +0800

    feat: add specialHealthFunds module

    - Add schema for specialHealthFunds and activity tracking
    - Implement full CRUD, trash, restore, bulk, pin, and status operations
    - Register new tables in main Convex schema
    - Mirror structure and behavior of specialEducationFunds

commit 5d3a7c6b78a50d581a76271b55f7ed6808c0fed8 (origin/dashboard-v1)
Author: 4lecboy <narq.99@gmail.com>
Date:   Mon Jan 26 11:09:31 2026 +0800

    feat: integrate dashboard graphs/charts with real data

commit f90ccc2ab015eb43e42987b1f26576c913476837
Author: primex-melvin <nogoy.melvin@primex.ventures>
Date:   Mon Jan 26 09:47:40 2026 +0800

    feat(backend): introduce shared breakdown framework and trust fund support

    Added backend base breakdown schema to unify project and trust fund breakdown fields

    Refactored backend project breakdown logic to use shared validation, financials, and soft delete helpers

    Implemented backend CRUD operations and activity logging for trust fund breakdowns

    Preserved existing backend behavior and fixed incorrect usage count updates during soft delete/restore

commit 945699517fa8e42350d619a0dea181cfb2fd7446
Author: primex-melvin <nogoy.melvin@primex.ventures>
Date:   Mon Jan 26 08:58:54 2026 +0800

    refactor(breakdown): remove project-specific duplicates after centralization

    Cleaned up [projectbreakdownId] by removing components, hooks, utils, and constants now centralized under components/ppdo/breakdown

    Replaced legacy components with shared equivalents (BreakdownHeader, EntityOverviewCards, BreakdownStatsAccordion)

    Retained only project-specific files; TypeScript compiles with no errors and behavior unchanged   

commit a8f9e6787e42fbe076c98a25ccc9ea00ed22e999
Author: primex-melvin <nogoy.melvin@primex.ventures>
Date:   Mon Jan 26 08:45:00 2026 +0800

    refactor(breakdown): centralize breakdown components and imports

    Introduced centralized breakdown structure with barrel exports

    Added table, form, hooks, utils, constants, and types directories

    Enabled shared usage for project and trust fund breakdowns via entityType

    Preserved existing behavior with no breaking changes

commit eb29340a6754e9bb51e49a519cf4968d48275dc7
Author: primex-melvin <nogoy.melvin@primex.ventures>
Date:   Mon Jan 26 00:36:42 2026 +0800

    fix: The year prop is now required in TrustFundsTableProps

commit de1ebda198738e16e56d42c61bbe76b6f43ea0f5
Author: primex-melvin <nogoy.melvin@primex.ventures>
Date:   Mon Jan 26 00:11:32 2026 +0800

    feat: introduce shared breakdown framework and trust fund breakdowns (backend + frontend)

    - Add shared base breakdown schema with financials, progress tracking, soft delete, and audit fields
    - Refactor project and trust fund breakdown schemas to extend shared base schema
    - Introduce reusable backend helpers for validation, financial calculations, soft delete, and change tracking
    - Refactor project breakdown logic to use shared helpers and fix incorrect usage count updates    
    - Implement full Trust Fund breakdown CRUD with activity logging and no parent status recalculation
    - Add shared frontend breakdown types, hooks, and reusable UI components
    - Implement Trust Fund breakdown detail page using shared components and logic
    - Retrofit Project breakdown page to shared header, stats, and hooks
    - Enable trust fund table row navigation via slug-based routing while preserving interactive controls

commit e3268fb43072a965b99471a2bdb21070dbcb3f0c
Author: primex-melvin <nogoy.melvin@primex.ventures>
Date:   Sun Jan 25 21:27:07 2026 +0800

    refactor: decompose project breakdown page into sub-components

    - Extract page utilities and helpers to separate files
    - Create useBreakdownStats custom hook for data processing
    - Implement presentational components (Header, Stats, Overview, StatusChain)
    - Refactor main page.tsx to act as a container following DRY principles

commit 683406db51206fb049f2e15437cd4e61cb2eafc6
Author: primex-melvin <nogoy.melvin@primex.ventures>
Date:   Sun Jan 25 21:03:18 2026 +0800

    feat(backend): implement trust fund access and shared access logic

commit 4d5c94a95b4379c656bf76014aa50b9b6412a516
Author: primex-melvin <nogoy.melvin@primex.ventures>
Date:   Sun Jan 25 20:09:14 2026 +0800

    refactor: centralize ImplementingOfficeSelector into components/ppdo/table/implementing-office with organized structure and updated imports

commit f4692a65cbcf5e4af129cbb08a735297ec30c6d1
Author: primex-melvin <nogoy.melvin@primex.ventures>
Date:   Sun Jan 25 19:17:03 2026 +0800

    refactor: standardize frontend architecture and eliminate duplication

    Standardized frontend architecture by removing duplicated logic across forms, tables, and layouts.

    1. Logic: Unified form helpers, budget hooks, and CRUD mutation factories
    2. Forms: Introduced generic CurrencyInputs and FormElementWrappers
    3. Tables: Abstracted toolbars, column definitions, and row action menus
    4. UI/UX: Centralized PageHeaders, Skeletons, Modals, and ThemedButtons
    5. Validation: Added base Zod schemas and shared error constants
    6. Types: Aligned frontend types with Convex data models

commit 31578f0771a82d64863e00bfa047e38477931e81
Author: primex-melvin <nogoy.melvin@primex.ventures>
Date:   Sun Jan 25 16:59:30 2026 +0800

    refactor: modularize BreakdownForm into focused components and shared utilities

    Details:
    - Split BreakdownForm.tsx into 17 focused components:
      - Field components: ProjectTitle, ImplementingOffice, AllocatedBudget, ObligatedBudget, UtilizedBudget, Accomplishment, Status, Remarks
      - Grouped components: LocationFields, DateFields
      - Display components: BudgetOverviewCard, BudgetWarningAlert, BudgetStatusBar
      - Section wrappers: FinancialInfoSection, AdditionalInfoSection
      - Actions: FormActions
    - Extracted shared logic into form/utils (formValidation, formHelpers, formStorage, budgetCalculations, budgetValidation)
    - Introduced useBudgetValidation hook to centralize validation logic
    - Added form/index.ts barrel export for cleaner imports
    - Reduced main form size from ~400 lines to ~200 lines
    - Removed deprecated form-sections/ directory
    - Preserved all existing behavior (no breaking changes)
    - Improved maintainability, testability, and reusability
    - Aligned structure with BudgetItemForm and ProjectForm patterns

commit e431ba88eb6c96cdb4c3bbe52c8610f087a36d0b
Author: primex-melvin <nogoy.melvin@primex.ventures>
Date:   Sun Jan 25 16:18:59 2026 +0800

    refactor: modularize ProjectForm into focused subcomponents

    - Split ProjectForm.tsx into 10 focused components:
      ParticularField, CategoryField, ImplementingOfficeField, YearField,
      AllocatedBudgetField, AutoCalculateSwitch, ManualInputSection,
      RemarksField, UtilizationDisplay, FormActions
    - Extract utilities into form/utils/ (formValidation, formHelpers, formStorage, budgetCalculations)
    - Add form/index.ts barrel export for cleaner imports
    - Move budget availability logic to a pure function
    - Implement inline edit + auto-create in ParticularField
    - Integrate parent budget tooltip and warnings in AllocatedBudgetField
    - Handle conditional rendering in ManualInputSection based on auto-calculate state
    - Preserve all existing behavior (no breaking changes)
    - Reduce main form size from 600+ lines to ~200
    - Improve maintainability and testability
    - Align structure with BudgetItemForm architecture

commit b58e38e8015de5216a16babe82a3c02bd2e931d0
Author: primex-melvin <nogoy.melvin@primex.ventures>
Date:   Sun Jan 25 15:58:34 2026 +0800

    refactor: break down BudgetItemForm into modular subcomponents

    - Split BudgetItemForm.tsx into 9 focused components (ParticularField, YearField, AllocatedBudgetField, AutoCalculateSwitch, ManualInputSection, ViolationAlerts, InfoBanner, FormActions)
    - Extract utilities into form/utils/ (formValidation, formHelpers, formStorage)
    - Create form/index.ts barrel export for clean imports
    - Fix TypeScript issues with autoCalculateBudgetUtilized type safety
    - No breaking changes, all functionality preserved
    - Improves maintainability and testability

commit 1a412fe68084619d0df7bc328cb1374e1db97477 (rapidv1)
Author: primex-melvin <nogoy.melvin@primex.ventures>
Date:   Sun Jan 25 14:46:51 2026 +0800

    feat(print-preview): add inline column renaming and WYSIWYG table borders in PDF

    - Support inline column renaming with live preview updates
    - Persist custom column labels across all preview pages
    - Mark drafts dirty on rename and reset overrides on modal close
    - Align PDF table borders with print preview rendering
    - Respect column visibility when generating PDF borders
    - Parameterize table border color and width for future customization
    - Normalize text spacing and font rendering to prevent space collapsing in PDFs
    - Fix html2canvas SVG color parsing errors by rendering borders as base64 images

commit 570fcbc5278ec149245f2f44e4a6e5382fd016d0
Author: primex-melvin <nogoy.melvin@primex.ventures>
Date:   Sun Jan 25 13:53:07 2026 +0800

    fix: ensure table reactivity, borders, and resize constraints respect column visibility

    - Fix React re-render issue by introducing hiddenColumnsVersion counter
    - Force TableGroup recalculation when hidden columns change
    - Exclude hidden elements from table border overlay and group detection
    - Prevent table resizing beyond page bounds for all paper sizes/orientations
    - Improve column visibility UX (separate eye button, inline rename, width display)
    - Display table dimensions in group header
    - Clean up debug logs and unused state

commit 5e2dce582656feda649895323c60ade8ae20a3d7
Author: primex-melvin <nogoy.melvin@primex.ventures>
Date:   Sun Jan 25 11:49:38 2026 +0800

    feat(print-preview): implement default table borders

    - Add TableBorderOverlay component with automatic table detection
    - Remove cell padding and gaps for edge-to-edge table layout
    - Apply 1px solid black borders between all rows and cells
    - Maintain 4px internal text padding for readability

    BREAKING CHANGE: Tables now render with zero cell spacing by default.

commit 0c1d5e7f52a4ae2605b406b107f64e2e76b631fd
Author: primex-melvin <nogoy.melvin@primex.ventures>
Date:   Sun Jan 25 11:22:34 2026 +0800

    feat(print-preview): unify template and orientation into a single setup wizard

    BREAKING CHANGE: Sequential modals were replaced with a multi-step tabbed interface inside a single setup modal, eliminating race conditions and UI flashes.

    Changes:
    - Converted PageOrientationModal into PageOrientationTab sub-component
    - Updated TemplateSelector to orchestrate 'template' and 'orientation' setup steps
    - Simplified PrintPreviewModal logic to a single 'showSetupModal' flag
    - Fixed race condition where template selector remained open during orientation step
    - Standardized setup return value to { template, orientation }
    - Preserved live template application from the toolbar

    Benefits:
    - Impossible for setup modals to overlap
    - Smooth transitions with no visual flashing
    - Reduced state complexity and clearer ownership of setup flow

commit 337b24e2716618520132c7663a2b2854804203e9
Author: primex-melvin <nogoy.melvin@primex.ventures>
Date:   Sun Jan 25 10:42:15 2026 +0800

    feat(print-preview): add separate orientation modal flow

    BREAKING CHANGE: Print preview initialization now uses a two-step modal flow (template  orientation).

    Changes:
    - Added PageOrientationModal with visual portrait/landscape cards
    - Removed orientation dropdown from TemplateSelector header
    - Updated PrintPreviewModal to orchestrate two-step modal flow
    - Modified template selection to pass orientation separately
    - Introduced modal transition state handling
    - Extended ResizableModal with allowOverflow prop

    Features:
    - Visual orientation selection with preview cards
    - Smooth modal transitions between steps
    - Preserves drafts, templates, and live apply behavior
    - Improved UX with clear visual feedback

    Known Issues:
    - Modal transition timing flashes on Skip action
    - Template selector may not close before orientation modal opens

    TODO: Fix modal transition race condition on Skip button

commit 2db79a5e58c319b3580af051e87d4bd2e5023f0d
Author: primex-melvin <nogoy.melvin@primex.ventures>
Date:   Sun Jan 25 07:53:44 2026 +0800

    feat: add interactive table resizing to print preview

    Implements a comprehensive table resizing experience in PrintPreviewModal.tsx.

    Features:
    - Column resizing with live preview
    - Row resizing with live preview
    - Double-click auto-fit to content
    - Keyboard-accessible resize handles (arrow keys)
    - Modern UI with hover states, smooth 150ms transitions, and 8px hit zones
    - Visual feedback via blue resize handles (hover/active states)
    - Enforced size constraints for rows and columns
    - Undo/redo support via existing draft auto-save (setIsDirty)
    - High-performance updates using requestAnimationFrame and memoization
    - Full accessibility support with ARIA labels, tab navigation, and screen readers

commit 9adce5551fd24d764e86e9066bf3dd4dea5a7cc4
Author: primex-melvin <nogoy.melvin@primex.ventures>
Date:   Sun Jan 25 04:04:23 2026 +0800

    chore: gitgnore updated, exclude automaker files

commit 85629d5bbe1104acf9ee78674feddb57f5c563ec
Author: primex-melvin <nogoy.melvin@primex.ventures>
Date:   Sun Jan 25 04:02:27 2026 +0800

    feat(print-preview): add inline document title editing

    - Introduce DocumentTitleEditor with click-to-edit behavior
    - Enable editing only in Editor Mode with Enter to save and Esc to cancel
    - Auto-focus, text selection, and 100-character validation
    - Prevent empty titles by reverting to previous value
    - Add visual hover cues for editability

    - Add documentTitle and lastModified state to print preview hooks
    - Persist title changes with draft save logic and dirty-state tracking
    - Extend PrintDraft and DraftInfo types with backward-compatible fields

    - Initialize titles from existing drafts or generated defaults
    - Reset title state on modal close
    - Apply consistent title support to generic print preview modals

commit 165ac6bd743aa9090a2dd2932d47685cde8dbf32
Author: primex-melvin <nogoy.melvin@primex.ventures>
Date:   Sat Jan 24 21:20:19 2026 +0800

    feat: implement table styling panel with predefined styles

    Add a draggable Table Styling Panel that appears when a table group is selected:
    - Provide multiple predefined table styles for quick application
    - Enable one-click application of styles to entire table groups
    - Automatically hide panel when selection is cleared or non-table elements are selected
    - Add backgroundColor support to TextElement type for proper styling

commit 354ea87284e8012a4e9a9d86c59679e3201632d0
Author: primex-melvin <nogoy.melvin@primex.ventures>
Date:   Sat Jan 24 21:00:20 2026 +0800

    feat: add dynamic document ruler with margins, indents, and tab stops

    Introduce a dynamic document ruler similar to word processors:
    - Horizontal ruler with inch, centimeter, and pixel units
    - Optional vertical ruler aligned to the left of the canvas
    - Draggable margin markers (left, right, top, bottom) with live feedback
    - Draggable indent markers (first-line, left, right) on horizontal ruler
    - Tab stop support (left, center, right, decimal); double-click to add, right-click to remove     
    - Automatic rescaling based on page size and orientation
    - Synchronize ruler position with canvas scrolling

    Enhance usability and persistence:
    - Toolbar toggle button with active state indicator
    - Keyboard shortcut (Ctrl+Shift+R) to toggle ruler visibility
    - Persist ruler state (visibility, units, margins, indents, tab stops) via localStorage
    - Tooltips for all interactive markers
    - Corner indicator when both rulers are visible

    Lay groundwork for future zoom support with scalable ruler architecture.

commit 4a256f4faeb25d4cd23eff440eb9c90388951b1c
Author: primex-melvin <nogoy.melvin@primex.ventures>
Date:   Sat Jan 24 20:13:22 2026 +0800

    feat: define PPDO development team with specialized agents

    Add comprehensive agent definitions for full-stack Convex + Next.js development:
    - Backend/Convex Architect: database schema, mutations, queries, RBAC
    - Frontend/React Specialist: Next.js pages, React components, client state
    - UI/UX Designer: shadcn/ui, Tailwind CSS, accessibility patterns
    - Security & Auth Specialist: authentication, authorization, audit logging
    - Data & Business Logic Engineer: budget aggregations, fiscal workflows
    - QA & Testing Agent: Jest, component testing, quality assurance
    - Print & Export Specialist: PDF generation, canvas rendering, media handling
    - DevOps & Performance Agent: build optimization, CI/CD, monitoring

    Include expertise areas, key files, best practices, and code patterns for each agent.
    Add index.md as a central hub for team navigation and collaboration.

commit 73b6fe2c642fb5a6022d71b7b21fc46544db6396
Author: primex-melvin <nogoy.melvin@primex.ventures>
Date:   Sat Jan 24 20:12:38 2026 +0800

    feat: create PPDO development team with 8 specialized agents

    Add comprehensive agent definitions for full-stack Convex + Next.js development:
    - Backend/Convex Architect: Database schema, mutations, queries, RBAC
    - Frontend/React Specialist: Next.js pages, React components, client-side state
    - UI/UX Designer: Shadcn/ui, Tailwind CSS, accessibility patterns
    - Security & Auth Specialist: Authentication, authorization, audit logging
    - Data & Business Logic Engineer: Budget aggregations, fiscal workflows
    - QA & Testing Agent: Jest testing, component testing, quality assurance
    - Print & Export Specialist: PDF generation, canvas rendering, media handling
    - DevOps & Performance Agent: Build optimization, CI/CD, monitoring

    Each agent includes expertise areas, key files, best practices, and code patterns.
    Added index.md as central hub for team navigation and collaboration matrix.

    🤖 Generated with [Claude Code](https://claude.com/claude-code)

    Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>

commit 6005c06e3780b8c18e01c0f0a0373360c33ada0e (origin/rapidv1)
Author: primex-melvin <nogoy.melvin@primex.ventures>
Date:   Sat Jan 24 20:03:26 2026 +0800

    fix: pass missing editor mode props to PrintPreviewToolbar

    Add isEditorMode state to GenericPrintPreviewModal
    Pass isEditorMode and onEditorModeChange props to PrintPreviewToolbar to resolve TypeScript errors

commit 66992705fb29b0188bebb3bf265c53f7ee3a57ac
Author: primex-melvin <nogoy.melvin@primex.ventures>
Date:   Sat Jan 24 18:51:55 2026 +0800

    feat: add layer group selection and outline rendering in canvas

    Enable selecting entire layer groups from the layer panel:
    - Clicking a group header selects all elements in the group
    - Selecting a group deselects any active individual element
    - Selecting an individual element clears the active group selection

    Render visual outline for selected groups:
    - Calculate bounding box across all visible group elements
    - Draw 1px blue (#3b82f6) border around group bounds
    - Works consistently in header, page body, and footer sections

    Introduce selectedGroupId state for group selection:
    - Propagated through print preview state, canvas, and layout components
    - Ensures consistent group selection behavior across UI interactions

commit c413f7568e3a74d13d6fe3615057a82ce116a7b7
Author: primex-melvin <nogoy.melvin@primex.ventures>
Date:   Sat Jan 24 17:51:17 2026 +0800

    feat: add viewer/editor mode toggle to print preview modal

    Previously, PrintPreviewModal always loaded in full editor mode with all toolbars and editing capabilities enabled, which could be overwhelming for users who just want to view and export the document.

    Added a shadcn Switch toggle in PrintPreviewToolbar to control viewer/editor mode:
    - Default state: viewer mode (isEditorMode = false)
    - Viewer mode shows only: Export as PDF button, page navigation, and page panel sidebar
    - Editor mode enables: all editing toolbars, canvas interactions, Apply Template, and Save Draft buttons
    - Canvas Toolbar conditionally renders editing tools based on mode
    - Bottom page controls shows only pagination in viewer mode, adds layer/page management in editor mode
    - Page panel sidebar remains visible in both modes for easy page navigation
    - Canvas element interactions (select, update, delete) disabled in viewer mode

    This provides a cleaner, focused interface for users who only need to view and export documents, while preserving full editing capabilities when needed.

commit 763b63dc9c169ac860f075ce1fafc4517fe84157
Author: primex-melvin <nogoy.melvin@primex.ventures>
Date:   Sat Jan 24 17:36:58 2026 +0800

    chore: outline_b1.jpg renamed

commit ccca1e94218e1fa9bc460de4d2eaeca1200e3313 (origin/main, origin/HEAD)
Merge: e4d19d2 e29f2aa
Author: primex-melvin <nogoy.melvin@primex.ventures>
Date:   Sat Jan 24 17:07:28 2026 +0800

    Merge branch 'main' of https://github.com/primex-melvin/ppdo-next

commit e29f2aa2f9880875fd71905d9770256aadd15639
Merge: 64cae82 1688e65
Author: primex-alec <quiambao.alec@primex.ventures>
Date:   Sat Jan 24 17:04:51 2026 +0800

    Merge branch 'print-orientation'

commit e4d19d2ce3f66454ab47c36996c81b682a58ac9a
imex-melvin <nogoy.melvin@primex.ventures>

    chore: outline_b1.jpg renamed

commit ccca1e94218e1fa9bc460de4d2eaeca1200e3313 (origin/main, origin/HEAD)
Merge: e4d19d2 e29f2aa
Author: primex-melvin <nogoy.melvin@primex.ventures>
Date:   Sat Jan 24 17:07:28 2026 +0800

    Merge branch 'main' of https://github.com/primex-melvin/ppdo-next

commit e29f2aa2f9880875fd71905d9770256aadd15639
Merge: 64cae82 1688e65
Author: primex-alec <quiambao.alec@primex.ventures>
Date:   Sat Jan 24 17:04:51 2026 +0800

    Merge branch 'print-orientation'

commit e4d19d2ce3f66454ab47c36996c81b682a58ac9a
Author: primex-melvin <nogoy.melvin@primex.ventures>
Date:   Sat Jan 24 17:02:25 2026 +0800

    fix: correct thumbnail preview to respect header, body, and footer backgrounds

    Previously, thumbnails in the page panel rendered with only the page background color applied to the entire preview. This caused templates with different section backgrounds (e.g., red main body with white header/footer) to display incorrectly.

    Restructured thumbnail rendering to use three distinct sections:
    - Header section (80px) using header backgroundColor
    - Main body section using page backgroundColor
    - Footer section (60px) using footer backgroundColor

    This ensures accurate real-time template previews in the right sidebar, matching the three-section canvas structure.

commit 1688e65bb912cd6e0176c2aac781b00bb3521d08 (origin/print-orientation)
Author: primex-alec <quiambao.alec@primex.ventures>
Date:   Sat Jan 24 17:01:51 2026 +0800

    style: changes signin left panel, change to outline capitol, remove upper contents, center the logos and make them bigger

commit a7370958e576b2fb608eabdf1525312ad4eab525
Author: primex-melvin <nogoy.melvin@primex.ventures>
Date:   Sat Jan 24 16:25:42 2026 +0800

    feat: add reusable template persistence and live apply system

    Add template storage to PrintDraft for cross-session persistence
    Create confirmation modal when applying templates to fresh table data
    Add Apply Template toolbar button for live application
    Implement non-destructive smart merge of template styling with canvas content
    Enable reusable theme-style templates

commit 64cae82de685a2af9e8714c1e4ed9e8d08184c2e (print-orientation)
Author: primex-melvin <nogoy.melvin@primex.ventures>
Date:   Sat Jan 24 15:20:59 2026 +0800

    feat: implement robust template loading for canvas and print preview

    - Add loading state to canvas template selector with proper data flow
    - Fix template application to correctly apply backgrounds, headers, and footers
    - Implement template refresh mechanism to sync with localStorage
    - Add duplicate template functionality to useTemplateStorage hook
    - Create loading screens for both canvas page and print preview modal
    - Fix race condition where template data wasn't ready before component render
    - Add comprehensive logging for debugging template loading issues
    - Ensure template state properly distinguishes between null (initial), undefined (skipped), and CanvasTemplate (selected)
    - Apply template styling to all pages in print preview with correct background colors

commit 93b5fa6b8a9a78fc272c82e1d5a9f61e2fbc3bdd
Author: primex-melvin <nogoy.melvin@primex.ventures>
Date:   Sat Jan 24 13:42:36 2026 +0800

    fix: resolve SSR error by making dom-to-image-more client-side only

    - Use dynamic import for dom-to-image-more to prevent SSR execution
    - Add browser environment checks before DOM API usage
    - Return SSR-safe placeholder during server-side rendering
    - Fixes ReferenceError: Node is not defined

commit c62785f6b4186c34e2cbd1d0c23922973999f7a8
Author: primex-melvin <nogoy.melvin@primex.ventures>
Date:   Sat Jan 24 13:36:16 2026 +0800

    feat: implement robust canvas template system with enhanced thumbnail generation

    - Add canvas mode selection modal (template creator vs full editor)
    - Implement template storage system using localStorage
    - Add template CRUD operations (create, read, update, delete)
    - Replace html2canvas with dom-to-image-more for better CSS support
    - Fix LAB color function parsing errors in thumbnail generation
    - Add triple-fallback thumbnail generation system
    - Implement data attributes for fallback canvas rendering
    - Add template loading/saving with validation
    - Fix mode selection reset on discard changes
    - Add CloseConfirmationModal for save/discard workflow
    - Update CanvasModeModal with template browsing and selection
    - Add TypeScript declarations for dom-to-image-more
    - Install dom-to-image-more@3.7.2 dependency

    Breaking Changes: None
    Migration: Existing canvas data in localStorage remains compatible

commit 1c6ea6f087ed71254b64b649e2c668376a442eef
Author: primex-melvin <nogoy.melvin@primex.ventures>
Date:   Sat Jan 24 11:34:05 2026 +0800

    chore: moved the 'canvas folder' into main parent dir

commit 680a7d686204e2b312f5d2e2a27c9878b6f07620
Author: primex-melvin <nogoy.melvin@primex.ventures>
Date:   Sat Jan 24 10:55:14 2026 +0800

    feat: complete left-side upload panel with drag-drop, folders, and fixed editor layout

    Implement a production-ready Upload Panel in the left sidebar with image management and canvas integration.
    Add drag-and-drop support from the left-side upload panel to the canvas with visual drop feedback.
    Introduce an accordion-based folder tree view using shadcn for organized image browsing.
    Enhance ImageCard with upload metadata, hover states, delete action, and draggable behavior.      
    Persist uploads via IndexedDB with compression and reuse support.
    Fix editor layout overlapping by introducing fixed toolbar, page panel, and left sidebar.
    Ensure non-breaking rollout behind feature flag with full TypeScript and build pass.

commit 17721a68c221bab35cc2b1550f4b48b5114e7582
Author: primex-melvin <nogoy.melvin@primex.ventures>
Date:   Sat Jan 24 09:04:06 2026 +0800

    feat: add image-paste support to print preview (clipboard utils + hook) and fix page-panel key warning

    Add clipboard-utils.ts (clipboard read, compress, helpers)
    Add usePrintClipboard hook and integrate into GenericPrintPreviewModal
    Wire pasted images into canvas as ImageElement and select on insert
    Preserve draft serialization and printing pipeline
    Fix React list key warning in page-panel.tsx

commit 2f6f2693cc50e32568203bd64c8071621b815c20
Author: primex-melvin <nogoy.melvin@primex.ventures>
Date:   Sat Jan 24 08:49:50 2026 +0800

    feat: add right-click context menu to duplicate/delete pages

    Add a Radix/ShadCN context menu for page thumbnails in the page panel.
    Introduce optional PagePanel props: onDuplicatePage(index) and onDeletePage(index).
    Wire handlers in the editor to select the page, then call existing duplicatePage() / deletePage() logic.
    Duplicate copies the selected page; Delete is destructive and disabled when only one page remains.
    No style changes; existing drag-and-drop and click behavior preserved.

commit 622b29a65669004567fe1ef3fe0797d50f0e9329
Author: primex-melvin <nogoy.melvin@primex.ventures>
Date:   Fri Jan 23 23:16:58 2026 +0800

    feat: implement reusable PrintPreviewModal with adapter pattern (DRY refactoring)

    - Add generic PrintDataAdapter interface for domain-specific data conversion
    - Create BudgetPrintAdapter for budget items printing
    - Create BreakdownPrintAdapter for breakdown history printing
    - Implement GenericPrintPreviewModal component (reusable across all domains)
    - Integrate GenericPrintPreviewModal with BreakdownHistoryTable
    - Eliminate code duplication through adapter pattern
    - Add comprehensive documentation (70+ pages)
    - Zero breaking changes, 100% backward compatible

commit 20cbe273ada0c95a69fcff408838dd145672564f
Author: primex-melvin <nogoy.melvin@primex.ventures>
Date:   Fri Jan 23 22:51:25 2026 +0800

    refactor: reuse PrintPreviewModal in ProjectsTable; add print adapter + rowMarkers to render category headers; remove console debug & duplicate export/print buttons

commit f6d2a094b6c2bb003919329bacc8b76aabe2ad34
Author: primex-alec <quiambao.alec@primex.ventures>
Date:   Fri Jan 23 16:51:42 2026 +0800

    fixed: orientation dropdown (portrait/landscape)

commit fffdfa0f8f68c200217214ba5bcb49f6c2456f64
Author: primex-melvin <nogoy.melvin@primex.ventures>
Date:   Fri Jan 23 16:20:16 2026 +0800

    feat: add portrait/landscape orientation toggle for pages

    - Add orientation property to Page type (portrait/landscape)
    - Implement getPageDimensions helper for dynamic size calculation
    - Add orientation selector in toolbar next to page size
    - Update canvas, header/footer sections to respect orientation
    - Preserve orientation per-page and in localStorage
    - Update page thumbnails to show correct aspect ratios
    - Maintain backward compatibility with existing saved pages
    - Add missing orientation property to Page objects in tableToCanvas

commit 5a70cbd52e0ff6775ae537ce95c5d59037bce9aa
Author: primex-melvin <nogoy.melvin@primex.ventures>
Date:   Fri Jan 23 15:40:40 2026 +0800

    refactor(types): reorganize budget page types and fix print preview canvas data flow

    - Split budget page types into domain-specific files (budget, table, hook, access, form, print)
    - Added index.ts barrel export for budget page type imports
    - Updated imports across 24 budget pagerelated files
    - Removed duplicate and overlapping type definitions
    - Traced data flow from budget table to print preview (budget page only)
    - Fixed missing table-to-canvas conversion trigger in budget print preview
    - Bypassed Editor localStorage state for budget page print preview
    - Injected converted canvas pages via props
    - Resolved empty canvas rendering issue on budget page

commit 9360f5e10c3c11dcedb6f10fbd6a3ab612a3484a
Merge: 1c14fd2 4ed32bc
Author: primex-melvin <nogoy.melvin@primex.ventures>
Date:   Fri Jan 23 14:47:18 2026 +0800

    Merge branch 'main' of https://github.com/primex-melvin/ppdo-next

commit 1c14fd2ff90bd8e2c691118e0f0df9c59b5d6064
Author: primex-melvin <nogoy.melvin@primex.ventures>
Date:   Fri Jan 23 14:25:50 2026 +0800

    feat: modern dynamic reusable print initialized

commit 30beae5c7a3fbf758392d20406b35dc1bc743172
Author: primex-melvin <nogoy.melvin@primex.ventures>
Date:   Fri Jan 23 13:41:39 2026 +0800

    feat: add PDF export functionality to canvas editor

    - Add Export as PDF button to toolbar next to Print button
    - Implement browser-based PDF export using native print dialog
    - Support multi-page documents with headers and footers
    - Handle dynamic text replacement for page numbers
    - Add loading states and user feedback with toast notifications

commit 4ed32bc0b61831a2f71a193eed13dd0933486201
Author: primex-alec <quiambao.alec@primex.ventures>
Date:   Fri Jan 23 11:51:40 2026 +0800

    style: left panel signin page - remove image and improve ui

commit b847b5649bb7c56ee040ce7f7cd2c1c9bdb34149
Author: primex-melvin <nogoy.melvin@primex.ventures>
Date:   Fri Jan 23 10:58:07 2026 +0800

    Integrate page navigation into bottom toolbar and fix print to capture canvas only

    - Merge PageNavigator into BottomPageControls component
    - Add Previous/Next buttons to bottom toolbar alongside page controls
    - Update print functionality to hide all UI elements except canvas pages
    - Add print-specific CSS media queries for clean page output
    - Remove standalone page-navigator component

commit 4311b00af0237fbe73752cf8f0b979453b7e1051
Author: primex-melvin <nogoy.melvin@primex.ventures>
Date:   Fri Jan 23 09:50:50 2026 +0800

    Refactor editor into modular components with hooks and reposition toolbar

    - Extract state management into useEditorState hook
    - Create separate hooks for clipboard, keyboard, and storage operations
    - Move types, constants, and utilities to dedicated files
    - Reposition toolbar above canvas with sticky positioning
    - Redesign toolbar with compact outline buttons and full-width layout
    - Update all component imports to use new modular structure

commit 6df8bfd4a8863567219c6171302f1a34f3e0d7c0
Author: primex-melvin <nogoy.melvin@primex.ventures>
Date:   Fri Jan 23 08:45:45 2026 +0800

    feat: canvas editor page initialized

commit 579ea0047d83044b25090c0b95de25795359f8f1
Author: primex-melvin <nogoy.melvin@primex.ventures>
Date:   Thu Jan 22 17:28:02 2026 +0800

    feat: category filter in projects table added, all categories will load by default, this feat allows app_user to filter the project data by categories

commit 0d704d95b85d3e6b15d5e6ea0028e25de2d912a5
Author: primex-melvin <nogoy.melvin@primex.ventures>
Date:   Thu Jan 22 14:45:08 2026 +0800

    feat: add utilization percentage column

commit 1acfd9e866e430bfef2401ff716cd44a772e7c7c
Author: primex-melvin <nogoy.melvin@primex.ventures>
Date:   Thu Jan 22 13:23:10 2026 +0800

    feat: refactor column visibility to reusable component

    - Create base ColumnVisibilityMenu in components/ for reuse across tables
    - Add controlled dropdown state to keep menu open on column toggle
    - Add close button (X) to manually dismiss dropdown
    - Implement column visibility for breakdown table
    - Extract common logic with BaseColumn interface
    - Add centralized styling config in lib/column-visibility-config.ts
    - Update all table column menus (Budget, Projects, Breakdown) to use base
    - Support custom triggers and per-table styling overrides
    - Fix export naming in ProjectsColumnVisibilityMenu wrapper

commit 779f27f265cf311f593d2e9c32a35fc56c456bee
Author: primex-melvin <nogoy.melvin@primex.ventures>
Date:   Thu Jan 22 12:00:39 2026 +0800

    build: changelogs v.1.7.0 added

commit 5e1d6480e7a8d8a2b0945ff7b33e9fa251f9a1b0
Author: primex-melvin <nogoy.melvin@primex.ventures>
Date:   Thu Jan 22 11:35:58 2026 +0800

    chore: hide all status:active in particular funds statistics card and add/edit form, also set into - the status type not_available

commit ddcba4415a40cd3a3397c359293a47b0187205ef
Author: primex-melvin <nogoy.melvin@primex.ventures>
Date:   Thu Jan 22 11:09:20 2026 +0800

    feat: refactor trust funds table with hover-to-edit status and loading states

    - Refactored TrustFundsTable into 5 focused subcomponents
    - Added hover-to-edit status cells with loading indicators
    - Implemented collapsible status breakdown in statistics
    - Fixed status persistence issue in create/edit forms
    - Enhanced UX with disabled states during updates
    - Maintained all existing styles and functionality

commit 459407be9f88cb56c909c28dd2e86054b17676cc
Author: primex-melvin <nogoy.melvin@primex.ventures>
Date:   Thu Jan 22 09:56:31 2026 +0800

    refactor(trust-funds): reorganize folder structure and centralize table logic
    
    - Centralize TrustFund types, constants, and utilities at parent level
    - Refactor TrustFundsTable into year-based components
    - Introduce dedicated table hooks (sorting, filtering, selection, resizing)
    - Preserve existing data hooks without modification
    - Improve clarity, scalability, and maintainability of trust-funds module

commit b4f25a005ebcca00db5787eae1672c550a3f7374
Author: primex-melvin <nogoy.melvin@primex.ventures>
Date:   Thu Jan 22 09:19:22 2026 +0800

    feat: enhance budget statistics with subtotals and obligated budget tracking

commit 9b8bfe25ad485883d00d5e437cb8c4ecc71dba6d
Author: primex-melvin <nogoy.melvin@primex.ventures>
Date:   Wed Jan 21 16:39:16 2026 +0800

    feat: implement hover-to-edit status dropdown with plain text styling

    - Remove colored badges, use plain black text for status
    - Add inline Select dropdown on hover for quick updates, with loading state
    - Fix dropdown state management for reliable open/close behavior

commit c65751271fc56c8a40eeb8e1362600bb9c756578
Author: primex-melvin <nogoy.melvin@primex.ventures>
Date:   Wed Jan 21 16:01:50 2026 +0800

    refactor: implement compact table design with complete border grid

    - Replace CSS Grid with HTML table for reliable border rendering
    - Reduce default row height to 32px for higher data density
    - Add consistent borders to all cells (always visible, no hover required)
    - Apply light gray backgrounds to header/totals rows
    - Use smaller fonts and tighter spacing for professional appearance
    - Maintain full resizing and interaction functionality

commit 4ffdd2395688d410d7305a2a3e7e8a76650e3e8c
Author: primex-melvin <nogoy.melvin@primex.ventures>
Date:   Wed Jan 21 15:15:46 2026 +0800

    refactor: break down ImplementingOfficeSelector into modular components

    - Extract types, constants, and utility functions
    - Create useOfficeSelector hook for business logic
    - Split into 6 focused sub-components (ModeSelector, OfficeItemList, CreateNewSection, CreateOfficeDialog, SelectedOfficeInfo)
    - Reduce main component from 400+ to 150 lines
    - Preserve all features and styling

commit 02fd4eb887f1071d5ba5bf532545f163dcd805a1
Author: primex-melvin <nogoy.melvin@primex.ventures>
Date:   Wed Jan 21 14:05:35 2026 +0800

    feat(trust-funds): add status tracking and advanced table features

    Backend:
    - Added status field to trust funds schema with supported values: not_available (default), not_yet_started, ongoing, completed, active (legacy)
    - Updated create and update mutations to accept optional status
    - Enhanced activity logger to record status changes in changeSummary
    - Added oldStatus and newStatus fields to trust fund activity schema

    Frontend:
    - Added color-coded Status column positioned between Office In-Charge and Date Received
    - Display status summary counts in table toolbar
    - Implemented column visibility controls with show/hide all and session persistence
    - Added expandable Project Title and Remarks columns with visual indicators
    - Introduced right-click context menu for pin, view activity, edit, and trash actions
    - Added print modal with portrait/landscape orientation preview and correct @page CSS
    - Printing respects visible columns only

    UI/UX Improvements:
    - Status badges with consistent color mapping
    - Improved table responsiveness with fixed column widths
    - Faster access to common actions via context menu

    Migration & Compatibility:
    - Existing records default to not_available status
    - Legacy active status preserved
    - No breaking changes; fully backward compatible

commit aad9c8348f9b96e63981744843a368389a330312
Author: primex-melvin <nogoy.melvin@primex.ventures>
Date:   Wed Jan 21 08:45:30 2026 +0800

    refactor: break down BreakdownHistoryTable into modular hooks and components

    - Extract 5 utility files (types, constants, formatters, helpers, navigation)
    - Create 3 custom hooks (useTableSettings, useTableResize, useColumnDragDrop)
    - Split into 6 focused components (Toolbar, Header, Row, Totals, EmptyState)
    - Reduce main component from 500+ to 150 lines
    - Maintain full backward compatibility and all features

commit 67fedd97ea81389361d78fc0af8b7f69446d7279
Author: primex-melvin <nogoy.melvin@primex.ventures>
Date:   Tue Jan 20 16:23:52 2026 +0800

    feat: Add auto-calculate toggle for budget utilization in Budget Items and Projects

    - Add context menu toggle with switch component for single item toggle
    - Add bulk toggle dialog with mode selection and optional reason field
    - Add auto-calculate switch field in Budget Item and Project forms
    - Implement loading states and comprehensive toast notifications
    - Disable manual input fields when auto-calculate is enabled
    - Add visual feedback with Auto/Manual badges in forms
    - Integrate with existing mutations: toggleAutoCalculate and bulkToggleAutoCalculate
    - Default new items to auto-calculate mode (true)
    - Preserve backward compatibility with existing data
    - Follow all requirements: toasts, error handling, accessibility

    Files modified:
    - Budget Items: BudgetContextMenu, BudgetTableToolbar, BudgetTrackingTable, BudgetItemForm        
    - Projects: ProjectContextMenu, ProjectsTableToolbar, ProjectsTable, ProjectForm
    - New files: BudgetBulkToggleDialog, ProjectBulkToggleDialog

    BREAKING CHANGES: None - default value ensures backward compatibility