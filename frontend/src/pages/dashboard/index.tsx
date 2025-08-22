import React, { useState, useMemo } from 'react';
import Head from 'next/head';
import { Download, Upload, RefreshCw } from 'lucide-react';

// Components
import { Button } from '../../components/ui/Button';
import { StatisticsCards } from '../../components/dashboard/StatisticsCards';
import { FilterControls } from '../../components/dashboard/FilterControls';
import { CategoryDistribution } from '../../components/dashboard/CategoryDistribution';
import { PerformanceTable } from '../../components/dashboard/PerformanceTable';
import { UploadModal } from '../../components/dashboard/UploadModal';

// Hooks
import { useDashboardData } from '../../hooks/useDashboardData';
import { useExport } from '../../hooks/useExport';

// Types
import { DashboardStats, CategoryStat } from '../../types/dashboard';

const DashboardPage: React.FC = () => {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  // Data hooks
  const {
    salesData,
    metricsData,
    filterOptions,
    filters,
    loading,
    error,
    updateFilters,
    resetFilters,
    refreshData
  } = useDashboardData();

  const { exportData, exporting, exportError } = useExport();

  // Calculate statistics
  const stats: DashboardStats = useMemo(() => {
    const totalSalesForce = salesData.length;
    const totalPS = salesData.reduce((sum, item) => sum + item.totalPs, 0);
    const avgPerformance = totalSalesForce > 0
      ? (totalPS / totalSalesForce).toFixed(2)
      : '0';
    const topPerformer = salesData.reduce((top, current) =>
      current.totalPs > (top?.totalPs || 0) ? current : top,
      salesData[0] || null
    );

    return {
      totalSalesForce,
      totalPS,
      avgPerformance,
      topPerformer
    };
  }, [salesData]);

  // Calculate category distribution
  const categoryStats: CategoryStat[] = useMemo(() => {
    const categories = ['Black', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'];
    return categories.map(cat => {
      const count = salesData.filter(item => item.category === cat).length;
      const percentage = salesData.length > 0
        ? ((count / salesData.length) * 100).toFixed(1)
        : '0';

      return {
        category: cat,
        count,
        percentage
      };
    });
  }, [salesData]);

  // Handle file upload success
  const handleUploadSuccess = () => {
    refreshData();
  };

  // Handle export
  const handleExport = async () => {
    const success = await exportData(filters);
    if (!success && exportError) {
      alert(`Export failed: ${exportError}`);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    refreshData();
  };

  return (
    <>
      <Head>
        <title>Sales Force Performance Dashboard</title>
        <meta name="description" content="Monitor and analyze sales force performance metrics" />
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
                onClick={() => setUploadModalOpen(true)}
                icon={Upload}
                variant="primary"
              >
                Upload Excel
              </Button>

              {/* Export Button */}
              <Button
                onClick={handleExport}
                loading={exporting}
                icon={Download}
                variant="success"
              >
                {exporting ? 'Exporting...' : 'Export Excel'}
              </Button>

              {/* Refresh Button */}
              <Button
                onClick={handleRefresh}
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

          {/* Filter Controls */}
          <div className="mb-8">
            <FilterControls
              filters={filters}
              filterOptions={filterOptions}
              onFilterChange={updateFilters}
              onReset={resetFilters}
              loading={loading}
            />
          </div>

          {/* Statistics Cards */}
          <div className="mb-8">
            <StatisticsCards stats={stats} loading={loading} />
          </div>

          {/* Category Distribution */}
          <div className="mb-8">
            <CategoryDistribution
              categoryStats={categoryStats}
              loading={loading}
            />
          </div>

          {/* Performance Table */}
          <div className="mb-8">
            <PerformanceTable
              salesData={salesData}
              metricsData={metricsData}
              loading={loading}
            />
          </div>

          {/* Upload Modal */}
          <UploadModal
            isOpen={uploadModalOpen}
            onClose={() => setUploadModalOpen(false)}
            onUploadSuccess={handleUploadSuccess}
          />
        </div>
      </div>
    </>
  );
};

export default DashboardPage;