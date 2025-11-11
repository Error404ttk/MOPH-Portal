import React, { useState } from 'react';
import { Lock, User, KeyRound, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Fix: Changed onLogin to return a Promise<boolean> to match the async function passed from App.tsx
  onLogin: (username: string, pass: string) => Promise<boolean>;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // Fix: Made handleSubmit async and awaited the onLogin call
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = await onLogin(username, password);
    if (success) {
      setUsername('');
      setPassword('');
      onClose();
    } else {
      setError('ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง');
      setPassword('');
    }
  };

  return (
    <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
    >
      <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden"
      >
        {/* Header */}
        <div className="bg-slate-800 p-6 text-white text-center relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.1 }}
            className="inline-flex p-3 bg-slate-700 rounded-full mb-4"
          >
            <Lock size={32} className="text-moph-500" />
          </motion.div>
          <h3 className="text-xl font-bold">เข้าสู่ระบบผู้ดูแล</h3>
          <p className="text-slate-400 text-sm mt-1">เพื่อจัดการข้อมูลเว็บไซต์</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 text-center"
            >
              {error}
            </motion.div>
          )}
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">ชื่อผู้ใช้งาน</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <User size={18} />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-moph-500/20 focus:border-moph-500 outline-none transition-all"
                placeholder="Username"
                required
                autoFocus
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">รหัสผ่าน</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <KeyRound size={18} />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-moph-500/20 focus:border-moph-500 outline-none transition-all"
                placeholder="Password"
                required
              />
            </div>
          </div>

          <div className="pt-4">
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 bg-moph-600 hover:bg-moph-700 text-white rounded-xl font-semibold shadow-md shadow-moph-500/20 transition-colors"
            >
              เข้าสู่ระบบ
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default LoginModal;