import React, { useState, useEffect, useCallback } from 'react';
import { MOPH_DATA, DEFAULT_FOOTER_DATA, DEFAULT_USERS, DEFAULT_DB_CONFIG } from './constants';
import CategorySection from './components/CategorySection';
import AdminDashboard from './components/AdminDashboard';
import LoginModal from './components/LoginModal';
import QrCodeModal from './components/QrCodeModal';
import { ToastProvider, useToast } from './components/ToastSystem';
import { Search, Building2, Settings, LogOut, Loader, AlertTriangle, ServerCrash, Info } from 'lucide-react';
import type { LinkCategory, FooterData, User, DatabaseConfig } from './types';
import { motion, AnimatePresence } from 'framer-motion';

// Import environment configuration
import { config } from './src/config';

// Use the configured API base URL
const API_BASE_URL = config.API_BASE_URL;

const AppContent: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [qrModalState, setQrModalState] = useState<{ isOpen: boolean, url: string, title: string } | null>(null);
  const { addToast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<LinkCategory[]>([]);
  const [footerData, setFooterData] = useState<FooterData>(DEFAULT_FOOTER_DATA);
  const [users, setUsers] = useState<User[]>([]);
  const [dbConfig, setDbConfig] = useState<DatabaseConfig>(DEFAULT_DB_CONFIG);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/data`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch data from server.');
      }
      const result = await response.json();
      
      // Ensure data is an array
      const categories = Array.isArray(result.data) ? result.data : [];
      
      // Set default values if not provided
      setData(categories);
      setFooterData(result.footerData || DEFAULT_FOOTER_DATA);
      setUsers(result.users || []);
      setDbConfig({
        ...DEFAULT_DB_CONFIG,
        ...(result.dbConfig || {})
      });
      
      console.log('Fetched data:', { categories, footerData: result.footerData });
    } catch (e: any) {
      console.error("Data loading failed:", e);
      let errorMessage = "Failed to load data. Please check the server connection.";
      if (e.message.includes('fetch')) {
        errorMessage = "Could not connect to the backend server. Please make sure it's running.";
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async (): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data,
          footerData,
          users,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save data.');
      }
      
      addToast({ title: 'บันทึกข้อมูลสำเร็จ', description: 'ข้อมูลถูกบันทึกลงฐานข้อมูลแล้ว', type: 'success' });
      return true;

    } catch (error: any) {
      console.error('Failed to save data:', error);
       addToast({
        title: 'บันทึกข้อมูลไม่สำเร็จ',
        description: error.message || 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้',
        type: 'error'
      });
      return false;
    }
  };


  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Filter logic
  const filteredData = data.map(category => ({
    ...category,
    links: category.links.filter(link => 
      link.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (link.description && link.description.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  })).filter(category => category.links.length > 0);

  const handleResetToDefault = () => {
    if (window.confirm('คุณแน่ใจหรือไม่ที่จะรีเซ็ตข้อมูลทั้งหมดกลับเป็นค่าเริ่มต้น? การแก้ไขของคุณจะหายไป')) {
      setData(MOPH_DATA);
      setFooterData(DEFAULT_FOOTER_DATA);
      // setUsers(DEFAULT_USERS); // Do not reset users from frontend anymore
      addToast({ title: 'รีเซ็ตข้อมูลสำเร็จ', description: 'กรุณากด "บันทึกและออก" เพื่อยืนยันการเปลี่ยนแปลง', type: 'success' });
    }
  };

  const handleAdminToggle = () => {
    if (isAdminMode) {
      setIsAdminMode(false);
      addToast({ title: 'ออกจากโหมดผู้ดูแล', type: 'info' });
      fetchData(); // Reload data from server on exit to discard unsaved changes
    } else {
      setShowLoginModal(true);
    }
  };

  const handleLogin = async (username: string, pass: string): Promise<boolean> => {
    try {
      console.log('Attempting login with:', { username });
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include', // Important for cookies/sessions
        body: JSON.stringify({ 
          username: username.trim(),
          password: pass 
        })
      });

      // First, try to parse the response as JSON
      let result;
      try {
        result = await response.json();
        console.log('Login response:', { status: response.status, result });
      } catch (e) {
        console.error('Failed to parse JSON response:', e);
        throw new Error('การตอบกลับจากเซิร์ฟเวอร์ไม่ถูกต้อง');
      }

      if (response.ok && result.success) {
        setIsAdminMode(true);
        // Store user data in localStorage for persistence
        localStorage.setItem('user', JSON.stringify(result.user));
        
        addToast({ 
          title: 'เข้าสู่ระบบสำเร็จ', 
          description: `ยินดีต้อนรับ, ${result.user.name || 'ผู้ดูแลระบบ'}`,
          type: 'success' 
        });
        return true;
      } else {
        // Show specific error message from server or default message
        const errorMessage = result?.message || 'ไม่สามารถเข้าสู่ระบบได้';
        console.error('Login failed:', { status: response.status, errorMessage });
        
        addToast({
          title: 'เข้าสู่ระบบไม่สำเร็จ',
          description: errorMessage,
          type: 'error'
        });
        return false;
      }
    } catch (error) {
        console.error('Login request failed:', error);
        addToast({ title: 'เกิดข้อผิดพลาด', description: 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์เพื่อเข้าระบบได้', type: 'error'});
        return false;
    }
  };

  const handleQrOpen = (url: string, title: string) => {
    setQrModalState({ isOpen: true, url, title });
  };

  const handleQrClose = () => {
    setQrModalState(prev => prev ? { ...prev, isOpen: false } : null);
    setTimeout(() => setQrModalState(null), 300); 
  };
  
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-gray-500">
          <Loader size={48} className="animate-spin mb-4 text-moph-500" />
          <p className="text-lg font-semibold">กำลังโหลดข้อมูลจากเซิร์ฟเวอร์...</p>
        </div>
      );
    }
    
    // Check if we have any categories to display
    const hasData = data && data.length > 0;
    
    // If no data and not in admin mode, show empty state
    if (!hasData && !isAdminMode) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 max-w-md w-full">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} className="text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">ยังไม่มีข้อมูล</h3>
            <p className="text-gray-500 mb-6">ดูเหมือนว่ายังไม่มีข้อมูลในระบบ กรุณาเข้าสู่ระบบในโหมดผู้ดูแลเพื่อเพิ่มข้อมูล</p>
            <button
              onClick={() => setShowLoginModal(true)}
              className="px-6 py-2.5 bg-moph-600 hover:bg-moph-700 text-white rounded-xl font-medium transition-colors w-full"
            >
              เข้าสู่ระบบผู้ดูแล
            </button>
          </div>
        </div>
      );
    }
    
    if (error) {
      if (error.includes("Could not connect")) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center bg-white rounded-3xl p-8 shadow-sm border border-yellow-200">
                <ServerCrash size={64} className="mx-auto text-yellow-400 mb-6" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">ไม่สามารถเชื่อมต่อ Backend Server ได้</h3>
                <p className="text-gray-500 mb-6 max-w-lg">ดูเหมือนว่าเซิร์ฟเวอร์ยังไม่ได้ทำงาน โปรดทำตามขั้นตอนต่อไปนี้เพื่อเปิดใช้งาน:</p>
                
                <div className="text-left bg-gray-50 p-6 rounded-xl border border-gray-200 w-full max-w-md font-mono text-sm text-gray-700 space-y-4">
                    <div>
                        <p className="text-gray-500 font-sans font-medium mb-1">1. เปิด Terminal และเข้าไปที่โฟลเดอร์ของเซิร์ฟเวอร์:</p>
                        <code className="bg-gray-200 text-gray-800 rounded px-2 py-1 block">cd server</code>
                    </div>
                     <div>
                        <p className="text-gray-500 font-sans font-medium mb-1">2. ติดตั้ง Dependencies (หากเป็นครั้งแรก):</p>
                        <code className="bg-gray-200 text-gray-800 rounded px-2 py-1 block">npm install</code>
                    </div>
                    <div>
                        <p className="text-gray-500 font-sans font-medium mb-1">3. เริ่มการทำงานของเซิร์ฟเวอร์:</p>
                        <code className="bg-gray-200 text-gray-800 rounded px-2 py-1 block">npm start</code>
                    </div>
                </div>

                <p className="text-gray-400 mt-6 text-sm">เมื่อเซิร์ฟเวอร์ทำงานแล้ว ให้กดปุ่ม "ลองอีกครั้ง"</p>
                
                <button
                    onClick={fetchData}
                    className="mt-4 px-6 py-2.5 bg-moph-600 hover:bg-moph-700 text-white rounded-xl font-semibold transition-colors shadow-lg shadow-moph-500/20"
                >
                    ลองอีกครั้ง
                </button>
            </div>
        );
    }
       return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center bg-white rounded-3xl p-8 shadow-sm border border-red-100">
          <AlertTriangle size={64} className="mx-auto text-red-300 mb-6" />
          <h3 className="text-xl font-semibold text-red-700 mb-2">เกิดข้อผิดพลาดในการโหลดข้อมูล</h3>
          <p className="text-gray-500 mb-8 max-w-sm">{error}</p>
          <button
            onClick={fetchData}
            className="px-6 py-2.5 bg-moph-600 hover:bg-moph-700 text-white rounded-xl font-semibold transition-colors shadow-lg shadow-moph-500/20"
          >
            ลองอีกครั้ง
          </button>
        </div>
      );
    }

    return (
      <AnimatePresence mode="wait">
        {isAdminMode ? (
        <motion.div
            key="admin-dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
        >
            <AdminDashboard 
                data={data} 
                setData={setData} 
                footerData={footerData}
                setFooterData={setFooterData}
                users={users}
                setUsers={setUsers}
                dbConfig={dbConfig}
                setDbConfig={setDbConfig} // This is now mostly for display/export
                onSave={handleSave}
                onExit={() => setIsAdminMode(false)} 
            />
        </motion.div>
        ) : (
        <motion.div
            key="user-dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            {/* Banner Area */}
            <AnimatePresence>
                {!scrolled && searchTerm === '' && (
                <motion.div 
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginBottom: '3rem' }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.5, type: "spring", bounce: 0 }}
                    className="overflow-hidden"
                >
                    <div className="p-8 md:p-12 rounded-3xl bg-gradient-to-r from-moph-600 to-emerald-500 text-white shadow-2xl shadow-moph-500/20 relative overflow-hidden">
                        <motion.div 
                            initial={{ opacity: 0, rotate: -10, scale: 0.8 }}
                            animate={{ opacity: 0.1, rotate: 0, scale: 1 }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className="absolute top-0 right-0 -mt-12 -mr-12 text-white"
                        >
                        <Building2 size={300} />
                        </motion.div>
                        <div className="relative z-10 max-w-3xl">
                        <motion.h2 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-3xl md:text-5xl font-bold mb-4 leading-tight"
                        >
                            ศูนย์รวมบริการดิจิทัลสุขภาพ
                        </motion.h2>
                        <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-moph-50 text-lg md:text-xl max-w-xl"
                        >
                            เข้าถึงระบบสารสนเทศและบริการอิเล็กทรอนิกส์ของกระทรวงสาธารณสุขได้ง่ายและรวดเร็วในที่เดียว
                        </motion.p>
                        </div>
                    </div>
                </motion.div>
                )}
            </AnimatePresence>

            {/* Results or Categories */}
            <motion.div layout className="space-y-8 min-h-[30vh]">
            <AnimatePresence mode="popLayout">
                {(() => {
                  // Debug: Log the data and search term
                  console.log('Current data:', data);
                  console.log('Search term:', searchTerm);
                  console.log('Filtered data:', filteredData);
                  
                  // If no search term, show all categories
                  const displayData = searchTerm ? filteredData : data;
                  
                  if (displayData.length > 0) {
                    return displayData.map((category, index) => {
                      // Use index as key if id is not available
                      const key = category.id || `category-${index}`;
                      console.log('Rendering category:', { ...category, key });
                      return (
                        <CategorySection 
                          key={key}
                          category={category} 
                          onQrClick={handleQrOpen}
                        />
                      );
                    });
                  } else {
                    return (
                      <motion.div 
                        key="no-results"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100"
                      >
                        <Search size={64} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">
                          {searchTerm ? 'ไม่พบข้อมูลที่ค้นหา' : 'ยังไม่มีข้อมูล'}
                        </h3>
                        <p className="text-gray-400">
                          {searchTerm 
                            ? 'ลองใช้คำค้นหาอื่น หรือตรวจสอบตัวสะกด' 
                            : 'กรุณาเพิ่มข้อมูลในโหมดผู้ดูแลระบบ'}
                        </p>
                      </motion.div>
                    );
                  }
                })()}
            </AnimatePresence>
            </motion.div>
        </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50">
      <AnimatePresence>
        {showLoginModal && (
          <LoginModal 
            isOpen={showLoginModal} 
            onClose={() => setShowLoginModal(false)}
            onLogin={handleLogin}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {qrModalState && qrModalState.isOpen && (
          <QrCodeModal
            isOpen={qrModalState.isOpen}
            onClose={handleQrClose}
            url={qrModalState.url}
            title={qrModalState.title}
          />
        )}
      </AnimatePresence>

      {/* Hero Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-4' : 'bg-white py-6'}`}>
        <div className="container mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3"
          >
            <motion.div 
              layout
              className={`p-2.5 rounded-xl text-white shadow-lg transition-colors ${isAdminMode ? 'bg-orange-500 shadow-orange-500/20' : 'bg-moph-500 shadow-moph-500/20'}`}
            >
               <AnimatePresence mode="wait">
                 {isAdminMode ? (
                   <motion.div key="admin" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                     <Settings size={28} />
                   </motion.div>
                 ) : (
                   <motion.div key="user" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                     <Building2 size={28} />
                   </motion.div>
                 )}
               </AnimatePresence>
            </motion.div>
             <div>
               <h1 className="text-xl md:text-2xl font-bold text-gray-800 leading-none">
                 {isAdminMode ? 'Admin Dashboard' : 'MOPH Portal'}
               </h1>
               <p className={`text-sm font-medium ${isAdminMode ? 'text-orange-600' : 'text-moph-600'}`}>
                 {isAdminMode ? 'โหมดจัดการเว็บไซต์' : 'กระทรวงสาธารณสุข'}
               </p>
             </div>
          </motion.div>

          {/* Search Bar - Hide in Admin Mode */}
          <AnimatePresence>
            {!isAdminMode && (
                <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="relative w-full md:w-96"
                >
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Search size={20} />
                </div>
                <input
                    type="text"
                    placeholder="ค้นหาระบบงาน..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border-transparent focus:border-moph-500 focus:bg-white focus:ring-2 focus:ring-moph-500/20 rounded-xl transition-all duration-300 outline-none text-gray-700 placeholder-gray-400"
                />
                </motion.div>
            )}
          </AnimatePresence>

          {/* Admin Toggle Button */}
          <AnimatePresence>
            {isAdminMode && (
                <motion.button 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onClick={handleAdminToggle}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                >
                <LogOut size={18} />
                <span>ออกจากระบบหลังบ้าน</span>
                </motion.button>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 md:px-8 pt-32 md:pt-36 pb-16">
        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-8">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-gray-500 gap-4">
          <div className="text-center md:text-left">
            <p>{footerData.copyrightText}</p>
            <p className="text-sm mt-1">{footerData.descriptionText}</p>
          </div>
          <div className="flex gap-4">
             {isAdminMode && (
               <button
                 onClick={handleResetToDefault}
                 className="text-sm text-red-500 hover:text-red-700 underline"
               >
                 รีเซ็ตเป็นค่าเริ่มต้น
               </button>
             )}
             <button 
               onClick={handleAdminToggle}
               className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-moph-600 transition-colors"
             >
               <Settings size={16} />
               {isAdminMode ? 'กลับสู่หน้าหลัก' : 'จัดการเว็บไซต์'}
             </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
};

export default App;