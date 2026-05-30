'use client';

import { useState, useEffect } from 'react';
import { subscribeApplications } from '@/lib/firestore';
import type { Application } from '@/types';

export function useApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeApplications((data) => {
      setApplications(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { applications, loading };
}
