
import React, { useState, useRef, useEffect } from 'react';
import { SOKBData } from '../types';
import { getESGInsights, askAssistant } from '../services/geminiService';

interface AIAssistantWidgetProps {
  data: SOKBData;
  theme: 'light' | 'dark';
}

const AIAssistantWidget: React.FC<AIAssistantWidgetProps> = ({ data, theme }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    { role: 'ai', text: 'Здравствуйте! Я ваш ИИ-помощник Инстат. Чем могу помочь с анализом СОКБ показателей сегодня?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  const handleQuickAnalysis = async () => {
    setIsThinking(true);
    setIsOpen(true);
    setMessages(prev => [...prev, { role: 'user', text: 'Проведи экспресс-анализ текущего состояния СОКБ.' }]);
    
    try {
      const insight = await getESGInsights(data);
      setMessages(prev => [...prev, { role: 'ai', text: insight }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: 'К сожалению, не удалось получить аналитику сейчас.' }]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || isThinking) return;

    const userText = inputValue;
    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsThinking(true);

    try {
      const response = await askAssistant(userText, data);
      setMessages(prev => [...prev, { role: 'ai', text: response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: 'Ошибка при обработке запроса.' }]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 flex flex-col items-end z-[9999]">
      {/* Widget Panel */}
      {isOpen && (
        <div className={`atl-card mb-4 w-[380px] h-[600px] flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300 ${theme === 'dark' ? 'bg-atlassian-darkSurface border-atlassian-darkBorder shadow-2xl shadow-black/40' : 'bg-white shadow-2xl shadow-atlassian-brand/10'}`}>
          {/* Header */}
          <div className="p-4 border-b border-atlassian-border dark:border-atlassian-darkBorder flex items-center justify-between bg-gradient-to-r from-atlassian-brand/5 to-atlassian-info/5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-atlassian-brand flex items-center justify-center text-white shadow-sm">
                <span className="material-symbols-rounded text-[20px]">auto_awesome</span>
              </div>
              <div>
                <h3 className="text-xs font-bold text-atlassian-text dark:text-white uppercase tracking-wider">Инстат Ассистент</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-atlassian-success animate-pulse"></span>
                  <span className="text-[10px] text-atlassian-subtext dark:text-atlassian-darkSubtext font-bold uppercase tracking-wide">В сети</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-atlassian-subtext hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <span className="material-symbols-rounded text-[20px]">close</span>
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user' 
                  ? 'bg-atlassian-brand text-white rounded-br-none shadow-sm' 
                  : 'bg-atlassian-bg dark:bg-atlassian-darkBg text-atlassian-text dark:text-atlassian-darkText border border-atlassian-border dark:border-atlassian-darkBorder rounded-bl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isThinking && (
              <div className="flex justify-start">
                <div className="bg-atlassian-bg dark:bg-atlassian-darkBg px-4 py-3 rounded-2xl rounded-bl-none border border-atlassian-border dark:border-atlassian-darkBorder">
                  <div className="flex gap-1.5">
                    <span className="w-1.5 h-1.5 bg-atlassian-subtext rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-atlassian-subtext rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 bg-atlassian-subtext rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length < 3 && !isThinking && (
            <div className="px-4 pb-3 flex gap-2 overflow-x-auto scrollbar-hide">
              <button 
                onClick={handleQuickAnalysis}
                className="whitespace-nowrap flex items-center gap-2 px-3 py-1.5 rounded-lg border border-atlassian-subtext/30 bg-white dark:bg-atlassian-darkSurface text-atlassian-subtext dark:text-atlassian-darkSubtext text-[10px] font-bold uppercase hover:bg-atlassian-bg dark:hover:bg-atlassian-darkBg hover:text-atlassian-text dark:hover:text-white transition-all shadow-sm"
              >
                <span className="material-symbols-rounded text-[16px]">bar_chart</span>
                Экспресс-анализ СОКБ
              </button>
              <button 
                onClick={() => setInputValue('Как улучшить рейтинг СОКБ?')}
                className="whitespace-nowrap flex items-center gap-2 px-3 py-1.5 rounded-lg border border-atlassian-subtext/30 bg-white dark:bg-atlassian-darkSurface text-atlassian-subtext dark:text-atlassian-darkSubtext text-[10px] font-bold uppercase hover:bg-atlassian-bg dark:hover:bg-atlassian-darkBg hover:text-atlassian-text dark:hover:text-white transition-all shadow-sm"
              >
                <span className="material-symbols-rounded text-[16px]">star_outline</span>
                Улучшить рейтинг
              </button>
            </div>
          )}

          {/* Input Area */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-atlassian-border dark:border-atlassian-darkBorder bg-white dark:bg-atlassian-darkSurface">
            <div className="relative">
              <input 
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Спросите ассистента..."
                className={`w-full h-10 pl-4 pr-12 text-sm rounded-lg border focus:ring-2 focus:ring-atlassian-brand focus:border-transparent outline-none transition-all ${
                  theme === 'dark' 
                  ? 'bg-atlassian-darkBg border-atlassian-darkBorder text-white placeholder-atlassian-darkSubtext' 
                  : 'bg-atlassian-bg border-atlassian-border text-atlassian-text'
                }`}
              />
              <button 
                type="submit"
                disabled={!inputValue.trim() || isThinking}
                className={`absolute right-1 top-1 h-8 w-8 rounded-lg flex items-center justify-center transition-all ${
                  inputValue.trim() && !isThinking ? 'bg-atlassian-brand text-white shadow-sm hover:bg-atlassian-brandHover' : 'text-atlassian-subtext opacity-50'
                }`}
              >
                <span className="material-symbols-rounded text-[20px]">send</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-xl shadow-atlassian-brand/30 transition-all hover:scale-105 active:scale-95 group ${isOpen ? 'bg-atlassian-text dark:bg-atlassian-darkBorder' : 'bg-gradient-to-tr from-atlassian-brand to-atlassian-info'}`}
      >
        <span className={`material-symbols-rounded text-[28px] transition-transform duration-300 ${isOpen ? 'rotate-90' : 'group-hover:rotate-12'}`}>
          {isOpen ? 'expand_more' : 'auto_awesome'}
        </span>
      </button>
    </div>
  );
};

export default AIAssistantWidget;
