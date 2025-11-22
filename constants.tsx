import React from 'react';
import type { NavLink, GridItem, NewsArticle, User, AuditLog } from './types';

// SVG Icons Map
export const ICONS: Record<string, React.FC<{ className?: string }>> = {
  ShieldCheck: ({ className = "w-16 h-16" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.944a12.02 12.02 0 009 2.056c4.522 0 8.34-2.262 9.618-5.944a11.955 11.955 0 00-2.002-11.018z" />
    </svg>
  ),
  LockClosed: ({ className = "w-16 h-16" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ),
  Database: ({ className = "w-16 h-16" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
    </svg>
  ),
  ChartBar: ({ className = "w-16 h-16" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  Annotation: ({ className = "w-16 h-16" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
    </svg>
  ),
  DesktopComputer: ({ className = "w-16 h-16" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  Document: ({ className = "w-16 h-16" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  User: ({ className = "w-16 h-16" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )
};

// Initial Users
// SHA-256 hash for "password" is: 5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8
export const INITIAL_USERS: User[] = [
  {
    id: '1',
    username: 'admin',
    password: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    name: 'Super Administrator',
    role: 'SUPER_ADMIN'
  },
  {
    id: '2',
    username: 'staff',
    password: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    name: 'Content Staff',
    role: 'ADMIN'
  }
];

export const INITIAL_LOGS: AuditLog[] = [
  {
    id: '1',
    action: 'RESET',
    entity: 'SYSTEM',
    details: 'System initialized',
    performedBy: 'System',
    timestamp: new Date().toLocaleString('th-TH')
  }
];

// Navigation Links
export const INITIAL_NAV_LINKS: NavLink[] = [
  { id: '1', name: 'หน้าแรก', href: '#home' },
  { id: '2', name: 'เกี่ยวกับงานแผนฯ', href: '#about' },
  {
    id: '3',
    name: 'Product ICT',
    href: '#products',
    submenu: [
      { id: '3-1', name: 'การจัดหาระบบคอมพิวเตอร์ สธ.', href: '#' },
    ]
  },
  { id: '4', name: 'Knowledge', href: '#' },
  {
    id: '5',
    name: 'Download',
    href: '#',
    submenu: [
      { id: '5-1', name: 'แบบฟอร์มต่างๆ', href: '#' },
      { id: '5-2', name: 'คู่มือ', href: '#' },
      { id: '5-3', name: 'แผน/ระเบียบการดำเนินงานด้าน IT', href: '#' },
      { id: '5-4', name: 'โลโก้โรงพยาบาล', href: '#' },
      { id: '5-5', name: 'Templates for PowerPoint', href: '#' },
      { id: '5-6', name: 'พ.ร.บ ว่าด้วยการกระทำความผิดเกี่ยวกับคอมพิวเตอร์ (ฉบับที่ 2) พ.ศ. 2560', href: '#' },
      { id: '5-7', name: 'พ.ร.บ. การรักษาความมั่นคงปลอดภัยไซเบอร์ พ.ศ. 2562', href: '#' },
      { id: '5-8', name: 'พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562', href: '#' },
      { id: '5-9', name: 'แนวปฏิบัติเกี่ยวกับการคุ้มครองข้อมูลส่วนบุคคล', href: '#' },
    ]
  },
  { id: '6', name: 'IT Awareness', href: '#awareness' },
];

// Icon Grid Items
export const INITIAL_GRID_ITEMS: GridItem[] = [
  { id: '1', iconName: 'LockClosed', label: 'PDPA', description: 'ศูนย์รวมข้อมูลและแนวปฏิบัติ พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล', href: '#' },
  { id: '2', iconName: 'ShieldCheck', label: 'Cyber Security', description: 'นโยบาย แนวปฏิบัติ และข่าวสารความมั่นคงปลอดภัยไซเบอร์', href: '#' },
  { id: '3', iconName: 'Database', label: 'มาตรฐานข้อมูล', description: 'มาตรฐานข้อมูลสุขภาพ (43 แฟ้ม) และรหัสมาตรฐานต่างๆ', href: '#' },
  { id: '4', iconName: 'ChartBar', label: 'Dashboard Cyber', description: 'ติดตามสถานะความปลอดภัยและภัยคุกคามทางไซเบอร์', href: '#' },
  { id: '5', iconName: 'Annotation', label: 'ร้องเรียน/คำแนะนำ', description: 'ระบบรับเรื่องร้องเรียนและข้อเสนอแนะด้านเทคโนโลยีสารสนเทศ', href: '#' },
  { id: '6', iconName: 'DesktopComputer', label: 'การจัดหาระบบคอมฯ', description: 'เกณฑ์ราคากลางและคุณลักษณะพื้นฐานคอมพิวเตอร์ภาครัฐ', href: '#' },
];

// Sample News Articles
export const INITIAL_NEWS_ARTICLES: NewsArticle[] = [
  {
    id: '1',
    imageUrl: 'https://picsum.photos/seed/news1/600/400',
    title: 'ประกาศนโยบายความปลอดภัย Cyber Security',
    excerpt: 'โรงพยาบาลสารภีมุ่งมั่นพัฒนาระบบสารสนเทศให้มีความปลอดภัยสูงสุด เพื่อคุ้มครองข้อมูลผู้ป่วยและข้อมูลสำคัญของโรงพยาบาล',
    date: '25 ก.ค. 2567',
    href: '#'
  },
  {
    id: '2',
    imageUrl: 'https://picsum.photos/seed/news2/600/400',
    title: 'อบรมการใช้งานระบบ Hospital OS รุ่นใหม่',
    excerpt: 'งานแผนงานและสารสนเทศจัดอบรมการใช้งานระบบสารสนเทศโรงพยาบาล (Hospital OS) รุ่นใหม่ให้กับบุคลากรทุกแผนก',
    date: '18 ก.ค. 2567',
    href: '#'
  },
  {
    id: '3',
    imageUrl: 'https://picsum.photos/seed/news3/600/400',
    title: 'การปรับปรุงเครือข่ายไร้สายทั่วทั้งโรงพยาบาล',
    excerpt: 'เพื่อเพิ่มประสิทธิภาพการให้บริการ โรงพยาบาลได้ดำเนินการปรับปรุงและขยายสัญญาณ Wi-Fi ให้ครอบคลุมทุกพื้นที่',
    date: '5 ก.ค. 2567',
    href: '#'
  }
];

// Slider Images
export const INITIAL_SLIDER_IMAGES: string[] = [
  'https://picsum.photos/seed/slide1/1600/500',
  'https://picsum.photos/seed/slide2/1600/500',
  'https://picsum.photos/seed/slide3/1600/500',
];