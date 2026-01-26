"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { DashboardChartCard } from "./DashboardChartCard";

interface FinancialPieProps {
    data: {
        allocated: number;
        utilized: number;
        obligated: number;
    };
    isLoading?: boolean;
}

export function ExecutiveFinancialPie({ data, isLoading }: FinancialPieProps) {
    if (isLoading) {
        return (
            <DashboardChartCard title="Financial Status" height={340}>
                <div className="w-full h-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-300"></div>
                </div>
            </DashboardChartCard>
        );
    }

    const balance = Math.max(0, data.allocated - data.utilized - data.obligated);

    const chartData = [
        { name: "Utilized", value: data.utilized, color: "#b45309" }, // Amber-700
        { name: "Obligated", value: data.obligated, color: "#d97706" }, // Amber-600
        { name: "Balance", value: balance, color: "#fcd34d" }, // Amber-300
    ].filter(item => item.value > 0);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency: "PHP",
            notation: "compact",
            compactDisplay: "short",
        }).format(value);
    };

    return (
        <DashboardChartCard
            title="Financial Status"
            subtitle={`Total Allocation: ${formatCurrency(data.allocated)}`}
            height={340}
        >
            <div className="flex flex-col h-full">
                <div className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value: number | undefined) => [
                                    formatCurrency(value || 0),
                                    "Amount"
                                ]}
                                contentStyle={{
                                    backgroundColor: "#FFF",
                                    borderRadius: "10px",
                                    border: "none",
                                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                                    fontSize: "12px",
                                }}
                                wrapperClassName="dark:[&>div]:!bg-zinc-800 dark:[&>div]:!text-zinc-50"
                            />
                            <Legend
                                verticalAlign="bottom"
                                height={36}
                                iconType="circle"
                                iconSize={8}
                                formatter={(value, entry: any) => (
                                    <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 ml-1">{value}</span>
                                )}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </DashboardChartCard>
    );
}
