'use client';

import { useState, useEffect } from 'react';
import { subscribeUsers, banUser } from '@/lib/firestore';
import GlassCard from '@/components/ui/GlassCard';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import { Search, Ban, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import type { User } from '@/types';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const unsubscribe = subscribeUsers((data) => {
      setUsers(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filtered = users.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.licenseKey.toLowerCase().includes(search.toLowerCase()) ||
    u.ip.includes(search)
  );

  const toggleBan = async (userId: string, currentlyBanned: boolean) => {
    if (confirm(currentlyBanned ? 'Unban this user?' : 'Ban this user from authenticating?')) {
      await banUser(userId, !currentlyBanned);
      toast.success(`User ${currentlyBanned ? 'unbanned' : 'banned'}`);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Users</h1>
        <p className="text-gray-400">View and manage authenticated end-users.</p>
      </div>

      <GlassCard padding="p-0">
        <div className="p-5 border-b border-white/[0.06] flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Registered Users</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-lg bg-white/[0.03] border border-white/[0.08] text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition-all w-64"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">Username</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">License Key</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">IP Address</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">HWID</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">Last Seen</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">Status</th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr key={user.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3.5 text-sm text-gray-200 font-medium">{user.username}</td>
                    <td className="px-5 py-3.5"><code className="text-xs font-mono text-indigo-300">{user.licenseKey}</code></td>
                    <td className="px-5 py-3.5 text-xs text-gray-400">{user.ip}</td>
                    <td className="px-5 py-3.5 text-xs font-mono text-gray-500 truncate max-w-[120px]">{user.hwid}</td>
                    <td className="px-5 py-3.5 text-xs text-gray-400">{formatDate(user.lastSeen)}</td>
                    <td className="px-5 py-3.5">
                      <Badge status={user.banned ? 'banned' : 'active'} size="sm" />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => toggleBan(user.id, user.banned)}
                        className={`p-1.5 rounded-lg transition-all ${
                          user.banned
                            ? 'text-green-500 hover:bg-green-500/10'
                            : 'text-red-500 hover:bg-red-500/10'
                        }`}
                        title={user.banned ? 'Unban User' : 'Ban User'}
                      >
                        {user.banned ? <CheckCircle size={16} /> : <Ban size={16} />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-12 text-gray-500 text-sm">No users found.</div>
            )}
          </div>
        )}
      </GlassCard>
    </>
  );
}
