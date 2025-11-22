
import React, { useState, useEffect } from 'react';

const CookieConsentBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'true');
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 bg-gray-800/95 backdrop-blur-sm text-white p-4 z-50 transform transition-all duration-500 ease-in-out ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}
    >
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-center sm:text-left">
          เว็บไซต์นี้ใช้คุกกี้เพื่อประสบการณ์การใช้งานที่ดีขึ้น{' '}
          <a href="#" className="underline hover:text-green-300 transition-colors">
            นโยบายความเป็นส่วนตัว
          </a>
        </p>
        <button
          onClick={handleAccept}
          className="bg-green-600 text-white px-5 py-2 rounded-md hover:bg-green-700 transition-colors flex-shrink-0"
        >
          ยอมรับ
        </button>
      </div>
    </div>
  );
};

export default CookieConsentBanner;
