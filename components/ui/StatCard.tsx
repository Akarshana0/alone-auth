'use client';

import { useEffect, useRef, useState } from 'react';
import GlassCard from './GlassCard';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  glow: 'indigo' | 'violet' | 'cyan' | 'green';
  trend?: { value: number; positive: boolean };
}

const iconBgColors = {
  indigo: 'bg-indigo-500/10 text-indigo-400',
  violet: 'bg-violet-500/10 text-violet-400',
  cyan: 'bg-cyan-500/10 text-cyan-400',
  green: 'bg-green-500/10 text-green-400',
};

export default function StatCard({ label, value, icon: Icon, glow, trend }: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const duration = 1500;
    const start = performance.now();
    const startVal = displayValue;

    const animate = (time: number) => {
      const elapsed = time - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(startVal + (value - startVal) * eased));

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [value]);

  return (
    <GlassCard glow={glow}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400 font-medium mb-1">{label}</p>
          <p className="text-3xl font-bold text-white tracking-tight">
            {displayValue.toLocaleString()}
          </p>
          {trend && (
            <p className={`text-xs mt-2 font-medium ${
              trend.positive ? 'text-green-400' : 'text-red-400'
            }`}>
              {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}% from last week
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${iconBgColors[glow]}`}>
          <Icon size={24} />
        </div>
      </div>
    </GlassCard>
  );
}
