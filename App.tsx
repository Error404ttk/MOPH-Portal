import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import AdminDashboard from './components/AdminDashboard';
import LoginModal from './components/LoginModal';
import QrCodeModal from './components/QrCodeModal';
import { ToastProvider, useToast } from './components/ToastSystem';
// FIX: Import AlertTriangle icon.
import { Search, Building2, Settings, LogOut, Loader2, AlertTriangle } from 'lucide-react';
import { LinkCategory, FooterData, User, About } from './types';
import { motion, AnimatePresence } from 'framer-motion';

const CategorySection = lazy(() => import('./components/CategorySection'));
const AboutSection = lazy(() => import('./components/AboutSection'));

const AUTH_TOKEN_KEY = 'moph-portal-auth-token';

const FullPageLoader: React.FC<{ message: string }> = ({ message }) => (
    <div className="flex flex-col items-center justify-center h-full min-h-[50vh] text-center text-gray-500">
        <Loader2 className="animate-spin mb-4" size={48} />
        <p className="text-lg font-medium">{message}</p>
    </div>
);

const AppContent: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [scrolled, setScrolled] = useState(false);
  
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [qrModalState, setQrModalState] = useState<{ isOpen: boolean, url: string, title: string } | null>(null);
  const { addToast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [data, setData] = useState<LinkCategory[]>([]);
  const [footerData, setFooterData] = useState<FooterData>({ copyrightText: '', descriptionText: '' });
  const [users, setUsers] = useState<User[]>([]);
  const [abouts, setAbouts] = useState<About[]>([]);

  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/data');
      if (!response.ok) {
        throw new Error('Failed to fetch data from the server.');
      }
      const result = await response.json();
      setData(result.data || []);
      setFooterData(result.footerData || { copyrightText: '', descriptionText: '' });
      // Users are only needed in admin mode, but we can preload them if public info is needed.
      // For security, only load users when authenticated. We get them from login/data endpoints anyway.
      setUsers(result.users || []);
      setAbouts(result.abouts || []);
    } catch (e: any) {
      console.error("Failed to load data from server:", e);
      setError(e.message || 'An unknown error occurred.');
      addToast({ title: 'เกิดข้อผิดพลาด', description: 'ไม่สามารถโหลดข้อมูลจากเซิร์ฟเวอร์ได้', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
        setAuthToken(token);
    }
    loadInitialData();
  }, [loadInitialData]);
  

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

  const handleResetToDefault = async () => {
    if (window.confirm('คุณแน่ใจหรือไม่ที่จะรีเซ็ตข้อมูลทั้งหมดกลับเป็นค่าเริ่มต้น? การเปลี่ยนแปลงทั้งหมดจะหายไปและไม่สามารถกู้คืนได้')) {
        try {
            const response = await fetch('/api/reset', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${authToken}` },
            });
            if (!response.ok) throw new Error('Failed to reset data.');
            addToast({ title: 'รีเซ็ตข้อมูลสำเร็จ', description: 'กำลังโหลดข้อมูลเริ่มต้นใหม่...', type: 'success' });
            await loadInitialData();
        } catch (err) {
            addToast({ title: 'เกิดข้อผิดพลาด', description: 'ไม่สามารถรีเซ็ตข้อมูลได้', type: 'error' });
        }
    }
  };

  const handleAdminToggle = () => {
    if (isAdminMode) {
      setIsAdminMode(false);
      // Optional: reload data to discard any unsaved changes in admin panel state
      loadInitialData(); 
    } else {
      setShowLoginModal(true);
    }
  };
  
  const handleLogout = () => {
     setIsAdminMode(false);
     setAuthToken(null);
     localStorage.removeItem(AUTH_TOKEN_KEY);
     addToast({ title: 'ออกจากระบบสำเร็จ', type: 'info' });
  }

  const handleLogin = async (username: string, pass: string): Promise<boolean> => {
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password: pass }),
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Login failed');
        }
        
        localStorage.setItem(AUTH_TOKEN_KEY, result.token);
        setAuthToken(result.token);
        setIsAdminMode(true);
        addToast({
            title: 'เข้าสู่ระบบสำเร็จ',
            description: `ยินดีต้อนรับ, ${result.user.name}`,
            type: 'success'
        });
        // Reload data to get latest users list
        await loadInitialData();
        return true;
    } catch (error: any) {
        console.error('Login failed:', error);
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
        return <FullPageLoader message="กำลังโหลดข้อมูล..." />;
    }
    if (error) {
        return (
            <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-red-100">
                <AlertTriangle size={64} className="mx-auto text-red-300 mb-4" />
                <h3 className="text-xl font-semibold text-red-600 mb-2">เกิดข้อผิดพลาด</h3>
                <p className="text-red-500 mb-6">{error}</p>
                <button
                    onClick={() => loadInitialData()}
                    className="px-6 py-2 bg-moph-600 text-white rounded-lg hover:bg-moph-700"
                >
                    ลองใหม่อีกครั้ง
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
                initialData={data}
                initialFooterData={footerData}
                initialUsers={users}
                initialAbouts={abouts}
                authToken={authToken!}
                onExit={handleLogout} 
                onDataSaved={loadInitialData}
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
                    <div className="
                        p-8 md:p-12 
                        rounded-3xl 
                        bg-gradient-to-br from-moph-700 via-moph-600 to-emerald-600 
                        text-white 
                        shadow-2xl shadow-moph-500/20 
                        relative overflow-hidden
                    ">
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
                {filteredData.length > 0 ? (
                    filteredData.map((category) => (
                      <Suspense key={category.title} fallback={<div className="h-96" />}>
                        <CategorySection 
                            category={category} 
                            onQrClick={handleQrOpen}
                        />
                      </Suspense>
                    ))
                ) : (
                    <motion.div 
                        key="no-results"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100"
                    >
                        <Search size={64} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">ไม่พบข้อมูลที่ค้นหา</h3>
                        <p className="text-gray-400">ลองใช้คำค้นหาอื่น หรือตรวจสอบตัวสะกด</p>
                    </motion.div>
                )}
            </AnimatePresence>
            </motion.div>
            <Suspense fallback={null}>
              <AboutSection abouts={abouts} />
            </Suspense>
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
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                >
                <LogOut size={18} />
                <span>ออกจากระบบ</span>
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
               {!authToken ? 'จัดการเว็บไซต์' : 'กลับสู่หน้าหลัก'}
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
