import React from "react";
import { Users, TrendingUp, BarChart3, Award } from "lucide-react";
import { Card } from "../ui/Card";
import { DashboardStats } from "../../types/dashboard";
import { formatNumber } from "../../utils/formatter";

type StatisticsCardsProps = {
    stats: DashboardStats | null;
    loading: boolean;
    error?: string | null;
};

const StatisticsCards: React.FC<StatisticsCardsProps> = ({ stats, loading, error }) => {
    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                        <div className="flex items-center justify-between">
                            <div className="space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-24"></div>
                                <div className="h-8 bg-gray-200 rounded w-16"></div>
                            </div>
                            <div className="w-8 h-8 bg-gray-200 rounded"></div>
                        </div>
                    </Card>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <p className="text-sm text-red-700">{error}</p>
            </div>
        );
    }

    if (!stats) return null;

    const cards = [
        {
            title: "Total Sales Force",
            value: formatNumber(stats.totalSalesForce),
            icon: Users,
            color: "text-blue-600",
            bgColor: "bg-blue-100",
        },
        {
            title: "Total PS Orders",
            value: formatNumber(stats.totalPS),
            icon: TrendingUp,
            color: "text-green-600",
            bgColor: "bg-green-100",
        },
        {
            title: "Average Performance",
            value: stats.avgPerformance,
            icon: BarChart3,
            color: "text-purple-600",
            bgColor: "bg-purple-100",
        },
        {
            title: "Top Performer",
            value: stats.topPerformer?.namaSF || "N/A",
            subtitle: stats.topPerformer
                ? `${stats.topPerformer.totalPs} PS Orders`
                : "",
            icon: Award,
            color: "text-yellow-600",
            bgColor: "bg-yellow-100",
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((card, index) => (
                <Card key={index}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">{card.title}</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">
                                {card.value}
                            </p>
                            {card.subtitle && (
                                <p className="text-sm text-gray-500 mt-1">{card.subtitle}</p>
                            )}
                        </div>
                        <div className={`p-3 rounded-full ${card.bgColor}`}>
                            <card.icon className={`w-6 h-6 ${card.color}`} />
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
};

export default StatisticsCards;
