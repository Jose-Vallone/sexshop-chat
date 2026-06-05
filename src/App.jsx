import { useState } from 'react';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Mensaje de usuario
    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    
    const messageToSend = input;
    setInput('');
    setIsLoading(true);

    // Recuperar o generar un Session ID único
    let sessionId = sessionStorage.getItem('chat_session_id');
    if (!sessionId) {
      sessionId = 'sess_' + Math.random().toString(36).substring(2, 11);
      sessionStorage.setItem('chat_session_id', sessionId);
    }

    try {
      // 1. Cargamos la URL desde las variables de entorno de Vite
      const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL;
      
      if (!webhookUrl) {
        throw new Error("Falta la variable VITE_N8N_WEBHOOK_URL en el archivo .env");
      }

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

      // 2. Validación estricta de la respuesta HTTP
      if (!response.ok) {
        throw new Error(`Error HTTP ${response.status}: Verifica CORS o si el Webhook está activo en n8n.`);
      }

      const data = await response.json();
      
      // Dependiendo de cómo responda tu agente en n8n, ajusta "data.reply" o "data.output"
      const agentReply = data.reply || data.output || data.text || 'Respuesta vacía del servidor.';
      
      setMessages((prev) => [...prev, { role: 'assistant', content: agentReply }]);

    } catch (error) {
      // 3. Log para debugging en consola (vital para ver errores de CORS)
      console.error("Error de conexión con el Agente AI:", error.message);
      
      // Fallback para el cliente
      setMessages((prev) => [...prev, { 
        role: 'assistant', 
        content: 'Tuvimos un inconveniente técnico momentáneo. Mientras lo resolvemos, revisa nuestra oferta aquí: https://sexshopsantafe.mitiendanube.com/productos/ ✨' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="chat-box">
        <header className="chat-header">
          <h1 style={{fontSize: '1.4rem', color: '#ff69b4', marginBottom: '5px'}}>Asistente Aurora ✨</h1>
          <p style={{color: '#ffb6c1', fontSize: '0.8rem'}}>Sexshop 739 | Asesoramiento discreto</p>
        </header>

        <div className="chat-body">
          {messages.map((msg, index) => (
            <div key={index} className={`message-row ${msg.role}`}>
              <div className="bubble">
                {msg.content.includes("http") ? (
                  <a href={msg.content.match(/https?:\/\/[^\s]+/)[0]} target="_blank" rel="noreferrer" style={{color: '#fff', textDecoration: 'underline'}}>
                    {msg.content}
                  </a>
                ) : msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="message-row assistant">
              <div className="bubble">Escribiendo...</div>
            </div>
          )}
        </div>

        <form onSubmit={handleSend} className="input-area">
          <input 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            placeholder="Escribe tu consulta..." 
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading}>Enviar</button>
        </form>
      </div>
    </div>
  );
}

export default App;