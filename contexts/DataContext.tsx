import React, { createContext, useContext, useState, useEffect } from 'react';
import { DataContextType, NavLink, GridItem, NewsArticle, User, AuditLog, Resource, SlideImage, SystemSettings } from '../types';
import {
  INITIAL_NAV_LINKS,
  INITIAL_GRID_ITEMS,
  INITIAL_SLIDER_IMAGES,
  INITIAL_LOGS
} from '../constants';

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // --- Authentication State ---
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [mustChangePassword, setMustChangePassword] = useState<boolean>(false);
  const [isRateLimited, setIsRateLimited] = useState<boolean>(false);

  // --- Data State ---
  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_LOGS); // Keep local for now or implement API
  const [navLinks, setNavLinks] = useState<NavLink[]>(INITIAL_NAV_LINKS);
  const [gridItems, setGridItems] = useState<GridItem[]>(INITIAL_GRID_ITEMS);
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [slides, setSlides] = useState<SlideImage[]>([]);
  const [settings, setSettings] = useState<SystemSettings>({});

  // --- Initial Fetch ---
  useEffect(() => {
    checkAuth();
    fetchNews();
    fetchResources();
    fetchSlides();
    fetchSettings();
    fetchNavLinks();
    fetchGridItems();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const updateLogo = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('logo', file);

      const res = await fetch('/api/settings/logo', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setSettings(prev => ({ ...prev, hospitalLogo: data.logoUrl }));
        // Also refresh settings to be sure
        fetchSettings();
      } else {
        throw new Error('Failed to upload logo');
      }
    } catch (error) {
      console.error('Error updating logo:', error);
      throw error;
    }
  };

  const updateAboutImage = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('aboutImage', file);

      const res = await fetch('/api/settings/about-image', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setSettings(prev => ({ ...prev, aboutImage: data.imageUrl }));
        // Also refresh settings to be sure
        fetchSettings();
      } else {
        throw new Error('Failed to upload about image');
      }
    } catch (error) {
      console.error('Error updating about image:', error);
      throw error;
    }
  };

  // ... (rest of existing functions)


  const updateSlideOrder = async (id: string, newOrder: number) => {
    // Not implemented in API yet, but we can update local state
    setSlides(prev => {
      const newSlides = [...prev];
      const index = newSlides.findIndex(s => s.id === id);
      if (index !== -1) {
        newSlides[index].order = newOrder;
        // Sort by order
        return newSlides.sort((a, b) => a.order - b.order);
      }
      return prev;
    });
  };

  const toggleSlideActive = async (id: string) => {
    try {
      const slide = slides.find(s => s.id === id);
      if (slide) {
        await updateSlide(id, { isActive: !slide.isActive });
      }
    } catch (error) {
      console.error("Toggle slide active error", error);
    }
  };





  const fetchNews = async () => {
    try {
      const res = await fetch('/api/news');
      if (res.ok) {
        const data = await res.json();
        setNewsArticles(data);
      }
    } catch (err) {
      console.error("Fetch news failed", err);
    }
  };

  const fetchResources = async () => {
    try {
      const res = await fetch('/api/resources');
      if (res.ok) {
        const data = await res.json();
        setResources(data);
      }
    } catch (err) {
      console.error("Fetch resources failed", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error("Fetch users failed", err);
    }
  };

  // --- Auth Methods ---
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);

        // Check if password change is required
        if (data.mustChangePassword) {
          setMustChangePassword(true);
          return true; // Login successful but needs password change
        }

        if (data.user.role === 'SUPER_ADMIN') fetchUsers();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login error", error);
      return false;
    }
  };

  const checkAuth = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setCurrentUser(null);
      setMustChangePassword(false);
      setUsers([]); // Clear sensitive data
    } catch (error) {
      console.error("Check auth error", error);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setCurrentUser(null);
      setMustChangePassword(false);
      setUsers([]); // Clear sensitive data
    } catch (error) {
      console.error("Logout error", error);
    }
  };

  const changePassword = async (newPassword: string, currentPassword?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const body = mustChangePassword
        ? { newPassword }  // First login - no current password needed
        : { currentPassword, newPassword };  // Normal change - current password required

      const res = await fetch('/api/users/me/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        setMustChangePassword(false);
        return { success: true };
      } else {
        const data = await res.json();
        return { success: false, error: data.error || 'Failed to change password' };
      }
    } catch (error) {
      console.error("Change password error", error);
      return { success: false, error: 'Network error' };
    }
  };

  // --- User CRUD ---
  const addUser = async (user: User) => {
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });
      if (res.ok) {
        const newUser = await res.json();
        setUsers(prev => [...prev, newUser]);
      } else {
        alert("Failed to add user");
      }
    } catch (error) {
      console.error("Add user error", error);
    }
  };

  const updateUser = async (updatedUser: User) => {
    // Not implemented in API yet for users, but frontend expects it.
    // For now, we'll just alert.
    alert("Update user not fully implemented in backend yet.");
  };

  const deleteUser = async (id: string) => {
    if (currentUser?.id === id) {
      alert("Operation Failed: You cannot delete your own account.");
      return;
    }
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setUsers(prev => prev.filter(u => u.id !== id));
      } else {
        alert("Failed to delete user");
      }
    } catch (error) {
      console.error("Delete user error", error);
    }
  };

  // --- Content Methods ---

  const fetchNavLinks = async () => {
    try {
      const res = await fetch('/api/navlinks');
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) {
          setNavLinks(data);
        }
        // If empty, keep INITIAL_NAV_LINKS from constants
      }
    } catch (err) {
      console.error("Fetch navlinks failed", err);
    }
  };

  const fetchGridItems = async () => {
    try {
      const res = await fetch('/api/griditems');
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) {
          setGridItems(data);
        }
        // If empty, keep INITIAL_GRID_ITEMS from constants
      }
    } catch (err) {
      console.error("Fetch griditems failed", err);
    }
  };

  const updateNavLinks = async (links: NavLink[]) => {
    setNavLinks(links);
    try {
      const res = await fetch('/api/navlinks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(links)
      });
      if (!res.ok) {
        console.error('Failed to update navlinks');
      }
    } catch (error) {
      console.error('Error updating navlinks:', error);
    }
  };

  const updateGridItems = async (items: GridItem[]) => {
    setGridItems(items);
    try {
      const res = await fetch('/api/griditems', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(items)
      });
      if (!res.ok) {
        console.error('Failed to update griditems');
      }
    } catch (error) {
      console.error('Error updating griditems:', error);
    }
  };


  const addNews = async (news: NewsArticle) => {
    try {
      const res = await fetch('/api/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(news)
      });
      if (res.ok) {
        const newNews = await res.json();
        setNewsArticles(prev => [newNews, ...prev]);
      }
    } catch (error) {
      console.error("Add news error", error);
    }
  };

  const updateNews = async (updatedNews: NewsArticle) => {
    try {
      const res = await fetch(`/api/news/${updatedNews.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedNews)
      });
      if (res.ok) {
        const data = await res.json();
        setNewsArticles(prev => prev.map(item => item.id === data.id ? data : item));
      }
    } catch (error) {
      console.error("Update news error", error);
    }
  };

  const updateAllNews = (news: NewsArticle[]) => {
    // Reordering not implemented in API yet
    setNewsArticles(news);
  };

  const deleteNews = async (id: string) => {
    try {
      const res = await fetch(`/api/news/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setNewsArticles(prev => prev.filter(item => item.id !== id));
      }
    } catch (error) {
      console.error("Delete news error", error);
    }
  };

  // --- Resource Methods ---
  const addResource = async (resourceData: Omit<Resource, 'id' | 'createdAt'>) => {
    try {
      const res = await fetch('/api/resources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(resourceData)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to upload resource');
      }

      const newResource = await res.json();
      setResources(prev => [newResource, ...prev]);

      // Add log
      const newLog: AuditLog = {
        id: Date.now().toString(),
        action: 'CREATE',
        entity: 'RESOURCE',
        details: `Uploaded resource: ${newResource.title}`,
        performedBy: currentUser?.name || 'Admin',
        timestamp: new Date().toLocaleString('th-TH')
      };
      setAuditLogs(prev => [newLog, ...prev]);

    } catch (error) {
      console.error('Failed to add resource:', error);
      throw error;
    }
  };

  const updateResource = async (id: string, resourceData: Partial<Resource>) => {
    try {
      const res = await fetch(`/api/resources/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(resourceData)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update resource');
      }

      const updatedResource = await res.json();
      setResources(prev => prev.map(r => r.id === id ? updatedResource : r));

      // Add log
      const newLog: AuditLog = {
        id: Date.now().toString(),
        action: 'UPDATE',
        entity: 'RESOURCE',
        details: `Updated resource: ${updatedResource.title}`,
        performedBy: currentUser?.name || 'Admin',
        timestamp: new Date().toLocaleString('th-TH')
      };
      setAuditLogs(prev => [newLog, ...prev]);

    } catch (error) {
      console.error('Failed to update resource:', error);
      throw error;
    }
  };

  const deleteResource = async (id: string) => {
    try {
      const res = await fetch(`/api/resources/${id}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete resource');
      }

      setResources(prev => prev.filter(r => r.id !== id));

      // Add log
      const newLog: AuditLog = {
        id: Date.now().toString(),
        action: 'DELETE',
        entity: 'RESOURCE',
        details: `Deleted resource ID: ${id}`,
        performedBy: currentUser?.name || 'Admin',
        timestamp: new Date().toLocaleString('th-TH')
      };
      setAuditLogs(prev => [newLog, ...prev]);

    } catch (error) {
      console.error('Failed to delete resource:', error);
      throw error;
    }
  };

  // --- Slide Methods ---
  const fetchSlides = async () => {
    try {
      const res = await fetch('/api/slides');
      if (res.ok) {
        const data = await res.json();
        setSlides(data);
      }
    } catch (err) {
      console.error("Fetch slides failed", err);
    }
  };

  const addSlide = async (imageUrl: string) => {
    try {
      const res = await fetch('/api/slides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl, order: slides.length })
      });
      if (res.ok) {
        const newSlide = await res.json();
        setSlides(prev => [...prev, newSlide]);
      }
    } catch (error) {
      console.error("Add slide error", error);
      throw error;
    }
  };

  const deleteSlide = async (id: string) => {
    try {
      const res = await fetch(`/api/slides/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSlides(prev => prev.filter(s => s.id !== id));
      }
    } catch (error) {
      console.error("Delete slide error", error);
      throw error;
    }
  };

  const updateSlide = async (id: string, data: Partial<SlideImage>) => {
    try {
      const res = await fetch(`/api/slides/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const updatedSlide = await res.json();
        setSlides(prev => prev.map(s => s.id === id ? updatedSlide : s));
      }
    } catch (error) {
      console.error("Update slide error", error);
      throw error;
    }
  };


  const resetToDefaults = () => {
    alert("Reset to defaults is disabled in production mode.");
  };

  const value = {
    currentUser,
    mustChangePassword,
    isRateLimited,
    users,
    auditLogs,
    navLinks,
    updateNavLinks,
    gridItems,
    updateGridItems,
    newsArticles,
    resources,
    slides,
    settings,
    login,
    logout,
    changePassword,
    addUser,
    updateUser,
    deleteUser,
    addNews,
    updateNews,
    updateAllNews,
    deleteNews,
    addResource,
    updateResource,
    deleteResource,
    addSlide,
    updateSlideOrder,
    toggleSlideActive,
    updateSlide,
    deleteSlide,
    updateLogo,
    updateAboutImage,
    resetToDefaults,
    checkAuth,
  };

  return (
    <DataContext.Provider value={value}>
      {/* Rate Limit Notification */}
      {isRateLimited && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white px-4 py-3 z-[9999] shadow-lg">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <div className="font-semibold">กรุณารอสักครู่</div>
                <div className="text-sm">ระบบกำลังประมวลผล กรุณารอประมาณ 1 นาที แล้วลองใหม่อีกครั้ง</div>
              </div>
            </div>
            <button
              onClick={() => setIsRateLimited(false)}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
      {children}
    </DataContext.Provider>
  );
};