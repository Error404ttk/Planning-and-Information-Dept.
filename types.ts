import React from 'react';

export type Role = 'SUPER_ADMIN' | 'ADMIN';

export interface User {
  id: string;
  username: string;
  password: string; // Stored as SHA-256 hash
  name: string;
  role: Role;
}

export interface AuditLog {
  id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'RESET';
  entity: 'NEWS' | 'MENU' | 'SERVICE' | 'USER' | 'SYSTEM' | 'IMAGE' | 'RESOURCE';
  details: string;
  performedBy: string;
  timestamp: string;
}

export interface SlideImage {
  id: string;
  imageUrl: string;
  order: number;
  isActive: boolean;
  createdAt: string;
}

export interface NavLink {
  id?: string;
  name: string;
  href: string;
  submenu?: NavLink[];
}

export interface GridItem {
  id?: string;
  iconName: string; // Changed from ReactElement to string for JSON storage
  label: string;
  description?: string; // Tooltip text
  href: string;
}

export interface NewsArticle {
  id?: string;
  imageUrl: string;
  title: string;
  excerpt: string;
  date: string;
  href: string;
}

export interface Resource {
  id: string;
  title: string;
  category: string;
  subcategory?: string;
  fileUrl: string;
  fileType: string;
  createdAt: string;
}

export interface SystemSettings {
  hospitalLogo?: string;
  [key: string]: string | undefined;
}

export interface DataContextType {
  // Auth & Users
  currentUser: User | null;
  mustChangePassword: boolean;
  isRateLimited: boolean;
  users: User[];
  login: (password: string) => Promise<boolean>;
  logout: () => void;
  changePassword: (newPassword: string, currentPassword?: string) => Promise<{ success: boolean; error?: string }>;
  addUser: (user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateUser: (id: string, updates: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;

  // Logs
  auditLogs: AuditLog[];

  // Content
  navLinks: NavLink[];
  updateNavLinks: (links: NavLink[]) => void;

  gridItems: GridItem[];
  updateGridItems: (items: GridItem[]) => void;

  newsArticles: NewsArticle[];
  addNews: (news: FormData) => Promise<void>;
  updateNews: (id: string, news: FormData) => Promise<void>;
  updateAllNews: (news: NewsArticle[]) => void;
  deleteNews: (id: string) => Promise<void>;

  // Resources
  resources: Resource[];
  addResource: (resource: FormData) => Promise<void>;
  updateResource: (id: string, resource: Partial<Resource>) => Promise<void>;
  deleteResource: (id: string) => Promise<void>;

  // Slides
  slides: SlideImage[];
  addSlide: (slide: FormData) => Promise<void>;
  deleteSlide: (id: string) => Promise<void>;
  updateSlide: (id: string, data: Partial<SlideImage>) => Promise<void>;
  updateSlideOrder: (id: string, newOrder: number) => Promise<void>;
  toggleSlideActive: (id: string) => Promise<void>;

  // Settings
  settings: SystemSettings;
  updateLogo: (file: File) => Promise<void>;

  resetToDefaults: () => void;
}