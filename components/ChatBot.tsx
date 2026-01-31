
import React, { useState, useRef, useEffect } from 'react';
import { AIService } from '../services/aiService';
import { ChatMessage, AIConfig } from '../types';
import { Icons } from '../constants';

interface ChatBotProps {
  config: AIConfig;
}

const ChatBot: React.FC<ChatBotProps> = ({ config }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [useSearch, setUseSearch] = useState(config.provider === 'Gemini');
  const [useThinking, setUseThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = { role: 'user', content: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await AIService.generateText(input, config, {
        useSearch: config.provider === 'Gemini' ? useSearch : false,
        useThinking: config.provider === 'Gemini' ? useThinking : false,
        systemInstruction: "You are Genesis Assistant, a product design expert. Help the user refine their product strategy, answer technical questions, and suggest optimizations."
      });

      let content = response.text;
      
      if (useSearch && response.groundingChunks?.length) {
        const links = response.groundingChunks
          .map((chunk: any) => chunk.web?.uri)
          .filter(Boolean);
        
        if (links.length > 0) {
          const uniqueLinks = Array.from(new Set(links));
          content += "\n\n**Sources:**\n" + uniqueLinks.map(link => `- [${link}](${link})`).join('\n');
        }
      }

      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: content,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error. Please check your settings.", timestamp: Date.now() }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-120px)] p-6">
      <div className="flex-1 overflow-y-auto space-y-6 mb-6 pr-4 custom-scrollbar" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
            <div className="p-4 bg-slate-900 rounded-full">
              <Icons.Chat />
            </div>
            <p>Genesis Chat: Real-time intelligence & reasoning.</p>
            <p className="text-xs font-mono text-slate-500 uppercase tracking-tighter">Engine: {config.selectedModel}</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl p-4 ${
              msg.role === 'user' ? 'bg-blue-600 text-white shadow-lg' : 'glass border-slate-800 text-slate-200'
            }`}>
              <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="glass p-4 rounded-2xl flex items-center gap-2 border-blue-500/20">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {config.provider === 'Gemini' && (
          <div className="flex gap-4 text-xs font-semibold uppercase tracking-widest text-slate-500">
             <button 
               onClick={() => setUseSearch(!useSearch)}
               className={`px-3 py-1 rounded-full border transition-all flex items-center gap-1 ${useSearch ? 'bg-blue-500/10 border-blue-500 text-blue-400' : 'border-slate-800'}`}
             >
               <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
               Search Grounding
             </button>
             <button 
               onClick={() => setUseThinking(!useThinking)}
               className={`px-3 py-1 rounded-full border transition-all flex items-center gap-1 ${useThinking ? 'bg-purple-500/10 border-purple-500 text-purple-400' : 'border-slate-800'}`}
             >
               <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
               Thinking Mode
             </button>
          </div>
        )}

        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={`Ask ${config.provider} assistant anything...`}
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-16 shadow-xl"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="absolute right-2 top-2 bottom-2 px-4 text-blue-500 hover:text-white transition-all disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
