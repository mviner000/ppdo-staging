"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";
import { DashboardChartCard } from "./DashboardChartCard";


interface ProjectStatusData {
    status: string;
    count: number;
    color: string;
}

interface ProjectStatusVerticalBarProps {
    data: ProjectStatusData[];
    isLoading?: boolean;
}

export function ProjectStatusVerticalBar({
    data,
    isLoading,
}: ProjectStatusVerticalBarProps) {

    if (isLoading) {
        return (
            <DashboardChartCard title="Project Status" height={300}>
                <div className="w-full h-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
                </div>
            </DashboardChartCard>
        );
    }

    return (
        <DashboardChartCard
            title="Project Status Distribution"
            subtitle="Total projects by current status"
            height={300}
        >
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis
                        dataKey="status"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#6B7280", fontSize: 13, fontWeight: 600 }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#6B7280", fontSize: 13, fontWeight: 600 }}
                    />
                    <Tooltip
                        cursor={{ fill: "rgba(0,0,0,0.05)" }}
                        contentStyle={{
                            backgroundColor: "#FFF",
                            borderRadius: "8px",
                            border: "1px solid #E5E7EB",
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color || "#15803D"} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </DashboardChartCard>
    );
}
