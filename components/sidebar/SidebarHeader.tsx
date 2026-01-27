"use client";

import React from "react";

export function SidebarHeader({ isMinimized, onCloseMobile }: { isMinimized: boolean; onCloseMobile: () => void }) {
  return (
    <div className="min-h-20 px-4 sm:px-6 py-4 flex items-center justify-center border-b border-zinc-200 dark:border-zinc-800 relative">
      <div className={`flex flex-col items-center gap-2 transition-opacity duration-300 ${isMinimized ? "md:opacity-0 md:absolute md:pointer-events-none" : ""}`}>
        <div className="flex items-center gap-1">
          <img src="/logo.png" alt="Provincial Government of Tarlac Logo" className="h-16 object-contain shrink-0" />
          <img src="/y.png" alt="PPDO Logo" className="h-16 object-contain shrink-0" />
        </div>
        <div className="flex flex-col items-center leading-tight">
          <h2 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm leading-tight text-center">Provincial Planning and Development Office</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-tight">Tarlac</p>
        </div>
      </div>

      <div className={`hidden md:flex items-center justify-center w-full transition-opacity duration-300 ${isMinimized ? "opacity-100" : "opacity-0 absolute pointer-events-none"}`}>
        <img src="/logo.png" alt="Provincial Government of Tarlac Logo" className="h-20 w-20 object-contain" />
      </div>

      <button onClick={onCloseMobile} className="md:hidden p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shrink-0 absolute right-0" aria-label="Close Sidebar">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
