// app/dashboard/project/[year]/[particularId]/[projectbreakdownId]/utils/page-helpers.ts

/**
 * Extracts project ID from a slug string
 * Looks for the longest alphanumeric segment (>15 chars) from right to left
 */
export const extractProjectId = (slugWithId: string): string => {
  const parts = slugWithId.split('-');
  for (let i = parts.length - 1; i >= 0; i--) {
    const part = parts[i];
    if (part.length > 15 && /^[a-z0-9]+$/i.test(part)) {
      return part;
    }
  }
  return parts[parts.length - 1];
};

/**
 * Maps particular ID to full name
 */
export const getParticularFullName = (particular: string): string => {
  const mapping: { [key: string]: string } = {
    GAD: "Gender and Development (GAD)",
    LDRRMP: "Local Disaster Risk Reduction and Management Plan",
    LDRRMF: "Local Disaster Risk Reduction and Management Plan",
    LCCAP: "Local Climate Change Action Plan",
    LCPC: "Local Council for the Protection of Children",
    SCPD: "Sectoral Committee for Persons with Disabilities",
    POPS: "Provincial Operations",
    CAIDS: "Community Affairs and Information Development Services",
    LNP: "Local Nutrition Program",
    PID: "Provincial Information Department",
    ACDP: "Agricultural Competitiveness Development Program",
    LYDP: "Local Youth Development Program",
    "20%_DF": "20% Development Fund",
  };
  return mapping[particular] || particular;
};

/**
 * Returns Tailwind classes for status colors
 */
export const getStatusColor = (status?: "completed" | "ongoing" | "delayed" | string): string => {
  if (!status) return "text-zinc-600 dark:text-zinc-400";
  switch (status.toLowerCase()) {
    case "completed": return "text-green-600 dark:text-green-400";
    case "ongoing": return "text-blue-600 dark:text-blue-400";
    case "delayed": return "text-red-600 dark:text-red-400";
    default: return "text-zinc-600 dark:text-zinc-400";
  }
};

/**
 * Formats timestamp to readable date
 */
export const formatDate = (timestamp?: number): string => {
  if (!timestamp) return "N/A";
  return new Intl.DateTimeFormat("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(timestamp));
};