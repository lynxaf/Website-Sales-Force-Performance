"use client";

import React, { useState, useMemo, ChangeEvent, useEffect } from "react";

type SalesData = {
    kodeSF: string;
    namaSF: string;
    totalPs: number;
    category: string;
    agency: string;
    area: string;
    regional: string;
    branch: string;
    wok: string;
};

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

export default function PerformanceTable({ loading: externalLoading }: PerformanceTableProps) {
    // Data state
    const [salesData, setSalesData] = useState<SalesData[]>([]);
    const [metricsData, setMetricsData] = useState<MetricsData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filter hooks
    const [regionalFilter, setRegionalFilter] = useState("");
    const [branchFilter, setBranchFilter] = useState("");
    const [wokFilter, setWokFilter] = useState("");

    // Date filter hooks
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [dateFilterType, setDateFilterType] = useState<"monthly" | "range">("monthly");

    // Pagination hooks for both tables
    const [currentPageSales, setCurrentPageSales] = useState(1);
    const [currentPageMetrics, setCurrentPageMetrics] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Fetch data function
    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

            if (dateFilterType === "monthly") {
                const salesUrl = `${backendUrl}/api/dashboard/overall/monthly?month=${month}&year=${year}`;

                console.log("Fetching monthly data from:", salesUrl);

                const salesRes = await fetch(salesUrl);

                if (!salesRes.ok) {
                    const errorText = await salesRes.text();
                    console.error("Monthly API Error Response:", errorText);
                    throw new Error(`Monthly API error: ${salesRes.status} ${salesRes.statusText}`);
                }

                const rawSales = await salesRes.json();
                console.log("Monthly API Response:", rawSales);

                const salesData = rawSales.success ? rawSales.data : (Array.isArray(rawSales) ? rawSales : []);

                setSalesData(salesData || []);
                setMetricsData([]);
                setLoading(false);

            } else if (dateFilterType === "range" && startDate && endDate) {
                const metricsUrl = `${backendUrl}/api/dashboard/metrics?startDate=${startDate}&endDate=${endDate}`;

                console.log("Fetching date range data from:", metricsUrl);

                const metricsRes = await fetch(metricsUrl);

                if (!metricsRes.ok) {
                    const errorText = await metricsRes.text();
                    console.error("Metrics API Error Response:", errorText);
                    throw new Error(`Metrics API error: ${metricsRes.status} ${metricsRes.statusText}. Response: ${errorText}`);
                }

                const rawMetrics = await metricsRes.json();
                console.log("Metrics API Response:", rawMetrics);

                const metricsData = rawMetrics.success ? rawMetrics.data : (Array.isArray(rawMetrics) ? rawMetrics : []);

                setSalesData([]);
                setMetricsData(metricsData || []);
                setLoading(false);

            } else {
                setSalesData([]);
                setMetricsData([]);
                setLoading(false);
            }

        } catch (err: any) {
            console.error("Error fetching performance data:", err);
            setError(`Failed to fetch data: ${err.message}`);
            setLoading(false);
        }
    };

    // Fetch data on component mount and when filters change
    useEffect(() => {
        if (dateFilterType === "monthly") {
            fetchData();
        } else if (dateFilterType === "range" && startDate && endDate) {
            fetchData();
        }
    }, [dateFilterType, month, year, startDate, endDate]);

    // Filter sales data
    const filteredSalesData = useMemo(() => {
        return salesData.filter(
            (sale) =>
                (!regionalFilter || sale.regional === regionalFilter) &&
                (!branchFilter || sale.branch === branchFilter) &&
                (!wokFilter || sale.wok === wokFilter)
        );
    }, [salesData, regionalFilter, branchFilter, wokFilter]);

    // Filter metrics data
    const filteredMetricsData = useMemo(() => {
        return metricsData.filter(
            (metric) =>
                (!regionalFilter || metric.regional === regionalFilter) &&
                (!branchFilter || metric.branch === branchFilter) &&
                (!wokFilter || metric.wok === wokFilter)
        );
    }, [metricsData, regionalFilter, branchFilter, wokFilter]);

    // Pagination for sales data
    const totalSalesItems = filteredSalesData.length;
    const totalSalesPages = Math.ceil(totalSalesItems / itemsPerPage);
    const salesStartIndex = (currentPageSales - 1) * itemsPerPage;
    const salesEndIndex = salesStartIndex + itemsPerPage;
    const paginatedSalesData = filteredSalesData.slice(salesStartIndex, salesEndIndex);

    // Pagination for metrics data
    const totalMetricsItems = filteredMetricsData.length;
    const totalMetricsPages = Math.ceil(totalMetricsItems / itemsPerPage);
    const metricsStartIndex = (currentPageMetrics - 1) * itemsPerPage;
    const metricsEndIndex = metricsStartIndex + itemsPerPage;
    const paginatedMetricsData = filteredMetricsData.slice(metricsStartIndex, metricsEndIndex);

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPageSales(1);
        setCurrentPageMetrics(1);
    }, [regionalFilter, branchFilter, wokFilter, itemsPerPage, dateFilterType, month, year, startDate, endDate]);

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

    const handleDateFilterChange = (e: ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === "dateFilterType") {
            setDateFilterType(value as "monthly" | "range");
        } else if (name === "month") {
            setMonth(Number(value));
        } else if (name === "year") {
            setYear(Number(value));
        } else if (name === "startDate") {
            setStartDate(value);
        } else if (name === "endDate") {
            setEndDate(value);
        }
    };

    const handleItemsPerPageChange = (e: ChangeEvent<HTMLSelectElement>) => {
        setItemsPerPage(Number(e.target.value));
    };

    const getPageNumbers = (currentPage: number, totalPages: number) => {
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

    // Generate filter options based on active data
    const getFilterOptions = () => {
        const activeData = dateFilterType === "monthly" ? salesData : metricsData;

        const regionalOpts = activeData.length > 0 ? Array.from(new Set(activeData.map((d) => d.regional).filter(Boolean))) : [];
        const branchOpts = activeData.length > 0 ? Array.from(
            new Set(activeData.filter((d) => !regionalFilter || d.regional === regionalFilter).map((d) => d.branch).filter(Boolean))
        ) : [];
        const wokOpts = activeData.length > 0 ? Array.from(
            new Set(
                activeData
                    .filter((d) => (!regionalFilter || d.regional === regionalFilter) && (!branchFilter || d.branch === branchFilter))
                    .map((d) => d.wok)
                    .filter(Boolean)
            )
        ) : [];

        return { regionalOpts, branchOpts, wokOpts };
    };

    const { regionalOpts, branchOpts, wokOpts } = getFilterOptions();
    const currentYear = new Date().getFullYear();
    const yearOpts = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

    if (loading || externalLoading) return <p>Loading data...</p>;

    if (error) {
        return (
            <div className="p-4">
                <h2 className="text-2xl font-bold mb-4">Performance Tables</h2>
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
            <h2 className="text-2xl font-bold mb-4">Performance Tables</h2>

            {/* Date Filter Controls */}
            <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                <h3 className="text-lg font-semibold mb-3">Date Filter</h3>
                <div className="flex flex-wrap gap-4 items-end">
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-600">Filter Type</label>
                        <select
                            name="dateFilterType"
                            value={dateFilterType}
                            onChange={handleDateFilterChange}
                            className="border rounded px-2 py-1"
                        >
                            <option value="monthly">Monthly (Overall Data)</option>
                            <option value="range">Date Range (Metrics Data)</option>
                        </select>
                    </div>

                    {dateFilterType === "monthly" ? (
                        <>
                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-600">Month</label>
                                <select
                                    name="month"
                                    value={month}
                                    onChange={handleDateFilterChange}
                                    className="border rounded px-2 py-1"
                                >
                                    {Array.from({ length: 12 }, (_, i) => (
                                        <option key={i + 1} value={i + 1}>
                                            {new Date(0, i).toLocaleString('en', { month: 'long' })}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-600">Year</label>
                                <select
                                    name="year"
                                    value={year}
                                    onChange={handleDateFilterChange}
                                    className="border rounded px-2 py-1"
                                >
                                    {yearOpts.map((y) => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-600">Start Date</label>
                                <input
                                    type="date"
                                    name="startDate"
                                    value={startDate}
                                    onChange={handleDateFilterChange}
                                    className="border rounded px-2 py-1"
                                />
                            </div>
                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-600">End Date</label>
                                <input
                                    type="date"
                                    name="endDate"
                                    value={endDate}
                                    onChange={handleDateFilterChange}
                                    className="border rounded px-2 py-1"
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Other Filters and Items Per Page Control */}
            <div className="flex flex-wrap gap-4 mb-6 items-end">
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-600">Regional</label>
                    <select
                        name="regional"
                        value={regionalFilter}
                        onChange={handleFilterChange}
                        className="border rounded px-2 py-1"
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
                        className="border rounded px-2 py-1"
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
                        className="border rounded px-2 py-1"
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
                        className="border rounded px-2 py-1"
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>
                </div>
            </div>

            {/* Monthly/Overall Data Table */}
            {dateFilterType === "monthly" && (
                <div className="mb-8">
                    <h3 className="text-xl font-semibold mb-4">Overall Sales Data - {new Date(0, month - 1).toLocaleString('en', { month: 'long' })} {year}</h3>

                    {!salesData.length && !loading && !error ? (
                        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-yellow-700">No overall sales data available for the selected month.</p>
                            <button
                                onClick={fetchData}
                                className="mt-2 px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                            >
                                Refresh Data
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Data Summary */}
                            <div className="mb-4 text-sm text-gray-600">
                                Showing {salesStartIndex + 1} to {Math.min(salesEndIndex, totalSalesItems)} of {totalSalesItems} entries
                                {(regionalFilter || branchFilter || wokFilter) && " (filtered)"}
                            </div>

                            {/* Sales Table */}
                            <div className="overflow-x-auto border rounded-lg">
                                <table className="min-w-full text-sm divide-y divide-gray-200">
                                    <thead className="bg-gray-100 sticky top-0">
                                        <tr>
                                            {["Kode SF", "Nama SF", "Total PS", "Category", "Agency", "Area", "Regional", "Branch", "WOK"].map((header) => (
                                                <th key={header} className="px-3 py-2 text-left font-medium text-gray-700">{header}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {paginatedSalesData.length === 0 ? (
                                            <tr>
                                                <td colSpan={9} className="px-3 py-8 text-center text-gray-500">
                                                    No data found matching the current filters
                                                </td>
                                            </tr>
                                        ) : (
                                            paginatedSalesData.map((row, i) => (
                                                <tr key={i} className="hover:bg-gray-50 transition">
                                                    <td className="px-3 py-2">{row.kodeSF}</td>
                                                    <td className="px-3 py-2">{row.namaSF}</td>
                                                    <td className="px-3 py-2 font-semibold">{row.totalPs}</td>
                                                    <td className="px-3 py-2">
                                                        <span className={`px-2 py-1 rounded text-xs font-medium ${row.category === 'Diamond' ? 'bg-purple-100 text-purple-800' :
                                                                row.category === 'Platinum' ? 'bg-gray-100 text-gray-800' :
                                                                    row.category === 'Gold' ? 'bg-yellow-100 text-yellow-800' :
                                                                        row.category === 'Silver' ? 'bg-gray-200 text-gray-700' :
                                                                            row.category === 'Bronze' ? 'bg-orange-100 text-orange-800' :
                                                                                'bg-gray-100 text-gray-600'
                                                            }`}>
                                                            {row.category}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-2">{row.agency}</td>
                                                    <td className="px-3 py-2">{row.area}</td>
                                                    <td className="px-3 py-2">{row.regional}</td>
                                                    <td className="px-3 py-2">{row.branch}</td>
                                                    <td className="px-3 py-2">{row.wok}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Sales Pagination */}
                            {totalSalesPages > 1 && (
                                <div className="mt-4 flex items-center justify-between">
                                    <div className="text-sm text-gray-600">
                                        Page {currentPageSales} of {totalSalesPages}
                                    </div>

                                    <div className="flex items-center space-x-1">
                                        <button
                                            onClick={() => setCurrentPageSales(currentPageSales - 1)}
                                            disabled={currentPageSales === 1}
                                            className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                                        >
                                            Previous
                                        </button>

                                        {getPageNumbers(currentPageSales, totalSalesPages).map((page, index) => (
                                            <React.Fragment key={index}>
                                                {page === '...' ? (
                                                    <span className="px-3 py-1 text-sm text-gray-500">...</span>
                                                ) : (
                                                    <button
                                                        onClick={() => setCurrentPageSales(page as number)}
                                                        className={`px-3 py-1 text-sm border rounded hover:bg-gray-100 ${currentPageSales === page
                                                                ? 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600'
                                                                : 'bg-white text-gray-700'
                                                            }`}
                                                    >
                                                        {page}
                                                    </button>
                                                )}
                                            </React.Fragment>
                                        ))}

                                        <button
                                            onClick={() => setCurrentPageSales(currentPageSales + 1)}
                                            disabled={currentPageSales === totalSalesPages}
                                            className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            {/* Date Range/Metrics Data Table */}
            {dateFilterType === "range" && (
                <div className="mb-8">
                    <h3 className="text-xl font-semibold mb-4">Performance Metrics Data - {startDate && endDate ? `${startDate} to ${endDate}` : 'Select Date Range'}</h3>

                    {!metricsData.length && !loading && !error && startDate && endDate ? (
                        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-yellow-700">No metrics data available for the selected date range.</p>
                            <button
                                onClick={fetchData}
                                className="mt-2 px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                            >
                                Refresh Data
                            </button>
                        </div>
                    ) : startDate && endDate ? (
                        <>
                            {/* Data Summary */}
                            <div className="mb-4 text-sm text-gray-600">
                                Showing {metricsStartIndex + 1} to {Math.min(metricsEndIndex, totalMetricsItems)} of {totalMetricsItems} entries
                                {(regionalFilter || branchFilter || wokFilter) && " (filtered)"}
                            </div>

                            {/* Metrics Table */}
                            <div className="overflow-x-auto border rounded-lg">
                                <table className="min-w-full text-sm divide-y divide-gray-200">
                                    <thead className="bg-gray-100 sticky top-0">
                                        <tr>
                                            {["Kode SF", "Nama SF", "Agency", "Area", "Regional", "Branch", "WOK", "WoW", "MoM", "QoQ", "YoY"].map((header) => (
                                                <th key={header} className="px-3 py-2 text-left font-medium text-gray-700">{header}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {paginatedMetricsData.length === 0 ? (
                                            <tr>
                                                <td colSpan={11} className="px-3 py-8 text-center text-gray-500">
                                                    No metrics data found matching the current filters
                                                </td>
                                            </tr>
                                        ) : (
                                            paginatedMetricsData.map((row, i) => (
                                                <tr key={i} className="hover:bg-gray-50 transition">
                                                    <td className="px-3 py-2">{row.kodeSF}</td>
                                                    <td className="px-3 py-2">{row.namaSF}</td>
                                                    <td className="px-3 py-2">{row.agency}</td>
                                                    <td className="px-3 py-2">{row.area}</td>
                                                    <td className="px-3 py-2">{row.regional}</td>
                                                    <td className="px-3 py-2">{row.branch}</td>
                                                    <td className="px-3 py-2">{row.wok}</td>
                                                    <td className={`px-3 py-2 font-semibold ${row.WoW?.includes('-') ? 'text-red-600' : 'text-green-600'}`}>
                                                        {row.WoW}
                                                    </td>
                                                    <td className={`px-3 py-2 font-semibold ${row.MoM?.includes('-') ? 'text-red-600' : 'text-green-600'}`}>
                                                        {row.MoM}
                                                    </td>
                                                    <td className={`px-3 py-2 font-semibold ${row.QoQ?.includes('-') ? 'text-red-600' : 'text-green-600'}`}>
                                                        {row.QoQ}
                                                    </td>
                                                    <td className={`px-3 py-2 font-semibold ${row.YoY?.includes('-') ? 'text-red-600' : row.YoY === 'N/A' ? 'text-gray-500' : 'text-green-600'}`}>
                                                        {row.YoY}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Metrics Pagination */}
                            {totalMetricsPages > 1 && (
                                <div className="mt-4 flex items-center justify-between">
                                    <div className="text-sm text-gray-600">
                                        Page {currentPageMetrics} of {totalMetricsPages}
                                    </div>

                                    <div className="flex items-center space-x-1">
                                        <button
                                            onClick={() => setCurrentPageMetrics(currentPageMetrics - 1)}
                                            disabled={currentPageMetrics === 1}
                                            className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                                        >
                                            Previous
                                        </button>

                                        {getPageNumbers(currentPageMetrics, totalMetricsPages).map((page, index) => (
                                            <React.Fragment key={index}>
                                                {page === '...' ? (
                                                    <span className="px-3 py-1 text-sm text-gray-500">...</span>
                                                ) : (
                                                    <button
                                                        onClick={() => setCurrentPageMetrics(page as number)}
                                                        className={`px-3 py-1 text-sm border rounded hover:bg-gray-100 ${currentPageMetrics === page
                                                                ? 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600'
                                                                : 'bg-white text-gray-700'
                                                            }`}
                                                    >
                                                        {page}
                                                    </button>
                                                )}
                                            </React.Fragment>
                                        ))}

                                        <button
                                            onClick={() => setCurrentPageMetrics(currentPageMetrics + 1)}
                                            disabled={currentPageMetrics === totalMetricsPages}
                                            className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-blue-700">Please select both start date and end date to view metrics data.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}