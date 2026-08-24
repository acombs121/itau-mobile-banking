import { SecurityActionItem, ScenarioDefinition, ScenarioId } from '../types/itau_concierge';

export type Language = 'pt' | 'en';

export interface LocalizedSubAgentItem {
  id: string;
  name: string;
  type: 'fraud' | 'med' | 'cards' | 'limits' | 'geolocation' | 'cash_flow' | 'travel' | 'open_finance';
  description: string;
  capabilities: string[];
  defaultResult: Record<string, any>;
}

export const translations = {
  pt: {
    header: {
      brandTitle: "Banco Itaú",
      brandSub: "Painel de Orquestração & Itaú Concierge em Tempo Real",
      saveSession: "Salvar Sessão",
      resetSession: "Reiniciar Demonstração",
      callAi: "Chamar Itaú Concierge",
      hangUp: "Encerrar Chamada",
      customer: "Roberto Silva",
      account: "Ag. 7749 • CC 00912-8",
      scenarioSelectorTitle: "Cenário Ativo:",
    },
    tabs: {
      agents: "Sub-Agentes Ativos",
      actionPlan: "Plano de Salvaguarda",
      decisionGraph: "Grafo de Risco & Decisão",
      transcript: "Transcrição & Logs",
    },
    scenarios: [
      {
        id: 'cash_flow' as ScenarioId,
        title: "1. Previsão de Saldo & Resgate CDB",
        shortLabel: "1. Previsão Saldo",
        tag: "CASH_FLOW_FORECAST",
        agentId: "cash_flow_forecast_agent",
        alert: {
          badge: "Previsão de Saldo D+4",
          title: "Déficit Projetado: -R$ 13.050,00",
          description: "Débitos de condomínio e fatura na quinta-feira (25/08) excederão o saldo de conta corrente após compra de passagens aéreas.",
          primaryActionLabel: "Agendar Resgate CDB (R$ 15k)",
          primaryActionType: "sweep_cdb",
          secondaryActionLabel: "Ver Detalhes do Fluxo",
          secondaryActionType: "view_cash_flow"
        },
        telemetryPayload: {
          account: "ITAU-7749-00912",
          projected_date: "2026-08-25 (Quinta-Feira)",
          projected_shortfall: 13050.00,
          source_asset: "CDB_DI_LIQUIDEZ_DIARIA",
          asset_balance_brl: 85000.00,
          cdi_yield_rate: "100% CDI Diário",
          optimal_transfer_date: "2026-08-25 06:00 BRT",
          interest_avoided_est_brl: 184.60,
          status: "SCHEDULED_AUTOMATED_SWEEP"
        },
        graphNodes: [
          {
            id: "customer",
            name: "Roberto Silva (Personnalité)",
            group: "Perfil do Titular",
            layer: "Input",
            color: "#FF6423",
            details: "Saldo CC: R$ 48.950,20 • CDB DI: R$ 85.000,00 • Compra Passagens: R$ 24.000,00"
          },
          {
            id: "shortfall_event",
            name: "Débitos D+4: R$ 38.000,00",
            group: "Evento Futuro",
            layer: "Input",
            color: "#E11D48",
            details: "Condomínio Pix (R$ 3.850) + Fatura Mastercard Black (R$ 34.150) = Déficit -R$ 13.050"
          },
          {
            id: "cmn_policy",
            name: "Diretriz CMN 4.765 (Anti-LIS)",
            group: "Regulação BACEN",
            layer: "Policy",
            color: "#003399",
            details: "Prevenção proativa de juros de cheque especial (LIS) com consentimento explícito"
          },
          {
            id: "cash_agent",
            name: "Motor Cash Flow & Yield Concierge",
            group: "Processamento IA",
            layer: "Decision",
            color: "#070707",
            details: "Modela rentabilidade diária do CDB até 25/08 às 06:00 BRT e agenda resgate exato"
          },
          {
            id: "sweep_output",
            name: "Resgate R$ 15.000 Agendado (LIS Zero)",
            group: "Ação de Salvaguarda",
            layer: "Output",
            color: "#059669",
            details: "Rendimento preservado até o minuto da compensação • R$ 184,60 em juros economizados"
          }
        ]
      },
      {
        id: 'travel_shield' as ScenarioId,
        title: "2. Aviso Viagem & Mastercard Black",
        shortLabel: "2. Aviso Viagem",
        tag: "TRAVEL_SHIELDING",
        agentId: "travel_shield_agent",
        alert: {
          badge: "Viagem Internacional Detectada",
          title: "Aviso de Viagem: Lisboa & Madrid",
          description: "Passagens aéreas TAP Portugal identificadas. Ative a liberação internacional de compras e o seguro Mastercard Black.",
          primaryActionLabel: "Ativar Modo Viagem & Limite R$ 50k",
          primaryActionType: "activate_travel_mode",
          secondaryActionLabel: "Ver Apólice de Seguro",
          secondaryActionType: "view_travel_insurance"
        },
        telemetryPayload: {
          card_last4: "8841",
          destinations: ["Portugal (LIS)", "Espanha (MAD)"],
          travel_dates: "20/08 - 05/09",
          international_pos_limit_brl: 50000.00,
          flight_ticket: "TAP Air Portugal TP088",
          travel_insurance_policy: "MASTERCARD_BLACK_MED_GLOBAL_ACTIVE",
          false_positive_suppression: "ENABLED"
        },
        graphNodes: [
          {
            id: "customer",
            name: "Roberto Silva (Personnalité)",
            group: "Perfil do Titular",
            layer: "Input",
            color: "#FF6423",
            details: "Mastercard Black • Passagem TAP Portugal • Destino Lisboa & Madrid"
          },
          {
            id: "roaming_event",
            name: "Transações Internacionais Previstas",
            group: "Evento Viagem",
            layer: "Input",
            color: "#F59E0B",
            details: "Gastos previstos em Euros (EUR) • Risco de falso positivo em maquininhas no exterior"
          },
          {
            id: "card_policy",
            name: "Diretriz de Segurança de Bandeira",
            group: "Regulação Cartões",
            layer: "Policy",
            color: "#003399",
            details: "Habilitação geográfica de autorizadores POS/ATM sem exigência de formulário manual"
          },
          {
            id: "travel_agent",
            name: "Motor Travel Concierge",
            group: "Processamento IA",
            layer: "Decision",
            color: "#070707",
            details: "Eleva limite diário para R$ 50.000 e ativa seguro viagem saúde Mastercard Black"
          },
          {
            id: "travel_output",
            name: "Cartão Liberado & Seguro Ativo",
            group: "Ação de Salvaguarda",
            layer: "Output",
            color: "#059669",
            details: "Zero recusas no exterior • Apólice médica internacional emitida para o titular e cônjuge"
          }
        ]
      },
      {
        id: 'open_finance' as ScenarioId,
        title: "3. Refinanciamento Open Finance",
        shortLabel: "3. Open Finance",
        tag: "OPEN_FINANCE_REFI",
        agentId: "open_finance_optimizer",
        alert: {
          badge: "Oportunidade Open Finance",
          title: "Economia de R$ 14.280 em Dívida Externa",
          description: "Detectamos saldo devedor de R$ 18.000 no Banco Concorrente (11,2% a.m.). Refinancie pelo Itaú Sob Medida por 1,69% a.m.",
          primaryActionLabel: "Emitir CCB & Portar Dívida",
          primaryActionType: "refinance_open_finance",
          secondaryActionLabel: "Simular Parcelas (R$ 560/mês)",
          secondaryActionType: "simulate_open_finance"
        },
        telemetryPayload: {
          competitor_bank: "Banco Concorrente A",
          external_debt_balance_brl: 18000.00,
          competitor_rate_mo: 11.2,
          itau_sob_medida_rate_mo: 1.69,
          monthly_savings_brl: 680.40,
          total_interest_saved_brl: 14280.00,
          ccb_status: "CCB_EMITTED_LEI_10931",
          settlement_rail: "CIP_STR_INTERBANK_PAYOFF"
        },
        graphNodes: [
          {
            id: "customer",
            name: "Roberto Silva (Personnalité)",
            group: "Perfil do Titular",
            layer: "Input",
            color: "#FF6423",
            details: "Consentimento Open Finance FAPI • Score 980 • Margem de Crédito Aprovada"
          },
          {
            id: "open_finance_event",
            name: "Dívida Externa: R$ 18.000 (11,2% a.m.)",
            group: "Dívida Concorrente",
            layer: "Input",
            color: "#3B82F6",
            details: "Rotativo de cartão no Banco A • Custo anual CET > 240% • Parcela R$ 1.240/mês"
          },
          {
            id: "bacen_of_policy",
            name: "Resolução Conjunta nº 1 (Open Finance)",
            group: "Regulação BACEN",
            layer: "Policy",
            color: "#003399",
            details: "Portabilidade de crédito interbancária regulada com emissão de CCB eletrônica"
          },
          {
            id: "refi_agent",
            name: "Motor Underwriting & Portabilidade",
            group: "Processamento IA",
            layer: "Decision",
            color: "#070707",
            details: "Aplica taxa Personnalité 1,69% a.m., reduzindo parcela para R$ 560/mês e gerando CCB"
          },
          {
            id: "refi_output",
            name: "Dívida Paga via CIP & R$ 14.280 Salvos",
            group: "Ação de Salvaguarda",
            layer: "Output",
            color: "#059669",
            details: "Liquidação automática do concorrente • DTI do cliente reduzido de 42% para 26%"
          }
        ]
      },
      {
        id: 'pix_fraud' as ScenarioId,
        title: "4. Interceptação Pix & MED 147",
        shortLabel: "4. Pix Fraude (MED)",
        tag: "PIX_FRAUD_MED",
        agentId: "itau_med_dispute",
        alert: {
          badge: "Bloqueio Cautelar Pix",
          title: "Tentativa de Pix Suspeito Bloqueada (R$ 4.200)",
          description: "Transferência Pix de R$ 4.200,00 para 'Eletro Tech SP' retida preventivamente por anomalia de IP (proxy exterior) e chave nova.",
          primaryActionLabel: "Bloquear & Estornar via MED",
          primaryActionType: "block_pix",
          secondaryActionLabel: "Autorizar Transação",
          secondaryActionType: "approve_pix"
        },
        telemetryPayload: {
          action: "PRECAUTIONARY_HOLD_SPI",
          amount_brl: 4200.00,
          recipient: "Eletro Tech SP Ltda",
          origin_ip: "185.220.101.5 (VPN Node)",
          trusted_device: "iPhone 16 Pro (Match)",
          bacen_rule: "Resolucao 147 (MED)",
          reversal_time: "< 10 seconds"
        },
        graphNodes: [
          {
            id: "customer",
            name: "Roberto Silva (Personnalité)",
            group: "Perfil do Titular",
            layer: "Input",
            color: "#FF6423",
            details: "Score: 980 • Dispositivo Confiável: iPhone 16 Pro • Biometria Registrada"
          },
          {
            id: "anomaly_event",
            name: "Tentativa Pix R$ 4.200,00",
            group: "Evento Suspeito",
            layer: "Input",
            color: "#E11D48",
            details: "Destinatário 'Eletro Tech SP' sem histórico prévio • IP VPN internacional"
          },
          {
            id: "bacen_med_policy",
            name: "Regulação BACEN MED (Res. 147)",
            group: "Diretriz Regulatória",
            layer: "Policy",
            color: "#003399",
            details: "Mecanismo Especial de Devolução obrigatório para contenção cautelar imediata"
          },
          {
            id: "ai_guard_engine",
            name: "Motor de Decisão Itaú Concierge",
            group: "Processamento IA",
            layer: "Decision",
            color: "#070707",
            details: "Pontuação de Risco: 94/100 • Bloqueio Preventivo em 180ms"
          },
          {
            id: "action_output",
            name: "Ativos Retidos & Token Virtual Seguro",
            group: "Ação de Salvaguarda",
            layer: "Output",
            color: "#059669",
            details: "Saldo preservado na conta corrente • Notificação entregue no smartphone"
          }
        ]
      }
    ] as ScenarioDefinition[],
    subagents: {
      title: "Orquestração de Sub-Agentes Especializados",
      subtitle: "Agentes autônomos executando verificações determinísticas e aplicando regras BACEN",
      statusIdle: "Ocioso",
      statusProcessing: "Processando...",
      statusCompleted: "Concluído",
      triggerManual: "Disparar Agente",
      lastTelemetry: "Última Telemetria:",
      jsonLabel: "Telemetria JSON",
      selectPrompt: "Selecione um sub-agente para inspecionar a telemetria.",
      list: [
        {
          id: "cash_flow_forecast_agent",
          name: "Cash Flow & Overdraft Preemption Agent",
          type: "cash_flow",
          description: "Projeta déficits de liquidez D+30 e calcula momento ótimo de resgate de CDB DI para evitar juros LIS.",
          capabilities: ["Previsão Séries Temporais", "Resgate Automático CDB", "Zero Juros LIS"],
          defaultResult: {
            account: "ITAU-7749-00912",
            forecast_window: "D+30",
            projected_shortfall: 13050.00,
            recommended_sweep_source: "CDB_DI_LIQUIDEZ_DIARIA",
            status: "STANDBY_READY"
          }
        },
        {
          id: "travel_shield_agent",
          name: "Travel & International Concierge Guardian",
          type: "travel",
          description: "Habilita avisos de viagem inteligentes, eleva limites POS internacionais e valida seguro Mastercard Black.",
          capabilities: ["Aviso Viagem Automático", "Limite R$ 50k", "Supressão Recusas"],
          defaultResult: {
            travel_mode: "EUROPE_READY",
            destinations: ["Portugal", "Espanha"],
            international_pos_limit: 50000.00,
            insurance: "MASTERCARD_BLACK_MED_GLOBAL"
          }
        },
        {
          id: "open_finance_optimizer",
          name: "Open Finance & Debt Portability Optimizer",
          type: "open_finance",
          description: "Monitora dívidas caras em concorrentes, simula propostas Itaú Sob Medida e emite CCBs eletrônicas.",
          capabilities: ["Varredura Open Finance FAPI", "Emissão CCB Lei 10.931", "Liquidação CIP/STR"],
          defaultResult: {
            open_finance_consent: "ACTIVE",
            refi_opportunity_detected: true,
            monthly_savings: 680.40,
            interest_saved: 14280.00
          }
        },
        {
          id: "itau_fraud_monitor",
          name: "Itaú Concierge Fraud Monitor",
          type: "fraud",
          description: "Analisa telemetria de rede e geolocalização para contenção imediata de fraudes Pix.",
          capabilities: ["Detecção < 200ms", "Contenção Cautelar", "Validação IP"],
          defaultResult: {
            action: "PRECAUTIONARY_HOLD",
            amount_brl: 4200.00,
            recipient: "Eletro Tech SP Ltda",
            origin_ip: "185.220.101.5 (VPN Node)",
            trusted_device: "iPhone 16 Pro (Match)"
          }
        },
        {
          id: "itau_med_dispute",
          name: "BACEN MED & Reversal Desk",
          type: "med",
          description: "Coordena protocolos MED sob a Resolução 147 do Banco Central para devolução cautelar.",
          capabilities: ["Protocolo MED 147", "Bloqueio Pix", "Devolução 72h"],
          defaultResult: {
            service: "BACEN_MED_REVERSAL",
            status: "STANDBY",
            mandate: "BACEN Resolução 147"
          }
        },
        {
          id: "itau_card_token_servicing",
          name: "Card & Token Guardian",
          type: "cards",
          description: "Gerencia bloqueio instantâneo de cartões e rotação de tokens digitais Apple Pay e Google Pay.",
          capabilities: ["Congelamento Instantâneo", "Rotação CVV", "Bloqueio Recorrência"],
          defaultResult: {
            service: "TOKEN_VAULT_PROTECTION",
            virtual_cards_active: 1,
            physical_cards_active: 1
          }
        }
      ] as LocalizedSubAgentItem[]
    },
    actionPlan: {
      title: "Plano de Salvaguarda & Ações Confirmadas",
      subtitle: "Medidas protetivas e otimizações registradas na conta corrente e dispositivos do cliente",
      emptyState: "Nenhuma ação executada ainda. Interaja no app ou acione o Itaú Concierge.",
      statusConfirmed: "Confirmado",
      statusSafeguarded: "Protegido",
      statusPending: "Pendente",
      initialItems: [
        {
          id: "act_01",
          time: "14:52 BRT",
          type: "pix_hold",
          title: "Retenção Cautelar Pix — R$ 4.200,00",
          description: "Valor retido preventivamente sob diretrizes do Mecanismo Especial de Devolução (MED).",
          status: "Safeguarded",
          details: "Protocolo MED #2026-ITAU-9914"
        },
        {
          id: "act_02",
          time: "14:50 BRT",
          type: "geo_verify",
          title: "Dispositivo Confiável Autenticado",
          description: "iPhone 16 Pro validado com Face ID na agência digital de São Paulo.",
          status: "Confirmed",
          details: "Biometria 100% Compatível"
        }
      ] as SecurityActionItem[]
    },
    phone: {
      statusTime: "14:52",
      balanceTitle: "Saldo em conta corrente",
      investments: "Investimentos",
      allSafe: "Conta, cartões e pagamentos protegidos com Itaú Concierge.",
      quickPix: "Pix",
      quickPay: "Pagar",
      quickReceive: "Receber",
      quickCards: "Cartões",
      cardLimit: "Limite disponível: R$ 72.569,50",
      freeze: "Congelar Cartão",
      unfreeze: "Descongelar",
      frozenBadge: "CONGELADO",
      activeBadge: "ATIVO",
      travelBadge: "MODO VIAGEM ATIVO: LISBOA & MADRID",
      recentStatements: "Extrato Recente",
      navHome: "Início",
      navStatements: "Extrato",
      navPix: "Pix",
      navCards: "Cartões",
      transactions: [
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
    },
    notifications: {
      pixBlockedTitle: "Pix Bloqueado & Estornado",
      pixBlockedSubtitle: "R$ 4.200,00 preservados em conta corrente via MED.",
      cardFrozenTitle: "Cartão Congelado",
      cardFrozenSubtitle: "Tokens digitais de pagamento foram temporariamente suspensos.",
      cardUnfrozenTitle: "Cartão Desbloqueado",
      cardUnfrozenSubtitle: "Cartão liberado para uso seguro.",
      cdbSweepTitle: "Resgate CDB Agendado",
      cdbSweepSubtitle: "R$ 15.000 agendados para quinta-feira 06:00 BRT (Zero Juros LIS).",
      travelModeTitle: "Modo Viagem Ativado",
      travelModeSubtitle: "Mastercard Black liberado para Portugal e Espanha. Limite R$ 50.000.",
      openFinanceTitle: "Portabilidade CCB Executada",
      openFinanceSubtitle: "R$ 18.000 liquidados no concorrente. Economia de R$ 14.280 confirmada.",
      agentTriggeredTitle: "Sub-Agente Executado",
      agentTriggeredSubtitle: "Telemetria atualizada para ",
      demoResetTitle: "Demonstração Reiniciada",
      demoResetSubtitle: "Todos os estados voltaram ao padrão.",
      sessionSavedTitle: "Sessão Salva",
      sessionSavedSubtitle: "Itinerário salvo no backend.",
    },
    transcript: {
      title: "Registro de Transcrição & Execução de Ferramentas",
      subtitle: "Fluxo em tempo real de chamadas de ferramentas (Tool Calls) e áudio bidirecional",
      empty: "Inicie uma conversa por voz ou execute ações no app para gerar logs de telemetria.",
    },
    modal: {
      title: "Itaú Concierge",
      subtitle: "Atendimento por Voz & Concierge Financeiro",
      incidentContext: "Contexto Ativo:",
      initialGreeting: "Olá Roberto. Sou o Itaú Concierge. Como posso ajudar com seus pagamentos, saldo projetado ou planejamento de viagem hoje?",
      analyzing: "Itaú Concierge está analisando as informações...",
      quickPrompt1: "Verifique meu saldo e pagamentos previstos para a viagem.",
      quickPrompt2: "Ative o aviso de viagem para Europa no meu Mastercard Black.",
      placeholder: "Digite ou fale com o Itaú Concierge...",
      send: "Enviar",
    },
    footer: {
      brand: "Banco Itaú Unibanco S.A.",
      tagline: "Protegido por Itaú Concierge & Gemini Enterprise Agent Platform",
    }
  },
  en: {
    header: {
      brandTitle: "Banco Itaú",
      brandSub: "Real-Time Sub-Agent Orchestration & Itaú Concierge Cockpit",
      saveSession: "Save Session",
      resetSession: "Reset Demo",
      callAi: "Call Itaú Concierge",
      hangUp: "End Call",
      customer: "Roberto Silva",
      account: "Branch 7749 • Acct 00912-8",
      scenarioSelectorTitle: "Active Scenario:",
    },
    tabs: {
      agents: "Active Sub-Agents",
      actionPlan: "Safeguard Action Plan",
      decisionGraph: "Risk & Decision Graph",
      transcript: "Transcript & Logs",
    },
    scenarios: [
      {
        id: 'cash_flow' as ScenarioId,
        title: "1. Cash Flow Forecast & CDB Sweep",
        shortLabel: "1. Cash Flow",
        tag: "CASH_FLOW_FORECAST",
        agentId: "cash_flow_forecast_agent",
        alert: {
          badge: "Cash Flow Forecast D+4",
          title: "Projected Shortfall: -R$ 13,050.00",
          description: "Scheduled credit card bill & condo Pix next Thursday (Aug 25) will exceed checking balance after purchasing flight tickets.",
          primaryActionLabel: "Schedule CDB Sweep (R$ 15k)",
          primaryActionType: "sweep_cdb",
          secondaryActionLabel: "View Cash Breakdown",
          secondaryActionType: "view_cash_flow"
        },
        telemetryPayload: {
          account: "ITAU-7749-00912",
          projected_date: "2026-08-25 (Thursday)",
          projected_shortfall: 13050.00,
          source_asset: "CDB_DI_LIQUIDEZ_DIARIA",
          asset_balance_brl: 85000.00,
          cdi_yield_rate: "100% Daily CDI",
          optimal_transfer_date: "2026-08-25 06:00 BRT",
          interest_avoided_est_brl: 184.60,
          status: "SCHEDULED_AUTOMATED_SWEEP"
        },
        graphNodes: [
          {
            id: "customer",
            name: "Roberto Silva (Personnalité)",
            group: "Cardholder Profile",
            layer: "Input",
            color: "#FF6423",
            details: "Checking: R$ 48,950.20 • CDB DI: R$ 85,000.00 • Ticket Purchase: R$ 24,000.00"
          },
          {
            id: "shortfall_event",
            name: "Upcoming Debits: R$ 38,000.00",
            group: "Scheduled Event",
            layer: "Input",
            color: "#E11D48",
            details: "Condo Pix (R$ 3,850) + Mastercard Black Bill (R$ 34,150) = Shortfall -R$ 13,050"
          },
          {
            id: "cmn_policy",
            name: "CMN 4.765 Directives (Anti-Overdraft)",
            group: "Regulatory Policy",
            layer: "Policy",
            color: "#003399",
            details: "Preemptive overdraft interest prevention with explicit cardholder opt-in"
          },
          {
            id: "cash_agent",
            name: "Cash Flow & Yield Concierge",
            group: "AI Decision",
            layer: "Decision",
            color: "#070707",
            details: "Maintains CDB daily compounding until Aug 25 06:00 BRT, scheduling sweep"
          },
          {
            id: "sweep_output",
            name: "R$ 15,000 Sweep Scheduled (Zero Overdraft)",
            group: "Safeguard Action",
            layer: "Output",
            color: "#059669",
            details: "Yield maximized to settlement hour • R$ 184.60 saved in overdraft fees"
          }
        ]
      },
      {
        id: 'travel_shield' as ScenarioId,
        title: "2. Travel Notice & Mastercard Black",
        shortLabel: "2. Travel Notice",
        tag: "TRAVEL_SHIELDING",
        agentId: "travel_shield_agent",
        alert: {
          badge: "International Travel Detected",
          title: "Travel Notice: Lisbon & Madrid",
          description: "TAP Air Portugal tickets identified. Activate international POS clearance & complimentary Mastercard Black travel medical insurance.",
          primaryActionLabel: "Activate Travel Mode & R$ 50k Limit",
          primaryActionType: "activate_travel_mode",
          secondaryActionLabel: "View Insurance Policy",
          secondaryActionType: "view_travel_insurance"
        },
        telemetryPayload: {
          card_last4: "8841",
          destinations: ["Portugal (LIS)", "Spain (MAD)"],
          travel_dates: "Aug 20 - Sep 05",
          international_pos_limit_brl: 50000.00,
          flight_ticket: "TAP Air Portugal TP088",
          travel_insurance_policy: "MASTERCARD_BLACK_MED_GLOBAL_ACTIVE",
          false_positive_suppression: "ENABLED"
        },
        graphNodes: [
          {
            id: "customer",
            name: "Roberto Silva (Personnalité)",
            group: "Cardholder Profile",
            layer: "Input",
            color: "#FF6423",
            details: "Mastercard Black • TAP Portugal Flight • Lisbon & Madrid Destination"
          },
          {
            id: "roaming_event",
            name: "Upcoming Overseas POS Charges",
            group: "Travel Event",
            layer: "Input",
            color: "#F59E0B",
            details: "Predicted EUR charges • Risk of false-positive foreign terminal declines"
          },
          {
            id: "card_policy",
            name: "Payment Network Security Rules",
            group: "Card Network Policy",
            layer: "Policy",
            color: "#003399",
            details: "Automated geofencing & international POS authorization without manual forms"
          },
          {
            id: "travel_agent",
            name: "Travel Concierge Engine",
            group: "AI Decision",
            layer: "Decision",
            color: "#070707",
            details: "Raises daily spend limit to R$ 50,000 and registers active travel health policy"
          },
          {
            id: "travel_output",
            name: "Cards Cleared & Insurance Active",
            group: "Safeguard Action",
            layer: "Output",
            color: "#059669",
            details: "Zero foreign merchant declines • Comprehensive international health coverage"
          }
        ]
      },
      {
        id: 'open_finance' as ScenarioId,
        title: "3. Open Finance Debt Refinance",
        shortLabel: "3. Open Finance",
        tag: "OPEN_FINANCE_REFI",
        agentId: "open_finance_optimizer",
        alert: {
          badge: "Open Finance Opportunity",
          title: "R$ 14,280 Savings on External Debt",
          description: "Detected R$ 18,000 revolving balance at competitor bank (11.2%/mo). Refinance via Itaú Sob Medida at 1.69%/mo.",
          primaryActionLabel: "Issue CCB & Refinance Debt",
          primaryActionType: "refinance_open_finance",
          secondaryActionLabel: "Simulate Installments (R$ 560/mo)",
          secondaryActionType: "simulate_open_finance"
        },
        telemetryPayload: {
          competitor_bank: "Competitor Bank A",
          external_debt_balance_brl: 18000.00,
          competitor_rate_mo: 11.2,
          itau_sob_medida_rate_mo: 1.69,
          monthly_savings_brl: 680.40,
          total_interest_saved_brl: 14280.00,
          ccb_status: "CCB_EMITTED_LEI_10931",
          settlement_rail: "CIP_STR_INTERBANK_PAYOFF"
        },
        graphNodes: [
          {
            id: "customer",
            name: "Roberto Silva (Personnalité)",
            group: "Cardholder Profile",
            layer: "Input",
            color: "#FF6423",
            details: "Open Finance FAPI Consent • Score 980 • Pre-Approved Relationship Line"
          },
          {
            id: "open_finance_event",
            name: "External Debt: R$ 18,000 (11.2%/mo)",
            group: "Competitor Debt",
            layer: "Input",
            color: "#3B82F6",
            details: "Revolving card at Bank A • APR > 240% • Monthly payment R$ 1,240/mo"
          },
          {
            id: "bacen_of_policy",
            name: "Joint Resolution No. 1 (Open Finance)",
            group: "BACEN Regulation",
            layer: "Policy",
            color: "#003399",
            details: "Standardized interbank debt portability with electronic CCB issuance"
          },
          {
            id: "refi_agent",
            name: "Underwriting & Portability Concierge",
            group: "AI Decision",
            layer: "Decision",
            color: "#070707",
            details: "Applies Personnalité 1.69%/mo rate, lowering payment to R$ 560/mo and generating CCB"
          },
          {
            id: "refi_output",
            name: "Debt Paid via CIP & R$ 14,280 Saved",
            group: "Safeguard Action",
            layer: "Output",
            color: "#059669",
            details: "Competitor loan settled in full • Cardholder DTI reduced from 42% to 26%"
          }
        ]
      },
      {
        id: 'pix_fraud' as ScenarioId,
        title: "4. Pix Interception & MED 147",
        shortLabel: "4. Pix Fraud (MED)",
        tag: "PIX_FRAUD_MED",
        agentId: "itau_med_dispute",
        alert: {
          badge: "Precautionary Pix Hold",
          title: "Suspected Pix Transfer Blocked (R$ 4,200)",
          description: "Pix transfer of R$ 4,200.00 to 'Eletro Tech SP' held due to foreign proxy IP and unverified recipient key.",
          primaryActionLabel: "Block & Refund via MED",
          primaryActionType: "block_pix",
          secondaryActionLabel: "Authorize Transfer",
          secondaryActionType: "approve_pix"
        },
        telemetryPayload: {
          action: "PRECAUTIONARY_HOLD_SPI",
          amount_brl: 4200.00,
          recipient: "Eletro Tech SP Ltda",
          origin_ip: "185.220.101.5 (VPN Node)",
          trusted_device: "iPhone 16 Pro (Match)",
          bacen_rule: "Resolution 147 (MED)",
          reversal_time: "< 10 seconds"
        },
        graphNodes: [
          {
            id: "customer",
            name: "Roberto Silva (Personnalité)",
            group: "Cardholder Profile",
            layer: "Input",
            color: "#FF6423",
            details: "Score: 980 • Trusted Device: iPhone 16 Pro • Enrolled Biometrics"
          },
          {
            id: "anomaly_event",
            name: "Pix Attempt R$ 4,200.00",
            group: "Suspicious Event",
            layer: "Input",
            color: "#E11D48",
            details: "Recipient 'Eletro Tech SP' has zero history • Overseas VPN trace"
          },
          {
            id: "bacen_med_policy",
            name: "BACEN MED Rule (Res. 147)",
            group: "Regulatory Policy",
            layer: "Policy",
            color: "#003399",
            details: "Special Return Mechanism (MED) mandated for immediate precautionary retention"
          },
          {
            id: "ai_guard_engine",
            name: "Itaú Concierge Decision Engine",
            group: "AI Decision",
            layer: "Decision",
            color: "#070707",
            details: "Risk Score: 94/100 • Precautionary block in 180ms"
          },
          {
            id: "action_output",
            name: "Funds Safeguarded & Token Frozen",
            group: "Safeguard Action",
            layer: "Output",
            color: "#059669",
            details: "Capital preserved in checking account • Notification delivered to smartphone"
          }
        ]
      }
    ] as ScenarioDefinition[],
    subagents: {
      title: "Specialized Sub-Agent Orchestration",
      subtitle: "Autonomous agents executing deterministic validations and Central Bank policies",
      statusIdle: "Idle",
      statusProcessing: "Processing...",
      statusCompleted: "Completed",
      triggerManual: "Trigger Agent",
      lastTelemetry: "Last Telemetry:",
      jsonLabel: "JSON Telemetry",
      selectPrompt: "Select a sub-agent to inspect telemetry.",
      list: [
        {
          id: "cash_flow_forecast_agent",
          name: "Cash Flow & Overdraft Preemption Agent",
          type: "cash_flow",
          description: "Forecasts D+30 liquidity shortfalls and schedules optimal CDB DI sweeps to avoid overdraft interest.",
          capabilities: ["Time-Series Forecasting", "Automated CDB Sweep", "Zero Overdraft Interest"],
          defaultResult: {
            account: "ITAU-7749-00912",
            forecast_window: "D+30",
            projected_shortfall: 13050.00,
            recommended_sweep_source: "CDB_DI_LIQUIDEZ_DIARIA",
            status: "STANDBY_READY"
          }
        },
        {
          id: "travel_shield_agent",
          name: "Travel & International Concierge Guardian",
          type: "travel",
          description: "Enables smart travel notices, elevates international POS limits, and validates Mastercard Black travel insurance.",
          capabilities: ["Automated Travel Notice", "R$ 50k Limit Elevation", "Zero Foreign Declines"],
          defaultResult: {
            travel_mode: "EUROPE_READY",
            destinations: ["Portugal", "Spain"],
            international_pos_limit: 50000.00,
            insurance: "MASTERCARD_BLACK_MED_GLOBAL"
          }
        },
        {
          id: "open_finance_optimizer",
          name: "Open Finance & Debt Portability Optimizer",
          type: "open_finance",
          description: "Monitors high-interest competitor debt, constructs Itaú Sob Medida refinance offers, and issues electronic CCBs.",
          capabilities: ["Open Finance FAPI Scan", "Electronic CCB Issuance", "CIP/STR Payoff"],
          defaultResult: {
            open_finance_consent: "ACTIVE",
            refi_opportunity_detected: true,
            monthly_savings: 680.40,
            interest_saved: 14280.00
          }
        },
        {
          id: "itau_fraud_monitor",
          name: "Itaú Concierge Fraud Monitor",
          type: "fraud",
          description: "Analyzes network telemetry, geolocations, and payments for instant Pix fraud mitigation.",
          capabilities: ["Detection < 200ms", "Precautionary Hold", "IP Validation"],
          defaultResult: {
            action: "PRECAUTIONARY_HOLD",
            amount_brl: 4200.00,
            recipient: "Eletro Tech SP Ltda",
            origin_ip: "185.220.101.5 (VPN Node)",
            trusted_device: "iPhone 16 Pro (Match)"
          }
        },
        {
          id: "itau_med_dispute",
          name: "BACEN MED & Reversal Desk",
          type: "med",
          description: "Coordinates MED dispute claims under Central Bank Resolution 147 for asset recovery.",
          capabilities: ["MED Protocol 147", "Pix Key Block", "72h Refund Window"],
          defaultResult: {
            service: "BACEN_MED_REVERSAL",
            status: "STANDBY",
            mandate: "BACEN Resolution 147"
          }
        },
        {
          id: "itau_card_token_servicing",
          name: "Card & Token Guardian",
          type: "cards",
          description: "Manages instant card freezes and rotates Apple Pay and Google Pay digital tokens.",
          capabilities: ["Instant Card Freeze", "CVV Rotation", "Recurring Charge Block"],
          defaultResult: {
            service: "TOKEN_VAULT_PROTECTION",
            virtual_cards_active: 1,
            physical_cards_active: 1
          }
        }
      ] as LocalizedSubAgentItem[]
    },
    actionPlan: {
      title: "Safeguard Action Plan",
      subtitle: "Active protective measures and optimizations logged across checking account and cards",
      emptyState: "No actions executed yet. Interact with the mobile app or voice assistant.",
      statusConfirmed: "Confirmed",
      statusSafeguarded: "Safeguarded",
      statusPending: "Pending",
      initialItems: [
        {
          id: "act_01",
          time: "14:52 BRT",
          type: "pix_hold",
          title: "Precautionary Pix Hold — R$ 4,200.00",
          description: "Funds held under Central Bank Special Return Mechanism (MED) directives.",
          status: "Safeguarded",
          details: "MED Protocol #2026-ITAU-9914"
        },
        {
          id: "act_02",
          time: "14:50 BRT",
          type: "geo_verify",
          title: "Trusted Device Authenticated",
          description: "iPhone 16 Pro validated via Face ID at digital banking session.",
          status: "Confirmed",
          details: "100% Biometric Match"
        }
      ] as SecurityActionItem[]
    },
    phone: {
      statusTime: "14:52",
      balanceTitle: "Checking Account Balance",
      investments: "Investments",
      allSafe: "Account, cards, and payments protected with Itaú Concierge.",
      quickPix: "Pix",
      quickPay: "Pay",
      quickReceive: "Receive",
      quickCards: "Cards",
      cardLimit: "Available credit limit: R$ 72,569.50",
      freeze: "Freeze Card",
      unfreeze: "Unfreeze",
      frozenBadge: "FROZEN",
      activeBadge: "ACTIVE",
      travelBadge: "TRAVEL MODE ACTIVE: LISBON & MADRID",
      recentStatements: "Recent Statements",
      navHome: "Home",
      navStatements: "Activity",
      navPix: "Pix",
      navCards: "Cards",
      transactions: [
        {
          id: "tx_01",
          date: "Today, 14:32",
          description: "Pix Sent — Marina Camargo",
          category: "pix_out",
          amount_brl: -150.00,
          status: "completed"
        },
        {
          id: "tx_02",
          date: "Today, 11:15",
          description: "Fasano Jardins Restaurant",
          category: "dining",
          amount_brl: -640.00,
          status: "completed"
        },
        {
          id: "tx_03",
          date: "Yesterday",
          description: "Pix Received — REIT Dividend HGLG11",
          category: "investment",
          amount_brl: 1820.00,
          status: "completed"
        }
      ]
    },
    notifications: {
      pixBlockedTitle: "Pix Blocked & Refunded",
      pixBlockedSubtitle: "R$ 4,200.00 preserved in checking account via MED.",
      cardFrozenTitle: "Card Frozen",
      cardFrozenSubtitle: "Digital payment tokens temporarily suspended.",
      cardUnfrozenTitle: "Card Unfrozen",
      cardUnfrozenSubtitle: "Card reactivated for secure usage.",
      cdbSweepTitle: "CDB Sweep Scheduled",
      cdbSweepSubtitle: "R$ 15,000 scheduled for Thursday 06:00 BRT (Zero Overdraft Interest).",
      travelModeTitle: "Travel Mode Activated",
      travelModeSubtitle: "Mastercard Black cleared for Portugal & Spain. Limit raised to R$ 50,000.",
      openFinanceTitle: "CCB Portability Executed",
      openFinanceSubtitle: "R$ 18,000 settled at competitor. R$ 14,280 total savings confirmed.",
      agentTriggeredTitle: "Sub-Agent Executed",
      agentTriggeredSubtitle: "Telemetry updated for ",
      demoResetTitle: "Demo Reset",
      demoResetSubtitle: "All states restored to default.",
      sessionSavedTitle: "Session Saved",
      sessionSavedSubtitle: "Itinerary saved to backend.",
    },
    transcript: {
      title: "Transcript & Tool Execution Telemetry",
      subtitle: "Real-time stream of Gemini Live tool calls, sub-agent telemetry, and voice events",
      empty: "Start a voice conversation or perform actions in the mobile app to stream telemetry.",
    },
    modal: {
      title: "Itaú Concierge",
      subtitle: "Voice & Wealth Advisory Assistant",
      incidentContext: "Active Context:",
      initialGreeting: "Hello Roberto. I am Itaú Concierge. How can I assist with your payments, cash flow forecast, or travel plans today?",
      analyzing: "Itaú Concierge is analyzing financial data...",
      quickPrompt1: "Check my balance and projected payments for my upcoming trip.",
      quickPrompt2: "Activate international travel mode for Europe on my Mastercard Black.",
      placeholder: "Type or speak to Itaú Concierge...",
      send: "Send",
    },
    footer: {
      brand: "Banco Itaú Unibanco S.A.",
      tagline: "Protected by Itaú Concierge & Gemini Enterprise Agent Platform",
    }
  }
};
