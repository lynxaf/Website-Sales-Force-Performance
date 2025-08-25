"use client";

import React from "react";

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

export default function PerformanceTable({
    salesData,
    metricsData,
    loading,
}: PerformanceTableProps) {
    if (loading) return <p>Loading data...</p>;

    if (!salesData.length) {
        return <p className="text-gray-500">No sales data available.</p>;
    }

    // Gabungkan salesData + metricsData berdasarkan kodeSF
    const mergedData = salesData.map((sale) => {
        const metric = metricsData.find((m) => m.kodeSF === sale.kodeSF);
        return {
            ...sale,
            WoW: metric?.WoW || "-",
            MoM: metric?.MoM || "-",
            QoQ: metric?.QoQ || "-",
            YoY: metric?.YoY || "-",
        };
    });

    return (
        <div className="p-4 overflow-x-auto">
            <h2 className="text-xl font-bold mb-4">Performance Table</h2>
            <table className="min-w-full border text-sm">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="border px-2 py-1">Kode SF</th>
                        <th className="border px-2 py-1">Nama SF</th>
                        <th className="border px-2 py-1">Total PS</th>
                        <th className="border px-2 py-1">Category</th>
                        <th className="border px-2 py-1">Agency</th>
                        <th className="border px-2 py-1">Area</th>
                        <th className="border px-2 py-1">Regional</th>
                        <th className="border px-2 py-1">Branch</th>
                        <th className="border px-2 py-1">Wok</th>
                        <th className="border px-2 py-1">WoW</th>
                        <th className="border px-2 py-1">MoM</th>
                        <th className="border px-2 py-1">QoQ</th>
                        <th className="border px-2 py-1">YoY</th>
                    </tr>
                </thead>
                <tbody>
                    {mergedData.map((row, i) => (
                        <tr key={i} className="hover:bg-gray-100">
                            <td className="border px-2 py-1">{row.kodeSF}</td>
                            <td className="border px-2 py-1">{row.namaSF}</td>
                            <td className="border px-2 py-1">{row.totalPs}</td>
                            <td className="border px-2 py-1">{row.category}</td>
                            <td className="border px-2 py-1">{row.agency}</td>
                            <td className="border px-2 py-1">{row.area}</td>
                            <td className="border px-2 py-1">{row.regional}</td>
                            <td className="border px-2 py-1">{row.branch}</td>
                            <td className="border px-2 py-1">{row.wok}</td>
                            <td className="border px-2 py-1">{row.WoW}</td>
                            <td className="border px-2 py-1">{row.MoM}</td>
                            <td className="border px-2 py-1">{row.QoQ}</td>
                            <td className="border px-2 py-1">{row.YoY}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
