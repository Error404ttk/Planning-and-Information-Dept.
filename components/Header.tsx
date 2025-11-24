import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';

const Header: React.FC = () => {
  const { navLinks, resources } = useData();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

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

  // Merge resources into navigation
  const displayNavLinks = React.useMemo(() => {
    return navLinks.map(link => {
      // 1. Find resources for this category
      const categoryResources = resources.filter(r => r.category === link.name);

      // If no resources for this category, return link as is
      if (categoryResources.length === 0) return link;

      // 2. Map existing submenus to include their resources
      const updatedSubmenu = link.submenu?.map(subItem => {
        const matchingResources = categoryResources
          .filter(r => r.subcategory === subItem.name)
          .map(r => ({
            id: r.id,
            name: r.title,
            href: r.fileUrl,
            isResource: true,
            resource: r
          }));

        if (matchingResources.length > 0) {
          return {
            ...subItem,
            submenu: [...(subItem.submenu || []), ...matchingResources]
          };
        }
        return subItem;
      }) || [];

      // 3. Find resources that didn't match any existing submenu item
      const existingSubnames = link.submenu?.map(s => s.name) || [];
      const otherResources = categoryResources
        .filter(r => !existingSubnames.includes(r.subcategory || ''))
        .reduce((acc, r) => {
          const subName = r.subcategory || 'อื่นๆ';
          if (!acc[subName]) acc[subName] = [];
          acc[subName].push({
            id: r.id,
            name: r.title,
            href: r.fileUrl,
            isResource: true,
            resource: r
          });
          return acc;
        }, {} as Record<string, any[]>);

      const newSubItems = Object.entries(otherResources).map(([name, items]) => ({
        id: `generated-submenu-${link.id}-${name}`, // Deterministic ID
        name,
        href: '#',
        submenu: items
      }));

      return {
        ...link,
        submenu: [...updatedSubmenu, ...newSubItems]
      };
    });
  }, [navLinks, resources]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);


  const toggleSubMenu = (name: string) => {
    setOpenSubMenu(openSubMenu === name ? null : name);
  };



  const handleAdminLogin = () => {
    window.dispatchEvent(new CustomEvent('request-admin-login'));
    setIsMenuOpen(false);
  };

  const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
    </svg>
  );



  const UserIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
    </svg>
  );

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-md shadow-md' : 'bg-white shadow-none'}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <img className="h-[77px] w-[77px]" src="https://picsum.photos/seed/logo/77/77" alt="Logo โรงพยาบาลสารภี" />
            </div>
            <div className="ml-4">
              <h1 className="text-xl font-bold text-green-800">งานแผนงานและสารสนเทศ</h1>
              <h2 className="text-lg text-green-600">โรงพยาบาลสารภี</h2>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-4">
            <nav className="ml-4 flex items-baseline space-x-2 lg:space-x-4">
              {displayNavLinks.map((link) =>
                link.submenu ? (
                  <div key={link.id || link.name} className="relative group">
                    <a
                      href={link.href}
                      className="text-gray-600 hover:bg-green-600 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300 flex items-center"
                    >
                      <span>{link.name}</span>
                      <ChevronDownIcon className="w-4 h-4 ml-1" />
                    </a>
                    <div className="absolute left-0 top-full opacity-0 invisible group-hover:visible group-hover:opacity-100 transform-gpu translate-y-1 group-hover:translate-y-0 transition-all duration-200 ease-out pt-2">
                      <div className="bg-white shadow-lg rounded-md py-1 w-64 z-10 ring-1 ring-black ring-opacity-5">
                        {link.submenu.map((sublink) => (
                          sublink.submenu && sublink.submenu.length > 0 ? (
                            <div key={sublink.id || sublink.name} className="relative group/sub">
                              <a
                                href={sublink.href}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-800 transition-colors duration-200 flex items-center justify-between"
                              >
                                <span>{sublink.name}</span>
                                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                              </a>
                              {/* 3rd Level Dropdown */}
                              <div className="absolute left-full top-0 opacity-0 invisible group-hover/sub:visible group-hover/sub:opacity-100 transform-gpu translate-x-1 group-hover/sub:translate-x-0 transition-all duration-200 ease-out pl-1 top-[-4px]">
                                <div className="bg-white shadow-lg rounded-md py-1 w-64 ring-1 ring-black ring-opacity-5">
                                  {sublink.submenu.map((res: any) => (
                                    <a
                                      key={res.id || res.name}
                                      href={res.href}
                                      target="_blank"
                                      rel="noreferrer"
                                      onClick={(e) => {
                                        if (res.isResource) {
                                          trackDownload(res.resource.id);
                                        }
                                      }}
                                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-100 hover:text-green-800 transition-colors duration-200 flex items-center gap-2"
                                    >
                                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                      </svg>
                                      {res.name}
                                      {res.resource?.downloadCount > 0 && (
                                        <span className="ml-auto text-xs text-gray-400">({res.resource.downloadCount})</span>
                                      )}
                                    </a>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <a
                              key={sublink.id || sublink.name}
                              href={sublink.href}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-100 hover:text-green-800 transition-colors duration-200"
                            >
                              {sublink.name}
                            </a>
                          )
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <a
                    key={link.id || link.name}
                    href={link.href}
                    className="text-gray-600 hover:bg-green-600 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300"
                  >
                    {link.name}
                  </a>
                )
              )}
            </nav>



            <button
              onClick={handleAdminLogin}
              className="ml-1 p-2 text-gray-400 hover:text-green-600 transition-colors rounded-full hover:bg-green-50"
              title="เข้าสู่ระบบผู้ดูแลระบบ (Admin)"
            >
              <UserIcon className="w-6 h-6" />
            </button>
          </div>

          <div className="-mr-2 flex lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              type="button"
              className="bg-green-600 inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-green-800 focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {!isMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
      <div className={`${isMenuOpen ? 'block' : 'hidden'} lg:hidden`} id="mobile-menu">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">


          {displayNavLinks.map((link) => (
            <div key={link.id || link.name}>
              {link.submenu ? (
                <>
                  <button
                    onClick={() => toggleSubMenu(link.name)}
                    className="w-full text-left text-gray-700 hover:bg-green-100 hover:text-green-800 block px-3 py-2 rounded-md text-base font-medium flex justify-between items-center"
                  >
                    <span>{link.name}</span>
                    <ChevronDownIcon
                      className={`w-5 h-5 transition-transform ${openSubMenu === link.name ? 'rotate-180' : ''
                        }`}
                    />
                  </button>
                  <div
                    className={`${openSubMenu === link.name ? 'block' : 'hidden'
                      } pl-4 pt-2 pb-1 space-y-1`}
                  >
                    {link.submenu.map((sublink) => (
                      sublink.submenu && sublink.submenu.length > 0 ? (
                        <div key={sublink.id || sublink.name} className="space-y-1">
                          <div className="text-gray-500 px-3 py-1 text-sm font-semibold">{sublink.name}</div>
                          {sublink.submenu.map((res: any) => (
                            <a
                              key={res.id || res.name}
                              href={res.href}
                              target="_blank"
                              onClick={(e) => {
                                if (res.isResource) {
                                  trackDownload(res.resource.id);
                                }
                              }}
                              className="block w-full text-left pl-6 pr-3 py-2 text-sm text-gray-600 hover:text-green-700 flex items-center gap-2"
                            >
                              <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                              - {res.name}
                              {res.resource?.downloadCount > 0 && (
                                <span className="ml-auto text-xs text-gray-400">({res.resource.downloadCount})</span>
                              )}
                            </a>
                          ))}
                        </div>
                      ) : (
                        <a
                          key={sublink.id || sublink.name}
                          href={sublink.href}
                          className="text-gray-600 hover:bg-green-100 hover:text-green-800 block px-3 py-2 rounded-md text-base font-medium"
                        >
                          {sublink.name}
                        </a>
                      )
                    ))}
                  </div>
                </>
              ) : (
                <a
                  href={link.href}
                  className="text-gray-700 hover:bg-green-100 hover:text-green-800 block px-3 py-2 rounded-md text-base font-medium"
                >
                  {link.name}
                </a>
              )}
            </div>
          ))}

          <button
            onClick={handleAdminLogin}
            className="w-full text-left text-gray-700 hover:bg-green-100 hover:text-green-800 block px-3 py-2 rounded-md text-base font-medium flex items-center gap-2 border-t border-gray-200 mt-4 pt-3"
          >
            <UserIcon className="w-5 h-5" />
            <span>เข้าสู่ระบบผู้ดูแลระบบ</span>
          </button>
        </div>
      </div>

    </header>
  );
};

export default Header;