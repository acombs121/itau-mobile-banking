import { SecurityActionItem } from '../types/itau_concierge';

export type Language = 'pt' | 'en';

export interface LocalizedSubAgentItem {
  id: string;
  name: string;
  type: string;
  description: string;
  capabilities: string[];
  defaultResult: Record<string, any>;
}

export const translations = {
  pt: {
    header: {
      brandTitle: "Banco Itaú",
      brandSub: "Painel de Orquestração & Concierge Financeiro em Tempo Real",
      saveSession: "Salvar Sessão",
      resetSession: "Reiniciar Demonstração",
      callAi: "Chamar Personnalité Concierge",
      hangUp: "Encerrar Chamada",
      customer: "Roberto Silva",
      account: "Ag. 7749 • CC 00912-8",
    },
    tabs: {
      agents: "Sub-Agentes Ativos",
      actionPlan: "Plano de Ações & Concierge",
      decisionGraph: "Grafo de Risco & Decisão",
      transcript: "Transcrição & Logs",
    },
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
          id: "itau_fraud_monitor",
          name: "Personnalité Fraud & Risk Monitor",
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
        },
        {
          id: "itau_pix_limit_servicing",
          name: "Pix & Liquidity Manager",
          type: "limits",
          description: "Aplica limites noturnos preventivos de R$ 1.000,00 e processa elevações emergenciais via biometria de voz.",
          capabilities: ["Regra 20h-06h", "Elevação Temporária", "Autenticação Voz"],
          defaultResult: {
            rule: "BACEN_NIGHT_SAFETY",
            active_limit: 1000.00,
            window: "20:00 - 06:00 BRT"
          }
        },
        {
          id: "itau_geolocation_validator",
          name: "Travel & Geo Validator",
          type: "geolocation",
          description: "Valida triangulação de antenas de celular, Wi-Fi BSSID e biometria nativa do smartphone.",
          capabilities: ["Triangulação Celular", "Aviso Viagem", "Biometria FaceID"],
          defaultResult: {
            device: "iPhone 16 Pro",
            os: "iOS 18.2",
            face_id_verified: true,
            location: "São Paulo, SP"
          }
        }
      ] as LocalizedSubAgentItem[]
    },
    actionPlan: {
      title: "Plano de Salvaguarda & Ações Confirmadas",
      subtitle: "Medidas protetivas e otimizações registradas na conta corrente e dispositivos do cliente",
      emptyState: "Nenhuma ação executada ainda. Interaja no app ou acione o Personnalité Concierge.",
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
      alertCardTitle: "Bloqueio Preventivo Pix Ativo",
      alertCardDesc: "Pix de R$ 4.200,00 para 'Eletro Tech SP' retido preventivamente por anomalia de IP e geolocalização.",
      btnBlockRefund: "Bloquear & Estornar",
      btnApprove: "Confirmar Transação",
      allSafe: "Conta, cartões e Pix protegidos com Personnalité Concierge.",
      quickPix: "Pix",
      quickPay: "Pagar",
      quickReceive: "Receber",
      quickCards: "Cartões",
      cardLimit: "Limite disponível: R$ 72.569,50",
      freeze: "Congelar Cartão",
      unfreeze: "Descongelar",
      frozenBadge: "CONGELADO",
      activeBadge: "ATIVO",
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
      agentTriggeredTitle: "Sub-Agente Executado",
      agentTriggeredSubtitle: "Telemetria atualizada para ",
      demoResetTitle: "Demonstração Reiniciada",
      demoResetSubtitle: "Todos os estados voltaram ao padrão.",
      sessionSavedTitle: "Sessão Salva",
      sessionSavedSubtitle: "Itinerário salvo no backend.",
    },
    graph: {
      title: "Grafo de Raciocínio & Decisão de Fraude",
      subtitle: "Visualização em grafo de propriedades das entidades, alertas e políticas BACEN",
      badge: "Cypher / Property Graph",
      layer: "Camada",
      detailsLabel: "Diagnóstico & Telemetria:",
      nodes: [
        {
          id: "customer",
          name: "Roberto Silva (Personnalité)",
          group: "Perfil do Titular",
          layer: "Input",
          color: "#FF6423",
          details: "Score de Crédito: 980 • Dispositivo Confiável: iPhone 16 Pro • Biometria Facial Registrada"
        },
        {
          id: "anomaly_event",
          name: "Tentativa Pix R$ 4.200,00",
          group: "Evento Suspeito",
          layer: "Input",
          color: "#E11D48",
          details: "Destinatário 'Eletro Tech SP' sem histórico prévio • IP de origem localizado em VPN internacional"
        },
        {
          id: "bacen_med_policy",
          name: "Regulação BACEN MED (Res. 147)",
          group: "Diretriz Regulatória",
          layer: "Policy",
          color: "#003399",
          details: "Mecanismo Especial de Devolução obrigatório para contenção cautelar imediata de ativos"
        },
        {
          id: "ai_guard_engine",
          name: "Motor de Decisão Personnalité Concierge",
          group: "Processamento IA",
          layer: "Decision",
          color: "#070707",
          details: "Pontuação de Risco: 94/100 • Bloqueio Preventivo em 180ms • Notificação por Voz Disparada"
        },
        {
          id: "action_output",
          name: "Ativos Retidos & Token Virtual Seguro",
          group: "Ação de Salvaguarda",
          layer: "Output",
          color: "#059669",
          details: "Saldo preservado na conta corrente • Notificação entregue no app mobile do cliente"
        }
      ]
    },
    transcript: {
      title: "Registro de Transcrição & Execução de Ferramentas",
      subtitle: "Fluxo em tempo real de chamadas de ferramentas (Tool Calls) e áudio bidirecional",
      empty: "Inicie uma conversa por voz ou execute ações no app para gerar logs de telemetria.",
    },
    modal: {
      title: "Personnalité Concierge",
      subtitle: "Atendimento por Voz & Concierge Financeiro",
      incidentContext: "Contexto Ativo:",
      initialGreeting: "Olá Roberto. Sou o Personnalité Concierge. Como posso ajudar com seus pagamentos, saldo projetado ou planejamento de viagem hoje?",
      analyzing: "Personnalité Concierge está analisando as informações...",
      quickPrompt1: "Verifique meu saldo e pagamentos previstos para a viagem.",
      quickPrompt2: "Ative o aviso de viagem para Europa no meu Mastercard Black.",
      placeholder: "Digite ou fale com o Personnalité Concierge...",
      send: "Enviar",
    },
    footer: {
      brand: "Banco Itaú Unibanco S.A.",
      tagline: "Protegido por Personnalité Concierge & Gemini Enterprise Agent Platform",
    }
  },
  en: {
    header: {
      brandTitle: "Banco Itaú",
      brandSub: "Real-Time Sub-Agent Orchestration & Wealth Concierge Cockpit",
      saveSession: "Save Session",
      resetSession: "Reset Demo",
      callAi: "Call Personnalité Concierge",
      hangUp: "End Call",
      customer: "Roberto Silva",
      account: "Branch 7749 • Acct 00912-8",
    },
    tabs: {
      agents: "Active Sub-Agents",
      actionPlan: "Action Plan & Concierge",
      decisionGraph: "Risk & Decision Graph",
      transcript: "Transcript & Logs",
    },
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
          id: "itau_fraud_monitor",
          name: "Personnalité Fraud & Risk Monitor",
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
        },
        {
          id: "itau_pix_limit_servicing",
          name: "Pix & Liquidity Manager",
          type: "limits",
          description: "Enforces preventive night-time limits and processes cash flow liquidity sweeps.",
          capabilities: ["8 PM - 6 AM Rule", "Cash Sweeping", "Voice Authentication"],
          defaultResult: {
            rule: "BACEN_NIGHT_SAFETY",
            active_limit: 1000.00,
            window: "20:00 - 06:00 BRT"
          }
        },
        {
          id: "itau_geolocation_validator",
          name: "Travel & Geo Validator",
          type: "geolocation",
          description: "Validates cellular roaming triangulation, travel notices, and biometric authentication.",
          capabilities: ["Cellular Triangulation", "Travel Mode", "Face ID Biometrics"],
          defaultResult: {
            device: "iPhone 16 Pro",
            os: "iOS 18.2",
            face_id_verified: true,
            location: "São Paulo, SP"
          }
        }
      ] as LocalizedSubAgentItem[]
    },
    actionPlan: {
      title: "Action Plan & Concierge Execution",
      subtitle: "Active protective measures and optimizations logged across checking account and cards",
      emptyState: "No actions executed yet. Interact with the mobile app or voice concierge.",
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
      alertCardTitle: "Precautionary Pix Block Active",
      alertCardDesc: "Pix transfer of R$ 4,200.00 to 'Eletro Tech SP' held due to IP and geolocation discrepancy.",
      btnBlockRefund: "Block & Refund",
      btnApprove: "Authorize Transfer",
      allSafe: "Account, cards, and payments protected with Personnalité Concierge.",
      quickPix: "Pix",
      quickPay: "Pay",
      quickReceive: "Receive",
      quickCards: "Cards",
      cardLimit: "Available credit limit: R$ 72,569.50",
      freeze: "Freeze Card",
      unfreeze: "Unfreeze",
      frozenBadge: "FROZEN",
      activeBadge: "ACTIVE",
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
      agentTriggeredTitle: "Sub-Agent Executed",
      agentTriggeredSubtitle: "Telemetry updated for ",
      demoResetTitle: "Demo Reset",
      demoResetSubtitle: "All states restored to default.",
      sessionSavedTitle: "Session Saved",
      sessionSavedSubtitle: "Itinerary saved to backend.",
    },
    graph: {
      title: "Reasoning & Decision Graph",
      subtitle: "Property graph visualization of identity nodes, anomaly telemetry, and Central Bank policies",
      badge: "Cypher / Property Graph",
      layer: "Layer",
      detailsLabel: "Diagnostics & Telemetry:",
      nodes: [
        {
          id: "customer",
          name: "Roberto Silva (Personnalité)",
          group: "Cardholder Profile",
          layer: "Input",
          color: "#FF6423",
          details: "Credit Score: 980 • Trusted Device: iPhone 16 Pro • Facial Biometrics Enrolled"
        },
        {
          id: "anomaly_event",
          name: "Pix Attempt R$ 4,200.00",
          group: "Suspicious Event",
          layer: "Input",
          color: "#E11D48",
          details: "Recipient 'Eletro Tech SP' has zero history • Origin IP traced to overseas VPN"
        },
        {
          id: "bacen_med_policy",
          name: "BACEN MED Rule (Res. 147)",
          group: "Regulatory Policy",
          layer: "Policy",
          color: "#003399",
          details: "Special Return Mechanism (MED) mandated for immediate precautionary fund retention"
        },
        {
          id: "ai_guard_engine",
          name: "Personnalité Concierge Decision Engine",
          group: "AI Processing",
          layer: "Decision",
          color: "#070707",
          details: "Risk Score: 94/100 • Precautionary block in 180ms • Instant Voice Auth Dispatched"
        },
        {
          id: "action_output",
          name: "Funds Safeguarded & Token Frozen",
          group: "Safety Action",
          layer: "Output",
          color: "#059669",
          details: "Capital preserved in checking account • Push alert delivered to mobile device"
        }
      ]
    },
    transcript: {
      title: "Transcript & Tool Execution Telemetry",
      subtitle: "Real-time stream of Gemini Live tool calls, sub-agent telemetry, and voice events",
      empty: "Start a voice conversation or perform actions in the mobile app to stream telemetry.",
    },
    modal: {
      title: "Personnalité Concierge",
      subtitle: "Voice & Wealth Advisory Assistant",
      incidentContext: "Active Context:",
      initialGreeting: "Hello Roberto. I am Personnalité Concierge. How can I assist with your payments, cash flow forecast, or travel plans today?",
      analyzing: "Personnalité Concierge is analyzing financial data...",
      quickPrompt1: "Check my balance and projected payments for my upcoming trip.",
      quickPrompt2: "Activate international travel mode for Europe on my Mastercard Black.",
      placeholder: "Type or speak to Personnalité Concierge...",
      send: "Send",
    },
    footer: {
      brand: "Banco Itaú Unibanco S.A.",
      tagline: "Protected by Personnalité Concierge & Gemini Enterprise Agent Platform",
    }
  }
};
