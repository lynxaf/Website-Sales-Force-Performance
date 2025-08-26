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
    // Hooks always at top
    const [regionalFilter, setRegionalFilter] = useState("");
    const [branchFilter, setBranchFilter] = useState("");
    const [wokFilter, setWokFilter] = useState("");

    // Merge sales + metrics with filters
    const mergedData = useMemo(() => {
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

            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-4">
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
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full border text-sm divide-y divide-gray-200">
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
                        {mergedData.map((row, i) => (
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
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
