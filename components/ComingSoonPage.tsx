"use client"

import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Home } from "lucide-react"

export default function ComingSoonPage() {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-zinc-950 dark:to-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800">
      <Card className="w-full max-w-2xl shadow-lg dark:bg-zinc-900 dark:border-zinc-800">
        <CardHeader className="text-center space-y-6 pb-4">
          <div className="flex justify-center">
            <svg
              width="240"
              height="180"
              viewBox="0 0 240 180"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-slate-400 dark:text-slate-600"
              aria-hidden="true"
            >
              {/* Construction/Development Scene */}
              {/* Ground line */}
              <line x1="20" y1="140" x2="220" y2="140" stroke="currentColor" strokeWidth="2" />

              {/* Building blocks being assembled */}
              <rect x="60" y="100" width="40" height="40" className="fill-slate-200 dark:fill-zinc-800" stroke="currentColor" strokeWidth="2" />
              <rect x="100" y="100" width="40" height="40" className="fill-slate-300 dark:fill-zinc-700" stroke="currentColor" strokeWidth="2" />
              <rect x="140" y="100" width="40" height="40" className="fill-slate-200 dark:fill-zinc-800" stroke="currentColor" strokeWidth="2" />

              {/* Floating/being placed block with animation */}
              <g className="animate-bounce" style={{ animationDuration: "2s" }}>
                <rect x="100" y="50" width="40" height="40" className="fill-blue-500 dark:fill-blue-600 stroke-blue-800 dark:stroke-blue-400" strokeWidth="2" />
                <circle cx="120" cy="65" r="2" fill="white" opacity="0.6" />
                <circle cx="120" cy="75" r="2" fill="white" opacity="0.6" />
              </g>

              {/* Crane/construction element */}
              <path d="M120 20 L120 45" className="stroke-blue-500 dark:stroke-blue-400" strokeWidth="3" strokeLinecap="round" />
              <path d="M90 25 L150 25" className="stroke-blue-500 dark:stroke-blue-400" strokeWidth="2" strokeLinecap="round" />
              <circle cx="120" cy="20" r="4" className="fill-blue-500 dark:fill-blue-400" />

              {/* Gear icons (representing work in progress) */}
              <g transform="translate(40, 60)">
                <circle cx="0" cy="0" r="12" fill="none" className="stroke-slate-400 dark:stroke-zinc-600" strokeWidth="2" />
                <circle cx="0" cy="0" r="6" className="fill-slate-400 dark:fill-zinc-600" />
                <rect x="-2" y="-14" width="4" height="4" className="fill-slate-400 dark:fill-zinc-600" />
                <rect x="-2" y="10" width="4" height="4" className="fill-slate-400 dark:fill-zinc-600" />
                <rect x="-14" y="-2" width="4" height="4" className="fill-slate-400 dark:fill-zinc-600" />
                <rect x="10" y="-2" width="4" height="4" className="fill-slate-400 dark:fill-zinc-600" />
              </g>

              <g transform="translate(200, 90)">
                <circle cx="0" cy="0" r="10" fill="none" className="stroke-slate-400 dark:stroke-zinc-600" strokeWidth="2" />
                <circle cx="0" cy="0" r="5" className="fill-slate-400 dark:fill-zinc-600" />
                <rect x="-1.5" y="-12" width="3" height="3" className="fill-slate-400 dark:fill-zinc-600" />
                <rect x="-1.5" y="9" width="3" height="3" className="fill-slate-400 dark:fill-zinc-600" />
                <rect x="-12" y="-1.5" width="3" height="3" className="fill-slate-400 dark:fill-zinc-600" />
                <rect x="9" y="-1.5" width="3" height="3" className="fill-slate-400 dark:fill-zinc-600" />
              </g>

              {/* Progress dots */}
              <circle cx="30" cy="140" r="3" className="fill-emerald-500" />
              <circle cx="50" cy="140" r="3" className="fill-slate-400 dark:fill-zinc-600" />
              <circle cx="70" cy="140" r="3" className="fill-slate-400 dark:fill-zinc-600" />
            </svg>
          </div>

          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold text-slate-900 dark:text-slate-100 text-balance">Feature Coming Soon</CardTitle>
            <CardDescription className="text-base text-slate-600 dark:text-zinc-400 text-pretty">
              This feature is currently under development and will be available in an upcoming release.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">


          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {pathname !== "/dashboard" && (
              <Button onClick={() => router.push("/dashboard")} className="gap-2 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200">
                <Home className="h-4 w-4" />
                Return to Dashboard
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
