import { motion } from 'framer-motion';
import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  ArrowLeft, 
  BookOpen, 
  Settings, 
  Code, 
  Database, 
  HelpCircle, 
  Cpu, 
  Shield, 
  Phone, 
  Zap, 
  ChevronRight,
  Server,
  Network,
  HardDrive,
  Globe,
  Lock,
  Cloud
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { DetailModal } from '../components/DetailModal';

export const Documentation = () => {
  const { t } = useLanguage();
  const [selectedSection, setSelectedSection] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const sections = [
    { icon: BookOpen, key: 'architecture', color: 'from-blue-500 to-cyan-500' },
    { icon: Database, key: 'components', color: 'from-green-500 to-emerald-500' },
    { icon: Server, key: 'infrastructure', color: 'from-purple-500 to-pink-500' },
    { icon: Cloud, key: 'deployment', color: 'from-yellow-500 to-orange-500' },
    { icon: Lock, key: 'security', color: 'from-red-500 to-rose-500' },
    { icon: HelpCircle, key: 'faq', color: 'from-indigo-500 to-purple-500' },
  ];

  const techRequirements = [
    { icon: Server, key: 'virtualization', color: 'text-blue-500' },
    { icon: HardDrive, key: 'storage', color: 'text-cyan-500' },
    { icon: Network, key: 'network', color: 'text-green-500' },
    { icon: Phone, key: 'freeswitch', color: 'text-yellow-500' },
    { icon: Cpu, key: 'python', color: 'text-purple-500' },
    { icon: Shield, key: 'nodejs', color: 'text-red-500' },
  ];

  const handleOpenModal = (sectionKey) => {
    setSelectedSection(sectionKey);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSection(null);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300">
      {/* Header */}
      <nav className="bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-yellow-500/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <Phone className="h-8 w-8 text-yellow-500" />
              <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Ven<span className="text-yellow-500">IA</span> Voice
              </span>
            </Link>
            
            <Link
              to="/"
              className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-yellow-500 transition"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('documentation.backHome')}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-r from-yellow-500/10 to-transparent py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {t('documentation.title')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {t('documentation.subtitle')}
          </p>
        </div>
      </section>

      {/* Grid de documentación */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sections.map((section, index) => (
              <motion.div
                key={section.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5, boxShadow: '0 20px 40px -12px rgba(0,0,0,0.2)' }}
                onClick={() => handleOpenModal(section.key)}
                className="bg-white dark:bg-gray-800 rounded-xl border border-yellow-500/20 p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
              >
                <div className={`bg-gradient-to-r ${section.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                  <section.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                  {t(`documentation.${section.key}`)}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {t(`documentation.${section.key}Desc`)}
                </p>
                <div className="mt-4 text-yellow-500 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                  {t('documentation.readMore')} <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Sección de requisitos técnicos */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {t('documentation.techRequirements')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Especificaciones técnicas para desplegar VenIA Voice en tu infraestructura
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {techRequirements.map((req, index) => (
              <motion.div
                key={req.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.08 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="flex items-start gap-4 p-5 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-yellow-500/10 hover:border-yellow-500/30"
              >
                <div className={`${req.color} bg-opacity-10 p-3 rounded-lg bg-${req.color}-500/10`}>
                  <req.icon className={`h-6 w-6 ${req.color}`} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {t(`documentation.${req.key}Title`)}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                    {t(`documentation.${req.key}Desc`)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Diagrama de arquitectura */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-12 p-6 bg-white dark:bg-gray-800 rounded-xl border border-yellow-500/20 shadow-lg"
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white text-center mb-6">
              Arquitectura de despliegue
            </h3>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 text-sm">
              <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg min-w-[120px]">
                <Globe className="h-8 w-8 text-yellow-500 mb-2" />
                <span className="font-semibold">Usuarios</span>
                <span className="text-xs text-gray-500">WebRTC / SIP</span>
              </div>
              
              <ChevronRight className="h-6 w-6 text-yellow-500 hidden md:block" />
              <div className="w-8 h-0.5 bg-yellow-500/30 md:hidden"></div>
              
              <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg min-w-[120px] border-2 border-yellow-500/30">
                <Server className="h-8 w-8 text-yellow-500 mb-2" />
                <span className="font-semibold">VenIA Voice</span>
                <span className="text-xs text-gray-500">Agente IA + Proxy</span>
              </div>
              
              <ChevronRight className="h-6 w-6 text-yellow-500 hidden md:block" />
              <div className="w-8 h-0.5 bg-yellow-500/30 md:hidden"></div>
              
              <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg min-w-[120px]">
                <Phone className="h-8 w-8 text-yellow-500 mb-2" />
                <span className="font-semibold">FreeSWITCH</span>
                <span className="text-xs text-gray-500">PBX + ESL</span>
              </div>
              
              <ChevronRight className="h-6 w-6 text-yellow-500 hidden md:block" />
              <div className="w-8 h-0.5 bg-yellow-500/30 md:hidden"></div>
              
              <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg min-w-[120px]">
                <Cpu className="h-8 w-8 text-yellow-500 mb-2" />
                <span className="font-semibold">Modelos IA</span>
                <span className="text-xs text-gray-500">STT / LLM / TTS</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Modal de detalles */}
      <DetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        sectionKey={selectedSection}
      />
    </div>
  );
};