# Task 4: Update ProjectsTable to Use URL Params

**File**: `app/dashboard/project/budget/[particularId]/components/ProjectsTable.tsx`

**Location**: Line 235 (initialization useEffect)

## Current Code
Locate and find similar localStorage logic:
```typescript
// Line 235 area - there should be localStorage.getItem/setItem for year
```

## Replace With
```typescript
// Initialize yearFilter from URL params on mount
useEffect(() => {
  if (typeof window !== "undefined") {
    const urlParams = new URLSearchParams(window.location.search);
    const yearParam = urlParams.get("year");
    
    if (yearParam) {
      const year = parseInt(yearParam);
      if (!isNaN(year)) {
        setYearFilter([year]);
        return;
      }
    }
    
    // Fallback to sessionStorage
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

## And Add URL Sync Effect
```typescript
// Sync yearFilter back to URL
useEffect(() => {
  if (typeof window !== "undefined") {
    if (yearFilter.length > 0) {
      const params = new URLSearchParams();
      yearFilter.forEach(year => params.append("year", String(year)));
      
      const currentParams = new URLSearchParams(window.location.search);
      currentParams.forEach((value, key) => {
        if (key !== "year") {
          params.append(key, value);
        }
      });
      
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState(null, "", newUrl);
    } else {
      const currentParams = new URLSearchParams(window.location.search);
      currentParams.delete("year");
      
      const newUrl = currentParams.toString() 
        ? `${window.location.pathname}?${currentParams.toString()}`
        : window.location.pathname;
      window.history.replaceState(null, "", newUrl);
    }
  }
}, [yearFilter]);
```

## Why
- Consistency with BudgetTrackingTable pattern
- Shareable URLs at project particular level
- No localStorage pollution

## Testing
1. Navigate to particular page with year filter
2. URL should have `?year=XXXX`
3. Verify table filters by year
4. Toggle year in filter dropdown
5. Verify URL updates
6. Share URL with copy-paste
7. Open in new tab, verify filter applied

## Acceptance Criteria
- ✅ Reads year from URL on load
- ✅ Falls back to sessionStorage
- ✅ Syncs yearFilter changes to URL
- ✅ No localStorage used
- ✅ Consistent behavior with BudgetTrackingTable
