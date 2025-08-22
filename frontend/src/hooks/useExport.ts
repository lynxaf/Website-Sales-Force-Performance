import { useState } from 'react';
import { Filters } from '../types/dashboard';
import { apiClient } from '../utils/api';
import { API_ENDPOINTS } from '../utils/constants';

export const useExport = () => {
    const [exporting, setExporting] = useState(false);
    const [exportError, setExportError] = useState<string | null>(null);

    const exportData = async (filters: Filters) => {
        setExporting(true);
        setExportError(null);

        try {
            const blob = await apiClient.downloadFile(API_ENDPOINTS.EXPORT, { filters });

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `sales-performance-${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            return true;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Export failed';
            setExportError(errorMessage);
            return false;
        } finally {
            setExporting(false);
        }
    };

    const resetExportState = () => {
        setExportError(null);
        setExporting(false);
    };

    return {
        exportData,
        exporting,
        exportError,
        resetExportState
    };
};