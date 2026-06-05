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
    
    // Guardamos el input en una constante antes de limpiar el estado
    const messageToSend = input;
    setInput('');
    setIsLoading(true);

    // Recuperar o generar un Session ID único para este cliente
    let sessionId = sessionStorage.getItem('chat_session_id');
    if (!sessionId) {
      sessionId = 'sess_' + Math.random().toString(36).substring(2, 11);
      sessionStorage.setItem('chat_session_id', sessionId);
    }

    try {
      const response = await fetch('https://automatizaciones2.app.n8n.cloud/webhook/sexshop-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          chatInput: messageToSend,
          sessionId: sessionId // Enviado a n8n para mantener el contexto de la memoria
        }),
      });

      const data = await response.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (error) {
      setMessages((prev) => [...prev, { 
        role: 'assistant', 
        content: 'Revisa nuestra oferta aquí: https://sexshopsantafe.mitiendanube.com/productos/ ✨' 
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
          />
          <button type="submit" disabled={isLoading}>Enviar</button>
        </form>
      </div>
    </div>
  );
}

export default App;