import { useState } from 'react';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // 1. Guardar mensaje de usuario y limpiar input
    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    
    const messageToSend = input;
    setInput('');
    setIsLoading(true);

    // 2. Control de Sesión
    let sessionId = sessionStorage.getItem('chat_session_id');
    if (!sessionId) {
      sessionId = 'sess_' + Math.random().toString(36).substring(2, 11);
      sessionStorage.setItem('chat_session_id', sessionId);
    }

    try {
      const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL;
      if (!webhookUrl) throw new Error("Falta la URL del Webhook en las variables de entorno");

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ chatInput: messageToSend, sessionId }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status} - ${errorText || 'Error en n8n'}`);
      }

      const data = await response.json();
      const agentReply = data.reply || data.output || data.text || 'Sin respuesta.';
      
      setMessages((prev) => [...prev, { role: 'assistant', content: agentReply }]);
    } catch (error) {
      console.error(error);
      // Modo diagnóstico: muestra el error real de la petición en la burbuja
      setMessages((prev) => [...prev, { 
        role: 'assistant', 
        content: `🚨 Error: "${error.message}". Revisa nuestra oferta aquí: https://sexshopsantafe.mitiendanube.com/productos/ ✨` 
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

        {/* Cuerpo de Mensajes */}
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

        {/* Formulario de Entrada */}
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