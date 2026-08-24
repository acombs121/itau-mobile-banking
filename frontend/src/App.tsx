import React, { useState, useEffect } from 'react';
import { CockpitHeader } from './components/CockpitHeader';
import { PhoneContainer } from './components/PhoneContainer';
import { AgentOrchestratorPanel } from './components/AgentOrchestratorPanel';
import { BankingProfile } from './types/banking';
import { SubAgent, SecurityActionItem, IOSNotification, TelemetryLog, ScenarioId } from './types/itau_concierge';
import { Language, translations } from './i18n/translations';

const DEFAULT_PROFILE: BankingProfile = {
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

export const App: React.FC = () => {
  // Read persisted language and theme from localStorage
  const [currentLang, setCurrentLang] = useState<Language>(() => {
    const savedLang = localStorage.getItem('itau_cockpit_lang');
    return (savedLang === 'en' || savedLang === 'pt') ? savedLang : 'pt';
  });

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const savedTheme = localStorage.getItem('itau_cockpit_theme');
    return (savedTheme === 'light' || savedTheme === 'dark') ? savedTheme : 'dark';
  });

  // Active Scenario State: Default is 'cash_flow' (Scenario 1)
  const [activeScenario, setActiveScenario] = useState<ScenarioId>('cash_flow');

  const [profile, setProfile] = useState<BankingProfile>(DEFAULT_PROFILE);
  const subAgents: SubAgent[] = [];
  const [actionItems, setActionItems] = useState<SecurityActionItem[]>([]);
  const [notifications, setNotifications] = useState<IOSNotification[]>([]);
  const [telemetryLogs, setTelemetryLogs] = useState<TelemetryLog[]>([]);

  // Scenario Resolution Flags
  const [isCdbSweepScheduled, setIsCdbSweepScheduled] = useState(false);
  const [isTravelModeActive, setIsTravelModeActive] = useState(false);
  const [isOpenFinanceRefiDone, setIsOpenFinanceRefiDone] = useState(false);
  const [isPixBlocked, setIsPixBlocked] = useState(false);

  // In-Phone Live Voice State (No modal popup!)
  const [isCallActive, setIsCallActive] = useState(false);
  const [isProcessingAgent, setIsProcessingAgent] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Sync lang changes to localStorage
  const handleToggleLang = (newLang: Language) => {
    setCurrentLang(newLang);
    localStorage.setItem('itau_cockpit_lang', newLang);
  };

  // Sync theme changes to localStorage and HTML root
  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('itau_cockpit_theme', nextTheme);
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Initial Actions in Plan
  useEffect(() => {
    setActionItems(translations[currentLang].actionPlan.initialItems);
  }, [currentLang]);

  // Trigger iOS Push Toast
  const triggerNotification = (title: string, subtitle: string) => {
    const newNotif: IOSNotification = {
      id: "notif_" + Date.now(),
      app: "Itaú Concierge",
      title,
      subtitle,
      icon: "shield",
      timestamp: currentLang === 'en' ? "Now" : "Agora"
    };
    setNotifications([newNotif]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotif.id));
    }, 5500);
  };

  // Scenario Switcher Handler
  const handleSelectScenario = (scenarioId: ScenarioId) => {
    setActiveScenario(scenarioId);
    const scenarioDef = translations[currentLang].scenarios.find(s => s.id === scenarioId);
    if (scenarioDef) {
      const newLog: TelemetryLog = {
        id: "log_" + Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        agentId: scenarioDef.agentId,
        agentName: scenarioDef.title,
        action: `SWITCH_SCENARIO_${scenarioDef.tag}`,
        status: "info",
        payload: scenarioDef.telemetryPayload
      };
      setTelemetryLogs(prev => [newLog, ...prev]);
    }
  };

  // Central Action Handler
  const handleBankingAction = (actionType: string, targetId?: string) => {
    const tNotif = translations[currentLang].notifications;
    const nowTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) + ' BRT';

    if (actionType === 'sweep_cdb' || actionType === 'view_cash_flow') {
      setIsCdbSweepScheduled(true);
      triggerNotification(tNotif.cdbSweepTitle, tNotif.cdbSweepSubtitle);
      
      const newAction: SecurityActionItem = {
        id: "act_" + Date.now(),
        time: nowTime,
        type: "cdb_sweep",
        title: currentLang === 'en' ? "CDB Sweep Scheduled — R$ 15,000.00" : "Resgate CDB Agendado — R$ 15.000,00",
        description: currentLang === 'en' ? "Automatic rebalance from CDB DI Liquidez Diária on Thursday morning to avoid LIS overdraft." : "Rebalanceamento programado do CDB DI para quinta-feira de manhã, eliminando juros LIS.",
        status: "Safeguarded",
        details: "Yield Optimized • Zero LIS Overdraft"
      };
      setActionItems(prev => [newAction, ...prev]);

      const newLog: TelemetryLog = {
        id: "log_" + Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        agentId: "cash_flow_forecast_agent",
        agentName: "Cash Flow & Overdraft Preemption Agent",
        action: "EXECUTE_OPTIMAL_CDB_SWEEP",
        status: "success",
        payload: {
          target_date: "2026-08-25 06:00 BRT",
          sweep_amount_brl: 15000.00,
          source: "CDB_DI_LIQUIDEZ_DIARIA",
          estimated_overdraft_interest_saved_brl: 184.60
        }
      };
      setTelemetryLogs(prev => [newLog, ...prev]);
    }
    else if (actionType === 'activate_travel_mode' || actionType === 'view_travel_insurance') {
      setIsTravelModeActive(true);
      triggerNotification(tNotif.travelModeTitle, tNotif.travelModeSubtitle);

      const newAction: SecurityActionItem = {
        id: "act_" + Date.now(),
        time: nowTime,
        type: "travel_mode",
        title: currentLang === 'en' ? "Travel Shield Activated: Portugal & Spain" : "Aviso de Viagem Ativado: Portugal e Espanha",
        description: currentLang === 'en' ? "Mastercard Black international spend limit raised to R$ 50,000. Travel health insurance verified." : "Limite internacional do Mastercard Black elevado para R$ 50.000. Seguro saúde internacional validado.",
        status: "Confirmed",
        details: "Policy: MASTERCARD_BLACK_MED_GLOBAL"
      };
      setActionItems(prev => [newAction, ...prev]);

      const newLog: TelemetryLog = {
        id: "log_" + Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        agentId: "travel_shield_agent",
        agentName: "Travel Shield & International Card Guardian",
        action: "ACTIVATE_TRAVEL_ROAMING_SHIELD",
        status: "success",
        payload: {
          destinations: ["Portugal", "Spain"],
          dates: "20/08 - 05/09",
          international_pos_limit_brl: 50000.00,
          fraud_engine_mode: "SUPPRESS_FALSE_DECLINES"
        }
      };
      setTelemetryLogs(prev => [newLog, ...prev]);
    }
    else if (actionType === 'refinance_open_finance' || actionType === 'simulate_open_finance') {
      setIsOpenFinanceRefiDone(true);
      triggerNotification(tNotif.openFinanceTitle, tNotif.openFinanceSubtitle);

      const newAction: SecurityActionItem = {
        id: "act_" + Date.now(),
        time: nowTime,
        type: "open_finance_ccb",
        title: currentLang === 'en' ? "Debt Portability CCB Executed — R$ 14,280 Saved" : "Portabilidade CCB Executada — R$ 14.280 Salvos",
        description: currentLang === 'en' ? "Settled R$ 18,000 revolving balance at competitor via electronic CCB (Lei 10.931). Locked Personnalité rate at 1.69%/mo." : "Liquidado saldo rotativo de R$ 18.000 em concorrente via CCB eletrônica (Lei 10.931). Taxa Personnalité 1,69% a.m.",
        status: "Safeguarded",
        details: "CCB #2026-ITAU-CCB-8819 • Rail: CIP/STR"
      };
      setActionItems(prev => [newAction, ...prev]);

      const newLog: TelemetryLog = {
        id: "log_" + Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        agentId: "open_finance_optimizer",
        agentName: "Open Finance & Debt Portability Optimizer",
        action: "DISPATCH_INTERBANK_PAYOFF_CIP",
        status: "success",
        payload: {
          external_balance_settled_brl: 18000.00,
          previous_rate: "11.2% a.m.",
          new_rate: "1.69% a.m.",
          total_interest_saved_brl: 14280.00
        }
      };
      setTelemetryLogs(prev => [newLog, ...prev]);
    }
    else if (actionType === 'block_pix') {
      setIsPixBlocked(true);
      triggerNotification(tNotif.pixBlockedTitle, tNotif.pixBlockedSubtitle);

      const newAction: SecurityActionItem = {
        id: "act_" + Date.now(),
        time: nowTime,
        type: "med_claim",
        title: currentLang === 'en' ? "Pix Blocked & Refunded via MED" : "Pix Bloqueado & Estornado via MED",
        description: currentLang === 'en' ? "R$ 4,200.00 retained in checking account under Central Bank Resolution 147 directives." : "R$ 4.200,00 preservados em conta corrente sob diretrizes da Resolução BACEN 147.",
        status: "Safeguarded",
        details: "MED Claim #2026-ITAU-9914"
      };
      setActionItems(prev => [newAction, ...prev]);
    }
    else if (actionType === 'freeze_card') {
      setProfile(prev => ({
        ...prev,
        cards: prev.cards.map(c => c.id === targetId || targetId === 'card_01' ? { ...c, status: 'frozen' } : c)
      }));
      triggerNotification(tNotif.cardFrozenTitle, tNotif.cardFrozenSubtitle);
    }
    else if (actionType === 'unfreeze_card') {
      setProfile(prev => ({
        ...prev,
        cards: prev.cards.map(c => c.id === targetId || targetId === 'card_01' ? { ...c, status: 'active' } : c)
      }));
      triggerNotification(tNotif.cardUnfrozenTitle, tNotif.cardUnfrozenSubtitle);
    }
  };

  // Trigger Sub-Agent Manually
  const handleTriggerAgent = (agentId: string) => {
    setIsProcessingAgent(agentId);
    setTimeout(() => {
      setIsProcessingAgent(null);
      const agentObj = translations[currentLang].subagents.list.find(a => a.id === agentId);
      triggerNotification(
        translations[currentLang].notifications.agentTriggeredTitle,
        `${translations[currentLang].notifications.agentTriggeredSubtitle} ${agentObj?.name || agentId}`
      );

      const newLog: TelemetryLog = {
        id: "log_" + Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        agentId,
        agentName: agentObj?.name || agentId,
        action: "MANUAL_INVOCATION",
        status: "success",
        payload: agentObj?.defaultResult || { timestamp: Date.now(), status: "SUCCESS" }
      };
      setTelemetryLogs(prev => [newLog, ...prev]);
    }, 1100);
  };

  // Reset Demo to Baseline
  const handleResetDemo = () => {
    setProfile(DEFAULT_PROFILE);
    setIsCdbSweepScheduled(false);
    setIsTravelModeActive(false);
    setIsOpenFinanceRefiDone(false);
    setIsPixBlocked(false);
    setIsCallActive(false);
    setActionItems(translations[currentLang].actionPlan.initialItems);
    setTelemetryLogs([]);
    triggerNotification(
      translations[currentLang].notifications.demoResetTitle,
      translations[currentLang].notifications.demoResetSubtitle
    );
  };

  // Save Session
  const handleSaveSession = async () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      triggerNotification(
        translations[currentLang].notifications.sessionSavedTitle,
        translations[currentLang].notifications.sessionSavedSubtitle
      );
    }, 800);
  };

  return (
    <div
      className={`w-screen h-screen overflow-hidden flex flex-col font-sans antialiased transition-colors duration-200 ${
        theme === 'dark' ? 'bg-[#1C1C20] text-white' : 'bg-[#EAEBED] text-slate-900'
      }`}
    >
      
      {/* Top Header */}
      <CockpitHeader
        currentLang={currentLang}
        onToggleLang={handleToggleLang}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onReset={handleResetDemo}
        onSaveSession={handleSaveSession}
        isSaving={isSaving}
        activeScenario={activeScenario}
        onSelectScenario={handleSelectScenario}
      />

      {/* Main Dual-Column Cockpit Canvas */}
      <main className="flex-1 p-3 sm:p-5 md:p-6 overflow-hidden min-h-0">
        <div className="max-w-[1780px] h-full mx-auto grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch min-h-0">
          
          {/* Left Column: Smartphone Simulator with Direct In-Phone Voice Concierge */}
          <div className="md:col-span-4 lg:col-span-4 xl:col-span-3 flex justify-center items-center h-full min-h-0">
            <PhoneContainer
              profile={profile}
              notifications={notifications}
              currentLang={currentLang}
              theme={theme}
              activeScenario={activeScenario}
              isVoiceCallActive={isCallActive}
              onToggleVoiceCall={() => setIsCallActive(!isCallActive)}
              onActionClick={handleBankingAction}
              isTravelModeActive={isTravelModeActive}
              isCdbSweepScheduled={isCdbSweepScheduled}
              isOpenFinanceRefiDone={isOpenFinanceRefiDone}
              isPixBlocked={isPixBlocked}
            />
          </div>

          {/* Right Column: Multi-Agent Telemetry & Orchestrator Panel */}
          <div className="md:col-span-8 lg:col-span-8 xl:col-span-9 h-full min-h-0">
            <AgentOrchestratorPanel
              subAgents={subAgents}
              actionItems={actionItems}
              telemetryLogs={telemetryLogs}
              currentLang={currentLang}
              theme={theme}
              activeScenario={activeScenario}
              onTriggerAgent={handleTriggerAgent}
              isProcessingAgent={isProcessingAgent}
            />
          </div>

        </div>
      </main>

    </div>
  );
};

export default App;
