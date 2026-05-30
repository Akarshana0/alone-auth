'use client';

import { useState } from 'react';
import { useLicenses } from '@/hooks/useLicenses';
import { banLicense, deleteLicense, resetHWID } from '@/lib/firestore';
import GlassCard from '@/components/ui/GlassCard';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import { Search, Ban, Trash2, RotateCcw, Copy, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const ITEMS_PER_PAGE = 10;

export default function LicenseTable() {
  const { licenses, loading } = useLicenses();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);

  const filtered = licenses.filter((l) => {
    const matchesSearch = l.key.toLowerCase().includes(search.toLowerCase()) ||
      (l.usedBy && l.usedBy.toLowerCase().includes(search.toLowerCase())) ||
      (l.hwid && l.hwid.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paged = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleBan = async (key: string) => {
    if (confirm('Ban this license key?')) {
      await banLicense(key);
      toast.success('License banned');
    }
  };

  const handleDelete = async (key: string) => {
    if (confirm('Permanently delete this license key?')) {
      await deleteLicense(key);
      toast.success('License deleted');
    }
  };

  const handleResetHWID = async (key: string) => {
    await resetHWID(key);
    toast.success('HWID reset successfully');
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

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
    <GlassCard padding="p-0">
      {/* Header */}
      <div className="p-5 border-b border-white/[0.06]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-white">License Keys</h2>
            <p className="text-sm text-gray-500">{filtered.length} total keys</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search keys..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9 pr-4 py-2 rounded-lg bg-white/[0.03] border border-white/[0.08] text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 transition-all w-56"
              />
            </div>
            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.08] text-sm text-gray-300 focus:outline-none focus:border-indigo-500/50 transition-all cursor-pointer bg-[#0c0c18]"
            >
              <option value="all">All Status</option>
              <option value="unused">Unused</option>
              <option value="active">Active</option>
              <option value="banned">Banned</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">Key</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">Status</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">Tier</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">Expiry</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">HWID</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">Created</th>
              <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((license) => (
              <tr
                key={license.key}
                className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors group"
              >
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <code className="text-xs font-mono text-indigo-300">{license.key}</code>
                    <button
                      onClick={async () => {
                        await navigator.clipboard.writeText(license.key);
                        toast.success('Copied');
                      }}
                      className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-gray-300 transition-all"
                    >
                      <Copy size={12} />
                    </button>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <Badge status={license.status} size="sm" />
                </td>
                <td className="px-5 py-3.5">
                  <span className="text-xs text-gray-400 font-medium uppercase">{license.tier}</span>
                </td>
                <td className="px-5 py-3.5">
                  <span className="text-xs text-gray-400">
                    {license.expiry ? formatDate(license.expiry) : 'Lifetime'}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <span className="text-xs font-mono text-gray-500 truncate max-w-[120px] block">
                    {license.hwid || '—'}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <span className="text-xs text-gray-500">{formatDate(license.createdAt)}</span>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center justify-end gap-1">
                    {license.status !== 'banned' && (
                      <button
                        onClick={() => handleBan(license.key)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                        title="Ban"
                      >
                        <Ban size={14} />
                      </button>
                    )}
                    {license.hwid && (
                      <button
                        onClick={() => handleResetHWID(license.key)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-amber-400 hover:bg-amber-500/10 transition-all"
                        title="Reset HWID"
                      >
                        <RotateCcw size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(license.key)}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {paged.length === 0 && (
        <div className="text-center py-12 text-gray-500 text-sm">
          {search || statusFilter !== 'all' ? 'No matching licenses found' : 'No licenses generated yet'}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.06]">
          <p className="text-xs text-gray-500">
            Showing {((page - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(page * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-white/[0.05] disabled:opacity-30 transition-all"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                    page === pageNum
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.05]'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-white/[0.05] disabled:opacity-30 transition-all"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </GlassCard>
  );
}
