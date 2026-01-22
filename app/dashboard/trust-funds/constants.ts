// app/dashboard/trust-funds/constants.ts

export const AVAILABLE_COLUMNS = [
  { id: "projectTitle", label: "Project Title", resizable: true },
  { id: "officeInCharge", label: "Office In-Charge" },
  { id: "status", label: "Status" },
  { id: "dateReceived", label: "Date Received" },
  { id: "received", label: "Received" },
  { id: "obligatedPR", label: "Obligated PR" },
  { id: "utilized", label: "Utilized" },
  { id: "balance", label: "Balance" },
  { id: "remarks", label: "Remarks", resizable: true },
] as const;

export const DEFAULT_COLUMN_WIDTHS = {
  projectTitle: 260,
  remarks: 200,
} as const;

export const COLUMN_WIDTHS_STORAGE_KEY = "trustFundsTableColumnWidths";

export const MIN_COLUMN_WIDTH = 150;

// Status column width - easily adjustable by developers
export const STATUS_COLUMN_WIDTH = 140;

export const STATUS_CONFIG = {
  not_available: { 
    label: "Not Available", 
    className: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
    dotColor: "bg-zinc-400"
  },
  not_yet_started: { 
    label: "Not Yet Started", 
    className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    dotColor: "bg-zinc-400"
  },
  ongoing: { 
    label: "Ongoing", 
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    dotColor: "bg-zinc-500"
  },
  completed: { 
    label: "Completed", 
    className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    dotColor: "bg-zinc-600"
  },
  active: { 
    label: "Active", 
    className: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    dotColor: "bg-zinc-700"
  },
} as const;

export const STATUS_CLASSES = {
  not_available: "bg-zinc-100/50 text-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-300",
  not_yet_started: "bg-zinc-100/50 text-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-300",
  ongoing: "bg-zinc-200/50 text-zinc-800 dark:bg-zinc-700/50 dark:text-zinc-200",
  completed: "bg-zinc-300/50 text-zinc-900 dark:bg-zinc-600/50 dark:text-zinc-100",
  active: "bg-zinc-400/50 text-zinc-900 dark:bg-zinc-500/50 dark:text-zinc-100",
} as const;