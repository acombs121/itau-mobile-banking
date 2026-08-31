import { SecurityActionItem, ScenarioDefinition, ScenarioId } from '../types/itau_concierge';

export type Language = 'pt' | 'en';

export interface LocalizedSubAgentItem {
  id: string;
  name: string;
  type: 'account_info' | 'cash_flow' | 'travel' | 'open_finance';
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
      confirmResetTitle: "Reiniciar Demonstração?",
      confirmResetDescription: "Todas as mitigações ativas, execuções de sub-agentes e registros de telemetria retornarão ao estado inicial.",
      confirmResetAction: "Reiniciar Agora",
      cancelAction: "Cancelar",
      callAi: "Chamar Itaú Concierge",
      hangUp: "Encerrar Chamada",
      customer: "Roberto Silva",
      account: "Ag. 7749 • CC 00912-8",
      scenarioSelectorTitle: "Cenário Ativo:",
      adminPanelTitle: "Painel do Administrador",
      adminPanelSubtitle: "Recursos de Apresentação e Governança",
      brandKitButton: "Brand Kit & Tipografia Itaú",
      brandKitDesc: "Tipografia oficial Itaú Display & Itaú Text, paleta e diretrizes",
      demoScriptButton: "Roteiro da Demonstração (Demo Script)",
      demoScriptDesc: "Roteiro executivo completo em 5 atos para apresentações C-Level",
      scenariosMatrixButton: "Catálogo de Cenários (BACEN / MED)",
      scenariosMatrixDesc: "Matriz de governança, resolução 147 e telemetria de sub-agentes",
      openInNewTab: "Abre em nova aba",
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
        title: "1. Alerta Preventivo de Saldo & Resgate CDB",
        shortLabel: "1. Alerta & Fluxo",
        tag: "CASH_FLOW_FORECAST",
        agentId: "cash_flow_forecast_agent",
        alert: {
          badge: "Alerta Preventivo de Saldo",
          title: "Déficit Projetado D+4: -R$ 13.050,00",
          description: "Débitos agendados de R$ 38.000,00 na quinta-feira excederão o saldo de conta corrente. O Agente de Fluxo de Caixa propõe resgate preventivo do CDB DI de R$ 15.000,00.",
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
            details: "Saldo CC: R$ 48.950,20 • CDB DI: R$ 85.000,00 • Débitos Previstos: R$ 38.000,00"
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
            color: "#475569",
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
        id: 'account_info' as ScenarioId,
        title: "2. Informações de Conta & Posição Consolidada",
        shortLabel: "2. Info Conta",
        tag: "ACCOUNT_INFO_STATEMENTS",
        agentId: "account_info_agent",
        alert: {
          badge: "Consulta de Posição Consolidada",
          title: "Posição Global: R$ 463.950,20",
          description: "Saldo em conta corrente (R$ 48.950,20), CDB DI 100% CDI (R$ 85.000,00) e ativos externos Open Finance (BTG R$ 120k + XP R$ 210k).",
          primaryActionLabel: "Ver Extrato & Posição Consolidada",
          primaryActionType: "view_statements",
          secondaryActionLabel: "Consultar Limites Disponíveis",
          secondaryActionType: "view_limits"
        },
        telemetryPayload: {
          account_id: "ITAU-7749-00912",
          customer_name: "Roberto Silva",
          segment: "Itaú Personnalité",
          checking_balance_brl: 48950.20,
          cdb_di_balance_brl: 85000.00,
          total_consolidated_liquid_patrimony_brl: 463950.20,
          mastercard_black_available_limit: 72569.50,
          scheduled_debits_next_thursday_brl: 38000.00,
          status: "ACCOUNT_OVERVIEW_ACTIVE"
        },
        graphNodes: [
          {
            id: "customer",
            name: "Roberto Silva (Personnalité)",
            group: "Perfil do Titular",
            layer: "Input",
            color: "#FF6423",
            details: "Conta Corrente Ag. 7749 CC 00912-8 • R$ 48.950,20"
          },
          {
            id: "asset_cdb",
            name: "CDB DI 100% CDI",
            group: "Ativo de Liquidez",
            layer: "Input",
            color: "#10B981",
            details: "R$ 85.000,00 • Liquidez diária com rentabilidade diária"
          },
          {
            id: "card_black",
            name: "Mastercard Black (8841)",
            group: "Meio de Pagamento",
            layer: "Input",
            color: "#64748B",
            details: "Limite R$ 85.000,00 • Fatura D+4 R$ 34.150,00"
          },
          {
            id: "info_agent",
            name: "Account Information Agent",
            group: "Processamento IA",
            layer: "Decision",
            color: "#070707",
            details: "Consolida posições, limites e lançamentos passados/futuros em tempo real"
          },
          {
            id: "info_output",
            name: "Visão Financeira Unificada",
            group: "Ação de Salvaguarda",
            layer: "Output",
            color: "#059669",
            details: "Extratos consolidados e cronograma de compensações entregues ao titular"
          }
        ]
      },
      {
        id: 'open_finance' as ScenarioId,
        title: "3. Open Finance & Portabilidade de Dívida",
        shortLabel: "3. Open Finance",
        tag: "OPEN_FINANCE_OPTIMIZER",
        agentId: "open_finance_optimizer",
        alert: {
          badge: "Oportunidade Open Finance Identificada",
          title: "Economia Projetada: R$ 14.280,00",
          description: "Saldo rotativo de R$ 18.000,00 no banco concorrente a 11,2% a.m. pode ser refinanciado no Itaú Sob Medida por 1,69% a.m.",
          primaryActionLabel: "Refinanciar & Emitir CCB (Economizar R$ 14k)",
          primaryActionType: "refinance_open_finance",
          secondaryActionLabel: "Simular Parcelamento",
          secondaryActionType: "simulate_open_finance"
        },
        telemetryPayload: {
          competitor_debt_balance_brl: 18000.00,
          competitor_interest_rate_monthly: "11.20%",
          itau_sob_medida_rate_monthly: "1.69%",
          monthly_interest_savings_brl: 680.40,
          total_interest_avoided_brl: 14280.00,
          instrument_type: "CCB_DIGITAL_LEI_10931",
          interbank_rail: "CIP_STR_PORTABILITY",
          status: "REFINANCE_PROPOSAL_DISPATCHED"
        },
        graphNodes: [
          {
            id: "open_finance_data",
            name: "Dados Open Finance (Consentimento Ativo)",
            group: "Open Finance",
            layer: "Input",
            color: "#FF6423",
            details: "Saldo devedor R$ 18.000,00 em banco concorrente • Taxa rotativa 11,2% a.m."
          },
          {
            id: "itau_rating",
            name: "Rating Personnalité (Score 980)",
            group: "Crédito Itaú",
            layer: "Input",
            color: "#64748B",
            details: "Linha Itaú Sob Medida pré-aprovada com taxa diferenciada de 1,69% a.m."
          },
          {
            id: "lei_ccb",
            name: "Marco Legal CCB (Lei 10.931)",
            group: "Regulação Financeira",
            layer: "Policy",
            color: "#475569",
            details: "Cédula de Crédito Bancário emitida eletronicamente com liquidação interbancária direta"
          },
          {
            id: "refi_agent",
            name: "Otimizador de Dívida Open Finance",
            group: "Processamento IA",
            layer: "Decision",
            color: "#070707",
            details: "Calcula spread de 9,51% a.m. e gera proposta de portabilidade com liquidação STR"
          },
          {
            id: "refi_output",
            name: "Dívida Consolidada (Economia R$ 14.280)",
            group: "Ação de Salvaguarda",
            layer: "Output",
            color: "#059669",
            details: "CCB assinada digitalmente com redução imediata de parcela e liquidação no concorrente"
          }
        ]
      },
      {
        id: 'travel_shield' as ScenarioId,
        title: "4. Aviso Viagem & Proteção Internacional",
        shortLabel: "4. Aviso Viagem",
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
            color: "#FF6423",
            details: "Gastos previstos em Euros (EUR) • Risco de falso positivo em maquininhas no exterior"
          },
          {
            id: "card_policy",
            name: "Diretriz de Segurança de Bandeira",
            group: "Regulação Cartões",
            layer: "Policy",
            color: "#475569",
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
            name: "Modo Viagem Habilitado & Seguro Válido",
            group: "Ação de Salvaguarda",
            layer: "Output",
            color: "#059669",
            details: "Compras liberadas na Europa sem risco de bloqueio falso-positivo"
          }
        ]
      },
      {
        id: 'card_benefits' as ScenarioId,
        title: "5. Benefícios Mastercard Black & Schengen",
        shortLabel: "5. Benefícios Black",
        tag: "MASTERCARD_BLACK_BENEFITS",
        agentId: "card_benefits_agent",
        alert: {
          badge: "Benefícios Exclusivos Personnalité",
          title: "Proteção Schengen & Salas VIP",
          description: "Acesso ilimitado à Sala VIP GRU Terminal 3, 4 acessos LoungeKey na Europa e seguro médico Schengen de €30.000 inclusos.",
          primaryActionLabel: "Ver Benefícios Mastercard Black",
          primaryActionType: "get_card_benefits",
          secondaryActionLabel: "Emitir Certificado Schengen",
          secondaryActionType: "view_schengen_certificate"
        },
        telemetryPayload: {
          card_tier: "Mastercard Black Personnalité",
          vip_lounge_gru: "UNLIMITED_T3",
          loungekey_passes_europe: 4,
          schengen_coverage_eur: 30000.00,
          rental_car_insurance: "MASTERSEGURO_CDW_LDW_INCLUDED",
          concierge_active: "24_7_GLOBAL"
        },
        graphNodes: [
          {
            id: "card_query",
            name: "Consulta Benefícios Black",
            group: "Solicitação Cliente",
            layer: "Input",
            color: "#64748B",
            details: "Cliente consulta proteções de viagem para Europa"
          },
          {
            id: "benefit_rules",
            name: "Regras Mastercard Black",
            group: "Diretrizes de Cartão",
            layer: "Policy",
            color: "#475569",
            details: "Apólice AIG Schengen €30k e regras LoungeKey GRU/Europa"
          },
          {
            id: "benefit_engine",
            name: "Elegibilidade Confirmada",
            group: "Motor de Benefícios",
            layer: "Decision",
            color: "#059669",
            details: "Cartão ativo com cobertura automática válida"
          },
          {
            id: "benefit_ready",
            name: "Voucher Schengen Emitido",
            group: "Ação de Salvaguarda",
            layer: "Output",
            color: "#059669",
            details: "Certificado médico Schengen e 4 passes LoungeKey disponíveis"
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
          id: "account_info_agent",
          name: "Account Information & Statements Agent",
          type: "account_info",
          description: "Responde dúvidas sobre saldos, extratos consolidados, limites de cartões e lançamentos agendados em tempo real.",
          capabilities: ["Consulta Posição Global", "Extrato & Lançamentos Futuros", "Limites & Faturas"],
          defaultResult: {
            checking_balance: 48950.20,
            cdb_di_balance: 85000.00,
            mastercard_black_limit_available: 72569.50,
            scheduled_debits_next_thursday: 38000.00,
            status: "OVERVIEW_READY"
          }
        },
        {
          id: "cash_flow_forecast_agent",
          name: "Cash Flow & Yield Forecasting Agent",
          type: "cash_flow",
          description: "Projeta fluxos de caixa da conta, antecipa compromissos de débitos futuros e calcula a distribuição ótima entre conta corrente e aplicações de liquidez diária.",
          capabilities: ["Previsão de Fluxo de Caixa", "Prevenção de Déficits", "Resgates Automáticos de Liquidez"],
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
          name: "Travel Notice & International Card Shield",
          type: "travel",
          description: "Registra avisos de viagem de clientes junto às redes de pagamento globais, ajusta dinamicamente limites internacionais e suprime recusas indevidas por suspeita de fraude.",
          capabilities: ["Aviso Viagem em Bandeiras", "Limites Internacionais Dinâmicos", "Supressão Preventiva de Recusas"],
          defaultResult: {
            service_status: "STANDBY_READY",
            network_authorizers: ["MASTERCARD_GLOBAL", "VISA_NET"],
            international_security_profile: "ADAPTIVE_LIMITS",
            fraud_suppression: "STANDBY",
            status: "READY"
          }
        },
        {
          id: "card_benefits_agent",
          name: "Card Benefits & Coverage Concierge",
          type: "card_benefits",
          description: "Apresenta benefícios de categorias de alta renda, emissão de apólices de seguro viagem, acesso a salas VIP globais e proteções de compra.",
          capabilities: ["Seguro Médico Internacional", "Programas de Salas VIP", "Seguro de Viagem e Bagagem", "Masterseguro de Automóveis"],
          defaultResult: {
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
            concierge: "Mastercard Concierge 24/7"
          }
        },
        {
          id: "open_finance_optimizer",
          name: "Open Finance & Yield Rate Optimizer",
          type: "open_finance",
          description: "Analisa o ecossistema Open Finance entre instituições para identificar arbitragens em taxas de rendimento e crédito, coordenando portabilidade automatizada de recursos.",
          capabilities: ["Varredura no Ecossistema Open Finance", "Arbitragem de CDI e Crédito", "Portabilidade Automatizada"],
          defaultResult: {
            open_finance_consent: "ACTIVE",
            refi_opportunity_detected: true,
            monthly_savings: 680.40,
            interest_saved: 14280.00
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
          type: "cdb_sweep",
          title: "Previsão de Liquidez & Yield — Saldo Monitorado",
          description: "R$ 85.000,00 alocados em CDB DI 100% CDI com resgate automatizado programado para compensação de débitos.",
          status: "Safeguarded",
          details: "Zero LIS Overdraft • 100% CDI Rentabilidade"
        },
        {
          id: "act_02",
          time: "11:15 BRT",
          type: "travel_mode",
          title: "Proteção Internacional Mastercard Black — Prontidão",
          description: "Apólice de Seguro Saúde Viagem ativa e detecção proativa de viagens para Europa habilitada.",
          status: "Confirmed",
          details: "Mastercard Global Service • R$ 50k Limite POS"
        }
      ] as SecurityActionItem[]
    },
    phone: {
      statusTime: "14:52",
      balanceTitle: "Saldo disponível",
      investmentsTitle: "Investimentos & CDB DI",
      quickPix: "Pix",
      quickPay: "Pagar",
      quickReceive: "Receber",
      quickCards: "Cartões",
      recentStatements: "Últimos Lançamentos",
      activeBadge: "ATIVO",
      frozenBadge: "CONGELADO",
      unfreeze: "Descongelar",
      freeze: "Bloquear",
      navHome: "Início",
      navStatements: "Extrato",
      navPix: "Pix",
      navCards: "Cartões",
      transactions: [
        { id: "tx_01", date: "Hoje, 14:32", description: "Pix Enviado — Marina Camargo", amount_brl: -150.00 },
        { id: "tx_02", date: "Hoje, 11:15", description: "Restaurante Fasano Jardins", amount_brl: -640.00 },
        { id: "tx_03", date: "Ontem", description: "Pix Recebido — Dividendo FII HGLG11", amount_brl: 1820.00 }
      ]
    },
    modal: {
      title: "Itaú Concierge Live",
      subtitle: "Assistente Multimodal de Operações Financeiras & Segurança Proativa",
      initialGreeting: "Olá Sr. Silva. Sou o Itaú Concierge. Como posso ajudar com suas contas, previsão de liquidez ou planos de viagem hoje?",
      micHelp: "Fale diretamente sobre saldo, compras de passagens aéreas ou refinanciamento.",
      endCall: "Encerrar Chamada",
      speaking: "Itaú Concierge Falando...",
      listening: "Ouvindo...",
      processing: "Analisando telemetria financeira...",
      suggestionsTitle: "Perguntas de Demonstração Rápidas",
      suggestions: [
        "Vou comprar 2 passagens para Lisboa por R$ 24.000. Meus débitos da próxima semana vão compensar?",
        "Qual é a previsão de saldo para quinta-feira e como evitar juros de cheque especial (LIS)?",
        "Ative o aviso de viagem para Portugal e Espanha e eleve o limite do meu Mastercard Black.",
        "Como posso economizar refinanciando a dívida externa pelo Open Finance?"
      ]
    },
    notifications: {
      cdbSweepTitle: "Resgate CDB DI Programado",
      cdbSweepSubtitle: "R$ 15.000,00 agendados para 25/08 às 06:00 BRT (Zero Juros LIS).",
      cdiTransferTitle: "Transferência CDI Concluída",
      cdiTransferSubtitle: "R$ 330.000,00 transferidos para CDB DI Itaú a 100% do CDI (+R$ 5.940/ano).",
      travelModeTitle: "Aviso de Viagem Ativado",
      travelModeSubtitle: "Modo Viagem ativo para Portugal e Espanha. Limite elevado para R$ 50.000.",
      openFinanceTitle: "Portabilidade CCB Executada",
      openFinanceSubtitle: "Saldo externo de R$ 18.000 liquidado a 1,69% a.m. Economia de R$ 14.280.",
      pixBlockedTitle: "Pix Bloqueado Preventivamente",
      pixBlockedSubtitle: "R$ 4.200 retidos em conta corrente sob diretrizes BACEN MED 147.",
      cardFrozenTitle: "Cartão Temporariamente Bloqueado",
      cardFrozenSubtitle: "Mastercard Black congelado. Token Apple Pay rotacionado.",
      cardUnfrozenTitle: "Cartão Reativado",
      cardUnfrozenSubtitle: "Mastercard Black reativado com biometria facial.",
      agentTriggeredTitle: "Sub-Agente Executado",
      agentTriggeredSubtitle: "Telemetria recebida do sub-agente:",
      demoResetTitle: "Demonstração Reiniciada",
      demoResetSubtitle: "Estados da conta corrente, cartões e telemetria redefinidos para o início.",
      sessionSavedTitle: "Sessão Salva",
      sessionSavedSubtitle: "Logs de telemetria e ações arquivados com sucesso."
    }
  },
  en: {
    header: {
      brandTitle: "Banco Itaú",
      brandSub: "Multi-Agent Orchestration & Real-Time Itaú Concierge",
      saveSession: "Save Session",
      resetSession: "Reset Demo",
      confirmResetTitle: "Reset Demo to Baseline?",
      confirmResetDescription: "All active mitigations, sub-agent executions, and telemetry logs will be restored to the initial baseline state.",
      confirmResetAction: "Reset Now",
      cancelAction: "Cancel",
      callAi: "Call Itaú Concierge",
      hangUp: "End Call",
      customer: "Roberto Silva",
      account: "Br. 7749 • Acct 00912-8",
      scenarioSelectorTitle: "Active Scenario:",
      adminPanelTitle: "Admin & Presenter Panel",
      adminPanelSubtitle: "Demonstration Tools & Governance Resources",
      brandKitButton: "Itaú Brand Kit & Typography",
      brandKitDesc: "Official Itaú Display & Itaú Text typography, brand colors & guidelines",
      demoScriptButton: "Executive Demo Script",
      demoScriptDesc: "Complete 5-act presentation narrative for executive & C-suite demos",
      scenariosMatrixButton: "Scenarios Matrix (BACEN / MED)",
      scenariosMatrixDesc: "Regulatory compliance matrix, Resolution 147 & sub-agent telemetry",
      openInNewTab: "Opens in new tab",
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
        title: "1. Predictive Balance Alert & Cash Sweep",
        shortLabel: "1. Alert & Flow",
        tag: "CASH_FLOW_FORECAST",
        agentId: "cash_flow_forecast_agent",
        alert: {
          badge: "Predictive Balance Alert",
          title: "Projected Shortfall D+4: -R$ 13,050.00",
          description: "Scheduled debits of R$ 38,000.00 on Thursday will exceed your checking balance. Cash Flow Agent proposes preventive CDB DI sweep of R$ 15,000.00.",
          primaryActionLabel: "Schedule CDB Sweep (R$ 15k)",
          primaryActionType: "sweep_cdb",
          secondaryActionLabel: "View Flow Analysis",
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
            details: "Checking: R$ 48,950.20 • CDB DI: R$ 85,000.00 • Scheduled Debits: R$ 38,000.00"
          },
          {
            id: "shortfall_event",
            name: "D+4 Scheduled Debits: R$ 38,000.00",
            group: "Future Event",
            layer: "Input",
            color: "#E11D48",
            details: "Condo Pix (R$ 3,850) + Mastercard Black Bill (R$ 34,150) = Shortfall -R$ 13,050"
          },
          {
            id: "cmn_policy",
            name: "CMN Resolution 4.765 (Anti-Overdraft)",
            group: "BACEN Policy",
            layer: "Policy",
            color: "#475569",
            details: "Proactive prevention of overdraft (LIS) interest with explicit customer authorization"
          },
          {
            id: "cash_agent",
            name: "Cash Flow & Yield Engine",
            group: "AI Processing",
            layer: "Decision",
            color: "#070707",
            details: "Models daily CDB yield until 25/08 at 06:00 BRT and schedules optimal sweep"
          },
          {
            id: "sweep_output",
            name: "R$ 15,000 Sweep Scheduled (Zero Overdraft)",
            group: "Safeguard Action",
            layer: "Output",
            color: "#059669",
            details: "Yield maximized until settlement minute • R$ 184.60 in overdraft interest saved"
          }
        ]
      },
      {
        id: 'account_info' as ScenarioId,
        title: "2. Account Balances & Consolidated Position",
        shortLabel: "2. Account Info",
        tag: "ACCOUNT_INFO_STATEMENTS",
        agentId: "account_info_agent",
        alert: {
          badge: "Consolidated Position Inquiry",
          title: "Total Wealth Balance: R$ 463,950.20",
          description: "Checking account balance (R$ 48,950.20), Daily Liquidity CDB DI (R$ 85,000.00), and Open Finance connected assets (BTG R$ 120k + XP R$ 210k).",
          primaryActionLabel: "View Statements & Scheduled Debits",
          primaryActionType: "view_statements",
          secondaryActionLabel: "Check Available Limits",
          secondaryActionType: "view_limits"
        },
        telemetryPayload: {
          account_id: "ITAU-7749-00912",
          customer_name: "Roberto Silva",
          segment: "Itaú Personnalité",
          checking_balance_brl: 48950.20,
          cdb_di_balance_brl: 85000.00,
          total_consolidated_liquid_patrimony_brl: 463950.20,
          mastercard_black_available_limit: 72569.50,
          scheduled_debits_next_thursday_brl: 38000.00,
          status: "ACCOUNT_OVERVIEW_ACTIVE"
        },
        graphNodes: [
          {
            id: "customer",
            name: "Roberto Silva (Personnalité)",
            group: "Cardholder Profile",
            layer: "Input",
            color: "#FF6423",
            details: "Checking Acct 00912-8 • R$ 48,950.20"
          },
          {
            id: "asset_cdb",
            name: "CDB DI 100% CDI",
            group: "Liquidity Asset",
            layer: "Input",
            color: "#10B981",
            details: "R$ 85,000.00 • Daily liquidity with daily CDI compounding"
          },
          {
            id: "card_black",
            name: "Mastercard Black (8841)",
            group: "Payment Instrument",
            layer: "Input",
            color: "#64748B",
            details: "Limit R$ 85,000.00 • Scheduled invoice R$ 34,150.00"
          },
          {
            id: "info_agent",
            name: "Account Information Agent",
            group: "AI Processing",
            layer: "Decision",
            color: "#070707",
            details: "Consolidates positions, limits, and past/future transactions in real time"
          },
          {
            id: "info_output",
            name: "Unified Financial View",
            group: "Safeguard Action",
            layer: "Output",
            color: "#059669",
            details: "Consolidated statement and scheduled settlement timeline delivered to cardholder"
          }
        ]
      },
      {
        id: 'open_finance' as ScenarioId,
        title: "3. Open Finance & Debt Refinancing",
        shortLabel: "3. Open Finance",
        tag: "OPEN_FINANCE_OPTIMIZER",
        agentId: "open_finance_optimizer",
        alert: {
          badge: "Open Finance Opportunity Identified",
          title: "Projected Savings: R$ 14,280.00",
          description: "R$ 18,000.00 revolving balance at competitor bank at 11.2%/mo can be refinanced under Itaú Sob Medida for 1.69%/mo.",
          primaryActionLabel: "Refinance & Issue CCB (Save R$ 14k)",
          primaryActionType: "refinance_open_finance",
          secondaryActionLabel: "Simulate Installments",
          secondaryActionType: "simulate_open_finance"
        },
        telemetryPayload: {
          competitor_debt_balance_brl: 18000.00,
          competitor_interest_rate_monthly: "11.20%",
          itau_sob_medida_rate_monthly: "1.69%",
          monthly_interest_savings_brl: 680.40,
          total_interest_avoided_brl: 14280.00,
          instrument_type: "CCB_DIGITAL_LEI_10931",
          interbank_rail: "CIP_STR_PORTABILITY",
          status: "REFINANCE_PROPOSAL_DISPATCHED"
        },
        graphNodes: [
          {
            id: "open_finance_data",
            name: "Open Finance Data (Active Consent)",
            group: "Open Finance",
            layer: "Input",
            color: "#FF6423",
            details: "Outstanding balance R$ 18,000.00 at competitor • Revolving rate 11.2%/mo"
          },
          {
            id: "itau_rating",
            name: "Personnalité Rating (Score 980)",
            group: "Itaú Credit",
            layer: "Input",
            color: "#64748B",
            details: "Pre-approved Itaú Sob Medida line with preferential rate of 1.69%/mo"
          },
          {
            id: "lei_ccb",
            name: "CCB Legal Framework (Law 10,931)",
            group: "Financial Regulation",
            layer: "Policy",
            color: "#475569",
            details: "Electronic Bank Credit Note issued with direct interbank debt settlement"
          },
          {
            id: "refi_agent",
            name: "Open Finance Debt Optimizer",
            group: "AI Processing",
            layer: "Decision",
            color: "#070707",
            details: "Calculates 9.51%/mo spread reduction and dispatches CIP/STR payoff proposal"
          },
          {
            id: "refi_output",
            name: "Debt Consolidated (R$ 14,280 Saved)",
            group: "Safeguard Action",
            layer: "Output",
            color: "#059669",
            details: "Digitally signed CCB with immediate installment drop and external debt cancellation"
          }
        ]
      },
      {
        id: 'travel_shield' as ScenarioId,
        title: "4. Travel Notice & International Shield",
        shortLabel: "4. Travel Shield",
        tag: "TRAVEL_SHIELDING",
        agentId: "travel_shield_agent",
        alert: {
          badge: "International Travel Detected",
          title: "Travel Notice: Lisbon & Madrid",
          description: "TAP Air Portugal tickets identified. Activate international authorization and Mastercard Black travel insurance.",
          primaryActionLabel: "Activate Travel Shield & R$ 50k Limit",
          primaryActionType: "activate_travel_mode",
          secondaryActionLabel: "View Insurance Policy",
          secondaryActionType: "view_travel_insurance"
        },
        telemetryPayload: {
          card_last4: "8841",
          destinations: ["Portugal (LIS)", "Spain (MAD)"],
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
            group: "Cardholder Profile",
            layer: "Input",
            color: "#FF6423",
            details: "Mastercard Black • TAP Portugal Ticket • Destination Lisbon & Madrid"
          },
          {
            id: "roaming_event",
            name: "Expected International Transactions",
            group: "Travel Event",
            layer: "Input",
            color: "#FF6423",
            details: "Projected spend in Euros (EUR) • Risk of overseas false positive declines"
          },
          {
            id: "card_policy",
            name: "Card Network Security Directive",
            group: "Card Regulation",
            layer: "Policy",
            color: "#475569",
            details: "Geographic POS/ATM authorization without requiring manual web forms"
          },
          {
            id: "travel_agent",
            name: "Travel Concierge Engine",
            group: "AI Processing",
            layer: "Decision",
            color: "#070707",
            details: "Raises daily POS limit to R$ 50,000 and verifies Mastercard Black medical insurance"
          },
          {
            id: "travel_output",
            name: "Travel Mode Enabled & Insurance Verified",
            group: "Safeguard Action",
            layer: "Output",
            color: "#059669",
            details: "European transactions pre-approved with zero false-positive decline risk"
          }
        ]
      },
      {
        id: 'card_benefits' as ScenarioId,
        title: "5. Mastercard Black Benefits & Schengen",
        shortLabel: "5. Black Benefits",
        tag: "MASTERCARD_BLACK_BENEFITS",
        agentId: "card_benefits_agent",
        alert: {
          badge: "Exclusive Personnalité Benefits",
          title: "Schengen Coverage & VIP Lounges",
          description: "Unlimited VIP lounge access at GRU Terminal 3, 4 LoungeKey passes in Europe, and €30,000 Schengen medical insurance included.",
          primaryActionLabel: "View Mastercard Black Benefits",
          primaryActionType: "get_card_benefits",
          secondaryActionLabel: "Issue Schengen Certificate",
          secondaryActionType: "view_schengen_certificate"
        },
        telemetryPayload: {
          card_tier: "Mastercard Black Personnalité",
          vip_lounge_gru: "UNLIMITED_T3",
          loungekey_passes_europe: 4,
          schengen_coverage_eur: 30000.00,
          rental_car_insurance: "MASTERSEGURO_CDW_LDW_INCLUDED",
          concierge_active: "24_7_GLOBAL"
        },
        graphNodes: [
          {
            id: "card_query",
            name: "Black Benefits Query",
            group: "Client Request",
            layer: "Input",
            color: "#64748B",
            details: "Client inquires about international travel protections"
          },
          {
            id: "benefit_rules",
            name: "Mastercard Black Rules",
            group: "Card Guidelines",
            layer: "Policy",
            color: "#475569",
            details: "AIG Schengen €30k policy and GRU/Europe LoungeKey entitlements"
          },
          {
            id: "benefit_engine",
            name: "Eligibility Confirmed",
            group: "Benefits Engine",
            layer: "Decision",
            color: "#059669",
            details: "Active card with valid automated travel coverage"
          },
          {
            id: "benefit_ready",
            name: "Schengen Voucher Issued",
            group: "Safeguard Action",
            layer: "Output",
            color: "#059669",
            details: "Schengen medical certificate and 4 LoungeKey passes ready"
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
          id: "account_info_agent",
          name: "Account Information & Statements Agent",
          type: "account_info",
          description: "Answers customer queries about checking balances, investments, card limits, and scheduled debits in real time.",
          capabilities: ["Consolidated Wealth Overview", "Statements & Future Debits", "Card Limits & Invoices"],
          defaultResult: {
            checking_balance: 48950.20,
            cdb_di_balance: 85000.00,
            mastercard_black_limit_available: 72569.50,
            scheduled_debits_next_thursday: 38000.00,
            status: "OVERVIEW_READY"
          }
        },
        {
          id: "cash_flow_forecast_agent",
          name: "Cash Flow & Yield Forecasting Agent",
          type: "cash_flow",
          description: "Forecasts account cash flows, models upcoming debit obligations, and calculates optimal balance allocation between checking and interest-earning liquidity accounts.",
          capabilities: ["Time-Series Cash Flow Forecasting", "Overdraft Deficit Prevention", "Automated Liquidity Sweeps"],
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
          name: "Travel Notice & International Card Shield",
          type: "travel",
          description: "Registers cardholder travel notices across global payment networks, dynamically adjusts international POS spending limits, and suppresses false-positive fraud declines abroad.",
          capabilities: ["Payment Network Travel Notices", "Dynamic International POS Limits", "Fraud Decline Pre-Suppression"],
          defaultResult: {
            service_status: "STANDBY_READY",
            network_authorizers: ["MASTERCARD_GLOBAL", "VISA_NET"],
            international_security_profile: "ADAPTIVE_LIMITS",
            fraud_suppression: "STANDBY",
            status: "READY"
          }
        },
        {
          id: "card_benefits_agent",
          name: "Card Benefits & Coverage Concierge",
          type: "card_benefits",
          description: "Advises cardholders on premium tier card benefits, automated travel insurance policies, worldwide VIP airport lounge access, and purchase protections.",
          capabilities: ["International Travel Medical Coverage", "VIP Airport Lounge Programs", "Trip Cancellation & Baggage Insurance", "Vehicle Rental Coverage"],
          defaultResult: {
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
            concierge: "Mastercard Concierge 24/7"
          }
        },
        {
          id: "open_finance_optimizer",
          name: "Open Finance & Yield Rate Optimizer",
          type: "open_finance",
          description: "Scans multi-bank Open Finance ecosystems to identify rate arbitrage opportunities in credit and fixed income, coordinating automated portfolio portability.",
          capabilities: ["Open Finance Ecosystem Scanning", "Yield & Debt Rate Arbitrage", "Automated Asset Portability"],
          defaultResult: {
            open_finance_consent: "ACTIVE",
            refi_opportunity_detected: true,
            monthly_savings: 680.40,
            interest_saved: 14280.00
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
          type: "cdb_sweep",
          title: "Liquidity & Yield Forecasting — Monitored Balances",
          description: "R$ 85,000.00 invested in 100% CDI with automated sweep scheduled to prevent overdraft fees.",
          status: "Safeguarded",
          details: "Zero LIS Overdraft • 100% CDI Daily Yield"
        },
        {
          id: "act_02",
          time: "11:15 BRT",
          type: "travel_mode",
          title: "Mastercard Black International Protection — Standby",
          description: "Travel Medical Insurance active and proactive European travel detection enabled.",
          status: "Confirmed",
          details: "Mastercard Global Service • R$ 50k POS Limit"
        }
      ] as SecurityActionItem[]
    },
    phone: {
      statusTime: "14:52",
      balanceTitle: "Available Balance",
      investmentsTitle: "Investments & CDB DI",
      quickPix: "Pix",
      quickPay: "Pay",
      quickReceive: "Receive",
      quickCards: "Cards",
      recentStatements: "Recent Statements",
      activeBadge: "ACTIVE",
      frozenBadge: "FROZEN",
      unfreeze: "Unfreeze",
      freeze: "Freeze",
      navHome: "Home",
      navStatements: "Statements",
      navPix: "Pix",
      navCards: "Cards",
      transactions: [
        { id: "tx_01", date: "Today, 14:32", description: "Pix Sent — Marina Camargo", amount_brl: -150.00 },
        { id: "tx_02", date: "Today, 11:15", description: "Restaurante Fasano Jardins", amount_brl: -640.00 },
        { id: "tx_03", date: "Yesterday", description: "Pix Received — FII Dividend HGLG11", amount_brl: 1820.00 }
      ]
    },
    modal: {
      title: "Itaú Concierge Live",
      subtitle: "Multimodal Proactive Banking & Security Assistant",
      initialGreeting: "Hello Mr. Silva. I am Itaú Concierge. How can I assist with your accounts, liquidity forecast, or travel plans today?",
      micHelp: "Speak directly about balances, flight ticket purchases, or debt refinancing.",
      endCall: "End Call",
      speaking: "Itaú Concierge Speaking...",
      listening: "Listening...",
      processing: "Analyzing financial telemetry...",
      suggestionsTitle: "Quick Demo Inquiries",
      suggestions: [
        "I am buying 2 tickets to Lisbon for R$ 24,000. Will my scheduled payments clear next week?",
        "What is my balance forecast for Thursday and how do I avoid LIS overdraft fees?",
        "Activate travel notice for Portugal and Spain and raise my Mastercard Black limit.",
        "How can I save money by refinancing my external loan through Open Finance?"
      ]
    },
    notifications: {
      cdbSweepTitle: "CDB DI Sweep Scheduled",
      cdbSweepSubtitle: "R$ 15,000.00 scheduled for 25/08 at 06:00 BRT (Zero Overdraft Fees).",
      cdiTransferTitle: "CDI Transfer Executed",
      cdiTransferSubtitle: "R$ 330,000.00 transferred to Itaú CDB DI at 100% CDI (+R$ 5,940/yr).",
      travelModeTitle: "Travel Shield Activated",
      travelModeSubtitle: "Travel mode active for Portugal & Spain. Daily limit elevated to R$ 50,000.",
      openFinanceTitle: "Portability CCB Executed",
      openFinanceSubtitle: "External balance of R$ 18,000 settled at 1.69%/mo. R$ 14,280 saved.",
      pixBlockedTitle: "Precautionary Pix Hold",
      pixBlockedSubtitle: "R$ 4,200 retained in checking account under BACEN MED 147 rules.",
      cardFrozenTitle: "Card Temporarily Frozen",
      cardFrozenSubtitle: "Mastercard Black frozen. Apple Pay digital token rotated.",
      cardUnfrozenTitle: "Card Reactivated",
      cardUnfrozenSubtitle: "Mastercard Black reactivated with facial biometrics.",
      agentTriggeredTitle: "Sub-Agent Triggered",
      agentTriggeredSubtitle: "Telemetry received from sub-agent:",
      demoResetTitle: "Demo Reset",
      demoResetSubtitle: "Checking balances, card limits, and telemetry restored to baseline.",
      sessionSavedTitle: "Session Saved",
      sessionSavedSubtitle: "Telemetry logs and safeguard actions archived successfully."
    }
  }
};
