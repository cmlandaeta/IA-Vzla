import { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, Loader2, Mic, Volume2, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';
import { UserAgent, Registerer, Inviter } from 'sip.js';
import { URI } from 'sip.js';

// Leer variables de entorno
const SIP_CONFIG = {
  displayName: import.meta.env.VITE_SIP_DISPLAY_NAME || 'VenIA User',
  domain: import.meta.env.VITE_SIP_DOMAIN,
  username: import.meta.env.VITE_SIP_USERNAME,
  password: import.meta.env.VITE_SIP_PASSWORD,
  wssUrl: import.meta.env.VITE_SIP_WSS_URL,
  agentExtension: import.meta.env.VITE_AGENT_EXTENSION || '1000',
  expires: parseInt(import.meta.env.VITE_SIP_EXPIRES || '3600')
};

export const VenIAVoiceDemo = () => {
  const [isRegistered, setIsRegistered] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [callDuration, setCallDuration] = useState(0);
  const [showLogs, setShowLogs] = useState(false);
  const [logs, setLogs] = useState([]);
  const [configError, setConfigError] = useState(null);
  
  const userAgentRef = useRef(null);
  const registererRef = useRef(null);
  const currentSessionRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const durationIntervalRef = useRef(null);
  
  // Validar configuración al inicio
  useEffect(() => {
    const missingVars = [];
    if (!SIP_CONFIG.domain) missingVars.push('VITE_SIP_DOMAIN');
    if (!SIP_CONFIG.username) missingVars.push('VITE_SIP_USERNAME');
    if (!SIP_CONFIG.password) missingVars.push('VITE_SIP_PASSWORD');
    if (!SIP_CONFIG.wssUrl) missingVars.push('VITE_SIP_WSS_URL');
    
    if (missingVars.length > 0) {
      setConfigError(`Faltan variables de entorno: ${missingVars.join(', ')}`);
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
          addLog(`⚠️ Autoplay bloqueado: ${e.message}`, true);
          const playOnInteraction = () => {
            remoteAudioRef.current?.play().catch(() => {});
            document.removeEventListener('click', playOnInteraction);
          };
          document.addEventListener('click', playOnInteraction);
        });
        addLog('🎵 Audio configurado');
      }
    } catch (error) {
      addLog(`Error de audio: ${error.message}`, true);
    }
  };
  
  // Conectar y registrar
  useEffect(() => {
    if (configError) return;
    
    const connect = async () => {
      try {
        setIsConnecting(true);
        addLog(`Conectando a ${SIP_CONFIG.domain} como ${SIP_CONFIG.username}...`);
        
        const uri = new URI('sip', SIP_CONFIG.username, SIP_CONFIG.domain);
        
        const userAgent = new UserAgent({
          uri,
          transportOptions: { server: SIP_CONFIG.wssUrl },
          authorizationUsername: SIP_CONFIG.username,
          authorizationPassword: SIP_CONFIG.password,
          displayName: SIP_CONFIG.displayName,
          userAgentString: 'VenIA Voice/1.0',
          delegate: {
            onConnect: () => addLog('WebSocket conectado'),
            onDisconnect: () => addLog('WebSocket desconectado'),
            onInvite: (invitation) => {
              addLog(`Llamada entrante rechazada`);
              invitation.reject();
            }
          }
        });
        
        userAgentRef.current = userAgent;
        await userAgent.start();
        
        const registerer = new Registerer(userAgent, { expires: SIP_CONFIG.expires });
        registererRef.current = registerer;
        
        registerer.stateChange.addListener((state) => {
          addLog(`Estado registro: ${state}`);
          if (state === 'Registered') {
            setIsRegistered(true);
            setIsConnecting(false);
            addLog(`✅ Extensión ${SIP_CONFIG.username} registrada en ${SIP_CONFIG.domain}`);
          } else if (state === 'Unregistered') {
            setIsRegistered(false);
          }
        });
        
        await registerer.register();
        
        // Crear elemento de audio
        let audioEl = document.getElementById('venia-remote-audio');
        if (!audioEl) {
          audioEl = document.createElement('audio');
          audioEl.id = 'venia-remote-audio';
          audioEl.autoplay = true;
          audioEl.style.display = 'none';
          document.body.appendChild(audioEl);
        }
        remoteAudioRef.current = audioEl;
        
      } catch (error) {
        setIsConnecting(false);
        addLog(`Error: ${error.message}`, true);
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
  }, [configError]);
  
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
      addLog('No registrado en FreeSWITCH', true);
      return;
    }
    
    setIsCalling(true);
    
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
            addLog('Estableciendo conexión...');
            break;
          case 'Established':
            setIsCallActive(true);
            setIsCalling(false);
            setTranscript('🎙️ Conectado al agente VenIA Voice. ¡Empieza a hablar!');
            setupRemoteAudio(inviter);
            addLog('✅ Llamada establecida con el agente IA');
            break;
          case 'Terminated':
            setIsCallActive(false);
            setIsCalling(false);
            if (remoteAudioRef.current) remoteAudioRef.current.srcObject = null;
            currentSessionRef.current = null;
            setTranscript('');
            addLog('📴 Llamada finalizada');
            break;
        }
      });
      
      inviter.delegate = {
        onProgress: () => addLog('Llamada en progreso...'),
        onReject: (response) => {
          addLog(`❌ Llamada rechazada: ${response.message.reasonPhrase || response.message.statusCode}`, true);
          setIsCalling(false);
          currentSessionRef.current = null;
        }
      };
      
      await inviter.invite();
      addLog(`📞 Llamando a extensión ${SIP_CONFIG.agentExtension}...`);
      
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
      addLog('Colgando llamada...');
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
          Error de configuración
        </h2>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 text-center">
          <p className="text-red-600 dark:text-red-400 text-sm">{configError}</p>
          <p className="text-gray-500 dark:text-gray-400 text-xs mt-2">
            Verifica las variables de entorno en el servidor
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-yellow-500/20 p-6 md:p-8 shadow-xl">
      <h2 className="text-2xl font-bold mb-2 text-center text-gray-900 dark:text-white">
        Prueba el agente
      </h2>
      <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
        Llamada real a VenIA Voice 
      </p>

      <div className="bg-yellow-500/10 border border-yellow-500 rounded-lg p-4 mb-4">
  <p className="text-sm text-yellow-700 dark:text-yellow-300">
    ⚠️ <strong>Configuración de seguridad:</strong> Por favor, antes de usar el softphone, 
    <a href="https://45e4028ea1f5.sn.mynetname.net:7443" 
       target="_blank" 
       className="underline font-bold mx-1">
       haz clic aquí
    </a>
    y acepta el certificado SSL para establecer la conexión segura.
  </p>
</div>
      
      {/* Estado de conexión */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <div className={`h-2 w-2 rounded-full ${isRegistered ? 'bg-green-500' : isConnecting ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'}`}></div>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {/* {isConnecting ? 'Conectando a FreeSWITCH...' : isRegistered ? `✅ ${SIP_CONFIG.username} registrada` : '❌ Error de conexión'} */}
          {isConnecting ? 'Conectando a FreeSWITCH...' : isRegistered ? ` Extensión registrada` : '❌ Error de conexión'}
        </span>
      </div>
      
      {/* Área de conversación/transcript */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 mb-6 min-h-[120px]">
        <div className="flex items-center gap-2 mb-3 border-b border-gray-200 dark:border-gray-700 pb-2">
          <MessageSquare className="h-4 w-4 text-yellow-500" />
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">CONVERSACIÓN</span>
        </div>
        <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
          {transcript || 'Esperando llamada...'}
        </div>
      </div>
      
      {/* Controles de llamada */}
      <div className="flex justify-center gap-4 mb-4">
        {!isCallActive && !isCalling && isRegistered && (
          <button
            onClick={callAgent}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition transform hover:scale-105 shadow-lg"
          >
            <Phone className="h-5 w-5" />
            Llamar a VenIA
          </button>
        )}
        
        {isCalling && (
          <button
            disabled
            className="bg-yellow-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 opacity-70 cursor-wait"
          >
            <Loader2 className="h-5 w-5 animate-spin" />
            Llamando...
          </button>
        )}
        
        {isCallActive && (
          <button
            onClick={hangup}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition transform hover:scale-105 shadow-lg"
          >
            <PhoneOff className="h-5 w-5" />
            Finalizar llamada
          </button>
        )}
      </div>
      
      {/* Estado de llamada */}
      {isCallActive && (
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
            <Mic className="h-3 w-3 text-green-600 dark:text-green-400 animate-pulse" />
            <span className="text-xs font-medium text-green-700 dark:text-green-300">
              Llamada activa · {formatDuration(callDuration)}
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
          {showLogs ? 'Ocultar' : 'Mostrar'} logs de depuración
        </button>
        
        {showLogs && (
          <div className="mt-2 p-2 bg-gray-900 rounded-lg max-h-32 overflow-y-auto">
            {logs.map((log, i) => (
              <div key={i} className={`text-xs font-mono ${log.isError ? 'text-red-400' : 'text-green-400'}`}>
                {log.text}
              </div>
            ))}
            {logs.length === 0 && (
              <div className="text-xs text-gray-500">No hay logs disponibles</div>
            )}
          </div>
        )}
      </div>
      
      <div className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-3">
         Llamada real  • Tu agente IA procesa la conversación
      </div>
      
      {/* Elemento de audio oculto */}
      <audio id="venia-remote-audio" style={{ display: 'none' }} />
    </div>
  );
};