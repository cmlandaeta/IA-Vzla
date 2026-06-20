import { useLanguage } from '../contexts/LanguageContext';
import { motion } from 'framer-motion';

export const LanguageSwitch = () => {
  const { language, changeLanguage } = useLanguage();

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      onClick={() => changeLanguage(language === 'es' ? 'en' : 'es')}
      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition font-medium text-sm"
    >
      {language === 'es' ? '🇪🇸 ES' : '🇺🇸 EN'}
    </motion.button>
  );
};