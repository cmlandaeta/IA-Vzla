import { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, Loader2, Mic, Volume2, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { proxyService } from '../services/ProxyService';

const PROXY_URL = import.meta.env.VITE_PROXY_URL || 'http://192.168.15.115:3001';

export const VenIAVoiceDemoProxy = () => {
  const { t } = useLanguage();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [callDuration, setCallDuration] = useState(0);
  const [showLogs, setShowLogs] = useState(false);
  const [logs, setLogs] = useState([]);
  const [connectionError, setConnectionError] = useState(null);
  
  const durationIntervalRef = useRef(null);
  
  // Agregar log
  const addLog = (message, isError = false) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = { text: `[${timestamp}] ${message}`, isError };
    setLogs(prev => [...prev.slice(-49), logEntry]);
    console.log(logEntry.text);
  };
  
  // Conectar al proxy
  useEffect(() => {
    const connectToProxy = async () => {
      try {
        setIsConnecting(true);
        addLog(`Connecting to proxy at ${PROXY_URL}...`);
        
        proxyService.on('onCallStarted', () => {
          addLog('Call started');
        });
        
        proxyService.on('onCallConnected', () => {
          setIsCallActive(true);
          setIsCalling(false);
          setTranscript('🎙️ ' + t('demo.connected'));
          addLog('✅ Call connected');
        });
        
        proxyService.on('onCallTerminated', () => {
          setIsCallActive(false);
          setIsCalling(false);
          setTranscript('');
          addLog('📴 Call terminated');
        });
        
        proxyService.on('onCallRejected', (data) => {
          addLog(`❌ Call rejected: ${data.reason}`, true);
          setIsCalling(false);
        });
        
        proxyService.on('onCallProgress', () => {
          addLog('Call in progress...');
        });
        
        proxyService.on('onError', (data) => {
          addLog(`❌ Error: ${data.error}`, true);
          setIsCalling(false);
          setIsCallActive(false);
        });
        
        proxyService.on('onServerLog', (data) => {
          addLog(`[Server] ${data.message}`);
        });
        
        await proxyService.connect(PROXY_URL);
        setIsConnected(true);
        setIsConnecting(false);
        addLog('✅ Connected to proxy server');
        
      } catch (error) {
        setConnectionError(error.message);
        setIsConnecting(false);
        addLog(`❌ Connection error: ${error.message}`, true);
      }
    };
    
    connectToProxy();
    
    return () => {
      proxyService.disconnect();
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, []);
  
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
  
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const callAgent = () => {
    if (!isConnected) {
      addLog('Not connected to proxy', true);
      return;
    }
    setIsCalling(true);
    proxyService.makeCall('agent', import.meta.env.VITE_AGENT_EXTENSION || '1000');
  };
  
  const hangup = () => {
    proxyService.hangup();
  };
  
  if (connectionError) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-red-500/20 p-6 md:p-8 shadow-xl">
        <h2 className="text-2xl font-bold mb-2 text-center text-gray-900 dark:text-white">
          {t('demo.title')}
        </h2>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 text-center">
          <p className="text-red-600 dark:text-red-400 text-sm">Connection error: {connectionError}</p>
          <p className="text-gray-500 dark:text-gray-400 text-xs mt-2">
            Make sure the proxy server is running
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
      
      {/* Estado de conexión */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : isConnecting ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'}`}></div>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {isConnecting ? 'Connecting to proxy...' : isConnected ? '✅ Connected to proxy' : '❌ Disconnected'}
        </span>
      </div>
      
      {/* Área de conversación/transcript */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 mb-6 min-h-[120px]">
        <div className="flex items-center gap-2 mb-3 border-b border-gray-200 dark:border-gray-700 pb-2">
          <MessageSquare className="h-4 w-4 text-yellow-500" />
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{t('demo.conversation')}</span>
        </div>
        <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
          {transcript || t('demo.waitingCall')}
        </div>
      </div>
      
      {/* Controles de llamada */}
      <div className="flex justify-center gap-4 mb-4">
        {!isCallActive && !isCalling && isConnected && (
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
    </div>
  );
};