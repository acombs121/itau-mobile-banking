export interface BankingCard {
  id: string;
  name: string;
  last4: string;
  status: 'active' | 'frozen' | 'blocked';
  virtual_card_active: boolean;
  contactless_enabled: boolean;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  category: 'pix_out' | 'pix_in' | 'dining' | 'investment' | 'card';
  amount_brl: number;
  status: 'completed' | 'pending' | 'blocked';
}

export interface BankingProfile {
  account_id: string;
  customer_name: string;
  segment: string;
  cpf_masked: string;
  agency: string;
  account_number: string;
  checking_balance_brl: number;
  investments_balance_brl: number;
  credit_limit_total: number;
  credit_limit_used: number;
  pix_daily_limit: number;
  pix_night_limit: number;
  cards: BankingCard[];
  recent_transactions: Transaction[];
}

export interface SecurityAlert {
  id: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  category: string;
  title: string;
  timestamp: string;
  description: string;
  amount_brl?: number | null;
  recipient?: string | null;
  risk_score: number;
  recommended_action: string;
  status: string;
  policy_matched: string;
}

export interface DecisionGraphData {
  nodes: Array<{
    id: string;
    name: string;
    group: string;
    layer: 'Input' | 'Policy' | 'Decision' | 'Output';
    color: string;
    val: number;
    details: string;
  }>;
  links: Array<{
    source: string;
    target: string;
    label: string;
  }>;
}
