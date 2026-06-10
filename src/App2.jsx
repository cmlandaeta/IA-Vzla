import { useState } from "react";
import { Phone, Zap, Shield, Cpu, LayoutTemplate, Webhook, Mic, Volume2, ChevronRight, Menu, X, Play, Loader2 } from "lucide-react";

function App() {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Demo simulado (porque el agente es local)
  const handleDemoCall = () => {
    setIsConnecting(true);
    setTimeout(() => {
      setIsConnecting(false);
      setIsCallActive(true);
      setTranscript("📞 Conexión establecida con VenIA Voice (entorno local)\n🤖 Agente: Hola, soy VenIA Voice. Para probar el agente real, conecta tu softphone a la extensión 1000 en tu PBX local.");
    }, 1500);
  };

  const handleEndCall = () => {
    setIsCallActive(false);
    setTranscript("");
  };

  return (
    <div className="bg-black min-h-screen">
      {/* Navbar */}
      <nav className="bg-black/90 backdrop-blur-md border-b border-yellow-600/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Volume2 className="h-8 w-8 text-yellow-500" />
              <span className="text-2xl font-bold tracking-tight">
                Ven<span className="text-yellow-500">IA</span> Voice
              </span>
            </div>
            
            {/* Desktop menu */}
            <div className="hidden md:flex space-x-8">
              <a href="#features" className="hover:text-yellow-500 transition">Características</a>
              <a href="#pipeline" className="hover:text-yellow-500 transition">Pipeline</a>
              <a href="#demo" className="hover:text-yellow-500 transition">Demo</a>
              <a href="#integrate" className="hover:text-yellow-500 transition">Integración</a>
            </div>

            <button className="hidden md:block bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg font-semibold transition">
              Solicitar acceso
            </button>

            {/* Mobile menu button */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden">
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-dark border-b border-yellow-600/30">
            <div className="px-4 py-2 space-y-2">
              <a href="#features" className="block py-2 hover:text-yellow-500">Características</a>
              <a href="#pipeline" className="block py-2 hover:text-yellow-500">Pipeline</a>
              <a href="#demo" className="block py-2 hover:text-yellow-500">Demo</a>
              <a href="#integrate" className="block py-2 hover:text-yellow-500">Integración</a>
              <button className="w-full bg-yellow-500 text-black py-2 rounded-lg font-semibold">Solicitar acceso</button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-600/5 via-transparent to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 rounded-full px-4 py-1.5 mb-6">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium text-yellow-500">IA para PBX en Venezuela</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Agente IA para{" "}
              <span className="text-yellow-500">Asterisk</span> y{" "}
              <span className="text-yellow-500">FreeSWITCH</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
              Integra inteligencia artificial a tu central telefónica en minutos. 
              Atención al cliente, cobranzas, recordatorios y más, 100% local o en la nube.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-yellow-500 hover:bg-yellow-600 text-black px-8 py-3 rounded-lg font-bold text-lg transition flex items-center justify-center gap-2">
                <Phone className="h-5 w-5" />
                Probar agente ahora
              </button>
              <button className="border border-yellow-500/50 hover:border-yellow-500 px-8 py-3 rounded-lg font-semibold transition">
                Ver documentación
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Integración con PBX - Diagrama profesional */}
      <section id="integrate" className="py-20 bg-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Integración <span className="text-yellow-500">simple y directa</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Conecta VenIA Voice a tu PBX existente en menos de 5 minutos sin cambiar tu infraestructura
            </p>
          </div>

          {/* Diagrama de flujo SVG + Tailwind */}
          <div className="bg-black/50 rounded-2xl border border-yellow-600/20 p-6 md:p-10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 md:gap-4">
              {/* Cliente/Softphone */}
              <div className="text-center w-full md:w-1/5">
                <div className="bg-yellow-500/10 border border-yellow-500 rounded-xl p-4 mb-2">
                  <Phone className="h-10 w-10 text-yellow-500 mx-auto mb-2" />
                  <p className="font-semibold">Softphone Web</p>
                  <p className="text-xs text-gray-500">Usuario llama</p>
                </div>
                <div className="hidden md:block text-yellow-500 mt-2">📞 →</div>
              </div>

              {/* Flecha responsiva */}
              <div className="text-yellow-500 text-2xl hidden md:block">→</div>

              {/* PBX Asterisk/FreeSWITCH */}
              <div className="text-center w-full md:w-1/5">
                <div className="bg-yellow-500/10 border border-yellow-500 rounded-xl p-4 mb-2">
                  <Cpu className="h-10 w-10 text-yellow-500 mx-auto mb-2" />
                  <p className="font-semibold">Tu PBX</p>
                  <p className="text-xs text-gray-500">Asterisk / FreeSWITCH</p>
                </div>
                <div className="text-yellow-500 mt-2 text-xs">Extensión 1000</div>
              </div>

              <div className="text-yellow-500 text-2xl hidden md:block">→</div>

              {/* VenIA Voice */}
              <div className="text-center w-full md:w-1/5">
                <div className="bg-yellow-500/20 border-2 border-yellow-500 rounded-xl p-4 mb-2">
                  <Volume2 className="h-10 w-10 text-yellow-500 mx-auto mb-2" />
                  <p className="font-bold text-yellow-500">VenIA Voice</p>
                  <p className="text-xs text-gray-500">Agente IA local</p>
                </div>
                <div className="text-yellow-500 mt-2 text-xs">Pipecat Stack</div>
              </div>

              <div className="text-yellow-500 text-2xl hidden md:block">→</div>

              {/* Respuesta */}
              <div className="text-center w-full md:w-1/5">
                <div className="bg-yellow-500/10 border border-yellow-500 rounded-xl p-4 mb-2">
                  <Mic className="h-10 w-10 text-yellow-500 mx-auto mb-2" />
                  <p className="font-semibold">Respuesta IA</p>
                  <p className="text-xs text-gray-500">Voz natural</p>
                </div>
              </div>
            </div>

            {/* Explicación técnica */}
            <div className="mt-8 p-4 bg-yellow-500/5 rounded-lg border border-yellow-600/20">
              <p className="text-sm text-gray-300 text-center">
                🔧 <span className="font-mono text-yellow-500">dialplan: </span>
                extension =&gt; 1000,1,AGI(venia_voice.agi) — 
                Tu agente procesa la llamada y responde con IA en tiempo real
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pipeline Section (estilo Dograh) */}
      <section id="pipeline" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Pipeline de voz <span className="text-yellow-500">optimizado</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Stack moderno para latencia ultra baja y calidad de conversación humana
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* STT */}
            <div className="bg-dark rounded-xl border border-yellow-600/20 p-6 hover:border-yellow-500/50 transition">
              <div className="bg-yellow-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Mic className="h-6 w-6 text-yellow-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">STT</h3>
              <p className="text-gray-400 text-sm mb-3">Speech-to-Text</p>
              <p className="text-sm">Whisper / Voxtral local para máxima privacidad y velocidad</p>
              <div className="mt-3 text-xs text-yellow-500">⬇ 98% precisión</div>
            </div>

            {/* LLM */}
            <div className="bg-dark rounded-xl border border-yellow-600/20 p-6 hover:border-yellow-500/50 transition transform md:-translate-y-2">
              <div className="bg-yellow-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Cpu className="h-6 w-6 text-yellow-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">LLM</h3>
              <p className="text-gray-400 text-sm mb-3">Procesamiento</p>
              <p className="text-sm">Modelo local (Llama 3 / Mistral) o API con respaldo offline</p>
              <div className="mt-3 text-xs text-yellow-500">⚡ &lt;500ms</div>
            </div>

            {/* TTS */}
            <div className="bg-dark rounded-xl border border-yellow-600/20 p-6 hover:border-yellow-500/50 transition">
              <div className="bg-yellow-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Volume2 className="h-6 w-6 text-yellow-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">TTS</h3>
              <p className="text-gray-400 text-sm mb-3">Text-to-Speech</p>
              <p className="text-sm">Kokoro / Chatterbox con clonación de voz para respuestas naturales</p>
              <div className="mt-3 text-xs text-yellow-500">🗣 Voz humana</div>
            </div>
          </div>

          <div className="mt-8 text-center text-sm text-gray-500">
            * Todo el pipeline puede ejecutarse 100% local en tu servidor
          </div>
        </div>
      </section>

      {/* Características */}
      <section id="features" className="py-20 bg-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="flex gap-4">
              <Shield className="h-6 w-6 text-yellow-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-lg mb-2">Soberanía de datos</h3>
                <p className="text-gray-400 text-sm">Todo el procesamiento local. Tus conversaciones nunca salen de tu infraestructura.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <LayoutTemplate className="h-6 w-6 text-yellow-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-lg mb-2">Plug & Play</h3>
                <p className="text-gray-400 text-sm">Conecta a cualquier PBX existente. Funciona con tus troncales SIP actuales.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <Webhook className="h-6 w-6 text-yellow-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-lg mb-2">APIs abiertas</h3>
                <p className="text-gray-400 text-sm">REST y WebSocket para integrar con CRM, bases de datos o sistemas propios.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo interactivo */}
      <section id="demo" className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-dark rounded-2xl border border-yellow-600/20 p-8">
            <h2 className="text-2xl font-bold mb-2 text-center">Prueba el agente</h2>
            <p className="text-gray-400 text-center mb-8">
              Simulador de llamada (entorno local)
            </p>

            <div className="bg-black rounded-xl p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full ${isCallActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                  <span className="text-sm font-mono">
                    {isCallActive ? 'Llamada activa' : 'Desconectado'}
                  </span>
                </div>
                {isCallActive && (
                  <span className="text-xs text-yellow-500">Extensión: 1000</span>
                )}
              </div>
              
              <div className="bg-black/50 rounded-lg p-4 h-32 overflow-y-auto font-mono text-sm">
                {transcript ? (
                  <pre className="whitespace-pre-wrap text-gray-300">{transcript}</pre>
                ) : (
                  <p className="text-gray-600 text-center pt-8">
                    Presiona "Iniciar llamada" para conectar con el agente local
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              {!isCallActive ? (
                <button
                  onClick={handleDemoCall}
                  disabled={isConnecting}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition disabled:opacity-50"
                >
                  {isConnecting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Phone className="h-5 w-5" />
                  )}
                  {isConnecting ? "Conectando..." : "Iniciar llamada de prueba"}
                </button>
              ) : (
                <button
                  onClick={handleEndCall}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition"
                >
                  <Phone className="h-5 w-5" />
                  Finalizar llamada
                </button>
              )}
            </div>

            <div className="mt-6 text-center text-xs text-gray-500 border-t border-gray-800 pt-4">
              📌 Demo simulada. Para probar el agente real: configura tu softphone a la extensión 1000 de tu PBX local
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 border-t border-yellow-600/20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-4">
            ¿Listo para automatizar tu <span className="text-yellow-500">central telefónica?</span>
          </h2>
          <p className="text-gray-400 mb-8">
            Implementamos VenIA Voice en tu infraestructura. Soporte local en Venezuela.
          </p>
          <button className="bg-yellow-500 hover:bg-yellow-600 text-black px-8 py-3 rounded-lg font-bold text-lg inline-flex items-center gap-2">
            Contactar ventas
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark border-t border-yellow-600/20 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>© 2026 VenIA Voice - Agente IA para PBX en Venezuela</p>
          <p className="mt-2">Asterisk • FreeSWITCH • Pipecat • Local IA Stack</p>
        </div>
      </footer>
    </div>
  );
}

export default App;