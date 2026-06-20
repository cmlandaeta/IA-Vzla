import { useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { SimpleSoftphone } from './components/SimpleSoftphone';
import { VenIAVoiceDemo } from './components/VenIAVoiceDemo';
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
  Database
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

function App() {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [callDuration, setCallDuration] = useState(0);

  // Inicializar tema al cargar
  useEffect(() => {
    // Verificar si hay preferencia guardada
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

  // Cambiar tema manualmente
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

  // Temporizador para demo
  useEffect(() => {
    let interval;
    if (isCallActive) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [isCallActive]);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDemoCall = () => {
    setIsConnecting(true);
    setTimeout(() => {
      setIsConnecting(false);
      setIsCallActive(true);
      setTranscript("📞 Conexión establecida con VenIA Voice (entorno local)\n🤖 Agente: Hola, soy VenIA Voice. Para probar el agente real, conecta tu softphone a la extensión 1000 en tu PBX local.\n\n💡 Puedo ayudarte con:\n• Atención al cliente 24/7\n• Recordatorios automáticos\n• Cobranzas personalizadas\n• Encuestas por voz");
    }, 1500);
  };

  const handleEndCall = () => {
    setIsCallActive(false);
    setTranscript("");
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
              {["Características", "Pipeline", "Demo", "Integración"].map((item, i) => (
                <motion.a
                  key={item}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  href={`#${item.toLowerCase()}`}
                  className="text-gray-700 dark:text-gray-300 hover:text-yellow-500 dark:hover:text-yellow-500 transition"
                >
                  {item}
                </motion.a>
              ))}
            </div>

            <div className="flex items-center gap-4">
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
                Solicitar acceso
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
              {["Características", "Pipeline", "Demo", "Integración"].map((item) => (
                <a key={item} href={`#${item.toLowerCase()}`} className="block py-2 text-gray-700 dark:text-gray-300 hover:text-yellow-500">
                  {item}
                </a>
              ))}
              <button className="w-full bg-yellow-500 text-black py-2 rounded-lg font-semibold">Solicitar acceso</button>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
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
              <span className="text-md font-medium text-yellow-500">IA para PBX en Venezuela, LATAM y Europa</span>
            </motion.div>
            <motion.h1 variants={fadeInUp} className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">
              Agente IA para{" "}
              <span className="text-yellow-500">Asterisk</span> y{" "}
              <span className="text-yellow-500">FreeSWITCH</span>
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10">
              Integra inteligencia artificial a tu central telefónica e IVR en minutos. 
              Atención al cliente, cobranzas, recordatorios y más, 100% local o en la nube.
            </motion.p>
            <motion.div href={"#demo"} variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-yellow-500 hover:bg-yellow-600 text-black px-8 py-3 rounded-lg font-bold text-lg transition transform hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2">
                <Phone className="h-5 w-5" />
                Probar agente ahora
              </button>
              <button className="border border-yellow-500/50 hover:border-yellow-500 px-8 py-3 rounded-lg font-semibold transition transform hover:scale-105 text-gray-900 dark:text-white">
                Ver documentación
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Integración con PBX */}
      <section id="integración" className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
                Integración <span className="text-yellow-500">simple y directa</span>
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Conecta VenIA Voice a tu PBX existente en menos de 5 minutos sin cambiar tu infraestructura
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-yellow-500/20 p-6 md:p-10 shadow-xl">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                
                {/* 1. Softphone */}
                <div className="w-full lg:w-1/5 text-center">
                  <Tooltip content="Usuario llama desde su navegador o softphone SIP">
                    <motion.div whileHover={{ scale: 1.05 }} className="bg-yellow-500/10 border border-yellow-500 rounded-xl p-4">
                      <Phone className="h-10 w-10 text-yellow-500 mx-auto mb-2" />
                      <p className="font-semibold text-gray-900 dark:text-white">DID</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Tu cliente llama</p>
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
                  <Tooltip content="Tu central telefónica existente (Asterisk o FreeSWITCH)">
                    <motion.div whileHover={{ scale: 1.05 }} className="bg-yellow-500/10 border border-yellow-500 rounded-xl p-4">
                      <Server className="h-10 w-10 text-yellow-500 mx-auto mb-2" />
                      <p className="font-semibold text-gray-900 dark:text-white">Tu PBX</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Asterisk / FreeSWITCH</p>
                    </motion.div>
                  </Tooltip>
                  <div className="text-yellow-500 mt-2 text-xs">Extensión</div>
                </div>

                <div className="hidden lg:block">
                  <motion.div animate={{ x: [0, 10, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}>
                    <ArrowRight className="h-6 w-6 text-yellow-500" />
                  </motion.div>
                </div>

                {/* 3. VenIA Voice */}
                <div className="w-full lg:w-1/5 text-center">
                  <Tooltip content="Agente IA que procesa la llamada en tiempo real">
                    <motion.div whileHover={{ scale: 1.05 }} className="bg-yellow-500/20 border-2 border-yellow-500 rounded-xl p-4">
                      <Database className="h-10 w-10 text-yellow-500 mx-auto mb-2" />
                      <p className="font-bold text-yellow-500">VenIA Voice</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Agente IA local</p>
                    </motion.div>
                  </Tooltip>
                  <div className="text-yellow-500 mt-2 text-xs"> IA Voice Stack</div>
                </div>

                <div className="hidden lg:block">
                  <motion.div animate={{ x: [0, 10, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}>
                    <ArrowRight className="h-6 w-6 text-yellow-500" />
                  </motion.div>
                </div>

                {/* 4. Respuesta */}
                <div className="w-full lg:w-1/5 text-center">
                  <Tooltip content="Respuesta generada por IA con voz natural">
                    <motion.div whileHover={{ scale: 1.05 }} className="bg-yellow-500/10 border border-yellow-500 rounded-xl p-4">
                      <Volume2 className="h-10 w-10 text-yellow-500 mx-auto mb-2" />
                      <p className="font-semibold text-gray-900 dark:text-white">Respuesta IA</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Voz natural</p>
                    </motion.div>
                  </Tooltip>
                </div>
              </div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 p-4 bg-yellow-500/5 rounded-lg border border-yellow-500/20">
                <p className="text-sm text-gray-700 dark:text-gray-300 text-center">
                  <span className="font-mono text-yellow-500">Proceso: </span>
                  Tu cliente llama — Tu agente procesa la llamada y responde con IA en tiempo real
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
                Pipeline de voz <span className="text-yellow-500">optimizado</span>
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Stack moderno para latencia ultra baja y calidad de conversación humana
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Mic, title: "STT", subtitle: "Speech-to-Text", description: "Whisper / Voxtral local para máxima privacidad y velocidad", metric: "98% precisión", color: "from-blue-500 to-cyan-500" },
              { icon: Cpu, title: "LLM", subtitle: "Procesamiento", description: "Modelo local (Llama 3 / Mistral) o API con respaldo offline", metric: "<500ms", color: "from-purple-500 to-pink-500" },
              { icon: Volume2, title: "TTS", subtitle: "Text-to-Speech", description: "Kokoro / Chatterbox con clonación de voz para respuestas naturales", metric: "Voz humana", color: "from-green-500 to-emerald-500" }
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
            * Todo el pipeline puede ejecutarse 100% local en tu servidor
          </motion.div>
        </div>
      </section>

      {/* Características */}
      <section id="características" className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: "Soberanía de datos", desc: "Todo el procesamiento local. Tus conversaciones nunca salen de tu infraestructura.", color: "text-red-500" },
              { icon: LayoutTemplate, title: "Plug & Play", desc: "Conecta a cualquier PBX existente. Funciona con tus troncales SIP actuales.", color: "text-green-500" },
              { icon: Webhook, title: "APIs abiertas", desc: "REST y WebSocket para integrar con CRM, bases de datos o sistemas propios.", color: "text-blue-500" },
              { icon: Globe, title: "Multilenguaje", desc: "Soporta español, inglés y más de 70 idiomas.", color: "text-purple-500" },
              { icon: CheckCircle, title: "Alta disponibilidad", desc: "Sistema diseñado para operar 24/7 con respaldo automático.", color: "text-yellow-500" },
              { icon: Zap, title: "Baja latencia", desc: "Respuestas en menos de 500ms para conversaciones fluidas.", color: "text-orange-500" }
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

      {/* Demo */}
      {/* <section id="demo" className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-yellow-500/20 p-8 shadow-xl">
              <h2 className="text-2xl font-bold mb-2 text-center text-gray-900 dark:text-white">Prueba el agente</h2>
              <p className="text-gray-600 dark:text-gray-400 text-center mb-8">Simulador de llamada (entorno local)</p>

              <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <motion.div animate={isCallActive ? { scale: [1, 1.2, 1] } : {}} transition={{ duration: 1, repeat: Infinity }} className={`h-3 w-3 rounded-full ${isCallActive ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-sm font-mono text-gray-700 dark:text-gray-300">
                      {isCallActive ? `Llamada activa · ${formatDuration(callDuration)}` : 'Desconectado'}
                    </span>
                  </div>
                  {isCallActive && <span className="text-xs text-yellow-500">Extensión: 1000</span>}
                </div>
                
                <div className="bg-black/5 dark:bg-black/50 rounded-lg p-4 h-40 overflow-y-auto font-mono text-sm">
                  {transcript ? (
                    <pre className="whitespace-pre-wrap text-gray-800 dark:text-gray-300">{transcript}</pre>
                  ) : (
                    <p className="text-gray-400 dark:text-gray-600 text-center pt-12">Presiona "Iniciar llamada" para conectar con el agente local</p>
                  )}
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                {!isCallActive ? (
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleDemoCall} disabled={isConnecting} className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition disabled:opacity-50 shadow-lg">
                    {isConnecting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Phone className="h-5 w-5" />}
                    {isConnecting ? "Conectando..." : "Iniciar llamada de prueba"}
                  </motion.button>
                ) : (
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleEndCall} className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition shadow-lg">
                    <Phone className="h-5 w-5" />
                    Finalizar llamada
                  </motion.button>
                )}
              </div>

              <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-4">
                📌 Demo simulada. Para probar el agente real: configura tu softphone a la extensión 1000 de tu PBX local
              </div>
            </div>
          </ScrollReveal>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-yellow-500/20 p-8 shadow-xl">
          <SimpleSoftphone />
        </div>
      </section> */}

      {/* Demo interactivo con VenIA Voice real */}
<section id="demo" className="py-20">
  <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
    <VenIAVoiceDemo />
  </div>
</section>

      {/* CTA */}
      <section className="py-20 border-t border-yellow-500/20 bg-gradient-to-r from-yellow-500/5 to-transparent">
        <div className="max-w-4xl mx-auto text-center px-4">
          <ScrollReveal>
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
              ¿Listo para automatizar tu <span className="text-yellow-500">central telefónica?</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">Implementamos VenIA Voice en tu infraestructura. Soporte local en Venezuela.</p>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="bg-yellow-500 hover:bg-yellow-600 text-black px-8 py-3 rounded-lg font-bold text-lg inline-flex items-center gap-2 shadow-lg transition-all">
              Contactar ventas
              <ChevronRight className="h-5 w-5" />
            </motion.button>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-gray-900 border-t border-yellow-500/20 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 dark:text-gray-400 text-sm">
          <p>© 2026 VenIA Voice - Agente IA para PBX en Venezuela, LATAM y EUROPA</p>
          <p className="mt-2">Asterisk • FreeSWITCH • Pipeline • Local IA Stack</p>
        </div>
      </footer>
    </div>
  );
}

export default App;