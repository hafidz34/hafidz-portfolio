'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, Loader2, User, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatSection() {
  const [messages, setMessages] = useState<{role: string, content: string}[]>([
    { role: 'assistant', content: "Halo! Ada yang ingin kamu tahu tentang profil Hafidz?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const suggestions = [
    "Ceritakan pengalaman magang Hafidz di SPIL!",
    "Apa skill teknis utama yang dimiliki Hafidz?",
    "Jelaskan sertifikasi BNSP yang dimiliki Hafidz!",
    "Proyek Machine Learning apa saja yang sudah dibuat olehnya?"
  ];

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;
    
    const userMessage = text;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, { role: 'user', content: userMessage }] }),
      });
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Maaf, koneksi sedang tidak stabil." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="chat-ai" className="py-12 bg-slate-50 border-t border-slate-200">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-600 text-xs font-bold mb-2">
            <Sparkles size={12} /> AI Powered
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Tanya Tentang Hafidz</h2>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden flex flex-col h-[500px]">
          
          <div 
            ref={chatContainerRef} 
            className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50 scroll-smooth"
          >
            <AnimatePresence>
              {messages.map((m, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: 5 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-2 max-w-[90%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-blue-600' : 'bg-emerald-600'}`}>
                      {m.role === 'user' ? <User size={12} className="text-white"/> : <Bot size={12} className="text-white"/>}
                    </div>
                    <div className={`px-3 py-2 rounded-xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
                      m.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-tr-none' 
                        : 'bg-white text-slate-700 border border-slate-200 rounded-tl-none'
                    }`}>
                      {m.content}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {loading && (
              <div className="flex items-center gap-2 text-slate-400 text-xs ml-2 mt-2">
                 <Loader2 size={12} className="animate-spin"/> Mohon tunggu...
              </div>
            )}
          </div>

          <div className="p-3 bg-white border-t border-slate-100">
            <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-hide">
              {suggestions.map((q, idx) => (
                <button 
                  key={idx}
                  onClick={() => handleSend(q)}
                  disabled={loading}
                  className="whitespace-nowrap px-3 py-1.5 bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 text-xs font-medium rounded-full border border-slate-200 transition"
                >
                  {q}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                className="flex-1 bg-slate-50 border border-slate-200 text-slate-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Tanya pengalaman atau skill..."
                disabled={loading}
              />
              <button 
                onClick={() => handleSend()} 
                disabled={loading || !input.trim()}
                className="p-2 bg-blue-600 rounded-lg text-white hover:bg-blue-700 disabled:opacity-50 transition"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}