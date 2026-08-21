import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { TickerRibbon } from './components/TickerRibbon';
import { HeroSection } from './components/HeroSection';
import { MobilePhoneShell } from './components/MobilePhoneShell';
import { AlertsCenter } from './components/AlertsCenter';
import { FraudDecisionGraph } from './components/FraudDecisionGraph';
import { VoiceBankingModal } from './components/VoiceBankingModal';
import { BankingProfile, SecurityAlert } from './types/banking';
import { Language, translations } from './i18n/translations';
import { Smartphone } from 'lucide-react';

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
  const [currentLang, setCurrentLang] = useState<Language>('pt');
  const [profile, setProfile] = useState<BankingProfile>(INITIAL_PROFILE);
  const [alerts, setAlerts] = useState<SecurityAlert[]>(INITIAL_ALERTS);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [selectedAlertContext, setSelectedAlertContext] = useState<SecurityAlert | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const t = translations[currentLang];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profRes, alertRes] = await Promise.all([
          fetch('/api/banking/profile'),
          fetch('/api/banking/alerts')
        ]);
        if (profRes.ok) {
          const profData = await profRes.json();
          setProfile(profData);
        }
        if (alertRes.ok) {
          const alertData = await alertRes.json();
          setAlerts(alertData);
        }
      } catch (e) {
        console.warn('Using initial banking state');
      }
    };
    fetchData();
  }, []);

  const handleAction = async (actionType: string, targetId: string) => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/banking/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action_type: actionType,
          target_id: targetId
        })
      });

      if (res.ok) {
        if (actionType === 'freeze_card') {
          setProfile(prev => ({
            ...prev,
            cards: prev.cards.map(c => c.id === targetId ? { ...c, status: 'frozen' } : c)
          }));
        } else if (actionType === 'unfreeze_card') {
          setProfile(prev => ({
            ...prev,
            cards: prev.cards.map(c => c.id === targetId ? { ...c, status: 'active' } : c)
          }));
        } else if (actionType === 'block_pix') {
          setAlerts(prev => prev.map(a => a.id === targetId ? { ...a, status: 'blocked_and_reversed' } : a));
        } else if (actionType === 'approve_pix') {
          setAlerts(prev => prev.map(a => a.id === targetId ? { ...a, status: 'approved_by_user' } : a));
        }
      }
    } catch (e) {
      console.error('Error executing banking action:', e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpenVoice = (alertId?: string) => {
    if (alertId) {
      const match = alerts.find(a => a.id === alertId);
      setSelectedAlertContext(match || null);
    } else {
      setSelectedAlertContext(alerts[0] || null);
    }
    setIsVoiceModalOpen(true);
  };

  const scrollToMobileApp = () => {
    document.getElementById('mobile-app')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToGraph = () => {
    document.getElementById('decision-graph')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-body-bg flex flex-col font-sans">
      
      {/* Top Header with Language Toggle */}
      <Header
        customerName={profile.customer_name}
        segment={profile.segment}
        activeAlertsCount={alerts.filter(a => a.status === 'held_pending_confirmation').length}
        currentLang={currentLang}
        onToggleLang={setCurrentLang}
        onOpenVoiceAssistant={() => handleOpenVoice()}
      />

      {/* Live Financial & Security Ticker */}
      <TickerRibbon currentLang={currentLang} />

      {/* High-Contrast Hero Section (DESIGN.md Spec) */}
      <HeroSection
        currentLang={currentLang}
        onTriggerVoiceModal={() => handleOpenVoice()}
        onScrollToMobileApp={scrollToMobileApp}
        onScrollToGraph={scrollToGraph}
      />

      {/* Main Dual-View Workspace */}
      <main className="max-w-7xl mx-auto w-full px-6 py-10 flex-1">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Interactive Mobile Phone View (5 Cols) */}
          <div id="mobile-app" className="lg:col-span-5 flex flex-col items-center sticky top-20">
            <div className="w-full flex items-center justify-between mb-3 px-2">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-brand-orange" />
                <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                  {t.mobile.simulatorTitle}
                </span>
              </div>
              <span className="text-[11px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-[4px] border border-emerald-200">
                {t.mobile.secureSession}
              </span>
            </div>

            <MobilePhoneShell
              profile={profile}
              alerts={alerts}
              currentLang={currentLang}
              onOpenVoiceAssistant={() => handleOpenVoice()}
              onActionClick={handleAction}
            />
          </div>

          {/* Right Column: Alerts Center & Decision Graph (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Proactive Incident & Alerts Feed */}
            <AlertsCenter
              alerts={alerts}
              currentLang={currentLang}
              onActionClick={handleAction}
              onOpenVoiceAssistant={handleOpenVoice}
              isProcessing={isProcessing}
            />

            {/* Visual Reasoning Decision Graph */}
            <FraudDecisionGraph currentLang={currentLang} />

          </div>

        </div>

      </main>

      {/* Voice Assistant Modal with Gemini Multimodal AI */}
      <VoiceBankingModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        alertContext={selectedAlertContext}
        currentLang={currentLang}
        onActionClick={handleAction}
      />

      {/* Footer */}
      <footer className="w-full bg-hero-bg text-text-muted border-t border-white/10 py-6 px-6 text-center text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="bg-brand-orange text-white font-bold text-[10px] px-1.5 py-0.5 rounded-[2px]">itau</span>
            <span className="text-white font-medium">{t.footer.brand}</span>
          </div>
          <p className="text-text-muted text-[11px]">
            {t.footer.tagline}
          </p>
        </div>
      </footer>

    </div>
  );
}

export default App;
