import React, { ChangeEvent } from "react";
import { Pie } from "react-chartjs-2";
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, ChartDataLabels);

interface CategoryStat {
    category: string;
    count: number;
    percentage: string;
}

interface Props {
    endpoint?: string;
}

interface State {
    categoryStats: CategoryStat[];
    loading: boolean;
    error: string | null;
    regionalFilter: string;
    branchFilter: string;
    wokFilter: string;
    monthFilter: number;
    yearFilter: number;
    allItems: any[];
}

export default class CategoryStats extends React.Component<Props, State> {
    state: State = {
        categoryStats: [],
        loading: true,
        error: null,
        regionalFilter: "",
        branchFilter: "",
        wokFilter: "",
        monthFilter: new Date().getMonth() + 1,
        yearFilter: new Date().getFullYear(),
        allItems: [],
    };

    async componentDidMount() {
        await this.fetchData();
    }

    fetchData = async () => {
        const { monthFilter, yearFilter } = this.state;
        const endpoint = this.props.endpoint || `http://localhost:5000/api/dashboard/overall/monthly?month=${monthFilter}&year=${yearFilter}`;
        try {
            const res = await fetch(endpoint);
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const data = await res.json();
            const items: any[] = Array.isArray(data) ? data : Array.isArray(data.data) ? data.data : [];
            this.setState({ allItems: items });
            this.processData(items);
        } catch (err: any) {
            console.error("Error fetching category stats:", err);
            this.setState({ loading: false, error: err.message || "Fetch error" });
        }
    };

    processData = (items: any[]) => {
        const { regionalFilter, branchFilter, wokFilter } = this.state;
        const filteredItems = items.filter((item) => {
            return (
                (!regionalFilter || item.regional === regionalFilter) &&
                (!branchFilter || item.branch === branchFilter) &&
                (!wokFilter || item.wok === wokFilter)
            );
        });

        const grouped: Record<string, number> = {};
        let total = 0;
        filteredItems.forEach((item) => {
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

        this.setState({ categoryStats: stats, loading: false });
    };

    handleFilterChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name === "monthFilter" || name === "yearFilter") {
            // Handle numeric filters with proper typing
            if (name === "monthFilter") {
                this.setState({ monthFilter: Number(value) }, () => this.fetchData());
            } else if (name === "yearFilter") {
                this.setState({ yearFilter: Number(value) }, () => this.fetchData());
            }
            return;
        }

        // Handle string filters with proper typing
        if (name === "regionalFilter") {
            this.setState(
                {
                    regionalFilter: value,
                    branchFilter: "",
                    wokFilter: "",
                },
                () => this.processData(this.state.allItems)
            );
        } else if (name === "branchFilter") {
            this.setState(
                {
                    branchFilter: value,
                    wokFilter: "",
                },
                () => this.processData(this.state.allItems)
            );
        } else if (name === "wokFilter") {
            this.setState(
                {
                    wokFilter: value,
                },
                () => this.processData(this.state.allItems)
            );
        }
    };

    render() {
        const { categoryStats, loading, error, regionalFilter, branchFilter, wokFilter, allItems, monthFilter, yearFilter } = this.state;

        if (loading) return <p>Loading...</p>;
        if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

        const regionalOptions = Array.from(new Set(allItems.map((i) => i.regional).filter(Boolean)));
        const branchOptions = Array.from(new Set(allItems.filter((i) => !regionalFilter || i.regional === regionalFilter).map((i) => i.branch).filter(Boolean)));
        const wokOptions = Array.from(new Set(allItems.filter((i) => (!regionalFilter || i.regional === regionalFilter) && (!branchFilter || i.branch === branchFilter)).map((i) => i.wok).filter(Boolean)));

        const chartColors = ["#050917", "#e8d6d6", "#D4AF37", "#A7AFB6", "#9F6700", "#81C7ED", "#3B82F6"];
        const pieData = {
            labels: categoryStats.map((stat) => stat.category),
            datasets: [{ data: categoryStats.map((stat) => stat.count), backgroundColor: chartColors, borderWidth: 1 }],
        };
        const chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: "bottom" as const },
                tooltip: { enabled: true },
                datalabels: { anchor: "end" as const, align: "top" as const, color: "#000", font: { weight: "bold" as const } },
            },
        };

        return (
            <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-4">Category Stats</h2>

                {/* Filters */}
                <div className="flex flex-wrap gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-600">Month</label>
                        <select name="monthFilter" value={monthFilter} onChange={this.handleFilterChange} className="border rounded px-3 py-2">
                            {[...Array(12)].map((_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600">Year</label>
                        <select name="yearFilter" value={yearFilter} onChange={this.handleFilterChange} className="border rounded px-3 py-2">
                            {[2024, 2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
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
                </div>

                {categoryStats.length === 0 ? (
                    <p>No category data available</p>
                ) : (
                    <div className="p-6 border rounded shadow-md">
                        {/* Horizontal Layout */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Left Side - Category List */}
                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold mb-4">Category Breakdown</h3>
                                <ul className="space-y-2">
                                    {categoryStats.map((stat, i) => (
                                        <li key={i} className="p-4 border rounded-md flex justify-between items-center shadow-sm hover:bg-gray-50 transition">
                                            <span className="font-medium">{stat.category}</span>
                                            <span className="text-gray-700">{stat.count} ({stat.percentage}%)</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Right Side - Pie Chart */}
                            <div className="flex flex-col">
                                <h3 className="text-lg font-semibold mb-4">Distribution Chart</h3>
                                <div className="h-96 flex-1">
                                    <Pie data={pieData} options={chartOptions} plugins={[ChartDataLabels]} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }
}