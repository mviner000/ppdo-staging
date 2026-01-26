"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAccentColor } from "@/contexts/AccentColorContext";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { BaseFund } from "../types";
import { ImplementingOfficeSelector } from "@/components/ppdo/table/implementing-office";
import { formatCurrency } from "../utils";

const fundSchema = z.object({
    projectTitle: z.string().min(1, { message: "Project title is required" }),
    officeInCharge: z.string().min(1, { message: "Office in charge is required" }),
    dateReceived: z.string().optional(),
    received: z.number().min(0, { message: "Must be 0 or greater" }),
    obligatedPR: z.number().min(0).optional(),
    utilized: z.number().min(0),
    status: z.enum(["not_available", "not_yet_started", "ongoing", "completed", "active"]),
    remarks: z.string().optional(),
    year: z.number().int().min(2000).max(2100).optional(),
});

type FundFormValues = z.infer<typeof fundSchema>;

interface FundFormProps {
    fund?: BaseFund | null;
    onSave: (data: any) => void;
    onCancel: () => void;
    year?: number;
}

const formatNumberWithCommas = (value: string): string => {
    const cleaned = value.replace(/[^\d.]/g, '');
    const parts = cleaned.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    if (parts.length > 1) return parts[0] + '.' + parts[1].slice(0, 2);
    return parts[0];
};

const parseFormattedNumber = (value: string): number => {
    const cleaned = value.replace(/,/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
};

const formatNumberForDisplay = (value: number): string => {
    if (value === 0) return '';
    return new Intl.NumberFormat('en-PH', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(value);
};

const timestampToDateString = (timestamp?: number): string => {
    if (!timestamp) return "";
    return new Date(timestamp).toISOString().split('T')[0];
};

export function FundForm({ fund, onSave, onCancel, year }: FundFormProps) {
    const { accentColorValue } = useAccentColor();

    const [displayReceived, setDisplayReceived] = useState("");
    const [displayObligated, setDisplayObligated] = useState("");
    const [displayUtilized, setDisplayUtilized] = useState("");

    const isYearFromUrl = year !== undefined;

    const form = useForm<FundFormValues>({
        resolver: zodResolver(fundSchema),
        defaultValues: {
            projectTitle: fund?.projectTitle || "",
            officeInCharge: fund?.officeInCharge || "",
            dateReceived: timestampToDateString(fund?.dateReceived),
            received: fund?.received || 0,
            obligatedPR: fund?.obligatedPR || undefined,
            utilized: fund?.utilized || 0,
            status: (fund?.status as any) || "not_available",
            remarks: fund?.remarks || "",
            year: fund?.year || year || new Date().getFullYear(),
        },
    });

    useEffect(() => {
        const received = form.getValues("received");
        const obligated = form.getValues("obligatedPR");
        const utilized = form.getValues("utilized");

        if (received > 0) setDisplayReceived(formatNumberForDisplay(received));
        if (obligated && obligated > 0) setDisplayObligated(formatNumberForDisplay(obligated));
        if (utilized && utilized > 0) setDisplayUtilized(formatNumberForDisplay(utilized));
    }, [form]);

    const received = form.watch("received");
    const utilized = form.watch("utilized");
    const balance = received - utilized;
    const utilizationRate = received > 0 ? (utilized / received) * 100 : 0;

    function onSubmit(values: FundFormValues) {
        const dateReceivedTimestamp = values.dateReceived && values.dateReceived.trim()
            ? new Date(values.dateReceived).getTime()
            : undefined;

        if (!values.status) {
            form.setError("status", {
                type: "manual",
                message: "Please select a status"
            });
            return;
        }

        const payload = {
            projectTitle: values.projectTitle,
            officeInCharge: values.officeInCharge,
            dateReceived: dateReceivedTimestamp,
            received: values.received,
            obligatedPR: values.obligatedPR && values.obligatedPR > 0 ? values.obligatedPR : undefined,
            utilized: values.utilized,
            status: values.status,
            remarks: values.remarks || undefined,
            year: values.year || undefined,
        };

        onSave(payload);
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="projectTitle"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-zinc-700 dark:text-zinc-300">
                                Project Title
                            </FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Enter project title..."
                                    className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="officeInCharge"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-zinc-700 dark:text-zinc-300">
                                Office In-Charge
                            </FormLabel>
                            <FormControl>
                                <ImplementingOfficeSelector
                                    value={field.value}
                                    onChange={field.onChange}
                                    disabled={false}
                                    error={form.formState.errors.officeInCharge?.message}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-zinc-700 dark:text-zinc-300">
                                    Status <span className="text-red-500">*</span>
                                </FormLabel>
                                <Select
                                    value={field.value}
                                    onValueChange={field.onChange}
                                >
                                    <FormControl>
                                        <SelectTrigger className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700">
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="not_available">-</SelectItem>
                                        <SelectItem value="not_yet_started">Not Yet Started</SelectItem>
                                        <SelectItem value="ongoing">Ongoing</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="dateReceived"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-zinc-700 dark:text-zinc-300">
                                    Date Received <span className="text-xs text-zinc-500">(Optional)</span>
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        type="date"
                                        className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700"
                                        {...field}
                                        value={field.value || ""}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="year"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-zinc-700 dark:text-zinc-300">
                                    Year
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        placeholder="e.g. 2024"
                                        min="2000"
                                        max="2100"
                                        className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700"
                                        disabled={isYearFromUrl}
                                        {...field}
                                        value={field.value || ""}
                                        onChange={(e) => {
                                            const value = e.target.value.trim();
                                            field.onChange(value ? parseInt(value) : undefined);
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="received"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-zinc-700 dark:text-zinc-300">
                                Total Received
                            </FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500">
                                        ₱
                                    </span>
                                    <Input
                                        placeholder="0"
                                        className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 pl-8"
                                        value={displayReceived}
                                        onChange={(e) => {
                                            const formatted = formatNumberWithCommas(e.target.value);
                                            setDisplayReceived(formatted);
                                            field.onChange(parseFormattedNumber(formatted));
                                        }}
                                        onBlur={() => {
                                            const numericValue = parseFormattedNumber(displayReceived);
                                            if (numericValue > 0) {
                                                setDisplayReceived(formatNumberForDisplay(numericValue));
                                            } else {
                                                setDisplayReceived("");
                                            }
                                            field.onChange(numericValue);
                                        }}
                                    />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="obligatedPR"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-zinc-700 dark:text-zinc-300">
                                    Obligated PR <span className="text-xs text-zinc-500">(Optional)</span>
                                </FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500">
                                            ₱
                                        </span>
                                        <Input
                                            placeholder="0"
                                            className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 pl-8"
                                            value={displayObligated}
                                            onChange={(e) => {
                                                const formatted = formatNumberWithCommas(e.target.value);
                                                setDisplayObligated(formatted);
                                                const numericValue = parseFormattedNumber(formatted);
                                                field.onChange(numericValue > 0 ? numericValue : undefined);
                                            }}
                                            onBlur={() => {
                                                const numericValue = parseFormattedNumber(displayObligated);
                                                if (numericValue > 0) {
                                                    setDisplayObligated(formatNumberForDisplay(numericValue));
                                                } else {
                                                    setDisplayObligated("");
                                                }
                                                field.onChange(numericValue > 0 ? numericValue : undefined);
                                            }}
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="utilized"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-zinc-700 dark:text-zinc-300">
                                    Utilized
                                </FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500">
                                            ₱
                                        </span>
                                        <Input
                                            placeholder="0"
                                            className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 pl-8"
                                            value={displayUtilized}
                                            onChange={(e) => {
                                                const formatted = formatNumberWithCommas(e.target.value);
                                                setDisplayUtilized(formatted);
                                                field.onChange(parseFormattedNumber(formatted));
                                            }}
                                            onBlur={() => {
                                                const numericValue = parseFormattedNumber(displayUtilized);
                                                if (numericValue > 0) {
                                                    setDisplayUtilized(formatNumberForDisplay(numericValue));
                                                } else {
                                                    setDisplayUtilized("");
                                                }
                                                field.onChange(numericValue);
                                            }}
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border">
                    <div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">Balance</p>
                        <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                            ₱{formatNumberForDisplay(balance)}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">Utilization Rate</p>
                        <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                            {utilizationRate.toFixed(2)}%
                        </p>
                    </div>
                </div>

                <FormField
                    control={form.control}
                    name="remarks"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-zinc-700 dark:text-zinc-300">
                                Remarks <span className="text-xs text-zinc-500">(Optional)</span>
                            </FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Add any notes or comments..."
                                    className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 resize-none"
                                    rows={3}
                                    {...field}
                                    value={field.value || ""}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                    <Button
                        type="button"
                        onClick={onCancel}
                        variant="ghost"
                        className="text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        className="text-white"
                        style={{ backgroundColor: accentColorValue }}
                    >
                        {fund ? "Update" : "Create"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
