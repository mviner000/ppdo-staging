"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar, Loader2, CheckCircle2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useAccentColor } from "@/contexts/AccentColorContext";

const currentYear = new Date().getFullYear();
const maxYear = currentYear + 300;

const fiscalYearSchema = z.object({
    year: z
        .number()
        .int()
        .min(1, { message: "Year must be at least 1 AD" })
        .max(maxYear, { message: `Year cannot exceed ${maxYear}` }),
    label: z.string().optional(),
    description: z.string().optional(),
    setAsCurrent: z.boolean().default(false),
    notes: z.string().optional(),
});

type FiscalYearFormValues = z.infer<typeof fiscalYearSchema>;

interface FiscalYearModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export function FiscalYearModal({
    isOpen,
    onClose,
    onSuccess,
}: FiscalYearModalProps) {
    const { accentColorValue } = useAccentColor();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showRedirectModal, setShowRedirectModal] = useState(false);
    const [createdYear, setCreatedYear] = useState<number | null>(null);

    const createFiscalYear = useMutation(api.fiscalYears.create);

    const form = useForm({
        resolver: zodResolver(fiscalYearSchema),
        defaultValues: {
            year: currentYear,
            label: "",
            description: "",
            setAsCurrent: false,
            notes: "",
        },
    });

    const handleClose = () => {
        form.reset();
        setIsSubmitting(false);
        setShowRedirectModal(false);
        setCreatedYear(null);
        onClose();
    };

    const handleRedirectYes = () => {
        if (createdYear) {
            router.push(`/dashboard/project/${createdYear}`);
            handleClose();
        }
    };

    const handleRedirectNo = () => {
        handleClose();
        if (onSuccess) onSuccess();
    };

    async function onSubmit(values: any) {
        const typedValues = values as FiscalYearFormValues;
        setIsSubmitting(true);
        try {
            const result = await createFiscalYear({
                year: typedValues.year,
                label: typedValues.label || undefined,
                description: typedValues.description || undefined,
                setAsCurrent: typedValues.setAsCurrent,
                notes: typedValues.notes || undefined,
            });

            if (result.success) {
                toast.success("Fiscal Year Created", {
                    description: `Successfully created fiscal year ${typedValues.year}`,
                });
                setCreatedYear(typedValues.year);
                setShowRedirectModal(true);
            } else {
                toast.error("Failed to create fiscal year");
            }
        } catch (error: any) {
            console.error("Error creating fiscal year:", error);
            toast.error("Error", {
                description: error.message || "Failed to create fiscal year",
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    // Redirect Modal
    if (showRedirectModal && createdYear) {
        return (
            <Dialog open={showRedirectModal} onOpenChange={handleClose}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                            <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <DialogTitle className="text-center">
                            Fiscal Year {createdYear} Created!
                        </DialogTitle>
                        <DialogDescription className="text-center">
                            Would you like to navigate to the budget page for {createdYear} to start adding budget items?
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-3">
                        <Button
                            variant="outline"
                            onClick={handleRedirectNo}
                            className="w-full sm:w-auto order-2 sm:order-1"
                        >
                            Stay Here
                        </Button>
                        <Button
                            onClick={handleRedirectYes}
                            className="w-full sm:w-auto order-1 sm:order-2 text-white"
                            style={{ backgroundColor: accentColorValue }}
                        >
                            <span className="flex items-center gap-2">
                                Go to {createdYear} Budget
                                <ArrowRight className="w-4 h-4" />
                            </span>
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    }

    // Main Form Modal
    return (
        <Dialog open={isOpen && !showRedirectModal} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div
                            className="flex h-10 w-10 items-center justify-center rounded-lg"
                            style={{ backgroundColor: `${accentColorValue}20` }}
                        >
                            <Calendar
                                className="h-5 w-5"
                                style={{ color: accentColorValue }}
                            />
                        </div>
                        <div>
                            <DialogTitle>Create Year</DialogTitle>
                            <DialogDescription>
                                Add year for budget management
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4 py-4"
                        style={{ animation: "slideDown 300ms ease-out" }}
                    >
                        <FormField
                            control={form.control as any}
                            name="year"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-zinc-700 dark:text-zinc-300">
                                        Year <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            placeholder="e.g., 2024"
                                            className="bg-white dark:bg-zinc-900"
                                            {...field}
                                            onChange={(e) => {
                                                const value = e.target.value.trim();
                                                field.onChange(value ? parseInt(value) : "");
                                            }}
                                            value={field.value || ""}
                                        />
                                    </FormControl>
                                    <FormDescription className="text-xs">
                                        Valid range: 1 AD to {maxYear}
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control as any}
                            name="label"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-zinc-700 dark:text-zinc-300">
                                        Label{" "}
                                        <span className="text-xs text-zinc-500">(Optional)</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="e.g., FY 2024-2025"
                                            className="bg-white dark:bg-zinc-900"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription className="text-xs">
                                        Custom display name for this year
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control as any}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-zinc-700 dark:text-zinc-300">
                                        Description{" "}
                                        <span className="text-xs text-zinc-500">(Optional)</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Brief description of this year..."
                                            className="bg-white dark:bg-zinc-900 resize-none"
                                            rows={3}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control as any}
                            name="setAsCurrent"
                            render={({ field }) => (
                                <FormItem className="hidden flex-row items-start space-x-3 space-y-0 rounded-md border border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-50 dark:bg-zinc-900/50">
                                    <FormControl>
                                        <input
                                            type="checkbox"
                                            checked={field.value}
                                            onChange={field.onChange}
                                            className="mt-1 h-4 w-4 rounded border-zinc-300 text-amber-600 focus:ring-amber-500"
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel className="text-sm font-medium cursor-pointer">
                                            Set as Current Fiscal Year
                                        </FormLabel>
                                        <FormDescription className="text-xs">
                                            This will unset any existing current year
                                        </FormDescription>
                                    </div>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control as any}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-zinc-700 dark:text-zinc-300">
                                        Notes{" "}
                                        <span className="text-xs text-zinc-500">(Optional)</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Additional notes..."
                                            className="bg-white dark:bg-zinc-900 resize-none"
                                            rows={2}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="gap-2 sm:gap-3">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={handleClose}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="text-white"
                                style={{ backgroundColor: accentColorValue }}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    "Create Year"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
