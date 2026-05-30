'use client';

import { useState, useEffect } from 'react';
import { subscribeLogs } from '@/lib/firestore';
import type { Log } from '@/types';

export function useLogs(maxLogs: number = 50) {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeLogs((data) => {
      setLogs(data);
      setLoading(false);
    }, maxLogs);

    return () => unsubscribe();
  }, [maxLogs]);

  return { logs, loading };
}
