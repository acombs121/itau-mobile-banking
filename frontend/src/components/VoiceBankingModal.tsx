import React, { useState } from 'react';
import { X, Mic, MicOff, Send, Loader2 } from 'lucide-react';
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
  alertContext: _alertContext,
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
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, { sender: 'agent', text: data.response }]);
      } else {
        throw new Error('Erro');
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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0F0F0F] text-white w-full max-w-lg rounded-[14px] shadow-2xl border border-white/[0.12] overflow-hidden flex flex-col max-h-[80vh]">
        
        {/* Minimal Header */}
        <div className="px-5 py-3.5 flex items-center justify-between border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-[3px] bg-brand-orange text-white flex items-center justify-center font-bold text-[10px]">
              itau
            </div>
            <span className="text-xs font-semibold text-white/90">
              Itaú Guard AI
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-5 overflow-y-auto space-y-3 min-h-[260px]">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-[8px] p-3 text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-brand-orange text-white'
                    : 'bg-white/[0.04] text-white/90 border border-white/[0.06]'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white/[0.04] border border-white/[0.06] rounded-[8px] p-2.5 text-xs text-white/40 flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin text-brand-orange" />
                <span>{t.analyzing}</span>
              </div>
            </div>
          )}
        </div>

        {/* Minimal Quick Action Suggestions */}
        <div className="px-5 py-2 border-t border-white/[0.06] flex flex-wrap gap-2">
          <button
            onClick={() => handleQuickAction(t.quickPrompt1)}
            className="text-[11px] text-white/60 hover:text-white border border-white/10 hover:border-white/25 px-2.5 py-1 rounded-[4px] transition-colors"
          >
            {t.quickPrompt1}
          </button>
          <button
            onClick={() => handleQuickAction(t.quickPrompt2)}
            className="text-[11px] text-white/60 hover:text-white border border-white/10 hover:border-white/25 px-2.5 py-1 rounded-[4px] transition-colors"
          >
            {t.quickPrompt2}
          </button>
        </div>

        {/* Input Bar */}
        <div className="p-3.5 border-t border-white/[0.08] flex items-center gap-2 bg-black/40">
          <button
            onClick={() => setIsRecording(!isRecording)}
            className={`w-9 h-9 rounded-[4px] flex items-center justify-center transition-all ${
              isRecording
                ? 'bg-rose-600 text-white'
                : 'text-white/40 hover:text-white hover:bg-white/5'
            }`}
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={t.placeholder}
            className="flex-1 text-xs bg-transparent text-white border-0 focus:outline-none placeholder-white/30"
          />

          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isLoading}
            className="bg-brand-orange hover:bg-brand-orange-hover disabled:opacity-30 text-white px-3 py-1.5 rounded-[4px] text-xs font-medium flex items-center gap-1 transition-all"
          >
            <Send className="w-3 h-3" />
            <span>{t.send}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
