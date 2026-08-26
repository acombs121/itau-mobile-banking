import React, { useState } from 'react';
import { X, Mic, Send, Volume2, ShieldCheck } from 'lucide-react';
import { SecurityAlert } from '../types/banking';
import { Language, translations } from '../i18n/translations';

interface VoiceBankingModalProps {
  isOpen: boolean;
  onClose: () => void;
  alertContext?: SecurityAlert | null;
  currentLang: Language;
  onActionClick: (action: string, targetId: string) => void;
}

export const VoiceBankingModal: React.FC<VoiceBankingModalProps> = ({
  isOpen,
  onClose,
  alertContext,
  currentLang,
  onActionClick
}) => {
  const [messages, setMessages] = useState<Array<{ role: 'assistant' | 'user'; text: string }>>([
    {
      role: 'assistant',
      text: translations[currentLang].modal.initialGreeting
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const t = translations[currentLang].modal;

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMsg = inputText.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInputText('');
    setIsProcessing(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          context: alertContext || null,
          lang: currentLang
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, { role: 'assistant', text: data.reply }]);
      } else {
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            text: currentLang === 'en' ? 'Connection error with Itaú Concierge.' : 'Erro de conexão com o Itaú Concierge.'
          }
        ]);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: currentLang === 'en' ? 'Service temporarily unavailable.' : 'Serviço temporariamente indisponível.'
        }
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQuickAction = (promptText: string, actionType: string) => {
    setInputText(promptText);
    onActionClick(actionType, alertContext?.id || 'action_quick');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg bg-[#121215] border border-white/10 rounded-[14px] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-[#18181C]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[4px] bg-brand-orange text-white flex items-center justify-center font-bold text-sm">
              itau
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-bold text-sm text-white">
                <span>{t.title}</span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-xs text-white/50">{t.subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-[4px] border border-white/10 text-white/60 hover:text-white hover:bg-white/5 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Audio Visualizer Mock */}
        <div className="py-4 px-6 bg-gradient-to-b from-[#18181C] to-[#121215] border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-1.5 h-6">
            {[40, 70, 30, 90, 50, 80, 20, 60, 95, 45, 75, 35].map((h, i) => (
              <div
                key={i}
                style={{ height: `${h}%` }}
                className={`w-1 rounded-full ${
                  isListening
                    ? 'bg-emerald-400 animate-pulse'
                    : isProcessing
                    ? 'bg-brand-orange animate-pulse'
                    : 'bg-brand-orange shadow-[0_0_8px_#FF6423]'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-white/60">
            <Volume2 className="w-4 h-4 text-brand-orange animate-pulse" />
            <span>{isListening ? t.listening : isProcessing ? t.processing : t.speaking}</span>
          </div>
        </div>

        {/* Chat Message Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 min-h-[220px]">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-[10px] p-3.5 text-xs sm:text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-brand-orange text-white'
                    : 'bg-[#1E1E24] border border-white/[0.08] text-white/90'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}

          {isProcessing && (
            <div className="flex items-center gap-2 text-xs text-brand-orange">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-ping" />
              <span>{t.processing}</span>
            </div>
          )}
        </div>

        {/* Quick Suggestion Prompts */}
        {t.suggestions && (
          <div className="px-4 py-2 bg-black/30 border-t border-white/[0.06] flex flex-wrap gap-2">
            {t.suggestions.slice(0, 2).map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickAction(s, 'quick_action')}
                className="text-[11px] px-2.5 py-1 rounded-[4px] border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] text-white/80 transition-colors truncate max-w-full"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <div className="p-4 bg-[#18181C] border-t border-white/10 flex items-center gap-2.5">
          <button
            onClick={() => setIsListening(!isListening)}
            className={`w-9 h-9 rounded-[4px] flex items-center justify-center transition-all ${
              isListening
                ? 'bg-rose-600 text-white animate-pulse'
                : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
            }`}
          >
            <Mic className="w-4 h-4" />
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={t.micHelp}
            className="flex-1 bg-black/40 border border-white/10 rounded-[4px] px-3 py-2 text-xs sm:text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-brand-orange"
          />

          <button
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="w-9 h-9 rounded-[4px] bg-brand-orange hover:bg-brand-orange-hover disabled:opacity-30 text-white flex items-center justify-center transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
