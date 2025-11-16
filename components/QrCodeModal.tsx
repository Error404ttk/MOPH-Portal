import React from 'react';
import { X, Download, ExternalLink, QrCode } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from './ToastSystem';

interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
}

const QrCodeModal: React.FC<QrCodeModalProps> = ({ isOpen, onClose, url, title }) => {
  const { addToast } = useToast();

  if (!isOpen) return null;

  // Using a reliable public API for QR code generation
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&margin=15&bgcolor=ffffff&color=000000&format=png&data=${encodeURIComponent(url)}`;

  const handleDownload = async () => {
    try {
      const response = await fetch(qrImageUrl);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `qrcode-${title.replace(/\s+/g, '-').toLowerCase()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      addToast({
        title: 'บันทึก QR Code สำเร็จ',
        type: 'success'
      });
    } catch (error) {
      console.error('Error downloading QR code:', error);
      addToast({
        title: 'ไม่สามารถบันทึกภาพได้',
        description: 'ระบบกำลังเปิดภาพในหน้าต่างใหม่แทน',
        type: 'warning'
      });
      window.open(qrImageUrl, '_blank');
    }
  };

  return (
    <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4"
        onClick={onClose}
    >
      <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-sm relative overflow-hidden"
          onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-moph-600 p-6 text-white text-center relative">
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-moph-100 hover:text-white hover:bg-moph-500/50 rounded-full p-1 transition-all"
            >
                <X size={20} />
            </button>
            <div className="inline-flex p-3 bg-white/10 rounded-full mb-3 backdrop-blur-md shadow-inner-sm">
                <QrCode size={28} className="text-white" />
            </div>
            <h3 className="text-lg font-bold line-clamp-1 px-8" title={title}>{title}</h3>
             <p className="text-moph-100 text-sm mt-1">
                สแกนเพื่อเข้าสู่เว็บไซต์
            </p>
        </div>

        {/* QR Content */}
        <div className="p-8 flex flex-col items-center justify-center bg-gradient-to-b from-moph-50/50 to-white">
            <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="p-4 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-50"
            >
                <img
                    src={qrImageUrl}
                    alt={`QR Code for ${title}`}
                    className="w-48 h-48 md:w-56 md:h-56 object-contain"
                    loading="lazy"
                />
            </motion.div>
        </div>

        {/* URL & Actions */}
        <div className="px-6 pb-6 space-y-4">
             <div className="bg-slate-50 rounded-xl py-2 px-3 text-xs text-slate-500 truncate text-center border border-slate-100 font-mono select-all">
                {url}
            </div>

            <div className="grid grid-cols-2 gap-3">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDownload}
                    className="flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors"
                >
                    <Download size={18} />
                    <span className="text-sm">บันทึกภาพ</span>
                </motion.button>
                 <motion.a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-center gap-2 py-2.5 px-4 bg-moph-600 hover:bg-moph-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-moph-500/20"
                >
                    <ExternalLink size={18} />
                    <span className="text-sm">เปิดลิ้งค์</span>
                </motion.a>
            </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default QrCodeModal;