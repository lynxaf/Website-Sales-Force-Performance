import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, Filter, Users, TrendingUp, Award, ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';

// Type definitions
interface SalesForceData {
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

interface FilterState {
    monthFilter: number;
    yearFilter: number;
    regional: string;
    branch: string;
    wok: string;
}

interface SalesForceProductivityProps {
    endpoint?: string;
}

interface PaginationState {
    currentPage: number;
    itemsPerPage: number;
}

interface SortState {
    field: string;
    direction: 'asc' | 'desc';
}

// Skeleton Components
const SkeletonCard = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm animate-pulse">
        <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
            <div className="text-right">
                <div className="w-16 h-8 bg-gray-200 rounded mb-2"></div>
                <div className="w-24 h-4 bg-gray-200 rounded"></div>
            </div>
        </div>
        <div className="w-32 h-5 bg-gray-200 rounded mb-2"></div>
        <div className="w-20 h-4 bg-gray-200 rounded"></div>
    </div>
);

const SkeletonChart = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm animate-pulse">
        <div className="w-48 h-6 bg-gray-200 rounded mb-6"></div>
        <div className="h-80 bg-gray-100 rounded flex items-end justify-around p-4">
            {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-2">
                    <div className="w-12 bg-gray-200 rounded" style={{ height: `${Math.random() * 200 + 50}px` }}></div>
                    <div className="w-12 bg-gray-300 rounded" style={{ height: `${Math.random() * 200 + 50}px` }}></div>
                </div>
            ))}
        </div>
    </div>
);

const SkeletonTable = () => (
    <div className="bg-white rounded-lg shadow-sm animate-pulse">
        <div className="p-6 border-b border-gray-200">
            <div className="w-56 h-6 bg-gray-200 rounded mb-2"></div>
            <div className="w-32 h-4 bg-gray-200 rounded"></div>
        </div>
        <div className="overflow-x-auto">
            <table className="min-w-full">
                <thead className="bg-gray-50">
                    <tr>
                        {[1, 2, 3, 4, 5, 6, 7].map(i => (
                            <th key={i} className="px-6 py-3">
                                <div className="w-20 h-4 bg-gray-200 rounded"></div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {[1, 2, 3, 4, 5].map(i => (
                        <tr key={i}>
                            {[1, 2, 3, 4, 5, 6, 7].map(j => (
                                <td key={j} className="px-6 py-4">
                                    <div className="w-full h-4 bg-gray-200 rounded"></div>
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

const SalesForceProductivity: React.FC<SalesForceProductivityProps> = ({ endpoint }) => {
    const [currentData, setCurrentData] = useState<SalesForceData[]>([]);
    const [previousData, setPreviousData] = useState<SalesForceData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [filters, setFilters] = useState<FilterState>({
        monthFilter: new Date().getMonth() + 1,
        yearFilter: new Date().getFullYear(),
        regional: '',
        branch: '',
        wok: ''
    });
    const [pagination, setPagination] = useState<PaginationState>({
        currentPage: 1,
        itemsPerPage: 10
    });
    const [sortConfig, setSortConfig] = useState<SortState>({
        field: 'totalPs',
        direction: 'desc'
    });

    // Data fetching function using your existing pattern
    const fetchData = async () => {
        const { monthFilter, yearFilter } = filters;
        setLoading(true);

        try {
            // Build the base endpoint
            const baseEndpoint = endpoint || `http://localhost:5000/api/dashboard/overall/monthly`;

            // Current month data with query parameters
            const currentEndpoint = `${baseEndpoint}?month=${monthFilter}&year=${yearFilter}`;
            const currentResponse = await fetch(currentEndpoint);
            const currentResult = await currentResponse.json();

            // Previous month data
            const prevMonth = monthFilter === 1 ? 12 : monthFilter - 1;
            const prevYear = monthFilter === 1 ? yearFilter - 1 : yearFilter;
            const previousEndpoint = `${baseEndpoint}?month=${prevMonth}&year=${prevYear}`;
            const previousResponse = await fetch(previousEndpoint);
            const previousResult = await previousResponse.json();

            // Assuming your API returns data in the format you provided
            const currentDataArray = Array.isArray(currentResult) ? currentResult : (currentResult.data || []);
            const previousDataArray = Array.isArray(previousResult) ? previousResult : (previousResult.data || []);

            setCurrentData(currentDataArray);
            setPreviousData(previousDataArray);

        } catch (error) {
            console.error('Error fetching productivity data:', error);
            setCurrentData([]);
            setPreviousData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [filters.monthFilter, filters.yearFilter]);

    // Productivity categorization function
    const getProductivityCategory = (totalPs) => {
        if (totalPs === 0) return 'SF Non PS';
        if (totalPs >= 1 && totalPs <= 12) return 'SF Aktif';
        return 'SF Produktif';
    };

    // Get unique filter options with cascading logic
    const filterOptions = useMemo(() => {
        const safeCurrentData = currentData || [];

        // Get all regionals
        const regionals = [...new Set(safeCurrentData.map((item: SalesForceData) => item.regional))];

        // Get branches based on selected regional
        const branches = filters.regional
            ? [...new Set(safeCurrentData
                .filter((item: SalesForceData) => item.regional === filters.regional)
                .map((item: SalesForceData) => item.branch))]
            : [...new Set(safeCurrentData.map((item: SalesForceData) => item.branch))];

        // Get work areas based on selected regional and branch
        let woks = safeCurrentData;
        if (filters.regional) {
            woks = woks.filter((item: SalesForceData) => item.regional === filters.regional);
        }
        if (filters.branch) {
            woks = woks.filter((item: SalesForceData) => item.branch === filters.branch);
        }
        const wokOptions = [...new Set(woks.map((item: SalesForceData) => item.wok))];

        return {
            regionals,
            branches,
            woks: wokOptions
        };
    }, [currentData, filters.regional, filters.branch]);

    // Filter data based on selected filters
    const filteredCurrentData = useMemo(() => {
        const safeCurrentData = currentData || [];
        return safeCurrentData.filter((item: SalesForceData) => {
            return (!filters.regional || item.regional === filters.regional) &&
                (!filters.branch || item.branch === filters.branch) &&
                (!filters.wok || item.wok === filters.wok);
        });
    }, [currentData, filters]);

    const filteredPreviousData = useMemo(() => {
        const safePreviousData = previousData || [];
        return safePreviousData.filter((item: SalesForceData) => {
            return (!filters.regional || item.regional === filters.regional) &&
                (!filters.branch || item.branch === filters.branch) &&
                (!filters.wok || item.wok === filters.wok);
        });
    }, [previousData, filters]);

    // Calculate productivity statistics
    const productivityStats = useMemo(() => {
        const currentStats = {
            'SF Non PS': 0,
            'SF Aktif': 0,
            'SF Produktif': 0
        };

        const previousStats = {
            'SF Non PS': 0,
            'SF Aktif': 0,
            'SF Produktif': 0
        };

        filteredCurrentData.forEach((item: SalesForceData) => {
            const category = getProductivityCategory(item.totalPs);
            currentStats[category as keyof typeof currentStats]++;
        });

        filteredPreviousData.forEach((item: SalesForceData) => {
            const category = getProductivityCategory(item.totalPs);
            previousStats[category as keyof typeof previousStats]++;
        });

        return [
            {
                category: 'SF Non PS (0 PS)',
                current: currentStats['SF Non PS'],
                previous: previousStats['SF Non PS'],
                description: '0 PS'
            },
            {
                category: 'SF Aktif (1-12 PS)',
                current: currentStats['SF Aktif'],
                previous: previousStats['SF Aktif'],
                description: '1-12 PS'
            },
            {
                category: 'SF Produktif (>12 PS)',
                current: currentStats['SF Produktif'],
                previous: previousStats['SF Produktif'],
                description: '>12 PS'
            }
        ];
    }, [filteredCurrentData, filteredPreviousData]);

    // Prepare detailed table data with sorting
    const detailedTableData = useMemo(() => {
        const tableData = filteredCurrentData.map((current: SalesForceData) => {
            const previous = filteredPreviousData.find((prev: SalesForceData) => prev.kodeSF === current.kodeSF);
            return {
                ...current,
                previousPs: previous ? previous.totalPs : 0,
                productivityCategory: getProductivityCategory(current.totalPs),
                change: current.totalPs - (previous ? previous.totalPs : 0)
            };
        });

        // Apply sorting
        const sortedData = [...tableData].sort((a, b) => {
            const aValue = a[sortConfig.field as keyof typeof a];
            const bValue = b[sortConfig.field as keyof typeof b];

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

        return sortedData;
    }, [filteredCurrentData, filteredPreviousData, sortConfig]);

    // Pagination logic
    const paginatedTableData = useMemo(() => {
        const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
        const endIndex = startIndex + pagination.itemsPerPage;
        return detailedTableData.slice(startIndex, endIndex);
    }, [detailedTableData, pagination.currentPage, pagination.itemsPerPage]);

    const totalPages = Math.ceil(detailedTableData.length / pagination.itemsPerPage);

    const handleFilterChange = (filterType: keyof FilterState, value: string | number): void => {
        setFilters(prev => {
            const newFilters = { ...prev, [filterType]: value };

            // Reset dependent filters when parent filter changes
            if (filterType === 'regional') {
                newFilters.branch = '';
                newFilters.wok = '';
            } else if (filterType === 'branch') {
                newFilters.wok = '';
            }

            return newFilters;
        });

        // Reset to first page when filters change
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    };

    const handlePageChange = (page: number): void => {
        setPagination(prev => ({ ...prev, currentPage: page }));
    };

    const handleItemsPerPageChange = (itemsPerPage: number): void => {
        setPagination({ currentPage: 1, itemsPerPage });
    };

    const handleSort = (field: string): void => {
        setSortConfig(prev => ({
            field,
            direction: prev.field === field && prev.direction === 'desc' ? 'asc' : 'desc'
        }));
        // Reset to first page when sorting changes
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    };

    const getSortIcon = (field: string) => {
        if (sortConfig.field !== field) {
            return <ChevronUp className="w-4 h-4 text-gray-300" />;
        }
        return sortConfig.direction === 'asc'
            ? <ChevronUp className="w-4 h-4 text-blue-600" />
            : <ChevronDown className="w-4 h-4 text-blue-600" />;
    };

    // Show skeleton while loading
    if (loading) {
        return (
            <div className="p-6 bg-gray-50 min-h-screen">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                            <TrendingUp className="text-blue-600" />
                            Sales Force Productivity Dashboard
                        </h1>
                        <p className="text-gray-600">
                            Monitor sales force performance across different productivity categories
                        </p>
                    </div>

                    {/* Skeleton Filters */}
                    <div className="bg-white p-6 rounded-lg shadow-sm mb-8 animate-pulse">
                        <div className="w-24 h-6 bg-gray-200 rounded mb-4"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i}>
                                    <div className="w-20 h-4 bg-gray-200 rounded mb-2"></div>
                                    <div className="w-full h-10 bg-gray-200 rounded"></div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Skeleton Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {[1, 2, 3].map(i => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>

                    {/* Skeleton Chart */}
                    <SkeletonChart />

                    <div className="mb-8"></div>

                    {/* Skeleton Table */}
                    <SkeletonTable />
                </div>
            </div>
        );
    }

    return (
        <div className="p-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold mb-4">
                        Sales Force Productivity Dashboard
                    </h1>
                    <p className="text-gray-600">
                        Monitor sales force performance across different productivity categories
                    </p>
                </div>

                {/* Filters */}
                <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Filter className="text-gray-600" />
                        Filters
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Calendar className="inline w-4 h-4 mr-1" />
                                Month
                            </label>
                            <select
                                value={filters.monthFilter}
                                onChange={(e) => handleFilterChange('monthFilter', parseInt(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {Array.from({ length: 12 }, (_, i) => (
                                    <option key={i + 1} value={i + 1}>
                                        {new Date(2024, i).toLocaleString('default', { month: 'long' })}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                            <select
                                value={filters.yearFilter}
                                onChange={(e) => handleFilterChange('yearFilter', parseInt(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {Array.from({ length: 5 }, (_, i) => (
                                    <option key={2025 - i} value={2025 - i}>{2025 - i}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Regional</label>
                            <select
                                value={filters.regional}
                                onChange={(e) => handleFilterChange('regional', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Regionals</option>
                                {filterOptions.regionals.map((regional: string) => (
                                    <option key={regional} value={regional}>{regional}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Branch</label>
                            <select
                                value={filters.branch}
                                onChange={(e) => handleFilterChange('branch', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Branches</option>
                                {filterOptions.branches.map((branch: string) => (
                                    <option key={branch} value={branch}>{branch}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Work Area</label>
                            <select
                                value={filters.wok}
                                onChange={(e) => handleFilterChange('wok', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Work Areas</option>
                                {filterOptions.woks.map((wok: string) => (
                                    <option key={wok} value={wok}>{wok}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {productivityStats.map((stat, index) => (
                        <div key={stat.category} className="bg-white p-6 rounded-lg shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-full ${index === 0 ? 'bg-red-100 text-red-600' :
                                    index === 1 ? 'bg-yellow-100 text-yellow-600' :
                                        'bg-green-100 text-green-600'
                                    }`}>
                                    {index === 0 ? <Users /> : index === 1 ? <TrendingUp /> : <Award />}
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-gray-900">{stat.current}</div>
                                    <div className="text-sm text-gray-500">
                                        {stat.current > stat.previous ? '+' : ''}{stat.current - stat.previous} from last month
                                    </div>
                                </div>
                            </div>
                            <h3 className="font-semibold text-gray-900">{stat.category}</h3>
                            <p className="text-sm text-gray-600">{stat.description}</p>
                        </div>
                    ))}
                </div>

                {/* Bar Chart */}
                <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
                    <h2 className="text-lg font-semibold mb-6">Productivity Comparison</h2>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={productivityStats} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="category"
                                    angle={-45}
                                    textAnchor="end"
                                    height={100}
                                />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="current" name="Current Month" fill="#3B82F6" />
                                <Bar dataKey="previous" name="Previous Month" fill="#93C5FD" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Detailed Table */}
                <div className="bg-white rounded-lg shadow-sm">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h2 className="text-lg font-semibold">Detailed Productivity Report</h2>
                                <p className="text-sm text-gray-600 mt-1">
                                    Showing {paginatedTableData.length} of {detailedTableData.length} sales force members
                                </p>
                            </div>

                            {/* Items per page selector */}
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">Show:</span>
                                <select
                                    value={pagination.itemsPerPage}
                                    onChange={(e) => handleItemsPerPageChange(parseInt(e.target.value))}
                                    className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>
                                <span className="text-sm text-gray-600">per page</span>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                                        onClick={() => handleSort('namaSF')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Sales Force
                                            {getSortIcon('namaSF')}
                                        </div>
                                    </th>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                                        onClick={() => handleSort('agency')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Agency
                                            {getSortIcon('agency')}
                                        </div>
                                    </th>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                                        onClick={() => handleSort('regional')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Location
                                            {getSortIcon('regional')}
                                        </div>
                                    </th>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                                        onClick={() => handleSort('totalPs')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Current PS
                                            {getSortIcon('totalPs')}
                                        </div>
                                    </th>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                                        onClick={() => handleSort('previousPs')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Previous PS
                                            {getSortIcon('previousPs')}
                                        </div>
                                    </th>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                                        onClick={() => handleSort('change')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Change
                                            {getSortIcon('change')}
                                        </div>
                                    </th>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                                        onClick={() => handleSort('productivityCategory')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Category
                                            {getSortIcon('productivityCategory')}
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {paginatedTableData.map((item: any) => (
                                    <tr key={item.kodeSF} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{item.namaSF}</div>
                                                <div className="text-sm text-gray-500">{item.kodeSF}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {item.agency}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <div>
                                                <div>{item.regional} - {item.branch}</div>
                                                <div className="text-gray-500">{item.wok}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                            {item.totalPs}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {item.previousPs}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${item.change > 0 ? 'bg-green-100 text-green-800' :
                                                item.change < 0 ? 'bg-red-100 text-red-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                {item.change > 0 ? '+' : ''}{item.change}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${item.productivityCategory === 'SF Non PS' ? 'bg-red-100 text-red-800' :
                                                item.productivityCategory === 'SF Aktif' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-green-100 text-green-800'
                                                }`}>
                                                {item.productivityCategory}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="px-6 py-4 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-600">
                                    Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to {Math.min(pagination.currentPage * pagination.itemsPerPage, detailedTableData.length)} of {detailedTableData.length} results
                                </div>

                                <div className="flex items-center gap-2">
                                    {/* Previous button */}
                                    <button
                                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                                        disabled={pagination.currentPage === 1}
                                        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                        Previous
                                    </button>

                                    {/* Page numbers */}
                                    <div className="flex gap-1">
                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            let pageNumber;
                                            if (totalPages <= 5) {
                                                pageNumber = i + 1;
                                            } else if (pagination.currentPage <= 3) {
                                                pageNumber = i + 1;
                                            } else if (pagination.currentPage >= totalPages - 2) {
                                                pageNumber = totalPages - 4 + i;
                                            } else {
                                                pageNumber = pagination.currentPage - 2 + i;
                                            }

                                            return (
                                                <button
                                                    key={pageNumber}
                                                    onClick={() => handlePageChange(pageNumber)}
                                                    className={`px-3 py-2 text-sm font-medium rounded-md ${pagination.currentPage === pageNumber
                                                        ? 'bg-blue-600 text-white'
                                                        : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    {pageNumber}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Next button */}
                                    <button
                                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                                        disabled={pagination.currentPage === totalPages}
                                        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                    >
                                        Next
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SalesForceProductivity;