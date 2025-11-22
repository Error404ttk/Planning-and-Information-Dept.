
import React from 'react';

const Footer: React.FC = () => {
  const footerLinks = [
    { name: 'นโยบายเว็บไซต์', href: '#' },
    { name: 'นโยบายความเป็นส่วนตัว', href: '#' },
    { name: 'นโยบายความปลอดภัยของเว็บไซต์', href: '#' },
    { name: 'แผนผังเว็บไซต์', href: '#' },
  ];

  const socialLinks = [
    {
      name: 'Facebook',
      href: '#',
      icon: (props: { className?: string }) => (
        <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
          <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
        </svg>
      ),
    },
    {
      name: 'Twitter',
      href: '#',
      icon: (props: { className?: string }) => (
        <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
        </svg>
      ),
    },
    {
      name: 'Instagram',
      href: '#',
      icon: (props: { className?: string }) => (
        <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
          <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.468 4.08c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
        </svg>
      ),
    },
    {
      name: 'YouTube',
      href: '#',
      icon: (props: { className?: string }) => (
        <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
          <path fillRule="evenodd" d="M21.582 5.543C21.328 4.588 20.583 3.843 19.628 3.589 17.903 3.125 12 3.125 12 3.125s-5.903 0-7.628.464c-.955.254-1.7.999-1.954 1.954C2 7.268 2 12 2 12s0 4.732.418 6.457c.254.955.999 1.7 1.954 1.954 1.725.464 7.628.464 7.628.464s5.903 0 7.628-.464c.955-.254 1.7-.999 1.954-1.954C22 16.732 22 12 22 12s0-4.732-.418-6.457zM9.75 15.02l5.75-3.27-5.75-3.27v6.54z" clipRule="evenodd" />
        </svg>
      ),
    },
  ];

  const linkHoverClasses = "transition-colors relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-full after:bg-white after:scale-x-0 after:transition-transform after:duration-300 after:origin-center hover:after:scale-x-100";
  
  const handleNewsletterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // In a real app, you would handle the form submission here
    alert('ขอบคุณสำหรับการสมัครรับข่าวสาร!');
  };

  const requestAdminLogin = (e: React.MouseEvent) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('request-admin-login'));
  };

  return (
    <footer className="bg-green-800 text-white">
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center sm:text-left">
          
          {/* Column 1: Hospital Info */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold">งานแผนงานและสารสนเทศ</h3>
              <p className="text-base text-green-200">โรงพยาบาลสารภี</p>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-green-100 mb-3 uppercase tracking-wider">ติดตามเรา</h4>
              <div className="flex space-x-4 justify-center sm:justify-start">
                {socialLinks.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="text-green-200 hover:text-white transform hover:scale-110 transition-all duration-200"
                    aria-label={`Follow on ${item.name}`}
                  >
                    <item.icon className="h-6 w-6" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Column 2: Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">ลิงก์ด่วน</h3>
            <nav className="flex flex-col space-y-2 items-center sm:items-start">
              {footerLinks.map((link) => (
                <a key={link.name} href={link.href} className={`text-sm text-green-200 hover:text-white w-fit ${linkHoverClasses}`}>
                  {link.name}
                </a>
              ))}
            </nav>
          </div>
          
          {/* Column 3: Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">ติดต่อเรา</h3>
            <address className="text-sm text-green-200 not-italic space-y-3">
              <div className="flex items-start justify-center sm:justify-start">
                <svg className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                <span>147 ม.3 ต.สารภี อ.สารภี จ.เชียงใหม่ 50140</span>
              </div>
               <div className="flex items-center justify-center sm:justify-start">
                <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                <a href="mailto:saraban-srp@moph.go.th" className={`hover:text-white ${linkHoverClasses}`}>saraban-srp@moph.go.th</a>
              </div>
              <div className="flex items-start justify-center sm:justify-start">
                <svg className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                <div>
                  <a href="tel:053321179" className={`hover:text-white ${linkHoverClasses}`}>053-321179</a>, <a href="tel:053321062" className={`hover:text-white ${linkHoverClasses}`}>053-321062</a>, <a href="tel:053103442" className={`hover:text-white ${linkHoverClasses}`}>053-103442</a>
                  <p>แฟกซ์: 053-321762</p>
                </div>
              </div>
            </address>
          </div>
          
           {/* Column 4: Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-4">ติดตามข่าวสาร</h3>
            <p className="text-sm text-green-200 mb-4">สมัครเพื่อรับข่าวสารและข้อมูลอัปเดตล่าสุดจากเรา</p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2 max-w-sm mx-auto sm:mx-0">
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input 
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-4 py-2 text-gray-900 bg-white border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="อีเมลของคุณ"
              />
              <button
                type="submit"
                className="flex-shrink-0 px-4 py-2 text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-green-800 focus:ring-green-500 transition-colors"
              >
                <span className="sr-only">สมัคร</span>
                 <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path></svg>
              </button>
            </form>
          </div>

        </div>
        <div className="mt-12 border-t border-green-700 pt-8 text-center text-sm text-green-300 flex flex-col gap-2">
          <p>
            &copy; {new Date().getFullYear()} งานแผนงานและสารสนเทศ โรงพยาบาลสารภี. All rights reserved.
          </p>
          <a href="#" onClick={requestAdminLogin} className="text-green-800/30 hover:text-green-500/80 transition-colors text-xs">
             Admin Login
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
