"use client";

import {
    Building2,
    GraduationCap,
    HeartPulse,
    LockKeyhole,
    Wallet,
    ArrowLeft,
    TrendingUp
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ComingSoonPage from "@/components/ComingSoonPage";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface DashboardFundSelectionProps {
    onSelectBudget: () => void;
    onBack?: () => void;
}

export function DashboardFundSelection({ onSelectBudget, onBack }: DashboardFundSelectionProps) {
    const [showComingSoon, setShowComingSoon] = useState<string | null>(null);

    if (showComingSoon) {
        return (
            <div className="space-y-4">
                <button
                    onClick={() => setShowComingSoon(null)}
                    className="cursor-grab flex items-center text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
                >
                    ← Back to Fund Selection
                </button>
                <ComingSoonPage />
                {/* Note: ComingSoonPage usually has its own layout, we might need to adjust it or wrap it if it has a full screen layout */}
            </div>
        );
    }

    const funds = [
        {
            id: "budget",
            title: "Budget",
            description: "Manage and track annual fiscal budgets and allocations",
            icon: Wallet,
            color: "text-green-600 dark:text-green-400",
            bgColor: "bg-green-50 dark:bg-green-900/20",
            borderColor: "hover:border-green-600 dark:hover:border-green-500",
            onClick: onSelectBudget,
            active: true,
        },
        {
            id: "twenty-percent-df",
            title: "20% DF",
            description: "Montior 20% Development Fund projects and allocations",
            icon: TrendingUp,
            color: "text-emerald-600 dark:text-emerald-400",
            bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
            borderColor: "hover:border-emerald-600 dark:hover:border-emerald-500",
            onClick: () => setShowComingSoon("20% DF"),
            active: false,
        },
        {
            id: "trust",
            title: "Trust Funds",
            description: "Monitor trust fund deposits, utilization, and balances",
            icon: LockKeyhole,
            color: "text-blue-600 dark:text-blue-400",
            bgColor: "bg-blue-50 dark:bg-blue-900/20",
            borderColor: "hover:border-blue-600 dark:hover:border-blue-500",
            onClick: () => setShowComingSoon("Trust Funds"),
            active: false,
        },
        {
            id: "education",
            title: "Special Education Funds",
            description: "Track SEF utilization for school board projects",
            icon: GraduationCap,
            color: "text-purple-600 dark:text-purple-400",
            bgColor: "bg-purple-50 dark:bg-purple-900/20",
            borderColor: "hover:border-purple-600 dark:hover:border-purple-500",
            onClick: () => setShowComingSoon("Special Education Funds"),
            active: false,
        },
        {
            id: "health",
            title: "Special Health Funds",
            description: "Oversee health fund allocations and medical programs",
            icon: HeartPulse,
            color: "text-rose-600 dark:text-rose-400",
            bgColor: "bg-rose-50 dark:bg-rose-900/20",
            borderColor: "hover:border-rose-600 dark:hover:border-rose-500",
            onClick: () => setShowComingSoon("Special Health Funds"),
            active: false,
        },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-3">
                    {onBack && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onBack}
                            className="mr-1 -ml-2 md:hidden"
                        >
                            <ArrowLeft className="w-6 h-6 text-zinc-700 dark:text-zinc-300" />
                        </Button>
                    )}
                    <Building2 className="w-8 h-8 text-zinc-700 dark:text-zinc-300" />
                    Dashboard
                </h1>
                <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl">
                    Select a fund source to view its detailed analytics, performance metrics, and financial status.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {funds.map((fund) => (
                    <Card
                        key={fund.id}
                        className={cn(
                            "group relative p-6 cursor-pointer transition-all duration-300 border-2 overflow-hidden",
                            "hover:shadow-xl hover:-translate-y-1",
                            fund.borderColor,
                            "border-zinc-200 dark:border-zinc-800"
                        )}
                        onClick={fund.onClick}
                    >
                        <div className={cn(
                            "absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity translate-x-10 -translate-y-10",
                            fund.bgColor.replace("/20", "") // Use stronger color for blur
                        )} />

                        <div className="relative z-10 flex items-start gap-4">
                            <div className={cn("p-3 rounded-xl", fund.bgColor)}>
                                <fund.icon className={cn("w-8 h-8", fund.color)} />
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                                        {fund.title}
                                    </h3>
                                    {!fund.active && (
                                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-zinc-100 text-zinc-500 rounded-full dark:bg-zinc-800 dark:text-zinc-400">
                                            Soon
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                                    {fund.description}
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 flex items-center text-sm font-semibold text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-200 transition-colors">
                            Access Folder Years <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
