// app/dashboard/trust-funds/utils.ts

import { TrustFund } from "./types";
import { AVAILABLE_COLUMNS, STATUS_CONFIG, STATUS_CLASSES } from "./constants";

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (timestamp?: number): string => {
  if (!timestamp) return "—";
  return new Date(timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatStatus = (status?: string): string => {
  if (!status) return "—";
  const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.not_available;
  return config.label;
};

export const getStatusClassName = (status?: string): string => {
  if (!status) return "bg-zinc-100/50 text-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-300";
  return STATUS_CLASSES[status as keyof typeof STATUS_CLASSES] || STATUS_CLASSES.not_available;
};

export const truncateText = (text: string, maxLength: number = 50): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

// 👇 Format percentage helper
export const formatPercentage = (value?: number): string => {
  if (value === undefined || value === null) return "—";
  return `${value.toFixed(2)}%`;
};

// 👇 Calculate utilization rate helper
export const calculateUtilizationRate = (utilized: number, received: number): number => {
  if (received === 0) return 0;
  return (utilized / received) * 100;
};

export const exportToCSV = (
  data: TrustFund[], 
  hiddenColumns: Set<string>, 
  year?: number
): void => {
  try {
    const headers = AVAILABLE_COLUMNS
      .filter(col => !hiddenColumns.has(col.id))
      .map(col => col.label);
    
    const rows = data.map(item => 
      AVAILABLE_COLUMNS
        .filter(col => !hiddenColumns.has(col.id))
        .map(col => {
          switch(col.id) {
            case "projectTitle": return item.projectTitle;
            case "officeInCharge": return item.officeInCharge;
            case "status": return formatStatus(item.status);
            case "dateReceived": return formatDate(item.dateReceived as any);
            case "received": return item.received;
            case "obligatedPR": return item.obligatedPR || 0;
            case "utilized": return item.utilized;
            case "utilizationRate": 
              return item.utilizationRate?.toFixed(2) || 
                     calculateUtilizationRate(item.utilized, item.received).toFixed(2);
            case "balance": return item.balance;
            case "remarks": return item.remarks || "";
            default: return "";
          }
        })
    );
    
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `trust-funds-${year || 'all'}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    throw new Error("Failed to export CSV");
  }
};

export const printTable = (orientation: 'portrait' | 'landscape'): void => {
  const style = document.createElement('style');
  style.textContent = `
    @page {
      size: ${orientation === 'portrait' ? 'A4 portrait' : 'A4 landscape'};
      margin: 0.5in;
    }
    @media print {
      .no-print { display: none !important; }
      .print-area { break-inside: avoid; }
      body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
    }
  `;
  document.head.appendChild(style);
  
  setTimeout(() => {
    window.print();
    document.head.removeChild(style);
  }, 100);
};

/**
 * Creates a URL-safe slug from trust fund data
 * Format: {slugified-project-title}-{id}
 * Example: "construction-of-school-building-abc123"
 */
export const createTrustFundSlug = (projectTitle: string, id: string): string => {
  const slug = projectTitle
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${slug}-${id}`;
};

// 👇 Calculate totals including utilization rate
export const calculateTotals = (data: TrustFund[]) => {
  const totals = data.reduce(
    (acc, item) => {
      acc.received += item.received;
      acc.obligatedPR += item.obligatedPR || 0;
      acc.utilized += item.utilized;
      acc.balance += item.balance;
      return acc;
    },
    { received: 0, obligatedPR: 0, utilized: 0, balance: 0 }
  );

  // Calculate average utilization rate for totals
  const avgUtilizationRate = totals.received > 0 
    ? (totals.utilized / totals.received) * 100 
    : 0;

  return {
    ...totals,
    utilizationRate: avgUtilizationRate,
  };
};