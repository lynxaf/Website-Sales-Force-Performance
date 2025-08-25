import React from "react";

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
}

export default class CategoryStats extends React.Component<Props, State> {
    state: State = {
        categoryStats: [],
        loading: true,
        error: null,
    };

    async componentDidMount() {
        const endpoint =
            this.props.endpoint || "http://localhost:5000/api/dashboard/overall";

        try {
            const res = await fetch(endpoint);
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

            const data = await res.json();
            console.log("API Response:", data); // 🔍 cek di console

            // Pastikan data array
            const items: any[] = Array.isArray(data)
                ? data
                : Array.isArray(data.data)
                    ? data.data
                    : [];

            // Grouping kategori
            const grouped: Record<string, number> = {};
            let total = 0;

            items.forEach((item: any) => {
                const cat = item.category || "Unknown";
                grouped[cat] = (grouped[cat] || 0) + 1;
                total++;
            });

            const stats: CategoryStat[] = Object.entries(grouped).map(
                ([category, count]) => ({
                    category,
                    count,
                    percentage: total > 0 ? ((count / total) * 100).toFixed(1) : "0",
                })
            );

            this.setState({ categoryStats: stats, loading: false });
        } catch (err: any) {
            console.error("Error fetching category stats:", err);
            this.setState({ loading: false, error: err.message || "Fetch error" });
        }
    }

    render() {
        const { categoryStats, loading, error } = this.state;

        if (loading) return <p>Loading...</p>;
        if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

        return (
            <div>
                <h2>Category Stats</h2>
                {categoryStats.length === 0 ? (
                    <p>No category data available</p>
                ) : (
                    <ul>
                        {categoryStats.map((stat, i) => (
                            <li key={i}>
                                {stat.category}: {stat.count} ({stat.percentage}%)
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        );
    }
}
