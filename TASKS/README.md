# Year Filter Migration Tasks

Convert year filter from localStorage to URL query parameters.

## Task Breakdown

| # | Task | File | Priority | Dependencies |
|---|------|------|----------|--------------|
| 1 | Replace localStorage with URL params | `app/dashboard/project/page.tsx` | P0 | None |
| 2 | Update BudgetTrackingTable init | `components/budget/BudgetTrackingTable.tsx` | P0 | Task 1 |
| 3 | Add URL sync effect | `components/budget/BudgetTrackingTable.tsx` | P0 | Task 2 |
| 4 | Update ProjectsTable | `app/dashboard/project/budget/[particularId]/components/ProjectsTable.tsx` | P1 | Task 2 |
| 5 | Verify filter badges | `components/budget/BudgetTrackingTable.tsx` | P2 | Task 3 |
| 6 | Integration testing | All files | P0 | Tasks 1-5 |

## Execution Order

```
Task 1
  ↓
Task 2
  ↓
Task 3
  ↓
Task 4 (parallel with Task 3)
  ↓
Task 5
  ↓
Task 6 (Integration Test)
```

## Quick Start

1. Read all tasks in `TASKS/` folder
2. Execute tasks in order (see Execution Order)
3. Run Task 6 for full integration test
4. Verify no localStorage usage remains

## Success Metrics

- ✅ Year filter uses URL query params (`?year=XXXX`)
- ✅ sessionStorage used as convenience only
- ✅ No localStorage reads/writes
- ✅ URLs shareable across browsers
- ✅ Filter persists on page refresh
- ✅ All tests pass
- ✅ Mobile + dark mode verified

## Files Not to Modify

- `app/dashboard/project/budget/page.tsx` - Parent component, no changes needed at this time
- Test files (unless tests break)
- Styling files (keep existing Tailwind classes)
