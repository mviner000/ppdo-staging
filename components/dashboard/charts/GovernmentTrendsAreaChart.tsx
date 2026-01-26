"use client";

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from "recharts";
import { DashboardChartCard } from "./DashboardChartCard";
import { useAccentColor } from "../../../contexts/AccentColorContext";

interface TrendData {
    label: string;
    allocated: number;
    utilized: number;
}

interface GovernmentTrendsAreaChartProps {
    title: string;
    subtitle?: string;
    data: TrendData[];
    isLoading?: boolean;
}

export function GovernmentTrendsAreaChart({
    title,
    subtitle,
    data,
    isLoading,
}: GovernmentTrendsAreaChartProps) {
    const { accentColorValue } = useAccentColor();

    if (isLoading) {
        return (
            <DashboardChartCard title={title} height={340}>
                <div className="w-full h-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-500"></div>
                </div>
            </DashboardChartCard>
        );
    }

    const formatValue = (value: number) => {
        return new Intl.NumberFormat("en-PH", {
            notation: "compact",
            compactDisplay: "short",
        }).format(value);
    };

    return (
        <DashboardChartCard title={title} subtitle={subtitle} height={340}>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="colorAllocated" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorUtilized" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={accentColorValue} stopOpacity={0.2} />
                            <stop offset="95%" stopColor={accentColorValue} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-zinc-700" />
                    <XAxis
                        dataKey="label"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#9ca3af", fontSize: 11 }}
                        className="dark:fill-zinc-400"
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#9ca3af", fontSize: 11 }}
                        className="dark:fill-zinc-400"
                        tickFormatter={formatValue}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "#FFF",
                            borderRadius: "8px",
                            border: "none",
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                            fontSize: "12px",
                        }}
                        formatter={(value: number | undefined) => [
                            new Intl.NumberFormat("en-PH", {
                                style: "currency",
                                currency: "PHP",
                                notation: "compact",
                            }).format(value || 0),
                            "",
                        ]}
                    />
                    <Legend
                        verticalAlign="top"
                        height={36}
                        iconType="circle"
                        iconSize={8}
                        align="right"
                        wrapperStyle={{ fontSize: "11px", color: "#6b7280" }}
                    />
                    <Area
                        type="monotone"
                        dataKey="allocated"
                        name="Allocated"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorAllocated)"
                        activeDot={{ r: 5, strokeWidth: 0 }}
                    />
                    <Area
                        type="monotone"
                        dataKey="utilized"
                        name="Utilized"
                        stroke={accentColorValue}
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorUtilized)"
                        activeDot={{ r: 5, strokeWidth: 0 }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </DashboardChartCard>
    );
}
