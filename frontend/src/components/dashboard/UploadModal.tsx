import React, { useState } from 'react';
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { useFileUpload } from '../../hooks/useDashboardData';

interface UploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUploadSuccess: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
    isOpen,
    onClose,
    onUploadSuccess
}) => {
    const [dragActive, setDragActive] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadResult, setUploadResult] = useState<any>(null);

    const { uploadFile, uploading, uploadError } = useFileUpload();

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const files = e.dataTransfer.files;
        if (files && files[0]) {
            setSelectedFile(files[0]);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files[0]) {
            setSelectedFile(files[0]);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        const result = await uploadFile(selectedFile);
        if (result) {
            setUploadResult(result);
            if (result.success) {
                onUploadSuccess();
                setTimeout(() => {
                    handleClose();
                }, 2000);
            }
        }
    };

    const handleClose = () => {
        setSelectedFile(null);
        setUploadResult(null);
        setDragActive(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Background overlay */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50"
                onClick={handleClose}
            />

            {/* Modal content */}
            <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Upload Excel File
                    </h3>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Upload Area */}
                    <div
                        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive
                            ? 'border-blue-400 bg-blue-50'
                            : 'border-gray-300 hover:border-gray-400'
                            }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <div className="space-y-2">
                            <p className="text-lg font-medium text-gray-900">
                                {selectedFile ? selectedFile.name : 'Choose a file or drag it here'}
                            </p>
                            <p className="text-sm text-gray-500">
                                Excel files (.xlsx, .xls) up to 10MB
                            </p>
                        </div>

                        <div className="mt-4">
                            <label className="cursor-pointer">
                                <span className="inline-block px-4 py-2 bg-gray-100 text-gray-700 rounded-md border border-gray-300 hover:bg-gray-200 transition-colors">
                                    {selectedFile ? 'Choose different file' : 'Browse files'}
                                </span>
                                <input
                                    type="file"
                                    className="sr-only"
                                    accept=".xlsx,.xls"
                                    onChange={handleFileSelect}
                                />
                            </label>
                        </div>
                    </div>

                    {/* Error Message */}
                    {uploadError && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <AlertCircle className="w-5 h-5 text-red-600" />
                            <p className="text-sm text-red-700">{uploadError}</p>
                        </div>
                    )}

                    {/* Success Message */}
                    {uploadResult?.success && (
                        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <div className="text-sm text-green-700">
                                <p className="font-medium">{uploadResult.msg}</p>
                                {uploadResult.data && (
                                    <p className="mt-1">
                                        {uploadResult.data.newRecords} new records added, {uploadResult.data.skippedRecords} skipped
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3">
                        <Button variant="outline" onClick={handleClose} disabled={uploading}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUpload}
                            disabled={!selectedFile || uploading}
                            loading={uploading}
                            icon={Upload}
                        >
                            {uploading ? 'Uploading...' : 'Upload File'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};