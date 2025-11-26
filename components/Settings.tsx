import React, { useState, useRef } from 'react';
import { useData } from '../contexts/DataContext';

const Settings: React.FC = () => {
    const { settings, updateLogo, updateAboutImage } = useData();
    const [isUploadingLogo, setIsUploadingLogo] = useState(false);
    const [isUploadingAbout, setIsUploadingAbout] = useState(false);
    const logoFileInputRef = useRef<HTMLInputElement>(null);
    const aboutFileInputRef = useRef<HTMLInputElement>(null);

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('กรุณาอัปโหลดไฟล์รูปภาพเท่านั้น');
            return;
        }

        // Validate file size (e.g., 2MB)
        if (file.size > 2 * 1024 * 1024) {
            alert('ขนาดไฟล์ต้องไม่เกิน 2MB');
            return;
        }

        setIsUploadingLogo(true);
        try {
            await updateLogo(file);
            alert('อัปโหลดโลโก้สำเร็จ');
        } catch (error) {
            console.error('Upload failed:', error);
            alert('เกิดข้อผิดพลาดในการอัปโหลดโลโก้');
        } finally {
            setIsUploadingLogo(false);
            if (logoFileInputRef.current) {
                logoFileInputRef.current.value = '';
            }
        }
    };

    const handleAboutImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('กรุณาอัปโหลดไฟล์รูปภาพเท่านั้น');
            return;
        }

        // Validate file size (e.g., 2MB)
        if (file.size > 2 * 1024 * 1024) {
            alert('ขนาดไฟล์ต้องไม่เกิน 2MB');
            return;
        }

        setIsUploadingAbout(true);
        try {
            await updateAboutImage(file);
            alert('อัปโหลดรูปภาพสำเร็จ');
        } catch (error) {
            console.error('Upload failed:', error);
            alert('เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ');
        } finally {
            setIsUploadingAbout(false);
            if (aboutFileInputRef.current) {
                aboutFileInputRef.current.value = '';
            }
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">ตั้งค่าระบบ</h2>

            <div className="space-y-8">
                {/* Logo Settings */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">โลโก้โรงพยาบาล</h3>
                    <div className="flex items-start gap-8">
                        <div className="flex-shrink-0">
                            <p className="text-sm text-gray-500 mb-2">โลโก้ปัจจุบัน:</p>
                            <div className="w-[77px] h-[77px] rounded-full overflow-hidden border-2 border-gray-200 shadow-sm">
                                <img
                                    src={settings?.hospitalLogo || "https://picsum.photos/seed/logo/77/77"}
                                    alt="Current Logo"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>

                        <div className="flex-grow max-w-md">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                อัปโหลดโลโก้ใหม่
                            </label>
                            <div className="flex items-center gap-4">
                                <input
                                    type="file"
                                    ref={logoFileInputRef}
                                    onChange={handleLogoUpload}
                                    accept="image/*"
                                    className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-green-50 file:text-green-700
                    hover:file:bg-green-100
                    cursor-pointer"
                                    disabled={isUploadingLogo}
                                />
                                {isUploadingLogo && (
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
                                )}
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                แนะนำ: ไฟล์รูปภาพ (PNG, JPG) ขนาดไม่เกิน 2MB. ระบบจะแสดงผลเป็นวงกลมขนาด 77x77px โดยอัตโนมัติ
                            </p>
                        </div>
                    </div>
                </div>

                {/* About Image Settings */}
                <div className="pt-6 border-t">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">รูปภาพหน้า "เกี่ยวกับเรา"</h3>
                    <div className="flex items-start gap-8">
                        <div className="flex-shrink-0">
                            <p className="text-sm text-gray-500 mb-2">รูปภาพปัจจุบัน:</p>
                            <div className="w-[200px] h-[150px] rounded-lg overflow-hidden border-2 border-gray-200 shadow-sm">
                                <img
                                    src={settings?.aboutImage || "https://picsum.photos/seed/aboutus/800/600"}
                                    alt="Current About Image"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>

                        <div className="flex-grow max-w-md">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                อัปโหลดรูปภาพใหม่
                            </label>
                            <div className="flex items-center gap-4">
                                <input
                                    type="file"
                                    ref={aboutFileInputRef}
                                    onChange={handleAboutImageUpload}
                                    accept="image/*"
                                    className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-green-50 file:text-green-700
                    hover:file:bg-green-100
                    cursor-pointer"
                                    disabled={isUploadingAbout}
                                />
                                {isUploadingAbout && (
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
                                )}
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                แนะนำ: ไฟล์รูปภาพ (PNG, JPG) ขนาดไม่เกิน 2MB สัดส่วนที่เหมาะสม 800x600px
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;

