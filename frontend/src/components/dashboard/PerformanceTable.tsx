"use client";

import React, { useState, useMemo, ChangeEvent, useEffect } from "react";
import { ChevronUp, ChevronDown } from 'lucide-react';

type MetricsData = {
    namaSF: string;
    kodeSF: string;
    agency: string;
    area: string;
    regional: string;
    branch: string;
    wok: string;
    WoW: string;
    MoM: string;
    QoQ: string;
    YoY: string;
};

interface PerformanceTableProps {
    loading?: boolean;
}

interface SortState {
    field: string;
    direction: 'asc' | 'desc';
}

export default function PerformanceTable({ loading: externalLoading }: PerformanceTableProps) {
    // Data state
    const [metricsData, setMetricsData] = useState<MetricsData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filter hooks
    const [regionalFilter, setRegionalFilter] = useState("");
    const [branchFilter, setBranchFilter] = useState("");
    const [wokFilter, setWokFilter] = useState("");
    const [agencyFilter, setAgencyFilter] = useState("");
    const [areaFilter, setAreaFilter] = useState("");

    // Date filter hooks
    const [endDate, setEndDate] = useState("");

    // Pagination hooks
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Sorting hooks
    const [sortConfig, setSortConfig] = useState<SortState>({
        field: 'namaSF',
        direction: 'asc'
    });

    // Fetch data function
    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

            if (endDate) {
                const metricsUrl = `${backendUrl}/api/dashboard/metrics?endDate=${endDate}`;

                console.log("Fetching metrics data from:", metricsUrl);

                const metricsRes = await fetch(metricsUrl);

                if (!metricsRes.ok) {
                    const errorText = await metricsRes.text();
                    console.error("Metrics API Error Response:", errorText);
                    throw new Error(`Metrics API error: ${metricsRes.status} ${metricsRes.statusText}`);
                }

                const rawMetrics = await metricsRes.json();
                console.log("Metrics API Response:", rawMetrics);

                const metricsData = rawMetrics.success ? rawMetrics.data : (Array.isArray(rawMetrics) ? rawMetrics : []);

                setMetricsData(metricsData || []);
                setLoading(false);

            } else {
                setMetricsData([]);
                setLoading(false);
            }

        } catch (err: any) {
            console.error("Error fetching performance data:", err);
            setError(`Failed to fetch data: ${err.message}`);
            setLoading(false);
        }
    };

    // Fetch data when end date changes
    useEffect(() => {
        fetchData();
    }, [endDate]);

    // Sorting function
    const handleSort = (field: string): void => {
        setSortConfig(prev => ({
            field,
            direction: prev.field === field && prev.direction === 'desc' ? 'asc' : 'desc'
        }));
        // Reset to first page when sorting changes
        setCurrentPage(1);
    };

    const getSortIcon = (field: string) => {
        if (sortConfig.field !== field) {
            return <ChevronUp className="w-4 h-4 text-gray-300" />;
        }
        return sortConfig.direction === 'asc'
            ? <ChevronUp className="w-4 h-4 text-blue-600" />
            : <ChevronDown className="w-4 h-4 text-blue-600" />;
    };

    // Helper function to convert percentage string to number for sorting
    const parsePercentage = (value: string): number => {
        if (value === 'N/A' || !value) return -999999; // Put N/A at the end
        const numValue = parseFloat(value.replace('%', ''));
        return isNaN(numValue) ? -999999 : numValue;
    };

    // Filter and sort metrics data
    const processedMetricsData = useMemo(() => {
        // First apply filters
        const filtered = metricsData.filter(
            (metric) =>
                (!regionalFilter || metric.regional === regionalFilter) &&
                (!branchFilter || metric.branch === branchFilter) &&
                (!wokFilter || metric.wok === wokFilter) &&
                (!agencyFilter || metric.agency === agencyFilter) &&
                (!areaFilter || metric.area === areaFilter)
        );

        // Then apply sorting
        const sorted = [...filtered].sort((a, b) => {
            const aValue = a[sortConfig.field as keyof MetricsData];
            const bValue = b[sortConfig.field as keyof MetricsData];

            // Handle percentage fields specially
            if (['WoW', 'MoM', 'QoQ', 'YoY'].includes(sortConfig.field)) {
                const aNum = parsePercentage(aValue);
                const bNum = parsePercentage(bValue);
                return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum;
            }

            // Handle regular string fields
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                const comparison = aValue.localeCompare(bValue);
                return sortConfig.direction === 'asc' ? comparison : -comparison;
            }

            return 0;
        });

        return sorted;
    }, [metricsData, regionalFilter, branchFilter, wokFilter, agencyFilter, areaFilter, sortConfig]);

    // Pagination for metrics data
    const totalMetricsItems = processedMetricsData.length;
    const totalMetricsPages = Math.ceil(totalMetricsItems / itemsPerPage);
    const metricsStartIndex = (currentPage - 1) * itemsPerPage;
    const metricsEndIndex = metricsStartIndex + itemsPerPage;
    const paginatedMetricsData = processedMetricsData.slice(metricsStartIndex, metricsEndIndex);

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [regionalFilter, branchFilter, wokFilter, agencyFilter, areaFilter, itemsPerPage, endDate]);

    const handleFilterChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === "regional") {
            setRegionalFilter(value);
            setBranchFilter("");
            setWokFilter("");
        } else if (name === "branch") {
            setBranchFilter(value);
            setWokFilter("");
        } else if (name === "wok") {
            setWokFilter(value);
        }
    };

    const handleDateFilterChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setEndDate(value);
    };

    const handleItemsPerPageChange = (e: ChangeEvent<HTMLSelectElement>) => {
        setItemsPerPage(Number(e.target.value));
    };

    const getPageNumbers = () => {
        const delta = 2;
        const range = [];
        const rangeWithDots = [];

        for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalMetricsPages - 1, currentPage + delta); i++) {
            range.push(i);
        }

        if (currentPage - delta > 2) {
            rangeWithDots.push(1, '...');
        } else {
            rangeWithDots.push(1);
        }

        rangeWithDots.push(...range);

        if (currentPage + delta < totalMetricsPages - 1) {
            rangeWithDots.push('...', totalMetricsPages);
        } else if (totalMetricsPages > 1) {
            rangeWithDots.push(totalMetricsPages);
        }

        return rangeWithDots;
    };

    // Generate filter options based on current data
    const getFilterOptions = () => {
        const regionalOpts = metricsData.length > 0 ? Array.from(new Set(metricsData.map((d) => d.regional).filter(Boolean))) : [];
        const branchOpts = metricsData.length > 0 ? Array.from(
            new Set(metricsData.filter((d) => !regionalFilter || d.regional === regionalFilter).map((d) => d.branch).filter(Boolean))
        ) : [];
        const wokOpts = metricsData.length > 0 ? Array.from(
            new Set(
                metricsData
                    .filter((d) => (!regionalFilter || d.regional === regionalFilter) && (!branchFilter || d.branch === branchFilter))
                    .map((d) => d.wok)
                    .filter(Boolean)
            )
        ) : [];
        const agencyOpts = metricsData.length > 0 ? Array.from(
            new Set(metricsData.map((d) => d.agency).filter(Boolean))
        ) : [];
        const areaOpts = metricsData.length > 0 ? Array.from(
            new Set(metricsData.map((d) => d.area).filter(Boolean))
        ) : [];

        return { regionalOpts, branchOpts, wokOpts, agencyOpts, areaOpts };
    };

    const { regionalOpts, branchOpts, wokOpts, agencyOpts, areaOpts } = getFilterOptions();

    // Column definitions for easier management
    const columns = [
        { field: 'kodeSF', header: 'Kode SF', sortable: true },
        { field: 'namaSF', header: 'Nama SF', sortable: true },
        { field: 'agency', header: 'Agency', sortable: true },
        { field: 'area', header: 'Area', sortable: true },
        { field: 'regional', header: 'Regional', sortable: true },
        { field: 'branch', header: 'Branch', sortable: true },
        { field: 'wok', header: 'WOK', sortable: true },
        { field: 'WoW', header: 'WoW (%)', sortable: true },
        { field: 'MoM', header: 'MoM (%)', sortable: true },
        { field: 'QoQ', header: 'QoQ (%)', sortable: true },
        { field: 'YoY', header: 'YoY (%)', sortable: true },
    ];

    if (loading || externalLoading) return <p>Loading data...</p>;

    if (error) {
        return (
            <div className="p-4">
                <h2 className="text-2xl font-bold mb-4">Performance Metrics</h2>
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700">Error: {error}</p>
                    <button
                        onClick={fetchData}
                        className="mt-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Performance Metrics</h2>

            {/* Date Filter Controls */}
            <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                <h3 className="text-lg font-semibold mb-3">Date Filter</h3>
                <div className="flex flex-wrap gap-4 items-end">
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-600">End Date</label>
                        <input
                            type="date"
                            name="endDate"
                            value={endDate}
                            onChange={handleDateFilterChange}
                            className="border rounded px-3 py-2"
                        />
                    </div>
                    <div className="text-sm text-gray-500">
                        <p>Select an end date to view performance metrics up to that point.</p>
                    </div>
                </div>
            </div>

            {/* Other Filters */}
            <div className="flex flex-wrap gap-4 mb-6 items-end">
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-600">Regional</label>
                    <select
                        name="regional"
                        value={regionalFilter}
                        onChange={handleFilterChange}
                        className="border rounded px-3 py-2"
                    >
                        <option value="">All Regional</option>
                        {regionalOpts.map((r) => (
                            <option key={r} value={r}>{r}</option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-600">Branch</label>
                    <select
                        name="branch"
                        value={branchFilter}
                        onChange={handleFilterChange}
                        className="border rounded px-3 py-2"
                    >
                        <option value="">All Branches</option>
                        {branchOpts.map((b) => (
                            <option key={b} value={b}>{b}</option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-600">WOK</label>
                    <select
                        name="wok"
                        value={wokFilter}
                        onChange={handleFilterChange}
                        className="border rounded px-3 py-2"
                    >
                        <option value="">All WOK</option>
                        {wokOpts.map((w) => (
                            <option key={w} value={w}>{w}</option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-600">Items per page</label>
                    <select
                        value={itemsPerPage}
                        onChange={handleItemsPerPageChange}
                        className="border rounded px-3 py-2"
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>
                </div>
            </div>

            {/* Performance Metrics Table */}
            {!metricsData.length && !loading && !error && endDate ? (
                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-700">No metrics data available for the selected date.</p>
                    <button
                        onClick={fetchData}
                        className="mt-2 px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                    >
                        Refresh Data
                    </button>
                </div>
            ) : endDate ? (
                <div className="bg-white rounded-lg shadow-lg border overflow-hidden">
                    <div className="px-6 py-4 bg-gray-50 border-b">
                        <h3 className="text-xl font-bold text-gray-800">
                            Performance Metrics - Up to {endDate}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                            Showing {metricsStartIndex + 1} to {Math.min(metricsEndIndex, totalMetricsItems)} of {totalMetricsItems} entries
                            {(regionalFilter || branchFilter || wokFilter || agencyFilter || areaFilter) && " (filtered)"}
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
                                            onClick={column.sortable ? () => handleSort(column.field) : undefined}
                                        >
                                            <div className="flex items-center gap-1">
                                                {column.header}
                                                {column.sortable && getSortIcon(column.field)}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {paginatedMetricsData.length === 0 ? (
                                    <tr>
                                        <td colSpan={11} className="px-6 py-12 text-center text-gray-500">
                                            No metrics data found matching the current filters
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedMetricsData.map((row, i) => (
                                        <tr key={i} className="hover:bg-gray-50 transition-colors duration-150">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.kodeSF}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.namaSF}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{row.agency}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{row.area}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{row.regional}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{row.branch}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{row.wok}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className={`font-bold px-2 py-1 rounded ${row.WoW?.includes('-')
                                                    ? 'bg-red-100 text-red-800'
                                                    : row.WoW === 'N/A'
                                                        ? 'bg-gray-100 text-gray-500'
                                                        : 'bg-green-100 text-green-800'
                                                    }`}>
                                                    {row.WoW}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className={`font-bold px-2 py-1 rounded ${row.MoM?.includes('-')
                                                    ? 'bg-red-100 text-red-800'
                                                    : row.MoM === 'N/A'
                                                        ? 'bg-gray-100 text-gray-500'
                                                        : 'bg-green-100 text-green-800'
                                                    }`}>
                                                    {row.MoM}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className={`font-bold px-2 py-1 rounded ${row.QoQ?.includes('-')
                                                    ? 'bg-red-100 text-red-800'
                                                    : row.QoQ === 'N/A'
                                                        ? 'bg-gray-100 text-gray-500'
                                                        : 'bg-green-100 text-green-800'
                                                    }`}>
                                                    {row.QoQ}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className={`font-bold px-2 py-1 rounded ${row.YoY?.includes('-')
                                                    ? 'bg-red-100 text-red-800'
                                                    : row.YoY === 'N/A'
                                                        ? 'bg-gray-100 text-gray-500'
                                                        : 'bg-green-100 text-green-800'
                                                    }`}>
                                                    {row.YoY}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalMetricsPages > 1 && (
                        <div className="px-6 py-4 bg-gray-50 border-t flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                                Page {currentPage} of {totalMetricsPages}
                            </div>

                            <div className="flex items-center space-x-1">
                                <button
                                    onClick={() => setCurrentPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                                >
                                    Previous
                                </button>

                                {getPageNumbers().map((page, index) => (
                                    <React.Fragment key={index}>
                                        {page === '...' ? (
                                            <span className="px-3 py-1 text-sm text-gray-500">...</span>
                                        ) : (
                                            <button
                                                onClick={() => setCurrentPage(page as number)}
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
                                    onClick={() => setCurrentPage(currentPage + 1)}
                                    disabled={currentPage === totalMetricsPages}
                                    className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-blue-700 text-center">
                        <span className="font-semibold">Select End Date</span><br />
                        Please choose an end date to view performance metrics data up to that point.
                    </p>
                </div>
            )}
        </div>
    );
}