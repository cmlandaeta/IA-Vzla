import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useEffect } from 'react';

export const DetailModal = ({ isOpen, onClose, sectionKey }) => {
  const { t } = useLanguage();

  // Cerrar con Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Función para formatear texto con saltos de línea
  const formatText = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, index) => {
      if (line.trim().startsWith('•')) {
        return (
          <li key={index} className="ml-4 text-gray-700 dark:text-gray-300">
            {line.trim().substring(1)}
          </li>
        );
      }
      if (line.trim().match(/^\d+\./)) {
        return (
          <li key={index} className="ml-4 text-gray-700 dark:text-gray-300 list-decimal">
            {line.trim().substring(line.indexOf(' ') + 1)}
          </li>
        );
      }
      if (line.trim() === '') {
        return <div key={index} className="h-2" />;
      }
      return (
        <p key={index} className="text-gray-700 dark:text-gray-300">
          {line.trim()}
        </p>
      );
    });
  };

  const title = t(`documentation.${sectionKey}`);
  const detail = t(`documentation.${sectionKey}Detail`);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white dark:bg-gray-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-yellow-500/20"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-yellow-500/20 p-6 flex justify-between items-center rounded-t-2xl">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {title}
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                <X className="h-6 w-6 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-3">
              {detail ? (
                <div className="space-y-2">
                  {formatText(detail)}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  Información detallada en desarrollo...
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-yellow-500/20 p-4 rounded-b-2xl">
              <button
                onClick={onClose}
                className="w-full py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-lg transition"
              >
                {t('documentation.close')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};