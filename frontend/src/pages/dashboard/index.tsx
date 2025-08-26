import React from 'react';
import Head from 'next/head';
import { Download, Upload, RefreshCw } from 'lucide-react';

// Components
import { Button } from '../../components/ui/Button';
import StatisticsCards from "../../components/dashboard/StatisticsCards";
import { FilterControls } from '../../components/dashboard/FilterControls';
import CategoryDistribution from "../../components/dashboard/CategoryDistribution";
import PerformanceTable from '../../components/dashboard/PerformanceTable';
import { UploadModal } from '../../components/dashboard/UploadModal';

// Types
import { DashboardStats } from '../../types/dashboard';

interface DashboardPageState {
  salesData: any[];
  metricsData: any[];
  filterOptions: any;
  filters: any;
  loading: boolean;
  error: string | null;
  uploadModalOpen: boolean;
  exporting: boolean;
  exportError: string | null;
}

export default class DashboardPage extends React.Component<{}, DashboardPageState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      salesData: [],
      metricsData: [],
      filterOptions: {},
      filters: {},
      loading: true,
      error: null,
      uploadModalOpen: false,
      exporting: false,
      exportError: null,
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchData = async () => {
    this.setState({ loading: true, error: null });
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

      const [salesRes,] = await Promise.all([
        fetch(`${backendUrl}/api/dashboard/overall`),
        // fetch(`${backendUrl}/api/dashboard/metrics`),
      ]);

      // Check if responses are OK
      if (!salesRes.ok) {
        throw new Error(`Sales API error: ${salesRes.status} ${salesRes.statusText}`);
      }
      // if (!metricsRes.ok) {
      //   throw new Error(`Metrics API error: ${metricsRes.status} ${metricsRes.statusText}`);
      // }

      const rawSales = await salesRes.json();
      // const rawMetrics = await metricsRes.json();

      // Debug: Log the actual API responses
      console.log("Sales API Response:", rawSales);
      // console.log("Metrics API Response:", rawMetrics);

      // Extract data based on your backend controller structure
      const salesData = rawSales.success ? rawSales.data : [];
      // const metricsData = rawMetrics.success ? rawMetrics.data : [];

      console.log("Extracted Sales Data:", salesData);
      // console.log("Extracted Metrics Data:", metricsData);

      this.setState({
        salesData: salesData || [],
        // metricsData: metricsData || [],
        filterOptions: rawSales.filterOptions || {},
        loading: false,
      });
    } catch (err: any) {
      console.error("Error fetching dashboard data:", err);
      this.setState({
        error: `Failed to fetch dashboard data: ${err.message}`,
        loading: false
      });
    }
  };

  handleUploadSuccess = () => {
    this.fetchData();
  };

  handleExport = async () => {
    this.setState({ exporting: true, exportError: null });
    try {
      const res = await fetch("http://localhost:5000/api/dashboard/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(this.state.filters),
      });

      if (!res.ok) throw new Error("Export failed");

      // trigger download
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "export.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();

      this.setState({ exporting: false });
    } catch (err: any) {
      this.setState({ exportError: err.message, exporting: false });
      alert(`Export failed: ${err.message}`);
    }
  };

  handleRefresh = () => {
    this.fetchData();
  };

  updateFilters = (newFilters: any) => {
    this.setState({ filters: newFilters }, this.fetchData);
  };

  resetFilters = () => {
    this.setState({ filters: {} }, this.fetchData);
  };

  calculateStats = (): DashboardStats => {
    const { salesData } = this.state;
    const totalSalesForce = salesData.length;
    const totalPS = salesData.reduce((sum, item) => sum + item.totalPs, 0);
    const avgPerformance = totalSalesForce > 0
      ? (totalPS / totalSalesForce).toFixed(2)
      : "0";
    const topPerformer = salesData.reduce(
      (top, current) =>
        current.totalPs > (top?.totalPs || 0) ? current : top,
      salesData[0] || null
    );

    return {
      totalSalesForce,
      totalPS,
      avgPerformance,
      topPerformer,
    };
  };

  render() {
    const {
      salesData,
      metricsData,
      filterOptions,
      filters,
      loading,
      error,
      uploadModalOpen,
      exporting,
    } = this.state;

    const stats = this.calculateStats();

    return (
      <>
        <Head>
          <title>Sales Force Performance Dashboard</title>
          <meta
            name="description"
            content="Monitor and analyze sales force performance metrics"
          />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>

        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Sales Force Performance Dashboard
                </h1>
                <p className="text-gray-600 mt-2">
                  Monitor and analyze sales force performance metrics
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                {/* Upload Button */}
                <Button
                  onClick={() => this.setState({ uploadModalOpen: true })}
                  icon={Upload}
                  variant="primary"
                >
                  Upload Excel
                </Button>

                {/* Export Button */}
                <Button
                  onClick={this.handleExport}
                  loading={exporting}
                  icon={Download}
                  variant="success"
                >
                  {exporting ? "Exporting..." : "Export Excel"}
                </Button>

                {/* Refresh Button */}
                <Button
                  onClick={this.handleRefresh}
                  disabled={loading}
                  icon={RefreshCw}
                  variant="outline"
                >
                  Refresh
                </Button>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {/* Category Distribution (langsung fetch API) */}
            <div className="mb-8">
              <CategoryDistribution />
            </div>

            {/* Performance Table - Now manages its own data */}
            <div className="mb-8">
              <PerformanceTable />
            </div>

            {/* Upload Modal */}
            <UploadModal
              isOpen={uploadModalOpen}
              onClose={() => this.setState({ uploadModalOpen: false })}
              onUploadSuccess={this.handleUploadSuccess}
            />
          </div>
        </div>
      </>
    );
  }
}