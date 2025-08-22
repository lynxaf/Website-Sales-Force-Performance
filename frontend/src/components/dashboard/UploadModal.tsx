import React, { useState } from 'react';
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useFileUpload, } from '../../hooks/useDashboardData';

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

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Upload Excel File" size="md">
            <div className="space-y-6">
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
                            <span className="mt-2 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
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
        </Modal>
    );
};