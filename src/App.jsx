const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // 1. Guardar mensaje de usuario y limpiar input
    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    
    const messageToSend = input;
    setInput('');
    setIsLoading(true);

    // 2. Control estricto de la Sesión
    let sessionId = sessionStorage.getItem('chat_session_id');
    if (!sessionId) {
      sessionId = 'sess_' + Math.random().toString(36).substring(2, 11);
      sessionStorage.setItem('chat_session_id', sessionId);
    }

    try {
      const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL;
      if (!webhookUrl) throw new Error("Falta la URL del Webhook");

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ chatInput: messageToSend, sessionId }),
      });

      if (!response.ok) throw new Error(`HTTP Error ${response.status}`);

      const data = await response.json();
      const agentReply = data.reply || data.output || data.text || 'Sin respuesta.';
      
      setMessages((prev) => [...prev, { role: 'assistant', content: agentReply }]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [...prev, { 
        role: 'assistant', 
        content: 'Revisa nuestra oferta aquí: https://sexshopsantafe.mitiendanube.com/productos/ ✨' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };