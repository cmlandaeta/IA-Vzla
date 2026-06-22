// components/SecurityWarning.jsx
import { useState, useEffect } from 'react';
import { ShieldAlert, X, CheckCircle } from 'lucide-react';

export const SecurityWarning = ({ wssUrl, onAccept, className = '' }) => {
  const [dismissed, setDismissed] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  // Verificar si ya se aceptó el certificado
  useEffect(() => {
    const checkCertificate = async () => {
      if (!wssUrl) return;
      
      setIsChecking(true);
      try {
        // Intentar conectar al WebSocket para verificar
        const httpsUrl = wssUrl
          .replace('wss://', 'https://')
          .replace('ws://', 'http://');
        
        // Si ya se aceptó en localStorage
        const accepted = localStorage.getItem('ssl_accepted') === 'true';
        if (accepted) {
          setIsAccepted(true);
          setDismissed(true);
          if (onAccept) onAccept();
        }
      } catch (error) {
        console.log('SSL check failed:', error);
      } finally {
        setIsChecking(false);
      }
    };

    checkCertificate();
  }, [wssUrl, onAccept]);

  const handleAccept = () => {
    // Guardar en localStorage que el usuario aceptó
    localStorage.setItem('ssl_accepted', 'true');
    setIsAccepted(true);
    setDismissed(true);
    if (onAccept) onAccept();
  };

  const handleOpenCertificate = () => {
    const httpsUrl = wssUrl
      .replace('wss://', 'https://')
      .replace('ws://', 'http://');
    window.open(httpsUrl, '_blank');
  };

  if (dismissed || isAccepted || isChecking) return null;

  return (
    <div className={`bg-yellow-500/10 border border-yellow-500 rounded-lg p-4 mb-4 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <ShieldAlert className="h-5 w-5 text-yellow-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
            🔒 Certificado de seguridad SSL
          </p>
          <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
            Para conectar con el servidor, debes aceptar el certificado SSL:
          </p>
          <ol className="text-xs text-yellow-600 dark:text-yellow-400 list-decimal list-inside mt-2 space-y-1">
            <li>
              Haz clic aquí: 
              <button
                onClick={handleOpenCertificate}
                className="underline font-bold mx-1 text-yellow-700 dark:text-yellow-300 hover:text-yellow-900 dark:hover:text-yellow-100 transition-colors"
              >
                Aceptar certificado SSL
              </button>
              <span className="text-yellow-500/70">(se abrirá en nueva pestaña)</span>
            </li>
            <li>En la nueva pestaña, haz clic en <strong>"Avanzado"</strong> → <strong>"Continuar al sitio (riesgo)"</strong></li>
            <li>Vuelve aquí y haz clic en <strong>"Ya acepté el certificado"</strong></li>
          </ol>
          <div className="flex flex-wrap gap-2 mt-3">
            <button
              onClick={handleAccept}
              className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1"
            >
              <CheckCircle className="h-3 w-3" />
              Ya acepté el certificado
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="px-3 py-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 text-xs font-medium rounded-lg transition-colors"
            >
              Omitir por ahora
            </button>
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
          aria-label="Cerrar advertencia"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};