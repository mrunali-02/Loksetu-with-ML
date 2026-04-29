import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import axios from 'axios';

/* ── Inline styles to avoid a separate CSS file for the widget ── */
const S = {
  wrapper: {
    position: 'fixed',
    bottom: 24,
    right: 24,
    zIndex: 9998,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 12,
    fontFamily: "'DM Sans', sans-serif",
  },
  panel: {
    width: 360,
    height: 480,
    background: 'var(--cream, #faf8f4)',
    border: '1px solid var(--border-soft)',
    borderRadius: 3,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    boxShadow: '0 24px 64px rgba(0,0,0,0.22)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '14px 16px',
    background: '#0a0a0f',
    borderBottom: '1px solid rgba(201,146,58,0.18)',
    flexShrink: 0,
  },
  headerAvatar: {
    width: 30,
    height: 30,
    background: 'linear-gradient(135deg, #1a6b6b, #2d9e9e)',
    borderRadius: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    flexShrink: 0,
  },
  headerName: {
    flex: 1,
    color: 'white',
    fontWeight: 600,
    fontSize: '0.875rem',
  },
  headerClose: {
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid var(--border-soft)',
    borderRadius: 2,
    color: 'rgba(255,255,255,0.6)',
    cursor: 'pointer',
    padding: 5,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.2s',
  },
  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px',
    background: '#f5f3ee',
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  msgRow: (isUser) => ({
    display: 'flex',
    alignItems: 'flex-end',
    gap: 8,
    flexDirection: isUser ? 'row-reverse' : 'row',
  }),
  avatar: (isUser) => ({
    width: 28,
    height: 28,
    borderRadius: 2,
    background: isUser ? 'rgba(0,0,0,0.1)' : '#0a0a0f',
    color: isUser ? 'rgba(0,0,0,0.4)' : '#c9923a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  }),
  bubbleWrap: (isUser) => ({
    maxWidth: '78%',
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
    alignItems: isUser ? 'flex-end' : 'flex-start',
  }),
  bubble: (isUser) => ({
    padding: '10px 14px',
    borderRadius: 3,
    fontSize: '0.84rem',
    lineHeight: 1.6,
    whiteSpace: 'pre-line',
    wordBreak: 'break-word',
    background: isUser ? '#0a0a0f' : 'white',
    color: isUser ? 'rgba(255,255,255,0.9)' : '#0a0a0f',
    border: isUser ? 'none' : '1px solid var(--border-soft)',
  }),
  time: (isUser) => ({
    fontFamily: "'DM Mono', monospace",
    fontSize: '0.6rem',
    color: 'rgba(0,0,0,0.28)',
    padding: '0 2px',
    textAlign: isUser ? 'right' : 'left',
  }),
  regBtn: {
    marginTop: 10,
    padding: '8px 14px',
    background: '#c9923a',
    color: '#0a0a0f',
    border: 'none',
    borderRadius: 3,
    fontSize: '0.75rem',
    fontWeight: 600,
    cursor: 'pointer',
    width: '100%',
  },
  typingDots: {
    background: 'white',
    border: '1px solid var(--border-soft)',
    borderRadius: 3,
    padding: '10px 14px',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  inputBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '12px 14px',
    background: 'white',
    borderTop: '1px solid var(--border-soft)',
    flexShrink: 0,
  },
  input: {
    flex: 1,
    padding: '9px 13px',
    border: '1px solid var(--border-soft)',
    borderRadius: 3,
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '0.85rem',
    background: '#f5f3ee',
    color: '#0a0a0f',
    outline: 'none',
  },
  sendBtn: (disabled) => ({
    width: 38,
    height: 38,
    background: disabled ? 'rgba(0,0,0,0.12)' : '#c9923a',
    border: 'none',
    borderRadius: 3,
    color: disabled ? 'rgba(0,0,0,0.3)' : '#0a0a0f',
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'all 0.2s',
  }),
  fab: {
    width: 52,
    height: 52,
    background: '#0a0a0f',
    border: '1px solid rgba(201,146,58,0.35)',
    borderRadius: 3,
    color: '#c9923a',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
    position: 'relative',
  },
  unreadDot: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 10,
    height: 10,
    background: '#c9923a',
    borderRadius: '50%',
    border: '2px solid #faf8f4',
    boxShadow: '0 0 6px rgba(201,146,58,0.6)',
  },
};

/* Typing dot animation via inline keyframes */
function TypingDot({ delay }) {
  return (
    <span style={{
      display: 'inline-block',
      width: 6,
      height: 6,
      background: 'rgba(0,0,0,0.28)',
      borderRadius: '50%',
      animation: 'widget-bounce 1.2s ease-in-out infinite',
      animationDelay: delay,
    }} />
  );
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMessages([{
        role: 'bot',
        text: "Hi! I'm your community assistant. I can help you find events, check availability, or register for an event. What are you looking for?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setHasUnread(true);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleOpen = () => { setIsOpen(true); setHasUnread(false); };

  const handleSend = async (text = input) => {
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
        action, eventId,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'bot',
        text: "Error communicating with the assistant. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Keyframes injected inline */}
      <style>{`
        @keyframes widget-bounce {
          0%,80%,100%{transform:translateY(0);opacity:0.4}
          40%{transform:translateY(-5px);opacity:1}
        }
      `}</style>

      <div style={S.wrapper}>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              style={S.panel}
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.96 }}
              transition={{ duration: 0.2 }}
            >
              {/* Header */}
              <div style={S.header}>
                <div style={S.headerAvatar}><Bot size={16} /></div>
                <span style={S.headerName}>Community Assistant</span>
                <button style={S.headerClose} onClick={() => setIsOpen(false)} aria-label="Close">
                  <X size={16} />
                </button>
              </div>

              {/* Messages */}
              <div style={S.messages}>
                {messages.map((msg, idx) => (
                  <div key={idx} style={S.msgRow(msg.role === 'user')}>
                    <div style={S.avatar(msg.role === 'user')}>
                      {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                    </div>
                    <div style={S.bubbleWrap(msg.role === 'user')}>
                      <div style={S.bubble(msg.role === 'user')}>
                        {msg.text}
                        {msg.action === 'register' && msg.eventId && (
                          <button
                            style={S.regBtn}
                            onClick={() => window.location.href = '/events#upcoming'}
                          >
                            Go to Events Page →
                          </button>
                        )}
                      </div>
                      <span style={S.time(msg.role === 'user')}>{msg.timestamp}</span>
                    </div>
                  </div>
                ))}

                {loading && (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                    <div style={S.avatar(false)}><Bot size={14} /></div>
                    <div style={S.typingDots}>
                      <TypingDot delay="0s" />
                      <TypingDot delay="0.2s" />
                      <TypingDot delay="0.4s" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div style={S.inputBar}>
                <input
                  style={S.input}
                  type="text"
                  placeholder="Type your message…"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  disabled={loading}
                />
                <button
                  style={S.sendBtn(loading || !input.trim())}
                  onClick={() => handleSend()}
                  disabled={loading || !input.trim()}
                  aria-label="Send"
                >
                  <Send size={16} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* FAB */}
        <motion.button
          style={S.fab}
          onClick={isOpen ? () => setIsOpen(false) : handleOpen}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          aria-label="Toggle chat"
        >
          {isOpen ? <X size={22} /> : <MessageCircle size={22} />}
          {hasUnread && !isOpen && <span style={S.unreadDot} />}
        </motion.button>
      </div>
    </>
  );
}
