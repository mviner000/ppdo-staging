# Task 1: Replace localStorage with URL Params in Project Page

**File**: `app/dashboard/project/page.tsx`

**Location**: Line 28 (in `handleOpenYear` function)

## Current Code
```typescript
const handleOpenYear = (year: number) => {
  try {
    localStorage.setItem("budget_selected_year", String(year));
  } catch (_) {
    // Ignore storage failures; user can still filter manually
  }
  router.push("/dashboard/project/budget/");
};
```

## Replace With
```typescript
const handleOpenYear = (year: number) => {
  // Use URL query parameter instead of localStorage
  router.push(`/dashboard/project/budget/?year=${year}`);
  
  // Optional: Store in sessionStorage as convenience backup
  if (typeof window !== "undefined") {
    try {
      sessionStorage.setItem("budget_year_preference", String(year));
    } catch (_) {
      // Ignore if storage unavailable
    }
  }
};
```

## Why
- Makes year filter explicit in URL (shareable, debuggable)
- Uses sessionStorage instead of localStorage (expires on browser close)
- Removes hidden state dependency

## Testing
1. Click year card (e.g., 2024)
2. Verify URL is `/dashboard/project/budget/?year=2024`
3. Verify page loads with year filter applied
4. Verify localStorage does NOT contain "budget_selected_year"

## Acceptance Criteria
- ✅ URL has `?year=XXXX` after clicking year card
- ✅ No localStorage writes
- ✅ sessionStorage contains "budget_year_preference"
- ✅ Budget table receives year filter
