import { Timestamp } from 'firebase/firestore';

export type LicenseTier = '1day' | '1week' | '1month' | 'lifetime';
export type LicenseStatus = 'active' | 'banned' | 'expired' | 'unused';
export type LogType = 'validate' | 'ban' | 'generate' | 'delete' | 'reset_hwid' | 'app_created' | 'custom';
export type LogStatus = 'success' | 'failure' | 'warning';

export interface License {
  id: string;
  key: string;
  status: LicenseStatus;
  expiry: Timestamp | null;
  tier: LicenseTier;
  hwid: string | null;
  boundAt: Timestamp | null;
  createdAt: Timestamp;
  usedBy: string | null;
}

export interface User {
  id: string;
  username: string;
  email: string | null;
  licenseKey: string;
  hwid: string;
  ip: string;
  lastSeen: Timestamp;
  createdAt: Timestamp;
  banned: boolean;
}

export interface Log {
  id: string;
  type: LogType;
  key: string | null;
  username: string | null;
  hwid: string | null;
  ip: string | null;
  status: LogStatus;
  message: string;
  timestamp: Timestamp;
  appName?: string;
}

export interface Application {
  id: string;
  name: string;
  apiKey: string;
  enabled: boolean;
  createdAt: Timestamp;
}

export interface ValidationRequest {
  key: string;
  hwid: string;
  username?: string;
}

export interface ValidationResponse {
  valid: boolean;
  message: string;
  expiry?: string | null;
  tier?: LicenseTier;
}

export interface DashboardStats {
  totalLicenses: number;
  activeKeys: number;
  blockedHWIDs: number;
  totalUsers: number;
  totalApplications: number;
}
