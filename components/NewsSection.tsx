import React from 'react';
import { useData } from '../contexts/DataContext';

const NewsSection: React.FC = () => {
  const { newsArticles } = useData();

  return (
    <section id="awareness" className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-green-800 tracking-tight sm:text-4xl">ข่าวประชาสัมพันธ์</h2>
          <p className="mt-4 text-lg text-gray-600">
            ติดตามข่าวสารและกิจกรรมล่าสุดจากงานแผนงานและสารสนเทศ
          </p>
        </div>
        <div className="grid gap-8 lg:grid-cols-3 md:grid-cols-2">
          {newsArticles.map((article, index) => (
            <a href={article.href} key={article.id || index} className="group block bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 hover:shadow-2xl h-full flex flex-col">
              <div className="overflow-hidden aspect-[3/2] bg-gray-100">
                 <img 
                   loading="lazy"
                   className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                   src={article.imageUrl} 
                   alt={article.title}
                   width="600"
                   height="400"
                  />
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <p className="text-sm text-gray-500 mb-2">{article.date}</p>
                <h3 className="text-xl font-semibold text-gray-800 mb-3 group-hover:text-green-700 transition-colors">{article.title}</h3>
                <p className="text-gray-600 leading-relaxed flex-1">{article.excerpt}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewsSection;