const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // 1. Guardar mensaje de usuario y limpiar input
    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    
    const messageToSend = input;
    setInput('');
    setIsLoading(true);

<<<<<<<<< Temporary merge branch 1
    // Recuperar o generar un Session ID único para este cliente
=========
    // Recuperar o generar un Session ID único
>>>>>>>>> Temporary merge branch 2
    let sessionId = sessionStorage.getItem('chat_session_id');
    if (!sessionId) {
      sessionId = 'sess_' + Math.random().toString(36).substring(2, 11);
      sessionStorage.setItem('chat_session_id', sessionId);
    }

    try {
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
        body: JSON.stringify({ chatInput: messageToSend, sessionId }),
      });

      // 2. Validación estricta de la respuesta HTTP
      if (!response.ok) {
        throw new Error(`Error HTTP ${response.status}: Verifica CORS o si el Webhook está activo en n8n.`);
      }

      const data = await response.json();
      const agentReply = data.reply || data.output || data.text || 'Sin respuesta.';
      
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