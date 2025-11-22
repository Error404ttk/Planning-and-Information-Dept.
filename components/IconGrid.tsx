import React from 'react';
import { useData } from '../contexts/DataContext';
import { ICONS } from '../constants';

const IconGrid: React.FC = () => {
  const { gridItems } = useData();

  return (
    <section id="products" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8 text-center">
          {gridItems.map((item, index) => {
             const IconComponent = ICONS[item.iconName];
             return (
              <a
                key={item.id || index}
                href={item.href}
                className="group relative flex flex-col items-center p-6 rounded-xl transition-all duration-300 hover:-translate-y-2 hover:bg-white hover:shadow-lg border border-transparent hover:border-green-100"
              >
                {/* Tooltip */}
                {item.description && (
                  <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-48 px-3 py-2 bg-gray-900/95 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-20 transform translate-y-2 group-hover:translate-y-0 text-center backdrop-blur-sm">
                    {item.description}
                    {/* Tooltip Arrow */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-gray-900/95"></div>
                  </div>
                )}

                <div className="flex items-center justify-center w-32 h-32 sm:w-36 sm:h-36 bg-white rounded-full shadow-md border-4 border-white group-hover:border-green-200 group-hover:bg-green-50 group-hover:shadow-xl transition-all duration-300 relative z-10">
                  <span className="text-green-600 group-hover:text-green-700 transition-colors duration-300">
                    {IconComponent ? (
                       <IconComponent className="w-14 h-14 sm:w-16 sm:h-16" />
                    ) : (
                       <span className="text-xs">No Icon</span>
                    )}
                  </span>
                </div>
                <h3 className="mt-5 text-sm sm:text-base font-semibold text-gray-700 group-hover:text-green-800 transition-colors duration-300 relative z-10">
                  {item.label}
                </h3>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default IconGrid;