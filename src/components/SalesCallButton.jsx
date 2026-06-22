import { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, Loader2 } from 'lucide-react';
import { UserAgent, Inviter, Registerer } from 'sip.js';
import { URI } from 'sip.js';
import { useLanguage } from '../contexts/LanguageContext';

const SIP_CONFIG = {
  domain: import.meta.env.VITE_SIP_DOMAIN,
  username: import.meta.env.VITE_EXTEN_BUTON_SALES,
  password: import.meta.env.VITE_SIP_PASSWORD,
  wssUrl: import.meta.env.VITE_SIP_WSS_URL,
  salesExtension: import.meta.env.VITE_SALES_EXTENSION,
  extensionRangeStart: parseInt(import.meta.env.VITE_EXTENSION_RANGE_START || '1040'),
  extensionRangeEnd: parseInt(import.meta.env.VITE_EXTENSION_RANGE_END || '1050')
  
};

// Generar ID único para esta sesión
const sessionId = Math.random().toString(36).substring(2, 8);
const extension = Math.floor(Math.random() * 
  (SIP_CONFIG.extensionRangeEnd - SIP_CONFIG.extensionRangeStart + 1) + 
  SIP_CONFIG.extensionRangeStart
);

export const SalesCallButton = ({ className = "" }) => {
  const { t } = useLanguage();
  const [isRegistered, setIsRegistered] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [currentExtension, setCurrentExtension] = useState(extension);
  
  const userAgentRef = useRef(null);
  const currentSessionRef = useRef(null);
  const remoteAudioRef = useRef(null);

  // Inicializar UserAgent para llamadas de ventas
  useEffect(() => {
    const initUserAgent = async () => {
      try {
        const uri = new URI('sip', currentExtension.toString(), SIP_CONFIG.domain);
        
        const userAgent = new UserAgent({
          uri,
          transportOptions: { server: SIP_CONFIG.wssUrl },
          authorizationUsername: currentExtension.toString(),
          authorizationPassword: SIP_CONFIG.password,
          displayName: 'VenIA Sales',
          userAgentString: 'Ventas VenIA Voice/1.0',
        });
        
        userAgentRef.current = userAgent;
        await userAgent.start();
        const registerer = new Registerer(userAgent, { expires: SIP_CONFIG.expires });
        await registerer.register();
        setIsRegistered(true);
        
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
        console.error('Error initializing sales UA:', error);
      }
    };
    
    initUserAgent();
    
    return () => {
      if (currentSessionRef.current) {
        try { currentSessionRef.current.bye(); } catch(e) {}
      }
      if (userAgentRef.current) {
        try { userAgentRef.current.stop(); } catch(e) {}
      }
    };
  }, []);

  const setupRemoteAudio = (session) => {
    try {
      const sessionDescriptionHandler = session.sessionDescriptionHandler;
      if (!sessionDescriptionHandler) return;
      
      const remoteStream = sessionDescriptionHandler.remoteMediaStream;
      if (remoteStream && remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = remoteStream;
        remoteAudioRef.current.play().catch(e => console.log('Autoplay blocked'));
      }
    } catch (error) {
      console.error('Audio error:', error);
    }
  };

  const callSales = async () => {
    if (!userAgentRef.current || !isRegistered) return;
    
    setIsCalling(true);
    
    try {
      const targetUri = new URI('sip', SIP_CONFIG.salesExtension, SIP_CONFIG.domain);
      
      const inviter = new Inviter(userAgentRef.current, targetUri, {
        sessionDescriptionHandlerOptions: {
          constraints: { audio: true, video: false }
        }
      });
      
      currentSessionRef.current = inviter;
      
      inviter.stateChange.addListener((state) => {
        switch (state) {
          case 'Established':
            setIsCallActive(true);
            setIsCalling(false);
            setupRemoteAudio(inviter);
            break;
          case 'Terminated':
            setIsCallActive(false);
            setIsCalling(false);
            if (remoteAudioRef.current) remoteAudioRef.current.srcObject = null;
            currentSessionRef.current = null;
            break;
        }
      });
      
      await inviter.invite();
      
    } catch (error) {
      console.error('Error calling sales:', error);
      setIsCalling(false);
    }
  };
  
  const hangup = async () => {
    if (!currentSessionRef.current) return;
    
    try {
      await currentSessionRef.current.bye();
    } catch (error) {
      console.error('Error hanging up:', error);
    }
    
    setIsCallActive(false);
    setIsCalling(false);
    if (remoteAudioRef.current) remoteAudioRef.current.srcObject = null;
    currentSessionRef.current = null;
  };

  if (!isRegistered) {
    return (
      <button className={`${className} opacity-50 cursor-not-allowed`} disabled>
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        {t('sales.connecting')}
      </button>
    );
  }

  if (isCallActive) {
    return (
      <button
        onClick={hangup}
        className={`${className} bg-red-500 hover:bg-red-600`}
      >
        <PhoneOff className="h-5 w-5 mr-2" />
        {t('sales.callSales')}
      </button>
    );
  }

  return (
    <button
      onClick={callSales}
      disabled={isCalling}
      className={`${className} ${isCalling ? 'opacity-50 cursor-wait' : ''}`}
    >
      {isCalling ? (
        <Loader2 className="h-5 w-5 animate-spin mr-2 " />
      ) : (
        <Phone className="h-5 w-5 mr-2 " />
      )}
      {isCalling ? t('sales.connecting') : t('sales.callSales')}
    </button>
  );
};