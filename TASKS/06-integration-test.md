# Task 6: Integration Testing - Full Year Filter Flow

**Scope**: End-to-end testing of all tasks combined

## Test Scenario 1: Year Card Click
1. Start at `/dashboard/project`
2. See year cards (2024, 2023, etc.)
3. Click year card (e.g., 2024)
4. ✅ Navigate to `/dashboard/project/budget/?year=2024`
5. ✅ BudgetTrackingTable loads with 2024 filter applied
6. ✅ Purple badge shows "Year: 2024"
7. ✅ Table displays only 2024 data

## Test Scenario 2: URL Direct Access
1. Open URL directly: `/dashboard/project/budget/?year=2023`
2. ✅ Page loads
3. ✅ yearFilter pre-populated with 2023
4. ✅ Purple badge shows "Year: 2023"
5. ✅ Table filtered to 2023 only
6. ✅ No page reload

## Test Scenario 3: Toggle Filter via Dropdown
1. Start with `/dashboard/project/budget/?year=2024`
2. Click year dropdown in table header
3. Deselect 2024
4. ✅ URL becomes clean (no query params)
5. ✅ Badge disappears
6. ✅ Table shows all years

## Test Scenario 4: Multi-Year Selection
1. Start at `/dashboard/project/budget/`
2. Click year dropdown
3. Select 2024
4. ✅ URL becomes `?year=2024`, badge shows "Year: 2024"
5. Click dropdown again
6. Also select 2023
7. ✅ URL becomes `?year=2024&year=2023`, two badges show
8. ✅ Table shows only 2024 and 2023 data

## Test Scenario 5: URL Sharing
1. User A at `/dashboard/project/budget/?year=2024&search=bridge`
2. Copy URL
3. User B opens link in new browser/tab
4. ✅ Page loads with year=2024 AND search=bridge
5. ✅ Both filters applied
6. ✅ Badges show both filters

## Test Scenario 6: Page Refresh
1. At `/dashboard/project/budget/?year=2024`
2. Press F5 (refresh)
3. ✅ Filter persists (URL is preserved)
4. ✅ yearFilter state restored
5. ✅ Table still filtered

## Test Scenario 7: Clear Filters Button
1. Multiple filters active (year + search + status)
2. Click "Clear Filters" button
3. ✅ All badges disappear
4. ✅ URL becomes clean
5. ✅ Table shows all data
6. ✅ No localStorage side effects

## Test Scenario 8: Mobile Responsiveness
1. Open on mobile / narrow viewport
2. Click year filter dropdown
3. ✅ Dropdown visible and usable
4. ✅ Badges stack/wrap correctly
5. ✅ URL still updates

## Test Scenario 9: Dark Mode
1. Toggle dark mode
2. With active year filter
3. ✅ Badge still readable (purple text/bg)
4. ✅ Filter icon visible
5. ✅ Dropdown usable

## Test Scenario 10: No localStorage Pollution
1. Open DevTools (F12)
2. Check Application → Local Storage
3. ✅ No "budget_selected_year" key exists
4. ✅ No year-related localStorage entries
5. Check sessionStorage
6. ✅ "budget_year_preference" may exist (OK)

## Acceptance Criteria (All Must Pass)
- ✅ No localStorage writes for year filtering
- ✅ URL is authoritative source of year filter
- ✅ URL updates on filter change
- ✅ Multiple years can be selected (in URL as `&year=`)
- ✅ URLs are shareable and work cross-browser
- ✅ Page refresh maintains filter (URL persists)
- ✅ Visual badges clear and functional
- ✅ Mobile and dark mode work
- ✅ No console errors or warnings
