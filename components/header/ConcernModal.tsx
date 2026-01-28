"use client";

import { useState, useEffect } from "react";
import {
    ResizableModal,
    ResizableModalContent,
    ResizableModalHeader,
    ResizableModalTitle,
    ResizableModalDescription,
    ResizableModalBody,
} from "@/components/ui/resizable-modal";
import { Button } from "@/components/ui/button";
import { Bug, Lightbulb, ArrowLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

// Dynamic imports for performance
const BugReportForm = dynamic(() => import("@/components/maintenance/BugReportForm").then(mod => mod.BugReportForm), {
    loading: () => <div className="flex justify-center p-8"><Loader2 className="animate-spin w-8 h-8 opacity-50" /></div>
});

const SuggestionForm = dynamic(() => import("@/components/maintenance/SuggestionForm").then(mod => mod.SuggestionForm), {
    loading: () => <div className="flex justify-center p-8"><Loader2 className="animate-spin w-8 h-8 opacity-50" /></div>
});

interface ConcernModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    screenshot: string | null;
}

type ConcernType = "bug" | "suggestion" | null;

export function ConcernModal({ open, onOpenChange, screenshot }: ConcernModalProps) {
    const router = useRouter();
    const [step, setStep] = useState<"selection" | "form">("selection");
    const [type, setType] = useState<ConcernType>(null);


    // Reset state when modal is closed
    useEffect(() => {
        if (!open) {
            setTimeout(() => {
                setStep("selection");
                setType(null);
            }, 300);
        }
    }, [open]);

    const handleSuccess = (id: string) => {
        const path = type === "bug"
            ? `/dashboard/settings/updates/bugs-report/${id}`
            : `/dashboard/settings/updates/suggestions/${id}`;

        // Slightly delayed closed to allow toast to show if needed, though form handles toast.
        // Form handles the toast.
        onOpenChange(false);
        // Optional: Navigate to detail page
        router.push(path);
    };

    return (
        <ResizableModal open={open} onOpenChange={onOpenChange}>
            <ResizableModalContent className="sm:max-w-[800px] sm:max-h-[80vh] flex flex-col" allowOverflow>

                {step === "selection" ? (
                    <>
                        <ResizableModalHeader>
                            <ResizableModalTitle>Report Concerns</ResizableModalTitle>
                            <ResizableModalDescription>
                                How can we help you today?
                            </ResizableModalDescription>
                        </ResizableModalHeader>
                        <ResizableModalBody className="p-6 flex flex-col md:flex-row gap-4 items-center justify-center">

                            {/* Suggestion Card */}
                            <div
                                onClick={() => { setType("suggestion"); setStep("form"); }}
                                className="flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-700 hover:border-[#15803D] dark:hover:border-[#15803D] hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all cursor-pointer w-full md:w-1/2 h-64 group"
                            >
                                <div className="p-4 rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 mb-4 group-hover:scale-110 transition-transform">
                                    <Lightbulb size={32} />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">Make a Suggestion</h3>
                                <p className="text-center text-zinc-500 dark:text-zinc-400 text-sm">
                                    Have an idea to improve the app? Let us know!
                                </p>
                            </div>

                            {/* Bug Report Card */}
                            <div
                                onClick={() => { setType("bug"); setStep("form"); }}
                                className="flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-700 hover:border-red-500 dark:hover:border-red-500 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all cursor-pointer w-full md:w-1/2 h-64 group"
                            >
                                <div className="p-4 rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 mb-4 group-hover:scale-110 transition-transform">
                                    <Bug size={32} />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">Report a Bug</h3>
                                <p className="text-center text-zinc-500 dark:text-zinc-400 text-sm">
                                    Something not working right? Tell us about it.
                                </p>
                            </div>

                        </ResizableModalBody>
                    </>
                ) : (
                    <>
                        <ResizableModalHeader className="flex flex-row items-center gap-2 border-b-0 pb-2">
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => setStep("selection")}
                                className="mr-2"
                            >
                                <ArrowLeft size={16} />
                            </Button>
                            <div className="flex flex-col">
                                <ResizableModalTitle>
                                    {type === "bug" ? "Report a Bug" : "Make a Suggestion"}
                                </ResizableModalTitle>
                                <ResizableModalDescription>
                                    {type === "bug"
                                        ? "Describe the issue you encountered."
                                        : "Share your ideas for improvement."}
                                </ResizableModalDescription>
                            </div>
                        </ResizableModalHeader>

                        <ResizableModalBody className="p-6 space-y-4 pt-2">
                            {type === "bug" ? (
                                <BugReportForm
                                    onSuccess={handleSuccess}
                                    onCancel={() => onOpenChange(false)}
                                    screenshot={screenshot}
                                />
                            ) : (
                                <SuggestionForm
                                    onSuccess={handleSuccess}
                                    onCancel={() => onOpenChange(false)}
                                    screenshot={screenshot}
                                />
                            )}
                        </ResizableModalBody>
                    </>
                )}
            </ResizableModalContent>
        </ResizableModal>
    );
}

