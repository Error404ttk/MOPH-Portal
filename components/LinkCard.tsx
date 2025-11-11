import React from 'react';
import { LinkItem } from '../types';
import Icon from './Icon';
import { ExternalLink, QrCode } from 'lucide-react';
import { motion } from 'framer-motion';

interface LinkCardProps {
  item: LinkItem;
  onQrClick: (url: string, title: string) => void;
}

const LinkCard: React.FC<LinkCardProps> = ({ item, onQrClick }) => {
  const handleQrClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onQrClick(item.url, item.name);
  };

  return (
    <motion.a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="group relative flex flex-col p-6 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-100 hover:border-moph-500/30 overflow-hidden"
    >
      {/* Decorative background gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-moph-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative flex items-start justify-between mb-4">
        <div className="p-3 bg-moph-50 text-moph-600 rounded-xl group-hover:bg-moph-500 group-hover:text-white transition-colors duration-300">
          <Icon name={item.icon} size={28} strokeWidth={1.5} />
        </div>
        
        {/* Action Icons Area */}
        <div className="flex items-center gap-1 -mt-1 -mr-1">
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleQrClick}
                className="p-2 text-gray-300 hover:text-moph-600 hover:bg-moph-50 rounded-full transition-colors duration-200 relative z-10"
                title="QR Code"
            >
                <QrCode size={18} />
            </motion.button>
            <div className="p-2 text-gray-300 group-hover:text-moph-400 transition-colors duration-300">
                <ExternalLink size={18} />
            </div>
        </div>
      </div>

      <div className="relative flex-1 flex flex-col">
        <h3 className="text-lg font-semibold text-gray-800 group-hover:text-moph-700 transition-colors duration-300 line-clamp-2 leading-tight">
          {item.name}
        </h3>
        {item.description && (
          <p className="mt-2 text-sm text-gray-500 line-clamp-2 group-hover:text-gray-600">
            {item.description}
          </p>
        )}
      </div>
    </motion.a>
  );
};

export default LinkCard;