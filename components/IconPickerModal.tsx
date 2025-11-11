import React, { useState, useMemo, useEffect } from 'react';
import * as LucideIcons from 'lucide-react';
import { X, Search } from 'lucide-react';
import { IconName } from '../types';
import Icon from './Icon';

interface IconPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (iconName: IconName) => void;
}

const IconPickerModal: React.FC<IconPickerModalProps> = ({ isOpen, onClose, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  // Use a delayed search term to prevent lag while typing
  const [deferredSearchTerm, setDeferredSearchTerm] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
        setDeferredSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const iconList = useMemo(() => {
    // Filter out non-icon exports from lucide-react
    return Object.keys(LucideIcons)
      .filter(key => key !== 'createLucideIcon' && key !== 'default' && typeof LucideIcons[key as keyof typeof LucideIcons] !== 'function') as IconName[];
  }, []);

  const filteredIcons = useMemo(() => {
    if (!deferredSearchTerm) return iconList.slice(0, 100); // Initial load limit for performance
    
    const lowerSearch = deferredSearchTerm.toLowerCase().trim();
    return iconList
        .filter(name => name.toLowerCase().includes(lowerSearch))
        .slice(0, 100); // Limit results for performance
  }, [deferredSearchTerm, iconList]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[110] flex items-center justify-center p-4 md:p-8">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl h-[80vh] flex flex-col relative overflow-hidden">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-gray-100 flex items-center justify-between shrink-0">
            <h3 className="text-xl font-bold text-gray-800">เลือกไอคอน</h3>
            <button 
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
            >
                <X size={24} />
            </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-100 bg-gray-50 shrink-0">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="ค้นหาไอคอน... (เช่น user, file, chart)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-moph-500/50 focus:border-moph-500 transition-all"
                    autoFocus
                />
            </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50/50">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                {filteredIcons.map((iconName) => (
                    <button
                        key={iconName}
                        onClick={() => onSelect(iconName)}
                        className="flex flex-col items-center p-3 bg-white rounded-xl border border-gray-200 hover:border-moph-500 hover:shadow-md transition-all group aspect-square justify-center"
                        title={iconName}
                    >
                        <div className="text-gray-600 group-hover:text-moph-600 mb-2 transition-colors">
                             <Icon name={iconName} size={24} />
                        </div>
                        <span className="text-[10px] text-gray-500 group-hover:text-gray-900 truncate w-full text-center px-1">
                            {iconName}
                        </span>
                    </button>
                ))}
            </div>
            {filteredIcons.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <Search size={48} className="mb-4 opacity-20" />
                    <p>ไม่พบไอคอนที่ค้นหา</p>
                </div>
            )}
        </div>
        <div className="p-2 text-center text-xs text-gray-400 border-t border-gray-100 bg-white shrink-0">
            แสดงผลสูงสุด 100 รายการแรกเพื่อความรวดเร็ว
        </div>
      </div>
    </div>
  );
};

export default IconPickerModal;