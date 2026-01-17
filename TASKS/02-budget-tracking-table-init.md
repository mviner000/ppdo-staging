# Task 2: Update BudgetTrackingTable Init to Read from URL

**File**: `components/budget/BudgetTrackingTable.tsx`

**Location**: Lines 106-117 (useEffect at component mount)

## Current Code
```typescript
useEffect(() => {
  const storedYear = localStorage.getItem("budget_selected_year");
  if (storedYear) {
    const year = parseInt(storedYear);
    if (!isNaN(year)) {
      setYearFilter([year]);
    }
    localStorage.removeItem("budget_selected_year");
  }
}, []);
```

## Replace With
```typescript
useEffect(() => {
  // Priority 1: Read from URL query params (explicit, shareable)
  if (typeof window !== "undefined") {
    const urlParams = new URLSearchParams(window.location.search);
    const yearParam = urlParams.get("year");
    
    if (yearParam) {
      const year = parseInt(yearParam);
      if (!isNaN(year)) {
        setYearFilter([year]);
        return; // Early exit, URL params take priority
      }
    }
    
    // Priority 2: Fallback to sessionStorage (current session preference only)
    const sessionYear = sessionStorage.getItem("budget_year_preference");
    if (sessionYear) {
      const year = parseInt(sessionYear);
      if (!isNaN(year)) {
        setYearFilter([year]);
      }
    }
  }
}, []);
```

## Why
- URL params are source of truth (explicit, shareable, persistable)
- sessionStorage is fallback for convenience (not persistent across browser restart)
- Eliminates localStorage dependency
- Supports direct URL sharing with filter already applied

## Testing
1. Visit `/dashboard/project/budget/?year=2024` directly
2. Verify yearFilter is set to [2024] on page load
3. Verify table shows only 2024 data
4. Refresh page
5. Verify filter still active (URL persisted)

## Acceptance Criteria
- ✅ Reads `?year=XXXX` from URL on mount
- ✅ Sets yearFilter state from URL param
- ✅ Falls back to sessionStorage if no URL param
- ✅ No localStorage reads or writes
- ✅ Filter visible in table after page load
