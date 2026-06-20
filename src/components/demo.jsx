import { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, Loader2, Mic, Volume2, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';
import { UserAgent, Registerer, Inviter } from 'sip.js';
import { URI } from 'sip.js';
import { useLanguage } from '../contexts/LanguageContext';

// Leer variables de entorno
const SIP_CONFIG = {
  displayName: import.meta.env.VITE_SIP_DISPLAY_NAME || 'VenIA User',
  domain: import.meta.env.VITE_SIP_DOMAIN,
  domainFull: import.meta.env.VITE_SIP_DOMAIN_FULL || import.meta.env.VITE_SIP_DOMAIN,
  password: import.meta.env.VITE_SIP_PASSWORD,
  wssUrl: import.meta.env.VITE_SIP_WSS_URL,
  agentExtension: import.meta.env.VITE_AGENT_EXTENSION || '99990',
  expires: parseInt(import.meta.env.VITE_SIP_EXPIRES || '3600'),
  // Rango de extensiones dinámicas (debes crear estas extensiones en FreeSWITCH)
  extensionRangeStart: parseInt(import.meta.env.VITE_EXTENSION_RANGE_START || '2000'),
  extensionRangeEnd: parseInt(import.meta.env.VITE_EXTENSION_RANGE_END || '3000')
};

// Generar ID único para esta sesión
const sessionId = Math.random().toString(36).substring(2, 8);
const extension = Math.floor(Math.random() * 
  (SIP_CONFIG.extensionRangeEnd - SIP_CONFIG.extensionRangeStart + 1) + 
  SIP_CONFIG.extensionRangeStart
);

export const VenIAVoiceDemo = () => {
  const { t } = useLanguage();
  const [isRegistered, setIsRegistered] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [callDuration, setCallDuration] = useState(0);
  const [showLogs, setShowLogs] = useState(false);
  const [logs, setLogs] = useState([]);
  const [configError, setConfigError] = useState(null);
  const [currentExtension, setCurrentExtension] = useState(extension);
  
  const userAgentRef = useRef(null);
  const registererRef = useRef(null);
  const currentSessionRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const durationIntervalRef = useRef(null);
  
  // Validar configuración al inicio
  useEffect(() => {
    const missingVars = [];
    if (!SIP_CONFIG.domain) missingVars.push('VITE_SIP_DOMAIN');
    if (!SIP_CONFIG.password) missingVars.push('VITE_SIP_PASSWORD');
    if (!SIP_CONFIG.wssUrl) missingVars.push('VITE_SIP_WSS_URL');
    
    if (missingVars.length > 0) {
      setConfigError(`Missing env variables: ${missingVars.join(', ')}`);
      setIsConnecting(false);
    }
  }, []);
  
  // Agregar log
  const addLog = (message, isError = false) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = { text: `[${timestamp}] ${message}`, isError };
    setLogs(prev => [...prev.slice(-49), logEntry]);
    console.log(logEntry.text);
  };
  
  // Formatear duración
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Configurar audio remoto
  const setupRemoteAudio = (session) => {
    try {
      const sessionDescriptionHandler = session.sessionDescriptionHandler;
      if (!sessionDescriptionHandler) return;
      
      const remoteStream = sessionDescriptionHandler.remoteMediaStream;
      if (remoteStream && remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = remoteStream;
        remoteAudioRef.current.play().catch(e => {
          addLog(`⚠️ Autoplay blocked: ${e.message}`, true);
          const playOnInteraction = () => {
            remoteAudioRef.current?.play().catch(() => {});
            document.removeEventListener('click', playOnInteraction);
          };
          document.addEventListener('click', playOnInteraction);
        });
        addLog('🎵 Audio configured');
      }
    } catch (error) {
      addLog(`Audio error: ${error.message}`, true);
    }
  };
  
  // Conectar y registrar
  useEffect(() => {
    if (configError) return;
    
    const connect = async () => {
      try {
        setIsConnecting(true);
        addLog(`Connecting to ${SIP_CONFIG.domain} as extension ${currentExtension}...`);
        
        const uri = new URI('sip', currentExtension.toString(), SIP_CONFIG.domain);
        
        const userAgent = new UserAgent({
          uri,
          transportOptions: { server: SIP_CONFIG.wssUrl },
          authorizationUsername: currentExtension.toString(),
          authorizationPassword: SIP_CONFIG.password,
          displayName: `${SIP_CONFIG.displayName} (${currentExtension})`,
          userAgentString: `VenIA Voice/${sessionId}`,
          delegate: {
            onConnect: () => addLog('WebSocket connected'),
            onDisconnect: () => addLog('WebSocket disconnected'),
            onInvite: (invitation) => {
              addLog(`Incoming call rejected`);
              invitation.reject();
            }
          }
        });
        
        userAgentRef.current = userAgent;
        await userAgent.start();
        
        const registerer = new Registerer(userAgent, { expires: SIP_CONFIG.expires });
        registererRef.current = registerer;
        
        registerer.stateChange.addListener((state) => {
          addLog(`Registration state: ${state}`);
          if (state === 'Registered') {
            setIsRegistered(true);
            setIsConnecting(false);
            addLog(`✅ Extension ${currentExtension} registered to ${SIP_CONFIG.domain}`);
          } else if (state === 'Unregistered') {
            setIsRegistered(false);
          }
        });
        
        await registerer.register();
        
        // Crear elemento de audio
        let audioEl = document.getElementById(`venia-remote-audio-${sessionId}`);
        if (!audioEl) {
          audioEl = document.createElement('audio');
          audioEl.id = `venia-remote-audio-${sessionId}`;
          audioEl.autoplay = true;
          audioEl.style.display = 'none';
          document.body.appendChild(audioEl);
        }
        remoteAudioRef.current = audioEl;
        
      } catch (error) {
        setIsConnecting(false);
        addLog(`Error: ${error.message}`, true);
        // Si falla el registro con esta extensión, intentar con otra
        if (error.message.includes('403') || error.message.includes('401')) {
          const newExtension = currentExtension + 1;
          if (newExtension <= SIP_CONFIG.extensionRangeEnd) {
            addLog(`🔄 Trying with extension ${newExtension}...`);
            setCurrentExtension(newExtension);
          }
        }
      }
    };
    
    connect();
    
    return () => {
      if (currentSessionRef.current) {
        try { currentSessionRef.current.bye(); } catch(e) {}
      }
      if (registererRef.current) {
        try { registererRef.current.unregister(); } catch(e) {}
      }
      if (userAgentRef.current) {
        try { userAgentRef.current.stop(); } catch(e) {}
      }
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = null;
      }
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, [configError, currentExtension]);
  
  // ... resto del código igual (temporizador, callAgent, hangup, etc.)
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-yellow-500/20 p-6 md:p-8 shadow-xl">
      <h2 className="text-2xl font-bold mb-2 text-center text-gray-900 dark:text-white">
        {t('demo.title')}
      </h2>
      <p className="text-gray-600 dark:text-gray-400 text-center mb-2">
        {t('demo.subtitle')}
      </p>
      
      {/* Mostrar extensión actual */}
      <p className="text-center text-xs text-gray-500 dark:text-gray-400 mb-4">
        Tu extensión: <span className="font-mono text-yellow-500">{currentExtension}</span>
      </p>

      {/* Aviso de seguridad SSL - igual */}
      <div className="bg-yellow-500/10 border border-yellow-500 rounded-lg p-4 mb-4">
        <p className="text-sm text-yellow-700 dark:text-yellow-300">
          ⚠️ <strong>{t('demo.securityWarning')}</strong> {t('demo.securityWarningText')}
          <a 
            href={SIP_CONFIG.wssUrl?.replace('wss://', 'https://').replace('ws://', 'http://')} 
            target="_blank" 
            className="underline font-bold mx-1"
          >
            {t('demo.clickHere')}
          </a>
          {t('demo.acceptCertificate')}
        </p>
      </div>
      
      {/* ... resto del JSX igual ... */}
    </div>
  );
};