import React from 'react';
import { PieChart } from 'lucide-react';
import { Card } from '../ui/Card';
import { CategoryStat } from '../../types/dashboard';
import { getCategoryColor } from '../../utils/formatter';

interface CategoryDistributionProps {
    categoryStats: CategoryStat[];
    loading?: boolean;
}

export const CategoryDistribution: React.FC<CategoryDistributionProps> = ({
    categoryStats,
    loading
}) => {
    if (loading) {
        return (
            <Card>
                <div className="animate-pulse">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-5 h-5 bg-gray-200 rounded"></div>
                        <div className="h-6 bg-gray-200 rounded w-32"></div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="text-center">
                                <div className="w-full h-16 bg-gray-200 rounded-lg mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-16 mx-auto"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <Card>
            <div className="flex items-center gap-2 mb-4">
                <PieChart className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Category Distribution</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {categoryStats.map((stat) => (
                    <div key={stat.category} className="text-center">
                        <div className={`w-full py-3 px-3 rounded-lg mb-2 ${getCategoryColor(stat.category)}`}>
                            <div className="text-lg font-bold">{stat.count}</div>
                            <div className="text-xs opacity-90">{stat.percentage}%</div>
                        </div>
                        <div className="text-sm font-medium text-gray-700">{stat.category}</div>
                    </div>
                ))}
            </div>
        </Card>
    );
};