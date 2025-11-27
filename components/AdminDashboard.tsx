import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { ICONS } from '../constants';
import { NewsArticle, GridItem, NavLink, User, Role } from '../types';
import Settings from './Settings';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

interface AdminDashboardProps {
  onLogout: () => void;
  currentUser: User;
}

// --- Helper Components Moved Outside ---
const DragHandleIcon = ({ className = "w-5 h-5 text-gray-400 cursor-move hover:text-gray-600" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16"></path>
  </svg>
);

const MySwal = withReactContent(Swal);

const ChevronIcon = ({ className = "w-5 h-5", expanded }: { className?: string, expanded?: boolean }) => (
  <svg className={`${className} transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
  </svg>
);

// Assuming a Resource type based on its usage in the context and forms
interface Resource {
  id: string;
  title: string;
  category: string;
  subcategory?: string;
  fileUrl: string;
  fileType: string;
}

interface ResourceUploadFormProps {
  onUpload: (resource: Omit<Resource, 'id'>) => Promise<void>;
  onUpdate: (id: string, resource: Omit<Resource, 'id'>) => Promise<void>;
  initialData?: Resource | null;
  onCancelEdit?: () => void;
  navLinks: NavLink[];
}

const ResourceUploadForm = ({ onUpload, onUpdate, initialData, onCancelEdit, navLinks }: ResourceUploadFormProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Derive categories from navLinks
  const categories = useMemo(() => navLinks.map(link => link.name), [navLinks]);

  // Derive subcategories based on selected category
  const currentSubcategories = useMemo(() => {
    const selectedLink = navLinks.find(link => link.name === category);
    return selectedLink?.submenu?.map(sub => sub.name) || [];
  }, [category, navLinks]);

  // Initialize form with initialData
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setCategory(initialData.category);
      setSubcategory(initialData.subcategory || '');
    } else {
      // Reset defaults if not editing (only when initialData changes to null, effectively resetting form)
      setTitle('');
      setFile(null);
      // We don't force reset category here to allow persistence, 
      // or we can reset it if we want a fresh form.
      // Let's reset to first category only if category is empty
      if (!category && categories.length > 0) {
        setCategory(categories[0]);
      }
    }
  }, [initialData, category, categories]); // Run only when initialData changes, also depends on category and categories for the reset logic

  // Ensure category is valid when categories change (e.g. navLinks update)
  useEffect(() => {
    if (!initialData && categories.length > 0) {
      if (!category || !categories.includes(category)) {
        setCategory(categories[0]);
      }
    }
  }, [categories, category, initialData]);

  // Reset subcategory when category changes (only if not setting initial data)
  useEffect(() => {
    if (!initialData || initialData.category !== category) {
      setSubcategory(currentSubcategories.length > 0 ? currentSubcategories[0] : '');
    }
  }, [category, currentSubcategories, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    // If adding new, file is required. If editing, file is optional.
    if (!initialData && !file) {
      MySwal.fire('กรุณาเลือกไฟล์', '', 'warning');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      let fileUrl = initialData?.fileUrl;
      let fileType = initialData?.fileType;

      if (file) {
        const formData = new FormData();
        formData.append('file', file);

        // Use XMLHttpRequest for progress tracking
        const uploadData = await new Promise<{ fileUrl: string; mimetype: string }>((resolve, reject) => {
          const xhr = new XMLHttpRequest();

          xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
              const percentComplete = Math.round((e.loaded / e.total) * 100);
              setUploadProgress(percentComplete);
            }
          });

          xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const response = JSON.parse(xhr.responseText);
                resolve(response);
              } catch (error) {
                reject(new Error('Invalid response format'));
              }
            } else {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          });

          xhr.addEventListener('error', () => {
            reject(new Error('Upload failed'));
          });

          xhr.open('POST', '/api/upload');
          xhr.send(formData);
        });

        fileUrl = uploadData.fileUrl;
        fileType = uploadData.mimetype;
      }

      const resourceData = {
        title,
        category,
        subcategory,
        fileUrl: fileUrl!,
        fileType: fileType!
      };

      if (initialData) {
        await onUpdate(initialData.id, resourceData);
        MySwal.fire('บันทึกสำเร็จ', 'แก้ไขข้อมูลเรียบร้อยแล้ว', 'success');
      } else {
        await onUpload(resourceData);
        MySwal.fire('อัพโหลดสำเร็จ', 'เพิ่มไฟล์เรียบร้อยแล้ว', 'success');
      }

      // Reset form
      setFile(null);
      setTitle('');
      setUploadProgress(0);
      if (onCancelEdit) onCancelEdit();

    } catch (error) {
      console.error(error);
      MySwal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้', 'error');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อเอกสาร/ไฟล์</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none"
            placeholder="เช่น แบบฟอร์มใบลา, คู่มือการใช้งาน"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">หมวดหมู่หลัก</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">หมวดหมู่ย่อย</label>
          <select
            value={subcategory}
            onChange={(e) => setSubcategory(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none"
            disabled={currentSubcategories.length === 0}
          >
            {currentSubcategories.length === 0 && <option value="">ไม่มีหมวดหมู่ย่อย</option>}
            {currentSubcategories.map(sub => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {initialData ? 'เปลี่ยนไฟล์ (ถ้าต้องการ)' : 'เลือกไฟล์ (PDF, Word, Excel, Image, ZIP, RAR)'}
        </label>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.zip,.rar"
          required={!initialData}
        />
        {initialData && (
          <p className="text-xs text-gray-500 mt-1">ไฟล์ปัจจุบัน: <a href={initialData.fileUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{initialData.fileUrl.split('/').pop()}</a></p>
        )}
      </div>

      {/* Upload Progress Bar */}
      {isUploading && uploadProgress > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700 font-medium">กำลังอัพโหลด...</span>
            <span className="text-green-600 font-bold">{uploadProgress}%</span>
          </div>
          <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-300 ease-out rounded-full shadow-lg"
              style={{ width: `${uploadProgress}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isUploading}
          className={`mt-2 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover: bg-green-700 transition shadow-sm flex items-center justify-center gap-2 flex-1 ${isUploading ? 'opacity-70 cursor-not-allowed' : ''} `}
        >
          {isUploading ? 'กำลังบันทึก...' : (initialData ? 'บันทึกการแก้ไข' : 'อัพโหลดไฟล์')}
        </button>
        {initialData && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="mt-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition shadow-sm"
          >
            ยกเลิก
          </button>
        )}
      </div>
    </form>
  );
};

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout, currentUser }) => {
  const [activeTab, setActiveTab] = useState<'news' | 'menu' | 'services' | 'images' | 'users' | 'logs' | 'resources'>('news');
  const [searchTerm, setSearchTerm] = useState('');
  const [logFilter, setLogFilter] = useState('');

  const {
    newsArticles, addNews, updateNews, updateAllNews, deleteNews,
    navLinks, updateNavLinks,
    gridItems, updateGridItems,
    slides, addSlide, deleteSlide, updateSlide,
    users, addUser, updateUser, deleteUser,
    auditLogs,
    resources, addResource, updateResource, deleteResource,
    resetToDefaults
  } = useData();

  const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';

  // Reset search term when switching tabs and redirect non-super admins
  useEffect(() => {
    setSearchTerm('');
    setLogFilter('');

    // Security redirect: If user is not super admin but tries to access restricted tabs
    if (!isSuperAdmin && (activeTab === 'users' || activeTab === 'logs')) {
      setActiveTab('news');
    }
  }, [activeTab, isSuperAdmin]);

  // --- Drag and Drop State ---
  const [draggedItem, setDraggedItem] = useState<{
    type: 'news' | 'menu' | 'submenu' | 'service';
    index: number;
    parentId?: string; // For submenus
  } | null>(null);

  // --- Collapsed State for Menu ---
  const [collapsedMenus, setCollapsedMenus] = useState<Record<string, boolean>>({});

  const toggleCollapse = (id: string) => {
    setCollapsedMenus(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // --- DnD Handlers ---
  const handleDragStart = (e: React.DragEvent, type: 'news' | 'menu' | 'submenu' | 'service', index: number, parentId?: string) => {
    setDraggedItem({ type, index, parentId });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault(); // Allow dropping
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, type: 'news' | 'menu' | 'submenu' | 'service', dropIndex: number, parentId?: string) => {
    e.preventDefault();
    if (!draggedItem) return;
    if (draggedItem.type !== type) return;
    if (draggedItem.parentId !== parentId) return; // Ensure we are in the same list context
    if (draggedItem.index === dropIndex) return;

    // Helper to move item in array
    const reorder = <T,>(list: T[], startIndex: number, endIndex: number): T[] => {
      const result = Array.from(list);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    };

    if (type === 'news') {
      const reorderedNews = reorder(newsArticles, draggedItem.index, dropIndex);
      updateAllNews(reorderedNews);
    } else if (type === 'menu') {
      const reorderedMenu = reorder(navLinks, draggedItem.index, dropIndex);
      updateNavLinks(reorderedMenu);
    } else if (type === 'submenu' && parentId) {
      const parentIndex = navLinks.findIndex(link => link.id === parentId);
      if (parentIndex !== -1) {
        const parent = navLinks[parentIndex];
        if (parent.submenu) {
          const reorderedSubmenu = reorder(parent.submenu, draggedItem.index, dropIndex);
          const updatedNavLinks = [...navLinks];
          updatedNavLinks[parentIndex] = { ...parent, submenu: reorderedSubmenu };
          updateNavLinks(updatedNavLinks);
        }
      }
    } else if (type === 'service') {
      const reorderedServices = reorder(gridItems, draggedItem.index, dropIndex);
      updateGridItems(reorderedServices);
    }

    setDraggedItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  // --- Delete Confirmation State ---
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ type: 'news' | 'service' | 'menu' | 'user', id: string, parentId?: string } | null>(null);

  const confirmDelete = (type: 'news' | 'service' | 'menu' | 'user', id: string, parentId?: string) => {
    setDeleteConfirmation({ type, id, parentId });
  };

  const executeDelete = () => {
    if (!deleteConfirmation) return;

    if (deleteConfirmation.type === 'news') {
      deleteNews(deleteConfirmation.id);
    } else if (deleteConfirmation.type === 'service') {
      updateGridItems(gridItems.filter(i => i.id !== deleteConfirmation.id));
    } else if (deleteConfirmation.type === 'user') {
      deleteUser(deleteConfirmation.id);
    } else if (deleteConfirmation.type === 'menu') {
      if (deleteConfirmation.parentId) {
        // Delete Submenu Item
        const updatedLinks = navLinks.map(link => {
          if (link.id === deleteConfirmation.parentId) {
            return {
              ...link,
              submenu: link.submenu?.filter(sub => sub.id !== deleteConfirmation.id)
            };
          }
          return link;
        });
        updateNavLinks(updatedLinks);
      } else {
        // Delete Top Level Item
        updateNavLinks(navLinks.filter(link => link.id !== deleteConfirmation.id));
      }
    }
    setDeleteConfirmation(null);
  };

  // --- News State & Handlers ---
  const [editingNews, setEditingNews] = useState<NewsArticle | null>(null);
  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imageProcessProgress, setImageProcessProgress] = useState(0);
  const emptyNews: NewsArticle = { id: '', title: '', excerpt: '', date: '', imageUrl: '', href: '#' };
  const [newsForm, setNewsForm] = useState<NewsArticle>(emptyNews);

  const filteredNews = newsArticles.filter(news =>
    news.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    news.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openNewsModal = (news: NewsArticle | null) => {
    setEditingNews(news);
    setNewsForm(news || { ...emptyNews, id: Date.now().toString(), date: new Date().toLocaleDateString('th-TH') });
    setIsNewsModalOpen(true);
    setIsUploading(false);
  };

  const handleNewsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingNews) {
      updateNews(newsForm);
    } else {
      addNews({ ...newsForm, id: Date.now().toString() });
    }
    setIsNewsModalOpen(false);
  };

  // Unified Image Processing Function
  const processImage = (source: File | string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "Anonymous"; // Attempt to load cross-origin images for canvas processing

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Resize logic: Max dimension 800px
        const MAX_SIZE = 800;
        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);

        try {
          // Compress to JPEG with 0.8 quality
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          resolve(dataUrl);
        } catch (e) {
          // Likely a CORS error (tainted canvas)
          reject(e);
        }
      };

      img.onerror = (err) => reject(err);

      if (source instanceof File) {
        const reader = new FileReader();
        reader.onload = (event) => {
          img.src = event.target?.result as string;
        };
        reader.readAsDataURL(source);
      } else {
        img.src = source; // URL string
      }
    });
  };

  const handleNewsImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check if file is HEIC/HEIF format
      const isHEIC = file.type === 'image/heic' || file.type === 'image/heif' ||
        file.name.toLowerCase().endsWith('.heic') ||
        file.name.toLowerCase().endsWith('.heif');

      // Show helpful message for HEIC files
      if (isHEIC) {
        alert('ไฟล์ HEIC/HEIF ยังไม่รองรับโดยตรง\n\nกรุณาแปลงเป็น JPEG หรือ PNG ก่อนอัพโหลด\n\nวิธีแปลง:\n- iPhone: เปิดรูป > แชร์ > บันทึกเป็น JPEG\n- Mac: เปิดด้วย Preview > Export > เลือก JPEG');
        e.target.value = ''; // Clear input
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
        return;
      }
      if (file.size > 20 * 1024 * 1024) {
        alert("ขนาดไฟล์รูปภาพต้องไม่เกิน 20MB");
        return;
      }

      setIsUploading(true);
      setImageProcessProgress(0);

      try {
        setImageProcessProgress(30);
        const dataUrl = await processImage(file);
        setImageProcessProgress(100);
        setNewsForm(prev => ({ ...prev, imageUrl: dataUrl }));
      } catch (error) {
        console.error("Image processing error:", error);
        alert("ไม่สามารถประมวลผลรูปภาพได้");
      } finally {
        setIsUploading(false);
        setTimeout(() => setImageProcessProgress(0), 500);
      }
    }
  };

  const handleUrlBlur = async () => {
    const url = newsForm.imageUrl;
    if (url && !url.startsWith('data:') && (url.startsWith('http://') || url.startsWith('https://'))) {
      setIsUploading(true);
      try {
        const dataUrl = await processImage(url);
        setNewsForm(prev => ({ ...prev, imageUrl: dataUrl }));
      } catch (error) {
        console.warn("Could not optimize image URL (likely CORS restriction). Using original URL.", error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  // --- Menu State & Handlers (Modern UI) ---
  const [menuModal, setMenuModal] = useState<{
    isOpen: boolean;
    mode: 'add' | 'edit';
    parentId: string | null; // if null, it's top level
    item: NavLink | null;
  }>({ isOpen: false, mode: 'add', parentId: null, item: null });

  const [menuForm, setMenuForm] = useState({ name: '', href: '' });

  const openMenuModal = (mode: 'add' | 'edit', parentId: string | null = null, item: NavLink | null = null) => {
    setMenuForm({
      name: item?.name || '',
      href: item?.href || '#',
    });
    setMenuModal({ isOpen: true, mode, parentId, item });
  };

  const handleMenuSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { mode, parentId, item } = menuModal;
    const newItem = {
      id: item?.id || Date.now().toString(),
      name: menuForm.name,
      href: menuForm.href,
      submenu: item?.submenu || (mode === 'add' && !parentId ? [] : undefined)
    };

    if (mode === 'add') {
      if (parentId) {
        // Add to submenu
        const updatedLinks = navLinks.map(link => {
          if (link.id === parentId) {
            return { ...link, submenu: [...(link.submenu || []), newItem] };
          }
          return link;
        });
        updateNavLinks(updatedLinks);
      } else {
        // Add top level
        updateNavLinks([...navLinks, newItem]);
      }
    } else if (mode === 'edit') {
      if (parentId) {
        // Edit submenu item
        const updatedLinks = navLinks.map(link => {
          if (link.id === parentId) {
            return {
              ...link,
              submenu: link.submenu?.map(sub => sub.id === item!.id ? { ...sub, ...newItem } : sub)
            };
          }
          return link;
        });
        updateNavLinks(updatedLinks);
      } else {
        // Edit top level item
        const updatedLinks = navLinks.map(link => link.id === item!.id ? { ...link, ...newItem } : link);
        updateNavLinks(updatedLinks);
      }
    }
    setMenuModal({ ...menuModal, isOpen: false });
  };


  // --- Services (Grid) State ---
  const [editingService, setEditingService] = useState<GridItem | null>(null);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const emptyService: GridItem = { id: '', iconName: 'Document', label: '', description: '', href: '#' };
  const [serviceForm, setServiceForm] = useState<GridItem>(emptyService);

  const filteredServices = gridItems.filter(item =>
    item.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openServiceModal = (item: GridItem | null) => {
    setEditingService(item);
    setServiceForm(item || { ...emptyService, id: Date.now().toString() });
    setIsServiceModalOpen(true);
  };

  const handleServiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingService) {
      updateGridItems(gridItems.map(i => i.id === serviceForm.id ? serviceForm : i));
    } else {
      updateGridItems([...gridItems, { ...serviceForm, id: Date.now().toString() }]);
    }
    setIsServiceModalOpen(false);
  };

  // --- User Management State ---
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const emptyUser: User = { id: '', username: '', password: '', name: '', role: 'ADMIN' };
  const [userForm, setUserForm] = useState<User>(emptyUser);

  const openUserModal = (user: User | null) => {
    setEditingUser(user);
    setUserForm(user || { ...emptyUser, id: Date.now().toString() });
    setIsUserModalOpen(true);
  };

  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      updateUser(userForm);
    } else {
      // Check if username exists
      if (users.some(u => u.username === userForm.username)) {
        alert('ชื่อผู้ใช้นี้มีอยู่ในระบบแล้ว');
        return;
      }
      addUser({ ...userForm, id: Date.now().toString() });
    }
    setIsUserModalOpen(false);
  };

  // --- Audit Log Filter ---
  const filteredLogs = auditLogs.filter(log =>
    log.performedBy.toLowerCase().includes(logFilter.toLowerCase()) ||
    log.action.toLowerCase().includes(logFilter.toLowerCase()) ||
    log.details.toLowerCase().includes(logFilter.toLowerCase())
  );


  // --- Slider Images State ---
  const [isSlideUploading, setIsSlideUploading] = useState(false);
  const handleSlideUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsSlideUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', file);

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });

        if (!uploadRes.ok) throw new Error('Upload failed');

        const uploadData = await uploadRes.json();
        await addSlide(uploadData.fileUrl);
        MySwal.fire('อัพโหลดสำเร็จ', 'เพิ่มรูปสไลด์เรียบร้อยแล้ว', 'success');
      } catch (error) {
        console.error("Slide upload error", error);
        MySwal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถอัพโหลดรูปได้', 'error');
      } finally {
        setIsSlideUploading(false);
        // Reset input
        e.target.value = '';
      }
    }
  };

  const handleDeleteSlide = async (id: string) => {
    const result = await MySwal.fire({
      title: 'ยืนยันการลบ?',
      text: "คุณต้องการลบรูปสไลด์นี้ใช่หรือไม่?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'ใช่, ลบเลย!',
      cancelButtonText: 'ยกเลิก'
    });

    if (result.isConfirmed) {
      await deleteSlide(id);
      MySwal.fire('ลบสำเร็จ!', 'รูปสไลด์ถูกลบเรียบร้อยแล้ว', 'success');
    }
  };

  // --- Resources State ---
  const [editingResource, setEditingResource] = useState<Resource | null>(null);

  const handleEditResource = (resource: Resource) => {
    setEditingResource(resource);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteResource = async (id: string) => {
    const result = await MySwal.fire({
      title: 'ยืนยันการลบ?',
      text: "คุณต้องการลบไฟล์นี้ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'ใช่, ลบเลย!',
      cancelButtonText: 'ยกเลิก'
    });

    if (result.isConfirmed) {
      await deleteResource(id);
      MySwal.fire(
        'ลบสำเร็จ!',
        'ไฟล์ถูกลบเรียบร้อยแล้ว',
        'success'
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-green-600 rounded-lg flex items-center justify-center text-white shadow-md">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.356a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.356 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.356a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800 leading-tight">ระบบจัดการเว็บไซต์</h1>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${currentUser.role === 'SUPER_ADMIN' ? 'bg-purple-500' : 'bg-blue-500'} `}></div>
              <span className="text-xs text-gray-500 font-medium">{currentUser.name} ({currentUser.role})</span>
            </div>
          </div>
        </div>
        <div className="flex gap-4 items-center">
          {isSuperAdmin && (
            <button onClick={resetToDefaults} className="text-gray-400 hover:text-red-600 text-xs transition-colors" title="รีเซ็ตข้อมูลทั้งหมด">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          )}
          <button onClick={onLogout} className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            ออกจากระบบ
          </button>
        </div>
      </div>

      <div className="container mx-auto p-6 flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 sticky top-24">
            <nav className="space-y-1">
              {[
                { id: 'news', label: 'จัดการข่าวสาร', icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z' },
                { id: 'menu', label: 'จัดการเมนู (Nav)', icon: 'M4 6h16M4 12h16M4 18h16' },
                { id: 'services', label: 'จัดการบริการ (Icons)', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
                { id: 'images', label: 'จัดการรูปสไลด์', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
                { id: 'resources', label: 'จัดการเอกสาร/ไฟล์', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
                { id: 'settings', label: 'ตั้งค่าระบบ', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.356a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.356 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.356a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 group relative overflow-hidden ${activeTab === item.id
                    ? 'bg-green-50 text-green-700 font-semibold shadow-sm ring-1 ring-green-200'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } `}
                >
                  {activeTab === item.id && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-green-500 rounded-r-full"></div>}
                  <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} /></svg>
                  <span className="relative z-10">{item.label}</span>
                </button>
              ))}

              {isSuperAdmin && (
                <>
                  <div className="pt-4 pb-2">
                    <div className="h-px bg-gray-100 mx-2"></div>
                    <p className="text-[10px] text-gray-400 uppercase mt-3 px-4 font-bold tracking-wider">Super Admin</p>
                  </div>
                  {[
                    { id: 'users', label: 'จัดการผู้ใช้', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
                    { id: 'logs', label: 'Audit Logs', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' }
                  ].map(item => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id as any)}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 group relative overflow-hidden ${activeTab === item.id
                        ? 'bg-purple-50 text-purple-700 font-semibold shadow-sm ring-1 ring-purple-200'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        } `}
                    >
                      {activeTab === item.id && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-purple-500 rounded-r-full"></div>}
                      <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} /></svg>
                      <span className="relative z-10">{item.label}</span>
                    </button>
                  ))}
                </>
              )}
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0">

          {/* --- NEWS TAB --- */}
          {activeTab === 'news' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">รายการข่าวสาร</h2>
                  <p className="text-sm text-gray-500">จัดการข่าวประชาสัมพันธ์และกิจกรรมต่างๆ</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <div className="relative">
                    <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    <input
                      type="text"
                      placeholder="ค้นหาข่าว..."
                      className="border border-gray-200 bg-gray-50 rounded-lg pl-9 pr-3 py-2 text-sm w-full sm:w-64 focus:ring-2 focus:ring-green-500 outline-none transition-all focus:bg-white"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <button onClick={() => openNewsModal(null)} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition shadow-sm flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                    เพิ่มข่าวใหม่
                  </button>
                </div>
              </div>

              <div className="grid gap-4">
                {filteredNews.map((news, index) => (
                  <div
                    key={news.id}
                    draggable={!searchTerm}
                    onDragStart={(e) => handleDragStart(e, 'news', index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={(e) => handleDrop(e, 'news', index)}
                    onDragEnd={handleDragEnd}
                    className={`bg-white border border-gray-200 rounded-xl p-4 flex flex-col sm: flex-row gap-5 items-start hover: shadow-md transition-all relative group ${draggedItem?.type === 'news' && draggedItem?.index === index ? 'opacity-50 border-dashed border-green-500 scale-[0.99]' : ''
                      } `}
                  >
                    {!searchTerm && (
                      <div className="absolute left-0 top-0 bottom-0 w-6 cursor-move flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <DragHandleIcon className="w-4 h-4 text-gray-300" />
                      </div>
                    )}
                    <div className="w-full sm:w-32 h-32 sm:h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 border border-gray-100 shadow-sm">
                      {news.imageUrl ? (
                        <img src={news.imageUrl} alt={news.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-gray-900 text-lg leading-snug truncate pr-2">{news.title}</h3>
                        <span className="text-xs text-gray-400 whitespace-nowrap bg-gray-50 px-2 py-1 rounded border border-gray-100">{news.date}</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2 leading-relaxed">{news.excerpt}</p>
                      <div className="mt-3 flex items-center gap-3 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button onClick={() => openNewsModal(news)} className="text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-colors">แก้ไข</button>
                        <button onClick={() => confirmDelete('news', news.id!)} className="text-xs font-medium text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-md transition-colors">ลบ</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* --- MENU TAB (Modernized) --- */}
          {activeTab === 'menu' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-xl shadow-md">
                <div>
                  <h2 className="text-2xl font-bold">โครงสร้างเมนูเว็บไซต์</h2>
                  <p className="text-green-100 text-sm mt-1 opacity-90">ลากและวางเพื่อจัดเรียงลำดับเมนู</p>
                </div>
                <button
                  onClick={() => openMenuModal('add')}
                  className="mt-4 sm:mt-0 bg-white text-green-700 px-5 py-2.5 rounded-lg hover:bg-green-50 transition shadow-sm flex items-center gap-2 font-semibold text-sm"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                  เพิ่มเมนูหลัก
                </button>
              </div>

              <div className="space-y-4">
                {navLinks.map((link, index) => (
                  <div
                    key={link.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, 'menu', index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={(e) => handleDrop(e, 'menu', index)}
                    onDragEnd={handleDragEnd}
                    className={`bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm transition-all duration-200 group ${draggedItem?.type === 'menu' && draggedItem?.index === index ? 'opacity-40 ring-2 ring-green-500 border-transparent' : 'hover:shadow-md hover:border-green-200'
                      } `}
                  >
                    {/* Parent Item Header */}
                    <div className="flex items-center p-4 bg-white">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="cursor-move p-1.5 rounded-lg hover:bg-gray-100 text-gray-300 hover:text-gray-500 transition-colors">
                          <DragHandleIcon className="w-5 h-5" />
                        </div>

                        {/* Expand Toggle */}
                        {link.submenu && link.submenu.length > 0 ? (
                          <button
                            onClick={() => toggleCollapse(link.id!)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-green-600 transition-colors"
                          >
                            <ChevronIcon expanded={!collapsedMenus[link.id!]} />
                          </button>
                        ) : (
                          <div className="w-8"></div> // Spacer
                        )}

                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-800 text-lg">{link.name}</span>
                            {link.submenu && link.submenu.length > 0 && collapsedMenus[link.id!] && (
                              <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[10px] font-bold border border-gray-200 shadow-sm">
                                {link.submenu.length}
                              </span>
                            )}
                          </div>
                          <span className="text-xs font-mono text-gray-500 bg-gray-50 px-2 py-0.5 rounded-md truncate max-w-[150px] border border-gray-100">{link.href}</span>
                        </div>
                      </div>

                      {/* Actions - Hidden by default on desktop for cleaner UI */}
                      <div className="flex items-center gap-2 pl-4 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 opacity-100">
                        <button
                          onClick={() => openMenuModal('add', link.id)}
                          className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-colors border border-green-100"
                          title="เพิ่มเมนูย่อย"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                          <span className="hidden sm:inline">ย่อย</span>
                        </button>
                        <div className="h-4 w-px bg-gray-200 mx-1"></div>
                        <button onClick={() => openMenuModal('edit', null, link)} className="text-gray-400 hover:text-blue-600 p-2 transition-colors rounded-lg hover:bg-blue-50" title="แก้ไข">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                        <button onClick={() => confirmDelete('menu', link.id!)} className="text-gray-400 hover:text-red-600 p-2 transition-colors rounded-lg hover:bg-red-50" title="ลบ">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </div>

                    {/* Submenus Area */}
                    {link.submenu && link.submenu.length > 0 && !collapsedMenus[link.id!] && (
                      <div className="bg-gray-50 border-t border-gray-100 p-3 space-y-2 relative">
                        {/* Hierarchy Line - Dynamic height handled by flex/grid usually, but absolute works for visual tree */}
                        <div className="absolute left-8 top-0 bottom-5 w-px bg-gray-300/50 border-l border-dashed border-gray-300"></div>

                        {link.submenu.map((sub, subIndex) => (
                          <div
                            key={sub.id}
                            draggable
                            onDragStart={(e) => { e.stopPropagation(); handleDragStart(e, 'submenu', subIndex, link.id); }}
                            onDragOver={(e) => handleDragOver(e, subIndex)}
                            onDrop={(e) => { e.stopPropagation(); handleDrop(e, 'submenu', subIndex, link.id); }}
                            onDragEnd={handleDragEnd}
                            className={`ml-10 pl-3 pr-3 py-2.5 bg-white border border-gray-200 rounded-lg flex items-center justify-between hover: border-green-300 hover: shadow-sm transition-all cursor-move relative group / sub ${draggedItem?.type === 'submenu' && draggedItem?.index === subIndex && draggedItem?.parentId === link.id ? 'opacity-40' : ''
                              } `}
                          >
                            {/* Connector dot */}
                            <div className="absolute -left-[17px] top-1/2 -translate-y-1/2 w-2.5 h-px bg-gray-300"></div>
                            <div className="absolute -left-[17px] top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-gray-300 group-hover/sub:bg-green-400 transition-colors"></div>

                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <DragHandleIcon className="w-4 h-4 text-gray-300 group-hover/sub:text-gray-500 transition-colors" />
                              <span className="text-sm font-medium text-gray-700 group-hover/sub:text-green-700 transition-colors">{sub.name}</span>
                              <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded truncate max-w-[120px]">{sub.href}</span>
                            </div>

                            <div className="flex items-center gap-1">
                              <button onClick={() => openMenuModal('edit', link.id, sub)} className="text-blue-500 hover:text-blue-700 p-1.5 rounded-md hover:bg-blue-50 transition-colors" title="แก้ไข">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                              </button>
                              <button onClick={() => confirmDelete('menu', sub.id!, link.id)} className="text-red-500 hover:text-red-700 p-1.5 rounded-md hover:bg-red-50 transition-colors" title="ลบ">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {navLinks.length === 0 && (
                  <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                    <div className="mx-auto h-12 w-12 text-gray-300 mb-3">
                      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6h16M4 12h16M4 18h16" /></svg>
                    </div>
                    <p className="text-gray-500 font-medium">ยังไม่มีเมนูในระบบ</p>
                    <p className="text-gray-400 text-sm mb-4">เริ่มต้นสร้างโครงสร้างเว็บไซต์ของคุณ</p>
                    <button onClick={() => openMenuModal('add')} className="text-green-600 font-semibold hover:text-green-700 hover:underline">เพิ่มเมนูแรก</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* --- SERVICES TAB --- */}
          {activeTab === 'services' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">รายการบริการ</h2>
                  <p className="text-sm text-gray-500">จัดการปุ่มลัดและบริการต่างๆ</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <input
                    type="text"
                    placeholder="ค้นหาบริการ..."
                    className="border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm w-full sm:w-64 focus:ring-2 focus:ring-green-500 outline-none transition-all focus:bg-white"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button onClick={() => openServiceModal(null)} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition whitespace-nowrap shadow-sm flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                    เพิ่มรายการ
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredServices.map((item, index) => (
                  <div
                    key={item.id}
                    draggable={!searchTerm}
                    onDragStart={(e) => handleDragStart(e, 'service', index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={(e) => handleDrop(e, 'service', index)}
                    onDragEnd={handleDragEnd}
                    className={`bg-white border border-gray-200 p-4 rounded-xl flex items-center justify-between hover: shadow-md transition-all cursor-move group ${draggedItem?.type === 'service' && draggedItem?.index === index ? 'opacity-50 border-dashed border-green-500 scale-95' : ''
                      } `}
                  >
                    <div className="flex items-center gap-4">
                      {!searchTerm && (
                        <div className="text-gray-300 group-hover:text-gray-400 transition-colors">
                          <DragHandleIcon />
                        </div>
                      )}
                      <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center text-green-600 border border-green-100 shadow-sm">
                        {ICONS[item.iconName] ? React.createElement(ICONS[item.iconName], { className: "w-7 h-7" }) : '?'}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-800">{item.label}</span>
                        <span className="text-xs text-gray-400 truncate max-w-[120px]">{item.href}</span>
                        ```
                      </div >
                    </div >
                    <div className="flex gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button onClick={() => openServiceModal(item)} className="text-gray-400 hover:text-blue-600 p-1.5 rounded-md hover:bg-blue-50 transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                      <button onClick={() => confirmDelete('service', item.id!)} className="text-gray-400 hover:text-red-600 p-1.5 rounded-md hover:bg-red-50 transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                    </div>
                  </div >
                ))}
              </div >
            </div >
          )}
          {/* --- RESOURCES TAB --- */}
          {
            activeTab === 'resources' && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">
                    {editingResource ? 'แก้ไขเอกสาร/ไฟล์' : 'อัพโหลดเอกสารและไฟล์'}
                  </h2>
                  <ResourceUploadForm
                    onUpload={addResource}
                    onUpdate={updateResource}
                    initialData={editingResource}
                    onCancelEdit={() => setEditingResource(null)}
                    navLinks={navLinks}
                  />
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="font-bold text-gray-700">รายการไฟล์ในระบบ</h3>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {resources.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">ยังไม่มีไฟล์ในระบบ</div>
                    ) : (
                      resources.map(resource => (
                        <div key={resource.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <div>
                              <a href={resource.fileUrl} target="_blank" rel="noreferrer" className="font-medium text-gray-900 hover:text-blue-600 transition-colors">
                                {resource.title}
                              </a>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">{resource.category}</span>
                                {resource.subcategory && (
                                  <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">{resource.subcategory}</span>
                                )}
                                <span className="text-xs text-gray-400">{new Date(resource.createdAt).toLocaleDateString('th-TH')}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditResource(resource)}
                              className="text-sm text-indigo-600 hover:text-indigo-900 px-3 py-1 rounded hover:bg-indigo-50 transition-colors"
                            >
                              แก้ไข
                            </button>
                            <button
                              onClick={() => handleDeleteResource(resource.id)}
                              className="text-sm text-red-600 hover:text-red-900 px-3 py-1 rounded hover:bg-red-50 transition-colors"
                            >
                              ลบ
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )
          }

          {/* --- IMAGES TAB --- */}
          {
            activeTab === 'images' && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">จัดการรูปสไลด์หน้าแรก</h2>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">อัพโหลดรูปภาพใหม่</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleSlideUpload}
                          disabled={isSlideUploading}
                          className="block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-full file:border-0
                          file:text-sm file:font-semibold
                          file:bg-green-100 file:text-green-700
                          hover:file:bg-green-200 cursor-pointer disabled:opacity-50"
                        />
                      </div>
                      {isSlideUploading && (
                        <div className="flex items-center gap-2 text-green-600">
                          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span className="text-sm font-medium">กำลังอัพโหลด...</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">* แนะนำขนาดรูปภาพ 1920x600 px หรืออัตราส่วน 16:5 เพื่อความสวยงาม</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {slides.map((slide, idx) => (
                    <div key={slide.id} className="group relative aspect-video bg-gray-100 rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all">
                      <img src={slide.imageUrl} alt={`Slide ${idx + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors"></div>
                      <button
                        onClick={() => handleDeleteSlide(slide.id)}
                        className="absolute top-3 right-3 bg-red-600 text-white p-2 rounded-full shadow-lg hover:bg-red-700 opacity-0 group-hover:opacity-100 transition-all transform scale-90 group-hover:scale-100"
                        title="ลบรูปภาพ"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                      <div className="absolute bottom-3 left-3 bg-black/50 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        ลำดับที่ {slide.order + 1}
                      </div>
                    </div>
                  ))}
                  {slides.length === 0 && (
                    <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                      ยังไม่มีรูปสไลด์ในระบบ
                    </div>
                  )}
                </div>
              </div>
            )
          }

          {/* --- SETTINGS TAB --- */}
          {activeTab === 'settings' && (
            <Settings />
          )}

          {/* --- USERS TAB (Super Admin Only) --- */}
          {
            activeTab === 'users' && isSuperAdmin && (
              <div className="space-y-6">
                <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">จัดการผู้ใช้งาน</h2>
                    <p className="text-sm text-gray-500">User Management & Role Based Access</p>
                  </div>
                  <button
                    onClick={() => openUserModal(null)}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2 shadow-sm transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                    เพิ่มผู้ใช้ใหม่
                  </button>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Username</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ชื่อ-นามสกุล</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.username}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${user.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                              {user.role.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right whitespace-nowrap text-sm font-medium">
                            <div className="flex justify-end gap-3">
                              <button
                                onClick={() => openUserModal(user)}
                                className="text-blue-600 hover:text-blue-900 transition-colors"
                              >
                                แก้ไข
                              </button>
                              {user.id !== currentUser.id && (
                                <button
                                  onClick={() => confirmDelete('user', user.id)}
                                  className="text-red-600 hover:text-red-900 transition-colors"
                                >
                                  ลบ
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          }

          {/* --- AUDIT LOGS TAB (Super Admin Only) --- */}
          {
            activeTab === 'logs' && isSuperAdmin && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Audit Logs</h2>
                    <p className="text-sm text-gray-500">ประวัติการใช้งานระบบ</p>
                  </div>
                  <input
                    type="text"
                    placeholder="ค้นหา (ผู้ใช้, กิจกรรม, รายละเอียด)..."
                    className="border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm w-full sm:w-80 focus:ring-2 focus:ring-green-500 outline-none transition-all focus:bg-white"
                    value={logFilter}
                    onChange={(e) => setLogFilter(e.target.value)}
                  />
                </div>
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col h-[600px]">
                  <div className="overflow-auto flex-1 rounded-xl">
                    <table className="min-w-full divide-y divide-gray-200 relative">
                      <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">Timestamp</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">User</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">Action</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">Entity</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">Details</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-gray-50 transition-colors text-sm">
                            <td className="px-6 py-4 whitespace-nowrap text-gray-500">{log.timestamp}</td>
                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{log.performedBy}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2.5 py-0.5 text-xs rounded-full border ${log.action === 'CREATE' ? 'bg-green-50 border-green-200 text-green-700' :
                                log.action === 'DELETE' ? 'bg-red-50 border-red-200 text-red-700' :
                                  log.action === 'UPDATE' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                                    'bg-gray-50 border-gray-200 text-gray-700'
                                }`}>
                                {log.action}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                              <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-mono text-gray-700">{log.entity}</span>
                            </td>
                            <td className="px-6 py-4 text-gray-600 max-w-xs truncate" title={log.details}>{log.details}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {filteredLogs.length === 0 && <div className="p-12 text-center text-gray-500">ไม่พบข้อมูลประวัติการใช้งาน</div>}
                  </div>
                </div>
              </div>
            )
          }

        </div >
      </div >

      {/* --- MODALS --- */}

      {/* User Modal */}
      {
        isUserModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-2xl transform transition-all">
              <h3 className="text-xl font-bold mb-6 text-gray-800 border-b pb-2">{editingUser ? 'แก้ไขผู้ใช้งาน' : 'เพิ่มผู้ใช้งานใหม่'}</h3>
              <form onSubmit={handleUserSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Username</label>
                  <input
                    required
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none disabled:bg-gray-100"
                    value={userForm.username}
                    onChange={e => setUserForm({ ...userForm, username: e.target.value })}
                    disabled={!!editingUser}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Password</label>
                  <input
                    required
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                    value={userForm.password}
                    onChange={e => setUserForm({ ...userForm, password: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">ชื่อ-นามสกุล</label>
                  <input
                    required
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                    value={userForm.name}
                    onChange={e => setUserForm({ ...userForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">สิทธิ์การใช้งาน (Role)</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 disabled:bg-gray-100 disabled:text-gray-500 outline-none focus:ring-2 focus:ring-purple-500"
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value as Role })}
                    disabled={editingUser?.id === currentUser.id}
                  >
                    <option value="ADMIN">Admin (จัดการเนื้อหา)</option>
                    <option value="SUPER_ADMIN">Super Admin (จัดการทุกอย่าง)</option>
                  </select>
                  {editingUser?.id === currentUser.id && (
                    <p className="text-xs text-amber-600 mt-1">คุณไม่สามารถเปลี่ยนสิทธิ์การใช้งานของตัวเองได้</p>
                  )}
                </div>
                <div className="flex justify-end gap-3 mt-8 pt-2 border-t border-gray-100">
                  <button type="button" onClick={() => setIsUserModalOpen(false)} className="text-gray-600 hover:bg-gray-100 px-4 py-2 rounded-lg transition-colors">ยกเลิก</button>
                  <button type="submit" className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 shadow-md transition-colors">บันทึก</button>
                </div>
              </form>
            </div>
          </div>
        )
      }

      {/* Delete Confirmation Modal */}
      {
        deleteConfirmation && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[80] p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl w-full max-w-sm p-6 shadow-2xl scale-100 transform transition-all">
              <div className="text-center mb-6">
                <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-red-100 mb-4">
                  <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">ยืนยันการลบ</h3>
                <p className="text-sm text-gray-600">
                  คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้? <br />การกระทำนี้ไม่สามารถย้อนกลับได้
                </p>
              </div>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setDeleteConfirmation(null)}
                  className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={executeDelete}
                  className="px-5 py-2.5 text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 font-medium transition-colors shadow-sm"
                >
                  ยืนยันลบ
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Menu Modal */}
      {
        menuModal.isOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-2xl">
              <h3 className="text-xl font-bold mb-6 text-gray-800 border-b pb-2">
                {menuModal.mode === 'add'
                  ? (menuModal.parentId ? 'เพิ่มเมนูย่อย' : 'เพิ่มเมนูหลัก')
                  : 'แก้ไขเมนู'}
              </h3>
              <form onSubmit={handleMenuSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">ชื่อเมนู</label>
                  <input
                    required
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none"
                    value={menuForm.name}
                    onChange={e => setMenuForm({ ...menuForm, name: e.target.value })}
                    placeholder="เช่น หน้าแรก, ติดต่อเรา"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">ลิงก์ (URL/Anchor)</label>
                  <input
                    required
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none"
                    value={menuForm.href}
                    onChange={e => setMenuForm({ ...menuForm, href: e.target.value })}
                    placeholder="เช่น #home, https://example.com"
                  />
                </div>
                <div className="flex justify-end gap-3 mt-8 pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setMenuModal({ ...menuModal, isOpen: false })}
                    className="text-gray-600 hover:bg-gray-100 px-4 py-2 rounded-lg transition-colors"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 shadow-md transition-colors"
                  >
                    บันทึก
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }

      {/* News Modal */}
      {
        isNewsModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto shadow-2xl">
              <h3 className="text-xl font-bold mb-6 text-gray-800 border-b pb-2">{editingNews ? 'แก้ไขข่าว' : 'เพิ่มข่าวใหม่'}</h3>
              <form onSubmit={handleNewsSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">หัวข้อข่าว</label>
                  <input required type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none" value={newsForm.title} onChange={e => setNewsForm({ ...newsForm, title: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">วันที่</label>
                  <input required type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none" value={newsForm.date} onChange={e => setNewsForm({ ...newsForm, date: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">เนื้อหาย่อ</label>
                  <textarea required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none" rows={3} value={newsForm.excerpt} onChange={e => setNewsForm({ ...newsForm, excerpt: e.target.value })} />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">รูปภาพปกข่าว</label>

                  {newsForm.imageUrl && (
                    <div className="mb-3 relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shadow-inner">
                      <img src={newsForm.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setNewsForm({ ...newsForm, imageUrl: '' })}
                        className="absolute top-2 right-2 bg-red-500/90 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors shadow-sm"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  )}

                  <div className="flex flex-col gap-3 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 relative hover:bg-gray-100 transition-colors">
                    {isUploading && (
                      <div className="absolute inset-0 bg-white/90 z-10 flex flex-col items-center justify-center rounded-lg">
                        <svg className="animate-spin h-8 w-8 text-green-600 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="text-sm text-green-700 font-medium">กำลังประมวลผลรูปภาพ...</span>
                      </div>
                    )}

                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleNewsImageUpload}
                        disabled={isUploading}
                        className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-green-100 file:text-green-700
                        hover:file:bg-green-200 cursor-pointer disabled:opacity-50"
                      />
                    </div>

                    {/* Image Processing Progress Bar */}
                    {isUploading && imageProcessProgress > 0 && (
                      <div className="space-y-2 mt-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-700 font-medium">กำลังประมวลผลรูปภาพ...</span>
                          <span className="text-green-600 font-bold">{imageProcessProgress}%</span>
                        </div>
                        <div className="relative w-full h-2.5 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                          <div
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-300 ease-out rounded-full"
                            style={{ width: `${imageProcessProgress}%` }}
                          >
                            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="text-xs text-gray-400 text-center font-medium">- หรือ -</div>
                    <input
                      type="text"
                      placeholder="วางลิงก์รูปภาพ (URL) กรณีไม่ต้องการอัปโหลด"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-600 bg-white focus:ring-2 focus:ring-green-500 outline-none"
                      value={newsForm.imageUrl.startsWith('data:') ? '' : newsForm.imageUrl}
                      onChange={e => setNewsForm({ ...newsForm, imageUrl: e.target.value })}
                      onBlur={handleUrlBlur}
                      disabled={newsForm.imageUrl.startsWith('data:') || isUploading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">ลิงก์อ่านต่อ</label>
                  <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none" value={newsForm.href} onChange={e => setNewsForm({ ...newsForm, href: e.target.value })} />
                </div>
                <div className="flex justify-end gap-3 mt-8 pt-2 border-t border-gray-100">
                  <button type="button" onClick={() => setIsNewsModalOpen(false)} className="text-gray-600 hover:bg-gray-100 px-4 py-2 rounded-lg transition-colors">ยกเลิก</button>
                  <button
                    type="submit"
                    disabled={isUploading}
                    className={`bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition shadow-md ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isUploading ? 'กำลังอัปโหลด...' : 'บันทึก'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }

      {/* Service Modal */}
      {
        isServiceModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl w-full max-w-lg p-6 shadow-2xl">
              <h3 className="text-xl font-bold mb-6 text-gray-800 border-b pb-2">{editingService ? 'แก้ไขบริการ' : 'เพิ่มบริการใหม่'}</h3>
              <form onSubmit={handleServiceSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">ชื่อบริการ</label>
                  <input required type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none" value={serviceForm.label} onChange={e => setServiceForm({ ...serviceForm, label: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">คำอธิบาย (Tooltip)</label>
                  <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none" rows={2} value={serviceForm.description || ''} onChange={e => setServiceForm({ ...serviceForm, description: e.target.value })} placeholder="อธิบายเพิ่มเติมเกี่ยวกับบริการนี้ (แสดงเมื่อเอาเมาส์ชี้)" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">ลิงก์</label>
                  <input required type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none" value={serviceForm.href} onChange={e => setServiceForm({ ...serviceForm, href: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">ไอคอน</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none"
                    value={serviceForm.iconName}
                    onChange={e => setServiceForm({ ...serviceForm, iconName: e.target.value })}
                  >
                    {Object.keys(ICONS).map(iconName => (
                      <option key={iconName} value={iconName}>{iconName}</option>
                    ))}
                  </select>
                  <div className="mt-3 flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <span>ตัวอย่างไอคอน:</span>
                    <div className="w-10 h-10 text-green-600 bg-white rounded-md flex items-center justify-center shadow-sm border border-gray-200">
                      {ICONS[serviceForm.iconName] && React.createElement(ICONS[serviceForm.iconName], { className: "w-6 h-6" })}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-8 pt-2 border-t border-gray-100">
                  <button type="button" onClick={() => setIsServiceModalOpen(false)} className="text-gray-600 hover:bg-gray-100 px-4 py-2 rounded-lg transition-colors">ยกเลิก</button>
                  <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 shadow-md transition-colors">บันทึก</button>
                </div>
              </form>
            </div>
          </div>
        )
      }

    </div >
  );
};

export default AdminDashboard;