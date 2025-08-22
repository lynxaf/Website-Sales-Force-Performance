import { useState, useEffect, useCallback } from 'react';
import { SalesForceData, MetricsData, FilterOptions, Filters, UploadResponse } from '../types/dashboard';
import { ApiResponse } from '../types/api';
import { apiClient } from '../utils/api';
import { API_ENDPOINTS, DEFAULT_FILTERS } from '../utils/constants';

export const useDashboardData = () => {
    const [salesData, setSalesData] = useState<SalesForceData[]>([]);
    const [metricsData, setMetricsData] = useState<MetricsData[]>([]);
    const [filterOptions, setFilterOptions] = useState<FilterOptions>({
        regional: [],
        branch: [],
        wok: [],
        category: ['Black', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond']
    });
    const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch filter options
    const fetchFilterOptions = useCallback(async () => {
        try {
            const response = await apiClient.get<ApiResponse<FilterOptions>>(
                API_ENDPOINTS.FILTER_OPTIONS
            );
            if (response.success) {
                setFilterOptions(response.data);
            }
        } catch (err) {
            console.error('Error fetching filter options:', err);
        }
    }, []);

    // Fetch performance data
    const fetchPerformanceData = useCallback(async (currentFilters: Filters) => {
        try {
            setLoading(true);
            setError(null);

            // Build query parameters
            const params: Record<string, string> = {};
            if (currentFilters.regional) params.regional = currentFilters.regional;
            if (currentFilters.branch) params.branch = currentFilters.branch;
            if (currentFilters.wok) params.wok = currentFilters.wok;
            if (currentFilters.category) params.category = currentFilters.category;

            const response = await apiClient.get<ApiResponse<SalesForceData[]>>(
                API_ENDPOINTS.PERFORMANCE,
                params
            );

            if (response.success) {
                setSalesData(response.data);
            } else {
                setError('Failed to fetch performance data');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            console.error('Error fetching performance data:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch metrics data
    const fetchMetricsData = useCallback(async () => {
        try {
            const response = await apiClient.get<ApiResponse<MetricsData[]>>(
                API_ENDPOINTS.METRICS
            );
            if (response.success) {
                setMetricsData(response.data);
            }
        } catch (err) {
            console.error('Error fetching metrics data:', err);
        }
    }, []);

    // Refresh all data
    const refreshData = useCallback(async () => {
        await Promise.all([
            fetchPerformanceData(filters),
            fetchMetricsData()
        ]);
    }, [filters, fetchPerformanceData, fetchMetricsData]);

    // Update filters and fetch new data
    const updateFilters = useCallback((newFilters: Partial<Filters>) => {
        const updatedFilters = { ...filters, ...newFilters };
        setFilters(updatedFilters);
        fetchPerformanceData(updatedFilters);
    }, [filters, fetchPerformanceData]);

    // Reset filters
    const resetFilters = useCallback(() => {
        setFilters(DEFAULT_FILTERS);
        fetchPerformanceData(DEFAULT_FILTERS);
    }, [fetchPerformanceData]);

    // Initial data fetch
    useEffect(() => {
        const initializeData = async () => {
            await fetchFilterOptions();
            await fetchPerformanceData(DEFAULT_FILTERS);
            await fetchMetricsData();
        };

        initializeData();
    }, [fetchFilterOptions, fetchPerformanceData, fetchMetricsData]);

    return {
        // Data
        salesData,
        metricsData,
        filterOptions,
        filters,

        // States
        loading,
        error,

        // Actions
        updateFilters,
        resetFilters,
        refreshData,

        // Raw functions (for manual control)
        fetchPerformanceData,
        fetchMetricsData,
        fetchFilterOptions
    };
};
export const useFileUpload = () => {
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const uploadFile = async (file: File): Promise<UploadResponse | null> => {
        if (!file) {
            setUploadError('No file selected');
            return null;
        }

        // Validate file type
        const validTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel'
        ];

        if (!validTypes.includes(file.type)) {
            setUploadError('Please select a valid Excel file (.xlsx or .xls)');
            return null;
        }

        // Validate file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
            setUploadError('File size must be less than 10MB');
            return null;
        }

        setUploading(true);
        setUploadError(null);

        try {
            const formData = new FormData();
            formData.append('excelFile', file);

            const response = await apiClient.post<UploadResponse>(
                API_ENDPOINTS.UPLOAD,
                formData
            );

            return response;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Upload failed';
            setUploadError(errorMessage);
            return null;
        } finally {
            setUploading(false);
        }
    };

    const resetUploadState = () => {
        setUploadError(null);
        setUploading(false);
    };

    return {
        uploadFile,
        uploading,
        uploadError,
        resetUploadState
    };
};