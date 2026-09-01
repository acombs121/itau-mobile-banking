import React, { useState, useEffect } from 'react';
import { RotateCcw } from 'lucide-react';
import { CockpitHeader } from './components/CockpitHeader';
import { PhoneContainer } from './components/PhoneContainer';
import { AgentOrchestratorPanel } from './components/AgentOrchestratorPanel';
import { BankingProfile } from './types/banking';
import { SubAgent, SecurityActionItem, TelemetryLog, ScenarioId } from './types/itau_concierge';
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

  // Active Scenario State: Default is 'cash_flow' (Act 1: Predictive Balance Alert & Cash Sweep)
  const [activeScenario, setActiveScenario] = useState<ScenarioId>('cash_flow');
  const [activeRunningAgentId, setActiveRunningAgentId] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(true);

  // Dynamic Sub-Agent Lifecycle States for 5 Specialized Agents
  const [agentStates, setAgentStates] = useState<Record<string, { status: 'idle' | 'running' | 'completed'; lastRun?: string; liveResult?: Record<string, any> }>>({
    account_info_agent: { status: 'idle' },
    cash_flow_forecast_agent: { status: 'idle' },
    travel_shield_agent: { status: 'idle' },
    card_benefits_agent: { status: 'idle' },
    open_finance_optimizer: { status: 'idle' }
  });

  const [profile, setProfile] = useState<BankingProfile>(DEFAULT_PROFILE);
  const subAgents: SubAgent[] = [];
  const [actionItems, setActionItems] = useState<SecurityActionItem[]>([]);
  const [telemetryLogs, setTelemetryLogs] = useState<TelemetryLog[]>([]);

  // Scenario Resolution Flags
  const [isCdbSweepScheduled, setIsCdbSweepScheduled] = useState(false);
  const [isTravelModeActive, setIsTravelModeActive] = useState(false);
  const [isCdiTransferDone, setIsCdiTransferDone] = useState(false);
  const [isOpenFinanceRefiDone, setIsOpenFinanceRefiDone] = useState(false);
  const [isPixBlocked, setIsPixBlocked] = useState(false);

  // In-Phone Live Voice & Dynamic Canvas State
  const [isCallActive, setIsCallActive] = useState(false);
  const [isProcessingAgent, setIsProcessingAgent] = useState<string | null>(null);
  const [activeDynamicCardId, setActiveDynamicCardId] = useState<string | null>('cash_flow_forecast_agent');
  const [isSaving, setIsSaving] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // When clicking on the Predictive Balance Alert from the Lock Screen
  const handlePredictiveAlertClick = () => {
    setIsLocked(false);
    setActiveScenario('cash_flow');
    setActiveRunningAgentId('cash_flow_forecast_agent');
    setActiveDynamicCardId('cash_flow_forecast_agent');
    setAgentStates(prev => ({
      ...prev,
      cash_flow_forecast_agent: {
        status: 'running',
        lastRun: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' BRT',
        liveResult: {
          account: "ITAU-7749-00912",
          alert: "PREDICTIVE_BALANCE_ALERT",
          scheduled_debits_next_thursday: 38000.00,
          projected_shortfall: 13050.00,
          source_asset: "CDB_DI_LIQUIDEZ_DIARIA",
          recommended_sweep_amount: 15000.00,
          status: "SWEEP_OFFER_ACTIVE"
        }
      }
    }));
    setIsCallActive(true);
  };

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

  // In-phone popups disabled by user preference
  const triggerNotification = (_title: string, _subtitle: string) => {
    // Popups suppressed
  };

  // User Spoken Query -> Log to Telemetry (UI screens are driven exclusively by the agent's tool calls)
  const handleUserQuery = (query: string) => {
    const newLog: TelemetryLog = {
      id: "log_" + Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      agentId: "itau_concierge",
      agentName: currentLang === 'en' ? "Itaú Concierge Voice" : "Concierge de Voz Itaú",
      action: "CARDHOLDER_INPUT",
      status: "info",
      payload: { query }
    };
    setTelemetryLogs(prev => [newLog, ...prev]);
  };

  // Turn Complete Handler - keeps last agent highlighted until next is activated
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
      // The last activated agent remains highlighted continuously
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

  // Central Action Handler driven by tool calls
  const handleBankingAction = (actionType: string, targetId?: string, customPayload?: Record<string, any>) => {
    const tNotif = translations[currentLang].notifications;
    const nowTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) + ' BRT';

    if (actionType === 'get_account_info' || actionType === 'view_statements' || actionType === 'view_limits') {
      setActiveRunningAgentId('account_info_agent');
      const qt = customPayload?.query_type || (customPayload as any)?.args?.query_type;
      let targetCardId = 'itau_balances';
      if (qt === 'checking' || qt === 'checking_account') {
        targetCardId = 'balance_checking';
      } else if (qt === 'cdb_investments' || qt === 'savings') {
        targetCardId = 'balance_cdb';
      } else if (qt === 'card_limits' || qt === 'card') {
        targetCardId = 'balance_card';
      } else if (qt === 'scheduled_debits') {
        targetCardId = 'scheduled_payments';
      } else {
        targetCardId = 'itau_balances';
      }
      setActiveDynamicCardId(targetCardId);
      setActiveScenario('account_info');
      
      const payloadData = customPayload || {
        account_id: "ITAU-7749-00912",
        customer: "Roberto Silva",
        checking_balance_brl: 48950.20,
        cdb_di_balance_brl: 85000.00,
        mastercard_black_available_limit_brl: 72569.50,
        scheduled_debits_next_thursday_brl: 38000.00,
        status: "SYNCHRONIZED"
      };

      setAgentStates(prev => ({
        ...prev,
        account_info_agent: {
          status: 'completed',
          lastRun: nowTime,
          liveResult: payloadData
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
        payload: payloadData
      };
      setTelemetryLogs(prev => [newLog, ...prev]);
    }
    else if (actionType === 'explain_predictive_alert' || actionType === 'view_cash_flow') {
      // Explain shortfall & cash flow WITHOUT scheduling the sweep yet
      setIsCdbSweepScheduled(false);
      setActiveRunningAgentId('cash_flow_forecast_agent');
      setActiveDynamicCardId('cash_flow_forecast_agent');
      setActiveScenario('cash_flow');
      
      const payloadData = customPayload || {
        account: "ITAU-7749-00912",
        alert: "PREDICTIVE_BALANCE_ALERT",
        scheduled_debits_next_thursday: 38000.00,
        projected_shortfall: 13050.00,
        source_asset: "CDB_DI_LIQUIDEZ_DIARIA",
        recommended_sweep_amount: 15000.00,
        status: "SWEEP_OFFER_AWAITING_CONFIRMATION"
      };

      setAgentStates(prev => ({
        ...prev,
        cash_flow_forecast_agent: {
          status: 'completed',
          lastRun: nowTime,
          liveResult: payloadData
        }
      }));

      const newLog: TelemetryLog = {
        id: "log_" + Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        agentId: "cash_flow_forecast_agent",
        agentName: "Cash Flow & Yield Forecasting Agent",
        action: "ANALYZE_PREDICTIVE_BALANCE_SHORTFALL",
        status: "info",
        payload: payloadData
      };
      setTelemetryLogs(prev => [newLog, ...prev]);
    }
    else if (actionType === 'sweep_cdb' || actionType === 'confirm_cdb_sweep') {
      // User confirmed! Schedule the automated sweep!
      setIsCdbSweepScheduled(true);
      setActiveRunningAgentId('cash_flow_forecast_agent');
      setActiveDynamicCardId('cash_flow_forecast_agent');
      setActiveScenario('cash_flow');
      
      const payloadData = customPayload || {
        target_date: "2026-08-25 06:00 BRT",
        sweep_amount_brl: 15000.00,
        source: "CDB_DI_LIQUIDEZ_DIARIA",
        estimated_overdraft_interest_saved_brl: 184.60,
        status: "SCHEDULED_AUTOMATED_SWEEP"
      };

      setAgentStates(prev => ({
        ...prev,
        cash_flow_forecast_agent: {
          status: 'completed',
          lastRun: nowTime,
          liveResult: payloadData
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
        payload: payloadData
      };
      setTelemetryLogs(prev => [newLog, ...prev]);
    }
    else if (actionType === 'activate_travel_mode') {
      setIsTravelModeActive(true);
      setActiveRunningAgentId('travel_shield_agent');
      setActiveDynamicCardId('travel_shield_agent');
      setActiveScenario('travel_shield');
      
      const payloadData = customPayload || {
        travel_notice: "ACTIVE",
        destinations: ["Portugal", "Spain"],
        dates: "20/08 - 05/09",
        network_authorizers: ["MASTERCARD_GLOBAL", "VISA_NET"],
        international_pos_limit_brl: 50000.00,
        fraud_suppression_airports_hotels: "ENABLED",
        status: "FRAUD_SHIELD_ACTIVE"
      };

      setAgentStates(prev => ({
        ...prev,
        travel_shield_agent: {
          status: 'completed',
          lastRun: nowTime,
          liveResult: payloadData
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
        payload: payloadData
      };
      setTelemetryLogs(prev => [newLog, ...prev]);
    }
    else if (actionType === 'get_card_benefits' || actionType === 'view_travel_insurance') {
      setActiveRunningAgentId('card_benefits_agent');
      setActiveDynamicCardId('card_benefits_agent');
      
      const payloadData = customPayload || {
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
      };

      setAgentStates(prev => ({
        ...prev,
        card_benefits_agent: {
          status: 'completed',
          lastRun: nowTime,
          liveResult: payloadData
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
        payload: payloadData
      };
      setTelemetryLogs(prev => [newLog, ...prev]);
    }
    else if (actionType === 'refinance_open_finance' || actionType === 'simulate_open_finance') {
      setIsOpenFinanceRefiDone(true);
      setActiveRunningAgentId('open_finance_optimizer');
      setActiveDynamicCardId('open_finance_optimizer');
      setActiveScenario('open_finance');
      
      const payloadData = customPayload || {
        external_balance_settled_brl: 18000.00,
        previous_rate: "11.2% a.m.",
        new_rate: "1.69% a.m.",
        total_interest_saved_brl: 14280.00,
        instrument_type: "CCB_DIGITAL_LEI_10931",
        status: "REFINANCE_PROPOSAL_DISPATCHED"
      };

      setAgentStates(prev => ({
        ...prev,
        open_finance_optimizer: {
          status: 'completed',
          lastRun: nowTime,
          liveResult: payloadData
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
        payload: payloadData
      };
      setTelemetryLogs(prev => [newLog, ...prev]);
    }
    else if (actionType === 'pull_open_finance') {
      setActiveRunningAgentId('open_finance_optimizer');
      setActiveDynamicCardId('open_finance_select');
      setActiveScenario('open_finance');
      
      const payloadData = customPayload || {
        consent_status: "ACTIVE",
        source: "BACEN_OPEN_FINANCE_FAPI",
        available_categories: ["cdi_balances", "debt_balances"],
        status: "CATEGORIES_SELECTION_ACTIVE"
      };

      setAgentStates(prev => ({
        ...prev,
        open_finance_optimizer: {
          status: 'completed',
          lastRun: nowTime,
          liveResult: payloadData
        }
      }));

      const newLog: TelemetryLog = {
        id: "log_" + Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        agentId: "open_finance_optimizer",
        agentName: "Open Finance & Rate Optimizer",
        action: "RETRIEVE_OPEN_FINANCE_CATEGORIES",
        status: "info",
        payload: payloadData
      };
      setTelemetryLogs(prev => [newLog, ...prev]);
    }
    else if (actionType === 'quote_open_finance_cdi') {
      setActiveRunningAgentId('open_finance_optimizer');
      setActiveDynamicCardId('open_finance_cdi');
      setActiveScenario('open_finance');
      
      const payloadData = customPayload || {
        external_liquid_assets: 330000.00,
        connected_institutions: ["BTG Pactual", "XP Investimentos"],
        competitor_cdi_yield: "85% do CDI",
        itau_cdb_di_yield: "100% do CDI (Liquidez Diária)",
        spread_advantage: "+15% do CDI",
        projected_annual_gain: 5940.00,
        status: "CDI_IMPROVEMENT_QUOTED"
      };

      setAgentStates(prev => ({
        ...prev,
        open_finance_optimizer: {
          status: 'completed',
          lastRun: nowTime,
          liveResult: payloadData
        }
      }));

      const newLog: TelemetryLog = {
        id: "log_" + Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        agentId: "open_finance_optimizer",
        agentName: "Open Finance & Rate Optimizer",
        action: "QUOTE_CDI_YIELD_ARBITRAGE",
        status: "info",
        payload: payloadData
      };
      setTelemetryLogs(prev => [newLog, ...prev]);
    }
    else if (actionType === 'confirm_cdi_transfer') {
      setIsCdiTransferDone(true);
      setActiveRunningAgentId('open_finance_optimizer');
      setActiveDynamicCardId('open_finance_transfer_confirmed');
      setActiveScenario('open_finance');
      
      // Update investment balance with transferred funds
      setProfile(prev => ({
        ...prev,
        investments_balance_brl: 415000.00
      }));

      const payloadData = customPayload || {
        amount_transferred_brl: 330000.00,
        source_institutions: ["BTG Pactual", "XP Investimentos"],
        destination_asset: "CDB_DI_LIQUIDEZ_DIARIA_100_CDI",
        additional_annual_yield_brl: 5940.00,
        new_consolidated_balance_brl: 463950.20,
        rail: "OPEN_FINANCE_CIP_STR",
        status: "TRANSFER_SETTLED_SUCCESS"
      };

      setAgentStates(prev => ({
        ...prev,
        open_finance_optimizer: {
          status: 'completed',
          lastRun: nowTime,
          liveResult: payloadData
        }
      }));

      triggerNotification(
        tNotif.cdiTransferTitle,
        tNotif.cdiTransferSubtitle
      );

      const newAction: SecurityActionItem = {
        id: "act_" + Date.now(),
        time: nowTime,
        type: "cdi_transfer",
        title: currentLang === 'en' ? "CDI Yield Transfer Confirmed — +R$ 5,940/yr" : "Transferência CDI Concluída — +R$ 5.940/ano",
        description: currentLang === 'en' ? "Transferred R$ 330,000.00 from BTG & XP to Itaú CDB DI (100% CDI). +15% CDI yield advantage secured with daily liquidity." : "Transferidos R$ 330.000,00 de BTG e XP para CDB DI Itaú (100% CDI). Ganho de +15% do CDI garantido com liquidez diária.",
        status: "Safeguarded",
        details: "CIP #2026-ITAU-TRF-9921 • 100% CDI Daily Yield"
      };
      setActionItems(prev => [newAction, ...prev]);

      const newLog: TelemetryLog = {
        id: "log_" + Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        agentId: "open_finance_optimizer",
        agentName: "Open Finance & Rate Optimizer",
        action: "EXECUTE_OPEN_FINANCE_CDI_TRANSFER",
        status: "success",
        payload: payloadData
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
    setIsCdiTransferDone(false);
    setIsOpenFinanceRefiDone(false);
    setIsPixBlocked(false);
    setIsCallActive(false);
    setIsLocked(true);
    setActiveScenario('cash_flow');
    setActiveRunningAgentId(null);
    setActiveDynamicCardId('cash_flow_forecast_agent');
    setAgentStates({
      account_info_agent: { status: 'idle' },
      cash_flow_forecast_agent: { status: 'idle' },
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
        onReset={() => setIsResetConfirmOpen(true)}
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
              currentLang={currentLang}
              theme={theme}
              activeScenario={activeScenario}
              isVoiceCallActive={isCallActive}
              onToggleVoiceCall={() => setIsCallActive(!isCallActive)}
              onActionClick={handleBankingAction}
              isTravelModeActive={isTravelModeActive}
              isCdbSweepScheduled={isCdbSweepScheduled}
              isCdiTransferDone={isCdiTransferDone}
              isOpenFinanceRefiDone={isOpenFinanceRefiDone}
              isPixBlocked={isPixBlocked}
              activeRunningAgentId={activeRunningAgentId}
              activeDynamicCardId={activeDynamicCardId}
              agentStates={agentStates}
              onUserQuery={handleUserQuery}
              onTurnComplete={handleTurnComplete}
              isLocked={isLocked}
              onUnlock={() => setIsLocked(false)}
              onLock={() => {
                setIsLocked(true);
                setIsCallActive(false);
              }}
              onPredictiveAlertClick={handlePredictiveAlertClick}
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

      {/* Destructive Action Confirmation Modal */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div
            className={`w-full max-w-md p-6 rounded-lg shadow-2xl border transition-colors ${
              theme === 'dark'
                ? 'bg-[#18181B] border-white/10 text-white'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-[6px] bg-brand-orange/15 flex items-center justify-center flex-shrink-0">
                <RotateCcw className="w-5 h-5 text-brand-orange" />
              </div>
              <h3 className="text-base sm:text-lg font-bold tracking-tight">
                {translations[currentLang].header.confirmResetTitle}
              </h3>
            </div>
            <p
              className={`text-xs sm:text-sm mb-6 leading-relaxed ${
                theme === 'dark' ? 'text-white/70' : 'text-slate-600'
              }`}
            >
              {translations[currentLang].header.confirmResetDescription}
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className={`px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-[4px] border transition-colors ${
                  theme === 'dark'
                    ? 'border-white/15 text-white/80 hover:bg-white/10'
                    : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {translations[currentLang].header.cancelAction}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsResetConfirmOpen(false);
                  handleResetDemo();
                }}
                className="px-4 py-1.5 text-xs sm:text-sm font-semibold rounded-[4px] bg-brand-orange text-white hover:bg-brand-orange/90 transition-colors shadow-sm"
              >
                {translations[currentLang].header.confirmResetAction}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default App;
