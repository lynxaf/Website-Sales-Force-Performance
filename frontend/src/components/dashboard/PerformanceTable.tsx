import React from 'react';
import { Card } from '../ui/Card';
import { SalesForceData, MetricsData } from '../../types/dashboard';
import { formatNumber, getCategoryColor, formatPercentage } from '../../utils/formatter';

interface PerformanceTableProps {
    salesData: SalesForceData[];
    metricsData: MetricsData[];
    loading?: boolean;
}

export const PerformanceTable: React.FC<PerformanceTableProps> = ({
    salesData,
    metricsData,
    loading
}) => {
    if (loading) {
        return (
            <Card padding="none">
                <div className="p-6 border-b border-gray-200">
                    <div className="animate-pulse">
                        <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-64"></div>
                    </div>
                </div>
                <div className="p-6">
                    <div className="animate-pulse space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex space-x-4">
                                <div className="h-4 bg-gray-200 rounded flex-1"></div>
                                <div className="h-4 bg-gray-200 rounded w-20"></div>
                                <div className="h-4 bg-gray-200 rounded w-16"></div>
                                <div className="h-4 bg-gray-200 rounded w-24"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <Card padding="none">
            <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Sales Force Performance</h2>
                <p className="text-sm text-gray-600 mt-1">
                    Showing {salesData.length} sales force members
                </p>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Sales Force
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Code
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Regional/Branch
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Total PS Orders
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Category
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Performance Metrics
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {salesData.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                    No data available
                                </td>
                            </tr>
                        ) : (
                            salesData.map((item) => {
                                const metrics = metricsData.find(m => m.kodeSF === item.kodeSF);
                                return (
                                    <tr key={item.kodeSF} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {item.namaSF}
                                                </div>
                                                {item.agency && (
                                                    <div className="text-sm text-gray-500">{item.agency}</div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-600">{item.kodeSF}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{item.regional}</div>
                                            <div className="text-sm text-gray-500">{item.branch}</div>
                                            {item.wok && (
                                                <div className="text-xs text-gray-400">{item.wok}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-semibold text-gray-900">
                                                {formatNumber(item.totalPs)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(item.category)}`}>
                                                {item.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {metrics ? (
                                                <div className="space-y-1">
                                                    <div className="flex justify-between">
                                                        <span>WoW:</span>
                                                        <span className={`font-medium ${parseFloat(metrics.WoW) > 0 ? 'text-green-600' :
                                                                parseFloat(metrics.WoW) < 0 ? 'text-red-600' : 'text-gray-600'
                                                            }`}>
                                                            {formatPercentage(metrics.WoW)}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>MoM:</span>
                                                        <span className={`font-medium ${parseFloat(metrics.MoM) > 0 ? 'text-green-600' :
                                                                parseFloat(metrics.MoM) < 0 ? 'text-red-600' : 'text-gray-600'
                                                            }`}>
                                                            {formatPercentage(metrics.MoM)}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>QoQ:</span>
                                                        <span className={`font-medium ${parseFloat(metrics.QoQ) > 0 ? 'text-green-600' :
                                                                parseFloat(metrics.QoQ) < 0 ? 'text-red-600' : 'text-gray-600'
                                                            }`}>
                                                            {formatPercentage(metrics.QoQ)}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>YoY:</span>
                                                        <span className={`font-medium ${parseFloat(metrics.YoY) > 0 ? 'text-green-600' :
                                                                parseFloat(metrics.YoY) < 0 ? 'text-red-600' : 'text-gray-600'
                                                            }`}>
                                                            {formatPercentage(metrics.YoY)}
                                                        </span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">No metrics available</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};