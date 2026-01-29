commit 0d1a1539efbd9bf9418792cf3db64f83769d9218 (HEAD -> main)
Author: mviner000 <m.viner001@gmail.com>
Date:   Thu Jan 29 12:49:44 2026 +0800

    feat: add 20% DF card, update dashboard layout, and implement shortcut-toggled view mode tabs

commit 606630b094380cbebc8eb2cddeea774723199c4b
Author: mviner000 <m.viner001@gmail.com>
Date:   Thu Jan 29 12:12:19 2026 +0800

    fix: resolve 20% DF build errors, status schema, and mutation naming

commit 86f4dd7f428c3026cc06f40ac7cf6f2b55330d76
Author: primex-melvin <nogoy.melvin@primex.ventures>
Date:   Thu Jan 29 11:43:40 2026 +0800

    feat: fully integrate 20% Development Fund and resolve TypeScript build errors    

    - Added dedicated TwentyPercentDFYearHeader with strict ActivityLogType union
    - Introduced shared ActivityLogType typing to prevent invalid activity log usage  
    - Extended breakdown entityType unions to include twentyPercentDF
    - Updated breakdown navigation utilities to handle 20% DF routes
    - Added twentyPercentDF handling in TableRow mutations and status updates
    - Completed Activity Log support for twentyPercentDF and breakdown variants       
    - Fixed missing trackedFields mappings and loading state checks
    - Aligned TwentyPercentDF table props (items vs data) and added budgetItemYear    
    - Extended Funds table, kanban, and row navigation for twentyPercent fund type    
    - Added full Convex CRUD support for twentyPercentDF, including statistics and trash handling
    - Added missing toggleAutoCalculate alias for mutation compatibility
    - Corrected form field imports to use TwentyPercentDFFormValues
    - Fixed Convex Id typing issues and schema mismatches in forms
    - Updated Zod validation to support Convex IDs safely
    - Ensured all components, mutations, and utilities now accept twentyPercentDF     

    This resolves all TypeScript compilation errors and completes end-to-end support  
    for the 20% Development Fund module across UI, Convex, navigation, and activity logs.

commit 44f4d7fa6578ee349f2fa075cf2e6341e4c53a05
Author: mviner000 <m.viner001@gmail.com>
Date:   Thu Jan 29 09:23:58 2026 +0800

    refactor: align 20% DF module with projects module conventions and components     

commit a6910f3fe86bf1b30f75c65ce1107f44bb8efe8a
Author: mviner000 <m.viner001@gmail.com>
Date:   Thu Jan 29 07:39:41 2026 +0800

    feat: implement 20% Development Fund (20% DF) backend architecture

    This commit introduces the complete backend infrastructure for the 20% DF module, mirroring the robust patterns of the projects system:

    - Schema Design: Created twentyPercentDF, twentyPercentDFBreakdowns, twentyPercentDFActivities, and twentyPercentDFSharedAccess tables.
    - Auto-Calculation Engine: Implemented aggregation logic in 'twentyPercentDFAggregation.ts' to automatically calculate financial totals and project statuses (ongoing, delayed, completed) from child breakdowns.
    - CRUD Operations: Added full API support for managing 20% DF records and breakdowns with built-in activity logging and trash system parity.
    - System Integration: Updated 'breakdownBase.ts' and 'schema.ts' to register the new module and support shared breakdown functionalities.
    - Reliability: Included internal validation for implementing agencies and project 
particulars to ensure data integrity.

commit b637f7833311d02265cf62311d13f2e29f3ae477
Author: mviner000 <m.viner001@gmail.com>
Date:   Thu Jan 29 07:09:25 2026 +0800

    refactor: modularize project details into reusable components

    - moved project components, hooks, and utils to components/ppdo/projects
    - decomposed ProjectsTable into granular sub-components (Header, Body, Toolbar, Footer)
    - modularized ProjectForm fields for better maintainability and reusability       
    - implemented print adapters and fixed PrintPreviewModal type integration
    - updated ParticularProjectsPage to utilize new shared component structure        
    - removed redundant local files from app/dashboard/project directory

commit b55b1c400102ca8a5f15c9286e4b5d41a70ffdd1
Author: mviner000 <m.viner001@gmail.com>
Date:   Wed Jan 28 22:23:46 2026 +0800

    feat: enhance kanban functionality, refine ui aesthetics, and improve accessibility

commit 490efcfc29075748c47ce5a5d1be65481f32ac04
Author: mviner000 <m.viner001@gmail.com>
Date:   Wed Jan 28 20:08:20 2026 +0800

    feat: refine auto-calc UI and stats display

    - Enhance Auto-Calc toggle with improved switch UI and descriptive tooltips       
    - Refactor AutoCalcConfirmationModal to be wider, more compact, and use a 2-row table layout
    - Remove 'Breakdown Counts' and 'Year' cards from EntityOverviewCards
    - Set BreakdownStatsAccordion to open by default
    - Update breakdown pages to pass auto-calculate state to confirmation modal       

commit bbba73dacac0ce5a657ad2969f1bf8ade2f86c8d
Author: mviner000 <m.viner001@gmail.com>
Date:   Wed Jan 28 18:47:11 2026 +0800

    fix: resolve TypeScript type mismatch in fund breakdown pages

    Defaulted potentially undefined financial metrics (obligated, utilized, balance) to 0 to resolve build errors.

    Affected pages:

    - Special Education Funds breakdown page

    - Special Health Funds breakdown page

    - Trust Funds breakdown page

commit 8beeb597a55b21125fdec61a6dd15d69cc1a5c39
Author: mviner000 <m.viner001@gmail.com>
Date:   Wed Jan 28 17:22:27 2026 +0800

    feat(ui): refactor auto-calculate UI and add confirmation modal

    Move auto-calculate switch to breakdown header using Shadcn Switch
    Add AutoCalcConfirmationModal with summary of recalculated metrics
    Remove redundant auto badge from breakdown rows
    Clean up EntityOverviewCards control logic
    Integrate switch + modal into SEF, SHF, and Trust Fund pages
    Add 20% DF to sidebar configuration

commit b1b4f3d129d3645fe103dfd340b2392c3ed9eb57
Author: mviner000 <m.viner001@gmail.com>
Date:   Wed Jan 28 14:43:05 2026 +0800

    feat: integrate screenshot capture and reporting flow

    Integrate dom-to-image-more with dynamic imports to avoid SSR issues

    Add ScreenshotZoom component for seamless transition from capture to modal        

    Create ConcernModal to handle both bug reports and feature suggestions

    Update RichTextEditor to autofill and sync captured screenshots

    Connect reporting flow to Convex mutations with success feedback (Confetti/Sonner)

commit db15ad5e8cf4ee4f3b652f5f335586d4a1d3a791
Author: mviner000 <m.viner001@gmail.com>
Date:   Wed Jan 28 14:21:13 2026 +0800

    feat: add steps to replicate field and enhance text editor

    Add 'Steps to Replicate' optional field to bug report schema and form

    Implement 'ordered-list' variant for RichTextEditor for auto-numbering

    Add Video extension to RichTextEditor for inline video previews

    Refactor RichTextEditor layout for compact styling and better footer actions      

    Move 'Steps to Replicate' field below 'Description'

commit 6944bd1eac55acf98360dce2d71b4c3db527da7c
Author: mviner000 <m.viner001@gmail.com>
Date:   Wed Jan 28 13:45:58 2026 +0800

    Reverts previous slug-based design in favor of a simpler, ID-first architecture.  

    Key changes include schema cleanup, mutation and query standardization, routing updates, and UI enhancements. This resolves complexity around slug management and eliminates Next.js route conflicts caused by overlapping directory structures.

commit c8afcbb38a58908d4bed35c53e0ba391120e6f73 (origin/main, origin/HEAD)
Author: mviner000 <m.viner001@gmail.com>
Date:   Wed Jan 28 08:42:27 2026 +0800

    feat: add CMS coming soon page, sidebar auto-scroll, and mobile back button       

commit b79eb35226ab1a0b5c23d31df287beeb07381c9f
Author: mviner000 <m.viner001@gmail.com>
Date:   Tue Jan 27 21:33:12 2026 +0800

    feat: implement automated error recovery and cache clearing

    Add lib/cache-utils.ts to clear localStorage, sessionStorage, and caches
    Create app/global-error.tsx for root-level exception handling
    Create app/error.tsx for segment-level error recovery with UI
    Provide 'Deep Repair & Restart' option for users to fix stale cache issues        

commit c7af4308c2e91790a7bc96233040d256909b4bdb
Author: mviner000 <m.viner001@gmail.com>
Date:   Tue Jan 27 21:28:18 2026 +0800

    feat: enhance UX with global loader, custom 404 page, and optimized sidebar       

    Implement global horizontal loading bar synchronized with accent color
    Create custom 404 page with Tarlac-themed 3D illustration and animations
    Optimize sidebar backend usage with lazy-loaded badge components
    Refactor navigation architecture to support recursive nested accordions
    Fix sidebar active state logic and accessibility (cursor pointers)
    Resolve syntax errors and standardize type definitions

commit db8c356470e1cb6de6d4772092ffc995e816223f
Merge: d0a63fb 990f941
Author: mviner000 <m.viner001@gmail.com>
Date:   Tue Jan 27 18:22:56 2026 +0800

    feat: integrate bug reports, suggestions, and sidebar updates with merge resolution (from Joseph Mangubat)

commit d0a63fba13838801288ca0394cf5bfe02711ea2e (main-backup-pre-merge, breakdown-page-1)
Author: mviner000 <m.viner001@gmail.com>
Date:   Tue Jan 27 16:13:37 2026 +0800

    refactor: remove unused mock data and utility files from project breakdown        

commit 6b3028c30bda422dc7f36ad7e36a4fc28a5fb54f
Author: mviner000 <m.viner001@gmail.com>
Date:   Tue Jan 27 16:01:19 2026 +0800

    refactor: improve breadcrumb system with DRY refactor and route handling

    - Created breadcrumb-utils.ts with reusable utilities for decoding/formatting     
    - Created useDashboardBreadcrumbs hook for consistent breadcrumb management       
    - Refactored 5 dashboard pages to use centralized logic
    - Added skeleton loading states for breadcrumb segments during data fetching      
    - Improved UX with proper URL decoding and label capitalization
    - Fixed 'Invalid Year' error by handling 'budget' route parameter
