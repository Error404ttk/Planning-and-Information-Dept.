import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import HeroSlider from './components/HeroSlider';
import IconGrid from './components/IconGrid';
import NewsSection from './components/NewsSection';
import AboutSection from './components/AboutSection';
import Footer from './components/Footer';
import BackToTopButton from './components/BackToTopButton';
import CookieConsentBanner from './components/CookieConsentBanner';
import AdminDashboard from './components/AdminDashboard';
import ChangePasswordModal from './components/ChangePasswordModal';
import { useData } from './contexts/DataContext';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'home' | 'admin-login' | 'admin-dashboard'>('home');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Brute Force Protection State
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);

  const { login, logout, currentUser, mustChangePassword } = useData();

  // Listen for custom event from Footer/Header to open Admin login
  useEffect(() => {
    const handleAdminRequest = () => {
      if (currentUser) {
        setCurrentView('admin-dashboard');
      } else {
        setCurrentView('admin-login');
      }
    };
    window.addEventListener('request-admin-login', handleAdminRequest);
    return () => window.removeEventListener('request-admin-login', handleAdminRequest);
  }, [currentUser]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check Lockout
    if (lockoutUntil && Date.now() < lockoutUntil) {
      alert(`Too many failed attempts. Please wait ${Math.ceil((lockoutUntil - Date.now()) / 1000)} seconds.`);
      return;
    }

    setIsLoading(true);
    setLoginError(false);

    // Simulate network delay for better UX ("ลูกเล่น") & security timing attack mitigation
    await new Promise(resolve => setTimeout(resolve, 1200));

    const success = await login(username, password);

    if (success) {
      setLoginSuccess(true);
      // Small delay to show success animation
      setTimeout(() => {
        setCurrentView('admin-dashboard');
        setUsername('');
        setPassword('');
        setLoginAttempts(0);
        setLockoutUntil(null);
        setIsLoading(false);
        setLoginSuccess(false);
      }, 800);
    } else {
      setLoginError(true);
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);

      if (newAttempts >= 5) {
        setLockoutUntil(Date.now() + 30000); // Lockout for 30 seconds after 5 failed attempts
      }
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    // Simulate network delay for smooth exit
    await new Promise(resolve => setTimeout(resolve, 1000));
    logout();
    setCurrentView('home');
    setIsLoading(false);
  };

  // Loading Overlay Component
  const LoadingOverlay = ({ text }: { text: string }) => (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white transition-all duration-300 animate-[fadeIn_0.3s_ease-out]">
      <div className="relative w-16 h-16 mb-4">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-200/30 rounded-full"></div>
        <div className="absolute top-0 left-0 w-full h-full border-4 border-green-500 rounded-full animate-spin border-t-transparent"></div>
      </div>
      <p className="text-lg font-light tracking-wider animate-pulse">{text}</p>
    </div>
  );

  if (currentView === 'admin-dashboard' && currentUser) {
    return (
      <>
        {isLoading && <LoadingOverlay text="กำลังออกจากระบบ..." />}
        {mustChangePassword && (
          <ChangePasswordModal
            onPasswordChanged={() => {
              // Refresh page or just close modal - flag is already cleared
              window.location.reload();
            }}
          />
        )}
        <div className="animate-[fadeIn_0.5s_ease-out]">
          <AdminDashboard onLogout={handleLogout} currentUser={currentUser} />
        </div>
      </>
    );
  }

  if (currentView === 'admin-login' || (currentView === 'admin-dashboard' && !currentUser)) {
    const isLocked = lockoutUntil !== null && Date.now() < lockoutUntil;

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-200/30 rounded-full blur-3xl"></div>

        <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md relative z-10 transform transition-all duration-500 hover:shadow-green-900/10 animate-[fadeInUp_0.5s_ease-out]">
          <div className="text-center mb-8">
            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-all duration-500 ${loginSuccess ? 'bg-green-500 text-white scale-110' : 'bg-green-100 text-green-600'}`}>
              {loginSuccess ? (
                <svg className="w-10 h-10 animate-[fadeIn_0.3s_ease-out]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
              ) : (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              )}
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Admin Login</h2>
            <p className="text-gray-500 mt-2 text-sm">เข้าสู่ระบบจัดการเว็บไซต์โรงพยาบาลสารภี</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="username">
                ชื่อผู้ใช้
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
                <input
                  id="username"
                  type="text"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white disabled:opacity-70"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^[a-zA-Z0-9]*$/.test(value)) {
                      setUsername(value);
                    }
                  }}
                  autoFocus
                  disabled={isLoading || isLocked || loginSuccess}
                />
              </div>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="password">
                รหัสผ่าน
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <input
                  id="password"
                  type="password"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white disabled:opacity-70"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading || isLocked || loginSuccess}
                />
              </div>
            </div>

            {loginError && !isLocked && (
              <div className="bg-red-50 text-red-500 text-sm py-2 px-4 rounded-lg border border-red-100 text-center animate-pulse">
                ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง ({loginAttempts}/5)
              </div>
            )}

            {isLocked && (
              <div className="bg-red-100 text-red-600 text-sm py-3 px-4 rounded-lg border border-red-200 text-center font-semibold">
                ระบบถูกระงับชั่วคราวเนื่องจากพยายามเข้าสู่ระบบผิดเกินกำหนด
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCurrentView('home')}
                className="flex-1 px-4 py-2.5 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium disabled:opacity-50"
                disabled={isLoading || loginSuccess}
              >
                กลับหน้าหลัก
              </button>
              <button
                type="submit"
                disabled={isLoading || isLocked || loginSuccess}
                className={`flex-[2] px-4 py-2.5 text-white rounded-lg transition-all duration-200 shadow-lg flex items-center justify-center gap-2 font-medium ${loginSuccess
                  ? 'bg-green-500 scale-105'
                  : (isLoading || isLocked)
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-600 to-green-700 hover:shadow-green-600/30 hover:scale-[1.02] active:scale-[0.98]'
                  }`}
              >
                {loginSuccess ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                    เข้าสู่ระบบสำเร็จ!
                  </span>
                ) : isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>กำลังตรวจสอบ...</span>
                  </>
                ) : (
                  'เข้าสู่ระบบ'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400 bg-gray-50 py-1 px-3 rounded-full inline-block border border-gray-100">
              Default: admin / password
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen font-sarabun animate-[fadeIn_0.5s_ease-in-out]">
      <Header />
      <main>
        <HeroSlider />
        <IconGrid />
        <NewsSection />
        <AboutSection />
      </main>
      <Footer />
      <BackToTopButton />
      <CookieConsentBanner />
    </div>
  );
};

export default App;