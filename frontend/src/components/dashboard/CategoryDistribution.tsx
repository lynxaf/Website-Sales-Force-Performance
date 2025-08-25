import React, { ChangeEvent } from "react";
import { Pie, Bar } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

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
        allItems: [],
    };

    async componentDidMount() {
        await this.fetchData();
    }

    fetchData = async () => {
        const endpoint = this.props.endpoint || "http://localhost:5000/api/dashboard/overall";
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

        const stats: CategoryStat[] = Object.entries(grouped).map(([category, count]) => ({
            category,
            count,
            percentage: total > 0 ? ((count / total) * 100).toFixed(1) : "0",
        }));

        this.setState({ categoryStats: stats, loading: false });
    };

    handleFilterChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;

        this.setState((prevState) => {
            const newState: Partial<State> = { [name]: value } as Partial<State>;

            if (name === "regionalFilter") {
                newState.branchFilter = "";
                newState.wokFilter = "";
            } else if (name === "branchFilter") {
                newState.wokFilter = "";
            }

            return newState as Pick<State, keyof State>;
        }, () => {
            this.processData(this.state.allItems);
        });
    };

    render() {
        const { categoryStats, loading, error, regionalFilter, branchFilter, wokFilter, allItems } = this.state;

        if (loading) return <p>Loading...</p>;
        if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

        // Dynamic filter options
        const regionalOptions = Array.from(new Set(allItems.map((i) => i.regional).filter(Boolean)));
        const branchOptions = Array.from(new Set(allItems.filter((i) => !regionalFilter || i.regional === regionalFilter).map((i) => i.branch).filter(Boolean)));
        const wokOptions = Array.from(new Set(allItems.filter((i) => (!regionalFilter || i.regional === regionalFilter) && (!branchFilter || i.branch === branchFilter)).map((i) => i.wok).filter(Boolean)));

        const chartColors = ["#4B5563", "#E5E7EB", "#FBBF24", "#F97316", "#EF4444", "#8B5CF6"];
        const pieData = {
            labels: categoryStats.map((stat) => stat.category),
            datasets: [{ data: categoryStats.map((stat) => stat.count), backgroundColor: chartColors }],
        };
        const barData = {
            labels: categoryStats.map((stat) => stat.category),
            datasets: [{ label: "Count", data: categoryStats.map((stat) => stat.count), backgroundColor: chartColors }],
        };

        return (
            <div className="space-y-6">
                <h2 className="text-xl font-bold mb-4">Category Stats</h2>

                {/* Filters */}
                <div className="flex flex-wrap gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-600">Regional</label>
                        <select value={regionalFilter} name="regionalFilter" onChange={this.handleFilterChange} className="border rounded px-2 py-1">
                            <option value="">All Regional</option>
                            {regionalOptions.map((r) => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600">Branch</label>
                        <select value={branchFilter} name="branchFilter" onChange={this.handleFilterChange} className="border rounded px-2 py-1">
                            <option value="">All Branches</option>
                            {branchOptions.map((b) => <option key={b} value={b}>{b}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600">WOK</label>
                        <select value={wokFilter} name="wokFilter" onChange={this.handleFilterChange} className="border rounded px-2 py-1">
                            <option value="">All WOK</option>
                            {wokOptions.map((w) => <option key={w} value={w}>{w}</option>)}
                        </select>
                    </div>
                </div>

                {categoryStats.length === 0 ? (
                    <p>No category data available</p>
                ) : (
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* List */}
                        <ul className="space-y-2">
                            {categoryStats.map((stat, i) => (
                                <li key={i} className="p-2 border rounded flex justify-between">
                                    <span className="font-medium">{stat.category}</span>
                                    <span>{stat.count} ({stat.percentage}%)</span>
                                </li>
                            ))}
                        </ul>

                        {/* Charts */}
                        <div className="space-y-6">
                            <div className="p-4 border rounded shadow-sm">
                                <h3 className="text-lg font-semibold mb-2">Pie Chart</h3>
                                <Pie data={pieData} />
                            </div>
                            <div className="p-4 border rounded shadow-sm">
                                <h3 className="text-lg font-semibold mb-2">Bar Chart</h3>
                                <Bar data={barData} />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }
}
