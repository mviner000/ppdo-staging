"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";
import { DashboardChartCard } from "./DashboardChartCard";
import { useAccentColor } from "@/contexts/AccentColorContext";


interface UtilizationData {
    department: string;
    rate: number;
}

interface DepartmentUtilizationHorizontalBarProps {
    data: UtilizationData[];
    isLoading?: boolean;
}

export function DepartmentUtilizationHorizontalBar({
    data,
    isLoading,
}: DepartmentUtilizationHorizontalBarProps) {
    const { accentColorValue } = useAccentColor();

    if (isLoading) {
        return (
            <DashboardChartCard title="Department Utilization" height={300}>
                <div className="w-full h-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderBottomColor: accentColorValue }}></div>
                </div>
            </DashboardChartCard>
        );
    }

    return (
        <DashboardChartCard
            title="Department Budget Utilization"
            subtitle="Utilization rate (%) by implementing office"
            height={300}
        >
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    layout="vertical"
                    data={data}
                    margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                >

                    <XAxis
                        type="number"
                        hide
                    />
                    <YAxis
                        dataKey="department"
                        type="category"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#52525b", fontSize: 13, fontWeight: 600 }}
                        className="dark:fill-zinc-300"
                        width={140}
                    />
                    <Tooltip
                        cursor={{ fill: "rgba(0,0,0,0.02)" }}
                        formatter={(value: number | undefined) => [
                            value !== undefined ? `${value.toFixed(1)}%` : "0.0%",
                            "Utilization",
                        ]}
                        contentStyle={{
                            backgroundColor: "#FFF",
                            borderRadius: "10px",
                            border: "none",
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                            fontSize: "13px",
                        }}
                        wrapperClassName="dark:[&>div]:!bg-zinc-800 dark:[&>div]:!text-zinc-50"
                    />
                    <Bar dataKey="rate" fill={accentColorValue} radius={[0, 4, 4, 0]} barSize={32}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={accentColorValue} fillOpacity={1 - (index * 0.05)} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </DashboardChartCard>
    );
}
