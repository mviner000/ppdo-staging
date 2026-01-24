
🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Explore codebase to understand existing structure",
      "status": "in_progress",
      "activeForm": "Exploring codebase structure"
    },
    {
      "content": "Plan implementation approach for document ruler feature",
      "status": "pending",
      "activeForm": "Planning implementation approach"
    },
    {
      "content": "Create ruler components (horizontal and vertical)",
      "status": "pending",
      "activeForm": "Creating ruler components"
    },
    {
      "content": "Implement draggable markers for margins, indents, and tab stops",
      "status": "pending",
      "activeForm": "Implementing draggable markers"
    },
    {
      "content": "Add zoom and page size synchronization",
      "status": "pending",
      "activeForm": "Adding zoom and page size synchronization"
    },
    {
      "content": "Implement toggle functionality (toolbar button + keyboard shortcut)",
      "status": "pending",
      "activeForm": "Implementing toggle functionality"
    },
    {
      "content": "Add session persistence for ruler visibility",
      "status": "pending",
      "activeForm": "Adding session persistence"
    },
    {
      "content": "Synchronize with canvas scrolling and text selection",
      "status": "pending",
      "activeForm": "Synchronizing with canvas"
    }
  ]
}

🔧 Tool: Task
Input: {
  "description": "Explore codebase structure",
  "prompt": "I need to implement a dynamic document ruler feature similar to Google Docs and Microsoft Word. Please explore the codebase to understand:\n\n1. The overall project structure (is it React, Vue, etc.?)\n2. How the canvas/editor is implemented\n3. Where page settings (size, orientation, margins) are managed\n4. How zoom is handled\n5. Where toolbar components are located\n6. Any existing ruler or measurement-related code\n7. State management approach (Redux, Zustand, Context, etc.)\n8. How keyboard shortcuts are implemented\n\nProvide a comprehensive overview of the relevant parts of the codebase that I'll need to work with to implement this ruler feature.",
  "subagent_type": "Explore"
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\ppdo\\ppdo-next\\package.json"
}

🔧 Tool: Glob
Input: {
  "pattern": "**/*.{tsx,ts,jsx,js}",
  "path": "C:\\ppdo\\ppdo-next"
}

🔧 Tool: Bash
Input: {
  "command": "ls -la C:\\ppdo\\ppdo-next",
  "description": "List root directory contents"
}

🔧 Tool: Bash
Input: {
  "command": "ls -la /c/ppdo/ppdo-next",
  "description": "List root directory contents"
}

🔧 Tool: Glob
Input: {
  "pattern": "**/*canvas*",
  "path": "C:\\ppdo\\ppdo-next"
}

🔧 Tool: Glob
Input: {
  "pattern": "**/*editor*",
  "path": "C:\\ppdo\\ppdo-next"
}

🔧 Tool: Glob
Input: {
  "pattern": "**/*zoom*",
  "path": "C:\\ppdo\\ppdo-next"
}

🔧 Tool: Glob
Input: {
  "pattern": "**/*toolbar*",
  "path": "C:\\ppdo\\ppdo-next"
}

🔧 Tool: Glob
Input: {
  "pattern": "**/*context*",
  "path": "C:\\ppdo\\ppdo-next"
}

🔧 Tool: Glob
Input: {
  "pattern": "**/*store*",
  "path": "C:\\ppdo\\ppdo-next"
}

🔧 Tool: Glob
Input: {
  "pattern": "**/*page*setting*",
  "path": "C:\\ppdo\\ppdo-next"
}

🔧 Tool: Glob
Input: {
  "pattern": "**/*print*",
  "path": "C:\\ppdo\\ppdo-next"
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\ppdo\\ppdo-next\\app\\(extra)\\canvas\\_components\\editor.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\ppdo\\ppdo-next\\app\\(extra)\\canvas\\_components\\editor\\canvas.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\ppdo\\ppdo-next\\app\\(extra)\\canvas\\_components\\editor\\toolbar.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\ppdo\\ppdo-next\\lib\\canvas-utils.ts"
}

🔧 Tool: Glob
Input: {
  "pattern": "**/editor/constants*",
  "path": "C:\\ppdo\\ppdo-next"
}

🔧 Tool: Glob
Input: {
  "pattern": "**/editor/types*",
  "path": "C:\\ppdo\\ppdo-next"
}

🔧 Tool: Glob
Input: {
  "pattern": "**/editor/hooks*",
  "path": "C:\\ppdo\\ppdo-next"
}

🔧 Tool: Glob
Input: {
  "pattern": "**/PrintPreview*",
  "path": "C:\\ppdo\\ppdo-next"
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\ppdo\\ppdo-next\\app\\(extra)\\canvas\\_components\\editor\\constants.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\ppdo\\ppdo-next\\app\\(extra)\\canvas\\_components\\editor\\types.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\ppdo\\ppdo-next\\app\\(extra)\\canvas\\_components\\editor\\hooks\\useEditorState.ts"
}

🔧 Tool: Bash
Input: {
  "command": "find /c/ppdo/ppdo-next/app -name \"*keyboard*\" -o -name \"*useKeyboard*\" -o -name \"*shortcut*\" 2>/dev/null | head -20",
  "description": "Find keyboard and shortcut related files"
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\ppdo\\ppdo-next\\app\\(extra)\\canvas\\_components\\editor\\hooks\\useKeyboard.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\ppdo\\ppdo-next\\app\\(extra)\\canvas\\_components\\editor\\utils.ts"
}

🔧 Tool: Bash
Input: {
  "command": "ls -la /c/ppdo/ppdo-next/app/\\(extra\\)/canvas/_components/editor/hooks/",
  "description": "List all hooks in editor directory"
}

🔧 Tool: Grep
Input: {
  "pattern": "zoom|ruler|measure|margin|padding",
  "path": "C:\\ppdo\\ppdo-next\\app\\(extra)\\canvas\\_components",
  "output_mode": "files_with_matches"
}

🔧 Tool: Bash
Input: {
  "command": "find /c/ppdo/ppdo-next/app/\\(extra\\)/canvas/_components/editor -type f -name \"*.tsx\" | head -30",
  "description": "List all tsx files in editor components"
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\ppdo\\ppdo-next\\app\\(extra)\\canvas\\_components\\editor\\page-panel.tsx",
  "limit": 50
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\ppdo\\ppdo-next\\lib\\print.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\ppdo\\ppdo-next\\services\\export\\printUtils.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\ppdo\\ppdo-next\\app\\dashboard\\project\\[year]\\components\\PrintPreviewModal.tsx",
  "limit": 100
}

🔧 Tool: Bash
Input: {
  "command": "find /c/ppdo/ppdo-next -type f -name \"*.tsx\" -o -name \"*.ts\" | xargs grep -l \"ruler\\|Ruler\\|measure\\|Measure\" 2>/dev/null | head -20",
  "description": "Search for ruler or measurement related code"
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\ppdo\\ppdo-next\\app\\(extra)\\canvas\\_components\\editor\\layer-panel.tsx",
  "limit": 80
}

🔧 Tool: Bash
Input: {
  "command": "find /c/ppdo/ppdo-next/app/\\(extra\\)/canvas/_components/editor -type f -name \"*.tsx\" | wc -l",
  "description": "Count tsx files in editor"
}

🔧 Tool: Glob
Input: {
  "pattern": "**/*text-element*",
  "path": "C:\\ppdo\\ppdo-next\\app\\(extra)\\canvas\\_components\\editor"
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\ppdo\\ppdo-next\\README.md",
  "limit": 100
}

🔧 Tool: Bash
Input: {
  "command": "find /c/ppdo/ppdo-next/guide_md -type f -name \"*.md\" 2>/dev/null",
  "description": "Find guide markdown files"
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\ppdo\\ppdo-next\\guide_md\\table-styling-panel-implementation.md"
}

🔧 Tool: Bash
Input: {
  "command": "ls -la /c/ppdo/ppdo-next/app/\\(extra\\)/canvas/_components/editor/",
  "description": "List all editor components"
}

🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Explore codebase to understand existing structure",
      "status": "completed",
      "activeForm": "Exploring codebase structure"
    },
    {
      "content": "Plan implementation approach for document ruler feature",
      "status": "in_progress",
      "activeForm": "Planning implementation approach"
    },
    {
      "content": "Create ruler components (horizontal and vertical)",
      "status": "pending",
      "activeForm": "Creating ruler components"
    },
    {
      "content": "Implement draggable markers for margins, indents, and tab stops",
      "status": "pending",
      "activeForm": "Implementing draggable markers"
    },
    {
      "content": "Add zoom and page size synchronization",
      "status": "pending",
      "activeForm": "Adding zoom and page size synchronization"
    },
    {
      "content": "Implement toggle functionality (toolbar button + keyboard shortcut)",
      "status": "pending",
      "activeForm": "Implementing toggle functionality"
    },
    {
      "content": "Add session persistence for ruler visibility",
      "status": "pending",
      "activeForm": "Adding session persistence"
    },
    {
      "content": "Synchronize with canvas scrolling and text selection",
      "status": "pending",
      "activeForm": "Synchronizing with canvas"
    }
  ]
}
Now let me read the key files to understand the existing patterns better:

🔧 Tool: Read
Input: {
  "file_path": "C:\\ppdo\\ppdo-next\\app\\(extra)\\canvas\\_components\\editor\\types.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\ppdo\\ppdo-next\\app\\(extra)\\canvas\\_components\\editor\\constants.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\ppdo\\ppdo-next\\app\\(extra)\\canvas\\_components\\editor\\editor.tsx"
}

🔧 Tool: Glob
Input: {
  "pattern": "**/canvas/**/*.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\ppdo\\ppdo-next\\app\\(extra)\\canvas\\_components\\editor.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\ppdo\\ppdo-next\\app\\(extra)\\canvas\\_components\\editor\\canvas.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\ppdo\\ppdo-next\\app\\(extra)\\canvas\\_components\\editor\\toolbar.tsx"
}
Now let me also check the hooks to understand the pattern better, especially the useKeyboard hook since I'll need to extend it:

🔧 Tool: Read
Input: {
  "file_path": "C:\\ppdo\\ppdo-next\\app\\(extra)\\canvas\\_components\\editor\\hooks\\useKeyboard.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\ppdo\\ppdo-next\\app\\(extra)\\canvas\\_components\\editor\\hooks\\useStorage.ts"
}
Now I have a good understanding of the codebase. Let me mark the planning task as complete and start implementing. Let me update the todos with a more detailed breakdown:

🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Explore codebase to understand existing structure",
      "status": "completed",
      "activeForm": "Exploring codebase structure"
    },
    {
      "content": "Plan implementation approach for document ruler feature",
      "status": "completed",
      "activeForm": "Planning implementation approach"
    },
    {
      "content": "Create ruler types and constants",
      "status": "in_progress",
      "activeForm": "Creating ruler types and constants"
    },
    {
      "content": "Create horizontal ruler component with tick marks",
      "status": "pending",
      "activeForm": "Creating horizontal ruler component"
    },
    {
      "content": "Create vertical ruler component with tick marks",
      "status": "pending",
      "activeForm": "Creating vertical ruler component"
    },
    {
      "content": "Implement draggable margin markers",
      "status": "pending",
      "activeForm": "Implementing draggable margin markers"
    },
    {
      "content": "Implement indent markers (first-line, hanging, left/right)",
      "status": "pending",
      "activeForm": "Implementing indent markers"
    },
    {
      "content": "Implement tab stop markers",
      "status": "pending",
      "activeForm": "Implementing tab stop markers"
    },
    {
      "content": "Create useRulerState hook for ruler state management",
      "status": "pending",
      "activeForm": "Creating useRulerState hook"
    },
    {
      "content": "Add ruler toggle button to toolbar",
      "status": "pending",
      "activeForm": "Adding ruler toggle button"
    },
    {
      "content": "Implement keyboard shortcut (Ctrl+Shift+R)",
      "status": "pending",
      "activeForm": "Implementing keyboard shortcut"
    },
    {
      "content": "Add session persistence for ruler visibility",
      "status": "pending",
      "activeForm": "Adding session persistence"
    },
    {
      "content": "Integrate ruler with editor component",
      "status": "pending",
      "activeForm": "Integrating ruler with editor"
    }
  ]
}
Let me start implementing the ruler feature. First, I'll add the ruler types and constants:

🔧 Tool: Edit
Input: {
  "file_path": "C:\\ppdo\\ppdo-next\\app\\(extra)\\canvas\\_components\\editor\\constants.ts",
  "old_string": "// app/(extra)/canvas/_components/editor/constants.ts\n\nexport const PAGE_SIZES = {\n  A4: { width: 595, height: 842 },\n  Short: { width: 612, height: 792 },\n  Long: { width: 612, height: 936 },\n} as const;\n\nexport const STORAGE_KEY = 'canvas-editor-state';\n\nexport const HEADER_HEIGHT = 80;\nexport const FOOTER_HEIGHT = 60;",
  "new_string": "// app/(extra)/canvas/_components/editor/constants.ts\n\nexport const PAGE_SIZES = {\n  A4: { width: 595, height: 842 },\n  Short: { width: 612, height: 792 },\n  Long: { width: 612, height: 936 },\n} as const;\n\nexport const STORAGE_KEY = 'canvas-editor-state';\nexport const RULER_STORAGE_KEY = 'canvas-editor-ruler-state';\n\nexport const HEADER_HEIGHT = 80;\nexport const FOOTER_HEIGHT = 60;\n\n// Ruler constants\nexport const RULER_HEIGHT = 24; // Height for horizontal ruler\nexport const RULER_WIDTH = 24;  // Width for vertical ruler\n\n// Conversion: 1 inch = 72 points (standard DPI for print)\n// A4 width in points: 595 / 72 = 8.27 inches\n// Short/Long width in points: 612 / 72 = 8.5 inches\nexport const POINTS_PER_INCH = 72;\nexport const CM_PER_INCH = 2.54;\n\n// Page dimensions in inches for reference\nexport const PAGE_SIZES_INCHES = {\n  A4: { width: 8.27, height: 11.69 },\n  Short: { width: 8.5, height: 11 },\n  Long: { width: 8.5, height: 13 },\n} as const;\n\n// Default margins in pixels (approximately 1 inch = 72px)\nexport const DEFAULT_MARGINS = {\n  left: 72,\n  right: 72,\n  top: 72,\n  bottom: 72,\n} as const;\n\n// Tab stop types\nexport type TabStopType = 'left' | 'center' | 'right' | 'decimal';\n\n// Ruler unit options\nexport type RulerUnit = 'inches' | 'cm' | 'pixels';"
}
Now let me add the ruler types to the types file:

🔧 Tool: Edit
Input: {
  "file_path": "C:\\ppdo\\ppdo-next\\app\\(extra)\\canvas\\_components\\editor\\types.ts",
  "old_string": "export interface EditorState {\n  pages: Page[];\n  currentPageIndex: number;\n  selectedElementId: string | null;\n  isEditingElementId: string | null;\n  header: HeaderFooter;\n  footer: HeaderFooter;\n}",
  "new_string": "export interface EditorState {\n  pages: Page[];\n  currentPageIndex: number;\n  selectedElementId: string | null;\n  isEditingElementId: string | null;\n  header: HeaderFooter;\n  footer: HeaderFooter;\n}\n\n// Ruler types\nexport type TabStopType = 'left' | 'center' | 'right' | 'decimal';\nexport type RulerUnit = 'inches' | 'cm' | 'pixels';\n\nexport interface TabStop {\n  id: string;\n  position: number; // Position in pixels from left edge\n  type: TabStopType;\n}\n\nexport interface IndentSettings {\n  firstLine: number;   // First line indent in pixels\n  hanging: number;     // Hanging indent in pixels (left side)\n  left: number;        // Left indent in pixels\n  right: number;       // Right indent in pixels\n}\n\nexport interface MarginSettings {\n  left: number;\n  right: number;\n  top: number;\n  bottom: number;\n}\n\nexport interface RulerState {\n  visible: boolean;\n  showVertical: boolean;\n  unit: RulerUnit;\n  margins: MarginSettings;\n  indents: IndentSettings;\n  tabStops: TabStop[];\n  zoom: number;\n}"
}

🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Explore codebase to understand existing structure",
      "status": "completed",
      "activeForm": "Exploring codebase structure"
    },
    {
      "content": "Plan implementation approach for document ruler feature",
      "status": "completed",
      "activeForm": "Planning implementation approach"
    },
    {
      "content": "Create ruler types and constants",
      "status": "completed",
      "activeForm": "Creating ruler types and constants"
    },
    {
      "content": "Create horizontal ruler component with tick marks",
      "status": "in_progress",
      "activeForm": "Creating horizontal ruler component"
    },
    {
      "content": "Create vertical ruler component with tick marks",
      "status": "pending",
      "activeForm": "Creating vertical ruler component"
    },
    {
      "content": "Implement draggable margin markers",
      "status": "pending",
      "activeForm": "Implementing draggable margin markers"
    },
    {
      "content": "Implement indent markers (first-line, hanging, left/right)",
      "status": "pending",
      "activeForm": "Implementing indent markers"
    },
    {
      "content": "Implement tab stop markers",
      "status": "pending",
      "activeForm": "Implementing tab stop markers"
    },
    {
      "content": "Create useRulerState hook for ruler state management",
      "status": "pending",
      "activeForm": "Creating useRulerState hook"
    },
    {
      "content": "Add ruler toggle button to toolbar",
      "status": "pending",
      "activeForm": "Adding ruler toggle button"
    },
    {
      "content": "Implement keyboard shortcut (Ctrl+Shift+R)",
      "status": "pending",
      "activeForm": "Implementing keyboard shortcut"
    },
    {
      "content": "Add session persistence for ruler visibility",
      "status": "pending",
      "activeForm": "Adding session persistence"
    },
    {
      "content": "Integrate ruler with editor component",
      "status": "pending",
      "activeForm": "Integrating ruler with editor"
    }
  ]
}
Now let me create the useRulerState hook first, as it will be needed by the ruler components:

🔧 Tool: Write
Input: {
  "file_path": "C:\\ppdo\\ppdo-next\\app\\(extra)\\canvas\\_components\\editor\\hooks\\useRulerState.ts",
  "content": "// app/(extra)/canvas/_components/editor/hooks/useRulerState.ts\n\nimport { useState, useCallback, useEffect } from 'react';\nimport { RulerState, RulerUnit, MarginSettings, IndentSettings, TabStop, TabStopType } from '../types';\nimport { RULER_STORAGE_KEY, DEFAULT_MARGINS } from '../constants';\n\nconst DEFAULT_RULER_STATE: RulerState = {\n  visible: false,\n  showVertical: true,\n  unit: 'inches',\n  margins: { ...DEFAULT_MARGINS },\n  indents: {\n    firstLine: 0,\n    hanging: 0,\n    left: 0,\n    right: 0,\n  },\n  tabStops: [],\n  zoom: 1,\n};\n\nexport const useRulerState = () => {\n  const [rulerState, setRulerState] = useState<RulerState>(DEFAULT_RULER_STATE);\n  const [isHydrated, setIsHydrated] = useState(false);\n\n  // Load saved state from localStorage\n  useEffect(() => {\n    const savedState = localStorage.getItem(RULER_STORAGE_KEY);\n    if (savedState) {\n      try {\n        const parsed = JSON.parse(savedState) as Partial<RulerState>;\n        setRulerState(prev => ({\n          ...prev,\n          ...parsed,\n          margins: { ...DEFAULT_MARGINS, ...parsed.margins },\n          indents: { ...prev.indents, ...parsed.indents },\n        }));\n      } catch (error) {\n        console.error('Failed to load ruler state:', error);\n      }\n    }\n    setIsHydrated(true);\n  }, []);\n\n  // Save state to localStorage when it changes\n  useEffect(() => {\n    if (isHydrated) {\n      localStorage.setItem(RULER_STORAGE_KEY, JSON.stringify(rulerState));\n    }\n  }, [rulerState, isHydrated]);\n\n  const toggleRulerVisibility = useCallback(() => {\n    setRulerState(prev => ({\n      ...prev,\n      visible: !prev.visible,\n    }));\n  }, []);\n\n  const toggleVerticalRuler = useCallback(() => {\n    setRulerState(prev => ({\n      ...prev,\n      showVertical: !prev.showVertical,\n    }));\n  }, []);\n\n  const setRulerUnit = useCallback((unit: RulerUnit) => {\n    setRulerState(prev => ({\n      ...prev,\n      unit,\n    }));\n  }, []);\n\n  const setZoom = useCallback((zoom: number) => {\n    setRulerState(prev => ({\n      ...prev,\n      zoom: Math.max(0.25, Math.min(4, zoom)),\n    }));\n  }, []);\n\n  const updateMargin = useCallback((side: keyof MarginSettings, value: number) => {\n    setRulerState(prev => ({\n      ...prev,\n      margins: {\n        ...prev.margins,\n        [side]: Math.max(0, value),\n      },\n    }));\n  }, []);\n\n  const updateMargins = useCallback((margins: Partial<MarginSettings>) => {\n    setRulerState(prev => ({\n      ...prev,\n      margins: {\n        ...prev.margins,\n        ...margins,\n      },\n    }));\n  }, []);\n\n  const updateIndent = useCallback((type: keyof IndentSettings, value: number) => {\n    setRulerState(prev => ({\n      ...prev,\n      indents: {\n        ...prev.indents,\n        [type]: Math.max(0, value),\n      },\n    }));\n  }, []);\n\n  const updateIndents = useCallback((indents: Partial<IndentSettings>) => {\n    setRulerState(prev => ({\n      ...prev,\n      indents: {\n        ...prev.indents,\n        ...indents,\n      },\n    }));\n  }, []);\n\n  const addTabStop = useCallback((position: number, type: TabStopType = 'left') => {\n    const newTabStop: TabStop = {\n      id: `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,\n      position,\n      type,\n    };\n    setRulerState(prev => ({\n      ...prev,\n      tabStops: [...prev.tabStops, newTabStop].sort((a, b) => a.position - b.position),\n    }));\n    return newTabStop.id;\n  }, []);\n\n  const updateTabStop = useCallback((id: string, updates: Partial<Omit<TabStop, 'id'>>) => {\n    setRulerState(prev => ({\n      ...prev,\n      tabStops: prev.tabStops\n        .map(tab => tab.id === id ? { ...tab, ...updates } : tab)\n        .sort((a, b) => a.position - b.position),\n    }));\n  }, []);\n\n  const removeTabStop = useCallback((id: string) => {\n    setRulerState(prev => ({\n      ...prev,\n      tabStops: prev.tabStops.filter(tab => tab.id !== id),\n    }));\n  }, []);\n\n  const clearAllTabStops = useCallback(() => {\n    setRulerState(prev => ({\n      ...prev,\n      tabStops: [],\n    }));\n  }, []);\n\n  const resetRulerState = useCallback(() => {\n    setRulerState({\n      ...DEFAULT_RULER_STATE,\n      visible: rulerState.visible, // Keep visibility state\n      showVertical: rulerState.showVertical,\n    });\n  }, [rulerState.visible, rulerState.showVertical]);\n\n  return {\n    rulerState,\n    isHydrated,\n    toggleRulerVisibility,\n    toggleVerticalRuler,\n    setRulerUnit,\n    setZoom,\n    updateMargin,\n    updateMargins,\n    updateIndent,\n    updateIndents,\n    addTabStop,\n    updateTabStop,\n    removeTabStop,\n    clearAllTabStops,\n    resetRulerState,\n  };\n};\n"
}
Now let me create the horizontal ruler component:

🔧 Tool: Write
Input: {
  "file_path": "C:\\ppdo\\ppdo-next\\app\\(extra)\\canvas\\_components\\editor\\ruler\\HorizontalRuler.tsx",
  "content": "// app/(extra)/canvas/_components/editor/ruler/HorizontalRuler.tsx\n\n'use client';\n\nimport React, { useRef, useState, useCallback, useMemo } from 'react';\nimport { RulerState, RulerUnit, MarginSettings, IndentSettings, TabStop, TabStopType } from '../types';\nimport { RULER_HEIGHT, POINTS_PER_INCH, CM_PER_INCH } from '../constants';\n\ninterface HorizontalRulerProps {\n  width: number;\n  rulerState: RulerState;\n  onMarginChange: (side: keyof MarginSettings, value: number) => void;\n  onIndentChange: (type: keyof IndentSettings, value: number) => void;\n  onTabStopAdd: (position: number, type?: TabStopType) => string;\n  onTabStopUpdate: (id: string, updates: Partial<Omit<TabStop, 'id'>>) => void;\n  onTabStopRemove: (id: string) => void;\n  scrollLeft?: number;\n  leftOffset?: number;\n}\n\n// Convert pixels to display units\nconst pixelsToUnit = (pixels: number, unit: RulerUnit, zoom: number): number => {\n  const actualPixels = pixels / zoom;\n  switch (unit) {\n    case 'inches':\n      return actualPixels / POINTS_PER_INCH;\n    case 'cm':\n      return (actualPixels / POINTS_PER_INCH) * CM_PER_INCH;\n    case 'pixels':\n      return actualPixels;\n  }\n};\n\n// Convert display units to pixels\nconst unitToPixels = (value: number, unit: RulerUnit, zoom: number): number => {\n  let pixels: number;\n  switch (unit) {\n    case 'inches':\n      pixels = value * POINTS_PER_INCH;\n      break;\n    case 'cm':\n      pixels = (value / CM_PER_INCH) * POINTS_PER_INCH;\n      break;\n    case 'pixels':\n      pixels = value;\n      break;\n  }\n  return pixels * zoom;\n};\n\n// Get tick interval based on unit and zoom\nconst getTickInterval = (unit: RulerUnit, zoom: number): { major: number; minor: number; label: number } => {\n  switch (unit) {\n    case 'inches':\n      if (zoom >= 2) {\n        return { major: POINTS_PER_INCH / 4, minor: POINTS_PER_INCH / 16, label: POINTS_PER_INCH / 4 };\n      } else if (zoom >= 1) {\n        return { major: POINTS_PER_INCH / 2, minor: POINTS_PER_INCH / 8, label: POINTS_PER_INCH / 2 };\n      } else {\n        return { major: POINTS_PER_INCH, minor: POINTS_PER_INCH / 4, label: POINTS_PER_INCH };\n      }\n    case 'cm':\n      const cmToPixels = POINTS_PER_INCH / CM_PER_INCH;\n      if (zoom >= 2) {\n        return { major: cmToPixels / 2, minor: cmToPixels / 10, label: cmToPixels / 2 };\n      } else if (zoom >= 1) {\n        return { major: cmToPixels, minor: cmToPixels / 5, label: cmToPixels };\n      } else {\n        return { major: cmToPixels * 2, minor: cmToPixels / 2, label: cmToPixels * 2 };\n      }\n    case 'pixels':\n      if (zoom >= 2) {\n        return { major: 50, minor: 10, label: 50 };\n      } else if (zoom >= 1) {\n        return { major: 100, minor: 25, label: 100 };\n      } else {\n        return { major: 200, minor: 50, label: 200 };\n      }\n  }\n};\n\nexport default function HorizontalRuler({\n  width,\n  rulerState,\n  onMarginChange,\n  onIndentChange,\n  onTabStopAdd,\n  onTabStopUpdate,\n  onTabStopRemove,\n  scrollLeft = 0,\n  leftOffset = 0,\n}: HorizontalRulerProps) {\n  const rulerRef = useRef<HTMLDivElement>(null);\n  const [dragging, setDragging] = useState<{\n    type: 'leftMargin' | 'rightMargin' | 'firstLineIndent' | 'hangingIndent' | 'leftIndent' | 'rightIndent' | 'tabStop';\n    id?: string;\n    startX: number;\n    startValue: number;\n  } | null>(null);\n  const [hoveredMarker, setHoveredMarker] = useState<string | null>(null);\n\n  const { unit, zoom, margins, indents, tabStops } = rulerState;\n  const scaledWidth = width * zoom;\n  const tickInterval = getTickInterval(unit, zoom);\n\n  // Generate tick marks\n  const ticks = useMemo(() => {\n    const result: { position: number; type: 'major' | 'minor'; label?: string }[] = [];\n    const majorInterval = tickInterval.major * zoom;\n    const minorInterval = tickInterval.minor * zoom;\n    const labelInterval = tickInterval.label * zoom;\n\n    for (let pos = 0; pos <= scaledWidth; pos += minorInterval) {\n      const isMajor = Math.abs(pos % majorInterval) < 0.1 || Math.abs((pos % majorInterval) - majorInterval) < 0.1;\n      const isLabel = Math.abs(pos % labelInterval) < 0.1 || Math.abs((pos % labelInterval) - labelInterval) < 0.1;\n\n      let label: string | undefined;\n      if (isLabel && pos > 0) {\n        const value = pixelsToUnit(pos, unit, zoom);\n        if (unit === 'pixels') {\n          label = Math.round(value).toString();\n        } else {\n          label = value.toFixed(unit === 'inches' ? 1 : 0);\n        }\n      }\n\n      result.push({\n        position: pos,\n        type: isMajor ? 'major' : 'minor',\n        label,\n      });\n    }\n    return result;\n  }, [scaledWidth, tickInterval, unit, zoom]);\n\n  const handleMouseDown = useCallback((\n    e: React.MouseEvent,\n    type: 'leftMargin' | 'rightMargin' | 'firstLineIndent' | 'hangingIndent' | 'leftIndent' | 'rightIndent' | 'tabStop',\n    startValue: number,\n    id?: string\n  ) => {\n    e.preventDefault();\n    e.stopPropagation();\n    setDragging({ type, id, startX: e.clientX, startValue });\n  }, []);\n\n  const handleMouseMove = useCallback((e: MouseEvent) => {\n    if (!dragging || !rulerRef.current) return;\n\n    const rect = rulerRef.current.getBoundingClientRect();\n    const x = e.clientX - rect.left + scrollLeft;\n    const newValue = Math.max(0, Math.min(x, scaledWidth));\n\n    switch (dragging.type) {\n      case 'leftMargin':\n        onMarginChange('left', newValue / zoom);\n        break;\n      case 'rightMargin':\n        onMarginChange('right', (scaledWidth - newValue) / zoom);\n        break;\n      case 'firstLineIndent':\n        onIndentChange('firstLine', Math.max(0, newValue / zoom - margins.left));\n        break;\n      case 'hangingIndent':\n        onIndentChange('hanging', Math.max(0, newValue / zoom - margins.left));\n        break;\n      case 'leftIndent':\n        onIndentChange('left', Math.max(0, newValue / zoom - margins.left));\n        break;\n      case 'rightIndent':\n        onIndentChange('right', Math.max(0, (scaledWidth - newValue) / zoom - margins.right));\n        break;\n      case 'tabStop':\n        if (dragging.id) {\n          onTabStopUpdate(dragging.id, { position: newValue / zoom });\n        }\n        break;\n    }\n  }, [dragging, scrollLeft, scaledWidth, zoom, margins, onMarginChange, onIndentChange, onTabStopUpdate]);\n\n  const handleMouseUp = useCallback(() => {\n    setDragging(null);\n  }, []);\n\n  // Add global mouse event listeners when dragging\n  React.useEffect(() => {\n    if (dragging) {\n      window.addEventListener('mousemove', handleMouseMove);\n      window.addEventListener('mouseup', handleMouseUp);\n      return () => {\n        window.removeEventListener('mousemove', handleMouseMove);\n        window.removeEventListener('mouseup', handleMouseUp);\n      };\n    }\n  }, [dragging, handleMouseMove, handleMouseUp]);\n\n  // Handle double-click to add tab stop\n  const handleDoubleClick = useCallback((e: React.MouseEvent) => {\n    if (!rulerRef.current) return;\n    const rect = rulerRef.current.getBoundingClientRect();\n    const x = e.clientX - rect.left + scrollLeft;\n    const position = x / zoom;\n\n    // Only add tab stops within the content area (between margins)\n    if (position > margins.left && position < width - margins.right) {\n      onTabStopAdd(position, 'left');\n    }\n  }, [scrollLeft, zoom, margins, width, onTabStopAdd]);\n\n  // Handle right-click on tab stop to remove\n  const handleTabStopContextMenu = useCallback((e: React.MouseEvent, id: string) => {\n    e.preventDefault();\n    onTabStopRemove(id);\n  }, [onTabStopRemove]);\n\n  const leftMarginPos = margins.left * zoom;\n  const rightMarginPos = scaledWidth - margins.right * zoom;\n  const firstLineIndentPos = leftMarginPos + indents.firstLine * zoom;\n  const hangingIndentPos = leftMarginPos + indents.hanging * zoom;\n  const leftIndentPos = leftMarginPos + indents.left * zoom;\n  const rightIndentPos = rightMarginPos - indents.right * zoom;\n\n  return (\n    <div\n      ref={rulerRef}\n      className=\"relative bg-stone-100 border-b border-stone-300 select-none overflow-hidden\"\n      style={{\n        height: RULER_HEIGHT,\n        width: scaledWidth,\n        marginLeft: leftOffset,\n      }}\n      onDoubleClick={handleDoubleClick}\n    >\n      {/* Ruler background with content area highlight */}\n      <div\n        className=\"absolute top-0 bottom-0 bg-white\"\n        style={{\n          left: leftMarginPos,\n          right: scaledWidth - rightMarginPos,\n        }}\n      />\n\n      {/* Tick marks */}\n      <svg className=\"absolute inset-0\" style={{ width: scaledWidth, height: RULER_HEIGHT }}>\n        {ticks.map((tick, i) => (\n          <g key={i}>\n            <line\n              x1={tick.position}\n              y1={tick.type === 'major' ? 8 : 14}\n              x2={tick.position}\n              y2={RULER_HEIGHT}\n              stroke=\"#78716c\"\n              strokeWidth={tick.type === 'major' ? 1 : 0.5}\n            />\n            {tick.label && (\n              <text\n                x={tick.position}\n                y={7}\n                textAnchor=\"middle\"\n                fontSize=\"9\"\n                fill=\"#57534e\"\n                fontFamily=\"system-ui, sans-serif\"\n              >\n                {tick.label}\n              </text>\n            )}\n          </g>\n        ))}\n      </svg>\n\n      {/* Left margin marker */}\n      <div\n        className={`absolute top-0 cursor-ew-resize group ${dragging?.type === 'leftMargin' ? 'z-20' : 'z-10'}`}\n        style={{ left: leftMarginPos - 4 }}\n        onMouseDown={(e) => handleMouseDown(e, 'leftMargin', margins.left)}\n        onMouseEnter={() => setHoveredMarker('leftMargin')}\n        onMouseLeave={() => setHoveredMarker(null)}\n      >\n        <div className={`w-2 h-full transition-colors ${\n          hoveredMarker === 'leftMargin' || dragging?.type === 'leftMargin'\n            ? 'bg-blue-500'\n            : 'bg-blue-400'\n        }`} style={{ height: RULER_HEIGHT }} />\n        {(hoveredMarker === 'leftMargin' || dragging?.type === 'leftMargin') && (\n          <div className=\"absolute top-full left-1/2 -translate-x-1/2 mt-1 px-1.5 py-0.5 bg-stone-800 text-white text-[10px] rounded whitespace-nowrap z-30\">\n            Left Margin\n          </div>\n        )}\n      </div>\n\n      {/* Right margin marker */}\n      <div\n        className={`absolute top-0 cursor-ew-resize group ${dragging?.type === 'rightMargin' ? 'z-20' : 'z-10'}`}\n        style={{ left: rightMarginPos - 4 }}\n        onMouseDown={(e) => handleMouseDown(e, 'rightMargin', margins.right)}\n        onMouseEnter={() => setHoveredMarker('rightMargin')}\n        onMouseLeave={() => setHoveredMarker(null)}\n      >\n        <div className={`w-2 h-full transition-colors ${\n          hoveredMarker === 'rightMargin' || dragging?.type === 'rightMargin'\n            ? 'bg-blue-500'\n            : 'bg-blue-400'\n        }`} style={{ height: RULER_HEIGHT }} />\n        {(hoveredMarker === 'rightMargin' || dragging?.type === 'rightMargin') && (\n          <div className=\"absolute top-full left-1/2 -translate-x-1/2 mt-1 px-1.5 py-0.5 bg-stone-800 text-white text-[10px] rounded whitespace-nowrap z-30\">\n            Right Margin\n          </div>\n        )}\n      </div>\n\n      {/* First line indent marker (triangle pointing down) */}\n      <div\n        className={`absolute cursor-ew-resize ${dragging?.type === 'firstLineIndent' ? 'z-20' : 'z-10'}`}\n        style={{ left: firstLineIndentPos - 5, top: 2 }}\n        onMouseDown={(e) => handleMouseDown(e, 'firstLineIndent', indents.firstLine)}\n        onMouseEnter={() => setHoveredMarker('firstLineIndent')}\n        onMouseLeave={() => setHoveredMarker(null)}\n      >\n        <svg width=\"10\" height=\"8\" viewBox=\"0 0 10 8\">\n          <polygon\n            points=\"5,8 0,0 10,0\"\n            fill={hoveredMarker === 'firstLineIndent' || dragging?.type === 'firstLineIndent' ? '#22c55e' : '#4ade80'}\n          />\n        </svg>\n        {(hoveredMarker === 'firstLineIndent' || dragging?.type === 'firstLineIndent') && (\n          <div className=\"absolute top-full left-1/2 -translate-x-1/2 mt-1 px-1.5 py-0.5 bg-stone-800 text-white text-[10px] rounded whitespace-nowrap z-30\">\n            First Line Indent\n          </div>\n        )}\n      </div>\n\n      {/* Left indent / Hanging indent marker (triangle pointing up + rectangle) */}\n      <div\n        className={`absolute cursor-ew-resize ${dragging?.type === 'leftIndent' ? 'z-20' : 'z-10'}`}\n        style={{ left: leftIndentPos - 5, bottom: 2 }}\n        onMouseDown={(e) => handleMouseDown(e, 'leftIndent', indents.left)}\n        onMouseEnter={() => setHoveredMarker('leftIndent')}\n        onMouseLeave={() => setHoveredMarker(null)}\n      >\n        <svg width=\"10\" height=\"10\" viewBox=\"0 0 10 10\">\n          <polygon\n            points=\"5,0 0,8 10,8\"\n            fill={hoveredMarker === 'leftIndent' || dragging?.type === 'leftIndent' ? '#f97316' : '#fb923c'}\n          />\n          <rect\n            x=\"1\"\n            y=\"8\"\n            width=\"8\"\n            height=\"2\"\n            fill={hoveredMarker === 'leftIndent' || dragging?.type === 'leftIndent' ? '#f97316' : '#fb923c'}\n          />\n        </svg>\n        {(hoveredMarker === 'leftIndent' || dragging?.type === 'leftIndent') && (\n          <div className=\"absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-1.5 py-0.5 bg-stone-800 text-white text-[10px] rounded whitespace-nowrap z-30\">\n            Left Indent\n          </div>\n        )}\n      </div>\n\n      {/* Right indent marker */}\n      <div\n        className={`absolute cursor-ew-resize ${dragging?.type === 'rightIndent' ? 'z-20' : 'z-10'}`}\n        style={{ left: rightIndentPos - 5, bottom: 2 }}\n        onMouseDown={(e) => handleMouseDown(e, 'rightIndent', indents.right)}\n        onMouseEnter={() => setHoveredMarker('rightIndent')}\n        onMouseLeave={() => setHoveredMarker(null)}\n      >\n        <svg width=\"10\" height=\"10\" viewBox=\"0 0 10 10\">\n          <polygon\n            points=\"5,0 0,8 10,8\"\n            fill={hoveredMarker === 'rightIndent' || dragging?.type === 'rightIndent' ? '#f97316' : '#fb923c'}\n          />\n        </svg>\n        {(hoveredMarker === 'rightIndent' || dragging?.type === 'rightIndent') && (\n          <div className=\"absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-1.5 py-0.5 bg-stone-800 text-white text-[10px] rounded whitespace-nowrap z-30\">\n            Right Indent\n          </div>\n        )}\n      </div>\n\n      {/* Tab stops */}\n      {tabStops.map((tab) => {\n        const tabPos = tab.position * zoom;\n        return (\n          <div\n            key={tab.id}\n            className={`absolute cursor-ew-resize ${dragging?.id === tab.id ? 'z-20' : 'z-10'}`}\n            style={{ left: tabPos - 4, bottom: 2 }}\n            onMouseDown={(e) => handleMouseDown(e, 'tabStop', tab.position, tab.id)}\n            onContextMenu={(e) => handleTabStopContextMenu(e, tab.id)}\n            onMouseEnter={() => setHoveredMarker(`tab-${tab.id}`)}\n            onMouseLeave={() => setHoveredMarker(null)}\n          >\n            <TabStopIcon\n              type={tab.type}\n              isActive={hoveredMarker === `tab-${tab.id}` || dragging?.id === tab.id}\n            />\n            {(hoveredMarker === `tab-${tab.id}` || dragging?.id === tab.id) && (\n              <div className=\"absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-1.5 py-0.5 bg-stone-800 text-white text-[10px] rounded whitespace-nowrap z-30\">\n                {tab.type.charAt(0).toUpperCase() + tab.type.slice(1)} Tab\n              </div>\n            )}\n          </div>\n        );\n      })}\n\n      {/* Dragging line indicator */}\n      {dragging && (\n        <div\n          className=\"absolute top-0 bottom-0 w-px bg-blue-500 pointer-events-none z-30\"\n          style={{\n            left: (() => {\n              switch (dragging.type) {\n                case 'leftMargin': return margins.left * zoom;\n                case 'rightMargin': return scaledWidth - margins.right * zoom;\n                case 'firstLineIndent': return leftMarginPos + indents.firstLine * zoom;\n                case 'leftIndent': return leftMarginPos + indents.left * zoom;\n                case 'rightIndent': return rightMarginPos - indents.right * zoom;\n                case 'tabStop': {\n                  const tab = tabStops.find(t => t.id === dragging.id);\n                  return tab ? tab.position * zoom : 0;\n                }\n                default: return 0;\n              }\n            })(),\n          }}\n        />\n      )}\n    </div>\n  );\n}\n\n// Tab stop icon component\nfunction TabStopIcon({ type, isActive }: { type: TabStopType; isActive: boolean }) {\n  const color = isActive ? '#7c3aed' : '#a78bfa';\n\n  switch (type) {\n    case 'left':\n      return (\n        <svg width=\"8\" height=\"8\" viewBox=\"0 0 8 8\">\n          <path d=\"M0,0 L0,8 L8,8\" fill=\"none\" stroke={color} strokeWidth=\"2\" />\n        </svg>\n      );\n    case 'center':\n      return (\n        <svg width=\"8\" height=\"8\" viewBox=\"0 0 8 8\">\n          <path d=\"M4,0 L4,8 M0,8 L8,8\" fill=\"none\" stroke={color} strokeWidth=\"2\" />\n        </svg>\n      );\n    case 'right':\n      return (\n        <svg width=\"8\" height=\"8\" viewBox=\"0 0 8 8\">\n          <path d=\"M8,0 L8,8 L0,8\" fill=\"none\" stroke={color} strokeWidth=\"2\" />\n        </svg>\n      );\n    case 'decimal':\n      return (\n        <svg width=\"8\" height=\"8\" viewBox=\"0 0 8 8\">\n          <path d=\"M4,0 L4,8 M0,8 L8,8\" fill=\"none\" stroke={color} strokeWidth=\"2\" />\n          <circle cx=\"6\" cy=\"4\" r=\"1\" fill={color} />\n        </svg>\n      );\n  }\n}\n"
}

🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Explore codebase to understand existing structure",
      "status": "completed",
      "activeForm": "Exploring codebase structure"
    },
    {
      "content": "Plan implementation approach for document ruler feature",
      "status": "completed",
      "activeForm": "Planning implementation approach"
    },
    {
      "content": "Create ruler types and constants",
      "status": "completed",
      "activeForm": "Creating ruler types and constants"
    },
    {
      "content": "Create horizontal ruler component with tick marks",
      "status": "completed",
      "activeForm": "Creating horizontal ruler component"
    },
    {
      "content": "Create vertical ruler component with tick marks",
      "status": "in_progress",
      "activeForm": "Creating vertical ruler component"
    },
    {
      "content": "Implement draggable margin markers",
      "status": "completed",
      "activeForm": "Implementing draggable margin markers"
    },
    {
      "content": "Implement indent markers (first-line, hanging, left/right)",
      "status": "completed",
      "activeForm": "Implementing indent markers"
    },
    {
      "content": "Implement tab stop markers",
      "status": "completed",
      "activeForm": "Implementing tab stop markers"
    },
    {
      "content": "Create useRulerState hook for ruler state management",
      "status": "completed",
      "activeForm": "Creating useRulerState hook"
    },
    {
      "content": "Add ruler toggle button to toolbar",
      "status": "pending",
      "activeForm": "Adding ruler toggle button"
    },
    {
      "content": "Implement keyboard shortcut (Ctrl+Shift+R)",
      "status": "pending",
      "activeForm": "Implementing keyboard shortcut"
    },
    {
      "content": "Add session persistence for ruler visibility",
      "status": "completed",
      "activeForm": "Adding session persistence"
    },
    {
      "content": "Integrate ruler with editor component",
      "status": "pending",
      "activeForm": "Integrating ruler with editor"
    }
  ]
}
Now let me create the vertical ruler component:

🔧 Tool: Write
Input: {
  "file_path": "C:\\ppdo\\ppdo-next\\app\\(extra)\\canvas\\_components\\editor\\ruler\\VerticalRuler.tsx",
  "content": "// app/(extra)/canvas/_components/editor/ruler/VerticalRuler.tsx\n\n'use client';\n\nimport React, { useRef, useState, useCallback, useMemo } from 'react';\nimport { RulerState, RulerUnit, MarginSettings } from '../types';\nimport { RULER_WIDTH, POINTS_PER_INCH, CM_PER_INCH, HEADER_HEIGHT, FOOTER_HEIGHT } from '../constants';\n\ninterface VerticalRulerProps {\n  height: number;\n  rulerState: RulerState;\n  onMarginChange: (side: keyof MarginSettings, value: number) => void;\n  scrollTop?: number;\n  topOffset?: number;\n  showHeaderFooter?: boolean;\n}\n\n// Convert pixels to display units\nconst pixelsToUnit = (pixels: number, unit: RulerUnit, zoom: number): number => {\n  const actualPixels = pixels / zoom;\n  switch (unit) {\n    case 'inches':\n      return actualPixels / POINTS_PER_INCH;\n    case 'cm':\n      return (actualPixels / POINTS_PER_INCH) * CM_PER_INCH;\n    case 'pixels':\n      return actualPixels;\n  }\n};\n\n// Get tick interval based on unit and zoom\nconst getTickInterval = (unit: RulerUnit, zoom: number): { major: number; minor: number; label: number } => {\n  switch (unit) {\n    case 'inches':\n      if (zoom >= 2) {\n        return { major: POINTS_PER_INCH / 4, minor: POINTS_PER_INCH / 16, label: POINTS_PER_INCH / 4 };\n      } else if (zoom >= 1) {\n        return { major: POINTS_PER_INCH / 2, minor: POINTS_PER_INCH / 8, label: POINTS_PER_INCH / 2 };\n      } else {\n        return { major: POINTS_PER_INCH, minor: POINTS_PER_INCH / 4, label: POINTS_PER_INCH };\n      }\n    case 'cm':\n      const cmToPixels = POINTS_PER_INCH / CM_PER_INCH;\n      if (zoom >= 2) {\n        return { major: cmToPixels / 2, minor: cmToPixels / 10, label: cmToPixels / 2 };\n      } else if (zoom >= 1) {\n        return { major: cmToPixels, minor: cmToPixels / 5, label: cmToPixels };\n      } else {\n        return { major: cmToPixels * 2, minor: cmToPixels / 2, label: cmToPixels * 2 };\n      }\n    case 'pixels':\n      if (zoom >= 2) {\n        return { major: 50, minor: 10, label: 50 };\n      } else if (zoom >= 1) {\n        return { major: 100, minor: 25, label: 100 };\n      } else {\n        return { major: 200, minor: 50, label: 200 };\n      }\n  }\n};\n\nexport default function VerticalRuler({\n  height,\n  rulerState,\n  onMarginChange,\n  scrollTop = 0,\n  topOffset = 0,\n  showHeaderFooter = true,\n}: VerticalRulerProps) {\n  const rulerRef = useRef<HTMLDivElement>(null);\n  const [dragging, setDragging] = useState<{\n    type: 'topMargin' | 'bottomMargin';\n    startY: number;\n    startValue: number;\n  } | null>(null);\n  const [hoveredMarker, setHoveredMarker] = useState<string | null>(null);\n\n  const { unit, zoom, margins } = rulerState;\n\n  // Calculate total height including header and footer\n  const headerHeight = showHeaderFooter ? HEADER_HEIGHT * zoom : 0;\n  const footerHeight = showHeaderFooter ? FOOTER_HEIGHT * zoom : 0;\n  const bodyHeight = height * zoom;\n  const totalHeight = headerHeight + bodyHeight + footerHeight;\n\n  const tickInterval = getTickInterval(unit, zoom);\n\n  // Generate tick marks for the body area only (starting from 0 at the top of body content)\n  const ticks = useMemo(() => {\n    const result: { position: number; type: 'major' | 'minor'; label?: string }[] = [];\n    const majorInterval = tickInterval.major * zoom;\n    const minorInterval = tickInterval.minor * zoom;\n    const labelInterval = tickInterval.label * zoom;\n\n    for (let pos = 0; pos <= bodyHeight; pos += minorInterval) {\n      const isMajor = Math.abs(pos % majorInterval) < 0.1 || Math.abs((pos % majorInterval) - majorInterval) < 0.1;\n      const isLabel = Math.abs(pos % labelInterval) < 0.1 || Math.abs((pos % labelInterval) - labelInterval) < 0.1;\n\n      let label: string | undefined;\n      if (isLabel && pos > 0) {\n        const value = pixelsToUnit(pos, unit, zoom);\n        if (unit === 'pixels') {\n          label = Math.round(value).toString();\n        } else {\n          label = value.toFixed(unit === 'inches' ? 1 : 0);\n        }\n      }\n\n      result.push({\n        position: headerHeight + pos,\n        type: isMajor ? 'major' : 'minor',\n        label,\n      });\n    }\n    return result;\n  }, [bodyHeight, headerHeight, tickInterval, unit, zoom]);\n\n  const handleMouseDown = useCallback((\n    e: React.MouseEvent,\n    type: 'topMargin' | 'bottomMargin',\n    startValue: number\n  ) => {\n    e.preventDefault();\n    e.stopPropagation();\n    setDragging({ type, startY: e.clientY, startValue });\n  }, []);\n\n  const handleMouseMove = useCallback((e: MouseEvent) => {\n    if (!dragging || !rulerRef.current) return;\n\n    const rect = rulerRef.current.getBoundingClientRect();\n    const y = e.clientY - rect.top + scrollTop - headerHeight;\n    const newValue = Math.max(0, Math.min(y, bodyHeight));\n\n    switch (dragging.type) {\n      case 'topMargin':\n        onMarginChange('top', newValue / zoom);\n        break;\n      case 'bottomMargin':\n        onMarginChange('bottom', (bodyHeight - newValue) / zoom);\n        break;\n    }\n  }, [dragging, scrollTop, headerHeight, bodyHeight, zoom, onMarginChange]);\n\n  const handleMouseUp = useCallback(() => {\n    setDragging(null);\n  }, []);\n\n  // Add global mouse event listeners when dragging\n  React.useEffect(() => {\n    if (dragging) {\n      window.addEventListener('mousemove', handleMouseMove);\n      window.addEventListener('mouseup', handleMouseUp);\n      return () => {\n        window.removeEventListener('mousemove', handleMouseMove);\n        window.removeEventListener('mouseup', handleMouseUp);\n      };\n    }\n  }, [dragging, handleMouseMove, handleMouseUp]);\n\n  const topMarginPos = headerHeight + margins.top * zoom;\n  const bottomMarginPos = headerHeight + bodyHeight - margins.bottom * zoom;\n\n  return (\n    <div\n      ref={rulerRef}\n      className=\"relative bg-stone-100 border-r border-stone-300 select-none overflow-hidden\"\n      style={{\n        width: RULER_WIDTH,\n        height: totalHeight,\n        marginTop: topOffset,\n      }}\n    >\n      {/* Header section background */}\n      {showHeaderFooter && (\n        <div\n          className=\"absolute left-0 right-0 bg-stone-200/50\"\n          style={{ top: 0, height: headerHeight }}\n        />\n      )}\n\n      {/* Content area highlight (between margins) */}\n      <div\n        className=\"absolute left-0 right-0 bg-white\"\n        style={{\n          top: topMarginPos,\n          bottom: totalHeight - bottomMarginPos,\n        }}\n      />\n\n      {/* Footer section background */}\n      {showHeaderFooter && (\n        <div\n          className=\"absolute left-0 right-0 bg-stone-200/50\"\n          style={{ top: headerHeight + bodyHeight, height: footerHeight }}\n        />\n      )}\n\n      {/* Tick marks */}\n      <svg className=\"absolute inset-0\" style={{ width: RULER_WIDTH, height: totalHeight }}>\n        {ticks.map((tick, i) => (\n          <g key={i}>\n            <line\n              x1={tick.type === 'major' ? 8 : 14}\n              y1={tick.position}\n              x2={RULER_WIDTH}\n              y2={tick.position}\n              stroke=\"#78716c\"\n              strokeWidth={tick.type === 'major' ? 1 : 0.5}\n            />\n            {tick.label && (\n              <text\n                x={6}\n                y={tick.position}\n                textAnchor=\"middle\"\n                dominantBaseline=\"middle\"\n                fontSize=\"9\"\n                fill=\"#57534e\"\n                fontFamily=\"system-ui, sans-serif\"\n                transform={`rotate(-90, 6, ${tick.position})`}\n              >\n                {tick.label}\n              </text>\n            )}\n          </g>\n        ))}\n\n        {/* Header/Footer separators */}\n        {showHeaderFooter && (\n          <>\n            <line\n              x1={0}\n              y1={headerHeight}\n              x2={RULER_WIDTH}\n              y2={headerHeight}\n              stroke=\"#a8a29e\"\n              strokeWidth={1}\n              strokeDasharray=\"2,2\"\n            />\n            <line\n              x1={0}\n              y1={headerHeight + bodyHeight}\n              x2={RULER_WIDTH}\n              y2={headerHeight + bodyHeight}\n              stroke=\"#a8a29e\"\n              strokeWidth={1}\n              strokeDasharray=\"2,2\"\n            />\n          </>\n        )}\n      </svg>\n\n      {/* Top margin marker */}\n      <div\n        className={`absolute left-0 right-0 cursor-ns-resize ${dragging?.type === 'topMargin' ? 'z-20' : 'z-10'}`}\n        style={{ top: topMarginPos - 4 }}\n        onMouseDown={(e) => handleMouseDown(e, 'topMargin', margins.top)}\n        onMouseEnter={() => setHoveredMarker('topMargin')}\n        onMouseLeave={() => setHoveredMarker(null)}\n      >\n        <div className={`h-2 transition-colors ${\n          hoveredMarker === 'topMargin' || dragging?.type === 'topMargin'\n            ? 'bg-blue-500'\n            : 'bg-blue-400'\n        }`} />\n        {(hoveredMarker === 'topMargin' || dragging?.type === 'topMargin') && (\n          <div className=\"absolute left-full top-1/2 -translate-y-1/2 ml-1 px-1.5 py-0.5 bg-stone-800 text-white text-[10px] rounded whitespace-nowrap z-30\">\n            Top Margin\n          </div>\n        )}\n      </div>\n\n      {/* Bottom margin marker */}\n      <div\n        className={`absolute left-0 right-0 cursor-ns-resize ${dragging?.type === 'bottomMargin' ? 'z-20' : 'z-10'}`}\n        style={{ top: bottomMarginPos - 4 }}\n        onMouseDown={(e) => handleMouseDown(e, 'bottomMargin', margins.bottom)}\n        onMouseEnter={() => setHoveredMarker('bottomMargin')}\n        onMouseLeave={() => setHoveredMarker(null)}\n      >\n        <div className={`h-2 transition-colors ${\n          hoveredMarker === 'bottomMargin' || dragging?.type === 'bottomMargin'\n            ? 'bg-blue-500'\n            : 'bg-blue-400'\n        }`} />\n        {(hoveredMarker === 'bottomMargin' || dragging?.type === 'bottomMargin') && (\n          <div className=\"absolute left-full top-1/2 -translate-y-1/2 ml-1 px-1.5 py-0.5 bg-stone-800 text-white text-[10px] rounded whitespace-nowrap z-30\">\n            Bottom Margin\n          </div>\n        )}\n      </div>\n\n      {/* Dragging line indicator */}\n      {dragging && (\n        <div\n          className=\"absolute left-0 right-0 h-px bg-blue-500 pointer-events-none z-30\"\n          style={{\n            top: dragging.type === 'topMargin'\n              ? topMarginPos\n              : bottomMarginPos,\n          }}\n        />\n      )}\n    </div>\n  );\n}\n"
}
Now let me create an index file for the ruler components:

🔧 Tool: Write
Input: {
  "file_path": "C:\\ppdo\\ppdo-next\\app\\(extra)\\canvas\\_components\\editor\\ruler\\index.ts",
  "content": "// app/(extra)/canvas/_components/editor/ruler/index.ts\n\nexport { default as HorizontalRuler } from './HorizontalRuler';\nexport { default as VerticalRuler } from './VerticalRuler';\n"
}

🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Explore codebase to understand existing structure",
      "status": "completed",
      "activeForm": "Exploring codebase structure"
    },
    {
      "content": "Plan implementation approach for document ruler feature",
      "status": "completed",
      "activeForm": "Planning implementation approach"
    },
    {
      "content": "Create ruler types and constants",
      "status": "completed",
      "activeForm": "Creating ruler types and constants"
    },
    {
      "content": "Create horizontal ruler component with tick marks",
      "status": "completed",
      "activeForm": "Creating horizontal ruler component"
    },
    {
      "content": "Create vertical ruler component with tick marks",
      "status": "completed",
      "activeForm": "Creating vertical ruler component"
    },
    {
      "content": "Implement draggable margin markers",
      "status": "completed",
      "activeForm": "Implementing draggable margin markers"
    },
    {
      "content": "Implement indent markers (first-line, hanging, left/right)",
      "status": "completed",
      "activeForm": "Implementing indent markers"
    },
    {
      "content": "Implement tab stop markers",
      "status": "completed",
      "activeForm": "Implementing tab stop markers"
    },
    {
      "content": "Create useRulerState hook for ruler state management",
      "status": "completed",
      "activeForm": "Creating useRulerState hook"
    },
    {
      "content": "Add ruler toggle button to toolbar",
      "status": "in_progress",
      "activeForm": "Adding ruler toggle button"
    },
    {
      "content": "Implement keyboard shortcut (Ctrl+Shift+R)",
      "status": "pending",
      "activeForm": "Implementing keyboard shortcut"
    },
    {
      "content": "Add session persistence for ruler visibility",
      "status": "completed",
      "activeForm": "Adding session persistence"
    },
    {
      "content": "Integrate ruler with editor component",
      "status": "pending",
      "activeForm": "Integrating ruler with editor"
    }
  ]
}
Now let me update the toolbar to add the ruler toggle button. First, let me check the icon imports:

🔧 Tool: Edit
Input: {
  "file_path": "C:\\ppdo\\ppdo-next\\app\\(extra)\\canvas\\_components\\editor\\toolbar.tsx",
  "old_string": "import { Bold, Italic, Underline, Plus, Printer, FileDown, X } from 'lucide-react';",
  "new_string": "import { Bold, Italic, Underline, Plus, Printer, FileDown, X, Ruler } from 'lucide-react';"
}
Now let me add the ruler-related props and button to the toolbar:

🔧 Tool: Edit
Input: {
  "file_path": "C:\\ppdo\\ppdo-next\\app\\(extra)\\canvas\\_components\\editor\\toolbar.tsx",
  "old_string": "interface ToolbarProps {\n  selectedElement?: CanvasElement;\n  onUpdateElement?: (updates: Partial<CanvasElement>) => void;\n  onAddText: () => void;\n  pageSize?: 'A4' | 'Short' | 'Long';\n  orientation?: 'portrait' | 'landscape';\n  onPageSizeChange?: (size: 'A4' | 'Short' | 'Long') => void;\n  onOrientationChange?: (orientation: 'portrait' | 'landscape') => void;\n  onPrint?: () => void;\n  activeSection: ActiveSection;\n  headerBackgroundColor: string;\n  footerBackgroundColor: string;\n  pageBackgroundColor: string;\n  onHeaderBackgroundChange: (color: string) => void;\n  onFooterBackgroundChange: (color: string) => void;\n  onPageBackgroundChange: (color: string) => void;\n  pages: Page[];\n  header: HeaderFooter;\n  footer: HeaderFooter;\n  isEditorMode?: boolean;\n}",
  "new_string": "interface ToolbarProps {\n  selectedElement?: CanvasElement;\n  onUpdateElement?: (updates: Partial<CanvasElement>) => void;\n  onAddText: () => void;\n  pageSize?: 'A4' | 'Short' | 'Long';\n  orientation?: 'portrait' | 'landscape';\n  onPageSizeChange?: (size: 'A4' | 'Short' | 'Long') => void;\n  onOrientationChange?: (orientation: 'portrait' | 'landscape') => void;\n  onPrint?: () => void;\n  activeSection: ActiveSection;\n  headerBackgroundColor: string;\n  footerBackgroundColor: string;\n  pageBackgroundColor: string;\n  onHeaderBackgroundChange: (color: string) => void;\n  onFooterBackgroundChange: (color: string) => void;\n  onPageBackgroundChange: (color: string) => void;\n  pages: Page[];\n  header: HeaderFooter;\n  footer: HeaderFooter;\n  isEditorMode?: boolean;\n  rulerVisible?: boolean;\n  onToggleRuler?: () => void;\n}"
}

🔧 Tool: Edit
Input: {
  "file_path": "C:\\ppdo\\ppdo-next\\app\\(extra)\\canvas\\_components\\editor\\toolbar.tsx",
  "old_string": "  pages,\n  header,\n  footer,\n  isEditorMode = true,\n}: ToolbarProps) {",
  "new_string": "  pages,\n  header,\n  footer,\n  isEditorMode = true,\n  rulerVisible = false,\n  onToggleRuler,\n}: ToolbarProps) {"
}
Now let me add the ruler toggle button in the toolbar. I'll add it near the page size controls:

🔧 Tool: Edit
Input: {
  "file_path": "C:\\ppdo\\ppdo-next\\app\\(extra)\\canvas\\_components\\editor\\toolbar.tsx",
  "old_string": "            <Select value={orientation} onValueChange={onOrientationChange}>\n              <SelectTrigger className=\"w-28 h-8 text-xs bg-white\">\n                <SelectValue placeholder=\"Orientation\" />\n              </SelectTrigger>\n              <SelectContent>\n                <SelectItem value=\"portrait\">Portrait</SelectItem>\n                <SelectItem value=\"landscape\">Landscape</SelectItem>\n              </SelectContent>\n            </Select>\n\n            {isTextElement && (",
  "new_string": "            <Select value={orientation} onValueChange={onOrientationChange}>\n              <SelectTrigger className=\"w-28 h-8 text-xs bg-white\">\n                <SelectValue placeholder=\"Orientation\" />\n              </SelectTrigger>\n              <SelectContent>\n                <SelectItem value=\"portrait\">Portrait</SelectItem>\n                <SelectItem value=\"landscape\">Landscape</SelectItem>\n              </SelectContent>\n            </Select>\n\n            {onToggleRuler && (\n              <>\n                <Separator orientation=\"vertical\" className=\"h-5\" />\n                <Button\n                  onClick={onToggleRuler}\n                  size=\"sm\"\n                  variant=\"outline\"\n                  className={`gap-1.5 h-8 text-xs ${rulerVisible ? 'bg-stone-200' : 'bg-white'}`}\n                  title=\"Toggle Ruler (Ctrl+Shift+R)\"\n                >\n                  <Ruler className=\"w-3.5 h-3.5\" />\n                  Ruler\n                </Button>\n              </>\n            )}\n\n            {isTextElement && ("
}

🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Explore codebase to understand existing structure",
      "status": "completed",
      "activeForm": "Exploring codebase structure"
    },
    {
      "content": "Plan implementation approach for document ruler feature",
      "status": "completed",
      "activeForm": "Planning implementation approach"
    },
    {
      "content": "Create ruler types and constants",
      "status": "completed",
      "activeForm": "Creating ruler types and constants"
    },
    {
      "content": "Create horizontal ruler component with tick marks",
      "status": "completed",
      "activeForm": "Creating horizontal ruler component"
    },
    {
      "content": "Create vertical ruler component with tick marks",
      "status": "completed",
      "activeForm": "Creating vertical ruler component"
    },
    {
      "content": "Implement draggable margin markers",
      "status": "completed",
      "activeForm": "Implementing draggable margin markers"
    },
    {
      "content": "Implement indent markers (first-line, hanging, left/right)",
      "status": "completed",
      "activeForm": "Implementing indent markers"
    },
    {
      "content": "Implement tab stop markers",
      "status": "completed",
      "activeForm": "Implementing tab stop markers"
    },
    {
      "content": "Create useRulerState hook for ruler state management",
      "status": "completed",
      "activeForm": "Creating useRulerState hook"
    },
    {
      "content": "Add ruler toggle button to toolbar",
      "status": "completed",
      "activeForm": "Adding ruler toggle button"
    },
    {
      "content": "Implement keyboard shortcut (Ctrl+Shift+R)",
      "status": "in_progress",
      "activeForm": "Implementing keyboard shortcut"
    },
    {
      "content": "Add session persistence for ruler visibility",
      "status": "completed",
      "activeForm": "Adding session persistence"
    },
    {
      "content": "Integrate ruler with editor component",
      "status": "pending",
      "activeForm": "Integrating ruler with editor"
    }
  ]
}
Now let me update the useKeyboard hook to add the Ctrl+Shift+R shortcut:

🔧 Tool: Edit
Input: {
  "file_path": "C:\\ppdo\\ppdo-next\\app\\(extra)\\canvas\\_components\\editor\\hooks\\useKeyboard.ts",
  "old_string": "// app/(extra)/canvas/_components/editor/hooks/useKeyboard.ts\n\nimport { useEffect } from 'react';\n\ninterface UseKeyboardProps {\n  selectedElementId: string | null;\n  isEditingElementId: string | null;\n  onDeleteElement: (id: string) => void;\n}\n\nexport const useKeyboard = ({\n  selectedElementId,\n  isEditingElementId,\n  onDeleteElement,\n}: UseKeyboardProps) => {\n  useEffect(() => {\n    const handleKeyDown = (e: KeyboardEvent) => {\n      if (isEditingElementId) return;\n      \n      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElementId) {\n        e.preventDefault();\n        onDeleteElement(selectedElementId);\n      }\n    };\n\n    window.addEventListener('keydown', handleKeyDown);\n    return () => window.removeEventListener('keydown', handleKeyDown);\n  }, [isEditingElementId, selectedElementId, onDeleteElement]);\n};",
  "new_string": "// app/(extra)/canvas/_components/editor/hooks/useKeyboard.ts\n\nimport { useEffect } from 'react';\n\ninterface UseKeyboardProps {\n  selectedElementId: string | null;\n  isEditingElementId: string | null;\n  onDeleteElement: (id: string) => void;\n  onToggleRuler?: () => void;\n}\n\nexport const useKeyboard = ({\n  selectedElementId,\n  isEditingElementId,\n  onDeleteElement,\n  onToggleRuler,\n}: UseKeyboardProps) => {\n  useEffect(() => {\n    const handleKeyDown = (e: KeyboardEvent) => {\n      // Toggle ruler with Ctrl+Shift+R\n      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'r') {\n        e.preventDefault();\n        onToggleRuler?.();\n        return;\n      }\n\n      if (isEditingElementId) return;\n\n      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElementId) {\n        e.preventDefault();\n        onDeleteElement(selectedElementId);\n      }\n    };\n\n    window.addEventListener('keydown', handleKeyDown);\n    return () => window.removeEventListener('keydown', handleKeyDown);\n  }, [isEditingElementId, selectedElementId, onDeleteElement, onToggleRuler]);\n};"
}

🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Explore codebase to understand existing structure",
      "status": "completed",
      "activeForm": "Exploring codebase structure"
    },
    {
      "content": "Plan implementation approach for document ruler feature",
      "status": "completed",
      "activeForm": "Planning implementation approach"
    },
    {
      "content": "Create ruler types and constants",
      "status": "completed",
      "activeForm": "Creating ruler types and constants"
    },
    {
      "content": "Create horizontal ruler component with tick marks",
      "status": "completed",
      "activeForm": "Creating horizontal ruler component"
    },
    {
      "content": "Create vertical ruler component with tick marks",
      "status": "completed",
      "activeForm": "Creating vertical ruler component"
    },
    {
      "content": "Implement draggable margin markers",
      "status": "completed",
      "activeForm": "Implementing draggable margin markers"
    },
    {
      "content": "Implement indent markers (first-line, hanging, left/right)",
      "status": "completed",
      "activeForm": "Implementing indent markers"
    },
    {
      "content": "Implement tab stop markers",
      "status": "completed",
      "activeForm": "Implementing tab stop markers"
    },
    {
      "content": "Create useRulerState hook for ruler state management",
      "status": "completed",
      "activeForm": "Creating useRulerState hook"
    },
    {
      "content": "Add ruler toggle button to toolbar",
      "status": "completed",
      "activeForm": "Adding ruler toggle button"
    },
    {
      "content": "Implement keyboard shortcut (Ctrl+Shift+R)",
      "status": "completed",
      "activeForm": "Implementing keyboard shortcut"
    },
    {
      "content": "Add session persistence for ruler visibility",
      "status": "completed",
      "activeForm": "Adding session persistence"
    },
    {
      "content": "Integrate ruler with editor component",
      "status": "in_progress",
      "activeForm": "Integrating ruler with editor"
    }
  ]
}
Now let me integrate the ruler with the main editor component. This is the most important step:

🔧 Tool: Edit
Input: {
  "file_path": "C:\\ppdo\\ppdo-next\\app\\(extra)\\canvas\\_components\\editor.tsx",
  "old_string": "// app/(extra)/canvas/_components/editor.tsx (UPDATED - ADD onClose PROP)\n\n'use client';\n\nimport { useState } from 'react';\nimport { Toaster } from 'sonner';\nimport { printAllPages } from '@/lib/print';\nimport { Button } from '@/components/ui/button';\nimport { X } from 'lucide-react';\nimport Toolbar from './editor/toolbar';\nimport Canvas from './editor/canvas';\nimport PagePanel from './editor/page-panel';\nimport BottomPageControls from './editor/bottom-page-controls';\nimport LeftSidebar from './editor/left-sidebar/LeftSidebar';\nimport { useEditorState } from './editor/hooks/useEditorState';\nimport { useClipboard } from './editor/hooks/useClipboard';\nimport { useKeyboard } from './editor/hooks/useKeyboard';\nimport { useStorage, useSaveStorage } from './editor/hooks/useStorage';\nimport { createNewPage } from './editor/utils';\nimport type { UploadedImage } from './editor/types/upload';\nexport type { TextElement, ImageElement, CanvasElement, Page } from './editor/types';",
  "new_string": "// app/(extra)/canvas/_components/editor.tsx (UPDATED - ADD RULER FEATURE)\n\n'use client';\n\nimport { useState, useRef } from 'react';\nimport { Toaster } from 'sonner';\nimport { printAllPages } from '@/lib/print';\nimport { Button } from '@/components/ui/button';\nimport { X } from 'lucide-react';\nimport Toolbar from './editor/toolbar';\nimport Canvas from './editor/canvas';\nimport PagePanel from './editor/page-panel';\nimport BottomPageControls from './editor/bottom-page-controls';\nimport LeftSidebar from './editor/left-sidebar/LeftSidebar';\nimport { HorizontalRuler, VerticalRuler } from './editor/ruler';\nimport { useEditorState } from './editor/hooks/useEditorState';\nimport { useClipboard } from './editor/hooks/useClipboard';\nimport { useKeyboard } from './editor/hooks/useKeyboard';\nimport { useStorage, useSaveStorage } from './editor/hooks/useStorage';\nimport { useRulerState } from './editor/hooks/useRulerState';\nimport { createNewPage } from './editor/utils';\nimport { getPageDimensions, RULER_WIDTH, RULER_HEIGHT } from './editor/constants';\nimport type { UploadedImage } from './editor/types/upload';\nexport type { TextElement, ImageElement, CanvasElement, Page } from './editor/types';"
}
Now let me add the useRulerState hook and update the useKeyboard call:

🔧 Tool: Edit
Input: {
  "file_path": "C:\\ppdo\\ppdo-next\\app\\(extra)\\canvas\\_components\\editor.tsx",
  "old_string": "  const [activeSection, setActiveSection] = useState<ActiveSection>('page');\n\n  const {",
  "new_string": "  const [activeSection, setActiveSection] = useState<ActiveSection>('page');\n  const [scrollLeft, setScrollLeft] = useState(0);\n  const [scrollTop, setScrollTop] = useState(0);\n  const canvasScrollRef = useRef<HTMLDivElement>(null);\n\n  const {\n    rulerState,\n    toggleRulerVisibility,\n    updateMargin,\n    updateIndent,\n    addTabStop,\n    updateTabStop,\n    removeTabStop,\n  } = useRulerState();\n\n  const {"
}

🔧 Tool: Edit
Input: {
  "file_path": "C:\\ppdo\\ppdo-next\\app\\(extra)\\canvas\\_components\\editor.tsx",
  "old_string": "  useKeyboard({\n    selectedElementId,\n    isEditingElementId,\n    onDeleteElement: deleteElement,\n  });",
  "new_string": "  useKeyboard({\n    selectedElementId,\n    isEditingElementId,\n    onDeleteElement: deleteElement,\n    onToggleRuler: toggleRulerVisibility,\n  });"
}
Now let me update the Toolbar component to include the ruler props:

🔧 Tool: Edit
Input: {
  "file_path": "C:\\ppdo\\ppdo-next\\app\\(extra)\\canvas\\_components\\editor.tsx",
  "old_string": "            <Toolbar\n              selectedElement={selectedElement}\n              onUpdateElement={selectedElement ? (updates) => updateElement(selectedElement.id, updates) : undefined}\n              onAddText={() => addText(activeSection)}\n              pageSize={currentPage.size}\n              orientation={currentPage.orientation}\n              onPageSizeChange={changePageSize}\n              onOrientationChange={changeOrientation}\n              onPrint={() => printAllPages(pages, header, footer)}\n              activeSection={activeSection}\n              headerBackgroundColor={header.backgroundColor || '#ffffff'}\n              footerBackgroundColor={footer.backgroundColor || '#ffffff'}\n              pageBackgroundColor={currentPage.backgroundColor || '#ffffff'}\n              onHeaderBackgroundChange={updateHeaderBackground}\n              onFooterBackgroundChange={updateFooterBackground}\n              onPageBackgroundChange={updatePageBackground}\n              pages={pages}\n              header={header}\n              footer={footer}\n            />",
  "new_string": "            <Toolbar\n              selectedElement={selectedElement}\n              onUpdateElement={selectedElement ? (updates) => updateElement(selectedElement.id, updates) : undefined}\n              onAddText={() => addText(activeSection)}\n              pageSize={currentPage.size}\n              orientation={currentPage.orientation}\n              onPageSizeChange={changePageSize}\n              onOrientationChange={changeOrientation}\n              onPrint={() => printAllPages(pages, header, footer)}\n              activeSection={activeSection}\n              headerBackgroundColor={header.backgroundColor || '#ffffff'}\n              footerBackgroundColor={footer.backgroundColor || '#ffffff'}\n              pageBackgroundColor={currentPage.backgroundColor || '#ffffff'}\n              onHeaderBackgroundChange={updateHeaderBackground}\n              onFooterBackgroundChange={updateFooterBackground}\n              onPageBackgroundChange={updatePageBackground}\n              pages={pages}\n              header={header}\n              footer={footer}\n              rulerVisible={rulerState.visible}\n              onToggleRuler={toggleRulerVisibility}\n            />"
}
Now let me update the main canvas area to include the rulers. This is the critical part:

🔧 Tool: Edit
Input: {
  "file_path": "C:\\ppdo\\ppdo-next\\app\\(extra)\\canvas\\_components\\editor.tsx",
  "old_string": "        {/* Main Canvas Area */}\n        <div className=\"flex-1 flex flex-row overflow-hidden bg-stone-50 min-w-0\">\n          <div className=\"flex-1 flex flex-col overflow-hidden min-w-0\">\n            <div className=\"flex-1 overflow-y-auto overflow-x-auto flex items-start justify-center pt-4 pb-16 px-8 bg-stone-50\">\n              <Canvas",
  "new_string": "        {/* Main Canvas Area */}\n        <div className=\"flex-1 flex flex-row overflow-hidden bg-stone-50 min-w-0\">\n          <div className=\"flex-1 flex flex-col overflow-hidden min-w-0\">\n            <div\n              ref={canvasScrollRef}\n              className=\"flex-1 overflow-y-auto overflow-x-auto flex items-start justify-center pt-4 pb-16 px-8 bg-stone-50\"\n              onScroll={(e) => {\n                const target = e.target as HTMLDivElement;\n                setScrollLeft(target.scrollLeft);\n                setScrollTop(target.scrollTop);\n              }}\n            >\n              {/* Canvas with Rulers */}\n              <div className=\"relative\">\n                {/* Corner box when both rulers are visible */}\n                {rulerState.visible && rulerState.showVertical && (\n                  <div\n                    className=\"absolute bg-stone-200 border-r border-b border-stone-300 z-20\"\n                    style={{\n                      width: RULER_WIDTH,\n                      height: RULER_HEIGHT,\n                      left: 0,\n                      top: 0,\n                    }}\n                  />\n                )}\n\n                {/* Horizontal Ruler */}\n                {rulerState.visible && (\n                  <div\n                    className=\"sticky top-0 z-10\"\n                    style={{\n                      marginLeft: rulerState.showVertical ? RULER_WIDTH : 0,\n                    }}\n                  >\n                    <HorizontalRuler\n                      width={getPageDimensions(currentPage.size, currentPage.orientation).width}\n                      rulerState={rulerState}\n                      onMarginChange={updateMargin}\n                      onIndentChange={updateIndent}\n                      onTabStopAdd={addTabStop}\n                      onTabStopUpdate={updateTabStop}\n                      onTabStopRemove={removeTabStop}\n                      scrollLeft={scrollLeft}\n                    />\n                  </div>\n                )}\n\n                <div className=\"flex\">\n                  {/* Vertical Ruler */}\n                  {rulerState.visible && rulerState.showVertical && (\n                    <div className=\"sticky left-0 z-10\">\n                      <VerticalRuler\n                        height={getPageDimensions(currentPage.size, currentPage.orientation).height - 140}\n                        rulerState={rulerState}\n                        onMarginChange={updateMargin}\n                        scrollTop={scrollTop}\n                        showHeaderFooter={true}\n                      />\n                    </div>\n                  )}\n\n                  {/* Canvas */}\n                  <Canvas"
}

🔧 Tool: Edit
Input: {
  "file_path": "C:\\ppdo\\ppdo-next\\app\\(extra)\\canvas\\_components\\editor.tsx",
  "old_string": "              <Canvas\n                page={currentPage}\n                selectedElementId={selectedElementId}\n                onSelectElement={setSelectedElementId}\n                onUpdateElement={updateElement}\n                onDeleteElement={deleteElement}\n                isEditingElementId={isEditingElementId}\n                onEditingChange={setIsEditingElementId}\n                header={header}\n                footer={footer}\n                pageNumber={currentPageIndex + 1}\n                totalPages={pages.length}\n                activeSection={activeSection}\n                onActiveSectionChange={setActiveSection}\n                onImageDropped={handleImageSelect}\n              />\n            </div>",
  "new_string": "                  <Canvas\n                    page={currentPage}\n                    selectedElementId={selectedElementId}\n                    onSelectElement={setSelectedElementId}\n                    onUpdateElement={updateElement}\n                    onDeleteElement={deleteElement}\n                    isEditingElementId={isEditingElementId}\n                    onEditingChange={setIsEditingElementId}\n                    header={header}\n                    footer={footer}\n                    pageNumber={currentPageIndex + 1}\n                    totalPages={pages.length}\n                    activeSection={activeSection}\n                    onActiveSectionChange={setActiveSection}\n                    onImageDropped={handleImageSelect}\n                  />\n                </div>\n              </div>\n            </div>"
}
Let me verify the editor.tsx file is correct by reading it:

🔧 Tool: Read
Input: {
  "file_path": "C:\\ppdo\\ppdo-next\\app\\(extra)\\canvas\\_components\\editor.tsx"
}
I notice the indentation of the Canvas component is off. Let me fix that:

🔧 Tool: Edit
Input: {
  "file_path": "C:\\ppdo\\ppdo-next\\app\\(extra)\\canvas\\_components\\editor.tsx",
  "old_string": "                  {/* Canvas */}\n                      <Canvas\n                    page={currentPage}",
  "new_string": "                  {/* Canvas */}\n                  <Canvas\n                    page={currentPage}"
}
Now let me run a type check to see if there are any errors:

🔧 Tool: Bash
Input: {
  "command": "cd /c/ppdo/ppdo-next && npx tsc --noEmit 2>&1 | head -100",
  "description": "Run TypeScript type check",
  "timeout": 120000
}
The type check passed. Now let me verify the build works:

🔧 Tool: Bash
Input: {
  "command": "cd /c/ppdo/ppdo-next && npm run build 2>&1 | tail -50",
  "description": "Run build to verify no errors",
  "timeout": 180000
}
The build succeeded. Now let me mark all tasks as completed and provide a summary:

🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Explore codebase to understand existing structure",
      "status": "completed",
      "activeForm": "Exploring codebase structure"
    },
    {
      "content": "Plan implementation approach for document ruler feature",
      "status": "completed",
      "activeForm": "Planning implementation approach"
    },
    {
      "content": "Create ruler types and constants",
      "status": "completed",
      "activeForm": "Creating ruler types and constants"
    },
    {
      "content": "Create horizontal ruler component with tick marks",
      "status": "completed",
      "activeForm": "Creating horizontal ruler component"
    },
    {
      "content": "Create vertical ruler component with tick marks",
      "status": "completed",
      "activeForm": "Creating vertical ruler component"
    },
    {
      "content": "Implement draggable margin markers",
      "status": "completed",
      "activeForm": "Implementing draggable margin markers"
    },
    {
      "content": "Implement indent markers (first-line, hanging, left/right)",
      "status": "completed",
      "activeForm": "Implementing indent markers"
    },
    {
      "content": "Implement tab stop markers",
      "status": "completed",
      "activeForm": "Implementing tab stop markers"
    },
    {
      "content": "Create useRulerState hook for ruler state management",
      "status": "completed",
      "activeForm": "Creating useRulerState hook"
    },
    {
      "content": "Add ruler toggle button to toolbar",
      "status": "completed",
      "activeForm": "Adding ruler toggle button"
    },
    {
      "content": "Implement keyboard shortcut (Ctrl+Shift+R)",
      "status": "completed",
      "activeForm": "Implementing keyboard shortcut"
    },
    {
      "content": "Add session persistence for ruler visibility",
      "status": "completed",
      "activeForm": "Adding session persistence"
    },
    {
      "content": "Integrate ruler with editor component",
      "status": "completed",
      "activeForm": "Integrating ruler with editor"
    }
  ]
}
<summary>
## Summary: Dynamic Document Ruler Feature

### Changes Implemented
- Created a dynamic document ruler feature similar to Google Docs and Microsoft Word
- Horizontal ruler with tick marks supporting inches, centimeters, and pixels units
- Optional vertical ruler along the left side of the canvas
- Draggable margin markers (left, right, top, bottom) with real-time visual feedback
- Draggable indent markers (first-line indent, left indent, right indent) on horizontal ruler
- Tab stop markers with support for left, center, right, and decimal alignment (double-click to add, right-click to remove)
- Ruler automatically rescales based on page size (A4, Short, Long) and orientation (portrait/landscape)
- Toggle ruler visibility via toolbar button with visual state indicator
- Keyboard shortcut (Ctrl+Shift+R) to toggle ruler visibility
- Session persistence for ruler visibility state using localStorage
- Ruler synchronizes with canvas scrolling
- Tooltips on hover for all draggable markers
- Corner box when both horizontal and vertical rulers are visible

### Files Modified
- `app/(extra)/canvas/_components/editor/constants.ts` - Added ruler constants and unit types
- `app/(extra)/canvas/_components/editor/types.ts` - Added ruler-related TypeScript interfaces (RulerState, TabStop, IndentSettings, MarginSettings)
- `app/(extra)/canvas/_components/editor/hooks/useKeyboard.ts` - Added Ctrl+Shift+R keyboard shortcut support
- `app/(extra)/canvas/_components/editor/toolbar.tsx` - Added ruler toggle button with Ruler icon
- `app/(extra)/canvas/_components/editor.tsx` - Integrated ruler components with canvas

### Files Created
- `app/(extra)/canvas/_components/editor/ruler/HorizontalRuler.tsx` - Horizontal ruler component with margin/indent/tab markers
- `app/(extra)/canvas/_components/editor/ruler/VerticalRuler.tsx` - Vertical ruler component with margin markers
- `app/(extra)/canvas/_components/editor/ruler/index.ts` - Barrel export file
- `app/(extra)/canvas/_components/editor/hooks/useRulerState.ts` - Ruler state management hook with localStorage persistence

### Notes for Developer
- The ruler is hidden by default; users can toggle it via the toolbar button or Ctrl+Shift+R
- Tab stops can be added by double-clicking on the horizontal ruler (within the content area between margins)
- Tab stops can be removed by right-clicking on them
- The vertical ruler shows header/footer section separators with dashed lines
- All marker positions are stored in pixels and converted to the selected display unit
- The ruler state (visibility, unit preference, margins, indents, tab stops) persists across browser sessions
- Zoom support infrastructure is built-in (default zoom is 1) but zoom controls are not yet exposed in the UI
</summary>

---

## Follow-up Session


🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Analyze current ruler layout and understand Google Docs positioning",
      "status": "in_progress",
      "activeForm": "Analyzing current ruler layout"
    },
    {
      "content": "Reposition horizontal ruler directly below toolbar",
      "status": "pending",
      "activeForm": "Repositioning horizontal ruler"
    },
    {
      "content": "Reposition vertical ruler to far left outside side panel",
      "status": "pending",
      "activeForm": "Repositioning vertical ruler"
    },
    {
      "content": "Synchronize rulers with canvas scroll and page dimensions",
      "status": "pending",
      "activeForm": "Synchronizing rulers with canvas"
    },
    {
      "content": "Add ruler support to PrintPreviewModal",
      "status": "pending",
      "activeForm": "Adding rulers to PrintPreviewModal"
    }
  ]
}
Let me first look at the current state of the editor layout and the screenshot to understand what needs to change:

🔧 Tool: Read
Input: {
  "file_path": "C:\\ppdo\\ppdo-next\\app\\(extra)\\canvas\\_components\\editor.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\ppdo\\ppdo-next\\app\\dashboard\\project\\[year]\\components\\PrintPreviewModal.tsx"
}
Now let me look at the screenshot the user provided to understand the current layout issue. Looking at the image, I can see:

1. The horizontal ruler is positioned at the top but appears to be inside the canvas area, not directly below the toolbar
2. The vertical ruler is on the left side but appears to be inside the side panel area
3. The rulers should be positioned like Google Docs - horizontal ruler directly below toolbar (fixed), vertical ruler on the far left of the canvas viewport

Let me also look at the constants file to understand the page dimensions function:

🔧 Tool: Read
Input: {
  "file_path": "C:\\ppdo\\ppdo-next\\app\\(extra)\\canvas\\_components\\editor\\constants.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\ppdo\\ppdo-next\\app\\(extra)\\canvas\\_components\\editor\\ruler\\HorizontalRuler.tsx"
}
Now I understand the current implementation. Let me update the todo list and start implementing the Google Docs-style layout:

🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Analyze current ruler layout and understand Google Docs positioning",
      "status": "completed",
      "activeForm": "Analyzing current ruler layout"
    },
    {
      "content": "Restructure editor.tsx layout for Google Docs-style rulers",
      "status": "in_progress",
      "activeForm": "Restructuring editor layout"
    },
    {
      "content": "Position horizontal ruler below toolbar and above canvas area",
      "status": "pending",
      "activeForm": "Positioning horizontal ruler"
    },
    {
      "content": "Position vertical ruler on far left outside side panel",
      "status": "pending",
      "activeForm": "Positioning vertical ruler"
    },
    {
      "content": "Synchronize rulers with canvas scroll and page dimensions",
      "status": "pending",
      "activeForm": "Synchronizing rulers with canvas"
    },
    {
      "content": "Add ruler support to PrintPreviewModal",
      "status": "pending",
      "activeForm": "Adding rulers to PrintPreviewModal"
    }
  ]
}
Now let me restructure the editor.tsx to position rulers like Google Docs:
1. Horizontal ruler: Fixed below toolbar, spanning the canvas width, centered with the canvas
2. Vertical ruler: On the far left of the viewport, outside the left sidebar

🔧 Tool: Edit
Input: {
  "file_path": "C:\\ppdo\\ppdo-next\\app\\(extra)\\canvas\\_components\\editor.tsx",
  "old_string": "// app/(extra)/canvas/_components/editor.tsx (UPDATED - ADD RULER FEATURE)\n\n'use client';\n\nimport { useState, useRef } from 'react';\nimport { Toaster } from 'sonner';\nimport { printAllPages } from '@/lib/print';\nimport { Button } from '@/components/ui/button';\nimport { X } from 'lucide-react';\nimport Toolbar from './editor/toolbar';\nimport Canvas from './editor/canvas';\nimport PagePanel from './editor/page-panel';\nimport BottomPageControls from './editor/bottom-page-controls';\nimport LeftSidebar from './editor/left-sidebar/LeftSidebar';\nimport { HorizontalRuler, VerticalRuler } from './editor/ruler';\nimport { useEditorState } from './editor/hooks/useEditorState';\nimport { useClipboard } from './editor/hooks/useClipboard';\nimport { useKeyboard } from './editor/hooks/useKeyboard';\nimport { useStorage, useSaveStorage } from './editor/hooks/useStorage';\nimport { useRulerState } from './editor/hooks/useRulerState';\nimport { createNewPage } from './editor/utils';\nimport { getPageDimensions, RULER_WIDTH, RULER_HEIGHT } from './editor/constants';\nimport type { UploadedImage } from './editor/types/upload';\nexport type { TextElement, ImageElement, CanvasElement, Page } from './editor/types';",
  "new_string": "// app/(extra)/canvas/_components/editor.tsx (UPDATED - GOOGLE DOCS STYLE RULERS)\n\n'use client';\n\nimport { useState, useRef, useEffect, useCallback } from 'react';\nimport { Toaster } from 'sonner';\nimport { printAllPages } from '@/lib/print';\nimport { Button } from '@/components/ui/button';\nimport { X } from 'lucide-react';\nimport Toolbar from './editor/toolbar';\nimport Canvas from './editor/canvas';\nimport PagePanel from './editor/page-panel';\nimport BottomPageControls from './editor/bottom-page-controls';\nimport LeftSidebar from './editor/left-sidebar/LeftSidebar';\nimport { HorizontalRuler, VerticalRuler } from './editor/ruler';\nimport { useEditorState } from './editor/hooks/useEditorState';\nimport { useClipboard } from './editor/hooks/useClipboard';\nimport { useKeyboard } from './editor/hooks/useKeyboard';\nimport { useStorage, useSaveStorage } from './editor/hooks/useStorage';\nimport { useRulerState } from './editor/hooks/useRulerState';\nimport { createNewPage } from './editor/utils';\nimport { getPageDimensions, RULER_WIDTH, RULER_HEIGHT, HEADER_HEIGHT, FOOTER_HEIGHT } from './editor/constants';\nimport type { UploadedImage } from './editor/types/upload';\nexport type { TextElement, ImageElement, CanvasElement, Page } from './editor/types';"
}

🔧 Tool: Edit
Input: {
  "file_path": "C:\\ppdo\\ppdo-next\\app\\(extra)\\canvas\\_components\\editor.tsx",
  "old_string": "  const [activeSection, setActiveSection] = useState<ActiveSection>('page');\n  const [scrollLeft, setScrollLeft] = useState(0);\n  const [scrollTop, setScrollTop] = useState(0);\n  const canvasScrollRef = useRef<HTMLDivElement>(null);",
  "new_string": "  const [activeSection, setActiveSection] = useState<ActiveSection>('page');\n  const [scrollLeft, setScrollLeft] = useState(0);\n  const [scrollTop, setScrollTop] = useState(0);\n  const [canvasOffsetLeft, setCanvasOffsetLeft] = useState(0);\n  const canvasScrollRef = useRef<HTMLDivElement>(null);\n  const canvasContainerRef = useRef<HTMLDivElement>(null);"
}
Now let me add the logic to calculate the canvas offset for proper ruler positioning:

🔧 Tool: Edit
Input: {
  "file_path": "C:\\ppdo\\ppdo-next\\app\\(extra)\\canvas\\_components\\editor.tsx",
  "old_string": "  useKeyboard({\n    selectedElementId,\n    isEditingElementId,\n    onDeleteElement: deleteElement,\n    onToggleRuler: toggleRulerVisibility,\n  });",
  "new_string": "  useKeyboard({\n    selectedElementId,\n    isEditingElementId,\n    onDeleteElement: deleteElement,\n    onToggleRuler: toggleRulerVisibility,\n  });\n\n  // Calculate canvas offset for ruler positioning (Google Docs style)\n  const updateCanvasOffset = useCallback(() => {\n    if (canvasContainerRef.current && canvasScrollRef.current) {\n      const scrollContainer = canvasScrollRef.current;\n      const pageDimensions = getPageDimensions(currentPage.size, currentPage.orientation);\n      const containerWidth = scrollContainer.clientWidth;\n      const canvasWidth = pageDimensions.width;\n\n      // Calculate where the canvas is positioned (centered in scroll area)\n      // Account for the scroll position and padding\n      const padding = 32; // px-8 = 32px padding\n      const availableWidth = containerWidth - (padding * 2);\n      const canvasStartOffset = Math.max(padding, (containerWidth - canvasWidth) / 2);\n\n      setCanvasOffsetLeft(canvasStartOffset - scrollLeft);\n    }\n  }, [currentPage.size, currentPage.orientation, scrollLeft]);\n\n  // Update canvas offset on scroll, resize, or page changes\n  useEffect(() => {\n    updateCanvasOffset();\n\n    const handleResize = () => updateCanvasOffset();\n    window.addEventListener('resize', handleResize);\n\n    return () => window.removeEventListener('resize', handleResize);\n  }, [updateCanvasOffset]);"
}
Now let me completely restructure the main layout to implement the Google Docs-style ruler positioning:

🔧 Tool: Edit
Input: {
  "file_path": "C:\\ppdo\\ppdo-next\\app\\(extra)\\canvas\\_components\\editor.tsx",
  "old_string": "  return (\n    <div className=\"h-screen bg-stone-50 flex flex-col\">\n      {/* Sticky Toolbar */}\n      <div className=\"sticky top-0 h-auto bg-stone-100 border-b border-stone-300 shadow-md z-40 no-print\">\n        <div className=\"flex items-center justify-between\">\n          <div className=\"flex-1\">\n            <Toolbar\n              selectedElement={selectedElement}\n              onUpdateElement={selectedElement ? (updates) => updateElement(selectedElement.id, updates) : undefined}\n              onAddText={() => addText(activeSection)}\n              pageSize={currentPage.size}\n              orientation={currentPage.orientation}\n              onPageSizeChange={changePageSize}\n              onOrientationChange={changeOrientation}\n              onPrint={() => printAllPages(pages, header, footer)}\n              activeSection={activeSection}\n              headerBackgroundColor={header.backgroundColor || '#ffffff'}\n              footerBackgroundColor={footer.backgroundColor || '#ffffff'}\n              pageBackgroundColor={currentPage.backgroundColor || '#ffffff'}\n              onHeaderBackgroundChange={updateHeaderBackground}\n              onFooterBackgroundChange={updateFooterBackground}\n              onPageBackgroundChange={updatePageBackground}\n              pages={pages}\n              header={header}\n              footer={footer}\n              rulerVisible={rulerState.visible}\n              onToggleRuler={toggleRulerVisibility}\n            />\n          </div>\n          {onClose && (\n            <div className=\"px-4 border-l border-stone-300\">\n              <Button\n                variant=\"ghost\"\n                size=\"sm\"\n                onClick={onClose}\n                className=\"text-stone-600 hover:text-stone-900\"\n              >\n                <X className=\"w-4 h-4 mr-2\" />\n                Close\n              </Button>\n            </div>\n          )}\n        </div>\n      </div>\n\n      {/* Main Content Area */}\n      <div className=\"flex flex-1 overflow-hidden\">\n        {/* Left Sidebar */}\n        {enableUploadPanel && variant === 'default' && (\n          <div className=\"w-64 border-r border-stone-200 bg-zinc-50 overflow-hidden z-30 flex-shrink-0\">\n            <LeftSidebar\n              enableUploadFeature={enableUploadPanel}\n              onImageSelect={handleImageSelect}\n            />\n          </div>\n        )}\n\n        {/* Main Canvas Area */}\n        <div className=\"flex-1 flex flex-row overflow-hidden bg-stone-50 min-w-0\">\n          <div className=\"flex-1 flex flex-col overflow-hidden min-w-0\">\n            <div\n              ref={canvasScrollRef}\n              className=\"flex-1 overflow-y-auto overflow-x-auto flex items-start justify-center pt-4 pb-16 px-8 bg-stone-50\"\n              onScroll={(e) => {\n                const target = e.target as HTMLDivElement;\n                setScrollLeft(target.scrollLeft);\n                setScrollTop(target.scrollTop);\n              }}\n            >\n              {/* Canvas with Rulers */}\n              <div className=\"relative\">\n                {/* Corner box when both rulers are visible */}\n                {rulerState.visible && rulerState.showVertical && (\n                  <div\n                    className=\"absolute bg-stone-200 border-r border-b border-stone-300 z-20\"\n                    style={{\n                      width: RULER_WIDTH,\n                      height: RULER_HEIGHT,\n                      left: 0,\n                      top: 0,\n                    }}\n                  />\n                )}\n\n                {/* Horizontal Ruler */}\n                {rulerState.visible && (\n                  <div\n                    className=\"sticky top-0 z-10\"\n                    style={{\n                      marginLeft: rulerState.showVertical ? RULER_WIDTH : 0,\n                    }}\n                  >\n                    <HorizontalRuler\n                      width={getPageDimensions(currentPage.size, currentPage.orientation).width}\n                      rulerState={rulerState}\n                      onMarginChange={updateMargin}\n                      onIndentChange={updateIndent}\n                      onTabStopAdd={addTabStop}\n                      onTabStopUpdate={updateTabStop}\n                      onTabStopRemove={removeTabStop}\n                      scrollLeft={scrollLeft}\n                    />\n                  </div>\n                )}\n\n                <div className=\"flex\">\n                  {/* Vertical Ruler */}\n                  {rulerState.visible && rulerState.showVertical && (\n                    <div className=\"sticky left-0 z-10\">\n                      <VerticalRuler\n                        height={getPageDimensions(currentPage.size, currentPage.orientation).height - 140}\n                        rulerState={rulerState}\n                        onMarginChange={updateMargin}\n                        scrollTop={scrollTop}\n                        showHeaderFooter={true}\n                      />\n                    </div>\n                  )}\n\n                  {/* Canvas */}\n                  <Canvas\n                    page={currentPage}\n                    selectedElementId={selectedElementId}\n                    onSelectElement={setSelectedElementId}\n                    onUpdateElement={updateElement}\n                    onDeleteElement={deleteElement}\n                    isEditingElementId={isEditingElementId}\n                    onEditingChange={setIsEditingElementId}\n                    header={header}\n                    footer={footer}\n                    pageNumber={currentPageIndex + 1}\n                    totalPages={pages.length}\n                    activeSection={activeSection}\n                    onActiveSectionChange={setActiveSection}\n                    onImageDropped={handleImageSelect}\n                  />\n                </div>\n              </div>\n            </div>\n\n            {/* Bottom Page Controls */}\n            <div className=\"no-print border-t border-stone-200 bg-white flex-shrink-0\">\n              <BottomPageControls\n                currentPageIndex={currentPageIndex}\n                totalPages={pages.length}\n                onAddPage={addPage}\n                onDuplicatePage={duplicatePage}\n                onDeletePage={deletePage}\n                elements={allElements}\n                selectedElementId={selectedElementId}\n                onSelectElement={setSelectedElementId}\n                onUpdateElement={updateElement}\n                onReorderElements={reorderElements}\n                onPreviousPage={goToPreviousPage}\n                onNextPage={goToNextPage}\n              />\n            </div>\n          </div>\n\n          {/* Right Sidebar */}\n          {showPagePanel && variant === 'default' && (\n            <div className=\"w-64 border-l border-stone-200 bg-zinc-50 flex-shrink-0 overflow-y-auto no-print\">\n              <PagePanel\n                pages={pages}\n                currentPageIndex={currentPageIndex}\n                onPageSelect={selectPage}\n                onAddPage={addPage}\n                onReorderPages={reorderPages}\n                onDuplicatePage={(index) => {\n                  selectPage(index);\n                  duplicatePage();\n                }}\n                onDeletePage={(index) => {\n                  selectPage(index);\n                  deletePage();\n                }}\n              />\n            </div>\n          )}\n        </div>\n      </div>\n    </div>\n  );\n}",
  "new_string": "  const pageDimensions = getPageDimensions(currentPage.size, currentPage.orientation);\n  const totalCanvasHeight = HEADER_HEIGHT + pageDimensions.height + FOOTER_HEIGHT;\n\n  return (\n    <div className=\"h-screen bg-stone-50 flex flex-col\">\n      {/* Sticky Toolbar */}\n      <div className=\"sticky top-0 h-auto bg-stone-100 border-b border-stone-300 shadow-md z-40 no-print\">\n        <div className=\"flex items-center justify-between\">\n          <div className=\"flex-1\">\n            <Toolbar\n              selectedElement={selectedElement}\n              onUpdateElement={selectedElement ? (updates) => updateElement(selectedElement.id, updates) : undefined}\n              onAddText={() => addText(activeSection)}\n              pageSize={currentPage.size}\n              orientation={currentPage.orientation}\n              onPageSizeChange={changePageSize}\n              onOrientationChange={changeOrientation}\n              onPrint={() => printAllPages(pages, header, footer)}\n              activeSection={activeSection}\n              headerBackgroundColor={header.backgroundColor || '#ffffff'}\n              footerBackgroundColor={footer.backgroundColor || '#ffffff'}\n              pageBackgroundColor={currentPage.backgroundColor || '#ffffff'}\n              onHeaderBackgroundChange={updateHeaderBackground}\n              onFooterBackgroundChange={updateFooterBackground}\n              onPageBackgroundChange={updatePageBackground}\n              pages={pages}\n              header={header}\n              footer={footer}\n              rulerVisible={rulerState.visible}\n              onToggleRuler={toggleRulerVisibility}\n            />\n          </div>\n          {onClose && (\n            <div className=\"px-4 border-l border-stone-300\">\n              <Button\n                variant=\"ghost\"\n                size=\"sm\"\n                onClick={onClose}\n                className=\"text-stone-600 hover:text-stone-900\"\n              >\n                <X className=\"w-4 h-4 mr-2\" />\n                Close\n              </Button>\n            </div>\n          )}\n        </div>\n      </div>\n\n      {/* Horizontal Ruler - Fixed below toolbar, spanning full width */}\n      {rulerState.visible && (\n        <div className=\"sticky top-0 z-30 bg-stone-200 border-b border-stone-300 no-print flex\">\n          {/* Vertical ruler corner space (when vertical ruler is visible) */}\n          {rulerState.showVertical && (\n            <div\n              className=\"flex-shrink-0 bg-stone-200 border-r border-stone-300\"\n              style={{ width: RULER_WIDTH, height: RULER_HEIGHT }}\n            />\n          )}\n          {/* Left sidebar placeholder space */}\n          {enableUploadPanel && variant === 'default' && (\n            <div className=\"w-64 flex-shrink-0 bg-stone-200\" style={{ height: RULER_HEIGHT }} />\n          )}\n          {/* Horizontal ruler - centered with canvas */}\n          <div\n            ref={canvasContainerRef}\n            className=\"flex-1 overflow-hidden flex justify-center\"\n            style={{ height: RULER_HEIGHT }}\n          >\n            <div\n              style={{\n                marginLeft: Math.max(0, canvasOffsetLeft - (enableUploadPanel && variant === 'default' ? 0 : 0)),\n                transform: `translateX(${-scrollLeft}px)`,\n              }}\n            >\n              <HorizontalRuler\n                width={pageDimensions.width}\n                rulerState={rulerState}\n                onMarginChange={updateMargin}\n                onIndentChange={updateIndent}\n                onTabStopAdd={addTabStop}\n                onTabStopUpdate={updateTabStop}\n                onTabStopRemove={removeTabStop}\n                scrollLeft={0}\n              />\n            </div>\n          </div>\n          {/* Right sidebar placeholder space */}\n          {showPagePanel && variant === 'default' && (\n            <div className=\"w-64 flex-shrink-0 bg-stone-200\" style={{ height: RULER_HEIGHT }} />\n          )}\n        </div>\n      )}\n\n      {/* Main Content Area */}\n      <div className=\"flex flex-1 overflow-hidden\">\n        {/* Vertical Ruler - Fixed on far left, outside sidebar */}\n        {rulerState.visible && rulerState.showVertical && (\n          <div\n            className=\"flex-shrink-0 bg-stone-100 border-r border-stone-300 overflow-hidden no-print\"\n            style={{ width: RULER_WIDTH }}\n          >\n            <div\n              style={{\n                transform: `translateY(${-scrollTop}px)`,\n                marginTop: 16, // Match pt-4 padding\n              }}\n            >\n              <VerticalRuler\n                height={pageDimensions.height}\n                rulerState={rulerState}\n                onMarginChange={updateMargin}\n                scrollTop={0}\n                showHeaderFooter={true}\n              />\n            </div>\n          </div>\n        )}\n\n        {/* Left Sidebar */}\n        {enableUploadPanel && variant === 'default' && (\n          <div className=\"w-64 border-r border-stone-200 bg-zinc-50 overflow-hidden z-30 flex-shrink-0\">\n            <LeftSidebar\n              enableUploadFeature={enableUploadPanel}\n              onImageSelect={handleImageSelect}\n            />\n          </div>\n        )}\n\n        {/* Main Canvas Area */}\n        <div className=\"flex-1 flex flex-row overflow-hidden bg-stone-50 min-w-0\">\n          <div className=\"flex-1 flex flex-col overflow-hidden min-w-0\">\n            <div\n              ref={canvasScrollRef}\n              className=\"flex-1 overflow-y-auto overflow-x-auto flex items-start justify-center pt-4 pb-16 px-8 bg-stone-50\"\n              onScroll={(e) => {\n                const target = e.target as HTMLDivElement;\n                setScrollLeft(target.scrollLeft);\n                setScrollTop(target.scrollTop);\n              }}\n            >\n              {/* Canvas */}\n              <Canvas\n                page={currentPage}\n                selectedElementId={selectedElementId}\n                onSelectElement={setSelectedElementId}\n                onUpdateElement={updateElement}\n                onDeleteElement={deleteElement}\n                isEditingElementId={isEditingElementId}\n                onEditingChange={setIsEditingElementId}\n                header={header}\n                footer={footer}\n                pageNumber={currentPageIndex + 1}\n                totalPages={pages.length}\n                activeSection={activeSection}\n                onActiveSectionChange={setActiveSection}\n                onImageDropped={handleImageSelect}\n              />\n            </div>\n\n            {/* Bottom Page Controls */}\n            <div className=\"no-print border-t border-stone-200 bg-white flex-shrink-0\">\n              <BottomPageControls\n                currentPageIndex={currentPageIndex}\n                totalPages={pages.length}\n                onAddPage={addPage}\n                onDuplicatePage={duplicatePage}\n                onDeletePage={deletePage}\n                elements={allElements}\n                selectedElementId={selectedElementId}\n                onSelectElement={setSelectedElementId}\n                onUpdateElement={updateElement}\n                onReorderElements={reorderElements}\n                onPreviousPage={goToPreviousPage}\n                onNextPage={goToNextPage}\n              />\n            </div>\n          </div>\n\n          {/* Right Sidebar */}\n          {showPagePanel && variant === 'default' && (\n            <div className=\"w-64 border-l border-stone-200 bg-zinc-50 flex-shrink-0 overflow-y-auto no-print\">\n              <PagePanel\n                pages={pages}\n                currentPageIndex={currentPageIndex}\n                onPageSelect={selectPage}\n                onAddPage={addPage}\n                onReorderPages={reorderPages}\n                onDuplicatePage={(index) => {\n                  selectPage(index);\n                  duplicatePage();\n                }}\n                onDeletePage={(index) => {\n                  selectPage(index);\n                  deletePage();\n                }}\n              />\n            </div>\n          )}\n        </div>\n      </div>\n    </div>\n  );\n}"
}

🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Analyze current ruler layout and understand Google Docs positioning",
      "status": "completed",
      "activeForm": "Analyzing current ruler layout"
    },
    {
      "content": "Restructure editor.tsx layout for Google Docs-style rulers",
      "status": "completed",
      "activeForm": "Restructuring editor layout"
    },
    {
      "content": "Position horizontal ruler below toolbar and above canvas area",
      "status": "completed",
      "activeForm": "Positioning horizontal ruler"
    },
    {
      "content": "Position vertical ruler on far left outside side panel",
      "status": "completed",
      "activeForm": "Positioning vertical ruler"
    },
    {
      "content": "Synchronize rulers with canvas scroll and page dimensions",
      "status": "in_progress",
      "activeForm": "Synchronizing rulers with canvas"
    },
    {
      "content": "Add ruler support to PrintPreviewModal",
      "status": "pending",
      "activeForm": "Adding rulers to PrintPreviewModal"
    }
  ]
}
Now let me run a type check to ensure there are no TypeScript errors:

🔧 Tool: Bash
Input: {
  "command": "cd /c/ppdo/ppdo-next && npx tsc --noEmit 2>&1 | head -50",
  "description": "Run TypeScript type check",
  "timeout": 120000
}
Type check passed. Now let me add rulers to the PrintPreviewModal. First, let me read the PrintPreviewToolbar component to understand its structure:

🔧 Tool: Read
Input: {
  "file_path": "C:\\ppdo\\ppdo-next\\app\\dashboard\\project\\[year]\\components\\PrintPreviewToolbar.tsx"
}
Now let me update the PrintPreviewModal to add rulers. First, I'll add the ruler toggle button to PrintPreviewToolbar:

🔧 Tool: Edit
Input: {
  "file_path": "C:\\ppdo\\ppdo-next\\app\\dashboard\\project\\[year]\\components\\PrintPreviewToolbar.tsx",
  "old_string": "import { Button } from '@/components/ui/button';\nimport { Switch } from '@/components/ui/switch';\nimport { Label } from '@/components/ui/label';\nimport { ArrowLeft, X, Save, Palette } from 'lucide-react';",
  "new_string": "import { Button } from '@/components/ui/button';\nimport { Switch } from '@/components/ui/switch';\nimport { Label } from '@/components/ui/label';\nimport { ArrowLeft, X, Save, Palette, Ruler } from 'lucide-react';"
}

🔧 Tool: Edit
Input: {
  "file_path": "C:\\ppdo\\ppdo-next\\app\\dashboard\\project\\[year]\\components\\PrintPreviewToolbar.tsx",
  "old_string": "interface PrintPreviewToolbarProps {\n  isDirty: boolean;\n  isSaving: boolean;\n  lastSavedTime: string;\n  onBack: () => void;\n  onClose: () => void;\n  onSaveDraft?: () => void;\n  onApplyTemplate?: () => void;\n  isEditorMode: boolean;\n  onEditorModeChange: (enabled: boolean) => void;\n}",
  "new_string": "interface PrintPreviewToolbarProps {\n  isDirty: boolean;\n  isSaving: boolean;\n  lastSavedTime: string;\n  onBack: () => void;\n  onClose: () => void;\n  onSaveDraft?: () => void;\n  onApplyTemplate?: () => void;\n  isEditorMode: boolean;\n  onEditorModeChange: (enabled: boolean) => void;\n  rulerVisible?: boolean;\n  onToggleRuler?: () => void;\n}"
}

🔧 Tool: Edit
Input: {
  "file_path": "C:\\ppdo\\ppdo-next\\app\\dashboard\\project\\[year]\\components\\PrintPreviewToolbar.tsx",
  "old_string": "  onApplyTemplate,\n  isEditorMode,\n  onEditorModeChange,\n}: PrintPreviewToolbarProps) {",
  "new_string": "  onApplyTemplate,\n  isEditorMode,\n  onEditorModeChange,\n  rulerVisible = false,\n  onToggleRuler,\n}: PrintPreviewToolbarProps) {"
}

🔧 Tool: Edit
Input: {
  "file_path": "C:\\ppdo\\ppdo-next\\app\\dashboard\\project\\[year]\\components\\PrintPreviewToolbar.tsx",
  "old_string": "        {/* Apply Template Button - Only in editor mode */}\n        {isEditorMode && onApplyTemplate && (\n          <Button\n            onClick={onApplyTemplate}\n            variant=\"outline\"\n            size=\"sm\"\n            className=\"gap-2\"\n          >\n            <Palette className=\"w-4 h-4\" />\n            Apply Template\n          </Button>\n        )}",
  "new_string": "        {/* Ruler Toggle Button */}\n        {onToggleRuler && (\n          <Button\n            onClick={onToggleRuler}\n            variant=\"outline\"\n            size=\"sm\"\n            className={`gap-2 ${rulerVisible ? 'bg-stone-200' : ''}`}\n            title=\"Toggle Ruler (Ctrl+Shift+R)\"\n          >\n            <Ruler className=\"w-4 h-4\" />\n            Ruler\n          </Button>\n        )}\n\n        {/* Apply Template Button - Only in editor mode */}\n        {isEditorMode && onApplyTemplate && (\n          <Button\n            onClick={onApplyTemplate}\n            variant=\"outline\"\n            size=\"sm\"\n            className=\"gap-2\"\n          >\n            <Palette className=\"w-4 h-4\" />\n            Apply Template\n          </Button>\n        )}"
}

🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Analyze current ruler layout and understand Google Docs positioning",
      "status": "completed",
      "activeForm": "Analyzing current ruler layout"
    },
    {
      "content": "Restructure editor.tsx layout for Google Docs-style rulers",
      "status": "completed",
      "activeForm": "Restructuring editor layout"
    },
    {
      "content": "Position horizontal ruler below toolbar and above canvas area",
      "status": "completed",
      "activeForm": "Positioning horizontal ruler"
    },
    {
      "content": "Position vertical ruler on far left outside side panel",
      "status": "completed",
      "activeForm": "Positioning vertical ruler"
    },
    {
      "content": "Synchronize rulers with canvas scroll and page dimensions",
      "status": "completed",
      "activeForm": "Synchronizing rulers with canvas"
    },
    {
      "content": "Add ruler support to PrintPreviewModal",
      "status": "in_progress",
      "activeForm": "Adding rulers to PrintPreviewModal"
    }
  ]
}
Now let me update the PrintPreviewModal to add the ruler integration:

🔧 Tool: Edit
Input: {
  "file_path": "C:\\ppdo\\ppdo-next\\app\\dashboard\\project\\[year]\\components\\PrintPreviewModal.tsx",
  "old_string": "'use client';\n\nimport { useCallback, useState, useEffect } from 'react';\nimport { PrintPreviewToolbar } from './PrintPreviewToolbar';\nimport { ConfirmationModal } from './ConfirmationModal';\nimport { TemplateSelector } from './TemplateSelector';\nimport { TemplateApplicationModal } from './TemplateApplicationModal';\nimport { PrintDraft, ColumnDefinition, BudgetTotals, RowMarker } from '@/lib/print-canvas/types';\nimport { BudgetItem } from '@/app/dashboard/project/[year]/types';\nimport { CanvasTemplate } from '@/app/(extra)/canvas/_components/editor/types/template';\n\n// Canvas components\nimport Toolbar from '@/app/(extra)/canvas/_components/editor/toolbar';\nimport Canvas from '@/app/(extra)/canvas/_components/editor/canvas';\nimport PagePanel from '@/app/(extra)/canvas/_components/editor/page-panel';\nimport BottomPageControls from '@/app/(extra)/canvas/_components/editor/bottom-page-controls';\n\n// Custom hooks\nimport { usePrintPreviewState } from './hooks/usePrintPreviewState';\nimport { usePrintPreviewActions } from './hooks/usePrintPreviewActions';\nimport { usePrintPreviewDraft } from './hooks/usePrintPreviewDraft';\nimport { convertTableToCanvas } from '@/lib/print-canvas/tableToCanvas';\nimport { mergeTemplateWithCanvas } from '@/lib/canvas-utils/mergeTemplate';\nimport { toast } from 'sonner';",
  "new_string": "'use client';\n\nimport { useCallback, useState, useEffect, useRef } from 'react';\nimport { PrintPreviewToolbar } from './PrintPreviewToolbar';\nimport { ConfirmationModal } from './ConfirmationModal';\nimport { TemplateSelector } from './TemplateSelector';\nimport { TemplateApplicationModal } from './TemplateApplicationModal';\nimport { PrintDraft, ColumnDefinition, BudgetTotals, RowMarker } from '@/lib/print-canvas/types';\nimport { BudgetItem } from '@/app/dashboard/project/[year]/types';\nimport { CanvasTemplate } from '@/app/(extra)/canvas/_components/editor/types/template';\n\n// Canvas components\nimport Toolbar from '@/app/(extra)/canvas/_components/editor/toolbar';\nimport Canvas from '@/app/(extra)/canvas/_components/editor/canvas';\nimport PagePanel from '@/app/(extra)/canvas/_components/editor/page-panel';\nimport BottomPageControls from '@/app/(extra)/canvas/_components/editor/bottom-page-controls';\nimport { HorizontalRuler, VerticalRuler } from '@/app/(extra)/canvas/_components/editor/ruler';\nimport { useRulerState } from '@/app/(extra)/canvas/_components/editor/hooks/useRulerState';\nimport { getPageDimensions, RULER_WIDTH, RULER_HEIGHT, HEADER_HEIGHT, FOOTER_HEIGHT } from '@/app/(extra)/canvas/_components/editor/constants';\n\n// Custom hooks\nimport { usePrintPreviewState } from './hooks/usePrintPreviewState';\nimport { usePrintPreviewActions } from './hooks/usePrintPreviewActions';\nimport { usePrintPreviewDraft } from './hooks/usePrintPreviewDraft';\nimport { convertTableToCanvas } from '@/lib/print-canvas/tableToCanvas';\nimport { mergeTemplateWithCanvas } from '@/lib/canvas-utils/mergeTemplate';\nimport { toast } from 'sonner';"
}
Now let me add the ruler state and scroll tracking to the PrintPreviewModal:

🔧 Tool: Edit
Input: {
  "file_path": "C:\\ppdo\\ppdo-next\\app\\dashboard\\project\\[year]\\components\\PrintPreviewModal.tsx",
  "old_string": "  // State management\n  const state = usePrintPreviewState();\n\n  // Viewer/Editor mode state (default to viewer mode)\n  const [isEditorMode, setIsEditorMode] = useState(false);",
  "new_string": "  // State management\n  const state = usePrintPreviewState();\n\n  // Ruler state\n  const {\n    rulerState,\n    toggleRulerVisibility,\n    updateMargin,\n    updateIndent,\n    addTabStop,\n    updateTabStop,\n    removeTabStop,\n  } = useRulerState();\n\n  // Scroll tracking for rulers\n  const [scrollLeft, setScrollLeft] = useState(0);\n  const [scrollTop, setScrollTop] = useState(0);\n  const canvasScrollRef = useRef<HTMLDivElement>(null);\n\n  // Viewer/Editor mode state (default to viewer mode)\n  const [isEditorMode, setIsEditorMode] = useState(false);"
}
Now let me add the keyboard shortcut for toggling the ruler. First, let me find a good place to add the keyboard event listener:

🔧 Tool: Edit
Input: {
  "file_path": "C:\\ppdo\\ppdo-next\\app\\dashboard\\project\\[year]\\components\\PrintPreviewModal.tsx",
  "old_string": "  // Initialize when modal opens or template is selected\n  useEffect(() => {\n    if (!isOpen) {",
  "new_string": "  // Keyboard shortcut for ruler toggle (Ctrl+Shift+R)\n  useEffect(() => {\n    const handleKeyDown = (e: KeyboardEvent) => {\n      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'r') {\n        e.preventDefault();\n        toggleRulerVisibility();\n      }\n    };\n\n    if (isOpen) {\n      window.addEventListener('keydown', handleKeyDown);\n      return () => window.removeEventListener('keydown', handleKeyDown);\n    }\n  }, [isOpen, toggleRulerVisibility]);\n\n  // Initialize when modal opens or template is selected\n  useEffect(() => {\n    if (!isOpen) {"
}
Now let me update the PrintPreviewToolbar call to include the ruler props:

🔧 Tool: Edit
Input: {
  "file_path": "C:\\ppdo\\ppdo-next\\app\\dashboard\\project\\[year]\\components\\PrintPreviewModal.tsx",
  "old_string": "        {/* Custom Toolbar */}\n        <PrintPreviewToolbar\n          isDirty={state.isDirty}\n          isSaving={state.isSaving}\n          lastSavedTime={formattedLastSaved}\n          onBack={handleClose}\n          onClose={handleClose}\n          onSaveDraft={handleSaveDraft}\n          onApplyTemplate={() => setShowLiveTemplateSelector(true)}\n          isEditorMode={isEditorMode}\n          onEditorModeChange={setIsEditorMode}\n        />",
  "new_string": "        {/* Custom Toolbar */}\n        <PrintPreviewToolbar\n          isDirty={state.isDirty}\n          isSaving={state.isSaving}\n          lastSavedTime={formattedLastSaved}\n          onBack={handleClose}\n          onClose={handleClose}\n          onSaveDraft={handleSaveDraft}\n          onApplyTemplate={() => setShowLiveTemplateSelector(true)}\n          isEditorMode={isEditorMode}\n          onEditorModeChange={setIsEditorMode}\n          rulerVisible={rulerState.visible}\n          onToggleRuler={toggleRulerVisibility}\n        />"
}
Now let me update the main layout in PrintPreviewModal to include the rulers. Let me read the current return statement to understand its structure:

🔧 Tool: Read
Input: {
  "file_path": "C:\\ppdo\\ppdo-next\\app\\dashboard\\project\\[year]\\components\\PrintPreviewModal.tsx",
  "offset": 400,
  "limit": 200
}
Now let me update the PrintPreviewModal layout to include rulers in the Google Docs style:

🔧 Tool: Edit
Input: {
  "file_path": "C:\\ppdo\\ppdo-next\\app\\dashboard\\project\\[year]\\components\\PrintPreviewModal.tsx",
  "old_string": "        {/* Main Layout */}\n        <div className=\"flex flex-1 overflow-hidden\">\n          {/* Canvas Area */}\n          <div className=\"flex-1 flex flex-col overflow-hidden bg-stone-50 min-w-0\">\n            {/* Canvas Toolbar - Always visible but content changes based on mode */}\n            <div className=\"sticky top-0 z-10 bg-stone-100 border-b border-stone-300 shadow-sm\">\n              <Toolbar\n                selectedElement={state.selectedElement}\n                onUpdateElement={\n                  state.selectedElementId\n                    ? (updates) => actions.updateElement(state.selectedElementId!, updates)\n                    : undefined\n                }\n                onAddText={() => {}}\n                pageSize={state.currentPage.size}\n                orientation={state.currentPage.orientation}\n                onPageSizeChange={actions.changePageSize}\n                onOrientationChange={actions.changeOrientation}\n                onPrint={handlePrint}\n                activeSection={state.activeSection}\n                headerBackgroundColor={state.header.backgroundColor || '#ffffff'}\n                footerBackgroundColor={state.footer.backgroundColor || '#ffffff'}\n                pageBackgroundColor={state.currentPage.backgroundColor || '#ffffff'}\n                onHeaderBackgroundChange={actions.updateHeaderBackground}\n                onFooterBackgroundChange={actions.updateFooterBackground}\n                onPageBackgroundChange={actions.updatePageBackground}\n                pages={state.pages}\n                header={state.header}\n                footer={state.footer}\n                isEditorMode={isEditorMode}\n              />\n            </div>\n\n            {/* Canvas Scroll Area */}\n            <div className=\"flex-1 overflow-y-auto overflow-x-auto flex items-start justify-center pt-4 pb-16 px-8\">\n              <Canvas\n                page={state.currentPage}\n                selectedElementId={isEditorMode ? state.selectedElementId : null}\n                onSelectElement={isEditorMode ? state.setSelectedElementId : () => {}}\n                onUpdateElement={isEditorMode ? actions.updateElement : () => {}}\n                onDeleteElement={isEditorMode ? actions.deleteElement : () => {}}\n                isEditingElementId={isEditorMode ? state.isEditingElementId : null}\n                onEditingChange={isEditorMode ? state.setIsEditingElementId : () => {}}\n                header={state.header}\n                footer={state.footer}\n                pageNumber={state.currentPageIndex + 1}\n                totalPages={state.pages.length}\n                activeSection={state.activeSection}\n                onActiveSectionChange={isEditorMode ? state.setActiveSection : () => {}}\n                selectedGroupId={state.selectedGroupId}\n              />\n            </div>\n\n            {/* Bottom Controls */}\n            <div className=\"border-t border-stone-200 bg-white flex-shrink-0\">\n              <BottomPageControls\n                currentPageIndex={state.currentPageIndex}\n                totalPages={state.pages.length}\n                onAddPage={() => {}}\n                onDuplicatePage={() => {}}\n                onDeletePage={() => {}}\n                elements={state.allElements}\n                selectedElementId={state.selectedElementId}\n                onSelectElement={state.setSelectedElementId}\n                onUpdateElement={actions.updateElement}\n                onReorderElements={actions.reorderElements}\n                onPreviousPage={() =>\n                  state.setCurrentPageIndex((prev) => Math.max(0, prev - 1))\n                }\n                onNextPage={() =>\n                  state.setCurrentPageIndex((prev) =>\n                    Math.min(state.pages.length - 1, prev + 1)\n                  )\n                }\n                isEditorMode={isEditorMode}\n                selectedGroupId={state.selectedGroupId}\n                onSelectGroup={state.setSelectedGroupId}\n              />\n            </div>\n          </div>\n\n          {/* Right Sidebar - Always visible */}\n          <div className=\"w-64 border-l border-stone-200 bg-zinc-50 flex-shrink-0 overflow-y-auto\">\n            <PagePanel\n              pages={state.pages}\n              currentPageIndex={state.currentPageIndex}\n              onPageSelect={state.setCurrentPageIndex}\n              onAddPage={() => {}}\n              onReorderPages={() => {}}\n              header={state.header}\n              footer={state.footer}\n            />\n          </div>\n        </div>\n      </div>",
  "new_string": "        {/* Horizontal Ruler - Fixed below toolbar (Google Docs style) */}\n        {rulerState.visible && (\n          <div className=\"sticky top-0 z-30 bg-stone-200 border-b border-stone-300 flex\">\n            {/* Vertical ruler corner space */}\n            {rulerState.showVertical && (\n              <div\n                className=\"flex-shrink-0 bg-stone-200 border-r border-stone-300\"\n                style={{ width: RULER_WIDTH, height: RULER_HEIGHT }}\n              />\n            )}\n            {/* Horizontal ruler - centered with canvas */}\n            <div\n              className=\"flex-1 overflow-hidden flex justify-center\"\n              style={{ height: RULER_HEIGHT }}\n            >\n              <div style={{ transform: `translateX(${-scrollLeft}px)` }}>\n                <HorizontalRuler\n                  width={getPageDimensions(state.currentPage.size, state.currentPage.orientation).width}\n                  rulerState={rulerState}\n                  onMarginChange={updateMargin}\n                  onIndentChange={updateIndent}\n                  onTabStopAdd={addTabStop}\n                  onTabStopUpdate={updateTabStop}\n                  onTabStopRemove={removeTabStop}\n                  scrollLeft={0}\n                />\n              </div>\n            </div>\n            {/* Right sidebar placeholder space */}\n            <div className=\"w-64 flex-shrink-0 bg-stone-200\" style={{ height: RULER_HEIGHT }} />\n          </div>\n        )}\n\n        {/* Main Layout */}\n        <div className=\"flex flex-1 overflow-hidden\">\n          {/* Vertical Ruler - Fixed on far left (Google Docs style) */}\n          {rulerState.visible && rulerState.showVertical && (\n            <div\n              className=\"flex-shrink-0 bg-stone-100 border-r border-stone-300 overflow-hidden\"\n              style={{ width: RULER_WIDTH }}\n            >\n              <div\n                style={{\n                  transform: `translateY(${-scrollTop}px)`,\n                  marginTop: 16, // Match pt-4 padding\n                }}\n              >\n                <VerticalRuler\n                  height={getPageDimensions(state.currentPage.size, state.currentPage.orientation).height}\n                  rulerState={rulerState}\n                  onMarginChange={updateMargin}\n                  scrollTop={0}\n                  showHeaderFooter={true}\n                />\n              </div>\n            </div>\n          )}\n\n          {/* Canvas Area */}\n          <div className=\"flex-1 flex flex-col overflow-hidden bg-stone-50 min-w-0\">\n            {/* Canvas Toolbar - Always visible but content changes based on mode */}\n            <div className=\"sticky top-0 z-10 bg-stone-100 border-b border-stone-300 shadow-sm\">\n              <Toolbar\n                selectedElement={state.selectedElement}\n                onUpdateElement={\n                  state.selectedElementId\n                    ? (updates) => actions.updateElement(state.selectedElementId!, updates)\n                    : undefined\n                }\n                onAddText={() => {}}\n                pageSize={state.currentPage.size}\n                orientation={state.currentPage.orientation}\n                onPageSizeChange={actions.changePageSize}\n                onOrientationChange={actions.changeOrientation}\n                onPrint={handlePrint}\n                activeSection={state.activeSection}\n                headerBackgroundColor={state.header.backgroundColor || '#ffffff'}\n                footerBackgroundColor={state.footer.backgroundColor || '#ffffff'}\n                pageBackgroundColor={state.currentPage.backgroundColor || '#ffffff'}\n                onHeaderBackgroundChange={actions.updateHeaderBackground}\n                onFooterBackgroundChange={actions.updateFooterBackground}\n                onPageBackgroundChange={actions.updatePageBackground}\n                pages={state.pages}\n                header={state.header}\n                footer={state.footer}\n                isEditorMode={isEditorMode}\n              />\n            </div>\n\n            {/* Canvas Scroll Area */}\n            <div\n              ref={canvasScrollRef}\n              className=\"flex-1 overflow-y-auto overflow-x-auto flex items-start justify-center pt-4 pb-16 px-8\"\n              onScroll={(e) => {\n                const target = e.target as HTMLDivElement;\n                setScrollLeft(target.scrollLeft);\n                setScrollTop(target.scrollTop);\n              }}\n            >\n              <Canvas\n                page={state.currentPage}\n                selectedElementId={isEditorMode ? state.selectedElementId : null}\n                onSelectElement={isEditorMode ? state.setSelectedElementId : () => {}}\n                onUpdateElement={isEditorMode ? actions.updateElement : () => {}}\n                onDeleteElement={isEditorMode ? actions.deleteElement : () => {}}\n                isEditingElementId={isEditorMode ? state.isEditingElementId : null}\n                onEditingChange={isEditorMode ? state.setIsEditingElementId : () => {}}\n                header={state.header}\n                footer={state.footer}\n                pageNumber={state.currentPageIndex + 1}\n                totalPages={state.pages.length}\n                activeSection={state.activeSection}\n                onActiveSectionChange={isEditorMode ? state.setActiveSection : () => {}}\n                selectedGroupId={state.selectedGroupId}\n              />\n            </div>\n\n            {/* Bottom Controls */}\n            <div className=\"border-t border-stone-200 bg-white flex-shrink-0\">\n              <BottomPageControls\n                currentPageIndex={state.currentPageIndex}\n                totalPages={state.pages.length}\n                onAddPage={() => {}}\n                onDuplicatePage={() => {}}\n                onDeletePage={() => {}}\n                elements={state.allElements}\n                selectedElementId={state.selectedElementId}\n                onSelectElement={state.setSelectedElementId}\n                onUpdateElement={actions.updateElement}\n                onReorderElements={actions.reorderElements}\n                onPreviousPage={() =>\n                  state.setCurrentPageIndex((prev) => Math.max(0, prev - 1))\n                }\n                onNextPage={() =>\n                  state.setCurrentPageIndex((prev) =>\n                    Math.min(state.pages.length - 1, prev + 1)\n                  )\n                }\n                isEditorMode={isEditorMode}\n                selectedGroupId={state.selectedGroupId}\n                onSelectGroup={state.setSelectedGroupId}\n              />\n            </div>\n          </div>\n\n          {/* Right Sidebar - Always visible */}\n          <div className=\"w-64 border-l border-stone-200 bg-zinc-50 flex-shrink-0 overflow-y-auto\">\n            <PagePanel\n              pages={state.pages}\n              currentPageIndex={state.currentPageIndex}\n              onPageSelect={state.setCurrentPageIndex}\n              onAddPage={() => {}}\n              onReorderPages={() => {}}\n              header={state.header}\n              footer={state.footer}\n            />\n          </div>\n        </div>\n      </div>"
}
Now let me run a type check to ensure everything compiles:

🔧 Tool: Bash
Input: {
  "command": "cd /c/ppdo/ppdo-next && npx tsc --noEmit 2>&1 | head -60",
  "description": "Run TypeScript type check",
  "timeout": 120000
}
Type check passed. Let me run the build to ensure everything works:

🔧 Tool: Bash
Input: {
  "command": "cd /c/ppdo/ppdo-next && npm run build 2>&1 | tail -60",
  "description": "Run build to verify no errors",
  "timeout": 180000
}
Build succeeded. Now let me update the todo list to mark everything as completed:

🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Analyze current ruler layout and understand Google Docs positioning",
      "status": "completed",
      "activeForm": "Analyzing current ruler layout"
    },
    {
      "content": "Restructure editor.tsx layout for Google Docs-style rulers",
      "status": "completed",
      "activeForm": "Restructuring editor layout"
    },
    {
      "content": "Position horizontal ruler below toolbar and above canvas area",
      "status": "completed",
      "activeForm": "Positioning horizontal ruler"
    },
    {
      "content": "Position vertical ruler on far left outside side panel",
      "status": "completed",
      "activeForm": "Positioning vertical ruler"
    },
    {
      "content": "Synchronize rulers with canvas scroll and page dimensions",
      "status": "completed",
      "activeForm": "Synchronizing rulers with canvas"
    },
    {
      "content": "Add ruler support to PrintPreviewModal",
      "status": "completed",
      "activeForm": "Adding rulers to PrintPreviewModal"
    }
  ]
}
Now let me verify the changes by reading the key files to make sure everything looks right:

🔧 Tool: Read
Input: {
  "file_path": "C:\\ppdo\\ppdo-next\\app\\(extra)\\canvas\\_components\\editor.tsx",
  "offset": 1,
  "limit": 80
}
<summary>
## Summary: Google Docs Style Ruler Repositioning

### Changes Implemented
- Restructured the ruler layout to match Google Docs behavior:
  - **Horizontal ruler**: Positioned as a fixed element directly below the toolbar, spanning the full width with proper centering alignment to the canvas
  - **Vertical ruler**: Positioned on the far left of the viewport, outside the left sidebar, occupying its own fixed area
- Added scroll synchronization: Both rulers now sync with canvas scrolling using `translateX` and `translateY` transforms
- Updated `editor.tsx` with Google Docs-style layout:
  - Horizontal ruler sits between toolbar and main content area
  - Vertical ruler sits outside all sidebars on the far left
  - Corner box appears when both rulers are visible
  - Placeholders for sidebar spaces in the ruler row maintain alignment
- Added ruler support to `PrintPreviewModal`:
  - Imported ruler components and useRulerState hook
  - Added ruler toggle button to PrintPreviewToolbar
  - Implemented keyboard shortcut (Ctrl+Shift+R) for toggling
  - Added horizontal and vertical rulers with the same Google Docs layout
  - Scroll tracking for ruler synchronization in print preview

### Files Modified
- `app/(extra)/canvas/_components/editor.tsx` - Complete layout restructure for Google Docs-style rulers
- `app/dashboard/project/[year]/components/PrintPreviewToolbar.tsx` - Added Ruler toggle button with icon
- `app/dashboard/project/[year]/components/PrintPreviewModal.tsx` - Added ruler integration with useRulerState, horizontal/vertical rulers, scroll tracking, and keyboard shortcut

### Notes for Developer
- The rulers now use CSS transforms (`translateX`/`translateY`) for scroll synchronization rather than being embedded in the scrollable area
- The horizontal ruler has placeholder spaces for sidebars to maintain proper centering alignment with the canvas
- The vertical ruler is positioned before the left sidebar in the DOM to ensure it appears on the far left
- Both `/canvas` and `PrintPreviewModal` now share the same ruler positioning logic
- The corner box (where rulers intersect) only appears when both horizontal and vertical rulers are visible
- Keyboard shortcut `Ctrl+Shift+R` works in both the canvas editor and print preview modal
</summary>