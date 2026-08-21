export interface SubAgent {
  id: string;
  name: string;
  type: 'fraud' | 'med' | 'cards' | 'limits' | 'geolocation';
  description: string;
  capabilities: string[];
  status: 'idle' | 'processing' | 'completed';
  lastRun?: string;
  resultData?: any;
}

export interface SecurityActionItem {
  id: string;
  time: string;
  type: 'pix_hold' | 'card_freeze' | 'med_claim' | 'limit_adjust' | 'geo_verify';
  title: string;
  description: string;
  status: 'Confirmed' | 'Pending' | 'Active' | 'Safeguarded';
  location?: string;
  details?: string;
}

export interface IOSNotification {
  id: string;
  app: string;
  title: string;
  subtitle: string;
  icon: 'shield' | 'pix' | 'card' | 'alert';
  timestamp: string;
}

export interface TelemetryLog {
  id: string;
  timestamp: string;
  agentId: string;
  agentName: string;
  action: string;
  status: 'success' | 'warning' | 'info';
  payload: any;
}
