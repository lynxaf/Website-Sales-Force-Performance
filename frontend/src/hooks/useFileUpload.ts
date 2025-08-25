import { useState } from 'react';
import { UploadResponse } from '../types/dashboard';
import { apiClient } from '../utils/api';
import { API_ENDPOINTS } from '../utils/constants';

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
            formData.append('sales_data', file);

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
