import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import FilePreviewModal from './FilePreviewModal';
import { Resource } from '../types';

interface FilesListPageProps {
    category: string;
    subcategory: string;
    onBack: () => void;
}

const FilesListPage: React.FC<FilesListPageProps> = ({ category, subcategory, onBack }) => {
    const { resources } = useData();
    const [previewFile, setPreviewFile] = useState<Resource | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Track download function
    const trackDownload = async (resourceId: string) => {
        try {
            await fetch(`/api/resources/${resourceId}/download`, {
                method: 'POST'
            });
        } catch (error) {
            console.error('Failed to track download:', error);
        }
    };

    // Filter resources by category and subcategory
    const filteredFiles = useMemo(() => {
        let files = resources.filter(
            r => r.category === category && r.subcategory === subcategory
        );

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            files = files.filter(f =>
                f.title.toLowerCase().includes(query)
            );
        }

        return files;
    }, [resources, category, subcategory, searchQuery]);

    // Get file icon based on file type
    const getFileIcon = (fileType: string) => {
        if (fileType.includes('pdf')) {
            return (
                <svg className="w-12 h-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
            );
        } else if (fileType.includes('word') || fileType.includes('document')) {
            return (
                <svg className="w-12 h-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            );
        } else if (fileType.includes('excel') || fileType.includes('spreadsheet')) {
            return (
                <svg className="w-12 h-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            );
        } else if (fileType.includes('powerpoint') || fileType.includes('presentation')) {
            return (
                <svg className="w-12 h-12 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
            );
        } else if (fileType.includes('image')) {
            return (
                <svg className="w-12 h-12 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            );
        } else if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('compressed') || fileType.includes('x-rar')) {
            return (
                <svg className="w-12 h-12 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
            );
        }
        return (
            <svg className="w-12 h-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
        );
    };

    // Format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                {/* Header with Breadcrumb */}
                <div className="bg-white shadow-md border-b border-gray-200">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        {/* Breadcrumb */}
                        <nav className="flex items-center text-sm text-gray-500 mb-4">
                            <button
                                onClick={onBack}
                                className="hover:text-green-600 transition-colors flex items-center gap-1"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12h18M3 12l6-6m-6 6l6 6" />
                                </svg>
                                หน้าแรก
                            </button>
                            <svg className="w-4 h-4 mx-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            <span className="text-gray-700">{category}</span>
                            <svg className="w-4 h-4 mx-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            <span className="font-semibold text-green-700">{subcategory}</span>
                        </nav>

                        {/* Page Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                                    <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                    </svg>
                                    {subcategory}
                                </h1>
                                <p className="text-gray-500 mt-1">
                                    ทั้งหมด {filteredFiles.length} ไฟล์
                                </p>
                            </div>

                            {/* Search Box */}
                            <div className="relative w-full sm:w-80">
                                <input
                                    type="text"
                                    placeholder="ค้นหาไฟล์..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                                />
                                <svg className="absolute left-3 top-3 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Files Grid */}
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {filteredFiles.length === 0 ? (
                        <div className="text-center py-16">
                            <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <h3 className="text-xl font-semibold text-gray-600 mb-2">
                                {searchQuery ? 'ไม่พบไฟล์ที่ค้นหา' : 'ยังไม่มีไฟล์ในหมวดนี้'}
                            </h3>
                            <p className="text-gray-400">
                                {searchQuery ? 'ลองค้นหาด้วยคำอื่น' : 'ไฟล์จะแสดงที่นี่เมื่อมีการอัพโหลด'}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredFiles.map((file) => (
                                <div
                                    key={file.id}
                                    onClick={() => {
                                        trackDownload(file.id);
                                        setPreviewFile(file);
                                    }}
                                    className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100 hover:border-green-300 transform hover:scale-105"
                                >
                                    {/* File Icon */}
                                    <div className="p-6 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 group-hover:from-green-50 group-hover:to-green-100 transition-colors">
                                        {getFileIcon(file.fileType)}
                                    </div>

                                    {/* File Info */}
                                    <div className="p-4 border-t border-gray-100">
                                        <h3 className="font-semibold text-gray-800 text-sm mb-2 line-clamp-2 group-hover:text-green-700 transition-colors">
                                            {file.title}
                                        </h3>

                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                {formatDate(file.createdAt)}
                                            </span>

                                            {(file as any).downloadCount !== undefined && (file as any).downloadCount > 0 && (
                                                <span className="flex items-center gap-1 text-green-600">
                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                    </svg>
                                                    {(file as any).downloadCount}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Back Button (Fixed at bottom) */}
                    <div className="mt-12 flex justify-center">
                        <button
                            onClick={onBack}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            กลับหน้าหลัก
                        </button>
                    </div>
                </div>
            </div>

            {/* File Preview Modal */}
            {previewFile && (
                <FilePreviewModal
                    isOpen={!!previewFile}
                    onClose={() => setPreviewFile(null)}
                    fileUrl={previewFile.fileUrl}
                    fileType={previewFile.fileType}
                    title={previewFile.title}
                />
            )}
        </>
    );
};

export default FilesListPage;
