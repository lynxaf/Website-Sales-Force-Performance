"use client";

import React, { useState, useMemo, ChangeEvent } from "react";

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
    salesData: SalesData[];
    metricsData: MetricsData[];
    loading: boolean;
}

export default function PerformanceTable({ salesData, metricsData, loading }: PerformanceTableProps) {
    // Filter hooks
    const [regionalFilter, setRegionalFilter] = useState("");
    const [branchFilter, setBranchFilter] = useState("");
    const [wokFilter, setWokFilter] = useState("");

    // Pagination hooks
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Merge sales + metrics with filters
    const filteredData = useMemo(() => {
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
    }, [salesData, metricsData, regionalFilter, branchFilter, wokFilter]);

    // Pagination calculations
    const totalItems = filteredData.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    // Reset to first page when filters change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [regionalFilter, branchFilter, wokFilter, itemsPerPage]);

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

    if (loading) return <p>Loading data...</p>;
    if (!salesData.length) return <p className="text-gray-500">No sales data available.</p>;

    // Dynamic filter options
    const regionalOptions = Array.from(new Set(salesData.map((d) => d.regional).filter(Boolean)));
    const branchOptions = Array.from(
        new Set(salesData.filter((d) => !regionalFilter || d.regional === regionalFilter).map((d) => d.branch).filter(Boolean))
    );
    const wokOptions = Array.from(
        new Set(
            salesData
                .filter((d) => (!regionalFilter || d.regional === regionalFilter) && (!branchFilter || d.branch === branchFilter))
                .map((d) => d.wok)
                .filter(Boolean)
        )
    );

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Performance Table</h2>

            {/* Filters and Items Per Page Control */}
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
                        {regionalOptions.map((r) => (
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
                        {branchOptions.map((b) => (
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
                        {wokOptions.map((w) => (
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

            {/* Data Summary */}
            <div className="mb-4 text-sm text-gray-600">
                Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} entries
                {(regionalFilter || branchFilter || wokFilter) && " (filtered)"}
            </div>

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
                                    No data found matching the current filters
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
                                    <td className="px-3 py-2">{row.WoW}</td>
                                    <td className="px-3 py-2">{row.MoM}</td>
                                    <td className="px-3 py-2">{row.QoQ}</td>
                                    <td className="px-3 py-2">{row.YoY}</td>
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