import { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, Loader2, Mic, Volume2, ChevronDown, ChevronUp, MessageSquare, Wifi, WifiOff } from 'lucide-react';
import { UserAgent, Registerer, Inviter } from 'sip.js';
import { URI } from 'sip.js';
import { useLanguage } from '../contexts/LanguageContext';
import { TranscriptionPanel } from './TranscriptionPanel';
import {SecurityWarning}  from './SecurityWarning'

// Leer variables de entorno
const SIP_CONFIG = {
  displayName: import.meta.env.VITE_SIP_DISPLAY_NAME || 'VenIA User',
  domain: import.meta.env.VITE_SIP_DOMAIN,
  username: import.meta.env.VITE_SIP_USERNAME,
  password: import.meta.env.VITE_SIP_PASSWORD,
  wssUrl: import.meta.env.VITE_SIP_WSS_URL,
  wssUrl2:import.meta.env.VITE_URL_TRANSCRIPTION,
  agentExtension: import.meta.env.VITE_AGENT_EXTENSION || '99990',
  expires: parseInt(import.meta.env.VITE_SIP_EXPIRES || '3600'),
  extensionRangeStart: parseInt(import.meta.env.VITE_EXTENSION_RANGE_START || '1011'),
  extensionRangeEnd: parseInt(import.meta.env.VITE_EXTENSION_RANGE_END || '1019')
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
  const [currentCallUuid, setCurrentCallUuid] = useState(null);
  const [sslAccepted, setSslAccepted] = useState(false);
  const [showSecurityWarning, setShowSecurityWarning] = useState(true);
  
  const userAgentRef = useRef(null);
  const registererRef = useRef(null);
  const currentSessionRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const durationIntervalRef = useRef(null);
  const transcriptionWsRef = useRef(null);
  
  // Validar configuración al inicio
  useEffect(() => {
    const missingVars = [];
    if (!SIP_CONFIG.domain) missingVars.push('VITE_SIP_DOMAIN');
    //if (!SIP_CONFIG.username) missingVars.push('VITE_SIP_USERNAME');
    if (!SIP_CONFIG.password) missingVars.push('VITE_SIP_PASSWORD');
    if (!SIP_CONFIG.wssUrl) missingVars.push('VITE_SIP_WSS_URL');
    
    if (missingVars.length > 0) {
      setConfigError(`Missing env variables: ${missingVars.join(', ')}`);
      setIsConnecting(false);
    }
  }, []);

    const handleSslAccept = () => {
    setSslAccepted(true);
    setShowSecurityWarning(false);
    // Si ya hay un clientId, intentar reconectar
    // if (clientId) {
    //   // Forzar reconexión del WebSocket
    //   // Puedes disparar un efecto o simplemente recargar la página
    // }
  };
  
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
  
  // Temporizador de llamada
  useEffect(() => {
    if (isCallActive) {
      durationIntervalRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => {
      if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
    };
  }, [isCallActive]);
  
  // Llamar al agente
  const callAgent = async () => {
    if (!userAgentRef.current || !isRegistered) {
      addLog('Not registered to FreeSWITCH', true);
      return;
    }
    
    setIsCalling(true);

      // Generar un ID único para este cliente (usar la extensión actual)
  const clientId = currentExtension.toString(); // Usar la extensión como identificador
  
  // Registrar este cliente en el WebSocket de transcripciones
  if (transcriptionWsRef.current && transcriptionWsRef.current.readyState === WebSocket.OPEN) {
    transcriptionWsRef.current.send(JSON.stringify({
      type: 'register-call',
      callUuid: clientId
    }));
  }
    
    try {
      const targetUri = new URI('sip', SIP_CONFIG.agentExtension, SIP_CONFIG.domain);
      
      const inviter = new Inviter(userAgentRef.current, targetUri, {
        sessionDescriptionHandlerOptions: {
          constraints: { audio: true, video: false }
        }
      });
      
      currentSessionRef.current = inviter;
      
      inviter.stateChange.addListener((state) => {
        switch (state) {
          case 'Establishing':
            addLog('Establishing connection...');
            break;
          case 'Established':
            setIsCallActive(true);
            setIsCalling(false);
              // Usar clientId en lugar de generar UUID
            setCurrentCallUuid(clientId);
        
            //setTranscript('🎙️ ' + t('demo.connected'));
            setupRemoteAudio(inviter);
            addLog('✅ Call established with AI agent');
            break;
          case 'Terminated':
            setIsCallActive(false);
            setIsCalling(false);
            if (remoteAudioRef.current) remoteAudioRef.current.srcObject = null;
            currentSessionRef.current = null;
            setTranscript('');
            addLog('📴 Call ended');
            break;
        }
      });
      
      inviter.delegate = {
        onProgress: () => addLog('Call in progress...'),
        onReject: (response) => {
          addLog(`❌ Call rejected: ${response.message.reasonPhrase || response.message.statusCode}`, true);
          setIsCalling(false);
          currentSessionRef.current = null;
        }
      };
      
      await inviter.invite();
      addLog(`📞 Calling extension ${SIP_CONFIG.agentExtension}...`);
      
    } catch (error) {
      addLog(`❌ Error: ${error.message}`, true);
      setIsCalling(false);
      currentSessionRef.current = null;
    }
  };
  
  const hangup = async () => {
    if (!currentSessionRef.current) return;
    
    try {
      await currentSessionRef.current.bye();
      addLog('Hanging up...');
    } catch (error) {
      addLog(`Error: ${error.message}`, true);
    }
    
    setIsCallActive(false);
    setIsCalling(false);
    if (remoteAudioRef.current) remoteAudioRef.current.srcObject = null;
    currentSessionRef.current = null;
    setTranscript('');
  };
  
  // Mostrar error de configuración si existe
  if (configError) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-red-500/20 p-6 md:p-8 shadow-xl">
        <h2 className="text-2xl font-bold mb-2 text-center text-gray-900 dark:text-white">
          {t('demo.title')}
        </h2>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 text-center">
          <p className="text-red-600 dark:text-red-400 text-sm">{configError}</p>
          <p className="text-gray-500 dark:text-gray-400 text-xs mt-2">
            {t('demo.configError')}
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-yellow-500/20 p-6 md:p-8 shadow-xl">
      <h2 className="text-2xl font-bold mb-2 text-center text-gray-900 dark:text-white">
        {t('demo.title')}
      </h2>
      <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
        {t('demo.subtitle')}
      </p>

      

           {/* Aviso de seguridad SSL */}
      <div className="bg-yellow-500/10 border border-yellow-500 rounded-lg p-4 mb-4">
        <p className="text-sm text-yellow-700 dark:text-yellow-300">
          ⚠️ <strong>{t('demo.securityWarning')}</strong> {t('demo.securityWarningText')}
          <a 
            href={SIP_CONFIG.wssUrl?.replace('wss://', 'https://').replace('ws://', 'http://')} 
            target="_blank" 
            className="underline font-bold mx-1"
          >
            {t('demo.clickHere')}
             <a 
            href={SIP_CONFIG.wssUrl2?.replace('wss://', 'https://').replace('ws://', 'http://')} 
            target="_blank" 
            className="underline font-bold mx-1"
          >
            {t('demo.clickHere')}
          </a>
          </a>
         
       
          {t('demo.acceptCertificate')}
        </p>
      </div>

      {/* Aviso de seguridad SSL - VERSIÓN MEJORADA */}
    {/* {showSecurityWarning && !sslAccepted && (
      <SecurityWarning 
        wssUrl={SIP_CONFIG.wssUrl}
        onAccept={handleSslAccept}
      />
    )} */}

    
        {/* Panel de transcripción y clientes */}
      <TranscriptionPanel callUuid={currentCallUuid} clientId={currentExtension.toString()} />
      
 {/* Estado de conexión */}
<div className="flex items-center justify-center gap-2 mb-6">
  {isConnecting ? (
    <>
      <Wifi className="h-4 w-4 text-yellow-500 animate-pulse" />
      <span className="text-sm text-yellow-500">{t('demo.connecting')}</span>
    </>
  ) : isRegistered ? (
    <>
      <Wifi className="h-4 w-4 text-green-500" />
      <span className="text-sm text-green-500">{t('demo.registered')}</span>
    </>
  ) : (
    <>
      <WifiOff className="h-4 w-4 text-red-500" />
      <span className="text-sm text-red-500">{t('demo.error')}</span>
    </>
  )}
</div>
      
      {/* Controles de llamada */}
      <div className="flex justify-center gap-4 mb-4">
        {!isCallActive && !isCalling && isRegistered && (
          <button
            onClick={callAgent}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition transform hover:scale-105 shadow-lg"
          >
            <Phone className="h-5 w-5" />
            {t('demo.callAgent')}
          </button>
        )}
        
        {isCalling && (
          <button
            disabled
            className="bg-yellow-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 opacity-70 cursor-wait"
          >
            <Loader2 className="h-5 w-5 animate-spin" />
            {t('demo.calling')}
          </button>
        )}
        
        {isCallActive && (
          <button
            onClick={hangup}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition transform hover:scale-105 shadow-lg"
          >
            <PhoneOff className="h-5 w-5" />
            {t('demo.endCall')}
          </button>
        )}
      </div>
      
      {/* Estado de llamada */}
      {isCallActive && (
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
            <Mic className="h-3 w-3 text-green-600 dark:text-green-400 animate-pulse" />
            <span className="text-xs font-medium text-green-700 dark:text-green-300">
              {t('demo.activeCall')} · {formatDuration(callDuration)}
            </span>
          </div>
        </div>
      )}
      
      {/* Logs discretos */}
      <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-3">
        <button
          onClick={() => setShowLogs(!showLogs)}
          className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-yellow-500 transition mx-auto"
        >
          {showLogs ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          {showLogs ? t('demo.hideLogs') : t('demo.showLogs')}
        </button>
        
        {showLogs && (
          <div className="mt-2 p-2 bg-gray-900 rounded-lg max-h-32 overflow-y-auto">
            {logs.map((log, i) => (
              <div key={i} className={`text-xs font-mono ${log.isError ? 'text-red-400' : 'text-green-400'}`}>
                {log.text}
              </div>
            ))}
            {logs.length === 0 && (
              <div className="text-xs text-gray-500">{t('demo.noLogs')}</div>
            )}
          </div>
        )}
      </div>
      
      <div className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-3">
        {t('demo.footer')}
      </div>
      
      {/* Elemento de audio oculto */}
      <audio id="venia-remote-audio" style={{ display: 'none' }} />
    </div>
  );
};