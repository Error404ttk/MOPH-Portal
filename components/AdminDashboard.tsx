import React, { useState } from 'react';
import { LinkCategory, LinkItem, IconName, FooterData, User, DatabaseConfig } from '../types';
import { Trash2, Plus, GripVertical, Save, Type, Check, LayoutList, Users, Database, Server, HardDriveDownload, RefreshCw, Shield, Key, FileDown, AlertTriangle } from 'lucide-react';
import Icon from './Icon';
import IconPickerModal from './IconPickerModal';
import { useToast } from './ToastSystem';
import { motion, AnimatePresence } from 'framer-motion';

interface AdminDashboardProps {
  data: LinkCategory[];
  setData: React.Dispatch<React.SetStateAction<LinkCategory[]>>;
  footerData: FooterData;
  setFooterData: React.Dispatch<React.SetStateAction<FooterData>>;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  dbConfig: DatabaseConfig;
  setDbConfig: React.Dispatch<React.SetStateAction<DatabaseConfig>>;
  onSave: () => Promise<boolean>;
  onExit: () => void;
}

type AdminTab = 'content' | 'users' | 'database';

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
    data, setData, footerData, setFooterData, users, setUsers, dbConfig, setDbConfig, onSave, onExit 
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('content');
  const [pickingIconFor, setPickingIconFor] = useState<{ catIndex: number, linkIndex: number } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { addToast } = useToast();

  // --- Content Tab Handlers ---
  const addCategory = () => {
    setData(prev => [...prev, { title: 'หมวดหมู่ใหม่', description: '', links: [] }]);
  };

  const updateCategory = (index: number, field: keyof LinkCategory, value: string) => {
    setData(prev => prev.map((cat, i) => i === index ? { ...cat, [field]: value } : cat));
  };

  const deleteCategory = (index: number) => {
    if (window.confirm('คุณแน่ใจหรือไม่ที่จะลบหมวดหมู่นี้?')) {
      setData(prev => prev.filter((_, i) => i !== index));
    }
  };

  const addLink = (categoryIndex: number) => {
    setData(prev => prev.map((cat, i) => {
        if (i === categoryIndex) {
            return {
                ...cat,
                links: [...cat.links, { name: 'ลิ้งค์ใหม่', url: '#', icon: 'Link' as IconName, description: '' }]
            };
        }
        return cat;
    }));
  };

  const updateLink = (categoryIndex: number, linkIndex: number, field: keyof LinkItem, value: string) => {
    setData(prev => prev.map((cat, i) => {
        if (i === categoryIndex) {
            const newLinks = cat.links.map((link, j) => j === linkIndex ? { ...link, [field]: value } : link);
            return { ...cat, links: newLinks };
        }
        return cat;
    }));
  };

  const handleIconSelect = (iconName: IconName) => {
    if (pickingIconFor) {
      const { catIndex, linkIndex } = pickingIconFor;
      setData(prev => prev.map((cat, i) => {
        if (i === catIndex) {
            const newLinks = cat.links.map((link, j) => j === linkIndex ? { ...link, icon: iconName } : link);
            return { ...cat, links: newLinks };
        }
        return cat;
      }));
      setPickingIconFor(null);
    }
  };

  const deleteLink = (categoryIndex: number, linkIndex: number) => {
    if (window.confirm('ต้องการลบลิ้งค์นี้?')) {
      setData(prev => prev.map((cat, i) => {
        if (i === categoryIndex) {
             return { ...cat, links: cat.links.filter((_, j) => j !== linkIndex) };
        }
        return cat;
      }));
    }
  };

  // --- User Tab Handlers ---
  const addUser = () => {
      const newUser: User = {
          id: Date.now().toString(),
          username: 'new_user',
          password: 'password',
          name: 'ผู้ใช้งานใหม่',
          role: 'editor',
          mustChangePassword: true
      };
      setUsers(prev => [...prev, newUser]);
      addToast({ title: 'เพิ่มผู้ใช้งานแล้ว', description: 'กรุณาแก้ไขรหัสผ่านทันที', type: 'info' });
  };

  const updateUser = (id: string, field: keyof User, value: string) => {
      setUsers(prev => prev.map(u => u.id === id ? { ...u, [field]: value } : u));
  };

  const resetPassword = (id: string) => {
      if (window.confirm('รีเซ็ตรหัสผ่านของผู้ใช้นี้เป็น "temp1234" ใช่หรือไม่?')) {
          setUsers(prev => prev.map(u => u.id === id ? { ...u, password: 'temp1234', mustChangePassword: true } : u));
          addToast({ title: 'รีเซ็ตรหัสผ่านเรียบร้อย', description: 'ผู้ใช้จะต้องเปลี่ยนรหัสผ่านเมื่อเข้าสู่ระบบครั้งถัดไป', type: 'success' });
      }
  };

  const deleteUser = (id: string) => {
      if (users.length <= 1) {
          addToast({ title: 'ไม่สามารถลบได้', description: 'ต้องมีผู้ดูแลระบบอย่างน้อย 1 คน', type: 'error' });
          return;
      }
      if (window.confirm('ยืนยันการลบผู้ใช้งานนี้?')) {
          setUsers(prev => prev.filter(u => u.id !== id));
          addToast({ title: 'ลบผู้ใช้งานเรียบร้อย', type: 'success' });
      }
  };

  // --- DB Tab Handlers ---
  const handleExportSQL = () => {
    const dbName = dbConfig.database || 'moph_portal_db';
    let sql = `-- MOPH Portal Database Export\n-- Generated: ${new Date().toLocaleString('th-TH')}\n\n`;
    sql += `SET NAMES utf8mb4;\nSET FOREIGN_KEY_CHECKS = 0;\n\n`;
    sql += `-- Create Database\nCREATE DATABASE IF NOT EXISTS \`${dbName}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\nUSE \`${dbName}\`;\n\n`;

    // Users table
    // Fix: Added closing backtick for `password` column
    sql += `-- Table structure for users\nDROP TABLE IF EXISTS \`users\`;\nCREATE TABLE \`users\` (\n  \`id\` varchar(50) NOT NULL,\n  \`username\` varchar(50) NOT NULL,\n  \`password\` varchar(255) NOT NULL,\n  \`name\` varchar(100) DEFAULT NULL,\n  \`role\` varchar(20) DEFAULT 'editor',\n  PRIMARY KEY (\`id\`),\n  UNIQUE KEY \`username\` (\`username\`)\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n\n`;
    
    sql += `-- Dumping data for table users\nLOCK TABLES \`users\` WRITE;\n`;
    if (users.length > 0) {
        sql += `INSERT INTO \`users\` VALUES \n`;
        sql += users.map(u => `('${u.id}', '${u.username.replace(/'/g, "\\'")}', '${u.password.replace(/'/g, "\\'")}', '${u.name.replace(/'/g, "\\'")}', '${u.role}')`).join(',\n') + ';\n';
    }
    sql += `UNLOCK TABLES;\n\n`;

    // Categories table
    sql += `-- Table structure for categories\nDROP TABLE IF EXISTS \`categories\`;\nCREATE TABLE \`categories\` (\n  \`id\` int(11) NOT NULL AUTO_INCREMENT,\n  \`title\` varchar(255) NOT NULL,\n  \`description\` text,\n  \`sort_order\` int(11) DEFAULT '0',\n  PRIMARY KEY (\`id\`)\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n\n`;

    // Links table
    sql += `-- Table structure for links\nDROP TABLE IF EXISTS \`links\`;\nCREATE TABLE \`links\` (\n  \`id\` int(11) NOT NULL AUTO_INCREMENT,\n  \`category_id\` int(11) NOT NULL,\n  \`name\` varchar(255) NOT NULL,\n  \`url\` text NOT NULL,\n  \`icon\` varchar(50) DEFAULT NULL,\n  \`description\` text,\n  \`sort_order\` int(11) DEFAULT '0',\n  PRIMARY KEY (\`id\`),\n  KEY \`category_id\` (\`category_id\`),\n  CONSTRAINT \`links_ibfk_1\` FOREIGN KEY (\`category_id\`)\n  REFERENCES \`categories\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n\n`;

    // Data for Categories & Links
    if (data.length > 0) {
        sql += `-- Dumping data for table categories\nLOCK TABLES \`categories\` WRITE;\nINSERT INTO \`categories\` VALUES \n`;
        sql += data.map((cat, i) => `(${i + 1}, '${cat.title.replace(/'/g, "\\'")}', '${(cat.description || '').replace(/'/g, "\\'")}', ${i})`).join(',\n') + ';\nUNLOCK TABLES;\n\n';

        const allLinks = data.flatMap((cat, catIndex) => 
            cat.links.map((link, linkIndex) => ({ ...link, category_id: catIndex + 1, sort_order: linkIndex }))
        );

        if (allLinks.length > 0) {
             sql += `-- Dumping data for table links\nLOCK TABLES \`links\` WRITE;\nINSERT INTO \`links\` (\`category_id\`, \`name\`, \`url\`, \`icon\`, \`description\`, \`sort_order\`) VALUES \n`;
             sql += allLinks.map(link => `(${link.category_id}, '${link.name.replace(/'/g, "\\'")}', '${link.url.replace(/'/g, "\\'")}', '${link.icon}', '${(link.description || '').replace(/'/g, "\\'")}', ${link.sort_order})`).join(',\n') + ';\nUNLOCK TABLES;\n';
        }
    }

    sql += `\nSET FOREIGN_KEY_CHECKS = 1;\n`;

    // Download file
    const blob = new Blob([sql], { type: 'application/sql' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `moph_portal_db_backup_${new Date().toISOString().slice(0,10)}.sql`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    addToast({
        title: 'ดาวน์โหลดไฟล์ SQL สำเร็จ',
        description: 'นำไฟล์นี้ไป Import ใน phpMyAdmin หรือ MySQL Workbench ได้เลย',
        type: 'success'
    });
  };

  const handleSaveAndExit = async () => {
    setIsSaving(true);
    const success = await onSave();
    if (success) {
        setTimeout(() => {
            onExit();
        }, 800);
    } else {
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

      {/* Admin Header Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-center sticky top-24 z-40 gap-4 border border-gray-100">
        <div className="flex items-center gap-2 p-1 bg-gray-100/80 rounded-xl w-full md:w-auto overflow-x-auto">
            <TabButton id="content" icon={LayoutList} label="เนื้อหาหน้าเว็บ" />
            <TabButton id="users" icon={Users} label="ผู้ใช้งาน" />
            <TabButton id="database" icon={Database} label="ฐานข้อมูล" />
        </div>
        
        <motion.button 
            onClick={handleSaveAndExit}
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
                {data.map((category, catIndex) => (
                    <motion.div 
                        key={catIndex}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: catIndex * 0.1 }}
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
                                key={`${catIndex}-${linkIndex}`}
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
                                    <th className="px-4 py-3 font-medium">รหัสผ่าน</th>
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
                                                    type="text"
                                                    value={user.password} 
                                                    onChange={(e) => updateUser(user.id, 'password', e.target.value)}
                                                    className="bg-transparent border-none w-28 text-sm outline-none font-mono"
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
                                                    onClick={() => resetPassword(user.id)}
                                                    className="text-gray-400 hover:text-amber-500 p-2 hover:bg-amber-50 rounded-full transition-colors"
                                                    title="รีเซ็ตรหัสผ่าน"
                                                >
                                                    <RefreshCw size={16} />
                                                </button>
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

        {activeTab === 'database' && (
            <motion.div
                key="db-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
            >
                <div className="bg-gray-50 p-6 border-b border-gray-200">
                     <h3 className="text-lg font-bold text-gray-800 flex items-center gap-3">
                        <Server className="text-blue-600" />
                        ส่งออกข้อมูลเป็นไฟล์ SQL
                    </h3>
                    <div className="mt-3 p-4 bg-blue-50 text-blue-800 rounded-xl border border-blue-100 flex items-start gap-3 text-sm">
                        <AlertTriangle size={20} className="shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold">คำชี้แจง:</p>
                             <p className="mt-1 opacity-90">
                                การตั้งค่าการเชื่อมต่อฐานข้อมูลถูกย้ายไปจัดการที่ Backend Server (ในไฟล์ <code>server.js</code>) เพื่อความปลอดภัย หน้านี้ใช้สำหรับ **ส่งออกข้อมูลปัจจุบัน** เป็นไฟล์ <code>.sql</code> เท่านั้น
                            </p>
                            <p className="mt-1 opacity-90">
                                คุณสามารถใช้ไฟล์ที่ดาวน์โหลดไปเพื่อสำรองข้อมูล หรือนำไปติดตั้งบนเซิร์ฟเวอร์อื่นได้
                            </p>
                        </div>
                    </div>
                </div>
                <div className="p-8">
                     <fieldset disabled className="opacity-60">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Host Name / IP Address</label>
                                <input 
                                    type="text" 
                                    value={dbConfig.host}
                                    readOnly
                                    className="w-full px-4 py-2.5 bg-gray-100 border border-gray-300 rounded-xl outline-none font-mono cursor-not-allowed"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Port</label>
                                <input 
                                    type="text" 
                                    value={dbConfig.port}
                                    readOnly
                                    className="w-full px-4 py-2.5 bg-gray-100 border border-gray-300 rounded-xl outline-none font-mono cursor-not-allowed"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Username</label>
                                <input 
                                    type="text" 
                                    value={dbConfig.user}
                                    readOnly
                                    className="w-full px-4 py-2.5 bg-gray-100 border border-gray-300 rounded-xl outline-none font-mono cursor-not-allowed"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Password</label>
                                <input 
                                    type="password" 
                                    value="••••••••"
                                    readOnly
                                    className="w-full px-4 py-2.5 bg-gray-100 border border-gray-300 rounded-xl outline-none font-mono cursor-not-allowed"
                                />
                            </div>
                        </div>
                     </fieldset>
                     <div className="space-y-2 max-w-4xl mt-6">
                        <label className="text-sm font-medium text-gray-700">Database Name (ที่ใช้ในการ Export)</label>
                        <input 
                            type="text" 
                            value={dbConfig.database}
                            onChange={(e) => setDbConfig({...dbConfig, database: e.target.value})}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-mono font-semibold text-blue-700"
                            placeholder="moph_portal_db"
                        />
                    </div>
                    
                    <div className="mt-8 pt-8 border-t border-gray-100">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleExportSQL}
                            className="px-6 py-3 text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/30"
                        >
                            <FileDown size={20} />
                            ดาวน์โหลดไฟล์ SQL สำหรับ Backup/Install
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;