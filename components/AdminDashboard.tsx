import React, { useState, useEffect } from 'react';
import { LinkCategory, LinkItem, IconName, FooterData, User, About } from '../types';
import { Trash2, Plus, GripVertical, Save, Type, Check, LayoutList, Users, RefreshCw, Shield, Key } from 'lucide-react';
import Icon from './Icon';
import IconPickerModal from './IconPickerModal';
import { useToast } from './ToastSystem';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmationModal from './ConfirmationModal';
import { produce } from 'immer';

interface AdminDashboardProps {
  initialData: LinkCategory[];
  initialFooterData: FooterData;
  initialUsers: User[];
  initialAbouts: About[];
  authToken: string;
  onExit: () => void;
  onDataSaved: () => Promise<void>;
}

type AdminTab = 'content' | 'users';

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
    initialData, initialFooterData, initialUsers, initialAbouts, authToken, onExit, onDataSaved
}) => {
  const [data, setData] = useState<LinkCategory[]>([]);
  const [footerData, setFooterData] = useState<FooterData>({ copyrightText: '', descriptionText: ''});
  const [users, setUsers] = useState<User[]>([]);
  const [abouts, setAbouts] = useState<About[]>([]);

  useEffect(() => {
    // Deep copy initial props into state to avoid direct mutation
    setData(JSON.parse(JSON.stringify(initialData)));
    setFooterData(JSON.parse(JSON.stringify(initialFooterData)));
    // For users, we don't expect passwords from the server, so we map and add a placeholder
    setUsers(initialUsers.map(u => ({...u, password: ''})));
    setAbouts(JSON.parse(JSON.stringify(initialAbouts || [])));
  }, [initialData, initialFooterData, initialUsers, initialAbouts]);

  // Debug logging
  useEffect(() => {
    console.log('AdminDashboard - abouts:', abouts, 'length:', abouts.length);
  }, [abouts]);


  const [activeTab, setActiveTab] = useState<AdminTab>('content');
  const [pickingIconFor, setPickingIconFor] = useState<{ catIndex: number, linkIndex: number } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmTitle, setConfirmTitle] = useState('');
  const { addToast } = useToast();

  // --- Content Tab Handlers ---
  const addAbout = () => {
    const newAbout: About = { id: -Date.now(), title: 'หัวข้อใหม่', content: '' };
    setAbouts(produce(draft => { draft.push(newAbout); }));
  };

  const updateAbout = (index: number, field: keyof About, value: string) => {
    setAbouts(produce(draft => { (draft[index] as any)[field] = value; }));
  };

  const deleteAbout = (index: number) => {
    setConfirmTitle('ยืนยันการลบ');
    setConfirmMessage(`คุณต้องการลบ "${abouts[index].title}" ใช่หรือไม่?`);
    setConfirmAction(() => {
      setAbouts(produce(draft => { draft.splice(index, 1); }));
      addToast({ title: 'ลบข้อมูลแล้ว', description: 'การเปลี่ยนแปลงจะถูกบันทึกเมื่อคุณกด "บันทึกและออก"', type: 'info' });
    });
    setShowConfirmModal(true);
  };
  const addCategory = () => {
    const newCategory: LinkCategory = {
      // Use a temporary negative ID for new items for React keys, server will assign real ID
      id: -Date.now(), 
      title: 'หมวดหมู่ใหม่', 
      description: '', 
      links: []
    };
    setData(produce(draft => {
      draft.push(newCategory);
    }));
  };

  const updateCategory = (index: number, field: keyof LinkCategory, value: string) => {
    setData(produce(draft => {
        (draft[index] as any)[field] = value;
    }));
  };

  const deleteCategory = (index: number) => {
    setData(produce(draft => {
      draft.splice(index, 1);
    }));
    addToast({ title: 'ลบหมวดหมู่แล้ว', description: 'การเปลี่ยนแปลงจะถูกบันทึกเมื่อคุณกด "บันทึกและออก"', type: 'info' });
  };

  const addLink = (categoryIndex: number) => {
    const newLink: LinkItem = {
      name: 'ลิ้งค์ใหม่',
      url: '#',
      icon: 'Link' as IconName,
      description: ''
    };
    setData(produce(draft => {
      draft[categoryIndex].links.push(newLink);
    }));
  };

  const updateLink = (categoryIndex: number, linkIndex: number, field: keyof LinkItem, value: string) => {
    setData(produce(draft => {
        (draft[categoryIndex].links[linkIndex] as any)[field] = value;
    }));
  };

  const handleIconSelect = (iconName: IconName) => {
    if (pickingIconFor) {
      const { catIndex, linkIndex } = pickingIconFor;
      updateLink(catIndex, linkIndex, 'icon', iconName);
      setPickingIconFor(null);
    }
  };

  const deleteLink = (categoryIndex: number, linkIndex: number) => {
    setData(produce(draft => {
      draft[categoryIndex].links.splice(linkIndex, 1);
    }));
     addToast({ title: 'ลบลิงก์แล้ว', description: 'การเปลี่ยนแปลงจะถูกบันทึกเมื่อคุณกด "บันทึกและออก"', type: 'info' });
  };

  // --- User Tab Handlers ---
  const addUser = () => {
      const newUser: User = {
          id: `new-${Date.now()}`,
          username: 'new_user',
          password: 'password', // Default password for new user
          name: 'ผู้ใช้งานใหม่',
          role: 'editor',
          mustChangePassword: true
      };
      setUsers(produce(draft => {
          draft.push(newUser);
      }));
      addToast({ title: 'เพิ่มผู้ใช้งานแล้ว', description: 'กรุณาตั้งค่าและบันทึก', type: 'info' });
  };

  const updateUser = (id: string, field: keyof User, value: string | boolean) => {
      setUsers(produce(draft => {
          const user = draft.find(u => u.id === id);
          if(user) {
            (user as any)[field] = value;
          }
      }));
  };
  
  const deleteUser = (id: string) => {
      if (users.length <= 1) {
          addToast({ title: 'ไม่สามารถลบได้', description: 'ต้องมีผู้ดูแลระบบอย่างน้อย 1 คน', type: 'error' });
          return;
      }
      setUsers(produce(draft => {
          const index = draft.findIndex(u => u.id === id);
          if (index !== -1) draft.splice(index, 1);
      }));
      addToast({ title: 'ลบผู้ใช้งานแล้ว', description: 'การเปลี่ยนแปลงจะถูกบันทึกเมื่อคุณกด "บันทึกและออก"', type: 'info' });
  };


  const handleSaveAndExitClick = () => {
    setConfirmTitle('ยืนยันการบันทึก');
    setConfirmMessage('คุณแน่ใจหรือไม่ว่าต้องการบันทึกการเปลี่ยนแปลงเหล่านี้?');
    setConfirmAction(() => handleConfirmSave);
    setShowConfirmModal(true);
  };

  const handleConfirmSave = async () => {
    setShowConfirmModal(false);
    setIsSaving(true);
    
    // Prepare users data, filtering out empty passwords unless it's a new user
    const usersPayload = users.map(user => {
        const payload: Partial<User> = {...user};
        if (!user.password && !user.id.toString().startsWith('new-')) {
            // Don't send password field if it's empty for existing user
            delete payload.password;
        }
        return payload;
    });

    try {
        const response = await fetch('/api/data', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ data, footerData, users: usersPayload, abouts })
        });

        if (!response.ok) {
            const errorResult = await response.json();
            throw new Error(errorResult.message || 'Failed to save data');
        }
        
        addToast({ title: 'บันทึกข้อมูลสำเร็จ', type: 'success' });
        
        await onDataSaved(); // Refresh data in App.tsx

        setTimeout(() => {
            onExit();
        }, 800);

    } catch (error: any) {
        console.error('Save error:', error);
        addToast({ title: 'บันทึกข้อมูลไม่สำเร็จ', description: error.message, type: 'error' });
        setIsSaving(false); // Re-enable button if save failed
    }
  };

  // Tab Button Component
  const TabButton = ({ id, icon: IconComp, label }: { id: AdminTab, icon: React.ElementType, label: string }) => (
      <button
          onClick={() => setActiveTab(id)}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all ${
              activeTab === id 
              ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' 
              : 'bg-white text-gray-600 hover:bg-orange-50 hover:text-orange-600'
          }`}
      >
          <IconComp size={18} />
          {label}
      </button>
  );

  return (
    <div className="space-y-8">
      <IconPickerModal
        isOpen={!!pickingIconFor}
        onClose={() => setPickingIconFor(null)}
        onSelect={handleIconSelect}
      />

      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={() => {
          if (confirmAction) confirmAction();
          setShowConfirmModal(false);
        }}
        title={confirmTitle}
        message={confirmMessage}
      />

      {/* Admin Header Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-center sticky top-24 z-40 gap-4 border border-gray-100">
        <div className="flex items-center gap-2 p-1 bg-gray-100/80 rounded-xl w-full md:w-auto overflow-x-auto">
            <TabButton id="content" icon={LayoutList} label="เนื้อหาหน้าเว็บ" />
            <TabButton id="users" icon={Users} label="ผู้ใช้งาน" />
        </div>
        
        <motion.button 
            onClick={handleSaveAndExitClick}
            disabled={isSaving}
            animate={{
                backgroundColor: isSaving ? '#22c55e' : '#f97316',
            }}
            className="px-6 py-3 rounded-xl text-white font-medium shadow-sm flex items-center justify-center gap-2 min-w-[200px] transition-colors w-full md:w-auto"
        >
            <AnimatePresence mode="wait" initial={false}>
                {isSaving ? (
                    <motion.div
                        key="saved"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-2"
                    >
                        <Check size={20} />
                        <span>บันทึกเรียบร้อย</span>
                    </motion.div>
                ) : (
                    <motion.div
                        key="save"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-2"
                    >
                        <Save size={20} />
                        <span>บันทึกและออก</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.button>
      </div>

      {/* TABS CONTENT */}
      <AnimatePresence mode="wait">
        {activeTab === 'content' && (
            <motion.div 
                key="content-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
            >
                {/* ABOUT SECTION - ย้ายมาไว้ด้านบน */}
                <motion.div 
                    className="bg-white rounded-2xl shadow-sm border-2 border-orange-200 overflow-hidden"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                >
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6">
                        <h3 className="text-xl font-bold text-black flex items-center gap-3">
                            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                                <Type size={24} className="text-black" />
                            </div>
                            เกี่ยวกับกระทรวงสาธารณสุข
                        </h3>
                        <p className="text-black mt-2 ml-14 font-medium">จัดการข้อมูลเกี่ยวกับกระทรวงสาธารณสุขที่แสดงในหน้าแรก</p>
                    </div>
                    <div className="p-6 space-y-4">
                        {abouts.map((about, idx) => (
                            <div key={about.id} className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="flex items-center justify-center w-7 h-7 bg-orange-100 text-orange-600 rounded-full text-sm font-semibold">
                                            {idx + 1}
                                        </span>
                                        <span className="text-sm font-medium text-black">หัวข้อที่ {idx + 1}</span>
                                    </div>
                                    <button 
                                        onClick={() => deleteAbout(idx)} 
                                        className="text-gray-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition-all duration-200 flex items-center gap-1 text-sm" 
                                        title="ลบหัวข้อนี้"
                                    >
                                        <Trash2 size={16} />
                                        <span className="hidden sm:inline">ลบ</span>
                                    </button>
                                </div>
                                <div className="p-4 space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">หัวข้อ</label>
                                        <input
                                            type="text"
                                            value={about.title}
                                            onChange={(e) => updateAbout(idx, 'title', e.target.value)}
                                            className="w-full font-semibold text-gray-800 bg-white border border-gray-300 rounded-lg px-3 py-2 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-colors"
                                            placeholder="กรอกหัวข้อ..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">เนื้อหา</label>
                                        <textarea
                                            value={about.content}
                                            onChange={(e) => updateAbout(idx, 'content', e.target.value)}
                                            className="w-full text-gray-700 bg-white border border-gray-300 rounded-lg px-3 py-2 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none min-h-[120px] resize-y transition-colors"
                                            placeholder="กรอกรายละเอียดเนื้อหา..."
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button 
                            onClick={addAbout} 
                            className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-orange-400 hover:text-orange-600 hover:bg-orange-50 transition-all duration-200 flex items-center justify-center gap-2 font-medium group"
                        >
                            <Plus size={20} className="group-hover:scale-110 transition-transform" />
                            <span>เพิ่มหัวข้อเกี่ยวกับกระทรวงสาธารณสุข</span>
                        </button>
                    </div>
                </motion.div>

                {/* CATEGORIES SECTION */}
                {data.map((category, catIndex) => (
                    <motion.div 
                        key={category.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: catIndex * 0.05 }}
                        className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
                    >
                    {/* Category Header Editor */}
                    <div className="bg-gray-50 p-6 border-b border-gray-200 flex items-start gap-4">
                        <div className="mt-2 text-gray-400 cursor-move">
                        <GripVertical size={20} />
                        </div>
                        <div className="flex-1 space-y-3">
                        <input
                            type="text"
                            value={category.title}
                            onChange={(e) => updateCategory(catIndex, 'title', e.target.value)}
                            className="w-full text-xl font-bold text-gray-800 bg-transparent border-b border-dashed border-gray-300 focus:border-orange-500 focus:outline-none py-1"
                            placeholder="ชื่อหมวดหมู่"
                        />
                        <input
                            type="text"
                            value={category.description || ''}
                            onChange={(e) => updateCategory(catIndex, 'description', e.target.value)}
                            className="w-full text-gray-600 bg-transparent border-b border-dashed border-gray-300 focus:border-orange-500 focus:outline-none py-1"
                            placeholder="คำอธิบายหมวดหมู่ (ไม่บังคับ)"
                        />
                        </div>
                        <button
                        onClick={() => deleteCategory(catIndex)}
                        className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors"
                        title="ลบหมวดหมู่"
                        >
                        <Trash2 size={20} />
                        </button>
                    </div>

                    {/* Links Editor */}
                    <div className="p-6 bg-gray-100/50 space-y-4">
                        <AnimatePresence>
                            {category.links.map((link, linkIndex) => (
                            <motion.div 
                                key={`${category.id}-${linkIndex}`}
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                className="flex items-center gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm overflow-hidden"
                            >
                                <div className="p-3 bg-gray-100 rounded-lg text-gray-500 shrink-0 hidden md:block">
                                    <Icon name={link.icon} size={24} />
                                </div>
                                
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-3">
                                    {/* Name & Icon Picker */}
                                    <div className="md:col-span-4 space-y-2">
                                        <input
                                            type="text"
                                            value={link.name}
                                            onChange={(e) => updateLink(catIndex, linkIndex, 'name', e.target.value)}
                                            className="w-full font-semibold text-gray-800 bg-white border border-gray-300 rounded-lg px-3 py-1.5 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
                                            placeholder="ชื่อลิ้งค์"
                                        />
                                        <div className="flex items-center gap-2">
                                            <label className="text-xs text-gray-500 shrink-0">Icon:</label>
                                            <button
                                                onClick={() => setPickingIconFor({ catIndex, linkIndex })}
                                                className="flex-1 flex items-center gap-2 text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded px-2 py-1 focus:border-orange-500 outline-none transition-colors text-left"
                                                title="คลิกเพื่อเปลี่ยนไอคอน"
                                            >
                                                <Icon name={link.icon} size={16} className="text-moph-600 shrink-0" />
                                                <span className="truncate font-mono text-xs">{link.icon}</span>
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {/* URL & Description */}
                                    <div className="md:col-span-8 space-y-2">
                                        <input
                                            type="text"
                                            value={link.url}
                                            onChange={(e) => updateLink(catIndex, linkIndex, 'url', e.target.value)}
                                            className="w-full text-sm text-blue-600 bg-white border border-gray-300 rounded-lg px-3 py-1.5 focus:border-orange-500 outline-none"
                                            placeholder="URL (https://...)"
                                        />
                                        <input
                                            type="text"
                                            value={link.description || ''}
                                            onChange={(e) => updateLink(catIndex, linkIndex, 'description', e.target.value)}
                                            className="w-full text-sm text-gray-500 bg-white border border-gray-300 rounded-lg px-3 py-1.5 focus:border-orange-500 outline-none"
                                            placeholder="คำอธิบายสั้นๆ"
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={() => deleteLink(catIndex, linkIndex)}
                                    className="text-gray-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-full transition-colors shrink-0"
                                    title="ลบลิ้งค์"
                                >
                                <Trash2 size={18} />
                                </button>
                            </motion.div>
                            ))}
                        </AnimatePresence>
                        
                        <motion.button
                        layout
                        onClick={() => addLink(catIndex)}
                        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-orange-500 hover:text-orange-500 hover:bg-orange-50 transition-all flex items-center justify-center gap-2 font-medium"
                        >
                        <Plus size={20} />
                        เพิ่มลิ้งค์ในหมวดหมู่นี้
                        </motion.button>
                    </div>
                    </motion.div>
                ))}

                <motion.button
                    layout
                    onClick={addCategory}
                    className="w-full py-4 bg-gray-800 hover:bg-gray-900 text-white rounded-2xl shadow-lg flex items-center justify-center gap-2 text-lg font-semibold transition-all"
                >
                    <Plus size={24} />
                    เพิ่มหมวดหมู่ใหม่
                </motion.button>

                {/* Footer Editor */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mt-12">
                    <div className="bg-gray-50 p-6 border-b border-gray-200">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-3">
                            <div className="p-2 bg-gray-200 text-gray-600 rounded-lg">
                                <Type size={20} />
                            </div>
                            ตั้งค่าส่วนท้าย (Footer)
                        </h3>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">ข้อความลิขสิทธิ์ (บรรทัดบน)</label>
                            <input
                                type="text"
                                value={footerData.copyrightText}
                                onChange={(e) => setFooterData({ ...footerData, copyrightText: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                                placeholder="© 2024 ..."
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">คำอธิบายเพิ่มเติม (บรรทัดล่าง)</label>
                            <input
                                type="text"
                                value={footerData.descriptionText}
                                onChange={(e) => setFooterData({ ...footerData, descriptionText: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                                placeholder="Dashboard for..."
                            />
                        </div>
                    </div>
                </div>
            </motion.div>
        )}

        {activeTab === 'users' && (
            <motion.div
                key="users-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
            >
                <div className="bg-gray-50 p-6 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-3">
                        <Shield className="text-moph-600" />
                        จัดการผู้ใช้งาน
                    </h3>
                    <button onClick={addUser} className="flex items-center gap-2 px-4 py-2 bg-moph-600 text-white rounded-lg hover:bg-moph-700 transition-colors text-sm font-medium">
                        <Plus size={16} /> เพิ่มผู้ใช้
                    </button>
                </div>
                <div className="p-6">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-100 text-gray-500 text-sm">
                                    <th className="px-4 py-3 font-medium">ชื่อผู้ใช้ (Username)</th>
                                    <th className="px-4 py-3 font-medium">ชื่อที่แสดง</th>
                                    <th className="px-4 py-3 font-medium">รหัสผ่านใหม่</th>
                                    <th className="px-4 py-3 font-medium">สิทธิ์</th>
                                    <th className="px-4 py-3 font-medium text-right">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {users.map(user => (
                                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-4 py-3">
                                            <input 
                                                type="text" 
                                                value={user.username} 
                                                onChange={(e) => updateUser(user.id, 'username', e.target.value)}
                                                className="bg-transparent border border-transparent hover:border-gray-300 focus:border-orange-500 rounded px-2 py-1 w-full outline-none"
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <input 
                                                type="text" 
                                                value={user.name} 
                                                onChange={(e) => updateUser(user.id, 'name', e.target.value)}
                                                className="bg-transparent border border-transparent hover:border-gray-300 focus:border-orange-500 rounded px-2 py-1 w-full outline-none"
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                             <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-1.5 w-fit">
                                                <Key size={14} className="text-gray-400" />
                                                <input 
                                                    type="password"
                                                    value={user.password} 
                                                    placeholder={user.id.toString().startsWith('new-') ? '' : 'ปล่อยว่างไว้ถ้าไม่เปลี่ยน'}
                                                    onChange={(e) => updateUser(user.id, 'password', e.target.value)}
                                                    className="bg-transparent border-none w-36 text-sm outline-none font-mono"
                                                />
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <select
                                                value={user.role}
                                                onChange={(e) => updateUser(user.id, 'role', e.target.value as 'admin'|'editor')}
                                                className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-sm outline-none focus:border-orange-500"
                                            >
                                                <option value="admin">Admin</option>
                                                <option value="editor">Editor</option>
                                            </select>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button 
                                                    onClick={() => deleteUser(user.id)}
                                                    className="text-gray-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-full transition-colors"
                                                    title="ลบผู้ใช้"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;