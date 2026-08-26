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
  cpf_masked: "•••.842.108-••",
  agency: "7749",
  account_number: "00912-8",
  checking_balance_brl: 48950.20,
  investments_balance_brl: 320450.00,
  credit_limit_total: 85000.00,
  credit_limit_used: 12430.50,
  pix_daily_limit: 50000.00,
  pix_night_limit: 5000.00,
  cards: [
    {
      id: "card_01",
      name: "Mastercard Black",
      last4: "8841",
      status: "active",
      virtual_card_active: true,
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

  // Active Scenario State: Default is 'cash_flow'
  const [activeScenario, setActiveScenario] = useState<ScenarioId>('cash_flow');
  const [activeRunningAgentId, setActiveRunningAgentId] = useState<string | null>(null);

  // Dynamic Sub-Agent Lifecycle States for 5 Specialized Agents
  const [agentStates, setAgentStates] = useState<Record<string, { status: 'idle' | 'running' | 'completed'; lastRun?: string; liveResult?: Record<string, any> }>>({
    account_info_agent: { status: 'idle' },
    cash_flow_forecast_agent: { status: 'completed', lastRun: '14:52:10 BRT' },
    travel_shield_agent: { status: 'idle' },
    card_benefits_agent: { status: 'idle' },
    open_finance_optimizer: { status: 'idle' }
  });

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

  // In-Phone Live Voice & Dynamic Canvas State
  const [isCallActive, setIsCallActive] = useState(false);
  const [isProcessingAgent, setIsProcessingAgent] = useState<string | null>(null);
  const [activeDynamicCardId, setActiveDynamicCardId] = useState<string | null>(null);
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

  // User Spoken Query / Intent Detection -> Query-Specific Dynamic Card & Sub-Agent Dispatch
  const handleUserQuery = (query: string) => {
    const q = query.toLowerCase();
    const nowTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' BRT';

    // 1. Benefits & Insurance Agent
    if (
      q.includes('benefit') || q.includes('benefício') || q.includes('lounge') || q.includes('sala vip') || 
      q.includes('insurance') || q.includes('seguro') || q.includes('coverage') || q.includes('cobertura') || 
      q.includes('schengen') || q.includes('baggage') || q.includes('bagagem') || q.includes('delay') || 
      q.includes('atraso') || q.includes('guarulhos') || q.includes('car rental') || q.includes('aluguel') ||
      ((q.includes('yes') || q.includes('sim') || q.includes('sure') || q.includes('please') || q.includes('quero') || q.includes('por favor') || q.includes('tell me') || q.includes('conte')) && 
       (activeRunningAgentId === 'travel_shield_agent' || activeScenario === 'travel_shield' || agentStates.travel_shield_agent?.status === 'completed'))
    ) {
      setActiveRunningAgentId('card_benefits_agent');
      setActiveDynamicCardId('card_benefits_agent');
      setAgentStates(prev => ({
        ...prev,
        card_benefits_agent: {
          status: 'running',
          lastRun: nowTime,
          liveResult: {
            card_tier: "Itaú Personnalité Mastercard Black",
            gru_vip_lounge_t3: "UNLIMITED_COMPLIMENTARY",
            international_loungekey_passes: "4 PASSES (LIS/MAD)",
            schengen_medical_insurance_eur: 30000.00,
            masterseguro_car_rental: "CDW/LDW INCLUDED",
            concierge_service_24h: "AVAILABLE",
            status: "ANALYZING_TRIP_BENEFITS"
          }
        }
      }));
    }
    // 2. Specific Checking Account Query
    else if (q.includes('checking') || q.includes('corrente') || (q.includes('conta') && !q.includes('cartão') && !q.includes('investimento') && !q.includes('cdb'))) {
      setActiveRunningAgentId('account_info_agent');
      setActiveDynamicCardId('balance_checking');
      setAgentStates(prev => ({
        ...prev,
        account_info_agent: {
          status: 'running',
          lastRun: nowTime,
          liveResult: {
            account_type: "CHECKING_ACCOUNT",
            checking_balance_brl: 48950.20,
            lis_limit_brl: 10000.00,
            scheduled_debits_next_thursday_brl: 38000.00,
            status: "QUERY_COMPLETE"
          }
        }
      }));
    }
    // 3. Specific Savings / CDB Investment Query
    else if (q.includes('saving') || q.includes('poupança') || q.includes('cdb') || q.includes('invest') || q.includes('aplicação')) {
      setActiveRunningAgentId('account_info_agent');
      setActiveDynamicCardId('balance_cdb');
      setAgentStates(prev => ({
        ...prev,
        account_info_agent: {
          status: 'running',
          lastRun: nowTime,
          liveResult: {
            investment_type: "CDB_DI_LIQUIDEZ_DIARIA",
            balance_brl: 85000.00,
            rate_percent_cdi: 100.0,
            liquidity: "IMMEDIATE_24_7",
            status: "QUERY_COMPLETE"
          }
        }
      }));
    }
    // 4. Specific Mastercard Black / Credit Card Query
    else if (q.includes('black') || q.includes('mastercard') || q.includes('credit card') || q.includes('cartão') || q.includes('fatura') || q.includes('limit') || q.includes('limite')) {
      setActiveRunningAgentId('account_info_agent');
      setActiveDynamicCardId('balance_card');
      setAgentStates(prev => ({
        ...prev,
        account_info_agent: {
          status: 'running',
          lastRun: nowTime,
          liveResult: {
            card_name: "Itaú Personnalité Mastercard Black",
            available_limit_brl: 72569.50,
            total_limit_brl: 85000.00,
            current_invoice_due_thu_brl: 34150.00,
            status: "QUERY_COMPLETE"
          }
        }
      }));
    }
    // 5. Specific Scheduled Payments / Debits / Bills Query
    else if (q.includes('schedule') || q.includes('agendad') || q.includes('payment') || q.includes('pagamento') || q.includes('bill') || q.includes('boleto') || q.includes('debit') || q.includes('débito') || q.includes('due') || q.includes('vencimento') || q.includes('next week') || q.includes('semana')) {
      setActiveRunningAgentId('account_info_agent');
      setActiveDynamicCardId('scheduled_payments');
      setAgentStates(prev => ({
        ...prev,
        account_info_agent: {
          status: 'running',
          lastRun: nowTime,
          liveResult: {
            account_id: "ITAU-7749-00912",
            scheduled_payments_total_brl: 38000.00,
            scheduled_date: "2026-08-25 (Thursday)",
            items: [
              { name: "Mastercard Black Invoice", amount_brl: 34150.00, method: "Auto-Debit" },
              { name: "Condomínio Edifício Jardins", amount_brl: 3850.00, method: "Scheduled Boleto" }
            ],
            checking_balance_brl: 48950.20,
            coverage: "100% COVERED",
            status: "QUERY_COMPLETE"
          }
        }
      }));
    }
    // 6. Generic Balance Query -> Show Clarification Prompt (Do not leak numbers prematurely!)
    else if (q.includes('balance') || q.includes('saldo') || q.includes('extrato') || q.includes('statement')) {
      setActiveRunningAgentId(null);
      setActiveDynamicCardId('balance_clarification');
    }
    // 6. Cash Flow & Yield Forecasting
    else if (q.includes('ticket') || q.includes('passagem') || q.includes('lisbon') || q.includes('lisboa') || q.includes('forecast') || q.includes('previsão') || q.includes('shortfall') || q.includes('sweep') || q.includes('resgate') || q.includes('yield') || q.includes('rendimento')) {
      setActiveRunningAgentId('cash_flow_forecast_agent');
      setActiveDynamicCardId('cash_flow_forecast_agent');
      setActiveScenario('cash_flow');
      setAgentStates(prev => ({
        ...prev,
        cash_flow_forecast_agent: {
          status: 'running',
          lastRun: nowTime,
          liveResult: {
            account: "ITAU-7749-00912",
            projected_shortfall: 13050.00,
            projected_date: "2026-08-25 (Thursday)",
            recommended_sweep_brl: 15000.00,
            source: "CDB_DI_LIQUIDEZ_DIARIA",
            status: "RUNNING_HYPOTHETICAL_SIMULATION"
          }
        }
      }));
    }
    // 7. Travel Notice & Fraud Defense
    else if (q.includes('travel') || q.includes('viagem') || q.includes('portugal') || q.includes('spain') || q.includes('espanha') || q.includes('madrid') || q.includes('trip') || q.includes('flight') || q.includes('abroad')) {
      setActiveRunningAgentId('travel_shield_agent');
      setActiveDynamicCardId('travel_shield_agent');
      setActiveScenario('travel_shield');
      setAgentStates(prev => ({
        ...prev,
        travel_shield_agent: {
          status: 'running',
          lastRun: nowTime,
          liveResult: {
            travel_notice: "REGISTERING",
            destinations: ["Portugal", "Spain"],
            network_authorizers: ["MASTERCARD_GLOBAL", "VISA_NET"],
            pos_limit_brl: 50000.00,
            fraud_suppression: "ENABLING",
            status: "ENGAGING_FRAUD_SHIELD"
          }
        }
      }));
    }
    // 8. Open Finance
    else if (q.includes('refinance') || q.includes('refinanciamento') || q.includes('open finance') || q.includes('debt') || q.includes('dívida') || q.includes('loan') || q.includes('empréstimo') || q.includes('ccb') || q.includes('rate') || q.includes('taxa')) {
      setActiveRunningAgentId('open_finance_optimizer');
      setActiveDynamicCardId('open_finance_optimizer');
      setActiveScenario('open_finance');
      setAgentStates(prev => ({
        ...prev,
        open_finance_optimizer: {
          status: 'running',
          lastRun: nowTime,
          liveResult: {
            external_bank: "BANCO_COMPETITOR_SA",
            external_rate_pm: 11.20,
            itau_rate_pm: 1.69,
            monthly_savings_brl: 680.40,
            total_savings_brl: 14280.00,
            status: "READY_FOR_ELECTRONIC_CCB"
          }
        }
      }));
    }
  };

  // Turn Complete Handler
  const handleTurnComplete = () => {
    if (activeRunningAgentId) {
      const finishedAgent = activeRunningAgentId;
      const nowTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' BRT';
      setAgentStates(prev => {
        const current = prev[finishedAgent];
        return {
          ...prev,
          [finishedAgent]: {
            ...current,
            status: 'completed',
            lastRun: nowTime
          }
        };
      });
      setTimeout(() => {
        setActiveRunningAgentId(null);
      }, 1800);
    }
  };

  // Scenario Switcher Handler
  const handleSelectScenario = (scenarioId: ScenarioId) => {
    setActiveScenario(scenarioId);
    const scenarioDef = translations[currentLang].scenarios.find(s => s.id === scenarioId);
    if (scenarioDef) {
      setActiveRunningAgentId(scenarioDef.agentId);
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

    if (actionType === 'get_account_info' || actionType === 'view_statements' || actionType === 'view_limits') {
      setActiveRunningAgentId('account_info_agent');
      setActiveDynamicCardId(prev => (prev?.startsWith('balance_') ? prev : 'account_info_agent'));
      setActiveScenario('account_info');
      setAgentStates(prev => ({
        ...prev,
        account_info_agent: {
          status: 'completed',
          lastRun: nowTime,
          liveResult: {
            account_id: "ITAU-7749-00912",
            customer: "Roberto Silva",
            checking_balance_brl: 48950.20,
            cdb_di_balance_brl: 85000.00,
            mastercard_black_available_limit_brl: 72569.50,
            scheduled_debits_next_thursday_brl: 38000.00,
            status: "SYNCHRONIZED"
          }
        }
      }));

      triggerNotification(
        currentLang === 'en' ? "Account Overview Retrieved" : "Posição Consolidada Obtida",
        currentLang === 'en' ? "Checking R$ 48,950.20 • CDB DI R$ 85,000.00 • Mastercard Black R$ 72.5k" : "Conta Corrente R$ 48.950,20 • CDB DI R$ 85.000,00 • Mastercard Black R$ 72,5k"
      );

      const newAction: SecurityActionItem = {
        id: "act_" + Date.now(),
        time: nowTime,
        type: "cdb_sweep",
        title: currentLang === 'en' ? "Account Information Synchronized" : "Informações de Conta Sincronizadas",
        description: currentLang === 'en' ? "Verified checking balance (R$ 48,950.20), CDB DI investments (R$ 85k), and D+4 scheduled debits." : "Validados saldos em conta corrente (R$ 48.950,20), CDB DI (R$ 85k) e débitos agendados D+4.",
        status: "Confirmed",
        details: "Unified Position • Ag. 7749 CC 00912-8"
      };
      setActionItems(prev => [newAction, ...prev]);

      const newLog: TelemetryLog = {
        id: "log_" + Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        agentId: "account_info_agent",
        agentName: "Account Information & Statements Agent",
        action: "FETCH_CONSOLIDATED_ACCOUNTS_AND_STATEMENTS",
        status: "success",
        payload: {
          account_id: "ITAU-7749-00912",
          customer: "Roberto Silva",
          checking_balance_brl: 48950.20,
          cdb_di_balance_brl: 85000.00,
          mastercard_black_available_limit_brl: 72569.50,
          scheduled_debits_next_thursday_brl: 38000.00,
          status: "SYNCHRONIZED"
        }
      };
      setTelemetryLogs(prev => [newLog, ...prev]);
    }
    else if (actionType === 'sweep_cdb' || actionType === 'view_cash_flow') {
      setIsCdbSweepScheduled(true);
      setActiveRunningAgentId('cash_flow_forecast_agent');
      setActiveDynamicCardId('cash_flow_forecast_agent');
      setActiveScenario('cash_flow');
      setAgentStates(prev => ({
        ...prev,
        cash_flow_forecast_agent: {
          status: 'completed',
          lastRun: nowTime,
          liveResult: {
            target_date: "2026-08-25 06:00 BRT",
            sweep_amount_brl: 15000.00,
            source: "CDB_DI_LIQUIDEZ_DIARIA",
            estimated_overdraft_interest_saved_brl: 184.60,
            status: "SCHEDULED_AUTOMATED_SWEEP"
          }
        }
      }));

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
        agentName: "Cash Flow & Yield Forecasting Agent",
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
    else if (actionType === 'activate_travel_mode') {
      setIsTravelModeActive(true);
      setActiveRunningAgentId('travel_shield_agent');
      setActiveDynamicCardId('travel_shield_agent');
      setActiveScenario('travel_shield');
      setAgentStates(prev => ({
        ...prev,
        travel_shield_agent: {
          status: 'completed',
          lastRun: nowTime,
          liveResult: {
            travel_notice: "ACTIVE",
            destinations: ["Portugal", "Spain"],
            dates: "20/08 - 05/09",
            network_authorizers: ["MASTERCARD_GLOBAL", "VISA_NET"],
            international_pos_limit_brl: 50000.00,
            fraud_suppression_airports_hotels: "ENABLED",
            status: "FRAUD_SHIELD_ACTIVE"
          }
        }
      }));

      triggerNotification(
        currentLang === 'en' ? "Travel Notice Registered" : "Aviso de Viagem Registrado",
        currentLang === 'en' ? "Portugal & Spain active across Mastercard networks. POS limit R$ 50,000." : "Portugal e Espanha ativos na rede Mastercard. Limite POS R$ 50.000."
      );

      const newAction: SecurityActionItem = {
        id: "act_" + Date.now(),
        time: nowTime,
        type: "travel_mode",
        title: currentLang === 'en' ? "Travel Notice: Portugal & Spain (Fraud Shield)" : "Aviso de Viagem: Portugal e Espanha (Escudo Antifraude)",
        description: currentLang === 'en' ? "Registered with Visa/Mastercard authorizers. Elevated POS limit to R$ 50,000 and pre-suppressed airport/hotel false declines." : "Registrado nas bandeiras. Limite POS elevado para R$ 50.000 e supressão de recusas em aeroportos/hotéis.",
        status: "Confirmed",
        details: "Network Rail: MASTERCARD_GLOBAL • Limits Elevated"
      };
      setActionItems(prev => [newAction, ...prev]);

      const newLog: TelemetryLog = {
        id: "log_" + Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        agentId: "travel_shield_agent",
        agentName: "Travel Notice & International Card Shield",
        action: "REGISTER_NETWORK_TRAVEL_NOTICE",
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
    else if (actionType === 'get_card_benefits' || actionType === 'view_travel_insurance') {
      setActiveRunningAgentId('card_benefits_agent');
      setActiveDynamicCardId('card_benefits_agent');
      setAgentStates(prev => ({
        ...prev,
        card_benefits_agent: {
          status: 'completed',
          lastRun: nowTime,
          liveResult: {
            card_tier: "Itaú Personnalité Mastercard Black",
            travel_medical_insurance: {
              schengen_compliant: true,
              max_coverage_usd: 150000.00,
              emergency_medical_coverage_eur: 30000.00
            },
            airport_lounge_access: {
              program: "Mastercard Airport Experiences (LoungeKey)",
              gru_vip_lounge: "UNLIMITED_COMPLIMENTARY",
              international_passes: "4 COMPLIMENTARY/YEAR"
            },
            trip_protection: {
              trip_cancellation_delay_usd: 3000.00,
              baggage_loss_delay_usd: 1500.00
            },
            car_rental_coverage: "Masterseguro de Automóveis (CDW/LDW Global)",
            concierge: "Mastercard Concierge 24/7",
            status: "BENEFITS_ACTIVE"
          }
        }
      }));

      triggerNotification(
        currentLang === 'en' ? "Mastercard Black Benefits Verified" : "Benefícios Mastercard Black Validados",
        currentLang === 'en' ? "Worldwide €30k Schengen Medical • LoungeKey VIP Lounges • Trip Protection" : "Seguro Médico Schengen €30k • Salas VIP LoungeKey • Proteção de Bagagem"
      );

      const newAction: SecurityActionItem = {
        id: "act_" + Date.now(),
        time: nowTime,
        type: "card_benefits",
        title: currentLang === 'en' ? "Mastercard Black Travel Protection & LoungeKey" : "Proteção Viagem Mastercard Black & LoungeKey",
        description: currentLang === 'en' ? "Schengen Medical Insurance (€30,000), LoungeKey VIP lounge access (GRU unlimited), and trip delay coverage confirmed." : "Seguro Viagem Schengen (€30.000), acesso a Salas VIP LoungeKey (GRU ilimitado) e cobertura de atraso confirmados.",
        status: "Confirmed",
        details: "Policy: MASTERCARD_BLACK_MED_GLOBAL • LoungeKey Active"
      };
      setActionItems(prev => [newAction, ...prev]);

      const newLog: TelemetryLog = {
        id: "log_" + Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        agentId: "card_benefits_agent",
        agentName: "Mastercard Black Benefits & Coverage Agent",
        action: "FETCH_MASTERCARD_BLACK_BENEFITS",
        status: "success",
        payload: {
          card_tier: "Itaú Personnalité Mastercard Black",
          schengen_medical_eur: 30000.00,
          loungekey_gru: "UNLIMITED",
          loungekey_int_passes: 4
        }
      };
      setTelemetryLogs(prev => [newLog, ...prev]);
    }
    else if (actionType === 'refinance_open_finance' || actionType === 'simulate_open_finance') {
      setIsOpenFinanceRefiDone(true);
      setActiveRunningAgentId('open_finance_optimizer');
      setActiveDynamicCardId('open_finance_optimizer');
      setActiveScenario('open_finance');
      setAgentStates(prev => ({
        ...prev,
        open_finance_optimizer: {
          status: 'completed',
          lastRun: nowTime,
          liveResult: {
            external_balance_settled_brl: 18000.00,
            previous_rate: "11.2% a.m.",
            new_rate: "1.69% a.m.",
            total_interest_saved_brl: 14280.00,
            instrument_type: "CCB_DIGITAL_LEI_10931",
            status: "REFINANCE_PROPOSAL_DISPATCHED"
          }
        }
      }));

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
        agentName: "Open Finance & Debt Refinancing Optimizer",
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
    setActiveRunningAgentId(agentId);
    const nowTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' BRT';
    
    setAgentStates(prev => ({
      ...prev,
      [agentId]: {
        status: 'running',
        lastRun: nowTime
      }
    }));

    setTimeout(() => {
      setIsProcessingAgent(null);
      const agentObj = translations[currentLang].subagents.list.find(a => a.id === agentId);
      
      setAgentStates(prev => ({
        ...prev,
        [agentId]: {
          status: 'completed',
          lastRun: nowTime,
          liveResult: agentObj?.defaultResult || { timestamp: Date.now(), status: "SUCCESS" }
        }
      }));

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
    setActiveRunningAgentId(null);
    setAgentStates({
      account_info_agent: { status: 'idle' },
      cash_flow_forecast_agent: { status: 'completed' },
      travel_shield_agent: { status: 'idle' },
      card_benefits_agent: { status: 'idle' },
      open_finance_optimizer: { status: 'idle' }
    });
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
      <main className="flex-1 p-3 sm:p-5 lg:p-6 overflow-hidden min-h-0 flex items-center justify-center">
        <div className="max-w-[1440px] w-full h-full mx-auto flex flex-col md:flex-row gap-6 lg:gap-10 xl:gap-14 items-center justify-center min-h-0">
          
          {/* Left Column: Smartphone Simulator with Direct In-Phone Voice Concierge */}
          <div className="w-full md:w-[385px] xl:w-[400px] flex-shrink-0 flex justify-center items-center h-full min-h-0">
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
              activeRunningAgentId={activeRunningAgentId}
              activeDynamicCardId={activeDynamicCardId}
              agentStates={agentStates}
              onUserQuery={handleUserQuery}
              onTurnComplete={handleTurnComplete}
            />
          </div>

          {/* Right Column: Multi-Agent Telemetry & Orchestrator Panel */}
          <div className="flex-1 w-full min-w-0 h-[730px] max-h-[86vh] flex items-center justify-center min-h-0">
            <AgentOrchestratorPanel
              subAgents={subAgents}
              actionItems={actionItems}
              telemetryLogs={telemetryLogs}
              currentLang={currentLang}
              theme={theme}
              activeScenario={activeScenario}
              onTriggerAgent={handleTriggerAgent}
              isProcessingAgent={isProcessingAgent}
              activeRunningAgentId={activeRunningAgentId}
              agentStates={agentStates}
            />
          </div>

        </div>
      </main>

    </div>
  );
};

export default App;
