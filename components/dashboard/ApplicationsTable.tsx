'use client';

import { useState } from 'react';
import { useApplications } from '@/hooks/useApplications';
import {
  createApplication,
  deleteApplication,
  toggleApplication,
  regenerateApiKey,
  addLog,
} from '@/lib/firestore';
import GlassCard from '@/components/ui/GlassCard';
import Spinner from '@/components/ui/Spinner';
import { Plus, Copy, RefreshCw, Trash2, Eye, EyeOff, Check, AppWindow } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ApplicationsTable() {
  const { applications, loading } = useApplications();
  const [newAppName, setNewAppName] = useState('');
  const [creating, setCreating] = useState(false);
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!newAppName.trim()) {
      toast.error('Please enter an application name');
      return;
    }
    setCreating(true);
    try {
      const app = await createApplication(newAppName.trim());
      await addLog('app_created', 'success', `Application "${app.name}" created`);
      setNewAppName('');
      toast.success(`Application "${app.name}" created`);
    } catch (error) {
      toast.error('Failed to create application');
    } finally {
      setCreating(false);
    }
  };

  const handleRegenerate = async (appId: string, appName: string) => {
    if (confirm(`Regenerate API key for ${appName}? The old key will stop working immediately.`)) {
      const newKey = await regenerateApiKey(appId);
      toast.success('API key regenerated');
      setRevealedKeys((prev) => new Set(prev).add(appId));
    }
  };

  const handleDelete = async (appId: string, appName: string) => {
    if (confirm(`Delete application "${appName}"? This action cannot be undone.`)) {
      await deleteApplication(appId);
      toast.success('Application deleted');
    }
  };

  const toggleReveal = (appId: string) => {
    setRevealedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(appId)) next.delete(appId);
      else next.add(appId);
      return next;
    });
  };

  const copyKey = async (appId: string, key: string) => {
    await navigator.clipboard.writeText(key);
    setCopiedId(appId);
    toast.success('API key copied');
    setTimeout(() => setCopiedId(null), 2000);
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
    <div className="space-y-5">
      {/* Create new application */}
      <GlassCard glow="cyan">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-cyan-500/10">
            <AppWindow className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Applications</h2>
            <p className="text-sm text-gray-500">Manage per-app API keys</p>
          </div>
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Application name (e.g., MyGameLoader)"
            value={newAppName}
            onChange={(e) => setNewAppName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition-all"
          />
          <button
            onClick={handleCreate}
            disabled={creating}
            className="px-5 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white transition-all shadow-[0_0_15px_rgba(34,211,238,0.2)] hover:shadow-[0_0_25px_rgba(34,211,238,0.3)] disabled:opacity-50 flex items-center gap-2"
          >
            {creating ? <Spinner size="sm" /> : <Plus size={16} />}
            Create
          </button>
        </div>
      </GlassCard>

      {/* Applications table */}
      <GlassCard padding="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">Name</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">API Key</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">Status</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">Created</th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors group">
                  <td className="px-5 py-3.5">
                    <span className="text-sm text-gray-200 font-medium">{app.name}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-mono text-cyan-300/80">
                        {revealedKeys.has(app.id) ? app.apiKey : `${app.apiKey.slice(0, 6)}${'•'.repeat(20)}`}
                      </code>
                      <button
                        onClick={() => toggleReveal(app.id)}
                        className="text-gray-500 hover:text-gray-300 transition-colors"
                      >
                        {revealedKeys.has(app.id) ? <EyeOff size={12} /> : <Eye size={12} />}
                      </button>
                      <button
                        onClick={() => copyKey(app.id, app.apiKey)}
                        className="text-gray-500 hover:text-gray-300 transition-colors"
                      >
                        {copiedId === app.id ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                      </button>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => toggleApplication(app.id, !app.enabled)}
                      className={`text-xs font-medium px-2.5 py-1 rounded-full border transition-all ${
                        app.enabled
                          ? 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20'
                          : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                      }`}
                    >
                      {app.enabled ? 'Enabled' : 'Disabled'}
                    </button>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs text-gray-500">{formatDate(app.createdAt)}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleRegenerate(app.id, app.name)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-amber-400 hover:bg-amber-500/10 transition-all"
                        title="Regenerate API Key"
                      >
                        <RefreshCw size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(app.id, app.name)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                        title="Delete Application"
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

        {applications.length === 0 && (
          <div className="text-center py-12 text-gray-500 text-sm">
            No applications created yet. Create one to get started.
          </div>
        )}
      </GlassCard>
    </div>
  );
}
