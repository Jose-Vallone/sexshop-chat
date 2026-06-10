import { useState } from 'react';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // 1. Renderizar mensaje de usuario inmediatamente y limpiar el input
    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    
    const messageToSend = input;
    setInput('');
    setIsLoading(true);

    // 2. Control estricto de Persistencia de Sesión (para n8n Simple Memory)
    let sessionId = sessionStorage.getItem('chat_session_id');
    if (!sessionId) {
      sessionId = 'sess_' + Math.random().toString(36).substring(2, 11);
      sessionStorage.setItem('chat_session_id', sessionId);
    }

    try {
      const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL;
      if (!webhookUrl) throw new Error("Falta la URL del Webhook en las variables de entorno");

      // 3. Petición HTTP POST enviando chatInput y sessionId estructurados
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          chatInput: messageToSend, 
          sessionId: sessionId 
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status} - ${errorText || 'Error en n8n'}`);
      }

      const data = await response.json();
      
      // Mapeo flexible para capturar la respuesta del nodo "Respond to Webhook"
      const agentReply = data.reply || data.output || data.text || (typeof data === 'string' ? data : 'Sin respuesta del agente.');
      
      setMessages((prev) => [...prev, { role: 'assistant', content: agentReply }]);
    } catch (error) {
      console.error("Error en la petición:", error);
      // Fallback de diagnóstico visible en la interfaz si n8n falla
      setMessages((prev) => [...prev, { 
        role: 'assistant', 
        content: `🚨 Error: "${error.message}". Puedes revisar nuestro catálogo directo aquí: https://sexshopsantafe.mitiendanube.com/productos/ ✨` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div className="chat-window">
        {/* Encabezado del Chat */}
        <div className="chat-header">
          <h2>Asistente Aurora ✨</h2>
          <p>Sexshop 739 | Asesoramiento discreto</p>
        </div>

        {/* Historial Clínico de Mensajes */}
        <div className="chat-messages">
          {messages.length === 0 && (
            <p className="empty-chat">Hola, ¿en qué puedo asesorarte hoy? 🤫</p>
          )}
          
          {messages.map((msg, index) => (
            <div key={index} className={`message-wrapper ${msg.role}`}>
              <div className="message-bubble">
                {msg.content}
              </div>
            </div>
          ))}

          {/* Indicador de carga (Escribiendo...) */}
          {isLoading && (
            <div className="message-wrapper assistant">
              <div className="message-bubble loading">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            </div>
          )}
        </div>

        {/* Formulario Inferior de Entrada */}
        <form onSubmit={handleSend} className="chat-input-form">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu consulta..."
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading || !input.trim()}>
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;