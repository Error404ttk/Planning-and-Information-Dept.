import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';

interface ChangePasswordModalProps {
    onPasswordChanged: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ onPasswordChanged }) => {
    const { changePassword, mustChangePassword } = useData();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!newPassword) {
            setError('กรุณาใส่รหัสผ่านใหม่');
            return;
        }

        if (newPassword.length < 6) {
            setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('รหัสผ่านไม่ตรงกัน');
            return;
        }

        setLoading(true);
        const result = await changePassword(newPassword);
        setLoading(false);

        if (result.success) {
            onPasswordChanged();
        } else {
            setError(result.error || 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        เปลี่ยนรหัสผ่าน
                    </h2>
                    <p className="text-gray-600">
                        {mustChangePassword
                            ? 'คุณต้องเปลี่ยนรหัสผ่านก่อนเข้าใช้งานระบบ'
                            : 'กรุณาตั้งรหัสผ่านใหม่'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                            รหัสผ่านใหม่
                        </label>
                        <input
                            type="password"
                            id="newPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="อย่างน้อย 6 ตัวอักษร"
                            disabled={loading}
                            autoFocus
                        />
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                            ยืนยันรหัสผ่านใหม่
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="ใส่รหัสผ่านอีกครั้ง"
                            disabled={loading}
                        />
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'กำลังเปลี่ยนรหัสผ่าน...' : 'เปลี่ยนรหัสผ่าน'}
                    </button>
                </form>

                <div className="mt-4 text-sm text-gray-500 text-center">
                    <p>รหัสผ่านควรมีความปลอดภัยสูง</p>
                    <p>แนะนำให้ใช้ตัวอักษร ตัวเลข และสัญลักษณ์ผสมกัน</p>
                </div>
            </div>
        </div>
    );
};

export default ChangePasswordModal;
