import { useState, useEffect, useRef, useCallback } from "react";
import { motion, useInView } from "framer-motion";
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { VenIAVoiceDemo } from './components/VenIAVoiceDemo';
import {VenIAVoiceDemoProxy} from './components/VenIAVoiceDemoProxy';
import { LanguageSwitch } from './components/LanguageSwitch';
import { SalesCallButton } from './components/SalesCallButton';
import { Documentation } from './pages/Documentation';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { HeroCard} from './components/HeroCard';
import { 
  Phone, 
  Zap, 
  Shield, 
  Cpu, 
  LayoutTemplate, 
  Webhook, 
  Mic, 
  Volume2,
  ChevronRight,
  Menu,
  X,
  Loader2,
  Sun,
  Moon,
  ArrowRight,
  CheckCircle,
  Globe,
  Server,
  Database,
  FileText,
  MessageCircle,
  PhoneCall, 
} from "lucide-react";

// Componente para animación al hacer scroll
const ScrollReveal = ({ children, delay = 0, className = "" }) => {
  const ref = useRef(null);
  
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Componente de Tooltip
const Tooltip = ({ children, content }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="cursor-help"
      >
        {children}
      </div>
      {isVisible && (
        <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-xl whitespace-nowrap border border-yellow-500/30">
          {content}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-8 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
};


// Componente principal de la landing page
const LandingPage = () => {
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const demoRef = useRef(null);
const ctaRef = useRef(null);

  // Manejar scroll cuando se navega con hash
  useEffect(() => {
    if (location.hash) {
      const targetId = location.hash.substring(1);
      const element = document.getElementById(targetId);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      }
    }
  }, [location]);

  // Inicializar tema al cargar
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'light') {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    } else if (savedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else if (prefersDark) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Función SIMPLE y DIRECTA para scroll al demo
  const handleTryNow = () => {
    const demoElement = document.getElementById('demo');
    if (demoElement) {
      demoElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Actualizar URL sin recargar
      window.history.pushState(null, '', '#demo');
    } else {
      // Fallback: esperar un poco e intentar de nuevo
      setTimeout(() => {
        document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 200);
    }
  };

  // Función SIMPLE para documentación
  const handleDocumentation = () => {
    window.location.href = '/documentation';
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0 }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  return (
    <div className="min-h-screen transition-colors duration-300 bg-white dark:bg-black">
      {/* Navbar */}
      <nav className="bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-yellow-500/30 dark:border-yellow-600/30 sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2"
            >
              <Volume2 className="h-8 w-8 text-yellow-500" />
              <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Ven<span className="text-yellow-500">IA</span> Voice
              </span>
            </motion.div>
            
            <div className="hidden md:flex space-x-8">
              <a href="#características" className="text-gray-700 dark:text-gray-300 hover:text-yellow-500 transition">
                {t('nav.features')}
              </a>
              <a href="#pipeline" className="text-gray-700 dark:text-gray-300 hover:text-yellow-500 transition">
                {t('nav.pipeline')}
              </a>
              <a href="#demo" className="text-yellow-500 font-bold dark:text-yellow-500 hover:text-gray-300 transition">
                {t('nav.demo')}
              </a>
              <a href="#integración" className="text-gray-700 dark:text-gray-300 hover:text-yellow-500 transition">
                {t('nav.integration')}
              </a>
              <button
                onClick={handleDocumentation}
                className="text-gray-700 dark:text-gray-300 hover:text-yellow-500 transition flex items-center gap-1"
              >
                <FileText className="h-4 w-4" />
                {t('nav.documentation')}
              </button>
            </div>

            <div className="flex items-center gap-4">
              <LanguageSwitch />
              
              <motion.button
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={toggleDarkMode}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              >
                {darkMode ? <Sun className="h-5 w-5 text-yellow-500" /> : <Moon className="h-5 w-5 text-gray-700 dark:text-gray-400" />}
              </motion.button>
              
              <motion.button
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                className="hidden md:block bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg font-semibold transition transform hover:scale-105"
              >
                {t('nav.requestAccess')}
              </motion.button>

              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-gray-900 dark:text-white">
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-gray-900 border-t border-yellow-500/30"
          >
            <div className="px-4 py-2 space-y-2">
              <a href="#características" className="block py-2 text-gray-700 dark:text-gray-300 hover:text-yellow-500">
                {t('nav.features')}
              </a>
              <a href="#pipeline" className="block py-2 text-gray-700 dark:text-gray-300 hover:text-yellow-500">
                {t('nav.pipeline')}
              </a>
              <a href="#demo" className="block py-2 text-gray-700 dark:text-gray-300 hover:text-yellow-500">
                {t('nav.demo')}
              </a>
              <a href="#integración" className="block py-2 text-gray-700 dark:text-gray-300 hover:text-yellow-500">
                {t('nav.integration')}
              </a>
              <button
                onClick={() => {
                  window.location.href = '/documentation';
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left py-2 text-gray-700 dark:text-gray-300 hover:text-yellow-500"
              >
                {t('nav.documentation')}
              </button>
              <button className="w-full bg-yellow-500 text-black py-2 rounded-lg font-semibold">
                {t('nav.requestAccess')}
              </button>
            </div>
          </motion.div>
        )}
      </nav>

     {/* Hero Section - VERSIÓN DEFINITIVA */}

{/* Hero Section - VERSIÓN CON ENLACES NATIVOS (como el navbar) */}
<section className="relative overflow-hidden">
  <motion.div 
    className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-transparent to-transparent"
    animate={{ 
      scale: [1, 1.2, 1],
      opacity: [0.3, 0.5, 0.3]
    }}
    transition={{ duration: 8, repeat: Infinity }}
  />
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="text-center"
    >
      <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 rounded-full px-4 py-1.5 mb-6">
        <Zap className="h-4 w-4 text-yellow-500" />
        <span className="text-sm font-medium text-yellow-500">{t('hero.badge')}</span>
      </motion.div>
      <motion.h1 variants={fadeInUp} className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">
        {t('hero.title')}{" "}
        <span className="text-yellow-500">{t('hero.titleAsterisk')}</span>{" "}
        {t('hero.titleAnd')}{" "}
        <span className="text-yellow-500">{t('hero.titleFreeswitch')}</span>
      </motion.h1>
      <motion.p variants={fadeInUp} className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-2">
        {t('hero.description')}
      </motion.p>
   </motion.div>
  </div>
</section>
{/* Hero Section - Con HeroCard y diseño original */}
<section className="">
  {/* Fondo animado con CSS en lugar de motion */}
 
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-8">
          
      {/* Tarjetas - SIN NINGÚN motion */}
      <div className="flex flex-col sm:flex-row gap-6 justify-center max-w-2xl mx-auto">
        
        {/* Tarjeta 1: Probar Agente IA */}
        <HeroCard 
          href="#demo"
          onClick={(e) => {
            e.preventDefault();
            const demoElement = document.getElementById('demo');
            if (demoElement) {
              demoElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
              window.history.pushState(null, '', '#demo');
            }
          }}
          icon={Phone}
          title="Probar Agente IA"
          description="Prueba nuestro agente en acción"
          actionText="Ir al demo"
          bgColor="bg-gradient-to-br from-yellow-500 to-yellow-600"
          textColor="text-white"
          iconBgColor="bg-white/20"
          iconHoverBgColor="group-hover:bg-white/30"
          iconColor="text-white"
          descriptionColor="text-yellow-100"
          actionColor="text-white/80"
        />
        
        {/* Tarjeta 2: Contactar Ventas */}
        <HeroCard 
          href="#ventas"
          onClick={(e) => {
            e.preventDefault();
            const ctaSection = document.querySelector('section#ventas') || document.querySelector('section.border-t.border-yellow-500\\/20');
            if (ctaSection) {
              ctaSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
              window.history.pushState(null, '', '#ventas');
            }
          }}
          icon={Phone}
          title="Contactar Ventas"
          description="Habla con nuestro equipo"
          actionText="Llamar ahora"
          bgColor="bg-gradient-to-br from-gray-700 to-gray-900 dark:from-gray-800 dark:to-gray-950"
          textColor="text-white"
          iconBgColor="bg-white/10"
          iconHoverBgColor="group-hover:bg-white/20"
          iconColor="text-yellow-500"
          descriptionColor="text-gray-300"
          actionColor="text-yellow-400"
        />
        
      
    </div>
  </div>
</section>


      {/* Integración con PBX */}
      <section id="integración" className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
                {t('integration.title')} <span className="text-yellow-500">{t('integration.titleHighlight')}</span>
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                {t('integration.description')}
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-yellow-500/20 p-6 md:p-10 shadow-xl">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                
                {/* 1. DID */}
                <div className="w-full lg:w-1/5 text-center">
                  <Tooltip content={t('integration.clientCalls')}>
                    <motion.div whileHover={{ scale: 1.05 }} className="bg-yellow-500/10 border border-yellow-500 rounded-xl p-4">
                      <Phone className="h-10 w-10 text-yellow-500 mx-auto mb-2" />
                      <p className="font-semibold text-gray-900 dark:text-white">DID</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{t('integration.clientCalls')}</p>
                    </motion.div>
                  </Tooltip>
                </div>

                <div className="hidden lg:block">
                  <motion.div animate={{ x: [0, 10, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                    <ArrowRight className="h-6 w-6 text-yellow-500" />
                  </motion.div>
                </div>

                {/* 2. PBX */}
                <div className="w-full lg:w-1/5 text-center">
                  <Tooltip content={t('integration.yourPbx')}>
                    <motion.div whileHover={{ scale: 1.05 }} className="bg-yellow-500/10 border border-yellow-500 rounded-xl p-4">
                      <Server className="h-10 w-10 text-yellow-500 mx-auto mb-2" />
                      <p className="font-semibold text-gray-900 dark:text-white">{t('integration.yourPbx')}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Asterisk / FreeSWITCH</p>
                    </motion.div>
                  </Tooltip>
                  <div className="text-yellow-500 mt-2 text-xs">{t('integration.yourPbx')}</div>
                </div>

                <div className="hidden lg:block">
                  <motion.div animate={{ x: [0, 10, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}>
                    <ArrowRight className="h-6 w-6 text-yellow-500" />
                  </motion.div>
                </div>

                {/* 3. VenIA Voice */}
                <div className="w-full lg:w-1/5 text-center">
                  <Tooltip content={t('integration.localAgent')}>
                    <motion.div whileHover={{ scale: 1.05 }} className="bg-yellow-500/20 border-2 border-yellow-500 rounded-xl p-4">
                      <Database className="h-10 w-10 text-yellow-500 mx-auto mb-2" />
                      <p className="font-bold text-yellow-500">VenIA Voice</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{t('integration.localAgent')}</p>
                    </motion.div>
                  </Tooltip>
                  <div className="text-yellow-500 mt-2 text-xs">IA Voice Stack</div>
                </div>

                <div className="hidden lg:block">
                  <motion.div animate={{ x: [0, 10, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}>
                    <ArrowRight className="h-6 w-6 text-yellow-500" />
                  </motion.div>
                </div>

                {/* 4. Respuesta */}
                <div className="w-full lg:w-1/5 text-center">
                  <Tooltip content={t('integration.naturalVoice')}>
                    <motion.div whileHover={{ scale: 1.05 }} className="bg-yellow-500/10 border border-yellow-500 rounded-xl p-4">
                      <Volume2 className="h-10 w-10 text-yellow-500 mx-auto mb-2" />
                      <p className="font-semibold text-gray-900 dark:text-white">{t('integration.response')}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{t('integration.naturalVoice')}</p>
                    </motion.div>
                  </Tooltip>
                </div>
              </div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 p-4 bg-yellow-500/5 rounded-lg border border-yellow-500/20">
                <p className="text-sm text-gray-700 dark:text-gray-300 text-center">
                  <span className="font-mono text-yellow-500">{t('integration.process')}</span>
                </p>
              </motion.div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Pipeline Section */}
      <section id="pipeline" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
                {t('pipeline.title')} <span className="text-yellow-500">{t('pipeline.titleHighlight')}</span>
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                {t('pipeline.description')}
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Mic, title: "STT", metric: t('pipeline.sttMetric'), color: "from-blue-500 to-cyan-500", subtitle: t('pipeline.sttSub'), description: t('pipeline.sttDesc') },
              { icon: Cpu, title: "LLM", metric: t('pipeline.llmMetric'), color: "from-purple-500 to-pink-500", subtitle: t('pipeline.llmSub'), description: t('pipeline.llmDesc') },
              { icon: Volume2, title: "TTS", metric: t('pipeline.ttsMetric'), color: "from-green-500 to-emerald-500", subtitle: t('pipeline.ttsSub'), description: t('pipeline.ttsDesc') }
            ].map((item, index) => (
              <ScrollReveal key={item.title} delay={index * 0.2}>
                <motion.div whileHover={{ y: -10, scale: 1.02 }} className="bg-white dark:bg-gray-800 rounded-xl border border-yellow-500/20 p-6 hover:shadow-2xl transition-all duration-300">
                  <div className={`bg-gradient-to-r ${item.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                    <item.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{item.title}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">{item.subtitle}</p>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">{item.description}</p>
                  <div className="mt-3 inline-block bg-yellow-500/20 px-3 py-1 rounded-full text-xs text-yellow-600 dark:text-yellow-400 font-semibold">
                    ⬇ {item.metric}
                  </div>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            {t('pipeline.footer')}
          </motion.div>
        </div>
      </section>

      {/* Características */}
      <section id="características" className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: t('features.dataSovereignty'), desc: t('features.dataSovereigntyDesc'), color: "text-red-500" },
              { icon: LayoutTemplate, title: t('features.plugAndPlay'), desc: t('features.plugAndPlayDesc'), color: "text-green-500" },
              { icon: Webhook, title: t('features.openApis'), desc: t('features.openApisDesc'), color: "text-blue-500" },
              { icon: Globe, title: t('features.multilanguage'), desc: t('features.multilanguageDesc'), color: "text-purple-500" },
              { icon: CheckCircle, title: t('features.highAvailability'), desc: t('features.highAvailabilityDesc'), color: "text-yellow-500" },
              { icon: Zap, title: t('features.lowLatency'), desc: t('features.lowLatencyDesc'), color: "text-orange-500" }
            ].map((item, index) => (
              <ScrollReveal key={item.title} delay={index * 0.1}>
                <motion.div whileHover={{ scale: 1.05, x: 5 }} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex gap-4">
                    <item.icon className={`h-6 w-6 ${item.color} flex-shrink-0 mt-1`} />
                    <div>
                      <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">{item.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">{item.desc}</p>
                    </div>
                  </div>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Demo interactivo con VenIA Voice real */}
      <section id="demo" ref={demoRef}  className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <VenIAVoiceDemo />
          {/* <VenIAVoiceDemoProxy /> */}
        </div>
      </section>

      {/* CTA con botón de ventas funcional */}
   {/* CTA con botón de ventas funcional */}
<section id="ventas" ref={ctaRef} className="py-20 border-t border-yellow-500/20 bg-gradient-to-r from-yellow-500/5 to-transparent">
  <div className="max-w-4xl mx-auto text-center px-4">
    <ScrollReveal>
      <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
        {t('cta.title')} <span className="text-yellow-500">{t('cta.titleHighlight')}</span>
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        {t('cta.description')}
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        {/* Botón de llamada a ventas */}
        <SalesCallButton className="bg-yellow-500 hover:bg-yellow-600 text-black px-8 py-3 rounded-lg font-bold text-lg inline-flex items-center gap-2 shadow-lg transition-all" />
        
        {/* Botón de WhatsApp */}
        <a
          href="https://wa.me/584242211795"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg font-bold text-lg inline-flex items-center gap-2 shadow-lg transition-all transform hover:scale-105"
        >
          <MessageCircle className="h-5 w-5" />
          WhatsApp
        </a>
      </div>
    </ScrollReveal>
  </div>
</section>

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-gray-900 border-t border-yellow-500/20 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 dark:text-gray-400 text-sm">
          <p>© 2026 {t('footer.copyright')}</p>
          <p className="mt-2">{t('footer.stack')}</p>
        </div>
      </footer>
    </div>
  );
};

// App principal con Router
function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/documentation" element={<Documentation />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;