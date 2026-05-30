'use client';

import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  glow?: 'indigo' | 'violet' | 'cyan' | 'red' | 'green' | 'none';
  hover?: boolean;
  padding?: string;
}

const glowColors = {
  indigo: 'shadow-[0_0_30px_rgba(99,102,241,0.15)] hover:shadow-[0_0_40px_rgba(99,102,241,0.25)]',
  violet: 'shadow-[0_0_30px_rgba(139,92,246,0.15)] hover:shadow-[0_0_40px_rgba(139,92,246,0.25)]',
  cyan: 'shadow-[0_0_30px_rgba(34,211,238,0.15)] hover:shadow-[0_0_40px_rgba(34,211,238,0.25)]',
  red: 'shadow-[0_0_30px_rgba(239,68,68,0.15)] hover:shadow-[0_0_40px_rgba(239,68,68,0.25)]',
  green: 'shadow-[0_0_30px_rgba(34,197,94,0.15)] hover:shadow-[0_0_40px_rgba(34,197,94,0.25)]',
  none: '',
};

export default function GlassCard({
  children,
  className = '',
  glow = 'none',
  hover = true,
  padding = 'p-6',
}: GlassCardProps) {
  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl
        bg-white/[0.03] backdrop-blur-xl
        border border-white/[0.08]
        ${padding}
        ${glowColors[glow]}
        ${hover ? 'transition-all duration-500 hover:border-white/[0.15] hover:bg-white/[0.05]' : ''}
        ${className}
      `}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
