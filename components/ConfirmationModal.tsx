import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Check, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[120] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8 text-center">
              <div className="inline-flex p-3 bg-amber-100 rounded-full mb-4">
                <AlertTriangle size={32} className="text-amber-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">{title}</h3>
              <p className="text-gray-500 mt-2">{message}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 p-6 bg-gray-50">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="py-3 px-4 bg-white hover:bg-gray-100 border border-gray-300 text-gray-700 rounded-xl font-semibold transition-colors"
              >
                <div className="flex items-center justify-center gap-2">
                    <X size={18} />
                    <span>No</span>
                </div>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onConfirm}
                className="py-3 px-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold shadow-md shadow-orange-500/20 transition-colors"
              >
                 <div className="flex items-center justify-center gap-2">
                    <Check size={18} />
                    <span>Yes</span>
                </div>
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmationModal;
