import React from 'react';

interface FilePreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    fileUrl: string;
    fileType: string;
    title: string;
}

const FilePreviewModal: React.FC<FilePreviewModalProps> = ({ isOpen, onClose, fileUrl, fileType, title }) => {
    if (!isOpen) return null;

    const isPdf = fileType === 'application/pdf';
    const isImage = fileType.startsWith('image/');
    const isOffice = fileType.includes('word') ||
        fileType.includes('excel') ||
        fileType.includes('msword') ||
        fileType.includes('spreadsheet');

    // Get full URL for Google Docs Viewer
    const fullUrl = fileUrl.startsWith('http')
        ? fileUrl
        : `${window.location.origin}${fileUrl}`;

    const viewerUrl = isOffice
        ? `https://docs.google.com/viewer?url=${encodeURIComponent(fullUrl)}&embedded=true`
        : fileUrl;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" onClick={onClose}>
            <div className="flex min-h-screen items-center justify-center p-4">
                {/* Backdrop */}
                <div className="fixed inset-0 bg-black bg-opacity-75 transition-opacity"></div>

                {/* Modal */}
                <div
                    className="relative bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 truncate pr-4">
                            {title}
                        </h3>
                        <div className="flex items-center gap-2">
                            <a
                                href={fileUrl}
                                download
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                ดาวน์โหลด
                            </a>
                            <button
                                onClick={onClose}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-hidden bg-gray-50">
                        {isPdf && (
                            <iframe
                                src={fileUrl}
                                className="w-full h-full min-h-[600px]"
                                title={title}
                            />
                        )}

                        {isImage && (
                            <div className="flex items-center justify-center h-full p-4">
                                <img
                                    src={fileUrl}
                                    alt={title}
                                    className="max-w-full max-h-full object-contain"
                                />
                            </div>
                        )}

                        {isOffice && (
                            <iframe
                                src={viewerUrl}
                                className="w-full h-full min-h-[600px]"
                                title={title}
                            />
                        )}

                        {!isPdf && !isImage && !isOffice && (
                            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                                <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                <p className="text-gray-600 mb-4">ไม่สามารถแสดงตัวอย่างไฟล์ประเภทนี้ได้</p>
                                <a
                                    href={fileUrl}
                                    download
                                    className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    ดาวน์โหลดไฟล์
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FilePreviewModal;
