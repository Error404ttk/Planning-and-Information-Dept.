import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { NewsArticle } from '../types';

const NewsSection: React.FC = () => {
  const { newsArticles } = useData();
  const [selectedNews, setSelectedNews] = useState<NewsArticle | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const openNews = (article: NewsArticle) => {
    setSelectedNews(article);
    setCurrentImageIndex(0);
  };

  const closeNews = () => {
    setSelectedNews(null);
  };

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
            <div key={article.id || index} className="group block bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 hover:shadow-2xl h-full flex flex-col">
              <div className="overflow-hidden aspect-[3/2] bg-gray-100 cursor-pointer" onClick={() => openNews(article)}>
                {article.imageUrl ? (
                  <img
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    src={article.imageUrl}
                    alt={article.title}
                    width="600"
                    height="400"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <svg className="w-24 h-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <p className="text-sm text-gray-500 mb-2">{article.date}</p>
                <h3 className="text-xl font-semibold text-gray-800 mb-3 group-hover:text-green-700 transition-colors cursor-pointer" onClick={() => openNews(article)}>{article.title}</h3>
                <p className="text-gray-600 leading-relaxed flex-1 mb-4">{article.excerpt}</p>

                <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                  <button
                    onClick={() => openNews(article)}
                    className="text-green-600 font-medium hover:text-green-800 transition-colors flex items-center gap-1"
                  >
                    อ่านรายละเอียด
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  {article.externalLink && (
                    <a
                      href={article.externalLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 font-medium hover:text-blue-800 transition-colors flex items-center gap-1 text-sm"
                    >
                      ลิงก์ภายนอก
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* News Modal */}
      {selectedNews && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={closeNews}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto flex flex-col relative" onClick={e => e.stopPropagation()}>
            <button
              onClick={closeNews}
              className="absolute top-4 right-4 bg-gray-100 hover:bg-gray-200 text-gray-600 p-2 rounded-full transition-colors z-10"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="relative w-full bg-gray-100 overflow-hidden rounded-t-xl">
              {selectedNews.imageUrl ? (
                <img
                  src={selectedNews.imageUrl}
                  alt={selectedNews.title}
                  className="w-full h-auto"
                />
              ) : (
                <div className="w-full h-64 flex items-center justify-center text-gray-400 bg-gray-100">
                  <svg className="w-20 h-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>

            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {selectedNews.date}
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 leading-tight">
                {selectedNews.title}
              </h3>

              <div className="prose prose-green max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
                {selectedNews.content || selectedNews.excerpt}
              </div>

              {selectedNews.images && selectedNews.images.length > 0 && (
                <div className="mt-8 relative group">
                  <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={selectedNews.images[currentImageIndex]?.url}
                      alt={`Gallery ${currentImageIndex}`}
                      className="w-full h-full object-contain"
                    />

                    {selectedNews.images.length > 1 && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentImageIndex(prev => prev === 0 ? (selectedNews.images?.length || 1) - 1 : prev - 1);
                          }}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentImageIndex(prev => prev === (selectedNews.images?.length || 1) - 1 ? 0 : prev + 1);
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                          </svg>
                        </button>

                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                          {selectedNews.images.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={(e) => {
                                e.stopPropagation();
                                setCurrentImageIndex(idx);
                              }}
                              className={`w-2 h-2 rounded-full transition-colors ${idx === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {selectedNews.externalLink && (
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <a
                    href={selectedNews.externalLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
                  >
                    อ่านต่อที่เว็บไซต์ต้นทาง
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default NewsSection;