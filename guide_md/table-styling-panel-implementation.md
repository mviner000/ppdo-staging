# Table Styling Panel Implementation Plan

**Document Version:** 1.0
**Created:** 2026-01-24
**Author:** Senior Frontend Developer
**Status:** Proposal

---

## Executive Summary

This document outlines the implementation plan for a draggable Table Styling Panel in the PrintPreviewModal component. The panel will provide 6 pre-designed table styles (inspired by Microsoft Word/PowerPoint) that users can apply to selected table groups in the canvas.

---

## 1. Requirements Analysis

### 1.1 Functional Requirements

- **FR-1**: Display a draggable panel showing 6 table styling templates
- **FR-2**: Auto-show panel when a table group is selected in canvas
- **FR-3**: Auto-hide panel when table group is deselected
- **FR-4**: Apply selected style to all elements in the selected table group
- **FR-5**: Panel should not appear when individual elements are selected
- **FR-6**: Default styles based on Microsoft Word/PowerPoint table templates
- **FR-7**: Use shadcn UI components for consistency

### 1.2 Non-Functional Requirements

- **NFR-1**: Must not break existing functionality
- **NFR-2**: Panel should be draggable like LayerPanel
- **NFR-3**: Smooth transitions and animations
- **NFR-4**: Responsive to window resizing
- **NFR-5**: Performance: Style application < 200ms for tables with 100+ elements

---

## 2. Architecture Analysis

### 2.1 Current System Components

```
PrintPreviewModal
├── Toolbar (top)
├── Canvas (center)
│   ├── HeaderFooterSection (header)
│   ├── Page Content (body) - contains table groups
│   └── HeaderFooterSection (footer)
├── PagePanel (right sidebar)
└── BottomPageControls
    └── LayerPanel (draggable, conditional)
```

### 2.2 State Management

**Current Relevant State:**
- `selectedElementId: string | null` - Single element selection
- `selectedGroupId: string | null` - Group selection (recently added)
- `pages: Page[]` - Canvas pages with elements
- `header/footer: HeaderFooter` - Section elements

**Group Structure:**
```typescript
interface CanvasElement {
  // ... existing properties
  groupId?: string;        // e.g., "table-group-1234567890-0"
  groupName?: string;      // e.g., "Table (Page Data 1)"
}
```

---

## 3. Design Specification

### 3.1 Table Style Definition

```typescript
// New file: app/(extra)/canvas/_components/editor/types/table-style.ts

export interface TableStyle {
  id: string;
  name: string;
  preview: string; // Base64 thumbnail or SVG
  description: string;

  // Style properties
  headerStyle: {
    backgroundColor: string;
    color: string;
    bold: boolean;
    fontSize?: number;
  };

  rowStyle: {
    evenRowColor: string;
    oddRowColor: string;
    color: string;
    fontSize?: number;
  };

  borderStyle: {
    enabled: boolean;
    color: string;
    width: number;
  };

  categoryHeaderStyle?: {
    backgroundColor: string;
    color: string;
    bold: boolean;
  };
}
```

### 3.2 Pre-defined Styles (Microsoft Word/PowerPoint Inspired)

**Style 1: Grid Table Light (Default)**
- Header: Dark blue background (#1F4E78), white text, bold
- Rows: White background, alternating light gray (#F2F2F2)
- Borders: All borders, gray (#BFBFBF), 1px

**Style 2: Grid Table Accent 1**
- Header: Blue background (#4472C4), white text, bold
- Rows: White background, alternating light blue (#D9E2F3)
- Borders: All borders, blue (#4472C4), 1px

**Style 3: Grid Table Medium**
- Header: Teal background (#70AD47), white text, bold
- Rows: White background, alternating light green (#E2EFDA)
- Borders: All borders, teal (#70AD47), 1px

**Style 4: List Table Light**
- Header: Gray background (#D9D9D9), black text, bold
- Rows: White background, no alternating
- Borders: Horizontal only, gray (#BFBFBF), 1px

**Style 5: Colorful Grid**
- Header: Orange background (#ED7D31), white text, bold
- Rows: White background, alternating light orange (#FBE5D6)
- Borders: All borders, orange (#ED7D31), 2px

**Style 6: Minimal**
- Header: White background, black text, bold, bottom border
- Rows: White background, no alternating
- Borders: Horizontal only (header bottom, row bottoms), light gray (#E7E6E6), 1px

### 3.3 UI Components

```
TableStylePanel (New Component)
├── Panel Header
│   ├── Title: "Table Styles"
│   ├── Drag Handle
│   └── Close Button
├── Style Grid (2 columns × 3 rows)
│   └── StylePreviewCard (6 instances)
│       ├── Preview Image/SVG
│       ├── Style Name
│       └── Selected Indicator
└── Panel Footer (optional)
    └── "Apply" button (auto-applies on click)
```

---

## 4. Component Structure

### 4.1 New Files to Create

```
app/(extra)/canvas/_components/editor/
├── types/
│   └── table-style.ts                    # TableStyle interface
├── table-style-panel.tsx                 # Main panel component
├── table-style-preview.tsx               # Individual style preview card
├── constants/
│   └── table-styles.ts                   # Pre-defined 6 styles
└── utils/
    └── applyTableStyle.ts                # Logic to apply style to table group
```

### 4.2 Modified Files

```
app/dashboard/project/[year]/components/
├── PrintPreviewModal.tsx                 # Add TableStylePanel
└── hooks/
    └── usePrintPreviewState.ts          # Add appliedTableStyle state

app/(extra)/canvas/_components/editor/
└── bottom-page-controls.tsx             # Pass selectedGroupId to parent
```

---

## 5. Implementation Steps

### Phase 1: Data Layer (Day 1)

**Step 1.1**: Create type definitions
```bash
File: app/(extra)/canvas/_components/editor/types/table-style.ts
```

**Step 1.2**: Define 6 pre-designed styles
```bash
File: app/(extra)/canvas/_components/editor/constants/table-styles.ts
```

**Step 1.3**: Create utility function to apply styles
```bash
File: app/(extra)/canvas/_components/editor/utils/applyTableStyle.ts
```

### Phase 2: UI Components (Day 2)

**Step 2.1**: Create StylePreviewCard component
- Use shadcn Card component
- Display style preview (SVG mini table)
- Show style name
- Handle click/selection state
- Hover effects

**Step 2.2**: Create TableStylePanel component
- Draggable container (reuse LayerPanel drag logic)
- Grid layout for 6 styles
- Close button
- Responsive sizing

**Step 2.3**: Create style preview SVGs
- Generate 6 mini table SVGs showing style preview
- Each 120x80px
- Store as inline SVG components or data URIs

### Phase 3: Integration (Day 3)

**Step 3.1**: Add state management
```typescript
// In usePrintPreviewState.ts
const [appliedTableStyles, setAppliedTableStyles] =
  useState<Map<string, string>>(new Map()); // groupId -> styleId
const [showTableStylePanel, setShowTableStylePanel] = useState(false);
```

**Step 3.2**: Integrate panel in PrintPreviewModal
```tsx
{/* After LayerPanel, before closing tags */}
{isEditorMode && selectedGroupId && (
  <TableStylePanel
    isOpen={showTableStylePanel}
    selectedGroupId={selectedGroupId}
    appliedStyleId={appliedTableStyles.get(selectedGroupId)}
    onApplyStyle={(styleId) => handleApplyTableStyle(selectedGroupId, styleId)}
    onClose={() => setShowTableStylePanel(false)}
  />
)}
```

**Step 3.3**: Auto-show/hide logic
```typescript
// In PrintPreviewModal or custom hook
useEffect(() => {
  // Show panel when table group is selected
  if (selectedGroupId) {
    setShowTableStylePanel(true);
  } else {
    setShowTableStylePanel(false);
  }
}, [selectedGroupId]);
```

### Phase 4: Style Application Logic (Day 4)

**Step 4.1**: Implement applyTableStyle function
```typescript
function applyTableStyle(
  elements: CanvasElement[],
  groupId: string,
  style: TableStyle,
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void
): void {
  const tableElements = elements.filter(el => el.groupId === groupId);

  tableElements.forEach((element, index) => {
    if (element.type !== 'text') return;

    // Determine element role (header, even row, odd row, category)
    const elementRole = determineElementRole(element, tableElements);

    // Apply appropriate style
    const styleUpdates = getStyleUpdatesForRole(elementRole, style);

    onUpdateElement(element.id, styleUpdates);
  });
}
```

**Step 4.2**: Element role detection
```typescript
function determineElementRole(
  element: TextElement,
  allTableElements: CanvasElement[]
): 'header' | 'evenRow' | 'oddRow' | 'categoryHeader' {
  // Logic to detect if element is:
  // - Table header (check if bold and at top)
  // - Category header (check text pattern or element ID)
  // - Even/odd row (based on y-position)
}
```

### Phase 5: Testing & Polish (Day 5)

**Step 5.1**: Unit tests
- Test style application logic
- Test element role detection
- Test state management

**Step 5.2**: Integration tests
- Test panel show/hide
- Test style application to large tables (100+ elements)
- Test undo/redo functionality (if exists)

**Step 5.3**: UI Polish
- Add smooth transitions
- Loading states during style application
- Error handling
- Accessibility (keyboard navigation, ARIA labels)

---

## 6. Technical Specifications

### 6.1 Panel Positioning

```typescript
// Similar to LayerPanel
interface PanelPosition {
  x: number;  // Default: window.innerWidth - 300 - 280 (left of LayerPanel)
  y: number;  // Default: 100
}

// Constraints
const PANEL_WIDTH = 280; // px
const PANEL_HEIGHT = 400; // px (flexible based on content)
```

### 6.2 Performance Optimization

```typescript
// Batch updates for large tables
function applyTableStyleOptimized(
  elements: CanvasElement[],
  groupId: string,
  style: TableStyle,
  onBatchUpdate: (updates: Array<{id: string, changes: Partial<CanvasElement>}>) => void
): void {
  const updates: Array<{id: string, changes: Partial<CanvasElement>}> = [];

  // Collect all updates
  elements
    .filter(el => el.groupId === groupId)
    .forEach(element => {
      const styleUpdates = calculateStyleUpdates(element, style);
      updates.push({ id: element.id, changes: styleUpdates });
    });

  // Apply in single batch
  onBatchUpdate(updates);
}
```

### 6.3 State Persistence

```typescript
// Store applied styles in draft
interface PrintDraft {
  // ... existing properties
  appliedTableStyles?: Record<string, string>; // groupId -> styleId
}

// When saving draft
const draft: PrintDraft = {
  // ... existing properties
  appliedTableStyles: Object.fromEntries(state.appliedTableStyles),
};

// When loading draft
if (existingDraft?.appliedTableStyles) {
  setAppliedTableStyles(new Map(Object.entries(existingDraft.appliedTableStyles)));
}
```

---

## 7. Edge Cases & Error Handling

### 7.1 Edge Cases

| Case | Handling |
|------|----------|
| Table with no header row | Apply row styles only, skip header styles |
| Mixed element types in group | Apply styles only to text elements |
| Very small tables (< 3 rows) | Apply styles normally, may look different |
| Table spans multiple pages | Apply style to all pages with same groupId |
| User manually edited some cells | Warn user that styles will override manual changes |

### 7.2 Error Scenarios

```typescript
// Graceful error handling
try {
  applyTableStyle(elements, groupId, style, onUpdateElement);
  toast.success(`Applied "${style.name}" style`);
} catch (error) {
  console.error('Failed to apply table style:', error);
  toast.error('Failed to apply table style. Please try again.');
  // Optionally: rollback changes
}
```

---

## 8. Dependencies

### 8.1 shadcn Components to Use

```bash
npx shadcn-ui@latest add card
npx shadcn-ui@latest add scroll-area
npx shadcn-ui@latest add tooltip
```

### 8.2 Utility Libraries

- `lucide-react` - Already installed (for icons)
- `clsx` - Already installed (for className management)

---

## 9. Backward Compatibility

### 9.1 Existing Functionality Preservation

**Guaranteed No-Break Points:**
- ✅ Existing table grouping (groupId, groupName)
- ✅ Layer panel drag functionality
- ✅ Element selection/editing
- ✅ Canvas drag and group movement
- ✅ Draft save/load
- ✅ Template application
- ✅ Print functionality

### 9.2 Migration Strategy

**For existing drafts without table styles:**
```typescript
// Default to no style applied (original appearance)
const appliedStyles = existingDraft?.appliedTableStyles || {};

// Or auto-apply "Grid Table Light" to existing tables
const autoApplyDefaultStyle = false; // Feature flag
```

---

## 10. Success Metrics

### 10.1 Performance Targets

- Panel open/close: < 100ms
- Style preview render: < 50ms per preview
- Style application: < 200ms for 100 elements
- Memory overhead: < 5MB for panel with previews

### 10.2 User Experience Metrics

- Panel discoverable without tutorial
- Style application with 1 click
- Panel doesn't obscure important content
- Smooth animations (60fps)

---

## 11. Future Enhancements

### 11.1 Phase 2 Features (Optional)

- **Custom Styles**: Allow users to create and save custom styles
- **Style Presets by Document Type**: Different style sets for different document types
- **Undo/Redo**: Full history support for style changes
- **Bulk Apply**: Apply same style to all tables in document
- **Style Preview on Hover**: Show live preview without applying
- **Color Picker**: Customize colors in existing styles
- **Export/Import Styles**: Share styles between users

### 11.2 Technical Improvements

- **Lazy Loading**: Load style previews on demand
- **Web Worker**: Move style calculation to worker thread
- **Virtual Scrolling**: If style library grows large
- **Keyboard Shortcuts**: Quick style application (Ctrl+1-6)

---

## 12. Implementation Timeline

```
Week 1: Foundation
├── Day 1: Data layer (types, constants, utils)
├── Day 2: UI components (panel, preview cards)
├── Day 3: Integration with PrintPreviewModal
├── Day 4: Style application logic
└── Day 5: Testing & polish

Week 2: Refinement
├── Day 6-7: User testing & feedback
├── Day 8-9: Bug fixes & performance optimization
└── Day 10: Documentation & code review
```

---

## 13. Code Review Checklist

Before merging:

- [ ] All TypeScript types properly defined
- [ ] shadcn components used correctly
- [ ] No breaking changes to existing functionality
- [ ] Panel dragging works smoothly
- [ ] Auto-show/hide logic correct
- [ ] Performance targets met
- [ ] Error handling comprehensive
- [ ] Accessibility standards met (WCAG 2.1 AA)
- [ ] Code follows project conventions
- [ ] Tests pass (unit + integration)
- [ ] Browser compatibility verified (Chrome, Firefox, Safari, Edge)
- [ ] Mobile responsive (if applicable)

---

## 14. Risk Assessment

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Style application breaks existing elements | High | Low | Comprehensive testing, rollback mechanism |
| Performance issues with large tables | Medium | Medium | Batch updates, web workers |
| Panel obscures important UI | Medium | Low | Smart default positioning, draggable |
| Styles don't match user expectations | Medium | Medium | Use familiar MS Word/PPT styles |
| State management complexity | Low | Low | Follow existing patterns in codebase |

---

## 15. Rollout Strategy

### 15.1 Development

```bash
# Feature branch
git checkout -b feature/table-styling-panel

# Incremental commits
commit 1: Add table style types and constants
commit 2: Create TableStylePanel component
commit 3: Create StylePreviewCard component
commit 4: Integrate with PrintPreviewModal
commit 5: Implement style application logic
commit 6: Add tests
commit 7: Polish and documentation
```

### 15.2 Testing

1. **Developer Testing**: Each component individually
2. **Integration Testing**: Full flow in PrintPreviewModal
3. **User Acceptance Testing**: Real users test with sample data
4. **Performance Testing**: Large tables (500+ rows)
5. **Cross-browser Testing**: All major browsers

### 15.3 Deployment

```bash
# Feature flag (optional)
const ENABLE_TABLE_STYLING = process.env.NEXT_PUBLIC_ENABLE_TABLE_STYLING === 'true';

# Gradual rollout
- Week 1: Internal team (10% traffic)
- Week 2: Beta users (25% traffic)
- Week 3: All users (100% traffic)
```

---

## 16. Appendix

### A. File Structure (Complete)

```
app/(extra)/canvas/_components/editor/
├── types/
│   ├── index.ts
│   ├── template.ts
│   └── table-style.ts                    # NEW
├── constants/
│   ├── index.ts
│   └── table-styles.ts                   # NEW
├── utils/
│   └── applyTableStyle.ts                # NEW
├── table-style-panel.tsx                 # NEW
├── table-style-preview.tsx               # NEW
├── layer-panel.tsx
├── canvas.tsx
├── toolbar.tsx
└── ... (existing files)

guide_md/
└── table-styling-panel-implementation.md # THIS FILE
```

### B. Example Style Object

```typescript
export const GRID_TABLE_LIGHT: TableStyle = {
  id: 'grid-table-light',
  name: 'Grid Table Light',
  description: 'Classic table style with alternating rows',
  preview: 'data:image/svg+xml;base64,...', // SVG preview

  headerStyle: {
    backgroundColor: '#1F4E78',
    color: '#FFFFFF',
    bold: true,
    fontSize: 11,
  },

  rowStyle: {
    evenRowColor: '#FFFFFF',
    oddRowColor: '#F2F2F2',
    color: '#000000',
    fontSize: 10,
  },

  borderStyle: {
    enabled: true,
    color: '#BFBFBF',
    width: 1,
  },

  categoryHeaderStyle: {
    backgroundColor: '#D9D9D9',
    color: '#000000',
    bold: true,
  },
};
```

### C. Panel Component Example

```typescript
interface TableStylePanelProps {
  isOpen: boolean;
  selectedGroupId: string | null;
  appliedStyleId?: string;
  onApplyStyle: (styleId: string) => void;
  onClose: () => void;
}

export default function TableStylePanel({
  isOpen,
  selectedGroupId,
  appliedStyleId,
  onApplyStyle,
  onClose,
}: TableStylePanelProps) {
  // Implementation details...
}
```

---

**End of Document**

For questions or clarifications, contact the development team.
