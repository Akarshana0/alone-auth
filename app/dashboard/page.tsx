import StatsOverview from '@/components/dashboard/StatsOverview';
import LogFeed from '@/components/dashboard/LogFeed';
import { Activity } from 'lucide-react';

export default function DashboardOverview() {
  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Overview</h1>
        <p className="text-gray-400">Welcome back to ALONEAUTH. Here's what's happening today.</p>
      </div>

      <StatsOverview />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* We could add a chart here in the future. For now, this acts as a placeholder for layout purposes. */}
          <div className="h-full min-h-[400px] rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-center relative overflow-hidden">
             <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent opacity-50" />
             <div className="text-center relative z-10">
                <Activity className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-300">Analytics coming soon</h3>
                <p className="text-sm text-gray-500 mt-2">Visual charts will be available in the next update.</p>
             </div>
          </div>
        </div>
        <div>
          <LogFeed maxLogs={15} compact={true} />
        </div>
      </div>
    </>
  );
}
