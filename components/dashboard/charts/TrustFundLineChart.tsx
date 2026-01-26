"use client";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import { DashboardChartCard } from "./DashboardChartCard";
import { useAccentColor } from "../../../contexts/AccentColorContext";

interface TrustFundTrendData {
    year: string;
    received: number;
    utilized: number;
}

interface TrustFundLineChartProps {
    data: TrustFundTrendData[];
    isLoading?: boolean;
}

export function TrustFundLineChart({
    data,
    isLoading,
}: TrustFundLineChartProps) {
    const { accentColorValue } = useAccentColor();

    if (isLoading) {
        return (
            <DashboardChartCard title="Trust Fund Trends" height={300}>
                <div className="w-full h-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-500"></div>
                </div>
            </DashboardChartCard>
        );
    }

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("en-PH", {
            notation: "compact",
            currency: "PHP",
        }).format(value);
    };

    return (
        <DashboardChartCard
            title="Trust Fund Overview"
            subtitle="Annual allocation vs. utilization trend"
            height={300}
        >
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={data}
                    margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis
                        dataKey="year"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#6B7280", fontSize: 12 }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#6B7280", fontSize: 12 }}
                        tickFormatter={formatCurrency}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "#FFF",
                            borderRadius: "8px",
                            border: "1px solid #E5E7EB",
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        }}
                        formatter={(value: number | undefined) => [
                            value !== undefined
                                ? new Intl.NumberFormat("en-PH", {
                                    style: "currency",
                                    currency: "PHP",
                                }).format(value)
                                : "₱0.00",
                            "",
                        ]}
                    />
                    <Legend verticalAlign="top" height={36} iconType="circle" />
                    <Line
                        type="monotone"
                        dataKey="received"
                        name="Funds Received"
                        stroke="#10B981"
                        strokeWidth={2}
                        dot={{ r: 4, fill: "#10B981" }}
                        activeDot={{ r: 6 }}
                    />
                    <Line
                        type="monotone"
                        dataKey="utilized"
                        name="Funds Utilized"
                        stroke={accentColorValue}
                        strokeWidth={2}
                        dot={{ r: 4, fill: accentColorValue }}
                        activeDot={{ r: 6 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </DashboardChartCard>
    );
}
