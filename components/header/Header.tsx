import { useState, useRef } from "react";
import { useSidebar } from "../../contexts/SidebarContext";
import { useCurrentUser } from "@/app/hooks/useCurrentUser";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bug, Loader2, Eye, EyeOff } from "lucide-react";
import { AccountModal } from "../account/AccountModal";
import { UserDropdown } from "./UserDropdown";
import { NotificationsDropdown } from "./NotificationsDropdown";
import { EmailDropdown } from "./EmailDropdown";
import { getDisplayName } from "@/lib/utils";
// import domToImage from "dom-to-image-more"; 
import { ConcernModal } from "./ConcernModal";
import { ScreenshotZoom } from "./ScreenshotZoom";

interface HeaderProps {
  onSearchChange?: (query: string) => void;
  searchQuery?: string;
}

export function Header({ onSearchChange, searchQuery }: HeaderProps) {
  const [showAccountModal, setShowAccountModal] = useState(false);
  const { isMinimized, toggleMinimize } = useSidebar();
  const router = useRouter();
  const pathname = usePathname();
  const [showBugReport, setShowBugReport] = useState(true);

  // Concern Logic State
  const [isCapturing, setIsCapturing] = useState(false);
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [showConcernModal, setShowConcernModal] = useState(false);

  // Initialize state from local storage
  useEffect(() => {
    const stored = localStorage.getItem("showBugReport");
    if (stored !== null) {
      setShowBugReport(JSON.parse(stored));
    }
  }, []);

  const toggleBugReport = () => {
    const newState = !showBugReport;
    setShowBugReport(newState);
    localStorage.setItem("showBugReport", JSON.stringify(newState));
  };

  const handleCaptureConcern = async () => {
    try {
      setIsCapturing(true);

      const domToImage = (await import("dom-to-image-more")).default;

      const dataUrl = await domToImage.toPng(document.body, {
        filter: (node) => true
      });

      setScreenshotUrl(dataUrl);

    } catch (error) {
      console.error("Screenshot capture failed:", error);
      setIsCapturing(false);
    }
  };

  const handleAnimationComplete = () => {
    setShowConcernModal(true);
    // We don't clear screenshotUrl yet because we pass it to the modal
    setIsCapturing(false);
  };

  // ✅ Use your existing useCurrentUser hook - FULLY DYNAMIC with image support!
  const { user, isLoading } = useCurrentUser();

  // Extract user data with proper name handling
  const userName = user ? getDisplayName(user) : "User";

  // Show loading state while fetching user data
  if (isLoading) {
    return (
      <header className="sticky top-0 z-30 bg-[#f8f8f8]/95 dark:bg-zinc-900/95 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 py-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="hidden md:flex p-2 rounded-lg">
                <div className="w-5 h-5 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
              </div>
              <div className="flex flex-col gap-2">
                <div className="h-3 w-24 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
                <div className="h-5 w-32 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
              <div className="w-8 h-8 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
              <div className="w-8 h-8 bg-zinc-200 dark:bg-zinc-700 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      </header>
    );
  }

  // If no user data, show minimal header
  if (!user) {
    return (
      <header className="sticky top-0 z-30 bg-[#f8f8f8]/95 dark:bg-zinc-900/95 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 py-4">
            <div className="flex items-center gap-4 flex-1">
              <button
                onClick={toggleMinimize}
                className="hidden md:flex p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shrink-0"
                title={isMinimized ? "Expand sidebar" : "Minimize sidebar"}
              >
                <svg
                  className="w-5 h-5 text-zinc-600 dark:text-zinc-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {isMinimized ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  )}
                </svg>
              </button>
              <div className="flex flex-col">
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  Welcome back
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-30 bg-[#f8f8f8]/95 dark:bg-zinc-900/95 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 py-4">
            {/* Left section - Sidebar Toggle, Welcome and User Name */}
            <div className="flex items-center gap-4 flex-1">
              {/* Sidebar Toggle Button */}
              <button
                onClick={toggleMinimize}
                className="hidden md:flex p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shrink-0"
                title={isMinimized ? "Expand sidebar" : "Minimize sidebar"}
              >
                <svg
                  className="w-5 h-5 text-zinc-600 dark:text-zinc-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {isMinimized ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  )}
                </svg>
              </button>

              {/* Welcome Message */}
              <div className="flex flex-col">
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  Welcome back,
                </span>
                <span
                  className="text-lg font-semibold text-zinc-900 dark:text-zinc-100"
                  style={{ fontFamily: "var(--font-cinzel), serif" }}
                >
                  {userName}
                </span>
              </div>

              {/* Report Bug Button & Toggle */}
              <div className="ml-4 flex items-center gap-2">
                {showBugReport && (
                  <Button
                    variant="outline"
                    className="rounded-full border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400 gap-2 h-8"
                    onClick={handleCaptureConcern}
                    disabled={isCapturing}
                  >
                    {isCapturing ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Bug className="h-3.5 w-3.5" />
                    )}
                    Report Concerns
                  </Button>
                )}

                <button
                  onClick={toggleBugReport}
                  className="cursor-grab text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors p-1 opacity-50 hover:opacity-100"
                  title={showBugReport ? "Hide Bug Report Button" : "Show Bug Report Button"}
                >
                  {showBugReport ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
              </div>
            </div>

            {/* Right section - Actions */}
            <div className="flex items-center gap-3">
              {/* Email Dropdown */}
              <EmailDropdown />

              {/* Notifications Dropdown */}
              <NotificationsDropdown />

              {/* User Dropdown with Dynamic Avatar */}
              <UserDropdown
                user={user}
                onOpenAccountModal={() => setShowAccountModal(true)}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Account Modal - Portal style overlay */}
      {showAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-5xl">
            <AccountModal onClose={() => setShowAccountModal(false)} />
          </div>
        </div>
      )}

      {/* Screenshot Zoom Animation */}
      <ScreenshotZoom
        screenshotUrl={screenshotUrl}
        onAnimationComplete={handleAnimationComplete}
      />

      {/* Concern Modal */}
      <ConcernModal
        open={showConcernModal}
        onOpenChange={(open) => {
          setShowConcernModal(open);
          if (!open) setScreenshotUrl(null); // Clear screenshot when closed
        }}
        screenshot={screenshotUrl}
      />
    </>
  );
}