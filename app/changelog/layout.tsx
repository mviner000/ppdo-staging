// app/changelog/layout.tsx

"use client";


import { Header } from "../../components/header/Header";
import { Breadcrumbs } from "../../components/Breadcrumbs";
import { TimeLocation } from "../../components/TimeLocation";

import { SearchProvider } from "../../contexts/SearchContext";
import { SidebarProvider } from "../../contexts/SidebarContext";
import { AccentColorProvider } from "../../contexts/AccentColorContext";
import { BreadcrumbProvider } from "../../contexts/BreadcrumbContext";
import { Sidebar } from "../../components/sidebar/Sidebar";

function ChangeLogContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-[#f8f8f8] dark:bg-zinc-950 flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="flex-1">
                <Breadcrumbs />
              </div>
              <TimeLocation />
            </div>
            {children}
          </div>
        </main>
      </div>
      {/* AI Assistant */}

    </div>
  );
}

export default function ChangelogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SearchProvider>
      <SidebarProvider>
        <AccentColorProvider>
          <BreadcrumbProvider>
            <ChangeLogContent>{children}</ChangeLogContent>
          </BreadcrumbProvider>
        </AccentColorProvider>
      </SidebarProvider>
    </SearchProvider>
  );
}

