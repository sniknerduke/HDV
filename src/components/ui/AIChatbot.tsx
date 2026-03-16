import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Bot, Sparkles } from 'lucide-react';
import { sendChatMessage, type ChatMessage } from '../../services/chatbotService';

interface DisplayMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AIChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<DisplayMessage[]>([
    {
      id: 0,
      role: 'assistant',
      content: 'Xin chào! 👋 Mình là trợ lý AI của EduSmart. Bạn cần mình giúp gì nào?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPulse, setShowPulse] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const idCounter = useRef(1);

  // Auto-scroll to latest message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Focus input when panel opens
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  // Kill pulse after first open
  useEffect(() => {
    if (open) setShowPulse(false);
  }, [open]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: DisplayMessage = {
      id: idCounter.current++,
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Build history for the API (exclude system welcome)
      const apiMessages: ChatMessage[] = [...messages, userMsg]
        .filter((m) => m.id !== 0)
        .map((m) => ({ role: m.role, content: m.content }));

      const reply = await sendChatMessage(apiMessages);

      setMessages((prev) => [
        ...prev,
        {
          id: idCounter.current++,
          role: 'assistant',
          content: reply,
          timestamp: new Date(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: idCounter.current++,
          role: 'assistant',
          content: 'Xin lỗi, đã có lỗi xảy ra. Bạn thử lại sau nhé!',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* ── Chat Panel ── */}
      <div
        className="chatbot-panel"
        style={{
          transform: open ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
        }}
      >
        {/* Header */}
        <div className="chatbot-header">
          <div className="chatbot-header-left">
            <div className="chatbot-avatar">
              <Sparkles size={18} />
            </div>
            <div>
              <div className="chatbot-title">EduSmart AI</div>
              <div className="chatbot-subtitle">Trợ lý học tập thông minh</div>
            </div>
          </div>
          <button className="chatbot-close" onClick={() => setOpen(false)} aria-label="Đóng chatbot">
            <X size={18} />
          </button>
        </div>

        {/* Messages */}
        <div className="chatbot-messages" ref={scrollRef}>
          {messages.map((m) => (
            <div key={m.id} className={`chatbot-msg chatbot-msg--${m.role}`}>
              {m.role === 'assistant' && (
                <div className="chatbot-msg-icon">
                  <Bot size={16} />
                </div>
              )}
              <div className={`chatbot-bubble chatbot-bubble--${m.role}`}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="chatbot-msg chatbot-msg--assistant">
              <div className="chatbot-msg-icon">
                <Bot size={16} />
              </div>
              <div className="chatbot-bubble chatbot-bubble--assistant chatbot-typing">
                <span className="chatbot-dot" />
                <span className="chatbot-dot" />
                <span className="chatbot-dot" />
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="chatbot-input-bar">
          <input
            ref={inputRef}
            className="chatbot-input"
            placeholder="Nhập câu hỏi…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          <button
            className="chatbot-send"
            onClick={handleSend}
            disabled={loading || !input.trim()}
            aria-label="Gửi tin nhắn"
          >
            <Send size={18} />
          </button>
        </div>
      </div>

      {/* ── Floating Action Button ── */}
      <button
        className={`chatbot-fab ${showPulse ? 'chatbot-fab--pulse' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Đóng chatbot' : 'Mở chatbot'}
        id="chatbot-fab"
      >
        {open ? <X size={26} /> : <MessageCircle size={26} />}
      </button>
    </>
  );
}
