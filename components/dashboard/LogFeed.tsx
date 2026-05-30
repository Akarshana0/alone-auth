'use client';

import { useLogs } from '@/hooks/useLogs';
import GlassCard from '@/components/ui/GlassCard';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import { ScrollText, KeyRound, Ban, Trash2, RotateCcw, Zap, AppWindow } from 'lucide-react';
import { useState } from 'react';

const typeIcons: Record<string, any> = {
  validate: KeyRound,
  ban: Ban,
  generate: Zap,
  delete: Trash2,
  reset_hwid: RotateCcw,
  app_created: AppWindow,
  custom: ScrollText,
};

const typeColors: Record<string, string> = {
  validate: 'text-blue-400 bg-blue-500/10',
  ban: 'text-red-400 bg-red-500/10',
  generate: 'text-green-400 bg-green-500/10',
  delete: 'text-red-400 bg-red-500/10',
  reset_hwid: 'text-amber-400 bg-amber-500/10',
  app_created: 'text-violet-400 bg-violet-500/10',
  custom: 'text-gray-400 bg-gray-500/10',
};

export default function LogFeed({ maxLogs = 50, compact = false }: { maxLogs?: number; compact?: boolean }) {
  const { logs, loading } = useLogs(maxLogs);
  const [search, setSearch] = useState('');

  const filtered = logs.filter((log) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      log.message.toLowerCase().includes(term) ||
      (log.key && log.key.toLowerCase().includes(term)) ||
      log.type.toLowerCase().includes(term)
    );
  });

  if (loading) {
    return (
      <GlassCard>
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard padding="p-0" glow={compact ? 'none' : 'violet'}>
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-violet-500/10">
            <ScrollText className="w-4 h-4 text-violet-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Activity Logs</h2>
            <p className="text-xs text-gray-500">{filtered.length} events</p>
          </div>
        </div>
        {!compact && (
          <input
            type="text"
            placeholder="Search logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.08] text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-violet-500/50 transition-all w-48"
          />
        )}
      </div>

      {/* Log entries */}
      <div className={`divide-y divide-white/[0.03] ${compact ? 'max-h-80' : 'max-h-[600px]'} overflow-y-auto custom-scrollbar`}>
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-600 text-sm">No log entries found</div>
        ) : (
          filtered.map((log) => {
            const Icon = typeIcons[log.type] || ScrollText;
            const colorClass = typeColors[log.type] || typeColors.custom;

            const formatTime = (timestamp: any) => {
              if (!timestamp) return '';
              const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
              return date.toLocaleString('en-US', {
                month: 'short', day: 'numeric',
                hour: '2-digit', minute: '2-digit', second: '2-digit'
              });
            };

            return (
              <div
                key={log.id}
                className="flex items-start gap-3 px-5 py-3 hover:bg-white/[0.02] transition-colors"
              >
                <div className={`p-1.5 rounded-lg mt-0.5 ${colorClass}`}>
                  <Icon size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-200 leading-snug">{log.message}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] text-gray-600 font-mono">{formatTime(log.timestamp)}</span>
                    {log.ip && <span className="text-[10px] text-gray-600">IP: {log.ip}</span>}
                  </div>
                </div>
                <Badge status={log.status} size="sm" />
              </div>
            );
          })
        )}
      </div>
    </GlassCard>
  );
}
