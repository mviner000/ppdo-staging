// app/mail/layout.tsx

"use client";

import { Sidebar } from "../dashboard/components/Sidebar";
import { Header } from "../dashboard/components/Header";
import { Breadcrumbs } from "../dashboard/components/Breadcrumbs";
import { TimeLocation } from "../dashboard/components/TimeLocation";
import AIAssistant from "../dashboard/components/AIAssistant";
import { SearchProvider } from "../dashboard/contexts/SearchContext";
import { SidebarProvider } from "../dashboard/contexts/SidebarContext";
import { AccentColorProvider } from "../dashboard/contexts/AccentColorContext";
import { BreadcrumbProvider } from "../dashboard/contexts/BreadcrumbContext";

function MailContent({ children }: { children: React.ReactNode }) {
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
      <AIAssistant />
    </div>
  );
}

export default function MailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SearchProvider>
      <SidebarProvider>
        <AccentColorProvider>
          <BreadcrumbProvider>
            <MailContent>{children}</MailContent>
          </BreadcrumbProvider>
        </AccentColorProvider>
      </SidebarProvider>
    </SearchProvider>
  );
}

