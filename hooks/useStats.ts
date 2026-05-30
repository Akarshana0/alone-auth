'use client';

import { useState, useEffect, useCallback } from 'react';
import { getDashboardStats } from '@/lib/firestore';
import type { DashboardStats } from '@/types';

export function useStats() {
  const [stats, setStats] = useState<DashboardStats>({
    totalLicenses: 0,
    activeKeys: 0,
    blockedHWIDs: 0,
    totalUsers: 0,
    totalApplications: 0,
  });
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, [refresh]);

  return { stats, loading, refresh };
}
