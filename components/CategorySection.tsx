import React from 'react';
import { LinkCategory } from '../types';
import LinkCard from './LinkCard';
import { motion } from 'framer-motion';

interface CategorySectionProps {
  category: LinkCategory;
  onQrClick: (url: string, title: string) => void;
}

const CategorySection: React.FC<CategorySectionProps> = ({ category, onQrClick }) => {
  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="py-8"
    >
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <motion.div 
             initial={{ height: 0 }}
             animate={{ height: 32 }}
             transition={{ delay: 0.2, duration: 0.3 }}
             className="w-1.5 bg-moph-500 rounded-full" 
          />
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
            {category.title}
          </h2>
        </div>
        {category.description && (
          <p className="text-gray-500 ml-5 md:ml-6 text-lg">
            {category.description}
          </p>
        )}
      </div>
      
      <motion.div 
        layout
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        {category.links.map((link, index) => (
          <LinkCard 
            // Use a combination of name and url for a more unique key if possible, 
            // fallback to index only if absolutely necessary, but it can mess up Framer's layout animation.
            key={`${link.name}-${link.url}-${index}`} 
            item={link} 
            onQrClick={onQrClick} 
          />
        ))}
      </motion.div>
    </motion.section>
  );
};

export default CategorySection;