import LogFeed from '@/components/dashboard/LogFeed';

export default function LogsPage() {
  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">System Logs</h1>
        <p className="text-gray-400">Real-time audit log of all system activities and API requests.</p>
      </div>

      <LogFeed maxLogs={100} />
    </>
  );
}
