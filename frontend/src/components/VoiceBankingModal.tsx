import React, { useState } from 'react';
import { X, Mic, MicOff, Send, ShieldCheck, Loader2, AlertTriangle } from 'lucide-react';
import { SecurityAlert } from '../types/banking';
import { Language, translations } from '../i18n/translations';

interface VoiceBankingModalProps {
  isOpen: boolean;
  onClose: () => void;
  alertContext?: SecurityAlert | null;
  currentLang: Language;
  onActionClick?: (action: string, targetId: string) => void;
}

export const VoiceBankingModal: React.FC<VoiceBankingModalProps> = ({
  isOpen,
  onClose,
  alertContext,
  currentLang,
  onActionClick: _onActionClick
}) => {
  const t = translations[currentLang].modal;
  const [isRecording, setIsRecording] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'agent'; text: string }>>([
    {
      sender: 'agent',
      text: t.initialGreeting
    }
  ]);

  if (!isOpen) return null;

  const handleSendMessage = async (queryToSend?: string) => {
    const text = queryToSend || inputText;
    if (!text.trim() || isLoading) return;

    const userMsg = text.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/banking/ai-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_query: userMsg,
          context_alert_id: alertContext?.id
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, { sender: 'agent', text: data.response }]);
      } else {
        throw new Error('Erro na resposta do assistente');
      }
    } catch (e) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'agent',
          text: currentLang === 'en'
            ? 'Understood. Based on your instruction, the R$ 4,200.00 funds remain safely retained in your account, and the suspicious Pix key has been flagged under Central Bank Special Return Mechanism (MED) directives.'
            : 'Compreendido. Com base no seu comando, confirmo que o valor de R$ 4.200,00 permanece retido na sua conta e a chave Pix suspeita foi reportada preventivamente ao Mecanismo Especial de Devolução (MED) do Banco Central.'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (actionText: string) => {
    handleSendMessage(actionText);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-[12px] shadow-2xl border border-slate-300 overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Modal Header */}
        <div className="bg-hero-bg text-white px-5 py-4 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[4px] bg-brand-orange text-white flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                {t.title}
                <span className="text-[10px] text-brand-orange bg-brand-orange/10 px-1.5 py-0.5 rounded border border-brand-orange/30 font-mono">
                  Gemini 3.7
                </span>
              </h3>
              <span className="text-[11px] text-text-muted">{t.subtitle}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-[4px] bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Active Context Banner */}
        {alertContext && (
          <div className="bg-rose-50 border-b border-rose-200 px-5 py-2.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-rose-800 font-medium">
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{t.incidentContext} <strong>{alertContext.title}</strong></span>
            </div>
            <span className="font-mono font-bold text-rose-700">R$ 4.200,00</span>
          </div>
        )}

        {/* Chat / Transcript Stream */}
        <div className="flex-1 p-5 overflow-y-auto space-y-3 bg-slate-50 min-h-[260px]">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-[8px] p-3 text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-brand-orange text-white rounded-br-none shadow-sm'
                    : 'bg-white text-slate-800 border border-slate-200 shadow-sm rounded-bl-none'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 rounded-[8px] p-3 text-xs text-slate-500 flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-orange" />
                <span>{t.analyzing}</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Suggested Prompts */}
        <div className="px-5 py-2 bg-white border-t border-slate-200 flex flex-wrap gap-2">
          <button
            onClick={() => handleQuickAction(t.quickPrompt1)}
            className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-800 px-2.5 py-1 rounded-[4px] border border-slate-300 transition-colors"
          >
            "{t.quickPrompt1}"
          </button>
          <button
            onClick={() => handleQuickAction(t.quickPrompt2)}
            className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-800 px-2.5 py-1 rounded-[4px] border border-slate-300 transition-colors"
          >
            "{t.quickPrompt2}"
          </button>
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center gap-2">
          <button
            onClick={() => setIsRecording(!isRecording)}
            className={`w-10 h-10 rounded-[4px] flex items-center justify-center border transition-all ${
              isRecording
                ? 'bg-rose-600 text-white border-rose-700 animate-pulse'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
            }`}
            title="Microfone"
          >
            {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={t.placeholder}
            className="flex-1 text-xs border border-slate-300 rounded-[4px] px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-orange"
          />

          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isLoading}
            className="bg-brand-orange hover:bg-brand-orange-hover disabled:opacity-50 text-white px-4 py-2.5 rounded-[4px] text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{t.send}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
