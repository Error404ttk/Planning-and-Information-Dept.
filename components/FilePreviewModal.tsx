import React, { useState } from 'react';

interface FilePreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    fileUrl: string;
    fileType: string;
    title: string;
}

const FilePreviewModal: React.FC<FilePreviewModalProps> = ({ isOpen, onClose, fileUrl, fileType, title }) => {
    if (!isOpen) return null;

    const [isLoading, setIsLoading] = useState(true);
    const [viewerError, setViewerError] = useState(false);

    // Handle file download
    const handleDownload = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            const response = await fetch(fileUrl);
            if (!response.ok) throw new Error('Download failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;

            // Extract filename from URL
            const filename = fileUrl.split('/').pop() || 'download';
            a.download = filename;

            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Download failed:', error);
            alert('เกิดข้อผิดพลาดในการดาวน์โหลดไฟล์ กรุณาลองใหม่อีกครั้ง');
        }
    };

    const isPdf = fileType === 'application/pdf';
    const isImage = fileType.startsWith('image/');
    const isOffice = fileType.includes('word') ||
        fileType.includes('excel') ||
        fileType.includes('msword') ||
        fileType.includes('spreadsheet') ||
        fileType.includes('presentation') ||
        fileType.includes('powerpoint') ||
        fileType.includes('officedocument');

    // Get full URL for Viewers
    const fullUrl = fileUrl.startsWith('http')
        ? fileUrl
        : `${window.location.origin}${fileUrl}`;

    // Microsoft Office Viewer (Primary)
    const msViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fullUrl)}`;

    // Google Docs Viewer (Secondary/Fallback)
    const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(fullUrl)}&embedded=true`;

    // Determine which viewer to use
    const viewerUrl = msViewerUrl;

    const handleIframeLoad = () => {
        setIsLoading(false);
    };

    const handleIframeError = () => {
        setIsLoading(false);
        setViewerError(true);
    };

    return (
        <div className="fixed inset-0 z-[100] overflow-y-auto" onClick={onClose}>
            <div className="flex min-h-screen items-center justify-center p-4">
                {/* Backdrop */}
                <div className="fixed inset-0 bg-black bg-opacity-80 transition-opacity backdrop-blur-sm"></div>

                {/* Modal */}
                <div
                    className="relative bg-white rounded-lg shadow-2xl w-full max-w-6xl h-[85vh] flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                        <h3 className="text-lg font-semibold text-gray-900 truncate pr-4 flex-1">
                            {title}
                        </h3>
                        <div className="flex items-center gap-3">
                            <a
                                href={fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="hidden sm:flex px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-md transition-colors items-center gap-2 text-sm"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                เปิดหน้าต่างใหม่
                            </a>
                            <button
                                onClick={handleDownload}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                ดาวน์โหลด
                            </button>
                            <button
                                onClick={onClose}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-hidden bg-gray-100 relative">
                        {isLoading && !isImage && (
                            <div className="absolute inset-0 flex items-center justify-center z-10 bg-white bg-opacity-50">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            </div>
                        )}

                        {isPdf && (
                            <iframe
                                src={fileUrl}
                                className="w-full h-full absolute inset-0 border-0"
                                title={title}
                                onLoad={handleIframeLoad}
                                onError={handleIframeError}
                            />
                        )}

                        {isImage && (
                            <div className="flex items-center justify-center h-full p-4 absolute inset-0 bg-black bg-opacity-5">
                                <img
                                    src={fileUrl}
                                    alt={title}
                                    className="max-w-full max-h-full object-contain shadow-lg"
                                    onLoad={handleIframeLoad}
                                    onError={handleIframeError}
                                />
                            </div>
                        )}

                        {isOffice && !viewerError && (
                            <iframe
                                src={viewerUrl}
                                className="w-full h-full absolute inset-0 border-0"
                                title={title}
                                onLoad={handleIframeLoad}
                                onError={handleIframeError}
                            />
                        )}

                        {(!isPdf && !isImage && !isOffice) || viewerError ? (
                            <div className="flex flex-col items-center justify-center h-full p-8 text-center absolute inset-0 bg-white">
                                <div className="bg-gray-50 p-8 rounded-full mb-6">
                                    <svg className="w-16 h-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <h4 className="text-xl font-medium text-gray-900 mb-2">ไม่สามารถแสดงตัวอย่างไฟล์ได้</h4>
                                <p className="text-gray-500 mb-6 max-w-md">
                                    ไฟล์ประเภทนี้อาจไม่รองรับการแสดงผลบนเว็บ หรือเกิดข้อผิดพลาดในการโหลด
                                </p>
                                <div className="flex gap-4">
                                    <a
                                        href={fileUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
                                    >
                                        เปิดในหน้าต่างใหม่
                                    </a>
                                    <button
                                        onClick={handleDownload}
                                        className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium shadow-md hover:shadow-lg"
                                    >
                                        ดาวน์โหลดไฟล์
                                    </button>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FilePreviewModal;
