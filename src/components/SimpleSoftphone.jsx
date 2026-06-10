import { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, Loader2, CheckCircle, XCircle, Volume2 } from 'lucide-react';
import { UserAgent, Registerer, Inviter } from 'sip.js';
import { URI } from 'sip.js';

// Configuración fija de tu FreeSWITCH (¡CAMBIAR SEGÚN TU ENTORNO!)
const SIP_CONFIG = {
  displayName: 'VenIA User',
  domain: '192.168.15.109',        // IP de tu FreeSWITCH
  username: '1000',                // Extensión que registrarás
  password: '1000',        // Contraseña de la extensión
  wssUrl: 'wss://192.168.15.109:7443', // URL WebSocket (sin SSL para local)
  expires: 3600
};

export const SimpleSoftphone = () => {
  const [status, setStatus] = useState({
    registered: false,
    connecting: false,
    error: null
  });
  const [isCallActive, setIsCallActive] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [logs, setLogs] = useState([]);
  
  const userAgentRef = useRef(null);
  const registererRef = useRef(null);
  const currentSessionRef = useRef(null);
  const remoteAudioRef = useRef(null); // Referencia al elemento de audio
  
  // Agregar log
  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    setLogs(prev => [...prev.slice(-19), logEntry]);
    console.log(logEntry);
  };
  
  // Configurar elemento de audio remoto
  useEffect(() => {
    // Crear elemento de audio si no existe
    let audioElement = document.getElementById('remoteAudio');
    if (!audioElement) {
      audioElement = document.createElement('audio');
      audioElement.id = 'remoteAudio';
      audioElement.autoplay = true;
      audioElement.style.display = 'none';
      document.body.appendChild(audioElement);
    }
    remoteAudioRef.current = audioElement;
    
    return () => {
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = null;
      }
    };
  }, []);
  
  // Conectar y registrar extensión al cargar el componente
  useEffect(() => {
    connectAndRegister();
    
    return () => {
      disconnect();
    };
  }, []);
  
  const connectAndRegister = async () => {
    try {
      setStatus({ registered: false, connecting: true, error: null });
      
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
          onDisconnect: (error) => addLog(`WebSocket desconectado: ${error?.message || 'razón desconocida'}`),
          onInvite: (invitation) => {
            addLog(`📞 Llamada entrante de: ${invitation.remoteIdentity.uri.user}`);
            // Auto-rechazar otras llamadas
            invitation.reject().catch(e => addLog(`Error al rechazar: ${e.message}`));
          }
        }
      });
      
      userAgentRef.current = userAgent;
      await userAgent.start();
      addLog('UserAgent iniciado');
      
      const registerer = new Registerer(userAgent, { expires: SIP_CONFIG.expires });
      registererRef.current = registerer;
      
      registerer.stateChange.addListener((state) => {
        addLog(`Estado de registro: ${state}`);
        if (state === 'Registered') {
          setStatus({ registered: true, connecting: false, error: null });
          addLog(`✅ Extensión ${SIP_CONFIG.username} registrada en FreeSWITCH`);
        } else if (state === 'Unregistered') {
          setStatus({ registered: false, connecting: false, error: null });
        }
      });
      
      await registerer.register();
      addLog('Solicitud de registro enviada');
      
    } catch (error) {
      setStatus({ registered: false, connecting: false, error: error.message });
      addLog(`❌ Error de registro: ${error.message}`);
    }
  };
  
  // Configurar audio remoto cuando la sesión se establece
  const setupRemoteAudio = (session) => {
    try {
      const sessionDescriptionHandler = session.sessionDescriptionHandler;
      if (!sessionDescriptionHandler) {
        addLog('⚠️ No hay SessionDescriptionHandler disponible');
        return;
      }
      
      // Obtener el stream remoto
      const remoteStream = sessionDescriptionHandler.remoteMediaStream;
      if (remoteStream && remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = remoteStream;
        remoteAudioRef.current.play().catch(e => {
          addLog(`⚠️ Error al reproducir audio: ${e.message}`);
          // Intentar reproducir con interacción del usuario
          const playOnInteraction = () => {
            remoteAudioRef.current?.play().catch(() => {});
            document.removeEventListener('click', playOnInteraction);
          };
          document.addEventListener('click', playOnInteraction);
        });
        addLog('🎵 Audio remoto configurado correctamente');
      } else {
        addLog('⚠️ No se recibió stream de audio remoto');
      }
    } catch (error) {
      addLog(`❌ Error configurando audio: ${error.message}`);
    }
  };
  
  // Llamar a la extensión 1000 (tu bot IA)
  const callAgent = async () => {
    if (!userAgentRef.current || !status.registered) {
      addLog('❌ No registrado en FreeSWITCH');
      return;
    }
    
    setIsCalling(true);
    
    try {
      const targetUri = new URI('sip', '99990', SIP_CONFIG.domain);
      
      const inviter = new Inviter(userAgentRef.current, targetUri, {
        sessionDescriptionHandlerOptions: {
          constraints: { audio: true, video: false }
        }
      });
      
      currentSessionRef.current = inviter;
      
      // Manejar estado de la sesión
      inviter.stateChange.addListener((state) => {
        addLog(`Estado de sesión: ${state}`);
        switch (state) {
          case 'Establishing':
            addLog('📞 Estableciendo conexión con el agente IA...');
            break;
          case 'Established':
            setIsCallActive(true);
            setIsCalling(false);
            addLog('🎙️ Conectado al agente VenIA Voice. ¡Empieza a hablar!');
            // Configurar el audio remoto
            setupRemoteAudio(inviter);
            break;
          case 'Terminated':
            setIsCallActive(false);
            setIsCalling(false);
            // Limpiar audio remoto
            if (remoteAudioRef.current) {
              remoteAudioRef.current.srcObject = null;
            }
            currentSessionRef.current = null;
            addLog('📴 Llamada finalizada');
            break;
        }
      });
      
      // Manejar respuestas
      inviter.delegate = {
        onProgress: (response) => {
          addLog(`⏳ Llamada en progreso... (${response.message.statusCode} ${response.message.reasonPhrase})`);
        },
        onReject: (response) => {
          addLog(`❌ Llamada rechazada: ${response.message.reasonPhrase || response.message.statusCode}`);
          setIsCalling(false);
          currentSessionRef.current = null;
          if (remoteAudioRef.current) {
            remoteAudioRef.current.srcObject = null;
          }
        }
      };
      
      await inviter.invite();
      addLog(`📞 Llamando al agente IA (extensión 1000)...`);
      
    } catch (error) {
      addLog(`❌ Error al llamar: ${error.message}`);
      setIsCalling(false);
      currentSessionRef.current = null;
    }
  };
  
  const hangup = async () => {
    if (!currentSessionRef.current) return;
    
    try {
      addLog('📴 Colgando llamada...');
      await currentSessionRef.current.bye();
    } catch (error) {
      addLog(`Error al colgar: ${error.message}`);
    }
    
    setIsCallActive(false);
    setIsCalling(false);
    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null;
    }
    currentSessionRef.current = null;
  };
  
  const disconnect = async () => {
    if (currentSessionRef.current) {
      try { await currentSessionRef.current.bye(); } catch(e) {}
    }
    
    if (registererRef.current) {
      try { await registererRef.current.unregister(); } catch(e) {}
    }
    
    if (userAgentRef.current) {
      try { await userAgentRef.current.stop(); } catch(e) {}
    }
    
    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null;
    }
  };
  
  const getStatusIcon = () => {
    if (status.connecting) return <Loader2 className="h-5 w-5 text-yellow-500 animate-spin" />;
    if (status.registered) return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (status.error) return <XCircle className="h-5 w-5 text-red-500" />;
    return <XCircle className="h-5 w-5 text-gray-500" />;
  };
  
  const getStatusText = () => {
    if (status.connecting) return 'Conectando a FreeSWITCH...';
    if (status.registered) return '✅ Extensión registrada';
    if (status.error) return `Error: ${status.error}`;
    return 'Desconectado';
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-yellow-500/20 p-6 shadow-xl">
      <h3 className="text-xl font-bold mb-4 text-center text-gray-900 dark:text-white">
        Probar agente IA
      </h3>
      
      {/* Estado de registro SIP */}
      <div className="flex items-center justify-center gap-2 mb-6 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
        {getStatusIcon()}
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {getStatusText()}
        </span>
      </div>
      
      {/* Controles de llamada */}
      <div className="flex justify-center gap-4">
        {!isCallActive && !isCalling && status.registered && (
          <button
            onClick={callAgent}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition transform hover:scale-105 shadow-lg"
          >
            <Phone className="h-6 w-6" />
            Llamar a IA
          </button>
        )}
        
        {isCalling && (
          <button
            disabled
            className="flex items-center gap-2 bg-yellow-500 text-white px-8 py-4 rounded-xl font-bold text-lg opacity-50 cursor-not-allowed"
          >
            <Loader2 className="h-6 w-6 animate-spin" />
            Llamando...
          </button>
        )}
        
        {isCallActive && (
          <button
            onClick={hangup}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition transform hover:scale-105 shadow-lg"
          >
            <PhoneOff className="h-6 w-6" />
            Colgar
          </button>
        )}
      </div>
      
      {/* Indicador de audio activo */}
      {isCallActive && (
        <div className="mt-4 flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
          <Volume2 className="h-4 w-4 animate-pulse" />
          <span className="text-sm">Audio activo - Habla con el agente</span>
        </div>
      )}
      
      {/* Logs de depuración */}
      {logs.length > 0 && (
        <div className="mt-6 p-3 bg-gray-900 rounded-lg">
          <div className="text-xs text-green-400 font-mono space-y-1 max-h-32 overflow-y-auto">
            {logs.map((log, i) => (
              <div key={i}>{log}</div>
            ))}
          </div>
        </div>
      )}
      
      {/* Info de ayuda */}
      {!status.registered && !status.connecting && (
        <div className="mt-4 p-3 bg-yellow-500/10 rounded-lg text-center text-sm text-gray-600 dark:text-gray-400">
          ⚠️ No se pudo conectar a FreeSWITCH. Verifica la configuración SIP.
        </div>
      )}
      
      {status.registered && !isCallActive && !isCalling && (
        <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
          📞 Presiona el botón para llamar al agente IA (extensión 1000)
        </div>
      )}
    </div>
  );
};