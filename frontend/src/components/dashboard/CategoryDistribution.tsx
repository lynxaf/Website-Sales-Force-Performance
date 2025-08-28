import React, { ChangeEvent } from "react";
import { Pie, Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { ChevronUp, ChevronDown } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, ChartDataLabels, LineElement, PointElement);

interface CategoryStat {
    category: string;
    count: number;
    percentage: string;
}

interface SalesData {
    kodeSF: string;
    namaSF: string;
    totalPs: number;
    category: string;
    agency: string;
    area: string;
    regional: string;
    branch: string;
    wok: string;
}

interface Props {
    endpoint?: string;
}

interface SortState {
    field: string;
    direction: 'asc' | 'desc';
}

interface State {
    categoryStats: CategoryStat[];
    salesData: SalesData[];
    monthlyTrendData: any[];
    loading: boolean;
    error: string | null;
    regionalFilter: string;
    branchFilter: string;
    wokFilter: string;
    categoryFilter: string;
    monthFilter: number;
    yearFilter: number;
    allItems: any[];
    currentPage: number;
    itemsPerPage: number;
    isProcessingData: boolean;
    isLoadingTrend: boolean;
    sortConfig: SortState;
}

// Skeleton Components
const ChartSkeleton = () => (
    <div className="h-96 flex-1 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg p-4 animate-pulse">
            <div className="flex items-center justify-center h-full">
                <div className="w-64 h-64 rounded-full bg-gray-300 animate-pulse"></div>
            </div>
        </div>
    </div>
);

const LineChartSkeleton = () => (
    <div className="h-96 flex-1 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg p-4 animate-pulse">
            <div className="flex items-end justify-between h-full space-x-2 pt-8 pb-12">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="flex-1 bg-gray-300 rounded-t animate-pulse" style={{ height: `${Math.random() * 60 + 20}%` }}></div>
                ))}
            </div>
        </div>
    </div>
);

const CategoryListSkeleton = () => (
    <div className="space-y-3">
        <div className="h-6 bg-gray-300 rounded animate-pulse mb-6 w-3/4"></div>
        {[...Array(6)].map((_, i) => (
            <div key={i} className="p-4 border-l-4 border-gray-200 rounded-r-lg bg-gray-100 animate-pulse">
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 rounded-full bg-gray-300"></div>
                        <div className="h-4 bg-gray-300 rounded w-20"></div>
                    </div>
                    <div className="text-right space-y-1">
                        <div className="h-5 bg-gray-300 rounded w-12"></div>
                        <div className="h-3 bg-gray-300 rounded w-16"></div>
                    </div>
                </div>
            </div>
        ))}
    </div>
);

const TableSkeleton = ({ rows = 10 }: { rows?: number }) => (
    <div className="bg-white rounded-lg shadow-lg border overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b">
            <div className="h-6 bg-gray-300 rounded animate-pulse w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded animate-pulse w-1/4"></div>
        </div>

        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        {[...Array(9)].map((_, i) => (
                            <th key={i} className="px-6 py-3">
                                <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {[...Array(rows)].map((_, i) => (
                        <tr key={i}>
                            {[...Array(9)].map((_, j) => (
                                <td key={j} className="px-6 py-4">
                                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

export default class CategoryStats extends React.Component<Props, State> {
    state: State = {
        categoryStats: [],
        salesData: [],
        monthlyTrendData: [],
        loading: true,
        error: null,
        regionalFilter: "",
        branchFilter: "",
        wokFilter: "",
        categoryFilter: "",
        monthFilter: new Date().getMonth() + 1,
        yearFilter: new Date().getFullYear(),
        allItems: [],
        currentPage: 1,
        itemsPerPage: 10,
        isProcessingData: false,
        isLoadingTrend: false,
        sortConfig: {
            field: 'totalPs',
            direction: 'desc'
        }
    };

    fetchMonthlyTrendData = async () => {
        const { yearFilter, categoryFilter, regionalFilter, branchFilter, wokFilter } = this.state;
        if (!categoryFilter) return;

        this.setState({ isLoadingTrend: true });

        try {
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
            const monthlyData = [];

            // Fetch data for each month up to the current month
            for (let month = 1; month <= this.state.monthFilter; month++) {
                const endpoint = `${backendUrl}/api/dashboard/overall/monthly?month=${month}&year=${yearFilter}`;
                const res = await fetch(endpoint);

                if (res.ok) {
                    const data = await res.json();
                    const items: any[] = Array.isArray(data) ? data : Array.isArray(data.data) ? data.data : [];

                    // Apply filters and count category members
                    const filteredItems = items.filter((item) => {
                        return (
                            item.category === categoryFilter &&
                            (!regionalFilter || item.regional === regionalFilter) &&
                            (!branchFilter || item.branch === branchFilter) &&
                            (!wokFilter || item.wok === wokFilter)
                        );
                    });

                    monthlyData.push({
                        month: month,
                        monthName: new Date(0, month - 1).toLocaleString('en', { month: 'short' }),
                        count: filteredItems.length,
                        totalPs: filteredItems.reduce((sum, item) => sum + (item.totalPs || 0), 0),
                        avgPs: filteredItems.length > 0 ? (filteredItems.reduce((sum, item) => sum + (item.totalPs || 0), 0) / filteredItems.length).toFixed(1) : 0
                    });
                }
            }

            this.setState({ monthlyTrendData: monthlyData, isLoadingTrend: false });
        } catch (err) {
            console.error("Error fetching monthly trend data:", err);
            this.setState({ isLoadingTrend: false });
        }
    };

    async componentDidMount() {
        await this.fetchData();
    }

    fetchData = async () => {
        const { monthFilter, yearFilter } = this.state;
        this.setState({ loading: true });

        const endpoint = this.props.endpoint || `http://localhost:5000/api/dashboard/overall/monthly?month=${monthFilter}&year=${yearFilter}`;
        try {
            const res = await fetch(endpoint);
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const data = await res.json();
            const items: any[] = Array.isArray(data) ? data : Array.isArray(data.data) ? data.data : [];
            this.setState({ allItems: items, salesData: items, loading: false });
            this.processData(items);
        } catch (err: any) {
            console.error("Error fetching category stats:", err);
            this.setState({ loading: false, error: err.message || "Fetch error" });
        }
    };

    // Sorting functionality
    handleSort = (field: string): void => {
        this.setState(prev => ({
            sortConfig: {
                field,
                direction: prev.sortConfig.field === field && prev.sortConfig.direction === 'desc' ? 'asc' : 'desc'
            },
            currentPage: 1 // Reset to first page when sorting changes
        }), () => {
            this.processData(this.state.allItems);
        });
    };

    getSortIcon = (field: string) => {
        const { sortConfig } = this.state;
        if (sortConfig.field !== field) {
            return <ChevronUp className="w-4 h-4 text-gray-300" />;
        }
        return sortConfig.direction === 'asc'
            ? <ChevronUp className="w-4 h-4 text-blue-600" />
            : <ChevronDown className="w-4 h-4 text-blue-600" />;
    };

    processData = (items: any[]) => {
        this.setState({ isProcessingData: true });

        // Add small delay to show skeleton
        setTimeout(() => {
            const { regionalFilter, branchFilter, wokFilter, categoryFilter, sortConfig } = this.state;

            // Apply all filters including category filter to everything
            let filteredItems = items.filter((item) => {
                return (
                    (!regionalFilter || item.regional === regionalFilter) &&
                    (!branchFilter || item.branch === branchFilter) &&
                    (!wokFilter || item.wok === wokFilter) &&
                    (!categoryFilter || item.category === categoryFilter)
                );
            });

            // Apply sorting
            filteredItems = [...filteredItems].sort((a, b) => {
                const aValue = a[sortConfig.field as keyof SalesData];
                const bValue = b[sortConfig.field as keyof SalesData];

                if (aValue == null && bValue == null) return 0;
                if (aValue == null) return sortConfig.direction === 'asc' ? -1 : 1;
                if (bValue == null) return sortConfig.direction === 'asc' ? 1 : -1;

                if (typeof aValue === 'string' && typeof bValue === 'string') {
                    return sortConfig.direction === 'asc'
                        ? aValue.localeCompare(bValue)
                        : bValue.localeCompare(aValue);
                }

                if (typeof aValue === 'number' && typeof bValue === 'number') {
                    return sortConfig.direction === 'asc'
                        ? aValue - bValue
                        : bValue - aValue;
                }

                return 0;
            });

            // Generate category stats from the filtered data (before sorting for stats calculation)
            const statsItems = items.filter((item) => {
                return (
                    (!regionalFilter || item.regional === regionalFilter) &&
                    (!branchFilter || item.branch === branchFilter) &&
                    (!wokFilter || item.wok === wokFilter) &&
                    (!categoryFilter || item.category === categoryFilter)
                );
            });

            const grouped: Record<string, number> = {};
            let total = 0;
            statsItems.forEach((item) => {
                const cat = item.category || "Unknown";
                grouped[cat] = (grouped[cat] || 0) + 1;
                total++;
            });

            // Sort categories in desired order
            const sortOrder = ["Black", "Bronze", "Silver", "Gold", "Platinum", "Diamond"];
            const stats: CategoryStat[] = Object.entries(grouped)
                .map(([category, count]) => ({
                    category,
                    count,
                    percentage: total > 0 ? ((count / total) * 100).toFixed(1) : "0",
                }))
                .sort((a, b) => sortOrder.indexOf(a.category) - sortOrder.indexOf(b.category));

            this.setState({
                categoryStats: stats,
                salesData: filteredItems, // Use sorted data
                currentPage: 1,
                isProcessingData: false
            });
        }, 300); // 300ms delay to show skeleton
    };

    handleFilterChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name === "monthFilter" || name === "yearFilter") {
            if (name === "monthFilter") {
                this.setState({ monthFilter: Number(value) }, async () => {
                    await this.fetchData();
                    if (this.state.categoryFilter) {
                        await this.fetchMonthlyTrendData();
                    }
                });
            } else if (name === "yearFilter") {
                this.setState({ yearFilter: Number(value) }, async () => {
                    await this.fetchData();
                    if (this.state.categoryFilter) {
                        await this.fetchMonthlyTrendData();
                    }
                });
            }
            return;
        }

        if (name === "itemsPerPage") {
            this.setState({ itemsPerPage: Number(value), currentPage: 1 });
            return;
        }

        if (name === "categoryFilter") {
            this.setState({ categoryFilter: value }, async () => {
                this.processData(this.state.allItems);
                if (value) {
                    await this.fetchMonthlyTrendData();
                } else {
                    this.setState({ monthlyTrendData: [] });
                }
            });
            return;
        }

        if (name === "regionalFilter") {
            this.setState(
                {
                    regionalFilter: value,
                    branchFilter: "",
                    wokFilter: "",
                },
                async () => {
                    this.processData(this.state.allItems);
                    if (this.state.categoryFilter) {
                        await this.fetchMonthlyTrendData();
                    }
                }
            );
        } else if (name === "branchFilter") {
            this.setState(
                {
                    branchFilter: value,
                    wokFilter: "",
                },
                async () => {
                    this.processData(this.state.allItems);
                    if (this.state.categoryFilter) {
                        await this.fetchMonthlyTrendData();
                    }
                }
            );
        } else if (name === "wokFilter") {
            this.setState(
                {
                    wokFilter: value,
                },
                async () => {
                    this.processData(this.state.allItems);
                    if (this.state.categoryFilter) {
                        await this.fetchMonthlyTrendData();
                    }
                }
            );
        }
    };

    handleCategoryClick = (category: string) => {
        const newCategoryFilter = this.state.categoryFilter === category ? "" : category;
        this.setState({ categoryFilter: newCategoryFilter }, async () => {
            this.processData(this.state.allItems);
            // Fetch monthly trend data when category is selected
            if (newCategoryFilter) {
                await this.fetchMonthlyTrendData();
            } else {
                this.setState({ monthlyTrendData: [] });
            }
        });
    };

    handlePageChange = (page: number) => {
        this.setState({ currentPage: page });
    };

    getPageNumbers = () => {
        const { currentPage, itemsPerPage, salesData } = this.state;
        const totalPages = Math.ceil(salesData.length / itemsPerPage);
        const delta = 2;
        const range = [];
        const rangeWithDots = [];

        for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
            range.push(i);
        }

        if (currentPage - delta > 2) {
            rangeWithDots.push(1, '...');
        } else {
            rangeWithDots.push(1);
        }

        rangeWithDots.push(...range);

        if (currentPage + delta < totalPages - 1) {
            rangeWithDots.push('...', totalPages);
        } else if (totalPages > 1) {
            rangeWithDots.push(totalPages);
        }

        return rangeWithDots;
    };

    render() {
        const {
            categoryStats,
            salesData,
            monthlyTrendData,
            loading,
            error,
            regionalFilter,
            branchFilter,
            wokFilter,
            categoryFilter,
            allItems,
            monthFilter,
            yearFilter,
            currentPage,
            itemsPerPage,
            isProcessingData,
            isLoadingTrend,
            sortConfig
        } = this.state;

        if (loading) {
            return (
                <div className="space-y-6">
                    <div className="h-8 bg-gray-300 rounded animate-pulse w-1/3"></div>

                    {/* Filters Skeleton */}
                    <div className="flex flex-wrap gap-4 mb-6">
                        {[...Array(7)].map((_, i) => (
                            <div key={i}>
                                <div className="h-4 bg-gray-300 rounded animate-pulse w-16 mb-2"></div>
                                <div className="h-10 bg-gray-200 rounded animate-pulse w-32"></div>
                            </div>
                        ))}
                    </div>

                    {/* Main Content Skeleton */}
                    <div className="p-6 border rounded-lg shadow-lg bg-white mb-8">
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                            <CategoryListSkeleton />
                            <ChartSkeleton />
                        </div>
                    </div>

                    <TableSkeleton />
                </div>
            );
        }

        if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

        const regionalOptions = Array.from(new Set(allItems.map((i) => i.regional).filter(Boolean)));
        const branchOptions = Array.from(new Set(allItems.filter((i) => !regionalFilter || i.regional === regionalFilter).map((i) => i.branch).filter(Boolean)));
        const wokOptions = Array.from(new Set(allItems.filter((i) => (!regionalFilter || i.regional === regionalFilter) && (!branchFilter || i.branch === branchFilter)).map((i) => i.wok).filter(Boolean)));

        const chartColors = [
            "#1a1a1a", // Black - dark elegant
            "#cd7f32", // Bronze - warm bronze
            "#c0c0c0", // Silver - metallic silver
            "#ffd700", // Gold - bright gold
            "#a49e94ff", // Platinum 
            "#b9f2ff"  // Diamond - crystal blue
        ];

        const pieData = {
            labels: categoryStats.map((stat) => stat.category),
            datasets: [{
                data: categoryStats.map((stat) => stat.count),
                backgroundColor: chartColors,
                borderColor: "#ffffff",
                borderWidth: 3,
                hoverBorderWidth: 4,
                hoverBorderColor: "#333333"
            }],
        };

        const chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                animateScale: true,
                animateRotate: true,
                duration: 1500,
                easing: 'easeInOutQuart' as const
            },
            plugins: {
                legend: {
                    position: "bottom" as const,
                    labels: {
                        padding: 20,
                        font: {
                            size: 12,
                            weight: '600' as const
                        },
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    enabled: true,
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: '#333333',
                    borderWidth: 1,
                    callbacks: {
                        label: function (context: any) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                },
                datalabels: {
                    anchor: "center" as const,
                    align: "center" as const,
                    color: "#ffffff",
                    font: {
                        weight: "bold" as const,
                        size: 12
                    },
                    formatter: (value: number, context: any) => {
                        const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                        const percentage = ((value / total) * 100).toFixed(1);
                        return parseFloat(percentage) > 5 ? `${percentage}%` : '';
                    },
                    textShadowColor: 'rgba(0, 0, 0, 0.7)',
                    textShadowBlur: 3
                },
            },
        };

        // Column definitions for easier management
        const columns = [
            { field: 'kodeSF', header: 'Kode SF', sortable: true },
            { field: 'namaSF', header: 'Nama SF', sortable: true },
            { field: 'totalPs', header: 'Total PS', sortable: true },
            { field: 'category', header: 'Category', sortable: true },
            { field: 'agency', header: 'Agency', sortable: true },
            { field: 'area', header: 'Area', sortable: true },
            { field: 'regional', header: 'Regional', sortable: true },
            { field: 'branch', header: 'Branch', sortable: true },
            { field: 'wok', header: 'WOK', sortable: true },
        ];

        // Pagination calculations
        const totalItems = salesData.length;
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedData = salesData.slice(startIndex, endIndex);

        return (
            <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-4">Sales Category</h2>

                {/* Filters */}
                <div className="flex flex-wrap gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-600">Month</label>
                        <select name="monthFilter" value={monthFilter} onChange={this.handleFilterChange} className="border rounded px-3 py-2">
                            {[...Array(12)].map((_, i) => (
                                <option key={i + 1} value={i + 1}>
                                    {new Date(0, i).toLocaleString('en', { month: 'long' })}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600">Year</label>
                        <select name="yearFilter" value={yearFilter} onChange={this.handleFilterChange} className="border rounded px-3 py-2">
                            {[2024, 2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600">Category</label>
                        <select name="categoryFilter" value={categoryFilter} onChange={this.handleFilterChange} className="border rounded px-3 py-2">
                            <option value="">All Categories</option>
                            {["Black", "Bronze", "Silver", "Gold", "Platinum", "Diamond"].map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600">Regional</label>
                        <select name="regionalFilter" value={regionalFilter} onChange={this.handleFilterChange} className="border rounded px-3 py-2">
                            <option value="">All Regional</option>
                            {regionalOptions.map((r) => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600">Branch</label>
                        <select name="branchFilter" value={branchFilter} onChange={this.handleFilterChange} className="border rounded px-3 py-2">
                            <option value="">All Branches</option>
                            {branchOptions.map((b) => <option key={b} value={b}>{b}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600">WOK</label>
                        <select name="wokFilter" value={wokFilter} onChange={this.handleFilterChange} className="border rounded px-3 py-2">
                            <option value="">All WOK</option>
                            {wokOptions.map((w) => <option key={w} value={w}>{w}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600">Items per page</label>
                        <select name="itemsPerPage" value={itemsPerPage} onChange={this.handleFilterChange} className="border rounded px-3 py-2">
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                    </div>
                </div>

                {/* Category Statistics */}
                {isProcessingData ? (
                    <div className="p-6 border rounded-lg shadow-lg bg-white mb-8">
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                            <CategoryListSkeleton />
                            <ChartSkeleton />
                        </div>
                    </div>
                ) : categoryStats.length === 0 ? (
                    <p>No category data available</p>
                ) : (
                    <div className="p-6 border rounded-lg shadow-lg bg-white mb-8">
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                            {/* Left Side - Category List with enhanced styling */}
                            <div className="space-y-3">
                                <h3 className="text-xl font-bold mb-6 text-gray-800">
                                    {categoryFilter ? `${categoryFilter} Category Details` : 'Category Distribution'}
                                    <span className="text-sm font-normal text-gray-500 ml-2">(Click to drill down)</span>
                                </h3>
                                {categoryFilter ? (
                                    // Show only the selected category with full details
                                    <div className="space-y-3">
                                        <div className="p-4 border-l-4 border-blue-500 rounded-r-lg bg-gradient-to-r from-blue-100 to-blue-200 shadow-md">
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center space-x-3">
                                                    <div
                                                        className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                                                        style={{ backgroundColor: chartColors[["Black", "Bronze", "Silver", "Gold", "Platinum", "Diamond"].indexOf(categoryFilter)] }}
                                                    ></div>
                                                    <span className="font-bold text-xl text-blue-900">
                                                        {categoryFilter}
                                                        <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-1 rounded-full">
                                                            ACTIVE FILTER
                                                        </span>
                                                    </span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-2xl font-bold text-blue-900">
                                                        {salesData.length}
                                                    </span>
                                                    <span className="ml-2 text-sm text-blue-700">
                                                        (100%)
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => this.handleCategoryClick("")}
                                            className="w-full px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                                        >
                                            ← Back to All Categories
                                        </button>
                                    </div>
                                ) : (
                                    // Show all categories when no filter is applied
                                    <ul className="space-y-3">
                                        {categoryStats.map((stat, i) => (
                                            <li
                                                key={i}
                                                className="p-4 border-l-4 border-gray-200 rounded-r-lg bg-gradient-to-r from-gray-50 to-white hover:from-blue-50 hover:to-blue-100 cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md"
                                                onClick={() => this.handleCategoryClick(stat.category)}
                                            >
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center space-x-3">
                                                        <div
                                                            className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                                                            style={{ backgroundColor: chartColors[i] }}
                                                        ></div>
                                                        <span className="font-semibold text-gray-800">{stat.category}</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-lg font-bold text-gray-900">{stat.count}</span>
                                                        <span className="ml-2 text-sm text-gray-600">({stat.percentage}%)</span>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                    <p className="text-sm text-blue-800">
                                        {categoryFilter ? (
                                            <>
                                                <span className="font-semibold">{categoryFilter} Members:</span> {salesData.length}
                                                <br />
                                                <span className="text-xs text-blue-600">
                                                    Viewing detailed breakdown for {categoryFilter} category only
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="font-semibold">Total Sales Force:</span> {salesData.length} members
                                                <br />
                                                <span className="text-xs text-blue-600">
                                                    Click any category above to drill down into details
                                                </span>
                                            </>
                                        )}
                                    </p>
                                </div>
                            </div>

                            {/* Right Side - Enhanced Pie Chart or Line Chart */}
                            <div className="flex flex-col">
                                <h3 className="text-xl font-bold mb-6 text-gray-800">
                                    {categoryFilter && monthlyTrendData.length > 0
                                        ? `${categoryFilter} Monthly Trend`
                                        : 'Visual Distribution'
                                    }
                                </h3>

                                {isLoadingTrend ? (
                                    <LineChartSkeleton />
                                ) : categoryFilter && monthlyTrendData.length > 0 ? (
                                    // Show line chart when category is selected
                                    <div className="h-96 flex-1 relative">
                                        <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg p-4">
                                            <Line
                                                data={{
                                                    labels: monthlyTrendData.map((d: any) => d.monthName),
                                                    datasets: [
                                                        {
                                                            label: `${categoryFilter} Members`,
                                                            data: monthlyTrendData.map((d: any) => d.count),
                                                            borderColor: '#059669',
                                                            backgroundColor: 'rgba(5, 150, 105, 0.1)',
                                                            borderWidth: 3,
                                                            fill: true,
                                                            tension: 0.4,
                                                            pointBackgroundColor: '#059669',
                                                            pointBorderColor: '#ffffff',
                                                            pointBorderWidth: 2,
                                                            pointRadius: 6,
                                                            pointHoverRadius: 8,
                                                        },
                                                        {
                                                            label: 'Average Total PS',
                                                            data: monthlyTrendData.map((d: any) => parseFloat(d.avgPs)),
                                                            borderColor: '#dc2626',
                                                            backgroundColor: 'rgba(220, 38, 38, 0.1)',
                                                            borderWidth: 2,
                                                            fill: false,
                                                            tension: 0.4,
                                                            pointBackgroundColor: '#dc2626',
                                                            pointBorderColor: '#ffffff',
                                                            pointBorderWidth: 2,
                                                            pointRadius: 4,
                                                            pointHoverRadius: 6,
                                                            yAxisID: 'y1',
                                                        }
                                                    ]
                                                }}
                                                options={{
                                                    responsive: true,
                                                    maintainAspectRatio: false,
                                                    interaction: {
                                                        mode: 'index' as const,
                                                        intersect: false,
                                                    },
                                                    animation: {
                                                        duration: 1500,
                                                        easing: 'easeInOutQuart' as const
                                                    },
                                                    scales: {
                                                        x: {
                                                            display: true,
                                                            title: {
                                                                display: true,
                                                                text: 'Month',
                                                                font: { size: 12, weight: 'bold' as const }
                                                            },
                                                            grid: {
                                                                color: 'rgba(0,0,0,0.1)'
                                                            }
                                                        },
                                                        y: {
                                                            type: 'linear' as const,
                                                            display: true,
                                                            position: 'left' as const,
                                                            title: {
                                                                display: true,
                                                                text: 'Number of Members',
                                                                font: { size: 12, weight: 'bold' as const }
                                                            },
                                                            grid: {
                                                                color: 'rgba(0,0,0,0.1)'
                                                            }
                                                        },
                                                        y1: {
                                                            type: 'linear' as const,
                                                            display: true,
                                                            position: 'right' as const,
                                                            title: {
                                                                display: true,
                                                                text: 'Average Total PS',
                                                                font: { size: 12, weight: 'bold' as const }
                                                            },
                                                            grid: {
                                                                drawOnChartArea: false,
                                                            },
                                                        },
                                                    },
                                                    plugins: {
                                                        legend: {
                                                            position: 'top' as const,
                                                            labels: {
                                                                font: { size: 12, weight: '600' as const },
                                                                usePointStyle: true,
                                                                padding: 20
                                                            }
                                                        },
                                                        tooltip: {
                                                            backgroundColor: 'rgba(0,0,0,0.8)',
                                                            titleColor: '#ffffff',
                                                            bodyColor: '#ffffff',
                                                            borderColor: '#333333',
                                                            borderWidth: 1,
                                                            callbacks: {
                                                                afterBody: function (context: any) {
                                                                    const monthIndex = context[0].dataIndex;
                                                                    const monthData = monthlyTrendData[monthIndex];
                                                                    return [`Total PS: ${monthData.totalPs}`];
                                                                }
                                                            }
                                                        }
                                                    },
                                                }}
                                            />
                                        </div>
                                        <div className="mt-4 p-3 bg-green-50 rounded-lg">
                                            <p className="text-sm text-green-800">
                                                <span className="font-semibold">Trend Analysis:</span> Showing {categoryFilter} category progression from January to {new Date(0, monthFilter - 1).toLocaleString('en', { month: 'long' })} {yearFilter}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    // Show pie chart when no category selected or no trend data
                                    <div className="h-96 flex-1 relative">
                                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-4">
                                            <Pie data={pieData} options={chartOptions} plugins={[ChartDataLabels]} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Sales Data Table */}
                {isProcessingData ? (
                    <TableSkeleton rows={itemsPerPage} />
                ) : (
                    <div className="bg-white rounded-lg shadow-lg border overflow-hidden">
                        <div className="px-6 py-4 bg-gray-50 border-b">
                            <h3 className="text-xl font-bold text-gray-800">
                                Sales Force Details - {new Date(0, monthFilter - 1).toLocaleString('en', { month: 'long' })} {yearFilter}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                                Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} entries
                                {(regionalFilter || branchFilter || wokFilter) && " (filtered)"}
                            </p>
                            {sortConfig.field && (
                                <p className="text-xs text-blue-600 mt-1">
                                    Sorted by {columns.find(col => col.field === sortConfig.field)?.header || sortConfig.field} ({sortConfig.direction === 'asc' ? 'ascending' : 'descending'})
                                </p>
                            )}
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {columns.map((column) => (
                                            <th
                                                key={column.field}
                                                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.sortable ? 'cursor-pointer hover:bg-gray-100 select-none' : ''
                                                    }`}
                                                onClick={column.sortable ? () => this.handleSort(column.field) : undefined}
                                            >
                                                <div className="flex items-center gap-1">
                                                    {column.header}
                                                    {column.sortable && this.getSortIcon(column.field)}
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {paginatedData.length === 0 ? (
                                        <tr>
                                            <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                                                No data found matching the current filters
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedData.map((row, i) => (
                                            <tr key={i} className="hover:bg-gray-50 transition-colors duration-150">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.kodeSF}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.namaSF}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">{row.totalPs}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${row.category === 'Diamond' ? 'bg-blue-100 text-blue-800' :
                                                        row.category === 'Platinum' ? 'bg-gray-100 text-gray-800' :
                                                            row.category === 'Gold' ? 'bg-yellow-100 text-yellow-800' :
                                                                row.category === 'Silver' ? 'bg-gray-200 text-gray-700' :
                                                                    row.category === 'Bronze' ? 'bg-orange-100 text-orange-800' :
                                                                        'bg-black text-white'
                                                        }`}>
                                                        {row.category}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900">{row.agency}</td>
                                                <td className="px-6 py-4 text-sm text-gray-900">{row.area}</td>
                                                <td className="px-6 py-4 text-sm text-gray-900">{row.regional}</td>
                                                <td className="px-6 py-4 text-sm text-gray-900">{row.branch}</td>
                                                <td className="px-6 py-4 text-sm text-gray-900">{row.wok}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="px-6 py-4 bg-gray-50 border-t flex items-center justify-between">
                                <div className="text-sm text-gray-600">
                                    Page {currentPage} of {totalPages}
                                </div>
                                <div className="flex items-center space-x-1">
                                    <button
                                        onClick={() => this.handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                                    >
                                        Previous
                                    </button>

                                    {this.getPageNumbers().map((page, index) => (
                                        <React.Fragment key={index}>
                                            {page === '...' ? (
                                                <span className="px-3 py-1 text-sm text-gray-500">...</span>
                                            ) : (
                                                <button
                                                    onClick={() => this.handlePageChange(page as number)}
                                                    className={`px-3 py-1 text-sm border rounded transition-colors ${currentPage === page
                                                        ? 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600'
                                                        : 'bg-white text-gray-700 hover:bg-gray-100'
                                                        }`}
                                                >
                                                    {page}
                                                </button>
                                            )}
                                        </React.Fragment>
                                    ))}

                                    <button
                                        onClick={() => this.handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }
}