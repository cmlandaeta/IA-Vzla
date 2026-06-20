import { useState, useEffect, useRef } from 'react';
import { MessageSquare, User, Bot, ChevronDown, ChevronUp, Users, DollarSign, CreditCard } from 'lucide-react';

export const TranscriptionPanel = ({ callUuid, clientId }) => {
  const [transcriptions, setTranscriptions] = useState([]);
  const [showDetails, setShowDetails] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef(null);
  const containerRef = useRef(null);
  const urlTranscription = import.meta.env.VITE_EXTENSION_RANGE_END || '192.168.15.113:3002'

 useEffect(() => {
  // Conectar al WebSocket con clientId
  const wsUrl = clientId 
    ? `ws://${urlTranscription}/?clientId=${clientId}`
    : null;
  
  if (!wsUrl) {
    console.log('⏳ Esperando clientId para conectar WebSocket');
    return;
  }
  
  console.log(`🔌 Conectando a WebSocket: ${wsUrl}`);
  
  const ws = new WebSocket(wsUrl);
  wsRef.current = ws;

  ws.onopen = () => {
    console.log('✅ WebSocket conectado a transcripción con clientId:', clientId);
    setIsConnected(true);
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log('📨 Mensaje recibido:', data.type);
      
      if (data.type === 'transcription') {
        setTranscriptions(prev => [...prev, {
          id: Date.now(),
          speaker: data.speaker,
          text: data.text,
          timestamp: data.timestamp
        }]);
        
        setTimeout(() => {
          if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
          }
        }, 100);
      }
      
      if (data.type === 'customers') {
        console.log('📋 Clientes recibidos:', data.data.length);
        setCustomers(data.data);
      }
      
      if (data.type === 'registration-confirmed') {
        console.log('✅ Registro de llamada confirmado:', data.callUuid);
      }
    } catch (error) {
      console.error('❌ Error parsing message:', error);
    }
  };

  ws.onerror = (error) => {
    console.error('❌ WebSocket error:', error);
    // Intentar reconectar después de 3 segundos
    setTimeout(() => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.CLOSED) {
        console.log('🔄 Reintentando conexión WebSocket...');
        // La reconexión se maneja en el cleanup
      }
    }, 3000);
  };

  ws.onclose = (event) => {
    console.log(`📴 WebSocket desconectado (código: ${event.code}, motivo: ${event.reason})`);
    setIsConnected(false);
    
    // Si no fue un cierre intencional, reconectar
    if (event.code !== 1000) {
      console.log('🔄 Reconectando WebSocket en 2 segundos...');
      setTimeout(() => {
        if (clientId) {
          // Forzar reconexión actualizando el estado
          setTranscriptions(prev => prev);
        }
      }, 2000);
    }
  };

  // // Cleanup
  // return () => {
  //   if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
  //     console.log('🔌 Cerrando WebSocket...');
  //     wsRef.current.close(1000, 'Componente desmontado');
  //   }
  // };
}, [clientId]); // Dependencia en clientId para reconectar si cambia

   // Limpiar transcripciones cuando cambia clientId (nueva llamada)
  useEffect(() => {
    setTranscriptions([]);
  }, [clientId]);

  const getCustomerInfo = (customer) => {
    setSelectedCustomer(customer);
  };

  return (
    <div className="space-y-4">
      {/* Panel de clientes */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-yellow-500/20 overflow-hidden">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
        >
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-yellow-500" />
            <span className="font-semibold text-gray-900 dark:text-white">Clientes de prueba</span>
            <span className="text-xs text-gray-500">({customers.length})</span>
          </div>
          {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        
        {showDetails && (
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-3">
            {customers.map((customer) => (
              <div
                key={customer.id}
                onClick={() => getCustomerInfo(customer)}
                className={`p-3 rounded-lg cursor-pointer transition-all ${
                  selectedCustomer?.id === customer.id
                    ? 'bg-yellow-500/20 border border-yellow-500'
                    : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{customer.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">ID: {customer.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-red-600 dark:text-red-400">
                      ${customer.debt.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">deuda</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Panel de transcripción */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-yellow-500/20">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-yellow-500" />
            <span className="font-semibold text-gray-900 dark:text-white">Conversación en tiempo real</span>
            {isConnected && (
              <span className="ml-2 px-2 py-0.5 bg-green-500/20 text-green-600 dark:text-green-400 text-xs rounded-full">
                En vivo
              </span>
            )}
          </div>
        </div>
        
        <div 
          ref={containerRef}
          className="h-80 overflow-y-auto p-4 space-y-3"
        >
          {transcriptions.length === 0 && (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              <p>Esperando conversación...</p>
              <p className="text-xs mt-2">Las transcripciones aparecerán aquí en tiempo real</p>
            </div>
          )}
          
          {transcriptions.map((item) => (
            <div
              key={item.id}
              className={`flex gap-3 animate-fade-in ${
                item.speaker === 'user' ? 'justify-start' : 'justify-end'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  item.speaker === 'user'
                    ? 'bg-gray-100 dark:bg-gray-700'
                    : 'bg-yellow-500/20 border border-yellow-500/30'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {item.speaker === 'user' ? (
                    <User className="h-3 w-3 text-gray-500" />
                  ) : (
                    <Bot className="h-3 w-3 text-yellow-500" />
                  )}
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {item.speaker === 'user' ? 'Cliente' : 'Agente VenIA'}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {item.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};