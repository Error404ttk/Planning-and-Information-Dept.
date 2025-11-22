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

export interface DataContextType {
  // Auth & Users
  currentUser: User | null;
  mustChangePassword: boolean;
  users: User[];
  login: (username: string, password: string) => Promise<boolean>; // Async for hashing
  logout: () => void;
  changePassword: (newPassword: string, currentPassword?: string) => Promise<{ success: boolean; error?: string }>;
  addUser: (user: User) => Promise<void>; // Async for hashing
  updateUser: (user: User) => Promise<void>; // Async for hashing
  deleteUser: (id: string) => void;

  // Logs
  auditLogs: AuditLog[];

  // Content
  navLinks: NavLink[];
  updateNavLinks: (links: NavLink[]) => void;

  gridItems: GridItem[];
  updateGridItems: (items: GridItem[]) => void;

  newsArticles: NewsArticle[];
  addNews: (news: NewsArticle) => void;
  updateNews: (news: NewsArticle) => void;
  updateAllNews: (news: NewsArticle[]) => void;
  deleteNews: (id: string) => void;

  // Resources
  resources: Resource[];
  addResource: (resource: Omit<Resource, 'id' | 'createdAt'>) => Promise<void>;
  updateResource: (id: string, resource: Partial<Resource>) => Promise<void>;
  deleteResource: (id: string) => Promise<void>;

  sliderImages: string[];
  updateSliderImages: (images: string[]) => void;

  resetToDefaults: () => void;
}