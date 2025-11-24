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

    const isImage = fileType.startsWith('image/');
    const isPdf = fileType === 'application/pdf';

    // For localhost, Google Docs Viewer won't work with local URLs.
    // In a real production environment with a public URL, this would work.
    // We'll add a check or just attempt to render it, but provide a fallback message/button.
    const isOffice = !isImage && !isPdf;

    // Construct full URL if it's a relative path (for Google Docs Viewer)
    const fullUrl = fileUrl.startsWith('http') ? fileUrl : `${window.location.origin}${fileUrl}`;
    const googleDocsUrl = `https://docs.google.com/gview?url=${encodeURIComponent(fullUrl)}&embedded=true`;

    return (
        <div className="fixed inset-0 z-[60] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                {/* Background overlay */}
                <div
                    className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                    aria-hidden="true"
                    onClick={onClose}
                ></div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                {title}
                            </h3>
                            <button
                                onClick={onClose}
                                type="button"
                                className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                            >
                                <span className="sr-only">Close</span>
                                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="mt-2 h-[60vh] bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                            {isImage && (
                                <img src={fileUrl} alt={title} className="max-w-full max-h-full object-contain" />
                            )}

                            {isPdf && (
                                <iframe src={fileUrl} className="w-full h-full" title={title}></iframe>
                            )}

                            {isOffice && (
                                <div className="w-full h-full relative">
                                    {/* Try to show preview with Google Docs Viewer */}
                                    <iframe
                                        src={googleDocsUrl}
                                        className="w-full h-full border-none"
                                        title={title}
                                        onError={() => console.log('Error loading Google Docs Viewer')}
                                    ></iframe>

                                    {/* Overlay message for localhost */}
                                    {(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && (
                                        <div className="absolute top-0 left-0 right-0 bg-yellow-50 border-b-2 border-yellow-200 p-3">
                                            <div className="flex items-start">
                                                <svg className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                </svg>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-yellow-800">
                                                        ไม่สามารถแสดงตัวอย่างไฟล์ Office บน Localhost ได้
                                                    </p>
                                                    <p className="text-xs text-yellow-700 mt-1">
                                                        Google Docs Viewer ต้องการ URL สาธารณะ • กรุณาใช้ปุ่ม "ดาวน์โหลดไฟล์" ด้านล่าง
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
                        <a
                            href={fileUrl}
                            download
                            target="_blank"
                            rel="noreferrer"
                            className={`w-full inline-flex justify-center items-center gap-2 rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:w-auto sm:text-sm ${isOffice
                                    ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                                    : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                                }`}
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            {isOffice ? 'ดาวน์โหลดไฟล์ (แนะนำ)' : 'ดาวน์โหลดไฟล์'}
                        </a>
                        <button
                            type="button"
                            className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:w-auto sm:text-sm"
                            onClick={onClose}
                        >
                            ปิด
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FilePreviewModal;
