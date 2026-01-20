// app/components/Spreadsheet/utils/textTransform.ts

/**
 * Transform text to different cases
 */
export function transformText(
  text: string,
  transform: "uppercase" | "lowercase" | "camelCase" | "reset"
): string {
  if (!text) return text;

  switch (transform) {
    case "uppercase":
      return text.toUpperCase();
      
    case "lowercase":
      return text.toLowerCase();
      
    case "camelCase":
      return toCamelCase(text);
      
    case "reset":
      // For reset, we'll return the original text
      // In a real implementation, you'd store the original values
      return text;
      
    default:
      return text;
  }
}

/**
 * Convert text to camelCase
 */
function toCamelCase(text: string): string {
  // Handle if text is already formatted (has spaces, hyphens, underscores)
  return text
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, '')
    .replace(/-/g, '')
    .replace(/_/g, '');
}

/**
 * Convert text to PascalCase
 */
export function toPascalCase(text: string): string {
  return text
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => word.toUpperCase())
    .replace(/\s+/g, '')
    .replace(/-/g, '')
    .replace(/_/g, '');
}

/**
 * Convert text to kebab-case
 */
export function toKebabCase(text: string): string {
  return text
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

/**
 * Convert text to snake_case
 */
export function toSnakeCase(text: string): string {
  return text
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase();
}

/**
 * Capitalize first letter of each word (Title Case)
 */
export function toTitleCase(text: string): string {
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}