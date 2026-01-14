# Plan: Migrate Year Filter to URL Parameters

## Overview
Convert the year filter from localStorage-based persistence to URL query parameters as the primary source, making it shareable and explicit while maintaining sessionStorage as a fallback for current session only.

## Why This Matters
- **Current Issue**: Year filter persists in localStorage indefinitely, users forget they filtered, and links can't be shared
- **Best Practice**: URL as source of truth, sessionStorage for convenience, explicit visual indicators
- **Benefits**: Shareable links, clearer UI, collaborative-friendly, standards-aligned

---

## Implementation Steps

### Step 1: Refactor Budget Page to Read from URL Query Params
**File**: `app/dashboard/project/budget/page.tsx`

**Current Behavior**: No URL params, relies on localStorage in child component

**Changes Needed**:
- Import `useSearchParams` from 'next/navigation'
- Extract year from URL query string in component
- Pass year to BudgetTrackingTable as prop (or manage in this parent)
- Initialize yearFilter state from URL params on mount

**Acceptance Criteria**:
- If URL has `?year=2024`, yearFilter automatically set to [2024]
- If no URL param, yearFilter starts empty

---

### Step 2: Modify Year Card Click Handler
**File**: `app/dashboard/project/page.tsx` (line 28)

**Current Code**:
```typescript
localStorage.setItem("budget_selected_year", String(year));
router.push("/dashboard/project/budget/");
```

**New Code**:
```typescript
// Use URL query parameter instead of localStorage
router.push(`/dashboard/project/budget/?year=${year}`);
// Optional: Also store in sessionStorage as backup for current session
if (typeof window !== 'undefined') {
  try {
    sessionStorage.setItem("budget_year_preference", String(year));
  } catch (_) {
    // Ignore if storage unavailable
  }
}
```

**Acceptance Criteria**:
- Year card click navigates to URL with query param
- sessionStorage is set as convenience (not localStorage)
- No localStorage key written

---

### Step 3: Update BudgetTrackingTable Initialization
**File**: `components/budget/BudgetTrackingTable.tsx` (lines 106-117)

**Current Code**:
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

**New Code**:
```typescript
useEffect(() => {
  // Priority 1: URL query params (explicit, shareable)
  const urlParams = new URLSearchParams(window.location.search);
  const yearParam = urlParams.get("year");
  
  if (yearParam) {
    const year = parseInt(yearParam);
    if (!isNaN(year)) {
      setYearFilter([year]);
      return;
    }
  }
  
  // Priority 2: sessionStorage as fallback (current session preference)
  if (typeof window !== 'undefined') {
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

**Acceptance Criteria**:
- Component reads year from `?year=XXXX` query param first
- Falls back to sessionStorage if no URL param
- No localStorage is read or written
- Filter auto-applies on page load

---

### Step 4: Sync Filter State Changes with URL
**File**: `components/budget/BudgetTrackingTable.tsx`

**New Effect**:
```typescript
// Sync yearFilter state back to URL when user changes filter via dropdown
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  
  if (yearFilter.length > 0) {
    // Update URL with selected years
    const yearParams = yearFilter.map(y => `year=${y}`).join("&");
    const newUrl = `${window.location.pathname}?${yearParams}`;
    window.history.replaceState(null, "", newUrl);
  } else {
    // Remove year params if no filter
    const newUrl = window.location.pathname;
    window.history.replaceState(null, "", newUrl);
  }
}, [yearFilter]);
```

**Acceptance Criteria**:
- When user toggles year in dropdown, URL query string updates
- URL stays in sync with yearFilter state
- Page doesn't reload (uses replaceState)
- Users can share URL with filter applied

---

### Step 5: Update ProjectsTable Similarly
**File**: `app/dashboard/project/budget/[particularId]/components/ProjectsTable.tsx`

**Current Behavior**: Similar localStorage pattern at line 235

**Changes Needed**:
- Apply same URL query param reading logic
- Use sessionStorage instead of localStorage
- Sync filter changes back to URL (optional, depends on UX)

**Acceptance Criteria**:
- Reads year from URL params
- Uses sessionStorage as fallback
- Maintains consistency with BudgetTrackingTable pattern

---

### Step 6: Verify Visual Filter Status Badge
**File**: `components/budget/BudgetTrackingTable.tsx` (lines 509-540)

**Current Implementation**: Already shows purple badge with year and X button

**Changes Needed**: None required, but verify:
- Badge displays year correctly
- Badge only shows when yearFilter is not empty
- X button removes filter and updates URL

**Acceptance Criteria**:
- Visual indicator clearly shows "Year: 2024" when active
- Badge is prominent and easy to dismiss
- Removing badge updates URL

---

## Decision Points (To Refine)

### 1. Single vs Multiple Years
**Question**: Support multi-year filtering (current) or simplify to single year?

**Current State**: Code allows array (`yearFilter: number[]`)

**Options**:
- A) Keep multi-year (URL: `?year=2024&year=2023`) — More flexible, complex URL
- B) Single year only (URL: `?year=2024`) — Simpler, clearer UX
- C) Comma-separated (URL: `?years=2024,2023`) — Compact, still flexible

**Recommendation**: Option B (single year) for clarity, but keep code flexible for future

---

### 2. Filter Reset Behavior
**Question**: When user clicks "Clear Filters" button, should it:
- A) Only clear table state
- B) Also remove query params from URL
- C) Navigate to clean URL

**Current State**: Clears component state only

**Recommendation**: Option B — Remove query params to make URL clean when no filter applied

---

### 3. Backwards Compatibility
**Question**: Should we support old bookmarks/links with localStorage fallback?

**Current**: No localStorage support planned

**Options**:
- A) Clean break — Only support URL params (recommended)
- B) Gradual migration — Support both localStorage and URL params
- C) Migration script — Check localStorage on first visit, redirect to URL param version

**Recommendation**: Option A (clean break) for simplicity, minor UX impact

---

## Testing Checklist

- [ ] User selects year card → navigates to `/dashboard/project/budget/?year=2024`
- [ ] Page loads with year query param → yearFilter auto-set, table filtered
- [ ] User toggles year in dropdown → URL updates without reload
- [ ] User clears filter → URL becomes clean `/dashboard/project/budget/`
- [ ] User copies URL with `?year=2024` → Sharing works, other user sees same filter
- [ ] Page refresh with query param → Filter persists (via URL)
- [ ] New visit without URL param → No unwanted auto-filter
- [ ] sessionStorage used only as convenience, not persisted across browser close
- [ ] Mobile responsive — dropdown filter works on small screens
- [ ] Dark mode — badge styling readable

---

## Files to Modify

| File | Changes | Priority |
|------|---------|----------|
| `app/dashboard/project/page.tsx` | Replace localStorage with URL params | P0 |
| `components/budget/BudgetTrackingTable.tsx` | Read from URL, sync back to URL | P0 |
| `app/dashboard/project/budget/[particularId]/components/ProjectsTable.tsx` | Same pattern as BudgetTrackingTable | P1 |
| `app/dashboard/project/budget/page.tsx` | Optional: Add useSearchParams integration | P2 |

---

## Estimated Effort
- **Step 1-3**: 30 mins (core changes)
- **Step 4**: 20 mins (URL sync effect)
- **Step 5**: 15 mins (ProjectsTable)
- **Step 6**: 10 mins (verification)
- **Testing**: 15 mins
- **Total**: ~90 minutes

---

## Success Criteria (Definition of Done)
1. ✅ Year filter reads from URL query params as primary source
2. ✅ Filter state syncs back to URL when changed via dropdown
3. ✅ sessionStorage used as convenience (not localStorage)
4. ✅ Visual badge clearly indicates active filter
5. ✅ URL is shareable (other users see same filter)
6. ✅ Page refresh maintains filter (URL persists)
7. ✅ No localStorage dependencies remain
8. ✅ All tests pass
9. ✅ Mobile/dark mode verified
