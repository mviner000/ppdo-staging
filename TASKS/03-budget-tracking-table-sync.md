# Task 3: Add URL Sync Effect to BudgetTrackingTable

**File**: `components/budget/BudgetTrackingTable.tsx`

**Location**: After state declarations (around line 80, add new useEffect)

## Add This New useEffect
```typescript
// Sync yearFilter state changes back to URL query params
useEffect(() => {
  if (typeof window !== "undefined") {
    if (yearFilter.length > 0) {
      // Build URL with year params
      const params = new URLSearchParams();
      yearFilter.forEach(year => params.append("year", String(year)));
      
      // Preserve other query params (search, sort, status, etc.)
      const currentParams = new URLSearchParams(window.location.search);
      currentParams.forEach((value, key) => {
        if (key !== "year") {
          params.append(key, value);
        }
      });
      
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState(null, "", newUrl);
    } else {
      // No year filter, clean URL
      const currentParams = new URLSearchParams(window.location.search);
      currentParams.delete("year");
      
      if (currentParams.toString()) {
        const newUrl = `${window.location.pathname}?${currentParams.toString()}`;
        window.history.replaceState(null, "", newUrl);
      } else {
        const newUrl = window.location.pathname;
        window.history.replaceState(null, "", newUrl);
      }
    }
  }
}, [yearFilter]);
```

## Why
- When user toggles year filter via dropdown, URL updates automatically
- Users can share filtered URL with colleagues
- Bookmark preserved state
- No page reload needed (replaceState)

## Testing
1. Load page with initial URL
2. Click year dropdown and select/deselect year
3. Verify URL query string updates in real-time
4. Copy URL and open in new tab
5. Verify filter is applied in new tab
6. Click "Clear Filters" button
7. Verify URL becomes clean (no query params)

## Acceptance Criteria
- ✅ URL updates when yearFilter changes
- ✅ Multiple years appear as `?year=2024&year=2023`
- ✅ Other query params (search, sort) are preserved
- ✅ Clearing filter removes `year` params from URL
- ✅ Page doesn't reload (smooth UX)
- ✅ URL is sharable and works in new tab/window
