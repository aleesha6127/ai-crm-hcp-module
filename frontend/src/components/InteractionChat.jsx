import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { processChat } from '../store/crmSlice';
import { Send, Bot, User } from 'lucide-react';

const InteractionChat = () => {
  const dispatch = useDispatch();
  const loading = useSelector(state => state.crm.chatLoading);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'ai', content: "Hello! I'm your AI CRM assistant. You can log an interaction with an HCP using natural language, or ask me for their history. Try saying: 'I met with Dr. John Smith today about the new trial...'" }
  ]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    
    try {
      const resultAction = await dispatch(processChat(userMessage));
      if (processChat.fulfilled.match(resultAction)) {
        setMessages(prev => [...prev, { role: 'ai', content: resultAction.payload.response }]);
      } else {
        setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I encountered an error. Please try again." }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I encountered an error. Please try again." }]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="chat-container animate-fade-in">
      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div key={idx} style={{ display: 'flex', gap: '1rem', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
            <div style={{ background: msg.role === 'user' ? '#dbeafe' : '#f1f5f9', padding: '0.5rem', borderRadius: '50%', color: msg.role === 'user' ? 'var(--primary-color)' : 'var(--text-muted)' }}>
              {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
            </div>
            <div className={`message-bubble ${msg.role === 'user' ? 'message-user' : 'message-ai'}`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ background: '#f1f5f9', padding: '0.5rem', borderRadius: '50%', color: 'var(--text-muted)' }}>
              <Bot size={20} />
            </div>
            <div className="message-bubble message-ai loading-dots">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      
      <div className="info-panel" style={{ margin: '0 1.5rem', marginBottom: '1rem' }}>
        <div className="info-panel-title">
           <Bot size={18} /> AI Assistant Active
        </div>
        <p style={{ fontSize: '0.85rem', color: '#1e40af' }}>
          I will automatically extract structured data from your messages and log them into the database. I can also suggest follow-ups and analyze sentiment!
        </p>
      </div>


      <div className="chat-input-area">
        <input 
          type="text" 
          className="chat-input" 
          placeholder="Describe your interaction..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
        />
        <button className="chat-send-btn" onClick={handleSend} disabled={loading}>
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default InteractionChat;
