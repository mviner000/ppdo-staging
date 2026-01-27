"use client"

import React, { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { Inspection } from "../types/inspection"

interface InspectionGalleryModalProps {
  isOpen: boolean
  onClose: () => void
  inspection: Inspection
}

export function InspectionGalleryModal({
  isOpen,
  onClose,
  inspection,
}: InspectionGalleryModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const images = inspection.thumbnails || []

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") handleNext()
    if (e.key === "ArrowLeft") handlePrev()
    if (e.key === "Escape") onClose()
  }

  if (!isOpen || images.length === 0) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col" onKeyDown={handleKeyDown}>
        <DialogHeader className="flex flex-row items-center justify-between">
          <div>
            <DialogTitle>{inspection.title}</DialogTitle>
            <DialogDescription>
              Image {currentIndex + 1} of {images.length}
            </DialogDescription>
          </div>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
          >
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>

        {/* Image Display */}
        <div className="flex-1 flex items-center justify-center overflow-auto bg-black/5 dark:bg-black/50 rounded-lg">
          <img
            src={images[currentIndex]}
            alt={`${inspection.title} - Image ${currentIndex + 1}`}
            className="max-w-full max-h-full object-contain"
          />
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-between gap-4 mt-6">
          <Button
            onClick={handlePrev}
            variant="outline"
            size="sm"
            disabled={images.length <= 1}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          {/* Thumbnail Strip */}
          <div className="flex gap-2 flex-1 overflow-x-auto pb-2">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`flex-shrink-0 w-16 h-16 rounded-md border-2 overflow-hidden transition-all ${
                  idx === currentIndex
                    ? "border-[#4FBA76] ring-2 ring-[#4FBA76]/30"
                    : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                }`}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>

          <Button
            onClick={handleNext}
            variant="outline"
            size="sm"
            disabled={images.length <= 1}
            className="gap-2"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
