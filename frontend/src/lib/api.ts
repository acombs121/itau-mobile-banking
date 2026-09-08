import { AdminConfig } from '../types/brand';

const API_BASE = '/api';

export interface UserProfile {
  sub: string;
  email: string;
  hd?: string;
  name?: string;
  is_mock?: boolean;
}

export async function fetchAdminConfig(): Promise<AdminConfig> {
  const res = await fetch(`${API_BASE}/admin/config`);
  if (!res.ok) throw new Error('Failed to fetch admin config');
  return res.json();
}

export async function updateAdminConfig(payload: {
  execution_mode: 'hybrid' | 'live' | 'simulated';
  simulated_step_delay_ms: number;
}): Promise<AdminConfig> {
  const res = await fetch(`${API_BASE}/admin/config`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to update admin config');
  return res.json();
}

export async function fetchUserProfile(): Promise<UserProfile> {
  const res = await fetch(`${API_BASE}/user`);
  if (!res.ok) throw new Error('Failed to fetch user profile');
  return res.json();
}

export async function fetchHealthInfo(): Promise<{ gcp_project?: string; environment?: string; service?: string; app_name?: string }> {
  const res = await fetch('/health');
  if (!res.ok) throw new Error('Failed to fetch health info');
  return res.json();
}
