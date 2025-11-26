import React from 'react';
import { useData } from '../contexts/DataContext';

const AboutSection: React.FC = () => {
  const { settings } = useData();

  return (
    <section id="about" className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1">
            <h2 className="text-3xl font-bold text-green-800 tracking-tight sm:text-4xl mb-6">เกี่ยวกับงานแผนงานและสารสนเทศ</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              งานแผนงานและสารสนเทศ โรงพยาบาลสารภี มีภารกิจหลักในการวางแผนยุทธศาสตร์ พัฒนาระบบเทคโนโลยีสารสนเทศ และบริหารจัดการข้อมูลของโรงพยาบาลให้มีประสิทธิภาพสูงสุด
            </p>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              เรามุ่งมั่นที่จะนำเทคโนโลยีที่ทันสมัยมาประยุกต์ใช้เพื่อสนับสนุนการให้บริการทางการแพทย์ที่เป็นเลิศ เพิ่มความสะดวกและความปลอดภัยให้กับผู้ป่วยและบุคลากร
            </p>
            <ul className="space-y-3">
              <li className="flex items-start">
                <svg className="flex-shrink-0 h-6 w-6 text-green-600 mr-3 mt-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6-4a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-gray-700">วางแผนและพัฒนาระบบสารสนเทศ</span>
              </li>
              <li className="flex items-start">
                <svg className="flex-shrink-0 h-6 w-6 text-green-600 mr-3 mt-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6-4a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-gray-700">ดูแลและบำรุงรักษาระบบเครือข่ายและคอมพิวเตอร์</span>
              </li>
              <li className="flex items-start">
                <svg className="flex-shrink-0 h-6 w-6 text-green-600 mr-3 mt-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6-4a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-gray-700">จัดการฐานข้อมูลและวิเคราะห์ข้อมูลสถิติ</span>
              </li>
              <li className="flex items-start">
                <svg className="flex-shrink-0 h-6 w-6 text-green-600 mr-3 mt-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6-4a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-gray-700">ส่งเสริมความรู้ด้านความปลอดภัยทางไซเบอร์</span>
              </li>
            </ul>
          </div>
          <div className="order-1 md:order-2 rounded-lg shadow-2xl overflow-hidden">
            <img
              loading="lazy"
              src={settings?.aboutImage || "https://picsum.photos/seed/aboutus/800/600"}
              alt="ทีมงานแผนงานและสารสนเทศ"
              className="w-full h-auto object-cover transition-transform duration-500 ease-in-out hover:scale-105"
              width="800"
              height="600"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;