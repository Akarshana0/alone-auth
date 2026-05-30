'use client';

import StatCard from '@/components/ui/StatCard';
import { KeyRound, Users, ShieldBan, AppWindow } from 'lucide-react';
import { useStats } from '@/hooks/useStats';

export default function StatsOverview() {
  const { stats, loading } = useStats();

  const cards = [
    { label: 'Total Licenses', value: stats.totalLicenses, icon: KeyRound, glow: 'indigo' as const },
    { label: 'Active Keys', value: stats.activeKeys, icon: KeyRound, glow: 'green' as const },
    { label: 'Blocked HWIDs', value: stats.blockedHWIDs, icon: ShieldBan, glow: 'violet' as const },
    { label: 'Total Users', value: stats.totalUsers, icon: Users, glow: 'cyan' as const },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
      {cards.map((card) => (
        <StatCard key={card.label} {...card} />
      ))}
    </div>
  );
}
