/**
 * Shared types for Inspection-related components
 */

export interface Inspection {
  _id: string
  title: string
  programNumber?: string
  category?: string
  inspectionDate: number
  status: "pending" | "in_progress" | "completed" | "cancelled"
  viewCount: number
  imageCount: number
  thumbnails?: string[]
  remarks?: string
}
