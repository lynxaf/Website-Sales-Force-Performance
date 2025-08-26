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

    // Pagination hooks
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Fetch data function
    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

            if (dateFilterType === "monthly") {
                // For monthly filter, use the monthly endpoint
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
                setMetricsData([]); // Clear metrics data for monthly view
                setLoading(false);

            } else if (dateFilterType === "range" && startDate && endDate) {
                // For date range filter, use the metrics endpoint
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

                // For date range, the metrics endpoint contains full sales data + metrics
                const salesDataFromMetrics = (metricsData || []).map((metric: any) => ({
                    kodeSF: metric.kodeSF || "",
                    namaSF: metric.namaSF || "",
                    totalPs: metric.totalPs || 0, // May not be in metrics endpoint
                    category: metric.category || "", // May not be in metrics endpoint  
                    agency: metric.agency || "",
                    area: metric.area || "",
                    regional: metric.regional || "",
                    branch: metric.branch || "",
                    wok: metric.wok || ""
                }));

                setSalesData(salesDataFromMetrics);
                setMetricsData(metricsData || []);
                setLoading(false);

            } else {
                // If date range is selected but no dates provided, clear data
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

    // Merge sales + metrics with filters based on dateFilterType
    const filteredData = useMemo(() => {
        if (dateFilterType === "monthly") {
            // For monthly data, use only the sales data from monthly endpoint
            return salesData
                .filter(
                    (sale) =>
                        (!regionalFilter || sale.regional === regionalFilter) &&
                        (!branchFilter || sale.branch === branchFilter) &&
                        (!wokFilter || sale.wok === wokFilter)
                )
                .map((sale) => ({
                    ...sale,
                    WoW: "-", // Not available in monthly endpoint
                    MoM: "-", // Not available in monthly endpoint
                    QoQ: "-", // Not available in monthly endpoint
                    YoY: "-"  // Not available in monthly endpoint
                }));
        } else {
            // For date range data, use the metrics data
            return salesData
                .filter(
                    (sale) =>
                        (!regionalFilter || sale.regional === regionalFilter) &&
                        (!branchFilter || sale.branch === branchFilter) &&
                        (!wokFilter || sale.wok === wokFilter)
                )
                .map((sale) => {
                    const metric = metricsData.find((m) => m.kodeSF === sale.kodeSF);
                    return {
                        ...sale,
                        WoW: metric?.WoW || "-",
                        MoM: metric?.MoM || "-",
                        QoQ: metric?.QoQ || "-",
                        YoY: metric?.YoY || "-",
                    };
                });
        }
    }, [salesData, metricsData, regionalFilter, branchFilter, wokFilter, dateFilterType]);

    // Pagination calculations
    const totalItems = filteredData.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
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

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const getPageNumbers = () => {
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

    // Generate filter options
    const getFilterOptions = () => {
        const regionalOpts = salesData.length > 0 ? Array.from(new Set(salesData.map((d) => d.regional).filter(Boolean))) : [];
        const branchOpts = salesData.length > 0 ? Array.from(
            new Set(salesData.filter((d) => !regionalFilter || d.regional === regionalFilter).map((d) => d.branch).filter(Boolean))
        ) : [];
        const wokOpts = salesData.length > 0 ? Array.from(
            new Set(
                salesData
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
                <h2 className="text-2xl font-bold mb-4">Performance Table</h2>
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
            <h2 className="text-2xl font-bold mb-4">Performance Table</h2>

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
                            <option value="monthly">Monthly</option>
                            <option value="range">Date Range</option>
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
            <div className="flex flex-wrap gap-4 mb-4 items-end">
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

            {/* Show message if no data, but still show filters above */}
            {!salesData.length && !loading && !error && (
                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-700">No sales data available for the selected date range.</p>
                    <button
                        onClick={fetchData}
                        className="mt-2 px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                    >
                        Refresh Data
                    </button>
                </div>
            )}

            {/* Data Summary - only show if we have data */}
            {salesData.length > 0 && (
                <div className="mb-4 text-sm text-gray-600">
                    Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} entries
                    {(regionalFilter || branchFilter || wokFilter) && " (filtered)"}
                    {dateFilterType === "monthly"
                        ? ` • ${new Date(0, month - 1).toLocaleString('en', { month: 'long' })} ${year}`
                        : (startDate && endDate) ? ` • ${startDate} to ${endDate}` : ""
                    }
                </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto border rounded-lg">
                <table className="min-w-full text-sm divide-y divide-gray-200">
                    <thead className="bg-gray-100 sticky top-0">
                        <tr>
                            {[
                                "Kode SF", "Nama SF", "Total PS", "Category", "Agency", "Area", "Regional", "Branch", "Wok",
                                "WoW", "MoM", "QoQ", "YoY"
                            ].map((header) => (
                                <th key={header} className="px-3 py-2 text-left font-medium text-gray-700">{header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedData.length === 0 ? (
                            <tr>
                                <td colSpan={13} className="px-3 py-8 text-center text-gray-500">
                                    {salesData.length === 0
                                        ? "No data available for the selected filters and date range"
                                        : "No data found matching the current filters"
                                    }
                                </td>
                            </tr>
                        ) : (
                            paginatedData.map((row, i) => (
                                <tr key={i} className="hover:bg-gray-50 transition">
                                    <td className="px-3 py-2">{row.kodeSF}</td>
                                    <td className="px-3 py-2">{row.namaSF}</td>
                                    <td className="px-3 py-2">{row.totalPs}</td>
                                    <td className="px-3 py-2">{row.category}</td>
                                    <td className="px-3 py-2">{row.agency}</td>
                                    <td className="px-3 py-2">{row.area}</td>
                                    <td className="px-3 py-2">{row.regional}</td>
                                    <td className="px-3 py-2">{row.branch}</td>
                                    <td className="px-3 py-2">{row.wok}</td>
                                    <td className={`px-3 py-2 ${row.WoW.includes('-') ? 'text-red-600' : 'text-green-600'}`}>
                                        {row.WoW}
                                    </td>
                                    <td className={`px-3 py-2 ${row.MoM.includes('-') ? 'text-red-600' : 'text-green-600'}`}>
                                        {row.MoM}
                                    </td>
                                    <td className={`px-3 py-2 ${row.QoQ.includes('-') ? 'text-red-600' : 'text-green-600'}`}>
                                        {row.QoQ}
                                    </td>
                                    <td className={`px-3 py-2 ${row.YoY.includes('-') ? 'text-red-600' : row.YoY === 'N/A' ? 'text-gray-500' : 'text-green-600'}`}>
                                        {row.YoY}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                        Page {currentPage} of {totalPages}
                    </div>

                    <div className="flex items-center space-x-1">
                        {/* Previous Button */}
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                        >
                            Previous
                        </button>

                        {/* Page Numbers */}
                        {getPageNumbers().map((page, index) => (
                            <React.Fragment key={index}>
                                {page === '...' ? (
                                    <span className="px-3 py-1 text-sm text-gray-500">...</span>
                                ) : (
                                    <button
                                        onClick={() => handlePageChange(page as number)}
                                        className={`px-3 py-1 text-sm border rounded hover:bg-gray-100 ${currentPage === page
                                            ? 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600'
                                            : 'bg-white text-gray-700'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                )}
                            </React.Fragment>
                        ))}

                        {/* Next Button */}
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}