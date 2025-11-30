import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, Dumbbell } from 'lucide-react';
import { Message, Role, QUICK_ACTIONS } from '../types';
import { sendMessageToGemini } from '../services/geminiService';
import { MarkdownRenderer } from './MarkdownRenderer';

export const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: Role.MODEL,
      text: "# Dobrodošli u FitMind! 💪\n\nJa sam vaš AI trener. Mogu vam pomoći da:\n\n*   Kreirate plan treninga\n*   Prilagodite ishranu\n*   Pronađete motivaciju\n\n**Recite mi nešto o sebi (visina, težina, ciljevi) ili odaberite opciju ispod!**",
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text: string = inputText) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: Role.USER,
      text: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const responseText = await sendMessageToGemini(text);
      
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: Role.MODEL,
        text: responseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: Role.MODEL,
        text: "⚠️ Došlo je do greške pri komunikaciji sa serverom. Molim vas pokušajte ponovo.",
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900 w-full max-w-4xl mx-auto shadow-2xl rounded-xl overflow-hidden border border-zinc-800">
      {/* Header */}
      <header className="bg-zinc-800 p-4 flex items-center gap-3 border-b border-zinc-700">
        <div className="bg-emerald-600 p-2 rounded-lg">
            <Dumbbell className="text-white w-6 h-6" />
        </div>
        <div>
            <h1 className="font-bold text-white text-lg">FitMind AI</h1>
            <p className="text-xs text-zinc-400">Vaš lični trener i nutricionista</p>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex w-full ${msg.role === Role.USER ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-[90%] md:max-w-[80%] gap-3 ${msg.role === Role.USER ? 'flex-row-reverse' : 'flex-row'}`}>
              
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === Role.USER ? 'bg-indigo-600' : 'bg-emerald-600'
              }`}>
                {msg.role === Role.USER ? <User size={16} /> : <Bot size={16} />}
              </div>

              {/* Bubble */}
              <div
                className={`p-4 rounded-2xl shadow-md text-sm md:text-base ${
                  msg.role === Role.USER
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-zinc-800 text-zinc-200 rounded-tl-none border border-zinc-700'
                } ${msg.isError ? 'border-red-500 bg-red-900/20' : ''}`}
              >
                {msg.role === Role.MODEL ? (
                  <MarkdownRenderer content={msg.text} />
                ) : (
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                )}
                <span className="text-[10px] opacity-50 block mt-2 text-right">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>
        ))}
        
        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex justify-start">
             <div className="flex gap-3">
               <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0">
                  <Bot size={16} />
               </div>
               <div className="bg-zinc-800 p-4 rounded-2xl rounded-tl-none border border-zinc-700 flex items-center gap-2">
                 <Loader2 className="animate-spin text-emerald-500 w-4 h-4" />
                 <span className="text-zinc-400 text-sm">FitMind razmišlja...</span>
               </div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions (only show if chat is not loading and user is idle) */}
      {!isLoading && (
        <div className="px-4 py-2 flex gap-2 overflow-x-auto scrollbar-hide">
          {QUICK_ACTIONS.map((action, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(action.prompt)}
              className="whitespace-nowrap px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-emerald-400 text-xs rounded-full transition-colors font-medium flex-shrink-0"
            >
              {action.label}
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 bg-zinc-800/50 border-t border-zinc-700">
        <div className="flex items-end gap-2 bg-zinc-900 border border-zinc-700 rounded-xl p-2 focus-within:ring-2 focus-within:ring-emerald-500/50 transition-all">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Pitajte za plan treninga, ishranu ili savjet..."
            className="w-full bg-transparent text-white placeholder-zinc-500 text-sm md:text-base p-2 resize-none focus:outline-none max-h-32 min-h-[44px]"
            rows={1}
            style={{ minHeight: '44px' }}
          />
          <button
            onClick={() => handleSend()}
            disabled={isLoading || !inputText.trim()}
            className="p-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white transition-colors mb-0.5"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
        <p className="text-center text-[10px] text-zinc-600 mt-2">
          FitMind može pogriješiti. Konsultujte se sa ljekarom prije započinjanja novog režima.
        </p>
      </div>
    </div>
  );
};
