import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, MessageCircle, Sparkles } from 'lucide-react';
import axios from 'axios';
import Navbar from '../Navbar';
import './ChatPage.css';

const SUGGESTIONS = [
  "What events are happening this week?",
  "Show me outdoor events",
  "Are there health events with spots?",
  "What events can I still join?",
  "Show me all environment events",
];

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [messages, loading]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMessages([{
        role: 'bot',
        text: "Hi! I'm your community assistant. I can help you find events, check availability, or register for an event. What are you looking for?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const sendMessage = async (text = input) => {
    if (!text.trim()) return;

    const userMsg = {
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:5000/api/chatbot', { message: text });
      const { response, action, eventId } = res.data;
      setMessages(prev => [...prev, {
        role: 'bot',
        text: response || "I'm sorry, I couldn't process that.",
        action,
        eventId,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        role: 'bot',
        text: "Error communicating with the assistant. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chat-page">
      <Navbar />

      {/* ── Hero ── */}
      <section className="chat-hero">
        <div className="chat-hero-inner">
          <div className="chat-hero-icon">
            <MessageCircle size={26} />
          </div>
          <div className="chat-hero-text">
            <div className="chat-eyebrow">AI-Powered</div>
            <h1 className="chat-hero-title">Community <em>Assistant</em></h1>
            <p className="chat-hero-sub">Ask about events, availability, or community initiatives</p>
          </div>
        </div>
      </section>

      {/* ── Body: sidebar + chat window ── */}
      <div className="chat-body">

        {/* Suggestions sidebar */}
        <aside className="chat-sidebar">
          <div className="chat-sidebar-header">
            <Sparkles size={14} />
            <span>Try asking</span>
          </div>
          <div className="suggestion-list">
            {SUGGESTIONS.map((q, i) => (
              <motion.button
                key={i}
                className="suggestion-chip"
                onClick={() => sendMessage(q)}
                whileTap={{ scale: 0.97 }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 + 0.3 }}
              >
                {q}
              </motion.button>
            ))}
          </div>
        </aside>

        {/* Chat window */}
        <div className="chat-window">
          {/* Header */}
          <div className="chat-window-header">
            <div className="chat-window-avatar">
              <Bot size={18} />
            </div>
            <span className="chat-window-name">Community Assistant</span>
            <div className="chat-window-status">
              <span className="status-indicator" />
              Online
            </div>
          </div>

          {/* Messages */}
          <div className="chat-messages">
            <AnimatePresence initial={false}>
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  className={`message-row ${msg.role}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className={`msg-avatar ${msg.role}-avatar`}>
                    {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div className="msg-bubble-wrap">
                    <div className={`msg-bubble ${msg.role}-bubble`}>
                      {msg.text}
                      {msg.action === 'register' && msg.eventId && (
                        <button
                          className="msg-register-btn"
                          onClick={() => window.location.href = '/events#upcoming'}
                        >
                          Go to Events Page →
                        </button>
                      )}
                    </div>
                    <span className="msg-timestamp">{msg.timestamp}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing indicator */}
            {loading && (
              <motion.div
                className="typing-indicator"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="msg-avatar bot-avatar">
                  <Bot size={16} />
                </div>
                <div className="typing-dots">
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input bar */}
          <div className="chat-input-bar">
            <input
              className="chat-input"
              type="text"
              placeholder="Type your message…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              disabled={loading}
              autoComplete="off"
            />
            <button
              className="chat-send-btn"
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              aria-label="Send message"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
