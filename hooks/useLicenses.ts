'use client';

import { useState, useEffect } from 'react';
import { subscribeLicenses } from '@/lib/firestore';
import type { License } from '@/types';

export function useLicenses() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeLicenses((data) => {
      setLicenses(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { licenses, loading };
}
