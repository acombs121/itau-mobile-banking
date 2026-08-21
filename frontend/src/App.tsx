import { useState } from 'react';
import { CockpitHeader } from './components/CockpitHeader';
import { PhoneContainer } from './components/PhoneContainer';
import { AgentOrchestratorPanel } from './components/AgentOrchestratorPanel';
import { VoiceBankingModal } from './components/VoiceBankingModal';
import { BankingProfile, SecurityAlert } from './types/banking';
import { SubAgent, SecurityActionItem, IOSNotification, TelemetryLog } from './types/itau_concierge';
import { Language, translations } from './i18n/translations';

const INITIAL_PROFILE: BankingProfile = {
  account_id: "ITAU-7749-00912",
  customer_name: "Roberto Silva",
  segment: "Itaú Personnalité",
  cpf_masked: "•••.491.808-••",
  agency: "7749",
  account_number: "00912-8",
  checking_balance_brl: 48950.20,
  investments_balance_brl: 320450.00,
  credit_limit_total: 85000.00,
  credit_limit_used: 12430.50,
  pix_daily_limit: 20000.00,
  pix_night_limit: 1000.00,
  cards: [
    {
      id: "card_01",
      name: "Itaú Personnalité Mastercard Black",
      last4: "8841",
      status: "active",
      virtual_card_active: true,
      contactless_enabled: true
    },
    {
      id: "card_02",
      name: "Itaú Visa Infinite",
      last4: "3390",
      status: "active",
      virtual_card_active: false,
      contactless_enabled: true
    }
  ],
  recent_transactions: [
    {
      id: "tx_01",
      date: "Hoje, 14:32",
      description: "Pix Enviado — Marina Camargo",
      category: "pix_out",
      amount_brl: -150.00,
      status: "completed"
    },
    {
      id: "tx_02",
      date: "Hoje, 11:15",
      description: "Restaurante Fasano Jardins",
      category: "dining",
      amount_brl: -640.00,
      status: "completed"
    },
    {
      id: "tx_03",
      date: "Ontem",
      description: "Pix Recebido — Dividendo FII HGLG11",
      category: "investment",
      amount_brl: 1820.00,
      status: "completed"
    }
  ]
};

const INITIAL_ALERTS: SecurityAlert[] = [
  {
    id: "alert_pix_fraud",
    severity: "CRITICAL",
    category: "fraud_anomaly",
    title: "Tentativa de Pix Suspeito Bloqueada",
    timestamp: "Agora mesmo",
    description: "Transferência Pix de R$ 4.200,00 para 'Eletro Tech SP' interceptada pelo sistema Itaú Guard. Divergência detectada: dispositivo em São Paulo acessando via proxy internacional.",
    amount_brl: 4200.00,
    recipient: "Eletro Tech SP Ltda (CNPJ 48.910.221/0001-09)",
    risk_score: 94,
    recommended_action: "Validar por biometria ou congelar token virtual",
    status: "held_pending_confirmation",
    policy_matched: "BACEN Resolução 147 — Mecanismo Especial de Devolução (MED)"
  },
  {
    id: "alert_night_limit",
    severity: "WARNING",
    category: "limit_management",
    title: "Diretriz Noturna BACEN Ativa (R$ 1.000,00)",
    timestamp: "20:00 - 06:00 BRT",
    description: "Regra preventiva do Banco Central limita transferências noturnas. Liberação emergencial exige validação por voz.",
    amount_brl: null,
    recipient: null,
    risk_score: 15,
    recommended_action: "Solicitar aumento temporário via IA se necessário",
    status: "active_rule",
    policy_matched: "Diretrizes de Segurança do Banco Central do Brasil"
  }
];

export function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [currentLang, setCurrentLang] = useState<Language>('pt');
  const [profile, setProfile] = useState<BankingProfile>(INITIAL_PROFILE);
  const [alerts, setAlerts] = useState<SecurityAlert[]>(INITIAL_ALERTS);
  const [subAgents, setSubAgents] = useState<SubAgent[]>([]);
  const [actionItems, setActionItems] = useState<SecurityActionItem[]>(translations['pt'].actionPlan.initialItems);
  const [notifications, setNotifications] = useState<IOSNotification[]>([]);
  const [telemetryLogs, setTelemetryLogs] = useState<TelemetryLog[]>([]);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const selectedAlertContext = alerts[0] || null;
  const [isSaving, setIsSaving] = useState(false);
  const [isProcessingAgent, setIsProcessingAgent] = useState<string | null>(null);

  const t = translations[currentLang];

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const triggerNotification = (title: string, subtitle: string) => {
    const newNotif: IOSNotification = {
      id: "notif_" + Date.now(),
      app: "Itaú Guard",
      title,
      subtitle,
      icon: "shield",
      timestamp: currentLang === 'en' ? "Now" : "Agora"
    };
    setNotifications(prev => [newNotif, ...prev]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotif.id));
    }, 6000);
  };

  const handleAction = async (actionType: string, targetId: string) => {
    if (actionType === 'block_pix') {
      setIsProcessingAgent('itau_med_dispute');
      
      setSubAgents(prev => {
        const others = prev.filter(a => a.id !== 'itau_med_dispute');
        return [
          ...others,
          {
            id: 'itau_med_dispute',
            name: "BACEN MED & Reversal Desk",
            type: "med",
            description: "",
            capabilities: [],
            status: 'completed',
            lastRun: new Date().toLocaleTimeString(currentLang === 'en' ? 'en-US' : 'pt-BR'),
            resultData: {
              action: "MED_DISPUTE_FILED",
              protocol: "MED-2026-" + Math.floor(100000 + Math.random() * 900000),
              status: "FUNDS_SAFEGUARDED_IN_ACCOUNT",
              amount_brl: 4200.00,
              central_bank_compliance: currentLang === 'en' ? "Resolution 147" : "Resolução 147"
            }
          }
        ];
      });

      setAlerts(prev => prev.map(a => a.id === targetId ? { ...a, status: 'blocked_and_reversed' } : a));

      const newAction: SecurityActionItem = {
        id: "act_" + Date.now(),
        time: new Date().toLocaleTimeString(currentLang === 'en' ? 'en-US' : 'pt-BR', { hour: '2-digit', minute: '2-digit' }) + " BRT",
        type: "med_claim",
        title: currentLang === 'en' ? "Pix Blocked & Central Bank MED Filed" : "Bloqueio Definitivo & Protocolo MED Gerado",
        description: currentLang === 'en' ? "R$ 4,200.00 refunded to checking balance. Counterparty key reported to BACEN." : "R$ 4.200,00 estornados para o saldo disponível. Chave Pix reportada ao BACEN.",
        status: "Safeguarded",
        details: "Protocolo MED #2026-ITAU-" + Math.floor(1000 + Math.random() * 9000)
      };
      setActionItems(prev => [newAction, ...prev]);

      triggerNotification(
        t.notifications.pixBlockedTitle,
        t.notifications.pixBlockedSubtitle
      );

      setTelemetryLogs(prev => [
        {
          id: "log_" + Date.now(),
          timestamp: new Date().toISOString(),
          agentId: "itau_med_dispute",
          agentName: "BACEN MED & Reversal Desk",
          action: "FILE_MED_DISPUTE_AND_REVERSE",
          status: "success",
          payload: {
            alert_id: targetId,
            refund_amount: 4200.00,
            bacen_resolution: "Res. 147"
          }
        },
        ...prev
      ]);

      setIsProcessingAgent(null);

    } else if (actionType === 'freeze_card' || actionType === 'unfreeze_card') {
      const isFreezing = actionType === 'freeze_card';
      setIsProcessingAgent('itau_card_token_servicing');

      setProfile(prev => ({
        ...prev,
        cards: prev.cards.map(c => c.id === targetId ? { ...c, status: isFreezing ? 'frozen' : 'active' } : c)
      }));

      setSubAgents(prev => {
        const others = prev.filter(a => a.id !== 'itau_card_token_servicing');
        return [
          ...others,
          {
            id: 'itau_card_token_servicing',
            name: "Card & Token Guardian",
            type: "cards",
            description: "",
            capabilities: [],
            status: 'completed',
            lastRun: new Date().toLocaleTimeString(currentLang === 'en' ? 'en-US' : 'pt-BR'),
            resultData: {
              card_id: targetId,
              action: isFreezing ? "CARD_FROZEN" : "CARD_UNFROZEN",
              tokens_deactivated: isFreezing ? ["ApplePay_Token_9912", "GooglePay_Token_4410"] : []
            }
          }
        ];
      });

      const newAction: SecurityActionItem = {
        id: "act_" + Date.now(),
        time: new Date().toLocaleTimeString(currentLang === 'en' ? 'en-US' : 'pt-BR', { hour: '2-digit', minute: '2-digit' }) + " BRT",
        type: "card_freeze",
        title: isFreezing
          ? (currentLang === 'en' ? "Mastercard Black Card Frozen" : "Cartão Mastercard Black Congelado")
          : (currentLang === 'en' ? "Mastercard Black Card Reactivated" : "Cartão Mastercard Black Reativado"),
        description: isFreezing
          ? (currentLang === 'en' ? "Digital tokens suspended to stop unauthorized recurring charges." : "Tokens digitais suspensos preventivamente contra compras recorrentes.")
          : (currentLang === 'en' ? "Biometric authentication confirmed by account holder." : "Biometria confirmada pelo titular."),
        status: isFreezing ? "Safeguarded" : "Confirmed",
        details: isFreezing ? "Card •• 8841" : "Secure Reactivation"
      };
      setActionItems(prev => [newAction, ...prev]);

      triggerNotification(
        isFreezing ? t.notifications.cardFrozenTitle : t.notifications.cardUnfrozenTitle,
        isFreezing ? t.notifications.cardFrozenSubtitle : t.notifications.cardUnfrozenSubtitle
      );

      setIsProcessingAgent(null);
    }
  };

  const handleTriggerManualAgent = (agentId: string) => {
    setIsProcessingAgent(agentId);
    setTimeout(() => {
      setSubAgents(prev => {
        const others = prev.filter(a => a.id !== agentId);
        const existing = prev.find(a => a.id === agentId);
        return [
          ...others,
          {
            id: agentId,
            name: existing?.name || agentId,
            type: existing?.type || "fraud",
            description: existing?.description || "",
            capabilities: existing?.capabilities || [],
            status: 'completed',
            lastRun: new Date().toLocaleTimeString(currentLang === 'en' ? 'en-US' : 'pt-BR'),
            resultData: {
              trigger: "MANUAL_ORCHESTRATOR_DISPATCH",
              status: "SUCCESS_VALIDATED",
              timestamp: new Date().toISOString()
            }
          }
        ];
      });

      triggerNotification(t.notifications.agentTriggeredTitle, `${t.notifications.agentTriggeredSubtitle}${agentId}`);
      setIsProcessingAgent(null);
    }, 800);
  };

  const handleToggleCall = () => {
    setIsCallActive(!isCallActive);
    setIsVoiceModalOpen(!isVoiceModalOpen);
  };

  const handleReset = () => {
    setProfile(INITIAL_PROFILE);
    setAlerts(INITIAL_ALERTS);
    setSubAgents([]);
    setActionItems(translations[currentLang].actionPlan.initialItems);
    setNotifications([]);
    setTelemetryLogs([]);
    triggerNotification(t.notifications.demoResetTitle, t.notifications.demoResetSubtitle);
  };

  const handleSaveSession = async () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      triggerNotification(t.notifications.sessionSavedTitle, t.notifications.sessionSavedSubtitle);
    }, 600);
  };

  const isDark = theme === 'dark';

  return (
    <div
      className={`h-screen max-h-screen w-full flex flex-col overflow-hidden transition-colors duration-200 ${
        isDark ? 'bg-[#1C1C20] text-white' : 'bg-[#EAEBED] text-slate-900'
      }`}
    >
      
      {/* Top Cockpit Header with Sun / Moon Toggle */}
      <CockpitHeader
        currentLang={currentLang}
        onToggleLang={setCurrentLang}
        theme={theme}
        onToggleTheme={toggleTheme}
        isCallActive={isCallActive}
        onToggleCall={handleToggleCall}
        onReset={handleReset}
        onSaveSession={handleSaveSession}
        isSaving={isSaving}
      />

      {/* Main Side-by-Side Dual-Pane Canvas on Charcoal Background */}
      <main className="flex-1 w-full max-w-[1500px] mx-auto p-3 sm:p-4 grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch min-h-0 overflow-hidden">
        
        {/* Left Pane: Interactive Mobile Smartphone Container (5 Cols) */}
        <div className="lg:col-span-5 flex justify-center items-center h-full min-h-0 overflow-hidden">
          <PhoneContainer
            profile={profile}
            alerts={alerts}
            notifications={notifications}
            currentLang={currentLang}
            theme={theme}
            onOpenVoiceAssistant={handleToggleCall}
            onActionClick={handleAction}
          />
        </div>

        {/* Right Pane: Agent & Process Orchestration Panel (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col h-full min-h-0 overflow-hidden">
          <AgentOrchestratorPanel
            subAgents={subAgents}
            actionItems={actionItems}
            telemetryLogs={telemetryLogs}
            activeAlerts={alerts}
            currentLang={currentLang}
            theme={theme}
            onTriggerAgent={handleTriggerManualAgent}
            isProcessingAgent={isProcessingAgent}
          />
        </div>

      </main>

      {/* Multimodal Gemini AI Modal */}
      <VoiceBankingModal
        isOpen={isVoiceModalOpen}
        onClose={() => {
          setIsVoiceModalOpen(false);
          setIsCallActive(false);
        }}
        alertContext={selectedAlertContext}
        currentLang={currentLang}
        onActionClick={handleAction}
      />

    </div>
  );
}

export default App;
