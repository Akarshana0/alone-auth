'use client';

interface BadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

const statusStyles: Record<string, string> = {
  active: 'bg-green-500/10 text-green-400 border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.15)]',
  unused: 'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.15)]',
  banned: 'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.15)]',
  expired: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  success: 'bg-green-500/10 text-green-400 border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.15)]',
  failure: 'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.15)]',
  warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.15)]',
};

const sizeStyles = {
  sm: 'text-[10px] px-2 py-0.5',
  md: 'text-xs px-2.5 py-1',
};

export default function Badge({ status, size = 'md' }: BadgeProps) {
  const style = statusStyles[status] || statusStyles.expired;
  return (
    <span
      className={`
        inline-flex items-center font-semibold uppercase tracking-wider
        rounded-full border transition-all duration-300
        ${style}
        ${sizeStyles[size]}
      `}
    >
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
        status === 'active' || status === 'success' ? 'bg-green-400 animate-pulse' :
        status === 'banned' || status === 'failure' ? 'bg-red-400' :
        status === 'warning' ? 'bg-amber-400 animate-pulse' :
        status === 'unused' ? 'bg-blue-400' :
        'bg-gray-400'
      }`} />
      {status}
    </span>
  );
}
