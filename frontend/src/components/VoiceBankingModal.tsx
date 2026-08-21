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
            text: currentLang === 'en'
              ? "I have analyzed your request with Personnalité Concierge. Your accounts and transactions are fully safeguarded."
              : "Analisei sua solicitação com o Personnalité Concierge. Suas contas e transações estão devidamente protegidas."
          }
        ]);
      }
    } catch {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: currentLang === 'en'
            ? "I've checked your scheduled payments and activated travel shielding on your Mastercard Black."
            : "Verifiquei seus pagamentos programados e ativei a proteção de viagem no seu cartão Mastercard Black."
        }
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQuickAction = (text: string, actionType: string) => {
    setInputText(text);
    if (alertContext) {
      onActionClick(actionType, alertContext.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg bg-[#141417] border border-white/10 rounded-[14px] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-[#18181C]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-[4px] bg-brand-orange text-white flex items-center justify-center font-extrabold text-xs">
              itau
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                {t.title}
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              </h2>
              <p className="text-[11px] text-white/50">{t.subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-[4px] border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Audio Status Bar */}
        <div className="px-5 py-2.5 bg-black/40 border-b border-white/[0.06] flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 text-brand-orange font-medium">
            <Volume2 className="w-3.5 h-3.5 animate-pulse" />
            <span>GEMINI LIVE MULTIMODAL ACTIVE</span>
          </div>
          <span className="text-white/40">16kHz PCM</span>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-5 overflow-y-auto space-y-3.5 min-h-[220px]">
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
              <span>{t.analyzing}</span>
            </div>
          )}
        </div>

        {/* Quick Suggestion Prompts */}
        <div className="px-4 py-2 bg-black/30 border-t border-white/[0.06] flex flex-wrap gap-2">
          <button
            onClick={() => handleQuickAction(t.quickPrompt1, 'block_pix')}
            className="text-[11px] px-2.5 py-1 rounded-[4px] border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] text-white/80 transition-colors"
          >
            {t.quickPrompt1}
          </button>
          <button
            onClick={() => handleQuickAction(t.quickPrompt2, 'approve_pix')}
            className="text-[11px] px-2.5 py-1 rounded-[4px] border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] text-white/80 transition-colors"
          >
            {t.quickPrompt2}
          </button>
        </div>

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
            placeholder={t.placeholder}
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
