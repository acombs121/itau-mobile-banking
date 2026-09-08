import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useBrand } from '../../context/BrandContext';
import { 
  FileText, 
  Terminal, 
  Copy, 
  Check, 
  X, 
  PlayCircle, 
  Server, 
  Cpu, 
  ShieldCheck, 
  ExternalLink,
  Sparkles,
  Building,
  UserCheck,
  TrendingUp,
  AlertCircle,
  Clock,
  Coins,
  Scale,
  CheckCircle2
} from 'lucide-react';

interface DemoScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DemoScriptModal: React.FC<DemoScriptModalProps> = ({ isOpen, onClose }) => {
  const { lang } = useLanguage();
  const { templatize } = useBrand();
  const [activeTab, setActiveTab] = useState<'overview' | 'walkthrough' | 'architecture' | 'persona' | 'markdown'>('overview');
  const [selectedAct, setSelectedAct] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const rawActs = [
    {
      act: 0,
      title_pt: 'Ato 0: Tela de Bloqueio & Alerta Preventivo de Saldo (O Disparo Proativo)',
      title_en: 'Act 0: Lock Screen Start & Proactive Trigger (The Paradigm Shift)',
      step_pt: 'Tela de Bloqueio',
      step_en: 'Lock Screen',
      what_to_say_pt: 'Os aplicativos bancários tradicionais são utilitários passivos: você só os abre após ocorrer algum problema ou para realizar pagamentos rotineiros. Hoje demonstramos um paradigma totalmente novo com o Itaú Concierge: um sistema multiagente que é proativamente vigilante em prol do cliente. Observe que nosso simulador inicia na tela de bloqueio do smartphone. Sem que o Roberto precise abrir o app, o Agente de Fluxo de Caixa do Itaú Personnalité detectou que os débitos agendados da próxima quinta-feira excederão seu saldo disponível e disparou um Alerta Preventivo de Saldo.',
      what_to_say_en: 'Traditional banking apps are passive utilities: you only check them after something goes wrong, or to execute a routine payment. Today, we are demonstrating a fundamentally different paradigm with Itaú Concierge: a multi-agent system that is proactively vigilant on behalf of the customer. Notice that our smartphone simulator begins on the lock screen. Without Roberto lifting a finger, Itaú Personnalité\'s background cash flow agent detected that upcoming Thursday debits will exceed his available checking balance, and pushed a Predictive Balance Alert.',
      what_is_shown_pt: [
        'Banner de notificação do Itaú Personnalité na tela de bloqueio com indicador pulsante em tempo real.',
        'Alerta Preventivo de Saldo destacando: "Débitos agendados de R$ 38.000,00 na quinta-feira excederão o saldo disponível. Toque para revisar com o Agente de Fluxo de Caixa."',
        'Déficit projetado em D+4 de -R$ 13.050,00 resultante de gastos em passagens aéreas e faturas agendadas.',
        'Ação interativa "TAP TO UNLOCK" com transição direta para a jornada autônoma dentro do aplicativo.'
      ],
      what_is_shown_en: [
        'Itaú Personnalité Lock Screen notification banner with live pulsing state indicator.',
        'Predictive Balance Alert message: "Débitos agendados de R$ 38.000,00 na quinta-feira excederão o saldo disponível. Toque para revisar com o Agente de Fluxo de Caixa."',
        'Projected D+4 shortfall of -R$ 13,050.00 following Lisbon flight purchase and scheduled debits.',
        'Interactive "TAP TO UNLOCK" action smoothly transitioning into the autonomous banking cockpit.'
      ],
      what_to_click_pt: 'Clique diretamente no banner do Alerta Preventivo de Saldo na tela do smartphone. O simulador desbloqueia suavemente e exibe o card "Previsão de Saldo & Yield" com o microfone ativado no Gemini Live.',
      what_to_click_en: 'Click directly on the "Predictive Balance Alert" banner on the phone screen. The simulator unlocks and transitions into the "Cash Flow & Yield Optimizer" card with the microphone active in Gemini Live.',
      tech_stack_pt: 'Agente de Previsão de Fluxo de Caixa em background assíncrono (FastAPI) + Web AudioWorklet em standby para streaming de voz PCM 16kHz bidirecional.',
      tech_stack_en: 'Async background Cash Flow Forecast Agent (FastAPI) + AudioWorklet standby for bidirectional 16kHz PCM voice streaming.'
    },
    {
      act: 1,
      title_pt: 'Ato 1: Agente de Fluxo de Caixa & Resgate Automático CDB DI',
      title_en: 'Act 1: Cash Flow Agent & Automated CDB DI Sweep',
      step_pt: 'Ato 1',
      step_en: 'Act 1',
      what_to_say_pt: 'Roberto: "Olá Itaú Concierge, vi o alerta preventivo de saldo. Por que recebi esse aviso e o que vai acontecer com minhas contas semana que vem?"\n\nItaú Concierge: "Olá Sr. Silva. Disparei esse alerta preventivo porque seus débitos agendados para a próxima quinta-feira somam 38.000 reais — 3.850 reais do condomínio e 34.150 reais da fatura do Mastercard Black. Com seus gastos recentes de viagem, isso geraria um déficit de 13.050 reais entrando no cheque especial. Vejo que você possui 85.000 reais no CDB de Liquidez Diária. Gostaria que eu agendasse um resgate automático de 15.000 reais para a manhã de quinta-feira às 06:00? Dessa forma, seus recursos continuam rendendo 100% do CDI até o exato momento da liquidação."\n\nRoberto: "Sim, por favor, agende esse resgate para quinta de manhã."',
      what_to_say_en: 'Roberto: "Hey Itaú Concierge, I just saw the Predictive Balance Alert. Why did I receive this alert, and what\'s going to happen with my accounts next week?"\n\nItaú Concierge: "Hello Mr. Silva. I triggered this Predictive Balance Alert because your scheduled debits next Thursday total 38,000 reais—your 3,850 reais condominium Pix and your 34,150 reais Mastercard Black invoice. With upcoming expenses, this will cause a projected shortfall entering high-interest overdraft. I see you have 85,000 reais in your Daily Liquidity CDB. Would you like me to schedule an automatic sweep of 15,000 reais for Thursday morning? That way, your funds keep earning 100% of CDI until the exact moment of payment."\n\nRoberto: "Yes, please schedule that sweep for Thursday morning."',
      what_is_shown_pt: [
        'Card "Previsão de Saldo & Yield" com badge "Disparado por Alerta Preventivo".',
        'Métrica de Déficit Projetado D+4 de -R$ 13.050,00 após passagens para Lisboa e contas da quinta-feira.',
        'Estratégia de Rendimento: R$ 85.000,00 rendendo 100% do CDI até as 06:00 BRT.',
        'Confirmação visual instantânea: "Resgate CDB Agendado para Quinta (R$ 15.000,00 • LIS Zero)".'
      ],
      what_is_shown_en: [
        '"Cash Flow & Yield Optimizer" card with "Triggered by Predictive Balance Alert" badge.',
        'D+4 Projected Shortfall metric showing -R$ 13,050.00 following Lisbon flight purchase and Thursday debits.',
        'Yield Strategy status: R$ 85k earning 100% CDI until 06:00 BRT on payment morning.',
        'Immediate visual state update: "CDB Sweep Scheduled for Thursday (R$ 15,000.00 • LIS Zero)".'
      ],
      what_to_click_pt: 'Fale a pergunta do Roberto no microfone ou clique no prompt de voz "Por que recebi esse aviso?". Em seguida, confirme dizendo "Sim, agende o resgate".',
      what_to_click_en: 'Speak Roberto\'s prompt into the microphone or click "Why did I get this alert?". Then confirm by speaking "Yes, schedule that sweep".',
      tech_stack_pt: 'Gemini Live Multimodal Voice API (gemini-3.5-flash-live-preview) com tool calling autônomo da função sweep_cdb disparada em menos de 140ms.',
      tech_stack_en: 'Gemini Live Multimodal Voice API (gemini-3.5-flash-live-preview) with autonomous sweep_cdb tool call dispatched in under 140ms.'
    },
    {
      act: 2,
      title_pt: 'Ato 2: Consulta de Saldos (Apenas Itaú — Sem Vazamento de Open Finance)',
      title_en: 'Act 2: Wealth Overview & Balance Inquiry (Strictly Itaú Balances Only)',
      step_pt: 'Ato 2',
      step_en: 'Act 2',
      what_to_say_pt: 'Roberto: "Pode me mostrar meus saldos atuais?"\n\nItaú Concierge: "Sr. Silva, no Banco Itaú você possui atualmente 133.950 reais em ativos líquidos: 48.950 reais na conta corrente e 85.000 reais no CDB de Liquidez Diária a 100% do CDI. Se desejar, posso consultar seus dados no Open Finance para verificar se você está obtendo as melhores taxas do mercado."\n\n(Regra estrita de sigilo: zero dados externos de Open Finance são exibidos na tela ou sintetizados em áudio antes do consentimento explícito).',
      what_to_say_en: 'Roberto: "Can you show me my current balances?"\n\nItaú Concierge: "Mr. Silva, at Banco Itaú you currently have 133,950 reais in total liquid assets: 48,950 reais in your checking account, and 85,000 reais in your Daily Liquidity CDB earning 100% of CDI. I can also pull your Open Finance data if you would like to check if you are getting the best rates across the market."\n\n(Strict privacy rule: zero Open Finance data is displayed on screen or spoken aloud prior to explicit customer consent).',
      what_is_shown_pt: [
        'Card de Saldo da Conta Corrente Itaú Personnalité: R$ 48.950,20 disponível.',
        'Card de Investimentos CDB DI: R$ 85.000,00 rendendo 100% do CDI com liquidez diária 24/7.',
        'Patrimônio Líquido Itaú: R$ 133.950,20.',
        'Ausência estrita de dados de instituições terceiras na interface (conformidade com a LC 105/2001 de sigilo bancário).'
      ],
      what_is_shown_en: [
        'Itaú Personnalité Checking Balance Card: R$ 48,950.20 available balance.',
        'CDB DI Investment Card: R$ 85,000.00 earning 100% of CDI with daily 24/7 liquidity.',
        'Total Itaú Liquid Assets: R$ 133,950.20.',
        'Zero external financial institution data on screen (strict compliance with Brazilian Banking Secrecy LC 105/2001).'
      ],
      what_to_click_pt: 'Diga "Pode me mostrar meus saldos atuais?" ou clique no botão de ação rápida "Consultar Saldos".',
      what_to_click_en: 'Say "Can you show me my current balances?" or click the quick action "Check Balances".',
      tech_stack_pt: 'Subagente AccountInfoAgent (função get_account_info) consultando core bancário do Itaú em 90ms com isolamento estrito de sigilo bancário.',
      tech_stack_en: 'AccountInfoAgent (get_account_info function) querying core banking ledgers in 90ms with strict banking secrecy boundaries.'
    },
    {
      act: 3,
      title_pt: 'Ato 3: Conexão Open Finance & Seleção de Taxas (CDI vs Dívidas)',
      title_en: 'Act 3: Open Finance Connection & Category Selection',
      step_pt: 'Ato 3',
      step_en: 'Act 3',
      what_to_say_pt: 'Roberto: "Sim."\n\nItaú Concierge: "Conectando ao Open Finance... Você gostaria que eu verifique seus investimentos em CDI ou eventuais saldos devedores nas outras instituições?"',
      what_to_say_en: 'Roberto: "Yes."\n\nItaú Concierge: "Connecting to Open Finance... Would you like me to check any outstanding debt balances or your CDI balances through Open Finance?"',
      what_is_shown_pt: [
        'Card "OPEN FINANCE — ANÁLISE DE TAXAS" com selo verde "Conectado via Open Finance BACEN".',
        'Opção 1: "1. Saldos e Rendimentos CDI" com badge "Diga \'CDI\'" (análise de investimentos no BTG e XP).',
        'Opção 2: "2. Saldos Devedores e Crédito" com badge "Diga \'Dívidas\'" (análise de rotativo e empréstimos em concorrentes).'
      ],
      what_is_shown_en: [
        '"OPEN FINANCE — RATE ANALYSIS" card with green "Connected via BACEN Open Finance" trust badge.',
        'Category 1: "1. CDI Balances & Yield" with badge "Say \'CDI\'" (analyzes BTG Pactual and XP investments).',
        'Category 2: "2. Outstanding Debt Balances" with badge "Say \'Debt\'" (analyzes competitor revolving card debt).'
      ],
      what_to_click_pt: 'Diga "Sim" ao microfone para autorizar a consulta Open Finance e abrir o card com as opções de categoria.',
      what_to_click_en: 'Say "Yes" into the microphone to authorize Open Finance lookup and open the rate category selection card.',
      tech_stack_pt: 'Trilhos Open Finance Brasil com perfil de segurança FAPI 1.0 Advanced, mTLS mútuo e autorização OAuth 2.0 PKCE via subagente OpenFinanceOptimizer (pull_open_finance).',
      tech_stack_en: 'Open Finance Brasil rails under FAPI 1.0 Advanced security profile with mutual mTLS and OAuth 2.0 PKCE via OpenFinanceOptimizer (pull_open_finance).'
    },
    {
      act: 4,
      title_pt: 'Ato 4: Arbitragem de Taxa CDI (+15% de Spread / +R$ 5.940/ano)',
      title_en: 'Act 4: Rate Arbitrage Quote (+15% CDI Advantage)',
      step_pt: 'Ato 4',
      step_en: 'Act 4',
      what_to_say_pt: 'Roberto: "CDI"\n\nItaú Concierge: "Sr. Silva, através do Open Finance localizei 330.000 reais em ativos líquidos entre o BTG Pactual e a XP rendendo apenas 85% do CDI. Transferindo esses recursos para o seu CDB de Liquidez Diária do Itaú, você passa a render 100% do CDI — um ganho imediato de 15% de CDI, gerando 5.940 reais a mais por ano com liquidez diária garantida. Gostaria que eu realizasse essa portabilidade?"',
      what_to_say_en: 'Roberto: "CDI"\n\nItaú Concierge: "Mr. Silva, through Open Finance I found 330,000 reais in liquid assets across BTG Pactual and XP earning only 85% of CDI. By moving these funds to your Itaú Daily Liquidity CDB, you\'ll earn 100% of CDI—an immediate 15% CDI yield improvement, generating an additional 5,940 reais per year with daily liquidity. Would you like me to make that change?"',
      what_is_shown_pt: [
        'Card de Comparação de Rendimento CDI lado a lado.',
        'Visualização da concorrência: BTG Pactual (R$ 120k) + XP Investimentos (R$ 210k) = R$ 330.000,00 rendendo 85% do CDI.',
        'Destaque da proposta Itaú: 100% do CDI com ganho líquido anual de +R$ 5.940,00 (+15% de spread CDI).',
        'Botão interativo de portabilidade e chamada para ação por comando de voz.'
      ],
      what_is_shown_en: [
        'Side-by-side CDI Yield Comparison Card.',
        'External competitor breakdown: BTG Pactual (R$ 120k) + XP (R$ 210k) = R$ 330,000.00 yielding 85% CDI.',
        'Itaú proposal highlight: 100% CDI delivering +15% CDI yield spread (+R$ 5,940.00/yr net improvement).',
        'Interactive "Confirm Portability" button and voice call-to-action.'
      ],
      what_to_click_pt: 'Diga "CDI" no microfone ou clique diretamente no card "1. Saldos e Rendimentos CDI".',
      what_to_click_en: 'Say "CDI" into the microphone or click directly on "1. CDI Balances & Yield".',
      tech_stack_pt: 'Motor de precificação de spread CDI em tempo real (quote_open_finance_cdi) com agregação multissetorial e cálculo de rentabilidade composta anualizada.',
      tech_stack_en: 'Real-time CDI spread pricing engine (quote_open_finance_cdi) with multi-bank portfolio aggregation and annualized net compound yield projection.'
    },
    {
      act: 5,
      title_pt: 'Ato 5: Confirmação de Portabilidade & Execução por Voz (R$ 330k para o Itaú)',
      title_en: 'Act 5: One-Click Voice Execution & Transfer Confirmation',
      step_pt: 'Ato 5',
      step_en: 'Act 5',
      what_to_say_pt: 'Roberto: "Sim, pode fazer essa transferência."\n\nItaú Concierge: "Transferência confirmada, Sr. Silva! Iniciei a portabilidade de 330.000 reais das suas contas externas para o seu CDB DI Itaú a 100% do CDI. Seus recursos já começam a render com a taxa otimizada imediatamente, preservando a liquidez diária."\n\n(O patrimônio líquido no Itaú salta de R$ 133k para R$ 463k).',
      what_to_say_en: 'Roberto: "Ok, let\'s make that change." (or "I approve")\n\nItaú Concierge: "Transfer confirmed, Mr. Silva! I have initiated the transfer of 330,000 reais from your external accounts to your Itaú CDB DI at 100% CDI. Your funds will begin earning the higher rate immediately, keeping daily liquidity."',
      what_is_shown_pt: [
        'Card de Transferência Confirmada com selo de verificação verde.',
        'Valor transferido: R$ 330.000,00 aportados no CDB DI Itaú a 100% do CDI.',
        'Novo saldo líquido consolidado no Itaú: R$ 463.950,20 (R$ 48.950,20 em conta + R$ 415.000,00 em CDB DI).',
        'Feedback visual instantâneo e sincronização completa do saldo no Cockpit.'
      ],
      what_is_shown_en: [
        'Transfer Confirmed Card with green verified checkmark badge.',
        'Portability amount: R$ 330,000.00 allocated into Itaú CDB DI at 100% CDI.',
        'Elevated consolidated Itaú liquid wealth: R$ 463,950.20 (R$ 48,950.20 checking + R$ 415,000.00 CDB DI).',
        'Instant UI state confirmation and ledger balance synchronization.'
      ],
      what_to_click_pt: 'Diga "Sim, pode transferir" ou clique no botão "Confirmar Transferência".',
      what_to_click_en: 'Say "Ok, let\'s make that change" or click "Confirm Transfer".',
      tech_stack_pt: 'Barramento de liquidação CIP/STR do Banco Central com orquestração de mensageria assíncrona e atualização instantânea de saldo no Cockpit.',
      tech_stack_en: 'Central Bank CIP/STR interbank settlement messaging with asynchronous ledger orchestration and instantaneous cockpit UI state synchronization.'
    },
    {
      act: 6,
      title_pt: 'Ato 6: Aviso Viagem & Blindagem Internacional de POS (Portugal & Espanha)',
      title_en: 'Act 6: Travel Notice & International POS Shielding',
      step_pt: 'Ato 6',
      step_en: 'Act 6',
      what_to_say_pt: 'Roberto: "Obrigado! Agora sobre nossa viagem: vamos embarcar para Portugal e Espanha por duas semanas. Pode garantir que meu cartão Mastercard Black não seja bloqueado por suspeita de fraude na Europa?"\n\nItaú Concierge: "Tudo pronto, Sr. Silva! Ativei o Aviso Viagem para Portugal e Espanha no seu Mastercard Black, elevei seu limite diário de compras internacionais em POS para 50.000 reais e suprimi os bloqueios de falsos positivos em maquininhas no exterior. Gostaria de conhecer os benefícios do seu Mastercard Black para esta viagem?"',
      what_to_say_en: 'Roberto: "Thanks! Now about our upcoming trip: we are flying to Portugal and Spain for two weeks. Can you make sure my Mastercard Black doesn\'t get flagged or blocked while we are in Europe?"\n\nItaú Concierge: "All set, Mr. Silva! I have activated Travel Shield for Portugal and Spain on your Mastercard Black, raised your daily international POS limit to 50,000 reais, and suppressed false fraud declines at foreign terminals. Would you like to hear about your Mastercard Black travel benefits for the trip?"',
      what_is_shown_pt: [
        'Card "Aviso Viagem Ativado (Travel Shield)" na interface móvel.',
        'Destinos cadastrados: Portugal e Espanha (período de 14 dias).',
        'Limite internacional diário de compras em POS elevado para R$ 50.000,00.',
        'Selo verde de blindagem: "Supressão de falsos positivos de fraude em maquininhas europeias ativada".'
      ],
      what_is_shown_en: [
        '"Travel Shield Active" card rendered on the smartphone simulator.',
        'Registered flight destinations: Portugal & Spain (14-day duration).',
        'Daily international POS spending ceiling elevated to R$ 50,000.00.',
        'Green security badge: "Fraud decline suppression active across European merchant POS terminals".'
      ],
      what_to_click_pt: 'Diga "Vamos viajar para Portugal e Espanha, não bloqueie meu cartão" ou clique na ação de Aviso Viagem.',
      what_to_click_en: 'Say "We are flying to Portugal and Spain, don\'t block my card" or click "Activate Travel Shield".',
      tech_stack_pt: 'Subagente TravelShieldAgent (função activate_travel_mode) atualizando tabelas de autorização das redes Mastercard/Visa via mensageria ISO 8583 em 110ms.',
      tech_stack_en: 'TravelShieldAgent (activate_travel_mode function) updating Mastercard/Visa network authorizer rule tables via ISO 8583 messaging in 110ms.'
    },
    {
      act: 7,
      title_pt: 'Ato 7: Benefícios Mastercard Black, Sala VIP GRU & Certificado Schengen',
      title_en: 'Act 7: Mastercard Black Luxury Perks, VIP Lounges & Schengen Coverage',
      step_pt: 'Ato 7',
      step_en: 'Act 7',
      what_to_say_pt: 'Roberto: "Sim, com certeza. Quais benefícios eu tenho no cartão Black para essa viagem?"\n\nItaú Concierge: "Sr. Silva, para sua viagem à Europa você e seu acompanhante contam com: 1. Acesso gratuito e ilimitado à nossa Sala VIP Mastercard Black no Terminal 3 de Guarulhos. 2. 4 acessos LoungeKey cortesia para usufruir de salas VIP nos aeroportos de Lisboa e Madri. 3. Seguro médico de viagem internacional no valor de 30.000 euros em estrita conformidade com o Tratado de Schengen, emitido automaticamente. 4. Proteção de veículos Masterseguro com cobertura integral contra colisão e danos (CDW/LDW) caso alugue um carro."\n\nRoberto: "Perfeito. Tudo resolvido e otimizado. Muito obrigado, Itaú Concierge!"',
      what_to_say_en: 'Roberto: "Yes, absolutely. What benefits do I have on my Black card for this trip to Europe?"\n\nItaú Concierge: "Mr. Silva, for your European trip, you and your companion have: 1. Unlimited complimentary access to our dedicated Mastercard Black VIP Lounge at Guarulhos Terminal 3. 2. 4 complimentary worldwide LoungeKey passes to relax in VIP airport lounges across Lisbon and Madrid. 3. €30,000 in Schengen-compliant emergency medical travel insurance, satisfying all European entry requirements automatically. 4. Full Masterseguro vehicle protection with collision damage waiver if you decide to rent a car."\n\nRoberto: "Perfect. Everything is covered and optimized. Thank you, Itaú Concierge!"',
      what_is_shown_pt: [
        'Card de Benefícios de Luxo Mastercard Black (•••• 8841).',
        'Item 1: Sala VIP Mastercard Black GRU Terminal 3 (acesso ilimitado).',
        'Item 2: 4 passes LoungeKey disponíveis para Lisboa (LIS) e Madri (MAD).',
        'Item 3: Certificado de Seguro de Saúde Schengen (€30.000 de cobertura) pronto para download.',
        'Item 4: Proteção Masterseguro com cobertura de danos por colisão para locação de automóvel.'
      ],
      what_is_shown_en: [
        'Mastercard Black Luxury Perks Card (•••• 8841).',
        'Perk 1: Dedicated Mastercard Black VIP Lounge at GRU Terminal 3 (unlimited access).',
        'Perk 2: 4 complimentary worldwide LoungeKey passes ready for Lisbon (LIS) & Madrid (MAD).',
        'Perk 3: €30,000 Schengen Medical Travel Certificate issued and ready for border presentation.',
        'Perk 4: Masterseguro comprehensive rental vehicle collision & damage waiver (CDW/LDW).'
      ],
      what_to_click_pt: 'Diga "Sim, quais benefícios tenho?" ou clique no card "Benefícios do Cartão Black".',
      what_to_click_en: 'Say "Yes, absolutely. What benefits do I have?" or click "View Card Benefits".',
      tech_stack_pt: 'Subagente CardBenefitsAgent (função get_card_benefits) consultando base de benefícios premium e barramentos da Mastercard International em 85ms.',
      tech_stack_en: 'CardBenefitsAgent (get_card_benefits function) querying premium concierge entitlements and Mastercard International benefits gateway in 85ms.'
    }
  ];

  const acts = rawActs.map(act => ({
    ...act,
    title_pt: templatize(act.title_pt),
    title_en: templatize(act.title_en),
    what_to_say_pt: templatize(act.what_to_say_pt),
    what_to_say_en: templatize(act.what_to_say_en),
    what_is_shown_pt: act.what_is_shown_pt.map(s => templatize(s)),
    what_is_shown_en: act.what_is_shown_en.map(s => templatize(s)),
  }));

  const rawFullMarkdown = lang === 'pt' ? `# Roteiro Executivo de Demonstração & Arquitetura de Produção (Itaú Concierge)

---

## 1.1 O Que Este Projeto Resolve?

### O Problema Central do Cliente
O relacionamento bancário moderno sofre de um modelo reativo e fragmentado. Clientes de alta renda (Wealth/Personnalité) mantêm recursos distribuídos em diversas instituições financeiras sem tempo para monitorar taxas de juros, sofrem cobranças desnecessárias de cheque especial (LIS) por descasamento pontual de fluxo de caixa e enfrentam recusas constrangedoras de cartões durante viagens internacionais. O banco tradicional espera o problema acontecer para cobrar taxas punitivas, desgastando a confiança do cliente e perdendo ativos sob custódia.

### Por Que as Soluções Legadas Falham
- **Sistemas Silados & Desconectados**: Aplicativos tradicionais só enxergam saldos internos do banco e ignoram completamente oportunidades de arbitragem no Open Finance.
- **Alertas em Lote Atrasados**: Notificações por SMS e push chegam horas ou dias depois que a conta já entrou no cheque especial e as tarifas foram cobradas.
- **Avisos de Viagem Burocráticos**: Cadastrar aviso de viagem exige navegar por 5 menus ocultos no app ou ligar para SAC, levando a abandono e bloqueios indevidos no exterior.
- **Chatbots e Uras Rígidas**: Uras telefônicas e assistentes baseados em árvores rígidas são incapazes de realizar ações financeiras de múltiplos passos (resgates agendados, portabilidade e ajuste de regras de autorização).

### A Solução Google Cloud: Gemini Enterprise Agent Platform
A plataforma **Itaú Concierge** transforma o banco em um assistente autônomo, proativo e orientado por voz alimentado pelo **Gemini Live Multimodal** e **gemini-3.7-flash**:
1. **Alerta Preventivo de Saldo na Tela de Bloqueio**: Identifica antecipadamente descasamentos de fluxo de caixa (D+4) antes que débitos agendados ocorram.
2. **Resgate Programado CDB DI com Liquidez Diária**: Mantém recursos rendendo 100% do CDI até as 06:00 BRT do dia do vencimento, eliminando encargos de LIS.
3. **Consulta de Saldos com Sigilo Bancário Estrito**: Preserva o isolamento de dados patrimoniais e oferece proativamente a inspeção de mercado via Open Finance.
4. **Arbitragem de Taxa CDI via Open Finance Brasil (FAPI 1.0)**: Identifica R$ 330k rendendo apenas 85% do CDI em concorrentes e consolida no Itaú a 100% (+R$ 5.940/ano).
5. **Blindagem Internacional de POS (Travel Shield)**: Registra avisos de viagem em milissegundos via ISO 8583, eleva limite para R$ 50k e suprime recusas falsas.
6. **Entrega Autônoma de Benefícios Mastercard Black**: Emite apólice Schengen de €30.000, libera acessos LoungeKey e garante entrada na Sala VIP GRU Terminal 3.

### Impacto Quantificável & ROI de Negócio
- **100% de Prevenção de Cheque Especial**: LIS Zero com economia imediata de tarifas e juros moratórios.
- **+R$ 330.000,00 em Ativos Consolidados (AUM)**: Captação líquida conquistada de concorrentes via portabilidade em um comando de voz.
- **+R$ 5.940,00 / ano de Ganho Líquido para o Cliente**: Spread de +15% de CDI com liquidez diária 24/7.
- **0% de Recusas Falsas no Exterior**: Blindagem internacional de POS de até R$ 50.000 em Portugal e Espanha.
- **Latência de Voz Sub-500ms**: Processamento bidirecional em tempo real via Gemini Live Web Audio.

---

## Persona Sintética: Roberto Silva
- **Segmento**: Itaú Personnalité • Wealth Tier
- **Documento & Conta**: CPF 829.410.573-04 • Agência 0910 • Conta Corrente 48291-0
- **Patrimônio Líquido Consolidado**: R$ 463.950,20 (Itaú: R$ 133.950,20 • BTG: R$ 120.000,00 • XP: R$ 210.000,00)
- **Débitos Agendados**: R$ 38.000,00 (Condomínio R$ 3.850 + Fatura Mastercard Black R$ 34.150)
- **Déficit Projetado D+4**: -R$ 13.050,00 (Passagens aéreas para Lisboa + contas de quinta-feira)
- **Cartão de Crédito**: Itaú Personnalité Mastercard Black (•••• 8841)
- **Destino de Viagem**: Portugal e Espanha (14 dias de duração)

---

## Roteiro de Demonstração em 8 Atos
- **Ato 0**: Tela de Bloqueio & Alerta Preventivo de Saldo (O Disparo Proativo)
- **Ato 1**: Agente de Fluxo de Caixa & Resgate Automático CDB DI (R$ 15k às 06:00 BRT)
- **Ato 2**: Consulta de Saldos (Apenas Itaú — Sem Vazamento de Open Finance)
- **Ato 3**: Conexão Open Finance & Seleção de Taxas (CDI vs Dívidas)
- **Ato 4**: Arbitragem de Taxa CDI (+15% de Spread / +R$ 5.940/ano)
- **Ato 5**: Confirmação de Portabilidade & Execução por Voz (R$ 330k para o Itaú)
- **Ato 6**: Aviso Viagem & Blindagem Internacional de POS (Portugal & Espanha • R$ 50k)
- **Ato 7**: Benefícios Mastercard Black, Sala VIP GRU & Certificado Schengen

---

## Topologia de Produção no Google Cloud Platform
- **Google Cloud Run**: Microsserviços assíncronos FastAPI e SPA React 19 com auto-scaling até zero em São Paulo (southamerica-east1).
- **Gemini Live Multimodal Voice API (gemini-3.5-flash-live-preview)**: Streaming de áudio PCM 16kHz bidirecional com tool calling nativo sub-segundo.
- **Gemini 3.7 Flash**: Raciocínio financeiro avançado, validação rigorosa de esquemas JSON e explicabilidade de decisões.
- **Cloud Armor WAF + Identity-Aware Proxy (IAP)**: Proteção contra DDoS e validação criptográfica de tokens JWT ES256.
- **Google Secret Manager & Cloud KMS**: Custódia de certificados mTLS do Open Finance e chaves de segurança.
- **Barramentos do SFN**: Open Finance Brasil FAPI 1.0 Advanced, barramento CIP/STR, BACEN MED e redes autorizadoras Mastercard/Visa.` : `# Executive Demo Script & Production Architecture (Itaú Concierge)

---

## 1.1 What Problem Does This Solve?

### The Core Customer Problem
Modern relationship banking has long been plagued by a reactive, fragmented service model. High-net-worth customers hold capital scattered across competing brokers and fintechs without time to monitor yield spreads, incur unnecessary high-interest overdraft fees (LIS) due to timing mismatches in scheduled debits, and face embarrassing card declines while traveling overseas. Traditional banks wait for overdrafts to trigger punitive charges, eroding customer trust and losing assets under management (AUM).

### Why Legacy Solutions Fail
- **Siloed & Disconnected Systems**: Traditional banking apps only see internal balances and have zero awareness of external Open Finance opportunities or competitor yield arbitrage.
- **Delayed Batch Notifications**: SMS and push alerts arrive hours or days after an account is already negative, when overdraft fees have already applied.
- **Buried Travel Notices**: Notifying a bank about foreign travel requires navigating 5 hidden menus or calling an IVR call center, leading to abandoned notices and false POS fraud declines.
- **Clunky Chatbots & Rigid Voice Trees**: Legacy IVRs and brittle rule-based chatbots cannot execute multi-step financial actions (sweeping CDB, Open Finance portability, card authorizer adjustments) via natural conversation.

### The Google Cloud Solution: Gemini Enterprise Agent Platform
The **Itaú Concierge** platform transforms relationship banking into an autonomous, proactive, voice-first intelligence system powered by **Gemini Live Multimodal** and **gemini-3.7-flash**:
1. **Lock Screen Predictive Balance Alert**: Forecasts cash flow shortfalls (D+4) before scheduled debits trigger overdraft fees.
2. **Automated CDB DI Sweeping**: Keeps capital compounding at 100% of CDI until 06:00 BRT of payment morning, eliminating overdraft while maximizing interest.
3. **Strictly Guardrailed Balance Inquiries**: Preserves domestic banking secrecy boundaries, proactively offering Open Finance rate comparisons upon consent.
4. **Open Finance CDI Yield Optimization (FAPI 1.0)**: Identifies R$ 330k earning sub-optimal 85% CDI at competitors, moving funds to Itaú 100% CDI (+R$ 5,940/yr).
5. **International Travel Shield (ISO 8583)**: Registers destination notices in milliseconds, raises POS limits to R$ 50k, and suppresses false fraud blocks across foreign terminals.
6. **Autonomous Mastercard Black Luxury Perks**: Instantly issues €30,000 Schengen travel certificates, unlocks 4 LoungeKey passes, and guarantees GRU Terminal 3 VIP Lounge access.

### Quantifiable Business Impact & ROI
- **100% Overdraft Avoidance**: Zero overdraft (LIS) charges or punitive interest fees.
- **+R$ 330,000.00 in Consolidated AUM**: High-velocity wallet-share capture executed through a single voice command.
- **+R$ 5,940.00 / yr Client Net Yield Spread**: +15% CDI yield advantage with 24/7 daily liquidity.
- **0% False Declines Abroad**: International POS shielding up to R$ 50,000 across Portugal and Spain.
- **Sub-500ms Voice Latency**: Real-time bidirectional voice conversation via Gemini Live Web Audio.

---

## Featured Synthetic Persona: Roberto Silva
- **Segment**: Itaú Personnalité • Wealth Tier
- **Document & Account**: CPF 829.410.573-04 • Branch 0910 • Account 48291-0
- **Total Consolidated Net Worth**: R$ 463,950.20 (Itaú: R$ 133,950.20 • BTG: R$ 120,000.00 • XP: R$ 210,000.00)
- **Scheduled Debits**: R$ 38,000.00 (Condominium R$ 3,850 + Mastercard Black Invoice R$ 34,150)
- **Projected D+4 Shortfall**: -R$ 13,050.00 (Lisbon flight bookings + Thursday scheduled debits)
- **Credit Card**: Itaú Personnalité Mastercard Black (•••• 8841)
- **Travel Destination**: Portugal & Spain (14 days)

---

## 8-Act Stage Walkthrough
- **Act 0**: Lock Screen Start & Proactive Trigger (The Paradigm Shift)
- **Act 1**: Cash Flow Agent & Automated CDB DI Sweep (R$ 15k at 06:00 BRT)
- **Act 2**: Wealth Overview & Balance Inquiry (Strictly Itaú Balances Only)
- **Act 3**: Open Finance Connection & Category Selection (CDI vs Debt)
- **Act 4**: Rate Arbitrage Quote (+15% CDI Advantage / +R$ 5,940/yr)
- **Act 5**: One-Click Voice Execution & Transfer Confirmation (R$ 330k to Itaú)
- **Act 6**: Travel Notice & International POS Shielding (Portugal & Spain • R$ 50k)
- **Act 7**: Mastercard Black Luxury Perks, VIP Lounges & Schengen Coverage

---

## Google Cloud Platform Production Architecture
- **Google Cloud Run**: Serverless FastAPI async microservices and React 19 SPA with automatic scale-to-zero in São Paulo (southamerica-east1).
- **Gemini Live Multimodal Voice API (gemini-3.5-flash-live-preview)**: Bidirectional 16kHz PCM audio streaming with native sub-second tool calling.
- **Gemini 3.7 Flash**: Advanced analytical reasoning, strict JSON schema validation, and decision explainability.
- **Cloud Armor WAF + Identity-Aware Proxy (IAP)**: Enterprise DDoS mitigation and cryptographic verification of Google ES256 JWT assertions.
- **Google Secret Manager & Cloud KMS**: Hardware-backed custody of Open Finance mTLS certificates and security keys.
- **Brazilian Financial Rails**: Open Finance Brasil FAPI 1.0 Advanced, Central Bank CIP/STR rails, BACEN MED, and Mastercard/Visa authorizer network.`;

  const fullMarkdown = templatize(rawFullMarkdown);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      {/* Expanded Modal Canvas: max-w-6xl and max-h-[94vh] for executive readability */}
      <div className="w-full max-w-6xl max-h-[94vh] bg-[#0c0c0c] text-white rounded-[8px] border border-white/20 shadow-2xl flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-white/15 flex items-center justify-between bg-[#111111]">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-[6px] bg-white text-slate-950 shadow-sm shrink-0">
              <Terminal className="size-6 sm:size-7" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-white bg-white/15 px-2.5 py-1 rounded-[4px]">
                  Executive Demo Guide
                </span>
                <span className="text-xs font-mono text-[#798B97]">v3.0 • C-Suite / CRO / CTO</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/20">
                  gemini-live-audio
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
                {lang === 'pt' ? 'Roteiro de Demonstração & Stack de Produção' : 'Executive Demo Script & Production Tech Stack'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="/demo_script.html"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-[4px] bg-white/5 hover:bg-white/10 text-xs font-mono text-white/85 hover:text-white border border-white/15 transition-all cursor-pointer"
              title="Open standalone HTML demo script"
            >
              <ExternalLink className="size-3.5 text-white" />
              <span>Demo Script (HTML)</span>
            </a>

            <a
              href="/brand_kit.html"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-[4px] bg-white/5 hover:bg-white/10 text-xs font-mono text-white/85 hover:text-white border border-white/15 transition-all cursor-pointer"
              title="Open Brand Kit HTML specification"
            >
              <ExternalLink className="size-3.5 text-white" />
              <span>Brand Kit (HTML)</span>
            </a>

            <button
              onClick={() => copyToClipboard(fullMarkdown)}
              className="px-3.5 py-2 rounded-[4px] bg-white/5 hover:bg-white/10 text-xs font-mono text-white/90 border border-white/15 flex items-center gap-2 transition-all cursor-pointer"
            >
              {copied ? <Check className="size-4 text-emerald-400" /> : <Copy className="size-4 text-white" />}
              <span>{copied ? (lang === 'pt' ? 'Copiado!' : 'Copied!') : (lang === 'pt' ? 'Copiar Roteiro' : 'Copy Script')}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-[4px] hover:bg-white/10 text-white/70 hover:text-white transition-all cursor-pointer"
              title={lang === 'pt' ? 'Fechar Modal' : 'Close Modal'}
            >
              <X className="size-6" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 bg-black/40 px-6 gap-2 sm:gap-3 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3.5 px-3 sm:px-4 text-xs sm:text-sm font-mono font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'overview' 
                ? 'border-white text-white' 
                : 'border-transparent text-[#798B97] hover:text-white'
            }`}
          >
            <TrendingUp className="size-4 sm:size-4.5" />
            <span>{lang === 'pt' ? '1.1 Problema & ROI' : '1.1 Problem & ROI'}</span>
          </button>

          <button
            onClick={() => setActiveTab('walkthrough')}
            className={`py-3.5 px-3 sm:px-4 text-xs sm:text-sm font-mono font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'walkthrough' 
                ? 'border-white text-white' 
                : 'border-transparent text-[#798B97] hover:text-white'
            }`}
          >
            <PlayCircle className="size-4 sm:size-4.5" />
            <span>{lang === 'pt' ? 'Roteiro dos 8 Atos' : '8-Act Stage Walkthrough'}</span>
          </button>

          <button
            onClick={() => setActiveTab('architecture')}
            className={`py-3.5 px-3 sm:px-4 text-xs sm:text-sm font-mono font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'architecture' 
                ? 'border-white text-white' 
                : 'border-transparent text-[#798B97] hover:text-white'
            }`}
          >
            <Server className="size-4 sm:size-4.5" />
            <span>{lang === 'pt' ? 'Arquitetura GCP & SFN' : 'GCP & SFN Tech Stack'}</span>
          </button>

          <button
            onClick={() => setActiveTab('persona')}
            className={`py-3.5 px-3 sm:px-4 text-xs sm:text-sm font-mono font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'persona' 
                ? 'border-white text-white' 
                : 'border-transparent text-[#798B97] hover:text-white'
            }`}
          >
            <UserCheck className="size-4 sm:size-4.5" />
            <span>{lang === 'pt' ? 'Roberto Silva (Cenário)' : 'Roberto Silva (Persona)'}</span>
          </button>

          <button
            onClick={() => setActiveTab('markdown')}
            className={`py-3.5 px-3 sm:px-4 text-xs sm:text-sm font-mono font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'markdown' 
                ? 'border-white text-white' 
                : 'border-transparent text-[#798B97] hover:text-white'
            }`}
          >
            <FileText className="size-4 sm:size-4.5" />
            <span>{lang === 'pt' ? 'Documento DEMO_SCRIPT.md' : 'DEMO_SCRIPT.md Doc'}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto max-h-[calc(94vh-160px)] flex flex-col gap-6">
          
          {/* TAB: 1.1 PROBLEM & ROI */}
          {activeTab === 'overview' && (
            <div className="flex flex-col gap-6">
              
              {/* ROI Metrics Top Bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono">
                <div className="p-4 rounded-[6px] bg-white/5 border border-white/10 flex flex-col gap-1 shadow-sm">
                  <span className="text-[11px] text-[#798B97] uppercase flex items-center gap-1.5">
                    <Clock className="size-3.5 text-white" />
                    {lang === 'pt' ? 'Prevenção de Cheque Especial' : 'Overdraft Avoidance'}
                  </span>
                  <strong className="text-xl sm:text-2xl text-emerald-400 font-bold tracking-tight">
                    {lang === 'pt' ? '100% Evitado' : '100% Avoided'}
                  </strong>
                  <span className="text-[11px] text-emerald-300/80 font-sans">
                    {lang === 'pt' ? 'LIS Zero • Economia de R$ 184,60' : 'LIS Zero • Saves R$ 184.60 + 8% fee'}
                  </span>
                </div>

                <div className="p-4 rounded-[6px] bg-white/5 border border-white/10 flex flex-col gap-1 shadow-sm">
                  <span className="text-[11px] text-[#798B97] uppercase flex items-center gap-1.5">
                    <Coins className="size-3.5 text-emerald-400" />
                    {lang === 'pt' ? 'Consolidação de Ativos (AUM)' : 'Asset Consolidation (AUM)'}
                  </span>
                  <strong className="text-xl sm:text-2xl text-white font-bold tracking-tight">
                    +R$ 330.000,00
                  </strong>
                  <span className="text-[11px] text-[#798B97] font-sans">
                    {lang === 'pt' ? 'Capturados de BTG e XP a 100% CDI' : 'Moved from BTG & XP to Itaú 100% CDI'}
                  </span>
                </div>

                <div className="p-4 rounded-[6px] bg-white/5 border border-white/10 flex flex-col gap-1 shadow-sm">
                  <span className="text-[11px] text-[#798B97] uppercase flex items-center gap-1.5">
                    <Scale className="size-3.5 text-blue-400" />
                    {lang === 'pt' ? 'Ganho de Rentabilidade Cliente' : 'Client Yield Spread'}
                  </span>
                  <strong className="text-xl sm:text-2xl text-blue-400 font-bold tracking-tight">
                    +R$ 5.940,00 / ano
                  </strong>
                  <span className="text-[11px] text-[#798B97] font-sans">
                    {lang === 'pt' ? '+15% spread CDI com liquidez diária' : '+15% CDI spread with daily liquidity'}
                  </span>
                </div>

                <div className="p-4 rounded-[6px] bg-white/5 border border-white/10 flex flex-col gap-1 shadow-sm">
                  <span className="text-[11px] text-[#798B97] uppercase flex items-center gap-1.5">
                    <Cpu className="size-3.5 text-purple-400" />
                    {lang === 'pt' ? 'Blindagem Internacional POS' : 'POS Travel Shield'}
                  </span>
                  <strong className="text-xl sm:text-2xl text-purple-400 font-bold tracking-tight">
                    {lang === 'pt' ? '0% Recusas Falsas' : '0% False Declines'}
                  </strong>
                  <span className="text-[11px] text-[#798B97] font-sans">
                    {lang === 'pt' ? 'R$ 50k limite em Portugal & Espanha' : 'R$ 50k limit in Portugal & Spain'}
                  </span>
                </div>
              </div>

              {/* Section 1.1 Core Problem & Legacy Failures */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Core Customer Problem */}
                <div className="p-5 rounded-[8px] bg-white/5 border border-white/10 flex flex-col gap-3 shadow-md">
                  <div className="flex items-center gap-2.5 text-sm sm:text-base font-bold text-white uppercase font-mono border-b border-white/10 pb-2">
                    <AlertCircle className="size-5 text-white" />
                    <span>{lang === 'pt' ? 'O Problema Central do Cliente' : 'The Core Customer Problem'}</span>
                  </div>
                  <p className="text-sm text-neutral-300 leading-relaxed font-sans">
                    {lang === 'pt' 
                      ? 'O relacionamento bancário moderno sofre de um modelo reativo e fragmentado. Clientes de alta renda (Wealth/Personnalité) mantêm recursos distribuídos em diversas instituições financeiras sem tempo para monitorar taxas de juros, sofrem cobranças desnecessárias de cheque especial (LIS) por descasamento pontual de fluxo de caixa e enfrentam recusas constrangedoras de cartões durante viagens internacionais. O banco tradicional espera o problema acontecer para cobrar taxas punitivas, desgastando a confiança do cliente e perdendo ativos sob custódia.'
                      : 'Modern relationship banking has long been plagued by a reactive, fragmented service model. High-net-worth customers hold capital scattered across competing brokers and fintechs without time to monitor yield spreads, incur unnecessary high-interest overdraft fees (LIS) due to timing mismatches in scheduled debits, and face embarrassing card declines while traveling overseas. Traditional banks wait for overdrafts to trigger punitive charges, eroding customer trust and losing assets under management (AUM).'}
                  </p>
                </div>

                {/* Why Legacy Solutions Fail */}
                <div className="p-5 rounded-[8px] bg-white/5 border border-white/10 flex flex-col gap-3 shadow-md">
                  <div className="flex items-center gap-2.5 text-sm sm:text-base font-bold text-white uppercase font-mono border-b border-white/10 pb-2">
                    <X className="size-5 text-red-400" />
                    <span>{lang === 'pt' ? 'Por Que as Soluções Legadas Falham' : 'Why Legacy Solutions Fail'}</span>
                  </div>
                  <ul className="space-y-2 text-xs sm:text-sm text-neutral-300 font-sans leading-relaxed">
                    <li className="flex items-start gap-2">
                      <span className="text-red-400 font-bold">•</span>
                      <span><strong>{lang === 'pt' ? 'Sistemas Silados:' : 'Siloed Systems:'}</strong> {lang === 'pt' ? 'Aplicativos bancários só enxergam saldos internos e ignoram oportunidades de arbitragem no Open Finance.' : 'Banking apps only see internal balances and ignore external Open Finance rate arbitrage.'}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-400 font-bold">•</span>
                      <span><strong>{lang === 'pt' ? 'Alertas em Lote Atrasados:' : 'Delayed Batch Notifications:'}</strong> {lang === 'pt' ? 'Notificações chegam horas ou dias depois que a conta já entrou no cheque especial e taxas foram cobradas.' : 'SMS and push alerts arrive hours or days after overdraft occurs, when fees have already triggered.'}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-400 font-bold">•</span>
                      <span><strong>{lang === 'pt' ? 'Avisos de Viagem Burocráticos:' : 'Buried Travel Notices:'}</strong> {lang === 'pt' ? 'Exigem navegar por múltiplos menus no app ou ligar para SAC, gerando falsos bloqueios no exterior.' : 'Requires navigating 5 hidden app menus or calling call centers, causing false card declines abroad.'}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-400 font-bold">•</span>
                      <span><strong>{lang === 'pt' ? 'Chatbots Rígidos e Uras:' : 'Rigid Chatbots & IVRs:'}</strong> {lang === 'pt' ? 'Incapazes de executar ações financeiras de múltiplos passos com autonomia e fluidez de voz.' : 'Cannot execute multi-step financial actions (sweeps, portability, authorizer rules) autonomously.'}</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* The Google Cloud Solution */}
              <div className="p-5 sm:p-6 rounded-[8px] bg-white/5 border border-white/15 flex flex-col gap-4 shadow-lg">
                <div className="flex items-center gap-2.5 text-base sm:text-lg font-bold text-white uppercase font-mono border-b border-white/10 pb-2.5">
                  <Sparkles className="size-5 text-emerald-400" />
                  <span>{lang === 'pt' ? 'A Solução Google Cloud: Gemini Enterprise Agent Platform' : 'The Google Cloud Solution: Gemini Enterprise Agent Platform'}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 text-xs sm:text-sm font-sans">
                  <div className="p-3.5 rounded-[6px] bg-black/40 border border-white/10">
                    <strong className="text-white block font-mono text-sm mb-1">1. Gemini Live Web Audio</strong>
                    <span className="text-neutral-300 leading-relaxed">
                      {lang === 'pt' 
                        ? 'Voz bidirecional em tempo real com streaming PCM 16kHz e latência de resposta inferior a 500ms.' 
                        : 'Bidirectional real-time voice streaming with 16kHz PCM downsampling and sub-500ms voice turn latency.'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-[6px] bg-black/40 border border-white/10">
                    <strong className="text-white block font-mono text-sm mb-1">{lang === 'pt' ? '2. Alerta Preventivo de Saldo' : '2. Predictive Balance Alert'}</strong>
                    <span className="text-neutral-300 leading-relaxed">
                      {lang === 'pt' 
                        ? 'Monitoramento contínuo de fluxo de caixa projetando descasamentos em D+4 diretamente na tela de bloqueio.' 
                        : 'Continuous cash flow monitoring forecasting shortfalls (D+4) pushed directly to the lock screen.'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-[6px] bg-black/40 border border-white/10">
                    <strong className="text-white block font-mono text-sm mb-1">{lang === 'pt' ? '3. Resgate Automático CDB DI' : '3. Automated CDB DI Sweep'}</strong>
                    <span className="text-neutral-300 leading-relaxed">
                      {lang === 'pt' 
                        ? 'Mantém recursos rendendo 100% do CDI até as 06:00 BRT do dia do vencimento, eliminando o cheque especial.' 
                        : 'Keeps funds compounding at 100% CDI until 06:00 BRT on payment morning, eliminating overdraft fees.'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-[6px] bg-black/40 border border-white/10">
                    <strong className="text-white block font-mono text-sm mb-1">{lang === 'pt' ? '4. Open Finance Brasil (FAPI 1.0)' : '4. Open Finance Yield Arbitrage'}</strong>
                    <span className="text-neutral-300 leading-relaxed">
                      {lang === 'pt' 
                        ? 'Identifica R$ 330k rendendo apenas 85% do CDI e executa portabilidade em um comando de voz (+R$ 5.940/ano).' 
                        : 'Identifies R$ 330k earning 85% CDI at competitors and moves it to Itaú 100% CDI with one voice command.'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-[6px] bg-black/40 border border-white/10">
                    <strong className="text-white block font-mono text-sm mb-1">{lang === 'pt' ? '5. Travel Shield Internacional' : '5. POS Travel Shield (ISO 8583)'}</strong>
                    <span className="text-neutral-300 leading-relaxed">
                      {lang === 'pt' 
                        ? 'Atualiza regras autorizadoras Mastercard/Visa, eleva limite POS para R$ 50k e suprime recusas falsas.' 
                        : 'Updates Mastercard/Visa authorizer tables, elevates POS limit to R$ 50k, and suppresses false declines.'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-[6px] bg-black/40 border border-white/10">
                    <strong className="text-white block font-mono text-sm mb-1">{lang === 'pt' ? '6. Mastercard Black Concierge' : '6. Mastercard Black Perks'}</strong>
                    <span className="text-neutral-300 leading-relaxed">
                      {lang === 'pt' 
                        ? 'Emissão automática de apólice Schengen (€30k), liberação de 4 LoungeKey e acesso Sala VIP GRU Terminal 3.' 
                        : 'Automated €30k Schengen policy issuance, 4 LoungeKey passes, and GRU Terminal 3 VIP Lounge access.'}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB: 8-ACT STAGE WALKTHROUGH */}
          {activeTab === 'walkthrough' && (
            <div className="flex flex-col gap-6">
              
              {/* Acts Horizontal Picker */}
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {acts.map((a) => (
                  <button
                    key={a.act}
                    onClick={() => setSelectedAct(a.act)}
                    className={`py-2.5 px-2 rounded-[4px] text-center border text-xs sm:text-sm font-mono font-bold transition-all cursor-pointer ${
                      selectedAct === a.act
                        ? 'bg-white text-slate-950 border-white font-bold shadow-xs'
                        : 'bg-white/5 border-white/10 text-[#798B97] hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {lang === 'pt' ? `Ato ${a.act}` : `Act ${a.act}`}
                  </button>
                ))}
              </div>

              {/* Selected Act Card */}
              {(() => {
                const current = acts[selectedAct];
                return (
                  <div className="p-6 sm:p-7 rounded-[8px] bg-white/5 border border-white/15 flex flex-col gap-5 shadow-lg">
                    
                    {/* Act Title & Step Badge */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-4 gap-3">
                      <div className="flex items-center gap-3">
                        <span className="p-1.5 px-3 rounded-[4px] bg-white/20 text-white text-xs sm:text-sm font-mono font-bold">
                          {lang === 'pt' ? current.step_pt : current.step_en}
                        </span>
                        <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                          {lang === 'pt' ? current.title_pt : current.title_en}
                        </h3>
                      </div>
                      <span className="text-xs sm:text-sm font-mono text-[#798B97]">
                        {lang === 'pt' ? `Ato ${current.act} de 7` : `Act ${current.act} of 7`}
                      </span>
                    </div>

                    {/* Section 1: What to Say (Verbal Cue) */}
                    <div className="flex flex-col gap-2">
                      <span className="text-xs sm:text-sm font-bold font-mono text-white uppercase tracking-wider flex items-center gap-2">
                        <Sparkles className="size-4 text-brand-orange" />
                        {lang === 'pt' ? 'O Que Falar para a Audiência (Pitch Verbal):' : 'What to Say (Verbal Pitch):'}
                      </span>
                      <blockquote className="p-4 sm:p-5 rounded-[6px] bg-black/60 border-l-4 border-white text-sm sm:text-base md:text-[15px] leading-relaxed text-neutral-100 font-serif italic shadow-inner whitespace-pre-line">
                        "{lang === 'pt' ? current.what_to_say_pt : current.what_to_say_en}"
                      </blockquote>
                    </div>

                    {/* Section 2: What is Shown in the Demo (Screen Breakdown) */}
                    <div className="flex flex-col gap-2">
                      <span className="text-xs sm:text-sm font-bold font-mono text-amber-400 uppercase tracking-wider flex items-center gap-2">
                        <CheckCircle2 className="size-4" />
                        {lang === 'pt' ? 'O Que é Apresentado na Tela (Interface da Demo):' : 'What is Shown in the Demo (Screen Layout):'}
                      </span>
                      <div className="p-4 rounded-[6px] bg-amber-500/10 border border-amber-500/25 flex flex-col gap-2">
                        <ul className="space-y-2 text-xs sm:text-sm text-neutral-200 font-sans leading-relaxed">
                          {(lang === 'pt' ? current.what_is_shown_pt : current.what_is_shown_en).map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2.5">
                              <span className="text-white font-bold mt-0.5">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Section 3: What to Click (Stage Action) */}
                    <div className="flex flex-col gap-2">
                      <span className="text-xs sm:text-sm font-bold font-mono text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                        <PlayCircle className="size-4" />
                        {lang === 'pt' ? 'Ação do Apresentador (O Que Clicar na Demo):' : 'Stage Action (What to Click):'}
                      </span>
                      <div className="p-4 rounded-[6px] bg-emerald-500/10 border border-emerald-500/25 text-xs sm:text-sm md:text-base text-emerald-300 font-mono leading-relaxed">
                        {lang === 'pt' ? current.what_to_click_pt : current.what_to_click_en}
                      </div>
                    </div>

                    {/* Section 4: Production Blueprint Highlight */}
                    <div className="flex flex-col gap-2">
                      <span className="text-xs sm:text-sm font-bold font-mono text-blue-400 uppercase tracking-wider flex items-center gap-2">
                        <Cpu className="size-4" />
                        {lang === 'pt' ? 'Blueprint de Arquitetura de Produção:' : 'Production Implementation Blueprint:'}
                      </span>
                      <div className="p-4 rounded-[6px] bg-blue-500/10 border border-blue-500/25 text-xs sm:text-sm md:text-base text-blue-200 font-mono leading-relaxed">
                        {lang === 'pt' ? current.tech_stack_pt : current.tech_stack_en}
                      </div>
                    </div>

                    {/* Footer Nav inside Card */}
                    <div className="flex justify-between pt-3 border-t border-white/10 mt-1">
                      <button
                        onClick={() => setSelectedAct(Math.max(0, selectedAct - 1))}
                        disabled={selectedAct === 0}
                        className="px-4 py-2.5 rounded-[4px] bg-white/10 hover:bg-white/15 text-xs sm:text-sm font-bold text-white/80 disabled:opacity-30 cursor-pointer transition-all"
                      >
                        {lang === 'pt' ? '← Ato Anterior' : '← Previous Act'}
                      </button>
                      <button
                        onClick={() => setSelectedAct(Math.min(acts.length - 1, selectedAct + 1))}
                        disabled={selectedAct === acts.length - 1}
                        className="btn-itau px-5 py-2.5 text-xs sm:text-sm font-bold disabled:opacity-30 cursor-pointer transition-all shadow-md"
                      >
                        {lang === 'pt' ? 'Próximo Ato →' : 'Next Act →'}
                      </button>
                    </div>
                  </div>
                );
              })()}

            </div>
          )}

          {/* TAB: PRODUCTION ARCHITECTURE */}
          {activeTab === 'architecture' && (
            <div className="flex flex-col gap-6">
              <div className="p-5 rounded-[8px] bg-white/5 border border-white/10 flex flex-col gap-2">
                <span className="text-sm font-bold font-mono uppercase tracking-wider text-white">
                  {lang === 'pt' ? 'Topologia de Produção no Google Cloud Platform' : 'Google Cloud Platform Production Topology'}
                </span>
                <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
                  {lang === 'pt' 
                    ? 'Arquitetura corporativa multi-região projetada para alta disponibilidade (99.99%), conformidade com a Resolução CMN nº 4.893/2021 (Segurança Cibernética) e residência de dados no Brasil (southamerica-east1).'
                    : 'Enterprise multi-region architecture engineered for 99.99% availability, CMN Res. 4,893/2021 cybersecurity compliance, and data residency in Brazil (southamerica-east1).'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* GCP Security & Identity */}
                <div className="p-5 rounded-[8px] bg-white/5 border border-white/10 flex flex-col gap-3.5 shadow-sm">
                  <div className="flex items-center gap-2.5 text-sm sm:text-base font-bold text-white uppercase font-mono border-b border-white/10 pb-2">
                    <ShieldCheck className="size-5 text-emerald-400" />
                    <span>{lang === 'pt' ? 'Segurança & Identidade Zero-Trust' : 'Zero-Trust Security & Identity'}</span>
                  </div>
                  <ul className="space-y-2.5 text-xs sm:text-sm text-neutral-300 font-mono leading-relaxed">
                    <li className="flex items-start gap-2.5">
                      <span className="text-white font-bold">•</span>
                      <span>
                        <strong className="text-white">Cloud Armor:</strong> {lang === 'pt' ? 'WAF corporativo, mitigação anti-DDoS e inspeção de requisições.' : 'Managed enterprise WAF, DDoS mitigation, and request inspection.'}
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-white font-bold">•</span>
                      <span>
                        <strong className="text-white">Identity-Aware Proxy (IAP):</strong> {lang === 'pt' ? 'Validação criptográfica de tokens JWT Google ES256 para controle de acesso corporativo.' : 'Cryptographic verification of Google ES256 JWT assertions for zero-trust perimeter access.'}
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-white font-bold">•</span>
                      <span>
                        <strong className="text-white">Secret Manager:</strong> {lang === 'pt' ? 'Custódia em hardware (HSM) de certificados mTLS do Open Finance e chaves Gemini.' : 'Hardware-backed (HSM) custody of Open Finance mTLS certificates and Gemini API keys.'}
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-white font-bold">•</span>
                      <span>
                        <strong className="text-white">Cloud KMS (CMEK):</strong> {lang === 'pt' ? 'Chaves criptográficas gerenciadas pelo cliente para custódia de dados bancários sensíveis.' : 'Customer-Managed Encryption Keys (CMEK) for sensitive audit records and transactional state.'}
                      </span>
                    </li>
                  </ul>
                </div>

                {/* AI & Agentic Platform */}
                <div className="p-5 rounded-[8px] bg-white/5 border border-white/10 flex flex-col gap-3.5 shadow-sm">
                  <div className="flex items-center gap-2.5 text-sm sm:text-base font-bold text-white uppercase font-mono border-b border-white/10 pb-2">
                    <Cpu className="size-5 text-white" />
                    <span>Gemini Enterprise Agent Platform</span>
                  </div>
                  <ul className="space-y-2.5 text-xs sm:text-sm text-neutral-300 font-mono leading-relaxed">
                    <li className="flex items-start gap-2.5">
                      <span className="text-white font-bold">•</span>
                      <span>
                        <strong className="text-white">Gemini Live Web Audio:</strong> {lang === 'pt' ? 'Streaming PCM 16kHz bidirecional com síntese 24kHz (voz Aoede) e latência sub-500ms.' : 'Bidirectional 16kHz PCM streaming and 24kHz synthesis (Aoede persona) with sub-500ms latency.'}
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-white font-bold">•</span>
                      <span>
                        <strong className="text-white">gemini-3.7-flash:</strong> {lang === 'pt' ? 'Raciocínio financeiro avançado, validação de esquemas e explicabilidade regulatória.' : 'Advanced financial reasoning, JSON schema validation, and regulatory decision explainability.'}
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-white font-bold">•</span>
                      <span>
                        <strong className="text-white">Malha Multiagente Autônoma:</strong> {lang === 'pt' ? 'Despacho orquestrado entre CashFlowForecast, AccountInfo, OpenFinance, TravelShield e CardBenefits.' : 'Autonomous routing between CashFlowForecast, AccountInfo, OpenFinance, TravelShield, and CardBenefits.'}
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Brazilian Rails */}
                <div className="p-5 rounded-[8px] bg-white/5 border border-white/10 flex flex-col gap-3.5 md:col-span-2 shadow-sm">
                  <div className="flex items-center gap-2.5 text-sm sm:text-base font-bold text-white uppercase font-mono border-b border-white/10 pb-2">
                    <Building className="size-5 text-blue-400" />
                    <span>{lang === 'pt' ? 'Integrações com o Sistema Financeiro Nacional (SFN)' : 'National Financial System (SFN) Integrations'}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm font-mono">
                    <div className="p-4 bg-black/40 rounded-[6px] border border-white/5">
                      <strong className="text-white block mb-1 text-sm">Open Finance Brasil</strong>
                      <span className="text-[#798B97] leading-relaxed">
                        {lang === 'pt'
                          ? 'Perfil FAPI 1.0 Advanced com autenticação mútua mTLS, consentimento dinâmico e agregação de carteiras.'
                          : 'FAPI 1.0 Advanced security profile with mutual mTLS, dynamic consent, and portfolio aggregation.'}
                      </span>
                    </div>
                    <div className="p-4 bg-black/40 rounded-[6px] border border-white/5">
                      <strong className="text-white block mb-1 text-sm">Barramentos CIP / STR</strong>
                      <span className="text-[#798B97] leading-relaxed">
                        {lang === 'pt'
                          ? 'Liquidação bruta em tempo real para portabilidade de investimentos e depósitos interbancários.'
                          : 'Real-time gross settlement rails for instantaneous investment portability and liquidity sweeps.'}
                      </span>
                    </div>
                    <div className="p-4 bg-black/40 rounded-[6px] border border-white/5">
                      <strong className="text-white block mb-1 text-sm">Redes Mastercard / Visa (ISO 8583)</strong>
                      <span className="text-[#798B97] leading-relaxed">
                        {lang === 'pt'
                          ? 'Atualização imediata de tabelas de fraude e regras autorizadoras para viagens internacionais.'
                          : 'Real-time authorizer rules and fraud decline suppression tables for foreign merchant terminals.'}
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB: PERSONA & SCENARIO */}
          {activeTab === 'persona' && (
            <div className="flex flex-col gap-6">
              <div className="p-6 sm:p-7 rounded-[8px] bg-white/5 border border-white/10 flex flex-col gap-5 shadow-lg">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-4">
                    <div className="size-12 rounded-full bg-white/20 text-white flex items-center justify-center font-bold font-mono text-lg">
                      RS
                    </div>
                    <div>
                      <h4 className="text-lg sm:text-xl font-bold text-white">Roberto Silva</h4>
                      <span className="text-xs sm:text-sm text-[#798B97] font-mono">
                        {lang === 'pt' 
                          ? 'Cliente Itaú Personnalité • Wealth Tier • CPF 829.410.573-04 • Agência 0910 • CC 48291-0' 
                          : 'Itaú Personnalité Client • Wealth Tier • CPF 829.410.573-04 • Branch 0910 • Account 48291-0'}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs sm:text-sm font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-[4px] font-bold border border-emerald-500/20">
                    {lang === 'pt' ? 'PERFIL HOMOLOGADO • WEALTH TIER' : 'HOMOLOGATED PROFILE • WEALTH TIER'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs sm:text-sm font-mono">
                  <div className="p-4 rounded-[6px] bg-black/40 border border-white/5">
                    <span className="text-[#798B97] block text-xs">{lang === 'pt' ? 'Patrimônio Consolidado' : 'Consolidated Net Worth'}</span>
                    <strong className="text-white text-base sm:text-lg mt-1 block">R$ 463.950,20</strong>
                    <span className="text-[10px] text-brand-orange block mt-0.5">{lang === 'pt' ? 'Itaú + BTG + XP' : 'Itaú + BTG + XP'}</span>
                  </div>
                  <div className="p-4 rounded-[6px] bg-black/40 border border-white/5">
                    <span className="text-[#798B97] block text-xs">{lang === 'pt' ? 'Ativos Líquidos Itaú' : 'Liquid Itaú Assets'}</span>
                    <strong className="text-white text-base sm:text-lg mt-1 block">R$ 133.950,20</strong>
                    <span className="text-[10px] text-[#798B97] block mt-0.5">{lang === 'pt' ? 'R$ 48.9k CC + R$ 85k CDB' : 'R$ 48.9k CC + R$ 85k CDB'}</span>
                  </div>
                  <div className="p-4 rounded-[6px] bg-black/40 border border-white/5">
                    <span className="text-[#798B97] block text-xs">{lang === 'pt' ? 'Open Finance Capturado' : 'Open Finance Captured'}</span>
                    <strong className="text-emerald-400 text-base sm:text-lg mt-1 block">+R$ 330.000,00</strong>
                    <span className="text-[10px] text-emerald-400/80 block mt-0.5">{lang === 'pt' ? '+R$ 5.940/ano ganho CDI' : '+R$ 5,940/yr CDI gain'}</span>
                  </div>
                  <div className="p-4 rounded-[6px] bg-black/40 border border-white/5">
                    <span className="text-[#798B97] block text-xs">{lang === 'pt' ? 'Aviso Viagem Ativo' : 'Active Travel Shield'}</span>
                    <strong className="text-purple-400 text-base sm:text-lg mt-1 block">{lang === 'pt' ? 'Portugal & Espanha' : 'Portugal & Spain'}</strong>
                    <span className="text-[10px] text-purple-400/80 block mt-0.5">{lang === 'pt' ? 'Mastercard Black • R$ 50k POS' : 'Mastercard Black • R$ 50k POS'}</span>
                  </div>
                </div>

                <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
                  {lang === 'pt' ? (
                    <>
                      <strong>Por que este cenário é perfeito para a demonstração executiva?</strong> Roberto Silva representa o cliente ideal do Itaú Personnalité: profissional de alto patrimônio com vida financeira ativa e internacional. Ele possui liquidez no Itaú, mas também capital disperso em corretoras concorrentes (BTG e XP) e compromissos agendados de grande porte. O roteiro demonstra como o Itaú Concierge atua proativamente protegendo seu fluxo de caixa contra tarifas desnecessárias de LIS, conquista R$ 330.000,00 em novos ativos sob custódia através do Open Finance a 100% do CDI, e oferece uma experiência de viagem sem atritos com benefícios Mastercard Black de padrão global.
                    </>
                  ) : (
                    <>
                      <strong>Why is this persona ideal for the executive showcase?</strong> Roberto Silva exemplifies the premier Itaú Personnalité client: an affluent, high-velocity professional with complex domestic and international lifestyle needs. He holds liquid balances at Itaú, external investments at BTG and XP earning sub-optimal yields, and scheduled luxury travel to Europe. This narrative demonstrates how Itaú Concierge proactively shields his cash flow against overdrafts, captures R$ 330,000.00 in new AUM through Open Finance arbitrage, and delivers seamless international travel protections with luxury Mastercard Black perks.
                    </>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* TAB: FULL MARKDOWN */}
          {activeTab === 'markdown' && (
            <div className="flex flex-col gap-3 font-mono text-xs sm:text-sm">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="text-[#798B97]">
                  {lang === 'pt' ? 'Arquivo: docs/DEMO_SCRIPT.md (Visualização de Idioma)' : 'File: docs/DEMO_SCRIPT.md (Language Aligned)'}
                </span>
                <button
                  onClick={() => copyToClipboard(fullMarkdown)}
                  className="px-3 py-1.5 rounded-[4px] bg-white/10 hover:bg-white/15 text-white/90 flex items-center gap-1.5 cursor-pointer text-xs sm:text-sm"
                >
                  <Copy className="size-4 text-white" />
                  <span>{lang === 'pt' ? 'Copiar Markdown' : 'Copy Markdown'}</span>
                </button>
              </div>

              <div className="p-5 rounded-[8px] bg-[#070707] border border-white/15 text-neutral-300 overflow-x-auto leading-relaxed max-h-[500px]">
                <pre className="whitespace-pre-wrap font-mono text-xs sm:text-sm">
                  {fullMarkdown}
                </pre>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
