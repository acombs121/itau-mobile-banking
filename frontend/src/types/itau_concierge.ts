export type ScenarioId = 'account_info' | 'cash_flow' | 'travel_shield' | 'open_finance';

export interface SubAgent {
  id: string;
  name: string;
  type: 'account_info' | 'cash_flow' | 'travel' | 'open_finance';
  description: string;
  capabilities: string[];
  status: 'idle' | 'processing' | 'completed' | 'failed';
  lastRun?: string;
  resultData?: Record<string, any>;
}

export interface SecurityActionItem {
  id: string;
  time: string;
  type: 'pix_hold' | 'geo_verify' | 'card_freeze' | 'med_claim' | 'limit_adjust' | 'cdb_sweep' | 'travel_mode' | 'open_finance_ccb';
  title: string;
  description: string;
  status: 'Confirmed' | 'Pending' | 'Active' | 'Safeguarded';
  details?: string;
}

export interface IOSNotification {
  id: string;
  app: string;
  title: string;
  subtitle: string;
  icon?: string;
  timestamp: string;
}

export interface TelemetryLog {
  id: string;
  timestamp: string;
  agentId: string;
  agentName: string;
  action: string;
  status: 'success' | 'warning' | 'error' | 'info';
  payload: Record<string, any>;
}

export interface ScenarioDefinition {
  id: ScenarioId;
  title: string;
  shortLabel: string;
  tag: string;
  agentId: string;
  alert: {
    badge: string;
    title: string;
    description: string;
    primaryActionLabel: string;
    primaryActionType: string;
    secondaryActionLabel: string;
    secondaryActionType: string;
  };
  telemetryPayload: Record<string, any>;
  graphNodes: Array<{
    id: string;
    name: string;
    group: string;
    layer: string;
    color: string;
    details: string;
  }>;
}
